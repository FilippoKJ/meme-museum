/**
 * components/FilterPanel.jsx
 * Pannello filtri: ordinamento, intervallo date, reset.
 * Si apre dalla navbar cliccando il bottone filtri.
 */

import React, { useState } from 'react';
import { useMemes, DEFAULT_FILTERS } from '../context/MemesContext';

const SORT_OPTIONS = [
  { value: 'date_desc',  label: '📅 Più recenti prima' },
  { value: 'date_asc',   label: '📅 Meno recenti prima' },
  { value: 'votes_desc', label: '🔥 Più votati' },
  { value: 'votes_asc',  label: '💀 Meno votati' },
];

export default function FilterPanel({ onClose }) {
  const { filters, applyFilters, resetFilters } = useMemes();

  // Stato locale: applica solo quando si clicca "Applica"
  const [local, setLocal] = useState({ ...filters });

  const set = (key, val) => setLocal(p => ({ ...p, [key]: val }));

  const handleApply = () => {
    applyFilters(local);
    onClose();
  };

  const handleReset = () => {
    setLocal({ ...DEFAULT_FILTERS });
    resetFilters();
    onClose();
  };

  const hasChanges =
    local.sortBy   !== DEFAULT_FILTERS.sortBy   ||
    local.dateFrom !== DEFAULT_FILTERS.dateFrom  ||
    local.dateTo   !== DEFAULT_FILTERS.dateTo;

  return (
    <>
      {/* IL FIX: Sfondo super leggero per la GPU senza blur, isolato dal contenuto */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(5, 5, 5, 0.85)' }}
        onClick={onClose}
      />

      {/* Pannello */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 'min(360px, 100vw)',
          background: '#141414',
          borderLeft: '1px solid #2a2a2a',
          animation: 'slideInRight 0.25s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#222]">
          <div>
            <h2 className="font-bebas text-2xl text-white tracking-wider">FILTRI</h2>
            {hasChanges && (
              <span className="text-[10px] font-mono text-[#7c5cbf]">Modifiche non applicate</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#666] hover:text-white hover:bg-white/10 transition-all"
          >✕</button>
        </div>

        {/* Contenuto scrollabile */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-7">

          {/* Ordinamento */}
          <div>
            <label className="text-xs font-mono text-[#888] tracking-widest uppercase mb-3 block">
              Ordina per
            </label>
            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('sortBy', opt.value)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono text-left transition-all"
                  style={{
                    background: local.sortBy === opt.value ? 'rgba(124,92,191,0.18)' : '#1c1c1c',
                    border: `1.5px solid ${local.sortBy === opt.value ? '#7c5cbf' : '#2a2a2a'}`,
                    color: local.sortBy === opt.value ? '#c4a8ff' : '#aaa',
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center"
                    style={{ borderColor: local.sortBy === opt.value ? '#7c5cbf' : '#444' }}
                  >
                    {local.sortBy === opt.value && (
                      <span className="w-2 h-2 rounded-full bg-[#7c5cbf] block" />
                    )}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro per data */}
          <div>
            <label className="text-xs font-mono text-[#888] tracking-widest uppercase mb-3 block">
              Intervallo date
            </label>
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-mono text-[#555] mb-1.5 block">Da</span>
                <input
                  type="date"
                  value={local.dateFrom}
                  max={local.dateTo || undefined}
                  onChange={e => set('dateFrom', e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-[#7c5cbf] transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <span className="text-xs font-mono text-[#555] mb-1.5 block">A</span>
                <input
                  type="date"
                  value={local.dateTo}
                  min={local.dateFrom || undefined}
                  onChange={e => set('dateTo', e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none focus:border-[#7c5cbf] transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {(local.dateFrom || local.dateTo) && (
                <button
                  onClick={() => { set('dateFrom', ''); set('dateTo', ''); }}
                  className="text-xs font-mono text-[#666] hover:text-[#f87171] transition-colors text-left"
                >
                  ✕ Rimuovi intervallo
                </button>
              )}
            </div>
          </div>

          {/* Riepilogo filtri attivi */}
          {hasChanges && (
            <div className="rounded-xl px-4 py-3 text-xs font-mono text-[#888] flex flex-col gap-1"
              style={{ background: '#1a1a1a', border: '1px solid #222' }}>
              <span className="text-[#555] uppercase tracking-widest text-[10px] mb-1">Filtri selezionati</span>
              <span>Ordine: <span className="text-white">{SORT_OPTIONS.find(o => o.value === local.sortBy)?.label}</span></span>
              {local.dateFrom && <span>Da: <span className="text-white">{local.dateFrom}</span></span>}
              {local.dateTo   && <span>A:  <span className="text-white">{local.dateTo}</span></span>}
            </div>
          )}
        </div>

        {/* Footer azioni */}
        <div className="px-6 py-5 border-t border-[#222] flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl text-sm font-mono text-[#666] hover:text-white border border-[#2a2a2a] hover:border-[#444] transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl text-sm font-mono font-bold text-white transition-all active:scale-95"
            style={{ background: '#7c5cbf' }}
          >
            Applica
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}