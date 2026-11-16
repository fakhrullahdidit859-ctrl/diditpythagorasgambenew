/* Seni vektor Kegiatan Pendahuluan (dibuat dengan kode, gaya sama dengan game): karakter Rafi (peci) & teman berhijab, lentera, bulan sabit, bintang, rehal Al-Qur'an,
   bingkai doa, kilau, serta ikon kesepakatan kelas. Semua fungsi mengembalikan string SVG. Global: PPArt */
(function () {
  'use strict';
  const O = '#3b2412', ST = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`, ST2 = `stroke="${O}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  const SKIN = '#f6cba2', SKIN2 = '#e8a97c', RED = '#d9323a', WH = '#ffffff', WH2 = '#e9eef7';
  let uid = 0;

  /* ---------- karakter ---------- */
  // opsi: sex 'm'|'f'; pose 'stand'|'wave'|'explain'|'pray'|'fold'|'anjali'|'hormat'|'cheer'; talk: mulut bergerak; eyes: 'open'|'closed'
  function char(o) {
    o = Object.assign({ sex: 'm', pose: 'stand', talk: false, eyes: null, cls: '', mus: true, hat: '' }, o);
    const m = o.sex === 'm', sit = /^(pray|fold|anjali)$/.test(o.pose), closed = (o.eyes || (sit ? 'closed' : 'open')) === 'closed';
    const hy = sit ? 8 : 0;                                  // kepala sedikit turun saat duduk
    let s = '';
    // bayangan & alas
    if (sit) s += `<ellipse cx="100" cy="262" rx="82" ry="12" fill="rgba(0,0,0,.2)"/><g class="pa-mat"><path d="M26 250 L174 250 L186 270 L14 270 Z" fill="#1f6f58" ${ST2}/><path d="M34 255 L166 255 L174 266 L26 266 Z" fill="#2c8f72"/><path d="M60 258 H140" stroke="#e8c24a" stroke-width="2.5" stroke-dasharray="6 5"/></g>`;
    else s += `<ellipse cx="100" cy="270" rx="46" ry="8" fill="rgba(0,0,0,.2)"/>`;
    // BADAN
    s += `<g class="pa-body">`;
    if (sit) {
      s += m ? `<path d="M30 236 Q36 214 74 218 H126 Q164 214 170 236 Q150 256 100 254 Q50 256 30 236Z" fill="${RED}" ${ST}/><path d="M64 226 Q100 238 136 226" stroke="#a81f27" stroke-width="3" fill="none"/>`
        : `<path d="M22 246 Q30 206 76 210 H124 Q170 206 178 246 Q140 262 100 260 Q60 262 22 246Z" fill="${RED}" ${ST}/><path d="M56 222 Q100 246 144 222 M80 216 Q100 250 120 216" stroke="#a81f27" stroke-width="2.4" fill="none"/>`;
      s += `<path d="M62 160 Q60 140 80 138 H120 Q140 140 138 160 L142 222 Q100 236 58 222 Z" fill="${WH}" ${ST}/>`;
      if (m) s += `<path d="M92 142 L100 152 L108 142Z" fill="${WH2}" ${ST2}/><path d="M96 150 L104 150 L107 188 L100 196 L93 188Z" fill="${RED}" ${ST2}/><path d="M60 222 Q100 232 140 222 V228 Q100 238 60 228Z" fill="#24262e" ${ST2}/>`;
      else s += `<path d="M118 168 l6 -8 l7 5 l-2 11 l-9 0z" fill="${RED}" stroke="${O}" stroke-width="1.8"/>`;
    } else {
      // kaki
      if (m) s += `<path d="M70 196 H130 V252 H108 V224 H92 V252 H70Z" fill="${RED}" ${ST}/><path d="M66 250 Q64 264 80 264 H98 V252Z M134 250 Q136 264 120 264 H102 V252Z" fill="#26262e" ${ST}/><path d="M68 262 H96 M104 262 H132" stroke="#fff" stroke-width="3" opacity=".85"/>`;
      else s += `<path d="M66 244 Q60 196 78 190 H122 Q140 196 134 244 Q100 252 66 244Z" fill="${RED}" ${ST}/><path d="M84 196 V244 M100 196 V248 M116 196 V244" stroke="#a81f27" stroke-width="2.4"/><path d="M80 246 V258 M120 246 V258" stroke="#fff4e8" stroke-width="9" stroke-linecap="round"/><path d="M72 262 H94 M106 262 H128" stroke="#26262e" stroke-width="9" stroke-linecap="round"/>`;
      s += `<path d="M62 142 Q60 124 80 122 H120 Q140 124 138 142 L134 200 Q100 210 66 200 Z" fill="${WH}" ${ST}/>`;
      if (m) s += `<path d="M92 124 L100 136 L108 124Z" fill="${WH2}" ${ST2}/><path d="M96 134 L104 134 L107 168 L100 178 L93 168Z" fill="${RED}" ${ST2}/><rect x="64" y="194" width="72" height="8" rx="2" fill="#24262e" ${ST2}/><rect x="95" y="195" width="10" height="6" rx="1" fill="#e8c24a"/>`;
      else s += `<path d="M118 150 l6 -8 l7 5 l-2 11 l-9 0z" fill="${RED}" stroke="${O}" stroke-width="1.8"/>`;
      // tas
      s += m ? `<path d="M58 134 Q50 150 56 176 Q62 182 68 174 L66 140Z" fill="#2c60c8" ${ST2}/>` : '';
    }
    s += `</g>`;
    // KEPALA
    const hx = 100, hyy = 92 + hy;
    s += `<g class="pa-head" style="transform-origin:100px ${hyy + 46}px">`;
    if (!m && !o.mus) s += `<path d="M42 ${hyy + 10} Q36 ${hyy - 50} 100 ${hyy - 54} Q164 ${hyy - 50} 158 ${hyy + 10} Q162 ${hyy + 52} 150 ${hyy + 76} L50 ${hyy + 76} Q38 ${hyy + 52} 42 ${hyy + 10}Z" fill="#5a3320" ${ST}/>`;
    if (!m && o.mus) s += `<path d="M40 ${hyy + 6} Q34 ${hyy - 52} 100 ${hyy - 58} Q166 ${hyy - 52} 160 ${hyy + 6} Q164 ${hyy + 60} 150 ${hyy + 86} L50 ${hyy + 86} Q36 ${hyy + 60} 40 ${hyy + 6}Z" fill="${WH}" ${ST}/>`;
    s += `<ellipse cx="${hx}" cy="${hyy + 4}" rx="${m ? 46 : 38}" ry="${m ? 44 : 40}" fill="${SKIN}" ${ST}/>`;
    if (m) {
      s += `<circle cx="55" cy="${hyy + 6}" r="8" fill="${SKIN}" ${ST2}/><circle cx="145" cy="${hyy + 6}" r="8" fill="${SKIN}" ${ST2}/>`;
      s += `<path d="M54 ${hyy - 8} Q58 ${hyy - 44} 100 ${hyy - 48} Q142 ${hyy - 44} 146 ${hyy - 8} Q138 ${hyy - 26} 124 ${hyy - 22} Q116 ${hyy - 34} 104 ${hyy - 24} Q92 ${hyy - 36} 82 ${hyy - 22} Q68 ${hyy - 26} 54 ${hyy - 8}Z" fill="#7a4a2a" ${ST2}/>`;
      if (o.mus) {
        s += `<path d="M58 ${hyy - 30} Q60 ${hyy - 58} 100 ${hyy - 60} Q140 ${hyy - 58} 142 ${hyy - 30} Q100 ${hyy - 40} 58 ${hyy - 30}Z" fill="#1d1d24" ${ST}/><path d="M60 ${hyy - 33} Q100 ${hyy - 43} 140 ${hyy - 33}" stroke="#e8c24a" stroke-width="2.2" fill="none"/>`;
      } else s += `<path d="M54 ${hyy - 4} Q50 ${hyy - 54} 100 ${hyy - 56} Q150 ${hyy - 54} 146 ${hyy - 4} Q134 ${hyy - 30} 100 ${hyy - 26} Q66 ${hyy - 30} 54 ${hyy - 4}Z" fill="#7a4a2a" ${ST}/>`;
    } else {
      if (o.mus) {
        s += `<path d="M62 ${hyy - 18} Q100 ${hyy - 44} 138 ${hyy - 18} Q130 ${hyy - 30} 100 ${hyy - 32} Q70 ${hyy - 30} 62 ${hyy - 18}Z" fill="${WH}"/><path d="M60 ${hyy + 2} Q58 ${hyy - 26} 100 ${hyy - 34} Q142 ${hyy - 26} 140 ${hyy + 2}" fill="none" stroke="${O}" stroke-width="2.4"/>`;
      } else s += `<path d="M60 ${hyy - 2} Q62 ${hyy - 42} 100 ${hyy - 44} Q138 ${hyy - 42} 140 ${hyy - 2} Q122 ${hyy - 26} 100 ${hyy - 22} Q78 ${hyy - 26} 60 ${hyy - 2}Z" fill="#5a3320" ${ST2}/>`;
    }
    // wajah
    const ex = m ? 19 : 16, ey = hyy + 6;
    if (closed) s += `<path d="M${hx - ex - 9} ${ey} Q${hx - ex} ${ey + 8} ${hx - ex + 9} ${ey}" stroke="${O}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M${hx + ex - 9} ${ey} Q${hx + ex} ${ey + 8} ${hx + ex + 9} ${ey}" stroke="${O}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
    else s += `<g class="pa-eyes"><ellipse cx="${hx - ex}" cy="${ey}" rx="7.2" ry="9" fill="#2a1a12"/><ellipse cx="${hx + ex}" cy="${ey}" rx="7.2" ry="9" fill="#2a1a12"/><circle cx="${hx - ex + 2.5}" cy="${ey - 3}" r="2.8" fill="#fff"/><circle cx="${hx + ex + 2.5}" cy="${ey - 3}" r="2.8" fill="#fff"/></g>`;
    s += `<ellipse cx="${hx - ex - 6}" cy="${ey + 14}" rx="7" ry="4.5" fill="#ff9aa0" opacity=".55"/><ellipse cx="${hx + ex + 6}" cy="${ey + 14}" rx="7" ry="4.5" fill="#ff9aa0" opacity=".55"/>`;
    if (o.talk) s += `<g class="pa-mouth"><ellipse cx="${hx}" cy="${ey + 19}" rx="7" ry="5.5" fill="#8a2a2a" ${ST2}/><path d="M${hx - 4} ${ey + 22} Q${hx} ${ey + 25} ${hx + 4} ${ey + 22}" fill="#ff7b86"/></g>`;
    else s += `<path d="M${hx - 8} ${ey + 16} Q${hx} ${ey + 25} ${hx + 8} ${ey + 16}" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    s += `</g>`;
    if (!m && o.mus) s += `<path d="M54 ${hyy + 62} Q100 ${hyy + 104} 146 ${hyy + 62} L156 ${hyy + sit * 0 + 108} Q100 ${hyy + 128} 44 ${hyy + 108}Z" fill="${WH}" ${ST} class="pa-drape"/>`;
    if (o.hat === 'helmet') s = s.replace(/<\/g>$/, `<path d="M52 ${hyy - 20} Q54 ${hyy - 70} 100 ${hyy - 72} Q146 ${hyy - 70} 148 ${hyy - 20}Z" fill="#ffc21a" ${ST}/><rect x="44" y="${hyy - 24}" width="112" height="10" rx="5" fill="#f59e00" ${ST2}/><path d="M100 ${hyy - 70} V${hyy - 26}" stroke="#f59e00" stroke-width="4"/></g>`);
    // LENGAN & TANGAN
    const slv = (d) => `<path d="${d}" fill="${WH}" ${ST}/>`, hand = (x, y, r, rot) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" transform="rotate(${rot} ${x} ${y})" fill="${SKIN}" ${ST2}/>`;
    const sy = sit ? 156 : 138;
    if (o.pose === 'pray') {
      // tangan menengadah di depan dada
      s += `<g class="pa-arms">` + slv(`M64 ${sy} Q40 ${sy + 24} 66 ${sy + 46} L88 ${sy + 36} Q76 ${sy + 20} 80 ${sy + 8}Z`) + slv(`M136 ${sy} Q160 ${sy + 24} 134 ${sy + 46} L112 ${sy + 36} Q124 ${sy + 20} 120 ${sy + 8}Z`)
        + `<path d="M66 ${sy + 36} Q80 ${sy + 56} 98 ${sy + 40} L96 ${sy + 28} Q82 ${sy + 36} 70 ${sy + 24}Z" fill="${SKIN}" ${ST2}/><path d="M134 ${sy + 36} Q120 ${sy + 56} 102 ${sy + 40} L104 ${sy + 28} Q118 ${sy + 36} 130 ${sy + 24}Z" fill="${SKIN}" ${ST2}/><path d="M76 ${sy + 40} l4 -9 M84 ${sy + 43} l4 -10 M124 ${sy + 40} l-4 -9 M116 ${sy + 43} l-4 -10" stroke="${O}" stroke-width="2" stroke-linecap="round"/></g>`;
    } else if (o.pose === 'fold') {
      s += `<g class="pa-arms">` + slv(`M64 ${sy} Q52 ${sy + 34} 86 ${sy + 46} L96 ${sy + 34} Q76 ${sy + 26} 78 ${sy + 8}Z`) + slv(`M136 ${sy} Q148 ${sy + 34} 114 ${sy + 46} L104 ${sy + 34} Q124 ${sy + 26} 122 ${sy + 8}Z`) + `<ellipse cx="100" cy="${sy + 40}" rx="16" ry="11" fill="${SKIN}" ${ST2}/><path d="M88 ${sy + 40} H112 M92 ${sy + 35} H108" stroke="${O}" stroke-width="2" stroke-linecap="round"/></g>`;
    } else if (o.pose === 'anjali') {
      s += `<g class="pa-arms">` + slv(`M64 ${sy} Q54 ${sy + 30} 84 ${sy + 40} L94 ${sy + 28} Q76 ${sy + 22} 78 ${sy + 8}Z`) + slv(`M136 ${sy} Q146 ${sy + 30} 116 ${sy + 40} L106 ${sy + 28} Q124 ${sy + 22} 122 ${sy + 8}Z`) + `<path d="M100 ${sy + 4} Q112 ${sy + 18} 100 ${sy + 44} Q88 ${sy + 18} 100 ${sy + 4}Z" fill="${SKIN}" ${ST2}/><path d="M100 ${sy + 8} V${sy + 40}" stroke="${O}" stroke-width="2"/></g>`;
    } else if (o.pose === 'wave' || o.pose === 'cheer') {
      s += `<g class="pa-armL">` + slv(`M64 ${sy} Q40 ${sy + 30} 52 ${sy + 56} L72 ${sy + 54} Q70 ${sy + 30} 82 ${sy + 12}Z`) + hand(60, sy + 62, 9, 0) + `</g>`
        + `<g class="pa-wave" style="transform-origin:138px ${sy + 6}px">` + slv(`M136 ${sy} Q162 ${sy - 14} 172 ${sy - 46} L152 ${sy - 52} Q146 ${sy - 24} 122 ${sy + 6}Z`) + `<g><ellipse cx="162" cy="${sy - 58}" rx="10" ry="12" fill="${SKIN}" ${ST2}/><path d="M154 ${sy - 66} l-3 -8 M162 ${sy - 69} l0 -9 M170 ${sy - 66} l3 -8" stroke="${O}" stroke-width="3.2" stroke-linecap="round"/></g></g>`;
    } else if (o.pose === 'explain') {
      s += `<g class="pa-armL">` + slv(`M64 ${sy} Q40 ${sy + 30} 52 ${sy + 56} L72 ${sy + 54} Q70 ${sy + 30} 82 ${sy + 12}Z`) + hand(60, sy + 62, 9, 0) + `</g>`
        + `<g class="pa-point" style="transform-origin:138px ${sy + 6}px">` + slv(`M136 ${sy} Q168 ${sy + 6} 186 ${sy + 2} L184 ${sy + 20} Q158 ${sy + 28} 124 ${sy + 14}Z`) + `<ellipse cx="190" cy="${sy + 10}" rx="9" ry="10" fill="${SKIN}" ${ST2}/><path d="M196 ${sy + 6} l12 -4" stroke="${SKIN}" stroke-width="6" stroke-linecap="round"/></g>`;
    } else if (o.pose === 'hormat') {
      s += `<g class="pa-armL">` + slv(`M64 ${sy} Q56 ${sy + 24} 66 ${sy + 50} L86 ${sy + 48} Q82 ${sy + 24} 82 ${sy + 12}Z`) + hand(76, sy + 56, 9, 0) + `</g>`
        + `<g class="pa-hormat">` + slv(`M136 ${sy} Q170 ${sy - 18} 150 ${sy - 50} L128 ${sy - 44} Q142 ${sy - 24} 122 ${sy + 6}Z`) + `<path d="M126 ${sy - 66} H152 V${sy - 46} H126Z" fill="${SKIN}" ${ST2}/></g>`;
    } else { // stand
      s += `<g class="pa-armL">` + slv(`M64 ${sy} Q44 ${sy + 30} 56 ${sy + 56} L76 ${sy + 54} Q74 ${sy + 30} 82 ${sy + 12}Z`) + hand(64, sy + 62, 9, 0) + `</g><g class="pa-armR">` + slv(`M136 ${sy} Q156 ${sy + 30} 144 ${sy + 56} L124 ${sy + 54} Q126 ${sy + 30} 118 ${sy + 12}Z`) + hand(136, sy + 62, 9, 0) + `</g>`;
    }
    return `<svg class="pa-char pa-${o.pose} ${o.cls}" viewBox="0 0 220 285" aria-hidden="true" focusable="false">${s}</svg>`;
  }
  // hijab: gambar ulang urutan agar jilbab menutup bahu (dipanggil sebagai gabungan) — sederhana: tambahkan lapisan jilbab di atas badan namun di bawah lengan
  function charF(o) { return char(Object.assign({ sex: 'f' }, o)); }

  /* ---------- aset dekoratif ---------- */
  const G = '#e8c24a', G2 = '#fff2a8', GR = '#0f6b53', GR2 = '#1b8f6f';
  const lantern = (cls) => `<svg class="pa-art pa-lantern ${cls || ''}" viewBox="0 0 80 140" aria-hidden="true"><path d="M40 4 V18" stroke="${O}" stroke-width="3"/><circle cx="40" cy="6" r="4" fill="${G}" ${ST2}/>
    <path d="M26 22 H54 L60 34 H20Z" fill="${G}" ${ST}/><path d="M20 34 H60 Q66 70 56 104 H24 Q14 70 20 34Z" fill="#ffd45a" ${ST}/><path class="pa-flame" d="M40 52 Q50 68 40 86 Q30 68 40 52Z" fill="#fff7c4" stroke="#ff9d2e" stroke-width="2.4"/>
    <path d="M30 36 V104 M50 36 V104" stroke="${O}" stroke-width="2" opacity=".5"/><path d="M22 104 H58 L52 120 H28Z" fill="${G}" ${ST}/><circle cx="40" cy="128" r="5" fill="${G}" ${ST2}/></svg>`;
  const crescent = (cls) => `<svg class="pa-art pa-crescent ${cls || ''}" viewBox="0 0 90 90" aria-hidden="true"><path d="M58 8 A38 38 0 1 0 82 58 A30 30 0 1 1 58 8Z" fill="${G}" ${ST}/><path d="M28 24 Q22 40 30 56" stroke="${G2}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M70 22 l3 7 7 1 -5 5 1 7 -6 -4 -6 4 1 -7 -5 -5 7 -1z" fill="#fff2a8" ${ST2}/></svg>`;
  const star = (cls) => `<svg class="pa-art pa-star ${cls || ''}" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 4 L37 22 L56 23 L41 35 L46 54 L30 43 L14 54 L19 35 L4 23 L23 22Z" fill="${G}" ${ST}/><path d="M30 12 L34 24 L46 25" stroke="${G2}" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
  const islamicStar = (cls) => `<svg class="pa-art pa-istar ${cls || ''}" viewBox="0 0 80 80" aria-hidden="true"><path d="M40 4 L48 20 L66 14 L60 32 L76 40 L60 48 L66 66 L48 60 L40 76 L32 60 L14 66 L20 48 L4 40 L20 32 L14 14 L32 20Z" fill="${GR2}" ${ST}/><circle cx="40" cy="40" r="14" fill="${G}" ${ST2}/><path d="M40 28 L44 36 L52 40 L44 44 L40 52 L36 44 L28 40 L36 36Z" fill="${G2}" ${ST2}/></svg>`;
  const rehal = (cls) => `<svg class="pa-art pa-rehal ${cls || ''}" viewBox="0 0 140 110" aria-hidden="true"><path d="M20 100 L76 40 L96 56 L40 106Z" fill="#8a5a2b" ${ST}/><path d="M120 100 L64 40 L44 56 L100 106Z" fill="#a46b34" ${ST}/>
    <path d="M26 70 Q70 52 114 70 L110 30 Q70 14 30 30Z" fill="#fff8e6" ${ST}/><path d="M70 22 V62" stroke="${O}" stroke-width="2.4"/><g stroke="${GR2}" stroke-width="2.4" stroke-linecap="round"><path d="M36 36 H62 M36 44 H62 M36 52 H60 M78 36 H104 M78 44 H104 M78 52 H100"/></g></svg>`;
  const mosque = (cls) => `<svg class="pa-art pa-mosque ${cls || ''}" viewBox="0 0 220 140" aria-hidden="true"><path d="M20 130 V54 L28 40 L36 54 V130Z" fill="#f2e3be" ${ST}/><path d="M184 130 V54 L192 40 L200 54 V130Z" fill="#f2e3be" ${ST}/><path d="M24 40 L28 24 L32 40Z" fill="${GR2}" ${ST2}/><path d="M188 40 L192 24 L196 40Z" fill="${GR2}" ${ST2}/>
    <path d="M44 130 V86 H176 V130Z" fill="#f2e3be" ${ST}/><path d="M64 86 Q110 20 156 86Z" fill="${GR2}" ${ST}/><path d="M110 22 V10 M104 16 H116" stroke="${G}" stroke-width="3.2" stroke-linecap="round"/><path d="M96 130 V104 Q110 86 124 104 V130Z" fill="${GR}" ${ST2}/><path d="M56 104 q0 -8 8 -8 q8 0 8 8 v14 h-16z M148 104 q0 -8 8 -8 q8 0 8 8 v14 h-16z" fill="${GR}" ${ST2}/></svg>`;
  const flag = (cls) => `<svg class="pa-art pa-flag ${cls || ''}" viewBox="0 0 120 150" aria-hidden="true"><rect x="12" y="6" width="6" height="140" rx="3" fill="#b8bcc6" ${ST2}/><circle cx="15" cy="6" r="5" fill="${G}" ${ST2}/><g class="pa-flagcloth"><path d="M18 14 Q50 4 70 14 T112 14 V46 Q92 56 70 46 T18 46Z" fill="#e0262e" ${ST2}/><path d="M18 46 Q50 36 70 46 T112 46 V78 Q92 88 70 78 T18 78Z" fill="#ffffff" ${ST2}/></g></svg>`;
  const sparkle = () => `<svg class="pa-art pa-sparkle" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2 Q22 18 38 20 Q22 22 20 38 Q18 22 2 20 Q18 18 20 2Z" fill="${G2}"/><path d="M20 8 Q21 18 32 20 Q21 22 20 32 Q19 22 8 20 Q19 18 20 8Z" fill="#fff"/></svg>`;
  const glow = () => `<svg class="pa-art pa-glow" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="gl${++uid}"><stop offset="0" stop-color="#fff7c4" stop-opacity=".9"/><stop offset=".5" stop-color="#ffe27a" stop-opacity=".35"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="100" fill="url(#gl${uid})"/></svg>`;
  // pola geometris Islami (untuk border / latar)
  const pattern = () => { const id = 'ip' + (++uid); return `<svg class="pa-pattern" width="100%" height="100%" aria-hidden="true"><defs><pattern id="${id}" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M28 2 L35 16 L50 10 L44 24 L54 28 L44 32 L50 46 L35 40 L28 54 L21 40 L6 46 L12 32 L2 28 L12 24 L6 10 L21 16Z" fill="none" stroke="#e8c24a" stroke-width="1.4" opacity=".5"/><circle cx="28" cy="28" r="5" fill="none" stroke="#e8c24a" stroke-width="1.2" opacity=".5"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/></svg>`; };
  // kaligrafi hiasan (teks Arab asli, bukan gambar)
  const kaligrafi = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

  /* ---------- ikon Kesepakatan Kelas (6) ---------- */
  const I = {
    waktu: `<svg viewBox="0 0 120 120" class="ks-svg"><rect x="22" y="14" width="76" height="78" rx="10" fill="#fff8e6" ${ST}/><rect x="22" y="14" width="76" height="20" rx="10" fill="#e5484d" ${ST}/><circle cx="38" cy="14" r="5" fill="#b8bcc6" ${ST2}/><circle cx="82" cy="14" r="5" fill="#b8bcc6" ${ST2}/>
      <g stroke="#cdbb92" stroke-width="2"><path d="M30 46 H90 M30 60 H90 M30 74 H90 M46 38 V86 M60 38 V86 M74 38 V86"/></g><circle cx="86" cy="88" r="28" fill="#fff" ${ST}/><circle cx="86" cy="88" r="22" fill="#e8f3ff" stroke="#3d78c4" stroke-width="3"/>
      <g stroke="${O}" stroke-width="2.4" stroke-linecap="round"><path d="M86 70 V73 M86 103 V106 M68 88 H71 M101 88 H104"/></g><path class="ks-minute" d="M86 88 V73" stroke="${O}" stroke-width="3.4" stroke-linecap="round"/><path class="ks-hour" d="M86 88 L96 92" stroke="#e5484d" stroke-width="4" stroke-linecap="round"/><circle cx="86" cy="88" r="3.4" fill="${O}"/></svg>`,
    belajar: `<svg viewBox="0 0 120 120" class="ks-svg"><rect x="10" y="22" width="100" height="56" rx="6" fill="#2f6f52" ${ST}/><path d="M22 40 H70 M22 52 H58" stroke="#d9f2e4" stroke-width="3" stroke-linecap="round"/><path d="M80 56 L90 36 L100 56Z" fill="none" stroke="#ffe27a" stroke-width="3"/>
      <g class="ks-teach"><circle cx="30" cy="92" r="9" fill="${SKIN}" ${ST2}/><rect x="20" y="100" width="20" height="16" rx="5" fill="#3d78c4" ${ST2}/></g>
      <g><circle cx="62" cy="92" r="9" fill="${SKIN}" ${ST2}/><rect x="52" y="100" width="20" height="16" rx="5" fill="#fff" ${ST2}/></g>
      <g class="ks-raise"><circle cx="94" cy="92" r="9" fill="${SKIN}" ${ST2}/><rect x="84" y="100" width="20" height="16" rx="5" fill="#e5484d" ${ST2}/><path d="M104 102 L110 82" stroke="${SKIN}" stroke-width="7" stroke-linecap="round"/><circle cx="110" cy="80" r="5" fill="${SKIN}" ${ST2}/></g></svg>`,
    hormat: `<svg viewBox="0 0 120 120" class="ks-svg"><path d="M60 110 C20 80 8 56 22 38 C34 24 52 30 60 44 C68 30 86 24 98 38 C112 56 100 80 60 110Z" fill="#ff6b81" ${ST} class="ks-heart"/><path d="M34 42 Q40 36 48 40" stroke="#ffc2cc" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g class="ks-hands"><path d="M30 76 L52 62 L64 72 L48 90Z" fill="#ffd9b8" ${ST2}/><path d="M90 76 L68 62 L56 72 L72 90Z" fill="#ffc79a" ${ST2}/></g><circle cx="96" cy="26" r="16" fill="#fff" ${ST}/><path d="M86 26 H106 M96 16 V36" stroke="#e5484d" stroke-width="4.5" stroke-linecap="round" transform="rotate(45 96 26)"/></svg>`,
    perlengkapan: `<svg viewBox="0 0 120 120" class="ks-svg"><path d="M26 44 Q26 14 60 14 Q94 14 94 44 V100 Q94 108 86 108 H34 Q26 108 26 100Z" fill="#2c60c8" ${ST}/><path d="M38 54 H82 V96 H38Z" fill="#3d78c4" ${ST2}/><path d="M44 60 H76" stroke="#9ec1ff" stroke-width="3" stroke-linecap="round"/><path d="M50 22 Q60 6 70 22" fill="none" stroke="${O}" stroke-width="3.4"/>
      <g class="ks-pencil"><path d="M88 70 L108 40 L116 46 L96 76Z" fill="#ffd34d" ${ST2}/><path d="M88 70 L96 76 L84 80Z" fill="#f6cba2" ${ST2}/><path d="M108 40 L116 46 L112 34Z" fill="#e5484d" ${ST2}/></g><rect x="6" y="84" width="30" height="22" rx="3" fill="#e5484d" ${ST2}/><rect x="10" y="88" width="22" height="14" fill="#fff8e6"/></svg>`,
    bersih: `<svg viewBox="0 0 120 120" class="ks-svg"><g class="ks-broom"><path d="M70 8 L40 84" stroke="#a46b34" stroke-width="7" stroke-linecap="round"/><path d="M26 82 L58 74 L66 108 L18 108Z" fill="#e8c24a" ${ST2}/><path d="M32 86 L28 106 M42 84 L40 106 M52 80 L52 106" stroke="${O}" stroke-width="2"/></g>
      <path d="M78 52 H110 L106 108 H82Z" fill="#6fb2ff" ${ST}/><path d="M74 52 H114" stroke="${O}" stroke-width="4" stroke-linecap="round"/><path d="M86 62 V98 M96 62 V98 M104 62 V98" stroke="#cfe4ff" stroke-width="2.4"/><circle cx="100" cy="46" r="5" fill="#9be36a" ${ST2} class="ks-trash"/></svg>`,
    gawai: `<svg viewBox="0 0 120 120" class="ks-svg"><rect x="36" y="10" width="48" height="92" rx="9" fill="#2a2a34" ${ST}/><rect x="41" y="20" width="38" height="68" rx="3" fill="#6fb2ff"/><path d="M46 34 H74 M46 46 H66 M46 58 H72" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><circle cx="60" cy="95" r="3.4" fill="#8a8a96"/>
      <g class="ks-ban"><circle cx="60" cy="58" r="44" fill="none" stroke="#e5484d" stroke-width="9"/><path d="M28 90 L92 26" stroke="#e5484d" stroke-width="9" stroke-linecap="round"/></g></svg>`
  };

  // ikon menu (kubah masjid + bulan sabit)
  PP.ICONS = PP.ICONS || {};
  PP.ICONS.pendahuluan = `<svg class="mic mic-pendahuluan" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M8 58 V34 H56 V58Z" fill="#f2e3be" ${ST}/><path d="M14 34 Q32 -2 50 34Z" fill="#1b8f6f" ${ST}/><path d="M32 6 V1" stroke="${O}" stroke-width="3" stroke-linecap="round"/><path class="pd-moon" d="M44 6 A6 6 0 1 0 49 13 A4.6 4.6 0 1 1 44 6Z" fill="#ffd34d" stroke="${O}" stroke-width="2"/><path d="M26 58 V46 Q32 38 38 46 V58Z" fill="#0f6b53" stroke="${O}" stroke-width="2.4"/><g class="pd-star"><circle cx="14" cy="46" r="3" fill="#ffd34d" stroke="${O}" stroke-width="2"/><circle cx="50" cy="46" r="3" fill="#ffd34d" stroke="${O}" stroke-width="2"/></g></svg>`;

  window.PPArt = { char, charF, lantern, crescent, star, islamicStar, rehal, mosque, flag, sparkle, glow, pattern, kaligrafi, icons: I, G, GR, GR2, O };
})();
