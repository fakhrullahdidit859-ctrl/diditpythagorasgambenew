/* =========================================================
   IKON & ANIMASI LKPD PROYEK — format sama dengan js/icons.js
   PP.ICONS['lkpd_*'] -> <svg> 64x64. Animasi: kelas .lkpd-float/.lkpd-pop/
   .lkpd-wiggle/.lkpd-pulse/.lkpd-draw. Mati otomatis bila "kurangi gerakan".
   Muat setelah icons.js. PP.LKPD_ANIM.segitiga() -> animasi panduan Foto & Coret.
   ========================================================= */
(function () {
  window.PP = window.PP || {}; PP.ICONS = PP.ICONS || {};
  const O = '#3b2412', S = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const svg = (n, b) => `<svg class="mic mic-lkpd_${n}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${b}</svg>`;
  const I = {
    /* tiga level = tiga topik */
    a: `<path d="M5 54H59" ${S}/><rect x="17" y="7" width="6" height="47" rx="2" fill="#d79b52" ${S}/><path d="M23 9L44 15L23 22Z" fill="#e5484d" ${S}/><path d="M21 22L51 53" stroke="#f7b92b" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="1 5"/><path d="M49 49L54 55H47Z" fill="#a8692f" ${S}/>`,
    b: `<rect x="5" y="16" width="54" height="34" rx="4" fill="#5da84a" ${S}/><path d="M32 17V49" stroke="#fff" stroke-width="2"/><circle cx="32" cy="33" r="6" fill="none" stroke="#fff" stroke-width="2"/><path d="M10 45L54 21" stroke="#ffd34d" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="1 6"/><circle cx="10" cy="45" r="3.5" fill="#e5484d" ${S}/><circle cx="54" cy="21" r="3.5" fill="#e5484d" ${S}/><circle cx="10" cy="21" r="3.5" fill="#2f7bd8" ${S}/>`,
    c: `<rect x="46" y="4" width="13" height="52" fill="#f6dfa6" ${S}/><path d="M4 56H59" ${S}/><path d="M12 56L33 10M24 56L45 10" fill="none" ${S}/><path d="M16 46H28M20 36H32M25 26H37M29 17H41" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path d="M46 14H52M46 34H52" stroke="#e5484d" stroke-width="3.5" stroke-linecap="round"/>`,
    /* enam fase PjBL */
    f1: `<path d="M7 9H57V41H31L19 54V41H7Z" fill="#fff" ${S}/><path d="M25 22C25 13 39 13 39 22C39 28 32 28 32 34" fill="none" stroke="#2f7bd8" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="38" r="2.4" fill="#2f7bd8"/>`,
    f2: `<rect x="9" y="8" width="46" height="50" rx="5" fill="#f8e6ae" ${S}/><rect x="21" y="4" width="22" height="9" rx="3" fill="#a8692f" ${S}/><path d="M17 26H47M17 36H47M17 46H36" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`,
    f3: `<rect x="6" y="11" width="52" height="46" rx="5" fill="#fff" ${S}/><path d="M6 24V16Q6 11 11 11H53Q58 11 58 16V24Z" fill="#e5484d" ${S}/><path d="M18 6V16M46 6V16" ${S}/><circle cx="20" cy="35" r="3" fill="${O}"/><circle cx="32" cy="35" r="3" fill="${O}"/><circle cx="44" cy="35" r="3" fill="#43b33f"/><circle cx="20" cy="47" r="3" fill="${O}"/><circle cx="32" cy="47" r="3" fill="${O}"/>`,
    f4: `<rect x="3" y="22" width="58" height="20" rx="4" fill="#ffd34d" ${S}/><path d="M12 22V32M22 22V30M32 22V34M42 22V30M52 22V32" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`,
    f5: `<rect x="4" y="8" width="56" height="38" rx="5" fill="#8fd0f0" ${S}/><path d="M30 46V54M20 56H44" ${S}/><path d="M16 38L16 18L40 38Z" fill="#ffd36b" ${S}/><path d="M16 33H21V38" fill="none" stroke="${O}" stroke-width="2.5"/>`,
    f6: `<path d="M32 5C20 5 13 14 13 24C13 32 19 36 21 42V47H43V42C45 36 51 32 51 24C51 14 44 5 32 5Z" fill="#ffd34d" ${S}/><path d="M24 53H40M27 59H37" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/><path d="M27 31L32 24L37 31" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`,
    /* lima peran */
    r_ketua: `<path d="M8 46L8 20L21 33L32 12L43 33L56 20L56 46Z" fill="#ffd34d" ${S}/><rect x="8" y="46" width="48" height="9" rx="2" fill="#f7b92b" ${S}/><circle cx="32" cy="35" r="3" fill="#e5484d"/>`,
    r_catat: `<path d="M12 52L10 58L16 56L52 20L44 12Z" fill="#ffd34d" ${S}/><path d="M44 12L52 20L57 15Q59 12 56 9L55 8Q52 5 49 8Z" fill="#e5484d" ${S}/><path d="M12 52L16 56" stroke="${O}" stroke-width="3"/>`,
    r_ukur: `<circle cx="28" cy="32" r="21" fill="#ffd34d" ${S}/><circle cx="28" cy="32" r="9" fill="#fff" ${S}/><path d="M44 46L58 46V54H40" fill="#e5484d" ${S}/>`,
    r_foto: `<rect x="4" y="16" width="56" height="38" rx="7" fill="#7a4ad0" ${S}/><path d="M20 16L24 8H40L44 16" fill="#7a4ad0" ${S}/><circle cx="32" cy="35" r="13" fill="#8fd0f0" ${S}/><circle cx="32" cy="35" r="6" fill="#fff" ${S}/>`,
    r_jubir: `<path d="M8 25H20L44 10V54L20 39H8Z" fill="#f5a83a" ${S}/><path d="M20 39L25 55H32L28 42" fill="#d79b52" ${S}/><path d="M50 22Q56 32 50 42M55 15Q64 32 55 49" fill="none" stroke="#2f7bd8" stroke-width="3" stroke-linecap="round"/>`,
    /* alat */
    foto_coret: `<rect x="14" y="4" width="32" height="56" rx="6" fill="#3d78c4" ${S}/><rect x="19" y="11" width="22" height="34" fill="#fff" ${S}/><path d="M23 40L23 20L37 40Z" fill="#ffd36b" stroke="#e5484d" stroke-width="3" stroke-linejoin="round"/><path d="M36 54L52 24L58 28L42 58Z" fill="#ffd34d" ${S}/>`,
    aman: `<path d="M32 5L60 55H4Z" fill="#ffd34d" ${S}/><path d="M32 22V39" stroke="${O}" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="47" r="3" fill="${O}"/>`,
    centang: `<circle cx="32" cy="32" r="26" fill="#43b33f" ${S}/><path d="M19 33L28 42L46 22" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    cetak: `<rect x="16" y="6" width="32" height="20" fill="#fff" ${S}/><rect x="6" y="24" width="52" height="22" rx="5" fill="#6b7a8f" ${S}/><rect x="16" y="38" width="32" height="20" fill="#fff" ${S}/><path d="M22 46H42M22 52H36" stroke="${O}" stroke-width="2.5" stroke-linecap="round"/>`
  };
  Object.keys(I).forEach(k => { PP.ICONS['lkpd_' + k] = svg(k, I[k]); });
  PP.LKPD_ICON_GROUPS = {
    'Level (topik)': [['a', 'Dasar: tali penyangga tiang'], ['b', 'Menengah: diagonal lapangan'], ['c', 'Mahir: tangga lipat']],
    'Enam fase PjBL': [['f1', '1 Pertanyaan'], ['f2', '2 Rencana'], ['f3', '3 Jadwal'], ['f4', '4 Monitoring'], ['f5', '5 Uji & presentasi'], ['f6', '6 Refleksi']],
    'Peran kelompok': [['r_ketua', 'Ketua'], ['r_catat', 'Pencatat'], ['r_ukur', 'Pengukur'], ['r_foto', 'Fotografer'], ['r_jubir', 'Juru bicara']],
    'Alat & status': [['foto_coret', 'Foto & Coret'], ['aman', 'Keselamatan'], ['centang', 'Selesai/benar'], ['cetak', 'Cetak LKPD']]
  };

  /* ---------- animasi (CSS disisipkan sekali) ---------- */
  if (!document.getElementById('lkpd-anim-css')) {
    const st = document.createElement('style'); st.id = 'lkpd-anim-css';
    st.textContent = `
.lkpd-ic{display:inline-block;width:56px;height:56px;line-height:0}.lkpd-ic svg{width:100%;height:100%}
@keyframes lkpdFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes lkpdPop{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.12);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes lkpdWiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}
@keyframes lkpdPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@keyframes lkpdDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.lkpd-float{animation:lkpdFloat 2.4s ease-in-out infinite}.lkpd-pop{animation:lkpdPop .5s cubic-bezier(.2,1.4,.4,1) both}
.lkpd-wiggle{animation:lkpdWiggle .7s ease-in-out 2}.lkpd-pulse{animation:lkpdPulse 1.2s ease-in-out infinite}
.lkpd-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:lkpdDraw .8s ease forwards}
.lkpd-lbl{opacity:0;animation:lkpdPop .4s ease forwards;transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion:reduce){.lkpd-float,.lkpd-pop,.lkpd-wiggle,.lkpd-pulse{animation:none}.lkpd-draw{animation:none;stroke-dashoffset:0}.lkpd-lbl{animation:none;opacity:1}}`;
    document.head.appendChild(st);
  }
  /* pembungkus ikon: PP.lkpdIcon('f1','lkpd-float') -> HTML */
  PP.lkpdIcon = (n, anim, size) => `<span class="lkpd-ic ${anim || ''}" ${size ? `style="width:${size}px;height:${size}px"` : ''}>${PP.ICONS['lkpd_' + n]}</span>`;
  /* animasi panduan Foto & Coret: foto -> garis tinggi -> alas -> sisi miring -> label.
     tema: 'a' (tiang+tali), 'b' (diagonal), 'c' (tangga). Dipanggil ulang untuk memutar lagi. */
  const L = (d, c, t, w) => `<path d="${d}" pathLength="1" class="lkpd-draw" style="animation-delay:${t}s" fill="none" stroke="${c}" stroke-width="${w || 5}" stroke-linecap="round"/>`;
  const T = (x, y, s, c, t) => `<text x="${x}" y="${y}" class="lkpd-lbl" style="animation-delay:${t}s" font-family="Pixelify Sans,Nunito,sans-serif" font-weight="800" font-size="22" fill="${c}" stroke="#fff" stroke-width="3" paint-order="stroke">${s}</text>`;
  const sc = {
    a: ['t', 'j', 'c'], b: ['l', 'p', 'd'], c: ['a', 'b', 'c']
  };
  PP.LKPD_ANIM = { segitiga(k) {
    const n = sc[k] || sc.a;
    return `<svg viewBox="0 0 320 200" role="img" aria-label="Animasi: menarik garis segitiga pada foto" style="width:100%;height:auto;display:block">
      <defs><clipPath id="lkc"><rect width="320" height="200" rx="14"/></clipPath></defs><g clip-path="url(#lkc)"><rect width="320" height="200" fill="#8fd0f2"/><rect y="140" width="320" height="60" fill="#5da84a"/></g>
      <rect x="70" y="30" width="9" height="115" rx="3" fill="#a8692f"/><path d="M79 32L110 42L79 52Z" fill="#e5484d"/>
      ${L('M74 140V40', '#e5484d', .3)}${L('M74 140H230', '#2f7bd8', 1.2)}${L('M74 40L230 140', '#f7b92b', 2.1, 6)}
      <path d="M74 122H92V140" fill="none" stroke="#3b2412" stroke-width="3" class="lkpd-lbl" style="animation-delay:3s"/>
      ${T(34, 96, n[0], '#c93c34', 3)}${T(146, 168, n[1], '#1f5fb5', 3.2)}${T(168, 78, n[2], '#a36a00', 3.4)}
      <rect x="2" y="2" width="316" height="196" rx="13" fill="none" stroke="#3b2412" stroke-width="4"/></svg>`;
  } };
})();
