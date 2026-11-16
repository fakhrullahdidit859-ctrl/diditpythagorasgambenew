/* =========================================================
   MODE ONLINE — ruangan, kirim skor, papan peringkat bersama
   Firebase Realtime Database lewat REST (fetch). Tanpa SDK.
   Struktur data:
     {root}/rooms/{KODE}/players/{idPemain} = {
        name, kelas, avatar, quiz (0-100 | tidak ada), final (0-100),
        stars, pos (misi selesai), updated (ms)
     }
   Skor dikirim saat: bergabung (simpan profil) dan selesai kuis.
   Bila jaringan gagal, pengiriman diantrekan dan dicoba lagi otomatis.
   ========================================================= */
(function () {
  const CFG = window.PP_FIREBASE || {};
  const KEY = 'pp_online_v1';
  const S = () => window.PPStore;
  let st = { room: '', id: '', queue: false, last: 0 };
  try { Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  if (!st.id) st.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  persist();

  const N = {};
  const base = () => String(CFG.databaseURL || '').trim().replace(/\/+$/, '');
  N.configured = () => /^(https:\/\/[^\s/]+|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)/.test(base());
  N.normRoom = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  N.validRoom = c => /^[A-Z0-9]{3,10}$/.test(c);
  N.genRoom = () => { const L = 'ABCDEFGHJKMNPQRSTUVWXYZ', D = '23456789'; let s = ''; for (let i = 0; i < 4; i++) s += L[Math.floor(Math.random() * L.length)]; for (let i = 0; i < 2; i++) s += D[Math.floor(Math.random() * D.length)]; return s; };
  N.defaultRoom = () => N.normRoom(CFG.defaultRoom || 'UMUM') || 'UMUM';
  N.room = () => st.room;
  N.id = () => st.id;
  N.setRoom = code => { st.room = N.normRoom(code); st.queue = !!st.room; persist(); };
  N.leave = () => { st.room = ''; st.queue = false; persist(); };
  N.active = () => N.configured() && !!st.room;
  N.pending = () => st.queue;
  // kode ruangan dari tautan ?room=ABC123
  N.fromUrl = () => { try { return N.normRoom(new URLSearchParams(location.search).get('room')); } catch (e) { return ''; } };
  N.shareLink = () => { try { const u = new URL(location.href); u.search = ''; u.hash = ''; u.searchParams.set('room', st.room); return u.toString(); } catch (e) { return ''; } };

  const path = (sub) => `${base()}/${encodeURIComponent(CFG.root || 'pythagoras')}/rooms/${st.room}${sub}.json`;
  async function req(method, url, body) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = setTimeout(() => ctl && ctl.abort(), 9000);
    try {
      const r = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, signal: ctl ? ctl.signal : undefined });
      if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const clean = s => String(s || '').replace(/[<>]/g, '').trim().slice(0, 40);

  N.payload = function () {
    const d = S().data, o = { name: clean(d.name) || 'Pemain', kelas: clean(d.kelas).slice(0, 20), sekolah: clean(d.sekolah).slice(0, 60), avatar: d.avatar || 'boy', final: S().finalScore(), stars: S().totalStars(), pos: S().doneCount(), updated: Date.now() };
    if (d.quiz && d.quiz.best) o.quiz = d.quiz.best.score;
    return o;
  };
  /* kirim data pemain ke ruangan. Mengembalikan {ok, reason} */
  N.sync = async function () {
    if (!N.configured()) return { ok: false, reason: 'config' };
    if (!st.room) return { ok: false, reason: 'room' };
    try { await req('PATCH', path('/players/' + st.id), N.payload()); st.queue = false; st.last = Date.now(); persist(); return { ok: true }; }
    catch (e) { st.queue = true; persist(); return { ok: false, reason: 'net', status: e.status }; }
  };
  /* ambil seluruh pemain, urut: nilai kuis, nilai akhir, siapa lebih dulu */
  N.board = async function () {
    if (!N.configured()) throw Object.assign(new Error('config'), { reason: 'config' });
    if (!st.room) throw Object.assign(new Error('room'), { reason: 'room' });
    let data;
    try { data = await req('GET', path('/players')); }
    catch (e) { throw Object.assign(e, { reason: 'net' }); }
    const rows = Object.keys(data || {}).map(id => Object.assign({ id }, data[id])).filter(p => p && typeof p.name === 'string');
    rows.forEach(p => { p.hasQuiz = typeof p.quiz === 'number'; p.q = p.hasQuiz ? p.quiz : -1; p.f = +p.final || 0; p.u = +p.updated || 0; p.isMe = p.id === st.id; });
    rows.sort((a, b) => b.q - a.q || b.f - a.f || a.u - b.u);
    rows.forEach((p, i) => { p.rank = i + 1; });
    return rows;
  };
  const retry = () => { if (st.queue && N.active()) N.sync(); };
  window.addEventListener('online', retry);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) retry(); });
  window.PPNet = N;
})();
