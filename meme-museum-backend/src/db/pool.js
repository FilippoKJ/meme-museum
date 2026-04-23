/**
 * src/db/pool.js
 * Connessione a Neon DB tramite @neondatabase/serverless.
 * Usa WebSocket per il pooling in ambienti serverless.
 */

import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Necessario in ambienti Node.js (non browser)
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL non definita nel .env');
}

// `neon` restituisce una funzione sql tag — ogni query è una nuova connessione
// ideale per serverless/edge; per Express tradizionale funziona ugualmente bene
const sql = neon(process.env.DATABASE_URL);

export default sql;
