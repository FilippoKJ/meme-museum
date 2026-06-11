import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMemes } from '../context/MemesContext';

const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FilterIcon = ({ active }) => (
  <svg width="16" height="16" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const Avatar = ({ user }) => (
  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
    style={{ background: `hsl(${(user.username.charCodeAt(0) * 47) % 360}, 55%, 38%)`, color: '#fff' }}>
    {user.username[0].toUpperCase()}
  </div>
);

export default function Navbar({ onLoginClick, onFilterClick, onMemeOfDay, onUploadClick }) {
  const { user, logout }           = useAuth();
  const { filters, updateFilter } = useMemes();
  const [showMenu, setShowMenu]    = useState(false);

  const hasActiveFilters =
    filters.sortBy !== 'date_desc' || filters.dateFrom || filters.dateTo || filters.tag;

  const handleSearchChange = (e) => updateFilter('search', e.target.value);

  return (
    <nav className="sticky top-0 z-40 flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 bg-bg border-b border-border">
      
      {/* ── Search + Filter Bar Unificata ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 max-w-xl bg-[#1c1c1c] border border-[#333] rounded-lg pl-3 pr-1 sm:pl-4 sm:pr-1.5 py-1 sm:py-1.5 transition-colors focus-within:border-[#7c5cbf]">
        <span className="text-muted flex-shrink-0 hidden sm:block"><SearchIcon /></span>
        
        <input
          type="text"
          className="search-input bg-transparent text-sm text-white w-full font-mono placeholder:text-xs sm:placeholder:text-sm"
          placeholder="Cerca meme..."
          value={filters.search}
          onChange={handleSearchChange}
        />
        
        {/* Tasto cancella ricerca */}
        {filters.search && (
          <button onClick={() => updateFilter('search', '')}
            className="text-[#555] hover:text-white transition-colors text-sm leading-none flex-shrink-0 px-1 sm:px-2">✕</button>
        )}

        {/* Divisore verticale */}
        <div className="w-[1px] h-5 bg-[#333] mx-0.5"></div>

        {/* Tasto Filtro incorporato */}
        <button
          onClick={onFilterClick}
          className="w-8 h-8 flex items-center justify-center rounded-md transition-all relative flex-shrink-0 hover:bg-white/5"
          style={{
            color: hasActiveFilters ? '#c4a8ff' : '#888',
          }}
          title="Filtri"
        >
          <FilterIcon active={hasActiveFilters} />
          {hasActiveFilters && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#7c5cbf]" />
          )}
        </button>
      </div>

      <div className="hidden md:block flex-1" />

      {/* ── Meme del giorno ── */}
      <button
        onClick={onMemeOfDay}
        className="flex flex-shrink-0 items-center justify-center bg-accent text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest hover:opacity-80 transition-all active:scale-95"
        title="Meme del giorno"
      >
        <span className="text-sm md:hidden leading-none">🏆</span>
        <span className="hidden md:block">MEME DEL GIORNO</span>
      </button>

      {/* ── Auth / Menu Profilo ── */}
      {user ? (
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Bottone Upload */}
          <button 
            onClick={onUploadClick}
            className="flex items-center justify-center gap-2 bg-[#7c5cbf]/20 text-[#c4a8ff] border border-[#7c5cbf]/40 px-3 sm:px-4 py-2 rounded-lg text-xs font-mono font-bold hover:bg-[#7c5cbf] hover:text-white transition-all flex-shrink-0"
            title="Carica Meme"
          >
            <span className="text-sm leading-none">+</span>
            <span className="hidden sm:block">CARICA</span>
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 bg-[#1c1c1c] border border-[#333] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-[#2a2a2a] transition-colors flex-shrink-0"
              onClick={() => setShowMenu(v => !v)}
            >
              <Avatar user={user} />
              <span className="text-xs font-mono text-white hidden sm:block">{user.username}</span>
              <svg width="12" height="12" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24" className="hidden sm:block">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50 shadow-2xl"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <div className="px-4 py-3 border-b border-[#222]">
                    <p className="text-xs font-mono text-[#888]">Connesso come</p>
                    <p className="text-sm font-mono text-white font-bold truncate">{user.username}</p>
                  </div>
                  <button onClick={() => { logout(); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-mono text-red-400 hover:bg-red-950/30 transition-colors">
                    Esci
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <button onClick={onLoginClick}
          className="flex-shrink-0 bg-accent text-white text-xs font-bold font-mono tracking-widest px-4 sm:px-6 py-2.5 rounded-md hover:opacity-80 transition-all active:scale-95">
          LOGIN
        </button>
      )}
    </nav>
  );
}