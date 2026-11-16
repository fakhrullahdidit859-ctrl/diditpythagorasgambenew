/* =========================================================
   KOTA HIPOTENUSA — peta kota dari paket aset "Aset_Kota_Hutan_Hipotenusa".
   Data peta : js/kota_data.js (window.PETA, window.ANIM)   Gambar : assets/kota/...
   Isi: lapisan tanah, objek y-sort (bangunan, pohon, rambu, lampu lalin), tabrakan bangunan,
        kendaraan di JALUR KIRI yang berhenti di lampu merah dan mengerem untuk pemain,
        warga berjalan di trotoar, polisi mengatur lalin, burung terbang/hinggap, air mancur.
   API (dipakai explore.js):
     PP.Kota.load()                 -> Promise, memuat semua gambar
     PP.Kota.build(D)               -> {objs, solids, coins, deco, ground}
     PP.Kota.create({D,P,world,...})-> {update, hit, hitBox, push, sky, frame}
   ========================================================= */
(function () {
  const BASE = 'assets/kota/';
  const M = window.PETA, AN = window.ANIM;
  const IMG = {};
  const WALKTIPE = ['warga_anak', 'warga_ibu', 'warga_bapak', 'polisi'];
  const KENDARAAN = ['mobil_merah', 'mobil_biru', 'mobil_hijau', 'mobil_putih', 'mobil_ungu', 'taksi', 'mobil_polisi', 'bus_kota', 'motor_hijau', 'motor_merah', 'motor_biru'];
  const ROADS = [];                                              // kotak jalan raya (blokir untuk warga)
  M.jalan.horizontal.forEach(r => ROADS.push({ x0: 0, x1: M.lebarPiksel, y0: r.barisUbin[0] * 64, y1: (r.barisUbin[1] + 1) * 64 }));
  M.jalan.vertikal.forEach(r => ROADS.push({ x0: r.kolomUbin[0] * 64, x1: (r.kolomUbin[1] + 1) * 64, y0: 0, y1: M.tinggiPiksel }));

  function rngf(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------- memuat gambar ---------- */
  let ATL = null;                                                // atlas.png (semua sprite kecil dalam satu gambar)
  function atlas() {
    return ATL || (ATL = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = BASE + 'atlas.png'; }));
  }
  function img(path) {
    if (!IMG[path]) IMG[path] = (window.KATLAS && window.KATLAS[path]) ? atlas().then(at => {
      if (!at) return null; const r = window.KATLAS[path], c = document.createElement('canvas'); c.width = r[2]; c.height = r[3];
      const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(at, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
      c.naturalWidth = r[2]; c.naturalHeight = r[3]; return c;
    }) : new Promise(res => { const i = new Image(); i.onload = () => { i._ok = 1; res(i); }; i.onerror = () => res(null); i.src = BASE + path; });
    return IMG[path];
  }
  const got = {};                                                // path -> gambar (setelah dimuat)
  function load() {
    const paths = new Set(['01_peta_kota/peta_kota_ground.png', '07_hewan_burung/bayangan_burung.png',
      '04_properti_rambu/lampu_lalu_lintas/lampu_lalin_kuning.png']);
    M.objek.forEach(o => { if (o.berkas) paths.add(o.berkas); });
    Object.values(AN).forEach(a => a.frames.forEach(f => paths.add(f)));
    return Promise.all(Array.from(paths).map(p => img(p).then(i => { got[p] = i; })));
  }
  const frame = (name, i) => { const a = AN[name]; if (!a) return null; const n = a.frameCount; return got[a.frames[((i % n) + n) % n]]; };

  /* ---------- lampu lalu lintas: siklus 20 detik ---------- */
  function light(g, t) {
    const ph = t % M.siklusLampu.detik, c = M.siklusLampu[g];
    for (const k in c) if (ph >= c[k][0] && ph < c[k][1]) return k;
    return 'merah';
  }

  /* ---------- penghalang (tabrakan) dari data peta ---------- */
  function solidOf(o) {
    if (o.tabrakan) { const t = o.tabrakan; return { x0: t.x, x1: t.x + t.lebar, y0: t.y, y1: t.y + t.tinggi }; }
    const n = o.nama, x = o.x, y = o.y;
    if (/^pohon_pinus/.test(n)) return { x0: x - 9, x1: x + 9, y0: y - 8, y1: y + 6 };
    if (/^pohon_bulat/.test(n)) return { x0: x - 11, x1: x + 11, y0: y - 8, y1: y + 6 };
    if (n === 'semak') return { x0: x - 16, x1: x + 16, y0: y - 8, y1: y + 6 };
    if (n === 'lampu_jalan' || o.jenis === 'lampu_lalin') return { x0: x - 6, x1: x + 6, y0: y - 6, y1: y + 6 };
    if (o.jenis === 'rambu') return { x0: x - 6, x1: x + 6, y0: y - 6, y1: y + 6 };
    if (n === 'tong_sampah' || n === 'kotak_pos') return { x0: x - 9, x1: x + 9, y0: y - 6, y1: y + 6 };
    if (n === 'pagar_putih') return { x0: x - o.lebar / 2, x1: x + o.lebar / 2, y0: y - 8, y1: y + 6 };
    if (n === 'halte_bus') return { x0: x - o.lebar / 2 + 6, x1: x + o.lebar / 2 - 6, y0: y - 12, y1: y + 6 };
    if (n === 'papan_reklame' || n === 'tugu_segitiga') return { x0: x - 22, x1: x + 22, y0: y - 12, y1: y + 6 };
    if (o.jenis === 'animasi') return { x0: x - 36, x1: x + 36, y0: y - 22, y1: y + 6 };
    if (n === 'bangku_taman') return { x0: x - 24, x1: x + 24, y0: y - 8, y1: y + 6 };
    return null;
  }

  /* ---------- membangun dunia (tanah + penghalang + koin) ---------- */
  function build(D) {
    const W = M.lebarPiksel, H = M.tinggiPiksel, r = rngf(4242);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(got['01_peta_kota/peta_kota_ground.png'], 0, 0);
    (D.shapes || []).forEach(sh => { if (!sh._g) PP.Shapes.prep(sh); PP.Shapes.draw(g, sh); });
    const solids = []; M.objek.forEach(o => { const s = solidOf(o); if (s) solids.push(s); });
    const coins = [];
    const bad = (x, y, rad) => {
      for (const s of solids) if (x + rad > s.x0 - 8 && x - rad < s.x1 + 8 && y + 8 > s.y0 - 8 && y - rad < s.y1 + 8) return true;
      for (const q of ROADS) if (x + rad > q.x0 && x - rad < q.x1 && y + 10 > q.y0 && y - 10 < q.y1) return true;
      for (const sh of D.shapes || []) if (Math.hypot(x - sh.cx, y - sh.cy) < sh.R + 16) return true;
      for (const n of D.npcs) if (Math.hypot(x - n[2], y - n[3]) < 50) return true;
      return false;
    };
    for (let n = 0, tries = 0; n < 8 && tries < 4000; tries++) {
      const x = 90 + r() * (W - 180), y = 120 + r() * (H - 220);
      if (!bad(x, y, 16) && coins.every(q => Math.hypot(q.x - x, q.y - y) > 260)) { coins.push({ x, y, i: n }); n++; }
    }
    return { objs: [], solids, coins, deco: [], ground: c };
  }

  /* ---------- kehidupan kota ---------- */
  function create(a) {
    const P = a.P, shadow = a.shadow;
    const r = rngf(7);
    const pick = arr => arr[Math.floor(r() * arr.length)];
    let T = 0;

    const LANES = {}; M.jalurKendaraan.forEach(l => {
      const p = l.titik[0], q = l.titik[1]; l.len = Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]);
      l.vx = (q[0] - p[0]) / l.len; l.vy = (q[1] - p[1]) / l.len; LANES[l.id] = l;
    });
    const STOPS = {}; M.garisBerhenti.forEach(s => (STOPS[s.jalur] = STOPS[s.jalur] || []).push(s));
    const halfOf = (v, l) => {                                  // setengah panjang badan kendaraan (arah jalan)
      const an = AN[v.tipe + '_' + l.arah]; if (!an) return 40;
      return (l.sumbu === 'EW' ? an.frameWidth : an.frameHeight) * 0.46;
    };
    const widthOf = (v, l) => { const an = AN[v.tipe + '_' + l.arah]; if (!an) return 18; return (l.sumbu === 'EW' ? an.frameHeight * 0.2 : an.frameWidth * 0.34) + 4; };

    const VEH = [];
    Object.values(LANES).forEach(l => {
      const n = l.id[0] === 'H' ? 4 : 3;
      for (let k = 0; k < n; k++) VEH.push({ lane: l.id, s: (k + r() * 0.4) * l.len / n, v: 0, vmax: 62 + r() * 42, tipe: pick(KENDARAAN) });
    });
    const posOf = v => {                                        // titik tengah badan di dunia
      const l = LANES[v.lane], x = l.titik[0][0] + l.vx * v.s, y = l.titik[0][1] + l.vy * v.s;
      return l.sumbu === 'EW' ? [x, y + 22] : [x, y];
    };
    const WALK = M.jalurPejalan.map(w => ({ a: w.jalur[0], b: w.jalur[1], u: r(), d: r() < 0.5 ? 1 : -1, tipe: pick(WALKTIPE), sp: 24 + r() * 16 }));
    const BIRDS = M.burung.terbang.map(b => Object.assign({}, b, { x: r() * M.lebarPiksel, ph: r() * 6, tipe: pick(['merpati', 'burung_putih', 'burung_gereja']) }));
    const OBJ = M.objek.map(o => ({ o, k: o.berkas ? got[o.berkas] : null }));
    const vehBox = v => {
      const l = LANES[v.lane], c = posOf(v), h = halfOf(v, l), w = widthOf(v, l);
      return l.sumbu === 'EW' ? { x0: c[0] - h, x1: c[0] + h, y0: c[1] - w, y1: c[1] + w } : { x0: c[0] - w, x1: c[0] + w, y0: c[1] - h, y1: c[1] + h };
    };

    function update(dt) {
      if (!dt) return; T += dt;
      const byl = {}; VEH.forEach(v => (byl[v.lane] = byl[v.lane] || []).push(v));
      for (const id in byl) {
        const l = LANES[id], vs = byl[id].sort((p, q) => q.s - p.s);
        vs.forEach((v, i) => {
          const h = halfOf(v, l); let tg = v.vmax; const front = v.s + h;
          // lampu merah / kuning
          (STOPS[id] || []).forEach(st => {
            const o = l.sumbu === 'EW' ? l.titik[0][0] : l.titik[0][1];
            const d = Math.abs(st.berhentiDi - o) - front, g = light(st.kelompok, T);
            if (d >= 0 && d < 150 && (g === 'merah' || (g === 'kuning' && d > 60))) tg = Math.min(tg, Math.sqrt(2 * 170 * Math.max(0, d - 4)));
          });
          // jaga jarak dengan kendaraan di depan
          if (i > 0) { const ah = vs[i - 1], gap = (ah.s - halfOf(ah, l)) - front; if (gap < 80) tg = Math.min(tg, Math.max(0, (gap - 16) * 2)); }
          // pemain di depan: wajib mengerem
          const c = posOf(v), px = P.x - c[0], py = P.y - c[1], along = px * l.vx + py * l.vy, lat = Math.abs(px * -l.vy + py * l.vx);
          const lw = widthOf(v, l) + 18;
          if (along > 0 && lat < lw) { const d = along - h; tg = Math.min(tg, d < 34 ? 0 : Math.sqrt(2 * 190 * (d - 34))); }
          const acc = tg < v.v ? 220 : 90;
          v.v += Math.max(-acc * dt, Math.min(acc * dt, tg - v.v));
          if (v.v < 0.5 && tg === 0) v.v = 0;
          v.s += v.v * dt;
          if (v.s > l.len) {                                  // muncul lagi dari ujung peta, tunggu bila jalur masuk masih terisi
            v.tipe = pick(KENDARAAN); v.vmax = 62 + r() * 42; const hh = halfOf(v, l); let rear = 1e9;
            vs.forEach(o => { if (o !== v) rear = Math.min(rear, o.s - halfOf(o, l)); });
            v.s = Math.min(0, rear - 50 - hh); v.v = v.vmax * 0.6;
          }
        });
      }
      WALK.forEach(w => { const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); w.u += w.d * w.sp * dt / L; if (w.u > 1) { w.u = 1; w.d = -1; } if (w.u < 0) { w.u = 0; w.d = 1; } });
      BIRDS.forEach(b => { b.x += (b.arah === 'kanan' ? 1 : -1) * b.kecepatan * dt; if (b.x > M.lebarPiksel + 80) b.x = -80; if (b.x < -80) b.x = M.lebarPiksel + 80; });
    }

    /* warga (NPC soal) tidak boleh masuk jalan raya / kendaraan */
    function hit(x, y) {
      for (const q of ROADS) if (x + 8 > q.x0 && x - 8 < q.x1 && y + 6 > q.y0 && y - 8 < q.y1) return true;
      return false;
    }
    /* kotak kaki pemain tidak boleh menembus kendaraan */
    function hitBox(x0, x1, y0, y1) {
      for (const v of VEH) { const b = vehBox(v); if (x1 > b.x0 && x0 < b.x1 && y1 > b.y0 && y0 < b.y1) return true; }
      return false;
    }

    const FR = (name, tm, fpsMul) => { const an = AN[name]; return frame(name, Math.floor(tm * an.fps * (fpsMul || 1))); };
    const put = (list, key, f) => list.push({ y: key, f });
    const blit = (ctx, im, x, y) => { if (im) ctx.drawImage(im, Math.round(x), Math.round(y)); };

    function push(list, inView, ctx, imgs) {
      const cam = a.cam();                                      // {x0,y0,x1,y1} kotak terlihat
      const vis = (x, y, w, h) => x + w > cam.x0 && x < cam.x1 && y + h > cam.y0 && y < cam.y1;
      OBJ.forEach(({ o, k }) => {
        let im = k;
        if (o.jenis === 'animasi') im = FR('air_mancur', T);
        else if (o.jenis === 'lampu_lalin') im = got['04_properti_rambu/lampu_lalu_lintas/lampu_lalin_' + light(o.kelompok, T) + '.png'];
        if (!im) return;
        const w = im.naturalWidth, h = im.naturalHeight, x = o.x - w / 2, y = o.y - h + 6;
        if (!vis(x, y, w, h)) return;
        put(list, o.y, () => blit(ctx, im, x, y));
      });
      VEH.forEach(v => {
        const l = LANES[v.lane], x = l.titik[0][0] + l.vx * v.s, y = l.titik[0][1] + l.vy * v.s, n = v.tipe + '_' + l.arah, an = AN[n];
        if (!an) return;
        const f = (v.v > 3 || v.tipe === 'mobil_polisi') ? Math.floor(T * (v.tipe === 'mobil_polisi' ? 6 : an.fps)) : 0, im = frame(n, f);
        if (!im) return;
        const w = im.naturalWidth, h = im.naturalHeight;
        let px, py, key;
        if (l.sumbu === 'EW') { const c = y + 8; px = x - w / 2; py = c - h / 2 + 10; key = c + 18; } else { px = x - w / 2; py = y - h / 2; key = y + h / 2; }
        if (!vis(px, py, w, h)) return;
        put(list, key, () => blit(ctx, im, px, py));
      });
      WALK.forEach(w => {
        const x = w.a[0] + (w.b[0] - w.a[0]) * w.u, y = w.a[1] + (w.b[1] - w.a[1]) * w.u;
        const d = w.b[0] !== w.a[0] ? (w.d > 0 ? 'kanan' : 'kiri') : (w.d > 0 ? 'bawah' : 'atas');
        if (!vis(x - 40, y - 100, 80, 110)) return;
        const im = FR(w.tipe + '_jalan_' + d, T); if (!im) return;
        put(list, y, () => blit(ctx, im, x - im.naturalWidth / 2, y - im.naturalHeight + 6));
      });
      M.polisiMengatur.forEach(p => {
        if (!vis(p.x - 40, p.y - 100, 80, 110)) return;
        const im = FR('polisi_mengatur_lalin', T); if (!im) return;
        put(list, p.y, () => blit(ctx, im, p.x - im.naturalWidth / 2, p.y - im.naturalHeight + 6));
      });
      M.burung.hinggap.forEach(b => {
        if (!vis(b.x - 40, b.y - 40, 80, 80)) return;
        const im = FR(b.jenis + '_hinggap', T); if (!im) return;
        put(list, b.y + 30, () => blit(ctx, im, b.x - im.naturalWidth / 2, b.y - im.naturalHeight / 2));
      });
    }

    /* burung terbang: di atas semuanya */
    function sky(ctx) {
      const cam = a.cam(), sh = got['07_hewan_burung/bayangan_burung.png'];
      BIRDS.forEach(b => {
        const yy = b.y + 8 * Math.sin(T * 2 + b.ph);
        if (b.x < cam.x0 - 80 || b.x > cam.x1 + 80 || yy < cam.y0 - 140 || yy > cam.y1 + 140) return;
        const im = frame(b.tipe + '_terbang_' + b.arah, Math.floor(T * 12 + b.ph * 3)); if (!im) return;
        if (sh) { ctx.globalAlpha = 0.5; blit(ctx, sh, b.x - 20, yy + 90); ctx.globalAlpha = 1; }
        blit(ctx, im, b.x - im.naturalWidth / 2, yy - im.naturalHeight / 2);
      });
    }

    return { update, hit, hitBox, push, sky, T: () => T, VEH, LANES, light: g => light(g, T), vehBox, ROADS };
  }

  window.PP = window.PP || {};
  PP.Kota = { load, build, create, light, ROADS, M, frame, got };
})();
