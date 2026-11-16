/* =========================================================
   PP.Life — "kehidupan" dunia Jelajah:
   • animasi karakter yang luwes (langkah, miring, napas, memutar halus)
   • kota: tata letak, lalu lintas berlampu merah, pejalan kaki, polisi, rambu
   • hutan/desa: hewan berkeliaran, burung terbang, kupu-kupu
   ========================================================= */
(function () {
  const W = 1500, H = 1100;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TAU = Math.PI * 2;
  function rngf(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- animasi manusia: tubuh atas bergoyang, kaki kiri-kanan bergantian ---------- */
  const CUT = spr => /^(girl|hijab)/.test(spr) ? 0.8 : /^owl/.test(spr) ? 1 : 0.66;
  /* Frame jalan dibuat dari SATU gambar: badan atas utuh, hanya bagian kaki (di bawah pinggul) yang
     bergeser dan terangkat bergantian, dengan rampa halus sehingga tidak ada sambungan / belahan. */
  const NF = 12, PAD = 12, WF = {};
  function analyze(c) {
    const W = c.width, H = c.height, d = c.getContext('2d').getImageData(0, 0, W, H).data, A = (x, y) => d[(y * W + x) * 4 + 3] > 40;
    let top = -1, bottom = -1;
    for (let y = 0; y < H; y++) { let any = false; for (let x = 0; x < W; x++) if (A(x, y)) { any = true; break; } if (any) { if (top < 0) top = y; bottom = y; } }
    const lo = Math.floor(W * 0.28), hi = Math.ceil(W * 0.72); let hip = bottom, miss = 0; const cs = [];
    for (let y = bottom; y > top + (bottom - top) * 0.35; y--) {
      let l = -1, rr = -1; for (let x = 0; x < W; x++) if (A(x, y)) { if (l < 0) l = x; rr = x; }
      if (l < 0) { if (++miss > 2) break; continue; }
      const gx = []; for (let x = Math.max(lo, l + 2); x < Math.min(hi, rr - 1); x++) if (!A(x, y)) { let L = false, R = false; for (let k = l; k < x; k++) if (A(k, y)) { L = true; break; } for (let k = x; k <= rr; k++) if (A(k, y)) { R = true; break; } if (L && R) gx.push(x); }
      if (gx.length) { cs.push(gx.reduce((p, q) => p + q, 0) / gx.length); hip = y; miss = 0; } else if (++miss > 2) break;
    }
    if (bottom - hip < (bottom - top) * 0.08) hip = Math.round(bottom - (bottom - top) * 0.2);
    cs.sort((p, q) => p - q);
    return { top, bottom, hip, cx: cs.length ? cs[cs.length >> 1] : W / 2 };
  }
  function walkFrames(spr, i) {
    if (WF[spr]) return WF[spr];
    const W = i.naturalWidth, H = i.naturalHeight, src = document.createElement('canvas'); src.width = W; src.height = H;
    src.getContext('2d').drawImage(i, 0, 0);
    let an; try { an = analyze(src); } catch (e) { an = { top: 0, bottom: H - 1, hip: Math.round(H * 0.78), cx: W / 2 }; }
    const cx = Math.round(an.cx), legH = Math.max(1, an.bottom - an.hip), frames = [];
    const dxm = Math.min(11, Math.max(5, W * 0.1)), lift = Math.min(12, Math.max(5, legH * 0.28));
    for (let k = 0; k < NF; k++) {
      const ph = 2 * Math.PI * k / NF, c = document.createElement('canvas'); c.width = W + PAD * 2; c.height = H + PAD; const g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      const bob = Math.round(Math.abs(Math.sin(ph)) * 3);
      g.drawImage(src, 0, 0, W, an.hip + 1, PAD, PAD - bob, W, an.hip + 1);             // badan atas utuh
      for (let side = 0; side < 2; side++) {
        const sn = Math.sin(ph + side * Math.PI), lf = Math.max(0, Math.cos(ph + side * Math.PI)), x0 = side ? cx : 0, w = side ? W - cx : cx;
        for (let r = an.hip + 1; r <= H - 1; r++) {
          const t = Math.min(1, (r - an.hip) / legH), dx = Math.round(dxm * sn * Math.pow(t, 1.15)), dy = Math.round(lift * lf * t) + bob;
          g.drawImage(src, x0, r, w, 1, PAD + x0 + dx, PAD + r - dy, w, 1);
        }
      }
      frames.push(c);
    }
    return (WF[spr] = frames);
  }
  function drawHuman(ctx, i, spr, x, y, h, f, t, amp, deco, outfit) {
    if (!i) return 0;
    const iw = i.naturalWidth, ih = i.naturalHeight, w = h * iw / ih, cut = CUT(spr), ph = t * 9.5, s = Math.sin(ph), sc = h / ih;
    const sx = Math.max(0.12, Math.abs(f)) * (f < 0 ? -1 : 1);
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    let bob;
    if (outfit && cut < 1 && window.PPCostume) PPCostume.layer(ctx, outfit, h, amp, t, true);
    if (cut >= 1) {                                          // burung hantu: melayang
      bob = Math.abs(s) * 2.6 * amp + Math.sin(t * 2 + x * 0.05) * 0.7 * (1 - amp);
      ctx.translate(0, -bob); ctx.rotate(s * 0.055 * amp); ctx.drawImage(i, -w / 2, -h, w, h);
    } else if (amp > 0.2) {                                  // berjalan: kaki bergerak, badan utuh
      const fr = walkFrames(spr, i), k = ((Math.floor(ph / (2 * Math.PI) * NF) % NF) + NF) % NF, c = fr[k];
      bob = 0; ctx.rotate(s * 0.018 * amp);
      ctx.drawImage(c, -(w / 2 + PAD * sc), -(h + PAD * sc) + 0, c.width * sc, c.height * sc);
    } else {                                                 // diam: bernapas pelan
      bob = Math.sin(t * 2 + x * 0.05) * 0.7; const sq = 1 + Math.sin(t * 2.2) * 0.012;
      ctx.translate(0, -bob); ctx.scale(1, sq); ctx.drawImage(i, -w / 2, -h, w, h);
    }
    if (outfit && cut < 1 && window.PPCostume) PPCostume.layer(ctx, outfit, h, amp, t, false);
    if (deco) deco(ctx, h);
    ctx.restore(); return bob;
  }

  /* ---------- tata letak kota ---------- */
  function cityLayout() {
    const L = { roads: [{ y0: 345, y1: 435, lanes: [{ y: 368, dir: -1 }, { y: 412, dir: 1 }] }, { y0: 685, y1: 775, lanes: [{ y: 708, dir: -1 }, { y: 752, dir: 1 }] }],
      sw: [[300, 345], [435, 480], [640, 685], [775, 820]], cross: [350, 780, 1170], side: [[300, 400], [730, 830], [1120, 1220]], solids: [], props: [], build: [], banned: [] };
    // deretan gedung utara (di belakang)
    const row1 = [['b_tower_blue', 90], ['b_apart_bata', 100], ['b_tower_abu', 90], ['b_apart_krem', 96], ['b_kantor_hijau', 100], ['b_tower_blue', 90], ['b_apart_krem', 96], ['b_tower_abu', 90], ['b_apart_bata', 100], ['b_kantor_hijau', 100], ['b_tower_blue', 90], ['b_apart_bata', 100], ['b_tower_abu', 90], ['b_apart_krem', 96], ['b_kantor_hijau', 100]];
    let tot = row1.reduce((a, b) => a + b[1], 0), x = 0; const k = W / tot;
    row1.forEach(b => { const w = b[1] * k; L.build.push({ key: b[0], x: x + w / 2, y: 300, w }); x += w; });
    L.solids.push({ x0: 0, x1: W, y0: 0, y1: 300 });
    // deretan toko / gedung (antara dua jalan raya)
    const row2 = [['b_toko_roti', 50, 100], ['b_toko_kafe', 150, 100], ['b_toko_mart', 250, 100], ['b_toko_apotek', 450, 100], ['b_apart_bata', 540, 76], ['b_apart_krem', 615, 70], ['b_toko_buku', 690, 80],
      ['b_bank', 890, 120], ['b_toko_toko', 995, 90], ['b_polisi_gd', 1080, 80], ['b_rs', 1280, 120], ['b_apart_krem', 1375, 70], ['b_toko_mart', 1455, 90]];
    row2.forEach(b => L.build.push({ key: b[0], x: b[1], y: 640, w: b[2] }));
    [[0, 300], [400, 730], [830, 1120], [1220, 1500]].forEach(s => L.solids.push({ x0: s[0], x1: s[1], y0: 486, y1: 640 }));
    L.roads.forEach(r => L.banned.push({ x0: 0, x1: W, y0: r.y0 - 4, y1: r.y1 + 4 }));
    L.banned.push({ x0: 0, x1: W, y0: 0, y1: 345 }, { x0: 0, x1: W, y0: 480, y1: 640 });
    // properti jalan
    const P = (key, x, y, sw, sh) => { L.props.push({ key, x, y }); if (sw) L.solids.push({ x0: x - sw / 2, x1: x + sw / 2, y0: y - (sh || 6), y1: y }); };
    [100, 500, 700, 1000, 1300].forEach(x => P('tiang_lampu', x, 336, 7)); [200, 640, 950, 1250].forEach(x => P('tiang_lampu', x, 472, 7));
    [90, 520, 900, 1330].forEach(x => P('tiang_lampu', x, 678, 7)); [250, 660, 1050, 1420].forEach(x => P('tiang_lampu', x, 812, 7));
    L.cross.forEach((cx, i) => { [[338, 0], [472, 0], [680, 1], [812, 1]].forEach((p, j) => { const left = j % 2 === 0; L.props.push({ key: 'lampu_lalin', x: cx + (left ? -36 : 36), y: p[0], light: i, road: p[1] }); L.solids.push({ x0: cx + (left ? -36 : 36) - 4, x1: cx + (left ? -36 : 36) + 4, y0: p[0] - 6, y1: p[0] }); }); });
    P('rambu_pej', 316, 470, 6); P('rambu_pej', 1136, 340, 6); P('rambu_s30', 60, 340, 6); P('rambu_s30', 1450, 812, 6); P('rambu_park', 700, 340, 6); P('rambu_no', 744, 470, 6); P('rambu_sch', 1230, 340, 6); P('rambu_stop', 1190, 812, 6); P('rambu_park', 40, 470, 6); P('rambu_pej', 800, 812, 6);
    L.props.push({ key: 'halte', x: 600, y: 342 }); L.solids.push({ x0: 574, x1: 580, y0: 336, y1: 342 }, { x0: 620, x1: 626, y0: 336, y1: 342 });
    [[560, 472], [870, 472], [1100, 340], [150, 678], [1000, 812], [400, 812]].forEach(p => P('bangku', p[0], p[1], 26, 8));
    [[420, 340], [180, 472], [980, 472], [750, 678], [1200, 678], [560, 812], [1380, 812]].forEach(p => P('tong_sampah', p[0], p[1], 10, 6));
    [[24, 660], [100, 660], [200, 660], [300, 660], [500, 660], [740, 660], [830, 660], [940, 660], [1050, 660], [1140, 660], [1230, 660], [1450, 660]].forEach(p => P('pot_tanaman', p[0], p[1], 16, 8));
    [[330, 340], [840, 472], [1260, 678], [90, 812]].forEach(p => P('hidran', p[0], p[1], 8, 6));
    P('air_mancur', 745, 960, 46, 12);
    [[665, 985], [830, 985], [745, 1030]].forEach(p => P('bangku', p[0], p[1], 26, 8)); [[690, 910], [800, 910]].forEach(p => P('pot_tanaman', p[0], p[1], 16, 8));
    return L;
  }

  /* ---------- tanah kota ---------- */
  function cityGround(g, L, r, shapes) {
    const grad = g.createLinearGradient(0, 0, 0, 300); grad.addColorStop(0, '#a9d8f2'); grad.addColorStop(1, '#dcefF8'); g.fillStyle = grad; g.fillRect(0, 0, W, 300);
    for (let n = 0; n < 40; n++) { const x = r() * W, h = 60 + r() * 170, w = 30 + r() * 50; g.fillStyle = 'rgba(100,130,170,.35)'; g.fillRect(x, 300 - h, w, h); }
    g.fillStyle = '#6dbb52'; g.fillRect(0, 820, W, H - 820);
    for (let y = 820; y < H; y += 10) for (let x = 0; x < W; x += 10) { const v = r(); if (v < 0.2) { g.fillStyle = '#5aa845'; g.fillRect(x, y, 10, 10); } else if (v > 0.92) { g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x, y, 10, 10); } }
    g.strokeStyle = 'rgba(30,90,30,.35)'; g.lineWidth = 1.4; for (let n = 0; n < 260; n++) { const x = r() * W, y = 830 + r() * 270; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 1.5, y - 4); g.moveTo(x, y); g.lineTo(x + 2, y - 3.5); g.stroke(); }
    // dinding belakang antar-gedung + jalan samping
    g.fillStyle = '#8a7d6a'; g.fillRect(0, 480, W, 160);
    for (let y = 484; y < 640; y += 8) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y, W, 1); }
    L.side.forEach(s => { g.fillStyle = '#555963'; g.fillRect(s[0], 480, s[1] - s[0], 160); g.fillStyle = '#d9d0bd'; g.fillRect(s[0], 480, 6, 160); g.fillRect(s[1] - 6, 480, 6, 160); g.fillStyle = 'rgba(255,255,255,.55)'; for (let y = 492; y < 630; y += 22) g.fillRect((s[0] + s[1]) / 2 - 1.5, y, 3, 12); });
    // trotoar
    L.sw.forEach(b => {
      g.fillStyle = '#d9d0bd'; g.fillRect(0, b[0], W, b[1] - b[0]);
      g.strokeStyle = 'rgba(120,108,86,.28)'; g.lineWidth = 1; for (let x = 0; x < W; x += 30) { g.beginPath(); g.moveTo(x, b[0]); g.lineTo(x, b[1]); g.stroke(); }
      for (let y = b[0] + 15; y < b[1]; y += 15) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    });
    // jalan raya
    L.roads.forEach(rd => {
      g.fillStyle = '#9a917f'; g.fillRect(0, rd.y0 - 3, W, 3); g.fillRect(0, rd.y1, W, 3);
      g.fillStyle = '#474b54'; g.fillRect(0, rd.y0, W, rd.y1 - rd.y0);
      for (let n = 0; n < 500; n++) { g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.08)'; g.fillRect(r() * W, rd.y0 + r() * (rd.y1 - rd.y0), 6 + r() * 14, 2); }
      const my = (rd.y0 + rd.y1) / 2; g.fillStyle = '#f3e07a'; for (let x = 0; x < W; x += 44) g.fillRect(x, my - 1.5, 26, 3);
      g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(0, rd.y0 + 3, W, 2); g.fillRect(0, rd.y1 - 5, W, 2);
      L.cross.forEach(cx => {
        g.fillStyle = 'rgba(255,255,255,.92)'; for (let x = cx - 28; x < cx + 28; x += 9) g.fillRect(x, rd.y0 + 6, 5.5, rd.y1 - rd.y0 - 12);
        g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(cx - 40, rd.y0 + 6, 3, (rd.y1 - rd.y0) / 2 - 6); g.fillRect(cx + 37, my + 1, 3, (rd.y1 - rd.y0) / 2 - 7);
      });
    });
    // area air mancur
    g.fillStyle = '#d9d0bd'; g.beginPath(); g.ellipse(745, 965, 120, 78, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(120,108,86,.35)'; g.lineWidth = 1.2;
    for (let a = 0; a < 16; a++) { g.beginPath(); g.moveTo(745, 965); g.lineTo(745 + Math.cos(a / 16 * TAU) * 120, 965 + Math.sin(a / 16 * TAU) * 78); g.stroke(); }
    g.strokeStyle = '#9a917f'; g.lineWidth = 3; g.beginPath(); g.ellipse(745, 965, 120, 78, 0, 0, TAU); g.stroke();
    (shapes || []).forEach(sh => { if (!sh._g) PP.Shapes.prep(sh); PP.Shapes.draw(g, sh); });
  }

  /* ====================================================
     create(): objek kehidupan dunia untuk satu sesi mount
     ==================================================== */
  function create(o) {
    const { wi, D, solidHit, P, shadow, label, world } = o, r = rngf(4242 + wi * 13), Art = window.PPArt;
    const L = D.layout || null, life = { layout: L };
    const cars = [], peds = [], birds = [], flies = [], animals = [], puffs = [];
    let T = 0;
    /* ----- lampu lalu lintas: hijau 8 dtk, kuning 1,5 dtk, merah 6,5 dtk ----- */
    const CYC = 16, lightAt = i => { const u = (T + i * 5) % CYC; return u < 8 ? 0 : u < 9.5 ? 1 : 2; };
    life.light = lightAt;

    /* ----- lalu lintas ----- */
    if (L) {
      const types = [['car_merah', 52, [72, 92]], ['car_biru', 52, [72, 92]], ['car_hijau', 52, [70, 90]], ['car_putih', 52, [74, 94]], ['car_oranye', 52, [70, 90]], ['car_ungu', 52, [70, 90]], ['car_taxi', 52, [76, 96]], ['bus_biru', 92, [52, 64]], ['bus_oranye', 92, [52, 64]], ['moto_merah', 32, [100, 124]], ['moto_biru', 32, [100, 124]], ['moto_hitam', 32, [98, 120]], ['moto_hijau', 32, [98, 120]], ['car_polisi', 52, [86, 104]]];
      L.roads.forEach((rd, ri) => rd.lanes.forEach((ln, li) => {
        const n = 6; let x = r() * 120;
        for (let k = 0; k < n; k++) {
          const t = types[Math.floor(r() * types.length)], v = t[2][0] + r() * (t[2][1] - t[2][0]);
          cars.push({ key: t[0], len: t[1], x: -60 + x + k * (W + 120) / n + r() * 60, y: ln.y, dir: ln.dir, v: 0, vmax: v, odo: r() * 100, lane: ln, moto: t[0].startsWith('moto'), puff: 0, bus: t[0].startsWith('bus') });
        }
      }));
    }
    function updateCars(dt) {
      for (const c of cars) {
        const dir = c.dir, fp = c.x + dir * c.len / 2; let vt = c.vmax;
        const brake = d => Math.sqrt(2 * 190 * Math.max(0, d));
        // pemimpin di depan
        let gap = 1e9, lead = null; for (const o of cars) if (o !== c && o.lane === c.lane) { const d = (o.x - c.x) * dir; if (d > 0 && d < gap) { gap = d; lead = o; } }
        if (lead) { const g = gap - (c.len + lead.len) / 2 - 12; vt = Math.min(vt, brake(g) + (g < 4 ? 0 : lead.v * 0.5)); if (g < 3) vt = 0; }
        // lampu merah / kuning di penyeberangan
        for (let i = 0; i < L.cross.length; i++) {
          const st = lightAt(i); if (st === 0) continue;
          const stopX = L.cross[i] - dir * 40, d = (stopX - fp) * dir;
          if (d >= -3 && d < 140) { if (st === 2 || d > 30) vt = Math.min(vt, brake(d - 3)); }
        }
        // pemain di depan kendaraan
        if (Math.abs(P.y - c.y) < 24) { const d = (P.x - fp) * dir; if (d > -6 && d < 110) vt = Math.min(vt, brake(d - 18)); }
        c.v += clamp(vt - c.v, -280 * dt, 100 * dt); if (c.v < 0.5 && vt < 1) c.v = 0;
        c.x += dir * c.v * dt; c.odo += c.v * dt;
        if (dir > 0 && c.x > W + 130) c.x = -130 - r() * 80; else if (dir < 0 && c.x < -130) c.x = W + 130 + r() * 80;
        if (c.moto && c.v > 20) { c.puff -= dt; if (c.puff <= 0) { c.puff = 0.14; puffs.push({ x: c.x - dir * c.len * 0.45, y: c.y + 2, t: 0 }); } }
      }
      for (let k = puffs.length - 1; k >= 0; k--) { puffs[k].t += dt; if (puffs[k].t > 0.7) puffs.splice(k, 1); }
    }

    /* ----- pejalan kaki di trotoar ----- */
    if (L) {
      const spr = ['boy_0', 'boy_5', 'boy_6', 'girl_0', 'girl_3', 'hijab_0', 'hijab_1', 'teacher_0', 'teacher_3', 'girl_0'], rows = [322, 458, 662, 797];
      for (let k = 0; k < 9; k++) peds.push({ spr: spr[k % spr.length], x: 40 + r() * (W - 80), y: rows[k % 4] + (r() - 0.5) * 8, dir: r() < 0.5 ? -1 : 1, v: 24 + r() * 10, f: 1, t: r() * 9, amp: 1, wait: 0 });
    }
    function updatePeds(dt) {
      for (const p of peds) {
        p.t += dt; const near = Math.hypot(P.x - p.x, P.y - p.y) < 26;
        if (p.wait > 0) { p.wait -= dt; } else if (near) { p.wait = 0.5; } else if (r() < dt * 0.05) p.wait = 1 + r() * 2;
        const moving = p.wait <= 0; p.amp += ((moving ? 1 : 0) - p.amp) * Math.min(1, dt * 8);
        if (moving) { p.x += p.dir * p.v * dt; if (p.x < 30 || p.x > W - 30) { p.dir *= -1; p.x = clamp(p.x, 30, W - 30); } }
        p.f += (p.dir - p.f) * Math.min(1, dt * 9);
      }
    }

    /* ----- burung & kupu-kupu ----- */
    const nb = D.birds || 0, bk = ['bird_biru', 'bird_merah', 'bird_kuning', 'bird_putih'];
    for (let k = 0; k < nb; k++) birds.push({ key: bk[Math.floor(r() * 4)], x: r() * W, y: 120 + r() * (H - 200), alt: 55 + r() * 60, v: (r() < 0.5 ? -1 : 1) * (38 + r() * 34), ph: r() * 9, t: r() * 9 });
    function updateBirds(dt) { for (const b of birds) { b.t += dt; b.x += b.v * dt; b.ph += dt; if (b.v > 0 && b.x > W + 60) { b.x = -60; b.y = 120 + r() * (H - 200); } else if (b.v < 0 && b.x < -60) { b.x = W + 60; b.y = 120 + r() * (H - 200); } } }
    const nf = D.butterflies || 0;
    for (let k = 0; k < nf; k++) flies.push({ key: 'butterfly_' + (k % 3), hx: 120 + r() * (W - 240), hy: 160 + r() * (H - 300), ph: r() * 9, t: r() * 9 });

    /* ----- hewan hutan ----- */
    const SP = { monyet: { k: 'monkey', sp: 26, stride: 24, sh: 11, nm: 'Monyet' }, singa: { k: 'lion', sp: 20, stride: 32, sh: 19, nm: 'Singa' }, harimau: { k: 'tiger', sp: 22, stride: 32, sh: 19, nm: 'Harimau' }, kijang: { k: 'deer', sp: 28, stride: 36, sh: 15, nm: 'Kijang' }, gajah: { k: 'elephant', sp: 14, stride: 38, sh: 34, nm: 'Gajah' }, kelinci: { k: 'rabbit', sp: 34, stride: 14, sh: 8, nm: 'Kelinci' } };
    (D.animalSpots || []).forEach(a => { const sp = SP[a[0]]; animals.push({ kind: a[0], sp, x: a[1], y: a[2], hx: a[1], hy: a[2], mode: 'idle', wait: r() * 3, tx: 0, ty: 0, face: r() < 0.5 ? 1 : -1, f: 1, t: r() * 9, odo: 0, stuck: 0, amp: 0, rad: a[3] || 80 }); });
    const aHit = (x, y, self) => {
      if (x < 40 || x > W - 40 || y < 80 || y > H - 30) return true;
      if (solidHit(x, y)) return true;
      if (Math.hypot(x - P.x, y - P.y) < 22) return true;
      for (const o of animals) if (o !== self && Math.hypot(x - o.x, y - o.y) < (o.sp.sh + self.sp.sh) * 0.9) return true;
      return false;
    };
    life.hit = (x, y) => {                                   // untuk warga (NPC): jalan raya & hewan
      if (L) for (const rd of L.roads) if (y > rd.y0 - 8 && y < rd.y1 + 12) return true;
      for (const o of animals) if (Math.hypot(x - o.x, y - o.y) < o.sp.sh + 6) return true;
      return false;
    };
    function updateAnimals(dt) {
      for (const a of animals) {
        a.t += dt; const dp = Math.hypot(P.x - a.x, P.y - a.y), sp = a.sp;
        const skittish = a.kind === 'kijang' || a.kind === 'kelinci', curious = a.kind === 'monyet';
        if (skittish && dp < 85) { a.mode = 'flee'; const dx = a.x - P.x, dy = a.y - P.y, m = Math.hypot(dx, dy) || 1; a.tx = clamp(a.x + dx / m * 70, 60, W - 60); a.ty = clamp(a.y + dy / m * 50, 100, H - 50); }
        else if (a.mode === 'flee' && dp > 120) { a.mode = 'idle'; a.wait = 0.8; }
        else if (a.mode === 'idle' && dp < 90 && !skittish) { a.face = P.x >= a.x ? 1 : -1; }
        if (a.mode === 'idle') {
          a.wait -= dt;
          if (a.wait <= 0) {
            a.wait = 1;
            for (let k = 0; k < 8; k++) {
              let tx, ty;
              if (curious && dp < 170 && dp > 60 && r() < 0.6) { tx = P.x + (r() - 0.5) * 90; ty = P.y + 20 + r() * 30; } else { const an = r() * TAU, rad = 30 + r() * a.rad; tx = a.hx + Math.cos(an) * rad; ty = a.hy + Math.sin(an) * rad * 0.7; }
              if (!aHit(tx, ty, a)) { a.tx = tx; a.ty = ty; a.mode = 'walk'; a.stuck = 0; break; }
            }
          }
        }
        if (a.mode === 'walk' || a.mode === 'flee') {
          const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), spd = a.mode === 'flee' ? sp.sp * 3 : sp.sp;
          if (d < 4) { a.mode = 'idle'; a.wait = 1.5 + r() * 4; }
          else {
            const st = spd * dt, nx = a.x + dx / d * st, ny = a.y + dy / d * st; let moved = false;
            if (!aHit(nx, a.y, a)) { a.x = nx; moved = true; } if (!aHit(a.x, ny, a)) { a.y = ny; moved = true; }
            if (Math.abs(dx) > 1) a.face = dx > 0 ? 1 : -1; a.odo += moved ? st : 0;
            a.stuck = moved ? 0 : a.stuck + dt; if (a.stuck > 0.5) { a.mode = 'idle'; a.wait = 0.6; }
          }
        }
        a.amp += ((a.mode === 'idle' ? 0 : 1) - a.amp) * Math.min(1, dt * 8); a.f += (a.face - a.f) * Math.min(1, dt * 8);
      }
    }

    life.update = dt => { T += dt; if (cars.length) updateCars(dt); updatePeds(dt); updateBirds(dt); updateAnimals(dt); };
    life.animals = animals; life.cars = cars; life.peds = peds;

    /* ----- menggambar: dimasukkan ke daftar terurut menurut y ----- */
    life.push = (list, inView, ctx, imgs, T0) => {
      if (L) {
        for (const b of L.build) if (inView(b.x, b.y, b.w + 20)) list.push({ y: b.y, f: () => Art.drawW(ctx, b.key, b.x, b.y, b.w) });
        for (const p of L.props) if (inView(p.x, p.y, 60)) {
          if (p.key === 'lampu_lalin') list.push({ y: p.y, f: () => { shadow(p.x, p.y - 1, 5); Art.draw(ctx, 'lampu_lalin', lightAt(p.light), p.x, p.y); } });
          else if (p.key === 'air_mancur') list.push({ y: p.y, f: () => Art.draw(ctx, p.key, Math.floor(T * 8), p.x, p.y) });
          else list.push({ y: p.y, f: () => { if (p.key !== 'halte') shadow(p.x, p.y - 1, p.key === 'bangku' ? 12 : 5); Art.draw(ctx, p.key, 0, p.x, p.y); } });
        }
        for (const c of cars) if (inView(c.x, c.y, 90)) list.push({ y: c.y + 9, f: () => {
          const fr = Math.floor(c.odo / 3) % 6, sz = Art.size(c.key);
          shadow(c.x, c.y + 9, c.len * 0.46); Art.draw(ctx, c.key, c.key === 'car_polisi' ? Math.floor(T * 6) % 6 : fr, c.x, c.y + 9, { flip: c.dir < 0 });
        } });
        for (const p of peds) if (inView(p.x, p.y, 60)) list.push({ y: p.y, f: () => { shadow(p.x, p.y, 12); drawHuman(ctx, imgs[p.spr], p.spr, p.x, p.y, 54, p.f, p.t, p.amp); } });
      }
      for (const a of animals) if (inView(a.x, a.y, 80)) list.push({ y: a.y, f: () => {
        const s = a.sp, idle = a.mode === 'idle', fl = a.f < 0; let key = s.k, fr;
        if (a.kind === 'kijang') key = idle ? 'deer_idle' : a.mode === 'flee' ? 'deer_run' : 'deer'; else if (idle) key = s.k + '_idle';
        if (idle) fr = Math.floor(a.t * 4) % 8; else if (a.kind === 'kelinci') fr = Math.floor(a.t * 12) % 8; else fr = Math.floor(a.odo / s.stride * 8) % 8;
        const sx = Math.max(0.15, Math.abs(a.f)), hop = 0;
        shadow(a.x, a.y, s.sh); ctx.save(); ctx.translate(a.x, a.y); ctx.scale(sx * (fl ? -1 : 1), 1); Art.draw(ctx, key, fr, 0, 0); ctx.restore();
        const dp = Math.hypot(P.x - a.x, P.y - a.y); if (dp < 80) { ctx.globalAlpha = clamp((80 - dp) / 30, 0, 1); label(s.nm, a.x, a.y - Art.size(key)[1] - 4, '#ffe9a0'); ctx.globalAlpha = 1; }
      } });
      for (const b of flies) if (inView(b.hx, b.hy, 60)) { const t = T + b.ph, x = b.hx + Math.cos(t * 0.7) * 34, y = b.hy + Math.sin(t * 1.1) * 18, alt = 16 + Math.sin(t * 3) * 6; list.push({ y, f: () => { shadow(x, y, 3); Art.draw(ctx, b.key, Math.floor(t * 10) % 6, x, y - alt); } }); }
    };
    /* lapisan langit: burung & asap knalpot (di atas semua) */
    life.sky = (ctx, inView) => {
      for (const p of puffs) { const k = p.t / 0.7; ctx.globalAlpha = 0.35 * (1 - k); ctx.fillStyle = '#d8dbe0'; ctx.beginPath(); ctx.arc(p.x, p.y - k * 8, 2 + k * 4, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
      for (const b of birds) if (inView(b.x, b.y - b.alt, 60)) {
        ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(b.x, b.y, 7, 2.4, 0, 0, TAU); ctx.fill();
        Art.draw(ctx, b.key, Math.floor(b.t * 11) % 8, b.x, b.y - b.alt + Math.sin(b.ph * 2) * 3, { flip: b.v < 0 });
      }
    };
    return life;
  }

  window.PP = window.PP || {};
  PP.Life = { create, drawHuman, cityLayout, cityGround, CUT, rngf };
})();
