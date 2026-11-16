/* =========================================================
   INTI APLIKASI: router, HUD, dock navigasi, UI helper, efek, dan layar utama
   (pembuka, petunjuk, profil, menu, tujuan, peta, pos, finish)
   Semua layar dirancang muat dalam satu tampilan tanpa scroll halaman.
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio;
  PP.screens = PP.screens || {};
  PP.acts = PP.acts || {};
  PP.ctx = PP.ctx || {};

  /* ---------- helper dasar ---------- */
  // nama gambar lama -> aset baru beresolusi tinggi (assets/img/new/)
  const IMG = {
    ic_pin: 'new/m_pin', ic_book: 'new/m_book', ic_star: 'new/m_star', ic_game: 'new/m_gift', ic_trophy: 'new/ic_trophy',
    ic_help: 'new/m_help', ic_home: 'new/m_home', ic_gear: 'new/ic_gear', ic_check: 'new/m_check', ic_x: 'new/m_x',
    ic_pause: 'new/ic_play', ic_medal: 'new/m_coin', star_gold: 'new/m_star', star_silver: 'new/m_star', star_bronze: 'new/m_star',
    ribbon: 'new/m_check', windmill: 'new/windmill', pine_c: 'new/pine', tree_pink: 'new/tree_pink', house: 'new/cottage'
  };
  PP.imgSrc = n => 'assets/img/' + (IMG[n] || n) + '.png';
  PP.img = (n, cls, alt) => `<img class="px ${cls || ''}" src="${PP.imgSrc(n)}" alt="${alt || ''}" draggable="false">`;
  PP.esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  PP.$ = (sel, root) => (root || document).querySelector(sel);
  PP.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  PP.AV = {
    boy: { name: 'Budi', idle: 'boy_0', walk: ['boy_1', 'boy_2', 'boy_3', 'boy_4'] },
    girl: { name: 'Sari', idle: 'girl_0', walk: ['girl_1', 'girl_2', 'girl_0'] },
    hijab: { name: 'Aisyah', idle: 'hijab_0', walk: ['hijab_1', 'hijab_0'] },
    boy2: { name: 'Raka', idle: 'boy2_0', walk: ['boy2_1', 'boy2_2', 'boy2_3', 'boy2_4'] },
    boy3: { name: 'Dimas', idle: 'boy3_0', walk: ['boy3_1', 'boy3_2', 'boy3_3', 'boy3_4'] },
    girl2: { name: 'Nadia', idle: 'girl2_0', walk: ['girl2_1', 'girl2_2', 'girl2_0'] },
    girl3: { name: 'Putri', idle: 'girl3_0', walk: ['girl3_1', 'girl3_2', 'girl3_0'] },
    hijab2: { name: 'Zahra', idle: 'hijab2_0', walk: ['hijab2_1', 'hijab2_0'] },
    hijab3: { name: 'Salma', idle: 'hijab3_0', walk: ['hijab3_1', 'hijab3_0'] }
  };
  PP.AVORDER = ['boy', 'boy2', 'boy3', 'girl', 'girl2', 'girl3', 'hijab', 'hijab2', 'hijab3'];
  PP.registered = () => !!(S.data.registered && S.data.name && S.data.kelas && S.data.sekolah && PP.AV[S.data.avatar]);
  PP.me = () => PP.AV[S.data.avatar] || PP.AV.boy;
  PP.nm = () => S.data.name || 'Petualang';
  PP.walk = function (img, frames, ms) {            // animasi jalan sederhana; return fungsi stop
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % frames.length; img.src = `assets/img/${frames[i]}.png`; }, ms || 140);
    return () => { clearInterval(t); img.src = `assets/img/${PP.me().idle}.png`; };
  };
  PP.guide = (text, who) => {
    const owl = who === 'owl';
    return `<div class="guide hide-short ${owl ? 'is-owl' : ''}"><div class="guide-pic">${PP.img(owl ? 'owl_0' : 'teacher_0', 'bob')}</div>
      <div class="panel guide-bubble"><b class="guide-name">${owl ? 'Hoo-Pytha' : 'Pak Guru'}</b><p>${text}</p></div></div>`;
  };
  PP.stars = (n, max) => { max = max || 3; let h = '<span class="stars" aria-label="' + n + ' dari ' + max + ' bintang">'; for (let i = 0; i < max; i++) h += PP.img(i < n ? 'star_gold' : 'star_silver', 'st' + (i < n ? '' : ' off')); return h + '</span>'; };
  PP.fmt = n => (Math.round(n * 100) / 100).toString().replace('.', ',');

  /* ---------- toast, modal, konfirmasi ---------- */
  PP.ui = {};
  PP.ui.toast = function (msg, icon) {
    const box = PP.$('#toasts'); if (!box) return;
    const el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = PP.img(icon === 'owl' ? 'owl_2' : icon === 'x' ? 'ic_x' : 'star_gold', 'ti') + '<span>' + PP.esc(msg) + '</span>';
    box.appendChild(el); setTimeout(() => el.classList.add('out'), 2600); setTimeout(() => el.remove(), 3100);
  };
  PP.ui.modal = function (html, opt) {
    opt = opt || {};
    const m = PP.$('#modal'); m.innerHTML = `<div class="modal-back" data-close></div><div class="modal-card panel ${opt.cls || ''}" role="dialog" aria-modal="true">${html}</div>`;
    const prevFocus = document.activeElement; m.hidden = false; document.body.classList.add('modal-open');
    const close = () => { m.hidden = true; m.innerHTML = ''; document.body.classList.remove('modal-open'); opt.onclose && opt.onclose(); try { prevFocus && prevFocus.focus && prevFocus.focus(); } catch (e) { } };
    m._close = close;
    const f = m.querySelector('button, [tabindex]'); f && f.focus();
    return close;
  };
  PP.ui.close = () => { const m = PP.$('#modal'); if (m && !m.hidden) m._close(); };
  PP.ui.confirm = function (msg, yes, onYes) {
    PP.ui.modal(`<p class="modal-text">${msg}</p><div class="row end"><button class="btn" data-close>Batal</button><button class="btn red" id="cfYes">${yes}</button></div>`);
    PP.$('#cfYes').onclick = () => { PP.ui.close(); onYes(); };
  };

  /* ---------- efek: confetti & hadiah misi ---------- */
  PP.ui.confetti = function (n) {
    const fx = PP.$('#fx'); const cols = ['#f7b92b', '#43b33f', '#2f7bd8', '#d9473a', '#7a4ad0', '#fff3c4'];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < (n || 44); i++) {
      const p = document.createElement('i'); p.className = 'conf';
      p.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % cols.length]};--dx:${(Math.random() - 0.5) * 160}px;--r:${Math.random() * 720}deg;animation-delay:${Math.random() * 0.5}s;animation-duration:${1.6 + Math.random() * 1.2}s;width:${6 + Math.random() * 6}px;height:${6 + Math.random() * 6}px`;
      fx.appendChild(p); setTimeout(() => p.remove(), 3400);
    }
  };
  PP.ui.missionComplete = function (o) {
    // o: {title, stars, xp, unlock:'nama lokasi baru', actions:[{label, route, cls}]}
    // urutan suara: misi selesai -> bintang hadiah -> lokasi baru terbuka (tidak saling menimpa)
    A.sfx('mission'); setTimeout(() => A.sfx('star'), 760);
    if (o.unlock) setTimeout(() => A.sfx('unlock'), 1300);
    PP.ui.confetti();
    PP.ui.modal(`<div class="reward">
        <div class="reward-chest">${PP.img('chest_open', 'pop')}</div>
        <h2>${o.title || 'Misi Selesai!'}</h2>
        <div class="reward-stars">${PP.stars(o.stars)}</div>
        ${o.xp ? `<p class="xp-line">+${o.xp} XP</p>` : ''}
        ${o.unlock ? `<p class="unlock-line">${PP.img('ic_pin', 'bi')} Lokasi baru terbuka: ${o.unlock}</p>` : ''}
        <p class="modal-text">${PP.pick(PP.MSG.done)}</p>${o.extra || ''}
        <div class="row center">${(o.actions || []).map(a => `<button class="btn ${a.cls || ''}" data-go="${a.route}" data-close>${a.label}</button>`).join('')}</div></div>`, { cls: 'reward-card' });
  };
  // nama lokasi yang baru terbuka setelah pos `id` selesai (untuk pesan hadiah)
  PP.nextPlace = id => id < 6 ? 'Pos ' + (id + 1) + ' · ' + PP.POS[id].name : 'FINISH';

  /* ---------- router (hash) ---------- */
  let inst = null, first = true, lastNav = 0;
  function parse() {
    const h = (location.hash || '').replace(/^#/, '');
    const i = h.indexOf('-');
    return i < 0 ? { name: h || 'splash', arg: '' } : { name: h.slice(0, i), arg: h.slice(i + 1) };
  }
  PP.go = function (route) {
    A.sfx('page'); lastNav = performance.now();       // satu suara perpindahan, di mana pun dipicunya
    if (location.hash === '#' + route) render(); else location.hash = route;
  };
  const navTrail = [];            // riwayat halaman di dalam game sendiri (tidak bergantung pada history peramban)
  PP.acts.back = () => {
    navTrail.pop();             // halaman sekarang
    let prev = navTrail.pop();
    while (prev && /^(splash|)$/.test(prev)) prev = navTrail.pop();
    PP.go(prev || 'menu');
  };
  const TITLES = { integrasi: 'Integrasi Platform', offline: 'Mode Offline', lkpd: 'LKPD Proyek', buku: 'Buku Digital', rekap: 'Rekap Nilai', lomba: 'Fitur Lomba', misi: 'Misi Harian', toko: 'Toko Kostum', lencana: 'Koleksi Lencana', buatsoal: 'Buat Soal', laporan: 'Sertifikat & Rapor', pendahuluan: 'Kegiatan Pendahuluan', absen: 'Absen Kehadiran', planning: 'Planning Pembelajaran', jalur: 'Jalur Belajar', menu: 'Menu Utama', tujuan: 'Tujuan Pembelajaran', peta: 'Peta Petualangan', materi: 'Materi Pembelajaran', video: 'Video Animasi', eksplorasi: 'Eksplorasi Pythagoras',
    games: 'Game dan Tantangan', jelajah: 'Jelajah Dunia', papan: 'Papan Peringkat', game: 'Game', kuis: 'Kuis Interaktif', refleksi: 'Refleksi', nilai: 'Program Penilaian', petunjuk: 'Petunjuk', profil: 'Profil', pos: 'Pos Petualangan', finish: 'FINISH' };

  function render() {
    const r = parse();
    { const k = (location.hash || '').replace(/^#/, ''); if (navTrail[navTrail.length - 1] !== k) navTrail.push(k); if (navTrail.length > 40) navTrail.shift(); }
    if (inst && inst.unmount) { try { inst.unmount(); } catch (e) {} }
    A.stopNarration();
    PP.ui.close();
    if (!PP.registered() && !/^(splash|petunjuk|profil|)$/.test(r.name)) { PP.ctx.afterProfile = location.hash.replace(/^#/, '') || 'menu'; r.name = 'profil'; r.arg = ''; }
    const fn = PP.screens[r.name] || PP.screens.splash;
    const name = PP.screens[r.name] ? r.name : 'splash';
    let res;
    try { res = fn(r.arg); } catch (e) { console.error(e); res = { html: errorHtml(e) }; }
    const app = PP.$('#app');
    try { if (window.PPServer && PP.registered()) { PPServer.join(); if (name !== 'jelajah' && name !== 'kuis') PPServer.scene('menu'); else if (name === 'kuis') PPServer.scene('kuis'); } } catch (e) {}
    app.className = 'screen scr-' + name;
    app.innerHTML = res.html;
    inst = res;
    document.body.dataset.screen = name;
    PP.$('#hudTitle').textContent = TITLES[name] || '';
    updateHud();
    try { res.mount && res.mount(app, r.arg); } catch (e) { console.error(e); app.innerHTML = errorHtml(e); }
    app.scrollTop = 0; window.scrollTo(0, 0);
    const key = name === 'game' ? 'game-' + r.arg : name;
    A.scene_(key);
    if (!first && performance.now() - lastNav > 400) A.sfx('page');   // dari tombol Kembali browser / tautan langsung
    first = false;
  }
  function errorHtml(e) {
    return `<div class="wrap narrow"><div class="panel pad"><h2>Ups, ada kendala</h2><p>Halaman ini tidak dapat dimuat. Silakan kembali ke menu.</p><p class="muted small">${PP.esc(e && e.message)}</p><button class="btn green" data-go="menu">Ke Menu Utama</button></div></div>`;
  }

  /* ---------- HUD + dock ---------- */
  const DOCK = [['menu', 'Beranda', 'home'], ['peta', 'Peta', 'map'], ['materi', 'Materi', 'book'], ['games', 'Game', 'game'], ['kuis', 'Kuis', 'quiz'], ['jelajah', 'Jelajah', 'explore'], ['nilai', 'Nilai', 'trophy']];
  const DOCK_ON = { integrasi: 'menu', offline: 'menu', lkpd: 'menu', buku: 'menu', rekap: 'menu', lomba: 'menu', misi: 'menu', toko: 'menu', lencana: 'menu', buatsoal: 'menu', laporan: 'menu', pendahuluan: 'menu', absen: 'menu', planning: 'menu', jalur: 'menu', menu: 'menu', tujuan: 'menu', video: 'menu', eksplorasi: 'menu', refleksi: 'menu', petunjuk: 'menu', profil: 'menu', finish: 'menu', peta: 'peta', pos: 'peta', materi: 'materi', games: 'games', game: 'games', kuis: 'kuis', jelajah: 'jelajah', papan: 'nilai', nilai: 'nilai' };
  function buildDock() {
    PP.$('#dock').innerHTML = DOCK.map(d => `<button class="dk" data-go="${d[0]}" data-k="${d[0]}" aria-label="${d[1]}">${PP.ico(d[2])}<span>${d[1]}</span></button>`).join('');
  }
  function updateHud() {
    const me = PP.me(), scr = document.body.dataset.screen, splash = scr === 'splash';
    PP.$('#hudPlayer').innerHTML = `<span class="hud-av">${PP.img(me.idle)}</span><span class="hud-name">${PP.esc(PP.nm())}</span>`;
    PP.$('#hudLv').textContent = 'Lv ' + S.level();
    PP.$('#hudXp').style.width = (S.xpInLevel() / S.XP_PER_LEVEL * 100) + '%';
    PP.$('#hudStars').textContent = S.totalStars();
    PP.$('#hud').hidden = splash; PP.$('#dock').hidden = splash;
    PP.$('#hudBack').style.visibility = scr === 'menu' ? 'hidden' : '';
    const on = DOCK_ON[scr];
    PP.$$('#dock .dk').forEach(b => { const a = b.dataset.k === on; b.classList.toggle('on', a); if (a) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  }
  S.onChange(() => { try { updateHud(); } catch (e) {} });

  /* ---------- panel audio: musik & efek terpisah (ON/OFF + volume) ---------- */
  function audioPanel() {
    const s = A.set, c = A.cfg.tracks, cur = A.curId && c[A.curId];
    const hasNarr = Object.keys(c).some(id => c[id].category === 'narration' && A.hasFile(id));
    const rows = Object.keys(c).filter(id => c[id].available || c[id].category === 'sfx' || c[id].category === 'bgm').map(id => {
      const st = A.status[id];
      const lab = st === 'file' ? 'file' : st === 'synth' ? 'sintetis' : st === 'error' ? 'gagal dimuat' : 'belum ada';
      return `<li class="st-${st}"><span>${id}</span><em>${lab}</em></li>`;
    }).join('');
    const vol = (k, ico) => `<div class="ap-vol"><span aria-hidden="true">${ico}</span><input type="range" min="0" max="1" step="0.05" value="${s[k]}" data-vol="${k}" aria-label="Volume ${k}"><span class="ap-pct">${Math.round(s[k] * 100)}%</span></div>`;
    return `<div class="ap-head"><b>Pengaturan Suara</b><button class="x-btn nosfx" data-act="audio-close" aria-label="Tutup">×</button></div>
      <div class="ap-now"><span class="eq ${A.isPlaying() ? 'on' : ''}"><i></i><i></i><i></i><i></i></span>
        <span class="ap-track">${A.isPlaying() && cur ? 'Memutar: ' + (cur.use.split(',')[0]) : (!s.master ? 'Semua suara dimatikan' : !s.musicOn ? 'Musik dimatikan' : 'Musik belum diputar')}</span></div>
      <div class="ap-ch"><div class="ap-ch-h"><span>Musik latar</span><button class="btn sm ap-sw ${s.musicOn ? 'green' : 'off'}" data-act="music-toggle" aria-pressed="${s.musicOn}">${s.musicOn ? 'ON' : 'OFF'}</button></div>${vol('music', '♪')}</div>
      <div class="ap-ch"><div class="ap-ch-h"><span>Efek suara</span><button class="btn sm ap-sw ${s.sfxOn ? 'green' : 'off'}" data-act="sfx-toggle" aria-pressed="${s.sfxOn}">${s.sfxOn ? 'ON' : 'OFF'}</button></div>${vol('sfx', '♫')}</div>
      ${hasNarr ? `<div class="ap-ch"><div class="ap-ch-h"><span>Narasi</span></div>${vol('narr', '☊')}</div>` : ''}
      <div class="row center tight"><button class="btn sm ${s.master ? '' : 'red'}" data-act="master-toggle">${s.master ? 'Semua suara: ON' : 'Semua suara: MUTE'}</button></div>
      <details class="ap-det"><summary>Status file audio</summary><ul>${rows}</ul>
        <p class="small muted">Daftar audio ada di <code>js/audio-config.js</code>, file di <code>assets/audio/</code>.</p></details>`;
  }
  function refreshAudioUi() {
    const p = PP.$('#audioPanel');
    if (p && !p.hidden && !p.contains(document.activeElement)) p.innerHTML = audioPanel();
    PP.$('#audioBtn').classList.toggle('playing', A.isPlaying());
    PP.$('#audioBtn').classList.toggle('muted', !A.set.master || (!A.set.musicOn && !A.set.sfxOn));
    let seen = false; try { seen = !!localStorage.getItem('pp_hint_seen'); } catch (e) {}
    PP.$('#audioHint').hidden = A.isPlaying() || !A.set.master || !A.set.musicOn || seen || !A.curId || !A.hasFile(A.curId);
  }
  A.on(refreshAudioUi);
  const repaintPanel = () => { const p = PP.$('#audioPanel'); if (p && !p.hidden) p.innerHTML = audioPanel(); };
  PP.acts['audio-toggle'] = () => { const p = PP.$('#audioPanel'); p.hidden = !p.hidden; if (!p.hidden) p.innerHTML = audioPanel(); };
  PP.acts['audio-close'] = () => { PP.$('#audioPanel').hidden = true; };
  PP.acts['music-toggle'] = () => { A.unlock(); A.toggleMusic(); repaintPanel(); };
  PP.acts['master-toggle'] = () => { A.setMaster(!A.set.master); repaintPanel(); };
  PP.acts['sfx-toggle'] = () => { A.setSfx(!A.set.sfxOn); repaintPanel(); };
  document.addEventListener('input', e => {
    const v = e.target.dataset && e.target.dataset.vol;
    if (v) { A.setVol(v, parseFloat(e.target.value)); const pc = e.target.parentNode.querySelector('.ap-pct'); if (pc) pc.textContent = Math.round(e.target.value * 100) + '%'; }
  });
  document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.vol === 'sfx') A.sfx('point_now'); });   // contoh suara saat volume efek diubah

  /* ---------- delegasi klik: satu ketukan = satu suara ---------- */
  let clickStart = 0;
  document.addEventListener('click', () => { clickStart = A.semanticCount; }, true);   // sebelum handler elemen berjalan
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-go],[data-act],[data-close],button,.btn');
    if (!t) return;
    const before = clickStart;
    if (t.matches('[data-close]')) { if (t.classList.contains('modal-back') || t.tagName === 'BUTTON') { if (!t.dataset.go) PP.ui.close(); else setTimeout(PP.ui.close, 0); } }
    if (t.dataset.act && PP.acts[t.dataset.act]) { e.preventDefault(); PP.acts[t.dataset.act](t, e); }
    if (t.dataset.go) { e.preventDefault(); PP.go(t.dataset.go); }
    // suara klik hanya bila tidak ada suara lain (pindah halaman, jawaban, hadiah) yang sudah dibunyikan
    const skip = t.classList.contains('nosfx') || (t.dataset.act && /^audio/.test(t.dataset.act)) || t.matches('.modal-back');
    if (!skip && A.semanticCount === before) A.sfx('click');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { PP.ui.close(); PP.acts['audio-close'](); } });
  window.addEventListener('hashchange', render);
  window.addEventListener('pointerdown', () => { try { localStorage.setItem('pp_hint_seen', '1'); } catch (e) {} PP.$('#audioHint').hidden = true; }, { once: true });

  /* =====================================================
     LAYAR: PEMBUKA
     ===================================================== */
  PP.screens.splash = function () {
    const me = PP.me();
    const has = S.doneCount() > 0 || S.data.name;
    return {
      html: `<div class="splash">
        <div class="sp-bg"></div>
        <div class="cloud k1"></div><div class="cloud k2"></div><div class="cloud k3"></div>
        <div class="sp-deco d-mill"><img src="assets/img/new/windmill.png" alt=""></div>
        <div class="sp-deco d-house"><img src="assets/img/new/cottage.png" alt=""></div>
        <div class="sp-deco d-t3">${PP.deco.pine()}</div>
        <div class="sp-deco d-t4">${PP.deco.tree('#ffa24a', '#e0791f', '#ffd08a')}</div>
        <div class="sp-deco d-t1">${PP.deco.tree()}</div>
        <div class="sp-deco d-t2">${PP.deco.tree('#ff9cc2', '#e0709c', '#ffd0e2')}</div>
        <div class="sp-deco d-b1">${PP.deco.bush()}</div><div class="sp-deco d-b2">${PP.deco.bush('#6fc94f')}</div>
        <div class="sp-deco d-f1">${PP.deco.flower()}</div><div class="sp-deco d-f2">${PP.deco.flower('#ffd34d')}</div><div class="sp-deco d-f3">${PP.deco.flower('#8ec5ff')}</div>
        <div class="sp-deco d-char d-teacher">${PP.img('teacher_2', 'bob')}</div>
        <div class="sp-deco d-char d-player">${PP.img(me.idle, 'bob b2', 'Karakter pemain')}</div>
        <div class="sparks">${Array.from({ length: 12 }, (_, i) => `<i style="left:${(i * 73) % 100}%;animation-delay:${(i * 0.37) % 4}s"></i>`).join('')}</div>
        <div class="sp-owl">${PP.img('owl_0', '', 'Burung hantu pemandu')}</div>
        <div class="sp-main">
          <h1 class="sp-logo"><span class="sr-only">Petualangan Pythagoras</span>${PP.img('logo', 'logo-img float', 'Petualangan Pythagoras')}</h1>
          <p class="sp-sub">Matematika SMP/MTs · Teorema Pythagoras</p>
          <div class="speech" id="spSpeech">Halo, petualang matematika!</div>
          <div class="sp-btns">
            <button class="btn xl green pulse" data-act="start"><span class="tri">▶</span> MULAI PETUALANGAN</button>
            <div class="sp-mini">
              <button class="btn blue" data-go="petunjuk"><img class="bi" src="assets/img/new/m_book.png" alt=""> Petunjuk</button>
              <button class="btn purple" data-go="profil"><img class="bi" src="assets/img/new/m_bag.png" alt=""> Profil</button>
              <button class="btn gold" data-go="nilai"><img class="bi" src="assets/img/new/ic_trophy.png" alt=""> Prestasi</button>
              <button class="btn red" data-act="audio-toggle"><img class="bi" src="assets/img/new/ic_gear.png" alt=""> Suara</button>
            </div>
          </div>
        </div>
        ${has ? `<p class="sp-hello">Selamat datang kembali, <b>${PP.esc(PP.nm())}</b>! Progres tersimpan di perangkat ini.</p>` : ''}
      </div>`,
      mount(root) {
        const owl = PP.$('.sp-owl img', root); let i = 0; const fr = ['owl_0', 'owl_1', 'owl_2', 'owl_1'];
        const t1 = setInterval(() => { i = (i + 1) % fr.length; owl.src = `assets/img/${fr[i]}.png`; }, 420);
        const lines = ['Halo, petualang matematika!', 'Ayo kita temukan rahasia Pythagoras!', 'Siap menjelajah enam pos misi?', 'Jangan menyerah, kamu pasti bisa!'];
        let k = 0; const sp = PP.$('#spSpeech', root);
        const t2 = setInterval(() => { k = (k + 1) % lines.length; sp.textContent = lines[k]; }, 3600);
        this._t = [t1, t2];
      },
      unmount() { (this._t || []).forEach(clearInterval); }
    };
  };
  PP.acts.start = () => {
    A.unlock(); A.sfx('start');
    if (!PP.registered()) { PP.ctx.afterProfile = 'menu'; PP.go('profil'); } else PP.go('menu');
  };

  /* =====================================================
     LAYAR: PETUNJUK
     ===================================================== */
  PP.screens.petunjuk = function () {
    const items = [
      ['ic_pin', 'Jelajahi Peta', 'Mulai dari Pos 1. Pos berikutnya terkunci sampai misi sebelumnya selesai.'],
      ['ic_book', 'Pelajari Materi', 'Setiap pos berisi materi singkat dengan gambar interaktif. Baca dulu, lalu tantang dirimu.'],
      ['ic_game', 'Kerjakan Misi', 'Jawab soal atau mainkan game. Dapatkan 1 sampai 3 bintang sesuai hasilmu.'],
      ['ic_star', 'Kumpulkan XP dan Bintang', 'Setiap jawaban benar dan misi selesai menambah XP, naik level, dan membuka lencana.'],
      ['ic_vol_on', 'Atur Suara', 'Tekan tombol speaker di pojok kanan atas untuk mengatur musik dan efek suara.'],
      ['ic_trophy', 'Capai FINISH', 'Selesaikan keenam pos, lalu lihat hasil belajarmu di Program Penilaian.']
    ];
    return { html: `<div class="wrap narrowish"><div class="panel fill pad">
      <h2 class="h-title">Petunjuk Permainan</h2>
      <ol class="how">${items.map((x, i) => `<li style="--i:${i}"><span class="how-ic">${PP.img(x[0])}</span><div><b>${x[1]}</b><p>${x[2]}</p></div></li>`).join('')}</ol>
      <div class="row center"><button class="btn green" data-act="start">MULAI PETUALANGAN</button><button class="btn" data-go="splash">Kembali</button></div></div></div>` };
  };

  /* =====================================================
     LAYAR: PROFIL
     ===================================================== */
  PP.screens.profil = function () {
    const d = S.data, first = !PP.registered();
    return {
      html: `<div class="wrap narrow"><div class="panel fill pad scrollbox reg">
        <h2 class="h-title">${first ? 'Pendaftaran Penjelajah' : 'Profil Penjelajah'}</h2>
        ${PP.guide(first ? 'Sebelum berpetualang, isi identitasmu dulu ya. Semua kolom wajib diisi.' : 'Kamu bisa mengubah identitas dan karakter di sini.')}
        <form id="pfForm" autocomplete="off" novalidate>
          <div class="pf-grid">
            <label class="fld"><span>Nama lengkap <b class="req">*</b></span><input id="pfName" maxlength="40" value="${PP.esc(d.name)}" placeholder="Tulis namamu" required></label>
            <label class="fld"><span>Kelas <b class="req">*</b></span><input id="pfKelas" maxlength="20" value="${PP.esc(d.kelas)}" placeholder="Contoh: VIII A" required></label>
            <label class="fld pf-wide"><span>Sekolah <b class="req">*</b></span><input id="pfSekolah" maxlength="60" value="${PP.esc(d.sekolah || '')}" placeholder="Contoh: SMP Negeri 1 Pekanbaru" required></label>
          </div>
          <fieldset class="avs avgrid"><legend>Pilih karakter <b class="req">*</b></legend>
            ${PP.AVORDER.map(k => `<label class="av ${PP.registered() && d.avatar === k ? 'on' : ''}"><input type="radio" name="av" value="${k}" ${PP.registered() && d.avatar === k ? 'checked' : ''}><span class="av-pic">${PP.img(PP.AV[k].idle)}</span><span class="av-nm">${PP.AV[k].name}</span></label>`).join('')}
          </fieldset>
          <label class="fld">Kode server / ruangan ${PPNet.configured() ? '' : '(belum aktif)'}
            <span class="rm-row"><input id="pfRoom" maxlength="10" value="${PP.esc(PPNet.room() || PPNet.fromUrl())}" placeholder="${PPNet.configured() ? 'Kosongkan untuk server umum' : 'Online belum aktif'}" ${PPNet.configured() ? '' : 'disabled'} autocapitalize="characters" spellcheck="false"><button class="btn sm nosfx" type="button" id="pfGen" ${PPNet.configured() ? '' : 'hidden'}>Buat kode</button></span></label>
          <p class="err" id="pfErr" hidden></p>
          <div class="row center"><button class="btn green" type="submit">${first ? 'Mulai Petualangan' : 'Simpan Profil'}</button>${first ? '<button class="btn" type="button" data-go="splash">Kembali</button>' : '<button class="btn" type="button" data-act="back">Kembali</button>'}</div>
        </form>
        ${first ? '' : `<details class="ap-det"><summary>Data dan progres</summary>
          <p class="small">Level ${S.level()} · ${d.xp} XP · ${S.doneCount()}/6 misi selesai · ${S.totalStars()} bintang.</p>
          <button class="btn red sm" data-act="reset-ask">Hapus Semua Progres</button></details>`}
        ${S.ok ? '' : '<p class="err">Penyimpanan lokal tidak tersedia di browser ini. Progres tidak akan tersimpan setelah halaman ditutup.</p>'}
      </div></div>`,
      mount(root) {
        PP.$$('input[name=av]', root).forEach(r => r.addEventListener('change', () => { PP.$$('.av', root).forEach(l => l.classList.toggle('on', l.querySelector('input').checked)); A.sfx('tick'); }));
        if (PP.$('#pfGen', root)) PP.$('#pfGen', root).onclick = () => { PP.$('#pfRoom', root).value = PPNet.genRoom(); PP.ui.toast('Kode baru dibuat. Bagikan ke siswa.'); };
        PP.$('#pfRoom', root).addEventListener('input', e => { e.target.value = PPNet.normRoom(e.target.value); });
        const err = m => { const e = PP.$('#pfErr', root); e.textContent = m; e.hidden = !m; };
        PP.$('#pfForm', root).addEventListener('submit', e => {
          e.preventDefault();
          const n = PP.$('#pfName').value.trim(), k = PP.$('#pfKelas').value.trim(), sk = PP.$('#pfSekolah').value.trim(), av = (PP.$('input[name=av]:checked', root) || {}).value;
          if (!n) { err('Nama belum diisi.'); PP.$('#pfName').focus(); return; }
          if (!k) { err('Kelas belum diisi.'); PP.$('#pfKelas').focus(); return; }
          if (!sk) { err('Sekolah belum diisi.'); PP.$('#pfSekolah').focus(); return; }
          if (!av) { err('Pilih salah satu karakter dulu.'); PP.$('.avs', root).scrollIntoView({ block: 'center' }); return; }
          let rc = '';
          if (PPNet.configured()) { rc = PPNet.normRoom(PP.$('#pfRoom').value); if (rc && !PPNet.validRoom(rc)) { err('Kode ruangan harus 3–10 huruf atau angka.'); PP.$('#pfRoom').focus(); return; } }
          err('');
          S.data.name = n; S.data.kelas = k; S.data.sekolah = sk; S.data.avatar = av; S.data.registered = true;
          S.save();
          if (PPNet.configured()) { if (rc) PPNet.setRoom(rc); else if (!PPNet.room()) PPNet.setRoom(PPNet.defaultRoom()); PPNet.sync(); }
          try { window.PPServer && PPServer.join(); } catch (x) {}
          PP.ui.toast('Selamat datang, ' + n + '!');
          const nxt = PP.ctx.afterProfile; PP.ctx.afterProfile = null; PP.go(nxt || 'menu');
        });
      }
    };
  };
  PP.acts['reset-ask'] = () => PP.ui.confirm('Semua progres, nilai, dan pengaturan profil akan dihapus. Lanjutkan?', 'Ya, hapus', () => { S.reset(); PP.ui.toast('Progres dihapus.'); PP.go('splash'); });

  /* =====================================================
     LAYAR: MENU UTAMA — semua fitur dalam satu layar
     ===================================================== */
  PP.screens.menu = function () {
    // [rute, judul, deskripsi, gambar, kelas warna, glyph (tanpa bingkai)]
    const cards = [
      ['pendahuluan', 'Kegiatan Pendahuluan', 'Doa, kesepakatan, lagu, absen.', 'pendahuluan', 'c12'],
      ['tujuan', 'Tujuan Pembelajaran', 'Apa yang akan kamu kuasai.', 'tujuan', 'c1'],
      ['peta', 'Peta Petualangan', 'Enam pos misi menuju FINISH.', 'peta', 'c2'],
      ['materi', 'Materi Pembelajaran', 'Konsep, contoh, dan penerapan.', 'materi', 'c3'],
      ['buku', 'Buku Digital', 'Baca seperti buku asli.', 'materi', 'c14'],
      ['video', 'Video Animasi', 'Tonton penjelasan bergerak.', 'video', 'c4'],
      ['eksplorasi', 'Eksplorasi Pythagoras', 'Ubah sisi, lihat luas persegi.', 'eksplorasi', 'c5'],
      ['games', 'Game dan Tantangan', 'Empat permainan seru.', 'games', 'c6'],
      ['kuis', 'Kuis Interaktif', '15 soal dengan pembahasan.', 'kuis', 'c7'],
      ['refleksi', 'Refleksi', 'Ceritakan apa yang kamu pelajari.', 'refleksi', 'c8'],
      ['nilai', 'Program Penilaian', 'Skor, bintang, dan laporan.', 'nilai', 'c9'],
      ['absen', 'Absen Kehadiran', 'Catat kehadiran siswa.', 'absen', 'c10'],
      ['planning', 'Planning Pembelajaran', 'Panduan dan checklist guru.', 'planning', 'c11'],
      ['lkpd', 'LKPD Proyek', 'Proyek kelompok & presentasi.', 'm_lkpd', 'c15'],
      ['integrasi', 'Integrasi Platform', 'Canva, AI Studio, Zeepquiz, Wordwall.', 'm_integrasi', 'c16'],
      ['offline', 'Mode Offline', 'Pasang & mainkan tanpa internet.', 'm_offline', 'c17'],
      ['lomba', 'Fitur Lomba', 'Rekap, misi, toko, sertifikat.', 'lomba', 'c13']
    ];
    const next = S.nextMission(), n = S.doneCount();
    const msg = n === 0 ? 'Pilih menu. Untuk memulai, buka Peta Petualangan.' : n === 6 ? 'Hebat! Semua pos selesai. Cek hasilmu di Program Penilaian.' : 'Kamu sudah menyelesaikan ' + n + ' dari 6 pos. Ayo lanjutkan!';
    return { html: `<div class="wrap"><div class="hub">
      <div class="hub-side">
        ${PP.guide('Halo, ' + PP.esc(PP.nm()) + '! ' + msg)}
        <div class="panel pad-s prog-card"><div class="pc-top"><div class="pc-l"><b>Progres petualangan</b><div class="bar"><i style="width:${n / 6 * 100}%"></i></div></div><span class="pill">${n}/6 pos</span></div>
          <div class="pc-btns"><button class="btn green sm pc-main" data-go="${next ? 'pos-' + next : 'finish'}">${n === 0 ? 'Mulai di Pos 1' : next ? 'Lanjutkan' : 'Menuju FINISH'}</button>
          <button class="btn gold sm" data-go="jelajah">Jelajah Dunia</button>
          <button class="btn blue sm" data-go="papan">Peringkat</button></div></div>
        <div class="hub-vid fx-root" data-view="menu-video"><div id="hubVid" class="fx-video-slot"></div><div class="hv-cap"><span id="hvCap">Video panduan guru</span><button type="button" class="hv-swap nosfx" id="hvSwap" aria-label="Ganti video (khusus guru)">${window.FX ? FX.icon('swap-video') : ''}<span>Ganti</span></button></div></div>
      </div>
      <div class="menu-grid">${cards.map((c, i) => `<button class="menu-card ${c[4]}" data-go="${c[0]}" style="--i:${i}"><span class="mc-ic"><span class="mc-plate">${PP.ICONS[c[3]]}</span></span><b>${c[1]}</b><span class="mc-d">${c[2]}</span></button>`).join('')}</div></div></div>`,
      mount(root) { const h = root.querySelector('#hubVid'), cap = root.querySelector('#hvCap'); this._v = window.PPVideo ? PPVideo.mount(h, cap) : null; const sw = root.querySelector('#hvSwap'); if (sw) sw.onclick = () => PPVideo && PPVideo.openAdmin(() => PP.go('menu')); },
      unmount() { if (this._v) { this._v(); this._v = null; } } };
  };

  /* =====================================================
     LAYAR: TUJUAN PEMBELAJARAN
     ===================================================== */
  PP.screens.tujuan = function () {
    return { html: `<div class="wrap narrowish"><div class="panel fill pad">
      <h2 class="h-title">Tujuan Pembelajaran</h2>
      <p class="small" style="margin:0">Setelah mengikuti pembelajaran ini, kamu diharapkan mampu:</p>
      <ol class="goals">${PP.TUJUAN.map((g, i) => `<li style="--i:${i}"><span class="g-n">${i + 1}</span><span class="g-ic">${PP.ico(['book', 'clock', 'sides', 'puzzle', 'calc', 'shapes', 'bulb'][i % 7], 'big')}</span><div><b>${g.t}</b><p>${g.d}</p></div></li>`).join('')}</ol>
      <div class="row center"><button class="btn green" data-go="peta">Ke Peta Petualangan</button><button class="btn" data-go="materi">Buka Materi</button></div></div></div>` };
  };

  /* =====================================================
     LAYAR: PETA PETUALANGAN — satu layar penuh
     l = [x%, y%, lebar(satuan)] untuk layar lebar, p = [x%, y%, lebar(% layar)] untuk layar tegak
     ===================================================== */
  const NODES = [
    { spr: ['portal'],                      l: [8, 84, 10],  p: [27, 95, 22] },
    { spr: ['pine_c', 'tree_pink', 'pine_c'], l: [22, 68, 8],  p: [72, 82, 24] },
    { spr: ['school'],                      l: [37, 85, 13],  p: [27, 69, 28] },
    { spr: ['windmill'],                    l: [52, 66, 7],   p: [73, 56, 17] },
    { spr: ['bridge'],                      l: [66, 84, 9],   p: [28, 43, 24] },
    { spr: ['castle'],                      l: [81, 68, 15],  p: [72, 30, 30] }
  ];
  const FIN = { spr: ['finish'], l: [94, 82, 10], p: [48, 16, 26] };

  function trail(pts, vertical) {
    let d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if (vertical) { const my = (y0 + y1) / 2; d += ` C${x0},${my} ${x1},${my} ${x1},${y1}`; }
      else { const mx = (x0 + x1) / 2; d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`; }
    }
    return d;
  }
  function lockSvg() { return '<svg class="lock" viewBox="0 0 12 14" aria-hidden="true"><rect x="1" y="6" width="10" height="8" fill="#5e3716"/><path d="M3 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="#5e3716" stroke-width="2"/><rect x="5" y="8" width="2" height="3" fill="#f7b92b"/></svg>'; }

  PP.screens.peta = function () {
    const done = S.doneCount(), next = S.nextMission(), allDone = done === 6;
    const me = PP.me();
    const all = NODES.concat([FIN]);
    const pl = trail(all.map(n => [n.l[0], n.l[1] - 3]), false), pp = trail(all.map(n => [n.p[0], n.p[1] - 3]), true);
    const hero = `<span class="hero" id="hero">${PP.img(me.idle, '', 'Posisi pemain')}</span>`;
    const vars = n => `--lx:${n.l[0]};--ly:${n.l[1]};--lw:${n.l[2]};--px:${n.p[0]};--py:${n.p[1]};--pw:${n.p[2]};z-index:${Math.round(n.l[1])}`;
    const DEC = [['tree', 3, 46, 11, 3, 24, 9], ['pine', 14, 42, 10, 94, 14, 7], ['tree', 30, 44, 11, 95, 40, 8], ['bush', 44, 90, 5, 4, 60, 5], ['pine', 60, 46, 11, 94, 66, 7], ['tree', 70, 44, 10, 4, 88, 8], ['bush', 94, 52, 5, 95, 88, 5], ['flower', 14, 94, 4, 6, 72, 4], ['flower', 58, 94, 4, 90, 94, 4], ['flower', 88, 95, 4, 10, 38, 4], ['rock', 76, 94, 4, 92, 50, 4]];
    const decor = DEC.map(d => `<span class="md" style="--lx:${d[1]};--ly:${d[2]};--lh:${d[3]};--px:${d[4]};--py:${d[5]};--ph:${d[6]}">${d[0] === 'tree' ? PP.deco.tree(d[1] % 2 ? '#62c24a' : '#ff9cc2', d[1] % 2 ? '#3f9a3a' : '#e0709c') : PP.deco[d[0]]()}</span>`).join('');
    let h = `<div class="wrap wide">
      <div class="map-top panel pad-s"><div class="mt-l"><b>Peta Petualangan</b><div class="bar"><i style="width:${done / 6 * 100}%"></i></div></div>
        <span class="pill">${done}/6</span><span class="pill">${PP.img('star_gold', 'pi')} ${S.totalStars()}</span>
        <button class="btn green sm" data-act="continue">${allDone ? 'Menuju FINISH' : done === 0 ? 'Mulai' : 'Lanjutkan'}</button></div>
      <div class="map-frame"><div class="map" id="map">
        ${decor}<svg class="map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="pl bed" d="${pl}"/><path class="pp bed" d="${pp}"/><path class="pl" d="${pl}"/><path class="pp" d="${pp}"/></svg>`;
    NODES.forEach((n, i) => {
      const id = i + 1, p = PP.POS[i], dn = S.missionDone(id), lk = !S.missionUnlocked(id), st = dn ? S.data.missions[id].stars : 0;
      h += `<button class="node ${dn ? 'done' : ''} ${lk ? 'locked' : ''} ${next === id ? 'current' : ''}" data-act="pos-open" data-id="${id}" style="${vars(n)}" aria-label="Pos ${id}: ${p.name}${lk ? ' (terkunci)' : ''}">
        <span class="node-spr ${n.spr.length > 1 ? 'multi' : ''}">${n.spr.map(s => PP.img(s)).join('')}${next === id ? hero : ''}</span>
        <span class="node-tag"><b>${id}</b>${lk ? lockSvg() : ''}<em>${p.name}</em></span>
        <span class="node-stars">${dn ? PP.stars(st) : ''}</span></button>`;
    });
    h += `<button class="node fin ${allDone ? 'current' : 'locked'}" data-act="finish-open" style="${vars(FIN)}" aria-label="FINISH${allDone ? '' : ' (terkunci)'}">
        <span class="node-spr">${PP.img('finish')}${allDone ? hero : ''}</span><span class="node-tag"><b>★</b>${allDone ? '' : lockSvg()}<em>FINISH</em></span></button>
      </div></div></div>`;
    return {
      html: h,
      mount(root) {
        const hi = PP.$('#hero img', root);
        if (hi) {
          this._stop = PP.walk(hi, me.walk, 160);
          this._t = setTimeout(() => { this._stop && this._stop(); this._stop = null; const hd = PP.$('#hero', root); hd && hd.classList.add('idle'); }, 1200);
          PP.$('#hero', root).classList.add('arrive');
        }
      },
      unmount() { this._stop && this._stop(); clearTimeout(this._t); }
    };
  };

  PP.acts.continue = () => { const n = S.nextMission(); PP.go(n ? 'pos-' + n : 'finish'); };
  PP.acts['finish-open'] = () => {
    if (S.doneCount() === 6) PP.go('finish');
    else { A.sfx('selectPos'); PP.ui.modal(`<h3>FINISH masih terkunci</h3><p class="modal-text">Selesaikan keenam pos terlebih dahulu. Sekarang kamu baru menyelesaikan ${S.doneCount()} pos.</p><div class="row end"><button class="btn green" data-act="continue" data-close>Lanjutkan Petualangan</button></div>`); }
  };
  PP.acts['pos-open'] = (el) => {
    const id = +el.dataset.id, p = PP.POS[id - 1], lk = !S.missionUnlocked(id), dn = S.missionDone(id);
    A.sfx('selectPos');
    PP.ui.modal(`<div class="pos-modal"><div class="pm-pic">${NODES[id - 1].spr.map(s => PP.img(s)).join('')}</div>
      <h3>Pos ${id} · ${p.name}</h3><p class="modal-text"><b>Misi:</b> ${p.mission}</p>
      ${lk ? `<p class="err">Terkunci. Selesaikan Pos ${id - 1} terlebih dahulu.</p>` : `<p class="modal-text">${p.intro}</p>`}
      ${dn ? PP.stars(S.data.missions[id].stars) : ''}
      <div class="row end"><button class="btn" data-close>Tutup</button>${lk ? '' : `<button class="btn green" data-go="pos-${id}" data-close>${dn ? 'Ulangi Misi' : 'MASUK'}</button>`}</div></div>`);
  };

  /* =====================================================
     LAYAR: POS (misi) — dibagi menjadi slide: Misi · Materi · Tantangan
     ===================================================== */
  PP.screens.pos = function (arg) {
    const id = parseInt(arg, 10), p = PP.POS[id - 1];
    if (!p) return { html: errorHtml({ message: 'Pos tidak ditemukan.' }) };
    if (!S.missionUnlocked(id)) {
      return { html: `<div class="wrap narrow"><div class="panel pad center"><h2 class="h-title">Pos ${id} masih terkunci</h2><p>Selesaikan Pos ${id - 1} terlebih dahulu untuk membuka ${p.name}.</p><div class="row center"><button class="btn green" data-go="pos-${id - 1}">Ke Pos ${id - 1}</button> <button class="btn" data-go="peta">Kembali ke Peta</button></div></div></div>` };
    }
    PP.ctx.mission = id;
    const dn = S.missionDone(id);
    const intro = {
      label: 'Misi', title: `Pos ${id} dari 6 · ${p.name}`,
      html: `<div class="pos-head"><div class="pc-pic big">${PP.img(NODES[id - 1].spr[0])}</div>
          <div><h2 class="h-title">${p.name}</h2><p>${p.mission}</p>${dn ? PP.stars(S.data.missions[id].stars) + ' <span class="pill ok">Selesai</span>' : ''}</div></div>
        ${PP.guide(p.intro)}
        <ol class="how sm"><li><div><b>Baca materi</b><p>Geser dengan tombol Berikutnya atau pilih tab di atas.</p></div></li><li><div><b>Kerjakan tantangan</b><p>${p.kind === 'quick' ? 'Jawab 3 pertanyaan, minimal 2 benar.' : 'Mainkan Game ' + p.game + ' dan raih minimal 1 bintang.'}</p></div></li></ol>`
    };
    let challenge;
    if (p.kind === 'quick') {
      challenge = { label: 'Tantangan', title: 'Tantangan Pos ' + id, html: `<p class="small">Jawab 3 pertanyaan. Kamu perlu minimal 2 jawaban benar untuk menyelesaikan misi.</p><div id="qbox"><button class="btn green" data-act="quick-start">Mulai Tantangan</button></div>` };
    } else {
      const names = { A: 'Susun Segitiga', B: 'Temukan Panjang Sisi', C: 'Misi Jembatan', D: 'Tantangan Akhir' };
      challenge = { label: 'Tantangan', title: `Tantangan Pos ${id}: Game ${p.game}`, html: `<div class="qz-intro"><p>Mainkan <b>${names[p.game]}</b> dan raih minimal 1 bintang (skor 50 atau lebih) untuk menyelesaikan misi.</p>
        <button class="btn xl green" data-go="game-${p.game}">Mainkan Game ${p.game}</button></div>` };
    }
    const pages = [intro].concat(p.materi.map(m => ({ lesson: m })), [challenge]);
    const bk = PP.book({ pages, last: { label: 'Kembali ke Peta', route: 'peta' } });
    const mount = bk.mount;
    bk.mount = function (root) { mount.call(this, root); PPAudio.voice('character_mission'); };
    return bk;
  };

  /* --- tantangan cepat (Pos 1 & 3) --- */
  PP.acts['quick-start'] = () => {
    const p = PP.POS[PP.ctx.mission - 1], qs = PP.QUICK[p.pts];
    let i = 0, ok = 0;
    const box = PP.$('#qbox');
    const show = () => {
      const q = qs[i];
      box.innerHTML = `<div class="qq"><p class="q-prog">Pertanyaan ${i + 1} dari ${qs.length}</p><h4 class="q-text">${q.q}</h4>
        <div class="opts grid2">${q.o.map((o, k) => `<button class="opt nosfx" data-k="${k}"><span class="ol">${'ABCD'[k]}</span>${o}</button>`).join('')}</div><div id="qfb"></div></div>`;
      PP.$$('.opt', box).forEach(b => b.onclick = () => {
        if (b.disabled) return;
        const k = +b.dataset.k, right = k === q.a;
        PP.$$('.opt', box).forEach(x => x.disabled = true);
        b.classList.add(right ? 'right' : 'wrong'); PP.$$('.opt', box)[q.a].classList.add('right');
        S.tallyAnswer(right); if (right) { ok++; S.addXP(5, true); }
        A.sfx(right ? 'correct' : 'wrong');
        PP.$('#qfb').innerHTML = `<div class="fb ${right ? 'ok' : 'no'}">${PP.img('owl_' + (right ? 2 : 0), 'fbi')}<div><b>${PP.pick(right ? PP.MSG.right : PP.MSG.wrong)}</b><p>${q.e}</p></div></div>
          <button class="btn green" id="qnext">${i + 1 < qs.length ? 'Lanjut' : 'Lihat Hasil'}</button>`;
        PP.$('#qnext').onclick = () => { i++; i < qs.length ? show() : finish(); };
      });
    };
    const finish = () => {
      if (ok >= 2) {
        const stars = ok === 3 ? 3 : 2, firstTime = S.completeMission(p.id, stars);
        box.innerHTML = `<div class="fb ok">${PP.img('owl_2', 'fbi')}<div><b>Misi selesai! ${ok} dari ${qs.length} benar.</b><p>Kamu mendapat ${stars} bintang.</p></div></div>`;
        const nextId = p.id < 6 ? 'pos-' + (p.id + 1) : 'finish';
        PP.ui.missionComplete({ title: p.name + ' selesai!', stars, xp: firstTime ? 50 + 10 * stars : 0, unlock: firstTime ? PP.nextPlace(p.id) : null,
          actions: [{ label: 'Ke Peta', route: 'peta' }, { label: p.id < 6 ? 'Pos Berikutnya' : 'Menuju FINISH', route: nextId, cls: 'green' }] });
      } else {
        box.innerHTML = `<div class="fb no">${PP.img('owl_0', 'fbi')}<div><b>${ok} dari ${qs.length} benar.</b><p>Perlu minimal 2 benar. Baca lagi materinya lalu coba lagi. Kamu pasti bisa!</p></div></div><button class="btn green" data-act="quick-start">Coba Lagi</button>`;
        A.sfx('end');
      }
    };
    show();
  };

  /* =====================================================
     LAYAR: FINISH
     ===================================================== */
  PP.screens.finish = function () {
    if (S.doneCount() < 6) {
      return { html: `<div class="wrap narrow"><div class="panel pad center"><h2 class="h-title">FINISH belum terbuka</h2><p>Selesaikan keenam pos dulu. Baru ${S.doneCount()} pos yang selesai.</p><button class="btn green" data-act="continue">Lanjutkan Petualangan</button></div></div>` };
    }
    S.award('finish', true);
    if (!S.data.finish) { S.data.finish = true; S.save(); }
    const pr = S.predikat(S.finalScore());
    return {
      html: `<div class="wrap narrowish"><div class="panel fill pad center finish">
        <div class="fin-banner">${PP.img('finish', 'float')}</div>
        <h2 class="h-title">Selamat, ${PP.esc(PP.nm())}!</h2>
        <p style="margin:0">Kamu berhasil menaklukkan semua pos dan mencapai garis FINISH.</p>
        <div class="fin-chest">${PP.img('chest_open', 'pop')}</div>
        <div class="fin-stats" style="width:100%"><div><b>${S.totalStars()}</b><span>Bintang</span></div><div><b>Lv ${S.level()}</b><span>Level</span></div><div><b>${S.data.xp}</b><span>XP</span></div><div><b>${S.finalScore()}</b><span>Nilai Akhir</span></div></div>
        <p class="pill big">Predikat: ${pr.t}</p>
        <div class="row center"><button class="btn green" data-go="nilai">Lihat Hasil Belajar</button><button class="btn" data-go="kuis">Kerjakan Kuis</button><button class="btn" data-go="menu">Menu Utama</button></div></div></div>`,
      mount() { setTimeout(() => { A.sfx('victory'); PP.ui.confetti(70); }, 300); }
    };
  };

  /* ---------- inisialisasi ---------- */
  function boot() {
    S.load();
    buildDock();
    PP.$('#audioBtn').addEventListener('click', () => PP.acts['audio-toggle']());
    PP.$('#hudBack').addEventListener('click', () => PP.acts.back());
    render();
    refreshAudioUi();
  }
  let _errT = 0; window.addEventListener('error', e => { try { if (!e.error && !e.message) return; console.warn('[PP error]', e.message, e.filename, e.lineno); const n = Date.now(); if (n - _errT < 4000) return; _errT = n; PP.ui.toast('Terjadi kesalahan kecil. Coba lagi.', 'x'); } catch (_) {} });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
