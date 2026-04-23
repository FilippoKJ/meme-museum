/**
 * src/routes/votes.js
 * POST   /api/memes/:id/vote    — vota (up/down), se stesso voto → toggling
 * DELETE /api/memes/:id/vote    — rimuovi voto esplicitamente
 */

import { Router } from 'express';
import sql from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router({ mergeParams: true });

/* ── POST ────────────────────────────────────────────── */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { id: memeId } = req.params;
    const { type }       = req.body ?? {};
    const userId         = req.user.id;

    if (!['up', 'down'].includes(type))
      throw new HttpError('type deve essere "up" o "down"');

    const [meme] = await sql`SELECT id FROM memes WHERE id = ${memeId}`;
    if (!meme) throw new HttpError('Meme non trovato', 404);

    const [existing] = await sql`
      SELECT type FROM votes WHERE user_id = ${userId} AND meme_id = ${memeId}
    `;

    // Toggle: stesso voto → rimuovi
    if (existing?.type === type) {
      await sql`DELETE FROM votes WHERE user_id = ${userId} AND meme_id = ${memeId}`;
      return res.json({ action: 'removed', type: null });
    }

    // Upsert
    await sql`
      INSERT INTO votes (user_id, meme_id, type)
      VALUES (${userId}, ${memeId}, ${type})
      ON CONFLICT (user_id, meme_id)
      DO UPDATE SET type = ${type}, voted_at = NOW()
    `;

    res.json({ action: existing ? 'changed' : 'added', type });
  } catch (err) { next(err); }
});

/* ── DELETE ──────────────────────────────────────────── */
router.delete('/', requireAuth, async (req, res, next) => {
  try {
    await sql`
      DELETE FROM votes
      WHERE user_id = ${req.user.id} AND meme_id = ${req.params.id}
    `;
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
