/* =========================================================
   PPRapor — rapor lengkap tiap siswa (SEMUA kategori nilai di game).
   Dikirim ke rooms/{KODE}/rapor/{idPemain} (debounce) supaya guru bisa merekap
   semua siswa. Hanya data yang memang dimasukkan siswa (nama, kelas) + skor game.
   ========================================================= */
(function () {
  'use strict';
  const S = () => window.PPStore, C = () => window.PPCloud;
  const R = {};
  const clean = s => String(s || '').replace(/[<>]/g, '').trim();
  const jbDone = () => { try { const p = JSON.parse(localStorage.getItem('jb_progress') || '{}'); return Object.keys(p).filter(k => p[k] > 0).length; } catch (e) { return 0; } };
  const num = (v, max) => Math.max(0, Math.min(max, Math.round(+v || 0)));
  R.mine = function () {
    const d = S().data, g = k => d.games[k] ? d.games[k].best : -1, ex = d.explore || {};
    const gs = ['A', 'B', 'C', 'D'].map(g).filter(v => v >= 0);
    const o = {
      n: clean(d.name).slice(0, 40) || 'Pemain', k: clean(d.kelas).replace(/\s+/g, '').toUpperCase().slice(0, 12), sk: clean(d.sekolah).slice(0, 60),
      q: d.quiz && d.quiz.best ? num(d.quiz.best.score, 100) : -1, qa: num(d.quiz && d.quiz.attempts, 999),
      ga: g('A'), gb: g('B'), gc: g('C'), gd: g('D'), gr: gs.length ? Math.round(gs.reduce((a, b) => a + b, 0) / gs.length) : -1,
      pos: S().doneCount(), jb: jbDone(), ex: num(Object.keys(ex.solved || {}).length, 9999),
      st: num(S().totalStars(), 1000), xp: num(d.xp, 1000000), lv: num(S().level(), 1000), co: num(ex.coins, 1000000),
      tc: num(d.tally && d.tally.correct, 100000), tw: num(d.tally && d.tally.wrong, 100000), bd: num(Object.keys(d.badges || {}).length + Object.keys((d.lomba && d.lomba.badges) || {}).length, 200),
      rf: d.reflection ? 1 : 0, fn: num(S().finalScore(), 100), hn: num(d.quizHints && d.quizHints.total, 999), ts: Date.now()
    };
    ['ga', 'gb', 'gc', 'gd'].forEach(k => { if (o[k] < 0) o[k] = -1; });
    return o;
  };
  let timer = 0, lastJson = '';
  R.push = function (force) {
    try {
      if (!S() || !window.PP || !PP.registered || !PP.registered() || !window.PPNet || !window.PPCloud) return;
      const id = PPNet.id(), rec = R.mine(), js = JSON.stringify(Object.assign({}, rec, { ts: 0 }));
      if (!force && js === lastJson) return; lastJson = js; C().put('rapor/' + id, rec);
    } catch (e) { }
  };
  const later = () => { clearTimeout(timer); timer = setTimeout(R.push, 3000); };
  setTimeout(() => { try { S().onChange(later); setTimeout(() => R.push(true), 3000); } catch (e) { } }, 0);
  document.addEventListener('visibilitychange', () => { if (document.hidden) R.push(); });
  /* seluruh rapor ruangan + rekap kehadiran (cocok berdasarkan kelas + nama) */
  R.all = async function () {
    const [rp, ab, lk] = await Promise.all([C().get('rapor'), C().get('absen'), C().get('lkpd/nilai').catch(() => null)]);
    if (rp === undefined) throw new Error('net');
    const rows = Object.keys(rp || {}).map(id => Object.assign({ id }, rp[id])).filter(r => r && typeof r.n === 'string');
    const att = {}, dates = {};
    const rec = (ab && ab.rec) || {}, ros = (ab && ab.roster) || {};
    Object.keys(rec).forEach(d => Object.keys(rec[d] || {}).forEach(k => { dates[k] = (dates[k] || 0) + 1; Object.keys(rec[d][k] || {}).forEach(sid => { const a = att[k + '|' + sid] = att[k + '|' + sid] || { H: 0, I: 0, S: 0, A: 0 }; if (a[rec[d][k][sid]] !== undefined) a[rec[d][k][sid]]++; }); }));
    const idx = {}; Object.keys(ros).forEach(k => Object.keys(ros[k] || {}).forEach(sid => { if (ros[k][sid] && ros[k][sid].n) idx[k + '|' + String(ros[k][sid].n).trim().toLowerCase()] = sid; }));
    rows.forEach(r => { const sid = idx[r.k + '|' + r.n.trim().toLowerCase()], a = sid && att[r.k + '|' + sid]; r.att = a || null; r.hari = dates[r.k] || 0; });
    rows.forEach(r => { const x = lk && lk[r.id]; if (x && typeof x === 'object') { r.lkl = String(x.l || '').toUpperCase(); r.lkn = x.s; } });
    return { rows, ab: ab || {} };
  };
  R.HEAD = [
    ['n', 'Nama'], ['k', 'Kelas'], ['q', 'Kuis (terbaik)'], ['qa', 'Percobaan kuis'], ['ga', 'Game A Susun Segitiga'], ['gb', 'Game B Temukan Sisi'], ['gc', 'Game C Misi Jembatan'], ['gd', 'Game D Tantangan Akhir'], ['gr', 'Rata-rata game'],
    ['pos', 'Pos misi (dari 6)'], ['jb', 'Jalur Belajar (dari 6)'], ['ex', 'Soal Jelajah dijawab'], ['st', 'Bintang'], ['tc', 'Jawaban benar'], ['tw', 'Jawaban salah'], ['hn', 'Petunjuk dipakai'],
    ['xp', 'XP'], ['lv', 'Level'], ['co', 'Koin'], ['bd', 'Lencana'], ['rf', 'Refleksi'], ['lkl', 'Level LKPD'], ['lkn', 'Nilai LKPD Proyek'], ['fn', 'Nilai akhir'], ['pr', 'Predikat'], ['H', 'Hadir'], ['I', 'Izin'], ['S', 'Sakit'], ['A', 'Alpa'], ['pct', '% Hadir'], ['ts', 'Terakhir aktif']
  ];
  /* satu baris data mentah -> nilai tampilan sesuai kolom */
  R.cell = function (r, k) {
    const v = r[k], neg = x => (x < 0 ? '' : x);
    switch (k) {
      case 'k': return v ? v.slice(0, 1) + ' ' + v.slice(1) : '';
      case 'q': case 'ga': case 'gb': case 'gc': case 'gd': case 'gr': return neg(v);
      case 'rf': return v ? 'Sudah' : 'Belum';
      case 'pr': return S().predikat(r.fn || 0).t;
      case 'H': case 'I': case 'S': case 'A': return r.att ? r.att[k] : '';
      case 'pct': return r.att && r.hari ? Math.round(r.att.H / r.hari * 100) : '';
      case 'ts': return v ? new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      default: return v == null ? '' : v;
    }
  };
  window.PPRapor = R;
})();
