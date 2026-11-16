/* =========================================================
   Layar PERSIAPAN "Jelajah Dunia": biodata -> pilihan soal -> mulai.
   Membungkus PP.screens.jelajah (explore.js) tanpa mengubah isinya.
   Sesi soal (PP.JSESS.map) mengganti ISI soal tiap warga; kunci kemajuan tetap
   id lama, sehingga progres/dunia/hadiah lama tidak rusak.
   Sumber soal: Soal Unggahan Guru (Bank Soal) | Soal Otomatis (PPGen) | Campuran.
   Bila soal unggahan belum ada, game tetap jalan dengan soal otomatis/bawaan.
   ========================================================= */
(function () {
  'use strict';
  const S = () => window.PPStore, orig = PP.screens.jelajah;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const J = PP.JSESS = PP.JSESS || { map: {}, ready: false, lastUn: 0, cfg: null };
  const shuf = a => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[x[i], x[j]] = [x[j], x[i]]; } return x; };
  const DEF = { src: 'upload', topic: 'all', batch: 'all', lv: 'Semua', n: 10 };
  const SRC = [
    ['upload', 'Soal Unggahan Guru', 'soal-unggahan', 'Dari Bank Soal kelas'],
    ['auto', 'Soal Otomatis', 'auto-soal', 'Dibuat acak oleh game'],
    ['mix', 'Campuran', 'sparkle', 'Unggahan + otomatis'],
    ['default', 'Soal Bawaan', 'map', 'Soal petualangan asli']
  ];
  const avail = (c) => {
    const bank = window.PPBank ? PPBank.pool({ topic: c.topic, batch: c.batch, lv: c.lv }).length : 0;
    return { upload: bank, auto: 999, mix: 999, default: (PP.xIds ? PP.xIds().length : 0) };
  };
  /* susun peta soal dari pengaturan */
  J.build = function (c) {
    const ids = PP.xIds ? PP.xIds() : [], map = {}; J.cfg = c;
    if (c.src === 'default') { J.map = {}; J.ready = true; return 0; }
    const n = Math.min(c.n, ids.length); let pool = [];
    const up = window.PPBank ? shuf(PPBank.pool({ topic: c.topic, batch: c.batch, lv: c.lv })) : [];
    const au = () => PPGen.batch(n, Math.floor(Math.random() * 4e9), { topics: c.topic !== 'all' && PPGen.TOPICS.some(t => t.id === c.topic) ? [c.topic] : null, lv: c.lv });
    if (c.src === 'upload') pool = up.slice(0, n);
    else if (c.src === 'auto') pool = au();
    else { const a = au(); for (let i = 0; i < n; i++) { const p = i % 2 === 0 && up.length ? up.shift() : a[i]; if (p) pool.push(p); } }
    pool.slice(0, n).forEach((it, i) => { if (ids[i] !== undefined) map[ids[i]] = it; });
    J.map = map; J.ready = true; return Object.keys(map).length;
  };
  PP.screens.jelajah = function () {
    const inner = orig(); let host = null, wiz = null;
    const start = () => { J.ready = true; host.classList.remove('js-on'); host.innerHTML = inner.html; inner.mount(host); };
    return {
      html: '<div id="jsHost" class="js-host fx-root"></div>',
      mount(root) {
        host = root.querySelector('#jsHost'); document.body.dataset.jsetup = '1';
        if (J.ready && Date.now() - J.lastUn < 2500) { start(); return; }   /* pindah dunia: tidak mengulang persiapan */
        J.ready = false; J.map = {}; wizard();
      },
      unmount() { J.lastUn = Date.now(); try { inner.unmount && inner.unmount(); } catch (e) { } delete document.body.dataset.jsetup; }
    };
    function wizard() {
      const d = S().data, c = Object.assign({}, DEF, d.jelajahCfg || {});
      if (c.src === 'upload' && !avail(c).upload) c.src = 'auto';
      let step = 1, dir = 1; const bio = { name: d.name || '', kelas: d.kelas || '', nis: d.nis || '', avatar: d.avatar || PP.AVORDER[0] };
      host.classList.add('js-on');
      const KEL = (window.PPAbsen && PPAbsen.KELAS) || [];
      const steps = () => `<ol class="fx-steps" aria-label="Langkah persiapan"><li class="${step > 1 ? 'is-done' : 'is-active'}"><span class="n">1</span>Biodata</li><li class="${step > 2 ? 'is-done' : step === 2 ? 'is-active' : ''}"><span class="n">2</span>Pilih soal</li><li class="${step === 3 ? 'is-active' : ''}"><span class="n">3</span>Mulai</li></ol>`;
      const bioOk = () => bio.name.trim().length >= 2 && !!bio.kelas;
      const draw = () => {
        const A = avail(c), pane = step === 1 ? p1() : step === 2 ? p2(A) : p3(A);
        host.innerHTML = `<div class="js-card panel" data-view="jelajah-setup" role="region" aria-label="Persiapan Jelajah Dunia"><div class="js-top"><button class="btn sm" id="jsX" aria-label="Kembali ke beranda">◀ Beranda</button><h2 class="h-title" style="margin:0">Persiapan Jelajah</h2></div>${steps()}<div class="js-pane ${dir > 0 ? 'fx-slide-in-r' : 'fx-slide-in-l'}">${pane}</div></div>`;
        host.querySelector('#jsX').onclick = () => PP.go('menu');
        (step === 1 ? w1 : step === 2 ? w2 : w3)(A);
      };
      const go = n => { dir = n > step ? 1 : -1; step = n; draw(); const h = host.querySelector('.js-pane input,.js-pane button,.js-pane select'); };
      /* ---- 1. biodata ---- */
      function p1() {
        return `<p class="small" style="margin:2px 0 6px">Data ini tersimpan di perangkatmu dan terisi otomatis lain kali.</p>
        <div class="js-form"><label class="fx-field">Nama<input id="jsN" maxlength="40" autocomplete="name" value="${esc(bio.name)}"></label>
        <label class="fx-field">Kelas<select id="jsK"><option value="">Pilih kelas</option>${KEL.map(k => `<option value="${k}" ${bio.kelas === k ? 'selected' : ''}>${k.slice(0, 1)} ${k.slice(1)}</option>`).join('')}${bio.kelas && KEL.indexOf(bio.kelas) < 0 ? `<option selected>${esc(bio.kelas)}</option>` : ''}</select></label>
        <label class="fx-field">No. absen / NISN <small>(opsional)</small><input id="jsI" inputmode="numeric" maxlength="12" value="${esc(bio.nis)}" placeholder="mis. 12"></label></div>
        <div class="js-avs" role="radiogroup" aria-label="Pilih avatar">${PP.AVORDER.map(k => `<label class="av ${bio.avatar === k ? 'on' : ''}"><input type="radio" name="jsAv" value="${k}" ${bio.avatar === k ? 'checked' : ''}><span class="av-pic">${PP.img(PP.AV[k].idle)}</span><span class="av-nm">${PP.AV[k].name}</span></label>`).join('')}</div>
        <p class="small" id="jsE" role="alert" style="color:#b3261e;margin:2px 0" hidden></p>
        <div class="row end"><button class="btn green" id="jsNext" ${bioOk() ? '' : 'aria-disabled="true"'}>Lanjut ▶</button></div>`;
      }
      function w1() {
        const n = host.querySelector('#jsN'), k = host.querySelector('#jsK'), i = host.querySelector('#jsI'), e = host.querySelector('#jsE');
        n.oninput = () => { bio.name = n.value; }; k.onchange = () => { bio.kelas = k.value; }; i.oninput = () => { i.value = i.value.replace(/\D/g, ''); bio.nis = i.value; };
        PP.$$('input[name=jsAv]', host).forEach(r => r.onchange = () => { bio.avatar = r.value; PP.$$('.av', host).forEach(l => l.classList.toggle('on', l.querySelector('input').checked)); });
        host.querySelector('#jsNext').onclick = () => {
          if (!bioOk()) { e.hidden = false; e.textContent = bio.name.trim().length < 2 ? 'Nama belum diisi.' : 'Pilih kelas dulu.'; (bio.name.trim().length < 2 ? n : k).focus(); return; }
          d.name = bio.name.trim().slice(0, 40); d.kelas = bio.kelas; d.nis = bio.nis; d.avatar = bio.avatar; S().save(); try { window.PPNet && PPNet.sync && PPNet.sync(); } catch (x) { } go(2);
        };
      }
      /* ---- 2. pilihan soal ---- */
      function p2(A) {
        const bk = window.PPBank ? PPBank : { batches: [], topics: () => [] }, tops = c.src === 'auto' ? PPGen.TOPICS.map(t => [t.id, t.n]) : bk.topics().map(t => [t, t]);
        const total = A[c.src] > 900 ? PP.xIds().length : Math.min(A[c.src], PP.xIds().length), maxN = Math.max(1, c.src === 'default' ? 0 : total);
        return `<p class="small" style="margin:2px 0 6px">Pilih asal soal untuk warga di dunia Jelajah.</p>
        <div class="js-src" role="radiogroup" aria-label="Sumber soal">${SRC.map(s => { const n = A[s[0]], off = s[0] === 'upload' && !n; return `<button type="button" class="choice ${c.src === s[0] ? 'is-selected' : ''}" role="radio" aria-checked="${c.src === s[0]}" data-s="${s[0]}" ${off ? 'aria-disabled="true"' : ''} data-source="${s[0]}"><span class="icon-badge">${window.FX ? FX.icon(s[2]) : ''}</span><b>${s[1]}</b><small>${s[0] === 'upload' ? 'tersedia ' + n + ' soal' : s[0] === 'default' ? 'tersedia ' + n + ' warga' : s[3]}</small><span class="ck" aria-hidden="true">✓</span></button>`; }).join('')}</div>
        ${A.upload ? '' : '<p class="small ab-note" role="status">Belum ada soal unggahan dari guru, jadi game memakai soal otomatis atau bawaan.</p>'}
        ${c.src === 'default' ? '' : `<div class="js-opt"><label class="fx-field">Topik<select id="jsT"><option value="all">Semua topik</option>${tops.map(t => `<option value="${esc(t[0])}" ${c.topic === t[0] ? 'selected' : ''}>${esc(t[1])}</option>`).join('')}</select></label>
        ${c.src === 'upload' || c.src === 'mix' ? `<label class="fx-field">Batch<select id="jsB"><option value="all">Semua batch</option>${bk.batches.map(b => `<option value="${esc(b.id)}" ${c.batch === b.id ? 'selected' : ''}>${esc(b.n)} (${b.c})</option>`).join('')}</select></label>` : ''}
        <label class="fx-field">Tingkat<select id="jsL">${['Semua', 'Mudah', 'Sedang', 'Sulit'].map(l => `<option ${c.lv === l ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="fx-field">Jumlah soal <span class="js-chips" role="radiogroup" aria-label="Jumlah soal">${[5, 10, 15, 20, 25].map(n => `<button type="button" class="js-chip ${c.n === n ? 'on' : ''}" role="radio" aria-checked="${c.n === n}" data-n="${n}" ${n > maxN && c.src !== 'auto' && c.src !== 'mix' ? 'aria-disabled="true"' : ''}>${n}</button>`).join('')}</span></div></div>`}
        <p class="small" id="jsSum" role="status" aria-live="polite">${c.src === 'default' ? 'Semua warga memakai soal bawaan petualangan.' : (c.src === 'upload' ? 'Tersedia <b>' + A.upload + '</b> soal. Dipakai: <b>' + Math.min(c.n, A.upload, PP.xIds().length) + '</b>.' : 'Dipakai: <b>' + Math.min(c.n, PP.xIds().length) + '</b> soal dari <b>' + PP.xIds().length + '</b> warga; sisanya soal bawaan.')}</p>
        <div class="row between"><button class="btn" id="jsBack">◀ Kembali</button><button class="btn green" id="jsNext2">Lanjut ▶</button></div>`;
      }
      function w2(A) {
        PP.$$('[data-s]', host).forEach(b => b.onclick = () => { if (b.getAttribute('aria-disabled') === 'true') { PP.ui.toast('Belum ada soal unggahan guru.'); return; } c.src = b.dataset.s; c.topic = 'all'; c.batch = 'all'; draw(); });
        const t = host.querySelector('#jsT'), bb = host.querySelector('#jsB'), l = host.querySelector('#jsL');
        if (t) t.onchange = () => { c.topic = t.value; draw(); }; if (bb) bb.onchange = () => { c.batch = bb.value; draw(); }; if (l) l.onchange = () => { c.lv = l.value; draw(); };
        PP.$$('.js-chip', host).forEach(b => b.onclick = () => { c.n = +b.dataset.n; draw(); });
        host.querySelector('#jsBack').onclick = () => go(1);
        host.querySelector('#jsNext2').onclick = () => { if (c.src === 'upload' && !avail(c).upload) { PP.ui.toast('Tidak ada soal yang cocok dengan filter.'); return; } go(3); };
      }
      /* ---- 3. ringkasan & mulai ---- */
      function p3(A) {
        const sn = (SRC.find(s => s[0] === c.src) || [])[1], n = c.src === 'default' ? 0 : Math.min(c.n, c.src === 'upload' ? A.upload : 999, PP.xIds().length);
        const ok = bioOk() && (c.src !== 'upload' || A.upload > 0);
        return `<div class="js-sum"><p><b>${esc(bio.name)}</b> · Kelas ${esc(bio.kelas.slice(0, 1) + ' ' + bio.kelas.slice(1))}${bio.nis ? ' · No. ' + esc(bio.nis) : ''}</p>
          <p>Soal: <b>${sn}</b>${c.src === 'default' ? '' : ' · ' + n + ' soal · ' + (c.lv === 'Semua' ? 'semua tingkat' : c.lv.toLowerCase()) + (c.topic !== 'all' ? ' · ' + esc((PPGen.TOPICS.find(t => t.id === c.topic) || { n: c.topic }).n) : '')}</p>
          <p class="small">Soal buatan siswa tetap jadi warga di dunia. Kemajuan lama tidak berubah.</p></div>
          <div class="row between"><button class="btn" id="jsBack">◀ Kembali</button><button class="btn green ${ok ? 'fx-shine' : ''}" id="jsGo" ${ok ? '' : 'aria-disabled="true"'}>Mulai Petualangan ▶</button></div>`;
      }
      function w3(A) {
        host.querySelector('#jsBack').onclick = () => go(2);
        host.querySelector('#jsGo').onclick = () => {
          if (host.querySelector('#jsGo').getAttribute('aria-disabled') === 'true') return;
          d.jelajahCfg = { src: c.src, topic: c.topic, batch: c.batch, lv: c.lv, n: c.n }; S().save();
          const used = J.build(c);
          if (window.FX) { try { FX.sfx.play('mulai'); } catch (e) { } }
          host.classList.add('js-iris'); setTimeout(() => start(), window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 380);
        };
      }
      draw();
    }
  };
})();
