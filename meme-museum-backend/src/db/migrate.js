import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  console.log('🔄 Connessione a Neon DB (MemeMuseum)...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL non definita nel .env');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

    // Rimuovi commenti a riga singola (-- ...)
    const noComments = schema
      .split('\n')
      .map(line => {
        const commentIdx = line.indexOf('--');
        return commentIdx >= 0 ? line.slice(0, commentIdx) : line;
      })
      .join('\n');

    // Splitta su ';' e pulisci ogni statement
    const statements = noComments
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📋 ${statements.length} statement da eseguire...\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      // Prendi la prima riga non vuota come label per il log
      const label = stmt.split('\n').find(l => l.trim().length > 0)?.trim() ?? stmt.slice(0, 60);
      try {
        await sql(stmt);
        console.log(`  ✓ ${label.slice(0, 70)}`);
      } catch (err) {
        console.error(`  ❌ FALLITO: ${label}`);
        console.error(`     ${err.message}\n`);
        process.exit(1);
      }
    }

    console.log('\n✅ Schema applicato con successo al database MemeMuseum');
    console.log('   Tabelle: users, memes, tags, meme_tags, votes, comments');
    console.log('   Vista:   memes_with_counts\n');
  } catch (err) {
    console.error('❌ Errore fatale:', err.message);
    process.exit(1);
  }
}

migrate();
