/* =========================================================
   PPCloud — penyimpanan bersama per ruangan (absen, QR, soal buatan, dll.)
   Path: {root}/rooms/{KODE}/{path}.
   - Bila Firebase diisi: REST (GET/PUT/PATCH/DELETE) + polling ringan.
   - Bila belum diisi: simpanan lokal di perangkat (localStorage) + BroadcastChannel
     antar-tab, supaya fitur tetap bisa dicoba tanpa server.
   Semua galat ditelan; fungsi selalu mengembalikan nilai aman.
   ========================================================= */
(function () {
  'use strict';
  const LK = 'pp_cloud_local_v1';
  const CFG = () => window.PP_FIREBASE || {};
  const N = () => window.PPNet;
  const C = {};
  const bc = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('pp_cloud') : null;
  let local = {};
  try { local = JSON.parse(localStorage.getItem(LK) || '{}') || {}; } catch (e) { local = {}; }
  const saveLocal = () => { try { localStorage.setItem(LK, JSON.stringify(local)); return true; } catch (e) { return false; } };
  C.online = () => !!(N() && N().configured());
  C.room = () => { const n = N(); if (!n) return 'LOKAL'; return n.room() || (n.configured() ? n.defaultRoom() : 'LOKAL'); };
  const clean = p => String(p || '').replace(/^\/+|\/+$/g, '');
  const url = p => `${String(CFG().databaseURL).trim().replace(/\/+$/, '')}/${encodeURIComponent(CFG().root || 'pythagoras')}/rooms/${C.room()}/${clean(p)}.json`;
  async function req(method, u, body) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = setTimeout(() => ctl && ctl.abort(), 12000);
    try {
      const r = await fetch(u, { method, headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined, body: body !== undefined ? JSON.stringify(body) : undefined, signal: ctl ? ctl.signal : undefined });
      if (!r.ok) throw Object.assign(new Error('HTTP ' + r.status), { status: r.status });
      return await r.json();
    } finally { clearTimeout(t); }
  }
  /* ---- simpanan lokal berbentuk pohon ---- */
  const lget = p => { let o = local[C.room()]; for (const k of clean(p).split('/')) { if (!k) continue; if (o == null || typeof o !== 'object') return null; o = o[k]; } return o === undefined ? null : o; };
  const lset = (p, v, merge) => {
    const r = C.room(); local[r] = local[r] || {}; const ks = clean(p).split('/').filter(Boolean);
    if (!ks.length) { local[r] = v || {}; return; }
    let o = local[r]; for (let i = 0; i < ks.length - 1; i++) { if (typeof o[ks[i]] !== 'object' || o[ks[i]] == null) o[ks[i]] = {}; o = o[ks[i]]; }
    const k = ks[ks.length - 1];
    if (v === null) delete o[k]; else if (merge && typeof v === 'object' && typeof o[k] === 'object' && o[k]) Object.assign(o[k], v); else o[k] = v;
  };
  /* ---- API ---- */
  C.get = async p => { if (!C.online()) return lget(p); try { return await req('GET', url(p)); } catch (e) { return undefined; } };   // undefined = gagal jaringan
  C.put = async (p, v) => { if (!C.online()) { lset(p, v); const ok = saveLocal(); bc && bc.postMessage({ p }); return ok; } try { await req('PUT', url(p), v); return true; } catch (e) { return false; } };
  C.patch = async (p, v) => { if (!C.online()) { lset(p, v, true); const ok = saveLocal(); bc && bc.postMessage({ p }); return ok; } try { await req('PATCH', url(p), v); return true; } catch (e) { return false; } };
  C.del = async p => { if (!C.online()) { lset(p, null); const ok = saveLocal(); bc && bc.postMessage({ p }); return ok; } try { await req('DELETE', url(p)); return true; } catch (e) { return false; } };
  C.keys = async p => {               // hanya nama kunci (hemat kuota), untuk daftar besar seperti galeri QR
    if (!C.online()) { const o = lget(p); return o && typeof o === 'object' ? Object.keys(o) : []; }
    try { const o = await req('GET', url(p) + '?shallow=true'); return o ? Object.keys(o) : []; } catch (e) { return undefined; }
  };
  /* watch: panggil cb(nilai) saat pertama dan setiap berubah. Mengembalikan fungsi berhenti. */
  C.watch = function (p, cb, ms) {
    let stop = false, last = '\u0000', busy = false, t = null;
    const tick = async () => {
      if (stop || busy) return; busy = true;
      try { const v = await C.get(p); if (v !== undefined) { const s = JSON.stringify(v); if (s !== last) { last = s; if (!stop) cb(v); } } } catch (e) { }
      busy = false;
    };
    tick(); t = setInterval(() => { if (!document.hidden) tick(); }, ms || 4000);
    const onMsg = () => tick(); bc && bc.addEventListener('message', onMsg);
    const onStore = e => { if (e.key === LK) { try { local = JSON.parse(e.newValue || '{}') || {}; } catch (x) { } tick(); } };
    window.addEventListener('storage', onStore);
    return () => { stop = true; clearInterval(t); bc && bc.removeEventListener('message', onMsg); window.removeEventListener('storage', onStore); };
  };
  C.uid = () => 'k' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  window.PPCloud = C;
})();
