/* =========================================================
   PPGen — pembuat soal otomatis + gambar bangun datar (SVG).
   - Soal: teorema Pythagoras (sisi miring, sisi siku-siku, tripel, diagonal),
     keliling/luas/diagonal persegi, persegi panjang, segitiga, jajar genjang,
     trapesium, belah ketupat, layang-layang, lingkaran.
   - Angka diacak dengan SEED (mulberry32): seed sama = soal sama.
   - Kunci dihitung kode. Pengecoh dibuat dari kesalahan umum siswa
     (lupa akar, menjumlah sisi, salah rumus luas, lupa 1/2, dst).
   - Bentuk soal sama dengan soal Kuis/Jelajah: {lv,q,o[],a,e,tp,fig,kind,seed}
   PPGen.item(seed, kind, lv) | PPGen.batch(n, seed, {topics, lv}) | PPGen.detect(teks)
   ========================================================= */
(function () {
  'use strict';
  const G = {};
  const mul = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const shuf = (r, arr) => { const x = arr.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[x[i], x[j]] = [x[j], x[i]]; } return x; };
  const fn = v => String(Math.round(v * 100) / 100).replace('.', ',');
  const TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
  /* topik -> jenis soal */
  G.TOPICS = [
    { id: 'pyth', n: 'Teorema Pythagoras', k: ['hip', 'kaki', 'tripel', 'diagpp'] },
    { id: 'persegi', n: 'Persegi & persegi panjang', k: ['persegi', 'pp', 'diagpersegi'] },
    { id: 'segitiga', n: 'Segitiga', k: ['segitiga', 'segitiga2'] },
    { id: 'jgtrap', n: 'Jajar genjang & trapesium', k: ['jg', 'trap'] },
    { id: 'bkll', n: 'Belah ketupat & layang-layang', k: ['bk', 'll'] },
    { id: 'ling', n: 'Lingkaran', k: ['ling'] }
  ];
  G.KINDS = [].concat.apply([], G.TOPICS.map(t => t.k));
  G.topicOf = kind => (G.TOPICS.find(t => t.k.indexOf(kind) >= 0) || {}).n || 'Pythagoras';
  /* gambar */
  G.svg = function (type, params, unit) { try { return window.FX ? FX.shapeSVG(type, params, { unit: unit == null ? 'cm' : unit }).replace(/<text[^>]*>\s*(?:cm|m|dm)?\s*<\/text>/g, '') : ''; } catch (e) { return ''; } };
  /* susun pilihan: jawaban benar + pengecoh unik, diacak */
  function mc(r, good, bad, fmt) {
    fmt = fmt || fn; const seen = { [fmt(good)]: 1 }, wr = [];
    bad.forEach(b => { if (!(b > 0) || !isFinite(b)) return; const s = fmt(b); if (!seen[s]) { seen[s] = 1; wr.push(s); } });
    let k = 1; while (wr.length < 3) { const s = fmt(good + k * (r() < .5 ? 1 : 2)); if (!seen[s] && good + k > 0) { seen[s] = 1; wr.push(s); } k++; }
    const all = shuf(r, [fmt(good)].concat(wr.slice(0, 3)));
    return { o: all, a: all.indexOf(fmt(good)) };
  }
  const sc = (r, lv, lo, hi) => ri(r, lo, lv === 'Mudah' ? Math.min(hi, lo + 1) : lv === 'Sedang' ? Math.min(hi, lo + 3) : hi);
  const tri = (r, lv) => { const t = TRI[lv === 'Mudah' ? ri(r, 0, 1) : lv === 'Sedang' ? ri(r, 0, 3) : ri(r, 0, 4)], k = sc(r, lv, 1, lv === 'Sulit' ? 4 : 2); return t.map(x => x * k); };
  const KIND = {
    hip(r, lv) { const [a, b, c] = tri(r, lv), sw = r() < .5; return { q: `Sebuah segitiga siku-siku memiliki sisi tegak ${a} cm dan ${b} cm. Berapa panjang sisi miringnya?`, g: c, bad: [a + b, a * a + b * b, Math.abs(b - a), c + 2], u: ' cm', e: `c² = a² + b²\nc² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}\nc = √${a * a + b * b} = ${c} cm.\nPengecoh yang sering: ${a}+${b}=${a + b} (menjumlah sisi) atau ${a * a + b * b} (lupa akar).`, shape: ['segitiga-siku', { a: sw ? a : b, b: sw ? b : a, c: '?' }] }; },
    kaki(r, lv) { const [a, b, c] = tri(r, lv); return { q: `Pada segitiga siku-siku, sisi miring ${c} cm dan salah satu sisi tegak ${a} cm. Berapa panjang sisi tegak yang lain?`, g: b, bad: [c - a, c * c - a * a, c + a, b + 1], u: ' cm', e: `b² = c² − a²\nb² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${c * c - a * a}\nb = √${c * c - a * a} = ${b} cm.\nIngat: sisi miring selalu yang terpanjang, jadi dikurangi, bukan dijumlah.`, shape: ['segitiga-siku', { a, b: '?', c }] }; },
    tripel(r, lv) {
      const t = tri(r, lv), bad = [[t[0], t[1], t[2] + 1], [t[0] + 1, t[1], t[2]], [t[0], t[1] + 2, t[2]]]; const f = x => x.join(', '); const all = shuf(r, [t].concat(bad)); const a = all.findIndex(x => x === t);
      return { q: 'Manakah yang merupakan tripel Pythagoras?', o: all.map(f), a, e: `Tripel Pythagoras memenuhi a² + b² = c².\n${t[0]}² + ${t[1]}² = ${t[0] * t[0]} + ${t[1] * t[1]} = ${t[2] * t[2]} = ${t[2]}². Jadi ${f(t)} adalah tripel.`, noshape: true };
    },
    diagpp(r, lv) { const [p, l, d] = tri(r, lv); return { q: `Sebuah persegi panjang berukuran ${p} cm × ${l} cm. Berapa panjang diagonalnya?`, g: d, bad: [p + l, p * p + l * l, p * l, d + 1], u: ' cm', e: `Diagonal membagi persegi panjang menjadi dua segitiga siku-siku.\nd² = ${p}² + ${l}² = ${p * p + l * l}\nd = ${d} cm.`, shape: ['persegi-panjang', { p, l }] }; },
    persegi(r, lv) { const s = sc(r, lv, 3, 15), kel = r() < .5; return kel ? { q: `Sebuah persegi memiliki panjang sisi ${s} cm. Berapa kelilingnya?`, g: 4 * s, bad: [s * s, 2 * s, 4 + s, 8 * s], u: ' cm', e: `Keliling persegi = 4 × s = 4 × ${s} = ${4 * s} cm.`, shape: ['persegi', { s }] } : { q: `Sebuah persegi memiliki panjang sisi ${s} cm. Berapa luasnya?`, g: s * s, bad: [4 * s, 2 * s, s * s + s, 2 * s * s], u: ' cm²', e: `Luas persegi = s × s = ${s} × ${s} = ${s * s} cm².`, shape: ['persegi', { s }] }; },
    pp(r, lv) { const p = sc(r, lv, 6, 20), l = ri(r, 3, p - 1), kel = r() < .5; return kel ? { q: `Persegi panjang berukuran ${p} cm × ${l} cm. Berapa kelilingnya?`, g: 2 * (p + l), bad: [p * l, p + l, 2 * p * l, 2 * p + l], u: ' cm', e: `Keliling = 2 × (p + l) = 2 × (${p} + ${l}) = ${2 * (p + l)} cm.`, shape: ['persegi-panjang', { p, l }] } : { q: `Persegi panjang berukuran ${p} cm × ${l} cm. Berapa luasnya?`, g: p * l, bad: [2 * (p + l), p + l, p * l / 2, p * l + p], u: ' cm²', e: `Luas = p × l = ${p} × ${l} = ${p * l} cm².`, shape: ['persegi-panjang', { p, l }] }; },
    diagpersegi(r, lv) { const s = sc(r, lv, 2, 12); const o = [`${s}√2 cm`, `${2 * s} cm`, `${s}√3 cm`, `${s * s}√2 cm`]; const all = shuf(r, o); return { q: `Sebuah persegi bersisi ${s} cm. Berapa panjang diagonalnya?`, o: all, a: all.indexOf(o[0]), e: `d² = s² + s² = 2s² → d = s√2 = ${s}√2 cm.`, shape: ['persegi', { s }] }; },
    segitiga(r, lv) { const a = sc(r, lv, 6, 24) | 0, t = ri(r, 4, 16), A = a * t / 2; if (A !== Math.floor(A)) return KIND.segitiga(r, lv); return { q: `Sebuah segitiga memiliki alas ${a} cm dan tinggi ${t} cm. Berapa luasnya?`, g: A, bad: [a * t, a + t, A + a, a * t / 4], u: ' cm²', e: `Luas segitiga = ½ × alas × tinggi = ½ × ${a} × ${t} = ${A} cm².\nJangan lupa ½-nya.`, shape: ['segitiga-siku', { a, b: t, c: '' }] }; },
    segitiga2(r, lv) { const [a, b, c] = tri(r, lv); return { q: `Segitiga siku-siku dengan sisi tegak ${a} cm dan ${b} cm. Berapa kelilingnya?`, g: a + b + c, bad: [a + b, a * a + b * b + a + b, a + b + c + 2, a * b / 2], u: ' cm', e: `Cari sisi miring dulu: c = √(${a}² + ${b}²) = ${c} cm.\nKeliling = ${a} + ${b} + ${c} = ${a + b + c} cm.`, shape: ['segitiga-siku', { a, b, c: '?' }] }; },
    jg(r, lv) { const a = sc(r, lv, 6, 20), t = ri(r, 3, 12), s = t + ri(r, 1, 4), kel = r() < .4; return kel ? { q: `Jajar genjang memiliki alas ${a} cm dan sisi miring ${s} cm. Berapa kelilingnya?`, g: 2 * (a + s), bad: [a + s, a * s, 2 * a * s, 2 * a + s], u: ' cm', e: `Keliling = 2 × (alas + sisi miring) = 2 × (${a} + ${s}) = ${2 * (a + s)} cm.`, shape: ['jajar-genjang', { a, t, s }] } : { q: `Jajar genjang memiliki alas ${a} cm, tinggi ${t} cm, dan sisi miring ${s} cm. Berapa luasnya?`, g: a * t, bad: [a * s, a * t / 2, 2 * (a + s), a + t], u: ' cm²', e: `Luas = alas × tinggi (bukan sisi miring) = ${a} × ${t} = ${a * t} cm².`, shape: ['jajar-genjang', { a, t, s }] }; },
    trap(r, lv) { const a = sc(r, lv, 8, 20), b = ri(r, 4, a - 2), t = ri(r, 2, 10) * 2, s = t + 2, A = (a + b) * t / 2; return { q: `Trapesium memiliki sisi sejajar ${a} cm dan ${b} cm, tinggi ${t} cm. Berapa luasnya?`, g: A, bad: [(a + b) * t, a * b * t / 2, (a + b) / 2, a * t / 2], u: ' cm²', e: `Luas trapesium = ½ × (a + b) × t = ½ × (${a} + ${b}) × ${t} = ${A} cm².`, shape: ['trapesium', { a, b, t, s }] }; },
    bk(r, lv) { const [h, v, s] = tri(r, lv), d1 = 2 * h, d2 = 2 * v, kel = r() < .5; return kel ? { q: `Belah ketupat memiliki diagonal ${d1} cm dan ${d2} cm. Berapa kelilingnya?`, g: 4 * s, bad: [d1 + d2, 2 * (d1 + d2), 4 * (h + v), d1 * d2 / 2], u: ' cm', e: `Setengah diagonal membentuk segitiga siku-siku: ${h} dan ${v}.\nSisi = √(${h}² + ${v}²) = ${s} cm.\nKeliling = 4 × ${s} = ${4 * s} cm.`, shape: ['belah-ketupat', { d1, d2 }] } : { q: `Belah ketupat memiliki diagonal ${d1} cm dan ${d2} cm. Berapa luasnya?`, g: d1 * d2 / 2, bad: [d1 * d2, d1 + d2, 4 * s, d1 * d2 / 4], u: ' cm²', e: `Luas = ½ × d₁ × d₂ = ½ × ${d1} × ${d2} = ${d1 * d2 / 2} cm².`, shape: ['belah-ketupat', { d1, d2 }] }; },
    ll(r, lv) { const d1 = sc(r, lv, 4, 14) * 2, d2 = ri(r, 3, 10) * 2; return { q: `Layang-layang memiliki diagonal ${d1} cm dan ${d2} cm. Berapa luasnya?`, g: d1 * d2 / 2, bad: [d1 * d2, d1 + d2, d1 * d2 / 4, 2 * (d1 + d2)], u: ' cm²', e: `Luas layang-layang = ½ × d₁ × d₂ = ½ × ${d1} × ${d2} = ${d1 * d2 / 2} cm².`, shape: ['layang-layang', { d1, d2 }] }; },
    ling(r, lv) {
      const big = r() < .5, rr = big ? 7 * sc(r, lv, 1, 4) : 10 * sc(r, lv, 1, 3), pi = big ? 22 / 7 : 3.14, ps = big ? '22/7' : '3,14', kel = r() < .5;
      return kel ? { q: `Lingkaran berjari-jari ${rr} cm. Berapa kelilingnya? (π = ${ps})`, g: 2 * pi * rr, bad: [pi * rr * rr, pi * rr, 2 * pi * rr * rr, 4 * pi * rr], u: ' cm', e: `Keliling = 2 × π × r = 2 × ${ps} × ${rr} = ${fn(2 * pi * rr)} cm.`, shape: ['lingkaran', { r: rr }] }
        : { q: `Lingkaran berjari-jari ${rr} cm. Berapa luasnya? (π = ${ps})`, g: pi * rr * rr, bad: [2 * pi * rr, pi * rr, pi * 2 * rr * rr, 2 * pi * rr * rr], u: ' cm²', e: `Luas = π × r² = ${ps} × ${rr} × ${rr} = ${fn(pi * rr * rr)} cm².`, shape: ['lingkaran', { r: rr }] };
    }
  };
  /* satu soal dari seed */
  G.item = function (seed, kind, lv) {
    lv = lv || 'Sedang'; const r = mul(seed >>> 0); kind = KIND[kind] ? kind : G.KINDS[Math.floor(r() * G.KINDS.length)];
    const d = KIND[kind](r, lv); let o = d.o, a = d.a;
    if (!o) { const m = mc(r, d.g, d.bad, v => fn(v) + (d.u || '')); o = m.o; a = m.a; }
    const fig = d.shape && !d.noshape ? G.svg(d.shape[0], d.shape[1], 'cm') : '';
    return { lv, q: d.q, o, a, e: d.e, tp: G.topicOf(kind), kind, seed, fig, shape: d.shape ? { t: d.shape[0], p: d.shape[1] } : null, hi: 'Soal otomatis' };
  };
  /* kumpulan soal: topik & tingkat boleh disaring; jenis dibagi rata */
  G.batch = function (n, seed, opt) {
    opt = opt || {}; const r = mul((seed || 1) >>> 0);
    let kinds = opt.topics && opt.topics.length ? [].concat.apply([], G.TOPICS.filter(t => opt.topics.indexOf(t.id) >= 0).map(t => t.k)) : G.KINDS; if (!kinds.length) kinds = G.KINDS;
    const lvs = opt.lv && opt.lv !== 'Semua' ? [opt.lv] : ['Mudah', 'Sedang', 'Sulit']; const out = [], seen = {}; let guard = 0;
    for (let i = 0; i < n && guard < n * 8; guard++) { const it = G.item(Math.floor(r() * 4e9), kinds[i % kinds.length], lvs[Math.floor(r() * lvs.length)]), key = it.q + '|' + it.o.join(); if (seen[key]) continue; seen[key] = 1; out.push(it); i++; }
    return out;
  };
  /* ---------- deteksi bangun & angka di teks soal (soal unggahan) ---------- */
  G.SHAPES = [['segitiga-siku', 'Segitiga siku-siku'], ['persegi', 'Persegi'], ['persegi-panjang', 'Persegi panjang'], ['jajar-genjang', 'Jajar genjang'], ['trapesium', 'Trapesium'], ['belah-ketupat', 'Belah ketupat'], ['layang-layang', 'Layang-layang'], ['lingkaran', 'Lingkaran']];
  const nums = t => (String(t).match(/\d+(?:[.,]\d+)?/g) || []).map(x => parseFloat(x.replace(',', '.')));
  G.detectType = function (text) {
    const t = String(text || '').toLowerCase();
    if (/persegi\s*panjang/.test(t)) return 'persegi-panjang';
    if (/jajar\s*-?\s*genjang/.test(t)) return 'jajar-genjang';
    if (/belah\s*-?\s*ketupat/.test(t)) return 'belah-ketupat';
    if (/layang\s*-?\s*layang/.test(t)) return 'layang-layang';
    if (/trapesium/.test(t)) return 'trapesium';
    if (/lingkaran/.test(t)) return 'lingkaran';
    if (/segitiga\s*siku|sisi\s*miring|hipotenusa|pythagoras/.test(t)) return 'segitiga-siku';
    if (/persegi/.test(t)) return 'persegi';
    return '';
  };
  G.params = function (type, text) {
    const t = String(text || '').toLowerCase(), n = nums(t).filter(x => x > 0 && x < 100000);
    switch (type) {
      case 'persegi': return n.length ? { s: n[0] } : null;
      case 'persegi-panjang': return n.length > 1 ? { p: n[0], l: n[1] } : null;
      case 'segitiga-siku': {
        const m = /(?:sisi\s*miring|hipotenusa)[^\d]{0,25}(\d+(?:[.,]\d+)?)/.exec(t);
        if (m) { const c = parseFloat(m[1].replace(',', '.')), o = n.filter(x => x !== c); return o.length ? { a: o[0], b: '?', c } : null; }
        return n.length > 1 ? { a: n[0], b: n[1], c: '?' } : null;
      }
      case 'jajar-genjang': return n.length > 2 ? { a: n[0], t: n[1], s: n[2] } : null;
      case 'trapesium': return n.length > 3 ? { a: n[0], b: n[1], t: n[2], s: n[3] } : null;
      case 'belah-ketupat': case 'layang-layang': return n.length > 1 ? { d1: n[0], d2: n[1] } : null;
      case 'lingkaran': return n.length ? { r: /diameter/.test(t) ? n[0] / 2 : n[0] } : null;
    }
    return null;
  };
  G.detect = function (text) { const t = G.detectType(text); if (!t) return null; const p = G.params(t, text); return p ? { t, p } : null; };
  window.PPGen = G;
})();
