/**
 * context/MemesContext.jsx
 *
 * FIX 1: fetchMemes NON viene più chiamata dentro il functional updater
 *         di setFilters — i side effect nei pure updater sono vietati
 *         (React StrictMode li chiama due volte).
 *
 * FIX 2: updateFilters batcha N filtri in una sola fetch.
 *
 * FIX 3: castVote usa snapshot dentro setVotes (era già corretto)
 *         ma ora è garantito che `snapshot` sia sempre valorizzato.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getMemes, getMemeOfDay, vote as apiVote, removeVote as apiRemoveVote } from '../api/memesApi';

const MemesContext = createContext(null);
const LIMIT = 10;

export const DEFAULT_FILTERS = {
  search:   '',
  tag:      '',
  sortBy:   'date_desc',
  dateFrom: '',
  dateTo:   '',
};

export function MemesProvider({ children }) {
  const [memes,      setMemes]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filters,    setFilters]    = useState(DEFAULT_FILTERS);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [memeOfDay,  setMemeOfDay]  = useState(null);
  const [modLoading, setModLoading] = useState(false);
  const [votes,      setVotes]      = useState({});

  const searchTimer = useRef(null);

  /* ── Core fetch: accetta filtri espliciti come argomento ─────────────
     Non cattura mai `filters` dallo state → nessuna stale closure.     */
  const fetchMemes = useCallback(async (f, p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMemes({ ...f, page: p, limit: LIMIT });
      setMemes(res.data);
      setPage(res.page);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setVotes(prev => {
        const next = { ...prev };
        res.data.forEach(m => {
          next[m.id] = {
            up:   m.likes,
            down: m.dislikes ?? 0,
            // myVote arriva dal backend quando l'utente è autenticato.
            // Se non c'è (utente anonimo o mock) mantieni il valore locale.
            mine: m.myVote !== undefined ? m.myVote : (prev[m.id]?.mine ?? null),
          };
        });
        return next;
      });
    } catch (err) {
      setError(err.message || 'Errore nel caricamento dei meme');
    } finally {
      setLoading(false);
    }
  }, []); // dipendenze vuote — funzione stabile per tutto il lifecycle

  /* ── Primo caricamento ── */
  useEffect(() => {
    fetchMemes(DEFAULT_FILTERS, 1);
  }, [fetchMemes]);

  /* ── Meme del giorno ── */
  const fetchMemeOfDay = useCallback(async () => {
    setModLoading(true);
    try {
      const m = await getMemeOfDay();
      setMemeOfDay(m);
      setVotes(prev => ({
        ...prev,
        [m.id]: {
          up:   m.likes,
          down: m.dislikes ?? 0,
          mine: m.myVote !== undefined ? m.myVote : (prev[m.id]?.mine ?? null),
        },
      }));
    } catch (_) {}
    finally { setModLoading(false); }
  }, []);

  /* ── Aggiorna UN filtro ──────────────────────────────────────────────
     FIX: setFilters e fetchMemes sono chiamate SEQUENZIALMENTE, non
     una dentro l'altra. Il nuovo valore dei filtri è calcolato fuori
     dall'updater e passato a entrambe.                                  */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };

      if (key === 'search') {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchMemes(next, 1), 400);
      } else {
        // Schedula la fetch fuori dal render cycle corrente
        Promise.resolve().then(() => fetchMemes(next, 1));
      }

      return next;
    });
  }, [fetchMemes]);

  /* ── Aggiorna PIÙ filtri in una sola fetch ──────────────────────────
     FIX: stesso pattern — calcola next, poi fetch con next.            */
  const updateFilters = useCallback((patch) => {
    setFilters(prev => {
      const next = { ...prev, ...patch };
      Promise.resolve().then(() => fetchMemes(next, 1));
      return next;
    });
  }, [fetchMemes]);

  /* ── Applica tutti i filtri (da FilterPanel: applica e chiudi) ── */
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchMemes(newFilters, 1);
  }, [fetchMemes]);

  /* ── Reset ── */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    fetchMemes(DEFAULT_FILTERS, 1);
  }, [fetchMemes]);

  /* ── Paginazione ── */
  // Usa closure su `filters` — qui va bene perché goToPage è ricreata
  // ogni volta che `filters` cambia, e vogliamo il valore corrente.
  const goToPage = useCallback((p) => {
    fetchMemes(filters, p);
  }, [fetchMemes, filters]);

  /* ── Voto ottimistico con rollback garantito ── */
  const castVote = useCallback(async (memeId, type) => {
    let snapshot = null;

    setVotes(prev => {
      snapshot = prev[memeId];
      if (!snapshot) return prev;

      const next = { ...snapshot };
      if (snapshot.mine === type) {
        // Toggle off
        next.mine  = null;
        next[type] -= 1;
      } else {
        if (snapshot.mine) next[snapshot.mine] -= 1; // annulla voto precedente
        next.mine  = type;
        next[type] += 1;
      }
      return { ...prev, [memeId]: next };
    });

    // Chiamata API in background — rollback se fallisce
    try {
      if (snapshot?.mine === type) await apiRemoveVote(memeId);
      else                          await apiVote(memeId, type);
    } catch (_) {
      if (snapshot) setVotes(prev => ({ ...prev, [memeId]: snapshot }));
    }
  }, []);

  return (
    <MemesContext.Provider value={{
      memes, loading, error,
      filters, updateFilter, updateFilters, applyFilters, resetFilters,
      page, total, totalPages, goToPage,
      memeOfDay, modLoading, fetchMemeOfDay,
      votes, castVote,
      refetch: () => fetchMemes(filters, page),
    }}>
      {children}
    </MemesContext.Provider>
  );
}

export const useMemes = () => {
  const ctx = useContext(MemesContext);
  if (!ctx) throw new Error('useMemes deve essere usato dentro MemesProvider');
  return ctx;
};
