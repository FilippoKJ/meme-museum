/**
 * hooks/useComments.js
 * FIX: postComment non dipende più da `posting` — usa ref per il lock.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { getComments, postComment as apiPostComment } from '../api/memesApi';

export function useComments(memeId) {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [posting,  setPosting]  = useState(false);
  const postingRef = useRef(false); // FIX: ref per evitare stale closure

  const fetchComments = useCallback(async () => {
    if (!memeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getComments(memeId);
      setComments(data);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento dei commenti');
    } finally {
      setLoading(false);
    }
  }, [memeId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const postComment = useCallback(async (text) => {
    if (!text.trim() || postingRef.current) return;
    postingRef.current = true;
    setPosting(true);
    try {
      const newComment = await apiPostComment(memeId, text.trim());
      setComments(prev => [...prev, newComment]);
      return newComment;
    } catch (err) {
      setError(err.message || "Errore nell'invio del commento");
      throw err;
    } finally {
      postingRef.current = false;
      setPosting(false);
    }
  }, [memeId]); // FIX: posting rimosso dalle dipendenze

  return { comments, loading, error, posting, postComment, refetch: fetchComments };
}
