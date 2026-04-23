/**
 * src/routes/memes.js
 * GET /api/memes          — lista con filtri, ordinamento, paginazione
 * GET /api/memes/today    — meme del giorno (più votato)
 * GET /api/memes/:id      — singolo meme
 *
 * FIX: rimosso INTERVAL '1 day - 1 second' (sintassi invalida in PG).
 *      Ora usa mc.created_at::date <= $N::date per il filtro dateTo.
 */

import { Router } from 'express';
import sql from '../db/pool.js';
import { optionalAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

/* ── Mappa sortBy → ORDER BY sicura (whitelist) ── */
const SORT_MAP = {
  date_desc:  'mc.created_at DESC',
  date_asc:   'mc.created_at ASC',
  votes_desc: 'mc.likes DESC, mc.created_at DESC',
  votes_asc:  'mc.likes ASC,  mc.created_at DESC',
};

/* ── Formato risposta ── */
const formatMeme = (row, myVote = null) => ({
  id:           row.id,
  src:          row.src,
  description:  row.description,
  tags:         Array.isArray(row.tags) ? row.tags : [],
  likes:        Number(row.likes),
  dislikes:     Number(row.dislikes),
  commentCount: Number(row.comment_count),
  createdAt:    row.created_at,
  myVote,
});

/* ── GET /api/memes ── */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      search   = '',
      tag      = '',
      sortBy   = 'date_desc',
      dateFrom = '',
      dateTo   = '',
      page     = '1',
      limit    = '10',
    } = req.query;

    const p      = Math.max(1, parseInt(page,  10) || 1);
    const lim    = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (p - 1) * lim;
    const order  = SORT_MAP[sortBy] ?? SORT_MAP.date_desc;

    // Costruisci WHERE con parametri posizionali ($1, $2, ...)
    const conditions = [];
    const params     = [];
    let   idx        = 1;

    if (search.trim()) {
      // Cerca nei tag associati al meme
      conditions.push(`EXISTS (
        SELECT 1 FROM meme_tags mt2
        JOIN tags t2 ON t2.id = mt2.tag_id
        WHERE mt2.meme_id = mc.id
        AND t2.name ILIKE $${idx}
      )`);
      params.push(`%${search.trim()}%`);
      idx++;
    }

    if (tag.trim()) {
      // FIX: cerca nei tag aggregati nella view
      conditions.push(`$${idx} = ANY(mc.tags)`);
      params.push(tag.trim());
      idx++;
    }

    if (dateFrom.trim()) {
      conditions.push(`mc.created_at::date >= $${idx}::date`);
      params.push(dateFrom.trim());
      idx++;
    }

    if (dateTo.trim()) {
      // FIX: confronto su date (non INTERVAL invalido)
      conditions.push(`mc.created_at::date <= $${idx}::date`);
      params.push(dateTo.trim());
      idx++;
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Conteggio totale
    const [countRow] = await sql(
      `SELECT COUNT(*)::int AS total FROM memes_with_counts mc ${where}`,
      params
    );
    const total      = countRow?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / lim));

    // Dati pagina
    const dataParams = [...params, lim, offset];
    const rows = await sql(
      `SELECT mc.*
       FROM memes_with_counts mc
       ${where}
       ORDER BY ${order}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      dataParams
    );

    // Voti dell'utente autenticato (una query sola)
    let myVotes = {};
    if (req.user && rows.length > 0) {
      const ids = rows.map(r => r.id);
      const voteRows = await sql`
        SELECT meme_id, type FROM votes
        WHERE user_id = ${req.user.id}
        AND   meme_id = ANY(${ids})
      `;
      voteRows.forEach(v => { myVotes[v.meme_id] = v.type; });
    }

    res.json({
      data:       rows.map(r => formatMeme(r, myVotes[r.id] ?? null)),
      total,
      page:       p,
      totalPages,
    });
  } catch (err) { next(err); }
});

/* ── GET /api/memes/today ── */
// IMPORTANTE: deve stare PRIMA di /:id altrimenti "today" viene matchato come id
router.get('/today', optionalAuth, async (req, res, next) => {
  try {
    const [row] = await sql`
      SELECT * FROM memes_with_counts
      ORDER BY likes DESC, created_at DESC
      LIMIT 1
    `;
    if (!row) throw new HttpError('Nessun meme disponibile', 404);

    let myVote = null;
    if (req.user) {
      const [v] = await sql`
        SELECT type FROM votes
        WHERE user_id = ${req.user.id} AND meme_id = ${row.id}
      `;
      myVote = v?.type ?? null;
    }

    res.json(formatMeme(row, myVote));
  } catch (err) { next(err); }
});

/* ── GET /api/memes/:id ── */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    // Valida formato UUID prima di fare la query
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(req.params.id)) throw new HttpError('ID non valido', 400);

    const [row] = await sql`
      SELECT * FROM memes_with_counts WHERE id = ${req.params.id}
    `;
    if (!row) throw new HttpError('Meme non trovato', 404);

    let myVote = null;
    if (req.user) {
      const [v] = await sql`
        SELECT type FROM votes
        WHERE user_id = ${req.user.id} AND meme_id = ${row.id}
      `;
      myVote = v?.type ?? null;
    }

    res.json(formatMeme(row, myVote));
  } catch (err) { next(err); }
});

export default router;
