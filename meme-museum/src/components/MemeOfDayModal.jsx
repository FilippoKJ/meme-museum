/**
 * components/MemeOfDayModal.jsx
 * Modale che mostra il meme del giorno con voti e descrizione.
 */

import React, { useEffect } from 'react';
import { useMemes } from '../context/MemesContext';
import { useAuth } from '../context/AuthContext';

export default function MemeOfDayModal({ onClose, onLoginNeeded }) {
  const { memeOfDay, modLoading, fetchMemeOfDay, votes, castVote } = useMemes();
  const { user } = useAuth();

  useEffect(() => { fetchMemeOfDay(); }, [fetchMemeOfDay]);

  const vote = memeOfDay ? (votes[memeOfDay.id] ?? { up: memeOfDay.likes, down: 0, mine: null }) : null;

  const handleVote = (type) => {
    if (!user) { onClose(); onLoginNeeded?.(); return; }
    castVote(memeOfDay.id, type);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#141414', border: '1px solid #2a2a2a', maxHeight: '90dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="font-bebas text-2xl text-white tracking-wider leading-none">MEME DEL GIORNO</h2>
              <p className="text-xs font-mono text-[#555]">
                {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/10 transition-all">
            ✕
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto">
          {modLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-[#333] border-t-[#7c5cbf] animate-spin" />
            </div>
          )}

          {!modLoading && !memeOfDay && (
            <p className="text-center text-[#555] font-mono text-sm py-20">
              Nessun meme del giorno disponibile.
            </p>
          )}

          {!modLoading && memeOfDay && (
            <>
              {/* Immagine */}
              <div className="w-full bg-[#111] flex items-center justify-center" style={{ aspectRatio: '16/10' }}>
                {memeOfDay.src ? (
                  <img src={memeOfDay.src} alt={memeOfDay.tags[0]} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#333]">
                    <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="font-mono text-sm text-[#444]">#{memeOfDay.tags[0]}</span>
                  </div>
                )}
              </div>

              {/* Info + azioni */}
              <div className="px-6 py-5 flex flex-col gap-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {memeOfDay.tags.map(t => (
                    <span key={t}
                      className="text-xs font-mono px-3 py-1 rounded-full"
                      style={{ background: 'rgba(124,92,191,0.2)', border: '1px solid rgba(124,92,191,0.4)', color: '#c4a8ff' }}>
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Descrizione */}
                <p className="text-sm text-gray-300 font-mono leading-relaxed">
                  {memeOfDay.description || `Un meme epico. Meritato vincitore di oggi.`}
                </p>

                {/* Voti */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleVote('up')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono font-bold transition-all active:scale-95"
                    style={{
                      background: vote?.mine === 'up' ? 'rgba(74,222,128,0.18)' : '#1c1c1c',
                      border: `1.5px solid ${vote?.mine === 'up' ? '#4ade80' : '#2a2a2a'}`,
                      color: vote?.mine === 'up' ? '#4ade80' : '#888',
                    }}
                  >
                    ▲ <span>{vote?.up ?? 0}</span>
                  </button>

                  <button
                    onClick={() => handleVote('down')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-mono font-bold transition-all active:scale-95"
                    style={{
                      background: vote?.mine === 'down' ? 'rgba(248,113,113,0.18)' : '#1c1c1c',
                      border: `1.5px solid ${vote?.mine === 'down' ? '#f87171' : '#2a2a2a'}`,
                      color: vote?.mine === 'down' ? '#f87171' : '#888',
                    }}
                  >
                    ▼ <span>{vote?.down ?? 0}</span>
                  </button>

                  <span className="text-xs font-mono text-[#444] ml-auto">
                    📅 {new Date(memeOfDay.createdAt).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
