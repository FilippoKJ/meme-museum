/**
 * src/middleware/errorHandler.js
 * Gestione centralizzata degli errori Express.
 */

export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  // Errori di validazione personalizzati
  if (err.status) return res.status(err.status).json({ error: err.message });

  // Errori PostgreSQL comuni
  if (err.code === '23505') return res.status(409).json({ error: 'Elemento già esistente' });
  if (err.code === '23503') return res.status(400).json({ error: 'Riferimento non valido' });

  // Fallback
  const status = err.statusCode ?? 500;
  const message = process.env.NODE_ENV === 'production' ? 'Errore interno del server' : err.message;
  res.status(status).json({ error: message });
}

/** Errore HTTP da lanciare nei controller */
export class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
