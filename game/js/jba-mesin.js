/* JBA Mesin: hitung presisi (pecahan BigInt), tanpa eval, tanpa kesalahan 0,1+0,2. */
(function (root) {
  'use strict';
  const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; };
  function R(n, d = 1n, approx = false) {
    if (d === 0n) throw new Error('Tidak bisa dibagi 0');
    if (d < 0n) { n = -n; d = -d; }
    const g = gcd(n, d) || 1n;
    return { n: n / g, d: d / g, approx };
  }
  const add = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d, a.approx || b.approx);
  const sub = (a, b) => R(a.n * b.d - b.n * a.d, a.d * b.d, a.approx || b.approx);
  const mul = (a, b) => R(a.n * b.n, a.d * b.d, a.approx || b.approx);
  const div = (a, b) => { if (b.n === 0n) throw new Error('Tidak bisa dibagi 0'); return R(a.n * b.d, a.d * b.n, a.approx || b.approx); };
  function isqrt(n) {
    if (n < 2n) return n;
    let x = BigInt(Math.floor(Math.sqrt(Number(n)))) || 1n;
    for (;;) { const y = (x + n / x) >> 1n; if (y === x || y === x + 1n && y * y > n) break; if (y === x - 1n && y * y <= n) { x = y; break; } x = y; }
    while (x * x > n) x -= 1n;
    while ((x + 1n) * (x + 1n) <= n) x += 1n;
    return x;
  }
  function sqrt(a) {
    if (a.n < 0n) throw new Error('Akar bilangan negatif tidak ada');
    const sn = isqrt(a.n), sd = isqrt(a.d);
    if (sn * sn === a.n && sd * sd === a.d) return R(sn, sd, a.approx);
    const P = 10n ** 15n;
    return R(isqrt((a.n * P * P) / a.d), P, true);
  }
  function parseNum(s) {
    s = String(s).trim().replace(',', '.');
    if (!/^\d*\.?\d*$/.test(s) || s === '' || s === '.') throw new Error('Angka tidak valid');
    const [i, f = ''] = s.split('.');
    return R(BigInt((i || '0') + f), 10n ** BigInt(f.length));
  }
  function fmt(r, dec) {
    // dec: null = otomatis (maks 6 desimal, buang nol), angka = tepat segitu desimal
    const auto = dec == null, k = auto ? 6 : dec;
    const neg = r.n < 0n, a = neg ? -r.n : r.n, p = 10n ** BigInt(k);
    const q = (a * p * 2n + r.d) / (2n * r.d);
    const exact = !r.approx && (a * p) % r.d === 0n;
    let ip = q / p, fp = k === 0 ? '' : (q % p).toString().padStart(k, '0');
    if (auto) fp = fp.replace(/0+$/, '');
    const body = ip.toString() + (fp ? ',' + fp : '');
    const zero = q === 0n;
    return { teks: (neg && !zero ? '−' : '') + body, hampir: !exact, nol: zero };
  }
  function radikal(r) { // untuk bilangan bulat positif bukan kuadrat sempurna: k√m
    if (r.d !== 1n || r.n < 2n || r.n > 10n ** 12n) return null;
    let n = Number(r.n), k = 1;
    for (let i = 2; i * i <= n; i++) while (n % (i * i) === 0) { n /= i * i; k *= i; }
    if (n === 1) return null;
    return (k > 1 ? k : '') + '√' + n;
  }
  /* ---------- parser ---------- */
  function tokenize(s, ans) {
    const t = []; let i = 0;
    s = s.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−').replace(/\^2/g, '²');
    while (i < s.length) {
      const c = s[i];
      if (/\d|,|\./.test(c)) { let j = i; while (j < s.length && /[\d,.]/.test(s[j])) j++; t.push({ t: 'n', v: s.slice(i, j) }); i = j; }
      else if (s.startsWith('Ans', i)) { t.push({ t: 'a' }); i += 3; }
      else if ('+−×÷()²√'.includes(c)) { t.push({ t: c }); i++; }
      else if (c === ' ') i++;
      else throw new Error('Karakter tidak dikenal');
    }
    return t;
  }
  function parse(tokens, ans) {
    let p = 0;
    const pk = () => tokens[p] && tokens[p].t;
    function expr() {
      let v = term();
      while (pk() === '+' || pk() === '−') { const o = tokens[p++].t; const w = term(); v = o === '+' ? add(v, w) : sub(v, w); }
      return v;
    }
    function term() {
      let v = factor();
      for (;;) {
        const k = pk();
        if (k === '×' || k === '÷') { p++; const w = factor(); v = k === '×' ? mul(v, w) : div(v, w); }
        else if (k === '(' || k === '√' || k === 'n' || k === 'a') { v = mul(v, factor()); } // perkalian tersirat: 2√(9), 3(4)
        else break;
      }
      return v;
    }
    function factor() { if (pk() === '−') { p++; const v = factor(); return R(-v.n, v.d, v.approx); } return power(); }
    function power() {
      let v = atom();
      while (pk() === '²') { p++; v = mul(v, v); }
      return v;
    }
    function atom() {
      const k = pk();
      if (k === 'n') return parseNum(tokens[p++].v);
      if (k === 'a') { p++; if (!ans) throw new Error('Belum ada hasil sebelumnya'); return ans; }
      if (k === '(') { p++; const v = expr(); if (pk() !== ')') throw new Error('Kurung belum ditutup'); p++; return v; }
      if (k === '√') { p++; const v = atom(); let u = v; while (pk() === '²') { p++; u = mul(u, u); } return sqrt(u); }
      throw new Error('Ekspresi belum lengkap');
    }
    const v = expr();
    if (p < tokens.length) throw new Error('Ekspresi tidak valid');
    return v;
  }
  function hitung(s, ans, longgar) {
    // longgar=true: pratinjau langsung (buang operator di ujung, tutup kurung otomatis)
    let e = String(s || '');
    if (longgar) {
      e = e.replace(/[+−×÷\-*/\s]+$/g, '');
      e = e.replace(/√\(?$/g, '');
      const o = (e.match(/\(/g) || []).length - (e.match(/\)/g) || []).length;
      if (o > 0) e += ')'.repeat(o);
      e = e.replace(/\(\)/g, '');
      if (!e.trim()) return null;
    }
    try { return { nilai: parse(tokenize(e, ans), ans) }; }
    catch (err) { return { galat: err.message }; }
  }
  /* ---------- pita (penjumlahan otomatis) ---------- */
  function jumlahPita(items, mode) {
    let tot = R(0n); const baris = [];
    for (const it of items) {
      let v = it;
      if (mode === 'kuadrat') v = mul(it, it); else if (mode === 'akar') v = sqrt(it);
      baris.push(v); tot = add(tot, v);
    }
    return { baris, total: tot };
  }
  /* ---------- Pythagoras ---------- */
  function pyth(f) { // f = {a,b,c} string atau ''. Tepat satu kosong.
    const kosong = ['a', 'b', 'c'].filter(k => !String(f[k] || '').trim());
    if (kosong.length !== 1) return null;
    const v = {}; for (const k of ['a', 'b', 'c']) if (!kosong.includes(k)) { v[k] = parseNum(f[k]); if (v[k].n <= 0n) throw new Error('Panjang sisi harus lebih dari 0'); }
    const t = kosong[0], S = x => fmt(x).teks, kuad = x => mul(x, x);
    const L = [];
    let hasil, akarArg;
    if (t === 'c') {
      const A = kuad(v.a), B = kuad(v.b); akarArg = add(A, B);
      L.push('c² = a² + b²');
      L.push(`c² = ${S(v.a)}² + ${S(v.b)}² = ${S(A)} + ${S(B)} = ${S(akarArg)}`);
    } else {
      const o = t === 'a' ? 'b' : 'a';
      if (!(v.c.n * v.c.d !== 0n) || sub(v.c, v[o]).n <= 0n) throw new Error('Sisi miring (c) harus paling panjang');
      const C = kuad(v.c), O = kuad(v[o]); akarArg = sub(C, O);
      L.push(`${t}² = c² − ${o}²`);
      L.push(`${t}² = ${S(v.c)}² − ${S(v[o])}² = ${S(C)} − ${S(O)} = ${S(akarArg)}`);
    }
    hasil = sqrt(akarArg);
    const rad = radikal(akarArg), exact = !hasil.approx;
    L.push(`${t} = √${S(akarArg)} ${exact ? '= ' + S(hasil) : '≈ ' + fmt(hasil, 2).teks + (rad ? '  (bentuk akar: ' + rad + ')' : '')}`);
    return { cari: t, langkah: L, hasil, rad };
  }
  const API = { R, add, sub, mul, div, sqrt, parseNum, fmt, radikal, hitung, jumlahPita, pyth, isqrt };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.JBAMesin = API;
})(typeof window !== 'undefined' ? window : globalThis);
