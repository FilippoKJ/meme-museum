# 🖼️ Meme Museum — Frontend

Stack: **React 18** · **Tailwind CSS 3** · **CSS custom** · **JavaScript (JSX)**

---

## Avvio rapido

```bash
npm install
npm start        # → http://localhost:3000
```

Dev login: `test / test`

---

## Struttura progetto

```
src/
├── api/
│   ├── client.js        # HTTP client (fetch + auth token + error handling)
│   ├── memesApi.js      # Tutte le chiamate meme/voti/commenti
│   ├── authApi.js       # Login, registrazione, profilo
│   └── mock.js          # Dati finti per sviluppo locale
│
├── context/
│   ├── AuthContext.jsx  # Stato globale utente (login/logout/token)
│   └── MemesContext.jsx # Stato globale meme (lista, ricerca, voti)
│
├── hooks/
│   └── useComments.js   # Carica e posta commenti per un singolo meme
│
├── components/
│   ├── Navbar.jsx       # Barra navigazione + auth area
│   ├── Hero.jsx         # Sezione hero con personaggi
│   ├── MemeChars.jsx    # SVG personaggi (NPC, Chad)
│   ├── MemeCards.jsx    # FeaturedMeme, TagSidebar, GridCard
│   ├── MemeViewer.jsx   # Viewer fullscreen stile Shorts
│   └── LoginModal.jsx   # Modale login / registrazione
│
├── App.jsx              # Root — monta i Provider
├── index.css            # Tailwind + animazioni custom
└── index.js             # Entry point
```

---

## Passare al backend reale

### 1. Configura l'URL nel `.env`

```env
REACT_APP_API_URL=https://tuo-backend.com/api
```

### 2. Cambia il flag in `src/api/memesApi.js` e `src/api/authApi.js`

```js
const USE_MOCK = false;   // ← era true
```

Fatto. Le firme delle funzioni non cambiano.

### 3. Endpoint attesi dal backend

| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET    | `/memes?search=&page=&limit=` | Lista meme paginata |
| GET    | `/memes/:id` | Singolo meme |
| POST   | `/memes/:id/vote` | Vota `{ type: "up"\|"down" }` |
| DELETE | `/memes/:id/vote` | Rimuovi voto |
| GET    | `/memes/:id/comments` | Lista commenti |
| POST   | `/memes/:id/comments` | Nuovo commento `{ text }` |
| POST   | `/auth/login` | Login `{ username, password }` → `{ token, user }` |
| POST   | `/auth/register` | Registra `{ username, password }` → `{ token, user }` |
| GET    | `/auth/me` | Profilo utente corrente (Bearer token) |

### 4. Formato risposta atteso

**GET /memes**
```json
{
  "data": [{ "id": "1", "tag": "chad", "likes": 420, "dislikes": 12, "src": "url", "description": "..." }],
  "total": 42,
  "page": 1,
  "totalPages": 3
}
```

**POST /auth/login**
```json
{ "token": "jwt-string", "user": { "id": "u1", "username": "nome", "avatar": null } }
```

---

## Build produzione

```bash
npm run build
```
