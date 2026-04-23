/**
 * src/routes/comments.js
 * GET    /api/memes/:id/comments          — lista commenti
 * POST   /api/memes/:id/comments          — nuovo commento (auth)
 * DELETE /api/memes/:id/comments/:cid     — elimina commento (solo autore)
 */

import { Router } from 'express';
import sql from '../db/pool.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router({ mergeParams: true });

/* ── GET ─────────────────────────────────────────────── */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { id: memeId } = req.params;

    const [meme] = await sql`SELECT id FROM memes WHERE id = ${memeId}`;
    if (!meme) throw new HttpError('Meme non trovato', 404);

    const rows = await sql`
      SELECT
        c.id,
        c.text,
        c.created_at  AS "createdAt",
        u.username    AS author,
        u.avatar_url  AS avatar
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.meme_id = ${memeId}
      ORDER BY c.created_at ASC
    `;

    res.json(rows);
  } catch (err) { next(err); }
});

/* ── POST ────────────────────────────────────────────── */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { id: memeId } = req.params;
    const { text }       = req.body ?? {};
    const userId         = req.user.id;

    if (!text || !text.trim()) throw new HttpError('Il testo del commento è obbligatorio');
    if (text.trim().length > 1000) throw new HttpError('Commento troppo lungo (max 1000 caratteri)');

    const [meme] = await sql`SELECT id FROM memes WHERE id = ${memeId}`;
    if (!meme) throw new HttpError('Meme non trovato', 404);

    const [comment] = await sql`
      WITH inserted AS (
        INSERT INTO comments (meme_id, user_id, text)
        VALUES (${memeId}, ${userId}, ${text.trim()})
        RETURNING id, text, created_at, user_id
      )
      SELECT
        i.id,
        i.text,
        i.created_at AS "createdAt",
        u.username   AS author,
        u.avatar_url AS avatar
      FROM inserted i
      JOIN users u ON u.id = i.user_id
    `;

    res.status(201).json(comment);
  } catch (err) { next(err); }
});

/* ── DELETE ──────────────────────────────────────────── */
router.delete('/:cid', requireAuth, async (req, res, next) => {
  try {
    const { id: memeId, cid } = req.params;
    const userId              = req.user.id;

    const [comment] = await sql`
      SELECT id, user_id FROM comments WHERE id = ${cid} AND meme_id = ${memeId}
    `;

    if (!comment) throw new HttpError('Commento non trovato', 404);
    if (comment.user_id !== userId) throw new HttpError('Non autorizzato', 403);

    await sql`DELETE FROM comments WHERE id = ${cid}`;
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
