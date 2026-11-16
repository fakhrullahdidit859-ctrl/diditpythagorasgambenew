/* =========================================================
   IKON MENU (SVG vektor) — utuh, tajam, konsisten di semua ukuran
   PP.ICONS[nama] -> string <svg>. viewBox 64x64, garis tepi cokelat tua.
   ========================================================= */
(function () {
  const O = '#3b2412', S = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const svg = (name, body) => `<svg class="mic mic-${name}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${body}</svg>`;
  PP.ICONS = {
    tujuan: svg('tujuan', `
      <circle cx="30" cy="34" r="25" fill="#fff" ${S}/><circle cx="30" cy="34" r="18" fill="#e5484d" ${S}/>
      <circle cx="30" cy="34" r="11" fill="#fff" ${S}/><circle cx="30" cy="34" r="4.5" fill="#e5484d" ${S}/>
      <path d="M31 33 L53 11" ${S} fill="none"/><path d="M47 9 L55 9 L55 17 L51 15 L49 13 Z" fill="#ffd34d" ${S}/>`),
    peta: svg('peta', `
      <path d="M5 16 L22 11 L22 51 L5 56 Z" fill="#a8dc78" ${S}/><path d="M22 11 L42 17 L42 57 L22 51 Z" fill="#f8e6ae" ${S}/>
      <path d="M42 17 L59 11 L59 51 L42 57 Z" fill="#8fd0f0" ${S}/>
      <path d="M11 44 Q18 30 28 38 T46 30" fill="none" stroke="#e5484d" stroke-width="3" stroke-dasharray="1 6" stroke-linecap="round"/>
      <path d="M45 22 L53 32 M53 22 L45 32" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/>`),
    materi: svg('materi', `
      <path d="M3 20 L3 53 Q18 47 32 55 Q46 47 61 53 L61 20 Z" fill="#3d78c4" ${S}/>
      <path d="M32 18 Q19 10 6 14 L6 48 Q19 44 32 51 Z" fill="#fff8e6" ${S}/><path d="M32 18 Q45 10 58 14 L58 48 Q45 44 32 51 Z" fill="#fff8e6" ${S}/>
      <path d="M11 22 Q19 20 26 24 M11 30 Q19 28 26 32 M11 38 Q19 36 26 40 M38 24 Q45 20 53 22 M38 32 Q45 28 53 30" fill="none" stroke="#b9a77a" stroke-width="2.4" stroke-linecap="round"/>`),
    video: svg('video', `
      <rect x="5" y="9" width="54" height="38" rx="7" fill="#3a4a8a" ${S}/><rect x="10" y="14" width="44" height="28" rx="3" fill="#86d0ff" stroke="${O}" stroke-width="2"/>
      <path d="M27 20 L27 36 L43 28 Z" fill="#ffd34d" ${S}/><path d="M20 55 H44 M32 47 V55" ${S} fill="none"/>`),
    eksplorasi: svg('eksplorasi', `
      <circle cx="32" cy="32" r="27" fill="#d9a441" ${S}/><circle cx="32" cy="32" r="20" fill="#fff8e6" ${S}/>
      <path d="M32 10 V15 M32 49 V54 M10 32 H15 M49 32 H54" stroke="${O}" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 13 L39 32 L25 32 Z" fill="#e5484d" ${S}/><path d="M32 51 L39 32 L25 32 Z" fill="#5a7fb8" ${S}/><circle cx="32" cy="32" r="3" fill="#ffd34d" stroke="${O}" stroke-width="2"/>`),
    games: svg('games', `
      <path d="M14 18 H50 Q60 18 61 34 Q62 52 52 52 Q46 52 42 44 H22 Q18 52 12 52 Q2 52 3 34 Q4 18 14 18 Z" fill="#7b5cd6" ${S}/>
      <path d="M15 28 H21 V34 H27 V40 H21 V46 H15 V40 H9 V34 H15 Z" transform="translate(0 -4)" fill="#fff" ${S}/>
      <circle cx="44" cy="30" r="4.6" fill="#ffd34d" ${S}/><circle cx="53" cy="36" r="4.6" fill="#ff6b6b" ${S}/>
      <path d="M27 27 H37" stroke="#c9b8ff" stroke-width="3" stroke-linecap="round"/>`),
    kuis: svg('kuis', `
      <path d="M12 7 H52 Q59 7 59 14 V40 Q59 47 52 47 H34 L20 58 L22 47 H12 Q5 47 5 40 V14 Q5 7 12 7 Z" fill="#fff8e6" ${S}/>
      <text x="32" y="38" text-anchor="middle" font-family="Nunito, Arial Rounded MT Bold, sans-serif" font-weight="900" font-size="34" fill="#3d78c4" stroke="${O}" stroke-width="1.6" paint-order="stroke">?</text>`),
    refleksi: svg('refleksi', `
      <path d="M32 6 C19 6 11 15 11 26 C11 34 16 38 20 43 V46 H44 V43 C48 38 53 34 53 26 C53 15 45 6 32 6 Z" fill="#ffe066" ${S}/>
      <path d="M26 37 Q32 27 38 37" fill="none" stroke="#d98a1c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="21" y="46" width="22" height="6" rx="2.5" fill="#b9bccf" ${S}/><rect x="25" y="52" width="14" height="6" rx="3" fill="#8c90a8" ${S}/>
      <path d="M18 14 Q21 11 25 10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`),
    nilai: svg('nilai', `
      <path d="M19 12 H8 Q6 28 20 31 M45 12 H56 Q58 28 44 31" fill="none" ${S}/>
      <path d="M17 6 H47 V24 Q47 38 32 41 Q17 38 17 24 Z" fill="#ffcf3d" ${S}/>
      <path d="M32 13 L35 21 L43 21 L37 26 L39 34 L32 29 L25 34 L27 26 L21 21 L29 21 Z" fill="#fff6c8" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="28" y="41" width="8" height="9" fill="#e0a21f" ${S}/><rect x="18" y="50" width="28" height="9" rx="3" fill="#c07a2a" ${S}/>`)
  };
})();
