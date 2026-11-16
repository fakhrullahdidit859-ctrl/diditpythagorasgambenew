/* =========================================================
   PENJELAJAH LAUT — dunia laut dari paket "Aset_Laut_Pythagoras" (assets/laut/).
   Dua jenis dunia memakai mesin Jelajah yang sama:
     kind 'sea'   : peta laut tampak atas (pantai, air beranimasi, dermaga, pos polisi laut, pulau harta)
     kind 'under' : adegan bawah laut (latar_bawah_laut, didit menyelam)
   API (dipakai explore.js):
     PP.Laut.load()                  -> Promise, memuat semua spritesheet
     PP.Laut.build(D)                -> {objs, solids, coins, deco, ground}
     PP.Laut.create({D,P,ctx,...})   -> {update, base, push, sky, hitBox, hit, fixed, npcDraw, mark, lock, fx, swim}
   Animasi: i = floor(waktu * fps) % jumlah_frame, digambar dari spritesheet satu baris.
   ========================================================= */
(function () {
  const AN = window.LAUT_ANIM, BASE = 'assets/laut/';
  const IMG = {}, got = {};
  const SKIP = { latar_laut_permukaan: 1, latar_peta_laut_atas: 1 };
  function loadImg(name) {
    if (!IMG[name]) IMG[name] = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = BASE + AN[name].src; });
    return IMG[name];
  }
  function load() { return Promise.all(Object.keys(AN).filter(n => !SKIP[n]).map(n => loadImg(n).then(i => { got[n] = i; }))); }
  function rngf(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* gambar satu frame dari spritesheet. o: {s skala, flip, alpha, mid (anchor tengah), f (frame tetap)} */
  function spr(ctx, name, t, x, y, o) {
    o = o || {}; const a = AN[name], im = got[name]; if (!im || !a) return;
    const s = o.s || 1, w = a.w * s, h = a.h * s, i = o.f != null ? o.f : (a.n > 1 ? Math.floor(t * a.fps) % a.n : 0);
    ctx.save(); ctx.translate(Math.round(x), Math.round(y)); if (o.flip) ctx.scale(-1, 1); if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.drawImage(im, i * a.w, 0, a.w, a.h, -w / 2, o.mid ? -h / 2 : -h, w, h); ctx.restore();
  }

  /* ---------- geometri peta laut (satuan dunia 1920 x 1080) ---------- */
  const BEACH = [[0, 0], [380, 0], [372, 70], [352, 140], [322, 215], [285, 285], [240, 350], [190, 415], [130, 475], [70, 530], [0, 585]];
  const SHALLOW = [[0, 0], [560, 0], [550, 90], [520, 180], [480, 270], [430, 360], [370, 440], [300, 520], [220, 590], [130, 650], [0, 720]];
  const ISL = { x: 1480, y: 700, rx: 260, ry: 140 };
  const DEEP = { x: 520, y: 900, rx: 340, ry: 170 };
  const PIER = { x0: 1380, x1: 1470, y0: 0, y1: 300 };
  const DECK = { x0: 690, x1: 870, y0: 250, y1: 345 };
  function inPoly(x, y, pts) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  const inRect = (x, y, r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
  const inEll = (x, y, e) => ((x - e.x) / e.rx) ** 2 + ((y - e.y) / e.ry) ** 2 <= 1;
  function onLand(x, y) { return inPoly(x, y, BEACH) || inRect(x, y, PIER) || inRect(x, y, DECK) || inEll(x, y, ISL); }

  /* ---------- hiasan statis (gambar, nama aset, x, y kaki, skala) ---------- */
  const PROPS_SEA = [
    ['rambu_zona_renang', 'rambu_zona_renang', 215, 330], ['rambu_dilarang_berenang', 'rambu_dilarang_berenang', 130, 420],
    ['rambu_pejalan_kaki', 'rambu_pejalan_kaki', 90, 130], ['rambu_parkir', 'rambu_parkir', 40, 250],
    ['bintang_laut', 'bintang_laut', 100, 350], ['kerang', 'kerang', 205, 290], ['batu_laut', 'batu_laut', 330, 90], ['kerang', 'kerang', 60, 470],
    ['karang_1', 'karang_1', 400, 330], ['karang_2', 'karang_2', 330, 470], ['karang_3', 'karang_3', 240, 570],
    ['rambu_stop', 'rambu_stop', 715, 348], ['rambu_dilarang_masuk', 'rambu_dilarang_masuk', 845, 348], ['rambu_batas_kecepatan', 'rambu_batas_kecepatan', 640, 520],
    ['rambu_hati_hati', 'rambu_hati_hati', 1400, 140], ['rambu_jalur_kapal', 'rambu_jalur_kapal', 1445, 310],
    ['karang_2', 'karang_2', 1190, 620], ['karang_1', 'karang_1', 1760, 830], ['bintang_laut', 'bintang_laut', 1360, 770], ['kerang', 'kerang', 1650, 790],
    ['batu_laut', 'batu_laut', 1330, 650], ['karang_3', 'karang_3', 900, 820]
  ];
  const BUOYS = [['pelampung_tanda_merah', 600, 440], ['pelampung_tanda_hijau', 800, 470], ['pelampung_tanda_kuning', 1000, 480], ['pelampung_tanda_merah', 1200, 450], ['pelampung_tanda_hijau', 1380, 470], ['pelampung_tanda_kuning', 560, 700]];
  const WEEDS = [[350, 520], [380, 545], [270, 600], [300, 618]];
  /* hewan berenang di jalurnya sendiri: [nama, y, x0, x1, kecepatan, skala, fase] — digambar DI BELAKANG pemain */
  const FISH_SEA = [['ikan_oranye', 430, 500, 1150, 38, 0.8, 0.0], ['ikan_biru', 610, 520, 1300, 46, 0.8, 1.7], ['ikan_kuning', 520, 700, 1500, 30, 0.7, 3.1], ['ikan_oranye', 860, 380, 800, 40, 0.7, 2.4],
    ['ikan_biru', 760, 900, 1250, 35, 0.7, 4.2], ['penyu', 960, 700, 1400, 16, 0.9, 0.5], ['lumba_lumba', 1010, 600, 1800, 62, 0.9, 1.1], ['ikan_kuning', 330, 700, 1300, 34, 0.7, 5.0],
    ['kuda_laut', 760, 340, 340, 0, 0.9, 0.7], ['ubur_ubur', 900, 620, 620, 0, 0.9, 2.2], ['ubur_ubur', 990, 1320, 1320, 0, 0.8, 4.0], ['hiu', 1060, 100, 1900, 34, 0.9, 3.3]];
  const FISH_UNDER = [['ikan_oranye', 130, 40, 900, 36, 0.9, 0.0], ['ikan_biru', 220, 60, 900, 30, 0.9, 1.9], ['ikan_kuning', 330, 40, 900, 42, 0.8, 3.7], ['ikan_oranye', 400, 80, 880, 28, 0.7, 2.6],
    ['hiu', 170, 40, 900, 22, 1.0, 1.0], ['paus', 90, 40, 900, 12, 1.0, 5.2], ['lumba_lumba', 290, 60, 900, 46, 0.9, 2.1], ['penyu', 360, 100, 860, 14, 0.9, 4.4],
    ['kuda_laut', 340, 160, 160, 0, 0.9, 0.3], ['kuda_laut', 300, 800, 800, 0, 0.9, 1.4], ['ubur_ubur', 250, 560, 560, 0, 1.0, 2.8], ['ubur_ubur', 330, 330, 330, 0, 0.9, 4.9]];

  /* ---------- membangun dunia ---------- */
  function build(D) {
    const W = D.W, H = D.H, r = rngf(D.kind === 'under' ? 91 : 77);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const solids = [], coins = [];
    const box = (x, y, hw, hh) => solids.push({ x0: x - hw, x1: x + hw, y0: y - hh, y1: y + 4 });
    if (D.kind === 'under') {
      const im = got.latar_bawah_laut; g.imageSmoothingEnabled = true; if (im) g.drawImage(im, 0, 0, W, H);
      solids.push({ x0: 0, x1: W, y0: H - 14, y1: H + 10 });
      [['karang_1', 70], ['karang_3', 180], ['kerang', 330], ['karang_2', 560], ['bintang_laut', 640], ['karang_1', 860]].forEach(p => box(p[1], 500, 18, 8));
    } else {
      const tile = got.ubin_pasir, pat = tile ? g.createPattern(tile, 'repeat') : '#e8cf8a';
      const poly = (pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
      // pantai
      g.save(); poly(BEACH); g.fillStyle = pat; g.fill(); g.clip(); g.strokeStyle = '#f7e9b4'; g.lineWidth = 34; g.lineJoin = 'round'; poly(BEACH); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 6; poly(BEACH); g.stroke();
      for (let i = 0; i < 90; i++) { const x = r() * 330, y = r() * 540; if (inPoly(x, y, BEACH)) { g.fillStyle = r() < 0.5 ? 'rgba(160,120,60,.35)' : 'rgba(255,255,255,.35)'; g.fillRect(x, y, 3, 2); } }
      g.restore();
      // pulau harta
      g.save(); g.beginPath(); g.ellipse(ISL.x, ISL.y, ISL.rx, ISL.ry, 0, 0, 7); g.fillStyle = pat; g.fill(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 6; g.stroke();
      g.beginPath(); g.ellipse(ISL.x, ISL.y - 4, ISL.rx - 56, ISL.ry - 34, 0, 0, 7); g.fillStyle = '#6db95c'; g.fill(); g.strokeStyle = '#4a9a45'; g.lineWidth = 5; g.stroke();
      for (let i = 0; i < 70; i++) { const a = r() * 6.283, d = Math.sqrt(r()), x = ISL.x + Math.cos(a) * (ISL.rx - 66) * d, y = ISL.y - 4 + Math.sin(a) * (ISL.ry - 44) * d; g.fillStyle = r() < 0.5 ? '#7fcb6c' : '#58a44c'; g.fillRect(x, y, 4, 7); }
      g.restore();
      // dermaga ferry & dek pos polisi laut
      const deck = (R, posts) => {
        g.fillStyle = 'rgba(0,40,70,.22)'; g.fillRect(R.x0 + 8, R.y0 + 8, R.x1 - R.x0, R.y1 - R.y0);
        g.fillStyle = '#b98a52'; g.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
        g.strokeStyle = '#8a5e32'; g.lineWidth = 2;
        if (R.x1 - R.x0 < R.y1 - R.y0) for (let y = R.y0 + 16; y < R.y1; y += 16) { g.beginPath(); g.moveTo(R.x0, y); g.lineTo(R.x1, y); g.stroke(); }
        else for (let x = R.x0 + 18; x < R.x1; x += 18) { g.beginPath(); g.moveTo(x, R.y0); g.lineTo(x, R.y1); g.stroke(); }
        g.strokeStyle = '#5b3a1c'; g.lineWidth = 5; g.strokeRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
        g.fillStyle = '#5b3a1c'; posts.forEach(p => { g.beginPath(); g.arc(p[0], p[1], 7, 0, 7); g.fill(); g.fillStyle = '#8a5e32'; g.beginPath(); g.arc(p[0], p[1] - 2, 4, 0, 7); g.fill(); g.fillStyle = '#5b3a1c'; });
      };
      deck(PIER, [[PIER.x0, 60], [PIER.x1, 60], [PIER.x0, 180], [PIER.x1, 180], [PIER.x0, 296], [PIER.x1, 296]]);
      deck(DECK, [[DECK.x0, DECK.y0], [DECK.x1, DECK.y0], [DECK.x0, DECK.y1], [DECK.x1, DECK.y1]]);
      // penghalang
      PROPS_SEA.forEach(p => { if (/^rambu|karang|batu/.test(p[0])) box(p[2], p[3], 10, 6); });
      solids.push({ x0: 1180, x1: 1360, y0: 285, y1: 332 });                   // badan kapal ferry
      solids.push({ x0: 860, x1: 1040, y0: 312, y1: 352 });                    // kapal polisi bersandar
      WEEDS.forEach(w => box(w[0], w[1], 6, 4));
      BUOYS.forEach(b => box(b[1], b[2], 8, 5));
      solids.push({ x0: 1388, x1: 1404, y0: 270, y1: 304 });                   // lampu lalu lintas dermaga
    }
    const npcs = D.npcs;
    const bad = (x, y) => { for (const s of solids) if (x > s.x0 - 22 && x < s.x1 + 22 && y > s.y0 - 22 && y < s.y1 + 22) return true; for (const n of npcs) if (Math.hypot(x - n[2], y - n[3]) < 80) return true; return Math.hypot(x - D.spawn[0], y - D.spawn[1]) < 70; };
    for (let n = 0, tries = 0; n < (D.kind === 'under' ? 4 : 8) && tries < 5000; tries++) {
      const x = 70 + r() * (W - 140), y = (D.kind === 'under' ? 90 : 90) + r() * (H - (D.kind === 'under' ? 220 : 180));
      if (!bad(x, y) && coins.every(q => Math.hypot(q.x - x, q.y - y) > (D.kind === 'under' ? 170 : 260))) { coins.push({ x, y, i: n }); n++; }
    }
    return { objs: [], solids, coins, deco: [], ground: c };
  }

  /* ---------- kehidupan laut ---------- */
  function create(a) {
    const D = a.D, P = a.P, ctx = a.ctx, under = D.kind === 'under', W = D.W, H = D.H;
    let T = 0;
    // pola air (8 frame x 3 jenis)
    const PAT = {};
    ['ubin_air_laut', 'ubin_air_dangkal', 'ubin_air_dalam'].forEach(n => {
      PAT[n] = []; const im = got[n]; if (!im) return;
      for (let f = 0; f < 8; f++) { const c = document.createElement('canvas'); c.width = c.height = 64; c.getContext('2d').drawImage(im, f * 64, 0, 64, 64, 0, 0, 64, 64); PAT[n].push(ctx.createPattern(c, 'repeat')); }
    });
    const pShallow = new Path2D(); SHALLOW.forEach((p, i) => i ? pShallow.lineTo(p[0], p[1]) : pShallow.moveTo(p[0], p[1])); pShallow.closePath();
    pShallow.moveTo(ISL.x + ISL.rx + 90, ISL.y); pShallow.ellipse(ISL.x, ISL.y, ISL.rx + 90, ISL.ry + 62, 0, 0, 7);
    const pDeep = new Path2D(); pDeep.ellipse(DEEP.x, DEEP.y, DEEP.rx, DEEP.ry, 0, 0, 7);
    const pBeach = new Path2D(); BEACH.slice(1, -1).forEach((p, i) => i ? pBeach.lineTo(p[0], p[1]) : pBeach.moveTo(p[0], p[1]));

    // hewan & kapal
    const ANIM = (under ? FISH_UNDER : FISH_SEA).map(f => ({ n: f[0], y: f[1], x0: f[2], x1: f[3], sp: f[4], s: f[5], ph: f[6], x: f[2] + (f[3] - f[2]) * ((f[6] * 0.37) % 1), d: 1 }));
    const BOATS = under ? [] : [
      { n: 'kapal_layar', y: 150, x: 700, sp: 26, mode: 'ping', x0: 620, x1: 1290, d: 1, s: 1 },
      { n: 'speedboat', y: 515, x: 400, sp: 78, mode: 'ping', x0: 250, x1: 1840, d: 1, s: 0.95 },
      { n: 'banana_boat', y: 720, x: 800, sp: 46, mode: 'ping', x0: 760, x1: 1120, d: 1, s: 0.95 }
    ];
    const B_STATIC = under ? [] : [{ n: 'kapal_polisi', x: 950, y: 350, flip: true, s: 0.95 }];
    BOATS.forEach(b => { b.v = b.sp; });
    const eff = [];                                              // {k:'splash'|'kilau', x, y, t, d}
    const bubbles = under ? Array.from({ length: 9 }, (_, i) => ({ x: 60 + i * 105 + (i % 3) * 20, ph: i * 1.3, sp: 22 + (i % 4) * 5 })) : [];
    let wasLand = !under && onLand(P.x, P.y), landNow = wasLand, lx = P.x, ly = P.y, axis = 'v', dirName = 'bawah', left = false;

    const bodyBox = b => { const an = AN[b.n]; return { x0: b.x - an.w * 0.4 * (b.s || 1), x1: b.x + an.w * 0.4 * (b.s || 1), y0: b.y - 30, y1: b.y + 4 }; };

    function update(dt) {
      if (!dt) return; T += dt;
      for (const f of ANIM) {
        if (f.x1 === f.x0) continue;
        f.x += f.d * f.sp * dt; if (f.x > f.x1) { f.x = f.x1; f.d = -1; } else if (f.x < f.x0) { f.x = f.x0; f.d = 1; }
      }
      for (const b of BOATS) {
        const an = AN[b.n], hw = an.w * 0.5;
        // mengerem bila pemain ada di depan haluan
        const ahead = (P.x - b.x) * b.d, near = ahead > 0 && ahead < hw + 70 && Math.abs(P.y - (b.y - 14)) < 40;
        const tg = near ? 0 : b.sp, acc = near ? 160 : 40; b.v += Math.max(-acc * dt, Math.min(acc * dt, tg - b.v));
        b.x += b.d * b.v * dt;
        if (b.mode === 'wrap') { if (b.x > W + hw + 20) b.x = -hw - 20; }
        else { if (b.x > b.x1) { b.x = b.x1; b.d = -1; } if (b.x < b.x0) { b.x = b.x0; b.d = 1; } }
      }
      // air / darat, percikan sekali saat masuk air
      if (!under) { landNow = onLand(P.x, P.y); if (wasLand && !landNow) eff.push({ k: 'splash', x: P.x, y: P.y + 8, t: 0, d: 0.6 }); wasLand = landNow; }
      // arah renang (histeresis 20%)
      const dx = P.x - lx, dy = P.y - ly; lx = P.x; ly = P.y;
      if (Math.abs(dx) + Math.abs(dy) > 0.05) {
        if (axis === 'h' && Math.abs(dy) > Math.abs(dx) * 1.2) axis = 'v'; else if (axis === 'v' && Math.abs(dx) > Math.abs(dy) * 1.2) axis = 'h';
        dirName = axis === 'h' ? (dx > 0 ? 'kanan' : 'kiri') : (dy > 0 ? 'bawah' : 'atas');
        if (Math.abs(dx) > 0.05) left = dx < 0;
      }
      for (let i = eff.length - 1; i >= 0; i--) { eff[i].t += dt; if (eff[i].t > eff[i].d) eff.splice(i, 1); }
    }

    /* lapisan paling bawah: air beranimasi, tanah, hewan di belakang */
    function base(g) {
      if (under) {
        g.imageSmoothingEnabled = true; g.drawImage(a.world.ground, 0, 0, W, H);
        g.globalAlpha = 0.07 + 0.04 * Math.sin(T * 0.8); g.fillStyle = '#fff';           // berkas cahaya berayun
        for (let i = 0; i < 3; i++) { const x = 150 + i * 330 + Math.sin(T * 0.5 + i) * 18; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 90, 0); g.lineTo(x + 190, 430); g.lineTo(x + 40, 430); g.fill(); }
        g.globalAlpha = 1;
        [[70, 'rumput_laut'], [250, 'rumput_laut'], [430, 'rumput_laut'], [760, 'rumput_laut'], [900, 'rumput_laut']].forEach((w, i) => spr(g, w[1], T + i * 0.7, w[0], 500));
      } else {
        const f = Math.floor(T * 4) % 8;
        g.fillStyle = PAT.ubin_air_laut[f] || '#3a9be0'; g.fillRect(0, 0, W, H);
        g.save(); g.clip(pShallow); g.fillStyle = PAT.ubin_air_dangkal[f] || '#6cc6f0'; g.fillRect(0, 0, W, H); g.restore();
        g.save(); g.clip(pDeep); g.fillStyle = PAT.ubin_air_dalam[f] || '#1f6fb8'; g.fillRect(0, 0, W, H); g.restore();
        g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 3; g.stroke(pShallow); g.stroke(pDeep);
        g.drawImage(a.world.ground, 0, 0, W, H);
        // buih ombak di garis pantai & pulau
        g.save(); g.lineCap = 'round'; g.setLineDash([26, 18]); g.lineDashOffset = -T * 14; g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 4 + Math.sin(T * 2) * 1.2;
        g.translate(Math.sin(T * 1.4) * 4, Math.sin(T * 1.1) * 2); g.stroke(pBeach);
        g.beginPath(); g.ellipse(ISL.x, ISL.y, ISL.rx + 4, ISL.ry + 4, 0, 0, 7); g.stroke(); g.restore();
      }
      // hewan berenang pelan di belakang semuanya
      for (const f of ANIM) {
        const bob = Math.sin(T * (f.sp ? 1.6 : 1.1) + f.ph) * (f.sp ? 5 : 9);
        if (under) { const al = f.n === 'paus' ? 0.85 : 1; spr(g, f.n, T + f.ph, f.x, f.y + bob, { flip: f.d < 0, s: f.s, mid: true, alpha: al }); }
        else spr(g, f.n, T + f.ph, f.x, f.y + bob, { flip: f.d < 0, s: f.s, mid: true, alpha: 0.95 });
      }
      if (under) {
        const kx = 360 + Math.sin(T * 0.7) * 90; spr(g, 'kepiting', T, kx, 520, { s: 0.8 });
        bubbles.forEach(b => { const y = (500 - ((T * b.sp + b.ph * 60) % 470)); spr(g, 'gelembung', T + b.ph, b.x + Math.sin(T * 1.5 + b.ph) * 10, y, { s: 0.7, alpha: 0.8 }); });
      }
    }

    /* objek yang diurutkan menurut y */
    function put(list, y, f) { list.push({ y, f }); }
    function push(list, inView, g) {
      if (under) {
        [['karang_1', 70], ['karang_3', 180], ['kerang', 330], ['karang_2', 560], ['bintang_laut', 640], ['karang_1', 860]].forEach(p => put(list, 500, () => spr(g, p[0], T, p[1], 504)));
        return;
      }
      PROPS_SEA.forEach(p => { if (inView(p[2], p[3], 90)) put(list, p[3], () => spr(g, p[1], T, p[2], p[3], { s: 0.72 })); });
      BUOYS.forEach(b => { if (inView(b[1], b[2], 90)) put(list, b[2], () => spr(g, b[0], T + b[1] * 0.01, b[1], b[2] + Math.sin(T * 1.8 + b[1]) * 2, { s: 0.8 })); });
      WEEDS.forEach(w => { if (inView(w[0], w[1], 90)) put(list, w[1], () => spr(g, 'rumput_laut', T + w[0] * 0.01, w[0], w[1], { s: 0.8 })); });
      // lampu lalu lintas dermaga: merah -> hijau -> kuning (diganti lewat kode)
      const ph = T % 14, fr = ph < 6 ? 2 : ph < 7.5 ? 1 : 0;
      [[1396, 304], [790, 262]].forEach(l => { if (inView(l[0], l[1], 90)) put(list, l[1], () => spr(g, 'lampu_lalu_lintas', 0, l[0], l[1], { f: fr, s: 0.75 })); });
      B_STATIC.forEach(b => { const by = Math.sin(T * 1.4) * 2; put(list, b.y, () => { rip(g, b.x, b.y, 80); spr(g, b.n, T, b.x, b.y + by, { flip: b.flip, s: b.s }); }); });
      BOATS.forEach(b => { if (!inView(b.x, b.y, 220)) return; const by = Math.sin(T * 1.6 + b.y) * 2; put(list, b.y, () => { rip(g, b.x, b.y, AN[b.n].w * 0.38); spr(g, b.n, T, b.x, b.y + by, { flip: b.d < 0, s: b.s }); }); });
    }
    function rip(g, x, y, rx) {
      g.save(); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2;
      for (let k = 0; k < 2; k++) { const u = ((T * 0.5 + k * 0.5) % 1); g.globalAlpha = 0.6 * (1 - u); g.beginPath(); g.ellipse(x, y + 2, rx * (0.7 + u * 0.4), rx * 0.16 * (0.7 + u * 0.4), 0, 0, 7); g.stroke(); }
      g.restore();
    }

    /* efek di atas segalanya: percikan sekali, kilau */
    function sky(g) {
      for (const e of eff) {
        if (e.t < 0) continue;
        if (e.k === 'splash') spr(g, 'percikan', 0, e.x, e.y, { mid: true, s: 0.9, f: Math.min(7, Math.floor(e.t / e.d * 8)) });
        else spr(g, 'kilau', e.t, e.x, e.y, { mid: true, s: 0.9 });
      }
    }

    function hitBox(x0, x1, y0, y1) {
      const hit = b => x1 > b.x0 && x0 < b.x1 && y1 > b.y0 && y0 < b.y1;
      for (const b of BOATS) if (hit(bodyBox(b))) return true;
      return false;
    }

    /* ---- hook untuk explore.js ---- */
    const NPCV = {        // anim, skala, tinggi label, melayang
      'laut:penjaga_pantai': ['penjaga_pantai', 0.9, 72, 0], 'laut:polisi_lalu_lintas': ['polisi_lalu_lintas', 0.9, 72, 0], 'laut:kapal_ferry': ['kapal_ferry', 1, 118, 1],
      'laut:pelampung_donat': ['pelampung_donat', 1.4, 54, 1], 'laut:peti_harta': ['peti_harta', 1, 64, 0], 'laut:gurita': ['gurita', 0.95, 92, 0]
    };
    function npcDraw(g, n, time) {
      const v = NPCV[n.spr]; if (!v) return null;
      const bob = v[3] ? Math.sin(time * 1.6 + n.x) * 2.5 : 0;
      if (v[3]) rip(g, n.x, n.y, AN[v[0]].w * v[1] * 0.38);
      else { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(n.x, n.y, 18, 6, 0, 0, 7); g.fill(); }
      spr(g, v[0], time, n.x, n.y + bob, { s: v[1], flip: n.spr === 'laut:kapal_ferry' ? false : n.f < 0 && n.spr !== 'laut:peti_harta' ? true : false });
      return { h: v[2], noShadow: true };
    }
    function mark(g, n, x, y, solved, time) { spr(g, solved ? 'ikon_centang' : 'ikon_seru', time, x, y + 2 + (solved ? 0 : Math.sin(time * 5) * 2), { s: 0.85 }); return true; }
    function swim(g, p, idle, time) {
      if (under) {
        const mv = Math.abs(p.amp) > 0.2, y = p.y - 4 + Math.sin(time * 2) * (mv ? 1 : 3);
        g.fillStyle = 'rgba(0,30,60,.18)'; g.beginPath(); g.ellipse(p.x, p.y + 26, 34, 7, 0, 0, 7); g.fill();
        spr(g, 'didit_menyelam_samping', mv ? time : time * 0.35, p.x, y, { mid: true, flip: left, s: 0.95 });
        return true;
      }
      if (landNow) return false;
      const mv = p.amp > 0.2;
      g.save(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2;
      for (let k = 0; k < 3; k++) { const u = ((T * (mv ? 0.9 : 0.45) + k / 3) % 1); g.globalAlpha = 0.75 * (1 - u); g.beginPath(); g.ellipse(p.x, p.y + 8, 22 + u * 26, (22 + u * 26) * 0.3, 0, 0, 7); g.stroke(); }
      g.restore();
      spr(g, 'didit_renang_' + dirName, mv ? time : time * 0.4, p.x, p.y + 14, { s: 0.9 });
      return true;
    }
    function lock(n) {
      if (D.name === 'Penjelajah Laut' && n.spr === 'laut:peti_harta') {
        const need = 4, ids = [200, 201, 202, 203, 204], got4 = ids.filter(i => a.solved(i)).length;
        if (got4 < need) return `Peti Harta terkunci. Jawab dulu minimal ${need} dari 5 pos lainnya (sekarang ${got4}/5).`;
      }
      return null;
    }
    function fx(x, y) { for (let k = 0; k < 5; k++) eff.push({ k: 'kilau', x: x + (k - 2) * 20 + (k % 2) * 6, y: y - 12 - (k % 3) * 16, t: -k * 0.08, d: 1.0 }); }

    return { update, base, push, sky, hitBox, hit: () => false, fixed: () => true, npcDraw, mark, swim, lock, fx, onLand, T: () => T };
  }

  window.PP = window.PP || {};
  PP.Laut = { load, build, create, onLand, BEACH, ISL, DEEP, PIER, DECK };
})();
