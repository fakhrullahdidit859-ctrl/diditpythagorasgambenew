/* =========================================================
   SERVICE WORKER — Petualangan Pythagoras (PWA, offline)
   Strategi:
   - Pasang: simpan inti aplikasi (HTML, CSS, semua JS, ikon).
   - Halaman (navigasi): jaringan dulu, jika gagal pakai salinan tersimpan.
   - Berkas aset (gambar, suara, video): salinan tersimpan dulu, lalu jaringan (dan disimpan).
   - Video/suara mendukung permintaan Range (agar bisa diputar/digeser dari cache).
   - Font Google: stale-while-revalidate.
   - Firebase / database / API lain: TIDAK pernah disimpan (selalu jaringan).
   - Pesan {type:'CACHE_ALL', urls:[...]} dari halaman = unduh semua aset untuk offline.
   Naikkan VERSION setiap kali kode/aset berubah agar cache lama diganti.
   ========================================================= */
const VERSION = 'pp-v26';
const CORE = CORE_LIST();
function CORE_LIST() {
  return ['./', 'index.html', 'css/style.css', 'manifest.webmanifest', 'offline.html', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
}
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    let list = CORE.slice();
    try { const r = await fetch('pp-assets.json', { cache: 'no-store' }); const j = await r.json(); list = j.core || list; } catch (x) { }
    await Promise.allSettled(list.map(u => c.add(new Request(u, { cache: 'reload' }))));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => { for (const k of await caches.keys()) if (k.startsWith('pp-') && k !== VERSION) await caches.delete(k); await self.clients.claim(); })());
});
const isFont = u => /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
async function rangeResponse(req, res) {
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || ''); if (!m) return res;
  const b = await res.arrayBuffer(), n = b.byteLength; let s = m[1] === '' ? Math.max(0, n - +m[2]) : +m[1], en = m[1] !== '' && m[2] !== '' ? +m[2] : n - 1; en = Math.min(en, n - 1);
  return new Response(b.slice(s, en + 1), { status: 206, statusText: 'Partial Content', headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream', 'Content-Range': `bytes ${s}-${en}/${n}`, 'Content-Length': String(en - s + 1), 'Accept-Ranges': 'bytes' } });
}
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return; const u = new URL(req.url);
  if (u.origin !== location.origin) {
    if (isFont(u)) e.respondWith((async () => { const c = await caches.open(VERSION), h = await c.match(req); const f = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => h); return h || f; })());
    return;                                                              // Firebase dll: langsung jaringan
  }
  if (req.mode === 'navigate') {
    e.respondWith((async () => { try { const r = await fetch(req); const c = await caches.open(VERSION); c.put('index.html', r.clone()).catch(() => { }); return r; } catch (x) { const c = await caches.open(VERSION); return (await c.match('index.html')) || (await c.match('./')) || (await c.match('offline.html')); } })());
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(VERSION), hit = await c.match(req.url, { ignoreSearch: true });
    if (hit) return req.headers.has('range') ? rangeResponse(req, hit) : hit;
    try {
      if (req.headers.has('range')) return await fetch(req);               // belum tersimpan: biarkan jaringan melayani potongan
      const r = await fetch(req); if (r.ok && r.status === 200) c.put(req, r.clone()).catch(() => { }); return r;
    } catch (x) { return (await c.match('offline.html')) || Response.error(); }
  })());
});
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'SKIP_WAITING') return self.skipWaiting();
  if (d.type === 'CLEAR') { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('pp-')).map(k => caches.delete(k)))).then(() => say(e, { type: 'CLEARED' }))); return; }
  if (d.type === 'STATUS') { e.waitUntil((async () => { const c = await caches.open(VERSION), ks = await c.keys(); say(e, { type: 'STATUS', n: ks.length, version: VERSION }); })()); return; }
  if (d.type === 'CACHE_ALL') {
    e.waitUntil((async () => {
      const c = await caches.open(VERSION), urls = d.urls || []; let done = 0, fail = 0, i = 0;
      const worker = async () => { while (i < urls.length) { const u = urls[i++]; try { if (!(await c.match(u))) { const r = await fetch(u); if (r.ok && r.status === 200) await c.put(u, r); else fail++; } } catch (x) { fail++; } done++; say(e, { type: 'PROGRESS', done, total: urls.length, fail }); } };
      await Promise.all([worker(), worker(), worker(), worker()]); say(e, { type: 'DONE', done, total: urls.length, fail });
    })());
  }
});
async function say(e, msg) { const cs = await self.clients.matchAll({ includeUncontrolled: true }); cs.forEach(c => c.postMessage(msg)); }
