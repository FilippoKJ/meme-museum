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

export default function Navbar({ onLoginClick, onFilterClick, onMemeOfDay }) {
  const { user, logout }           = useAuth();
  const { filters, updateFilter, resetFilters } = useMemes();
  const [showMenu, setShowMenu]    = useState(false);

  const hasActiveFilters =
    filters.sortBy !== 'date_desc' || filters.dateFrom || filters.dateTo || filters.tag;

  const handleSearchChange = (e) => updateFilter('search', e.target.value);

  return (
    <nav className="sticky top-0 z-40 flex items-center gap-3 px-6 py-3 bg-bg border-b border-border">
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-xl bg-[#1c1c1c] border border-[#333] rounded-lg px-4 py-2.5 transition-colors focus-within:border-[#7c5cbf]">
        <span className="text-muted flex-shrink-0"><SearchIcon /></span>
        <input
          type="text"
          className="search-input bg-transparent text-sm text-white w-full font-mono"
          placeholder="Wanna see something intense?"
          value={filters.search}
          onChange={handleSearchChange}
        />
        {filters.search && (
          <button onClick={() => updateFilter('search', '')}
            className="text-[#555] hover:text-white transition-colors text-sm leading-none flex-shrink-0">✕</button>
        )}
      </div>

      {/* Filter button */}
      <button
        onClick={onFilterClick}
        className="w-10 h-10 grid place-items-center rounded-lg transition-all relative"
        style={{
          background: hasActiveFilters ? 'rgba(124,92,191,0.2)' : '#1c1c1c',
          border: `1.5px solid ${hasActiveFilters ? '#7c5cbf' : '#333'}`,
          color: hasActiveFilters ? '#c4a8ff' : '#fff',
        }}
        title="Filtri"
      >
        <FilterIcon active={hasActiveFilters} />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7c5cbf] border-2 border-bg" />
        )}
      </button>

      <div className="flex-1" />

      {/* Meme del giorno */}
      <button
        onClick={onMemeOfDay}
        className="bg-accent text-white text-xs font-bold font-mono tracking-widest px-5 py-2.5 rounded-md hover:opacity-80 transition-all hover:-translate-y-px active:translate-y-0 hidden sm:block"
      >
        MEME DEL GIORNO
      </button>
      {/* versione icon su mobile */}
      <button
        onClick={onMemeOfDay}
        className="w-10 h-10 grid place-items-center bg-accent rounded-lg text-white sm:hidden"
        title="Meme del giorno"
      >🏆</button>

      {/* Auth */}
      {user ? (
        <div className="relative">
          <button
            className="flex items-center gap-2 bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-2 hover:bg-[#2a2a2a] transition-colors"
            onClick={() => setShowMenu(v => !v)}
          >
            <Avatar user={user} />
            <span className="text-xs font-mono text-white hidden sm:block">{user.username}</span>
            <svg width="12" height="12" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-50"
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
      ) : (
        <button onClick={onLoginClick}
          className="bg-accent text-white text-xs font-bold font-mono tracking-widest px-6 py-2.5 rounded-md hover:opacity-80 transition-all hover:-translate-y-px active:translate-y-0">
          LOGIN
        </button>
      )}
    </nav>
  );
}
