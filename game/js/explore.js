/* =========================================================
   JELAJAH DUNIA — dunia terbuka 2D (pandangan dari atas), joystick + tombol aksi.
   Warga bertanda "!" mengajukan pertanyaan yang diambil dari PP.QUIZ.
   3 dunia: Desa Siku-siku (soal Mudah), Hutan Hipotenusa (Sedang), Kota Kuadrat (Sulit).
   Progres tersimpan di PPStore.data.explore.
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio;
  PP.screens = PP.screens || {};
  let W = 1500, H = 1100, K = 1; const G = 2;               // ukuran dunia (satuan), faktor skala karakter, skala kanvas tanah
  let PH = 60;                                            // tinggi karakter (satuan dunia)

  /* ---------- definisi dunia ---------- */
  const WORLDS = [
    { name: 'Desa Siku-siku', short: 'Desa', kind: 'grass', base: '#6dbb52', alt: '#5aa845', spawn: [230, 880], q: [0, 1, 2, 3, 4, 100, 101, 103, 106, 109],
      trees: ['new/tree_a', 'new/tree_a', 'new/bush_b'], pond: [150, 170, 260, 150],
      npcs: [['Pak Budi', 'teacher_0', 410, 790], ['Bu Sari', 'girl_0', 560, 700], ['Si Dodo', 'boy_0', 700, 650], ['Pak Tani', 'teacher_1', 860, 610], ['Aisyah', 'hijab_0', 1000, 540],
        ['Kak Rani', 'girl_3', 1120, 450], ['Pak Eko', 'teacher_2', 1190, 580], ['Dimas', 'boy_5', 1130, 730], ['Bu Wati', 'hijab_1', 1000, 860], ['Pak Joko', 'teacher_3', 1190, 960]],
      build: [['new/cottage', 480, 520, 150], ['new/m_barn', 930, 400, 150], ['new/market', 1300, 700, 120], ['new/well', 780, 480, 44], ['school', 320, 620, 140]],
      shapes: [{ t: 'persegi', x: 700, y: 250, s: 6, k: 11 }, { t: 'pp', x: 860, y: 200, p: 10, l: 6, k: 9 }, { t: 'sku', x: 1220, y: 230, a: 3, b: 4, k: 12, sq: true },
        { t: 'ss', x: 570, y: 300, s: 8, k: 10 }, { t: 'lingk', x: 160, y: 490, r: 5, k: 8 }, { t: 'jajar', x: 700, y: 1000, alas: 8, t2: 5, sisi: 7, k: 10 }],
      portals: [{ x: 1360, y: 980, to: 1 }], birds: 4, butterflies: 9, animals: { kelinci: 3 }, welcome: 'Selamat datang di Desa Siku-siku! Temui warga yang bertanda ! dan pelajari bangun datar di tanah.' },
    { name: 'Hutan Hipotenusa', short: 'Hutan', kind: 'forest', base: '#4f9b47', alt: '#438a3d', spawn: [150, 950], q: [5, 6, 7, 8, 9, 10, 102, 104, 107, 110, 111],
      trees: ['new/pine', 'new/pine', 'new/tree_a'], pond: [1120, 790, 280, 170],
      npcs: [['Ranger Rimba', 'teacher_2', 320, 830], ['Bu Ratih', 'hijab_0', 460, 730], ['Kak Dimas', 'boy_0', 620, 800], ['Nenek Tuti', 'teacher_3', 780, 700], ['Hoo-Pytha', 'owl_0', 900, 830],
        ['Pak Anton', 'teacher_0', 980, 650], ['Didit', 'boy_6', 1100, 560], ['Mbak Nisa', 'hijab_1', 1220, 450], ['Tika', 'girl_3', 1100, 340], ['Kak Lina', 'girl_0', 960, 230], ['Hoo-Sigma', 'owl_1', 1230, 200]],
      build: [['new/cottage', 260, 520, 120], ['new/well', 700, 560, 40], ['new/sign', 220, 900, 34]],
      shapes: [{ t: 'sku', x: 560, y: 250, a: 5, b: 12, k: 9 }, { t: 'trap', x: 780, y: 330, a: 6, b: 10, t2: 5, k: 9 }, { t: 'belah', x: 300, y: 330, d1: 10, d2: 6, k: 9 },
        { t: 'sku', x: 520, y: 1000, a: 8, b: 15, k: 6 }, { t: 'pp', x: 770, y: 1010, p: 12, l: 5, k: 8 }, { t: 'lingk', x: 1000, y: 1000, r: 4, k: 9 }],
      portals: [{ x: 1350, y: 150, to: 2 }, { x: 70, y: 1040, to: 0 }], birds: 8, butterflies: 7, animals: { monyet: 4, kijang: 3, singa: 1, harimau: 1, gajah: 1, kelinci: 3 }, welcome: 'Hutan Hipotenusa! Ada monyet, kijang, singa, harimau, dan gajah di sini. Mereka ramah, tapi jangan terlalu dekat.' },
    { name: 'Kota Hipotenusa', short: 'Kota', kind: 'zipcity', W: 2560, H: 2176, PH: 96, base: '#cdbf9a', alt: '#bfb08a', spawn: [330, 482], q: [11, 12, 13, 14, 105, 108, 112, 113], birds: 0,
      trees: [], pond: null,
      npcs: [['Pak Polisi', 'zip:polisi', 2330, 756], ['Bu Guru Maya', 'girl_0', 520, 800], ['Pak Haji', 'teacher_1', 346, 1648], ['Hoo-Pytha', 'owl_0', 1096, 1008], ['Kak Fikri', 'boy_5', 1304, 244],
        ['Bu Dewi', 'hijab_0', 1086, 1640], ['Arsitek Bima', 'teacher_2', 1180, 910], ['Nadia', 'girl_3', 2300, 1600]],
      build: [],
      shapes: [{ t: 'sku', x: 1376, y: 1528, a: 3, b: 4, k: 12, sq: true }, { t: 'persegi', x: 194, y: 786, s: 10, k: 7 }, { t: 'pp', x: 370, y: 770, p: 12, l: 6, k: 7 },
        { t: 'ss', x: 1584, y: 132, s: 10, k: 8 }, { t: 'lingk', x: 2300, y: 1496, r: 5, k: 7 }, { t: 'trap', x: 212, y: 100, a: 6, b: 10, t2: 5, k: 8 }],
      portals: [{ x: 70, y: 1180, to: 1, label: 'Kembali ke Hutan' }, { x: 2490, y: 1180, to: 0, label: 'Kembali ke Desa' }, { x: 2490, y: 1560, to: 3, label: 'Ke Laut' }], welcome: 'Selamat datang di Kota Hipotenusa! Perhatikan lampu lalu lintas, lalu seberangi jalan lewat zebra cross.' },
    { name: 'Penjelajah Laut', short: 'Laut', kind: 'sea', W: 1920, H: 1080, PH: 60, base: '#3a9be0', alt: '#2f8ad0', spawn: [150, 190], q: [200, 201, 202, 203, 205], extra: [204], birds: 0, trees: [], pond: null, build: [], shapes: [],
      npcs: [['Penjaga Pantai', 'laut:penjaga_pantai', 255, 262], ['Pak Polisi Laut', 'laut:polisi_lalu_lintas', 780, 318], ['Kapten Ferry', 'laut:kapal_ferry', 1270, 332], ['Kru Banana Boat', 'laut:pelampung_donat', 1000, 640], ['Peti Harta', 'laut:peti_harta', 1480, 700]],
      portals: [{ x: 90, y: 310, to: 2, label: 'Kembali ke Kota' }, { x: 520, y: 900, to: 4, label: 'Selam ke Bawah Laut' }],
      welcome: 'Penjelajah Laut! Berenanglah dari pantai ke enam pos. Pos selam ada di air yang paling dalam.' },
    { name: 'Bawah Laut', short: 'Bawah Laut', kind: 'under', hidden: true, link: 3, parent: 3, W: 960, H: 540, PH: 60, base: '#1b6fb8', alt: '#1b6fb8', spawn: [200, 220], q: [204], birds: 0, trees: [], pond: null, build: [], shapes: [],
      npcs: [['Gurita Pintar', 'laut:gurita', 700, 478]],
      portals: [{ x: 480, y: 120, to: 3, label: 'Naik ke Permukaan', at: [520, 850] }],
      welcome: 'Bawah laut yang tenang. Temui Gurita Pintar di dasar laut untuk pos selam.' }
  ];
  if (window.PP && PP.NUSA) { WORLDS.push(PP.NUSA.world); WORLDS[2].portals.push({ x: 2490, y: 900, to: 5, label: 'Ke Nusantara' }); }
  const WALK = { boy_0: ['boy_1', 'boy_2', 'boy_3', 'boy_4'], boy_5: ['boy_1', 'boy_2', 'boy_3', 'boy_4'], boy_6: ['boy_1', 'boy_2', 'boy_3', 'boy_4'], girl_0: ['girl_1', 'girl_2'], girl_3: ['girl_1', 'girl_2'], hijab_0: ['hijab_1', 'hijab_2'], hijab_1: ['hijab_1', 'hijab_2'] };
  const OWLF = ['owl_0', 'owl_1', 'owl_2', 'owl_1'];
  const ITEMS = [{ id: 'crown', name: 'Mahkota', price: 40, img: 'crown' }, { id: 'owl', name: 'Burung Hantu', price: 60, img: 'owl_0' }, { id: 'spark', name: 'Jejak Bintang', price: 30, img: 'sparkles' }];
  const REWARD = { Mudah: [8, 4], Sedang: [12, 6], Sulit: [18, 9], Tantangan: [14, 7] };
  /* soal: nomor < 100 = PP.QUIZ, nomor >= 100 = PP.POOL_D (bank soal Tantangan Akhir) */
  const QS0 = id => typeof id === 'string' ? PPBuat.item(id) : id < 100 ? PP.QUIZ[id] : id >= 300 ? PP.NUSA.Q[id - 300] : id >= 200 ? Object.assign({}, PP.POOL_L[id - 200].v[Math.floor(Math.random() * 3)]) : Object.assign({ lv: 'Tantangan' }, PP.POOL_D[id - 100]);
  /* sesi soal pilihan (layar persiapan Jelajah): ganti isi soal, kunci kemajuan tetap id lama */
  const QS = id => { const m = window.PP && PP.JSESS && PP.JSESS.map && PP.JSESS.map[id]; return m ? Object.assign({}, m, { o: m.o.slice() }) : QS0(id); };
  PP.xQS = QS;
  PP.xIds = () => [].concat.apply([], WORLDS.map(w => (w.q || []).filter(x => typeof x !== 'string')));

  const E = () => S.data.explore;
  const ids = wi => WORLDS[wi].q.concat(WORLDS[wi].extra || []);
  const solvedIn = wi => ids(wi).filter(i => E().solved[i]).length;
  function unlocked(wi) { const w = WORLDS[wi]; return wi === 0 || (w.after != null ? !!E().done[w.after] : w.link != null ? unlocked(w.link) : !!E().done[wi - 1]); }

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- gambar ---------- */
  const IM = {};
  function load(name) {
    if (IM[name]) return IM[name];
    const p = IM[name] = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'assets/img/' + name + '.png'; });
    return p;
  }
  const ALL = ['new/tree_a', 'new/pine', 'new/bush_b', 'new/cottage', 'new/m_barn', 'new/market', 'new/well', 'new/mosque', 'new/windmill', 'new/sign', 'new/lamp', 'new/flowers', 'new/m_coin', 'school', 'castle', 'portal', 'crown', 'sparkles', 'rock_a', 'owl_0', 'owl_1', 'owl_2', 'boy_5', 'boy_6', 'girl_3', 'hijab_2',
    'boy_0', 'boy_1', 'boy_2', 'boy_3', 'boy_4', 'girl_0', 'girl_1', 'girl_2', 'hijab_0', 'hijab_1', 'teacher_0', 'teacher_1', 'teacher_2', 'teacher_3'];

  /* ---------- membangun isi dunia ---------- */
  function solidFor(kind, w, h) {
    if (kind === 'tree') return [w * 0.26, 9];
    if (kind === 'bush') return [w * 0.7, 8];
    if (kind === 'bld') return [w * 0.86, h * 0.34];
    return [w * 0.5, 8];
  }
  function buildWorld(wi, imgs) {
    if (WORLDS[wi].kind === 'zipcity') return PP.Kota.build(WORLDS[wi]);
    if (WORLDS[wi].kind === 'sea' || WORLDS[wi].kind === 'under') return PP.Laut.build(WORLDS[wi]);
    const d = WORLDS[wi], r = rng(1000 + wi * 77), objs = [], solids = [], keep = [], coins = [];
    const dim = n => { const i = imgs[n]; return i ? [i.naturalWidth, i.naturalHeight] : [1, 1]; };
    const add = (img, x, y, w, kind) => {
      const [nw, nh] = dim(img), h = w * nh / nw, [sw, sh] = solidFor(kind, w, h);
      objs.push({ img, x, y, w, h, kind });
      solids.push({ x0: x - sw / 2, x1: x + sw / 2, y0: y - sh, y1: y });
    };
    const city = d.kind === 'city', banned = [];
    if (city) { d.layout = PP.Life.cityLayout(); d.layout.solids.forEach(q => solids.push(q)); d.layout.banned.forEach(q => banned.push(q)); }
    const poly = [d.spawn, ...d.npcs.map(n => [n[2], n[3]]), d.portals[0] ? [d.portals[0].x, d.portals[0].y] : d.spawn];
    d.path = poly;
    keep.push({ x: d.spawn[0], y: d.spawn[1], r: 70 });
    d.npcs.forEach(n => keep.push({ x: n[2], y: n[3], r: 56 }));
    d.portals.forEach(p => keep.push({ x: p.x, y: p.y, r: 62 }));
    (d.shapes || []).forEach(sh => { if (!sh._g) PP.Shapes.prep(sh); keep.push({ x: sh.cx, y: sh.cy, r: sh.R + 42 }); });
    if (!city) for (let i = 0; i < poly.length - 1; i++) {
      const a = poly[i], b = poly[i + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 28);
      for (let k = 0; k <= n; k++) keep.push({ x: a[0] + (b[0] - a[0]) * k / n, y: a[1] + (b[1] - a[1]) * k / n, r: 34 });
    }
    d.build.forEach(b => { add(b[0], b[1], b[2], b[3], b[0] === 'new/well' || b[0] === 'new/sign' ? 'small' : 'bld'); keep.push({ x: b[1], y: b[2] - 20, r: b[3] * 0.62 }); });
    if (d.pond) { const p = d.pond; solids.push({ x0: p[0] + p[2] * 0.12, x1: p[0] + p[2] * 0.88, y0: p[1] + p[3] * 0.14, y1: p[1] + p[3] * 0.86 }); }
    const free = (x, y, rad) => {
      for (const q of banned) if (x + rad > q.x0 && x - rad < q.x1 && y + 6 > q.y0 && y - rad < q.y1) return false;
      for (const k of keep) if (Math.hypot(x - k.x, y - k.y) < k.r + rad) return false;
      for (const s of solids) if (x + rad > s.x0 && x - rad < s.x1 && y + 6 > s.y0 && y - rad * 1.2 < s.y1) return false;
      if (d.pond) { const p = d.pond; if (x > p[0] - 14 && x < p[0] + p[2] + 14 && y > p[1] - 14 && y < p[1] + p[3] + 20) return false; }
      return true;
    };
    const treeW = n => n === 'new/pine' ? 44 : n === 'new/bush_b' ? 40 : 58;
    const placed = [];
    const spot = (x, y, rad) => free(x, y, rad) && placed.every(p => Math.hypot(p[0] - x, p[1] - y) > rad * 1.1);
    // pagar pohon di tepi dunia
    if (city) { for (let x = 30; x < W; x += 54) { const t = d.trees[Math.floor(r() * d.trees.length)], xx = x + r() * 14, yy = 1072 + r() * 10; if (free(xx, yy - 28, 10)) { add(t, xx, yy, treeW(t), t === 'new/bush_b' ? 'bush' : 'tree'); placed.push([xx, yy - 28]); } }
      for (let y = 860; y < 1050; y += 62) for (const x of [24, W - 24]) { const t = d.trees[Math.floor(r() * d.trees.length)], xx = x + r() * 10 - 5, yy = y + r() * 14; if (free(xx, yy, 10)) { add(t, xx, yy + 28, treeW(t), 'tree'); placed.push([xx, yy]); } } }
    else {
    for (let x = 30; x < W; x += 52) for (const y of [38, H - 14]) { const t = d.trees[Math.floor(r() * d.trees.length)], xx = x + r() * 16, yy = y + r() * 22; if (free(xx, yy, 10)) { add(t, xx, yy + 28, treeW(t), 'tree'); placed.push([xx, yy]); } }
    for (let y = 100; y < H - 20; y += 58) for (const x of [26, W - 26]) { const t = d.trees[Math.floor(r() * d.trees.length)], xx = x + r() * 14 - 7, yy = y + r() * 22; if (free(xx, yy, 10)) { add(t, xx, yy + 28, treeW(t), 'tree'); placed.push([xx, yy]); } }
    }
    // pohon / semak tersebar
    const nTree = city ? 16 : d.kind === 'forest' ? 95 : 44, yLo = city ? 850 : 110, yHi = city ? 1050 : H - 80;
    for (let n = 0, tries = 0; n < nTree && tries < 4000; tries++) {
      const x = 80 + r() * (W - 160), y = yLo + r() * (yHi - yLo), t = d.trees[Math.floor(r() * d.trees.length)], w = treeW(t) * (0.9 + r() * 0.25);
      if (spot(x, y, w * 0.38)) { add(t, x, y, w, t === 'new/bush_b' ? 'bush' : 'tree'); placed.push([x, y]); n++; }
    }
    for (let n = 0, tries = 0; n < (city ? 0 : 14) && tries < 800; tries++) { const x = 60 + r() * (W - 120), y = 90 + r() * (H - 160); if (spot(x, y, 18)) { add('rock_a', x, y, 24, 'small'); placed.push([x, y]); n++; } }
    const deco = []; for (let n = 0, tries = 0; n < 36 && tries < 900; tries++) { const x = 60 + r() * (W - 120), y = 90 + r() * (H - 160); if (free(x, y, 10) && (!city || y > 840)) { deco.push({ img: 'new/flowers', x, y, w: 22 }); n++; } }
    // koin
    for (let n = 0, tries = 0; n < 8 && tries < 2000; tries++) { const x = 90 + r() * (W - 180), y = 120 + r() * (H - 220); if (free(x, y, 14) && coins.every(c => Math.hypot(c.x - x, c.y - y) > 120)) { coins.push({ x, y, i: n }); n++; } }
    // hewan: tempat awal yang bebas dan jauh dari warga / portal
    d.animalSpots = []; const ra = rng(777 + wi * 31);
    Object.entries(d.animals || {}).forEach(([kind, cnt]) => { const rad = kind === 'gajah' ? 40 : kind === 'singa' || kind === 'harimau' ? 28 : 18;
      for (let n = 0, tries = 0; n < cnt && tries < 600; tries++) { const x = 90 + ra() * (W - 180), y = 150 + ra() * (H - 260);
        if (free(x, y, rad + 14) && Math.hypot(x - d.spawn[0], y - d.spawn[1]) > 220 && d.portals.every(p => Math.hypot(x - p.x, y - p.y) > 160) && d.animalSpots.every(a => Math.hypot(a[1] - x, a[2] - y) > 110)) { d.animalSpots.push([kind, x, y, kind === 'gajah' ? 50 : 80]); n++; } } });
    return { objs, solids, coins, deco, ground: groundCanvas(d, r) };
  }
  function groundCanvas(d, r) {
    const c = document.createElement('canvas'); c.width = W * G; c.height = H * G;
    const g = c.getContext('2d'); g.scale(G, G);
    if (d.kind === 'city') { PP.Life.cityGround(g, d.layout, r, d.shapes); return c; }
    g.fillStyle = d.base; g.fillRect(0, 0, W, H);
    if (d.kind === 'stone') {
      for (let y = 0; y < H; y += 30) for (let x = 0; x < W; x += 30) { g.fillStyle = ((x / 30 + y / 30) & 1) ? d.alt : d.base; g.fillRect(x, y, 30, 30); g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(x, y, 30, 1.5); g.fillRect(x, y, 1.5, 30); }
    } else {
      for (let y = 0; y < H; y += 10) for (let x = 0; x < W; x += 10) { const v = r(); if (v < 0.22) { g.fillStyle = d.alt; g.fillRect(x, y, 10, 10); } else if (v > 0.9) { g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x, y, 10, 10); } }
      g.strokeStyle = 'rgba(30,90,30,.35)'; g.lineWidth = 1.4;
      for (let n = 0; n < 900; n++) { const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 1.5, y - 4); g.moveTo(x, y); g.lineTo(x + 2, y - 3.5); g.stroke(); }
    }
    // jalan tanah
    const dirt = d.kind === 'stone' ? ['#9c8a62', '#e6d7ad'] : ['#8a5f33', '#d9b070'];
    g.lineCap = 'round'; g.lineJoin = 'round';
    [[40, dirt[0]], [32, dirt[1]]].forEach(([lw, col]) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); d.path.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); });
    (d.shapes || []).forEach(sh => { if (!sh._g) PP.Shapes.prep(sh); PP.Shapes.draw(g, sh); });
    // kolam
    if (d.pond) {
      const p = d.pond, cx = p[0] + p[2] / 2, cy = p[1] + p[3] / 2;
      g.fillStyle = '#3a7a36'; g.beginPath(); g.ellipse(cx, cy, p[2] / 2 + 8, p[3] / 2 + 8, 0, 0, 7); g.fill();
      g.fillStyle = '#7a5a30'; g.beginPath(); g.ellipse(cx, cy, p[2] / 2 + 3, p[3] / 2 + 3, 0, 0, 7); g.fill();
      g.fillStyle = '#4aa8e0'; g.beginPath(); g.ellipse(cx, cy, p[2] / 2, p[3] / 2, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; for (let n = 0; n < 6; n++) g.fillRect(cx - p[2] * 0.3 + n * p[2] * 0.1, cy - p[3] * 0.2 + (n % 3) * p[3] * 0.15, 16, 3);
    }
    return c;
  }

  /* =====================================================
     LAYAR
     ===================================================== */
  PP.screens.jelajah = function () {
    const ex = E(); ex.seen = ex.seen || {};
    const html = `<div class="xw" id="xw">
      <canvas id="xc" aria-label="Dunia jelajah"></canvas>
      <div class="x-mis" id="xMis"></div>
      <div class="x-coin"><img src="assets/img/new/m_coin.png" alt="Koin"><b id="xCoin">0</b></div>
      <div class="x-side">
        <button class="x-b nosfx" id="xPause" aria-label="Menu jeda">${PP.ico('pause')}</button>
        <button class="x-b nosfx" id="xWorld" aria-label="Ganti dunia">${PP.ico('map')}</button>
        <button class="x-b nosfx" id="xMisBtn" aria-label="Misi">${PP.ico('task')}</button>
        <button class="x-b nosfx x-on" id="xOn" aria-label="Pemain online">${PP.ico('chat')}<b class="x-cnt" id="xOnN">1</b></button>
        <button class="x-b nosfx" id="xWard" aria-label="Lemari gaya"><span class="x-av"><img id="xWardImg" src="assets/img/${PP.me().idle}.png" alt=""></span></button>
      </div>
      <div class="x-say" id="xSay" hidden></div>
      <button class="x-hint nosfx" id="xHint" hidden></button>
      <div class="x-joy" id="xJoy"><i id="xKnob"></i></div>
      <button class="x-act nosfx" id="xAct">LARI</button>
      <div class="x-q" id="xQ" hidden></div>
      <div class="x-loc" id="xLoc" hidden></div>
      <div class="x-load" id="xLoad">Memuat dunia…</div>
    </div>`;
    let raf = 0, alive = true, cleanup = [];
    return {
      html,
      mount(root) {
        const $ = id => root.querySelector('#' + id);
        const cv = $('xc'), ctx = cv.getContext('2d');
        let wi = Math.min(ex.w || 0, WORLDS.length - 1); if (!unlocked(wi)) wi = 0;
        const D = WORLDS[wi]; ex.w = wi; W = D.W || 1500; H = D.H || 1100; PH = D.PH || 60; K = PH / 60;
        let world = null, imgs = {}, cw = 0, ch = 0, dpr = 1, Z = 1, camX = 0, camY = 0;
        const P = { x: D.spawn[0], y: D.spawn[1], face: 1, f: 1, amp: 0, moving: false, t: 0 };
        if (ex.pos && ex.pos.w === wi) { P.x = ex.pos.x; P.y = ex.pos.y; }
        const keys = {}, joy = { x: 0, y: 0 }; let run = false, busy = false, nearest = null, hintKey = '';
        const floats = [], trail = []; let time = 0, pet = { x: P.x - 20, y: P.y + 6 };
        const npcState = D.npcs.map((n, i) => ({ name: n[0], spr: n[1], x: n[2], y: n[3], hx: n[2], hy: n[3], q: D.q[i], outfit: n[4] || '', cool: 0, mode: 'idle', wait: Math.random() * 2.5, tx: 0, ty: 0, face: Math.random() < 0.5 ? 1 : -1, f: 1, t: Math.random() * 6, stuck: 0, amp: 0 }));
        npcState.forEach(n => { n.f = n.face; });
        let talking = null, life = null;

        /* --- UI helpers --- */
        const say = (txt, ms) => { const s = $('xSay'); s.textContent = txt; s.hidden = false; clearTimeout(say.t); say.t = setTimeout(() => { s.hidden = true; }, ms || 3200); };
        const hud = () => {
          $('xCoin').textContent = ex.coins;
          const n = ids(wi).length, k = solvedIn(wi);
          $('xMis').innerHTML = `<small>MISI AKTIF · ${PP.esc(D.name)}</small><b>${ex.done[wi] ? 'Misi selesai! Cari portal' : 'Jawab pertanyaan warga'}</b><span class="x-mbar"><i style="width:${k / n * 100}%"></i></span><em>${k}/${n} ${wi === 3 || wi === 4 ? 'pos selesai' : 'warga terbantu'}${(D.shapes || []).length ? ` · ${Object.keys(ex.seen).filter(x => x.startsWith(wi + '_')).length}/${D.shapes.length} bentuk` : ''}</em>`;
        };
        hud();

        /* --- ukuran kanvas --- */
        const fit = () => {
          const b = root.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
          cw = Math.max(1, b.width); ch = Math.max(1, b.height);
          cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
          Z = D.kind === 'under' ? Math.max(0.6, Math.min(2.2, ch / D.H)) : D.kind === 'zipcity' ? Math.max(0.6, Math.min(1.5, Math.min(cw, ch) / 360 * 0.72)) : Math.max(0.9, Math.min(2.4, Math.min(cw, ch) / 360));
        };
        fit(); window.addEventListener('resize', fit); cleanup.push(() => window.removeEventListener('resize', fit));
        const ro = window.ResizeObserver ? new ResizeObserver(fit) : null; if (ro) { ro.observe(root); cleanup.push(() => ro.disconnect()); }

        /* --- masukan: joystick, tombol, papan ketik --- */
        const joyEl = $('xJoy'), knob = $('xKnob'); let jid = null;
        const jset = e => {
          const b = joyEl.getBoundingClientRect(), R = b.width / 2, dx = e.clientX - (b.left + R), dy = e.clientY - (b.top + R), m = Math.hypot(dx, dy) || 1, k = Math.min(1, m / R);
          joy.x = dx / m * k; joy.y = dy / m * k; if (k < 0.18) { joy.x = joy.y = 0; }
          knob.style.transform = `translate(${dx / m * k * R * 0.6}px,${dy / m * k * R * 0.6}px)`;
        };
        joyEl.addEventListener('pointerdown', e => { jid = e.pointerId; joyEl.setPointerCapture(jid); jset(e); e.preventDefault(); });
        joyEl.addEventListener('pointermove', e => { if (e.pointerId === jid) jset(e); });
        const jend = e => { if (e.pointerId === jid) { jid = null; joy.x = joy.y = 0; knob.style.transform = ''; } };
        joyEl.addEventListener('pointerup', jend); joyEl.addEventListener('pointercancel', jend);
        const act = $('xAct');
        act.addEventListener('pointerdown', e => { e.preventDefault(); if (nearest) doAct(); else run = true; });
        const runOff = () => { run = false; }; act.addEventListener('pointerup', runOff); act.addEventListener('pointerleave', runOff); act.addEventListener('pointercancel', runOff);
        $('xHint').addEventListener('click', () => doAct());
        const kd = e => {
          const md0 = PP.$('#modal'); if (busy || (md0 && !md0.hidden)) return; const k = e.key.toLowerCase();
          if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'shift'].includes(k)) { keys[k] = true; e.preventDefault(); }
          if (k === 'e' || k === ' ' || k === 'enter') { e.preventDefault(); doAct(); }
          if (k === 'escape' || k === 'p') openPause();
        };
        const ku = e => { delete keys[e.key.toLowerCase()]; };
        window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
        if (window.PPCostume) { PPCostume.pushMine(); cleanup.push(PPCostume.watchAll()); }
        cleanup.push(() => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); });

        /* --- kolisi --- */
        const blocked = (px, py) => {
          const x0 = px - 7 * K, x1 = px + 7 * K, y0 = py - 6 * K, y1 = py + 1;
          for (const s of world.solids) if (x1 > s.x0 && x0 < s.x1 && y1 > s.y0 && y0 < s.y1) return true;
          for (const n of npcState) if (x1 > n.x - 10 * K && x0 < n.x + 10 * K && y1 > n.y - 8 * K && y0 < n.y + 2) return true;
          if (life && life.hitBox && life.hitBox(x0, x1, y0, y1)) return true;
          return false;
        };

        /* --- warga "Soal Teman" dari fitur Buat Soal --- */
        const addCustom = list => {
          list.forEach(c => {
            if (!world) return; const key = 'c_' + c.id; if (npcState.some(n => n.q === key)) return; let x = 0, y = 0, ok = false;
            for (let k = 0; k < 70 && !ok; k++) { const a = npcState.length * 2.4 + k * 0.7, r = (150 + (k % 12) * 26) * K; x = D.spawn[0] + Math.cos(a) * r; y = D.spawn[1] + Math.sin(a) * r * 0.7; ok = x > 60 && x < W - 60 && y > 90 && y < H - 40 && !blocked(x, y) && !blocked(x, y - 18 * K); }
            if (!ok) return; const spr = (PP.AV[c.av] || PP.AV.boy).idle;
            npcState.push({ name: 'Soal Teman: ' + c.bn, spr, x, y, hx: x, hy: y, q: key, cool: 0, mode: 'idle', wait: Math.random() * 2.5, tx: 0, ty: 0, face: 1, f: 1, t: Math.random() * 6, stuck: 0, amp: 0, custom: 1 });
          });
        };
        if (window.PPBuat && D.kind !== 'sea' && D.kind !== 'under') { addCustom(PPBuat.approved()); cleanup.push(PPBuat.watch()); cleanup.push(PPBuat.onChange(() => addCustom(PPBuat.approved()))); }

        /* --- interaksi --- */
        function target() {
          let best = null, bd = 1e9;
          for (const n of npcState) { const d = Math.hypot(n.x - P.x, n.y - P.y); if (d < 56 * K && d < bd) { bd = d; best = { type: 'npc', n }; } }
          for (const p of D.portals) { const d = Math.hypot(p.x - P.x, p.y - P.y); if (d < 50 * K && d < bd) { bd = d; best = { type: 'portal', p }; } }
          if (!best) for (const sh of D.shapes || []) { const d = Math.hypot(sh.cx - P.x, sh.cy - P.y); if (d < sh.R && d < bd) { bd = d; best = { type: 'shape', sh }; } }
          if (!best) for (const st of D.studi || []) { const d = Math.hypot(st.cx - P.x, st.cy - P.y); if (d < st.R && d < bd) { bd = d; best = { type: 'studi', st }; } }
          return best;
        }
        function doAct() {
          if (busy) return; const t = nearest; if (!t) return;
          if (t.type === 'npc') { const lk = life && life.lock && life.lock(t.n); if (lk && !ex.solved[t.n.q]) { A.sfx('tick'); say(lk, 4200); return; } A.sfx('page'); openQuiz(t.n); return; }
          if (t.type === 'shape') { openShape(t.sh); return; }
          if (t.type === 'studi') { openStudi(t.st); return; }
          const to = t.p.to;
          if (!unlocked(to)) { A.sfx('tick'); say(`Portal terkunci. Selesaikan misi di ${D.short} dulu (${solvedIn(wi)}/${D.q.length}).`); return; }
          ex.w = to; ex.pos = t.p.at ? { w: to, x: t.p.at[0], y: t.p.at[1] } : null; S.save(); PP.go('jelajah');
        }

        /* --- kuis dari warga --- */
        function openQuiz(n) {
          const it = QS(n.q), done = !!ex.solved[n.q], rw = (REWARD[it.lv] || [8, 4]).slice(), rw0 = rw.slice();
          if (done) { say(`${n.name}: Terima kasih sudah membantuku!`); return; }
          busy = true; talking = n; n.face = P.x >= n.x ? 1 : -1; n.f = n.face; joy.x = joy.y = 0; for (const k in keys) delete keys[k];
          const q = $('xQ'); q.hidden = false;
          q.innerHTML = `<div class="xq-card panel" role="dialog" aria-modal="true">
            <div class="xq-head"><span class="xq-who">${n.spr.startsWith('laut:') ? `<img class="xq-av" src="assets/laut/av/${n.spr.slice(5)}.png" alt="">` : n.spr === 'zip:polisi' ? `<img class="xq-av" src="assets/kota/05_karakter/polisi/polisi_jalan_bawah/polisi_jalan_bawah_00.png" alt="">` : n.spr === 'polisi' ? `<img class="xq-av" src="${PPArt.url('polisi', 0)}" alt="">` : PP.img(n.spr, 'xq-av')}<b>${PP.esc(n.name)}</b></span><button class="btn sm nosfx" id="xqX">Keluar</button></div>
            <div class="xq-tag"><span class="pill">Pertanyaan warga</span><span class="pill lv-${it.lv}">${it.lv}</span><span class="pill" id="xqRw">+${rw[0]} koin</span></div>
            ${it.hi ? `<p class="xq-hi">“${it.hi}”</p>` : ''}${it.fig ? `<div class="xq-fig fx-root" data-state="idle">${it.fig}</div>` : ''}<h3 class="xq-q">${it.q}</h3>
            <div class="xq-opts">${it.o.map((o, k) => `<button class="opt nosfx" data-k="${k}"><span class="ol">${'ABCDE'[k]}</span><span>${o}</span></button>`).join('')}</div>
            <div class="xq-fb" id="xqFb" hidden></div></div>`;
          const close = () => { q.hidden = true; q.innerHTML = ''; busy = false; talking = null; };
          { const sv = q.querySelector('.xq-fig svg'); if (sv && window.FX) try { FX.drawShape(sv); } catch (e) { } }
          $('xqX').onclick = () => { A.sfx('tick'); close(); };
          const hq = 'w' + wi + '_' + n.q;
          if (window.PPMisi) PPMisi.ev('sapa', { name: n.name });
          if (window.PPHint) PPHint.attach(q.querySelector('.xq-card'), it, { id: hq, opts: () => Array.from(q.querySelectorAll('.opt')), after: () => q.querySelector('.xq-opts'), onChange: m => { rw[0] = Math.max(1, Math.round(rw0[0] * m)); rw[1] = Math.max(1, Math.round(rw0[1] * m)); const e = $('xqRw'); if (e) e.textContent = '+' + rw[0] + ' koin'; } });
          q.querySelectorAll('.opt').forEach(b => b.onclick = () => {
            const k = +b.dataset.k, ok = k === it.a;
            q.querySelectorAll('.opt').forEach(o => { o.disabled = true; if (+o.dataset.k === it.a) o.classList.add('right'); });
            if (!ok) b.classList.add('wrong');
            const fb = $('xqFb'); fb.hidden = false; fb.className = 'xq-fb ' + (ok ? 'ok' : 'bad');
            S.data.tally[ok ? 'correct' : 'wrong']++;
            if (ok) {
              if (window.PPHint) PPHint.right(hq); if (typeof n.q === 'string' && window.PPBuat) PPBuat.solved(n.q); if (window.PPMisi) PPMisi.ev('benar', { hint: window.PPHint && PPHint.session[hq] ? PPHint.session[hq].lv : 0, kind: window.PPHint ? PPHint.gen(it).kind : '', coins: rw[0] }); A.sfx('correct'); ex.solved[n.q] = 1; ex.coins += rw[0]; S.addXP(rw[1], true); S.save(); hud();
              if (life && life.fx) life.fx(n.x, n.y - 30); fb.innerHTML = `<b>Benar! +${rw[0]} koin</b><p>${String(it.e).replace(/\n/g, '<br>')}</p><button class="btn green" id="xqNext">Lanjut</button>`;
            } else {
              if (window.PPHint) PPHint.wrong(hq); if (window.PPMisi) PPMisi.ev('salah'); A.sfx('wrong'); S.save();
              fb.innerHTML = `<b>Belum tepat.</b><p>${String(it.e).replace(/\n/g, '<br>')}</p><button class="btn green" id="xqNext">Coba lagi</button>`;
            }
            $('xqNext').onclick = () => {
              close();
              if (!ok) { openQuiz(n); return; }
              floats.push({ x: n.x, y: n.y - PH - 8, t: 0, txt: `+${rw[0]}`, col: '#ffe066' });
              const fw = D.parent != null ? D.parent : wi; if (solvedIn(fw) === ids(fw).length && !ex.done[fw]) finishWorld(fw); else say(`${n.name}: Terima kasih! Pertanyaanmu hebat.`);
            };
          });
        }
        function finishWorld(w) {
          w = w == null ? wi : w; ex.done[w] = 1; WORLDS.forEach((x, i) => { if (x.link === w) ex.done[i] = 1; }); ex.coins += 30; S.addXP(25, true); S.save(); hud();
          const all = WORLDS.every((x, i) => x.hidden || ex.done[i]), nx = WORLDS[w + 1] && !WORLDS[w + 1].hidden ? WORLDS[w + 1] : null;
          if (all) S.award('jelajah', true);
          PP.ui.missionComplete({ title: all ? 'Semua Dunia Selesai!' : 'Misi Dunia Selesai!', stars: 3, xp: 25, unlock: nx ? nx.name : '', extra: '<p class="xp-line">+30 koin bonus</p>',
            actions: nx ? [{ label: 'Pergi ke ' + nx.short, route: 'jelajah', cls: 'green', id: 'goNext' }, { label: 'Terus Menjelajah', route: 'jelajah', cls: '' }] : [{ label: 'Terus Menjelajah', route: 'jelajah', cls: 'green' }] });
          if (nx) { const m = PP.$('#modal'), b = m.querySelector('[data-go]'); if (b) b.addEventListener('click', () => { ex.w = w + 1; ex.pos = null; S.save(); }, true); }
        }

        function openStudi(st) {
          if (window.PPMisi) PPMisi.ev('kasus', { name: st.title });
          const key = wi + '_k' + D.studi.indexOf(st), first = !ex.seen[key];
          if (first) { ex.seen[key] = 1; ex.coins += 3; S.save(); hud(); A.sfx('point_now'); floats.push({ x: P.x, y: P.y - PH - 8, t: 0, txt: '+3', col: '#ffe066' }); }
          PP.ui.modal(st.html + `<p class="small muted">${first ? 'Studi kasus baru! +3 koin. ' : ''}Dipelajari: ${Object.keys(ex.seen).filter(x => x.startsWith(wi + '_k')).length}/${D.studi.length}</p><div class="row center"><button class="btn green" data-close>Mengerti</button></div>`);
        }
        function openShape(sh) {
          if (window.PPMisi) PPMisi.ev('kasus', { name: sh.title });
          const info = PP.Shapes.info(sh), key = wi + '_' + D.shapes.indexOf(sh), first = !ex.seen[key];
          if (first) { ex.seen[key] = 1; ex.coins += 3; S.save(); hud(); A.sfx('point_now'); floats.push({ x: P.x, y: P.y - PH - 8, t: 0, txt: '+3', col: '#ffe066' }); }
          PP.ui.modal(info.html + `<p class="small muted">${first ? 'Bentuk baru dipelajari! +3 koin. ' : ''}Bentuk dipelajari di dunia ini: ${Object.keys(ex.seen).filter(x => x.startsWith(wi + '_')).length}/${D.shapes.length}</p><div class="row center"><button class="btn green" data-close>Mengerti</button></div>`);
        }

        /* --- menu jeda, dunia, misi, lemari --- */
        function openPause() {
          if (busy) return;
          PP.ui.modal(`<h2 class="h-title">Permainan Dijeda</h2><p class="small muted">${PP.esc(PP.nm())} · ${PP.esc(D.name)} · ${ex.coins} koin</p>
            <div class="xp-menu"><button class="btn green wide" data-close>Lanjutkan</button>
            <button class="btn blue" id="pmW">Ganti Dunia</button><button class="btn blue" id="pmM">Misi</button>
            <button class="btn blue" id="pmL">Lemari</button><button class="btn blue" id="pmH">Cara Main</button>
            <button class="btn blue wide" data-go="papan" data-close>Papan Peringkat</button>
            <button class="btn red wide" data-go="menu" data-close>Keluar ke Menu</button></div>
            <p class="small muted center">Progres, koin, dan kostum tersimpan otomatis di perangkat ini.</p>`);
          PP.$('#pmW').onclick = openWorlds; PP.$('#pmM').onclick = openMission; PP.$('#pmL').onclick = openWard; PP.$('#pmH').onclick = openHow;
        }
        function openHow() {
          PP.ui.modal(`<h2 class="h-title">Cara Main</h2><ul class="x-how"><li><b>Berjalan:</b> geser joystick (di komputer: tombol panah / WASD).</li><li><b>Lari:</b> tahan tombol LARI (komputer: Shift).</li><li><b>Bertanya:</b> dekati warga bertanda <b>!</b> lalu tekan BICARA (komputer: E / Spasi).</li><li><b>Koin:</b> kumpulkan koin di tanah dan jawab soal dengan benar.</li><li><b>Portal:</b> selesaikan semua warga untuk membuka dunia berikutnya.</li></ul><div class="row center"><button class="btn green" data-close>Mengerti</button></div>`);
        }
        function openWorlds() {
          PP.ui.modal(`<h2 class="h-title">Peta Dunia</h2><div class="x-worlds">${WORLDS.map((w, i) => { if (w.hidden) return ''; const u = unlocked(i), k = solvedIn(i); return `<button class="x-wcard ${i === wi ? 'cur' : ''}" data-i="${i}" ${u ? '' : 'disabled'}><b>${w.name}</b><span>${u ? (ex.done[i] ? 'Selesai' : 'Terbuka') : 'Terkunci'} · ${k}/${ids(i).length} ${i === 3 ? 'pos' : 'warga'}</span></button>`; }).join('')}</div><div class="row center"><button class="btn" data-close>Tutup</button></div>`);
          PP.$$('.x-wcard').forEach(b => b.onclick = () => { const i = +b.dataset.i; PP.ui.close(); if (i === wi) return; ex.w = i; ex.pos = null; S.save(); PP.go('jelajah'); });
        }
        function openMission() {
          PP.ui.modal(`<h2 class="h-title">Misi</h2><ul class="x-how">${WORLDS.map((w, i) => w.hidden ? '' : `<li><b>${w.name}</b> — ${unlocked(i) ? `jawab ${ids(i).length} pertanyaan ${i === 3 ? 'di enam pos (termasuk selam)' : 'warga'} (${solvedIn(i)}/${ids(i).length})${ex.done[i] ? ' ✔' : ''}` : 'terkunci, selesaikan dunia sebelumnya'}</li>`).join('')}</ul><div class="row center"><button class="btn green" data-close>Tutup</button></div>`);
        }
        function openWard() {
          const draw = () => {
            PP.ui.modal(`<h2 class="h-title">Lemari Gaya <span class="pill"><img class="pi" src="assets/img/new/m_coin.png" alt="">${ex.coins}</span></h2>
              <p class="small muted" style="margin:0">Karakter</p><div class="x-ward">${Object.keys(PP.AV).map(k => `<button class="x-it ${S.data.avatar === k ? 'on' : ''}" data-av="${k}">${PP.img(PP.AV[k].idle)}<span>${PP.AV[k].name}</span></button>`).join('')}</div>
              <p class="small muted" style="margin:6px 0 0">Aksesori</p><div class="x-ward">${ITEMS.map(it => { const own = ex.owned[it.id], on = ex.equip[it.id]; return `<button class="x-it ${on ? 'on' : ''}" data-it="${it.id}">${PP.img(it.img)}<span>${it.name}</span><em>${own ? (on ? 'Dipakai' : 'Pakai') : it.price + ' koin'}</em></button>`; }).join('')}</div>
              <div class="row center"><button class="btn green" data-close>Selesai</button></div>`);
            PP.$$('[data-av]').forEach(b => b.onclick = () => { S.data.avatar = b.dataset.av; S.save(); A.sfx('tick'); $('xWardImg').src = `assets/img/${PP.me().idle}.png`; draw(); });
            PP.$$('[data-it]').forEach(b => b.onclick = () => {
              const it = ITEMS.find(x => x.id === b.dataset.it);
              if (!ex.owned[it.id]) { if (ex.coins < it.price) { PP.ui.toast('Koin belum cukup.', 'x'); A.sfx('wrong'); return; } ex.coins -= it.price; ex.owned[it.id] = 1; ex.equip[it.id] = 1; A.sfx('star'); hud(); }
              else { ex.equip[it.id] = ex.equip[it.id] ? 0 : 1; A.sfx('tick'); }
              S.save(); draw();
            });
          }; draw();
        }
        $('xPause').onclick = openPause; $('xWorld').onclick = () => { if (!busy) openWorlds(); }; $('xMisBtn').onclick = () => { if (!busy) openMission(); }; $('xWard').onclick = () => { if (!busy) openWard(); };
        /* ---- server bersama: jumlah pemain, daftar, kabar masuk/keluar ---- */
        const SV = window.PPServer;
        const svCount = () => { try { $('xOnN').textContent = SV ? Math.max(1, SV.count()) : 1; } catch (e) {} };
        const svList = () => `<h2 class="h-title">Pemain Online</h2><p class="small muted" style="margin:0 0 4px">Server: <b>${PP.esc(SV ? SV.room() : '-')}</b> · mesin: ${SV ? SV.mode() : 'off'}</p><ol class="sv-list">${(SV ? SV.list() : []).map(p => `<li class="${p.me ? 'me' : ''}"><span class="sv-av">${PP.img((PP.AV[p.avatar] || PP.AV.boy).idle)}</span><span class="sv-n"><b>${PP.esc(p.name || 'Pemain')}${p.me ? ' (kamu)' : ''}</b><small>${PP.esc([p.kelas, p.sekolah].filter(Boolean).join(' · ')) || '-'}</small></span><span class="sv-xp">${p.xp | 0} XP<small>${p.scene === 'jelajah' ? 'menjelajah' : p.scene === 'kuis' ? 'kuis' : 'menu'}</small></span></li>`).join('')}</ol><div class="row center"><button class="btn green" data-close>Tutup</button></div>`;
        $('xOn').onclick = () => { if (!busy) PP.ui.modal(svList()); };
        if (SV) { svCount(); cleanup.push(SV.onChange(svCount));
          cleanup.push(SV.onJoin((id, p) => { if (alive) PP.ui.toast((p.name || 'Teman') + ' bergabung ke server'); }));
          cleanup.push(SV.onLeave((id, p) => { if (alive) PP.ui.toast((p.name || 'Teman') + ' keluar'); })); }

        /* --- gambar --- */
        const drawImg = (name, x, y, w, anchorBottom) => {
          const i = imgs[name]; if (!i) return; const h = w * i.naturalHeight / i.naturalWidth;
          ctx.drawImage(i, x - w / 2, anchorBottom === false ? y - h / 2 : y - h, w, h);
        };
        const shadow = (x, y, rx) => { ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.32, 0, 0, 7); ctx.fill(); };
        const label = (txt, x, y, col) => { ctx.font = '800 11px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(30,18,8,.85)'; ctx.strokeText(txt, x, y); ctx.fillStyle = col || '#fff'; ctx.fillText(txt, x, y); };
        const badge = (x, y, txt, bg) => { ctx.fillStyle = '#3a2312'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#3a2312'; ctx.font = '900 12px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(txt, x, y + 4.5); };
        const personH = spr => spr === 'owl_0' ? 40 * K : PH;

        /* --- warga bergerak: berkeliling di sekitar rumahnya, berhenti dan menghadap pemain saat didekati --- */
        const hitNpc = (x, y, self) => {
          const x0 = x - 8 * K, x1 = x + 8 * K, y0 = y - 8 * K, y1 = y + 2;
          for (const s of world.solids) if (x1 > s.x0 && x0 < s.x1 && y1 > s.y0 && y0 < s.y1) return true;
          for (const o of npcState) if (o !== self && x1 > o.x - 10 * K && x0 < o.x + 10 * K && y1 > o.y - 8 * K && y0 < o.y + 2) return true;
          if (life && life.hit(x, y)) return true;
          if (life && life.hitBox && life.hitBox(x0, x1, y0, y1)) return true;
          return Math.abs(x - P.x) < 16 * K && Math.abs(y - P.y) < 11 * K;
        };
        function updateNpc(n, dt) {
          if (!dt) return;
          if (life && life.fixed && life.fixed(n)) { n.t += dt; return; }
          n.t += dt;
          const dp = Math.hypot(P.x - n.x, P.y - n.y);
          if (dp < 120 || n === talking) { n.mode = 'face'; n.face = P.x >= n.x ? 1 : -1; }
          else if (n.mode === 'face') { n.mode = 'idle'; n.wait = 0.7 + Math.random(); }
          if (n.mode === 'idle') {
            n.wait -= dt;
            if (n.wait <= 0) {
              n.wait = 1; 
              for (let k = 0; k < 8; k++) {
                const a = Math.random() * 6.283, rad = (25 + Math.random() * 55) * K, tx = n.hx + Math.cos(a) * rad, ty = n.hy + Math.sin(a) * rad * 0.7;
                if (tx > 40 && tx < W - 40 && ty > 70 && ty < H - 30 && !hitNpc(tx, ty, n)) { n.tx = tx; n.ty = ty; n.mode = 'walk'; n.stuck = 0; break; }
              }
            }
          } else if (n.mode === 'walk') {
            const dx = n.tx - n.x, dy = n.ty - n.y, d = Math.hypot(dx, dy);
            if (d < 3) { n.mode = 'idle'; n.wait = 1.2 + Math.random() * 2.8; }
            else {
              const sp = 28 * K * dt, nx = n.x + dx / d * sp, ny = n.y + dy / d * sp; let moved = false;
              if (!hitNpc(nx, n.y, n)) { n.x = nx; moved = true; } if (!hitNpc(n.x, ny, n)) { n.y = ny; moved = true; }
              if (Math.abs(dx) > 1.5) n.face = dx > 0 ? 1 : -1;
              n.stuck = moved ? 0 : n.stuck + dt; if (n.stuck > 0.5) { n.mode = 'idle'; n.wait = 0.8; }
            }
          }
          n.f += (n.face - n.f) * Math.min(1, dt * 9);          // berputar halus ke arah hadap
          n.amp += ((n.mode === 'walk' ? 1 : 0) - n.amp) * Math.min(1, dt * 8);
        }

        function frame(dt) {
          time += dt;
          // gerak
          let vx = joy.x, vy = joy.y;
          if (keys.arrowleft || keys.a) vx -= 1; if (keys.arrowright || keys.d) vx += 1; if (keys.arrowup || keys.w) vy -= 1; if (keys.arrowdown || keys.s) vy += 1;
          const m = Math.hypot(vx, vy); if (m > 1) { vx /= m; vy /= m; }
          const sp = (run || keys.shift ? 170 : 105) * K * (busy ? 0 : 1);
          P.moving = m > 0.1 && !busy;
          if (P.moving) {
            if (Math.abs(vx) > 0.15) P.face = vx > 0 ? 1 : -1;
            const nx = Math.max(24, Math.min(W - 24, P.x + vx * sp * dt)); if (!blocked(nx, P.y)) P.x = nx;
            const ny = Math.max(50, Math.min(H - 12, P.y + vy * sp * dt)); if (!blocked(P.x, ny)) P.y = ny;
            P.t += dt * (sp > 150 * K ? 1.45 : 1); if (ex.equip.spark && Math.random() < 0.5) trail.push({ x: P.x + (Math.random() - .5) * 10, y: P.y - 4, t: 0 });
          }
          P.amp += ((P.moving ? 1 : 0) - P.amp) * Math.min(1, dt * 9); P.f += (P.face - P.f) * Math.min(1, dt * 14);
          pet.x += (P.x - 22 * P.face - pet.x) * Math.min(1, dt * 4); pet.y += (P.y + 4 - pet.y) * Math.min(1, dt * 4);
          // koin
          for (const c of world.coins) if (!ex.taken[wi + '_' + c.i] && Math.hypot(c.x - P.x, c.y - 10 * K - P.y) < 22 * K) {
            ex.taken[wi + '_' + c.i] = 1; ex.coins += 2; S.save(); hud(); A.sfx('point_now'); floats.push({ x: c.x, y: c.y - 24, t: 0, txt: '+2', col: '#ffe066' });
          }
          // target terdekat
          const t = target(); nearest = t;
          const key = t ? (t.type === 'npc' ? 'n' + t.n.name + !!ex.solved[t.n.q] : t.type === 'shape' ? 's' + t.sh.title + t.sh.x : t.type === 'studi' ? 'k' + t.st.title : 'p' + t.p.to) : '';
          if (key !== hintKey) {
            hintKey = key; const hb = $('xHint'), ab = $('xAct');
            if (!t) { hb.hidden = true; ab.textContent = 'LARI'; }
            else if (t.type === 'npc') { hb.hidden = false; hb.textContent = ex.solved[t.n.q] ? `${t.n.name} (sudah dibantu)` : `Bicara dengan ${t.n.name}`; ab.textContent = 'BICARA'; }
            else if (t.type === 'shape') { hb.hidden = false; hb.textContent = 'Pelajari: ' + t.sh.title; ab.textContent = 'LIHAT'; }
            else if (t.type === 'studi') { hb.hidden = false; hb.textContent = 'Studi kasus: ' + t.st.title; ab.textContent = 'LIHAT'; }
            else { hb.hidden = false; hb.textContent = t.p.label || ('Portal ke ' + WORLDS[t.p.to].name) + (unlocked(t.p.to) ? '' : ' (terkunci)'); ab.textContent = 'MASUK'; }
          }
          for (const n of npcState) updateNpc(n, dt);
          if (SV) SV.setLoc(wi, P.x, P.y, P.f, P.amp);
          if (life) life.update(dt);
          // kamera
          const vw = cw / Z, vh = ch / Z;
          camX = vw >= W ? (W - vw) / 2 : Math.max(0, Math.min(W - vw, P.x - vw / 2));
          camY = vh >= H ? (H - vh) / 2 : Math.max(0, Math.min(H - vh, P.y - 30 - vh / 2));
          draw(vw, vh);
        }

        function draw(vw, vh) {
          ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = D.kind === 'under' ? '#0d3b66' : D.kind === 'sea' ? '#3a9be0' : '#2a4a2a'; ctx.fillRect(0, 0, cv.width, cv.height);
          ctx.setTransform(dpr * Z, 0, 0, dpr * Z, -camX * dpr * Z, -camY * dpr * Z);
          ctx.imageSmoothingEnabled = D.kind !== 'zipcity'; if (life && life.base) life.base(ctx); else ctx.drawImage(world.ground, 0, 0, W, H);
          const inView = (x, y, m) => x > camX - m && x < camX + vw + m && y > camY - m && y < camY + vh + m + 120;
          for (const d of world.deco) if (inView(d.x, d.y, 30)) drawImg(d.img, d.x, d.y, d.w);
          // portal
          for (const p of D.portals) {
            if (!inView(p.x, p.y, 120)) continue; const open = unlocked(p.to);
            ctx.save(); ctx.globalAlpha = open ? 1 : 0.5; shadow(p.x, p.y, 34 * K); if (window.PPPortalArt && /^Kembali/.test(p.label || '')) PPPortalArt.draw(ctx, p.x, p.y, K, time, p.label); else drawImg('portal', p.x, p.y + 4, 78 * K); ctx.restore();
            if (open) { ctx.fillStyle = 'rgba(255,240,150,' + (0.25 + 0.15 * Math.sin(time * 3)) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y - 30 * K, 28 * K, 0, 7); ctx.fill(); }
            label(p.label || WORLDS[p.to].short, p.x, p.y - 74 * K, open ? '#ffe9a0' : '#ccc'); if (!open) badge(p.x, p.y - 36 * K, '×', '#ff9d8d');
          }
          // koin
          for (const c of world.coins) if (!ex.taken[wi + '_' + c.i] && inView(c.x, c.y, 20)) { const b = Math.sin(time * 4 + c.i) * 3; shadow(c.x, c.y, 8 * K); drawImg('new/m_coin', c.x, c.y - 8 * K + b, 18 * K); }
          // daftar yang diurutkan menurut y
          const list = [];
          for (const o of world.objs) if (inView(o.x, o.y, o.w)) list.push({ y: o.y, f: () => { if (o.kind !== 'bld') shadow(o.x, o.y - 2, o.w * 0.3); drawImg(o.img, o.x, o.y, o.w); } });
          if (life) life.push(list, inView, ctx, imgs);
          for (const n of npcState) if (inView(n.x, n.y, 60)) list.push({ y: n.y, f: () => {
            const lt = n.spr.startsWith('laut:') && life.npcDraw ? life.npcDraw(ctx, n, time) : null;
            const owl = n.spr.startsWith('owl'), pol = n.spr === 'polisi', zpol = n.spr === 'zip:polisi', h = lt ? lt.h : zpol ? 90 : pol ? 52 : personH(n.spr), lift = owl ? (8 + Math.sin(n.t * 3) * 3) * K : 0;
            if (!lt) shadow(n.x, n.y, (owl ? 10 - lift * 0.15 : 14) * K);
            if (lt) { /* digambar oleh PP.Laut */ } else
            if (zpol) { const walking = n.amp > 0.25, nm = walking ? 'polisi_jalan_' + (n.f < 0 ? 'kiri' : 'kanan') : 'polisi_jalan_bawah', im = PP.Kota.frame(nm, walking ? Math.floor(n.t * 8) : 0); if (im) { ctx.imageSmoothingEnabled = false; ctx.drawImage(im, Math.round(n.x - im.naturalWidth / 2), Math.round(n.y - im.naturalHeight + 6)); } }
            else if (pol) PPArt.draw(ctx, 'polisi', Math.floor(n.t * 6) % 8, n.x, n.y, { flip: n.f < 0 });
            else { const spr = owl ? OWLF[Math.floor(n.t * 5) % 4] : n.spr; PP.Life.drawHuman(ctx, imgs[spr] || imgs[n.spr], spr, n.x, n.y - lift, h, n.f, n.t, owl ? 0 : n.amp, null, n.outfit || ''); }
            label(n.name, n.x, n.y - h - 18 - (owl ? 8 * K : 0), '#fff');
            if (lt && life.mark) life.mark(ctx, n, n.x, n.y - h - 30, !!ex.solved[n.q], time); else if (ex.solved[n.q]) badge(n.x, n.y - h - 6 - (owl ? 8 * K : 0), '✓', '#8fe07a'); else badge(n.x, n.y - h - 6 - (owl ? 8 * K : 0) + Math.sin(time * 5) * 2, '!', '#ffd34d');
          } });
          if (ex.equip.owl) list.push({ y: pet.y, f: () => { shadow(pet.x, pet.y, 8); drawImg('owl_0', pet.x, pet.y - 6 + Math.sin(time * 6) * 2, 26); } });
          if (SV) for (const o of SV.nearby(wi)) {
            // geser halus menuju posisi terbaru
            const rm = SV._cache = SV._cache || {}; const r = rm[o.id] = Object.assign(rm[o.id] || { t: 0, x: o.loc.x, y: o.loc.y, f: 1 }, {});
            const dx = o.loc.x - r.x, dy = o.loc.y - r.y; r.x += dx * 0.18; r.y += dy * 0.18; r.t += 1 / 60 * (Math.abs(dx) + Math.abs(dy) > 1.5 ? 1 : 0.3); r.f = o.loc.f || 1; r.amp = Math.abs(dx) + Math.abs(dy) > 1.5 ? 1 : 0;
            if (inView(r.x, r.y, 60)) list.push({ y: r.y, f: () => { const av = SV.img(o.avatar); shadow(r.x, r.y, 14 * K); PP.Life.drawHuman(ctx, av.img, av.name, r.x, r.y, PH, r.f, r.t, r.amp, null, window.PPCostume ? PPCostume.of(o.id) : ''); label(o.name || 'Teman', r.x, r.y - PH - 8, '#9fe3ff'); } });
          }
          list.push({ y: P.y, f: () => {
            const me = PP.me(), i = imgs[me.idle]; const sw = life && life.swim && life.swim(ctx, P, me.idle, time);
            if (!sw) { shadow(P.x, P.y, 14 * K); PP.Life.drawHuman(ctx, i, me.idle, P.x, P.y, PH, P.f, P.t, P.amp, (c, top) => { const ci = ex.equip.crown && imgs.crown; if (ci) { const cw = 22 * K, chh = cw * ci.naturalHeight / ci.naturalWidth; c.drawImage(ci, -cw / 2, -top + 6 - chh, cw, chh); } }, window.PPCostume ? PPCostume.mine() : ''); }
            label(PP.nm(), P.x, P.y - PH - 8, '#ffe9a0');
          } });
          list.sort((a, b) => a.y - b.y).forEach(o => o.f());
          if (life) life.sky(ctx, inView);
          // jejak bintang & teks melayang
          for (let k = trail.length - 1; k >= 0; k--) { const s = trail[k]; s.t += 1 / 60; if (s.t > 0.7) { trail.splice(k, 1); continue; } ctx.globalAlpha = 1 - s.t / 0.7; ctx.fillStyle = '#ffe066'; ctx.fillRect(s.x - 2, s.y - s.t * 14 - 2, 4, 4); ctx.globalAlpha = 1; }
          for (let k = floats.length - 1; k >= 0; k--) { const f = floats[k]; f.t += 1 / 60; if (f.t > 1.2) { floats.splice(k, 1); continue; } ctx.globalAlpha = Math.min(1, 1.2 - f.t); label(f.txt, f.x, f.y - f.t * 26, f.col); ctx.globalAlpha = 1; }
          // panah penunjuk ke warga yang belum dibantu
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          if (!ex.done[wi]) {
            let tg = null, bd = 1e9; for (const n of npcState) if (!ex.solved[n.q]) { const d = Math.hypot(n.x - P.x, n.y - P.y); if (d < bd) { bd = d; tg = n; } }
            if (tg) { const sx = (tg.x - camX) * Z, sy = (tg.y - 30 - camY) * Z;
              if (sx < 8 || sx > cw - 8 || sy < 8 || sy > ch - 8) {
                const a = Math.atan2(sy - ch / 2, sx - cw / 2), rx = cw / 2 - 26, ry = ch / 2 - 26, k = Math.min(Math.abs(rx / Math.cos(a)), Math.abs(ry / Math.sin(a))), ax = cw / 2 + Math.cos(a) * k, ay = ch / 2 + Math.sin(a) * k;
                ctx.save(); ctx.translate(ax, ay); ctx.rotate(a); ctx.fillStyle = '#ffd34d'; ctx.strokeStyle = '#3a2312'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -9); ctx.lineTo(-8, 9); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore(); } }
          }
        }

        /* --- mulai --- */
        const names = Array.from(new Set(ALL.concat(WORLDS[wi].build.map(b => b[0]), WORLDS[wi].trees, Object.values(PP.AV).reduce((r, v) => r.concat(v.idle, v.walk || []), []))));
        Promise.all(names.map(n => load(n).then(i => { imgs[n] = i; })).concat(D.kind === 'zipcity' ? [PP.Kota.load()] : D.kind === 'sea' || D.kind === 'under' ? [PP.Laut.load()] : [])).then(() => {
          if (!alive) return;
          world = buildWorld(wi, imgs); $('xLoad').remove(); if (window.PPBuat) addCustom(PPBuat.approved());
          const solidHit = (x, y) => { for (const q of world.solids) if (x + 8 > q.x0 && x - 8 < q.x1 && y + 2 > q.y0 && y - 8 < q.y1) return true; return false; };
          life = D.kind === 'sea' || D.kind === 'under' ? PP.Laut.create({ D, P, ctx, world, solved: id => !!ex.solved[id] }) : D.kind === 'zipcity' ? PP.Kota.create({ D, P, shadow, label, world, cam: () => ({ x0: camX, y0: camY, x1: camX + cw / Z, y1: camY + ch / Z }) }) : PP.Life.create({ wi, D, solidHit, P, shadow, label, world });
          if (blocked(P.x, P.y)) { P.x = D.spawn[0]; P.y = D.spawn[1]; }
          PP._xdbg = { world, npcState, P, blocked, D, W, H, life };
          const lc = $('xLoc'); lc.innerHTML = `<small>Kamu masuk ke</small><b>${PP.esc(D.name)}</b>`; lc.hidden = false; lc.classList.remove('go'); void lc.offsetWidth; lc.classList.add('go'); setTimeout(() => { lc.hidden = true; }, 3400);
          say(D.welcome, 4200);
          let last = performance.now();
          const loop = now => {
            if (!alive) return; raf = requestAnimationFrame(loop);
            const dt = Math.min(0.05, (now - last) / 1000); last = now;
            const md = PP.$('#modal'); const paused = busy || PP.alatOpen || (md && !md.hidden);
            if (paused) { joy.x = joy.y = 0; }
            frame(paused ? 0 : dt);
          };
          raf = requestAnimationFrame(loop);
        });
        this._save = () => { ex.pos = { w: wi, x: P.x, y: P.y }; S.save(); };
        this._wi = wi;
      },
      unmount() { alive = false; cancelAnimationFrame(raf); cleanup.forEach(f => f()); try { if (this._save) this._save(); } catch (e) {} }
    };
  };
})();
