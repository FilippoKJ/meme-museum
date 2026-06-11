import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MemesProvider, useMemes, DEFAULT_FILTERS } from './context/MemesContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { FeaturedMeme, TagSidebar, GridCard } from './components/MemeCards';
import MemeViewer from './components/MemeViewer';
import LoginModal from './components/LoginModal';
import FilterPanel from './components/FilterPanel';
import MemeOfDayModal from './components/MemeOfDayModal';
import UploadModal from './components/UploadModal';
import './index.css';

const SORT_LABELS = {
  date_desc:  '📅 Più recenti',
  date_asc:   '📅 Meno recenti',
  votes_desc: '🔥 Più votati',
  votes_asc:  '💀 Meno votati',
};

/* ── Divider ── */
const HeroDivider = () => (
  <div className="flex items-center justify-center gap-3 py-4 border-t border-border">
    <hr className="flex-1 max-w-[80px] border-[#333]" />
    <svg width="18" height="18" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="6 9 12 15 18 9" />
    </svg>
    <hr className="flex-1 max-w-[80px] border-[#333]" />
  </div>
);

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
    <div className="w-full bg-[#1e1e1e]" style={{ aspectRatio: '4/3' }} />
    <div className="px-3 py-2.5 flex flex-col gap-2">
      <div className="h-3 bg-[#1e1e1e] rounded w-16" />
      <div className="flex justify-between">
        <div className="h-2.5 bg-[#1e1e1e] rounded w-10" />
        <div className="h-2.5 bg-[#1e1e1e] rounded w-14" />
      </div>
    </div>
  </div>
);

/* ── Paginazione ── */
const Pagination = ({ page, totalPages, total, onPage }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm transition-all disabled:opacity-30"
        style={{ background: '#1c1c1c', border: '1px solid #2a2a2a', color: '#aaa' }}
      >←</button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className="w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm transition-all"
          style={{
            background: p === page ? '#7c5cbf' : '#1c1c1c',
            border: `1px solid ${p === page ? '#7c5cbf' : '#2a2a2a'}`,
            color: p === page ? '#fff' : '#888',
          }}
        >{p}</button>
      ))}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm transition-all disabled:opacity-30"
        style={{ background: '#1c1c1c', border: '1px solid #2a2a2a', color: '#aaa' }}
      >→</button>

      <span className="text-xs font-mono text-[#444] ml-2">{total} meme</span>
    </div>
  );
};

