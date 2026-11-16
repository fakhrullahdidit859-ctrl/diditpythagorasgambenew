/* Dekor vektor (pohon, semak, bunga) yang utuh tidak terpotong + ikon menu baru (Absen, Planning). */
(function () {
  const O = '#3b2412', S = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const sv = (cls, vb, body) => `<svg class="deco ${cls}" viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
  const D = PP.deco = {
    tree(a, b, c) { a = a || '#62c24a'; b = b || '#3f9a3a'; c = c || '#8be26e';
      return sv('dc-tree', '0 0 90 110', `<ellipse cx="45" cy="104" rx="26" ry="5" fill="rgba(0,0,0,.18)"/><path d="M39 104 L41 62 L49 62 L51 104 Z" fill="#8a5a2b" ${S}/>
      <circle cx="26" cy="52" r="20" fill="${b}" ${S}/><circle cx="64" cy="52" r="20" fill="${b}" ${S}/><circle cx="45" cy="34" r="26" fill="${a}" ${S}/><circle cx="45" cy="58" r="22" fill="${a}" ${S}/>
      <ellipse cx="36" cy="26" rx="9" ry="6" fill="${c}" opacity=".85"/><circle cx="55" cy="44" r="3" fill="${c}"/><circle cx="30" cy="54" r="3" fill="${c}"/>`); },
    pine() { return sv('dc-pine', '0 0 80 120', `<ellipse cx="40" cy="114" rx="22" ry="4.5" fill="rgba(0,0,0,.18)"/><rect x="35" y="94" width="10" height="20" fill="#8a5a2b" ${S}/>
      <path d="M40 6 L62 42 H50 L68 72 H54 L74 100 H6 L26 72 H12 L30 42 H18 Z" fill="#2f8f4e" ${S}/><path d="M40 14 L50 34 M40 48 L52 66" stroke="#59c477" stroke-width="3" fill="none" stroke-linecap="round"/>`); },
    bush(a) { a = a || '#4fb04a';
      return sv('dc-bush', '0 0 90 56', `<ellipse cx="45" cy="52" rx="38" ry="4" fill="rgba(0,0,0,.16)"/><circle cx="24" cy="36" r="17" fill="${a}" ${S}/><circle cx="64" cy="36" r="17" fill="${a}" ${S}/><circle cx="44" cy="28" r="21" fill="${a}" ${S}/>
      <circle cx="38" cy="22" r="4" fill="#9be880"/><circle cx="58" cy="34" r="3" fill="#ff7b7b"/><circle cx="26" cy="38" r="3" fill="#ffd34d"/>`); },
    flower(c) { c = c || '#ff7ba8';
      return sv('dc-flower', '0 0 40 50', `<path d="M20 48 V24" stroke="#2f8f4e" stroke-width="4" stroke-linecap="round"/><path d="M20 38 Q10 34 8 28 Q16 28 20 36 M20 40 Q30 36 32 30 Q24 30 20 38" fill="#4fb04a" stroke="${O}" stroke-width="2"/>
      <g fill="${c}" ${S.replace('stroke-width="3"', 'stroke-width="2.2"')}><circle cx="20" cy="10" r="6"/><circle cx="29" cy="18" r="6"/><circle cx="11" cy="18" r="6"/><circle cx="14" cy="26" r="0"/></g><circle cx="20" cy="17" r="5.5" fill="#ffd34d" stroke="${O}" stroke-width="2"/>`); },
    rock() { return sv('dc-rock', '0 0 60 40', `<path d="M6 36 Q4 18 18 12 Q28 4 40 10 Q56 14 54 36 Z" fill="#b8bfc9" ${S}/><path d="M18 20 Q26 14 34 18" stroke="#e5e9ef" stroke-width="3" fill="none" stroke-linecap="round"/>`); }
  };
  const svgi = (name, body) => `<svg class="mic mic-${name}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${body}</svg>`;
  PP.ICONS = PP.ICONS || {};
  PP.ICONS.absen = svgi('absen', `
    <rect x="9" y="10" width="46" height="50" rx="6" fill="#c98b4a" ${S}/><rect x="14" y="16" width="36" height="40" rx="3" fill="#fff8e6" ${S}/>
    <rect x="22" y="5" width="20" height="12" rx="4" fill="#9aa3b5" ${S}/>
    <g class="ab-rows"><path d="M27 28 H46 M27 38 H46 M27 48 H42" stroke="#b9a77a" stroke-width="3" stroke-linecap="round"/></g>
    <path class="ab-tick" d="M17 28 L20 31 L24 25 M17 38 L20 41 L24 35" stroke="#2fa84f" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20.5" cy="48" r="3" fill="#e5484d"/>`);
  PP.ICONS.planning = svgi('planning', `
    <path d="M10 8 H48 Q54 8 54 14 V52 Q54 58 48 58 H10 Z" fill="#3d78c4" ${S}/><path d="M10 8 V58" stroke="${O}" stroke-width="3"/><rect x="14" y="8" width="6" height="50" fill="#2a5a9c"/>
    <path d="M30 17 L40 22 L30 27 L20 22 Z" fill="#fff" ${S}/><path d="M25 25 V31 Q30 34 35 31 V25" fill="#fff" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
    <g class="pl-rows"><rect x="24" y="37" width="6" height="6" rx="1.5" fill="#fff8e6" stroke="${O}" stroke-width="2"/><path d="M33 40 H46" stroke="#fff8e6" stroke-width="3" stroke-linecap="round"/>
    <rect x="24" y="47" width="6" height="6" rx="1.5" fill="#fff8e6" stroke="${O}" stroke-width="2"/><path d="M33 50 H44" stroke="#fff8e6" stroke-width="3" stroke-linecap="round"/></g>
    <path class="pl-tick" d="M25 40 L27 42 L30 37" stroke="#2fa84f" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M44 8 V24 L48 20 L52 24 V8" fill="#ffd34d" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>`);
})();
