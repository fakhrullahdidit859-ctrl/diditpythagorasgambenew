/* Buku Digital (flipbook) - Petualangan Pythagoras. Berisi: penyimpanan, suara, mesin balik halaman, layar game. */
/* Penyimpanan kecil di perangkat (localStorage) — aman bila diblokir browser. */
(function () {
  var KEY = 'pp_flip_v1', mem = {};
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return mem; } }
  function save(o) { mem = o; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  window.FBStore = {
    get: function (k, d) { var o = load(); return k in o ? o[k] : d; },
    set: function (k, v) { var o = load(); o[k] = v; save(o); return v; }
  };
})();

/* Efek suara sintetis (WebAudio) — tanpa berkas audio, jalan offline. Bisa dibisukan. */
(function () {
  var ctx = null;
  function ac() { try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; } return ctx; }
  function on() { return !window.FBStore.get('mute', false); }
  function tone(f, t0, d, type, vol) { var c = ac(); if (!c) return; var o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, c.currentTime + t0); g.gain.exponentialRampToValueAtTime(vol || 0.15, c.currentTime + t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + d); o.connect(g); g.connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + d + 0.05); }
  function noise(d, f0, f1, vol) { var c = ac(); if (!c) return; var n = c.sampleRate * d, b = c.createBuffer(1, n, c.sampleRate), x = b.getChannelData(0); for (var i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n); var s = c.createBufferSource(); s.buffer = b; var fl = c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0, c.currentTime); fl.frequency.exponentialRampToValueAtTime(f1, c.currentTime + d); var g = c.createGain(); g.gain.value = vol || 0.25; s.connect(fl); fl.connect(g); g.connect(c.destination); s.start(); }
  window.FBSfx = {
    page: function () { if (on()) noise(0.22, 900, 3200, 0.3); },
    click: function () { if (on()) tone(520, 0, 0.07, 'triangle', 0.1); },
    ok: function () { if (on()) { tone(660, 0, 0.12, 'sine', 0.16); tone(990, 0.1, 0.2, 'sine', 0.16); } },
    win: function () { if (on()) [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.25, 'triangle', 0.15); }); },
    no: function () { if (on()) tone(190, 0, 0.22, 'sawtooth', 0.08); },
    bell: function () { if (on()) { tone(880, 0, 0.35, 'sine', 0.12); tone(1320, 0.05, 0.3, 'sine', 0.08); } }
  };
})();

/* =========================================================
   FLIPBOOK — balik halaman 3D (CSS), tanpa pustaka luar, jalan offline.
   Layar lebar -> dua halaman (spread); HP -> satu halaman.
   Fitur: geser / ◀ ▶ / tombol panah, loncat dari daftar isi, penanda halaman (pita merah),
          catatan pribadi, latihan dengan pemeriksa otomatis + confetti, ukuran huruf, mode malam, suara, bar kemajuan.
   Pemakaian:  var ctl = Book.open(containerEl, { onHome(), onExt() });   ctl.destroy();
   ========================================================= */
