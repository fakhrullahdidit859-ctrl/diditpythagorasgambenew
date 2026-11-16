/* =========================================================
   LKPD PROYEK — layar siswa & guru (PP.screens.lkpd)  · versi 2
   Siswa  : Beranda -> Tes Diagnostik (konfirmasi, terkunci) -> LKPD 6 langkah (terkunci setelah kirim)
            -> Riwayat pengerjaan (selalu bisa dilihat) -> Editor & penayangan Presentasi.
   Guru   : Kelompok · Pantau · Nilai · Presentasi · Parameter · Pengaturan · Naskah (semua bisa diedit).
   Data   : rooms/{KODE}/lkpd/{cfg|diag|map|grp|blob|rub|nilai|pres|presv|req}  (PPCloud; lokal bila Firebase kosong).
   Aturan emas: data siswa TIDAK PERNAH ditimpa lembar kosong. Kelompok pratinjau tidak disimpan ke server.
   Berkas bukti: Firebase Storage bila storageBucket diisi; bila tidak, dipecah jadi potongan di database
   (maks. 6 MB); selebihnya hanya di perangkat (IndexedDB) dan diberi tanda.
   ========================================================= */
(function () {
  'use strict';
  const L = PP.LKPD;
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])), $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const C = () => window.PPCloud, S = () => window.PPStore, GU = () => window.PPGuru;
  const sfx = n => { try { PPAudio.sfx(n); } catch (e) { } };
  const ic = (n, a, s) => PP.lkpdIcon(n, a, s);
  const toast = (m, i) => PP.ui.toast(m, i);
  const IN_VIEWER = !!window.claude;
  const now = () => Date.now();
  const rid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const arr = x => Array.isArray(x) ? x.filter(Boolean) : (x && typeof x === 'object' ? Object.values(x).filter(Boolean) : []);
  const loc = () => { const d = S().data; return d.lkpd || (d.lkpd = { cache: {} }); };
  const me = () => ({ id: PPNet.id(), n: String(S().data.name || 'Pemain').slice(0, 40), k: String(S().data.kelas || '').replace(/\s+/g, '').toUpperCase().slice(0, 12) });
  const fmt = x => (x == null || x === '' || !isFinite(x)) ? '' : String(L.r2(+x)).replace('.', ',');
  const K = { cfg: 'lkpd/cfg', diag: id => 'lkpd/diag/' + id, map: id => 'lkpd/map/' + id, grp: id => 'lkpd/grp/' + id, blob: (g, f) => `lkpd/blob/${g}/${f}`, rub: g => 'lkpd/rub/' + g, nilai: id => 'lkpd/nilai/' + id, pres: g => 'lkpd/pres/' + g, presv: (g, v) => `lkpd/presv/${g}/${v}`, req: id => 'lkpd/req/' + id };
  const kb = n => n < 1024 ? n + ' B' : n < 1048576 ? Math.round(n / 1024) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
  const bucket = () => (window.PP_FIREBASE && PP_FIREBASE.storageBucket) || '';
  const linkBase = () => location.href.split('#')[0];
  const link = gid => `${linkBase()}#lkpd-${C().room()}.${gid}`;
  const LVN = k => L.LV[k] ? L.LV[k].nama : '';
  const dtStr = t => { const d = new Date(t), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
  const when = t => t ? new Date(t).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '–';
  const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s % 60).padStart(2, '0'); };
  const validG = x => !!(x && typeof x === 'object' && L.LV[x.lv]);

  /* ---------- IndexedDB: berkas di perangkat ---------- */
  const idb = (() => {
    let p = null;
    const open = () => p || (p = new Promise((res, rej) => { try { const r = indexedDB.open('pp_lkpd', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }));
    const tx = async (m, f) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction('f', m), q = f(t.objectStore('f')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); }); };
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { }
    return { put: (k, v) => tx('readwrite', s => s.put(v, k)).then(() => true).catch(() => false), get: k => tx('readonly', s => s.get(k)).catch(() => null), del: k => tx('readwrite', s => s.delete(k)).catch(() => null) };
  })();
  const readDU = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(blob); });
  const toBlob = (cv, q) => new Promise(res => cv.toBlob(b => res(b), 'image/jpeg', q));
  async function shrink(file, maxKB) {                     // foto -> JPEG <= maxKB (sisi klien)
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('bukan gambar')); i.src = url; });
      let side = 1400, q = .82, blob = null;
      for (let k = 0; k < 8; k++) {
        const sc = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.max(1, Math.round(img.naturalWidth * sc)), h = Math.max(1, Math.round(img.naturalHeight * sc));
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h);
        blob = await toBlob(cv, q); if (blob && blob.size <= maxKB * 1024) return blob;
        side = Math.round(side * .82); q = Math.max(.5, q - .06);
      }
      return blob;
    } finally { URL.revokeObjectURL(url); }
  }
  function uploadStorage(file, name, onProg) {
    return new Promise((res, rej) => {
      const bk = bucket(); if (!bk) return rej(new Error('nobucket'));
      const x = new XMLHttpRequest();
      x.open('POST', 'https://firebasestorage.googleapis.com/v0/b/' + encodeURIComponent(bk) + '/o?uploadType=media&name=' + encodeURIComponent(name));
      x.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      x.upload.onprogress = e => { if (e.lengthComputable && onProg) onProg(Math.round(e.loaded / e.total * 100)); };
      x.onerror = () => rej(new Error('net')); x.ontimeout = () => rej(new Error('net')); x.timeout = 10 * 60 * 1000;
      x.onload = () => { if (x.status < 200 || x.status >= 300) return rej(new Error('http' + x.status)); try { const j = JSON.parse(x.responseText); res('https://firebasestorage.googleapis.com/v0/b/' + encodeURIComponent(bk) + '/o/' + encodeURIComponent(j.name) + '?alt=media' + (j.downloadTokens ? '&token=' + j.downloadTokens : '')); } catch (e) { rej(new Error('resp')); } };
      x.send(file);
    });
  }
  /* berkas dipecah jadi potongan ≤ 350 ribu karakter agar muat di Realtime Database */
  const CH = 350000, MAXCLOUD = 6 * 1048576;
  async function putChunks(gid, fid, blob) {
    const du = await readDU(blob), n = Math.ceil(du.length / CH);
    for (let i = 0; i < n; i++) { const ok = await C().put(K.blob(gid, fid) + '/' + i, { d: du.slice(i * CH, (i + 1) * CH) }); if (!ok) { await C().del(K.blob(gid, fid)); return 0; } }
    return n;
  }
  async function getChunks(gid, fid, n) {
    const out = []; for (let i = 0; i < n; i++) { const x = await C().get(K.blob(gid, fid) + '/' + i); if (!x || !x.d) return null; out.push(x.d); } return out.join('');
  }

  /* ---------- kelompok & peran ---------- */
  const members = g => Object.keys(g.mem || {}).map(id => Object.assign({ id }, g.mem[id])).filter(m => m && m.n).sort((a, b) => (a.o || 0) - (b.o || 0));
  const rolesFor = (g, fase) => {
    const m = members(g), n = m.length, R = n === 4 ? L.ROLES4 : L.ROLES5, out = [];
    m.forEach((x, i) => out.push({ m: x, r: R[(i + fase - 1) % R.length] }));
    if (n < R.length) R.forEach((r, j) => { if (!out.some(o => o.r.k === r.k)) out.push({ m: null, r }); });
    return out;
  };
  const fresh = (lvk, id, nm, mem) => ({ id, lv: lvk, nm: nm || L.nm(lvk), k: '', mem: mem || {}, v: {}, sol: {}, ck: {}, dk: {}, jd: {}, ja: {}, rf: {}, fl: {}, lg: {}, ts: now() });
  function normG(x) {
    x.mem = x.mem || {}; x.v = x.v || {}; x.sol = x.sol || {}; x.ck = x.ck || {}; x.jd = x.jd || {}; x.ja = x.ja || {}; x.rf = x.rf || {}; x.lg = x.lg || {};
    if (Array.isArray(x.dk)) { const o = {}; x.dk.forEach((t, i) => { if (t != null) o['d' + i] = t; }); x.dk = o; } else x.dk = x.dk || {};
    if (Array.isArray(x.fl) || !x.fl) { const o = {}; arr(x.fl).forEach(f => { if (f && f.id) o[f.id] = f; }); x.fl = o; }
    return x;
  }
  const files = g => arr(g.fl).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  /* kemajuan tiap fase dihitung dari isi LKPD */
  function phases(g, P) {
    const d = L.LV[g.lv], v = g.v || {}, so = g.sol || {}, ph = {}; const has = s => String(s || '').trim().length;
    ph[1] = !!g.obj && has(g.q) >= 5;
    ph[2] = new Set(Object.keys(g.jd || {}).filter(k => has(g.jd[k])).concat(Object.keys(g.ja || {}).filter(k => g.ja[k]))).size >= 2;
    ph[3] = d.variabel.filter(x => !x.opt).every(x => L.num(v[x.k]) > 0);
    const ck = L.check(g.lv, v, so, P); ph[4] = ck.ready && Object.values(ck.f).every(x => x !== false) && Object.values(ck.f).some(x => x === true) && (g.lv === 'a' ? so.c !== undefined && so.c !== '' : true) && (g.lv === 'b' ? has(so.d) && has(so.sel) : true) && (g.lv === 'c' ? has(so.a) && !!so.dec : true);
    ph[5] = has(g.cs) >= 15 && files(g).some(f => f.k === 'foto');
    ph[6] = Object.values(g.dk || {}).filter(x => has(x) >= 8).length >= 2 && Object.values(g.rf || {}).some(x => has(x) >= 5);
    return ph;
  }
  /* waktu: batas, sisa, hak edit */
  const durMin = (g, P) => +(P['d' + g.lv.toUpperCase()]) || 0;
  const deadline = (g, P) => { const m = durMin(g, P); return (m > 0 && g.t0) ? g.t0 + (m + (+g.ext || 0)) * 60000 : 0; };
  const editUntil = (g, P) => g.sub ? ((g.auto || g.fin) ? Math.max(+g.sub, +g.un || 0) : Math.max(g.sub + (+P.ew || 5) * 60000, +g.un || 0)) : Infinity;
  const canEditG = (g, P) => !g.sub || now() < editUntil(g, P);
  const statusG = (g, P) => {
    if (g.sub) return canEditG(g, P) ? ['Terkirim · masih bisa diedit', 'warn'] : [g.auto ? 'Terkunci · waktu habis' : 'Terkunci · sudah dikirim', 'ok'];
    const dl = deadline(g, P); if (dl && now() > dl) return ['Waktu habis', 'bad'];
    const ph = phases(g, P), n = Object.values(ph).filter(Boolean).length; return n || g.t0 ? ['Mengerjakan', 'run'] : ['Belum mulai', 'idle'];
  };
  const cleanP = x => { const o = Object.assign({}, L.DEF, (x && typeof x === 'object') ? x : {}); ['t', 'c', 'b', 'h0', 'tol', 'thA', 'thB', 'wKel', 'wInd', 'dA', 'dB', 'dC', 'gs', 'ew'].forEach(k => { const n = +o[k]; o[k] = isFinite(n) ? n : L.DEF[k]; }); ['kA', 'kB', 'kC', 'au'].forEach(k => { o[k] = +o[k] === 0 ? 0 : 1; }); return o; };

  const presMin = (P, k) => { const n = +P['p' + String(k).toUpperCase()]; return n > 0 ? n : ({ a: 3, b: 5, c: 7 })[k]; };
  PP.screens = PP.screens || {};
  PP.screens.lkpd = function (arg) {
    let rootEl = null, P = cleanP(), view = 'home', step = 1, lvk = null, ro = false, teacher = false;
    let g = null, myG = null, diag = null, rub = null, req = null, nilai = null, dirty = new Set(), saveT = 0, saveOk = true, camStop = null, presEl = null, tick = 0, alive = true, busy = false;
    let gid = null, diagI = 0, diagAns = {}, dtab = 0, hintMsg = {}, urls = [], secret = 0, secretT = 0, sig = '';
    const cleanups = [];
    const my = me();
    L.applyCfg(P);

    /* ======================= penyimpanan ======================= */
    const effLevel = () => (diag && (diag.ov || diag.l)) || null;
    async function loadBase() {
      const cfg = await C().get(K.cfg); if (cfg && typeof cfg === 'object') { P = cleanP(cfg); } L.applyCfg(P); ['a', 'b', 'c'].forEach(k => { L.PRES_MENIT[k] = presMin(P, k); });
      let d = await C().get(K.diag(my.id)); if (d === undefined) d = loc().dg || null; diag = d && typeof d === 'object' ? d : null; loc().dg = diag;
      let m = await C().get(K.map(my.id)); if (m === undefined) m = loc().gid || null; let gid = typeof m === 'string' ? m : null; loc().gid = gid;
      let x = null;
      if (gid) {
        const r = await C().get(K.grp(gid)), l = loc().cache[gid]; x = validG(r) ? r : null;
        if (validG(l) && (!x || (l.ts || 0) > (x.ts || 0))) { x = l; if (C().online() && r !== undefined && !busy) { try { await C().put(K.grp(gid), l); } catch (e) { } } }   // salinan lokal lebih baru: dorong ke server
        if (x && !x.mem[my.id] && !(l && l.mem && l.mem[my.id])) { x = null; }                                  // sudah dikeluarkan guru dari kelompok
        if (!x && r === null) { gid = null; loc().gid = null; }                                                  // kelompok dihapus guru
      }
      myG = x ? normG(Object.assign({ id: gid }, x)) : null; if (myG) { myG.id = gid; loc().cache[gid] = myG; }
      if (view !== 'lkpd' && view !== 'hist' || !g || g === myG || (g && g.preview)) { if (!(g && (g.preview || teacher))) g = myG; }
      else if (g && myG && g.id === myG.id) g = myG;
      const nl = await C().get(K.nilai(my.id)); nilai = nl && typeof nl === 'object' ? nl : null; loc().nl = nilai;
      rub = null; if (myG) { const r = await C().get(K.rub(myG.id)); rub = r && typeof r === 'object' ? r : null; }
      const rq = await C().get(K.req(my.id)); req = rq && typeof rq === 'object' ? rq : null;
      S().save();
      applyAlat();
    }
    function touch(path) {
      if (ro || !g || g.preview) return; dirty.add(path); g.ts = now(); loc().cache[g.id] = g; setStatus('menyimpan…'); clearTimeout(saveT); saveT = setTimeout(flush, 700);
    }
    const getAt = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
    async function flush() {
      if (!g || g.preview || !dirty.size || busy) return; const gg = g, keys = [...dirty]; dirty.clear();
      loc().cache[gg.id] = gg; try { S().save(); } catch (e) { }
      let ok = true;
      for (const k of keys) { const v = getAt(gg, k); if (!(await C().put(K.grp(gg.id) + '/' + k.replace(/\./g, '/'), v === undefined ? null : v))) { ok = false; dirty.add(k); } }
      await C().put(K.grp(gg.id) + '/ts', gg.ts); saveOk = ok; setStatus();
    }
    const retryT = setInterval(() => { if (dirty.size) flush(); }, 8000); cleanups.push(() => clearInterval(retryT));
    const onHide = () => { if (dirty.size) { try { loc().cache[g.id] = g; S().save(); } catch (e) { } flush(); } };
    addEventListener('pagehide', onHide); document.addEventListener('visibilitychange', onHide); cleanups.push(() => { removeEventListener('pagehide', onHide); document.removeEventListener('visibilitychange', onHide); });
    function setStatus(t) {
      const el = $('#lkSt'); if (!el) return;
      el.textContent = t || (dirty.size ? 'menyimpan…' : (C().online() ? '✓ tersimpan online' : '✓ tersimpan di perangkat')); el.className = 'lkpd-st' + (dirty.size || !saveOk ? ' warn' : '');
    }
    function setPath(path, val) {
      if (ro || !g) return; const p = path.split('.'); let o = g; for (let i = 0; i < p.length - 1; i++) { o[p[i]] = o[p[i]] && typeof o[p[i]] === 'object' ? o[p[i]] : {}; o = o[p[i]]; } o[p[p.length - 1]] = val; touch(path);
    }
    const getPath = path => path.split('.').reduce((o, k) => (o == null ? o : o[k]), g);
    /* catatan aktivitas siswa: apa yang dibuka / dipilih / ditulis / diunggah */
    function logEv(e) { if (ro || !g || g.preview) return; const k = now() + '_' + rid().slice(0, 3); g.lg = g.lg || {}; g.lg[k] = { t: now(), e: String(e).slice(0, 120), u: my.n.split(' ')[0] }; touch('lg.' + k); }
    /* jadwal otomatis: tercatat saat kegiatan benar-benar dilakukan */
    function stamp(key) { if (ro || !g || g.preview) return; g.ja = g.ja || {}; if (!g.ja[key]) { g.ja[key] = now(); touch('ja.' + key); } }

    /* ======================= alat bantu (kalkulator per level) ======================= */
    function applyAlat() {
      try {
        const lv = (view === 'lkpd' || view === 'hist') && g && g.lv && !teacher ? g.lv : (myG ? myG.lv : null);
        const off = !!(lv && !teacher && !GU().isGuru() && (view === 'lkpd' || view === 'hist') && +P['k' + lv.toUpperCase()] === 0);
        window.JBAlat && JBAlat.setKalk && JBAlat.setKalk(!off);
      } catch (e) { }
    }

    /* ======================= kerangka ======================= */
    function draw() {
      if (presEl || !rootEl || !alive) return;
      cleanupStep();
      let b; try { b = view === 'home' ? vHome() : view === 'diag' ? vDiag() : view === 'lkpd' ? vLkpd() : view === 'hist' ? vHist() : view === 'pres' ? vPres() : view === 'pedit' ? vPedit() : view === 'guru' ? vGuru() : vHome(); }
      catch (e) { console.error('[lkpd]', e); b = { html: `<p class="small">Tampilan ini gagal dimuat. Tekan ◀ untuk kembali.</p><button class="btn" id="lkBack">◀ Kembali</button>`, bind() { $('#lkBack').onclick = () => { view = 'home'; g = myG; teacher = ro = false; draw(); }; } }; }
      rootEl.className = 'panel fill pad lkpd-root ' + (b.cls || ''); rootEl.innerHTML = b.html; b.bind && b.bind(); setStatus(); applyAlat();
      const m = rootEl.querySelector('.lkpd-body'); if (m && !b.keepScroll) m.scrollTop = 0;
    }
    let stepClean = [];
    const cleanupStep = () => { stepClean.forEach(f => { try { f(); } catch (e) { } }); stepClean = []; };
    const topBar = (title, sub, icon, extra) => `<div class="lkpd-top"><button class="btn sm lkpd-back" id="lkBack" aria-label="Kembali">◀</button>${ic(icon, 'lkpd-float', 40)}<div class="lkpd-tt"><b>${E(title)}</b><small>${E(sub || '')}</small></div>${extra || ''}</div>`;
    const shell = x => x;
    const body$ = () => $('.lkpd-body');
    function redraw() { const b = body$(), y = b ? b.scrollTop : 0; draw(); const n = body$(); if (n) n.scrollTop = y; }
    function toHome() { g = myG; teacher = false; ro = false; view = 'home'; draw(); }


    /* ======================= BERANDA ======================= */
    const lockedLv = k => !!(myG && !teacher && myG.lv !== k);               // siswa berkelompok tidak boleh membuka level lain
    function vHome() {
      const el = effLevel(), isG = GU().isGuru();
      const card = k => {
        const d = L.LV[k], mine = !!myG && myG.lv === k, lock = lockedLv(k);
        const st = lock ? '🔒 Bukan kelompokmu' : mine ? 'Kelompokmu' : (el === k ? 'Levelmu · lihat naskah' : 'Lihat naskah');
        return `<button class="lkpd-card lkpd-pop ${mine ? 'mine' : ''} ${lock ? 'lock' : ''}" data-lv="${k}" ${lock ? 'aria-disabled="true"' : ''} style="animation-delay:${'abc'.indexOf(k) * .08}s">${ic(d.ikon, 'lkpd-float', 54)}<b>${d.abjad} · ${d.nama}</b><small>${E(d.sebut)} · ${d.bloom}</small><span class="lkpd-top2">${E(d.topik)}</span><em>${st}</em></button>`;
      };
      let status;
      if (!diag) status = 'Langkah 1: kerjakan <b>Tes Diagnostik</b> agar levelmu ditentukan. Hasilnya dipakai untuk menentukan kelompok.';
      else if (!myG) status = `Levelmu <b>${E(LVN(el))}</b> (skor ${diag.s}/10). Kamu belum masuk kelompok. Tekan <b>Cek kelompok</b>; bila belum ada, guru akan membentuknya.`;
      else {
        const ph = phases(myG, P), done = Object.values(ph).filter(Boolean).length, st = statusG(myG, P), dl = deadline(myG, P);
        status = `<b>${E(myG.nm)}</b> · ${members(myG).length} anggota · kemajuan <b>${done}/6</b> · <span class="lkpd-pill ${st[1]}">${st[0]}</span>${dl && !myG.sub ? ` · sisa waktu <b id="lkTmH">${mmss(dl - now())}</b>` : ''}${nilai && nilai.s != null ? ` · nilai <b>${nilai.s}</b>` : ''}`;
      }
      const reqOn = req && req.st === 'baru';
      const locked = myG && !canEditG(myG, P);
      const html = `<div class="lkpd-top"><button class="btn sm lkpd-back" id="lkBack" aria-label="Kembali">◀</button><span id="lkSec" class="lkpd-secret">${ic('foto_coret', 'lkpd-float', 40)}</span><div class="lkpd-tt"><b>LKPD Proyek</b><small>${E(L.TEMA)}</small></div>
        <button class="btn sm" id="lkQr">${ic('foto_coret', '', 20)} QR</button>${isG ? '<button class="btn sm gold lkpd-pulse" id="lkGuru">⚙ Panel Guru</button>' : ''}</div>
        <div class="lkpd-body"><div class="lkpd-cards">${['a', 'b', 'c'].map(card).join('')}</div>
        <div class="lkpd-acts">
          <button class="btn ${diag ? '' : 'green lkpd-pulse'}" id="lkDiag">${ic('centang', '', 22)} ${diag ? 'Hasil Tes Diagnostik' : 'Mulai Tes Diagnostik'}</button>
          ${diag && !myG ? `<button class="btn gold" id="lkChk">↻ Cek kelompok</button>` : ''}
          <button class="btn blue" id="lkOpen" ${myG ? '' : 'disabled'}>${ic(el || 'a', '', 22)} ${myG ? (locked ? 'Riwayat pengerjaan' : 'Buka LKPD-ku') : 'Buka LKPD-ku'}</button>
          ${myG && !locked ? '<button class="btn" id="lkHist">Riwayat</button>' : ''}
          <button class="btn gold" id="lkPres" ${myG ? '' : 'disabled'}>${ic('r_jubir', '', 22)} Presentasi</button>
        </div>
        <div class="lkpd-note" id="lkNote">${status}</div>
        ${reqOn ? '<div class="lkpd-note warn">Permintaan ubah hasil tes sudah dikirim ke guru. Tunggu guru memprosesnya.</div>' : ''}
        ${req && req.st === 'selesai' && req.re ? `<div class="lkpd-note">Jawaban guru: ${E(req.re)}</div>` : ''}
        ${nilai && nilai.fb ? `<div class="lkpd-fb"><b>Umpan balik guru:</b> ${E(nilai.fb)}</div>` : ''}
        <div class="lkpd-warn">${ic('aman', '', 22)}<span>${E(L.KEAMANAN)}</span></div></div>`;
      return {
        html, bind() {
          $('#lkBack').onclick = () => PP.go('menu'); $('#lkQr').onclick = qrModal;
          const gb = $('#lkGuru'); if (gb) gb.onclick = () => GU().require(() => { view = 'guru'; draw(); });
          $('#lkSec').onclick = () => { secret++; clearTimeout(secretT); secretT = setTimeout(() => { secret = 0; }, 3000); if (secret >= 5) { secret = 0; GU().require(() => { view = 'guru'; draw(); }); } };
          $$('[data-lv]').forEach(b => b.onclick = () => cardOpen(b.dataset.lv));
          $('#lkDiag').onclick = () => { if (diag) return diagResult(); startDiag(); };
          const ck = $('#lkChk'); if (ck) ck.onclick = async () => { toast('Memeriksa kelompok…'); await loadBase(); if (diag && !myG && P.au) await autoPlace(); await loadBase(); draw(); if (!myG) toast('Belum ada kelompok untukmu. Guru akan membentuknya.'); };
          $('#lkOpen').onclick = () => { if (myG) openMine(); };
          const h = $('#lkHist'); if (h) h.onclick = () => { g = myG; view = 'hist'; draw(); };
          $('#lkPres').onclick = () => { if (myG) presHome(myG); };
        }
      };
    }
    function cardOpen(k) {
      if (lockedLv(k)) return toast('Kamu sudah punya kelompok ' + LVN(myG.lv) + '. LKPD level lain tidak bisa dibuka.', 'x');
      if (myG && myG.lv === k) return openMine();
      if (!myG && effLevel() === k && diag) toast('Kamu belum masuk kelompok; ini hanya naskah (baca saja).');
      openLkpd(k, true);
    }
    function openMine() {
      g = myG; teacher = false;
      if (!canEditG(g, P)) { view = 'hist'; draw(); return; }
      ro = false; lvk = g.lv; step = 1; view = 'lkpd';
      if (!g.t0) { g.t0 = now(); touch('t0'); }
      logEv('membuka LKPD'); draw();
    }
    function openLkpd(k, readonly, grp, isT) {
      lvk = k; ro = !!readonly; teacher = !!isT;
      if (grp) { g = normG(grp); } else if (readonly) { g = fresh(k, 'preview', 'Naskah ' + L.LV[k].abjad); g.preview = true; }
      step = 1; view = 'lkpd'; draw();
    }

    /* ======================= KELOMPOK (siswa) ======================= */
    async function readGroups() { const all = await C().get('lkpd/grp'); return Object.keys(all && typeof all === 'object' ? all : {}).map(id => normG(Object.assign({ id }, all[id]))).filter(validG); }
    const gsz = () => Math.max(2, Math.min(8, +P.gs || 5));
    /* tempatkan siswa ke kelompok sesuai level; bila penuh, pindah ke kelompok lain atau buat kelompok baru */
    async function placeStudent(sid, nm, kls, lv) {
      for (let t = 0; t < 3; t++) {
        const list = (await readGroups()).filter(x => x.lv === lv).sort((a, b) => (a.ts0 || a.ts || 0) - (b.ts0 || b.ts || 0));
        let tgt = list.find(x => x.mem[sid]) || list.find(x => !x.sub && Object.keys(x.mem).length < gsz());
        if (!tgt) { const id = 'g' + rid(); tgt = fresh(lv, id, L.nm(lv, list.length + 1), {}); tgt.k = kls || ''; tgt.ts0 = now(); await C().put(K.grp(id), tgt); }
        if (!tgt.mem[sid]) await C().put(K.grp(tgt.id) + '/mem/' + sid, { n: nm, o: Object.keys(tgt.mem).length });
        const chk = await C().get(K.grp(tgt.id) + '/mem');
        if (chk && chk[sid] && Object.keys(chk).length <= gsz()) { await C().put(K.map(sid), tgt.id); return tgt.id; }
        if (chk && chk[sid]) { await C().del(K.grp(tgt.id) + '/mem/' + sid); }                // kalah balapan: coba kelompok lain
      }
      return null;
    }
    let placing = false;
    async function autoPlace() {
      if (placing || !diag || myG) return; placing = true;
      try { const lv = effLevel(); if (lv && L.LV[lv]) { const id = await placeStudent(my.id, my.n, my.k, lv); if (id) { loc().gid = id; } } } catch (e) { } finally { placing = false; }
    }
    function noGroupModal() {
      PP.ui.modal(`<h3>Kelompokmu belum ada</h3><p class="modal-text small">Guru atau sistem menempatkanmu sesuai hasil tes. Kamu juga bisa bergabung dengan kode kelompok dari guru (harus level yang sama).</p>
        <label class="fld small">Kode kelompok<input class="ab-inp" id="lgCode" maxlength="40" placeholder="Kode dari guru / QR"></label>
        <div class="row end"><button class="btn" data-close>Tutup</button><button class="btn blue" id="lgJoin">Gabung</button></div>`);
      $('#lgJoin').onclick = async () => { const c = $('#lgCode').value.trim(); if (!c) return; PP.ui.close(); await joinGroup(c.replace(/^.*\./, '')); };
    }
    async function joinGroup(id) {
      const x = await C().get(K.grp(id)); if (!validG(x)) return toast('Kode kelompok tidak ditemukan di ruangan ini.', 'x');
      const n = normG(Object.assign({ id }, x)); if (effLevel() && n.lv !== effLevel()) return toast('Kelompok itu untuk level ' + LVN(n.lv) + '. Levelmu ' + LVN(effLevel()) + '.', 'x');
      const o = Object.keys(n.mem).length; if (!n.mem[my.id]) { if (o >= gsz()) return toast('Kelompok sudah penuh (' + gsz() + ' orang).', 'x'); await C().put(K.grp(id) + '/mem/' + my.id, { n: my.n, o }); }
      await C().put(K.map(my.id), id); await loadBase(); toast('Bergabung ke ' + n.nm + '.'); draw();
    }

    /* ======================= DIAGNOSTIK ======================= */
    const normAns = a => { const o = {}; L.DIAG.forEach(q => { const src = (a && (a['q' + q.id] || a[q.id])) || []; const s = Array.isArray(src) ? src : Object.values(src); o['q' + q.id] = q.p.map((p, i) => String(s[i] == null ? '' : s[i])); }); return o; };
    const ansOf = (a, q) => (a && a['q' + q.id]) || [];
    function scoreAns(a) { const x = {}; const n = normAns(a); L.DIAG.forEach(q => { x[q.id] = n['q' + q.id]; }); return L.diagSkor(x); }
    function startDiag() {
      if (diag) return diagResult();
      const dr = loc().dgDraft; diagAns = dr && dr.a ? dr.a : {}; diagI = Math.min(dr && dr.i || 0, L.DIAG.length - 1); view = 'diag'; draw();
    }
    const saveDraft = () => { loc().dgDraft = { a: diagAns, i: diagI }; try { S().save(); } catch (e) { } };
    function vDiag() {
      const q = L.DIAG[diagI], a = ansOf(diagAns, q), last = diagI === L.DIAG.length - 1;
      const part = (p, i) => p.k === 'n'
        ? `<label class="lkpd-q"><span>${E(p.l)}</span><input class="ab-inp" inputmode="decimal" data-i="${i}" value="${E(a[i] || '')}" autocomplete="off"></label>`
        : `<div class="lkpd-q"><span>${E(p.l)}</span><div class="lkpd-opts">${p.o.map(o => `<button type="button" class="chip ${a[i] === o ? 'on' : ''}" data-i="${i}" data-o="${E(o)}">${E(o)}</button>`).join('')}</div></div>`;
      const html = `${topBar('Tes Diagnostik', `Soal ${diagI + 1} dari ${L.DIAG.length} · ${q.c}`, 'centang')}
        <div class="lkpd-dots">${L.DIAG.map((x, i) => `<i class="${i === diagI ? 'on' : (ansOf(diagAns, x).some(Boolean) ? 'done' : '')}"></i>`).join('')}</div>
        <div class="lkpd-body lkpd-diag"><p class="lkpd-qt">${E(q.t)}</p>${q.svg ? `<div class="lkpd-svg">${q.svg}</div>` : ''}${q.p.map(part).join('')}<p class="small muted">Gunakan kalkulator Alat Bantu bila perlu. Tulis desimal dengan koma atau titik. Jawabanmu tersimpan otomatis.</p></div>
        <div class="lkpd-foot"><button class="btn" id="dPrev" ${diagI ? '' : 'disabled'}>◀ Sebelumnya</button><span class="lkpd-st" id="lkSt"></span><button class="btn green" id="dNext">${last ? 'Selesai ✓' : 'Lanjut ▶'}</button></div>`;
      return {
        html, bind() {
          $('#lkBack').onclick = () => { saveDraft(); view = 'home'; draw(); };
          $$('input[data-i]').forEach(inp => inp.oninput = () => { const k = 'q' + q.id; diagAns[k] = normAns(diagAns)[k]; diagAns[k][+inp.dataset.i] = inp.value; saveDraft(); });
          $$('button[data-o]').forEach(b => b.onclick = () => { const k = 'q' + q.id; diagAns[k] = normAns(diagAns)[k]; diagAns[k][+b.dataset.i] = b.dataset.o; saveDraft(); sfx('click'); redraw(); });
          $('#dPrev').onclick = () => { diagI--; saveDraft(); draw(); };
          $('#dNext').onclick = () => { if (!last) { diagI++; saveDraft(); draw(); } else confirmDiag(); };
        }
      };
    }
    function confirmDiag() {
      const n = normAns(diagAns), kosong = L.DIAG.reduce((s, q) => s + n['q' + q.id].filter(x => !String(x).trim()).length, 0);
      PP.ui.modal(`<h3>Apakah kamu yakin dengan hasil tes diagnostik ini?</h3><p class="modal-text small">Setelah dikirim, hasil <b>tidak bisa diubah sendiri</b>. Hasil ini menentukan level dan kelompok LKPD-mu. Bila nanti ada kesalahan, kamu bisa meminta guru mengubahnya.</p>${kosong ? `<p class="small badc">Masih ada ${kosong} bagian yang kosong.</p>` : ''}
        <div class="row end"><button class="btn" data-close>Periksa lagi</button><button class="btn green" id="dYes">Ya, kirim</button></div>`);
      $('#dYes').onclick = () => { PP.ui.close(); finishDiag(); };
    }
    async function finishDiag() {
      const ans = normAns(diagAns), r = scoreAns(ans), l = L.levelDari(r.tot, P);
      diag = { n: my.n, k: my.k, s: r.tot, l, per: r.per, ans, ts: now() }; loc().dg = diag; loc().dgDraft = null; S().save();
      const ok = await C().put(K.diag(my.id), diag); if (!ok) toast('Hasil tersimpan di perangkat; belum terkirim ke server.');
      sfx('mission'); try { PP.ui.confetti && PP.ui.confetti(); } catch (e) { }
      if (P.au) await autoPlace(); await loadBase(); view = 'home'; draw(); diagResult(true);
    }
    function diagResult(first) {
      const d = diag, k = effLevel(), lv = L.LV[k]; if (!lv) return;
      const reqOn = req && req.st === 'baru';
      PP.ui.modal(`<div class="lkpd-res">${ic(lv.ikon, 'lkpd-pop', 72)}<h3>Levelmu: ${lv.abjad} · ${lv.nama}</h3><p>Skor tes: <b>${d.s}</b> dari 10${d.ov ? ' (diatur guru)' : ''}.</p>
        <p class="small">${myG ? 'Kelompokmu: <b>' + E(myG.nm) + '</b>. ' : first ? 'Kamu akan ditempatkan ke kelompok sesuai level. ' : ''}Skor per soal: ${(d.per || []).map((s, i) => `S${i + 1}=${s}`).join(' · ')}</p>
        <div class="row end">${reqOn ? '<span class="small">Permintaan ke guru sedang diproses.</span>' : '<button class="btn sm" id="dReq">Hasil ini salah? Beritahu guru</button>'}<button class="btn green" data-close>Oke</button></div></div>`);
      const b = $('#dReq'); if (b) b.onclick = reqModal;
    }
    function reqModal() {
      PP.ui.modal(`<h3>Minta guru mengubah hasil tes</h3><p class="modal-text small">Tulis alasanmu (misalnya salah pencet atau salah ketik). Hanya guru yang dapat mengubah atau mereset hasil tes.</p><textarea class="ab-inp" id="rqM" rows="3" maxlength="300" placeholder="Alasan…"></textarea><div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="rqS">Kirim ke guru</button></div>`);
      $('#rqS').onclick = async () => { const m = $('#rqM').value.trim(); if (m.length < 3) return toast('Tulis alasan singkat.', 'x'); const o = { n: my.n, k: my.k, m, st: 'baru', ts: now(), s: diag ? diag.s : null }; const ok = await C().put(K.req(my.id), o); req = o; PP.ui.close(); toast(ok ? 'Permintaan terkirim ke guru.' : 'Gagal terkirim. Coba lagi.', ok ? '' : 'x'); draw(); };
    }

    /* ======================= LKPD (6 langkah) ======================= */
    const timerChip = () => { const dl = deadline(g, P); if (g.sub || !dl || ro) return ''; return `<span class="lkpd-chip lkpd-tm2" id="lkTm" title="Batas waktu pengerjaan">⏱ ${mmss(dl - now())}</span>`; };
    function vLkpd() {
      const d = L.LV[g.lv || lvk], ph = phases(g, P), F = L.FASE[step - 1];
      const roles = rolesFor(g, step), mine = roles.find(r => r.m && r.m.id === my.id);
      const phRow = `<div class="lkpd-phs" role="tablist">${L.FASE.map(f => `<button class="lkpd-ph ${f.n === step ? 'on' : ''} ${ph[f.n] ? 'done' : ''}" data-st="${f.n}" role="tab" aria-selected="${f.n === step}" title="${E(f.t)}">${ic(f.i, f.n === step ? 'lkpd-pulse' : '', 30)}<small>${f.n}</small>${ph[f.n] ? '<u>✓</u>' : ''}</button>`).join('')}</div>`;
      const who = ro ? `<span class="lkpd-chip">${teacher ? 'Mode guru' : 'Baca saja'}</span>` : `<span class="lkpd-chip" title="${E(mine ? mine.r.d : '')}">${mine ? ic(mine.r.i, '', 20) + ' ' + E(mine.r.n) : E(g.nm)}</span>`;
      const body = [null, s1, s2, s3, s4, s5, s6][step](d);
      const win = g.sub && !ro && canEditG(g, P) ? `<div class="lkpd-note warn" id="lkWin">LKPD sudah terkirim. Kamu masih bisa mengedit selama <b id="lkWinT">${mmss(editUntil(g, P) - now())}</b>, setelah itu terkunci otomatis.</div>` : '';
      const html = `${topBar(d.abjad + ' · ' + d.judul, `${F.b} · Fase ${F.n}: ${F.t}`, d.ikon, timerChip() + who + `<button class="btn sm" id="lkFc" title="Panduan Foto & Coret">${ic('foto_coret', '', 22)}<span class="lkpd-hide-s"> Foto&Coret</span></button><button class="btn sm lkpd-safe" id="lkSafe" title="Keselamatan & privasi">${ic('aman', 'lkpd-wiggle', 22)}</button>`)}${phRow}${win}
        <div class="lkpd-body">${body.html}</div>
        <div class="lkpd-foot"><button class="btn" id="sPrev" ${step > 1 ? '' : 'disabled'}>◀</button><span class="lkpd-st" id="lkSt"></span>${step < 6 ? '<button class="btn green" id="sNext">Lanjut ▶</button>' : (ro ? (g.preview ? '' : '<button class="btn gold" id="sPres">Presentasi</button>') : `<button class="btn ${g.sub ? 'blue' : 'green lkpd-pulse'}" id="sSend">${g.sub ? 'Selesai & kunci sekarang' : 'Kirim ke Guru'}</button>`)}</div>`;
      return {
        cls: 'lkpd-lk', html, bind() {
          $('#lkBack').onclick = async () => { await flush(); if (teacher) { view = 'guru'; teacher = false; ro = false; g = myG; } else { view = 'home'; g = myG; } draw(); };
          $('#lkSafe').onclick = safeModal; $('#lkFc').onclick = fotoCoret;
          $$('[data-st]').forEach(b => b.onclick = () => { step = +b.dataset.st; draw(); });
          $('#sPrev').onclick = () => { if (step > 1) { step--; draw(); } };
          const n = $('#sNext'); if (n) n.onclick = () => { sfx('click'); step++; draw(); };
          const s = $('#sSend'); if (s) s.onclick = sendG; const pr = $('#sPres'); if (pr) pr.onclick = () => presHome(g);
          bindFields(); body.bind && body.bind();
        }
      };
    }
    function safeModal() { PP.ui.modal(`<h3>${ic('aman', 'lkpd-wiggle', 32)} Keselamatan & Privasi</h3><p class="modal-text">${E(L.KEAMANAN)}</p><p class="modal-text">${E(L.PRIVASI)}</p><p class="small muted">Angka acuan di LKPD: ${L.VERIF}.</p><div class="row end"><button class="btn green" data-close>Saya paham</button></div>`); }
    function fld(path, o) {
      o = o || {}; const val = getPath(path); const v = E(val == null ? '' : val), dis = ro ? 'disabled' : '';
      if (o.rows) return `<textarea class="ab-inp lkpd-in" data-f="${path}" rows="${o.rows}" maxlength="${o.max || 600}" placeholder="${E(o.ph || '')}" aria-label="${E(o.lab || o.ph || '')}" ${dis}>${v}</textarea>`;
      return `<input class="ab-inp lkpd-in" data-f="${path}" ${o.num ? 'inputmode="decimal"' : ''} ${o.dt ? 'type="datetime-local"' : ''} maxlength="${o.max || 80}" placeholder="${E(o.ph || '')}" aria-label="${E(o.lab || o.ph || '')}" value="${v}" ${dis} autocomplete="off">`;
    }
    function bindFields() {
      $$('[data-f]').forEach(el => {
        const ev = () => { const p = el.dataset.f, val = el.value; setPath(p, val); if (/^v\./.test(p) && String(val).trim()) stamp('ukur'); if (/^sol\./.test(p) && String(val).trim()) stamp('hitung'); updPh(); };
        if (el.tagName === 'SELECT' || el.type === 'datetime-local') el.onchange = ev; else el.oninput = ev;
      });
      $$('[data-pick]').forEach(b => b.onclick = () => { if (ro) return; setPath(b.dataset.pick, b.dataset.val); logEv('memilih ' + b.dataset.pick + ' = ' + b.dataset.val); sfx('click'); redraw(); });
    }
    function updPh() { const ph = phases(g, P); $$('.lkpd-ph').forEach(b => { const n = +b.dataset.st; b.classList.toggle('done', !!ph[n]); const u = b.querySelector('u'); if (ph[n] && !u) b.insertAdjacentHTML('beforeend', '<u>✓</u>'); if (!ph[n] && u) u.remove(); }); }
    const chips = (path, opsi) => `<div class="lkpd-opts">${opsi.map(o => `<button type="button" class="chip ${getPath(path) === o ? 'on' : ''}" data-pick="${path}" data-val="${E(o)}" ${ro ? 'disabled' : ''}>${E(o)}</button>`).join('')}</div>`;

    function s1(d) {
      return {
        html: `<div class="lkpd-cols"><div class="lkpd-box lkpd-story"><h4>Cerita Masalah</h4><p>${E(d.cerita)}</p><p class="lkpd-qm">❓ ${E(d.tanya)}</p></div>
          <div class="lkpd-box"><h4>${E(d.pilih.label)}</h4>${chips('obj', d.pilih.opsi)}
          ${d.pilihCara ? `<h4>${E(d.pilihCara.label)}</h4>${chips('cara', d.pilihCara.opsi)}${fld('alasan', { ph: 'Alasan memilih cara itu…', rows: 2 })}` : ''}
          <h4>Pertanyaan kelompok dengan kata-katamu</h4>${fld('q', { rows: 2, ph: 'Yang ingin kami cari tahu adalah…' })}</div></div>`
      };
    }
    function s2(d) {
      const roles = rolesFor(g, step), jdv = k => (g.jd && g.jd[k]) || (g.ja && g.ja[k] ? dtStr(g.ja[k]) : '');
      const J = [['ukur', 'Mengukur', 'terisi otomatis saat angka ukur pertama ditulis'], ['foto', 'Memotret', 'terisi otomatis saat foto diunggah'], ['hitung', 'Menghitung', 'terisi otomatis saat langkah hitung diisi'], ['tampil', 'Presentasi', 'terisi otomatis saat presentasi dibuka']];
      return {
        html: `<div class="lkpd-cols"><div class="lkpd-box"><h4>Peran fase ini <small>(dirotasi tiap fase)</small></h4><div class="lkpd-roles">${roles.map(r => `<span class="lkpd-role" title="${E(r.r.d)}">${ic(r.r.i, '', 22)}<b>${E(r.r.n)}</b>${r.m ? E(r.m.n.split(' ')[0]) : '<em>—</em>'}</span>`).join('')}</div>
          <h4>Alat bantu visual</h4><p class="small">${E(d.visual)}</p><button class="btn sm" id="bLangkah">Lihat 6 langkah kerja</button></div>
          <div class="lkpd-box"><h4>Alat dan bahan</h4><p class="small">${d.alat.map(E).join(' · ')}</p><h4>Jadwal kelompok <small>(otomatis, boleh diubah)</small></h4>
          <div class="lkpd-jd">${J.map(x => `<label>${x[1]}<input class="ab-inp lkpd-in" type="datetime-local" data-f="jd.${x[0]}" value="${E(jdv(x[0]))}" ${ro ? 'disabled' : ''} title="${x[2]}">${g.ja && g.ja[x[0]] ? '<small class="okc">tercatat otomatis ' + when(g.ja[x[0]]) + '</small>' : ''}</label>`).join('')}</div></div></div>`,
        bind() { $('#bLangkah').onclick = () => PP.ui.modal(`<h3>Langkah Kerja</h3><ol class="lkpd-ol">${d.langkah.map(s => `<li>${E(s)}</li>`).join('')}</ol><div class="row end"><button class="btn green" data-close>Tutup</button></div>`, { cls: 'lkpd-modal' }); }
      };
    }
    function s3(d) {
      const tetap = d.tetap.map(x => `<tr><td>${E(x.n)}</td><td class="lkpd-fix">${fmt(P[x.k])}</td><td>${x.u}</td><td class="small">${E(x.ket)} <span class="lkpd-tag">${L.VERIF}</span></td></tr>`).join('');
      const vari = d.variabel.map(x => `<tr><td>${E(x.n)}${x.opt ? ' <small>(opsional)</small>' : ''}</td><td>${fld('v.' + x.k, { num: 1, max: 10, ph: '0,0', lab: x.n })}</td><td>${x.u}</td><td class="small">${E(x.ket)}</td></tr>`).join('');
      return { html: `<div class="lkpd-box"><table class="lkpd-tbl"><thead><tr><th>Besaran</th><th>Nilai</th><th>Satuan</th><th>Keterangan</th></tr></thead><tbody>${tetap}${vari}</tbody></table>
        <p class="small lkpd-warn2">${ic('aman', '', 18)} Jangan memanjat. Ukur dua kali dan ambil yang konsisten. Angka bawaan guru: ${L.VERIF}.</p></div>` };
    }
    function s4(d) {
      const ck = L.check(g.lv, g.v, g.sol, P), f = ck.f, sol = g.sol || {};
      const mk = k => f[k] === true ? 'ok' : f[k] === false && (g.chk) ? 'bad' : '';
      const tool = `<div class="lkpd-tools"><button class="btn sm" id="dCor">✎ Coretan</button><button class="btn sm green" id="dChk" ${ro ? 'disabled' : ''}>Periksa</button>${g.lv === 'a' ? `<button class="btn sm gold" id="dHelp" ${ro ? 'disabled' : ''}>Kartu bantuan (${g.hb || 0}/3)</button>` : ''}</div>`;
      const msg = `<div class="lkpd-msg" id="dMsg" aria-live="polite">${hintMsg.t ? hintMsg.t : ''}</div>`;
      let html = '';
      if (!ck.ready) html = `<div class="lkpd-box"><p>Isi dulu <b>Tabel Hasil Pengukuran</b> (langkah 3), lalu kembali ke sini.</p></div>`;
      else if (g.lv === 'a') {
        const stp = (k, lab) => `<label class="lkpd-stp ${mk(k)}"><span>${lab}</span>${fld(k === 'c' ? 'sol.c' : 'sol.st.' + k, { num: 1, max: 12, lab: lab })}<i>${mk(k) === 'ok' ? '✓' : mk(k) === 'bad' ? '✗' : ''}</i></label>`;
        html = `<div class="lkpd-box"><p class="lkpd-frm">Rumus: <b>c = √(t² + j²)</b> &nbsp; t = ${fmt(P.t)} m, j = ${E(g.v.j || '…')} m</p>
          ${stp('t2', 't² =')}${stp('j2', 'j² =')}${stp('s', 't² + j² =')}${stp('c', 'c = √(jumlah) = (m)')}${tool}${msg}${(g.hb || 0) ? `<div class="lkpd-help">${L.LV.a.bantuan.slice(0, g.hb).map(E).join('<br>')}</div>` : ''}</div>`;
      } else if (g.lv === 'b') {
        html = `<div class="lkpd-box"><h4>Tulis langkah hitungmu sendiri (tanpa templat)</h4>${fld('sol.lg', { rows: 3, ph: 'Rumus → substitusi p dan l → p² + l² → akar…', max: 800 })}
          <div class="lkpd-two"><label class="lkpd-stp ${mk('d')}"><span>d =</span>${fld('sol.d', { num: 1, max: 12, lab: 'd' })}<i>${mk('d') === 'ok' ? '✓' : mk('d') === 'bad' ? '✗' : ''}</i></label><label class="lkpd-stp ${mk('sel')}"><span>p + l − d =</span>${fld('sol.sel', { num: 1, max: 12, lab: 'selisih' })}<i>${mk('sel') === 'ok' ? '✓' : mk('sel') === 'bad' ? '✗' : ''}</i></label></div>
          <h4>Makna selisih</h4>${fld('sol.mk', { rows: 2, ph: 'Jalan pintas lebih hemat … m karena …', max: 500 })}${tool}${msg}</div>`;
      } else {
        const opt = (v, t) => `<button type="button" class="chip ${sol.dec === v ? 'on' : ''} ${f.dec === true && sol.dec === v ? 'ok' : ''}" data-pick="sol.dec" data-val="${v}" ${ro ? 'disabled' : ''}>${t}</button>`;
        html = `<div class="lkpd-box"><h4>Balik rumus, tulis langkahmu sendiri</h4>${fld('sol.lg', { rows: 3, ph: 'c² = a² + b² → a² = c² − b² → a = √(…)', max: 800 })}
          <div class="lkpd-two"><label class="lkpd-stp ${mk('a')}"><span>a =</span>${fld('sol.a', { num: 1, max: 12, lab: 'a' })}<i>${mk('a') === 'ok' ? '✓' : mk('a') === 'bad' ? '✗' : ''}</i></label><div class="lkpd-dec"><span>Keputusan:</span>${opt('layak', 'LAYAK')}${opt('tidak', 'TIDAK LAYAK')}</div></div>
          <h4>Alasan (sebut unsur keselamatan)</h4>${fld('sol.al', { rows: 2, ph: 'Karena a … h_target dan …', max: 500 })}${tool}${msg}</div>`;
      }
      return {
        html, bind() {
          const c = $('#dCor'); if (c) c.onclick = sketchPad;
          const k = $('#dChk'); if (k) k.onclick = () => {
            g.chk = true; const r = L.check(g.lv, g.v, g.sol, P); const bad = Object.keys(r.f).filter(x => r.f[x] === false), good = Object.keys(r.f).filter(x => r.f[x] === true);
            g.ck = Object.assign({}, r.f); touch('ck'); touch('chk'); logEv('menekan Periksa (' + good.length + ' benar, ' + bad.length + ' salah)');
            hintMsg.t = !bad.length && good.length ? '<b class="okc">Sudah tepat!</b> Semua isian sesuai.' : `<b class="badc">Periksa lagi.</b> ${E(r.hint[bad[0]] || 'Cek langkahmu.')}`;
            sfx(bad.length ? 'wrong' : 'correct'); if (!bad.length && good.length) { stamp('hitung'); try { PP.ui.confetti && PP.ui.confetti(16); } catch (e) { } } redraw();
          };
          const h = $('#dHelp'); if (h) h.onclick = () => { g.hb = Math.min(3, (g.hb || 0) + 1); touch('hb'); logEv('membuka kartu bantuan ' + g.hb); redraw(); };
        }
      };
    }
    function s5(d) {
      const fl = files(g);
      return {
        html: `<div class="lkpd-cols"><div class="lkpd-box"><h4>Kesimpulan</h4>${fld('cs', { rows: 4, ph: d.kesimpulanAwal, max: 700 })}
          <p class="small">${E(d.foto)}</p><div class="lkpd-tools"><button class="btn sm" id="eCor" ${ro ? 'disabled' : ''}>✎ Coretan penjelasan</button></div></div>
          <div class="lkpd-box"><h4>Dokumentasi digital (bukti nyata)</h4>
          <div class="lkpd-up"><label class="btn sm green ${ro ? 'off' : ''}">📷 Foto beranotasi<input type="file" id="upFoto" accept="image/*" hidden ${ro ? 'disabled' : ''}></label>
          <label class="btn sm blue ${ro ? 'off' : ''}">📎 Bukti lain (foto/video/dokumen)<input type="file" id="upAny" multiple hidden ${ro ? 'disabled' : ''}></label></div>
          <p class="small" id="upSt" role="status"></p>
          <ul class="lkpd-fl">${fl.map(f => `<li><span>${f.k === 'foto' ? '📷' : f.k === 'coret' ? '✎' : '📎'}</span><b>${E(f.n)}</b><small>${kb(f.s || 0)}${f.w === 'local' ? ' · hanya di perangkat ini' : ''}</small><button class="btn xs" data-view="${f.id}">Lihat</button>${ro ? '' : `<button class="btn xs red" data-del="${f.id}" aria-label="Hapus">✕</button>`}</li>`).join('') || '<li class="muted small">Belum ada berkas.</li>'}</ul></div></div>`,
        bind() {
          const ec = $('#eCor'); if (ec) ec.onclick = sketchPad;
          const up = (inp, kind) => { if (inp) inp.onchange = async () => { const fs = Array.from(inp.files || []); inp.value = ''; for (const f of fs) await addFile(f, kind); redraw(); }; };
          up($('#upFoto'), 'foto'); up($('#upAny'), 'bukti');
          $$('[data-view]').forEach(b => b.onclick = () => viewFile(g, files(g).find(f => f.id === b.dataset.view)));
          $$('[data-del]').forEach(b => b.onclick = () => PP.ui.confirm('Hapus berkas ini?', 'Hapus', async () => { const f = files(g).find(x => x.id === b.dataset.del); await delFile(f); redraw(); }));
        }
      };
    }
    function s6(d) {
      const qs = d.diskusi.concat(['Refleksi pribadi: hal baru yang kupelajari, kesulitanku, dan peranku dalam kelompok.']);
      const i = Math.min(dtab, 3), isRef = i === 3, path = isRef ? 'rf.' + my.id : 'dk.d' + i;
      const cl = [['Foto beranotasi sudah diunggah', files(g).some(f => f.k === 'foto')], ['Kesimpulan sudah ditulis', String(g.cs || '').trim().length >= 15], ['Perhitungan sudah tepat', !!phases(g, P)[4]], ['Tidak ada wajah siswa lain di foto', !!g.pv], ['Tidak ada yang memanjat', !!g.kz]];
      return {
        html: `<div class="lkpd-cols"><div class="lkpd-box"><div class="lkpd-tabs">${qs.map((q, j) => `<button class="chip ${j === i ? 'on' : ''}" data-dt="${j}">${j === 3 ? 'Refleksi' : 'Diskusi ' + (j + 1)}</button>`).join('')}</div>
          <p class="lkpd-qm">${E(qs[i])}</p>${fld(path, { rows: 4, ph: isRef ? 'Tulis refleksimu (khusus dirimu)…' : 'Jawaban kelompok…', max: 700 })}</div>
          <div class="lkpd-box"><h4>Cek sebelum kirim</h4><ul class="lkpd-ck">${cl.map(c => `<li class="${c[1] ? 'ok' : ''}">${c[1] ? '✓' : '○'} ${E(c[0])}</li>`).join('')}</ul>
          <label class="lkpd-cb"><input type="checkbox" id="cPv" ${g.pv ? 'checked' : ''} ${ro ? 'disabled' : ''}> Foto tanpa wajah siswa lain</label><label class="lkpd-cb"><input type="checkbox" id="cKz" ${g.kz ? 'checked' : ''} ${ro ? 'disabled' : ''}> Kami tidak memanjat apa pun</label>
          ${g.sub ? `<p class="small okc">Terkirim ${new Date(g.sub).toLocaleString('id-ID')}${g.auto ? ' (otomatis, waktu habis)' : ''}</p>` : ''}</div></div>`,
        bind() {
          $$('[data-dt]').forEach(b => b.onclick = () => { dtab = +b.dataset.dt; draw(); });
          const pv = $('#cPv'), kz = $('#cKz'); if (pv) pv.onchange = () => { setPath('pv', pv.checked); redraw(); }; if (kz) kz.onchange = () => { setPath('kz', kz.checked); redraw(); };
        }
      };
    }
    async function viewFile(grp, f) {
      if (!f) return; PP.ui.modal(`<h3>${E(f.n)}</h3><div id="vfBox" class="lkpd-vf">Memuat…</div><div class="row end"><button class="btn green" data-close>Tutup</button></div>`, { cls: 'lkpd-modal' });
      const u = await fileUrl(grp, f), box = $('#vfBox'); if (!box) return;
      if (!u) return box.innerHTML = '<p class="small">Berkas ini hanya ada di perangkat pengunggah.</p>';
      if (/^image\//.test(f.t)) box.innerHTML = `<img src="${u}" alt="${E(f.n)}" class="lkpd-img">`;
      else if (/^video\//.test(f.t)) box.innerHTML = `<video src="${u}" controls playsinline class="lkpd-img"></video>`;
      else if (/^audio\//.test(f.t)) box.innerHTML = `<audio src="${u}" controls></audio>`;
      else box.innerHTML = `<a class="btn blue" href="${u}" target="_blank" rel="noopener" ${f.u ? '' : `download="${E(f.n)}"`}>Buka / unduh berkas</a>`;
    }

    /* ======================= panduan Foto & Coret ======================= */
    function fotoCoret() {
      const k = g && g.lv || lvk, svg = () => PP.LKPD_ANIM.segitiga(k);
      PP.ui.modal(`<h3>${ic('foto_coret', 'lkpd-float', 34)} Foto & Coret</h3><div class="lkpd-anim" id="fcA">${svg()}</div>
        <ol class="lkpd-ol small"><li>Ambil foto objek dengan kamera HP (tanpa wajah teman).</li><li>Buka foto di galeri atau WhatsApp.</li><li>Pilih alat <b>pensil / gambar</b>, tarik garis segitiga: tegak, alas, lalu sisi miring.</li><li>Pilih alat <b>teks</b>, tulis label (${k === 'a' ? 't, j, c' : k === 'b' ? 'p, l, d' : 'c, b, a, h_target'}).</li><li>Simpan, lalu unggah di langkah 5.</li></ol>
        <div class="row end"><button class="btn gold" id="fcR">↻ Putar ulang</button><button class="btn green" data-close>Tutup</button></div>`, { cls: 'lkpd-modal' });
      $('#fcR').onclick = () => { $('#fcA').innerHTML = svg(); };
    }

    /* ======================= papan coretan ======================= */
    function sketchPad() {
      if (ro || !g || g.preview) return toast('Mode baca.');
      PP.ui.modal(`<h3>✎ Coretan penjelasan</h3><div class="lkpd-sk"><canvas id="skC" width="800" height="480" aria-label="Papan coretan"></canvas></div>
        <div class="lkpd-sk-t"><span id="skCol"></span><button class="btn xs" id="skEr">Penghapus</button><button class="btn xs" id="skUn">Urungkan</button><button class="btn xs red" id="skCl">Bersihkan</button></div>
        <div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="skSv">Simpan coretan</button></div>`, { cls: 'lkpd-modal lkpd-skm' });
      const cv = $('#skC'), x = cv.getContext('2d'); let col = '#1f3a8a', er = false, drawing = false, strokes = [], cur = null;
      const redraw = () => { x.fillStyle = '#fffdf4'; x.fillRect(0, 0, cv.width, cv.height); x.strokeStyle = '#d8e4f0'; x.lineWidth = 1; for (let i = 40; i < cv.width; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, cv.height); x.stroke(); } for (let j = 40; j < cv.height; j += 40) { x.beginPath(); x.moveTo(0, j); x.lineTo(cv.width, j); x.stroke(); }
        strokes.forEach(s => { x.strokeStyle = s.e ? '#fffdf4' : s.c; x.lineWidth = s.e ? 26 : 5; x.lineCap = x.lineJoin = 'round'; x.beginPath(); s.p.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); if (s.p.length === 1) x.lineTo(s.p[0][0] + .1, s.p[0][1]); x.stroke(); }); };
      redraw();
      $('#skCol').innerHTML = ['#1f3a8a', '#c93c34', '#1f7a3a', '#222222'].map(c => `<button class="lkpd-sw ${c === col ? 'on' : ''}" data-c="${c}" style="background:${c}" aria-label="Warna"></button>`).join('');
      $$('[data-c]').forEach(b => b.onclick = () => { col = b.dataset.c; er = false; $$('[data-c]').forEach(z => z.classList.toggle('on', z === b)); });
      $('#skEr').onclick = () => { er = !er; $('#skEr').classList.toggle('on', er); };
      $('#skUn').onclick = () => { strokes.pop(); redraw(); }; $('#skCl').onclick = () => { strokes = []; redraw(); };
      const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * cv.width, (e.clientY - r.top) / r.height * cv.height]; };
      cv.onpointerdown = e => { drawing = true; cv.setPointerCapture(e.pointerId); cur = { c: col, e: er, p: [pt(e)] }; strokes.push(cur); redraw(); e.preventDefault(); };
      cv.onpointermove = e => { if (!drawing) return; cur.p.push(pt(e)); redraw(); };
      cv.onpointerup = cv.onpointercancel = () => { drawing = false; };
      $('#skSv').onclick = async () => {
        if (!strokes.length) return toast('Coretan masih kosong.', 'x');
        const blob = await toBlob(cv, .8); const n = arr(g.fl).filter(f => f.k === 'coret').length + 1; PP.ui.close();
        const f = new File([blob], `Coretan ${n}.jpg`, { type: 'image/jpeg' }); await addFile(f, 'coret'); logEv('menyimpan coretan'); toast('Coretan tersimpan.'); redraw();
      };
    }

    /* ======================= QR ======================= */
    function qrModal() {
      let tab = 'buat';
      const target = (myG || (teacher && g && !g.preview)) ? (teacher ? g : myG) : null;
      PP.ui.modal(`<h3>${ic('foto_coret', '', 30)} QR LKPD</h3><div class="lkpd-tabs"><button class="chip on" data-qt="buat">Buat QR</button><button class="chip" data-qt="pindai">Pindai QR</button></div><div id="qrB" class="lkpd-qr"></div><div class="row end"><button class="btn green" data-close>Tutup</button></div>`, { cls: 'lkpd-modal', onclose: () => { try { camStop && camStop(); } catch (e) { } camStop = null; } });
      const B = $('#qrB');
      const show = () => {
        $$('[data-qt]').forEach(b => b.classList.toggle('on', b.dataset.qt === tab));
        try { camStop && camStop(); } catch (e) { } camStop = null;
        if (tab === 'buat') {
          const items = []; if (target) items.push([target.nm + ' (LKPD kelompok)', link(target.id)]); ['a', 'b', 'c'].forEach(k => items.push(['Naskah ' + L.LV[k].abjad + ' · ' + L.LV[k].nama, link('lv_' + k)]));
          let cur = items[0];
          const paint = () => { let s = ''; try { s = QRMake.svg(cur[1], { size: 200, level: 'M' }); } catch (e) { s = '<p class="small">Tautan terlalu panjang untuk QR.</p>'; }
            B.innerHTML = `<div class="lkpd-qrbox">${s}</div><p class="small"><b>${E(cur[0])}</b></p><p class="small lkpd-lnk">${E(cur[1])}</p><div class="lkpd-opts">${items.map((x, i) => `<button class="chip ${x === cur ? 'on' : ''}" data-qi="${i}">${E(x[0].split(' (')[0].slice(0, 22))}</button>`).join('')}</div><div class="row"><button class="btn sm" id="qCp">Salin tautan</button><button class="btn sm blue" id="qPng">Unduh PNG</button></div>`;
            $$('[data-qi]', B).forEach(b => b.onclick = () => { cur = items[+b.dataset.qi]; paint(); });
            $('#qCp', B).onclick = () => { try { navigator.clipboard.writeText(cur[1]).then(() => toast('Tautan disalin.')); } catch (e) { toast('Salin manual dari kotak tautan.'); } };
            $('#qPng', B).onclick = () => { if (IN_VIEWER) return toast('Unduhan tidak tersedia di pratinjau.'); const sv = B.querySelector('svg'); const img = new Image(), u = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(sv)], { type: 'image/svg+xml' })); img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 600; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#fff'; x.fillRect(0, 0, 600, 600); x.drawImage(img, 0, 0, 600, 600); c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'qr-lkpd.png'; a.click(); }); URL.revokeObjectURL(u); }; img.src = u; };
          }; paint();
        } else {
          B.innerHTML = `<p class="small">Arahkan kamera ke QR LKPD, atau unggah foto/screenshot QR.</p><video id="qV" playsinline muted class="lkpd-cam"></video><p class="small" id="qS" role="status"></p><div class="row"><button class="btn sm green" id="qCam">📷 Buka kamera</button><label class="btn sm blue">🖼 Unggah gambar QR<input type="file" id="qF" accept="image/*" hidden></label></div>`;
          const done = t => { if (!t) return false; if (handleQr(t)) { try { camStop && camStop(); } catch (e) { } camStop = null; PP.ui.close(); return true; } $('#qS', B).textContent = 'QR terbaca, tetapi bukan QR LKPD: ' + String(t).slice(0, 80); return false; };
          $('#qCam', B).onclick = async () => { try { const v = $('#qV', B); $('#qS', B).textContent = 'Menyalakan kamera…'; camStop = QRRead.scanVideo(v, done); } catch (e) { $('#qS', B).textContent = 'Kamera tidak bisa dibuka. Pakai unggah gambar.'; } };
          $('#qF', B).onchange = async e => { const f = e.target.files[0]; if (!f) return; $('#qS', B).textContent = 'Membaca…'; let t = null; try { t = await QRRead.fromFile(f); } catch (x) { } if (!t) $('#qS', B).textContent = 'QR tidak terbaca. Coba foto yang lebih jelas.'; else done(t); };
        }
      };
      $$('[data-qt]').forEach(b => b.onclick = () => { tab = b.dataset.qt; show(); }); show();
    }
    function handleQr(text) {
      const m = String(text).match(/#lkpd-([A-Z0-9]{3,10})\.([\w\-]+)/i); if (!m) return false; return openByArg(m[1].toUpperCase() + '.' + m[2], true);
    }

    /* ======================= KIRIM, KUNCI, WAKTU ======================= */
    function sendG() {
      if (ro || !g || g.preview) return;
      if (g.sub) {                                                            // masih dalam jendela edit: kunci sekarang
        return PP.ui.confirm('Kunci LKPD sekarang? Setelah itu tidak bisa diedit lagi (hanya riwayat).', 'Kunci', async () => { g.fin = now(); g.un = 0; touch('fin'); touch('un'); logEv('mengunci LKPD'); await flush(); toast('LKPD terkunci.'); view = 'hist'; draw(); });
      }
      if (!g.pv || !g.kz) return toast('Centang dulu pengingat privasi dan keselamatan (langkah 6).', 'x');
      const ph = phases(g, P), n = Object.values(ph).filter(Boolean).length;
      PP.ui.modal(`<h3>Kirim LKPD ke guru?</h3><p class="modal-text small">Kemajuan: <b>${n}/6</b> fase lengkap${n < 6 ? ' (belum semua fase terisi)' : ''}. Setelah dikirim kamu masih bisa mengedit selama <b>${+P.ew || 5} menit</b>, lalu LKPD terkunci otomatis dan hanya bisa dilihat sebagai riwayat. Setelah itu kamu bisa membuat presentasi.</p><div class="row end"><button class="btn" data-close>Belum</button><button class="btn green" id="sOk">Ya, kirim</button></div>`);
      $('#sOk').onclick = async () => {
        PP.ui.close(); g.sub = now(); g.auto = null; g.fin = null; g.un = null; ['sub', 'auto', 'fin', 'un'].forEach(touch); logEv('mengirim LKPD ke guru'); await flush();
        sfx('mission'); try { PP.ui.confetti && PP.ui.confetti(); } catch (e) { }
        toast(saveOk ? 'LKPD terkirim ke guru.' : 'Tersimpan di perangkat; akan dikirim ulang saat online.');
        PP.ui.modal(`<h3>LKPD terkirim ✓</h3><p class="modal-text small">Sekarang rapikan dan percantik presentasi kelompokmu (foto, video, teks). Hasil presentasi disimpan sebagai versi.</p><div class="row end"><button class="btn" data-close>Nanti</button><button class="btn gold" id="sPe">Buat presentasi</button></div>`);
        $('#sPe').onclick = () => { PP.ui.close(); presHome(g, true); }; draw();
      };
    }
    async function autoFinal() {
      if (!g || g.sub || g !== myG) return; g.sub = now(); g.auto = 1; g.un = null; ['sub', 'auto', 'un'].forEach(touch); logEv('waktu habis: LKPD dikirim otomatis'); await flush();
      sfx('unlock'); PP.ui.modal(`<h3>⏱ Waktu habis</h3><p class="modal-text small">Batas waktu pengerjaan sudah lewat. Isi LKPD kelompokmu dikirim otomatis ke guru dan dikunci. Kamu masih bisa melihat riwayatnya.</p><div class="row end"><button class="btn green" data-close>Oke</button></div>`);
      view = 'hist'; draw();
    }
    const tk = setInterval(() => {
      if (!alive || !g || presEl) return;
      if (g === myG && !teacher && !g.sub) { const dl = deadline(g, P); if (dl && now() > dl) return autoFinal(); }
      const a = $('#lkTm'), b = $('#lkTmH'), w = $('#lkWinT'); const dl = g.preview ? 0 : deadline(g, P);
      if (a && dl) { const r = dl - now(); a.textContent = '⏱ ' + mmss(r); a.classList.toggle('low', r < 300000); }
      if (b && dl) b.textContent = mmss(dl - now());
      if (w) w.textContent = mmss(editUntil(g, P) - now());
      if (view === 'lkpd' && !ro && !teacher && g === myG && g.sub && !canEditG(g, P)) { toast('Waktu edit habis. LKPD terkunci.'); view = 'hist'; draw(); }
    }, 1000); cleanups.push(() => clearInterval(tk));
    /* muat ulang data terbaru dari server secara berkala (layar beranda saja) */
    const poll = setInterval(async () => {
      if (!alive || busy || presEl || view !== 'home') return;
      const before = JSON.stringify([diag && diag.ts, diag && diag.ov, myG && myG.id, myG && myG.sub, myG && myG.auto, myG && myG.fin, myG && myG.un, myG && Object.keys(myG.mem || {}).length, nilai && nilai.ts, req && req.st, P.gs, P.ew, P.dA, P.dB, P.dC]);
      try { await loadBase(); if (diag && !myG && P.au) { await autoPlace(); await loadBase(); } } catch (e) { return; }
      const after = JSON.stringify([diag && diag.ts, diag && diag.ov, myG && myG.id, myG && myG.sub, myG && myG.auto, myG && myG.fin, myG && myG.un, myG && Object.keys(myG.mem || {}).length, nilai && nilai.ts, req && req.st, P.gs, P.ew, P.dA, P.dB, P.dC]);
      if (before !== after && view === 'home' && !document.querySelector('.modal, .modal-back, [role=dialog]')) draw();
    }, 10000); cleanups.push(() => clearInterval(poll));

    /* ======================= BERKAS BUKTI ======================= */
    const memUrl = {};
    async function addFile(file, kind) {
      const st = $('#upSt'); const say = t => { if (st) st.textContent = t; };
      if (ro || !g || g.preview) return;
      const id = 'f' + rid(); let blob = file, name = file.name || ('berkas-' + id), type = file.type || 'application/octet-stream', w = 'local', u = null, nch = 0;
      try {
        if (/^image\//.test(type)) { say('Memperkecil foto…'); blob = await shrink(file, 300); type = 'image/jpeg'; name = name.replace(/\.[^.]+$/, '') + '.jpg'; }
        await idb.put(g.id + '/' + id, { blob, name, type });                  // salinan lokal dulu: tidak akan hilang
        if (bucket() && blob.size <= 25 * 1048576) {
          say('Mengunggah… 0%'); try { u = await uploadStorage(new File([blob], name, { type }), `lkpd/${g.id}/${id}_${name.replace(/[^\w.\-]+/g, '_').slice(0, 50)}`, p => say('Mengunggah… ' + p + '%')); w = 'storage'; } catch (e) { u = null; }
        }
        if (w === 'local' && blob.size <= MAXCLOUD) { say('Mengirim ke server…'); nch = await putChunks(g.id, id, blob); if (nch) w = 'cloud'; }
      } catch (e) { say('Gagal ke server, disimpan di perangkat.'); }
      const f = { id, n: name, t: type, s: blob.size, k: kind, w, by: my.n.split(' ')[0], ts: now() }; if (u) f.u = u; if (nch) f.c = nch;
      g.fl = g.fl || {}; g.fl[id] = f; touch('fl.' + id); logEv('mengunggah ' + (kind === 'foto' ? 'foto' : kind === 'coret' ? 'coretan' : 'berkas') + ': ' + name); await flush();
      if (kind === 'foto') stamp('foto');
      say(w === 'local' ? 'Tersimpan di perangkat ini saja (berkas besar atau server belum mendukung). Guru tidak dapat melihatnya.' : 'Berkas tersimpan online.'); sfx('star');
    }
    async function delFile(f) {
      if (!f) return; if (g.fl) delete g.fl[f.id]; touch('fl.' + f.id); logEv('menghapus berkas: ' + f.n); await idb.del(g.id + '/' + f.id); if (f.w === 'cloud') C().del(K.blob(g.id, f.id)); await flush();
    }
    async function fileUrl(grp, f) {
      if (!f) return null; if (f.u) return f.u; const key = grp.id + '/' + f.id; if (memUrl[key]) return memUrl[key];
      const l = await idb.get(key); if (l && l.blob) { const u = URL.createObjectURL(l.blob); urls.push(u); return (memUrl[key] = u); }
      if (f.w === 'cloud' && f.c) { const d = await getChunks(grp.id, f.id, f.c); if (d) return (memUrl[key] = d); }
      return null;
    }

    /* ======================= RIWAYAT PENGERJAAN ======================= */
    const sbl = (g, k) => String(k.split('.').reduce((o, p) => (o == null ? o : o[p]), g) || '');
    function histHtml(x, withLog) {
      const d = L.LV[x.lv], v = x.v || {}, so = x.sol || {}, st = statusG(x, P), ck = L.check(x.lv, v, so, P), ph = phases(x, P);
      const row = (a, b) => `<tr><td>${E(a)}</td><td>${b}</td></tr>`, txt = t => t ? E(t).replace(/\n/g, '<br>') : '<em class="muted">—</em>';
      const vals = d.tetap.map(z => row(z.n + ' (parameter guru)', fmt(P[z.k]) + ' ' + z.u)).concat(d.variabel.map(z => row(z.n, (v[z.k] ? E(v[z.k]) : '<em class="muted">—</em>') + ' ' + z.u)));
      const f = ck.f || {}, flag = k => f[k] === true ? ' <b class="okc">✓ sesuai</b>' : f[k] === false ? ' <b class="badc">✗ di luar toleransi</b>' : '';
      let sols = '';
      if (x.lv === 'a') sols = [['t²', so.st && so.st.t2], ['j²', so.st && so.st.j2], ['t² + j²', so.st && so.st.s]].map(z => row(z[0], txt(z[1]))).join('') + row('c (jawaban)', txt(so.c) + flag('c'));
      else if (x.lv === 'b') sols = row('Langkah hitung', txt(so.lg)) + row('d', txt(so.d) + flag('d')) + row('Selisih p + l − d', txt(so.sel) + flag('sel')) + row('Makna selisih', txt(so.mk));
      else sols = row('Langkah hitung', txt(so.lg)) + row('a', txt(so.a) + flag('a')) + row('Keputusan', so.dec ? (so.dec === 'layak' ? 'LAYAK' : 'TIDAK LAYAK') + flag('dec') : txt('')) + row('Alasan', txt(so.al));
      const dv = L.derive(x.lv, v, P);
      const roleNames = members(x).map(m => E(m.n)).join(', ');
      const fl = files(x), dk = x.dk || {}, qs = d.diskusi;
      const rfs = members(x).map(m => row('Refleksi ' + m.n, txt(x.rf && x.rf[m.id]))).join('');
      const jd = [['ukur', 'Mengukur'], ['foto', 'Memotret'], ['hitung', 'Menghitung'], ['tampil', 'Presentasi']].map(a => `${a[1]}: <b>${(x.jd && x.jd[a[0]]) ? E(String(x.jd[a[0]]).replace('T', ' ')) : (x.ja && x.ja[a[0]] ? when(x.ja[a[0]]) : '–')}</b>`).join(' · ');
      const lg = Object.keys(x.lg || {}).sort().slice(-80).map(k => x.lg[k]).filter(Boolean);
      return `<div class="lkpd-hist">
        <div class="lkpd-hh"><span class="lkpd-pill ${st[1]}">${st[0]}</span> <b>${E(x.nm)}</b> · ${E(d.abjad + ' ' + d.nama)} · anggota: ${roleNames || '–'}<br><small>Dimulai ${when(x.t0)} · dikirim ${when(x.sub)}${x.auto ? ' (otomatis)' : ''} · fase lengkap ${Object.values(ph).filter(Boolean).length}/6${durMin(x, P) ? ' · batas ' + durMin(x, P) + ' menit' : ''}</small></div>
        <h4>1 · Cerita & pertanyaan</h4><table class="lkpd-tbl">${row('Objek dipilih', txt(x.obj))}${d.pilihCara ? row('Cara dipilih', txt(x.cara)) + row('Alasan', txt(x.alasan)) : ''}${row('Pertanyaan kelompok', txt(x.q))}</table>
        <h4>2 · Jadwal</h4><p class="small">${jd}</p>
        <h4>3 · Data pengukuran</h4><table class="lkpd-tbl">${vals.join('')}</table>
        <h4>4 · Penyelesaian</h4><table class="lkpd-tbl">${sols}</table>
        ${dv.length ? `<details class="lkpd-dv"><summary>Hitungan acuan aplikasi (untuk memeriksa)</summary><ol>${dv.map(z => `<li>${E(z)}</li>`).join('')}</ol><p class="small">Toleransi: selisih ≤ ${fmt(P.tol)} dianggap benar.</p></details>` : ''}
        <h4>5 · Kesimpulan & bukti</h4><table class="lkpd-tbl">${row('Kesimpulan', txt(x.cs))}</table>
        <div class="lkpd-gal" data-gal="${x.id}">${fl.map(z => `<figure data-fid="${z.id}"><div class="lkpd-th">${/^image\//.test(z.t || '') ? '⏳' : /^video\//.test(z.t || '') ? '🎞' : '📎'}</div><figcaption>${E(z.n)}<br><small>${kb(z.s || 0)}${z.w === 'local' ? ' · hanya di perangkat siswa' : ''}</small></figcaption></figure>`).join('') || '<p class="small muted">Belum ada berkas.</p>'}</div>
        <h4>6 · Diskusi & refleksi</h4><table class="lkpd-tbl">${qs.map((q, i) => row('Diskusi ' + (i + 1) + ': ' + q, txt(dk['d' + i]))).join('')}${rfs}</table>
        ${withLog ? `<details class="lkpd-dv"><summary>Catatan aktivitas (${lg.length})</summary><ul class="lkpd-lg">${lg.map(z => `<li><small>${when(z.t)}</small> ${E(z.u || '')}: ${E(z.e)}</li>`).join('') || '<li class="muted small">Belum ada.</li>'}</ul></details>` : ''}</div>`;
    }
    async function fillGallery(box, x) {                                      // muat gambar pada riwayat
      for (const z of files(x)) { const fg = box.querySelector(`[data-fid="${z.id}"]`); if (!fg) continue; const th = fg.querySelector('.lkpd-th'); fg.onclick = () => viewFile(x, z); fg.style.cursor = 'pointer';
        if (/^image\//.test(z.t || '')) { const u = await fileUrl(x, z); if (th) th.innerHTML = u ? `<img src="${u}" alt="${E(z.n)}">` : '<small>tidak ada di perangkat ini</small>'; } }
    }
    function vHist() {
      const x = g, html = `${topBar('Riwayat pengerjaan', x.nm + ' · ' + LVN(x.lv), x.lv, (!x.sub ? '' : '<span class="lkpd-chip">🔒 ' + (canEditG(x, P) ? 'masih bisa diedit' : 'terkunci') + '</span>') + `<button class="btn sm gold" id="hPres">Presentasi</button>`)}
        <div class="lkpd-body">${canEditG(x, P) && x === myG ? '<div class="lkpd-note warn"><button class="btn sm green" id="hEdit">Lanjut mengedit</button> LKPD ini belum terkunci.</div>' : '<div class="lkpd-note">Ini riwayat pengerjaan. Semua isian, foto, dan jawaban kelompok tersimpan di sini dan tidak bisa diubah.</div>'}${nilai && x === myG && nilai.s != null ? `<div class="lkpd-fb"><b>Nilai proyekmu: ${nilai.s}</b>${nilai.fb ? ' · ' + E(nilai.fb) : ''}</div>` : ''}${histHtml(x, false)}</div>`;
      return { html, bind() { $('#lkBack').onclick = () => { view = 'home'; g = myG; draw(); }; $('#hPres').onclick = () => presHome(x); const e = $('#hEdit'); if (e) e.onclick = openMine; fillGallery(rootEl, x); } };
    }

    /* ======================= PRESENTASI ======================= */
    const THEMES = [['laut', 'Laut'], ['hutan', 'Hutan'], ['senja', 'Senja'], ['kertas', 'Kertas']];
    const slArr = o => arr(o).sort((a, b) => (a.i || 0) - (b.i || 0));
    function autoSlides(grp) {
      const out = [{ t: 'judul' }], ph = files(grp).filter(f => /^image\//.test(f.t || '')).slice(0, 4);
      ph.forEach(f => out.push({ t: 'foto', f: f.id, c: f.n.replace(/\.[^.]+$/, '') })); out.push({ t: 'data' }, { t: 'teks', h: 'Kesimpulan', b: grp.cs || '' }, { t: 'tanya' }); return out;
    }
    async function loadPres(gid) {
      const p = (await C().get(K.pres(gid))) || {}, vs = (await C().get('lkpd/presv/' + gid)) || {};
      const list = Object.keys(vs && typeof vs === 'object' ? vs : {}).map(id => Object.assign({ id }, vs[id])).filter(z => z && z.sl).sort((a, b) => (a.ts || 0) - (b.ts || 0)); return { p, list };
    }
    async function presHome(grp, goEdit) {
      if (!grp || grp.preview) return toast('Pilih kelompok yang sudah mengisi LKPD.', 'x');
      const own = grp === myG && !teacher; view = 'pres'; g = grp; const pr = await loadPres(grp.id); pstate = { grp, pr, own }; if (goEdit && own) return presEdit(null); draw();
    }
    let pstate = null;
    function vPres() {
      const { grp, pr, own } = pstate, hide = !!pr.p.hide, cur = pr.p.cur;
      const rows = pr.list.map((v, i) => `<li class="${v.id === cur ? 'cur' : ''}"><b>Versi ${i + 1}</b>${v.id === cur ? ' <span class="lkpd-pill ok">dipakai</span>' : ''}<small>${when(v.ts)} · ${E(v.by || '')} · ${slArr(v.sl).length} slide · tema ${E(v.th || 'laut')}</small>
        <span><button class="btn xs gold" data-pl="${v.id}" ${hide && !teacher ? 'disabled' : ''}>▶ Tayangkan</button>${own ? `<button class="btn xs" data-ed="${v.id}">Edit</button>` : ''}${own || teacher ? `<button class="btn xs" data-us="${v.id}">Pakai</button><button class="btn xs red" data-dl="${v.id}">Hapus</button>` : ''}</span></li>`).join('');
      const html = `${topBar('Presentasi', grp.nm + ' · ' + presMin(P, grp.lv) + ' menit', 'r_jubir')}
        <div class="lkpd-body">${hide ? '<div class="lkpd-note warn">Presentasi kelompok ini disembunyikan oleh guru.</div>' : ''}
        <div class="lkpd-acts">${own ? '<button class="btn green lkpd-pulse" id="pNew">✎ Buat / edit presentasi</button>' : ''}<button class="btn gold" id="pAuto" ${hide && !teacher ? 'disabled' : ''}>▶ Tayangkan ${pr.list.length ? 'versi dipakai' : 'otomatis dari LKPD'}</button></div>
        <ul class="lkpd-vers">${rows || '<li class="muted small">Belum ada versi tersimpan. Tayangan otomatis dibuat dari isi LKPD (foto, data, kesimpulan).</li>'}</ul>
        <p class="small muted">Setiap kali kamu menyimpan di editor, terbentuk versi baru. Versi yang jelek bisa dihapus; sistem memakai versi sebelumnya.</p></div>`;
      return {
        html, bind() {
          $('#lkBack').onclick = () => { view = teacher ? 'guru' : (myG && grp.id === myG.id ? 'home' : 'home'); g = myG; draw(); };
          const n = $('#pNew'); if (n) n.onclick = () => presEdit(cur || null);
          $('#pAuto').onclick = () => presShow(grp, pr.list.find(v => v.id === cur) || pr.list[pr.list.length - 1] || null);
          $$('[data-pl]').forEach(b => b.onclick = () => presShow(grp, pr.list.find(v => v.id === b.dataset.pl)));
          $$('[data-ed]').forEach(b => b.onclick = () => presEdit(b.dataset.ed));
          $$('[data-us]').forEach(b => b.onclick = async () => { await C().patch(K.pres(grp.id), { cur: b.dataset.us }); pstate.pr = await loadPres(grp.id); draw(); });
          $$('[data-dl]').forEach(b => b.onclick = () => PP.ui.confirm('Hapus versi presentasi ini?', 'Hapus', async () => { await C().del(K.presv(grp.id, b.dataset.dl)); const rest = pr.list.filter(v => v.id !== b.dataset.dl); await C().put(K.pres(grp.id), Object.assign({}, pr.p, { cur: rest.length ? rest[rest.length - 1].id : null, ts: now() })); logEv('menghapus versi presentasi'); pstate.pr = await loadPres(grp.id); toast('Versi dihapus.'); draw(); }));
        }
      };
    }
    /* ---- editor ---- */
    let ed = null;
    async function presEdit(vid) {
      const grp = pstate.grp, v = vid ? pstate.pr.list.find(z => z.id === vid) : null;
      const sl = (v ? slArr(v.sl) : autoSlides(grp)).map(s => Object.assign({}, s)); ed = { grp, sl, th: (v && v.th) || 'laut', i: 0, dirty: false };
      ed.urls = {}; for (const f of files(grp)) { if (/^(image|video)\//.test(f.t || '')) { const u = await fileUrl(grp, f); if (u) ed.urls[f.id] = u; } }
      view = 'pedit'; draw();
    }
    function slideBody(grp, s, th, urlOf, spoke) {
      const d = L.LV[grp.lv], m = members(grp), ex = L.expect(grp.lv, grp.v, P);
      if (s.t === 'judul') return `<div class="lkpd-sl s0">${ic(d.ikon, 'lkpd-float', 90)}<h1>${E(s.h || d.judul)}</h1><h2>${E(grp.nm)} · ${E(d.nama)}</h2><div class="lkpd-spk"><b>Anggota</b>${m.map(x => `<span class="chip">${E(x.n.split(' ')[0])}</span>`).join('')}</div></div>`;
      if (s.t === 'foto') { const u = urlOf(s.f), f = files(grp).find(z => z.id === s.f); return `<div class="lkpd-sl s1">${u ? (/^video\//.test(f && f.t || '') ? `<video src="${u}" controls playsinline></video>` : `<img src="${u}" alt="${E(s.c || '')}">`) : '<p class="big">Pilih foto/video untuk slide ini.</p>'}${s.c ? `<p class="lkpd-cap">${E(s.c)}</p>` : ''}</div>`; }
      if (s.t === 'data') { const rows = []; d.tetap.forEach(x => rows.push([x.n, fmt(P[x.k]) + ' ' + x.u])); d.variabel.forEach(x => { if (grp.v[x.k]) rows.push([x.n, grp.v[x.k] + ' ' + x.u]); }); if (ex) Object.keys(ex).forEach(k => { const lab = d.hasil.find(h => h.k === k); if (lab) rows.push([lab.n, fmt(ex[k]) + ' ' + lab.u]); });
        const so = grp.sol || {}; return `<div class="lkpd-sl s2"><h2>${E(s.h || 'Data & Perhitungan')}</h2><table class="lkpd-tbl big">${rows.map(x => `<tr><td>${E(x[0])}</td><td><b>${E(x[1])}</b></td></tr>`).join('')}</table><p class="small">Jawaban kelompok: ${grp.lv === 'a' ? 'c = ' + E(so.c || '—') + ' m' : grp.lv === 'b' ? 'd = ' + E(so.d || '—') + ' m · selisih = ' + E(so.sel || '—') + ' m' : 'a = ' + E(so.a || '—') + ' m · ' + (so.dec === 'layak' ? 'LAYAK' : so.dec === 'tidak' ? 'TIDAK LAYAK' : '—')}</p></div>`; }
      if (s.t === 'tanya') return `<div class="lkpd-sl s4">${ic('f6', 'lkpd-pop', 80)}<h2>${E(s.h || 'Tanya Jawab')}</h2><p class="big">${E(s.b || 'Terima kasih! Siapa yang ingin bertanya?')}</p></div>`;
      return `<div class="lkpd-sl s3"><h2>${E(s.h || '')}</h2><p class="big">${E(s.b || '—').replace(/\n/g, '<br>')}</p></div>`;
    }
    function vPedit() {
      const { grp } = ed, s = ed.sl[ed.i] || ed.sl[0], urlOf = id => ed.urls[id];
      const media = files(grp).filter(f => /^(image|video)\//.test(f.t || ''));
      const html = `${topBar('Editor presentasi', grp.nm, 'r_jubir', '<button class="btn sm green" id="eSv">💾 Simpan versi baru</button>')}
        <div class="lkpd-body lkpd-ed">
          <div class="lkpd-edl"><div class="lkpd-opts">${THEMES.map(t => `<button class="chip ${ed.th === t[0] ? 'on' : ''}" data-th="${t[0]}">${t[1]}</button>`).join('')}</div>
            <ol class="lkpd-sll">${ed.sl.map((z, i) => `<li class="${i === ed.i ? 'on' : ''}" data-si="${i}"><span>${i + 1}</span> ${z.t === 'judul' ? 'Judul' : z.t === 'foto' ? 'Foto/Video' : z.t === 'data' ? 'Data' : z.t === 'tanya' ? 'Tanya jawab' : E(z.h || 'Teks')}</li>`).join('')}</ol>
            <div class="lkpd-tools"><button class="btn xs" id="eAddT">+ Teks</button><button class="btn xs" id="eAddF">+ Foto/Video</button><button class="btn xs" id="eAddD">+ Data</button></div></div>
          <div class="lkpd-edr"><div class="lkpd-prev lkpd-th-${ed.th}">${slideBody(grp, s, ed.th, urlOf)}</div>
            <div class="lkpd-edf">${s.t === 'foto' ? `<label class="small">Pilih foto/video dari berkas LKPD<select data-e="f"><option value="">— pilih —</option>${media.map(f => `<option value="${f.id}" ${s.f === f.id ? 'selected' : ''}>${E(f.n)}</option>`).join('')}</select></label><label class="btn xs blue">+ Unggah foto/video baru<input type="file" id="eUp" accept="image/*,video/*" hidden></label><label class="small">Keterangan<input class="ab-inp" data-e="c" maxlength="80" value="${E(s.c || '')}"></label>` : s.t === 'judul' || s.t === 'data' || s.t === 'tanya' ? `<label class="small">Judul slide<input class="ab-inp" data-e="h" maxlength="80" value="${E(s.h || '')}" placeholder="(otomatis)"></label>${s.t === 'tanya' ? `<label class="small">Teks<input class="ab-inp" data-e="b" maxlength="120" value="${E(s.b || '')}"></label>` : ''}` : `<label class="small">Judul<input class="ab-inp" data-e="h" maxlength="80" value="${E(s.h || '')}"></label><label class="small">Isi<textarea class="ab-inp" data-e="b" rows="4" maxlength="600">${E(s.b || '')}</textarea></label>`}
              <div class="lkpd-tools"><button class="btn xs" id="eUp1" ${ed.i ? '' : 'disabled'}>↑</button><button class="btn xs" id="eDn1" ${ed.i < ed.sl.length - 1 ? '' : 'disabled'}>↓</button><button class="btn xs red" id="eDel" ${ed.sl.length > 1 ? '' : 'disabled'}>Hapus slide</button></div></div></div></div>`;
      return {
        html, bind() {
          $('#lkBack').onclick = () => { if (ed.dirty) return PP.ui.confirm('Keluar tanpa menyimpan perubahan?', 'Keluar', () => { view = 'pres'; draw(); }); view = 'pres'; draw(); };
          $$('[data-th]').forEach(b => b.onclick = () => { ed.th = b.dataset.th; ed.dirty = true; redraw(); });
          $$('[data-si]').forEach(li => li.onclick = () => { ed.i = +li.dataset.si; redraw(); });
          $$('[data-e]').forEach(inp => { const k = inp.dataset.e; const ev = () => { s[k] = inp.value; ed.dirty = true; if (k === 'f') { s.f = inp.value; redraw(); } else { const p = $('.lkpd-prev'); if (p) p.innerHTML = slideBody(grp, s, ed.th, urlOf); } }; inp.oninput = k === 'f' ? null : ev; inp.onchange = ev; });
          const add = o => { ed.sl.splice(ed.i + 1, 0, o); ed.i++; ed.dirty = true; redraw(); };
          $('#eAddT').onclick = () => add({ t: 'teks', h: 'Judul baru', b: '' }); $('#eAddF').onclick = () => add({ t: 'foto', f: '', c: '' }); $('#eAddD').onclick = () => add({ t: 'data' });
          $('#eUp1').onclick = () => { const a = ed.sl[ed.i]; ed.sl[ed.i] = ed.sl[ed.i - 1]; ed.sl[ed.i - 1] = a; ed.i--; ed.dirty = true; redraw(); };
          $('#eDn1').onclick = () => { const a = ed.sl[ed.i]; ed.sl[ed.i] = ed.sl[ed.i + 1]; ed.sl[ed.i + 1] = a; ed.i++; ed.dirty = true; redraw(); };
          $('#eDel').onclick = () => { ed.sl.splice(ed.i, 1); ed.i = Math.max(0, ed.i - 1); ed.dirty = true; redraw(); };
          const up = $('#eUp'); if (up) up.onchange = async () => { const f = up.files[0]; up.value = ''; if (!f) return; g = grp; ro = false; await addFile(f, 'bukti'); const nf = files(grp).slice(-1)[0]; if (nf) { s.f = nf.id; ed.urls[nf.id] = await fileUrl(grp, nf); ed.dirty = true; } redraw(); };
          $('#eSv').onclick = async () => {
            const id = 'v' + rid(), o = {}; ed.sl.forEach((z, i) => { o['s' + i] = Object.assign({ i }, z); });
            const ok = await C().put(K.presv(grp.id, id), { ts: now(), by: my.n.split(' ')[0], th: ed.th, sl: o }); if (!ok) return toast('Gagal menyimpan. Coba lagi.', 'x');
            await C().put(K.pres(grp.id), Object.assign({}, pstate.pr.p, { cur: id, ts: now() })); stampG(grp, 'tampil'); logEv('menyimpan versi presentasi'); ed.dirty = false; sfx('star'); toast('Versi baru tersimpan.'); pstate.pr = await loadPres(grp.id); view = 'pres'; draw();
          };
        }
      };
    }
    function stampG(grp, key) { if (grp !== myG || teacher) return; g = grp; stamp(key); flush(); }
    /* ---- penayang ---- */
    async function presShow(grp, v) {
      toast('Menyiapkan presentasi…'); const urlM = {}; for (const f of files(grp)) { if (/^(image|video)\//.test(f.t || '')) { const u = await fileUrl(grp, f); if (u) urlM[f.id] = u; } }
      const sls = v ? slArr(v.sl) : autoSlides(grp), th = (v && v.th) || 'laut', mins = presMin(P, grp.lv); let si = 0, left = Math.round(mins * 60), run = false, tm = null;
      stampG(grp, 'tampil');
      presEl = document.createElement('div'); presEl.className = 'lkpd-pres lkpd-th-' + th; presEl.setAttribute('role', 'dialog'); presEl.setAttribute('aria-label', 'Mode presentasi');
      document.body.appendChild(presEl); document.body.classList.add('lkpd-presenting');
      const fmtT = s => String(Math.floor(Math.abs(s) / 60)).padStart(2, '0') + ':' + String(Math.abs(s) % 60).padStart(2, '0');
      const paint = () => {
        presEl.innerHTML = `<div class="lkpd-pbar"><button class="btn sm red" id="pX">✕ Keluar</button><span class="lkpd-tm ${left < 0 ? 'over' : ''}" id="pT">${left < 0 ? '+' : ''}${fmtT(left)}</span><button class="btn sm ${run ? '' : 'green lkpd-pulse'}" id="pR">${run ? '⏸' : '▶ Mulai'}</button><button class="btn sm" id="pZ">↺</button><span class="lkpd-pi">${si + 1}/${sls.length}</span></div><div class="lkpd-pst">${slideBody(grp, sls[si], th, id => urlM[id])}</div><div class="lkpd-pnav"><button class="btn" id="pP" ${si ? '' : 'disabled'}>◀</button><button class="btn green" id="pN" ${si < sls.length - 1 ? '' : 'disabled'}>▶</button></div>`;
        $('#pX', presEl).onclick = close; $('#pR', presEl).onclick = () => { run = !run; paint(); }; $('#pZ', presEl).onclick = () => { left = Math.round(mins * 60); run = false; paint(); };
        $('#pP', presEl).onclick = () => { si--; paint(); }; $('#pN', presEl).onclick = () => { si++; paint(); };
      };
      const key = e => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight' && si < sls.length - 1) { si++; paint(); } else if (e.key === 'ArrowLeft' && si > 0) { si--; paint(); } };
      let tx = 0; presEl.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true }); presEl.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60) { if (dx < 0 && si < sls.length - 1) { si++; paint(); } else if (dx > 0 && si > 0) { si--; paint(); } } }, { passive: true });
      document.addEventListener('keydown', key);
      tm = setInterval(() => { if (!run) return; left--; const t = $('#pT', presEl); if (t) { t.textContent = (left < 0 ? '+' : '') + fmtT(left); t.classList.toggle('over', left < 0); } if (left === 0) sfx('unlock'); }, 1000);
      function close() { clearInterval(tm); document.removeEventListener('keydown', key); if (presEl) presEl.remove(); presEl = null; document.body.classList.remove('lkpd-presenting'); draw(); }
      closePres = close; paint();
    }
    let closePres = null;

    /* ======================= tautan QR ======================= */
    async function openByArg(a) {
      let [room, id] = String(a).split('.'); if (!id) { id = room; room = ''; } if (!id) return false;
      if (id === 'guru') { GU().require(() => { view = 'guru'; draw(); }); return true; }
      if (room && room !== C().room()) { toast(`QR dari ruangan ${room}; kamu berada di ruangan ${C().room()}.`, 'x'); return false; }
      if (/^lv_[abc]$/.test(id)) { const k = id.slice(3); if (lockedLv(k)) { toast('Level itu bukan kelompokmu.', 'x'); return false; } if (myG && myG.lv === k) openMine(); else openLkpd(k, true); return true; }
      const x = await C().get(K.grp(id)); if (!validG(x)) { toast('Kelompok pada QR tidak ditemukan.', 'x'); return false; }
      const n = normG(Object.assign({ id }, x));
      if (myG && myG.id === id) { openMine(); return true; }
      if (GU().isGuru()) { openLkpd(n.lv, true, n, true); return true; }
      if (myG) { toast('Itu bukan kelompokmu. LKPD kelompok lain tidak bisa dibuka.', 'x'); return false; }
      openLkpd(n.lv, true); return true;
    }

    /* ======================= PANEL GURU ======================= */
    let gtab = 'kel', gdata = null, gsel = null;
    const objOf = (a, pre) => { const o = {}; a.forEach((x, i) => { o[(pre || 'k') + String(i).padStart(3, '0')] = x; }); return o; };
    async function loadGuru() {
      const [rap, dg, mp, gr, nl, rb, cfg, rq, ps] = await Promise.all(['rapor', 'lkpd/diag', 'lkpd/map', 'lkpd/grp', 'lkpd/nilai', 'lkpd/rub', K.cfg, 'lkpd/req', 'lkpd/pres'].map(p => C().get(p)));
      if (rap === undefined || gr === undefined) throw new Error('net');
      if (cfg && typeof cfg === 'object') { P = cleanP(cfg); L.applyCfg(P); }
      const stu = {}; Object.keys(rap || {}).forEach(id => { const r = rap[id]; if (r && r.n) stu[id] = { id, n: r.n, k: r.k || '' }; });
      Object.keys(dg || {}).forEach(id => { if (dg[id] && typeof dg[id] === 'object') stu[id] = Object.assign(stu[id] || { id, n: dg[id].n, k: dg[id].k || '' }, { d: dg[id] }); });
      const grp = Object.keys(gr || {}).map(id => normG(Object.assign({ id }, gr[id]))).filter(validG);
      grp.forEach(x => Object.keys(x.mem).forEach(id => { if (!stu[id]) stu[id] = { id, n: x.mem[id].n, k: x.k || '' }; }));
      gdata = { stu, map: mp || {}, grp: grp.sort((a, b) => (a.lv + String(a.ts0 || a.ts || 0)).localeCompare(b.lv + String(b.ts0 || b.ts || 0))), nilai: nl || {}, rub: rb || {}, req: rq || {}, pres: ps || {} };
    }
    const effL = s => (s.d && (s.d.ov || s.d.l)) || null;
    const gtabs = [['kel', 'Kelompok'], ['pan', 'Pantau'], ['nil', 'Nilai'], ['pre', 'Presentasi'], ['par', 'Parameter'], ['set', 'Pengaturan'], ['nas', 'Naskah']];
    function vGuru() {
      const nReq = gdata ? Object.values(gdata.req).filter(r => r && r.st === 'baru').length : 0;
      const html = `<div class="lkpd-top lkpd-gtop"><button class="btn sm lkpd-back" id="lkBack">◀</button>${ic('foto_coret', 'lkpd-float', 38)}<div class="lkpd-tt"><b>Panel Guru · LKPD Proyek</b><small>${E(GU().name())} · ruangan ${E(C().room())}${C().online() ? ' · online' : ' · mode lokal'}</small></div><button class="btn sm" id="gRef">↻ Muat data</button><button class="btn sm red" id="gOut">Keluar</button></div>
        <div class="lkpd-tabs g">${gtabs.map(t => `<button class="chip ${t[0] === gtab ? 'on' : ''}" data-gt="${t[0]}">${t[1]}${t[0] === 'kel' && nReq ? ` <u class="lkpd-bd">${nReq}</u>` : ''}</button>`).join('')}</div><div class="lkpd-body lkpd-g" id="gB"><p class="small">Memuat data…</p></div>`;
      return {
        html, bind() {
          $('#lkBack').onclick = () => { view = 'home'; teacher = false; ro = false; loadBase().then(draw); };
          $('#gOut').onclick = () => { GU().logout(); view = 'home'; loadBase().then(draw); };
          $$('[data-gt]').forEach(b => b.onclick = () => { gtab = b.dataset.gt; $$('[data-gt]').forEach(z => z.classList.toggle('on', z === b)); gPaint(); });
          $('#gRef').onclick = () => gReload(); gReload();
        }
      };
    }
    async function gReload() { const b = $('#gB'), y = b ? b.scrollTop : 0; if (b && !gdata) b.innerHTML = '<p class="small">Memuat data…</p>'; try { await loadGuru(); } catch (e) { if (b) b.innerHTML = '<p class="small">Data belum bisa diambil. Periksa koneksi lalu tekan ↻ Muat data.</p>'; return; } gPaint(); const b2 = $('#gB'); if (b2) b2.scrollTop = y; }
    function gPaint() {
      const B = $('#gB'); if (!B || !gdata) return;
      const nReq = Object.values(gdata.req).filter(r => r && r.st === 'baru').length, kb2 = $('[data-gt="kel"]'); if (kb2) kb2.innerHTML = 'Kelompok' + (nReq ? ` <u class="lkpd-bd">${nReq}</u>` : '');
      ({ kel: gKel, pan: gPan, nil: gNil, pre: gPre, par: gPar, set: gSet, nas: gNas }[gtab] || gKel)(B);
    }
    const msg = (t, bad) => toast(t, bad ? 'x' : '');
    const cfgPut = async obj => { const ok = await C().patch(K.cfg, obj); if (ok !== false) P = cleanP(Object.assign({}, P, obj)); L.applyCfg(P); ['a', 'b', 'c'].forEach(k => { L.PRES_MENIT[k] = presMin(P, k); }); return ok !== false; };

    /* ---- hitung ulang setelah parameter / kunci diubah ---- */
    async function recompute() {
      let nd = 0, nn = 0;
      for (const sid of Object.keys(gdata.stu)) {
        const s = gdata.stu[sid]; if (!s.d || !s.d.ans) continue; const r = scoreAns(s.d.ans), l = L.levelDari(r.tot, P);
        if (r.tot !== s.d.s || l !== s.d.l || JSON.stringify(r.per) !== JSON.stringify(s.d.per)) { s.d.s = r.tot; s.d.l = l; s.d.per = r.per; await C().patch(K.diag(sid), { s: r.tot, l, per: r.per }); nd++; }
      }
      for (const x of gdata.grp) {
        const rec = gdata.rub[x.id]; if (!rec || rec.mode === 'angka' || !rec.r) continue; const mem = members(x), nila = {};
        mem.forEach(m => { nila[m.id] = L.nilai(rec.r, (rec.ind || {})[m.id] || {}, P); });
        const s = Math.round(Object.values(nila).reduce((a, b) => a + b, 0) / (mem.length || 1));
        if (s !== rec.s || mem.some(m => (gdata.nilai[m.id] || {}).s !== nila[m.id])) { rec.s = s; await C().patch(K.rub(x.id), { s }); for (const m of mem) { await C().patch(K.nilai(m.id), { s: nila[m.id], ts: now() }); (gdata.nilai[m.id] = gdata.nilai[m.id] || {}).s = nila[m.id]; } nn++; }
      }
      return { nd, nn };
    }

    /* ---- KELOMPOK ---- */
    async function dropMember(sid) {
      const old = gdata.map[sid]; if (old) { await C().del(K.grp(old) + '/mem/' + sid); const og = gdata.grp.find(x => x.id === old); if (og) delete og.mem[sid]; }
      await C().del(K.map(sid)); delete gdata.map[sid];
    }
    async function assign(sid, gidNew) {
      await dropMember(sid); if (!gidNew) return true; const ng = gdata.grp.find(x => x.id === gidNew), s = gdata.stu[sid];
      if (Object.keys(ng.mem).length >= gsz() && !ng.mem[sid]) { if (!confirm('Kelompok sudah penuh (' + gsz() + '). Tetap tambahkan?')) return false; }
      ng.mem[sid] = { n: s.n, o: Object.keys(ng.mem).length }; await C().put(K.grp(gidNew) + '/mem/' + sid, ng.mem[sid]); await C().put(K.map(sid), gidNew); gdata.map[sid] = gidNew; return true;
    }
    async function resetStudent(sid) {
      await dropMember(sid); await C().del(K.diag(sid)); const r = gdata.req[sid]; if (r) { await C().put(K.req(sid), Object.assign({}, r, { st: 'selesai', re: 'Hasil tes direset guru. Silakan kerjakan ulang tes diagnostik.', ts: now() })); }
      delete (gdata.stu[sid] || {}).d;
    }
    function gKel(B) {
      const S0 = Object.values(gdata.stu).sort((a, b) => (a.k + a.n).localeCompare(b.k + b.n)), reqs = Object.keys(gdata.req).filter(id => gdata.req[id] && gdata.req[id].st === 'baru');
      const waiting = S0.filter(s => s.d && !gdata.map[s.id]).length;
      const cap = x => Object.keys(x.mem).length + '/' + gsz();
      const opts = (lvx, cur) => `<option value="">— belum —</option>${gdata.grp.filter(x => !lvx || x.lv === lvx).map(x => `<option value="${x.id}" ${x.id === cur ? 'selected' : ''}>${E(x.nm)} (${cap(x)})</option>`).join('')}`;
      B.innerHTML = `<div class="lkpd-bar"><label class="small">Isi per kelompok <select id="kSz">${[4, 5, 6].map(n => `<option value="${n}" ${gsz() === n ? 'selected' : ''}>${n} orang</option>`).join('')}</select></label>
          <label class="lkpd-cb"><input type="checkbox" id="kAu" ${P.au ? 'checked' : ''}> Tempatkan otomatis setelah siswa selesai tes</label>
          <button class="btn sm green" id="kAuto">⚙ Bentuk otomatis${waiting ? ' (' + waiting + ' siswa)' : ''}</button><button class="btn sm" id="kAdd">+ Kelompok</button><button class="btn sm red" id="kRst">Reset semua</button></div>
        ${reqs.length ? `<div class="lkpd-sec"><h4>📩 Permintaan siswa (${reqs.length})</h4>${reqs.map(id => { const r = gdata.req[id]; return `<div class="lkpd-req"><b>${E(r.n)}</b> <small>${E(r.k || '')} · skor ${r.s == null ? '–' : r.s} · ${when(r.ts)}</small><p>${E(r.m)}</p><button class="btn xs red" data-rr="${id}">Reset tes siswa</button> <button class="btn xs" data-rd="${id}">Tutup + balas</button></div>`; }).join('')}</div>` : ''}
        <div class="lkpd-sec"><h4>Kelompok (${gdata.grp.length})</h4><div class="lkpd-gc">${gdata.grp.map(x => { const full = Object.keys(x.mem).length >= gsz(); return `<div class="lkpd-gcard"><div class="lkpd-gh">${ic(x.lv, '', 26)}<input class="ab-inp" data-rn="${x.id}" value="${E(x.nm)}" maxlength="40"><span class="lkpd-pill ${full ? 'ok' : 'run'}">${cap(x)}${full ? ' penuh' : ''}</span></div><ul class="lkpd-ml">${members(x).map(m => `<li>${E(m.n)} <small>${E((gdata.stu[m.id] || {}).k || '')}</small> <button class="btn xs" data-dm="${m.id}" title="Keluarkan dari kelompok">✕</button></li>`).join('') || '<li class="muted small">Kosong</li>'}</ul><div class="lkpd-tools"><button class="btn xs" data-gq="${x.id}">QR</button><button class="btn xs red" data-gd="${x.id}">Hapus kelompok</button></div></div>`; }).join('') || '<p class="small muted">Belum ada kelompok. Kelompok dibuat otomatis saat siswa selesai tes, atau tekan + Kelompok.</p>'}</div></div>
        <div class="lkpd-sec"><h4>Siswa (${S0.length} · ${S0.filter(s => s.d).length} sudah tes)</h4><div class="lkpd-scroll"><table class="lkpd-tbl"><thead><tr><th>Nama</th><th>Kls</th><th>Skor</th><th>Level</th><th>Kelompok</th><th></th></tr></thead><tbody>${S0.map(s => { const cur = gdata.map[s.id] || '', cg = gdata.grp.find(x => x.id === cur), l = effL(s); return `<tr><td>${E(s.n)}</td><td>${E(s.k)}</td><td>${s.d ? s.d.s : '–'}</td><td><select data-ov="${s.id}" ${s.d ? '' : 'disabled'}><option value="">${s.d ? 'otomatis (' + s.d.l.toUpperCase() + ')' : '— belum tes —'}</option>${['a', 'b', 'c'].map(k => `<option value="${k}" ${s.d && s.d.ov === k ? 'selected' : ''}>${k.toUpperCase()} ${L.LV[k].nama}</option>`).join('')}</select></td><td><select data-as="${s.id}" ${s.d || cur ? '' : 'disabled'}>${opts(l, cur)}</select>${cg && l && cg.lv !== l ? ' <small class="badc">level ≠ kelompok</small>' : ''}</td><td>${s.d || cur ? `<button class="btn xs red" data-rs="${s.id}">Reset</button>` : ''}</td></tr>`; }).join('') || '<tr><td colspan="6" class="small">Belum ada siswa. Siswa muncul setelah mengerjakan tes atau membuka game.</td></tr>'}</tbody></table></div></div>`;
      $('#kSz', B).onchange = async e => { const ok = await cfgPut({ gs: +e.target.value }); msg(ok ? 'Isi kelompok: ' + e.target.value + ' orang (berlaku untuk penempatan berikutnya).' : 'Gagal menyimpan.', !ok); gPaint(); };
      $('#kAu', B).onchange = async e => { await cfgPut({ au: e.target.checked ? 1 : 0 }); msg(e.target.checked ? 'Penempatan otomatis aktif.' : 'Penempatan otomatis dimatikan.'); };
      $('#kAdd', B).onclick = () => { PP.ui.modal(`<h3>Kelompok baru: pilih level</h3><div class="row">${['a', 'b', 'c'].map(k => `<button class="btn" data-nl="${k}">${L.LV[k].abjad} · ${L.LV[k].nama}</button>`).join('')}</div><div class="row end"><button class="btn" data-close>Batal</button></div>`); $$('[data-nl]').forEach(b => b.onclick = async () => { PP.ui.close(); await addGroup(b.dataset.nl); msg('Kelompok dibuat.'); gReload(); }); };
      $('#kAuto', B).onclick = autoForm;
      $('#kRst', B).onclick = () => PP.ui.confirm('Reset SEMUA kelompok dan hasil tes? Semua siswa harus mengerjakan tes diagnostik ulang. Kelompok yang sudah berisi pekerjaan LKPD tetap disimpan (dikosongkan anggotanya); kelompok kosong dihapus.', 'Reset semua', async () => {
        for (const sid of Object.keys(gdata.stu)) { await C().del(K.diag(sid)); await C().del(K.map(sid)); }
        for (const x of gdata.grp) { const has = x.sub || Object.keys(x.v || {}).length || files(x).length; await C().del(K.grp(x.id) + '/mem'); if (!has) await C().del(K.grp(x.id)); }
        sfx('mission'); msg('Semua kelompok direset. Siswa akan diminta mengulang tes.'); gReload();
      });
      $$('[data-rr]', B).forEach(b => b.onclick = () => PP.ui.confirm('Reset tes siswa ini? Ia keluar dari kelompok dan harus tes ulang.', 'Reset', async () => { await resetStudent(b.dataset.rr); msg('Tes siswa direset.'); gReload(); }));
      $$('[data-rd]', B).forEach(b => b.onclick = () => { const r = gdata.req[b.dataset.rd]; PP.ui.modal(`<h3>Balas ${E(r.n)}</h3><textarea class="ab-inp" id="rdT" rows="3" maxlength="200" placeholder="Balasan singkat (opsional)"></textarea><div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="rdOk">Tutup permintaan</button></div>`); $('#rdOk').onclick = async () => { await C().put(K.req(b.dataset.rd), Object.assign({}, r, { st: 'selesai', re: $('#rdT').value.trim() || 'Sudah ditinjau guru.', ts: now() })); PP.ui.close(); gReload(); }; });
      $$('[data-rs]', B).forEach(b => b.onclick = () => PP.ui.confirm('Reset hasil tes dan keanggotaan siswa ini? Ia harus tes ulang.', 'Reset', async () => { await resetStudent(b.dataset.rs); msg('Siswa direset.'); gReload(); }));
      $$('[data-rn]', B).forEach(i => i.onchange = async () => { const v = i.value.trim().slice(0, 40); if (!v) return gPaint(); await C().put(K.grp(i.dataset.rn) + '/nm', v); gdata.grp.find(x => x.id === i.dataset.rn).nm = v; msg('Nama kelompok disimpan.'); });
      $$('[data-dm]', B).forEach(b => b.onclick = async () => { await dropMember(b.dataset.dm); msg('Siswa dikeluarkan dari kelompok.'); gPaint(); });
      $$('[data-gq]', B).forEach(b => b.onclick = () => { const keep = g; g = gdata.grp.find(x => x.id === b.dataset.gq); teacher = true; qrModal(); g = keep; });
      $$('[data-gd]', B).forEach(b => b.onclick = () => PP.ui.confirm('Hapus kelompok ini BESERTA seluruh isi LKPD-nya? Tidak bisa dibatalkan.', 'Hapus', async () => { const x = gdata.grp.find(z => z.id === b.dataset.gd); for (const id of Object.keys(x.mem)) await C().del(K.map(id)); await C().del(K.grp(x.id)); await C().del('lkpd/blob/' + x.id); await C().del(K.rub(x.id)); msg('Kelompok dihapus.'); gReload(); }));
      $$('[data-ov]', B).forEach(sl => sl.onchange = async () => { const s = gdata.stu[sl.dataset.ov]; if (sl.value) s.d.ov = sl.value; else delete s.d.ov; await C().patch(K.diag(s.id), { ov: sl.value || null }); msg('Level siswa diatur.'); gPaint(); });
      $$('[data-as]', B).forEach(sl => sl.onchange = async () => { const ok = await assign(sl.dataset.as, sl.value || null); if (ok) msg('Kelompok diperbarui.'); gPaint(); });
    }
    async function addGroup(lvx) {
      const n = gdata.grp.filter(x => x.lv === lvx).length + 1, id = 'g' + rid(), x = fresh(lvx, id, L.nm(lvx, n)); x.ts0 = now(); gdata.grp.push(x); await C().put(K.grp(id), x); return x;
    }
    async function autoForm() {
      const todo = Object.values(gdata.stu).filter(s => s.d && !gdata.map[s.id]);
      if (!todo.length) return msg('Semua siswa yang sudah tes sudah punya kelompok.');
      toast('Membentuk kelompok…'); let n = 0;
      for (const s of todo.sort((a, b) => (a.k + a.n).localeCompare(b.k + b.n))) { const id = await placeStudent(s.id, s.n, s.k, effL(s)); if (id) n++; }
      sfx('mission'); msg(n + ' siswa ditempatkan.'); gReload();
    }

    /* ---- PANTAU ---- */
    function gPan(B) {
      const gs = gdata.grp, sts = gs.map(x => statusG(x, P)), cnt = k => sts.filter(s => s[1] === k).length;
      const rows = gs.map((x, i) => { const ph = phases(x, P), st = sts[i], dl = deadline(x, P); return `<tr><td>${ic(x.lv, '', 22)} <b>${E(x.nm)}</b></td><td>${Object.keys(x.mem).length}</td><td><span class="lkpd-pill ${st[1]}">${st[0]}</span></td><td class="lkpd-dts">${[1, 2, 3, 4, 5, 6].map(k => `<i class="${ph[k] ? 'on' : ''}" title="Fase ${k}"></i>`).join('')}</td><td>${x.sub ? when(x.sub) : (dl ? 'sisa ' + mmss(dl - now()) : '–')}</td><td>${files(x).length}</td><td class="small">${when(x.ts)}</td><td><button class="btn xs blue" data-d="${x.id}">Lihat hasil</button></td></tr>`; }).join('');
      B.innerHTML = `<div class="lkpd-stats"><div><b>${gs.length}</b><small>kelompok</small></div><div><b>${cnt('idle')}</b><small>belum mulai</small></div><div><b>${cnt('run')}</b><small>mengerjakan</small></div><div><b>${gs.filter(x => x.sub).length}</b><small>terkirim</small></div><div><b>${cnt('ok')}</b><small>terkunci</small></div></div>
        <p class="small muted">Pantau menampilkan kemajuan, jawaban, bukti foto, dan riwayat aktivitas setiap kelompok. Tekan <b>Lihat hasil</b> untuk membaca isi LKPD yang dikirim siswa.</p>
        <div class="lkpd-scroll"><table class="lkpd-tbl"><thead><tr><th>Kelompok</th><th>Ang.</th><th>Status</th><th>Fase 1–6</th><th>Kirim / sisa waktu</th><th>Berkas</th><th>Update</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="8" class="small">Belum ada kelompok.</td></tr>'}</tbody></table></div>`;
      $$('[data-d]', B).forEach(b => b.onclick = () => gDetail(gs.find(z => z.id === b.dataset.d)));
    }
    async function gDetail(x) {
      const fresh0 = await C().get(K.grp(x.id)); if (validG(fresh0)) { x = normG(Object.assign({ id: x.id }, fresh0)); }
      PP.ui.modal(`<h3>${E(x.nm)}</h3><div class="lkpd-tools"><button class="btn xs gold" data-a="+10">+10 menit & buka kunci</button>${x.sub ? '<button class="btn xs" data-a="lock">Kunci sekarang</button><button class="btn xs red" data-a="un">Batalkan pengiriman</button>' : ''}<button class="btn xs" data-a="open">Buka tampilan LKPD</button></div><div class="lkpd-mdv" id="gdB">${histHtml(x, true)}</div><div class="row end"><button class="btn green" data-close>Tutup</button></div>`, { cls: 'lkpd-modal lkpd-wide' });
      fillGallery($('#gdB'), x);
      $$('[data-a]').forEach(b => b.onclick = async () => {
        const a = b.dataset.a;
        if (a === '+10') { const until = now() + 10 * 60000; await C().patch(K.grp(x.id), x.sub ? { un: until, auto: null, fin: null } : { ext: (+x.ext || 0) + 10 }); msg(x.sub ? 'Kelompok boleh mengedit 10 menit.' : 'Waktu ditambah 10 menit.'); }
        else if (a === 'lock') { await C().patch(K.grp(x.id), { fin: now(), un: 0 }); msg('Dikunci.'); }
        else if (a === 'un') { await C().patch(K.grp(x.id), { sub: null, auto: null, fin: null, un: null }); msg('Pengiriman dibatalkan; kelompok dapat mengedit lagi.'); }
        else if (a === 'open') { PP.ui.close(); teacher = true; ro = true; openLkpd(x.lv, true, x, true); return; }
        PP.ui.close(); gReload();
      });
    }

    /* ---- NILAI ---- */
    function gNil(B) {
      if (!gdata.grp.length) { B.innerHTML = '<p class="small">Belum ada kelompok.</p>'; return; }
      gsel = gsel && gdata.grp.find(x => x.id === gsel) ? gsel : gdata.grp[0].id; const x = gdata.grp.find(z => z.id === gsel), saved = gdata.rub[x.id] || {}, mem = members(x);
      let mode = saved.mode || 'skala'; const r = Object.assign({}, saved.r), ind = Object.assign({}, saved.ind), nm0 = Object.assign({}, saved.nm);
      const ck = L.check(x.lv, x.v, x.sol, P), sug = L.sarankan(ck.f);
      const sel = (name, cur) => `<select data-n="${name}">${[0, 1, 2, 3, 4].map(v => `<option value="${v}" ${(+cur || 0) === v ? 'selected' : ''}>${v ? v + ' · ' + L.SKALA[v - 1] : '—'}</option>`).join('')}</select>`;
      const paint = () => {
        B.innerHTML = `<div class="lkpd-bar"><label class="small">Kelompok <select id="nG">${gdata.grp.map(z => `<option value="${z.id}" ${z.id === gsel ? 'selected' : ''}>${E(z.nm)}${gdata.rub[z.id] ? ' ✓' : ''}</option>`).join('')}</select></label>
          <div class="lkpd-seg"><button class="chip ${mode === 'skala' ? 'on' : ''}" data-m="skala">Skala rubrik 1–4</button><button class="chip ${mode === 'angka' ? 'on' : ''}" data-m="angka">Nilai angka 0–100</button></div></div>
          <div class="lkpd-info">${x.sub ? 'LKPD terkirim ' + when(x.sub) : 'LKPD belum dikirim'} · pemeriksaan otomatis: ${ck.ready ? Object.keys(ck.f).filter(k => ck.f[k] !== null).map(k => k + (ck.f[k] ? ' ✓' : ' ✗')).join(' · ') : 'belum ada data'}${sug ? ` · <button class="btn xs" id="nSug">Isi ketepatan = ${sug} (saran aplikasi)</button>` : ''} <button class="btn xs" id="nDet">Lihat isi LKPD</button></div>
          ${mode === 'skala' ? `<div class="lkpd-scroll"><table class="lkpd-tbl"><thead><tr><th>Aspek (kelompok)</th><th>Skala</th></tr></thead><tbody>${L.RUBRIK.map(a => `<tr><td title="${E(a.d.join(' | '))}"><b>${E(a.n)}</b>${a.k === 'hit' ? `<br><small>${E(L.RUBRIK_KHUSUS[x.lv])}</small>` : ''}</td><td>${sel('r.' + a.k, r[a.k])}</td></tr>`).join('')}${mem.map(m => `<tr><td>${E(m.n)}<br><small>nilai individu (1–4)</small></td><td class="lkpd-ind">${L.INDIVIDU.map(i => `<label>${E(i.n)}${sel('i.' + m.id + '.' + i.k, (ind[m.id] || {})[i.k])}</label>`).join('')}</td></tr>`).join('')}</tbody></table></div>`
          : `<div class="lkpd-scroll"><table class="lkpd-tbl"><thead><tr><th>Siswa</th><th>Nilai 0–100</th></tr></thead><tbody>${mem.map(m => `<tr><td>${E(m.n)}</td><td><input class="ab-inp" inputmode="numeric" data-ang="${m.id}" maxlength="3" value="${nm0[m.id] != null ? nm0[m.id] : ''}" placeholder="0–100"></td></tr>`).join('')}</tbody></table></div>`}
          <label class="small">Umpan balik untuk kelompok<textarea class="ab-inp" id="nFb" rows="2" maxlength="500">${E(saved.fb || '')}</textarea></label>
          <div class="lkpd-bar"><span class="small" id="nRes"></span>${gdata.rub[x.id] ? '<button class="btn sm red" id="nDel">Hapus nilai</button>' : ''}<button class="btn green" id="nSv">💾 Simpan & kirim ke siswa</button></div>`;
        const calc = () => { const rr = {}; L.RUBRIK.forEach(a => rr[a.k] = +($('[data-n="r.' + a.k + '"]', B) || {}).value || 0); const per = {}; mem.forEach(m => { per[m.id] = {}; L.INDIVIDU.forEach(i => per[m.id][i.k] = +($('[data-n="i.' + m.id + '.' + i.k + '"]', B) || {}).value || 0); }); return { rr, per }; };
        const final = () => { const out = {}; if (mode === 'skala') { const c = calc(); mem.forEach(m => { out[m.id] = L.nilai(c.rr, c.per[m.id], P); }); } else $$('[data-ang]', B).forEach(i => { const v = Math.round(L.num(i.value)); out[i.dataset.ang] = isFinite(v) ? Math.max(0, Math.min(100, v)) : null; }); return out; };
        const upd = () => { const f = final(); $('#nRes', B).innerHTML = 'Nilai akhir → ' + mem.map(m => `${E(m.n.split(' ')[0])}: <b>${f[m.id] == null ? '–' : f[m.id]}</b>`).join(' · '); }; upd();
        $$('select[data-n], [data-ang]', B).forEach(s => { s.onchange = upd; s.oninput = upd; });
        $$('[data-m]', B).forEach(b => b.onclick = () => { if (mode === 'skala') { const f = final(); Object.keys(f).forEach(k => { nm0[k] = f[k]; }); const c = calc(); Object.assign(r, c.rr); Object.assign(ind, c.per); } mode = b.dataset.m; paint(); });
        $('#nG', B).onchange = e => { gsel = e.target.value; gPaint(); };
        const sg = $('#nSug', B); if (sg) sg.onclick = () => { $('[data-n="r.hit"]', B).value = sug; upd(); };
        $('#nDet', B).onclick = () => gDetail(x);
        const dl = $('#nDel', B); if (dl) dl.onclick = () => PP.ui.confirm('Hapus nilai kelompok ini? Nilai siswa ikut dihapus.', 'Hapus', async () => { await C().del(K.rub(x.id)); for (const m of mem) await C().del(K.nilai(m.id)); delete gdata.rub[x.id]; msg('Nilai dihapus.'); gPaint(); });
        $('#nSv', B).onclick = async () => {
          const f = final(), fb = $('#nFb', B).value.trim().slice(0, 500), rec = { mode, fb, ts: now(), by: GU().name() };
          if (mode === 'skala') { const c = calc(); if (L.RUBRIK.some(a => !c.rr[a.k])) return msg('Lengkapi semua aspek rubrik.', 1); rec.r = c.rr; rec.ind = c.per; } else { if (mem.some(m => f[m.id] == null)) return msg('Isi nilai angka 0–100 untuk semua siswa.', 1); rec.nm = f; }
          rec.s = Math.round(Object.values(f).reduce((a, b) => a + b, 0) / (mem.length || 1));
          const ok = await C().put(K.rub(x.id), rec); for (const m of mem) await C().put(K.nilai(m.id), { n: m.n, k: (gdata.stu[m.id] || {}).k || x.k || '', l: x.lv, s: f[m.id], g: x.nm, fb, ts: now() });
          gdata.rub[x.id] = rec; msg(ok ? 'Nilai tersimpan. Siswa langsung melihatnya saat membuka LKPD.' : 'Gagal menyimpan. Coba lagi.', !ok); if (ok) { sfx('star'); gPaint(); }
        };
      };
      paint();
    }

    /* ---- PRESENTASI (guru) ---- */
const presDurHtml = () => `<div class="lkpd-sec"><h4>⏱ Durasi presentasi</h4><p class="small muted">Lama waktu tampil tiap kelompok (menit; boleh desimal, mis. 2,5). Hitung mundur tampil di layar presentasi dan siswa tahu sisa waktunya.</p><div class="lkpd-tools">${['a', 'b', 'c'].map(k => `<label class="small">Level ${k.toUpperCase()} · ${L.LV[k].nama}<input class="ab-inp" data-pm="${k}" inputmode="decimal" size="5" value="${String(presMin(P, k)).replace('.', ',')}"></label>`).join('')}<button class="btn sm green" id="pmSave">💾 Simpan durasi</button></div></div>`;
    const bindPresDur = B => { const b = $('#pmSave', B); if (!b) return; b.onclick = async () => { const o = {}; for (const i of $$('[data-pm]', B)) { const v = L.num(i.value); if (!(v >= .5 && v <= 60)) return msg('Durasi harus antara 0,5 dan 60 menit.', 1); o['p' + i.dataset.pm.toUpperCase()] = Math.round(v * 10) / 10; } const ok = await cfgPut(o); msg(ok ? 'Durasi presentasi tersimpan; berlaku untuk semua siswa.' : 'Gagal menyimpan.', !ok); }; };
    function gPre(B) {
      B.innerHTML = `${presDurHtml()}<p class="small muted">Lihat, tayangkan, sembunyikan, atau hapus presentasi tiap kelompok. Presentasi yang disembunyikan tidak dapat ditayangkan siswa.</p><div class="lkpd-scroll"><table class="lkpd-tbl"><thead><tr><th>Kelompok</th><th>Status</th><th></th></tr></thead><tbody>${gdata.grp.map(x => { const p = gdata.pres[x.id] || {}; return `<tr><td>${ic(x.lv, '', 22)} <b>${E(x.nm)}</b></td><td>${p.hide ? '<span class="lkpd-pill bad">disembunyikan</span>' : p.cur ? '<span class="lkpd-pill ok">ada versi</span>' : '<span class="lkpd-pill idle">belum ada (otomatis dari LKPD)</span>'}</td><td><button class="btn xs gold" data-pv="${x.id}">▶ Lihat / tayangkan</button> <button class="btn xs" data-ph="${x.id}">${p.hide ? 'Tampilkan lagi' : 'Sembunyikan'}</button></td></tr>`; }).join('') || '<tr><td colspan="3" class="small">Belum ada kelompok.</td></tr>'}</tbody></table></div>`;
      bindPresDur(B);
      $$('[data-pv]', B).forEach(b => b.onclick = () => { teacher = true; ro = true; presHome(gdata.grp.find(z => z.id === b.dataset.pv)); });
      $$('[data-ph]', B).forEach(b => b.onclick = async () => { const p = gdata.pres[b.dataset.ph] || {}; await C().put(K.pres(b.dataset.ph), Object.assign({}, p, { hide: p.hide ? 0 : 1, ts: now() })); msg(p.hide ? 'Presentasi ditampilkan lagi.' : 'Presentasi disembunyikan.'); gReload(); });
    }

    /* ---- PARAMETER ---- */
    function gPar(B) {
      B.innerHTML = `<p class="small muted">Semua angka acuan ${L.VERIF}. Isi sesuai kondisi sekolah. Setelah disimpan, sistem menghitung ulang skor tes diagnostik dan nilai yang sudah ada. Pemeriksaan jawaban siswa memakai toleransi (contoh: acuan 3,253 dan siswa 3,256 tetap benar bila toleransi ≥ 0,003).</p>
        <div class="lkpd-prm">${L.PARAM_INFO.map(p => `<div class="lkpd-pr"><div><b>${E(p[1])}</b><small>${E(p[2])}</small><details><summary>Asal-usul & cara pakai</summary><p class="small">${E(p[3] || '')}</p></details></div><input class="ab-inp" data-p="${p[0]}" inputmode="decimal" value="${E(String(P[p[0]]).replace('.', ','))}" aria-label="${E(p[1])}"></div>`).join('')}</div>
        <div class="lkpd-sec"><h4>Uji hitung (untuk memeriksa angka acuan)</h4><div class="lkpd-tools"><label class="small">Level <select id="uL">${['a', 'b', 'c'].map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join('')}</select></label><span id="uIn"></span></div><ol class="small" id="uOut"></ol></div>
        <div class="lkpd-bar"><button class="btn" id="pRs">Kembalikan bawaan</button><button class="btn green" id="pSv">💾 Simpan parameter</button></div>`;
      const cur = () => { const o = {}; $$('[data-p]', B).forEach(i => { const v = L.num(i.value); if (isFinite(v)) o[i.dataset.p] = v; }); return o; };
      const uin = () => { const k = $('#uL', B).value, f = { a: [['j', 'j']], b: [['p', 'p'], ['l', 'l']], c: [['h', 'h_target']] }[k]; $('#uIn', B).innerHTML = f.map(z => `<input class="ab-inp" data-u="${z[0]}" placeholder="${z[1]}" inputmode="decimal" size="6" value="${{ j: 1.2, p: 40, l: 25, h: 3.2 }[z[0]]}">`).join(' '); $$('[data-u]', B).forEach(i => i.oninput = uout); uout(); };
      const uout = () => { const k = $('#uL', B).value, v = {}; $$('[data-u]', B).forEach(i => { v[i.dataset.u] = i.value; }); $('#uOut', B).innerHTML = L.derive(k, v, Object.assign({}, P, cur())).map(z => `<li>${E(z)}</li>`).join('') || '<li>Isi angka uji.</li>'; };
      $('#uL', B).onchange = uin; $$('[data-p]', B).forEach(i => i.oninput = uout); uin();
      $('#pSv', B).onclick = async () => { const o = cur(); if (!(o.t > 0 && o.c > o.b && o.b > 0 && o.tol >= 0 && o.thA >= 0 && o.thB >= o.thA && o.thB <= 10)) return msg('Periksa nilai: c harus lebih besar dari b, ambang A ≤ B ≤ 10, toleransi ≥ 0.', 1);
        const ok = await cfgPut(o); if (!ok) return msg('Gagal menyimpan.', 1); toast('Menghitung ulang data…'); const r = await recompute(); sfx('star'); msg(`Parameter tersimpan. Disinkronkan: ${r.nd} hasil tes, ${r.nn} nilai.`); };
      $('#pRs', B).onclick = () => PP.ui.confirm('Kembalikan semua parameter ke angka bawaan?', 'Kembalikan', async () => { const o = {}; L.PARAM_INFO.forEach(p => { o[p[0]] = L.DEF[p[0]]; }); await cfgPut(o); await recompute(); msg('Parameter dikembalikan.'); gPaint(); });
    }

    /* ---- PENGATURAN ---- */
    function gSet(B) {
      const lv = ['A', 'B', 'C'];
      B.innerHTML = `${presDurHtml()}<div class="lkpd-sec"><h4>⏱ Batas waktu pengerjaan</h4><p class="small muted">Hitungan dimulai saat kelompok pertama kali membuka LKPD. Bila waktu habis, isi LKPD otomatis dikirim ke guru dan dikunci. Isi 0 = tanpa batas.</p><div class="lkpd-tools">${lv.map(k => `<label class="small">Level ${k} (menit)<input class="ab-inp" data-s="d${k}" inputmode="numeric" size="4" value="${+P['d' + k] || 0}"></label>`).join('')}<label class="small">Waktu edit setelah kirim (menit)<input class="ab-inp" data-s="ew" inputmode="numeric" size="4" value="${+P.ew || 5}"></label></div></div>
        <div class="lkpd-sec"><h4>🧮 Kalkulator Alat Bantu per kelompok</h4><p class="small muted">Kalkulator hanya muncul di LKPD kelompok yang dicentang. Level Mahir bisa dimatikan agar lebih menantang.</p><div class="lkpd-tools">${lv.map(k => `<label class="lkpd-cb"><input type="checkbox" data-k="k${k}" ${+P['k' + k] === 0 ? '' : 'checked'}> Level ${k} · ${LVN(k.toLowerCase())}</label>`).join('')}<button class="btn xs" id="sAll">Aktifkan semua</button></div></div>
        <div class="lkpd-sec"><h4>👥 Kelompok</h4><div class="lkpd-tools"><label class="small">Isi per kelompok<select data-s="gs">${[4, 5, 6].map(n => `<option value="${n}" ${gsz() === n ? 'selected' : ''}>${n} orang</option>`).join('')}</select></label><label class="lkpd-cb"><input type="checkbox" data-k="au" ${P.au ? 'checked' : ''}> Penempatan otomatis setelah tes</label></div></div>
        <div class="lkpd-bar"><button class="btn green" id="sSv">💾 Simpan pengaturan</button></div>
        <div class="lkpd-sec"><h4>🔑 Ganti kode (PIN) Panel Guru</h4><p class="small muted">PIN baru langsung berlaku di ruangan ini. Siswa tidak melihat panel ini.</p><div class="lkpd-tools"><input class="ab-inp" id="pO" type="password" inputmode="numeric" maxlength="6" placeholder="PIN lama"><input class="ab-inp" id="pN" type="password" inputmode="numeric" maxlength="6" placeholder="PIN baru (4–6 angka)"><input class="ab-inp" id="pN2" type="password" inputmode="numeric" maxlength="6" placeholder="Ulangi PIN baru"><button class="btn blue" id="pCh">Ganti PIN</button></div></div>`;
      bindPresDur(B);
      $('#sAll', B).onclick = () => { $$('[data-k^="k"]', B).forEach(i => { i.checked = true; }); };
      $('#sSv', B).onclick = async () => { const o = {}; $$('[data-s]', B).forEach(i => { o[i.dataset.s] = Math.max(0, Math.round(L.num(i.value)) || 0); }); if (!o.ew) o.ew = 5; $$('[data-k]', B).forEach(i => { o[i.dataset.k] = i.checked ? 1 : 0; }); o.gs = Math.max(4, Math.min(6, o.gs || 5));
        const ok = await cfgPut(o); msg(ok ? 'Pengaturan tersimpan dan berlaku untuk semua siswa.' : 'Gagal menyimpan.', !ok); };
      $('#pCh', B).onclick = async () => { const a = $('#pO', B).value.trim(), b = $('#pN', B).value.trim(), c = $('#pN2', B).value.trim(); if (b !== c) return msg('PIN baru dan ulangannya tidak sama.', 1); const e = await GU().changePin(a, b); if (e) return msg(e, 1); ['#pO', '#pN', '#pN2'].forEach(s => { $(s, B).value = ''; }); sfx('star'); msg('PIN guru diganti dan tersimpan.'); };
    }

    /* ---- NASKAH, CETAK, EDITOR ---- */
    function gNas(B) {
      B.innerHTML = `<div class="lkpd-sec"><h4>🖨 Naskah LKPD</h4><label class="small">Level <select id="nL">${['a', 'b', 'c'].map(k => `<option value="${k}">${k.toUpperCase()} · ${L.LV[k].nama}</option>`).join('')}</select></label>
        <div class="lkpd-tools"><button class="btn sm blue" data-n="print">🖨 Cetak LKPD kosong</button><button class="btn sm" data-n="printg">🖨 Cetak LKPD kelompok…</button><button class="btn sm green" data-n="md">Salin Markdown</button></div></div>
        <div class="lkpd-sec"><h4>✎ Lampiran yang bisa diedit</h4><div class="lkpd-tools"><button class="btn sm" data-n="map">Pemetaan kognitif</button><button class="btn sm" data-n="diag">Diagnostik + kunci</button><button class="btn sm" data-n="rub">Rubrik</button></div><p class="small muted">Setiap perubahan disimpan ke server dan langsung dipakai semua siswa. Mengubah kunci diagnostik otomatis menghitung ulang skor siswa.</p></div>`;
      const lvx = () => $('#nL', B).value;
      $('[data-n=print]', B).onclick = () => printHtml(mdHtml(L.markdown(lvx(), null, P)), 'LKPD kosong ' + lvx().toUpperCase());
      $('[data-n=printg]', B).onclick = () => { PP.ui.modal(`<h3>Pilih kelompok</h3><div class="lkpd-pick">${gdata.grp.map(x => `<button class="btn" data-x="${x.id}">${E(x.nm)}</button>`).join('') || '<p class="small">Belum ada kelompok.</p>'}</div><div class="row end"><button class="btn" data-close>Tutup</button></div>`); $$('[data-x]').forEach(b => b.onclick = async () => { const base = gdata.grp.find(z => z.id === b.dataset.x), f = await C().get(K.grp(base.id)), x = validG(f) ? normG(Object.assign({ id: base.id }, f)) : base; PP.ui.close(); printHtml(mdHtml(L.markdown(x.lv, x, P)), x.nm); }); };
      $('[data-n=md]', B).onclick = () => copyMd(L.markdown(lvx(), null, P));
      const show = (title, t, edit) => { PP.ui.modal(`<h3>${title}</h3><div class="lkpd-mdv">${mdHtml(t)}</div><div class="row end"><button class="btn sm" id="mC">Salin Markdown</button><button class="btn sm blue" id="mP">Cetak</button><button class="btn sm gold" id="mE">✎ Edit</button><button class="btn green" data-close>Tutup</button></div>`, { cls: 'lkpd-modal' }); $('#mC').onclick = () => copyMd(t); $('#mP').onclick = () => printHtml(mdHtml(t), title); $('#mE').onclick = () => { PP.ui.close(); edit(); }; };
      $('[data-n=map]', B).onclick = () => show('Pemetaan kognitif', L.markdownPemetaan(), edPemetaan);
      $('[data-n=diag]', B).onclick = () => show('Diagnostik + kunci', L.markdownPetaDiag(P), edDiag);
      $('[data-n=rub]', B).onclick = () => show('Rubrik', L.markdownRubrik(P), edRubrik);
    }
    const inp = (v, a) => `<input class="ab-inp" ${a || ''} value="${E(v == null ? '' : v)}">`;
    function edPemetaan() {
      const p = L.PEMETAAN; let rows = p.baris.map(r => r.slice());
      const paint = () => { PP.ui.modal(`<h3>Edit pemetaan kognitif</h3><div class="lkpd-scroll lkpd-edt"><table class="lkpd-tbl"><thead><tr>${p.kepala.map((h, i) => `<th>${inp(h, 'data-h="' + i + '"')}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map((r, ri) => `<tr>${r.map((c, ci) => `<td><textarea class="ab-inp" rows="2" data-c="${ri}.${ci}">${E(c)}</textarea></td>`).join('')}<td><button class="btn xs red" data-rd="${ri}">✕</button></td></tr>`).join('')}</tbody></table></div><label class="small">Mengapa adil dan terukur<textarea class="ab-inp" id="pmA" rows="3">${E(p.alasan)}</textarea></label><div class="row end"><button class="btn xs" id="pmAdd">+ Baris</button><button class="btn xs red" id="pmRs">Bawaan</button><button class="btn" data-close>Batal</button><button class="btn green" id="pmSv">💾 Simpan</button></div>`, { cls: 'lkpd-modal lkpd-wide' });
        const sync = () => { $$('[data-c]').forEach(t => { const [a, b] = t.dataset.c.split('.'); rows[+a][+b] = t.value; }); $$('[data-h]').forEach(t => { p.kepala[+t.dataset.h] = t.value; }); p.alasan = $('#pmA').value; };
        $('#pmAdd').onclick = () => { sync(); rows.push(p.kepala.map(() => '')); paint(); };
        $$('[data-rd]').forEach(b => b.onclick = () => { sync(); rows.splice(+b.dataset.rd, 1); paint(); });
        $('#pmRs').onclick = async () => { await C().del(K.cfg + '/pm'); delete P.pm; L.applyCfg(P); PP.ui.close(); msg('Dikembalikan ke bawaan.'); };
        $('#pmSv').onclick = async () => { sync(); const ok = await C().put(K.cfg + '/pm', { kepala: objOf(p.kepala), baris: objOf(rows.map(r => objOf(r, 'c')), 'r'), alasan: p.alasan }); P.pm = { kepala: p.kepala, baris: rows, alasan: p.alasan }; L.applyCfg(P); PP.ui.close(); msg(ok ? 'Pemetaan tersimpan dan dibaca semua siswa.' : 'Gagal menyimpan.', !ok); };
      }; paint();
    }
    function edDiag() {
      const D = L.DIAG.map(q => ({ id: q.id, c: q.c, t: q.t, p: q.p.map(x => ({ l: x.l, k: x.k, a: x.a, tol: x.tol, o: x.o ? x.o.slice() : null, kunci: x.kunci })) }));
      PP.ui.modal(`<h3>Edit diagnostik + kunci</h3><p class="small muted">Ubah teks soal, kunci jawaban, dan toleransi angka. Pilihan ganda: satu pilihan per baris. Setelah disimpan skor semua siswa dihitung ulang.</p><div class="lkpd-scroll lkpd-edt">${D.map((q, qi) => `<div class="lkpd-eq"><b>Soal ${q.id}</b>${inp(q.c, `data-q="${qi}.c" placeholder="Kompetensi"`)}<textarea class="ab-inp" rows="2" data-q="${qi}.t">${E(q.t)}</textarea>${q.p.map((x, pi) => `<div class="lkpd-ep"><label class="small">Bagian ${String.fromCharCode(97 + pi)}${inp(x.l, `data-q="${qi}.p.${pi}.l"`)}</label>${x.k === 'n' ? `<label class="small">Kunci (angka)${inp(String(x.a).replace('.', ','), `data-q="${qi}.p.${pi}.a" inputmode="decimal" size="8"`)}</label><label class="small">Toleransi ±${inp(String(x.tol).replace('.', ','), `data-q="${qi}.p.${pi}.tol" inputmode="decimal" size="6"`)}</label>` : `<label class="small">Pilihan (satu per baris)<textarea class="ab-inp" rows="3" data-q="${qi}.p.${pi}.o">${E(x.o.join('\n'))}</textarea></label><label class="small">Kunci (harus sama dengan salah satu pilihan)${inp(x.a, `data-q="${qi}.p.${pi}.a"`)}</label>`}<label class="small">Keterangan kunci${inp(x.kunci, `data-q="${qi}.p.${pi}.kunci"`)}</label></div>`).join('')}</div>`).join('')}</div><div class="row end"><button class="btn xs red" id="dgRs">Bawaan</button><button class="btn" data-close>Batal</button><button class="btn green" id="dgSv">💾 Simpan & hitung ulang</button></div>`, { cls: 'lkpd-modal lkpd-wide' });
      $('#dgRs').onclick = () => PP.ui.confirm('Kembalikan diagnostik ke soal dan kunci bawaan?', 'Kembalikan', async () => { await C().del(K.cfg + '/dg'); delete P.dg; L.applyCfg(P); const r = await recompute(); PP.ui.close(); msg('Dikembalikan. ' + r.nd + ' hasil tes dihitung ulang.'); gReload(); });
      $('#dgSv').onclick = async () => {
        $$('[data-q]').forEach(el => { const k = el.dataset.q.split('.'), q = D[+k[0]]; if (k[1] === 'c' || k[1] === 't') q[k[1]] = el.value; else { const x = q.p[+k[2]], f = k[3]; if (f === 'o') x.o = el.value.split('\n').map(s => s.trim()).filter(Boolean); else x[f] = el.value; } });
        for (const q of D) for (const x of q.p) { if (x.k === 'n') { const a = L.num(x.a), t = L.num(x.tol); if (!isFinite(a)) return msg('Kunci angka soal ' + q.id + ' tidak valid.', 1); x.a = a; x.tol = isFinite(t) && t >= 0 ? t : .05; } else if (!x.o || x.o.length < 2 || x.o.indexOf(x.a) < 0) return msg('Soal ' + q.id + ': kunci harus sama dengan salah satu pilihan.', 1); }
        const dg = {}; D.forEach(q => { dg[q.id] = { c: q.c, t: q.t, p: Object.fromEntries(q.p.map((x, i) => [i, Object.assign({ l: x.l, a: x.a, kunci: x.kunci }, x.k === 'n' ? { tol: x.tol } : { o: objOf(x.o, 'o') })])) }; });
        const ok = await C().put(K.cfg + '/dg', dg); P.dg = dg; L.applyCfg(P); const r = await recompute(); PP.ui.close(); sfx('star'); msg(ok ? `Diagnostik tersimpan. ${r.nd} hasil tes siswa dihitung ulang.` : 'Gagal menyimpan.', !ok); gReload();
      };
    }
    function edRubrik() {
      PP.ui.modal(`<h3>Edit rubrik</h3><div class="lkpd-scroll lkpd-edt">${L.RUBRIK.map(a => `<div class="lkpd-eq"><b>${E(a.k)}</b>${inp(a.n, `data-r="${a.k}.n"`)}${a.d.map((d, i) => `<label class="small">Skala ${i + 1}<textarea class="ab-inp" rows="2" data-r="${a.k}.d.${i}">${E(d)}</textarea></label>`).join('')}</div>`).join('')}<div class="lkpd-eq"><b>Ketepatan khusus per level</b>${['a', 'b', 'c'].map(k => `<label class="small">Level ${k.toUpperCase()}<textarea class="ab-inp" rows="2" data-r="rk.${k}">${E(L.RUBRIK_KHUSUS[k])}</textarea></label>`).join('')}</div></div><div class="row end"><button class="btn xs red" id="rbRs">Bawaan</button><button class="btn" data-close>Batal</button><button class="btn green" id="rbSv">💾 Simpan</button></div>`, { cls: 'lkpd-modal lkpd-wide' });
      $('#rbRs').onclick = async () => { await C().del(K.cfg + '/rb'); await C().del(K.cfg + '/rk'); delete P.rb; delete P.rk; L.applyCfg(P); PP.ui.close(); msg('Rubrik dikembalikan.'); };
      $('#rbSv').onclick = async () => { const rb = {}, rk = {}; L.RUBRIK.forEach(a => { rb[a.k] = { n: a.n, d: {} }; }); $$('[data-r]').forEach(el => { const k = el.dataset.r.split('.'); if (k[0] === 'rk') rk[k[1]] = el.value; else if (k[1] === 'n') rb[k[0]].n = el.value; else rb[k[0]].d['d' + k[2]] = el.value; });
        const ok1 = await C().put(K.cfg + '/rb', rb), ok2 = await C().put(K.cfg + '/rk', rk); P.rb = rb; P.rk = rk; L.applyCfg(P); PP.ui.close(); msg(ok1 && ok2 ? 'Rubrik tersimpan dan dipakai di halaman Nilai.' : 'Gagal menyimpan.', !(ok1 && ok2)); };
    }
    /* markdown -> HTML sederhana */
    function mdHtml(md) {
      const inl = s => E(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>'); const out = []; let tb = null;
      const closeAll = () => { if (tb) { out.push('</tbody></table>'); tb = null; } };
      md.split('\n').forEach(ln => {
        if (/^\|/.test(ln)) { const c = ln.replace(/^\||\|$/g, '').split('|').map(x => x.trim()); if (c.every(x => /^-+$/.test(x))) return; if (!tb) { closeAll(); out.push('<table class="lkpd-pt"><thead><tr>' + c.map(x => `<th>${inl(x)}</th>`).join('') + '</tr></thead><tbody>'); tb = 1; } else out.push('<tr>' + c.map(x => `<td>${inl(x)}</td>`).join('') + '</tr>'); return; }
        closeAll(); let m;
        if ((m = ln.match(/^(#{1,3}) (.*)/))) out.push(`<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`);
        else if ((m = ln.match(/^> (.*)/))) out.push(`<blockquote>${inl(m[1])}</blockquote>`);
        else if (/^\d+\. /.test(ln)) out.push(`<p class="li">${inl(ln)}</p>`);
        else if ((m = ln.match(/^- (.*)/))) out.push(`<p class="li">• ${inl(m[1].replace(/^\[ \]/, '☐'))}</p>`);
        else if ((m = ln.match(/^ +(\w\. .*)/))) out.push(`<p class="li">&nbsp;&nbsp;${inl(m[1])}</p>`);
        else if (ln.trim()) out.push(`<p>${inl(ln)}</p>`);
      }); closeAll(); return out.join('');
    }
    function copyMd(t) {
      const fb = () => PP.ui.modal(`<h3>Salin Markdown</h3><p class="modal-text small">Pilih semua, salin, tempel ke Word.</p><textarea class="csvbox" readonly rows="10" style="width:100%">${E(t)}</textarea><div class="row end"><button class="btn green" data-close>Tutup</button></div>`);
      try { navigator.clipboard.writeText(t).then(() => toast('Markdown disalin.'), fb); } catch (e) { fb(); }
    }
    /* pratinjau cetak: selalu tampil di layar; tombol Cetak / Unduh .doc / Tutup */
    function printHtml(html, title) {
      const d = document.createElement('div'); d.className = 'lkpd-pv'; const doc = html + '<p class="lkpd-pf">Dicetak dari Petualangan Pythagoras · Made by Didit Fakhrullah</p>';
      d.innerHTML = `<div class="lkpd-pvb"><b>Pratinjau cetak · ${E(title || '')}</b><span><button class="btn sm blue" id="pvP">🖨 Cetak</button><button class="btn sm" id="pvD">⬇ Unduh .doc</button><button class="btn sm red" id="pvX">✕ Tutup</button></span></div><div class="lkpd-printroot">${doc}</div>`;
      document.body.appendChild(d); document.body.classList.add('lkpd-printing');
      const close = () => { document.body.classList.remove('lkpd-printing'); d.remove(); };
      $('#pvX', d).onclick = close;
      $('#pvP', d).onclick = () => { try { window.print(); } catch (e) { toast('Cetak diblokir di tampilan ini. Buka aplikasi di tab penuh atau pakai Unduh .doc.', 'x'); } };
      $('#pvD', d).onclick = () => { if (IN_VIEWER) return toast('Unduhan tidak tersedia di pratinjau; gunakan Salin Markdown.', 'x'); const b = new Blob(['<html><head><meta charset="utf-8"></head><body>' + doc + '</body></html>'], { type: 'application/msword' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = (title || 'lkpd').replace(/[^\w\-]+/g, '_') + '.doc'; a.click(); };
    }

    /* ======================= siklus hidup ======================= */
    return {
      html: '<div class="wrap wide"><div class="panel fill pad lkpd-root"><p class="small">Memuat LKPD…</p></div></div>',
      async mount(app, a) {
        rootEl = $('.lkpd-root', app);
        try { await loadBase(); } catch (e) { console.error('[lkpd]', e); }
        if (diag && !myG && P.au) { await autoPlace(); try { await loadBase(); } catch (e) { } }
        if (a) { const ok = await openByArg(a); if (ok) return; }
        draw();
      },
      unmount() {
        alive = false; try { clearTimeout(saveT); if (dirty.size) flush(); } catch (e) { }
        cleanups.forEach(f => { try { f(); } catch (e) { } }); cleanupStep(); try { camStop && camStop(); } catch (e) { }
        if (presEl) { presEl.remove(); presEl = null; } document.querySelectorAll('.lkpd-pv').forEach(n => n.remove()); document.body.classList.remove('lkpd-presenting', 'lkpd-printing');
        try { window.JBAlat && JBAlat.setKalk && JBAlat.setKalk(true); } catch (e) { }
        urls.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { } });
      }
    };
  };
})();
