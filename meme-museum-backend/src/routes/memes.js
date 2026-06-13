/**
 * src/routes/memes.js
 * GET    /api/memes               — lista con filtri, ordinamento, paginazione
 * POST   /api/memes               — carica un nuovo meme (Base64 o URL)
 * GET    /api/memes/today         — meme del giorno (dinamico: migliore di ieri o di sempre)
 * GET    /api/memes/:id/image     — serve l'immagine binaria dal DB
 * GET    /api/memes/:id           — singolo meme
 */

import { Router } from 'express';
import sql from '../db/pool.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
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

    const conditions = [];
    const params     = [];
    let   idx        = 1;
    

    if (search.trim()) {
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
      conditions.push(`mc.created_at::date <= $${idx}::date`);
      params.push(dateTo.trim());
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRow] = await sql(
      `SELECT COUNT(*)::int AS total FROM memes_with_counts mc ${where}`,
      params
    );
    const total      = countRow?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / lim));

    const dataParams = [...params, lim, offset];
    const rows = await sql(
      `SELECT mc.*
       FROM memes_with_counts mc
       ${where}
       ORDER BY ${order}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      dataParams
    );

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

/* ── POST /api/memes (Carica un nuovo meme) ── */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { src, description, tags = [] } = req.body ?? {};
    const userId = req.user.id;

    if (!src || !src.trim()) throw new HttpError("Immagine obbligatoria", 400);
    if (!tags || tags.length === 0) throw new HttpError("Inserisci almeno un tag", 400);

    let finalSrc = src.trim();
    let isBase64 = false;
    let mimeType = null;
    let base64Data = null;

    if (finalSrc.startsWith('data:image/')) {
      isBase64 = true;
      const matches = finalSrc.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new HttpError("Formato immagine non valido", 400);
      }
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const placeholderSrc = isBase64 ? 'pending...' : finalSrc;
    const [meme] = await sql`
      INSERT INTO memes (src, description, uploaded_by)
      VALUES (${placeholderSrc}, ${description?.trim() || null}, ${userId})
      RETURNING id, src, description, created_at
    `;

    if (isBase64) {
      await sql`
        INSERT INTO meme_images (meme_id, mime_type, image_data)
        VALUES (${meme.id}, ${mimeType}, ${base64Data})
      `;
      finalSrc = `/api/memes/${meme.id}/image`;
      
      await sql`UPDATE memes SET src = ${finalSrc} WHERE id = ${meme.id}`;
      meme.src = finalSrc;
    }

    const validTags = Array.isArray(tags) ? tags.filter(t => t.trim()) : [];
    for (const t of validTags) {
      const tagName = t.toLowerCase().trim();
      const [tagRecord] = await sql`
        INSERT INTO tags (name) VALUES (${tagName})
        ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name
        RETURNING id
      `;
      await sql`
        INSERT INTO meme_tags (meme_id, tag_id)
        VALUES (${meme.id}, ${tagRecord.id})
        ON CONFLICT DO NOTHING
      `;
    }

    res.status(201).json({ success: true, meme });
  } catch (err) { next(err); }
});

/* ── GET /api/memes/today ── */
// IMPORTANTE: Questa rotta DEVE stare sopra le rotte con :id
router.get('/today', optionalAuth, async (req, res, next) => {
  try {
    // 1. Cerca il vincitore di IERI (punteggio netto)
    let [targetMeme] = await sql`
      SELECT * FROM memes_with_counts
      WHERE created_at::date = CURRENT_DATE
      ORDER BY (likes - dislikes) DESC, created_at DESC
      LIMIT 1
    `;

    // 2. Fallback al più votato di sempre
    if (!targetMeme) {
      const fallback = await sql`
        SELECT * FROM memes_with_counts
        ORDER BY (likes - dislikes) DESC, created_at DESC
        LIMIT 1
      `;
      targetMeme = fallback[0];
    }

    if (!targetMeme) throw new HttpError('Nessun meme disponibile nel database', 404);

    let myVote = null;
    if (req.user) {
      const [v] = await sql`
        SELECT type FROM votes
        WHERE user_id = ${req.user.id} AND meme_id = ${targetMeme.id}
      `;
      myVote = v?.type ?? null;
    }

    const responseData = formatMeme(targetMeme, myVote);
    responseData.score = targetMeme.likes - targetMeme.dislikes;

    res.json(responseData);
  } catch (err) { next(err); }
});

/* ── GET /api/memes/:id/image ── */
router.get('/:id/image', async (req, res, next) => {
  try {
    const [img] = await sql`
      SELECT mime_type, image_data FROM meme_images WHERE meme_id = ${req.params.id}
    `;
    if (!img) return res.status(404).send('Immagine non trovata');

    const imgBuffer = Buffer.from(img.image_data, 'base64');
    
    res.setHeader('Content-Type', img.mime_type);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    res.send(imgBuffer);
  } catch (err) { next(err); }
});

/* ── GET /api/memes/:id ── */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
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