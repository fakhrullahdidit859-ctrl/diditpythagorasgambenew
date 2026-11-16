/* =========================================================
   LAPORAN — Sertifikat Penjelajah Pythagoras (canvas 1754x1240, A4 landscape) dan Rapor Siswa.
   Tanpa pustaka luar. Unduh PNG, cetak/PDF (satu halaman), bagikan (Web Share).
   Tingkat: Perunggu / Perak / Emas menurut nilai akhir dan penyelesaian.
   Data pribadi: hanya nama dan kelas yang diisi siswa. Format Indonesia.
   ========================================================= */
(function () {
  'use strict';
  const S = () => window.PPStore, IN_VIEWER = !!window.claude;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtN = n => (+n || 0).toLocaleString('id-ID');
  const fmtD = d => new Date(d || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const A = 'assets/lomba/';
  const cache = {}; const load = src => cache[src] || (cache[src] = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }));
  const TIERS = [
    { k: 'emas', t: 'Emas', min: 90, pos: 6, quiz: 85, col: '#d99a00', med: 'medali_emas' },
    { k: 'perak', t: 'Perak', min: 75, pos: 6, quiz: 70, col: '#7d8794', med: 'medali_perak' },
    { k: 'perunggu', t: 'Perunggu', min: 60, pos: 3, quiz: 0, col: '#b0713a', med: 'medali_perunggu' }
  ];
  function info() {
    const d = S().data, L = d.lomba || {}, sc = S().finalScore(), pos = S().doneCount(), qz = d.quiz && d.quiz.best ? d.quiz.best.score : 0;
    const tier = TIERS.find(t => sc >= t.min && pos >= t.pos && qz >= t.quiz) || null;
    const next = tier ? null : TIERS[TIERS.length - 1], miss = [];
    if (!tier) { if (sc < next.min) miss.push('Nilai akhir minimal ' + next.min + ' (sekarang ' + sc + ')'); if (pos < next.pos) miss.push('Selesaikan minimal ' + next.pos + ' pos misi (sekarang ' + pos + ')'); }
    return { d, L, sc, pos, qz, tier, miss, stars: S().totalStars(), badges: Object.keys(L.badges || {}) };
  }
  /* ---------- sertifikat ---------- */
  async function drawCert(cv, locked) {
    const W = 1754, H = 1240, g = cv.getContext('2d'), I = info(), d = I.d, tier = I.tier || TIERS[2], cert = (I.L.cert || {});
    cv.width = W; cv.height = H; g.imageSmoothingEnabled = false;
    const [frame, corner, line, seal, ribbon, med, star, sign] = await Promise.all(['bingkai_sertifikat', 'ornamen_sudut', 'ornamen_garis', 'meterai_emas', 'pita_juara', tier.med, 'bintang_besar', 'tanda_tangan_contoh'].map(n => load(A + 'sertifikat/' + n + '.png')));
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#fff8de'); grd.addColorStop(1, '#f6e2a8'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(160,110,40,.07)'; for (let y = 0; y < H; y += 24) for (let x = (y / 24 % 2) * 24; x < W; x += 48) g.fillRect(x, y, 12, 12);
    if (frame) { const c = 24, sw = 128, B = 54, o = 34; const px = (sx, sy, sw2, sh2, dx, dy, dw, dh) => g.drawImage(frame, sx, sy, sw2, sh2, dx, dy, dw, dh); const x0 = o, y0 = o, x1 = W - o, y1 = H - o; px(0, 0, c, c, x0, y0, B, B); px(sw - c, 0, c, c, x1 - B, y0, B, B); px(0, sw - c, c, c, x0, y1 - B, B, B); px(sw - c, sw - c, c, c, x1 - B, y1 - B, B, B); px(c, 0, sw - 2 * c, c, x0 + B, y0, x1 - x0 - 2 * B, B); px(c, sw - c, sw - 2 * c, c, x0 + B, y1 - B, x1 - x0 - 2 * B, B); px(0, c, c, sw - 2 * c, x0, y0 + B, B, y1 - y0 - 2 * B); px(sw - c, c, c, sw - 2 * c, x1 - B, y0 + B, B, y1 - y0 - 2 * B); }
    if (corner) { const s = 200, m = 100; [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, fx, fy]) => { g.save(); g.translate(x, y); g.scale(fx, fy); g.drawImage(corner, 0, 0, s, s); g.restore(); }); }
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'; const F = "'Pixelify Sans','Trebuchet MS',system-ui,sans-serif";
    const fit = (t, max, size, font) => { let s = size; g.font = font(s); while (g.measureText(t).width > max && s > 20) { s -= 2; g.font = font(s); } return s; };
    g.fillStyle = '#6b3d12'; g.font = `700 38px ${F}`; g.fillText('PETUALANGAN PYTHAGORAS', W / 2, 210);
    g.fillStyle = '#3b2412'; fit('Sertifikat Penjelajah Pythagoras', 1250, 92, s => `700 ${s}px ${F}`); g.fillText('Sertifikat Penjelajah Pythagoras', W / 2, 310);
    if (line) g.drawImage(line, W / 2 - 360, 330, 720, 42);
    g.fillStyle = '#5a3a1a'; g.font = `400 34px ${F}`; g.fillText('diberikan kepada', W / 2, 425);
    const nm = (d.name || 'Pemain').toString(); g.fillStyle = tier.col === '#7d8794' ? '#3a4452' : '#8a4a0a'; fit(nm, 900, 110, s => `700 ${s}px ${F}`); g.fillText(nm, W / 2, 545);
    g.fillStyle = '#3b2412'; g.font = `400 36px ${F}`; g.fillText([d.kelas ? 'Kelas ' + d.kelas : '', cert.sekolah || d.sekolah || ''].filter(Boolean).join(' · ') || 'Siswa SMP', W / 2, 610);
    g.fillStyle = '#5a3a1a'; fit('atas keberhasilannya menyelesaikan petualangan belajar Teorema Pythagoras', 960, 30, s => `400 ${s}px ${F}`); g.fillText('atas keberhasilannya menyelesaikan petualangan belajar Teorema Pythagoras', W / 2, 675);
    // karakter pilihan (sprite diperbesar, tajam)
    const av = (PP.AV[d.avatar] || PP.AV.boy), im = await load(((/src="([^"]+)"/.exec(PP.img(av.idle)) || [])[1]) || '');
    if (im) { const h = 300, w = h * im.naturalWidth / im.naturalHeight; g.imageSmoothingEnabled = true; g.drawImage(im, 150, 430, w * .9, h * .9); g.imageSmoothingEnabled = false; }
    // medali / tingkat
    if (med) g.drawImage(med, W - 340, 430, 192, 220);
    g.fillStyle = tier.col; g.font = `700 40px ${F}`; g.fillText('Tingkat ' + tier.t, W - 244, 700);
    // nilai
    const box = [['Nilai Kuis', I.qz], ['Nilai Akhir', I.sc], ['Bintang', I.stars], ['Pos Selesai', I.pos + '/6']];
    box.forEach((b, k) => { const x = 420 + k * 232, y = 740; g.fillStyle = 'rgba(255,255,255,.75)'; g.strokeStyle = '#3b2412'; g.lineWidth = 5; g.beginPath(); g.roundRect(x, y, 208, 128, 16); g.fill(); g.stroke(); g.fillStyle = '#3b2412'; g.font = `700 56px ${F}`; g.fillText(String(b[1]), x + 104, y + 70); g.font = `400 24px ${F}`; g.fillText(b[0], x + 104, y + 108); });
    g.fillStyle = '#5a3a1a'; g.font = `400 28px ${F}`; g.fillText('Predikat: ' + S().predikat(I.sc).t + (((S().data.lkpd || {}).nl || {}).s != null ? '  ·  Nilai LKPD Proyek: ' + S().data.lkpd.nl.s : ''), W / 2, 905);
    // lencana
    const B = (window.PPMisi ? PPMisi.BADGES : []).filter(b => I.badges.indexOf(b.id) >= 0).slice(0, 8);
    const imgs = await Promise.all(B.map(b => load(A + 'lencana/lencana_' + b.img + '.png'))); const bw = 72, gap = 14, tw = imgs.length * (bw + gap) - gap, bx = W / 2 - tw / 2;
    imgs.forEach((i, k) => { if (i) g.drawImage(i, bx + k * (bw + gap), 925, bw, bw); });
    if (!imgs.length) { g.fillStyle = '#8a6a3a'; g.font = `400 24px ${F}`; g.fillText('Kumpulkan lencana di dunia Jelajah', W / 2, 970); }
    // tanggal, guru, tanda tangan
    g.fillStyle = '#3b2412'; g.font = `400 28px ${F}`; g.fillText(fmtD(), 440, 1040);
    g.fillText('Guru Pembimbing', W - 440, 1040);
    g.strokeStyle = '#3b2412'; g.lineWidth = 3; g.beginPath(); g.moveTo(W - 600, 1090); g.lineTo(W - 280, 1090); g.stroke();
    const gu = cert.guru || ''; if (gu) { g.font = `italic 700 46px 'Brush Script MT','Segoe Script',cursive`; g.fillText(gu, W - 440, 1078); g.font = `400 26px ${F}`; g.fillText('(' + gu + ')', W - 440, 1126); } else { if (sign) g.drawImage(sign, W - 560, 1010, 240, 80); g.font = `400 26px ${F}`; g.fillText('(nama guru)', W - 440, 1126); }
    g.font = `400 24px ${F}`; g.fillText('Made by Didit Fakhrullah', 440, 1126);
    if (seal) g.drawImage(seal, W / 2 - 56, 1015, 112, 122);
    if (locked) { g.fillStyle = 'rgba(40,30,20,.72)'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `700 100px ${F}`; g.fillText('TERKUNCI', W / 2, 560); g.font = `400 40px ${F}`; I.miss.forEach((m, k) => g.fillText(m, W / 2, 650 + k * 56)); }
  }
  const dl = (url, name) => { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
  function printImg(url, title) {
    const d = document.createElement('div'); d.className = 'rk-printroot lp-print'; d.innerHTML = `<img src="${url}" alt="${esc(title)}" style="width:100%;height:auto;display:block">`;
    document.body.appendChild(d); document.body.classList.add('rk-printing', 'lp-printing');
    const done = () => { document.body.classList.remove('rk-printing', 'lp-printing'); d.remove(); window.removeEventListener('afterprint', done); }; window.addEventListener('afterprint', done);
    setTimeout(() => { try { window.print(); } catch (e) { PP.ui.toast('Cetak tidak tersedia di sini.'); done(); } setTimeout(done, 60000); }, 150);
  }
  /* ---------- rapor ---------- */
  function topics() {
    const d = S().data, T = { miring: [0, 0], tegak: [0, 0], cek: [0, 0], app: [0, 0] }, map = k => k === 'miring' ? 'miring' : k === 'tegak' ? 'tegak' : k === 'cek' ? 'cek' : 'app';
    const last = d.quiz && (d.quiz.last || d.quiz.best); if (last && last.ans) last.ans.forEach((a, i) => { if (a == null || !PP.QUIZ[i]) return; const t = T[map(PPHint.gen(PP.QUIZ[i]).kind)]; t[1]++; if (a === PP.QUIZ[i].a) t[0]++; });
    const by = (d.quizHints && d.quizHints.by) || {};
    Object.keys(by).forEach(id => { const m = /^w\d+_(\d+)$/.exec(id); if (!m) return; const q = PP.QUIZ[+m[1]]; if (!q) return; const t = T[map(PPHint.gen(q).kind)], r = by[id]; t[1] += (r.w | 0) + (r.ok ? 1 : 0); t[0] += r.ok ? 1 : 0; });
    return T;
  }
  const TN = { miring: ['Mencari sisi miring', 'ikon_topik_sisi_miring'], tegak: ['Mencari sisi tegak', 'ikon_topik_sisi_tegak'], cek: ['Jenis segitiga', 'ikon_topik_jenis_segitiga'], app: ['Penerapan', 'ikon_topik_penerapan'] };
  function rapor(root) {
    const I = info(), d = I.d, T = topics(), by = (d.quizHints && d.quizHints.by) || {};
    const pct = k => T[k][1] ? Math.round(T[k][0] / T[k][1] * 100) : -1;
    const hard = Object.keys(by).map(id => ({ id, s: (by[id].w | 0) * 2 + (by[id].h | 0) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map(x => { const m = /^w\d+_(\d+)$/.exec(x.id); return m && PP.QUIZ[+m[1]] ? String(PP.QUIZ[+m[1]].q).replace(/<[^>]+>/g, '') : null; }).filter(Boolean);
    const weak = Object.keys(T).filter(k => T[k][1] > 0).sort((a, b) => pct(a) - pct(b))[0];
    const REC = { miring: 'Latih lagi mencari sisi miring: jumlahkan kuadrat dua sisi siku-siku, lalu akarkan.', tegak: 'Latih lagi mencari sisi tegak: kuadrat sisi miring dikurangi kuadrat sisi lain.', cek: 'Latih lagi memeriksa jenis segitiga: bandingkan c² dengan a² + b².', app: 'Latih soal cerita: gambar dulu segitiganya, tandai sisi miring, baru hitung.' };
    const sec = (I.L.cnt && I.L.cnt.sec) | 0, mins = Math.round(sec / 60);
    root.innerHTML = `<div class="lp-rapor" id="lpRap"><div class="lp-rh"><img class="px" src="${A}ikon/ikon_rapor.png" alt=""><div><h3 style="margin:0">Rapor Belajar · ${esc(d.name || 'Pemain')}</h3><small>${esc([d.kelas && 'Kelas ' + d.kelas, d.sekolah].filter(Boolean).join(' · '))} · ${fmtD()}</small></div></div>
      <div class="lp-stats"><div><b>${I.qz || '-'}</b><span>Kuis terbaik</span></div><div><b>${I.sc}</b><span>Nilai akhir</span></div><div><b>${I.pos}/6</b><span>Pos misi</span></div><div><b>${fmtN(I.stars)}</b><span>Bintang</span></div><div><b>${fmtN((d.quizHints && d.quizHints.total) | 0)}</b><span>Petunjuk</span></div><div><b>${mins}</b><span>Menit main</span></div></div>
      <p class="small" style="margin:2px 0"><b>Perkembangan:</b> belum ada pre-test/post-test di game ini. Rapor memakai kuis terbaik (${fmtN(d.quiz && d.quiz.attempts)} percobaan).</p>
      <h4 style="margin:6px 0 2px">Penguasaan per topik</h4><canvas id="lpBars" width="720" height="${Object.keys(T).length * 54 + 10}" aria-label="Grafik penguasaan topik"></canvas>
      <h4 style="margin:6px 0 2px">Soal paling sulit</h4>${hard.length ? '<ol class="small" style="margin:0 0 0 1.1em">' + hard.map(h => `<li>${esc(h.slice(0, 120))}</li>`).join('') + '</ol>' : '<p class="small" style="margin:0">Belum ada data. Jawab soal di Jelajah dulu.</p>'}
      <h4 style="margin:6px 0 2px">Rekomendasi belajar</h4><p class="small" style="margin:0">${weak ? REC[weak] : 'Mulai dengan menjawab kuis dan soal Jelajah agar rekomendasi muncul.'}</p>
      <p class="small ab-note"><img class="px" src="${A}ikon/ikon_privasi.png" alt="" style="width:18px;vertical-align:-4px"> Privasi: hanya nama dan kelas yang kamu isi yang tampil di rapor dan sertifikat. Tidak ada data lain yang dikirim.</p></div>`;
    const cv = root.querySelector('#lpBars'), g = cv.getContext('2d'); g.font = "700 22px 'Pixelify Sans', system-ui, sans-serif"; g.textBaseline = 'middle';
    Object.keys(T).forEach((k, i) => { const y = 10 + i * 54, p = pct(k); g.fillStyle = '#3b2412'; g.fillText(TN[k][0], 4, y + 14); g.fillStyle = '#e8d9ae'; g.fillRect(250, y, 340, 30); g.fillStyle = p < 0 ? '#bbb' : p >= 80 ? '#4caf50' : p >= 50 ? '#f5a623' : '#e5484d'; if (p >= 0) g.fillRect(250, y, 340 * p / 100, 30); g.strokeStyle = '#3b2412'; g.lineWidth = 3; g.strokeRect(250, y, 340, 30); g.fillStyle = '#3b2412'; g.fillText(p < 0 ? 'belum ada' : p + '%', 602, y + 15); g.fillStyle = '#6b4a22'; g.font = "400 16px system-ui"; g.fillText(T[k][1] ? T[k][0] + ' benar dari ' + T[k][1] : '', 4, y + 40); g.font = "700 22px 'Pixelify Sans', system-ui, sans-serif"; });
  }
  PP.screens.laporan = function () {
    let tab = 'cert';
    return {
      html: '<div class="wrap narrowish"><div class="panel fill pad lp" id="lpR"></div></div>',
      mount(root) {
        const box = PP.$('#lpR', root);
        const draw = async () => {
          const I = info(), c = I.L.cert || {};
          box.innerHTML = `<div class="rk-head"><span class="rk-ic"><img class="px" src="${A}ikon/ikon_sertifikat.png" alt=""></span><div><h2 class="h-title" style="margin:0">Sertifikat & Rapor</h2><p class="small" style="margin:0">${I.tier ? 'Tingkat kamu: <b>' + I.tier.t + '</b>' : 'Belum memenuhi syarat sertifikat'}</p></div></div>
            <div class="ab-tabs"><button class="ab-tab ${tab === 'cert' ? 'on' : ''}" data-t="cert">Sertifikat</button><button class="ab-tab ${tab === 'rap' ? 'on' : ''}" data-t="rap">Rapor</button></div><div class="lp-body scrollbox" id="lpB"></div>`;
          PP.$$('[data-t]', box).forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
          const B = PP.$('#lpB', box);
          if (tab === 'rap') { rapor(B); B.insertAdjacentHTML('beforeend', `<div class="rk-act"><button class="btn sm gold" id="lpRp">Cetak Rapor / PDF</button></div>`); PP.$('#lpRp').onclick = () => { const r = PP.$('#lpRap'); const d = document.createElement('div'); d.className = 'rk-printroot'; d.innerHTML = r.outerHTML.replace(/<canvas[^>]*><\/canvas>/, `<img src="${PP.$('#lpBars').toDataURL()}" style="width:100%">`); document.body.appendChild(d); document.body.classList.add('rk-printing'); const done = () => { document.body.classList.remove('rk-printing'); d.remove(); window.removeEventListener('afterprint', done); }; window.addEventListener('afterprint', done); setTimeout(() => { try { window.print(); } catch (e) { done(); } }, 150); }; return; }
          B.innerHTML = `<div class="lp-cwrap"><canvas id="lpC" aria-label="Pratinjau sertifikat"></canvas></div>
            <div class="lp-fld"><label>Nama sekolah<input id="lpSk" maxlength="60" value="${esc(c.sekolah || I.d.sekolah || '')}"></label><label>Nama guru<input id="lpGu" maxlength="40" value="${esc(c.guru || '')}" placeholder="mis. Bu Sari, S.Pd."></label></div>
            ${I.tier ? '' : `<p class="small ab-note"><b>Sertifikat terkunci.</b> ${I.miss.map(esc).join('; ')}.</p>`}
            <div class="rk-act"><button class="btn sm green" id="lpPng" ${I.tier ? '' : 'disabled'}>Unduh PNG</button><button class="btn sm gold" id="lpPr" ${I.tier ? '' : 'disabled'}>Cetak / PDF</button><button class="btn sm blue" id="lpSh" ${I.tier ? '' : 'disabled'}>Bagikan</button></div>
            ${IN_VIEWER ? '<p class="small ab-note">Di pratinjau artefak, unduhan tidak tersedia. Buka versi aslinya untuk mengunduh.</p>' : ''}<p class="small ab-note"><img class="px" src="${A}ikon/ikon_privasi.png" alt="" style="width:18px;vertical-align:-4px"> Hanya nama dan kelas yang tampil.</p>`;
          const cv = PP.$('#lpC', B); await drawCert(cv, !I.tier);
          const save = () => { I.L.cert = { sekolah: PP.$('#lpSk').value.trim().slice(0, 60), guru: PP.$('#lpGu').value.trim().slice(0, 40) }; S().data.lomba = I.L; S().save(); };
          let tm = 0; ['#lpSk', '#lpGu'].forEach(s => PP.$(s, B).oninput = () => { save(); clearTimeout(tm); tm = setTimeout(() => drawCert(cv, !I.tier), 250); });
          const name = 'sertifikat_' + String(I.d.name || 'siswa').replace(/[^\w]+/g, '_') + '.png';
          PP.$('#lpPng').onclick = () => { if (IN_VIEWER) return PP.ui.toast('Unduhan tidak tersedia di pratinjau.'); cv.toBlob(b => { dl(URL.createObjectURL(b), name); }, 'image/png'); };
          PP.$('#lpPr').onclick = () => printImg(cv.toDataURL('image/png'), 'Sertifikat');
          PP.$('#lpSh').onclick = () => cv.toBlob(async b => { const f = new File([b], name, { type: 'image/png' }); try { if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: 'Sertifikat Penjelajah Pythagoras' }); else PP.ui.toast('Bagikan tidak didukung di perangkat ini. Pakai Unduh PNG.'); } catch (e) { } });
        };
        draw();
      }
    };
  };
})();
