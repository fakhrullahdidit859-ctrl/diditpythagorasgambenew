/* =========================================================
   PPArt — seni piksel prosedural beranimasi (hewan, burung, kupu-kupu, polisi)
   Setiap sprite digambar di kanvas kecil per-frame, diberi garis tepi dan
   bayangan otomatis, lalu di-cache. Tidak butuh file gambar tambahan.
   PPArt.def(kunci, {s, n, mk}) -> mendaftar. PPArt.get(kunci, frame) -> sprite.
   PPArt.draw(ctx, kunci, frame, x, y, {flip, scale, alpha})  (x,y = titik pijak kaki)
   ========================================================= */
(function () {
  const OUT = '#2b1810', UP = 3, PAD = 3;
  const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const mix = (c, k) => { const a = hex(c).map(v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))))); return '#' + a.map(v => v.toString(16).padStart(2, '0')).join(''); };

  class Px {
    constructor(w, h) { this.w = w + PAD * 2; this.h = h + PAD * 2; this.c = document.createElement('canvas'); this.c.width = this.w; this.c.height = this.h; this.g = this.c.getContext('2d', { willReadFrequently: true }); this.ax = w / 2; this.ay = h; }
    r(x, y, w, h, col) { this.g.fillStyle = col; this.g.fillRect(Math.round(x) + PAD, Math.round(y) + PAD, Math.round(w), Math.round(h)); return this; }
    e(cx, cy, rx, ry, col) {
      const g = this.g; g.fillStyle = col; ry = Math.max(0.5, ry);
      for (let y = -Math.round(ry); y <= Math.round(ry); y++) { const k = Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + 0.25))), hw = Math.round(rx * k); g.fillRect(Math.round(cx - hw) + PAD, Math.round(cy + y) + PAD, hw * 2 + 1, 1); }
      return this;
    }
    line(x0, y0, x1, y1, col, th) {
      th = th || 1; const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); this.g.fillStyle = col;
      for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; this.g.fillRect(Math.round(x - th / 2) + PAD, Math.round(y - th / 2) + PAD, th, th); }
      return this;
    }
    poly(pts, col) {
      const g = this.g; g.fillStyle = col; let y0 = 1e9, y1 = -1e9; pts.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
      for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
        const xs = [], yy = y + 0.5;
        for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= yy && b[1] > yy) || (b[1] <= yy && a[1] > yy)) xs.push(a[0] + (yy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
        xs.sort((p, q) => p - q); for (let i = 0; i + 1 < xs.length; i += 2) g.fillRect(Math.round(xs[i]) + PAD, y + PAD, Math.max(1, Math.round(xs[i + 1]) - Math.round(xs[i])), 1);
      }
      return this;
    }
    atop(f) { this.g.globalCompositeOperation = 'source-atop'; f(this); this.g.globalCompositeOperation = 'source-over'; return this; }
    /* garis tepi + cahaya atas / bayangan bawah, lalu perbesar x3 tanpa interpolasi */
    finish(o) {
      o = o || {}; const w = this.w, h = this.h, src = this.g.getImageData(0, 0, w, h).data, out = this.g.createImageData(w, h), d = out.data, oc = hex(o.outline || OUT);
      const A = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : src[(y * w + x) * 4 + 3];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (src[i + 3] > 0) {
          let r = src[i], g = src[i + 1], b = src[i + 2];
          if (o.shade !== false) {
            if (!A(x, y - 1)) { r += (255 - r) * 0.16; g += (255 - g) * 0.16; b += (255 - b) * 0.16; }
            else if (!A(x, y + 1)) { r *= 0.84; g *= 0.84; b *= 0.84; }
          }
          d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
        } else if (A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1)) { d[i] = oc[0]; d[i + 1] = oc[1]; d[i + 2] = oc[2]; d[i + 3] = 255; }
      }
      this.g.putImageData(out, 0, 0);
      const big = document.createElement('canvas'); big.width = w * UP; big.height = h * UP; const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(this.c, 0, 0, w * UP, h * UP);
      return { c: big, w, h, ax: this.ax + PAD, ay: this.ay + PAD };
    }
  }

  const PPArt = { Px, mix, defs: {}, cache: {} };
  PPArt.def = (key, spec) => { PPArt.defs[key] = spec; };
  PPArt.frames = key => (PPArt.defs[key] || {}).n || 1;
  PPArt.get = (key, frame) => {
    const d = PPArt.defs[key]; if (!d) return null; const f = ((frame % d.n) + d.n) % d.n | 0, id = key + '|' + f;
    return PPArt.cache[id] || (PPArt.cache[id] = d.mk(f, d.n).finish(d.fin));
  };
  PPArt.scaleOf = key => (PPArt.defs[key] || {}).s || 0.6;
  PPArt.draw = (ctx, key, frame, x, y, o) => {
    const sp = PPArt.get(key, frame); if (!sp) return; o = o || {}; const s = o.scale || PPArt.scaleOf(key);
    ctx.save(); ctx.translate(x, y); if (o.flip) ctx.scale(-1, 1); if (o.alpha != null) ctx.globalAlpha = o.alpha;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sp.c, -sp.ax * s, -sp.ay * s, sp.w * s, sp.h * s); ctx.restore();
  };
  PPArt.size = (key) => { const sp = PPArt.get(key, 0); const s = PPArt.scaleOf(key); return sp ? [sp.w * s, sp.h * s] : [0, 0]; };
  PPArt.url = (key, frame) => { const sp = PPArt.get(key, frame || 0); return sp ? sp.c.toDataURL() : ''; };

  const TAU = Math.PI * 2;
  /* kaki: dari (x,y0) turun sepanjang len; ayunan x dan angkat kaki */
  function leg(p, x, y0, len, wd, col, foot, swing, lift) {
    const bx = x + swing, by = y0 + len - lift;
    p.line(x, y0, bx, by - 1, col, wd); p.r(bx - wd / 2, by - 2, wd + 1, 2, foot);
  }
  /* pola trot: dua kaki diagonal bergerak bersamaan */
  const gait = (ph, k, amp, lift) => ({ s: Math.sin(ph + k) * amp, l: Math.max(0, Math.cos(ph + k)) * lift });

  /* ============ KUCING BESAR: singa & harimau ============ */
  function bigcat(f, n, mode, tiger) {
    const walk = mode === 'walk', ph = f / n * TAU, p = new Px(70, 48), br = walk ? 0 : Math.sin(ph) * 0.7, bob = walk ? Math.abs(Math.sin(ph)) * 1 : 0;
    const body = tiger ? '#ee8a2c' : '#d9a05b', belly = tiger ? '#fff0d8' : '#f2d29a', dark = mix(body, -0.22), mane = '#8a4a1f', foot = mix(body, -0.35);
    const a = walk ? 4.5 : 0, l = walk ? 3.5 : 0;
    p.ax = 35; p.ay = 44;
    const gA = gait(ph, 0, a, l), gB = gait(ph, Math.PI, a, l);
    leg(p, 23, 29 - bob, 14, 5, dark, foot, gB.s, gB.l); leg(p, 43, 29 - bob, 14, 5, dark, foot, gA.s, gA.l);
    // ekor
    const sw = Math.sin(ph * (walk ? 1 : 1) + 1) * 3;
    p.line(14, 24 - bob, 8, 20 + sw * 0.4, body, 3); p.line(8, 20 + sw * 0.4, 5, 14 + sw, body, 3);
    if (tiger) { p.e(5, 12 + sw, 3, 3.5, '#2b1810'); p.line(9, 19 + sw * 0.4, 8, 21 + sw * 0.4, '#2b1810', 2); } else p.e(5, 12 + sw, 3.5, 4.5, mane);
    // badan
    p.e(35, 25 - bob, 21, 11 + br * 0.5, body); p.e(35, 31 - bob, 16, 5, belly).atop(() => 0);
    p.e(20, 26 - bob, 9, 9, mix(body, -0.06));
    if (tiger) p.atop(q => { for (let i = 0; i < 7; i++) { const x = 17 + i * 4.5; q.line(x, 14 - bob, x - 3, 36 - bob, '#2b1810', 2); } q.line(20, 22 - bob, 30, 22 - bob, '#2b1810', 1); });
    leg(p, 17, 29 - bob, 14, 5, body, foot, gA.s, gA.l); leg(p, 47, 29 - bob, 14, 5, body, foot, gB.s, gB.l);
    // kepala
    const hy = 17 - bob + (walk ? Math.sin(ph * 2) * 0.6 : br);
    if (tiger) {
      p.e(54, hy, 10, 9, body); p.e(58, hy + 4, 6, 4.5, '#fff3e0'); p.e(48, hy - 8, 3, 3, body); p.e(48, hy - 8, 1.2, 1.2, '#ffb3a8');
      p.atop(q => { q.line(52, hy - 8, 52, hy - 3, '#2b1810', 2); q.line(56, hy - 8, 55, hy - 4, '#2b1810', 2); q.line(47, hy, 51, hy + 1, '#2b1810', 1); q.line(47, hy + 4, 51, hy + 4, '#2b1810', 1); });
    } else {
      p.e(53, hy, 14, 12, mane); p.e(46, hy - 10, 3.5, 3.5, mane); p.e(54, hy + 1, 9, 8, '#e8b66e'); p.e(59, hy + 4, 5, 4, '#f6dca8');
      for (let i = 0; i < 5; i++) p.r(40 + i * 3, hy + 9 + (i % 2) * 2, 3, 3, mane);
    }
    p.r(62, hy + 1, 3, 2, OUT); p.r(57, hy - 2, 2, 3, OUT); p.line(60, hy + 6, 63, hy + 6, '#6b2f1a', 1);
    return p;
  }
  PPArt.def('lion', { s: 0.8, n: 8, mk: (f, n) => bigcat(f, n, 'walk', false) });
  PPArt.def('lion_idle', { s: 0.8, n: 8, mk: (f, n) => bigcat(f, n, 'idle', false) });
  PPArt.def('tiger', { s: 0.8, n: 8, mk: (f, n) => bigcat(f, n, 'walk', true) });
  PPArt.def('tiger_idle', { s: 0.8, n: 8, mk: (f, n) => bigcat(f, n, 'idle', true) });

  /* ============ KIJANG ============ */
  function deer(f, n, mode) {
    const walk = mode !== 'idle', run = mode === 'run', ph = f / n * TAU * (run ? 1 : 1), p = new Px(66, 66); p.ax = 33; p.ay = 62;
    const body = '#c98b50', dark = mix(body, -0.2), foot = '#5a3a20', a = run ? 7 : walk ? 4 : 0, l = run ? 6 : walk ? 4 : 0, bob = walk ? Math.abs(Math.sin(ph)) * (run ? 2 : 1) : 0;
    const gA = gait(ph, 0, a, l), gB = gait(ph, Math.PI, a, l);
    leg(p, 20, 38 - bob, 24, 3, dark, foot, gB.s, gB.l); leg(p, 41, 38 - bob, 24, 3, dark, foot, gA.s, gA.l);
    p.e(14, 33 - bob, 3.5, 3.5, '#fffaf0');
    p.e(31, 34 - bob, 17, 9, body); p.e(31, 39 - bob, 13, 4, '#f3dcb8').atop(() => 0);
    p.atop(q => { [[22, 30], [28, 28], [34, 30], [26, 34], [38, 34], [20, 35], [32, 36]].forEach(s => q.r(s[0], s[1] - bob, 2, 2, '#fff3dc')); });
    leg(p, 17, 38 - bob, 24, 3, body, foot, gA.s, gA.l); leg(p, 44, 38 - bob, 24, 3, body, foot, gB.s, gB.l);
    const hb = walk ? Math.sin(ph * 2) * 0.8 : Math.sin(ph) * 0.4;
    p.poly([[40, 30 - bob], [44, 14 - bob + hb], [50, 15 - bob + hb], [48, 32 - bob]], body);
    const hy = 13 - bob + hb;
    p.e(52, hy, 6, 4.5, body); p.e(58, hy + 2, 4, 3, '#e8c690'); p.r(61, hy, 2, 2, OUT); p.r(52, hy - 2, 2, 2, OUT);
    p.poly([[46, hy - 3], [43, hy - 9], [49, hy - 4]], body); p.poly([[47, hy - 4], [45, hy - 8], [48, hy - 4]], '#f0b0a0');
    const ac = '#6b4423'; p.line(50, hy - 4, 48, hy - 14, ac, 2); p.line(49, hy - 9, 44, hy - 12, ac, 1); p.line(48, hy - 14, 52, hy - 17, ac, 1); p.line(53, hy - 4, 55, hy - 14, ac, 2); p.line(54, hy - 9, 59, hy - 12, ac, 1);
    return p;
  }
  PPArt.def('deer', { s: 0.8, n: 8, mk: (f, n) => deer(f, n, 'walk') });
  PPArt.def('deer_run', { s: 0.8, n: 8, mk: (f, n) => deer(f, n, 'run') });
  PPArt.def('deer_idle', { s: 0.8, n: 8, mk: (f, n) => deer(f, n, 'idle') });

  /* ============ MONYET (berdiri, ekor melingkar) ============ */
  function monkey(f, n, mode) {
    const walk = mode === 'walk', ph = f / n * TAU, p = new Px(46, 62); p.ax = 23; p.ay = 58;
    const fur = '#8b5a2b', furD = mix(fur, -0.25), face = '#f0cfa0', sw = Math.sin(ph) * (walk ? 6 : 1.5), bob = walk ? Math.abs(Math.sin(ph)) * 1.6 : 0, tail = Math.sin(ph + 0.8);
    // ekor melengkung
    let tx = 28, ty = 46 - bob; for (let i = 0; i < 12; i++) { const k = i / 11; const nx = 30 + Math.sin(k * 3 + tail * 0.6) * 4 + k * 6, ny = 46 - bob - k * 22 + Math.cos(k * 3) * 2; p.line(tx, ty, nx, ny, fur, 3); tx = nx; ty = ny; }
    p.e(tx, ty - 1, 2.5, 2.5, furD);
    leg(p, 17, 43 - bob, 14, 5, furD, '#4a2d15', -sw * 0.8, Math.max(0, -Math.sin(ph)) * (walk ? 3 : 0));
    p.line(30, 33 - bob, 33 + sw * 0.5, 46 - bob, furD, 4);
    p.e(23, 34 - bob, 11, 13, fur); p.e(23, 37 - bob, 7, 9, face);
    leg(p, 28, 43 - bob, 14, 5, fur, '#4a2d15', sw * 0.8, Math.max(0, Math.sin(ph)) * (walk ? 3 : 0));
    p.line(15, 28 - bob, 12 - sw * 0.5, 43 - bob, fur, 4); p.e(12 - sw * 0.5, 44 - bob, 2.6, 2.6, face);
    // kepala
    const hy = 17 - bob + (walk ? 0 : Math.sin(ph) * 0.5);
    p.e(11, hy, 4, 4, face); p.e(35, hy, 4, 4, face); p.e(11, hy, 2, 2, '#d99a78'); p.e(35, hy, 2, 2, '#d99a78');
    p.e(23, hy, 12, 11, fur); p.e(23, hy + 2, 9, 8, face); p.e(23, hy - 7, 8, 3, fur);
    p.r(17, hy - 2, 3, 4, OUT); p.r(26, hy - 2, 3, 4, OUT); p.r(18, hy - 2, 1, 1, '#fff'); p.r(27, hy - 2, 1, 1, '#fff');
    p.r(21, hy + 3, 5, 2, '#c07a58'); p.line(20, hy + 7, 26, hy + 7, '#7a3a28', 1); p.r(22, hy + 3, 1, 1, OUT); p.r(24, hy + 3, 1, 1, OUT);
    return p;
  }
  PPArt.def('monkey', { s: 0.72, n: 8, mk: (f, n) => monkey(f, n, 'walk') });
  PPArt.def('monkey_idle', { s: 0.72, n: 8, mk: (f, n) => monkey(f, n, 'idle') });

  /* ============ GAJAH ============ */
  function elephant(f, n, mode) {
    const walk = mode === 'walk', ph = f / n * TAU, p = new Px(104, 84); p.ax = 52; p.ay = 80;
    const body = '#9ba3b5', dark = mix(body, -0.2), foot = '#6d7487', bob = walk ? Math.abs(Math.sin(ph)) * 1.2 : 0, a = walk ? 4 : 0, l = walk ? 3 : 0;
    const gA = gait(ph, 0, a, l), gB = gait(ph, Math.PI, a, l);
    leg(p, 32, 50 - bob, 26, 12, dark, foot, gB.s, gB.l); leg(p, 62, 50 - bob, 26, 12, dark, foot, gA.s, gA.l);
    p.line(20, 38 - bob, 16 - Math.sin(ph) * 2, 52 - bob, dark, 3);
    p.e(46, 40 - bob, 31, 23 + Math.sin(ph) * (walk ? 0 : 0.5), body); p.e(46, 52 - bob, 22, 8, mix(body, 0.12)).atop(() => 0);
    leg(p, 26, 50 - bob, 26, 12, body, foot, gA.s, gA.l); leg(p, 68, 50 - bob, 26, 12, body, foot, gB.s, gB.l);
    const hx = 78, hy = 36 - bob + (walk ? Math.sin(ph * 2) * 0.8 : 0);
    p.e(hx, hy, 15, 14, body);
    // belalai
    let tx = hx + 10, ty = hy + 6; for (let i = 0; i < 9; i++) { const k = i / 8; const nx = hx + 12 + Math.sin(ph * (walk ? 1 : 0.7) + k * 2.4) * (3 + k * 3) + k * 3, ny = hy + 6 + k * 30; p.line(tx, ty, nx, ny, body, Math.max(3, 9 - i)); tx = nx; ty = ny; }
    p.line(hx + 6, hy + 10, hx + 15, hy + 17, '#fffaf0', 2);
    // telinga
    p.e(hx - 10, hy - 2, 11, 15, dark); p.e(hx - 10, hy - 1, 7, 11, '#c9a1ad');
    p.r(hx + 6, hy - 4, 3, 4, OUT); p.r(hx + 7, hy - 4, 1, 1, '#fff');
    return p;
  }
  PPArt.def('elephant', { s: 0.86, n: 8, mk: (f, n) => elephant(f, n, 'walk') });
  PPArt.def('elephant_idle', { s: 0.86, n: 8, mk: (f, n) => elephant(f, n, 'idle') });

  /* ============ KELINCI ============ */
  function rabbit(f, n, mode) {
    const ph = f / n * TAU, hop = mode === 'hop' ? Math.max(0, Math.sin(ph)) : 0, p = new Px(30, 34); p.ax = 15; p.ay = 30; const y = -hop * 9, stretch = hop * 2;
    p.e(10, 22 + y, 5, 4, '#fff'); p.e(15, 21 + y, 8, 6 + hop, '#f6f2ec'); p.e(15, 23 + y, 6, 3, '#e8e0d4').atop(() => 0);
    p.e(10, 24 + y, 4, 3.5, '#efe9df'); p.r(14, 26 + y + (hop ? 2 : 0), 6 + stretch, 3, '#efe9df');
    const ear = Math.sin(ph) * (mode === 'hop' ? 2 : 0.8);
    p.e(23, 15 + y, 5, 5, '#f6f2ec'); p.line(21, 12 + y, 19 - ear, 1 + y, '#f6f2ec', 3); p.line(24, 11 + y, 24 + ear, 0 + y, '#f6f2ec', 3);
    p.line(21, 11 + y, 19 - ear, 3 + y, '#f4b6bc', 1); p.line(24, 10 + y, 24 + ear, 2 + y, '#f4b6bc', 1);
    p.r(25, 14 + y, 2, 2, OUT); p.r(27, 17 + y, 2, 1, '#e88a98'); p.r(14, 27, 6, 3, '#efe9df');
    return p;
  }
  PPArt.def('rabbit', { s: 0.62, n: 8, mk: (f, n) => rabbit(f, n, 'hop') });
  PPArt.def('rabbit_idle', { s: 0.62, n: 8, mk: (f, n) => rabbit(f, n, 'idle') });

  /* ============ BURUNG TERBANG & KUPU-KUPU ============ */
  const BIRDS = { biru: ['#4a8fe0', '#2d63b5'], merah: ['#e85a4f', '#b53a32'], kuning: ['#f6c93e', '#d49a1c'], putih: ['#f4f6fa', '#c9cfdc'] };
  Object.keys(BIRDS).forEach(k => {
    PPArt.def('bird_' + k, { s: 0.55, n: 8, mk: f => {
      const ph = f / 8 * TAU, p = new Px(40, 30), [c, d] = BIRDS[k], wy = Math.cos(ph) * 11; p.ax = 20; p.ay = 15;
      p.poly([[12, 15], [18, 15], [14 - wy * 0.1, 15 - wy - 2]], d);
      p.poly([[4, 16], [12, 13], [12, 18]], d); p.e(18, 16, 8, 4.5, c); p.e(18, 18, 6, 2.5, mix(c, 0.35)).atop(() => 0); p.e(26, 14, 4, 4, c);
      p.poly([[29, 13], [34, 15], [29, 16]], '#f2a33a'); p.r(27, 13, 2, 2, OUT);
      p.poly([[16, 15], [24, 15], [20 + wy * 0.1, 15 - wy - 3]], mix(c, 0.15));
      return p;
    } });
  });
  [['#ff8fb4', '#ffd0e0'], ['#ffd34d', '#fff0a8'], ['#7ec8ff', '#d6efff']].forEach((c, i) => {
    PPArt.def('butterfly_' + i, { s: 0.5, n: 6, mk: f => {
      const ph = f / 6 * TAU, p = new Px(22, 18), w = 1 + Math.abs(Math.cos(ph)) * 4.5; p.ax = 11; p.ay = 9;
      p.e(11 - w / 1.4, 6, w, 4, c[0]); p.e(11 + w / 1.4, 6, w, 4, c[0]); p.e(11 - w / 2, 11, w * 0.7, 3, c[1]); p.e(11 + w / 2, 11, w * 0.7, 3, c[1]);
      p.r(10, 4, 2, 9, '#3a2312'); return p;
    } });
  });

  /* ============ POLISI (tampak depan) — melambai / mengatur lalu lintas ============ */
  function person(f, n, o) {
    const ph = f / n * TAU, p = new Px(40, 76), bob = Math.sin(ph) * 0.6; p.ax = 20; p.ay = 72;
    const skin = o.skin || '#f0c49a', cloth = o.cloth, pants = o.pants, wave = Math.sin(ph * 1) ;
    p.e(20, 71, 13, 3, 'rgba(0,0,0,0)');
    p.r(11, 56, 7, 15, pants).r(22, 56, 7, 15, pants); p.r(9, 69, 10, 4, '#2b1a12').r(21, 69, 10, 4, '#2b1a12');
    p.e(20, 38 - bob, 12, 15, cloth); p.r(8, 52 - bob, 24, 4, '#3a2a1a'); p.r(18, 51 - bob, 4, 5, '#e8c13a');
    p.line(12, 28 - bob, 6, 44, cloth, 5); p.e(6, 46, 3, 3, skin);                                   // lengan kiri
    const ax = 29 + 6, ay = 28 - bob - 6 - wave * 4; p.line(28, 28 - bob, ax, ay, cloth, 5); p.e(ax + 1, ay - 2 + wave * 2, 3, 3.5, skin); // lengan kanan terangkat
    if (o.whistle) p.r(20, 30 - bob, 2, 3, '#e8e8e8');
    p.r(17, 27 - bob, 6, 3, skin);
    p.e(20, 19 - bob, 9, 9, skin); p.r(15, 18 - bob, 3, 3, OUT).r(23, 18 - bob, 3, 3, OUT); p.r(16, 18 - bob, 1, 1, '#fff').r(24, 18 - bob, 1, 1, '#fff'); p.line(17, 24 - bob, 23, 24 - bob, '#a8523a', 1);
    p.r(9, 12 - bob, 22, 4, o.hat); p.e(20, 11 - bob, 10, 5, o.hat); p.r(14, 14 - bob, 12, 3, mix(o.hat, -0.25)); p.r(18, 9 - bob, 4, 4, '#e8c13a');
    if (o.badge) p.r(26, 36 - bob, 3, 3, '#e8c13a');
    return p;
  }
  PPArt.def('polisi', { s: 0.62, n: 8, mk: (f, n) => person(f, n, { cloth: '#3a63b8', pants: '#22345e', hat: '#2a3f7a', whistle: true, badge: true }) });

  window.PPArt = PPArt;
})();