/* ── Barra ordinamento rapido ── */
const SortBar = ({ filters, updateFilter, updateFilters, resetFilters }) => {
  const hasFilters =
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.tag    !== DEFAULT_FILTERS.tag    ||
    filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5 w-full">
      
      {/* IL FIX: Stile iniettato per nascondere l'orribile scrollbar orizzontale su mobile senza perdere lo swipe */}
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Sort rapido */}
      <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl p-1 border border-[#222] max-w-full overflow-x-auto hide-scroll">
        {Object.entries(SORT_LABELS).map(([val, label]) => (
          <button
            key={val}
            onClick={() => updateFilter('sortBy', val)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap flex-shrink-0"
            style={{
              background: filters.sortBy === val ? '#7c5cbf' : 'transparent',
              color: filters.sortBy === val ? '#fff' : '#666',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Filtri attivi */}
      <div className="flex flex-wrap items-center gap-2 flex-1 w-full">
        {filters.tag && (
          <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(124,92,191,0.18)', border: '1px solid rgba(124,92,191,0.35)', color: '#c4a8ff' }}>
            #{filters.tag}
            <button onClick={() => updateFilter('tag', '')} className="hover:text-white transition-colors">✕</button>
          </span>
        )}
        {(filters.dateFrom || filters.dateTo) && (
          <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(240,224,64,0.1)', border: '1px solid rgba(240,224,64,0.25)', color: '#f0e040' }}>
            {filters.dateFrom || '…'} → {filters.dateTo || '…'}
            <button onClick={() => updateFilters({ dateFrom: '', dateTo: '' })} className="hover:text-white transition-colors">✕</button>
          </span>
        )}
        {hasFilters && (
          <button onClick={resetFilters}
            className="text-xs font-mono text-[#555] hover:text-[#f87171] transition-colors md:ml-auto">
            Reset filtri
          </button>
        )}
      </div>
      
    </div>
  );
};

/* ════════════════════════════════════════════
   Main content
════════════════════════════════════════════ */
function AppContent() {
  const { memes, loading, error, filters, updateFilter, updateFilters, resetFilters, votes, page, total, totalPages, goToPage } = useMemes();

  const [viewerIndex,   setViewerIndex]   = useState(null);
  const [showLogin,     setShowLogin]     = useState(false);
  const [showFilters,   setShowFilters]   = useState(false);
  const [showMemeOfDay, setShowMemeOfDay] = useState(false);
  const [showUpload,    setShowUpload]    = useState(false);

  const openViewer = (i) => { setViewerIndex(i); document.body.style.overflow = 'hidden'; };
  const closeViewer = ()  => { setViewerIndex(null); document.body.style.overflow = ''; };

  const handleTagClick = (tag) => {
    updateFilter('tag', tag);
    document.getElementById('meme-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isSearching = !!filters.search?.trim();

  // Funzione dinamica per il titolo della griglia
  const getGridTitle = () => {
    if (isSearching) return 'RISULTATI RICERCA';
    switch (filters.sortBy) {
      case 'date_asc':   return 'MEME MENO RECENTI';
      case 'votes_desc': return 'MEME PIÙ VOTATI';
      case 'votes_asc':  return 'MEME MENO VOTATI';
      case 'date_desc':
      default:           return 'ULTIMI MEME';
    }
  };

  return (
    <div className="grain min-h-screen bg-bg">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onFilterClick={() => setShowFilters(true)}
        onMemeOfDay={() => setShowMemeOfDay(true)}
        onUploadClick={() => setShowUpload(true)}
      />

      <Hero />
      <HeroDivider />

      {/* Sezione Featured + TagSidebar */}
      {!isSearching && (
        <main className="max-w-[1440px] mx-auto px-6 py-7 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-7">
          {loading
            ? <div className="bg-card border border-border rounded-xl animate-pulse" style={{ aspectRatio: '16/10' }} />
            : <FeaturedMeme
                src={memes[0]?.src ?? null}
                tags={memes[0]?.tags ?? []}
                onClick={() => openViewer(0)}
              />
          }
          <TagSidebar
            tags={memes[0]?.tags ?? []}
            activeTag={filters.tag}
            onTagClick={handleTagClick}
          />
        </main>
      )}

      {/* Griglia meme */}
      <section id="meme-grid" className="max-w-[1440px] mx-auto px-6 pb-20" style={{ paddingTop: isSearching ? '2rem' : '0' }}>
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="font-bebas text-4xl tracking-wider text-white uppercase">
            {getGridTitle()}
          </h2>
          {!loading && filters.tag && (
            <span className="font-bebas text-2xl text-[#7c5cbf] tracking-wide">#{filters.tag}</span>
          )}
        </div>

        <SortBar filters={filters} updateFilter={updateFilter} updateFilters={updateFilters} resetFilters={resetFilters} />

        {error && (
          <div className="text-center font-mono text-sm py-10">
            <p className="text-red-400 mb-3">{error}</p>
            <button onClick={() => window.location.reload()} className="text-[#7c5cbf] hover:underline text-xs">Riprova</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : memes.map((meme, i) => (
                <GridCard
                  key={meme.id}
                  tags={meme.tags}
                  upvotes={votes[meme.id]?.up ?? meme.likes}
                  downvotes={votes[meme.id]?.down ?? meme.dislikes}
                  src={meme.src}
                  createdAt={meme.createdAt}
                  onClick={() => openViewer(i)}
                  onTagClick={handleTagClick}
                />
              ))
          }
        </div>

        {!loading && !error && memes.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <span className="text-4xl">🤔</span>
            <p className="text-muted font-mono text-sm">Nessun meme trovato con questi filtri.</p>
            <button onClick={resetFilters}
              className="text-xs font-mono text-[#7c5cbf] hover:underline">Rimuovi filtri</button>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} total={total} onPage={goToPage} />
      </section>

      {/* Viewer */}
      {viewerIndex !== null && memes.length > 0 && (
        <MemeViewer
          memes={memes}
          startIndex={Math.min(viewerIndex, memes.length - 1)}
          onClose={closeViewer}
          onLoginNeeded={() => { closeViewer(); setShowLogin(true); }}
        />
      )}

      {/* Modali */}
      {showFilters   && <FilterPanel onClose={() => setShowFilters(false)} />}
      {showLogin     && <LoginModal  onClose={() => setShowLogin(false)} />}
      {showMemeOfDay && (
        <MemeOfDayModal
          onClose={() => setShowMemeOfDay(false)}
          onLoginNeeded={() => { setShowMemeOfDay(false); setShowLogin(true); }}
        />
      )}
      {/* Modale Upload */}
      {showUpload && (
        <UploadModal 
          onClose={() => setShowUpload(false)} 
          onSuccess={() => window.location.reload()} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MemesProvider>
        <AppContent />
      </MemesProvider>
    </AuthProvider>
  );
}