/**
 * src/middleware/auth.js
 * Verifica il token JWT nell'header Authorization: Bearer <token>
 */

import jwt from 'jsonwebtoken';

/**
 * requireAuth — blocca le richieste senza token valido (401)
 */
export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Token mancante' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token scaduto' : 'Token non valido';
    return res.status(401).json({ error: msg });
  }
}

/**
 * optionalAuth — aggiunge req.user se il token è valido, altrimenti continua
 * Usato per endpoint che funzionano anche da non autenticati (es. GET /memes)
 */
export function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch (_) {}
  }
  next();
}

function extractToken(req) {
  const auth = req.headers.authorization ?? '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}
