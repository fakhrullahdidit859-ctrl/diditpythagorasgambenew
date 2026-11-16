/* =========================================================
   ISI BUKU DIGITAL — "Bangun Datar & Teorema Pythagoras"
   Semua gambar berupa SVG yang dihitung lewat kode (tanpa berkas gambar) sehingga ringan dan tajam di layar apa pun.
   Tiap halaman: { sec:'bd'|'py'|..., t:'judul', html:'...' }  ·  cover:1 = sampul (tanpa nomor)
   Untuk mengganti/menambah halaman, edit larik `pages` di bagian bawah berkas ini.
   ========================================================= */
(function () {
  const INK = '#2b2118', BR = '#7a3b12', BL = '#2f6fe0', GR = '#2a9d5c', RD = '#d94a4a', GD = '#e8a317', PAPER = '#fbf3df';

  /* ---------- gambar SVG ---------- */
  const T = (x, y, t, o) => `<text x="${x}" y="${y}" text-anchor="${(o && o.a) || 'middle'}" font-size="${(o && o.s) || 13}" font-weight="${(o && o.w) || 700}" fill="${(o && o.c) || INK}" font-family="Georgia,serif" ${o && o.i ? 'font-style="italic"' : ''}>${t}</text>`;
  const poly = (pts, fill, st) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}" stroke="${st || INK}" stroke-width="2" stroke-linejoin="round"/>`;
  const rightMark = (x, y, dx, dy, s) => `<path d="M${x + dx * s},${y} L${x + dx * s},${y + dy * s} L${x},${y + dy * s}" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
  const svg = (vb, body, alt) => `<svg viewBox="${vb}" role="img" aria-label="${alt}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

  const figTri = (la, lb, lc) => svg('0 0 230 190',
    poly([[34, 150], [34, 28], [196, 150]], '#fde8b8') + rightMark(34, 150, 1, -1, 14) +
    T(18, 92, la || 'a', { i: 1, s: 17, c: RD }) + T(115, 172, lb || 'b', { i: 1, s: 17, c: BL }) + T(124, 80, lc || 'c', { i: 1, s: 17, c: GR }) +
    T(34, 20, 'A', { s: 12, c: BR }) + T(205, 160, 'B', { s: 12, c: BR }) + T(22, 162, 'C', { s: 12, c: BR }),
    'Segitiga siku-siku dengan sisi tegak a dan b serta sisi miring c');

  const figSquares = () => {
    const u = 18, rx = 3 * u + 10, ry = 7 * u + 10, R = [rx, ry], V = [rx, ry - 3 * u], H = [rx + 4 * u, ry];
    const sa = [R, V, [V[0] - 3 * u, V[1]], [R[0] - 3 * u, R[1]]], sb = [R, H, [H[0], H[1] + 4 * u], [R[0], R[1] + 4 * u]], sc = [V, H, [H[0] + 3 * u, H[1] - 4 * u], [V[0] + 3 * u, V[1] - 4 * u]];
    const grid = (sq, n, m, c) => { let g = ''; const [p0, p1, , p3] = sq; for (let i = 1; i < n; i++) g += `<line x1="${p0[0] + (p1[0] - p0[0]) * i / n}" y1="${p0[1] + (p1[1] - p0[1]) * i / n}" x2="${p3[0] + (p1[0] - p0[0]) * i / n}" y2="${p3[1] + (p1[1] - p0[1]) * i / n}" stroke="${c}" stroke-width=".8" opacity=".6"/>`; for (let j = 1; j < m; j++) g += `<line x1="${p0[0] + (p3[0] - p0[0]) * j / m}" y1="${p0[1] + (p3[1] - p0[1]) * j / m}" x2="${p1[0] + (p3[0] - p0[0]) * j / m}" y2="${p1[1] + (p3[1] - p0[1]) * j / m}" stroke="${c}" stroke-width=".8" opacity=".6"/>`; return g; };
    return svg('0 0 200 220',
      poly(sa, '#f8c9c9') + grid(sa, 3, 3, RD) + poly(sb, '#c9dcf8') + grid(sb, 4, 4, BL) + poly(sc, '#c8ecd6') + grid(sc, 5, 5, GR) + poly([R, V, H], '#fde8b8') +
      T(R[0] - 27, R[1] - 22, 'a²=9', { s: 12, c: RD }) + T(R[0] + 36, R[1] + 40, 'b²=16', { s: 13, c: BL }) + T((V[0] + H[0]) / 2 + 13, (V[1] + H[1]) / 2 - 32, 'c²=25', { s: 14, c: GR }) +
      rightMark(R[0], R[1], 1, -1, 8), 'Persegi pada ketiga sisi segitiga 3, 4, 5: luasnya 9, 16, dan 25');
  };

  const figProof = () => {
    const u = 24, a = 3 * u, b = 4 * u, S = 7 * u, o = 12;
    const P = (x, y) => [o + x, o + y];
    return svg('0 0 192 192',
      `<rect x="${o}" y="${o}" width="${S}" height="${S}" fill="#fff" stroke="${INK}" stroke-width="2"/>` +
      poly([P(0, 0), P(a, 0), P(0, b)], '#fde8b8') + poly([P(a, 0), P(S, 0), P(S, a)], '#fde8b8') + poly([P(S, a), P(S, S), P(b, S)], '#fde8b8') + poly([P(0, b), P(b, S), P(0, S)], '#fde8b8') +
      poly([P(a, 0), P(S, a), P(b, S), P(0, b)], '#c8ecd6', GR) +
      T(o + a / 2, o - 1 + 0, '', {}) + T(o + a / 2, o + 11, 'a', { i: 1, c: RD }) + T(o + a + b / 2, o + 11, 'b', { i: 1, c: BL }) + T(o + S - 8, o + a / 2 + 4, 'a', { i: 1, c: RD }) + T(o + S - 8, o + a + b / 2, 'b', { i: 1, c: BL }) +
      T(o + S / 2, o + S / 2 + 6, 'c²', { s: 20, c: GR, i: 1 }), 'Persegi besar bersisi a+b berisi empat segitiga dan satu persegi miring bersisi c');
  };
  const figLadder = () => svg('0 0 230 190',
    `<rect x="190" y="14" width="14" height="150" fill="#c9a574" stroke="${INK}" stroke-width="2"/><line x1="10" y1="164" x2="225" y2="164" stroke="${INK}" stroke-width="3"/>` +
    `<line x1="52" y1="164" x2="190" y2="44" stroke="${BR}" stroke-width="6" stroke-linecap="round"/><line x1="52" y1="164" x2="190" y2="44" stroke="#e9c58a" stroke-width="2.5" stroke-dasharray="6 6"/>` +
    rightMark(190, 164, -1, -1, 12) + T(121, 177, '6 m', { c: BL, s: 14 }) + T(178, 108, '? m', { a: 'end', c: RD, s: 15 }) + T(105, 92, 'tangga 10 m', { c: GR, s: 13 }), 'Tangga 10 meter bersandar pada tembok, kakinya 6 meter dari tembok');
  const figRect = () => svg('0 0 230 130',
    `<rect x="20" y="16" width="190" height="80" fill="#fde8b8" stroke="${INK}" stroke-width="2"/><line x1="20" y1="96" x2="210" y2="16" stroke="${GR}" stroke-width="3"/>` +
    T(115, 114, '12', { c: BL, s: 15 }) + T(12, 60, '5', { c: RD, s: 15 }) + T(133, 48, '13', { c: GR, s: 15 }) + rightMark(20, 96, 1, -1, 12), 'Persegi panjang 12 kali 5 dengan diagonal 13');
  const figSpecial = () => svg('0 0 250 140',
    poly([[14, 118], [14, 22], [110, 118]], '#fde8b8') + rightMark(14, 118, 1, -1, 11) + T(7, 74, 's', { a: 'end', i: 1, c: RD }) + T(62, 134, 's', { i: 1, c: BL }) + T(70, 62, 's√2', { c: GR, s: 12 }) + T(34, 106, '45°', { s: 9 }) +
    poly([[150, 118], [150, 28], [228, 118]], '#fde8b8') + rightMark(150, 118, 1, -1, 11) + T(143, 78, 's', { a: 'end', i: 1, c: RD }) + T(190, 134, 's√3', { c: BL }) + T(204, 62, '2s', { c: GR }) + T(170, 108, '60°', { s: 9 }) + T(158, 48, '30°', { s: 9 }),
    'Segitiga 45-45-90 dengan sisi s, s, s akar 2, dan segitiga 30-60-90 dengan sisi s, s akar 3, 2s');
  const figTri6 = () => figTri('6', '8', '10');
  const figTri7 = () => figTri('b = ?', '5', '13').replace('>b = ?<', '>?<');


  const eq = t => `<div class="fb-eq">${t}</div>`;
  const note = (ic, t) => `<div class="fb-note"><span>${ic}</span><div>${t}</div></div>`;
  const pgNo = n => `<span class="pn">${n}</span>`;


  const QS_PY = [
    { q: 'Sisi tegak 9 cm dan 12 cm. Berapa panjang sisi miringnya?', k: 'num', a: 15, u: 'cm' },
    { q: 'Sisi miring 25 cm, satu sisi tegak 7 cm. Berapa sisi tegak lainnya?', k: 'num', a: 24, u: 'cm' },
    { q: 'Apakah 9, 40, 41 membentuk tripel Pythagoras?', k: 'sel', a: 'Ya', o: ['Ya', 'Bukan'] },
    { q: 'Layar berbentuk persegi panjang 24 cm × 10 cm. Berapa panjang diagonalnya?', k: 'num', a: 26, u: 'cm' },
    { q: 'Segitiga bersisi 8, 10, 12 termasuk segitiga…', k: 'sel', a: 'Lancip', o: ['Siku-siku', 'Lancip', 'Tumpul'] }
  ];

  /* ---------- gambar bangun datar ---------- */
  const dash = (x1, y1, x2, y2, c) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || INK}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
  const figPersegi = () => svg('0 0 230 190',
    `<rect x="55" y="22" width="120" height="120" fill="#c9dcf8" stroke="${INK}" stroke-width="2"/>` + dash(55, 142, 175, 22, GR) + rightMark(55, 142, 1, -1, 12) +
    T(115, 162, 's', { i: 1, c: BL, s: 17 }) + T(42, 86, 's', { i: 1, c: BL, s: 17 }) + T(130, 70, 's√2', { c: GR, s: 13 }),
    'Persegi dengan sisi s dan diagonal s akar 2');
  const figPP = () => svg('0 0 230 190',
    `<rect x="25" y="32" width="180" height="100" fill="#f8c9c9" stroke="${INK}" stroke-width="2"/>` + dash(25, 132, 205, 32, GR) + rightMark(25, 132, 1, -1, 12) +
    T(115, 152, 'p', { i: 1, c: BL, s: 17 }) + T(12, 86, 'l', { i: 1, c: RD, s: 17 }) + T(120, 76, 'd', { i: 1, c: GR, s: 15 }),
    'Persegi panjang dengan panjang p, lebar l, dan diagonal d');
  const figSegitiga = () => svg('0 0 230 190',
    poly([[25, 140], [205, 140], [150, 28]], '#fde8b8') + dash(150, 28, 150, 140, RD) + rightMark(150, 140, -1, -1, 11) +
    T(115, 160, 'alas (a)', { c: BL, s: 14 }) + T(160, 88, 't', { i: 1, c: RD, s: 17, a: 'start' }),
    'Segitiga dengan alas a dan tinggi t');
  const figJG = () => svg('0 0 230 190',
    poly([[20, 140], [170, 140], [210, 40], [60, 40]], '#c8ecd6') + dash(60, 40, 60, 140, RD) + rightMark(60, 140, 1, -1, 11) +
    T(95, 160, 'a (alas)', { c: BL, s: 14 }) + T(49, 92, 't', { i: 1, c: RD, s: 16, a: 'end' }) + T(204, 98, 'b', { i: 1, c: GR, s: 16, a: 'start' }),
    'Jajar genjang dengan alas a, sisi miring b, dan tinggi t');
  const figTrap = () => svg('0 0 230 190',
    poly([[22, 140], [208, 140], [160, 36], [70, 36]], '#fff1c2') + dash(70, 36, 70, 140, RD) + rightMark(70, 140, 1, -1, 11) +
    T(115, 28, 'a', { i: 1, c: BL, s: 16 }) + T(115, 160, 'b', { i: 1, c: BL, s: 16 }) + T(60, 92, 't', { i: 1, c: RD, s: 16, a: 'end' }),
    'Trapesium dengan sisi sejajar a dan b serta tinggi t');
  const figBK = () => svg('0 0 230 190',
    poly([[115, 14], [200, 90], [115, 166], [30, 90]], '#f8c9c9') + dash(115, 14, 115, 166, BL) + dash(30, 90, 200, 90, GR) + rightMark(115, 90, 1, -1, 10) +
    T(124, 56, 'd₁', { i: 1, c: BL, s: 15, a: 'start' }) + T(70, 84, 'd₂', { i: 1, c: GR, s: 15 }) + T(172, 46, 's', { i: 1, c: RD, s: 16 }),
    'Belah ketupat dengan diagonal d1 dan d2 serta sisi s');
  const figLL = () => svg('0 0 230 190',
    poly([[115, 12], [195, 62], [115, 164], [35, 62]], '#e3d3f7') + dash(115, 12, 115, 164, BL) + dash(35, 62, 195, 62, GR) + rightMark(115, 62, 1, -1, 10) +
    T(124, 118, 'd₁', { i: 1, c: BL, s: 15, a: 'start' }) + T(75, 56, 'd₂', { i: 1, c: GR, s: 15 }) + T(168, 30, 'a', { i: 1, c: RD, s: 15 }) + T(168, 128, 'b', { i: 1, c: RD, s: 15 }),
    'Layang-layang dengan diagonal d1 dan d2 serta sisi a dan b');
  const figLingk = () => svg('0 0 230 190',
    `<circle cx="115" cy="86" r="70" fill="#c9eef0" stroke="${INK}" stroke-width="2"/><circle cx="115" cy="86" r="3" fill="${INK}"/>` + `<line x1="115" y1="86" x2="185" y2="86" stroke="${RD}" stroke-width="2.5"/>` + dash(45, 86, 115, 86, BL) +
    T(150, 78, 'r', { i: 1, c: RD, s: 16 }) + T(80, 78, 'r', { i: 1, c: BL, s: 16 }),
    'Lingkaran dengan jari-jari r');
  const figSemua = () => {
    const cell = (i, body, name) => { const x = (i % 4) * 66 + 4, y = (i >> 2) * 74 + 4; return `<g transform="translate(${x} ${y})">${body}${T(31, 66, name, { s: 8.5, c: BR })}</g>`; };
    const st = `stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"`;
    const g = [
      `<rect x="9" y="6" width="44" height="44" fill="#c9dcf8" ${st}/>`, `<rect x="2" y="12" width="58" height="34" fill="#f8c9c9" ${st}/>`, `<polygon points="31,5 56,50 6,50" fill="#fde8b8" ${st}/>`, `<polygon points="2,50 42,50 60,8 20,8" fill="#c8ecd6" ${st}/>`,
      `<polygon points="2,50 60,50 46,8 18,8" fill="#fff1c2" ${st}/>`, `<polygon points="31,3 58,28 31,53 4,28" fill="#f8c9c9" ${st}/>`, `<polygon points="31,3 56,20 31,54 6,20" fill="#e3d3f7" ${st}/>`, `<circle cx="31" cy="28" r="24" fill="#c9eef0" ${st}/>`
    ], n = ['Persegi', 'P. Panjang', 'Segitiga', 'Jajar Genjang', 'Trapesium', 'Belah Ketupat', 'Layang-Layang', 'Lingkaran'];
    return svg('0 0 268 150', g.map((b, i) => cell(i, b, n[i])).join(''), 'Delapan bangun datar: persegi, persegi panjang, segitiga, jajar genjang, trapesium, belah ketupat, layang-layang, lingkaran');
  };
  const figIso = () => svg('0 0 230 190',
    poly([[25, 146], [205, 146], [115, 24]], '#fde8b8') + dash(115, 24, 115, 146, RD) + rightMark(115, 146, -1, -1, 11) + `<polygon points="115,24 115,146 205,146" fill="#f2c14e" fill-opacity=".45"/>` +
    T(60, 78, 'a', { i: 1, c: GR, s: 17 }) + T(122, 92, 't', { i: 1, c: RD, s: 17, a: 'start' }) + T(160, 166, '½ b', { i: 1, c: BL, s: 15 }) + T(115, 184, 't = √(a² − (½b)²)', { s: 12, c: BR }),
    'Segitiga sama kaki dengan kaki a, alas b, dan tinggi t; separuhnya segitiga siku-siku');
  const figPyShapes = () => {
    const st = `stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"`, hi = '#f2c14e';
    const cell = (i, body, name) => `<g transform="translate(${i * 66 + 4} 6)">${body}${T(31, 66, name, { s: 8.5, c: BR })}</g>`;
    const g = [
      `<rect x="2" y="12" width="58" height="34" fill="#f8c9c9" ${st}/><polygon points="2,46 60,46 60,12" fill="${hi}" ${st}/>`,
      `<polygon points="31,3 56,50 6,50" fill="#fde8b8" ${st}/><polygon points="31,3 31,50 56,50" fill="${hi}" ${st}/>`,
      `<polygon points="31,3 58,28 31,53 4,28" fill="#f8c9c9" ${st}/><polygon points="31,3 58,28 31,28" fill="${hi}" ${st}/>`,
      `<polygon points="2,50 60,50 46,8 16,8" fill="#fff1c2" ${st}/><polygon points="2,50 16,50 16,8" fill="${hi}" ${st}/>`
    ], n = ['P. Panjang', 'Sama Kaki', 'Belah Ketupat', 'Trapesium'];
    return svg('0 0 268 80', g.map((b, i) => cell(i, b, n[i])).join(''), 'Empat bangun datar, tiap bangun menyimpan segitiga siku-siku yang diwarnai kuning');
  };
  const fx = (f, t) => `<div class="fb-body"><div class="fb-fig">${f()}</div><div class="fb-tx">${t}</div></div>`;
  const QS_BD = [
    { q: 'Persegi panjang 15 cm × 20 cm. Berapa panjang diagonalnya?', k: 'num', a: 25, u: 'cm' },
    { q: 'Segitiga sama kaki: kaki 13 cm, alas 10 cm. Berapa tingginya?', k: 'num', a: 12, u: 'cm' },
    { q: 'Belah ketupat berdiagonal 24 cm dan 18 cm. Berapa panjang sisinya?', k: 'num', a: 15, u: 'cm' },
    { q: 'Trapesium sama kaki: sisi sejajar 8 cm dan 20 cm, kaki 10 cm. Berapa tingginya?', k: 'num', a: 8, u: 'cm' },
    { q: 'Jajar genjang: sisi miring 17 cm, selisih proyeksi pada alas 8 cm. Berapa tingginya?', k: 'num', a: 15, u: 'cm' }
  ];
  const bdPages = [
    { sec: 'bd', t: 'Bangun Datar & Pythagoras', html: `<div class="fb-body"><div class="fb-fig wide">${figPyShapes()}</div><div class="fb-tx"><p>Di dalam banyak bangun datar tersembunyi <b>segitiga siku-siku</b> (yang berwarna kuning). Karena itu kita bisa memakai teorema Pythagoras untuk mencari panjang yang belum diketahui: <b>diagonal</b>, <b>tinggi</b>, atau <b>sisi</b>.</p>${eq('<i>a</i>² + <i>b</i>² = <i>c</i>²')}${note('🔎', 'Kuncinya: <b>temukan segitiga siku-siku</b> di dalam bangun, lalu tentukan mana sisi miringnya.')}</div></div>` },
    { sec: 'bd', t: 'Tiga Langkah Jitu', html: `<ul class="fb-sum"><li><b>1. Gambar</b> bangunnya, lalu tarik diagonal atau garis tinggi sampai terlihat segitiga siku-siku.</li><li><b>2. Tandai</b> sisi miring (di depan sudut siku-siku) dan dua sisi tegaknya.</li><li><b>3. Hitung:</b> mencari sisi miring → <i>dijumlah</i> (<i>c</i> = √(<i>a</i>² + <i>b</i>²)); mencari sisi tegak → <i>dikurang</i> (<i>a</i> = √(<i>c</i>² − <i>b</i>²)).</li></ul><div class="fb-tx">${note('📏', 'Pastikan semua panjang memakai <b>satuan yang sama</b> sebelum menghitung.')}</div>` },
    { sec: 'bd', t: 'Persegi: Diagonalnya', html: fx(figPersegi, `<p>Diagonal membagi persegi menjadi dua segitiga siku-siku dengan sisi tegak sama panjang (<i>s</i>).</p>${eq('<i>d</i> = √(<i>s</i>² + <i>s</i>²) = <i>s</i>√2')}<p><b>Contoh:</b> <i>s</i> = 7 cm → <i>d</i> = 7√2 ≈ 9,9 cm.</p>`) },
    { sec: 'bd', t: 'Persegi Panjang: Diagonalnya', html: fx(figPP, `<p>Panjang <i>p</i> dan lebar <i>l</i> adalah sisi tegak; diagonal <i>d</i> adalah sisi miring.</p>${eq('<i>d</i> = √(<i>p</i>² + <i>l</i>²)')}<p><b>Contoh:</b> 12 × 5 → <i>d</i> = √(144 + 25) = √169 = <b>13</b>.</p>`) },
    { sec: 'bd', t: 'Segitiga Sama Kaki: Tingginya', html: fx(figIso, `<p>Garis tinggi membagi alas menjadi dua sama panjang, sehingga terbentuk dua segitiga siku-siku.</p>${eq('<i>t</i> = √(<i>a</i>² − (½<i>b</i>)²)')}<p><b>Contoh:</b> kaki 10, alas 12 → <i>t</i> = √(100 − 36) = <b>8</b>. Luas = ½ × 12 × 8 = 48.</p>`) },
    { sec: 'bd', t: 'Jajar Genjang: Tingginya', html: fx(figJG, `<p>Tinggi <i>t</i> tegak lurus alas. Bersama sisi miring <i>b</i> dan potongan alas <i>x</i> ia membentuk segitiga siku-siku.</p>${eq('<i>t</i> = √(<i>b</i>² − <i>x</i>²)')}<p><b>Contoh:</b> <i>b</i> = 5, <i>x</i> = 3 → <i>t</i> = √(25 − 9) = <b>4</b> (tripel 3-4-5).</p>`) },
    { sec: 'bd', t: 'Trapesium Sama Kaki', html: fx(figTrap, `<p>Tarik tinggi dari ujung sisi atas. Alas bawah terbagi: potongan <i>x</i> = (<i>b</i> − <i>a</i>) ÷ 2.</p>${eq('<i>t</i> = √(kaki² − <i>x</i>²)')}<p><b>Contoh:</b> <i>a</i> = 4, <i>b</i> = 10, kaki 5 → <i>x</i> = 3 → <i>t</i> = √(25 − 9) = <b>4</b>.</p>`) },
    { sec: 'bd', t: 'Belah Ketupat: Sisinya', html: fx(figBK, `<p>Diagonalnya berpotongan tegak lurus dan saling membagi dua. Setiap sisi adalah sisi miring dari segitiga siku-siku berisi ½<i>d</i>₁ dan ½<i>d</i>₂.</p>${eq('<i>s</i> = √((½<i>d</i>₁)² + (½<i>d</i>₂)²)')}<p><b>Contoh:</b> <i>d</i>₁ = 16, <i>d</i>₂ = 12 → <i>s</i> = √(8² + 6²) = <b>10</b>.</p>`) },
    { sec: 'bd', t: 'Layang-Layang: Sisinya', html: fx(figLL, `<p>Diagonalnya berpotongan tegak lurus. Sisi <i>a</i> dan <i>b</i> adalah sisi miring dari dua segitiga siku-siku yang berbeda.</p>${eq('<i>a</i> = √(<i>x</i>² + (½<i>d</i>₂)²)')}<p><b>Contoh:</b> setengah diagonal pendek 8, bagian atas diagonal panjang 6 → <i>a</i> = √(36 + 64) = <b>10</b>.</p>`) },
    { sec: 'bd', t: 'Ringkasan Rumus', html: `<table class="fb-tb"><tr><th>Bangun</th><th>Yang dicari</th><th>Rumus</th></tr><tr><td>Persegi</td><td>diagonal</td><td>s√2</td></tr><tr><td>Persegi panjang</td><td>diagonal</td><td>√(p² + l²)</td></tr><tr><td>Segitiga sama kaki</td><td>tinggi</td><td>√(a² − (½b)²)</td></tr><tr><td>Jajar genjang</td><td>tinggi</td><td>√(b² − x²)</td></tr><tr><td>Trapesium sama kaki</td><td>tinggi</td><td>√(kaki² − x²)</td></tr><tr><td>Belah ketupat</td><td>sisi</td><td>√((½d₁)² + (½d₂)²)</td></tr><tr><td>Layang-layang</td><td>sisi</td><td>√(x² + (½d₂)²)</td></tr></table><div class="fb-tx">${note('🧠', 'Semuanya sama: <b>cari segitiga siku-siku</b>, lalu pakai <i>a² + b² = c²</i>.')}</div>` },
    { sec: 'bd', t: 'Latihan Bangun Datar', html: `<div class="fb-tx"><p class="fb-sm">Ketik jawabanmu (angka saja), lalu tekan Periksa.</p></div><ol class="fb-qs" data-set="bd">${QS_BD.map((q, i) => `<li data-i="${i}"><span class="q">${q.q}</span><span class="in"><input type="number" inputmode="decimal" step="any" aria-label="Jawaban ${i + 1}"> ${q.u}<i class="r"></i></span></li>`).join('')}</ol><div class="fb-tx"><button class="fb-chk" type="button" data-fb="chk">✔ Periksa</button> <span class="fb-sc"></span></div>` },
    { sec: 'bd', t: 'Pembahasan', html: `<ol class="fb-ans"><li><b>1.</b> d = √(15² + 20²) = √(225 + 400) = √625 = <b>25 cm</b></li><li><b>2.</b> ½ alas = 5 → t = √(13² − 5²) = √(169 − 25) = √144 = <b>12 cm</b></li><li><b>3.</b> s = √(12² + 9²) = √(144 + 81) = √225 = <b>15 cm</b></li><li><b>4.</b> x = (20 − 8) ÷ 2 = 6 → t = √(10² − 6²) = √64 = <b>8 cm</b></li><li><b>5.</b> t = √(17² − 8²) = √(289 − 64) = √225 = <b>15 cm</b></li></ol>` }
  ];

  const pyPages = [
    /* 3 */
    { sec: 'py', t: 'Segitiga Siku-Siku', html: `<div class="fb-body"><div class="fb-fig">${figTri()}</div><div class="fb-tx"><p>Segitiga siku-siku punya satu sudut <b>90°</b> (ditandai kotak kecil).</p><p>Dua sisi yang membentuk sudut siku-siku disebut <b style="color:${RD}">sisi tegak</b> (<i>a</i> dan <i>b</i>). Sisi di depan sudut siku-siku disebut <b style="color:${GR}">sisi miring</b> atau hipotenusa (<i>c</i>).</p>${note('💡', 'Sisi miring <b>selalu yang paling panjang</b>.')}<p class="fb-sm">Contoh sudut siku-siku di sekitarmu: pojok buku, papan tulis, bingkai pintu.</p></div></div>` },
    /* 4 */
    { sec: 'py', t: 'Bunyi Teorema', html: `<div class="fb-body"><div class="fb-fig">${figSquares()}</div><div class="fb-tx"><p>Pada segitiga siku-siku, <b>kuadrat sisi miring sama dengan jumlah kuadrat kedua sisi tegaknya.</b></p>${eq('<i>a</i>² + <i>b</i>² = <i>c</i>²')}<p>Pada segitiga 3-4-5: luas persegi kecil <b style="color:${RD}">9</b> + luas persegi sedang <b style="color:${BL}">16</b> = luas persegi besar <b style="color:${GR}">25</b>.</p></div></div>` },
    /* 5 */
    { sec: 'py', t: 'Bukti Visual', html: `<div class="fb-body"><div class="fb-fig">${figProof()}</div><div class="fb-tx"><ol class="fb-st"><li>Susun empat segitiga siku-siku yang sama (sisi <i>a, b, c</i>) di dalam persegi bersisi <i>(a + b)</i>.</li><li>Bagian tengah membentuk persegi bersisi <i>c</i>.</li><li>Luas persegi besar: <i>(a+b)² = a² + 2ab + b²</i>.</li><li>Luas yang sama: <i>c² + 4·(½ab) = c² + 2ab</i>.</li><li>Samakan, hilangkan <i>2ab</i>: <b><i>a² + b² = c²</i></b> ∎</li></ol></div></div>` },
    /* 6 */
    { sec: 'py', t: 'Mencari Sisi Miring', html: `<div class="fb-body"><div class="fb-fig">${figTri6()}</div><div class="fb-tx">${eq('<i>c</i> = √(<i>a</i>² + <i>b</i>²)')}<p><b>Contoh:</b> sisi tegak 6 cm dan 8 cm.</p><ol class="fb-st"><li>Kuadratkan: 6² = 36 dan 8² = 64</li><li>Jumlahkan: 36 + 64 = 100</li><li>Tarik akar: <i>c</i> = √100 = <b>10 cm</b></li></ol></div></div>` },
    /* 7 */
    { sec: 'py', t: 'Mencari Sisi Tegak', html: `<div class="fb-body"><div class="fb-fig">${figTri('?', '5', '13')}</div><div class="fb-tx">${eq('<i>a</i> = √(<i>c</i>² − <i>b</i>²)')}<p><b>Contoh:</b> sisi miring 13 cm, satu sisi tegak 5 cm.</p><ol class="fb-st"><li>13² = 169 dan 5² = 25</li><li>Kurangkan: 169 − 25 = 144</li><li>Akar: √144 = <b>12 cm</b></li></ol>${note('⚠', 'Mencari sisi tegak: <b>dikurang</b>, bukan dijumlah!')}</div></div>` },
    /* 8 */
    { sec: 'py', t: 'Tripel Pythagoras', html: `<div class="fb-tx"><p>Tiga bilangan bulat positif <i>a, b, c</i> yang memenuhi <i>a² + b² = c²</i> disebut <b>tripel Pythagoras</b>.</p></div>
      <table class="fb-tb"><tr><th>Tripel</th><th>a² + b²</th><th>c²</th></tr><tr><td>3, 4, 5</td><td>9 + 16</td><td>25</td></tr><tr><td>5, 12, 13</td><td>25 + 144</td><td>169</td></tr><tr><td>8, 15, 17</td><td>64 + 225</td><td>289</td></tr><tr><td>7, 24, 25</td><td>49 + 576</td><td>625</td></tr><tr><td>20, 21, 29</td><td>400 + 441</td><td>841</td></tr></table>
      <div class="fb-tx">${note('✨', 'Kelipatan tripel juga tripel. Dari 3, 4, 5 → <b>6, 8, 10</b> → <b>9, 12, 15</b> → <b>30, 40, 50</b>.')}</div>` },
    /* 9 */
    { sec: 'py', t: 'Jenis Segitiga', html: `<div class="fb-tx"><p>Misalkan <i>c</i> adalah sisi <b>terpanjang</b>. Bandingkan <i>c²</i> dengan <i>a² + b²</i>:</p></div>
      <table class="fb-tb"><tr><th>Hasil</th><th>Jenis segitiga</th></tr><tr><td><i>c² = a² + b²</i></td><td><b>Siku-siku</b></td></tr><tr><td><i>c² &lt; a² + b²</i></td><td><b>Lancip</b></td></tr><tr><td><i>c² &gt; a² + b²</i></td><td><b>Tumpul</b></td></tr></table>
      <div class="fb-tx"><p><b>Contoh:</b></p><ul><li>5, 12, 13 → 169 = 25 + 144 → <b>siku-siku</b></li><li>6, 7, 9 → 81 &lt; 36 + 49 = 85 → <b>lancip</b></li><li>4, 5, 7 → 49 &gt; 16 + 25 = 41 → <b>tumpul</b></li></ul></div>` },
    /* 10 */
    { sec: 'py', t: 'Diagonal Bangun Datar', html: `<div class="fb-body"><div class="fb-fig">${figRect()}</div><div class="fb-tx"><p><b>Persegi panjang</b> <i>p × l</i>: diagonal membentuk segitiga siku-siku.</p>${eq('<i>d</i> = √(<i>p</i>² + <i>l</i>²)')}<p>Untuk 12 × 5: √(144 + 25) = √169 = <b>13</b>.</p><p><b>Persegi</b> sisi <i>s</i>: <i>d</i> = <i>s</i>√2. Persegi sisi 10 cm → diagonal 10√2 ≈ 14,1 cm.</p></div></div>` },
    /* 11 */
    { sec: 'py', t: 'Penerapan Sehari-hari', html: `<div class="fb-body"><div class="fb-fig">${figLadder()}</div><div class="fb-tx"><p><b>1. Tangga.</b> Tangga 10 m disandarkan ke tembok; kakinya 6 m dari tembok. Tinggi ujung tangga?</p><p class="fb-sm">t² = 10² − 6² = 100 − 36 = 64 → t = <b>8 m</b></p><p><b>2. Jarak terpendek.</b> Adi berjalan 30 m ke timur, lalu 40 m ke utara. Jarak lurus ke titik awal?</p><p class="fb-sm">√(30² + 40²) = √2500 = <b>50 m</b></p></div></div>` },
    /* 12 */
    { sec: 'py', t: 'Segitiga Istimewa', html: `<div class="fb-body"><div class="fb-fig">${figSpecial()}</div><div class="fb-tx"><p class="fb-sm">Pengayaan</p><p><b>45° – 45° – 90°</b> → sisi <i>s : s : s√2</i></p><p><b>30° – 60° – 90°</b> → sisi <i>s : s√3 : 2s</i></p><p><b>Contoh:</b> segitiga 30°-60°-90° dengan sisi miring 10 → sisi terpendek 5, sisi lain 5√3.</p><p class="fb-sm">Cek: 5² + (5√3)² = 25 + 75 = 100 = 10² ✓</p></div></div>` },
    /* 13 latihan */
    { sec: 'py', t: 'Latihan', html: `<div class="fb-tx"><p class="fb-sm">Ketik jawabanmu, lalu tekan Periksa.</p></div><ol class="fb-qs" data-set="py">${QS_PY.map((q, i) => `<li data-i="${i}"><span class="q">${q.q}</span><span class="in">${q.k === 'num' ? `<input type="number" inputmode="decimal" step="any" aria-label="Jawaban ${i + 1}"> ${q.u}` : `<select aria-label="Jawaban ${i + 1}"><option value="">pilih…</option>${q.o.map(o => `<option>${o}</option>`).join('')}</select>`}<i class="r"></i></span></li>`).join('')}</ol>
      <div class="fb-tx"><button class="fb-chk" type="button" data-fb="chk">✔ Periksa</button> <span class="fb-sc"></span></div>` },
    /* 14 pembahasan */
    { sec: 'py', t: 'Pembahasan', html: `<ol class="fb-ans"><li><b>1.</b> c = √(9² + 12²) = √(81 + 144) = √225 = <b>15 cm</b></li><li><b>2.</b> b = √(25² − 7²) = √(625 − 49) = √576 = <b>24 cm</b></li><li><b>3.</b> 9² + 40² = 81 + 1600 = 1681 = 41² → <b>Ya</b>, tripel Pythagoras.</li><li><b>4.</b> d = √(24² + 10²) = √(576 + 100) = √676 = <b>26 cm</b></li><li><b>5.</b> Sisi terpanjang 12: 12² = 144; 8² + 10² = 64 + 100 = 164. Karena 144 &lt; 164 → <b>lancip</b>.</li></ol>` },
    /* 15 rangkuman */
    { sec: 'py', t: 'Rangkuman', html: `<ul class="fb-sum"><li>Segitiga siku-siku: sisi tegak <i>a, b</i>; sisi miring <i>c</i> (terpanjang).</li><li><b><i>a² + b² = c²</i></b></li><li>Sisi miring: <i>c = √(a² + b²)</i> — dijumlah.</li><li>Sisi tegak: <i>a = √(c² − b²)</i> — dikurang.</li><li>Tripel: 3-4-5, 5-12-13, 8-15-17, 7-24-25, dan kelipatannya.</li><li>Jenis segitiga: bandingkan <i>c²</i> dengan <i>a² + b²</i>.</li><li>Diagonal persegi panjang: <i>√(p² + l²)</i>; diagonal persegi: <i>s√2</i>.</li></ul>${note('🧭', 'Tips: gambar segitiganya dulu, tandai sisi miring, lalu cek satuan.')}` }
  ];
  const cover = { cover: 1, id: 'cover', html: `<div class="fb-cv"><small>BUKU DIGITAL MATEMATIKA · SMP/MTs KELAS VIII</small><h1>BANGUN DATAR<br>&amp; PYTHAGORAS</h1><div class="fb-cvfig">${figSquares()}</div><p>a² + b² = c²</p><em>Geser atau ketuk ▶ untuk membuka</em></div>` };
  const toc1 = { id: 'toc1', toc: 'bd', t: 'Bab 1 · Bangun Datar & Pythagoras', html: '' };
  const toc2 = { id: 'toc2', toc: 'py', t: 'Bab 2 · Teorema Pythagoras', html: '' };
  const notes = { sec: 'cat', id: 'notes', t: 'Catatan Saya', html: `<div class="fb-tx"><p class="fb-sm">Tulis rumus atau pertanyaanmu. Tersimpan otomatis di perangkat ini.</p></div><textarea class="fb-notes" data-fb="notes" placeholder="Catatanku…" aria-label="Catatan pribadi"></textarea>` };
  const back = { cover: 1, back: 1, id: 'back', html: `<div class="fb-cv fb-bk"><h2>Selamat belajar!</h2><p>Terus berlatih, ya.</p><div class="fb-go"><button class="btn green" data-fb="first" type="button">↺ Baca dari awal</button><button class="btn blue" data-fb="ext" type="button">🔗 Buku eksternal (QR)</button><button class="btn" data-fb="home" type="button">🏠 Beranda</button></div></div>` };
  const pages = [cover, toc1, toc2].concat(bdPages, pyPages, [notes, back]);
  pages.forEach(function (p, i) { p.no = i + 1; });
  if (pages.length % 2) throw new Error('Jumlah halaman harus genap (sekarang ' + pages.length + ')');
  window.FBData = { pages: pages, QS: { bd: QS_BD, py: QS_PY } };
})();
