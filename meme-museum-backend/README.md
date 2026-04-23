# 🖼️ Meme Museum — Backend

Stack: **Node.js** · **Express** · **Neon DB (PostgreSQL)** · **JWT**

---

## Setup rapido

### 1. Installa le dipendenze
```bash
npm install
```

### 2. Configura il .env
```bash
cp .env.example .env
```
Apri `.env` e inserisci:
- `DATABASE_URL` → connection string dal pannello di Neon (Progetto: **MemeMuseum**)
- `JWT_SECRET` → stringa casuale lunga almeno 32 caratteri

### 3. Applica lo schema al DB
```bash
npm run db:migrate
```

### 4. (Opzionale) Dati di esempio
```bash
npm run db:seed
# Crea utente test/test + 18 meme
```

### 5. Avvia
```bash
npm run dev    # sviluppo con nodemon
npm start      # produzione
```
Server su `http://localhost:4000`

---

## Attivare il backend nel frontend

`src/api/memesApi.js` e `src/api/authApi.js`:
```js
const USE_MOCK = false;
```
`.env` del frontend:
```env
REACT_APP_API_URL=http://localhost:4000/api
```

---

## Endpoints

### Auth
| Metodo | Path | Body | Auth |
|--------|------|------|------|
| POST | `/api/auth/register` | `{ username, password }` | No |
| POST | `/api/auth/login` | `{ username, password }` | No |
| GET  | `/api/auth/me` | — | Bearer |

### Memes
| Metodo | Path | Note |
|--------|------|------|
| GET | `/api/memes` | Query: `search, tag, sortBy, dateFrom, dateTo, page, limit` |
| GET | `/api/memes/today` | Meme del giorno (più votato) |
| GET | `/api/memes/:id` | Singolo meme |

`sortBy`: `date_desc` · `date_asc` · `votes_desc` · `votes_asc`

### Voti
| Metodo | Path | Body | Note |
|--------|------|------|------|
| POST | `/api/memes/:id/vote` | `{ type: "up"|"down" }` | Toggle automatico |
| DELETE | `/api/memes/:id/vote` | — | Rimuovi voto |

### Commenti
| Metodo | Path | Note |
|--------|------|------|
| GET | `/api/memes/:id/comments` | Pubblico |
| POST | `/api/memes/:id/comments` | `{ text }` · Auth |
| DELETE | `/api/memes/:id/comments/:cid` | Solo autore |

---

## Schema DB

```
users         id, username, password_hash, avatar_url, created_at
memes         id, src, description, created_at, uploaded_by→users
tags          id, name
meme_tags     meme_id→memes, tag_id→tags   [N:N]
votes         user_id→users, meme_id→memes, type('up'|'down')  [PK composita]
comments      id, meme_id→memes, user_id→users, text, created_at

VIEW memes_with_counts  →  meme + likes + dislikes + tags[] aggregati
```

---

## Struttura

```
src/
├── db/
│   ├── pool.js          Connessione Neon
│   ├── schema.sql       Tabelle, indici, view
│   ├── migrate.js       Applica schema
│   └── seed.js          Dati di esempio
├── middleware/
│   ├── auth.js          requireAuth / optionalAuth
│   └── errorHandler.js  Gestione errori centralizzata
├── routes/
│   ├── auth.js          register · login · me
│   ├── memes.js         lista · today · singolo
│   ├── votes.js         vota · rimuovi
│   └── comments.js      lista · crea · elimina
└── index.js             Express + middleware globali
```
