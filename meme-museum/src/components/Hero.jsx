import React from 'react';

/* ─────────────────────────────────────────────────────────
   STELLA gialla — Mantenuta in SVG, font Comic Sans.
   Le proporzioni scalano con clamp().
───────────────────────────────────────────────────────── */
const Starburst = () => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[clamp(70px,9vw,130px)] h-[clamp(70px,9vw,130px)] flex-shrink-0 animate-float"
    style={{ display: 'block' }}
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
    <text x="100" y="86"  textAnchor="middle" fontFamily='"Comic Sans MS", "Comic Sans", cursive' fontWeight="700" fontSize="20" fill="#111">The font it</text>
    <text x="100" y="108" textAnchor="middle" fontFamily='"Comic Sans MS", "Comic Sans", cursive' fontWeight="700" fontSize="20" fill="#111">self</text>
    <text x="100" y="130" textAnchor="middle" fontFamily='"Comic Sans MS", "Comic Sans", cursive' fontWeight="700" fontSize="20" fill="#111">is a meme!</text>
  </svg>
);

/* ─────────────────────────────────────────────────────────
   FRECCIA allungata — Punta alla M.
   Tracciato esteso orizzontalmente.
───────────────────────────────────────────────────────── */
const CurvedArrow = () => (
  <svg
    viewBox="0 0 300 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[clamp(100px,15vw,260px)] flex-shrink-0 opacity-85 mt-6"
    style={{ display: 'block' }}
  >
    <path d="M10 20 Q120 -10 280 40" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    <polygon points="270,45 285,45 280,25" fill="white" transform="rotate(-15 280 40)" />
  </svg>
);

/* ─────────────────────────────────────────────────────────
   HERO COMPONENT
───────────────────────────────────────────────────────── */
export default function Hero() {
  const comicFontStyle = { fontFamily: '"Comic Sans MS", "Comic Sans", cursive' };

  return (
    <section className="relative w-full bg-bg select-none overflow-hidden py-[clamp(20px,4vw,50px)] flex flex-col items-center">

      {/* ── RIGA 1: Titolo centrato con Stella e Freccia a sinistra ── */}
      <div className="relative w-full max-w-[1200px] flex items-center justify-center mb-[clamp(10px,2vw,30px)] px-4">

        {/* Contenitore custom gestito dalla media query rigorosa a 1900px in fondo */}
        <div className="absolute left-[clamp(-360px,-25vw,-240px)] top-[-10px] items-start gap-1 stella-freccia-container">
          <Starburst />
          <CurvedArrow />
        </div>

        {/* Titolo Principale */}
        <h1
          className="text-white leading-none text-center z-10 animate-fade-up"
          style={{
            ...comicFontStyle,
            fontSize: 'clamp(40px, 9vw, 130px)',
            fontWeight: 'normal',
            letterSpacing: '2px'
          }}
        >
          MEME MUSEUM
        </h1>
      </div>

      {/* ── RIGA 2: I Personaggi (Immagini PNG) e i Testi ── */}
      <div className="w-full max-w-[1400px] flex items-end justify-between px-[clamp(10px,3vw,40px)] gap-2">

        {/* 1. NPC Sinistra (Occhiali) - ALZATO leggermente */}
        <div className="flex-shrink-0 animate-float -translate-y-[clamp(10px,2vw,30px)]">
          <img
            src="/placeholders/npc-glasses.png"
            alt="NPC Occhiali"
            className="w-[clamp(50px,8vw,110px)] h-auto object-contain"
          />
        </div>

        {/* 2. Chad Sinistra + Testo */}
        <div className="flex items-center gap-[clamp(6px,1.5vw,20px)] flex-shrink-0 animate-float-2 mb-[clamp(5px,1vw,20px)]">
          <img
            src="/placeholders/chad-left.png"
            alt="Chad Sinistra"
            className="w-[clamp(60px,10vw,140px)] h-auto object-contain"
          />
          <span
            className="text-white whitespace-nowrap"
            style={{ ...comicFontStyle, fontSize: 'clamp(10px, 1.4vw, 18px)' }}
          >
            This site is lit.
          </span>
        </div>

        {/* 3. Testo + Chad Destra */}
        <div className="flex items-center gap-[clamp(6px,1.5vw,20px)] flex-shrink-0 animate-float-3 mb-[clamp(5px,1vw,20px)]">
          <span
            className="text-white whitespace-nowrap"
            style={{ ...comicFontStyle, fontSize: 'clamp(10px, 1.4vw, 18px)' }}
          >
            You're right man.
          </span>
          <img
            src="/placeholders/chad-right.png"
            alt="Chad Destra"
            className="w-[clamp(60px,10vw,140px)] h-auto object-contain"
          />
        </div>

        {/* 4. NPC Destra (Punta il dito) - ALZATO leggermente */}
        <div className="flex-shrink-0 animate-float-1 -translate-y-[clamp(10px,2vw,30px)]">
          <img
            src="/placeholders/npc-pointing.png"
            alt="NPC Punta"
            className="w-[clamp(45px,7vw,100px)] h-auto object-contain"
          />
        </div>

      </div>

      {/* Regola CSS per nascondere gli elementi sotto i 1900px */}
      <style>{`
        .stella-freccia-container {
          display: flex;
        }
        @media (max-width: 1900px) {
          .stella-freccia-container {
            display: none !important;
          }
        }
      `}</style>

    </section>
  );
}