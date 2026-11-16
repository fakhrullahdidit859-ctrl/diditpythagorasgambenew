/* =========================================================
   PPArt kota — kendaraan, gedung, toko, lampu lalu lintas, rambu, properti jalan.
   Dimuat setelah art.js.
   ========================================================= */
(function () {
  const { Px, mix } = PPArt, TAU = Math.PI * 2;
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* huruf piksel 3x5 untuk papan nama */
  const FONT = { A: '010101111101101', B: '110101110101110', E: '111100110100111', F: '111100110100100', H: '101101111101101', I: '111010010010111', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '111101101101111', P: '111101111100100', R: '110101110101101', S: '111100111001111', T: '111010010010010', U: '101101101101111', '3': '111001111001111', '0': '111101101101111', ' ': '000000000000000' };
  const textW = s => s.length * 4 - 1;
  function text(p, x, y, s, col) { let cx = x; for (const ch of s) { const g = FONT[ch] || FONT[' ']; for (let i = 0; i < 15; i++) if (g[i] === '1') p.r(cx + i % 3, y + Math.floor(i / 3), 1, 1, col); cx += 4; } }
  const center = (p, w, y, s, col) => text(p, Math.round((w - textW(s)) / 2), y, s, col);

  /* ================= KENDARAAN (tampak samping, menghadap kanan) ================= */
  function wheel(p, cx, cy, r, ang) {
    p.e(cx, cy, r, r, '#1d1d22'); p.e(cx, cy, r - 3, r - 3, '#b9bec8'); p.e(cx, cy, 1.6, 1.6, '#555b66');
    for (let k = 0; k < 3; k++) { const a = ang + k * TAU / 3; p.line(cx, cy, cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3), '#6b717c', 1); }
  }
  function car(f, n, o) {
    const p = new Px(90, 40), ang = f / n * (TAU / 3); p.ax = 45; p.ay = 37;
    const body = o.body, dk = mix(body, -0.3);
    p.e(21, 28, 9, 7, dk); p.e(67, 28, 9, 7, dk);
    p.r(5, 17, 80, 12, body); p.e(8, 23, 4, 6, body); p.e(82, 23, 4, 6, body);
    p.poly([[22, 17], [28, 5], [58, 5], [68, 17]], body);
    p.poly([[25, 16], [30, 7], [42, 7], [42, 16]], '#c7ebff'); p.poly([[45, 7], [57, 7], [64, 16], [45, 16]], '#c7ebff');
    p.line(30, 8, 36, 8, '#fff', 1); p.line(46, 8, 52, 8, '#fff', 1);
    p.r(43, 6, 2, 11, dk); p.r(43, 19, 1, 8, dk); p.r(38, 21, 4, 1, mix(body, 0.4)); p.r(52, 21, 4, 1, mix(body, 0.4));
    p.r(5, 26, 80, 3, dk); p.r(80, 19, 5, 4, '#fff3a0'); p.r(4, 19, 3, 4, '#e53935'); p.r(2, 28, 85, 2, '#8b919c');
    if (o.stripe) p.r(5, 22, 80, 3, o.stripe);
    if (o.taxi) { p.r(38, 1, 12, 4, '#2b2b2b'); p.r(39, 2, 10, 2, '#ffe066'); }
    if (o.siren) { const a = f % 2; p.r(36, 1, 6, 4, a ? '#ff3b3b' : '#7a1c1c'); p.r(42, 1, 6, 4, a ? '#1c3a7a' : '#3b82ff'); p.r(35, 4, 14, 1, '#555'); }
    wheel(p, 21, 30, 7, ang); wheel(p, 67, 30, 7, ang);
    return p;
  }
  [['merah', '#e04545'], ['biru', '#3d78c4'], ['hijau', '#4caf70'], ['putih', '#f1f3f6'], ['oranye', '#f08a2c'], ['ungu', '#8a63c9']].forEach(c => PPArt.def('car_' + c[0], { s: 0.58, n: 6, mk: (f, n) => car(f, n, { body: c[1] }) }));
  PPArt.def('car_taxi', { s: 0.58, n: 6, mk: (f, n) => car(f, n, { body: '#f6c12e', taxi: true, stripe: '#2b2b2b' }) });
  PPArt.def('car_polisi', { s: 0.58, n: 6, mk: (f, n) => car(f, n, { body: '#f4f6fa', stripe: '#2a56c6', siren: true }) });

  function bus(f, n, body) {
    const p = new Px(156, 56), ang = f / n * (TAU / 3), dk = mix(body, -0.3); p.ax = 78; p.ay = 52;
    p.e(36, 44, 10, 8, dk); p.e(118, 44, 10, 8, dk);
    p.r(4, 8, 148, 36, body); p.e(8, 26, 4, 18, body); p.r(4, 8, 148, 4, mix(body, 0.25)); p.r(4, 36, 148, 4, dk); p.r(2, 42, 152, 2, '#8b919c');
    for (let i = 0; i < 8; i++) { p.r(12 + i * 13, 14, 11, 13, '#c7ebff'); p.r(13 + i * 13, 15, 4, 1, '#fff'); }
    p.r(104, 14, 14, 24, dk); p.r(106, 16, 4, 20, '#c7ebff'); p.r(112, 16, 4, 20, '#c7ebff');
    p.poly([[132, 12], [150, 12], [152, 36], [132, 36]], '#c7ebff'); p.r(134, 14, 5, 1, '#fff');
    p.r(124, 4, 24, 5, '#2b2b2b'); p.r(126, 5, 20, 3, '#ffb62e'); p.r(148, 30, 4, 5, '#fff3a0'); p.r(4, 30, 3, 5, '#e53935'); p.r(60, 29, 40, 2, '#fff');
    wheel(p, 36, 45, 8, ang); wheel(p, 118, 45, 8, ang);
    return p;
  }
  PPArt.def('bus_biru', { s: 0.58, n: 6, mk: (f, n) => bus(f, n, '#3d9be0') });
  PPArt.def('bus_oranye', { s: 0.58, n: 6, mk: (f, n) => bus(f, n, '#f08a2c') });

  function moto(f, n, o) {
    const p = new Px(56, 46), ang = f / n * (TAU / 3), bob = Math.sin(f / n * TAU * 2) * 0.7; p.ax = 28; p.ay = 44;
    p.line(11, 37, 24, 29, '#444b58', 2); p.line(24, 29, 40, 37, '#444b58', 2); p.line(40, 37, 36, 21, '#8b919c', 2); p.line(36, 21, 41, 18, '#2b2b2b', 2);
    p.e(28, 27, 7, 4, o.body); p.poly([[14, 26], [26, 24], [26, 29], [13, 29]], '#2b2b2b'); p.r(9, 24, 5, 2, '#e53935'); p.r(40, 20, 3, 3, '#fff3a0');
    wheel(p, 11, 37, 7, ang); wheel(p, 41, 37, 7, ang);
    p.line(18, 25, 22, 34 - bob, '#2b3a67', 3);                                       // kaki
    p.e(21, 19 - bob, 5, 8, o.jacket);                                                  // badan condong
    p.line(23, 15 - bob, 37, 20, mix(o.jacket, -0.15), 3);                              // lengan ke setang
    p.e(26, 9 - bob, 5, 5, '#f0c49a'); p.e(26, 7 - bob, 6.5, 5.5, o.helmet); p.r(28, 8 - bob, 5, 3, '#7ac8ff'); p.r(17, 4 - bob, 4, 2, mix(o.helmet, 0.3));
    return p;
  }
  [['merah', '#e04545', '#3a7fd0'], ['biru', '#3d78c4', '#f0c040'], ['hitam', '#33363d', '#e85a4f'], ['hijau', '#3fa66b', '#fafafa']].forEach((c, i) => PPArt.def('moto_' + c[0], { s: 0.55, n: 6, mk: (f, n) => moto(f, n, { body: c[1], jacket: ['#2b6fd0', '#d94a4a', '#f0a02c', '#2c9a6a'][i], helmet: c[2] }) }));

  /* ================= GEDUNG ================= */
  function windowsGrid(p, x0, y0, x1, y1, cols, rows, o, r) {
    const cw = (x1 - x0) / cols, rh = (y1 - y0) / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const wx = x0 + i * cw + Math.max(1, cw * 0.18), wy = y0 + j * rh + Math.max(1, rh * 0.2), ww = Math.max(3, cw * 0.64), wh = Math.max(3, rh * 0.58), lit = r() < 0.22;
      if (o.frame) p.r(wx - 1, wy - 1, ww + 2, wh + 2, o.frame);
      p.r(wx, wy, ww, wh, lit ? '#ffe9a0' : o.glass); p.r(wx, wy, ww, 1, mix(lit ? '#ffe9a0' : o.glass, 0.4));
      if (o.balcony && j > 0) p.r(wx - 1, wy + wh, ww + 2, 2, o.balcony);
    }
  }
  function building(kind) {
    const r = rng(kind.length * 977 + kind.charCodeAt(0) * 31), P = {
      tower_blue: { w: 60, h: 160, wall: '#4f7fb4', glass: '#a8dcf8', frame: '#35618f', cols: 5, rows: 14, top: 'antenna', door: true },
      tower_abu: { w: 64, h: 180, wall: '#8c94a6', glass: '#cfe3f2', frame: '#5d6678', cols: 5, rows: 16, top: 'step', door: true },
      apart_bata: { w: 64, h: 108, wall: '#c0623c', glass: '#86c9f0', frame: '#f4e9d0', cols: 4, rows: 6, top: 'ledge', door: true, balcony: '#3a2a1a', brick: true },
      apart_krem: { w: 62, h: 128, wall: '#efdcb2', glass: '#8fd0f5', frame: '#b98a4e', cols: 4, rows: 8, top: 'ledge', door: true, balcony: '#8a6a3a' },
      kantor_hijau: { w: 68, h: 140, wall: '#5aa186', glass: '#c9efe0', frame: '#3b7a63', cols: 5, rows: 11, top: 'step', door: true }
    }[kind];
    if (P) {
      const p = new Px(P.w, P.h), top = P.top === 'antenna' ? 18 : P.top === 'step' ? 8 : 5; p.ax = P.w / 2; p.ay = P.h;
      const gh = 18;
      p.r(0, top, P.w, P.h - top, P.wall);
      if (P.brick) p.atop(q => { for (let y = top + 3; y < P.h; y += 4) q.r(0, y, P.w, 1, mix(P.wall, -0.18)); });
      p.r(0, top, 3, P.h - top, mix(P.wall, 0.15)); p.r(P.w - 4, top, 4, P.h - top, mix(P.wall, -0.2));
      windowsGrid(p, 6, top + 6, P.w - 6, P.h - gh - 2, P.cols, P.rows, P, r);
      p.r(0, P.h - gh, P.w, gh, mix(P.wall, -0.15)); p.r(0, P.h - gh, P.w, 2, mix(P.wall, 0.3));
      p.r(P.w / 2 - 8, P.h - 14, 16, 14, '#c7ebff'); p.r(P.w / 2 - 1, P.h - 14, 2, 14, P.frame); p.r(P.w / 2 - 10, P.h - 17, 20, 3, '#e04545');
      p.r(6, P.h - 13, 10, 8, '#c7ebff'); p.r(P.w - 16, P.h - 13, 10, 8, '#c7ebff');
      p.r(-0, top - 3, P.w, 4, mix(P.wall, -0.35)); p.r(0, top - 3, P.w, 1, mix(P.wall, 0.3));
      if (P.top === 'antenna') { p.r(P.w / 2 - 1, 2, 2, 14, '#555b66'); p.r(P.w / 2 - 1, 0, 2, 2, '#ff4040'); p.r(P.w / 2 - 6, top - 6, 12, 4, mix(P.wall, -0.3)); }
      if (P.top === 'step') { p.r(10, 0, P.w - 20, 8, mix(P.wall, -0.1)); p.r(10, 0, P.w - 20, 1, mix(P.wall, 0.3)); p.r(P.w / 2 + 6, -0, 1, 1, '#fff'); }
      return p;
    }
    const S = {
      toko_roti: { w: 78, h: 66, wall: '#f3c47b', aw: ['#e04545', '#fff'], name: 'ROTI', sign: '#8a4a1f', item: '#d98b3a' },
      toko_kafe: { w: 78, h: 66, wall: '#8a5a3c', aw: ['#3e9a5b', '#fff'], name: 'KAFE', sign: '#2b1a12', item: '#f4e1c0' },
      toko_mart: { w: 86, h: 66, wall: '#4a8fe0', aw: ['#f08a2c', '#fff'], name: 'MART', sign: '#1e4a8a', item: '#ffe066' },
      toko_apotek: { w: 82, h: 66, wall: '#eef4ee', aw: ['#3e9a5b', '#fff'], name: 'APOTEK', sign: '#2f7a4a', item: '#e04545', cross: true },
      toko_buku: { w: 74, h: 66, wall: '#8a63c9', aw: ['#f0c040', '#fff'], name: 'BUKU', sign: '#4a2f7a', item: '#e04545' },
      toko_toko: { w: 76, h: 66, wall: '#e8845a', aw: ['#2d6fd0', '#fff'], name: 'TOKO', sign: '#8a3a1a', item: '#7ec8ff' }
    }[kind];
    if (S) {
      const p = new Px(S.w, S.h); p.ax = S.w / 2; p.ay = S.h;
      p.r(0, 8, S.w, S.h - 8, S.wall); p.r(0, 8, S.w, 3, mix(S.wall, 0.25)); p.r(-1, 4, S.w + 2, 5, mix(S.wall, -0.3)); p.r(-1, 4, S.w + 2, 1, mix(S.wall, 0.35));
      p.r(6, 12, S.w - 12, 11, S.sign); p.r(6, 12, S.w - 12, 1, mix(S.sign, 0.4)); center(p, S.w, 15, S.name, '#fff');
      if (S.cross) { p.r(S.w - 14, 14, 7, 7, '#fff'); p.r(S.w - 12, 14, 3, 7, '#e04545'); p.r(S.w - 14, 16, 7, 3, '#e04545'); }
      for (let i = 0; i < S.w; i += 6) { p.r(i, 25, 6, 6, (i / 6) % 2 ? S.aw[1] : S.aw[0]); p.e(i + 3, 31, 3, 2, (i / 6) % 2 ? S.aw[1] : S.aw[0]); }
      p.r(0, 25, S.w, 1, 'rgba(255,255,255,.35)');
      p.r(7, 35, S.w - 30, 22, '#bfe6fb'); p.r(7, 35, S.w - 30, 2, '#fff'); p.r(6, 34, S.w - 28, 1, '#444'); p.r(6, 57, S.w - 28, 2, mix(S.wall, -0.3));
      for (let i = 0; i < 4; i++) p.r(10 + i * 9, 46, 6, 9, S.item);
      p.r(S.w - 20, 35, 14, 31, mix(S.wall, -0.35)); p.r(S.w - 18, 37, 10, 22, '#9fd8f5'); p.r(S.w - 10, 50, 2, 3, '#ffd34d');
      p.r(0, S.h - 4, S.w, 4, '#8b919c');
      return p;
    }
    if (kind === 'bank') {
      const p = new Px(96, 84); p.ax = 48; p.ay = 84;
      p.poly([[0, 22], [48, 2], [96, 22]], '#d6cfc0'); p.poly([[10, 21], [48, 6], [86, 21]], '#ece6d8'); p.e(48, 15, 5, 5, '#c9a64a');
      p.r(0, 22, 96, 6, '#c9c1b0'); p.r(4, 28, 88, 46, '#ece6d8'); p.r(4, 28, 88, 2, '#fff');
      for (let i = 0; i < 6; i++) { p.r(9 + i * 15, 28, 8, 46, '#fbf7ec'); p.r(9 + i * 15, 28, 2, 46, '#fff'); p.r(15 + i * 15, 28, 2, 46, '#bfb7a2'); }
      p.r(36, 40, 24, 34, '#2b4a7a'); p.r(38, 42, 20, 30, '#9fd8f5'); p.r(47, 42, 2, 30, '#2b4a7a');
      p.r(0, 74, 96, 4, '#c9c1b0'); p.r(-2, 78, 100, 6, '#b3ab98');
      p.r(32, 31, 32, 7, '#2b4a7a'); center(p, 96, 33, 'BANK', '#ffe066');
      return p;
    }
    if (kind === 'rs') {
      const p = new Px(96, 100); p.ax = 48; p.ay = 100;
      p.r(0, 14, 96, 86, '#f4f7fa'); p.r(0, 14, 96, 5, '#d0d8e2'); p.r(0, 56, 96, 5, '#3d9be0');
      p.r(34, 0, 28, 20, '#e8eef4'); p.r(44, 4, 8, 12, '#e04545'); p.r(40, 8, 16, 4, '#e04545'); p.r(34, 0, 28, 1, '#fff');
      windowsGrid(p, 6, 24, 90, 54, 6, 2, { glass: '#a8dcf8', frame: '#9fb4c8' }, rng(9));
      windowsGrid(p, 6, 64, 90, 82, 6, 1, { glass: '#a8dcf8', frame: '#9fb4c8' }, rng(10));
      p.r(36, 76, 24, 24, '#8fa6bd'); p.r(38, 78, 20, 22, '#c7ebff'); p.r(47, 78, 2, 22, '#8fa6bd'); p.r(30, 70, 36, 5, '#e04545'); center(p, 96, 71, 'RS', '#fff');
      p.r(0, 96, 96, 4, '#aab4c0');
      return p;
    }
    if (kind === 'polisi') {
      const p = new Px(86, 78); p.ax = 43; p.ay = 78;
      p.r(0, 12, 86, 66, '#4a72c4'); p.r(0, 12, 86, 4, '#6f93dc'); p.r(-2, 8, 90, 5, '#25407e'); p.r(0, 54, 86, 3, '#25407e');
      p.r(10, 20, 66, 12, '#25407e'); center(p, 86, 23, 'POLISI', '#ffe066');
      p.poly([[43, 34], [47, 40], [43, 46], [39, 40]], '#ffe066');
      windowsGrid(p, 6, 58, 80, 72, 4, 1, { glass: '#bfe6fb', frame: '#25407e' }, rng(5));
      p.r(34, 54, 18, 24, '#25407e'); p.r(36, 56, 14, 22, '#bfe6fb'); p.r(42, 56, 2, 22, '#25407e');
      p.r(76, 0, 2, 14, '#8b919c'); p.poly([[78, 1], [86, 3], [78, 7]], '#e04545');
      return p;
    }
    return new Px(10, 10);
  }
  ['tower_blue', 'tower_abu', 'apart_bata', 'apart_krem', 'kantor_hijau', 'toko_roti', 'toko_kafe', 'toko_mart', 'toko_apotek', 'toko_buku', 'toko_toko', 'bank', 'rs', 'polisi_gd'].forEach(k => {
    const kk = k === 'polisi_gd' ? 'polisi' : k; PPArt.def('b_' + k, { s: 1, n: 1, mk: () => building(kk), fin: { shade: false } });
  });
  /* gambar sesuai lebar dunia (anchor = tengah bawah) */
  PPArt.drawW = (ctx, key, x, y, w, o) => {
    const sp = PPArt.get(key, (o && o.frame) || 0); if (!sp) return; const s = w / (sp.w - 6);
    ctx.save(); ctx.translate(x, y); if (o && o.flip) ctx.scale(-1, 1); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sp.c, -sp.ax * s, -sp.ay * s, sp.w * s, sp.h * s); ctx.restore();
  };
  PPArt.heightW = (key, w) => { const sp = PPArt.get(key, 0); return sp ? (sp.h - 6) * w / (sp.w - 6) : 0; };

  /* ================= PROPERTI JALAN ================= */
  PPArt.def('lampu_lalin', { s: 0.7, n: 3, mk: f => {                      // 0 hijau, 1 kuning, 2 merah
    const p = new Px(16, 50); p.ax = 8; p.ay = 50; p.r(7, 18, 3, 32, '#5b616e'); p.r(4, 46, 9, 4, '#4a505c');
    p.r(2, 0, 12, 20, '#2b2b32'); const cols = ['#4de06a', '#ffd23f', '#ff4b4b'], dim = ['#1e4a2a', '#5a4a14', '#5a1e1e'], on = f === 0 ? 0 : f === 1 ? 1 : 2, ord = [2, 1, 0];
    ord.forEach((ci, k) => { const lit = ci === on; p.e(8, 4 + k * 6, 2.4, 2.4, lit ? cols[ci] : dim[ci]); if (lit) { p.r(5, 4 + k * 6 - 1, 1, 1, '#fff'); } });
    return p;
  } });
  const signFace = {
    stop: p => { p.poly([[4, 0], [14, 0], [18, 4], [18, 14], [14, 18], [4, 18], [0, 14], [0, 4]], '#d62828'); p.r(3, 8, 12, 3, '#fff'); },
    s30: p => { p.e(9, 9, 9, 9, '#d62828'); p.e(9, 9, 6, 6, '#fff'); text(p, 5, 6, '30', '#222'); },
    park: p => { p.r(0, 0, 18, 18, '#2457c5'); p.r(1, 1, 16, 16, '#2f6be0'); text(p, 7, 6, 'P', '#fff'); },
    pej: p => { p.r(0, 0, 18, 18, '#2457c5'); p.poly([[9, 2], [16, 15], [2, 15]], '#fff'); p.e(9, 7, 1.6, 1.6, '#222'); p.r(8, 9, 2, 4, '#222'); p.line(6, 15, 12, 15, '#222', 1); },
    no: p => { p.e(9, 9, 9, 9, '#d62828'); p.r(3, 7, 12, 4, '#fff'); },
    sch: p => { p.poly([[9, 0], [18, 9], [9, 18], [0, 9]], '#ffd23f'); p.e(9, 6, 1.6, 1.6, '#222'); p.r(8, 8, 2, 5, '#222'); p.line(6, 11, 12, 11, '#222', 1); }
  };
  Object.keys(signFace).forEach(k => PPArt.def('rambu_' + k, { s: 0.75, n: 1, mk: () => { const p = new Px(20, 44); p.ax = 10; p.ay = 44; p.r(9, 18, 2, 26, '#8b919c'); p.r(6, 42, 8, 2, '#6b717c'); const q = new Px(18, 18); signFace[k](q); p.g.drawImage(q.c, 0, 0, 24, 24, 1, 0, 24, 24); return p; } }));
  PPArt.def('tiang_lampu', { s: 0.7, n: 1, mk: () => { const p = new Px(28, 62); p.ax = 12; p.ay = 62; p.r(10, 6, 3, 56, '#4a505c'); p.r(6, 58, 11, 4, '#3a3f4a'); p.r(10, 4, 14, 3, '#4a505c'); p.e(22, 9, 5, 3, '#ffe9a0'); p.r(18, 5, 9, 2, '#2b2b32'); return p; } });
  PPArt.def('bangku', { s: 0.6, n: 1, mk: () => { const p = new Px(40, 22); p.ax = 20; p.ay = 22; p.r(3, 14, 3, 8, '#3a3f4a'); p.r(34, 14, 3, 8, '#3a3f4a'); p.r(0, 12, 40, 4, '#b5793c'); p.r(0, 3, 40, 3, '#b5793c'); p.r(0, 7, 40, 3, '#9c6530'); p.r(3, 3, 3, 12, '#3a3f4a'); p.r(34, 3, 3, 12, '#3a3f4a'); return p; } });
  PPArt.def('tong_sampah', { s: 0.6, n: 1, mk: () => { const p = new Px(16, 22); p.ax = 8; p.ay = 22; p.r(1, 4, 14, 18, '#3e9a5b'); p.r(0, 2, 16, 3, '#2f7a4a'); p.r(3, 8, 10, 2, '#7fd09a'); p.r(3, 13, 10, 2, '#7fd09a'); return p; } });
  PPArt.def('pot_tanaman', { s: 0.6, n: 1, mk: () => { const p = new Px(26, 30); p.ax = 13; p.ay = 30; p.r(3, 20, 20, 10, '#b5793c'); p.r(2, 19, 22, 3, '#c98c4a'); p.e(13, 12, 11, 9, '#3fa66b'); p.e(9, 10, 6, 6, '#58c183'); p.e(17, 8, 5, 5, '#2f8a55'); p.e(12, 5, 2, 2, '#ff8fb4'); p.e(18, 13, 2, 2, '#ffd34d'); return p; } });
  PPArt.def('halte', { s: 0.7, n: 1, mk: () => { const p = new Px(76, 62); p.ax = 38; p.ay = 62; p.r(4, 8, 3, 54, '#5b616e'); p.r(69, 8, 3, 54, '#5b616e'); p.r(0, 2, 76, 8, '#3d9be0'); p.r(0, 2, 76, 2, '#7ac0f4'); p.r(8, 10, 60, 28, '#cfeefc'); p.r(8, 10, 60, 2, '#fff'); p.r(10, 40, 56, 3, '#b5793c'); p.r(12, 43, 3, 8, '#3a3f4a'); p.r(61, 43, 3, 8, '#3a3f4a'); p.r(26, 15, 24, 10, '#2457c5'); center(p, 76, 18, 'BUS', '#fff'); p.r(36, 52, 4, 10, '#5b616e'); return p; } });
  PPArt.def('hidran', { s: 0.6, n: 1, mk: () => { const p = new Px(14, 20); p.ax = 7; p.ay = 20; p.r(3, 5, 8, 15, '#e04545'); p.e(7, 5, 5, 3, '#e04545'); p.r(0, 9, 14, 4, '#c43535'); p.r(5, 2, 4, 2, '#f1f1f1'); return p; } });
  PPArt.def('air_mancur', { s: 0.7, n: 6, mk: f => {
    const ph = f / 6 * TAU, p = new Px(84, 60); p.ax = 42; p.ay = 54;
    p.e(42, 46, 40, 12, '#b3ab98'); p.e(42, 44, 36, 10, '#8fcff2'); p.e(42, 45, 30, 7, '#a9def8');
    for (let i = 0; i < 4; i++) p.r(14 + ((i * 17 + f * 3) % 56), 42 + (i % 3) * 3, 6, 1, '#e8f7ff');
    p.r(38, 26, 8, 20, '#c9c1b0'); p.e(42, 26, 9, 3, '#d6cfc0'); p.r(40, 14, 4, 12, '#b3ab98');
    for (let a = -1; a <= 1; a += 2) for (let k = 0; k < 7; k++) { const t = k / 6, x = 42 + a * (t * 18), y = 12 + (t * t) * 26 + Math.sin(ph + k) * 0.6; p.e(x, y, 1.6, 1.6, '#e8f7ff'); }
    for (let k = 0; k < 5; k++) { const y = 12 - k * 2 - ((f * 2 + k * 2) % 6); p.e(42, 12 - k * 1.5 + (f % 3), 1.4, 1.4, '#e8f7ff'); }
    return p;
  } });
})();
