/* =========================================================
   SERVER GAME BERSAMA (realtime) — PPServer
   Satu ruangan = satu "server". Semua pemain di ruangan yang sama
   saling melihat: nama di atas karakter, karakter yang dipilih,
   posisi di dunia jelajah, poin/XP, dan progres kuis.

   Data: {root}/rooms/{KODE}/players/{idPemain} = {
     name, kelas, sekolah, avatar, xp, level, stars, coins,
     final, quiz, pos (misi selesai),
     loc: {w, x, y, f, a}      <- posisi di dunia jelajah
     scene: 'jelajah' | 'kuis' | 'menu',
     qz: {i, n, ok}            <- progres kuis berjalan
     online: true|false, updated: ms }

   Mesin (dipilih otomatis):
     1) 'sdk'   Firebase JS SDK: onValue + onChildAdded/Changed/Removed
                + onDisconnect  (dimuat dari CDN gstatic)
     2) 'rest'  bila SDK gagal dimuat: polling REST tiap 2 dtk
     3) 'lokal' bila databaseURL kosong: sinkron antar-tab di perangkat
                yang sama lewat BroadcastChannel (untuk uji/demo)
   Semua error ditelan: game tidak pernah jatuh karena server.
   ========================================================= */
(function () {
  'use strict';
  const CFG = window.PP_FIREBASE || {};
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const STALE = 25000;            // pemain dianggap pergi bila tak ada kabar 25 dtk
  const S = () => window.PPStore;
  const players = {};             // id -> data terbaru
  const listeners = { change: [], join: [], leave: [] };
  let backend = null, mode = 'off', room = '', myId = '', started = false, lastPush = 0, locTimer = 0, statTimer = null;
  const emit = (k, a, b) => listeners[k].forEach(f => { try { f(a, b); } catch (e) {} });
  const clean = s => String(s || '').replace(/[<>]/g, '').trim();

  /* ---------- mesin 1: Firebase SDK ---------- */
  async function makeSdk() {
    const [appM, dbM] = await Promise.race([
      Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-database.js')]),
      new Promise((_, rej) => setTimeout(() => rej(new Error('sdk timeout')), 7000))
    ]);
    const app = appM.initializeApp({ databaseURL: String(CFG.databaseURL).trim(), projectId: CFG.projectId, apiKey: CFG.apiKey }, 'pp-server');
    const db = dbM.getDatabase(app);
    const base = `${CFG.root || 'pythagoras'}/rooms/${room}/players`;
    const mine = dbM.ref(db, `${base}/${myId}`), all = dbM.ref(db, base);
    const offs = [];
    return {
      name: 'sdk',
      put: data => dbM.update(mine, data),
      listen(cb) {
        // onChildAdded/Changed/Removed: kabar per pemain; onValue: salinan lengkap (penyelaras)
        offs.push(dbM.onChildAdded(all, s => cb('add', s.key, s.val())));
        offs.push(dbM.onChildChanged(all, s => cb('change', s.key, s.val())));
        offs.push(dbM.onChildRemoved(all, s => cb('remove', s.key, null)));
        offs.push(dbM.onValue(dbM.ref(db, '.info/connected'), s => { if (s.val() === true) { try { dbM.onDisconnect(mine).update({ online: false, loc: null, scene: 'off', updated: dbM.serverTimestamp() }); } catch (e) {} cb('conn', myId, null); } }));
      },
      stop() { offs.forEach(f => { try { f(); } catch (e) {} }); try { dbM.update(mine, { online: false, loc: null, scene: 'off', updated: Date.now() }); } catch (e) {} }
    };
  }

  /* ---------- mesin 2: REST (polling) ---------- */
  function makeRest() {
    const url = sub => `${String(CFG.databaseURL).trim().replace(/\/+$/, '')}/${encodeURIComponent(CFG.root || 'pythagoras')}/rooms/${room}/players${sub}.json`;
    let timer = null, seen = {};
    return {
      name: 'rest',
      put: data => fetch(url('/' + myId), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
      listen(cb) {
        const tick = async () => {
          try {
            const r = await fetch(url('')); const d = (await r.json()) || {}, now = {};
            Object.keys(d).forEach(id => { now[id] = 1; cb(seen[id] ? 'change' : 'add', id, d[id]); });
            Object.keys(seen).forEach(id => { if (!now[id]) cb('remove', id, null); });
            seen = now;
          } catch (e) { /* jaringan putus: coba lagi */ }
        };
        tick(); timer = setInterval(tick, 2000);
      },
      stop() { clearInterval(timer); try { fetch(url('/' + myId), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ online: false, loc: null, scene: 'off', updated: Date.now() }), keepalive: true }); } catch (e) {} }
    };
  }

  /* ---------- mesin 3: lokal (antar-tab) ---------- */
  function makeLocal() {
    let ch = null;
    const store = {};
    return {
      name: 'lokal',
      put(data) { store[myId] = Object.assign(store[myId] || {}, data); if (ch) ch.postMessage({ t: 'put', id: myId, data: store[myId] }); return Promise.resolve(); },
      listen(cb) {
        if (typeof BroadcastChannel === 'undefined') return;
        ch = new BroadcastChannel('pp_room_' + room);
        ch.onmessage = e => {
          const m = e.data || {};
          if (m.t === 'put') cb(players[m.id] ? 'change' : 'add', m.id, m.data);
          else if (m.t === 'bye') cb('remove', m.id, null);
          else if (m.t === 'hello' && store[myId]) ch.postMessage({ t: 'put', id: myId, data: store[myId] });
        };
        ch.postMessage({ t: 'hello' });
      },
      stop() { if (ch) { ch.postMessage({ t: 'bye', id: myId }); ch.close(); ch = null; } }
    };
  }

  /* ---------- penerimaan kabar ---------- */
  function onMsg(type, id, data) {
    if (type === 'conn') { push(true); return; }
    if (id === myId) { if (type === 'remove') delete players[id]; else if (data) players[id] = Object.assign({}, data); emit('change'); return; }
    if (type === 'remove' || !data) { if (players[id]) { const p = players[id]; delete players[id]; emit('leave', id, p); emit('change'); } return; }
    const isNew = !players[id];
    const prev = players[id];
    players[id] = Object.assign({}, data, { _rx: performance.now() });
    if (prev && prev.loc && data.loc) { players[id]._px = prev.loc.x; players[id]._py = prev.loc.y; } // untuk interpolasi
    if (isNew && data.online !== false) emit('join', id, players[id]);
    emit('change', id);
  }

  /* ---------- API ---------- */
  const P = {};
  P.mode = () => mode;
  P.room = () => room;
  P.me = () => myId;
  P.onChange = f => { listeners.change.push(f); return () => { const i = listeners.change.indexOf(f); if (i >= 0) listeners.change.splice(i, 1); }; };
  P.onJoin = f => { listeners.join.push(f); return () => { const i = listeners.join.indexOf(f); if (i >= 0) listeners.join.splice(i, 1); }; };
  P.onLeave = f => { listeners.leave.push(f); return () => { const i = listeners.leave.indexOf(f); if (i >= 0) listeners.leave.splice(i, 1); }; };
  const alive = p => p && p.online !== false && p.scene !== 'off' && (Date.now() - (+p.updated || 0) < STALE || p._rx && performance.now() - p._rx < STALE);
  /* semua pemain online (termasuk saya), urut poin tertinggi */
  P.list = () => Object.keys(players).map(id => Object.assign({ id, me: id === myId }, players[id])).filter(p => p.me || alive(p)).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  P.count = () => P.list().length;
  /* pemain lain di dunia w (untuk digambar) */
  P.nearby = w => Object.keys(players).filter(id => id !== myId && alive(players[id]) && players[id].loc && players[id].loc.w === w).map(id => Object.assign({ id }, players[id]));
  const imgCache = {};
  P.img = key => { const av = (window.PP && PP.AV[key]) || (PP.AV && PP.AV.boy), n = av ? av.idle : 'boy_0'; if (!imgCache[n]) { const i = new Image(); i.src = 'assets/img/' + n + '.png'; imgCache[n] = i; } return { img: imgCache[n], name: n }; };

  function profile() {
    const d = S().data, o = { name: clean(d.name).slice(0, 40) || 'Pemain', kelas: clean(d.kelas).slice(0, 20), sekolah: clean(d.sekolah).slice(0, 60), avatar: d.avatar || 'boy', xp: d.xp | 0, level: S().level(), stars: S().totalStars(), coins: (d.explore && d.explore.coins) | 0, final: S().finalScore(), pos: S().doneCount(), online: true, updated: Date.now() };
    if (d.quiz && d.quiz.best) o.quiz = d.quiz.best.score;
    return o;
  }
  function push(force) {
    if (!backend) return;
    const now = Date.now(); if (!force && now - lastPush < 1200) return; lastPush = now;
    const data = profile(); data.scene = P._scene || 'menu'; if (P._qz) data.qz = P._qz; else data.qz = null;
    if (data.scene !== 'jelajah') data.loc = null;
    try { const r = backend.put(data); r && r.catch && r.catch(() => {}); } catch (e) {}
    players[myId] = Object.assign(players[myId] || {}, data); emit('change');
  }
  P.push = push;
  P.scene = (name, qz) => { P._scene = name; P._qz = qz || null; push(true); };
  P.quizProgress = (i, n, ok) => { P._scene = 'kuis'; P._qz = { i, n, ok }; push(false); };
  /* posisi (dipanggil tiap frame; dibatasi ±4x/dtk) */
  P.setLoc = (w, x, y, f, amp) => {
    if (!backend) return; const now = performance.now(); if (now - locTimer < 250) return; locTimer = now;
    const d = { loc: { w, x: Math.round(x), y: Math.round(y), f: f < 0 ? -1 : 1, a: amp > 0.2 ? 1 : 0 }, scene: 'jelajah', updated: Date.now(), online: true };
    try { const r = backend.put(d); r && r.catch && r.catch(() => {}); } catch (e) {}
    players[myId] = Object.assign(players[myId] || {}, d);
  };

  P.join = async function () {
    try {
      if (!window.PPStore || !window.PPNet) return 'off';
      const d = S().data; if (!d.registered) return 'off';
      myId = PPNet.id();
      const want = PPNet.configured() ? (PPNet.room() || PPNet.defaultRoom()) : (PPNet.room() || 'LOKAL');
      if (started && want === room) { push(true); return mode; }
      P.leave(true);
      room = want; started = true; if (PPNet.configured() && !PPNet.room()) PPNet.setRoom(room);
      backend = null;
      if (PPNet.configured()) { try { backend = await makeSdk(); } catch (e) { backend = makeRest(); } } else backend = makeLocal();
      mode = backend.name;
      backend.listen(onMsg);
      push(true);
      clearInterval(statTimer); statTimer = setInterval(() => push(false), 8000);   // detak: tanda masih online
      return mode;
    } catch (e) { mode = 'off'; return 'off'; }
  };
  P.leave = function (silent) {
    try { clearInterval(statTimer); if (backend) backend.stop(); } catch (e) {}
    backend = null; started = false; mode = 'off'; Object.keys(players).forEach(k => delete players[k]);
    if (!silent) emit('change');
  };
  window.addEventListener('pagehide', () => { try { if (backend) backend.stop(); } catch (e) {} });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (backend) try { backend.put({ online: false, updated: Date.now() }); } catch (e) {} } else push(true); });
  /* poin berubah (XP/bintang) -> kirim ke server */
  document.addEventListener('DOMContentLoaded', () => { try { S().onChange(() => { if (backend) push(false); }); } catch (e) {} });
  window.PPServer = P;
})();
