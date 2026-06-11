import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMemes } from '../context/MemesContext';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000';

/* ── Placeholder immagine ── */
const MemeImage = ({ src, tags = [] }) => {
  const label = tags[0] ?? '';
  const fullSrc = src?.startsWith('/api') ? `${API_URL}${src}` : src;

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#111] relative overflow-hidden">
      {fullSrc ? (
        <img src={fullSrc} alt={label} className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="flex flex-col items-center gap-4 text-[#333]">
          <svg width="80" height="80" fill="none" stroke="currentColor" strokeWidth="0.8" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {label && <span className="font-mono text-sm text-[#444]">#{label}</span>}
        </div>
      )}
    </div>
  );
};

/* ── Tasto azione laterale ── */
const ActionBtn = ({ icon, label, active, color = '#fff', onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center gap-1 transition-transform active:scale-90"
    style={{ background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', padding: 0, opacity: disabled ? 0.4 : 1 }}
  >
    <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
      style={{
        background: active ? color + '22' : 'rgba(255,255,255,0.08)',
        border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.15)'}`,
      }}>
      <span style={{ color: active ? color : '#ccc', fontSize: 22 }}>{icon}</span>
    </div>
    <span className="font-mono text-[10px]" style={{ color: active ? color : '#888' }}>{label}</span>
  </button>
);

/* ── Indicatore posizione ── */
const NavIndicator = ({ current, total }) => (
  <div className="flex flex-col gap-1">
    {Array.from({ length: Math.min(total, 7) }).map((_, i) => (
      <div key={i} className="rounded-full transition-all duration-300" style={{
        width: 3,
        height: i === current % 7 ? 20 : 6,
        background: i === current % 7 ? '#7c5cbf' : 'rgba(255,255,255,0.2)',
      }} />
    ))}
  </div>
);

/* ── Pannello commenti ── */
const CommentsPanel = ({ memeId, onClose, onLoginNeeded }) => {
  const { user } = useAuth();
  const { comments, loading, error, posting, postComment } = useComments(memeId);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [comments.length]);

  const submit = async () => {
    if (!user) { onLoginNeeded(); return; }
    if (!text.trim()) return;
    try {
      await postComment(text.trim());
      setText('');
    } catch (_) {}
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{ background: 'rgba(10, 10, 10, 0.98)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
        <span className="font-mono text-sm text-white tracking-widest uppercase">
          Commenti {loading ? '…' : `(${comments.length})`}
        </span>
        <button onClick={onClose} className="text-[#666] hover:text-white transition-colors text-xl leading-none">✕</button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {loading && <p className="text-[#555] font-mono text-sm text-center mt-8">Caricamento…</p>}
        {error   && <p className="text-red-400 font-mono text-xs text-center mt-8">{error}</p>}
        {!loading && !error && comments.length === 0 && (
          <p className="text-[#555] font-mono text-sm text-center mt-8">Nessun commento ancora.<br />Sii il primo!</p>
        )}
        {comments.map((c, i) => {
          const initial = c.author?.[0]?.toUpperCase() ?? '?';
          const hue = (c.author?.charCodeAt(0) * 37) % 360;
          return (
            <div key={c.id ?? i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-mono font-bold"
                style={{ background: `hsl(${hue},60%,32%)`, color: '#fff' }}>
                {initial}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#7c5cbf]">{c.author}</span>
                  <span className="text-[10px] text-[#555] font-mono">
                    {c.createdAt ? new Date(c.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-0.5 leading-snug">{c.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-6 pt-3 border-t border-[#222] flex gap-3">
        {user ? (
          <>
            <input
              className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-[#7c5cbf] transition-colors"
              placeholder="Scrivi un commento…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <button onClick={submit} disabled={posting || !text.trim()}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
              style={{ background: text.trim() && !posting ? '#7c5cbf' : '#222', border: '1.5px solid #333' }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </>
        ) : (
          <button onClick={onLoginNeeded}
            className="flex-1 py-2.5 rounded-full text-sm font-mono text-[#7c5cbf] border border-[#7c5cbf]/40 hover:bg-[#7c5cbf]/10 transition-colors">
            Accedi per commentare
          </button>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   MEME VIEWER
════════════════════════════════════════════ */
export default function MemeViewer({ memes, startIndex = 0, onClose, onLoginNeeded }) {
  const { votes, castVote } = useMemes();
  const { user } = useAuth();

  const [index, setIndex]               = useState(startIndex);
  const [showComments, setShowComments] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [slideDir, setSlideDir]         = useState(null);

  const containerRef = useRef(null);
  const touchStartY  = useRef(null);
  const wheelLocked  = useRef(false);

  const meme = memes[index];
  const vote = votes[meme?.id] ?? { up: meme?.likes ?? 0, down: meme?.dislikes ?? 0, mine: null };

  /* ── Navigazione ── */
  const goTo = useCallback((dir) => {
    if (transitioning) return;
    const next = index + (dir === 'down' ? 1 : -1);
    if (next < 0 || next >= memes.length) return;
    setSlideDir(dir);
    setTransitioning(true);
    setShowComments(false);
    setTimeout(() => {
      setIndex(next);
      setSlideDir(null);
      setTransitioning(false);
    }, 300);
  }, [index, memes.length, transitioning]);

  /* ── Wheel ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      if (wheelLocked.current) return;
      wheelLocked.current = true;
      if (e.deltaY > 30) goTo('down');
      else if (e.deltaY < -30) goTo('up');
      setTimeout(() => { wheelLocked.current = false; }, 650);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [goTo]);

  /* ── Touch ── */
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd   = (e) => {
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) goTo(dy > 0 ? 'down' : 'up');
    touchStartY.current = null;
  };

  /* ── Tastiera ── */
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowDown') goTo('down');
      if (e.key === 'ArrowUp')   goTo('up');
      if (e.key === 'Escape') {
        // Ottimizzato anche per il tasto ESC fisica
        if (showComments) setShowComments(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goTo, onClose, showComments]);

  /* ── Voto ── */
  const handleVote = (type) => {
    if (!user) { onLoginNeeded?.(); return; }
    castVote(meme.id, type);
  };

  // IL FIX CRITICO: Funzione centralizzata per gestire il click-outside in modo condizionale
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (showComments) {
        setShowComments(false); // Chiude solo la chat se è aperta
      } else {
        onClose(); // Chiude tutto il carosello se la chat era già chiusa
      }
    }
  };

  const slideStyle = transitioning
    ? { transform: slideDir === 'down' ? 'translateY(-5%)' : 'translateY(5%)', opacity: 0, transition: 'transform 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s ease' }
    : { transform: 'translateY(0)', opacity: 1, transition: 'transform 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s ease' };

  if (!meme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      ref={containerRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      onClick={handleBackdropClick}>

      {/* Close */}
      <button onClick={onClose}
        className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"
        style={{ background: 'rgba(0,0,0,0.5)', border: '1.5px solid rgba(255,255,255,0.12)' }}>
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Contenuto */}
      <div className="relative w-full h-full flex items-center justify-center" style={slideStyle}
        onClick={handleBackdropClick}>

        {/* Pannello immagine */}
        <div className="relative flex-shrink-0"
          style={{ width: 'min(100vw, calc(100vh * 9 / 16))', height: '100dvh', background: '#111' }}>

          <MemeImage src={meme.src} tags={meme.tags ?? []} />

          {/* Overlay info bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-20 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 55%, transparent)' }}>
            <div className="flex flex-wrap gap-1.5 mb-2 pointer-events-auto">
              {(meme.tags ?? []).map(t => (
                <span key={t} className="text-xs font-mono px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(124,92,191,0.28)', border: '1px solid rgba(124,92,191,0.45)', color: '#c4a8ff' }}>
                  #{t}
                </span>
              ))}
            </div>
            <p className="text-white text-sm font-mono leading-relaxed pointer-events-auto" style={{ maxWidth: 340 }}>
              {meme.description || `Un meme sulla categoria #${(meme.tags ?? [])[0]}.`}
            </p>
          </div>

          {/* Commenti panel */}
          {showComments && (
            <CommentsPanel
              memeId={meme.id}
              onClose={() => setShowComments(false)}
              onLoginNeeded={() => { setShowComments(false); onLoginNeeded?.(); }}
            />
          )}
        </div>

        {/* Sidebar azioni */}
        <div className="absolute flex flex-col items-center gap-5"
          style={{ right: 'max(16px, calc((100vw - min(100vw, calc(100vh*9/16))) / 2 - 72px))', bottom: 120 }}>
          <ActionBtn icon="▲" label={vote.up}   active={vote.mine === 'up'}   color="#4ade80" onClick={() => handleVote('up')} />
          <ActionBtn icon="▼" label={vote.down}  active={vote.mine === 'down'} color="#f87171" onClick={() => handleVote('down')} />
          <ActionBtn icon="💬" label="Chat"       active={showComments}          color="#7c5cbf" onClick={() => setShowComments(v => !v)} />
        </div>

        {/* Indicatore posizione */}
        <div className="absolute flex flex-col items-center gap-3"
          style={{ left: 'max(16px, calc((100vw - min(100vw, calc(100vh*9/16))) / 2 - 28px))', top: '50%', transform: 'translateY(-50%)' }}>
          <NavIndicator current={index} total={memes.length} />
          <span className="font-mono text-[10px] text-[#444]">{index + 1}/{memes.length}</span>
        </div>
      </div>

      {/* Frecce desktop (nascoste se i commenti sono aperti) */}
      {index > 0 && !showComments && (
        <button onClick={() => goTo('up')}
          className="absolute flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 z-40 transition-all"
          style={{ top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.4)', border: '1.5px solid rgba(255,255,255,0.12)' }}>
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
      )}
      {index < memes.length - 1 && !showComments && (
        <button onClick={() => goTo('down')}
          className="absolute flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 z-40 transition-all"
          style={{ bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.4)', border: '1.5px solid rgba(255,255,255,0.12)' }}>
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      )}
    </div>
  );
}