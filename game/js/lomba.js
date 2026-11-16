/* Hub "Fitur Lomba": satu pintu ke fitur tambahan (rekap, misi, toko, lencana, buat soal, sertifikat, aksesibilitas). */
(function () {
  'use strict';
  const I = n => `<img class="px" src="assets/lomba/ikon/${n}.png" alt="" draggable="false">`;
  PP.ICONS = PP.ICONS || {};
  PP.ICONS.lomba = `<img src="assets/lomba/ikon/ikon_koleksi_lencana.png" alt="" draggable="false" style="width:100%;height:100%;object-fit:contain">`;
  const CARDS = [
    ['rekap', 'Rekap Nilai', 'Semua nilai, cetak, Excel, Word, PDF.', 'ikon_rapor', 'guru'],
    ['laporan', 'Sertifikat & Rapor', 'Sertifikat PNG dan rapor belajar.', 'ikon_sertifikat'],
    ['misi', 'Misi Harian', '3 misi tiap hari + streak.', 'ikon_misi_harian'],
    ['lencana', 'Koleksi Lencana', 'Lencana yang sudah kamu dapat.', 'ikon_koleksi_lencana'],
    ['toko', 'Toko Kostum', 'Tukar koin, pakai di karakter.', 'ikon_toko_kostum'],
    ['buatsoal', 'Buat Soal', 'Soal buatan jadi warga di Jelajah.', 'ikon_buat_soal'],
    ['a11y', 'Aksesibilitas', 'Suara, huruf, kontras, gerak.', 'ikon_aksesibilitas']
  ];
  PP.screens.lomba = function () {
    return {
      html: `<div class="wrap narrowish"><div class="panel fill pad lb"><h2 class="h-title" style="margin:0">Fitur Lomba</h2><p class="small" style="margin:0">Fitur tambahan untuk belajar, mengajar, dan berbagi.</p>
        <div class="lb-grid">${CARDS.map(c => `<button class="lb-card" data-lb="${c[0]}"><span class="lb-ic">${I(c[3])}</span><b>${c[1]}</b><span class="lb-d">${c[2]}</span>${c[4] ? '<em class="lb-tag">Guru</em>' : ''}</button>`).join('')}</div></div></div>`,
      mount(root) {
        root.querySelectorAll('[data-lb]').forEach(b => b.onclick = () => {
          const k = b.dataset.lb;
          if (k === 'a11y') { if (window.PPA11y) PPA11y.open(); else PP.ui.toast('Panel aksesibilitas belum tersedia.'); }
          else if (PP.screens[k]) PP.go(k); else PP.ui.toast('Fitur ini belum tersedia.');
        });
      }
    };
  };
})();
