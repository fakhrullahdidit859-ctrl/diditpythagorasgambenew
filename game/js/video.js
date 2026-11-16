/* =========================================================
   PPVideo — video otomatis di Menu Utama + "Ganti Video" khusus guru.
   Data (penyimpanan pusat, bukan localStorage):
     rooms/{KODE}/video/active        = {u, p, n, s, v, by, ts}   video aktif
     rooms/{KODE}/video/hist/{v}      = {u, p, n, s, v, by, ts}   riwayat versi
   Tanpa data = video bawaan (assets/video/panduan_planning.mp4, versi 0).
   Penyimpanan file: Firebase Storage (REST) bila PP_FIREBASE.storageBucket diisi;
   bila tidak, guru memakai TAUTAN langsung (mp4/webm) dari hosting mana pun.
   Siswa cukup membuka aplikasi: tidak perlu akun Google/Drive.
   ========================================================= */
(function () {
  'use strict';
  const C = () => window.PPCloud, V = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MAXMB = 100, TYPES = ['video/mp4', 'video/webm'];
  V.DEF = { u: 'assets/video/panduan_planning.mp4', p: 'assets/video/panduan_planning.jpg', n: 'Panduan Planning Pembelajaran (bawaan)', s: 0, v: 0, by: 'Bawaan', ts: 0 };
  const mb = b => b ? (b / 1048576).toFixed(1) + ' MB' : '—';
  const safeUrl = u => /^(https?:\/\/|assets\/|blob:)/i.test(String(u || '')) ? String(u) : '';
  /* hanya tautan http(s) yang boleh disimpan guru */
  V.okUrl = u => /^https:\/\/[^\s<>"']{4,500}$/i.test(String(u || '').trim());
  V.load = async function () {
    try {
      const d = await C().get('video');
      if (d === undefined || !d || !d.active || !safeUrl(d.active.u)) return { active: V.DEF, hist: d && d.hist ? d.hist : {} };
      return { active: Object.assign({}, V.DEF, d.active), hist: d.hist || {} };
    } catch (e) { return { active: V.DEF, hist: {} }; }
  };
  const bust = (u, v) => v ? u + (u.indexOf('?') > -1 ? '&' : '?') + 'v=' + encodeURIComponent(v) : u;
  /* ---------- slot di Menu Utama ---------- */
  V.mount = function (host, caption) {
    if (!host || !window.FX) return () => { };
    let slot = null, dead = false, applied = false;
    const A = window.PPAudio;
    slot = FX.videoSlot(host, {
      label: 'Video panduan guru',
      poster: V.DEF.p,
      onUnmute: on => { try { if (A) { A.duck = on ? 0.25 : 1; A.emit && A.emit(); } } catch (e) { } if (caption) caption.dataset.snd = on ? '1' : '0'; }
    });
    /* langsung putar video bawaan agar tidak menunggu jaringan, lalu ganti bila ada versi baru */
    slot.setSrc(V.DEF.u, 0);
    V.load().then(d => {
      if (dead) return;
      V.cur = d.active;
      if (caption) caption.textContent = d.active.n + (d.active.v ? ' · v' + d.active.v : '');
      if (d.active.v) { slot.video.poster = d.active.p || ''; slot.setSrc(d.active.u, d.active.v); }
      applied = true;
    });
    /* ikuti tombol suara header: bila suara dimatikan, video ikut senyap */
    const off = A && A.on ? (A.on(() => { try { if (!A.set.master && slot && !slot.video.muted) { slot.setMuted(true); A.duck = 1; } } catch (e) { } }), 1) : 0;
    return () => {
      dead = true; try { if (A) { A.duck = 1; A.emit && A.emit(); } } catch (e) { }
      try { slot.destroy(); } catch (e) { }
    };
  };
  /* ---------- unggah ke Firebase Storage (REST), dengan progres ---------- */
  V.bucket = () => (window.PP_FIREBASE && PP_FIREBASE.storageBucket) || '';
  V.upload = function (file, ver, onProg) {
    return new Promise((res, rej) => {
      const bk = V.bucket(); if (!bk) return rej(new Error('nobucket'));
      const nm = 'videos/v' + ver + '_' + file.name.replace(/[^\w.\-]+/g, '_').slice(0, 60);
      const x = new XMLHttpRequest();
      x.open('POST', 'https://firebasestorage.googleapis.com/v0/b/' + encodeURIComponent(bk) + '/o?uploadType=media&name=' + encodeURIComponent(nm));
      x.setRequestHeader('Content-Type', file.type || 'video/mp4');
      x.upload.onprogress = e => { if (e.lengthComputable && onProg) onProg(Math.round(e.loaded / e.total * 100)); };
      x.onerror = () => rej(new Error('net')); x.ontimeout = () => rej(new Error('net')); x.timeout = 20 * 60 * 1000;
      x.onload = () => {
        if (x.status < 200 || x.status >= 300) return rej(new Error('http' + x.status));
        try { const j = JSON.parse(x.responseText); res('https://firebasestorage.googleapis.com/v0/b/' + encodeURIComponent(bk) + '/o/' + encodeURIComponent(j.name) + '?alt=media' + (j.downloadTokens ? '&token=' + j.downloadTokens : '')); } catch (e) { rej(new Error('resp')); }
      };
      x.send(file);
    });
  };
  /* ---------- panel Ganti Video (guru) ---------- */
  V.openAdmin = function (onDone) {
    if (!window.PPGuru) return;
    PPGuru.require(async () => {
      const d = await V.load(); let tab = 'file', pick = null, url = '', busy = false;
      const hist = () => Object.keys(d.hist).map(k => d.hist[k]).filter(x => x && safeUrl(x.u)).sort((a, b) => b.v - a.v);
      const nextVer = () => Math.max(d.active.v || 0, ...hist().map(h => h.v || 0)) + 1;
      PP.ui.modal('<div class="fx-root vd-adm" id="vdA"></div>');
      const box = document.getElementById('vdA');
      const draw = () => {
        const h = hist();
        box.innerHTML = `<h2 class="h-title" style="margin:0 0 6px">Ganti Video Menu Utama</h2>
          <p class="small" style="margin:0 0 8px">Aktif: <b>${esc(d.active.n)}</b>${d.active.v ? ' · versi ' + d.active.v : ''} · ${mb(d.active.s)}</p>
          <div class="ab-tabs" role="tablist"><button class="ab-tab ${tab === 'file' ? 'on' : ''}" data-t="file">Unggah berkas</button><button class="ab-tab ${tab === 'url' ? 'on' : ''}" data-t="url">Tautan</button><button class="ab-tab ${tab === 'his' ? 'on' : ''}" data-t="his">Riwayat (${h.length + 1})</button></div>
          <div id="vdB"></div>`;
        box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { if (busy) return; tab = b.dataset.t; draw(); });
        const B = box.querySelector('#vdB');
        if (tab === 'file') file(B); else if (tab === 'url') link(B); else his(B, h);
      };
      const prev = (B, src) => { const p = B.querySelector('#vdPv'); p.innerHTML = '<video controls muted playsinline preload="metadata" style="width:100%;aspect-ratio:16/9;background:#000;border:3px solid var(--c-brown-900);border-radius:12px" aria-label="Pratinjau video"></video>'; const v = p.firstChild; v.src = src; v.onerror = () => { p.insertAdjacentHTML('beforeend', '<p class="small" style="color:#b3261e" role="alert">Video tidak bisa diputar. Periksa format/tautan.</p>'); if (B.querySelector('#vdSave')) B.querySelector('#vdSave').disabled = true; }; };
      const save = async rec => {
        rec.v = nextVer(); rec.by = PPGuru.name(); rec.ts = Date.now();
        const a = await C().put('video/hist/' + rec.v, rec), b = await C().put('video/active', rec);
        if (!(a && b)) return PP.ui.toast('Belum tersimpan. Coba lagi.');
        PP.ui.toast('Video baru aktif (versi ' + rec.v + ').'); if (window.FX) FX.confetti();
        PP.ui.close && PP.ui.close(); onDone && onDone();
      };
      function file(B) {
        const bk = V.bucket();
        B.innerHTML = `<div class="dropzone" id="vdDz" data-state="idle"><svg class="dz-border" aria-hidden="true"><rect/></svg><input type="file" id="vdF" accept="video/mp4,video/webm" aria-describedby="vdHelp" hidden>${window.FX ? FX.icon('swap-video', 'lg') : ''}<b>Tarik video ke sini atau ketuk untuk memilih</b></div>
          <p class="small" id="vdHelp">Format MP4 atau WebM, maksimal ${MAXMB} MB. Disarankan 720p (lihat PETUNJUK).</p>
          ${bk ? '' : '<p class="small ab-note" role="status">Penyimpanan file (Firebase Storage) belum dihubungkan, jadi berkas hanya bisa dipratinjau. Isi <code>storageBucket</code> di firebase-config.js, atau pakai tab Tautan.</p>'}
          <div id="vdPv"></div><progress id="vdPr" class="fx-progress" max="100" value="0" hidden aria-label="Progres unggah"></progress><p class="small" id="vdSt" role="status" aria-live="polite"></p>
          <div class="row end"><button class="btn sm" data-close>Tutup</button><button class="btn sm green" id="vdSave" disabled>Simpan & aktifkan</button></div>`;
        const inp = B.querySelector('#vdF'), dz = B.querySelector('#vdDz'), st = B.querySelector('#vdSt'), sv = B.querySelector('#vdSave');
        const take = fl => {
          const f = fl[0]; if (!f) return;
          if (!TYPES.includes(f.type) && !/\.(mp4|webm)$/i.test(f.name)) { st.textContent = 'Format tidak didukung. Pilih MP4 atau WebM.'; st.style.color = '#b3261e'; return; }
          if (f.size > MAXMB * 1048576) { st.textContent = 'Ukuran ' + mb(f.size) + ' melebihi batas ' + MAXMB + ' MB. Kompres dulu.'; st.style.color = '#b3261e'; return; }
          pick = f; st.style.color = ''; st.textContent = f.name + ' · ' + mb(f.size); prev(B, URL.createObjectURL(f)); sv.disabled = !bk;
        };
        dz.onclick = () => inp.click(); dz.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } }; dz.tabIndex = 0; dz.setAttribute('role', 'button');
        dz.ondragover = e => { e.preventDefault(); dz.classList.add('is-over'); }; dz.ondragleave = () => dz.classList.remove('is-over');
        dz.ondrop = e => { e.preventDefault(); dz.classList.remove('is-over'); take(e.dataTransfer.files); };
        inp.onchange = () => take(inp.files);
        sv.onclick = async () => {
          if (!pick || busy) return; busy = true; sv.disabled = true; const pr = B.querySelector('#vdPr'); pr.hidden = false; sv.setAttribute('aria-busy', 'true');
          try {
            const ver = nextVer(), u = await V.upload(pick, ver, p => { pr.value = p; st.textContent = 'Mengunggah ' + p + '%…'; });
            busy = false; await save({ u, p: '', n: pick.name.replace(/\.[^.]+$/, '').slice(0, 60), s: pick.size });
          } catch (e) { busy = false; sv.disabled = false; pr.hidden = true; st.style.color = '#b3261e'; st.textContent = e.message === 'http403' ? 'Ditolak server: periksa aturan Storage (lihat PETUNJUK_FIREBASE.md).' : 'Gagal mengunggah. Periksa koneksi lalu ulangi.'; }
        };
      }
      function link(B) {
        B.innerHTML = `<label class="fx-field">Tautan langsung ke video (https, berakhiran .mp4 atau .webm)<input id="vdU" type="url" inputmode="url" placeholder="https://…/video.mp4" value="${esc(url)}" aria-describedby="vdHelp"></label>
          <label class="fx-field">Nama video<input id="vdN" maxlength="60" placeholder="Mis. Panduan Bab 2"></label>
          <p class="small" id="vdHelp">Pakai hosting yang mengizinkan pemutaran langsung (Firebase Storage, GitHub Pages, Netlify, dll). Tautan Google Drive sering gagal.</p>
          <div id="vdPv"></div><p class="small" id="vdSt" role="status" aria-live="polite"></p>
          <div class="row end"><button class="btn sm blue" id="vdTest">Pratinjau</button><button class="btn sm green" id="vdSave" disabled>Simpan & aktifkan</button></div>`;
        const u = B.querySelector('#vdU'), st = B.querySelector('#vdSt'), sv = B.querySelector('#vdSave');
        B.querySelector('#vdTest').onclick = () => { url = u.value.trim(); if (!V.okUrl(url)) { st.style.color = '#b3261e'; st.textContent = 'Tautan harus diawali https://'; return; } st.style.color = ''; st.textContent = ''; prev(B, url); sv.disabled = false; };
        sv.onclick = () => { url = u.value.trim(); if (!V.okUrl(url)) return; save({ u: url, p: '', n: B.querySelector('#vdN').value.trim().slice(0, 60) || 'Video guru', s: 0 }); };
      }
      function his(B, h) {
        const row = (x, def) => `<div class="bs-it"><div class="bs-t"><b>${esc(x.n)}</b><small>${def ? 'Bawaan aplikasi' : 'Versi ' + x.v + ' · ' + esc(x.by) + ' · ' + new Date(x.ts).toLocaleDateString('id-ID')} · ${mb(x.s)}${(d.active.v || 0) === (x.v || 0) ? ' · <b>aktif</b>' : ''}</small></div><div class="bs-ac"><button class="btn sm" data-use="${def ? 0 : x.v}" ${(d.active.v || 0) === (x.v || 0) ? 'disabled' : ''}>${def ? 'Kembalikan ke bawaan' : 'Pakai'}</button>${def ? '' : `<button class="btn sm red" data-del="${x.v}" aria-label="Hapus versi ${x.v}">Hapus</button>`}</div></div>`;
        B.innerHTML = '<div class="scrollbox" style="max-height:44vh">' + h.map(x => row(x, false)).join('') + row(V.DEF, true) + '</div><div class="row end"><button class="btn sm" data-close>Tutup</button></div>';
        B.querySelectorAll('[data-use]').forEach(b => b.onclick = async () => {
          const v = +b.dataset.use, rec = v ? d.hist[v] : null;
          const ok = v ? await C().put('video/active', rec) : await C().del('video/active');
          if (!ok) return PP.ui.toast('Belum tersimpan.'); PP.ui.toast(v ? 'Memakai versi ' + v + '.' : 'Kembali ke video bawaan.'); PP.ui.close && PP.ui.close(); onDone && onDone();
        });
        B.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { const v = +b.dataset.del; if (v === (d.active.v || 0)) return PP.ui.toast('Video aktif tidak bisa dihapus.'); await C().del('video/hist/' + v); delete d.hist[v]; draw(); });
      }
      draw();
    });
  };
  /* efek suara FX ikut tombol suara header */
  setTimeout(() => { try { const A = window.PPAudio; if (window.FX && A) { const sync = () => { FX.sfx.enabled = !!(A.set && A.set.master !== false && A.set.sfx !== false); }; sync(); A.on && A.on(sync); } } catch (e) { } }, 0);
  window.PPVideo = V;
})();
