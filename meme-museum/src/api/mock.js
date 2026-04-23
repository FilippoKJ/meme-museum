/**
 * api/mock.js
 * Dati finti con date, tag multipli, meme del giorno.
 */

const delay = (ms = 350) => new Promise(r => setTimeout(r, ms));

export const MOCK_USER = { id: 'u1', username: 'TestUser', avatar: null };

export const MOCK_MEMES = [
  { id: '1',  tags: ['chad'],              likes: 420,  dislikes: 12,  src: null, description: 'Il classico Chad. Mascella quadrata, niente paura.',     createdAt: '2025-03-01T10:00:00Z' },
  { id: '2',  tags: ['wojak', 'doomer'],   likes: 69,   dislikes: 5,   src: null, description: 'Wojak piange ancora. Non sa perché, ma piange.',          createdAt: '2025-03-05T14:00:00Z' },
  { id: '3',  tags: ['cursed'],            likes: 1337, dislikes: 99,  src: null, description: 'Questo meme non avrebbe dovuto esistere.',                createdAt: '2025-03-10T09:30:00Z' },
  { id: '4',  tags: ['based', 'chad'],     likes: 999,  dislikes: 3,   src: null, description: 'Basato. Redpillato. Impossibile confutare.',              createdAt: '2025-03-12T16:00:00Z' },
  { id: '5',  tags: ['doomer'],            likes: 777,  dislikes: 21,  src: null, description: 'Il Doomer guarda fuori dalla finestra alle 3 di notte.',  createdAt: '2025-03-15T23:00:00Z' },
  { id: '6',  tags: ['gigachad', 'based'], likes: 2048, dislikes: 0,   src: null, description: 'Il Gigachad non discute. Il Gigachad esiste.',            createdAt: '2025-03-18T11:00:00Z' },
  { id: '7',  tags: ['npc'],               likes: 314,  dislikes: 42,  src: null, description: 'NPC spotted. Script in loop.',                           createdAt: '2025-03-20T08:00:00Z' },
  { id: '8',  tags: ['stinkypussy'],       likes: 666,  dislikes: 66,  src: null, description: 'Un meme di culto. La descrizione non è necessaria.',     createdAt: '2025-03-22T19:00:00Z' },
  { id: '9',  tags: ['wojak', 'cursed'],   likes: 88,   dislikes: 7,   src: null, description: 'Il Wojak cursed. Un incrocio pericoloso.',               createdAt: '2025-03-25T12:00:00Z' },
  { id: '10', tags: ['chad', 'gigachad'],  likes: 1500, dislikes: 10,  src: null, description: 'Chad meets Gigachad. Chi vince?',                        createdAt: '2025-03-28T17:00:00Z' },
  { id: '11', tags: ['npc', 'doomer'],     likes: 200,  dislikes: 30,  src: null, description: 'NPC doomer. Il peggior combo possibile.',                 createdAt: '2025-04-01T10:00:00Z' },
  { id: '12', tags: ['based'],             likes: 540,  dislikes: 8,   src: null, description: 'Purely based. Nient\'altro da aggiungere.',              createdAt: '2025-04-03T14:30:00Z' },
  { id: '13', tags: ['cursed', 'npc'],     likes: 230,  dislikes: 55,  src: null, description: 'NPC cursed edition. Rotto dentro.',                      createdAt: '2025-04-05T09:00:00Z' },
  { id: '14', tags: ['gigachad'],          likes: 3000, dislikes: 2,   src: null, description: 'Il Gigachad definitivo. Nessuna debolezza.',              createdAt: '2025-04-07T20:00:00Z' },
  { id: '15', tags: ['stinkypussy', 'cursed'], likes: 420, dislikes: 69, src: null, description: 'Stinkypussy cursed. Non c\'è altra descrizione.',      createdAt: '2025-04-09T15:00:00Z' },
  { id: '16', tags: ['wojak'],             likes: 111,  dislikes: 11,  src: null, description: 'Feels bad man. Sempre.',                                  createdAt: '2025-04-10T08:00:00Z' },
  { id: '17', tags: ['chad', 'based'],     likes: 888,  dislikes: 4,   src: null, description: 'Chad based combo. Inarrestabile.',                       createdAt: '2025-04-11T11:00:00Z' },
  { id: '18', tags: ['doomer', 'cursed'],  likes: 333,  dislikes: 33,  src: null, description: 'Doomer cursed. Pensieri alle 4 di notte.',               createdAt: '2025-04-12T00:00:00Z' },
];

