/* =========================================================
   LAYAR: PAPAN PERINGKAT BERSAMA (rute #papan)
   Data dari PPNet.board(); diperbarui otomatis tiap 6 detik.
   ========================================================= */
(function () {
  const N = window.PPNet;
  PP.screens.papan = function () {
    let timer = 0, alive = true, busy = false;
    const html = `<div class="wrap"><div class="panel fill pad lb">
      <div class="lb-top"><h2 class="h-title" style="margin:0">Papan Peringkat</h2>
        <div class="lb-room" id="lbRoom" hidden><span>Ruangan</span><b id="lbCode"></b><button class="btn sm nosfx" id="lbCopy" aria-label="Salin tautan ruangan">Salin</button></div></div>
      <p class="lb-st" id="lbSt" role="status">Memuat…</p>
      <div class="lb-head" id="lbHead" hidden><span>#</span><span>Pemain</span><span>Kuis</span><span>Akhir</span></div>
      <ol class="lb-list" id="lbList" hidden></ol>
      <div class="lb-msg" id="lbMsg" hidden></div>
      <div class="lb-me" id="lbMe" hidden></div>
      <div class="row center lb-act"><button class="btn green sm" id="lbRef">Perbarui</button><button class="btn sm" data-go="profil" id="lbEdit">Ubah Ruangan</button><button class="btn sm" data-go="menu">Menu</button></div>
    </div></div>`;
    return {
      html,
      mount(root) {
        const $ = id => root.querySelector('#' + id);
        const setSt = (t, cls) => { const e = $('lbSt'); e.textContent = t; e.className = 'lb-st ' + (cls || ''); };
        const showMsg = (title, body, btn) => {
          $('lbList').hidden = $('lbHead').hidden = $('lbMe').hidden = true;
          const m = $('lbMsg'); m.hidden = false;
          m.innerHTML = `<b>${title}</b><p>${body}</p>${btn || ''}`;
        };
        const medal = r => r === 1 ? 'star_gold' : r === 2 ? 'star_silver' : r === 3 ? 'star_bronze' : '';
        function draw(rows) {
          $('lbMsg').hidden = true;
          if (!rows.length) { showMsg('Belum ada pemain', 'Bagikan kode ruangan ke teman sekelas. Nama muncul di sini setelah mereka menyimpan profil.'); return; }
          $('lbHead').hidden = false; const ul = $('lbList'); ul.hidden = false;
          ul.innerHTML = rows.map(p => {
            const av = (PP.AV[p.avatar] || PP.AV.boy).idle;
            return `<li class="lb-row ${p.isMe ? 'me' : ''} ${p.rank <= 3 && p.hasQuiz ? 'top' : ''}"><span class="lb-r">${medal(p.rank) && p.hasQuiz ? PP.img(medal(p.rank), 'lb-medal') : p.rank}</span>
              <span class="lb-p">${PP.img(av, 'lb-av')}<span class="lb-n"><b>${PP.esc(p.name)}</b>${p.kelas ? `<small>${PP.esc(p.kelas)}</small>` : ''}</span></span>
              <span class="lb-s">${p.hasQuiz ? p.quiz : '–'}</span><span class="lb-s sub">${p.f}</span></li>`;
          }).join('');
          const me = rows.find(p => p.isMe);
          const mb = $('lbMe'); mb.hidden = false;
          mb.innerHTML = me ? `Peringkatmu <b>#${me.rank}</b> dari ${rows.length} pemain${me.hasQuiz ? ' · nilai kuis <b>' + me.quiz + '</b>' : ' · ayo kerjakan kuis untuk masuk peringkat'}` : `${rows.length} pemain di ruangan. Simpan profilmu agar namamu muncul.`;
          const mine = ul.querySelector('.me'); if (mine && rows.length > 6) mine.scrollIntoView({ block: 'nearest' });
        }
        async function load(manual) {
          if (busy) return; busy = true;
          if (!N.configured()) {
            setSt('Fitur online belum disambungkan.', 'warn');
            showMsg('Online belum aktif', 'Guru perlu mengisi alamat Firebase di <code>js/firebase-config.js</code>. Panduannya ada di <code>PETUNJUK_FIREBASE.md</code>. Game tetap bisa dimainkan seperti biasa.');
            busy = false; return;
          }
          if (!N.room()) {
            setSt('Kamu belum masuk ruangan.', 'warn');
            showMsg('Masukkan kode ruangan', 'Tanyakan kode ruangan ke gurumu, lalu isi di halaman profil.', '<div class="row center"><button class="btn green" data-go="profil">Isi Kode Ruangan</button></div>');
            $('lbEdit').hidden = true; busy = false; return;
          }
          $('lbRoom').hidden = false; $('lbCode').textContent = N.room();
          if (manual) setSt('Memperbarui…');
          try {
            if (N.pending()) await N.sync();
            const rows = await N.board();
            if (!alive) return;
            draw(rows); setSt(rows.length + ' pemain · diperbarui ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + (N.pending() ? ' · skormu belum terkirim' : ''), N.pending() ? 'warn' : 'ok');
          } catch (e) {
            if (!alive) return;
            setSt('Tidak dapat terhubung ke server.', 'bad');
            if (!$('lbList').children.length) showMsg('Koneksi bermasalah', (e && e.status === 401) || (e && e.status === 403) ? 'Database menolak akses. Guru perlu memeriksa aturan (Rules) Firebase.' : 'Periksa internetmu lalu ketuk Perbarui. Skor yang belum terkirim akan dicoba lagi otomatis.');
          }
          busy = false;
        }
        $('lbRef').onclick = () => load(true);
        $('lbCopy').onclick = () => {
          const url = N.shareLink(), done = () => PP.ui.toast('Tautan ruangan disalin.');
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => PP.ui.toast('Kode ruangan: ' + N.room())); else PP.ui.toast('Kode ruangan: ' + N.room());
        };
        load(false);
        timer = setInterval(() => { if (!document.hidden) load(false); }, 6000);
        this._stop = () => { alive = false; clearInterval(timer); };
      },
      unmount() { alive = false; clearInterval(timer); }
    };
  };
})();
