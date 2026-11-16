/* =========================================================
   SISTEM AUDIO TERPUSAT — memakai PP_AUDIO_CONFIG (js/audio-config.js)

   Aturan utama:
   - Musik latar : satu trek pada satu waktu, crossfade antar-halaman, loop.
   - Efek suara  : dimainkan lewat Web Audio (bila file dapat dimuat) atau
                   kumpulan elemen <audio> (berfungsi juga saat game dibuka
                   langsung dari file / tanpa server). Efek tidak saling
                   memotong, kecuali satu grup (jawaban benar <-> salah).
   - Satu ketukan = satu suara: efek "semantik" (jawaban, hadiah, misi,
                   pindah halaman) menahan klik biasa yang datang bersamaan.
   - Autoplay    : audio dibuka pada interaksi pertama pengguna.
   - Pengaturan  : musik & efek punya ON/OFF dan volume sendiri (tersimpan).
   - Semua status audio disimpan di window.PPAudio — tidak terikat halaman,
     sehingga efek suara tetap berjalan ketika pemain berpindah halaman.
   ========================================================= */
(function () {
  const CFG = window.PP_AUDIO_CONFIG;
  const KEY = 'pp_audio_v1';
  const DEF = { master: true, musicOn: true, sfxOn: true, music: 0.6, sfx: 0.8, narr: 1.0 };
  const POOL = 3;                                   // elemen <audio> per efek

  const A = {
    cfg: CFG,
    set: Object.assign({}, DEF),
    status: {},                // id -> 'file' | 'synth' | 'none' | 'error'
    els: {},                   // cache elemen BGM
    curId: null,               // trek BGM yang diminta
    userPaused: false,         // (kompatibilitas lama; kini memakai set.musicOn)
    needGesture: false,
    unlocked: false,
    ctx: null, buf: {}, bufTried: {},
    pool: {}, active: [], last: {}, lastSemantic: 0, semanticCount: 0,
    narr: null, narrId: null,
    listeners: [], scene: null,
    duck: 1,                   // pengecilan musik oleh narasi
    sduck: 1                   // pengecilan musik sementara oleh efek besar
  };

  /* ---------- penyimpanan ---------- */
  try { Object.assign(A.set, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  A.save = function () { try { localStorage.setItem(KEY, JSON.stringify(A.set)); } catch (e) {} };
  A.on = function (fn) { A.listeners.push(fn); };
  A.emit = function () { A.listeners.forEach(f => { try { f(); } catch (e) {} }); };

  /* ---------- status ketersediaan ---------- */
  Object.keys(CFG.tracks).forEach(id => {
    const t = CFG.tracks[id];
    A.status[id] = t.available ? 'file' : (t.synth ? 'synth' : 'none');
  });
  A.hasFile = id => A.status[id] === 'file';
  A.src = id => CFG.basePath + CFG.tracks[id].file;

  function chanVol(t) {
    const cat = CFG.categories[t.category] || { channel: 'sfx', gain: 1 };
    const ch = A.set[cat.channel === 'music' ? 'music' : cat.channel === 'narration' ? 'narr' : 'sfx'];
    return Math.min(1, (t.volume == null ? 1 : t.volume) * cat.gain * ch);
  }
  const wanted = () => A.set.master && A.set.musicOn;

  /* =======================================================
     MUSIK LATAR
     ======================================================= */
  function getEl(id) {
    if (A.els[id]) return A.els[id];
    const t = CFG.tracks[id];
    const el = new Audio();
    el.preload = 'auto';
    el.loop = t.loop !== false;
    el.volume = 0;
    el.setAttribute('playsinline', '');
    el.addEventListener('error', () => {
      A.status[id] = 'error';
      if (A.curId === id) A.curId = null;
      A.emit();
    });
    el.src = A.src(id);
    A.els[id] = el;
    return el;
  }
  function fade(el, to, ms, done) {
    clearInterval(el._fx);
    const from = el.volume, t0 = performance.now();
    if (ms <= 0) { el.volume = to; done && done(); return; }
    el._fx = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k >= 1) { clearInterval(el._fx); done && done(); }
    }, 40);
  }
  function musicTarget(id) {
    const t = CFG.tracks[id];
    const sg = (CFG.sceneGain && A.scene && CFG.sceneGain[A.scene]) || 1;
    return chanVol(t) * sg * A.duck * A.sduck;
  }

  A.playBgm = function (id) {
    A.curId = id;
    Object.keys(A.els).forEach(k => {
      if (k !== id) { const o = A.els[k]; fade(o, 0, 600, () => { if (A.curId !== k) o.pause(); }); }
    });
    if (!id || !A.hasFile(id) || !wanted()) { A.emit(); return; }
    const el = getEl(id);
    const p = el.play();
    if (p && p.catch) p.catch(() => { A.needGesture = true; A.emit(); });
    fade(el, musicTarget(id), 900);
    A.emit();
  };
  A.stopBgm = function () { A.playBgm(null); };

  A.scene_ = function (sceneKey) {
    A.scene = sceneKey;
    const id = CFG.sceneMusic[sceneKey];
    if (id === A.curId && A.els[id] && !A.els[id].paused) { fade(A.els[id], musicTarget(id), 400); return; }
    A.playBgm(id || null);
  };

  A.applyVolumes = function () {
    Object.keys(A.els).forEach(k => {
      const el = A.els[k];
      if (k === A.curId && wanted()) { clearInterval(el._fx); el.volume = musicTarget(k); }
    });
    if (A.narr) A.narr.volume = A.set.master ? chanVol(CFG.tracks[A.narrId]) : 0;
  };

  /* Kecilkan musik sebentar saat efek besar berbunyi (misi, kemenangan) */
  let duckTimer = null;
  A.duckFor = function (level, ms) {
    A.sduck = level;
    const el = A.curId && A.els[A.curId];
    if (el && wanted()) fade(el, musicTarget(A.curId), 120);
    clearTimeout(duckTimer);
    duckTimer = setTimeout(() => {
      A.sduck = 1;
      const e = A.curId && A.els[A.curId];
      if (e && wanted()) fade(e, musicTarget(A.curId), 700);
    }, ms);
  };

  /* Musik ON / OFF (terpisah dari efek suara) */
  A.setMusicOn = function (on) {
    A.set.musicOn = !!on; A.save();
    if (!on) Object.values(A.els).forEach(el => fade(el, 0, 250, () => el.pause()));
    else if (A.curId) A.playBgm(A.curId);
    A.emit();
  };
  A.toggleMusic = function () { A.setMusicOn(!A.set.musicOn); };
  A.setMaster = function (on) {
    A.set.master = on; A.save();
    if (!on) { Object.values(A.els).forEach(el => fade(el, 0, 200, () => el.pause())); A.stopNarration(); A.stopAllSfx(); }
    else if (A.curId) A.playBgm(A.curId);
    A.emit();
  };
  A.setSfx = function (on) { A.set.sfxOn = !!on; A.save(); if (!on) A.stopAllSfx(); A.emit(); };
  A.setVol = function (ch, v) { A.set[ch] = v; A.save(); A.applyVolumes(); A.emit(); };
  A.isPlaying = function () {
    const el = A.curId && A.els[A.curId];
    return !!(el && !el.paused && wanted());
  };

  /* =======================================================
     BUKA KUNCI AUTOPLAY (interaksi pertama pengguna)
     ======================================================= */
  function ensureCtx() {
    if (A.ctx) return A.ctx;
    try { const AC = window.AudioContext || window.webkitAudioContext; if (AC) A.ctx = new AC(); } catch (e) {}
    return A.ctx;
  }
  let primed = false;
  function primePools() {              // iOS/Android: elemen <audio> baru boleh diputar setelah 1x "disentuh" lewat gesture
    if (primed) return; primed = true;
    Object.keys(CFG.tracks).forEach(id => {
      const t = CFG.tracks[id];
      if (t.category !== 'sfx' || !A.hasFile(id)) return;
      poolFor(id).els.forEach(el => {
        try {
          el.muted = true;
          const p = el.play();
          const back = () => { el.pause(); el.currentTime = 0; el.muted = false; };
          if (p && p.then) p.then(back, () => { el.muted = false; }); else back();
        } catch (e) {}
      });
    });
  }
  A.unlock = function () {
    const c = ensureCtx();
    try { if (c && c.state === 'suspended') c.resume(); } catch (e) {}
    primePools(); loadBuffers();
    if (A.curId && wanted()) {
      const el = A.els[A.curId];
      if (!el || el.paused) A.playBgm(A.curId);
    }
    A.needGesture = false;
    A.unlocked = true;
  };
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach(ev =>
    window.addEventListener(ev, () => A.unlock(), { passive: true, capture: true }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { Object.values(A.els).forEach(el => el.pause()); if (A.ctx && A.ctx.state === 'running') A.ctx.suspend(); }
    else {
      if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume();
      if (A.curId && wanted()) A.playBgm(A.curId);
    }
  });

  /* =======================================================
     EFEK SUARA
     ======================================================= */
  function poolFor(id) {
    if (A.pool[id]) return A.pool[id];
    const t = CFG.tracks[id], els = [];
    for (let i = 0; i < POOL; i++) {
      const el = new Audio(); el.preload = 'auto'; el.setAttribute('playsinline', '');
      el.addEventListener('error', () => { if (A.status[id] === 'file') { A.status[id] = t.synth ? 'synth' : 'error'; A.emit(); } });
      el.src = A.src(id); els.push(el);
    }
    return (A.pool[id] = { els, i: 0 });
  }

  /* Web Audio: muat & decode sekali (hanya bila lewat http/https; file:// memakai elemen <audio>) */
  function loadBuffers() {
    if (!/^https?:$/.test(location.protocol) || !window.fetch) return;
    const c = ensureCtx(); if (!c) return;
    Object.keys(CFG.tracks).forEach(id => {
      const t = CFG.tracks[id];
      if (t.category !== 'sfx' || !A.hasFile(id) || A.bufTried[id]) return;
      A.bufTried[id] = true;
      fetch(A.src(id)).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(ab => new Promise((ok, no) => c.decodeAudioData(ab, ok, no)))
        .then(b => { A.buf[id] = b; })
        .catch(() => { /* tetap memakai elemen <audio> */ });
    });
  }

  function track(rec) {
    A.active.push(rec);
    return rec;
  }
  function untrack(rec) { const i = A.active.indexOf(rec); if (i >= 0) A.active.splice(i, 1); }
  function stopRec(rec) { try { rec.stop(); } catch (e) {} untrack(rec); }
  A.stopAllSfx = function () { A.active.slice().forEach(stopRec); };

  function playFile(id, vol, group) {
    const c = A.ctx;
    if (A.buf[id] && c && c.state === 'running') {
      const src = c.createBufferSource(), g = c.createGain();
      src.buffer = A.buf[id]; g.gain.value = vol;
      src.connect(g); g.connect(c.destination);
      const rec = track({ id, group, stop: () => src.stop() });
      src.onended = () => untrack(rec);
      src.start();
      return A.buf[id].duration * 1000;
    }
    const p = poolFor(id);
    let el = p.els.find(e => e.paused || e.ended);
    if (!el) { el = p.els[p.i++ % p.els.length]; }
    try { el.pause(); el.currentTime = 0; } catch (e) {}
    el.muted = false; el.volume = vol;
    const rec = track({ id, group, stop: () => { el.pause(); el.currentTime = 0; } });
    el.onended = () => untrack(rec);
    const pr = el.play();
    if (pr && pr.catch) pr.catch(() => untrack(rec));
    return (el.duration && isFinite(el.duration) ? el.duration * 1000 : 900);
  }

  /* nada sintetis cadangan — hanya dipakai bila file WAV gagal dimuat */
  function synth(kind, vol) {
    const ctx = ensureCtx(); if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const note = (f, t0, dur, type, g, f2) => {
      const o = ctx.createOscillator(), gn = ctx.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(f, now + t0);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + t0 + dur);
      const peak = (g || 0.25) * vol;
      gn.gain.setValueAtTime(0.0001, now + t0);
      gn.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), now + t0 + 0.01);
      gn.gain.exponentialRampToValueAtTime(0.0001, now + t0 + dur);
      o.connect(gn); gn.connect(ctx.destination);
      o.start(now + t0); o.stop(now + t0 + dur + 0.02);
    };
    const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5;
    switch (kind) {
      case 'click':  note(760, 0, 0.05, 'square', 0.18); note(1100, 0.03, 0.05, 'square', 0.12); break;
      case 'page':   note(400, 0, 0.12, 'triangle', 0.2, 900); break;
      case 'start':  [C5, E5, G5, C6].forEach((f, i) => note(f, i * 0.08, 0.12, 'square', 0.2)); break;
      case 'correct':[C5, E5, G5].forEach((f, i) => note(f, i * 0.09, 0.14, 'square', 0.22)); note(C6, 0.28, 0.25, 'triangle', 0.25); break;
      case 'wrong':  note(220, 0, 0.18, 'sawtooth', 0.2, 150); note(150, 0.16, 0.25, 'sawtooth', 0.2, 90); break;
      case 'star':   note(1568, 0, 0.1, 'triangle', 0.25); note(2093, 0.08, 0.25, 'triangle', 0.22); break;
      case 'mission':[C5, E5, G5, C6, G5, C6].forEach((f, i) => note(f, i * 0.1, 0.16, 'square', 0.2)); break;
      case 'victory':[C5, C5, C5, G5, E5, G5, C6].forEach((f, i) => note(f, i * 0.14 + (i > 3 ? 0.1 : 0), i === 6 ? 0.7 : 0.18, 'square', 0.2)); break;
    }
  }

  /* Titik masuk efek suara. `event` boleh nama peristiwa (click, correct, ...) atau id trek. */
  A.sfx = function (event) {
    if (!A.set.master || !A.set.sfxOn) return;
    // 'point' (tambahan XP) hanya berbunyi bila tidak ada suara lain di sekitarnya
    if (event === 'point') {
      setTimeout(() => { if (performance.now() - A.lastSemantic > 1500) A.sfx('point_now'); }, 380);
      return;
    }
    const id = CFG.events[event] || event;
    const t = CFG.tracks[id]; if (!t) return;
    const now = performance.now();
    const generic = CFG.generic.indexOf(event) >= 0;

    // klik biasa kalah oleh efek semantik yang baru saja berbunyi (1 ketukan = 1 suara)
    if (generic && now - A.lastSemantic < 280) return;
    // cegah pemutaran berulang trek yang sama dalam waktu sangat singkat
    if (now - (A.last[id] || 0) < (CFG.minGap[id] || 40)) return;
    A.last[id] = now;
    if (!generic) { A.lastSemantic = now; A.semanticCount++; }

    // jawaban benar & salah tidak pernah berbunyi bersamaan
    if (t.group) A.active.filter(r => r.group === t.group).forEach(stopRec);

    const vol = Math.min(1, chanVol(t) * ((CFG.eventGain && CFG.eventGain[event]) || 1));
    let ms = 900;
    if (A.status[id] === 'file') ms = playFile(id, vol, t.group);
    else if (t.synth) { try { synth(t.synth, Math.min(1, vol * 1.1)); } catch (e) {} }
    if (t.duck) A.duckFor(t.duck, Math.max(700, ms));
  };

  /* =======================================================
     NARASI & SUARA KARAKTER (hanya bila file tersedia)
     ======================================================= */
  A.narrationAvailable = id => !!CFG.tracks[id] && A.hasFile(id);
  A.playNarration = function (id) {
    if (!A.set.master || !A.narrationAvailable(id)) return false;
    A.stopNarration();
    const t = CFG.tracks[id];
    const a = new Audio(A.src(id)); a.volume = chanVol(t);
    a.addEventListener('ended', () => { A.narr = null; A.duck = 1; A.applyVolumes(); A.emit(); });
    a.addEventListener('error', () => { A.status[id] = 'error'; A.narr = null; A.duck = 1; A.applyVolumes(); A.emit(); });
    A.narr = a; A.narrId = id; A.duck = 0.3; A.applyVolumes();
    const p = a.play(); if (p && p.catch) p.catch(() => {});
    A.emit(); return true;
  };
  A.pauseNarration = function () { if (A.narr) { A.narr.pause(); A.duck = 1; A.applyVolumes(); A.emit(); } };
  A.resumeNarration = function () { if (A.narr) { A.duck = 0.3; A.applyVolumes(); A.narr.play().catch(() => {}); A.emit(); } };
  A.stopNarration = function () {
    if (A.narr) { A.narr.pause(); A.narr = null; }
    A.duck = 1; A.applyVolumes(); A.emit();
  };
  A.narrationState = function (id) {
    if (!A.narrationAvailable(id)) return 'missing';
    if (A.narr && A.narrId === id) return A.narr.paused ? 'paused' : 'playing';
    return 'idle';
  };
  A.voice = function (id) { return A.playNarration(id); };

  /* Muat awal: elemen efek dibuat lebih dulu agar siap saat dibutuhkan */
  Object.keys(CFG.tracks).forEach(id => { const t = CFG.tracks[id]; if (t.category === 'sfx' && A.hasFile(id)) poolFor(id); });

  window.PPAudio = A;
})();
