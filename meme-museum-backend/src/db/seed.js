/**
 * src/db/seed.js
 * FIX: i voti ora vengono effettivamente inseriti creando utenti fake.
 * Esegui con:  node src/db/seed.js
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import sql from './pool.js';

const TAGS = ['chad', 'wojak', 'cursed', 'based', 'doomer', 'gigachad', 'npc', 'uhohstinky'];

const MEMES = [
  { tags: ['chad'],                  description: 'Il classico Chad. Mascella quadrata, niente paura.',         upvotes: 420, downvotes: 12  },
  { tags: ['wojak', 'doomer'],       description: 'Wojak piange ancora. Non sa perché, ma piange.',             upvotes: 69,  downvotes: 5   },
  { tags: ['cursed'],                description: 'Questo meme non avrebbe dovuto esistere.',                   upvotes: 1337,downvotes: 99  },
  { tags: ['based', 'chad'],         description: 'Basato. Redpillato. Impossibile confutare.',                 upvotes: 999, downvotes: 3   },
  { tags: ['doomer'],                description: 'Il Doomer guarda fuori dalla finestra alle 3 di notte.',    upvotes: 777, downvotes: 21  },
  { tags: ['gigachad', 'based'],     description: 'Il Gigachad non discute. Il Gigachad esiste semplicemente.',upvotes: 2048,downvotes: 0   },
  { tags: ['npc'],                   description: 'NPC spotted. Script in loop.',                              upvotes: 314, downvotes: 42  },
  { tags: ['uhohstinky'],           description: 'Un meme di culto. La descrizione non è necessaria.',        upvotes: 666, downvotes: 66  },
  { tags: ['wojak', 'cursed'],       description: 'Il Wojak cursed. Un incrocio pericoloso.',                  upvotes: 88,  downvotes: 7   },
  { tags: ['chad', 'gigachad'],      description: 'Chad meets Gigachad. Chi vince?',                           upvotes: 1500,downvotes: 10  },
  { tags: ['npc', 'doomer'],         description: 'NPC doomer. Il peggior combo possibile.',                   upvotes: 200, downvotes: 30  },
  { tags: ['based'],                 description: "Purely based. Nient'altro da aggiungere.",                  upvotes: 540, downvotes: 8   },
  { tags: ['cursed', 'npc'],         description: 'NPC cursed edition. Rotto dentro.',                         upvotes: 230, downvotes: 55  },
  { tags: ['gigachad'],              description: 'Il Gigachad definitivo. Nessuna debolezza.',                 upvotes: 3000,downvotes: 2   },
  { tags: ['uhohstinky', 'cursed'], description: "uhohstinky cursed. Non c'è altra descrizione.",            upvotes: 420, downvotes: 69  },
  { tags: ['wojak'],                 description: 'Feels bad man. Sempre.',                                    upvotes: 111, downvotes: 11  },
  { tags: ['chad', 'based'],         description: 'Chad based combo. Inarrestabile.',                          upvotes: 888, downvotes: 4   },
  { tags: ['doomer', 'cursed'],      description: 'Doomer cursed. Pensieri alle 4 di notte.',                  upvotes: 333, downvotes: 33  },
];

// Crea N utenti fake per i voti (ogni utente vota 1 meme)
async function createFakeVoters(n) {
  const hash = await bcrypt.hash('fakepw_seed', 10);
  const ids = [];
  for (let i = 0; i < n; i++) {
    const username = `_seed_voter_${i}_${Date.now()}`;
    const [u] = await sql`
      INSERT INTO users (username, password_hash)
      VALUES (${username}, ${hash})
      RETURNING id
    `;
    ids.push(u.id);
  }
  return ids;
}

async function seed() {
  console.log('🌱 Seeding database MemeMuseum...\n');
  try {
    // ── 1. Utente di test principale ──
    const hash = await bcrypt.hash('test', 12);
    await sql`
      INSERT INTO users (username, password_hash)
      VALUES ('test', ${hash})
      ON CONFLICT (username) DO NOTHING
    `;
    const [testUser] = await sql`SELECT id FROM users WHERE username = 'test'`;
    console.log('  ✓ Utente test (username: test, password: test)');

    // ── 2. Tags ──
    for (const name of TAGS) {
      await sql`INSERT INTO tags (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`;
    }
    console.log(`  ✓ ${TAGS.length} tag`);

    // ── 3. Meme + voti ──
    const daysAgo = MEMES.length;
    let totalVoters = 0;

    for (let i = 0; i < MEMES.length; i++) {
      const m = MEMES[i];
      const createdAt = new Date(Date.now() - (daysAgo - i) * 24 * 60 * 60 * 1000);

      // Inserisci meme
      const [meme] = await sql`
        INSERT INTO memes (description, created_at, uploaded_by)
        VALUES (${m.description}, ${createdAt.toISOString()}, ${testUser.id})
        RETURNING id
      `;

      // Associa tag
      for (const tagName of m.tags) {
        const [tag] = await sql`SELECT id FROM tags WHERE name = ${tagName}`;
        if (tag) {
          await sql`
            INSERT INTO meme_tags (meme_id, tag_id)
            VALUES (${meme.id}, ${tag.id})
            ON CONFLICT DO NOTHING
          `;
        }
      }

      // Inserisci voti reali creando utenti temporanei
      // upvote
      const upVoters = await createFakeVoters(m.upvotes);
      for (const uid of upVoters) {
        await sql`
          INSERT INTO votes (user_id, meme_id, type)
          VALUES (${uid}, ${meme.id}, 'up')
          ON CONFLICT DO NOTHING
        `;
      }
      // downvote
      const downVoters = await createFakeVoters(m.downvotes);
      for (const uid of downVoters) {
        await sql`
          INSERT INTO votes (user_id, meme_id, type)
          VALUES (${uid}, ${meme.id}, 'down')
          ON CONFLICT DO NOTHING
        `;
      }

      totalVoters += m.upvotes + m.downvotes;
      process.stdout.write(`  ✓ Meme ${i + 1}/${MEMES.length}: #${m.tags[0]} (↑${m.upvotes} ↓${m.downvotes})\n`);
    }

    console.log(`\n✅ Seed completato!`);
    console.log(`   ${MEMES.length} meme, ${TAGS.length} tag, ${totalVoters} voti`);
    console.log(`   Login: test / test`);
    console.log(`   Meme del giorno: quello con ${Math.max(...MEMES.map(m => m.upvotes))} upvote`);
  } catch (err) {
    console.error('\n❌ Errore durante il seed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

seed();
