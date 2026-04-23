/**
 * api/client.js
 * HTTP client base. Tutte le chiamate al backend passano da qui.
 * Per attivare il backend reale: cambia REACT_APP_API_URL nel .env
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const TIMEOUT  = Number(process.env.REACT_APP_API_TIMEOUT) || 8000;

/* ── Recupera il token JWT salvato ── */
const getToken = () => localStorage.getItem('mm_token');

/* ── Fetch con timeout ── */
const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

/* ── Client principale ── */
const client = async (endpoint, { body, method, auth = true, ...customConfig } = {}) => {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: method ?? (body ? 'POST' : 'GET'),
    headers,
    ...customConfig,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  let response;
  try {
    response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, config);
  } catch (err) {
    if (err.name === 'AbortError') throw new ApiError('Richiesta scaduta. Controlla la connessione.', 408);
    throw new ApiError('Impossibile raggiungere il server.', 0);
  }

  // Token scaduto → logout automatico
  if (response.status === 401) {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    window.dispatchEvent(new Event('mm:logout'));
    throw new ApiError('Sessione scaduta. Effettua di nuovo il login.', 401);
  }

  if (!response.ok) {
    let message = `Errore ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || data.error || message;
    } catch (_) {}
    throw new ApiError(message, response.status);
  }

  // 204 No Content
  if (response.status === 204) return null;

  return response.json();
};

/* ── Classe errore custom ── */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name  = 'ApiError';
    this.status = status;
  }
}

export default client;
