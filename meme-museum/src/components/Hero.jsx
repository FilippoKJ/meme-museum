import React from 'react';
import { NpcLeft, NpcRight, ChadHead } from './MemeChars';

/* ─────────────────────────────────────────────────────────
   STELLA gialla — testo SVG inline, completamente statica
───────────────────────────────────────────────────────── */
const Starburst = () => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 'clamp(88px, 11vw, 148px)', height: 'clamp(88px, 11vw, 148px)', flexShrink: 0, display: 'block' }}
  >
    <polygon
      points="
        100,8  113,50 148,26 137,68
        188,68 163,100 188,132 137,132
        148,174 113,150 100,192 87,150
        52,174 63,132 12,132 37,100
        12,68 63,68 52,26 87,50"
      fill="#f0e040" stroke="#c8b800" strokeWidth="2"
    />
    <text x="100" y="86"  textAnchor="middle" fontFamily="'Comic Neue',cursive" fontWeight="700" fontSize="20" fill="#111">The font it</text>
    <text x="100" y="108" textAnchor="middle" fontFamily="'Comic Neue',cursive" fontWeight="700" fontSize="20" fill="#111">self</text>
    <text x="100" y="130" textAnchor="middle" fontFamily="'Comic Neue',cursive" fontWeight="700" fontSize="20" fill="#111">is a meme!</text>
  </svg>
);

/* ─────────────────────────────────────────────────────────
   FRECCIA — parte dalla stella, curva verso il basso-dx
   e punta verso l'NPC con gli occhiali
───────────────────────────────────────────────────────── */
const CurvedArrow = () => (
  <svg
    viewBox="0 0 120 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 'clamp(60px, 8vw, 120px)', flexShrink: 0, opacity: 0.85, display: 'block' }}
  >
    {/* parte da sx-alto, curva verso dx-basso (verso l'NPC) */}
    <path d="M10 10 Q30 10 90 75" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    {/* punta freccia in basso */}
    <polygon points="78,80 100,82 90,62" fill="white" />
  </svg>
);

/* ─────────────────────────────────────────────────────────
   CHAD + bubble a destra in orizzontale
───────────────────────────────────────────────────────── */
const ChadWithBubble = ({ bubble, mirrored = false, animClass = '' }) => {
  const chadW = 'clamp(80px, 10vw, 150px)';
  return (
    <div className={`flex items-center gap-[clamp(6px,1vw,18px)] flex-shrink-0 ${animClass}`}>
      <ChadHead mirrored={mirrored} style={{ width: chadW }} />
      <span
        className="font-comic text-gray-200 whitespace-nowrap"
        style={{ fontSize: 'clamp(9px, 1.1vw, 14px)' }}
      >
        {bubble}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section
      className="w-full bg-bg select-none overflow-hidden"
      style={{ padding: 'clamp(20px, 4vw, 56px) clamp(8px, 2vw, 24px) clamp(12px, 3vw, 40px)' }}
    >
      {/* ── Riga unica, allineata al centro verticale ── */}
      <div
        className="flex items-center w-full"
        style={{ gap: 'clamp(4px, 1.5vw, 20px)' }}
      >

        {/* 1. STELLA */}
        <Starburst />

        {/* 2. FRECCIA → NPC */}
        <CurvedArrow />

        {/* 3. NPC con occhiali (allineato al centro) */}
        <div className="flex-shrink-0 animate-float">
          <NpcLeft style={{ width: 'clamp(55px, 7vw, 110px)' }} />
        </div>

        {/* 4. TITOLO — occupa lo spazio restante */}
        <h1
          className="font-bebas text-white leading-none animate-fade-up flex-shrink min-w-0 text-center"
          style={{
            fontSize: 'clamp(32px, 8.5vw, 118px)',
            fontWeight: 900,
            letterSpacing: '0.02em',
          }}
        >
          MEME MUSEUM
        </h1>

        {/* 5. CHAD sx + bubble "This site is lit." a destra */}
        <ChadWithBubble bubble="This site is lit." animClass="animate-float-2" />

        {/* 6. CHAD dx (specchiato) + bubble "You're right man." a destra */}
        <ChadWithBubble bubble="You're right man." mirrored animClass="animate-float-3" />

        {/* 7. NPC dx (omino bianco che punta il dito) */}
        <div className="flex-shrink-0 animate-float-1">
          <NpcRight style={{ width: 'clamp(44px, 6vw, 90px)' }} />
        </div>
      </div>

      {/* ── RESPONSIVE: sotto 640px collassa in verticale ── */}
      <style>{`
        @media (max-width: 640px) {
          .hero-row { flex-direction: column; align-items: center; }
          .hero-row .chad-bubble { flex-direction: column; align-items: center; }
        }
      `}</style>
    </section>
  );
}
