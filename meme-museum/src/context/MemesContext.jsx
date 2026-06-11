/**
 * context/MemesContext.jsx
 *
 * FIX sessione: il context ora reagisce ai cambiamenti di autenticazione.
 * - Logout  → resetta mine:null per tutti i voti + refetch (backend torna myVote:null)
 * - Login   → refetch memes con il token nuovo (backend torna myVote corretto)
 * - Refresh → fetchMemes al mount legge già il token da localStorage via client.js
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getMemes, getMemeOfDay, vote as apiVote, removeVote as apiRemoveVote } from '../api/memesApi';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth(); // ← ascolta i cambiamenti di sessione

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

  const searchTimer  = useRef(null);
  const filtersRef   = useRef(DEFAULT_FILTERS);
  const pageRef      = useRef(1);
  // Tiene traccia dell'utente precedente per distinguere login/logout
  const prevUserRef  = useRef(undefined); // undefined = prima render, null = logout

  /* ── Core fetch ── */
  const fetchMemes = useCallback(async (f, p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMemes({ ...f, page: p, limit: LIMIT });
      setMemes(res.data);
      setPage(res.page);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      // Aggiorna i voti con i dati freschi dal server (incluso myVote per utenti auth)
      setVotes(prev => {
        const next = { ...prev };
        res.data.forEach(m => {
          next[m.id] = {
            up:   m.likes,
            down: m.dislikes ?? 0,
            // myVote = null se utente non autenticato (garantito dal backend)
            // myVote = 'up'/'down'/null se autenticato
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
  }, []);

  /* ── Primo caricamento ── */
  useEffect(() => {
    fetchMemes(DEFAULT_FILTERS, 1);
    filtersRef.current  = DEFAULT_FILTERS;
    pageRef.current     = 1;
    prevUserRef.current = null; // dopo il mount consideriamo lo stato iniziale noto
  }, [fetchMemes]);

  /* ════════════════════════════════════════════════════════════
     GESTIONE CAMBIO SESSIONE
     Reagisce a login, logout e cambio utente.
     - Skip al primo render (prevUserRef === undefined)
     - Logout  (user diventa null): resetta mine per tutti i voti
               poi refetch — il backend non manderà più myVote
     - Login   (user diventa non-null): refetch con token aggiornato
               il backend manderà myVote corretto per questo utente
  ════════════════════════════════════════════════════════════ */
  useEffect(() => {
    // Skip al primissimo render (gestito da fetchMemes al mount)
    if (prevUserRef.current === undefined) {
      prevUserRef.current = user;
      return;
    }

    const wasLoggedIn = prevUserRef.current !== null;
    const isLoggedIn  = user !== null;
    prevUserRef.current = user;

    if (wasLoggedIn && !isLoggedIn) {
      // ── LOGOUT: resetta subito mine per tutti i voti locali ──
      // Questo rimuove l'highlight visivo immediatamente, senza aspettare la fetch
      setVotes(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = { ...next[id], mine: null };
        });
        return next;
      });
      // Poi refetch (il backend non manda più myVote senza token)
      fetchMemes(filtersRef.current, pageRef.current);

    } else if (!wasLoggedIn && isLoggedIn) {
      // ── LOGIN: refetch immediato per ottenere myVote dal backend ──
      // NON resettare i conteggi locali per evitare flickering
      fetchMemes(filtersRef.current, pageRef.current);
    }
  }, [user, fetchMemes]);

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

  /* ── Aggiorna UN filtro ── */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      filtersRef.current = next;
      if (key === 'search') {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchMemes(next, 1), 400);
      } else {
        Promise.resolve().then(() => fetchMemes(next, 1));
      }
      return next;
    });
  }, [fetchMemes]);

  /* ── Aggiorna PIÙ filtri in una sola fetch ── */
  const updateFilters = useCallback((patch) => {
    setFilters(prev => {
      const next = { ...prev, ...patch };
      filtersRef.current = next;
      Promise.resolve().then(() => fetchMemes(next, 1));
      return next;
    });
  }, [fetchMemes]);

  /* ── Applica tutti i filtri (da FilterPanel) ── */
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    filtersRef.current = newFilters;
    fetchMemes(newFilters, 1);
  }, [fetchMemes]);

  /* ── Reset ── */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    filtersRef.current = DEFAULT_FILTERS;
    fetchMemes(DEFAULT_FILTERS, 1);
  }, [fetchMemes]);

  /* ── Paginazione ── */
  const goToPage = useCallback((p) => {
    pageRef.current = p;
    fetchMemes(filtersRef.current, p);
  }, [fetchMemes]);

  /* ── Voto ottimistico con rollback ── */
  const castVote = useCallback(async (memeId, type) => {
    let snapshot = null;

    setVotes(prev => {
      snapshot = prev[memeId];
      if (!snapshot) return prev;

      const next = { ...snapshot };
      if (snapshot.mine === type) {
        next.mine  = null;
        next[type] -= 1;
      } else {
        if (snapshot.mine) next[snapshot.mine] -= 1;
        next.mine  = type;
        next[type] += 1;
      }
      return { ...prev, [memeId]: next };
    });

    try {
      if (snapshot?.mine === type) await apiRemoveVote(memeId);
      else                          await apiVote(memeId, type);
    } catch (err) {
      // Rollback ottimistico se il backend rifiuta
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
      refetch: () => fetchMemes(filtersRef.current, pageRef.current),
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
