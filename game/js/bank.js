/* =========================================================
   PPBank — BANK SOAL TERPUSAT (satu sumber untuk Kuis, Game, dan Jelajah Dunia)
   Data : rooms/{KODE}/bank/{id}   = {q,t,o[],k,ex,tp,lv,src,batch,h,fg,fp,ts,by}
          rooms/{KODE}/bankb/{id}  = {n,src,c,ts,by}   (catatan satu kali impor = "batch")
   t: 'pg' pilihan ganda (2–5 opsi) | 'is' isian singkat | 'bs' benar-salah
   Sifat: HANYA MENAMBAH. Soal lama tidak pernah diubah oleh impor.
          Batch bisa dibatalkan (menghapus soal batch itu saja).
   Parser tanpa pustaka luar: CSV, XLSX, DOCX (ZIP+XML via DecompressionStream),
   teks tempel. PDF memakai pdf.js yang dimuat malas dari CDN; hasil scan -> OCR opsional.
   Semua teks dari berkas di-escape saat ditampilkan (lihat PPBuat.fmt / esc).
   ========================================================= */
(function () {
  'use strict';
  const C = () => window.PPCloud, B = { list: [], batches: [], loaded: false };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LIM = { q: 400, o: 120, ex: 600, tp: 40, room: 600, batch: 300, file: 12 * 1048576 };
  B.LIM = LIM; B.esc = esc;
  const LVS = ['Mudah', 'Sedang', 'Sulit'], LET = 'ABCDE';
  const fmt = t => (window.PPBuat ? PPBuat.fmt(t) : esc(t));
  const listeners = [];
  /* ---------- hash untuk deteksi duplikat ---------- */
  B.hash = it => { const s = (String(it.q).toLowerCase().replace(/[^a-z0-9√²]+/g, '') + '|' + (it.o || []).map(x => String(x).toLowerCase().replace(/[^a-z0-9√²]+/g, '')).sort().join(',')); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  /* ---------- normalisasi & validasi satu soal ---------- */
  const lvOf = v => { v = String(v || '').toLowerCase(); return /mudah|easy|^1$|rendah/.test(v) ? 'Mudah' : /sulit|hard|^3$|tinggi|hots/.test(v) ? 'Sulit' : 'Sedang'; };
  const tOf = v => { v = String(v || '').toLowerCase(); return /isian|uraian|short|^is$/.test(v) ? 'is' : /benar|salah|true|^bs$/.test(v) ? 'bs' : 'pg'; };
  B.norm = function (r) {
    const t = r.t || (r.o && r.o.length > 1 ? 'pg' : 'is');
    let o = (r.o || []).map(x => String(x == null ? '' : x).trim()).filter(x => x !== '');
    if (t === 'bs') o = ['Benar', 'Salah'];
    if (t === 'pg') o = o.slice(0, 5);
    return { q: String(r.q || '').trim().slice(0, LIM.q), t, o: o.map(x => x.slice(0, LIM.o)), k: Math.max(0, r.k | 0), ex: String(r.ex || '').trim().slice(0, LIM.ex), tp: String(r.tp || 'Umum').trim().slice(0, LIM.tp) || 'Umum', lv: lvOf(r.lv), fg: r.fg || '', no: r.no };
  };
  /* kembalikan daftar galat (menghalangi simpan) */
  B.errors = function (it) {
    const e = []; if (!it.q) e.push('Pertanyaan kosong');
    if (it.t === 'pg') { if (it.o.length < 2) e.push('Opsi kurang dari 2'); if (new Set(it.o.map(x => x.toLowerCase())).size < it.o.length) e.push('Ada opsi kembar'); if (!(it.k >= 0 && it.k < it.o.length) || it.kEmpty) e.push('Kunci kosong/tidak cocok'); }
    if (it.t === 'bs' && !(it.k === 0 || it.k === 1)) e.push('Kunci harus Benar/Salah');
    if (it.t === 'is' && !(it.o[0] || '').trim()) e.push('Jawaban isian kosong');
    return e;
  };
  /* ---------- baca/tulis ke penyimpanan pusat ---------- */
  const fromDb = v => Object.keys(v || {}).map(id => Object.assign({ id }, v[id])).filter(x => x && typeof x.q === 'string' && Array.isArray(x.o)).map(x => Object.assign(B.norm(x), { id: x.id, src: String(x.src || ''), batch: String(x.batch || ''), h: x.h || B.hash(x), fp: x.fp || null, ts: x.ts || 0, by: String(x.by || '') })).sort((a, b) => a.ts - b.ts);
  const emit = () => listeners.forEach(f => { try { f(B.list); } catch (e) { } });
  B.refresh = async function () {
    const [v, bb] = await Promise.all([C().get('bank'), C().get('bankb')]); if (v === undefined) return false;
    B.list = fromDb(v); B.batches = Object.keys(bb || {}).map(id => Object.assign({ id }, bb[id])).sort((a, b) => b.ts - a.ts); B.loaded = true; emit(); return true;
  };
  B.onChange = f => { listeners.push(f); return () => { const i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); }; };
  B.watch = () => { const a = C().watch('bank', v => { B.list = fromDb(v); B.loaded = true; emit(); }, 8000), b = C().watch('bankb', v => { B.batches = Object.keys(v || {}).map(id => Object.assign({ id }, v[id])).sort((x, y) => y.ts - x.ts); emit(); }, 8000); return () => { a && a(); b && b(); }; };
  /* simpan satu kali impor (append-only). items sudah tervalidasi & dicentang */
  B.saveBatch = async function (items, meta) {
    await B.refresh(); const have = new Set(B.list.map(x => x.h));
    if (B.list.length + items.length > LIM.room) throw new Error('Bank soal penuh (maks ' + LIM.room + ').');
    const bid = C().uid(), ts = Date.now(), patch = {}; let n = 0;
    items.slice(0, LIM.batch).forEach(it => {
      const x = B.norm(it), h = B.hash(x); if (B.errors(x).length || have.has(h)) return; have.add(h);
      const rec = { q: x.q, t: x.t, o: x.o, k: x.k, ex: x.ex, tp: x.tp, lv: x.lv, src: meta.src, batch: bid, h, ts: ts + n, by: String(meta.by || 'Guru').slice(0, 40) };
      if (it.fg && it.fp) { rec.fg = it.fg; rec.fp = it.fp; }
      patch[C().uid() + n] = rec; n++;
    });
    if (!n) throw new Error('Tidak ada soal baru yang valid untuk disimpan.');
    const ok1 = await C().patch('bank', patch), ok2 = await C().put('bankb/' + bid, { n: String(meta.name || 'Impor').slice(0, 80), src: meta.src, c: n, ts, by: String(meta.by || 'Guru').slice(0, 40) });
    if (!(ok1 && ok2)) throw new Error('Belum tersimpan. Coba lagi.');
    await B.refresh(); return { batch: bid, count: n };
  };
  /* batalkan satu batch: hanya menghapus soal milik batch itu */
  B.undoBatch = async function (bid) {
    await B.refresh(); const ids = B.list.filter(x => x.batch === bid).map(x => x.id);
    await Promise.all(ids.map(id => C().del('bank/' + id))); await C().del('bankb/' + bid); await B.refresh(); return ids.length;
  };
  B.remove = async id => { await C().del('bank/' + id); await B.refresh(); };
  /* ---------- pemakaian oleh Kuis / Game / Jelajah ---------- */
  const isNum = s => /^-?\d+(?:[.,]\d+)?$/.test(String(s).trim());
  /* bentuk pilihan ganda untuk semua modul; isian numerik dibuatkan pengecoh; isian teks dilewati */
  B.toMC = function (x) {
    let o, a;
    if (x.t === 'pg') { if (x.o.length < 2) return null; o = x.o.slice(0, 5); a = x.k; }
    else if (x.t === 'bs') { o = ['Benar', 'Salah']; a = x.k ? 1 : 0; }
    else { const ans = (x.o[0] || '').split(/[|;]/)[0].trim(); if (!isNum(ans)) return null; const v = parseFloat(ans.replace(',', '.')), d = Number.isInteger(v) ? 1 : 0.1; const c = [v + d, v - d, v * 2, v + 10 * d, v / 2, v + 2 * d].filter(z => z > 0 && z !== v); const ws = []; c.forEach(z => { const s = String(Math.round(z * 100) / 100).replace('.', ','); if (ws.indexOf(s) < 0 && s !== ans && ws.length < 3) ws.push(s); }); if (ws.length < 3) return null; o = ws.concat([ans]); const sd = [...x.q].reduce((h, c2) => (h * 31 + c2.charCodeAt(0)) | 0, 7); o = o.map((v2, i) => [v2, ((sd >>> (i * 3)) & 7) + i * 0.1]).sort((p, q) => p[1] - q[1]).map(p => p[0]); a = o.indexOf(ans); }
    let fig = ''; if (x.fg && x.fp && window.PPGen) fig = PPGen.svg(x.fg, x.fp, 'cm'); else if (window.PPGen) { const d = PPGen.detect(x.q); if (d) fig = PPGen.svg(d.t, d.p, 'cm'); }
    return { lv: x.lv, q: fmt(x.q), o: o.map(fmt), a, e: fmt(x.ex || 'Kunci: ' + (x.t === 'is' ? x.o[0] : o[a])).replace(/<br>/g, '\n'), tp: x.tp, hi: 'Soal dari guru' + (x.tp && x.tp !== 'Umum' ? ' · ' + esc(x.tp) : ''), fig, src: 'upload', id: x.id };
  };
  B.pool = function (f) {
    f = f || {}; return B.list.filter(x => (!f.batch || f.batch === 'all' || x.batch === f.batch) && (!f.topic || f.topic === 'all' || x.tp === f.topic) && (!f.lv || f.lv === 'all' || f.lv === 'Semua' || x.lv === f.lv)).map(B.toMC).filter(Boolean);
  };
  B.topics = () => Array.from(new Set(B.list.map(x => x.tp))).sort();
  B.count = () => B.pool().length;
  setTimeout(() => { try { B.refresh(); } catch (e) { } }, 1800);

  /* =====================================================
     PEMBACA BERKAS
     ===================================================== */
  const U8 = b => new Uint8Array(b);
  const utf8 = u => new TextDecoder('utf-8').decode(u);
  async function inflate(raw) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Browser ini belum mendukung membaca berkas Office. Pakai CSV atau tempel teks.');
    const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(raw); w.close();
    return new Uint8Array(await new Response(ds.readable).arrayBuffer());
  }
  /* pembaca ZIP minimal (cukup untuk .xlsx/.docx) */
  B.unzip = async function (buf) {
    const u = U8(buf), dv = new DataView(u.buffer, u.byteOffset, u.byteLength); let e = u.length - 22;
    while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new Error('Berkas bukan dokumen Office yang valid.');
    const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const ent = {};
    for (let i = 0; i < n; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const meth = dv.getUint16(p + 10, true), cs = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
      const name = utf8(u.subarray(p + 46, p + 46 + nl)); p += 46 + nl + el + cl;
      const ds = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true); ent[name] = { meth, raw: u.subarray(ds, ds + cs) };
    }
    return { names: Object.keys(ent), async text(name) { const z = ent[name]; if (!z) return null; return utf8(z.meth === 0 ? z.raw : await inflate(z.raw)); } };
  };
  const xml = s => { const d = new DOMParser().parseFromString(s, 'application/xml'); if (d.querySelector('parsererror')) throw new Error('Isi dokumen rusak.'); return d; };
  const colIdx = ref => { const m = /^([A-Z]+)/.exec(ref); let n = 0; (m ? m[1] : 'A').split('').forEach(c => n = n * 26 + c.charCodeAt(0) - 64); return n - 1; };
  /* .xlsx -> matriks baris x kolom (lembar pertama) */
  B.readXlsx = async function (buf) {
    const z = await B.unzip(buf), ss = [], sx = await z.text('xl/sharedStrings.xml');
    if (sx) xml(sx).querySelectorAll('si').forEach(si => ss.push(Array.from(si.querySelectorAll('t')).map(t => t.textContent).join('')));
    const nm = z.names.filter(n => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')))[0];
    if (!nm) throw new Error('Lembar kerja tidak ditemukan.');
    const rows = []; xml(await z.text(nm)).querySelectorAll('sheetData > row').forEach(r => {
      const row = []; r.querySelectorAll(':scope > c').forEach(c => {
        const t = c.getAttribute('t'), v = c.querySelector('v'); let val = '';
        if (t === 's') val = ss[+(v && v.textContent)] || ''; else if (t === 'inlineStr') val = Array.from(c.querySelectorAll('t')).map(x => x.textContent).join(''); else val = v ? v.textContent : '';
        row[colIdx(c.getAttribute('r') || 'A1')] = val;
      }); rows.push(Array.from(row, x => x == null ? '' : String(x)));
    });
    return rows;
  };
  /* .docx -> teks baris demi baris */
  B.readDocx = async function (buf) {
    const z = await B.unzip(buf), dx = await z.text('word/document.xml'); if (!dx) throw new Error('Isi dokumen Word tidak ditemukan.');
    const d = xml(dx), out = [];
    d.querySelectorAll('w\\:p, p').forEach(p => {
      let s = ''; p.querySelectorAll('w\\:t, w\\:tab, w\\:br, t, tab, br').forEach(n => { const ln = n.localName || n.nodeName; s += /^(tab)$/.test(ln) ? ' ' : /^br$/.test(ln) ? '\n' : n.textContent; }); out.push(s);
    });
    return out.join('\n');
  };
  /* CSV (koma atau titik koma, tanda kutip) */
  B.readCsv = function (text) {
    text = text.replace(/^﻿/, ''); const first = text.split('\n')[0] || '', d = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
    const rows = []; let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === d) { row.push(cur); cur = ''; } else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (c !== '\r') cur += c;
    }
    row.push(cur); if (row.length > 1 || row[0] !== '') rows.push(row); return rows;
  };
  /* PDF: pdf.js dimuat malas; mengembalikan {text, pages, charsPerPage} */
  const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Tidak bisa memuat pustaka (butuh internet).')); document.head.appendChild(s); });
  B.readPdf = async function (buf, onProg) {
    if (!window.pdfjsLib) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const doc = await pdfjsLib.getDocument({ data: U8(buf) }).promise; let text = '';
    for (let p = 1; p <= doc.numPages; p++) {
      const pg = await doc.getPage(p), tc = await pg.getTextContent(); let y = null, line = '';
      tc.items.forEach(it => { const yy = Math.round(it.transform[5]); if (y !== null && Math.abs(yy - y) > 3) { text += line.trim() + '\n'; line = ''; } y = yy; line += it.str + (it.hasEOL ? ' ' : ''); });
      text += line.trim() + '\n'; onProg && onProg(p, doc.numPages);
    }
    return { text, pages: doc.numPages, cpp: text.replace(/\s/g, '').length / Math.max(1, doc.numPages), doc };
  };
  /* OCR opsional untuk PDF scan (Tesseract.js dimuat malas) */
  B.ocrPdf = async function (doc, onProg) {
    if (!window.Tesseract) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js');
    const wk = await Tesseract.createWorker('ind'); let text = '';
    for (let p = 1; p <= Math.min(doc.numPages, 30); p++) {
      const pg = await doc.getPage(p), vp = pg.getViewport({ scale: 2 }), cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height;
      await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; const r = await wk.recognize(cv); text += r.data.text + '\n'; onProg && onProg(p, doc.numPages);
    }
    await wk.terminate(); return text;
  };

  /* =====================================================
     PENGURAI TEKS -> SOAL
     Dikenali: "1." / "1)" / "Soal 1:", opsi A. A) (A), kunci, pembahasan, topik, tingkat, tipe.
     ===================================================== */
  const RE = {
    q: /^\s*(?:soal\s*)?(\d{1,3})\s*[.):]\s*(.*)$/i,
    o: /^\s*\(?([A-Ea-e])\s*[.)]\s*(\S.*)$/,
    k: /^\s*(?:kunci(?:\s*jawaban)?|jawaban(?:\s*benar)?|answer|key)\s*[:=\-]?\s*(.+)$/i,
    e: /^\s*(?:pembahasan|penjelasan|solusi|explanation)\s*[:=\-]?\s*(.*)$/i,
    tp: /^\s*(?:topik|kategori)\s*[:=\-]\s*(.+)$/i, lv: /^\s*(?:tingkat(?:\s*kesulitan)?|level|kesulitan)\s*[:=\-]\s*(.+)$/i, ty: /^\s*(?:tipe|jenis)(?:\s*soal)?\s*[:=\-]\s*(.+)$/i
  };
  const PAIRS = /(\d{1,3})\s*[.):\-]?\s*([A-Ea-e])\b/g;
  B.parseText = function (txt) {
    const lines = String(txt || '').replace(/\r/g, '').split('\n'); const items = []; let cur = null, field = 'q', last = 0; const keyMap = {};
    const push = () => { if (cur && (cur.q || cur.o.length)) items.push(cur); cur = null; };
    const addOpt = (L, s) => { cur.o.push(s.trim()); cur.oL.push(L.toUpperCase()); field = 'o'; };
    lines.forEach(raw => {
      const line = raw.trim(); if (!line) return; let m;
      /* daftar kunci "1. B 2. C ..." di akhir dokumen */
      if ((m = RE.k.exec(line)) && /^(?:\s*\d{1,3}\s*[.):\-]?\s*[A-Ea-e]\b[\s,;]*){2,}$/.test(m[1])) { let p; PAIRS.lastIndex = 0; while ((p = PAIRS.exec(m[1]))) keyMap[+p[1]] = p[2].toUpperCase(); return; }
      if (/^\s*(?:kunci(?:\s*jawaban)?)\s*:?\s*$/i.test(line)) { field = 'keys'; return; }
      if (field === 'keys' && /^(?:\s*\d{1,3}\s*[.):\-]?\s*[A-Ea-e]\b[\s,;]*)+$/.test(line)) { let p; PAIRS.lastIndex = 0; while ((p = PAIRS.exec(line))) keyMap[+p[1]] = p[2].toUpperCase(); return; }
      if (cur && (m = RE.e.exec(line))) { cur.ex = m[1]; field = 'ex'; return; }
      if (cur && (m = RE.k.exec(line))) { cur.key = m[1].trim(); field = 'key'; return; }
      if (cur && (m = RE.tp.exec(line))) { cur.tp = m[1].trim(); return; }
      if (cur && (m = RE.lv.exec(line))) { cur.lv = m[1].trim(); return; }
      if (cur && (m = RE.ty.exec(line))) { cur.ty = m[1].trim(); return; }
      if ((m = RE.q.exec(line))) {
        const no = +m[1], hasWork = cur && (cur.o.length >= 2 || cur.key || field === 'ex');
        if (!cur || no === last + 1 || hasWork) { push(); cur = { no, q: m[2].trim(), o: [], oL: [], ex: '', key: '', tp: '', lv: '', ty: '' }; last = no; field = 'q'; return; }
      }
      if (cur && (m = RE.o.exec(line)) && (cur.o.length ? true : /^\s*\(?[Aa]\s*[.)]/.test(line))) {
        if (/\s\(?[B-Eb-e]\s*[.)]\s/.test(' ' + line) && /^\s*\(?[Aa]/.test(line)) { line.split(/\s+(?=\(?[A-Ea-e]\s*[.)]\s)/).forEach(seg => { const mm = RE.o.exec(seg); if (mm) addOpt(mm[1], mm[2]); }); } else addOpt(m[1], m[2]);
        return;
      }
      if (!cur) return;
      if (field === 'q') cur.q += ' ' + line; else if (field === 'o' && cur.o.length) cur.o[cur.o.length - 1] += ' ' + line; else if (field === 'ex') cur.ex += ' ' + line; else if (field === 'key') cur.key += ' ' + line;
    });
    push();
    return items.map(r => finish(r, keyMap[r.no]));
  };
  /* tentukan tipe & indeks kunci */
  function finish(r, mapKey) {
    const key = (r.key || mapKey || '').trim(); let t = r.ty ? tOf(r.ty) : r.o.length >= 2 ? 'pg' : (/^(benar|salah|true|false)$/i.test(key) || /\(\s*benar\s*\/\s*salah\s*\)|benar atau salah/i.test(r.q)) ? 'bs' : 'is';
    const it = { no: r.no, q: r.q, t, o: r.o.slice(), k: 0, ex: r.ex, tp: r.tp || 'Umum', lv: r.lv, kEmpty: false };
    if (t === 'pg') {
      const L = /^\(?([A-Ea-e])\)?[.)]?$/.exec(key); let ix = L ? LET.indexOf(L[1].toUpperCase()) : -1;
      if (ix < 0 && key) ix = it.o.findIndex(x => x.toLowerCase() === key.toLowerCase());
      if (ix < 0 && key) { const m2 = /^\(?([A-Ea-e])[.)]\s/.exec(key); if (m2) ix = LET.indexOf(m2[1].toUpperCase()); }
      if (ix < 0) it.kEmpty = true; it.k = Math.max(0, ix);
    } else if (t === 'bs') { it.k = /^(benar|true|b|ya)$/i.test(key) ? 0 : /^(salah|false|s|tidak)$/i.test(key) ? 1 : 0; it.kEmpty = !key; it.o = ['Benar', 'Salah']; }
    else { it.o = key ? [key] : []; }
    return it;
  }
  /* matriks (Excel/CSV) -> soal. Header dikenali; tanpa header: No,Soal,A,B,C,D,E,Kunci,Pembahasan,Topik,Tingkat,Tipe */
  B.parseRows = function (rows) {
    rows = rows.filter(r => r.some(c => String(c).trim() !== '')); if (!rows.length) return [];
    const norm = s => String(s).toLowerCase().replace(/[^a-z]/g, ''); let hi = rows.findIndex(r => r.some(c => /^(soal|pertanyaan)$/.test(norm(c)))), col = {};
    if (hi >= 0) rows[hi].forEach((c, i) => { const n = norm(c); const m = { no: /^(no|nomor)$/, q: /^(soal|pertanyaan)$/, A: /^(a|opsia|pilihana)$/, B: /^(b|opsib|pilihanb)$/, C: /^(c|opsic|pilihanc)$/, D: /^(d|opsid|pilihand)$/, E: /^(e|opsie|pilihane)$/, k: /^(kunci|kuncijawaban|jawaban|jawabanbenar)$/, ex: /^(pembahasan|penjelasan)$/, tp: /^(topik|kategori)$/, lv: /^(tingkat|tingkatkesulitan|level|kesulitan)$/, ty: /^(tipe|jenis|tipesoal)$/ }; Object.keys(m).forEach(k => { if (m[k].test(n) && col[k] === undefined) col[k] = i; }); });
    else col = { no: 0, q: 1, A: 2, B: 3, C: 4, D: 5, E: 6, k: 7, ex: 8, tp: 9, lv: 10, ty: 11 };
    const g = (r, k) => col[k] === undefined ? '' : String(r[col[k]] == null ? '' : r[col[k]]).trim();
    return rows.slice(hi >= 0 ? hi + 1 : 0).map((r, i) => {
      const o = ['A', 'B', 'C', 'D', 'E'].map(L => g(r, L)).filter(Boolean), key = g(r, 'k'); let t = g(r, 'ty') ? tOf(g(r, 'ty')) : o.length >= 2 ? 'pg' : /^(benar|salah)$/i.test(key) ? 'bs' : 'is';
      return finish({ no: g(r, 'no') || i + 1, q: g(r, 'q'), o, oL: [], ex: g(r, 'ex'), key, tp: g(r, 'tp'), lv: g(r, 'lv'), ty: t === 'pg' ? 'pg' : t }, null);
    }).filter(it => it.q || it.o.length);
  };
  /* JSON format lama {q,o[4],k,lv,ex,tp} tetap diterima */
  B.parseJson = function (txt) { const a = JSON.parse(txt); if (!Array.isArray(a)) throw new Error('Format JSON harus berupa daftar soal.'); return a.map((r, i) => ({ no: i + 1, q: String(r.q || ''), t: 'pg', o: Array.isArray(r.o) ? r.o.map(String) : [], k: r.k | 0, ex: String(r.ex || ''), tp: String(r.tp || 'Umum'), lv: r.lv })); };
  /* baca satu berkas -> {items, kind, warn, doc} */
  B.readFile = async function (file, onProg) {
    if (file.size > LIM.file) throw new Error('Ukuran berkas ' + (file.size / 1048576).toFixed(1) + ' MB melebihi batas ' + LIM.file / 1048576 + ' MB.');
    const nm = file.name.toLowerCase(), buf = await file.arrayBuffer(); let items, kind;
    if (/\.xlsx$/.test(nm)) { kind = 'xlsx'; items = B.parseRows(await B.readXlsx(buf)); }
    else if (/\.(csv|tsv|txt)$/.test(nm) && !/\.txt$/.test(nm)) { kind = 'csv'; items = B.parseRows(B.readCsv(utf8(U8(buf)))); }
    else if (/\.json$/.test(nm)) { kind = 'json'; items = B.parseJson(utf8(U8(buf))); }
    else if (/\.docx$/.test(nm)) { kind = 'docx'; items = B.parseText(await B.readDocx(buf)); }
    else if (/\.pdf$/.test(nm)) {
      kind = 'pdf'; const r = await B.readPdf(buf, onProg);
      if (r.cpp < 40) return { items: [], kind, scan: true, doc: r.doc, text: r.text };
      items = B.parseText(r.text); return { items, kind, text: r.text, doc: r.doc };
    }
    else if (/\.xls$/.test(nm)) throw new Error('Format .xls lama belum didukung. Simpan sebagai .xlsx atau .csv.');
    else if (/\.txt$/.test(nm)) { kind = 'teks'; items = B.parseText(utf8(U8(buf))); }
    else throw new Error('Format tidak dikenali. Pakai PDF, DOCX, XLSX, CSV, atau JSON.');
    return { items, kind };
  };
  B.SRCNAME = { pdf: 'PDF', docx: 'Word', xlsx: 'Excel', csv: 'CSV', json: 'JSON', teks: 'Teks tempel', ocr: 'PDF (OCR)' };

  /* =====================================================
     TEMPLATE RESMI (Excel / Word / CSV) — dibuat di peramban
     ===================================================== */
  const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = crcT[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), parts = [], cen = []; let off = 0; const u16 = v => [v & 255, v >> 8 & 255], u32 = v => [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255];
    files.forEach(f => {
      const nm = enc.encode(f.name), d = enc.encode(f.data), crc = crc32(d);
      const h = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(nm.length), ...u16(0), ...nm]);
      cen.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(nm.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off), ...nm]));
      parts.push(h, d); off += h.length + d.length;
    });
    const cs = cen.reduce((a, c) => a + c.length, 0), end = new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cs), ...u32(off), 0, 0]);
    return new Blob([...parts, ...cen, end]);
  }
  const X = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  B.TEMPLATE_ROWS = [
    ['No', 'Soal', 'A', 'B', 'C', 'D', 'E', 'Kunci', 'Pembahasan', 'Topik', 'Tingkat', 'Tipe'],
    [1, 'Sisi tegak segitiga siku-siku 6 cm dan 8 cm. Berapa panjang sisi miringnya?', '10 cm', '14 cm', '12 cm', '100 cm', '', 'A', 'c² = 6² + 8² = 100, c = 10.', 'Pythagoras', 'Mudah', 'Pilihan ganda'],
    [2, 'Segitiga dengan sisi 3, 4, 5 membentuk tripel Pythagoras.', '', '', '', '', '', 'Benar', '3² + 4² = 5².', 'Pythagoras', 'Mudah', 'Benar-salah'],
    [3, 'Luas persegi bersisi 9 cm adalah … cm².', '', '', '', '', '', '81', 'Luas = s × s.', 'Persegi', 'Mudah', 'Isian singkat']
  ];
  B.templateXlsx = function () {
    const rows = B.TEMPLATE_ROWS, colL = i => String.fromCharCode(65 + i);
    const sd = rows.map((r, ri) => `<row r="${ri + 1}">` + r.map((v, ci) => v === '' ? '' : typeof v === 'number' ? `<c r="${colL(ci)}${ri + 1}"><v>${v}</v></c>` : `<c r="${colL(ci)}${ri + 1}" t="inlineStr"><is><t>${X(v)}</t></is></c>`).join('') + '</row>').join('');
    return zip([
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Soal" sheetId="1" r:id="rId1"/></sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>' },
      { name: 'xl/worksheets/sheet1.xml', data: '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="2" max="2" width="60" customWidth="1"/><col min="3" max="7" width="16" customWidth="1"/><col min="9" max="9" width="40" customWidth="1"/></cols><sheetData>' + sd + '</sheetData></worksheet>' }
    ]);
  };
  B.TEMPLATE_TEXT = `PETUNJUK: tulis satu soal per nomor. Opsi A–E boleh ditulis "A." "A)" atau "(A)". Baris Kunci, Pembahasan, Topik, Tingkat, dan Tipe bersifat opsional.
Tingkat: Mudah / Sedang / Sulit. Tipe: Pilihan ganda / Isian singkat / Benar-salah.

1. Sisi tegak segitiga siku-siku 6 cm dan 8 cm. Berapa panjang sisi miringnya?
A. 10 cm
B. 14 cm
C. 12 cm
D. 100 cm
Kunci: A
Pembahasan: c² = 6² + 8² = 100, jadi c = 10 cm.
Topik: Pythagoras
Tingkat: Mudah

2. Segitiga bersisi 3, 4, dan 5 membentuk tripel Pythagoras. (Benar/Salah)
Kunci: Benar
Pembahasan: 3² + 4² = 25 = 5².
Tipe: Benar-salah

3. Luas persegi bersisi 9 cm adalah … cm².
Kunci: 81
Tipe: Isian singkat
`;
  B.templateDocx = function () {
    const paras = B.TEMPLATE_TEXT.split('\n').map(l => `<w:p><w:r><w:t xml:space="preserve">${X(l)}</w:t></w:r></w:p>`).join('');
    return zip([
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
      { name: 'word/document.xml', data: '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + paras + '</w:body></w:document>' }
    ]);
  };
  B.templateCsv = () => new Blob(['﻿' + B.TEMPLATE_ROWS.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n')], { type: 'text/csv' });
  window.PPBank = B;
})();
