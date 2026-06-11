/**
 * src/index.js
 * Entry point del server Express — Meme Museum Backend
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes    from './routes/auth.js';
import memesRoutes   from './routes/memes.js';
import votesRoutes   from './routes/votes.js';
import commentsRoutes from './routes/comments.js';
import { errorHandler } from './middleware/errorHandler.js';

const app  = express();
const PORT = process.env.PORT ?? 4000;

/* ══════════════════════════════════════════════════════
   MIDDLEWARE GLOBALI
══════════════════════════════════════════════════════ */

// 🛠️ IL FIX: Configura Helmet per permettere il caricamento delle immagini dal frontend (Porta 3000)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS — accetta solo richieste dal frontend configurato
app.use(cors({
  origin:      process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing (limite aumentato a 10mb per permettere l'upload di immagini Base64)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting globale (100 req/minuto per IP)
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Troppe richieste. Riprova tra un minuto.' },
}));

// Rate limiting più stretto per auth (10 req/minuto)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Troppi tentativi di accesso. Riprova tra un minuto.' },
});

/* ══════════════════════════════════════════════════════
   ROUTES
══════════════════════════════════════════════════════ */

// Health check
app.get('/health', (_, res) => res.json({
  status: 'ok',
  db:     'neon',
  env:    process.env.NODE_ENV ?? 'development',
}));

// Auth
app.use('/api/auth', authLimiter, authRoutes);

// Memes
app.use('/api/memes', memesRoutes);

// Votes — montato su /api/memes/:id/vote
app.use('/api/memes/:id/vote', votesRoutes);

// Comments — montato su /api/memes/:id/comments
app.use('/api/memes/:id/comments', commentsRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: `Endpoint non trovato: ${req.method} ${req.path}` }));

// Error handler centralizzato
app.use(errorHandler);

/* ══════════════════════════════════════════════════════
   START
══════════════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`\n🖼️  Meme Museum Backend`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`   DB: Neon (${process.env.DATABASE_URL ? '✓ configurato' : '✗ DATABASE_URL mancante'})\n`);
});

export default app;