export const MOCK_COMMENTS = {
  '1': [{ id: 'c1', author: 'BasedChad',  text: 'Questo è letteralmente me',        createdAt: '2025-03-02T10:00:00Z' }],
  '3': [{ id: 'c2', author: 'Doomer42',   text: 'Non riesco a smettere di fissarlo', createdAt: '2025-03-11T14:30:00Z' }],
  '6': [{ id: 'c3', author: 'NPC_real',   text: 'Io non lo raggiungerò mai',         createdAt: '2025-03-19T09:00:00Z' }],
};

/* ────────────────────────────────────────────────
   Meme del giorno: quello con più like in assoluto
──────────────────────────────────────────────── */
const getMemeOfDay = () =>
  [...MOCK_MEMES].sort((a, b) => b.likes - a.likes)[0];

/* ── Applica filtri + ordinamento ── */
const applyFilters = (data, { search, tag, sortBy, dateFrom, dateTo }) => {
  let result = [...data];

  // Ricerca testo su tag
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(m => m.tags.some(t => t.toLowerCase().includes(q)));
  }

  // Filtro per singolo tag
  if (tag) {
    result = result.filter(m => m.tags.includes(tag));
  }

  // Filtro data inizio
  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    result = result.filter(m => new Date(m.createdAt).getTime() >= from);
  }

  // Filtro data fine
  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter(m => new Date(m.createdAt).getTime() <= to.getTime());
  }

  // Ordinamento
  if (sortBy === 'votes_desc')  result.sort((a, b) => b.likes - a.likes);
  if (sortBy === 'votes_asc')   result.sort((a, b) => a.likes - b.likes);
  if (sortBy === 'date_desc')   result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sortBy === 'date_asc')    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return result;
};

export const mockApi = {
  async getMemes({ search = '', tag = '', page = 1, limit = 10, sortBy = 'date_desc', dateFrom = '', dateTo = '' } = {}) {
    await delay();
    const filtered = applyFilters(MOCK_MEMES, { search, tag, sortBy, dateFrom, dateTo });
    const start = (page - 1) * limit;
    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    };
  },

  async getMeme(id) {
    await delay();
    const meme = MOCK_MEMES.find(m => m.id === String(id));
    if (!meme) throw new Error('Meme non trovato');
    return meme;
  },

  async getMemeOfDay() {
    await delay(200);
    return getMemeOfDay();
  },

  async getComments(memeId) {
    await delay(200);
    return MOCK_COMMENTS[memeId] || [];
  },

  async postComment(memeId, text) {
    await delay(300);
    return { id: `c${Date.now()}`, author: MOCK_USER.username, text, createdAt: new Date().toISOString() };
  },

  async vote(memeId, type) {
    await delay(150);
    return { success: true, type };
  },

  async removeVote(memeId) {
    await delay(150);
    return { success: true };
  },

  async login(username, password) {
    await delay(600);
    if (username === 'test' && password === 'test') {
      return { token: 'mock-jwt-token-123', user: { ...MOCK_USER, username } };
    }
    throw new Error('Credenziali non valide');
  },

  async register(username, password) {
    await delay(600);
    return { token: 'mock-jwt-token-456', user: { id: 'u2', username, avatar: null } };
  },

  async getMe() {
    await delay(200);
    return MOCK_USER;
  },
};
