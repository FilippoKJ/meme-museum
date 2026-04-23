import React from 'react';

const ImgPlaceholder = ({ tag }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1a1a] text-muted gap-3">
    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
    <span className="text-xs font-mono text-[#444]">#{tag}</span>
  </div>
);

/* ── Featured meme card ── */
export function FeaturedMeme({ src, tags = [], onClick }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up cursor-pointer meme-card-hover" onClick={onClick}>
      <div className="w-full" style={{ aspectRatio: '16/10' }}>
        {src ? <img src={src} alt={tags[0]} className="w-full h-full object-cover" /> : <ImgPlaceholder tag={tags[0]} />}
      </div>
    </div>
  );
}

/* ── Tag sidebar ── */
export function TagSidebar({ tags = [], activeTag = '', onTagClick }) {
  return (
    <aside className="bg-card border border-border rounded-xl p-5 self-start animate-slide-in">
      <h3 className="text-xs text-muted tracking-widest uppercase font-mono mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => onTagClick?.(isActive ? '' : tag)}
              className="tag-pill inline-block rounded-full px-3.5 py-1 text-xs font-mono cursor-pointer transition-all"
              style={{
                background: isActive ? '#7c5cbf' : '#222',
                color: isActive ? '#fff' : '#f0e040',
                border: `1px solid ${isActive ? '#7c5cbf' : '#333'}`,
              }}
            >
              #{tag}
            </button>
          );
        })}
      </div>
      {activeTag && (
        <button
          onClick={() => onTagClick?.('')}
          className="mt-3 text-xs font-mono text-[#666] hover:text-[#f87171] transition-colors"
        >
          ✕ Rimuovi filtro tag
        </button>
      )}
    </aside>
  );
}

/* ── Grid card ── */
export function GridCard({ tags = [], likes, src, onClick, onTagClick, createdAt }) {
  return (
    <div className="meme-card-hover bg-card border border-border rounded-xl overflow-hidden cursor-pointer flex flex-col">
      <div className="w-full flex-shrink-0" style={{ aspectRatio: '4/3' }} onClick={onClick}>
        {src ? (
          <img src={src} alt={tags[0]} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] text-muted" onClick={onClick}>
            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-1">
          {tags.map(t => (
            <button
              key={t}
              onClick={e => { e.stopPropagation(); onTagClick?.(t); }}
              className="text-yellow text-[11px] font-mono hover:text-white hover:underline transition-colors"
            >
              #{t}
            </button>
          ))}
        </div>

        {/* Like + data */}
        <div className="flex items-center justify-between">
          <span className="text-muted text-[11px] font-mono flex items-center gap-1">
            <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {likes}
          </span>
          {createdAt && (
            <span className="text-[#444] text-[10px] font-mono">
              {new Date(createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
