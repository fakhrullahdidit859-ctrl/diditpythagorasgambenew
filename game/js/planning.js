/* Planning Pembelajaran — Quest Journal Guru. Data terpisah: localStorage 'pp_planning_v1'. */
(function () {
  'use strict';
  const KEY = 'pp_planning_v1';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ymd = (d) => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const tgl = s => { try { return new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return s; } };

  /* ---- struktur sintak (urutan sesuai prompt) ---- */
  const SEC = [
    { id: 'A', t: 'A. Kegiatan Pendahuluan', ic: 'sun', cls: 'pa', items: [
      { k: 'a1', t: 'Salam Pembuka — Menyapa Siswa', p: 'salam' },
      { k: 'a2', t: 'Memastikan Kelas Sudah Bersih', p: 'bersih' },
      { k: 'a3', t: 'Berdoa Mulai Belajar', p: 'doa' },
      { k: 'a4', t: 'Absen Kehadiran', go: 'absen' },
      { k: 'a5', t: 'Menyanyikan Lagu Kebangsaan (Jika Perlu)', p: 'lagu' },
      { k: 'a6', t: 'Kesepakatan Kelas', p: 'sepakat' },
      { k: 'a7', t: 'Apersepsi dan Motivasi', p: 'apersepsi' },
      { k: 'a8', t: 'Tujuan Pembelajaran', go: 'tujuan' }] },
    { id: 'B', t: 'B. Kegiatan Inti', ic: 'target', cls: 'pb', items: [
      { h: '1. Orientasi Peserta Didik pada Masalah' },
      { k: 'b1a', t: 'a. Video Animasi Pembelajaran', go: 'video', sub: 1 },
      { k: 'b1b', t: 'b. Menyampaikan Materi Pembelajaran', go: 'materi', sub: 1 },
      { h: '2. Mengorganisasikan Peserta Didik' },
      { k: 'b2', t: 'Mengorganisasikan Peserta Didik', p: 'organisasi', sub: 1 },
      { h: '3. Membimbing Penyelidikan Pribadi/Kelompok melalui Akses Digital' },
      { k: 'b3a', t: 'a. LKPD Eksplorasi Pembelajaran Pythagoras', go: 'eksplorasi', sub: 1 },
      { k: 'b3b', t: 'b. LKPD Peta Petualangan', go: 'peta', sub: 1 },
      { k: 'b3c', t: 'c. LKPD Game dan Tantangan', go: 'games', sub: 1 },
      { h: '4. Mengembangkan dan Menyajikan Hasil' },
      { k: 'b4', t: 'Mengembangkan dan Menyajikan Hasil', p: 'sajikan', sub: 1 },
      { h: '5. Menganalisis dan Mengevaluasi Proses Pemecahan Masalah' },
      { k: 'b5', t: 'Menganalisis dan Mengevaluasi Proses Pemecahan Masalah', p: 'evaluasi', sub: 1 }] },
    { id: 'C', t: 'C. Kegiatan Penutup', ic: 'flag', cls: 'pc', items: [
      { k: 'c1', t: 'Kuis Interaktif Evaluasi Penutup', go: 'kuis' },
      { k: 'c2', t: 'Rangkuman atau Kesimpulan', p: 'rangkum' },
      { k: 'c3', t: 'Refleksi', go: 'refleksi' },
      { k: 'c4', t: 'Pemberitahuan Materi Selanjutnya atau Tugas di Rumah', p: 'tugas' },
      { k: 'c5', t: 'Salam Penutup dan Doa', p: 'penutup' }] },
    { id: 'D', t: 'D. Program Penilaian Berbasis Digital', ic: 'trophy', cls: 'pd', items: [
      { k: 'd1', t: 'Program Penilaian Berbasis Digital', go: 'nilai', p: 'nilai' }] }
  ];
  const ITEMS = []; SEC.forEach(s => s.items.forEach(i => { if (i.k) { i.sec = s.id; ITEMS.push(i); } }));
  const BYK = {}; ITEMS.forEach(i => BYK[i.k] = i);

  /* ---- data ---- */
  let D = { cur: null, hist: [] };
  try { const r = JSON.parse(localStorage.getItem(KEY) || 'null'); if (r) D = Object.assign(D, r); } catch (e) { }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { PP.ui.toast('Penyimpanan penuh atau diblokir.'); } };
  const newSession = () => ({ id: 'PL-' + ymd().replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 5).toUpperCase(), tanggal: ymd(), mulai: Date.now(), items: {}, notes: {}, status: 'berjalan', sepakat: ['Datang tepat waktu dan siap belajar', 'Mendengarkan saat guru atau teman berbicara', 'Berani bertanya dan menjawab', 'Saling menghargai dan bekerja sama'], tugas: 'Kerjakan latihan soal Teorema Pythagoras dan baca kembali materi pembuktian.', jenis: 'kelompok', groups: null });
  if (!D.cur) { D.cur = newSession(); save(); }
  const cur = () => D.cur;
  const done = (s, k) => !!s.items[k];
  const counts = (s) => { const by = {}; SEC.forEach(x => by[x.id] = { n: 0, d: 0 }); ITEMS.forEach(i => { by[i.sec].n++; if (done(s, i.k)) by[i.sec].d++; }); const n = ITEMS.length, d = ITEMS.filter(i => done(s, i.k)).length; return { by, n, d, pct: Math.round(d / n * 100) }; };
  const snap = s => { const c = counts(s); return { id: s.id, tanggal: s.tanggal, status: s.status, pct: c.pct, d: c.d, n: c.n, belum: ITEMS.filter(i => !done(s, i.k)).map(i => i.t), notes: Object.keys(s.notes).filter(k => s.notes[k]).map(k => [BYK[k].t, s.notes[k]]), akhir: Date.now() }; };
  const upsertHist = (status) => { const s = snap(cur()); s.status = status; D.hist = D.hist.filter(h => h.id !== s.id); D.hist.unshift(s); D.hist = D.hist.slice(0, 60); };
  window.PPPlanning = { data: () => D, counts: () => counts(cur()) };

  /* ---- panel panduan ---- */
  const li = a => '<ul class="pl-ul">' + a.map(x => `<li>${x}</li>`).join('') + '</ul>';
  const PANEL = {
    salam: () => ['Salam Pembuka', `<p>Sapa siswa dengan hangat, lalu cek kesiapan mereka.</p>${li(['“Assalamualaikum warahmatullahi wabarakatuh, selamat pagi anak-anak.”', '“Bagaimana kabar kalian hari ini?”', 'Pastikan semua duduk rapi dan siap melihat layar game.'])}`],
    bersih: () => ['Memastikan Kelas Sudah Bersih', `<p>Centang secara manual (panduan saja):</p><div class="pl-mini">${['Lantai bebas sampah', 'Meja dan kursi tertata rapi', 'Papan tulis bersih', 'Perangkat atau layar siap dipakai'].map((x, i) => `<label><input type="checkbox" data-mini="${i}" ${(cur().mini || {})[i] ? 'checked' : ''}> ${x}</label>`).join('')}</div>`],
    doa: () => ['Berdoa Mulai Belajar', `<p>Pimpin doa sebelum belajar sesuai kebiasaan kelas.</p>${li(['Pilih seorang siswa atau pimpin bersama.', 'Ajak siswa berdoa dengan khidmat.', 'Ingatkan niat belajar dengan sungguh-sungguh.'])}`],
    lagu: () => ['Menyanyikan Lagu Kebangsaan', `<p>Opsional, sesuai kebijakan sekolah dan jadwal hari ini.</p>${li(['Berdiri tegak dan tenang.', 'Nyanyikan “Indonesia Raya” bersama.', 'Jika tidak diperlukan, tekan “Lewati”.'])}<div class="row end"><button class="btn sm" data-skip="a5">Lewati (tidak perlu)</button></div>`],
    sepakat: () => ['Kesepakatan Kelas', `<p>Sepakati aturan belajar bersama. Anda dapat mengedit:</p><textarea id="plSep" class="pl-ta" rows="5">${esc(cur().sepakat.join('\n'))}</textarea>`],
    apersepsi: () => ['Apersepsi dan Motivasi', `<p>Hubungkan dengan pengetahuan awal siswa.</p>${li(['“Apa nama segitiga yang punya satu sudut 90°?”', '“Bagaimana tukang memastikan sudut dinding benar-benar siku?”', '“Tangga 5 m bersandar di dinding, bagaimana mengetahui tingginya?”', 'Motivasi: hari ini kita menjadi petualang yang menemukan rahasia segitiga siku-siku.'])}`],
    organisasi: () => {
      const names = (window.PPAbsen ? PPAbsen.data().siswa : []).map(s => s.nama), g = cur().groups;
      return ['Mengorganisasikan Peserta Didik', `<p>Pilih bentuk kegiatan:</p><div class="row"><label><input type="radio" name="plJ" value="individu" ${cur().jenis === 'individu' ? 'checked' : ''}> Individu</label><label><input type="radio" name="plJ" value="kelompok" ${cur().jenis !== 'individu' ? 'checked' : ''}> Kelompok</label></div>
        <p class="small">${names.length ? 'Pembagi kelompok memakai ' + names.length + ' nama dari menu Absen.' : 'Isi daftar siswa di menu Absen untuk memakai pembagi kelompok otomatis.'}</p>
        <div class="row"><label class="small">Anggota per kelompok <input id="plGsz" type="number" min="2" max="10" value="4" style="width:56px"></label><button class="btn sm blue" id="plGen" ${names.length ? '' : 'disabled'}>Bagi Kelompok Acak</button></div>
        <div id="plGroups">${g ? g.map((x, i) => `<div class="pl-g"><b>Kelompok ${i + 1}</b>: ${x.map(esc).join(', ')}</div>`).join('') : ''}</div>`];
    },
    sajikan: () => ['Mengembangkan dan Menyajikan Hasil', `<p>Arahkan siswa menyajikan hasil penyelidikan.</p>${li(['Tiap kelompok memilih 1–2 hasil (mis. bukti puzzle, jawaban soal cerita).', 'Presentasikan: apa yang ditemukan dan bagaimana caranya.', 'Kelompok lain bertanya atau menanggapi.', 'Beri apresiasi pada setiap penyaji.'])}`],
    evaluasi: () => ['Menganalisis dan Mengevaluasi Proses Pemecahan Masalah', `<p>Ajukan pertanyaan pemantik:</p>${li(['Strategi apa yang kalian pakai? Adakah cara lain?', 'Di mana kesalahan yang sering terjadi (mis. lupa mengakar, tertukar sisi miring)?', 'Bagaimana memeriksa bahwa jawabanmu masuk akal?', 'Apa yang akan diperbaiki pada langkah berikutnya?'])}`],
    rangkum: () => ['Rangkuman atau Kesimpulan', `<p>Simpulkan bersama siswa:</p>${li(['Pada segitiga siku-siku berlaku <b>c² = a² + b²</b> (c = sisi miring).', 'Mencari sisi miring: jumlahkan kuadrat, lalu akar.', 'Mencari sisi tegak: <b>a² = c² − b²</b>.', 'Kebalikannya: jika c² = a² + b² maka segitiganya siku-siku.', 'Dipakai pada tangga, atap, layar TV, jarak lurus, dan banyak lagi.'])}`],
    tugas: () => ['Materi Selanjutnya / Tugas di Rumah', `<p>Tulis tugas dan info materi berikutnya (tersimpan otomatis):</p><textarea id="plTugas" class="pl-ta" rows="5">${esc(cur().tugas)}</textarea>`],
    penutup: () => ['Salam Penutup dan Doa', `<p>Tutup pembelajaran dengan baik.</p>${li(['Ucapkan terima kasih dan apresiasi atas keaktifan siswa.', 'Pimpin doa penutup.', '“Wassalamualaikum warahmatullahi wabarakatuh.”'])}`],
    nilai: () => {
      let q = '–', f = '–', pos = '–';
      try { const S = PPStore; f = S.finalScore(); q = S.data.quiz.best ? S.data.quiz.best.score : '–'; pos = S.doneCount() + '/6'; } catch (e) { }
      return ['Ringkasan Penilaian', `<div class="fin-stats"><div><b>${f}</b><span>Nilai akhir</span></div><div><b>${q}</b><span>Kuis terbaik</span></div><div><b>${pos}</b><span>Pos selesai</span></div></div><p class="small">Ini data penilaian game pada perangkat ini. Buka menu Program Penilaian untuk rincian dan laporan.</p>`];
    }
  };

  /* ---- layar ---- */
  PP.screens.planning = function () {
    const open = { A: true, B: true, C: false, D: false };
    return {
      html: '<div class="wrap narrowish"><div class="panel fill pad pl" id="plRoot"></div></div>',
      mount(root) {
        const box = PP.$('#plRoot', root); let first = true, lastPct = -1;
        const checkDone = () => {
          const c = counts(cur());
          if (c.d === c.n && cur().status !== 'selesai') { cur().status = 'selesai'; cur().akhir = Date.now(); upsertHist('selesai'); save(); setTimeout(complete, 350); }
          else if (c.d < c.n && cur().status === 'selesai') { cur().status = 'berjalan'; D.hist = D.hist.filter(h => h.id !== cur().id); save(); }
        };
        const draw = () => {
          const s = cur(), c = counts(s), sp = (x, y, w, h) => `<span class="pl-art" style="background-position:-${x}px -${y}px;width:${w}px;height:${h}px"></span>`;
          box.className = 'panel fill pad pl' + (first ? ' is-opening' : ''); first = false;
          const scroll = PP.$('.pl-secs', box); const st = scroll ? scroll.scrollTop : 0;
          box.innerHTML = `<div class="pl-head"><span class="pl-book">${PP.ICONS.planning}</span><span class="pl-mentor" aria-hidden="true"></span><div class="pl-ht"><h2 class="h-title" style="margin:0">Planning Pembelajaran</h2><p class="small" style="margin:0">Quest Journal Guru: ikuti sintak, centang saat sudah terlaksana, ketuk nama kegiatan untuk membuka fiturnya.</p></div>
              <label class="pl-date"><span>Tanggal sesi</span><input type="date" id="plDate" value="${s.tanggal}"></label></div>
            <div class="pl-dash"><div class="pl-pct"><b id="plPct">${c.pct}%</b><span>${s.status === 'selesai' ? 'Selesai' : 'Berjalan'}</span></div>
              <div class="pl-pr"><div class="pl-bar ${c.pct !== lastPct ? 'is-updating' : ''}"><i style="width:${c.pct}%"></i></div>
              <div class="pl-stats"><span>Total <b>${c.n}</b></span><span class="ok">Selesai <b>${c.d}</b></span><span class="no">Belum <b>${c.n - c.d}</b></span><span class="small">ID ${esc(s.id)}</span></div></div></div>
            <div class="pl-secs scrollbox">${SEC.map(sec => secHtml(sec, s, c)).join('')}</div>
            <div class="pl-foot"><button class="btn sm blue" data-pa="new">Mulai Planning Baru</button><button class="btn sm green" data-pa="go">Lanjutkan Planning</button><button class="btn sm" data-pa="reset">Reset Planning</button><button class="btn sm gold" data-pa="end">Akhiri Pembelajaran</button><button class="btn sm purple" data-pa="hist">Lihat Riwayat</button></div>`;
          lastPct = c.pct; const sc = PP.$('.pl-secs', box); if (sc) sc.scrollTop = st; wire();
        };
        const secHtml = (sec, s, c) => {
          const cc = c.by[sec.id], full = cc.d === cc.n;
          let body = '', hdr = null, hk = [];
          const flushH = () => { };
          sec.items.forEach(it => {
            if (it.h) { body += `<div class="pl-h">${esc(it.h)}</div>`; return; }
            const dn = done(s, it.k), note = !!s.notes[it.k];
            body += `<div class="pl-it ${dn ? 'is-checked' : ''} ${it.sub ? 'sub' : ''}" data-k="${it.k}">
              <button class="pl-cb" role="checkbox" aria-checked="${dn}" aria-label="Tandai selesai: ${esc(it.t)}" data-cb="${it.k}"><svg viewBox="0 0 24 24" class="check-icon"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
              <button class="pl-nm" data-open="${it.k}">${esc(it.t)}${s.items[it.k] === 'skip' ? ' <em>(dilewati)</em>' : ''}</button>
              ${it.go ? '<span class="pl-go">Buka Fitur</span>' : '<span class="pl-go g">Panduan</span>'}
              <button class="pl-note ${note ? 'on' : ''}" data-note="${it.k}" aria-label="Catatan guru">${note ? '●' : '✎'}</button></div>`;
          });
          return `<section class="pl-sec ${sec.cls} ${full ? 'full' : ''}"><button class="pl-sh" data-tog="${sec.id}" aria-expanded="${!!open[sec.id]}"><span class="pl-si">${PP.ico ? PP.ico(sec.ic === 'sun' ? 'book' : sec.ic === 'target' ? 'puzzle' : sec.ic === 'flag' ? 'star' : 'trophy', 'sm') : ''}</span><b>${esc(sec.t)}</b><span class="pl-cnt">${cc.d}/${cc.n}</span>${full ? '<span class="pl-star">★</span>' : ''}<span class="pl-ch">${open[sec.id] ? '▾' : '▸'}</span></button>
            <div class="pl-sb" ${open[sec.id] ? '' : 'hidden'}>${body}</div></section>`;
        };
        const toggle = (k, force) => { const s = cur(); const v = force !== undefined ? force : !s.items[k]; if (v) s.items[k] = true; else delete s.items[k]; save(); checkDone(); };
        const wire = () => {
          PP.$('#plDate', box).onchange = e => { if (e.target.value) { cur().tanggal = e.target.value; save(); } };
          PP.$$('[data-tog]', box).forEach(b => b.onclick = () => { open[b.dataset.tog] = !open[b.dataset.tog]; draw(); });
          PP.$$('[data-cb]', box).forEach(b => b.onclick = () => { toggle(b.dataset.cb); draw(); const nb = PP.$(`[data-cb="${b.dataset.cb}"]`, box); if (nb && cur().items[b.dataset.cb]) nb.classList.add('pop'); });
          PP.$$('[data-open]', box).forEach(b => b.onclick = () => openItem(b.dataset.open));
          PP.$$('[data-note]', box).forEach(b => b.onclick = () => noteItem(b.dataset.note));
          PP.$$('[data-pa]', box).forEach(b => b.onclick = () => actions[b.dataset.pa]());
        };
        const openItem = k => {
          const it = BYK[k]; if (it.go && !it.p) { PP.go(it.go); return; }
          const [t, html] = PANEL[it.p]();
          PP.ui.modal(`<div class="pl-modal"><h3>${esc(t)}</h3>${html}<div class="pl-mact">${it.go ? `<button class="btn gold" id="plGo">Buka Fitur</button>` : ''}<label class="pl-mchk"><input type="checkbox" id="plDone" ${done(cur(), k) ? 'checked' : ''}> Sudah dilaksanakan</label><button class="btn" data-close>Tutup</button></div></div>`);
          const g = id => PP.$(id);
          if (g('#plGo')) g('#plGo').onclick = () => { PP.ui.close(); PP.go(it.go); };
          g('#plDone').onchange = e => { toggle(k, e.target.checked); draw(); };
          PP.$$('[data-mini]').forEach(c => c.onchange = () => { cur().mini = cur().mini || {}; cur().mini[c.dataset.mini] = c.checked; save(); });
          if (g('#plSep')) g('#plSep').oninput = e => { cur().sepakat = e.target.value.split('\n').map(x => x.trim()).filter(Boolean); save(); };
          if (g('#plTugas')) g('#plTugas').oninput = e => { cur().tugas = e.target.value; save(); };
          PP.$$('[data-skip]').forEach(b => b.onclick = () => { cur().items[b.dataset.skip] = 'skip'; save(); PP.ui.close(); checkDone(); draw(); });
          PP.$$('[name=plJ]').forEach(r => r.onchange = () => { cur().jenis = r.value; save(); });
          if (g('#plGen')) g('#plGen').onclick = () => {
            const names = PPAbsen.data().siswa.map(s => s.nama), n = Math.max(2, Math.min(10, +g('#plGsz').value || 4)); for (let i = names.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [names[i], names[j]] = [names[j], names[i]]; }
            const k2 = Math.max(1, Math.round(names.length / n)), gs = Array.from({ length: k2 }, () => []); names.forEach((x, i) => gs[i % k2].push(x)); cur().groups = gs; save();
            g('#plGroups').innerHTML = gs.map((x, i) => `<div class="pl-g"><b>Kelompok ${i + 1}</b>: ${x.map(esc).join(', ')}</div>`).join('');
          };
        };
        const noteItem = k => {
          PP.ui.modal(`<div class="pl-modal"><h3>Catatan guru</h3><p class="small">${esc(BYK[k].t)}</p><textarea id="plNote" class="pl-ta" rows="4" maxlength="500" placeholder="Tulis catatan pelaksanaan...">${esc(cur().notes[k] || '')}</textarea><div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="plNoteOk">Simpan</button></div></div>`);
          PP.$('#plNoteOk').onclick = () => { const v = PP.$('#plNote').value.trim(); if (v) cur().notes[k] = v; else delete cur().notes[k]; save(); PP.ui.close(); draw(); };
        };
        const complete = () => {
          const c = counts(cur());
          PP.ui.modal(`<div class="pl-modal pl-done"><div class="pl-sparkle"><i>★</i><i>✦</i><i>★</i></div><h3>Pembelajaran Selesai</h3><div class="pl-reward">${PP.ico ? PP.ico('trophy', 'big') : ''}</div><p>${c.d} dari ${c.n} kegiatan terlaksana.</p><p class="small">${esc(tgl(cur().tanggal))}</p><p class="small">Sesi tersimpan di riwayat.</p><div class="row center"><button class="btn" data-close>Lihat Checklist</button><button class="btn green" id="plNew">Mulai Sesi Baru</button></div></div>`);
          PP.$('#plNew').onclick = () => { PP.ui.close(); D.cur = newSession(); save(); draw(); };
          try { PP.ui.confetti && PP.ui.confetti(40); } catch (e) { }
        };
        const actions = {
          new() { const c = counts(cur()); const go = () => { if (cur().status !== 'selesai' && c.d > 0) { upsertHist('belum selesai'); } D.cur = newSession(); save(); draw(); PP.ui.toast('Planning baru dimulai.'); }; if (c.d > 0 && cur().status !== 'selesai') PP.ui.confirm('Sesi sekarang baru ' + c.pct + '% dan akan disimpan ke riwayat sebagai belum selesai. Mulai planning baru?', 'Ya, mulai baru', go); else go(); },
          go() { const nx = ITEMS.find(i => !done(cur(), i.k)); if (!nx) return PP.ui.toast('Semua kegiatan sudah selesai.'); open[nx.sec] = true; draw(); const el = PP.$(`[data-k="${nx.k}"]`, box); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); } },
          reset() { PP.ui.confirm('Semua centang dan catatan pada sesi ini akan dihapus. Lanjutkan reset?', 'Ya, reset', () => { const s = cur(); D.hist = D.hist.filter(h => h.id !== s.id); s.items = {}; s.notes = {}; s.mini = {}; s.groups = null; s.status = 'berjalan'; save(); draw(); PP.ui.toast('Planning direset.'); }); },
          end() {
            const c = counts(cur());
            if (c.d === c.n) { checkDone(); return complete(); }
            const miss = ITEMS.filter(i => !done(cur(), i.k)).map(i => `<li>${esc(i.t)}</li>`).join('');
            PP.ui.modal(`<div class="pl-modal"><h3>Masih ada yang belum dilaksanakan</h3><p class="small">${c.d}/${c.n} selesai. Tahapan yang belum:</p><ul class="pl-ul pl-miss">${miss}</ul><div class="row end"><button class="btn green" data-close>Kembali ke Checklist</button><button class="btn" id="plEndAny">Akhiri Tetap</button></div></div>`);
            PP.$('#plEndAny').onclick = () => { cur().status = 'diakhiri'; cur().akhir = Date.now(); upsertHist('diakhiri sebagian'); D.cur = newSession(); save(); PP.ui.close(); draw(); PP.ui.toast('Sesi disimpan ke riwayat.'); };
          },
          hist() {
            PP.ui.modal(`<div class="pl-modal"><h3>Riwayat Pembelajaran</h3><div class="scrollbox" style="max-height:55vh">${D.hist.length ? D.hist.map((h, i) => `<button class="pl-hi" data-h="${i}"><b>${esc(tgl(h.tanggal))}</b><span>${h.pct}% · ${esc(h.status)} · ${h.d}/${h.n}</span></button>`).join('') : '<p>Belum ada sesi yang diakhiri.</p>'}</div><div class="row end"><button class="btn" data-close>Tutup</button></div></div>`);
            PP.$$('[data-h]').forEach(b => b.onclick = () => { const h = D.hist[+b.dataset.h]; PP.ui.modal(`<div class="pl-modal"><h3>${esc(tgl(h.tanggal))}</h3><p class="small">${esc(h.id)} · ${h.pct}% · ${esc(h.status)}</p>${h.belum.length ? '<b>Belum terlaksana:</b><ul class="pl-ul pl-miss">' + h.belum.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>' : '<p>Semua kegiatan terlaksana.</p>'}${h.notes.length ? '<b>Catatan:</b><ul class="pl-ul">' + h.notes.map(n => `<li><i>${esc(n[0])}</i>: ${esc(n[1])}</li>`).join('') + '</ul>' : ''}<div class="row end"><button class="btn" id="plBackH">Kembali</button><button class="btn" id="plDelH">Hapus</button></div></div>`); PP.$('#plBackH').onclick = () => actions.hist(); PP.$('#plDelH').onclick = () => { D.hist.splice(+b.dataset.h, 1); save(); actions.hist(); }; });
          }
        };
        draw();
      }
    };
  };
})();
