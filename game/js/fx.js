/* =====================================================================
   fx.js — skrip animasi & helper Petualangan Pythagoras (tanpa library)
   API global: window.FX
     FX.icon(id, cls)                       -> string <svg><use/></svg>
     FX.confetti(x, y, n)                   -> hujan bintang pixel
     FX.countUp(el, to, ms)                 -> angka menghitung naik
     FX.shapeSVG(tipe, params, opsi)        -> string SVG bangun datar
     FX.drawShape(svgEl)                    -> animasi gambar bertahap
     FX.feedback(el, benar)                 -> animasi benar/salah
     FX.sfx.play('klik'|'ok'|'salah'|'mulai') -> efek suara (WebAudio, tanpa file)
     FX.sfx.enabled = true/false            -> hubungkan ke tombol suara header
     FX.videoSlot(container, opsi)          -> pemutar video Menu Utama
     FX.dropzone(el, {accept, onFiles})     -> zona seret-lepas
     FX.wizard(el)                          -> navigasi langkah (next/back/go)
     FX.toast(teks, ikon)
   ===================================================================== */
(function (global) {
  'use strict';
  var FX = {};
  var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  FX.reducedMotion = function () { return reduced; };

  /* ---------- Ikon ---------- */
  FX.icon = function (id, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true" focusable="false"><use href="#ic-' + id + '"/></svg>';
  };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- Efek suara (WebAudio, tanpa berkas) ---------- */
  var ctx = null;
  FX.sfx = {
    enabled: false,
    play: function (nama) {
      if (!FX.sfx.enabled) return;
      try {
        ctx = ctx || new (global.AudioContext || global.webkitAudioContext)();
        var seq = {
          klik: [[660, 0, .05]],
          ok: [[523, 0, .09], [659, .09, .09], [784, .18, .16]],
          salah: [[220, 0, .12], [165, .12, .2]],
          mulai: [[392, 0, .08], [523, .08, .08], [659, .16, .08], [784, .24, .22]]
        }[nama] || [];
        var t0 = ctx.currentTime;
        seq.forEach(function (n) {
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = nama === 'salah' ? 'sawtooth' : 'square';
          o.frequency.value = n[0];
          g.gain.setValueAtTime(.0001, t0 + n[1]);
          g.gain.exponentialRampToValueAtTime(.12, t0 + n[1] + .01);
          g.gain.exponentialRampToValueAtTime(.0001, t0 + n[1] + n[2]);
          o.connect(g); g.connect(ctx.destination);
          o.start(t0 + n[1]); o.stop(t0 + n[1] + n[2] + .02);
        });
      } catch (e) { /* abaikan bila audio tidak tersedia */ }
    }
  };

  /* ---------- Confetti bintang pixel ---------- */
  FX.confetti = function (x, y, n) {
    if (reduced) return;
    n = n || 24;
    if (x == null) { x = innerWidth / 2; y = innerHeight / 3; }
    var warna = ['#F7CF4B', '#4CBF4A', '#3E8EE8', '#E8588A', '#F5A83A', '#9B6BE0'];
    var layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:10000;overflow:hidden';
    document.body.appendChild(layer);
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      var s = 6 + Math.random() * 8;
      p.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + s + 'px;height:' + s + 'px;background:' +
        warna[i % warna.length] + ';border:2px solid #3B2314;image-rendering:pixelated;' +
        (i % 3 === 0 ? 'clip-path:polygon(50% 0,62% 38%,100% 38%,70% 60%,80% 100%,50% 75%,20% 100%,30% 60%,0 38%,38% 38%);border:0' : '');
      layer.appendChild(p);
      var ang = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 160;
      p.animate([
        { transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 },
        { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist - 40) + 'px) rotate(' + (Math.random() * 540 - 270) + 'deg) scale(1)', opacity: 1, offset: .55 },
        { transform: 'translate(' + Math.cos(ang) * dist * 1.1 + 'px,' + (Math.sin(ang) * dist + 140) + 'px) rotate(' + (Math.random() * 720 - 360) + 'deg) scale(.6)', opacity: 0 }
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    }
    setTimeout(function () { layer.remove(); }, 1600);
  };

  /* ---------- Hitung naik ---------- */
  FX.countUp = function (el, to, ms) {
    ms = ms || 900;
    if (reduced) { el.textContent = to; return; }
    var t0 = performance.now(), from = 0;
    (function tick(t) {
      var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  };

  /* ---------- Umpan balik benar / salah ---------- */
  FX.feedback = function (el, benar) {
    el.classList.remove('fx-correct', 'fx-wrong');
    void el.offsetWidth; // restart animasi
    el.classList.add(benar ? 'fx-correct' : 'fx-wrong');
    FX.sfx.play(benar ? 'ok' : 'salah');
    if (benar) { var r = el.getBoundingClientRect(); FX.confetti(r.left + r.width / 2, r.top + r.height / 2, 18); }
  };

  /* ---------- Toast ---------- */
  FX.toast = function (teks, ikon) {
    var t = document.createElement('div');
    t.className = 'fx-toast'; t.setAttribute('role', 'status');
    t.innerHTML = FX.icon(ikon || 'check') + '<span>' + esc(teks) + '</span>';
    document.body.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = 0; setTimeout(function () { t.remove(); }, 320); }, 2600);
  };

  /* =====================================================================
     BANGUN DATAR OTOMATIS (SVG)
     Tipe: persegi{s} persegi-panjang{p,l} segitiga-siku{a,b,c}
           jajar-genjang{a,t,s} trapesium{a,b,t,s} belah-ketupat{d1,d2}
           layang-layang{d1,d2} lingkaran{r}
     Nilai '?' menandai sisi yang dicari. Satuan lewat opsi.unit (mis. 'cm').
     ===================================================================== */
  var C = { line: '#3B2314', fills: ['#F7CF4B', '#5FA6F5', '#4CBF4A', '#E8588A', '#9B6BE0', '#1FA588', '#F5A83A', '#8FD0F0'] };
  function lab(v, unit) { v = String(v); return v === '?' ? '?' : v + (unit ? ' ' + unit : ''); }

  FX.shapeSVG = function (tipe, p, opsi) {
    opsi = opsi || {}; p = p || {};
    var u = opsi.unit == null ? 'cm' : opsi.unit, idx = 0;
    var fill = opsi.fill || C.fills[0];
    var out = [], desc = '';
    function poly(pts) {
      out.push('<polygon class="shape-fill" points="' + pts + '" fill="' + fill + '" fill-opacity=".85"/>');
      out.push('<polygon class="shape-line" pathLength="1" points="' + pts + '" fill="none" stroke="' + C.line + '" stroke-width="3" stroke-linejoin="round"/>');
    }
    function dash(x1, y1, x2, y2) {
      out.push('<line class="shape-line shape-dash" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + C.line + '" stroke-width="2" stroke-linecap="round" style="stroke-dasharray:5 4;stroke-dashoffset:0"/>');
    }
    function text(x, y, s, anchor, extra) {
      var q = String(s).charAt(0) === '?';
      out.push('<text class="shape-label" style="--i:' + (idx++) + '" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') +
        '" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="14" font-weight="700" fill="' + (q ? '#C23339' : C.line) +
        '" paint-order="stroke" stroke="#FFF6DC" stroke-width="4" stroke-linejoin="round"' + (extra || '') + '>' + esc(s) + '</text>');
    }
    function right(x, y, dx, dy) { // tanda siku-siku
      var s = 11;
      out.push('<path class="shape-mark" style="--i:' + (idx++) + '" d="M' + (x + dx * s) + ' ' + y + ' L' + (x + dx * s) + ' ' + (y + dy * s) + ' L' + x + ' ' + (y + dy * s) +
        '" fill="none" stroke="' + C.line + '" stroke-width="2.2"/>');
    }

    switch (tipe) {
      case 'persegi':
        poly('60,25 160,25 160,125 60,125');
        text(110, 143, lab(p.s, u)); text(176, 80, lab(p.s, u), 'start');
        right(60, 125, 1, -1);
        desc = 'Persegi dengan sisi ' + p.s + ' ' + u; break;
      case 'persegi-panjang':
        poly('30,35 180,35 180,115 30,115');
        text(105, 135, lab(p.p, u)); text(14, 80, lab(p.l, u), 'end');
        right(30, 115, 1, -1);
        desc = 'Persegi panjang panjang ' + p.p + ' ' + u + ' lebar ' + p.l + ' ' + u; break;
      case 'segitiga-siku':
        poly('40,125 160,125 40,30');
        text(100, 145, lab(p.a, u)); text(24, 82, lab(p.b, u), 'end');
        text(112, 70, lab(p.c, u), 'start', ' transform="rotate(-38 112 70)"');
        right(40, 125, 1, -1);
        desc = 'Segitiga siku-siku dengan alas ' + p.a + ', tinggi ' + p.b + ', sisi miring ' + p.c + ' ' + u; break;
      case 'jajar-genjang':
        poly('65,35 175,35 145,125 35,125');
        dash(65, 35, 65, 125);
        text(120, 28, lab(p.a, u)); text(168, 90, lab(p.s, u), 'start'); text(60, 83, lab(p.t, u), 'end');
        right(65, 125, 1, -1);
        desc = 'Jajar genjang alas ' + p.a + ', tinggi ' + p.t + ', sisi miring ' + p.s + ' ' + u; break;
      case 'trapesium':
        poly('75,35 135,35 185,125 25,125');
        dash(75, 35, 75, 125);
        text(105, 28, lab(p.a, u)); text(105, 145, lab(p.b, u)); text(81, 83, lab(p.t, u), 'start');
        if (p.s != null) text(172, 78, lab(p.s, u), 'start');
        right(75, 125, 1, -1);
        desc = 'Trapesium sisi sejajar ' + p.a + ' dan ' + p.b + ', tinggi ' + p.t + ' ' + u; break;
      case 'belah-ketupat':
        poly('105,15 175,80 105,145 35,80');
        dash(105, 15, 105, 145); dash(35, 80, 175, 80);
        text(112, 112, lab(p.d1, u), 'start'); text(140, 72, lab(p.d2, u), 'middle');
        desc = 'Belah ketupat diagonal ' + p.d1 + ' dan ' + p.d2 + ' ' + u; break;
      case 'layang-layang':
        poly('105,12 170,55 105,148 40,55');
        dash(105, 12, 105, 148); dash(40, 55, 170, 55);
        text(112, 105, lab(p.d1, u), 'start'); text(140, 48, lab(p.d2, u), 'middle');
        desc = 'Layang-layang diagonal ' + p.d1 + ' dan ' + p.d2 + ' ' + u; break;
      case 'lingkaran':
        out.push('<circle class="shape-fill" cx="105" cy="80" r="58" fill="' + fill + '" fill-opacity=".85"/>');
        out.push('<circle class="shape-line" pathLength="1" cx="105" cy="80" r="58" fill="none" stroke="' + C.line + '" stroke-width="3"/>');
        dash(105, 80, 163, 80);
        out.push('<circle class="shape-mark" style="--i:0" cx="105" cy="80" r="3.5" fill="' + C.line + '"/>');
        text(134, 72, 'r = ' + lab(p.r, u)); idx++;
        desc = 'Lingkaran dengan jari-jari ' + p.r + ' ' + u; break;
      default:
        return '';
    }
    return '<svg class="shape-svg is-static" viewBox="-30 0 270 160" role="img" aria-labelledby="t' + (FX._n = (FX._n || 0) + 1) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<title id="t' + FX._n + '">' + esc(desc) + '</title><desc>Gambar bangun datar untuk soal</desc>' + out.join('') + '</svg>';
  };

  /* Animasi gambar bertahap: panggil setelah SVG masuk ke DOM */
  FX.drawShape = function (svg) {
    if (!svg) return;
    svg.classList.remove('is-drawing', 'is-static');
    if (reduced) { svg.classList.add('is-static'); return; }
    void svg.getBoundingClientRect();
    svg.classList.add('is-drawing');
  };

  /* ---------- Pemutar video Menu Utama ---------- */
  FX.videoSlot = function (host, o) {
    o = o || {};
    host.innerHTML =
      '<div class="fx-video is-muted fx-root">' +
        '<div class="fx-video__skeleton fx-skeleton" aria-hidden="true"></div>' +
        '<video muted playsinline preload="metadata" disablepictureinpicture controlslist="nodownload noremoteplayback" aria-label="' + esc(o.label || 'Video panduan') + '"' +
          (o.poster ? ' poster="' + esc(o.poster) + '"' : '') + '></video>' +
        '<button type="button" class="fx-video__hint" aria-label="Nyalakan suara">' + FX.icon('volume-off') + 'Ketuk untuk suara</button>' +
        '<button type="button" class="fx-video__overlay" aria-label="Putar video"><span class="icon-badge lg">' + FX.icon('play') + '</span></button>' +
        '<div class="fx-video__bar">' +
          '<button type="button" class="fx-video__btn" data-a="toggle" aria-label="Jeda">' + FX.icon('pause') + '</button>' +
          '<button type="button" class="fx-video__btn" data-a="replay" aria-label="Ulangi video">' + FX.icon('replay') + '</button>' +
          '<button type="button" class="fx-video__btn" data-a="mute" aria-pressed="true" aria-label="Nyalakan suara">' + FX.icon('volume-off') + '</button>' +
          '<button type="button" class="fx-video__btn" data-a="full" aria-label="Layar penuh">' + FX.icon('fullscreen') + '</button>' +
        '</div>' +
      '</div>';
    var box = host.firstChild, v = box.querySelector('video'), bar = box.querySelector('.fx-video__bar');
    var userPaused = false;

    function setIcon(btn, id) { btn.innerHTML = FX.icon(id); }
    function sync() {
      var m = box.querySelector('[data-a=mute]');
      box.classList.toggle('is-muted', v.muted);
      m.setAttribute('aria-pressed', String(v.muted));
      m.setAttribute('aria-label', v.muted ? 'Nyalakan suara' : 'Matikan suara');
      setIcon(m, v.muted ? 'volume-off' : 'volume-on');
      var t = box.querySelector('[data-a=toggle]');
      setIcon(t, v.paused ? 'play' : 'pause'); t.setAttribute('aria-label', v.paused ? 'Putar' : 'Jeda');
    }
    function tryPlay() {
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () { box.classList.add('needs-tap'); });
    }
    v.addEventListener('loadeddata', function () { box.classList.add('is-ready'); });
    v.addEventListener('playing', function () { box.classList.remove('needs-tap'); box.classList.add('is-playing'); sync(); });
    v.addEventListener('pause', function () { box.classList.remove('is-playing'); sync(); });
    v.addEventListener('ended', function () { box.classList.remove('is-playing'); sync(); if (o.onEnded) o.onEnded(); });
    v.addEventListener('volumechange', sync);
    box.addEventListener('touchstart', function () { box.classList.add('is-touch'); }, { passive: true });

    box.querySelector('.fx-video__overlay').addEventListener('click', function () { v.muted = false; tryPlay(); });
    box.querySelector('.fx-video__hint').addEventListener('click', function () { v.muted = false; if (o.onUnmute) o.onUnmute(true); });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'toggle') { if (v.paused) { userPaused = false; tryPlay(); } else { userPaused = true; v.pause(); } }
      if (a === 'replay') { v.currentTime = 0; userPaused = false; tryPlay(); }
      if (a === 'mute') { v.muted = !v.muted; if (o.onUnmute) o.onUnmute(!v.muted); }
      if (a === 'full') { var f = box.requestFullscreen || box.webkitRequestFullscreen; if (f) f.call(box); }
    });

    // Berhenti saat tab tersembunyi / slot tak terlihat, lanjut otomatis bila bukan dijeda pengguna
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) v.pause(); else if (!userPaused && v.currentTime < (v.duration || Infinity)) tryPlay();
    });
    var io = null;
    if ('IntersectionObserver' in global) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (!en.isIntersecting) v.pause(); else if (!userPaused && !document.hidden && v.src) tryPlay(); });
      }, { threshold: .25 });
      io.observe(box);
    }

    var api = {
      el: box, video: v,
      /** Ganti sumber. version dipakai untuk cache-busting agar siswa langsung dapat video terbaru. */
      setSrc: function (url, version) {
        box.classList.remove('is-ready');
        v.src = url + (version ? (url.indexOf('?') > -1 ? '&' : '?') + 'v=' + encodeURIComponent(version) : '');
        v.load(); userPaused = false; tryPlay();
      },
      pause: function () { v.pause(); },          // panggil saat pindah dari Menu Utama
      resume: function () { if (!userPaused) tryPlay(); },
      setMuted: function (m) { v.muted = !!m; },
      destroy: function () { v.pause(); v.removeAttribute('src'); v.load(); if (io) io.disconnect(); host.innerHTML = ''; }
    };
    if (o.src) api.setSrc(o.src, o.version);
    sync();
    return api;
  };

  /* ---------- Zona seret-lepas ---------- */
  FX.dropzone = function (el, o) {
    o = o || {};
    var input = el.querySelector('input[type=file]');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    function pass(files) {
      files = Array.prototype.slice.call(files || []);
      if (o.accept) {
        var ok = o.accept.split(',').map(function (s) { return s.trim().toLowerCase(); });
        files = files.filter(function (f) {
          var n = f.name.toLowerCase();
          return ok.some(function (a) { return a.charAt(0) === '.' ? n.slice(-a.length) === a : (f.type || '').toLowerCase() === a; });
        });
      }
      if (files.length && o.onFiles) o.onFiles(files);
      else if (!files.length && o.onReject) o.onReject();
    }
    ['dragenter', 'dragover'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.preventDefault(); el.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.preventDefault(); el.classList.remove('is-over'); }); });
    el.addEventListener('drop', function (e) { pass(e.dataTransfer && e.dataTransfer.files); });
    el.addEventListener('click', function () { if (input) input.click(); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (input) input.click(); } });
    if (input) input.addEventListener('change', function () { pass(input.files); input.value = ''; });
  };

  /* ---------- Wizard (biodata -> pilihan soal -> mulai) ---------- */
  FX.wizard = function (el) {
    var steps = Array.prototype.slice.call(el.querySelectorAll('[data-step]')), i = 0;
    function go(n, back) {
      el.classList.toggle('back', !!back);
      steps.forEach(function (s, k) { s.classList.toggle('is-current', k === n); });
      i = n; FX.sfx.play('klik');
      el.dispatchEvent(new CustomEvent('stepchange', { detail: { index: n } }));
    }
    go(0);
    return { next: function () { if (i < steps.length - 1) go(i + 1); }, back: function () { if (i > 0) go(i - 1, true); }, go: go, get index() { return i; } };
  };

  /* ---------- Transisi iris masuk dunia ---------- */
  FX.iris = function (el, fromEl) {
    var r = fromEl ? fromEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    el.style.setProperty('--fx-x', (r.left + r.width / 2) + 'px');
    el.style.setProperty('--fx-y', (r.top + r.height / 2) + 'px');
    el.classList.remove('fx-iris'); void el.offsetWidth; el.classList.add('fx-iris');
    FX.sfx.play('mulai');
  };

  global.FX = FX;
})(window);
