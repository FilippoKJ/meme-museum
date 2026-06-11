import React from 'react';

const API_URL = 'http://localhost:4000';

// Funzione helper per risolvere i percorsi delle immagini dal backend
const getImageUrl = (src) => src?.startsWith('/api') ? `${API_URL}${src}` : src;

const ImgPlaceholder = ({ tag }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-muted gap-3">
    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
    {tag && <span className="text-sm font-mono text-[#444]">#{tag}</span>}
  </div>
);

/* ── Featured meme card ── */
export function FeaturedMeme({ src, tags = [], onClick }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up cursor-pointer meme-card-hover" onClick={onClick}>
      <div className="w-full relative bg-[#111]" style={{ paddingTop: '62.5%' }}> {/* 16:10 aspect ratio */}
        {src ? (
          <img src={getImageUrl(src)} alt={tags[0]} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <ImgPlaceholder tag={tags[0]} />
        )}
      </div>
    </div>
  );
}

/* ── Tag sidebar ── */
export function TagSidebar({ tags = [], activeTag = '', onTagClick }) {
  return (
    <aside className="bg-card border border-border rounded-xl p-5 self-start animate-slide-in w-full">
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
export function GridCard({ tags = [], upvotes = 0, downvotes = 0, src, onClick, onTagClick, createdAt }) {
  return (
    <div className="meme-card-hover bg-card border border-border rounded-xl overflow-hidden cursor-pointer flex flex-col h-full w-full">
      
      {/* Area Immagine con altezza fissa e protetta da deformazioni (4:3) */}
      <div className="w-full relative bg-[#111] flex-shrink-0" style={{ paddingTop: '75%' }} onClick={onClick}>
        {src ? (
          <img src={getImageUrl(src)} alt={tags[0]} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted">
            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Info Card: flex-1 costringe questa sezione a riempire tutto lo spazio verticale vuoto */}
      <div className="px-4 py-3 flex flex-col flex-1 gap-2">
        
        {/* Lista Tag */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <button
              key={t}
              onClick={e => { e.stopPropagation(); onTagClick?.(t); }}
              className="text-yellow text-sm font-mono font-bold hover:text-white hover:underline transition-colors"
            >
              #{t}
            </button>
          ))}
        </div>

        {/* Voti + Data: mt-auto spinge questo footer sempre in fondo, allineandolo per tutte le card */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#1c1c1c]">
          
          {/* Nuovo sistema visivo per Upvotes e Downvotes */}
          <div className="flex items-center gap-3">
            <span className="text-[#4ade80] text-[11px] font-mono flex items-center gap-1 opacity-90" title="Upvotes">
              ▲ {upvotes}
            </span>
            <span className="text-[#f87171] text-[11px] font-mono flex items-center gap-1 opacity-90" title="Downvotes">
              ▼ {downvotes}
            </span>
          </div>

          {createdAt && (
            <span className="text-[#555] text-[11px] font-mono">
              {new Date(createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            </span>
          )}
        </div>
        
      </div>
    </div>
  );
}