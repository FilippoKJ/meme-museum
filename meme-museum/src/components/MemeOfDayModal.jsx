import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function MemeOfDayModal({ onClose }) {
  const [meme, setMeme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchMemeOfDay = async () => {
      try {
        // L'URL punta a /today in accordo col backend
        const res = await fetch(`${API_URL}/api/memes/today`);
        if (!res.ok) {
          throw new Error('Nessun meme trovato nel museo.');
        }
        const data = await res.json();
        setMeme(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMemeOfDay();
  }, []);

  // Resetta l'errore immagine se cambia il meme
  useEffect(() => { setImgError(false); }, [meme]);

  const getFullSrc = (src) => {
    if (!src) return '';
    if (src.startsWith('/api')) return `${API_URL}${src}`;
    if (src.startsWith('/') && !src.startsWith('http')) return `${API_URL}${src}`;
    return src;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Sfondo isolato per performance */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(5, 5, 5, 0.96)' }}
        onClick={onClose}
      />

      {/* Modale */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl flex flex-col gap-0 animate-fade-up overflow-hidden shadow-2xl"
        style={{ background: '#161616', border: '1px solid #2a2a2a' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222] bg-[#111]">
          <h2 className="font-bebas text-3xl tracking-wide flex items-center gap-2" style={{ color: '#f0e040' }}>
            <span className="text-2xl">👑</span> MEME DEL GIORNO
          </h2>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors text-xl leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 min-h-[300px] justify-center">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-[#7c5cbf] border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-sm text-[#888]">Calcolo dei voti in corso...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center flex flex-col gap-3 items-center">
              <span className="text-4xl">🪫</span>
              <p className="text-sm font-mono text-red-400">{error}</p>
            </div>
          ) : meme ? (
            <>
              <div className="w-full rounded-xl overflow-hidden border border-[#333] bg-[#0a0a0a] flex items-center justify-center" style={{ aspectRatio: '16/10' }}>
                {/* Gestione Immagine vs Fallback */}
                {!imgError && meme.src ? (
                  <img
                    src={getFullSrc(meme.src)}
                    alt="Meme of the day"
                    className="w-full h-full object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#333]">
                    <svg width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest">
                      File multimediale non trovato
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(meme.tags || []).map(t => (
                    <span key={t} className="text-xs font-mono px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(240,224,64,0.1)', border: '1px solid rgba(240,224,64,0.25)', color: '#f0e040' }}>
                      #{t}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-white font-mono mt-1">
                  {meme.description || "Un capolavoro senza tempo."}
                </p>
                <p className="text-[10px] text-[#888] font-mono mt-2 uppercase tracking-widest">
                  🏆 Vincitore {meme.score !== undefined ? `con ${meme.score} punti netti` : 'assoluto'}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#222] bg-[#111]">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-mono font-bold text-sm text-black tracking-widest uppercase transition-all active:scale-95"
            style={{ background: '#f0e040' }}
          >
            Inchinati e Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}