(function () {
  var D = window.FBData, S = window.FBStore, pages = D.pages, N = pages.length;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  function tocHtml(sec) {
    var list = pages.filter(function (p) { return p.sec === sec || (sec === 'py' && p.sec === 'cat'); });
    return '<ol class="fb-toc" aria-label="Daftar isi, ketuk untuk loncat">' + list.map(function (p) { return '<li><a href="#" data-pg="' + p.no + '"><span>' + p.t + '</span><i></i><b>' + p.no + '</b></a></li>'; }).join('') + '</ol>';
  }
  function bodyOf(p) {
    if (p.toc === 'bd') return '<div class="fb-tx"><p>Mengenal bangun datar, rumus keliling dan luas, plus latihan.</p></div>' + tocHtml('bd') + '<div class="fb-tx"><p class="fb-sm">Ketuk judul untuk loncat. Ketuk pita 🔖 di pojok halaman untuk menandai.</p></div>';
    if (p.toc === 'py') return '<div class="fb-tx"><p>Teorema Pythagoras: bukti, mencari sisi, tripel, penerapan, dan latihan.</p></div>' + tocHtml('py');
    return p.html;
  }
  function faceHtml(i, back) {
    var p = pages[i], bm = (S.get('bm', []) || []).indexOf(p.no) >= 0;
    return '<div class="fbp' + (p.cover ? ' cov' : '') + (back ? ' fbf' : '') + '" data-no="' + p.no + '">' +
      (p.cover ? '' : '<button class="fb-rib' + (bm ? ' on' : '') + '" data-fb="rib" data-no="' + p.no + '" type="button" aria-label="Tandai halaman ' + p.no + '" title="Tandai halaman"></button>') +
      (p.t ? '<h3>' + p.t + (p.sec === 'bd' ? '<em class="sec bd">Bangun Datar</em>' : p.sec === 'py' ? '<em class="sec py">Pythagoras</em>' : '') + '</h3>' : '') + bodyOf(p) + (p.cover ? '' : '<span class="pn">' + p.no + '</span>') + '</div>';
  }

  function open(root, opt) {
    opt = opt || {};
    root.innerHTML =
      '<div class="fbk"><div class="fb-bar"><button class="btn sm" data-fb="home" type="button" aria-label="Kembali ke beranda">◀ Beranda</button><b class="fb-ttl">📖 Bangun Datar &amp; Pythagoras</b>' +
      '<div class="fb-tools"><button class="tl" data-fb="marks" type="button" aria-label="Penanda dan daftar isi" title="Penanda">🔖</button><button class="tl" data-fb="fs-" type="button" aria-label="Kecilkan huruf" title="Kecilkan huruf">A−</button><button class="tl" data-fb="fs+" type="button" aria-label="Besarkan huruf" title="Besarkan huruf">A+</button><button class="tl" data-fb="night" type="button" aria-label="Mode malam" title="Mode malam">🌙</button><button class="tl" data-fb="snd" type="button" aria-label="Suara" title="Suara">🔊</button></div></div>' +
      '<div class="fb-prog" aria-hidden="true"><i></i></div><div class="fb-stage" tabindex="0" aria-label="Buku digital. Gunakan tombol panah untuk membalik halaman."></div>' +
      '<div class="fb-nav"><button class="btn sm" data-fb="prev" type="button" aria-label="Halaman sebelumnya">◀</button><span class="fb-cnt" aria-live="polite"></span><button class="btn sm green" data-fb="next" type="button" aria-label="Halaman berikutnya">▶</button></div>' +
      '<div class="fb-panel" hidden><div class="fb-pcard"><button class="tl x" data-fb="marks" type="button" aria-label="Tutup">✕</button><h4>🔖 Penanda</h4><div class="fb-ml"></div><h4>📑 Daftar isi</h4><div class="fb-ml2"></div></div></div></div>';
    var stage = $('.fb-stage', root), cnt = $('.fb-cnt', root), prog = $('.fb-prog i', root), panel = $('.fb-panel', root);
    var st = { spread: true, s: 0, book: null, leaves: [], L: 0, t: 0, rt: 0 }, lastPage = Math.min(N, Math.max(1, +S.get('page', 1) || 1)), dead = false;

    var pageOfState = function (s) { return st.spread ? (s === 0 ? 1 : 2 * s) : s + 1; };
    var stateOfPage = function (p) { return st.spread ? Math.min(Math.floor(p / 2), st.L) : Math.min(p - 1, st.L); };

    function tools() {
      var n = $('[data-fb="night"]', root), m = $('[data-fb="snd"]', root);
      root.classList.toggle('night', !!S.get('night', false)); n.setAttribute('aria-pressed', !!S.get('night', false)); m.textContent = S.get('mute', false) ? '🔇' : '🔊'; m.setAttribute('aria-pressed', !S.get('mute', false));
    }
    function build() {
      if (dead) return;
      var W = stage.clientWidth, H = stage.clientHeight; if (W < 50 || H < 50) return;
      var cur = st.book ? pageOfState(st.s) : lastPage, spread = W >= 700 && W / H >= 1.1 && H >= 360; st.spread = spread;
      var pw, ph; if (spread) { ph = Math.min(H * 0.9, (W * 0.84 / 2) * 1.38); pw = ph / 1.38; } else { pw = Math.min(W * 0.9, 520); ph = Math.min(H * 0.93, pw * 1.7); }
      var fs = Math.max(10, Math.min(20, Math.min(pw / 25, ph / 37))) * (+S.get('fs', 1) || 1);
      stage.style.setProperty('--pw', pw + 'px'); stage.style.setProperty('--ph', ph + 'px'); stage.style.setProperty('--bfs', fs + 'px');
      st.L = spread ? N / 2 : N - 1;
      var h = '<div class="fb-book ' + (spread ? 'spread' : 'single') + '">', i;
      if (spread) for (i = 0; i < N / 2; i++) h += '<div class="fb-leaf" data-i="' + i + '"><div class="fb-face front">' + faceHtml(2 * i) + '</div><div class="fb-face back">' + faceHtml(2 * i + 1, 1) + '</div></div>';
      else for (i = 0; i < N; i++) h += '<div class="fb-leaf" data-i="' + i + '"><div class="fb-face front">' + faceHtml(i) + '</div><div class="fb-face back"><div class="fbp blank"></div></div></div>';
      stage.innerHTML = h + '</div>'; st.book = $('.fb-book', stage); st.leaves = [].slice.call(st.book.querySelectorAll('.fb-leaf'));
      st.s = stateOfPage(cur); restoreInputs(); apply(true);
    }
    function apply(instant) {
      var nl = st.leaves.length;
      st.leaves.forEach(function (lf, i) { var fl = i < st.s; lf.classList.toggle('flipped', fl); if (instant) lf.style.zIndex = fl ? i + 1 : nl - i; });
      st.book.classList.toggle('at0', st.s === 0); st.book.classList.toggle('atEnd', st.spread && st.s === st.L);
      var live = st.spread ? [st.s - 1, st.s] : [st.s]; // lembar yang sedang tampak -> animasi isi halaman
      st.leaves.forEach(function (lf, i) { var fr = lf.querySelector('.fb-face.front .fbp'), bk = lf.querySelector('.fb-face.back .fbp'); if (fr) fr.classList.toggle('fb-live', st.spread ? i === st.s : i === st.s); if (bk) bk.classList.toggle('fb-live', st.spread && i === st.s - 1); });
      var p = pageOfState(st.s); lastPage = p; S.set('page', p);
      cnt.textContent = st.spread ? (st.s === 0 ? 'Sampul' : st.s === st.L ? 'Sampul belakang' : 'Halaman ' + 2 * st.s + '–' + (2 * st.s + 1) + ' dari ' + N) : 'Halaman ' + p + ' dari ' + N;
      prog.style.width = (st.spread ? (st.s / st.L) : (st.s / st.L)) * 100 + '%';
      $('[data-fb="prev"]', root).disabled = st.s <= 0; $('[data-fb="next"]', root).disabled = st.s >= st.L;
    }
    function go(n) {
      n = Math.max(0, Math.min(st.L, n)); if (n === st.s) return;
      var nl = st.leaves.length, from = st.s; st.s = n; window.FBSfx && FBSfx.page();
      for (var i = Math.min(from, n); i < Math.max(from, n); i++) st.leaves[i].style.zIndex = 900;
      apply(false); clearTimeout(st.t); st.t = setTimeout(function () { st.leaves.forEach(function (lf, i) { lf.style.zIndex = i < st.s ? i + 1 : nl - i; }); }, 780);
    }
    function jump(p) { var n = stateOfPage(p); if (Math.abs(n - st.s) > 1) { st.s = n; apply(true); window.FBSfx && FBSfx.page(); } else go(n); panel.hidden = true; }

    /* penanda */
    function marks() { return (S.get('bm', []) || []).slice().sort(function (a, b) { return a - b; }); }
    function paintMarks() {
      var m = marks(); [].forEach.call(root.querySelectorAll('.fb-rib'), function (r) { r.classList.toggle('on', m.indexOf(+r.dataset.no) >= 0); });
      $('.fb-ml', root).innerHTML = m.length ? m.map(function (n) { var p = pages[n - 1]; return '<a href="#" data-pg="' + n + '">🔖 ' + (p.t || 'Sampul') + ' <b>' + n + '</b></a>'; }).join('') : '<p class="fb-sm">Belum ada. Ketuk pita di pojok halaman untuk menandai.</p>';
    }
    function toggleMark(n) { var m = marks(), i = m.indexOf(n); if (i >= 0) m.splice(i, 1); else { m.push(n); window.FBSfx && FBSfx.bell(); } S.set('bm', m); paintMarks(); }
    function fillToc() { $('.fb-ml2', root).innerHTML = pages.filter(function (p) { return p.t && !p.toc; }).map(function (p) { return '<a href="#" data-pg="' + p.no + '"><span class="sec ' + (p.sec || '') + '"></span>' + p.t + ' <b>' + p.no + '</b></a>'; }).join(''); }

    /* catatan & jawaban */
    function restoreInputs() { var ta = stage.querySelector('.fb-notes'); [].forEach.call(stage.querySelectorAll('.fb-notes'), function (t) { t.value = S.get('notes', ''); }); paintMarks(); }
    function check(btn) {
      var pg = btn.closest('.fbp'), ol = pg.querySelector('.fb-qs'), set = D.QS[ol.dataset.set], ok = 0;
      [].forEach.call(ol.querySelectorAll('li'), function (li) {
        var q = set[+li.dataset.i], el = li.querySelector('input,select'), v = el.value.trim().replace(',', '.'), r = li.querySelector('.r');
        var good = q.k === 'num' ? v !== '' && Math.abs(parseFloat(v) - q.a) < 0.01 : v === q.a;
        r.textContent = v === '' ? '' : good ? '✅' : '❌'; r.className = 'r ' + (v === '' ? '' : good ? 'ok' : 'no'); if (good) ok++;
      });
      var sc = pg.querySelector('.fb-sc'); sc.textContent = ok === set.length ? '🎉 Semua benar! Hebat!' : 'Benar ' + ok + ' dari ' + set.length;
      if (window.FBSfx) (ok === set.length ? FBSfx.win : ok ? FBSfx.ok : FBSfx.no)();
      if (ok === set.length) confetti(pg);
    }
    function confetti(host) {
      var box = document.createElement('div'); box.className = 'confetti'; var cols = ['#ffd54a', '#43b33f', '#2f7bd8', '#e8574a', '#a76ad8'];
      for (var i = 0; i < 28; i++) { var s = document.createElement('i'); s.style.setProperty('--x', (Math.random() * 100 - 50) + 'px'); s.style.setProperty('--d', (0.9 + Math.random() * 0.9) + 's'); s.style.left = (10 + Math.random() * 80) + '%'; s.style.background = cols[i % 5]; s.style.animationDelay = Math.random() * 0.25 + 's'; box.appendChild(s); }
      host.appendChild(box); setTimeout(function () { box.remove(); }, 2400);
    }

    /* peristiwa */
    root.addEventListener('click', function (e) {
      var a = e.target.closest('[data-pg]'), b = e.target.closest('[data-fb]');
      if (a) { e.preventDefault(); jump(+a.dataset.fbp); return; }
      if (!b) return; var k = b.dataset.fb;
      if (k === 'next') go(st.s + 1); else if (k === 'prev') go(st.s - 1); else if (k === 'first') jump(1);
      else if (k === 'home') opt.onHome && opt.onHome(); else if (k === 'ext') opt.onExt && opt.onExt();
      else if (k === 'chk') check(b); else if (k === 'rib') toggleMark(+b.dataset.no);
      else if (k === 'marks') { panel.hidden = !panel.hidden; if (!panel.hidden) { paintMarks(); fillToc(); } window.FBSfx && FBSfx.click(); }
      else if (k === 'night') { S.set('night', !S.get('night', false)); tools(); }
      else if (k === 'snd') { S.set('mute', !S.get('mute', false)); tools(); window.FBSfx && FBSfx.click(); }
      else if (k === 'fs+' || k === 'fs-') { var f = Math.round(((+S.get('fs', 1) || 1) + (k === 'fs+' ? 0.1 : -0.1)) * 10) / 10; S.set('fs', Math.max(0.8, Math.min(1.5, f))); build(); }
    });
    root.addEventListener('input', function (e) { if (e.target.classList.contains('fb-notes')) { S.set('notes', e.target.value); [].forEach.call(stage.querySelectorAll('.fb-notes'), function (t) { if (t !== e.target) t.value = e.target.value; }); } });
    var sx = null, sy = 0;
    stage.addEventListener('pointerdown', function (e) { if (e.target.closest('input,select,button,a,textarea')) { sx = null; return; } sx = e.clientX; sy = e.clientY; });
    stage.addEventListener('pointerup', function (e) { if (sx == null) return; var dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) go(st.s + (dx < 0 ? 1 : -1)); });
    function key(e) { if (e.target.closest && e.target.closest('input,select,textarea')) return; if (e.key === 'ArrowRight') go(st.s + 1); else if (e.key === 'ArrowLeft') go(st.s - 1); else if (e.key === 'Escape') panel.hidden = true; }
    document.addEventListener('keydown', key);
    function rs() { clearTimeout(st.rt); st.rt = setTimeout(build, 130); } window.addEventListener('resize', rs);
    tools(); setTimeout(build, 20); setTimeout(build, 350);
    return {
      destroy: function () { dead = true; document.removeEventListener('keydown', key); window.removeEventListener('resize', rs); clearTimeout(st.t); clearTimeout(st.rt); root.innerHTML = ''; },
      goto: function (p) { jump(p); }, page: function () { return lastPage; }
    };
  }
  window.FBook = { open: open, pages: pages };
})();

/* ---- Layar game: Buku Digital ---- */
(function () {
  PP.screens = PP.screens || {};
  PP.screens.buku = function () {
    let ctl = null;
    return {
      html: '<div class="wrap wide"><div id="fbRoot" class="fbwrap"></div></div>',
      mount(root) {
        const host = root.querySelector('#fbRoot');
        ctl = window.FBook.open(host, { onHome() { PP.go('menu'); }, onExt() { PP.go('materi'); } });
        try { PPStore.data.flipOpened = (PPStore.data.flipOpened || 0) + 1; PPStore.save(); } catch (e) {}
      },
      unmount() { try { ctl && ctl.destroy(); } catch (e) {} ctl = null; }
    };
  };
})();
