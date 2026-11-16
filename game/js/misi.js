/* =========================================================
   MISI HARIAN, STREAK, LENCANA, TOKO & LEMARI KOSTUM.
   Data: S.data.lomba = {misi, streak, badges, own, worn, cnt}. Koin memakai S.data.explore.coins.
   Misi dipilih deterministik dari tanggal lokal (benih = YYYY-MM-DD) agar sama untuk semua siswa.
   Kostum: lapisan 48x72 (sheet 4x3) digambar di atas/bawah sprite lewat PPCostume.
   ========================================================= */
(function () {
  'use strict';
  const S = () => window.PPStore;
  const IMG = n => `assets/lomba/${n}`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => iso(new Date());
  const dayNum = s => { const [y, m, d] = s.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
  const weekKey = s => { const n = dayNum(s); return String(Math.floor((n + 3) / 7)); };   // Senin = awal pekan
  const M = {}; const listeners = [];
  M.onChange = f => { listeners.push(f); return () => { const i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); }; };
  const emit = () => listeners.slice().forEach(f => { try { f(); } catch (e) { } });
  function L() {
    const d = S().data; d.lomba = d.lomba || {}; const l = d.lomba;
    l.badges = l.badges || {}; l.worn = l.worn || {}; l.own = l.own || {};
    l.cnt = Object.assign({ benar: 0, combo: 0, maxCombo: 0, mandiri: 0, miring: 0, tegak: 0, kasus: 0, buat: 0 }, l.cnt || {});
    l.misi = l.misi || { date: '', prog: {}, done: {}, bonus: 0, seen: [] };
    l.streak = l.streak || { last: '', n: 0, shield: '' };
    return l;
  }
  M.data = L;
  const coins = () => { const e = S().data.explore; return e ? e.coins | 0 : 0; };
  const addCoins = n => { const e = S().data.explore = S().data.explore || {}; e.coins = (e.coins | 0) + n; };

  /* ---------- misi ---------- */
  const POOL = [
    { id: 'benar5', t: 'Jawab 5 kuis Jelajah dengan benar', need: 5 },
    { id: 'beruntun3', t: 'Dapatkan 3 jawaban benar berturut-turut', need: 3 },
    { id: 'kasus1', t: 'Pelajari 1 studi kasus', need: 1 },
    { id: 'sapa3', t: 'Sapa 3 warga', need: 3 },
    { id: 'mandiri2', t: 'Jawab 2 soal tanpa petunjuk', need: 2 },
    { id: 'koin20', t: 'Kumpulkan 20 koin dari kuis', need: 20 }
  ];
  const seedPick = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } const a = POOL.slice(), out = []; while (out.length < 3) { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; out.push(a.splice(h % a.length, 1)[0]); } return out; };
  M.today = () => seedPick(today());
  function roll() { const l = L(), t = today(); if (l.misi.date !== t) l.misi = { date: t, prog: {}, done: {}, bonus: 0, seen: [] }; }
  function touch() {
    const l = L(), st = l.streak, t = today(); if (st.last === t) return;
    if (!st.last) st.n = 1;
    else { const gap = dayNum(t) - dayNum(st.last); if (gap === 1) st.n++; else if (gap === 2 && st.shield !== weekKey(t)) { st.shield = weekKey(t); st.n++; M.toast('Perisai libur dipakai: streak aman!'); } else if (gap > 0) st.n = 1; }
    st.last = t;
  }
  M.toast = (m) => { try { PP.ui.toast(m); } catch (e) { } };
  const sfx = n => { try { PPAudio.sfx(n); } catch (e) { } };
  function doneMisi(m) {
    const l = L(); l.misi.done[m.id] = 1; addCoins(8); S().addXP(6, true); M.toast('Misi selesai: ' + m.t + ' (+8 koin)'); sfx('mission');
    if (M.today().every(x => l.misi.done[x.id]) && !l.misi.bonus) { l.misi.bonus = 1; addCoins(20); S().addXP(15, true); M.toast('Semua misi hari ini selesai! Bonus +20 koin'); }
  }
  /* ---------- lencana ---------- */
  const cnt = k => L().cnt[k] | 0, solved = () => Object.keys((S().data.explore || {}).solved || {}).length, done = i => !!((S().data.explore || {}).done || {})[i];
  const BADGES = [
    { id: 'benar_pertama', t: 'Benar Pertama', d: 'Jawab satu soal Jelajah dengan benar.', img: 'benar_pertama', ok: () => cnt('benar') >= 1 },
    { id: 'warga_10', t: '10 Warga Terbantu', d: 'Bantu 10 warga di dunia Jelajah.', img: 'warga_10', ok: () => solved() >= 10 },
    { id: 'tiga_dunia', t: 'Penjelajah Tiga Dunia', d: 'Selesaikan dunia 1, 2, dan 3.', img: 'tiga_dunia', ok: () => done(0) && done(1) && done(2) },
    { id: 'pemburu_tripel', t: 'Pemburu Tripel', d: 'Jawab benar 15 soal Jelajah.', img: 'pemburu_tripel', ok: () => cnt('benar') >= 15 },
    { id: 'mandiri', t: 'Mandiri Tanpa Petunjuk', d: 'Jawab benar 10 soal tanpa petunjuk.', img: 'mandiri_tanpa_petunjuk', ok: () => cnt('mandiri') >= 10 },
    { id: 'streak5', t: 'Streak 5 Hari', d: 'Bermain 5 hari berturut-turut.', img: 'streak_5_hari', ok: () => L().streak.n >= 5 },
    { id: 'juara', t: 'Juara Kelas', d: 'Nilai akhir minimal 85.', img: 'juara_kelas', ok: () => S().finalScore() >= 85 },
    { id: 'kilat', t: 'Kilat', d: '5 jawaban benar berturut-turut.', img: 'kilat', ok: () => cnt('maxCombo') >= 5 },
    { id: 'miring', t: 'Ahli Sisi Miring', d: 'Jawab benar 5 soal mencari sisi miring.', img: 'ahli_sisi_miring', ok: () => cnt('miring') >= 5 },
    { id: 'tegak', t: 'Ahli Sisi Tegak', d: 'Jawab benar 5 soal mencari sisi siku-siku.', img: 'ahli_sisi_tegak', ok: () => cnt('tegak') >= 5 },
    { id: 'pembuktian', t: 'Ilmuwan Pembuktian', d: 'Nilai kuis interaktif minimal 80.', img: 'ilmuwan_pembuktian', ok: () => { const q = S().data.quiz; return !!(q && q.best && q.best.score >= 80); } },
    { id: 'misi_tuntas', t: 'Misi Tuntas', d: 'Selesaikan ketiga misi harian dalam sehari.', img: 'misi_tuntas', ok: () => !!L().misi.bonus || !!L().badges.misi_tuntas },
    { id: 'kolektor', t: 'Kolektor Kostum', d: 'Miliki 5 kostum.', img: 'kolektor_kostum', ok: () => Object.keys(L().own).length >= 5 },
    { id: 'pembuat', t: 'Pembuat Soal', d: 'Buat 1 soal sendiri.', img: 'pembuat_soal', ok: () => cnt('buat') >= 1 },
    { id: 'nusantara', t: 'Penjelajah Nusantara', d: 'Bantu semua warga di dunia Nusantara.', img: 'penjelajah_nusantara', ok: () => done(5) || !!L().badges.nusantara }
  ];
  M.BADGES = BADGES;
  function check() {
    const l = L(); let got = false;
    BADGES.forEach(b => { if (!l.badges[b.id]) { let ok = false; try { ok = b.ok(); } catch (e) { } if (ok) { l.badges[b.id] = Date.now(); got = true; S().addXP(10, true); M.toast('Lencana baru: ' + b.t + '!'); sfx('star'); } } });
    return got;
  }
  M.check = () => { try { if (check()) S().save(); } catch (e) { } emit(); };
  /* ---------- peristiwa dari game ---------- */
  M.ev = function (name, o) {
    try {
      o = o || {}; touch(); roll(); const l = L(), c = l.cnt, mp = l.misi.prog, need = {}; POOL.forEach(p => { need[p.id] = p.need; });
      const set = (id, v) => { if (!M.today().some(x => x.id === id) || l.misi.done[id]) return; mp[id] = Math.min(need[id], v); if (mp[id] >= need[id]) doneMisi(POOL.find(p => p.id === id)); };
      if (name === 'benar') {
        c.benar++; c.combo++; c.maxCombo = Math.max(c.maxCombo, c.combo); if (!o.hint) c.mandiri++; if (o.kind === 'miring') c.miring++; if (o.kind === 'tegak') c.tegak++;
        set('benar5', (mp.benar5 | 0) + 1); set('beruntun3', c.combo); if (!o.hint) set('mandiri2', (mp.mandiri2 | 0) + 1); set('koin20', (mp.koin20 | 0) + (o.coins | 0));
      } else if (name === 'salah') { c.combo = 0; }
      else if (name === 'kasus') { c.kasus++; set('kasus1', (mp.kasus1 | 0) + 1); }
      else if (name === 'sapa') { const k = String(o.name || ''); if (k && l.misi.seen.indexOf(k) < 0) { l.misi.seen.push(k); set('sapa3', l.misi.seen.length); } }
      else if (name === 'buat') { c.buat++; }
      check(); S().save(); emit();
    } catch (e) { console.error(e); }
  };
  M.start = () => { try { touch(); roll(); check(); S().save(); } catch (e) { } };

  /* ---------- kostum ---------- */
  const ITEMS = [
    { id: 'hat1', c: 'h1', slot: 'topi', n: 'Topi Petualang', p: 30 }, { id: 'hat2', c: 'h2', slot: 'topi', n: 'Topi Ajaib', p: 60 },
    { id: 'scarf1', c: 's1', slot: 'syal', n: 'Syal Merah', p: 25 }, { id: 'scarf2', c: 's2', slot: 'syal', n: 'Syal Biru', p: 25 },
    { id: 'glasses1', c: 'g1', slot: 'kacamata', n: 'Kacamata Bulat', p: 25 }, { id: 'glasses2', c: 'g2', slot: 'kacamata', n: 'Kacamata Hitam', p: 45 },
    { id: 'cape1', c: 'c1', slot: 'jubah', n: 'Jubah Merah', p: 60, bw: 1 }, { id: 'cape2', c: 'c2', slot: 'jubah', n: 'Jubah Ungu', p: 90, bw: 1 },
    { id: 'staff1', c: 't1', slot: 'tongkat', n: 'Tongkat Kayu', p: 40 }, { id: 'staff2', c: 't2', slot: 'tongkat', n: 'Tongkat Bintang', p: 80 },
    { id: 'wings1', c: 'w1', slot: 'sayap', n: 'Sayap Putih', p: 100, bw: 1 }, { id: 'wings2', c: 'w2', slot: 'sayap', n: 'Sayap Kupu-kupu', p: 140, bw: 1 }
  ];
  const BUD = [{ id: 'bud_blangkon', c: 'bl', slot: 'kepala', p: 'karakter/budaya/budaya_blangkon.png' }, { id: 'bud_caping', c: 'ca', slot: 'kepala', p: 'karakter/budaya/budaya_caping.png' }, { id: 'bud_ikat', c: 'ik', slot: 'kepala', p: 'karakter/budaya/budaya_ikat_kepala.png' }, { id: 'bud_peci', c: 'pe', slot: 'kepala', p: 'karakter/budaya/budaya_peci.png' }, { id: 'bud_batik', c: 'ba', slot: 'kain', p: 'karakter/budaya/budaya_kain_batik.png' }, { id: 'bud_kebaya', c: 'ke', slot: 'kebaya', p: 'karakter/budaya/budaya_kebaya.png' }, { id: 'bud_selendang', c: 'se', slot: 'selendang', p: 'karakter/budaya/budaya_selendang.png' }];
  const SLOT = { topi: 'ikon_kategori_topi', syal: 'ikon_kategori_syal', kacamata: 'ikon_kategori_kacamata', jubah: 'ikon_kategori_jubah', tongkat: 'ikon_kategori_tongkat', sayap: 'ikon_kategori_sayap' };
  const SLOTN = { topi: 'Topi', syal: 'Syal', kacamata: 'Kacamata', jubah: 'Jubah', tongkat: 'Tongkat', sayap: 'Sayap' };
  const UNDER = ['sayap', 'jubah'], OVER = ['kain', 'kebaya', 'selendang', 'syal', 'jubah', 'kacamata', 'topi', 'kepala', 'tongkat'];
  const byCode = {}; ITEMS.forEach(i => { byCode[i.c] = i; }); BUD.forEach(i => { byCode[i.c] = i; });
  const cache = {};
  const img = path => { if (!cache[path]) { const i = new Image(); i.src = IMG(path); cache[path] = i; } return cache[path]; };
  const P = {};
  P.ITEMS = ITEMS;
  P.str = worn => ITEMS.filter(i => worn[i.slot] === i.id).map(i => i.c).join(',').slice(0, 24);
  P.mine = () => P.str(L().worn);
  P.parse = s => String(s || '').split(',').map(c => byCode[c]).filter(Boolean);
  const DX = 0, DY = 0;                                   // koreksi sejajar bila perlu
  function cell(ctx, im, h, row, col) { if (!im || !im.complete || !im.naturalWidth) return; const w = h * 48 / 72; ctx.drawImage(im, col * 48, row * 72, 48, 72, -w / 2 + DX, -h + DY, w, h); }
  function pose(h, amp, t) { return amp > 0.2 ? { row: 1, col: Math.floor(t * 6) % 2 ? 1 : 3 } : { row: 0, col: 0 }; }
  P.layer = function (ctx, outfit, h, amp, t, under) {
    if (!outfit) return; const it = P.parse(outfit); if (!it.length) return; const ps = pose(h, amp || 0, t || 0);
    (under ? UNDER : OVER).forEach(sl => it.filter(i => i.slot === sl).forEach(i => { if (under) cell(ctx, img('karakter/kostum/' + i.id + '_bawah.png'), h, ps.row, ps.col); else cell(ctx, img(i.p || ('karakter/kostum/' + i.id + '.png')), h, ps.row, ps.col); }));
  };
  P.preload = () => { BUD.forEach(i => img(i.p)); }; P.preload2 = () => ITEMS.forEach(i => { img('karakter/kostum/' + i.id + '.png'); if (i.bw) img('karakter/kostum/' + i.id + '_bawah.png'); });
  /* sinkron ke pemain lain: rooms/{KODE}/outfit/{idPemain} = "h1,c2" */
  P.map = {};
  P.of = id => P.map[id] || '';
  P.pushMine = () => { try { if (window.PPCloud && window.PPNet && PP.registered()) PPCloud.put('outfit/' + PPNet.id(), P.mine()); } catch (e) { } };
  P.watchAll = () => PPCloud.watch('outfit', v => { P.map = v && typeof v === 'object' ? v : {}; }, 12000);
  window.PPCostume = P; P.preload(); P.preload2();

  /* ---------- layar ---------- */
  const flame = n => `<span class="ms-flame"><img src="${IMG('ikon/ikon_streak_api.png')}" alt="" class="px"><b>${n}</b></span>`;
  PP.screens.misi = function () {
    let off = null;
    return {
      html: '<div class="wrap narrowish"><div class="panel fill pad ms" id="msR"></div></div>',
      unmount() { off && off(); },
      mount(root) {
        const box = PP.$('#msR', root);
        const draw = () => {
          roll(); const l = L(), ms = M.today(), t = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }), shield = l.streak.shield === weekKey(today());
          box.innerHTML = `<div class="ms-top"><div><h2 class="h-title" style="margin:0">Misi Harian</h2><p class="small" style="margin:0">${esc(t)} · sama untuk semua siswa</p></div><div class="ms-str" title="Hari berturut-turut">${flame(l.streak.n | 0)}<small>hari</small>${shield ? `<img class="px ms-sh" src="${IMG('ikon/ikon_perisai_libur.png')}" alt="Perisai libur terpakai pekan ini">` : ''}</div></div>
            <div class="ms-list">${ms.map(m => { const v = l.misi.done[m.id] ? m.need : (l.misi.prog[m.id] | 0); return `<div class="ms-card ${l.misi.done[m.id] ? 'ok' : ''}"><img class="px" src="${IMG('ikon/' + (l.misi.done[m.id] ? 'ikon_misi_selesai' : 'ikon_misi_harian') + '.png')}" alt=""><div class="ms-t"><b>${esc(m.t)}</b><div class="bar"><i style="width:${v / m.need * 100}%"></i></div><small>${v}/${m.need} · hadiah 8 koin + 6 XP</small></div></div>`; }).join('')}</div>
            <div class="ms-bonus ${l.misi.bonus ? 'ok' : ''}"><img class="px" src="${IMG('ikon/ikon_bonus_misi.png')}" alt=""><span><b>Bonus 3 misi</b><small>${l.misi.bonus ? 'Sudah diambil: +20 koin, +15 XP' : 'Selesaikan semua misi: +20 koin dan +15 XP'}</small></span></div>
            <p class="small ab-note">Misi bertambah dari kegiatan di dunia Jelajah. Streak: bermain tiap hari. Satu hari libur per pekan dilindungi perisai. Reset pukul 00.00.</p>
            <div class="row center"><button class="btn green" data-go="jelajah">Ke Jelajah</button><button class="btn" data-go="lencana">Lencana</button><button class="btn gold" data-go="toko">Toko Kostum</button></div>`;
        };
        off = M.onChange(draw); draw();
      }
    };
  };
  PP.screens.lencana = function () {
    return {
      html: '<div class="wrap narrowish"><div class="panel fill pad ms" id="lcR"></div></div>',
      mount(root) {
        const box = PP.$('#lcR', root); M.check(); const l = L(), n = BADGES.filter(b => l.badges[b.id]).length;
        box.innerHTML = `<div class="ms-top"><div><h2 class="h-title" style="margin:0">Koleksi Lencana</h2><p class="small" style="margin:0">${n} dari ${BADGES.length} terbuka</p></div></div><div class="lc-grid scrollbox">${BADGES.map(b => `<button class="lc ${l.badges[b.id] ? 'on' : ''}" data-b="${b.id}" aria-label="${esc(b.t)}${l.badges[b.id] ? '' : ' (terkunci)'}"><img class="px" src="${IMG('lencana/' + (l.badges[b.id] ? 'lencana_' + b.img : 'lencana_terkunci') + '.png')}" alt=""><span>${esc(b.t)}</span></button>`).join('')}</div>`;
        box.onclick = e => { const b = e.target.closest('[data-b]'); if (!b) return; const x = BADGES.find(y => y.id === b.dataset.b), got = l.badges[x.id]; PP.ui.modal(`<h3>${esc(x.t)}</h3><div class="lc-big"><img class="px ${got ? 'lc-pop' : ''}" src="${IMG('lencana/' + (got ? 'lencana_' + x.img : 'lencana_terkunci') + '.png')}" alt=""></div><p class="modal-text">${esc(x.d)}</p><p class="small muted">${got ? 'Didapat ' + new Date(got).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Belum terbuka'}</p><div class="row end"><button class="btn green" data-close>Tutup</button></div>`); };
      }
    };
  };
  PP.screens.toko = function () {
    let tab = 'toko', ts = 0, raf = 0;
    return {
      html: '<div class="wrap narrowish"><div class="panel fill pad ms" id="tkR"></div></div>',
      unmount() { cancelAnimationFrame(raf); },
      mount(root) {
        const box = PP.$('#tkR', root);
        const draw = () => {
          const l = L(), own = l.own, worn = l.worn;
          box.innerHTML = `<div class="ms-top"><div><h2 class="h-title" style="margin:0">${tab === 'toko' ? 'Toko Kostum' : 'Lemari Gaya'}</h2><p class="small" style="margin:0">Kostum terlihat juga oleh temanmu di Jelajah.</p></div><span class="pill big tk-coin"><img class="px" src="assets/img/new/m_star.png" alt="" style="width:18px"> ${coins()} koin</span></div>
            <div class="ab-tabs"><button class="ab-tab ${tab === 'toko' ? 'on' : ''}" data-t="toko">Toko</button><button class="ab-tab ${tab === 'lemari' ? 'on' : ''}" data-t="lemari">Lemari Gaya</button></div>
            <div class="tk-main"><div class="tk-prev"><canvas id="tkC" width="180" height="240" aria-label="Pratinjau karakter"></canvas><small>${P.parse(P.str(worn)).map(i => esc(i.n)).join(', ') || 'Belum memakai kostum'}</small></div>
            <div class="tk-grid scrollbox">${ITEMS.filter(i => tab === 'toko' || own[i.id]).map(i => { const o = own[i.id], on = worn[i.slot] === i.id; return `<div class="tk-it ${on ? 'on' : ''}"><img class="px" src="${IMG('karakter/kostum/' + i.id + '.png')}" alt="" style="object-fit:none;object-position:0 0;width:48px;height:72px" data-fix><b>${esc(i.n)}</b><small><img class="px" src="${IMG('ikon/' + SLOT[i.slot] + '.png')}" alt="" style="width:14px;height:14px;vertical-align:-2px"> ${SLOTN[i.slot]}</small>${tab === 'toko' ? (o ? '<em class="tk-own">Dimiliki</em>' : `<button class="btn sm gold" data-buy="${i.id}">${i.p} koin</button>`) : `<button class="btn sm ${on ? '' : 'green'}" data-wear="${i.id}">${on ? 'Lepas' : 'Pakai'}</button>`}</div>`; }).join('') || '<p class="small" style="grid-column:1/-1">Lemari masih kosong. Beli kostum di Toko dulu.</p>'}</div></div>`;
          PP.$$('[data-t]', box).forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
          PP.$$('[data-buy]', box).forEach(b => b.onclick = () => { const i = ITEMS.find(x => x.id === b.dataset.buy); if (coins() < i.p) { PP.ui.toast('Koin belum cukup. Jawab soal di Jelajah untuk dapat koin.'); sfx('wrong'); return; } addCoins(-i.p); l.own[i.id] = 1; l.worn[i.slot] = i.id; S().save(); P.pushMine(); sfx('star'); PP.ui.toast(i.n + ' dibeli dan dipakai!'); M.check(); draw(); });
          PP.$$('[data-wear]', box).forEach(b => b.onclick = () => { const i = ITEMS.find(x => x.id === b.dataset.wear); if (l.worn[i.slot] === i.id) delete l.worn[i.slot]; else l.worn[i.slot] = i.id; S().save(); P.pushMine(); sfx('tick'); draw(); });
          cancelAnimationFrame(raf); const cv = PP.$('#tkC', box); if (!cv) return; const g = cv.getContext('2d'), me = PP.me(); const bi = new Image(); bi.src = 'assets/img/' + me.idle + '.png'; let bodyImg = null;
          const find = () => { try { const nm = PP.img(me.idle); const m = /src="([^"]+)"/.exec(nm); if (m) { bi.src = m[1]; } } catch (e) { } }; find();
          const loop = t => { ts = t / 1000; g.clearRect(0, 0, 180, 240); g.save(); g.translate(90, 226); g.imageSmoothingEnabled = false; const out = P.str(l.worn); P.layer(g, out, 200, 0, ts, true); if (bi.complete && bi.naturalWidth) { const h = 200, w = h * bi.naturalWidth / bi.naturalHeight; g.imageSmoothingEnabled = true; g.drawImage(bi, -w / 2, -h + Math.sin(ts * 2) * 1.5, w, h); g.imageSmoothingEnabled = false; } P.layer(g, out, 200, 0, ts, false); g.restore(); raf = requestAnimationFrame(loop); };
          raf = requestAnimationFrame(loop);
        };
        draw();
      }
    };
  };
  setTimeout(() => { M.start(); }, 1200);
  window.PPMisi = M;
})();
