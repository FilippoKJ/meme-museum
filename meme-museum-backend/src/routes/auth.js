/**
 * src/routes/auth.js
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

/** Genera JWT */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' }
  );

/** Formato risposta utente (senza password) */
const userPayload = (u) => ({ id: u.id, username: u.username, avatar: u.avatar_url ?? null });

/* ── REGISTER ─────────────────────────────────────────── */
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) throw new HttpError('Username e password obbligatori');
    if (!USERNAME_RE.test(username)) throw new HttpError('Username non valido (3-32 caratteri alfanumerici)');
    if (password.length < 6) throw new HttpError('Password troppo corta (minimo 6 caratteri)');

    // Controlla unicità
    const [existing] = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (existing) throw new HttpError('Username già in uso', 409);

    const hash = await bcrypt.hash(password, 12);
    const [user] = await sql`
      INSERT INTO users (username, password_hash)
      VALUES (${username}, ${hash})
      RETURNING id, username, avatar_url
    `;

    res.status(201).json({ token: signToken(user), user: userPayload(user) });
  } catch (err) { next(err); }
});

/* ── LOGIN ────────────────────────────────────────────── */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) throw new HttpError('Username e password obbligatori');

    const [user] = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (!user) throw new HttpError('Credenziali non valide', 401);

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new HttpError('Credenziali non valide', 401);

    res.json({ token: signToken(user), user: userPayload(user) });
  } catch (err) { next(err); }
});

/* ── ME ───────────────────────────────────────────────── */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const [user] = await sql`
      SELECT id, username, avatar_url FROM users WHERE id = ${req.user.id}
    `;
    if (!user) throw new HttpError('Utente non trovato', 404);
    res.json(userPayload(user));
  } catch (err) { next(err); }
});

export default router;
