import React from 'react';

export const NpcLeft = ({ className = '', style }) => (
  <svg className={className} style={style} viewBox="0 0 90 130" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="45" cy="42" rx="28" ry="35" fill="#e8d5b0" stroke="#333" strokeWidth="2" />
    {/* glasses */}
    <rect x="24" y="30" width="16" height="12" rx="2" fill="none" stroke="#333" strokeWidth="1.5" />
    <rect x="50" y="30" width="16" height="12" rx="2" fill="none" stroke="#333" strokeWidth="1.5" />
    <line x1="40" y1="36" x2="50" y2="36" stroke="#333" strokeWidth="1.5" />
    {/* pupils */}
    <circle cx="32" cy="36" r="3" fill="#333" />
    <circle cx="58" cy="36" r="3" fill="#333" />
    {/* mouth open */}
    <ellipse cx="45" cy="57" rx="9" ry="6" fill="#222" stroke="#333" strokeWidth="1.5" />
    {/* body */}
    <rect x="18" y="75" width="54" height="50" rx="5" fill="#444" stroke="#333" strokeWidth="1.5" />
    {/* ear stems */}
    <line x1="17" y1="36" x2="24" y2="36" stroke="#e8d5b0" strokeWidth="6" strokeLinecap="round" />
    <line x1="73" y1="36" x2="66" y2="36" stroke="#e8d5b0" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

export const NpcRight = ({ className = '', style }) => (
  <svg className={className} style={{ transform: 'scaleX(-1)', ...style }} viewBox="0 0 90 130" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="45" cy="40" rx="26" ry="32" fill="#f0efeb" stroke="#333" strokeWidth="2" />
    {/* eyes open wide */}
    <circle cx="33" cy="36" r="6" fill="#fff" stroke="#333" strokeWidth="1.5" />
    <circle cx="57" cy="36" r="6" fill="#fff" stroke="#333" strokeWidth="1.5" />
    <circle cx="33" cy="37" r="3" fill="#333" />
    <circle cx="57" cy="37" r="3" fill="#333" />
    {/* mouth */}
    <ellipse cx="45" cy="52" rx="7" ry="4" fill="#bbb" stroke="#333" strokeWidth="1.5" />
    {/* body */}
    <rect x="20" y="70" width="50" height="55" rx="4" fill="#fff" stroke="#333" strokeWidth="1.5" />
  </svg>
);

export const ChadHead = ({ className = '', mirrored = false, style }) => (
  <svg
    className={className}
    style={{ ...(mirrored ? { transform: 'scaleX(-1)' } : {}), ...style }}
    viewBox="0 0 130 190"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* neck / body */}
    <rect x="18" y="108" width="94" height="80" rx="6" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
    {/* arms */}
    <path d="M20 115 Q8 145 12 178" stroke="#e8c99a" strokeWidth="20" strokeLinecap="round" fill="none" />
    <path d="M110 115 Q122 145 118 178" stroke="#e8c99a" strokeWidth="20" strokeLinecap="round" fill="none" />
    {/* head */}
    <ellipse cx="65" cy="62" rx="42" ry="52" fill="#e8c99a" stroke="#333" strokeWidth="2" />
    {/* jaw chin definition */}
    <path d="M30 85 Q65 108 100 85" fill="#d4b080" opacity="0.5" />
    {/* beard */}
    <path d="M28 72 Q22 100 30 112 Q65 125 100 112 Q108 100 102 72" fill="#c8a060" stroke="#b08840" strokeWidth="1" />
    <path d="M28 72 Q65 58 102 72" fill="#e8c99a" />
    {/* hair */}
    <path d="M26 42 Q65 10 104 42 Q98 20 65 15 Q32 20 26 42" fill="#c8a060" stroke="#a07030" strokeWidth="1.5" />
    {/* eyes */}
    <ellipse cx="48" cy="52" rx="9" ry="7" fill="#fff" stroke="#333" strokeWidth="1.5" />
    <ellipse cx="82" cy="52" rx="9" ry="7" fill="#fff" stroke="#333" strokeWidth="1.5" />
    <ellipse cx="48" cy="53" rx="4.5" ry="4.5" fill="#5a3a1a" />
    <ellipse cx="82" cy="53" rx="4.5" ry="4.5" fill="#5a3a1a" />
    {/* eyebrows strong */}
    <path d="M38 43 Q48 38 58 43" stroke="#8a6020" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M72 43 Q82 38 92 43" stroke="#8a6020" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* nose */}
    <path d="M60 60 Q56 72 60 78 Q65 82 70 78 Q74 72 70 60" fill="#d4a870" stroke="#b08040" strokeWidth="1" />
    {/* mouth smirk */}
    <path d="M48 92 Q65 102 82 92" stroke="#8a5020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* ear sides */}
    <ellipse cx="22" cy="62" rx="8" ry="12" fill="#e8c99a" stroke="#333" strokeWidth="1.5" />
    <ellipse cx="108" cy="62" rx="8" ry="12" fill="#e8c99a" stroke="#333" strokeWidth="1.5" />
  </svg>
);
