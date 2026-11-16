/* =========================================================
   LKPD PROYEK — DATA & NASKAH
   Tema: "Tim Satgas Keselamatan & Fasilitas Sekolah" (PjBL, Teorema Pythagoras)
   Berisi: parameter bawaan, peran, fase, tiga LKPD (A Dasar, B Menengah, C Mahir),
   asesmen diagnostik 5 soal, rubrik, pemetaan kognitif, rumus pemeriksaan otomatis
   dan pembuat naskah Markdown. Semua angka acuan = "perlu diverifikasi guru".
   ========================================================= */
(function () {
  'use strict';
  window.PP = window.PP || {};
  const L = PP.LKPD = {};

  /* ---------- parameter bawaan (guru boleh mengubah) ---------- */
  L.DEF = { t: 2, c: 3.2, b: 0.8, h0: 0, tol: 0.05, thA: 4, thB: 7, wKel: 70, wInd: 30, dA: 0, dB: 0, dC: 0, kA: 1, kB: 1, kC: 1, gs: 5, ew: 5, au: 1 };
  /* [kunci, label, catatan, asal-usul/cara pemakaian (agar guru dapat memeriksa kebenarannya)] */
  L.PARAM_INFO = [
    ['t', 'Tinggi ikatan tali pada tiang (m) · Level Dasar', 'Ditetapkan guru', 'Dipakai pada rumus c = √(t² + j²). Ukur tinggi ikatan tali pada tiang yang dipakai kelas, atau tetapkan angka latihan. Siswa hanya mengukur jarak patok j.'],
    ['c', 'Panjang tangga sekolah (m) · Level Mahir', 'Ukur tangga yang sebenarnya', 'Sisi miring pada a = √(c² − b²). Ukur panjang tangga lipat yang benar-benar dipakai sekolah. Siswa dapat menimpanya bila mengukur sendiri.'],
    ['b', 'Jarak aman kaki tangga dari tembok (m) · Level Mahir', 'Perlu diverifikasi guru', 'Alas segitiga pada a = √(c² − b²). Angka acuan: ± seperempat panjang tangga; sesuaikan dengan pedoman keselamatan sekolah.'],
    ['h0', 'Ambang tambahan (m) · Level Mahir', 'Bawaan 0', 'Keputusan LAYAK bila a ≥ tinggi target + ambang. Isi 0 bila tidak ada ambang keselamatan tambahan.'],
    ['tol', 'Toleransi pemeriksaan otomatis (± angka)', 'Bawaan 0,05', 'Jawaban siswa dianggap benar bila selisihnya dari angka acuan ≤ toleransi. Contoh: acuan 3,253 dan siswa menulis 3,256 (selisih 0,003) tetap BENAR. Berlaku untuk semua isian angka LKPD.'],
    ['thA', 'Skor diagnostik maksimum untuk Kelompok Dasar', '0 sampai nilai ini', 'Skor tes 0 sampai nilai ini masuk Kelompok Dasar (A).'],
    ['thB', 'Skor diagnostik maksimum untuk Kelompok Menengah', 'Di atasnya: Kelompok Mahir', 'Skor di atas ambang Dasar sampai nilai ini masuk Kelompok Menengah (B); di atasnya masuk Kelompok Mahir (C).'],
    ['wKel', 'Bobot nilai kelompok (%)', 'Sisanya nilai individu', 'Nilai akhir = (bobot kelompok × rata-rata rubrik kelompok + bobot individu × nilai individu) ÷ (jumlah bobot).'],
    ['wInd', 'Bobot nilai individu (%)', '', 'Nilai individu = kontribusi, penilaian sejawat, dan refleksi (skala 1–4).']
  ];
  /* nama kelompok sesuai konsep diferensiasi */
  L.nm = (lv, n) => `Kelompok ${L.LV[lv].nama}${n ? ' ' + n : ''}`;

  L.TEMA = 'Tim Satgas Keselamatan & Fasilitas Sekolah';
  L.KEAMANAN = 'Keselamatan: jangan memanjat tangga, tiang, pagar, atau tembok. Pengukuran bagian tinggi dilakukan guru/petugas, atau diperkirakan dari bawah memakai penanda. Bekerja bersama kelompok dan jangan berlari di area kerja.';
  L.PRIVASI = 'Privasi: foto hanya objek dan lingkungan sekolah. Jangan menampilkan wajah siswa lain; bila ada yang tertangkap kamera, ambil ulang foto.';
  L.VERIF = 'perlu diverifikasi guru';

  /* ---------- peran & fase ---------- */
  L.ROLES5 = [
    { k: 'ketua', n: 'Ketua', i: 'r_ketua', d: 'Memimpin, membagi tugas, menjaga waktu.' },
    { k: 'catat', n: 'Pencatat', i: 'r_catat', d: 'Mencatat data dan langkah hitung di LKPD.' },
    { k: 'ukur', n: 'Pengukur', i: 'r_ukur', d: 'Mengukur dengan meteran/tali berskala (tanpa memanjat).' },
    { k: 'foto', n: 'Fotografer/Pencoret', i: 'r_foto', d: 'Memotret objek lalu mencoret garis dan label di galeri HP.' },
    { k: 'jubir', n: 'Juru Bicara', i: 'r_jubir', d: 'Menyampaikan hasil saat presentasi.' }
  ];
  L.ROLES4 = [L.ROLES5[0], { k: 'catat', n: 'Pencatat/Pengukur', i: 'r_catat', d: 'Mengukur sekaligus mencatat data dan langkah hitung.' }, L.ROLES5[3], L.ROLES5[4]];
  L.FASE = [
    { n: 1, i: 'f1', t: 'Pertanyaan Mendasar', b: 'A. Cerita Masalah' },
    { n: 2, i: 'f2', t: 'Perencanaan & Jadwal', b: 'B. Langkah Kerja' },
    { n: 3, i: 'f4', t: 'Monitoring: Data', b: 'C. Tabel Hasil Pengukuran' },
    { n: 4, i: 'f3', t: 'Monitoring: Hitung', b: 'D. Penyelesaian Matematis' },
    { n: 5, i: 'f5', t: 'Uji & Presentasi', b: 'E. Kesimpulan + G. Dokumentasi' },
    { n: 6, i: 'f6', t: 'Evaluasi & Refleksi', b: 'F. Diskusi dan Refleksi' }
  ];
  L.PRES_MENIT = { a: 3, b: 5, c: 7 };

  /* ---------- tiga LKPD ---------- */
  L.LV = {
    a: {
      id: 'a', abjad: 'A', nama: 'Dasar', sebut: 'Perlu Bimbingan', bloom: 'C3 terbimbing', ikon: 'a',
      judul: 'Satgas Tali Penyangga: Berdiri Kokoh dan Aman',
      topik: 'Panjang tali penyangga tiang bendera / tiang net / tenda pramuka',
      pilih: { label: 'Objek yang diperiksa (pilih satu)', opsi: ['Tiang bendera', 'Tiang net (voli/bulu tangkis)', 'Tenda pramuka'] },
      cerita: 'Tim Satgas menemukan tiang yang miring ketika tertiup angin. Tali penyangga perlu dipasang: satu ujung diikat pada tiang di ketinggian tertentu, ujung lainnya ditancapkan ke patok di tanah. Tiang tegak lurus tanah, sehingga tiang, tanah, dan tali membentuk segitiga siku-siku.',
      tanya: 'Berapa panjang tali penyangga yang diperlukan agar tiang berdiri kokoh, bila tali diikat pada tinggi t dan patok berjarak j dari kaki tiang?',
      alat: ['Meteran / tali berskala', 'Tali rafia', 'Patok', 'HP (kamera)', 'Kalkulator Alat Bantu'],
      visual: 'Bentangkan tali rafia atau benang dari tiang ke patok di tanah sebelum difoto, agar bentuk segitiga terlihat jelas.',
      langkah: [
        'Ketua membagi peran, lalu kelompok memilih satu objek.',
        'Pengukur mengukur jarak patok dari kaki tiang (j) di tanah datar. Tinggi ikatan t sudah ditetapkan guru; jangan memanjat.',
        'Bentangkan tali rafia dari titik ikatan ke patok. Pencatat menulis j di Tabel Hasil.',
        'Fotografer memotret segitiga (tiang, tali, jarak patok) dari samping, tanpa wajah teman.',
        'Buka foto di galeri/WhatsApp, tarik garis segitiga dengan alat pensil, beri label t, j, c dengan alat teks, lalu simpan.',
        'Hitung c memakai langkah isian, lalu unggah foto dan tulis kesimpulan.'
      ],
      variabel: [{ k: 'j', n: 'Jarak patok dari kaki tiang (j)', u: 'm', ket: 'Ukur di tanah datar dengan meteran.' }],
      tetap: [{ k: 't', n: 'Tinggi ikatan tali pada tiang (t)', u: 'm', ket: 'Ditetapkan guru (parameter).' }],
      hasil: [{ k: 'c', n: 'Panjang tali penyangga (c)', u: 'm' }],
      templat: true,
      bantuan: [
        'Petunjuk 1: Tiang tegak lurus tanah, jadi tali menjadi sisi miring (sisi terpanjang, di depan sudut siku-siku).',
        'Petunjuk 2: Sisi miring dicari dengan menjumlahkan kuadrat kedua sisi tegak, lalu menarik akarnya.',
        'Petunjuk 3: Hitung t², lalu j², jumlahkan keduanya, kemudian tarik akar memakai kalkulator Alat Bantu. Tulis dua angka di belakang koma.'
      ],
      diskusi: [
        'Mengapa tiang, tanah, dan tali membentuk segitiga siku-siku? Sebutkan mana sisi miringnya.',
        'Bila patok digeser lebih jauh dari tiang (j bertambah), apa yang terjadi pada panjang tali? Jelaskan alasannya.',
        'Tali sebaiknya diberi tambahan panjang untuk simpul. Apakah tambahan itu bagian dari hasil rumus? Tanyakan pada guru ukuran tambahan yang aman (perlu diverifikasi guru).'
      ],
      kesimpulanAwal: 'Panjang tali penyangga minimal ... m, dihitung dari ... dan ... .',
      rubrikHitung: [
        'Segitiga terlihat jelas; label t, j, c benar.',
        'Langkah isian lengkap dan urut.',
        'Hasil c sesuai toleransi dan memakai satuan.'
      ],
      foto: 'Foto beranotasi 1 segitiga: tiang, tali, jarak patok; label t, j, c.'
    },
    b: {
      id: 'b', abjad: 'B', nama: 'Menengah', sebut: 'Berkembang', bloom: 'C3–C4', ikon: 'b',
      judul: 'Satgas Jalan Pintas: Lewat Diagonal Lapangan',
      topik: 'Jarak diagonal lapangan sekolah (persegi panjang) dan selisih jalan pintas',
      pilih: { label: 'Area persegi panjang yang diukur', opsi: ['Lapangan upacara', 'Lapangan voli / basket', 'Halaman sekolah berbentuk persegi panjang'] },
      pilihCara: { label: 'Cara mengukur', opsi: ['Meteran gulung', 'Tali berskala', 'Langkah terkalibrasi'] },
      cerita: 'Banyak siswa memotong lapangan secara diagonal agar cepat sampai, padahal rumput menjadi rusak dan lapangan licin. Satgas ingin tahu seberapa hemat jalan pintas itu dibanding berjalan menyusuri dua sisi lapangan (panjang lalu lebar), supaya bisa membuat jalur pejalan kaki yang masuk akal.',
      tanya: 'Berapa meter lebih hemat berjalan lurus diagonal dibanding menyusuri panjang lalu lebar lapangan?',
      alat: ['Meteran gulung / tali berskala', 'Tas, sepatu, atau botol minum sebagai penanda sudut', 'HP (kamera)', 'Kalkulator Alat Bantu'],
      visual: 'Tandai tiga sudut lapangan dengan tas, sepatu, atau botol minum sebelum difoto, agar garis diagonal imajiner mudah ditarik di HP.',
      langkah: [
        'Ketua membagi peran. Kelompok memilih area persegi panjang dan cara mengukur, lalu menulis alasannya.',
        'Bila memakai langkah terkalibrasi: ukur 10 langkah dengan meteran, bagi 10 untuk mendapat panjang satu langkah.',
        'Pengukur mengukur panjang (p) dan lebar (l). Pencatat menulis di Tabel Hasil. Ukur dua kali, ambil yang konsisten.',
        'Letakkan penanda di tiga sudut. Fotografer memotret dari tempat aman tanpa wajah teman.',
        'Di galeri/WhatsApp, tarik garis p, l, dan diagonal d dengan alat pensil, beri label dengan alat teks, lalu simpan.',
        'Hitung d dan selisih jalan pintas dengan langkah sendiri, lalu tulis maknanya.'
      ],
      variabel: [{ k: 'p', n: 'Panjang area (p)', u: 'm', ket: 'Ukur sisi terpanjang.' }, { k: 'l', n: 'Lebar area (l)', u: 'm', ket: 'Ukur sisi yang lebih pendek.' }],
      tetap: [],
      hasil: [{ k: 'd', n: 'Panjang diagonal (d)', u: 'm' }, { k: 'sel', n: 'Selisih jalan pintas (p + l − d)', u: 'm' }],
      templat: false,
      bantuan: [],
      diskusi: [
        'Mengapa kita bisa memakai Teorema Pythagoras untuk diagonal lapangan? Jelaskan segitiga siku-siku yang kamu pakai.',
        'Jelaskan makna selisih p + l − d dalam kalimat sehari-hari: berapa meter lebih hemat dan mengapa?',
        'Apa yang membuat hasil ukur kelompokmu bisa meleset (misalnya cara mengukur atau langkah yang tidak sama)? Bagaimana memperbaikinya?'
      ],
      kesimpulanAwal: 'Diagonal lapangan ... m. Jalan pintas lebih hemat ... m dibanding menyusuri dua sisi karena ... .',
      rubrikHitung: [
        'Pengukuran p dan l konsisten.',
        'Langkah hitung runtut tanpa lompatan.',
        'd dan selisih benar; penjelasan makna selisih masuk akal.'
      ],
      foto: 'Foto beranotasi: p, l, dan diagonal d pada area yang dipilih.'
    },
    c: {
      id: 'c', abjad: 'C', nama: 'Mahir', sebut: 'Tantangan', bloom: 'C4–C5', ikon: 'c',
      judul: 'Satgas Tangga Lipat: Layak atau Tidak?',
      topik: 'Kelayakan tangga lipat untuk memperbaiki lampu / proyektor kelas',
      pilih: { label: 'Titik yang akan diperbaiki', opsi: ['Lampu kelas', 'Proyektor kelas', 'Titik lain di ruang (atas pilihan guru)'] },
      cerita: 'Lampu atau proyektor di ruang kelas perlu diperbaiki. Petugas sekolah memakai tangga lipat yang disandarkan ke tembok. Tangga yang terlalu pendek tidak sampai ke titik kerja, sedangkan tangga yang terlalu curam berbahaya. Satgas diminta menilai apakah tangga yang ada layak dipakai untuk titik tersebut.',
      tanya: 'Dengan jarak aman kaki tangga dari tembok b, seberapa tinggi ujung tangga mencapai tembok (a), dan apakah itu cukup untuk mencapai titik target?',
      alat: ['Meteran / tali berskala', 'Lakban kertas (penanda)', 'HP (kamera)', 'Kalkulator Alat Bantu'],
      visual: 'Tempel penanda lakban kertas di lantai pada jarak aman b dari tembok, dan di dinding pada batas jangkauan, sebagai acuan garis segitiga sebelum difoto.',
      langkah: [
        'Ketua membagi peran. Pastikan guru/petugas hadir; siswa tidak memanjat tangga.',
        'Ukur atau tanyakan panjang tangga sekolah yang sebenarnya (c). Nilai bawaan aplikasi hanya contoh (perlu diverifikasi guru).',
        'Tempel lakban penanda di lantai pada jarak aman b dari tembok (nilai bawaan 0,8 m, perlu diverifikasi guru).',
        'Dapatkan tinggi target h_target tanpa memanjat: diukur guru/petugas, atau diperkirakan dari bawah memakai penanda di dinding.',
        'Fotografer memotret tangga, tembok, penanda lantai, dan penanda dinding. Tarik garis segitiga, lalu beri label c, b, a, dan h_target.',
        'Hitung a dengan membalik rumus, bandingkan dengan h_target, lalu putuskan LAYAK atau TIDAK LAYAK beserta alasan.'
      ],
      variabel: [{ k: 'h', n: 'Tinggi titik target (h_target)', u: 'm', ket: 'Diukur guru/petugas atau diperkirakan dari bawah.' }, { k: 'cm', n: 'Panjang tangga sebenarnya (c)', u: 'm', ket: 'Isi bila berbeda dari nilai bawaan guru.', opt: true }, { k: 'bm', n: 'Jarak kaki tangga dari tembok (b)', u: 'm', ket: 'Isi bila berbeda dari nilai bawaan guru.', opt: true }],
      tetap: [{ k: 'c', n: 'Panjang tangga (c)', u: 'm', ket: 'Bawaan guru (contoh).' }, { k: 'b', n: 'Jarak aman dari tembok (b)', u: 'm', ket: 'Bawaan guru (contoh).' }],
      hasil: [{ k: 'a', n: 'Tinggi ujung tangga di tembok (a)', u: 'm' }],
      templat: false,
      bantuan: [],
      diskusi: [
        'Mengapa kita memakai a = √(c² − b²) dan bukan menjumlahkan kuadrat? Tunjukkan sisi miring pada segitigamu.',
        'Jelaskan keputusanmu (layak / tidak layak). Unsur keselamatan apa saja yang kamu pertimbangkan selain panjang tangga?',
        'Bila jarak kaki tangga dari tembok diperbesar, apa yang terjadi pada a dan pada keamanan? Aturan keselamatan nyata harus diverifikasi guru atau pihak sekolah.'
      ],
      kesimpulanAwal: 'Tinggi ujung tangga a ≈ ... m, sedangkan tinggi target ... m. Maka tangga ... karena ... .',
      rubrikHitung: [
        'Rumus dibalik dengan benar: a = √(c² − b²).',
        'Perbandingan a dan h_target tepat.',
        'Keputusan sesuai data dan alasan menyebut unsur keselamatan.'
      ],
      foto: 'Foto beranotasi: c, b, a, dan h_target pada tangga dan tembok.'
    }
  };

  /* ---------- pemeriksaan otomatis ---------- */
  const r2 = x => Math.round(x * 100) / 100;
  const num = v => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.').replace(/[^\d.\-]/g, '')); return isFinite(n) ? n : NaN; };
  L.num = num; L.r2 = r2;
  /* v = variabel hasil ukur siswa, P = parameter guru */
  L.expect = function (lv, v, P) {
    P = Object.assign({}, L.DEF, P || {}); v = v || {};
    if (lv === 'a') { const t = P.t, j = num(v.j); if (!(j > 0)) return null; return { t2: r2(t * t), j2: r2(j * j), s: r2(t * t + j * j), c: r2(Math.sqrt(t * t + j * j)) }; }
    if (lv === 'b') { const p = num(v.p), l = num(v.l); if (!(p > 0 && l > 0)) return null; const d = Math.sqrt(p * p + l * l); return { p2: r2(p * p), l2: r2(l * l), d: r2(d), sel: r2(p + l - d) }; }
    if (lv === 'c') {
      const c = num(v.cm) > 0 ? num(v.cm) : P.c, b = num(v.bm) > 0 ? num(v.bm) : P.b, h = num(v.h); if (!(c > b && b > 0)) return null;
      const a = Math.sqrt(c * c - b * b); return { c, b, a: r2(a), dec: isFinite(h) && h > 0 ? (a >= h + P.h0 ? 'layak' : 'tidak') : null };
    }
    return null;
  };
  const ok = (x, y, tol) => isFinite(x) && Math.abs(x - y) <= tol + 1e-9;
  /* s = jawaban siswa: {c} / {d,sel} / {a,dec}, st = isian langkah (A). Mengembalikan {f:{kolom:true/false/null}, hint:{}} */
  L.check = function (lv, v, s, P) {
    P = Object.assign({}, L.DEF, P || {}); s = s || {}; const e = L.expect(lv, v, P), f = {}, hint = {};
    if (!e) return { f, hint, ready: false };
    const tol = P.tol;
    if (lv === 'a') {
      const st = s.st || {};
      f.t2 = ok(num(st.t2), e.t2, tol); f.j2 = ok(num(st.j2), e.j2, tol); f.s = ok(num(st.s), e.s, tol); f.c = ok(num(s.c), e.c, tol);
      if (st.t2 !== undefined && f.t2 === false) hint.t2 = 'Kuadrat artinya dikali dirinya sendiri: t × t. Coba lagi.';
      if (f.j2 === false) hint.j2 = 'Hitung j × j memakai kalkulator Alat Bantu.';
      if (f.s === false) hint.s = 'Jumlahkan t² dan j² (tambah, bukan kali).';
      if (f.c === false) hint.c = 'Sudah menarik akar dari jumlah tadi? Sisi miring harus lebih panjang dari t dan j.';
    } else if (lv === 'b') {
      f.d = ok(num(s.d), e.d, tol); f.sel = ok(num(s.sel), e.sel, tol);
      if (!f.d) hint.d = 'Jumlahkan p² dan l², lalu tarik akarnya. Diagonal harus lebih panjang dari p maupun l.';
      if (!f.sel) hint.sel = 'Selisih = (p + l) dikurangi d. Pakai d milikmu yang sudah benar.';
    } else {
      f.a = ok(num(s.a), e.a, tol); f.dec = e.dec ? (String(s.dec || '') === e.dec) : null;
      if (!f.a) hint.a = 'Tangga adalah sisi miring, jadi kuadrat panjang tangga DIKURANGI kuadrat jarak kaki, lalu diakar.';
      if (f.dec === false) hint.dec = 'Bandingkan a dengan tinggi target (ditambah ambang bila ada). Apakah a cukup?';
    }
    return { f, hint, ready: true, e };
  };
  /* skor saran untuk aspek ketepatan (1-4) dari hasil pemeriksaan */
  L.sarankan = function (ck) {
    const v = Object.values(ck || {}).filter(x => x === true || x === false); if (!v.length) return 0;
    const r = v.filter(Boolean).length / v.length; return r >= 1 ? 4 : r >= .67 ? 3 : r >= .34 ? 2 : 1;
  };

  /* ---------- asesmen diagnostik (10 skor: 5 soal x 0/1/2) ---------- */
  const fig = (lbl) => `<svg viewBox="0 0 140 90" width="140" height="90" role="img" aria-label="Segitiga siku-siku KLM, siku-siku di K"><polygon points="20,70 20,12 110,70" fill="#fde8b8" stroke="#3b2412" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 58H32V70" fill="none" stroke="#3b2412" stroke-width="2"/><text x="6" y="80" font-size="13" font-weight="800" fill="#3b2412">K</text><text x="6" y="14" font-size="13" font-weight="800" fill="#3b2412">L</text><text x="112" y="82" font-size="13" font-weight="800" fill="#3b2412">M</text></svg>`;
  L.DIAG = [
    { id: 1, c: 'Kuadrat dan akar', t: 'Hitung nilai berikut.', p: [{ l: '7² =', k: 'n', a: 49, tol: .001, kunci: '49' }, { l: '√81 =', k: 'n', a: 9, tol: .001, kunci: '9' }] },
    { id: 2, c: 'Mengenali sisi miring', t: 'Pada segitiga siku-siku KLM (siku-siku di K) di bawah ini:', svg: fig(), p: [{ l: 'Sisi miring adalah sisi …', k: 'm', o: ['KL', 'KM', 'LM'], a: 'LM', kunci: 'LM' }, { l: 'Sisi miring selalu …', k: 'm', o: ['paling pendek', 'sama panjang dengan sisi tegak', 'paling panjang dan di depan sudut siku-siku'], a: 'paling panjang dan di depan sudut siku-siku', kunci: 'paling panjang, di depan sudut siku-siku' }] },
    { id: 3, c: 'Hitung sisi miring (C3)', t: 'Sebuah segitiga siku-siku memiliki sisi tegak 6 cm dan 7 cm.', p: [{ l: 'Jumlah kuadrat kedua sisi tegak =', k: 'n', a: 85, tol: .001, kunci: '85' }, { l: 'Panjang sisi miring (cm, dua desimal) ≈', k: 'n', a: 9.22, tol: .05, kunci: '√85 ≈ 9,22' }] },
    { id: 4, c: 'Hitung sisi tegak (C3–C4)', t: 'Sebuah segitiga siku-siku memiliki sisi miring 9 cm dan salah satu sisi tegak 5 cm.', p: [{ l: 'Kuadrat sisi tegak lainnya (b²) =', k: 'n', a: 56, tol: .001, kunci: '81 − 25 = 56' }, { l: 'Panjang sisi tegak lainnya (cm, dua desimal) ≈', k: 'n', a: 7.48, tol: .05, kunci: '√56 ≈ 7,48' }] },
    { id: 5, c: 'Evaluasi keputusan (C5)', t: 'Tangga sepanjang 4,5 m disandarkan ke tembok dengan kaki tangga 1 m dari tembok. Ujung tangga harus mencapai lampu setinggi 4,5 m.', p: [{ l: 'Tinggi ujung tangga di tembok (m, dua desimal) ≈', k: 'n', a: 4.39, tol: .05, kunci: '√(20,25 − 1) ≈ 4,39' }, { l: 'Keputusan:', k: 'm', o: ['Layak', 'Tidak layak'], a: 'Tidak layak', kunci: 'Tidak layak (4,39 < 4,5)' }] }
  ];
  L.diagSkor = function (ans) {
    let tot = 0; const per = L.DIAG.map(q => { let s = 0; q.p.forEach((p, i) => { const x = ans && ans[q.id] ? ans[q.id][i] : ''; if (p.k === 'n' ? ok(num(x), p.a, p.tol) : String(x) === p.a) s++; }); tot += s; return s; });
    return { per, tot };
  };
  L.levelDari = (tot, P) => { P = Object.assign({}, L.DEF, P || {}); return tot <= P.thA ? 'a' : tot <= P.thB ? 'b' : 'c'; };

  /* ---------- rubrik ---------- */
  L.SKALA = ['Perlu Perbaikan', 'Cukup', 'Baik', 'Sangat Baik'];
  L.RUBRIK = [
    { k: 'hit', n: 'Ketepatan perhitungan', d: ['Banyak langkah/hasil salah, satuan atau label tidak ada.', 'Sebagian langkah benar, hasil di luar toleransi atau langkah melompat.', 'Langkah benar dan urut, hasil sesuai toleransi, ada kekeliruan kecil.', 'Semua langkah benar, urut, hasil sesuai toleransi, satuan dan label lengkap.'] },
    { k: 'vis', n: 'Kejelasan visual Foto & Coret', d: ['Foto buram/tidak relevan, segitiga tidak terlihat.', 'Segitiga terlihat sebagian, label kurang.', 'Segitiga jelas, label hampir lengkap.', 'Segitiga sangat jelas, garis dan label lengkap, tanpa wajah siswa lain.'] },
    { k: 'tim', n: 'Kerja sama tim', d: ['Peran tidak berjalan, satu orang mengerjakan semua.', 'Peran berjalan sebagian, perlu diingatkan.', 'Peran berjalan, saling membantu.', 'Peran dirotasi, semua aktif dan saling menghargai.'] },
    { k: 'pre', n: 'Presentasi', d: ['Tidak runtut, tidak sesuai waktu.', 'Cukup runtut, kurang menjelaskan alasan.', 'Runtut, jelas, memakai foto sebagai media.', 'Runtut, percaya diri, alasan kuat, menjawab pertanyaan dengan tepat.'] }
  ];
  L.INDIVIDU = [{ k: 'kon', n: 'Kontribusi' }, { k: 'sej', n: 'Penilaian sejawat' }, { k: 'ref', n: 'Refleksi' }];
  L.RUBRIK_KHUSUS = { a: 'Ketepatan (A): label t, j, c benar; langkah isian lengkap; hasil sesuai toleransi.', b: 'Ketepatan (B): pengukuran konsisten; langkah runtut; d dan selisih benar; penjelasan masuk akal.', c: 'Ketepatan (C): pembalikan rumus benar; perbandingan a dan h_target tepat; keputusan sesuai data; alasan menyebut keselamatan.' };
  L.nilai = function (rub, ind, P) {
    P = Object.assign({}, L.DEF, P || {}); const g = L.RUBRIK.reduce((a, r) => a + (+rub[r.k] || 0), 0), i = L.INDIVIDU.reduce((a, r) => a + (+(ind || {})[r.k] || 0), 0);
    const kg = g / (L.RUBRIK.length * 4) * 100, ki = i / (L.INDIVIDU.length * 4) * 100, w = P.wKel + P.wInd || 100;
    return Math.round((kg * P.wKel + ki * P.wInd) / w);
  };

  /* ---------- pemetaan kognitif (lampiran modul ajar) ---------- */
  L.PEMETAAN = {
    kepala: ['Aspek', 'A · Dasar (Perlu Bimbingan)', 'B · Menengah (Berkembang)', 'C · Mahir (Tantangan)'],
    baris: [
      ['Tujuan Pembelajaran (sama)', 'Menerapkan Teorema Pythagoras untuk menyelesaikan masalah kontekstual', 'Menerapkan Teorema Pythagoras untuk menyelesaikan masalah kontekstual', 'Menerapkan Teorema Pythagoras untuk menyelesaikan masalah kontekstual'],
      ['Jenjang Bloom', 'C3 terbimbing', 'C3–C4', 'C4–C5'],
      ['Topik', 'Panjang tali penyangga tiang', 'Diagonal lapangan dan selisih jalan pintas', 'Kelayakan tangga lipat'],
      ['Variabel yang diukur siswa', 'Satu: jarak patok j (t ditetapkan guru)', 'Dua: panjang p dan lebar l', 'Tinggi target h_target (c dan b dari parameter/ukuran)'],
      ['Bentuk rumus', 'c = √(t² + j²) langsung', 'd = √(p² + l²), lalu selisih p + l − d', 'Dibalik: a = √(c² − b²)'],
      ['Scaffolding', 'Templat isian langkah demi langkah dan kartu bantuan bertahap', 'Tanpa templat; siswa menyusun langkah sendiri', 'Tanpa templat; menganalisis dan memutuskan sendiri'],
      ['Bentuk keputusan', 'Hasil akhir dengan satuan', 'Hasil akhir dan penjelasan makna selisih', 'Layak / tidak layak disertai alasan keselamatan'],
      ['Presentasi', '3 menit; tiap anggota bicara minimal sekali', '5 menit; langkah hitung dan makna selisih', '7 menit; mempertahankan keputusan, menanggapi pertanyaan']
    ],
    alasan: 'Ketiganya adil dan terukur karena tujuan pembelajaran, dimensi rubrik (ketepatan, visual, kerja sama, presentasi), skala 1–4, dan metode Foto & Coret SAMA. Yang berbeda hanya kedalaman berpikir dan tingkat kemandirian: jumlah variabel yang diukur, ada tidaknya templat, dan bentuk keputusan. Setiap kelompok dinilai dengan indikator yang setara terhadap tuntutan levelnya, sehingga siswa yang butuh bimbingan tetap dapat meraih nilai tertinggi pada levelnya.'
  };

  /* ---------- pembuat naskah Markdown (ekspor / cetak) ---------- */
  L.markdown = function (lv, g, P) {
    P = Object.assign({}, L.DEF, P || {}); const d = L.LV[lv], o = [], nl = s => o.push(s == null ? '' : s);
    nl(`# LKPD Proyek ${d.abjad} · ${d.judul}`); nl(`**Tema:** ${L.TEMA}  `); nl(`**Level:** ${d.abjad} ${d.nama} (${d.sebut}) · ${d.bloom}  `);
    nl(`**Kelompok:** ${g && g.nm ? g.nm : '................'}  **Kelas:** ${g && g.k ? g.k : '......'}  **Tanggal:** ................`); nl();
    nl('**Anggota & peran (dirotasi tiap fase):**'); const mem = g && g.mem ? Object.values(g.mem).sort((x, y) => (x.o || 0) - (y.o || 0)).map(m => m.n) : [];
    (mem.length ? mem : ['................', '................', '................', '................']).forEach((n, i) => nl(`${i + 1}. ${n}`)); nl();
    nl(`> ⚠ ${L.KEAMANAN}`); nl(`> 🔒 ${L.PRIVASI}`); nl();
    nl('## A. Cerita Masalah'); nl(d.cerita); nl(); nl(`**Pertanyaan mendasar:** ${d.tanya}`); nl(); nl(`**${d.pilih.label}:** ${d.pilih.opsi.join(' / ')}`); if (d.pilihCara) nl(`**${d.pilihCara.label}:** ${d.pilihCara.opsi.join(' / ')} (tulis alasannya)`); nl();
    nl('## B. Langkah Kerja'); nl(`**Alat dan bahan:** ${d.alat.join(', ')}.`); nl(`**Alat bantu visual:** ${d.visual}`); nl(); d.langkah.forEach((s, i) => nl(`${i + 1}. ${s}`)); nl();
    nl('**Jadwal:** Ukur: ........ · Foto: ........ · Hitung: ........ · Presentasi: ........'); nl();
    nl('## C. Tabel Hasil Pengukuran'); nl('| Besaran | Nilai | Satuan | Keterangan |'); nl('|---|---|---|---|');
    d.tetap.forEach(x => nl(`| ${x.n} | ${lv === 'a' ? P.t : lv === 'c' ? (x.k === 'c' ? P.c : P.b) : ''} | ${x.u} | ${x.ket} (${L.VERIF}) |`)); d.variabel.forEach(x => nl(`| ${x.n} | ........ | ${x.u} | ${x.ket} |`)); nl();
    nl('## D. Penyelesaian Matematis');
    if (lv === 'a') { nl('Rumus: c = √(t² + j²)'); nl('- t² = ........'); nl('- j² = ........'); nl('- t² + j² = ........'); nl('- c = √(........) = ........ m'); }
    else if (lv === 'b') { nl('Tulis langkahmu sendiri tanpa templat: rumus, substitusi, hitung p² dan l², jumlah, akar.'); nl(); nl('d = ........ m'); nl('Selisih jalan pintas p + l − d = ........ m'); nl('Makna selisih: ........................................'); }
    else { nl('Balik rumus dan tulis langkahmu sendiri: a = √(c² − b²).'); nl(); nl('a = ........ m'); nl(`Keputusan (a ≥ h_target + ambang ${P.h0} m): ☐ LAYAK  ☐ TIDAK LAYAK`); nl('Alasan (sebut unsur keselamatan): ........................................'); }
    nl(); nl('## E. Kesimpulan'); nl(d.kesimpulanAwal); nl();
    nl('## F. Pertanyaan Diskusi dan Refleksi'); d.diskusi.forEach((q, i) => nl(`${i + 1}. ${q}`)); nl('4. Refleksi pribadi: hal baru yang kupelajari, kesulitanku, dan peranku dalam kelompok.'); nl();
    nl('## G. Dokumentasi Digital'); nl(`${d.foto} Unggah ke aplikasi (foto beranotasi dan bukti lain).`); nl(); nl(`**Presentasi:** ${L.PRES_MENIT[lv]} menit.`); nl();
    nl('### Pengecekan akhir'); nl('- [ ] Tidak ada wajah siswa lain di foto'); nl('- [ ] Tidak ada yang memanjat'); nl('- [ ] Label dan satuan lengkap'); nl();
    nl('*Angka acuan: ' + L.VERIF + '.*'); return o.join('\n');
  };
  L.markdownPetaDiag = function (P) {
    const o = ['# Asesmen Diagnostik (5 soal)', ''];
    L.DIAG.forEach(q => { o.push(`**Soal ${q.id} — ${q.c}.** ${q.t}`); q.p.forEach((p, i) => o.push(`   ${String.fromCharCode(97 + i)}. ${p.l}${p.o ? ' (' + p.o.join(' / ') + ')' : ''} ........  [kunci: ${p.kunci}]`)); o.push(''); });
    o.push('**Rubrik skor:** tiap soal terdiri dari dua bagian; skor soal 0 (kedua salah), 1 (satu bagian benar), 2 (kedua benar). Skor total 10.');
    P = Object.assign({}, L.DEF, P || {}); o.push(`**Penempatan awal:** A = 0–${P.thA}; B = ${P.thA + 1}–${P.thB}; C = ${P.thB + 1}–10 (guru dapat mengubah ambang dan memindahkan siswa).`); return o.join('\n');
  };
  L.markdownRubrik = function (P) {
    P = Object.assign({}, L.DEF, P || {});
    const o = ['# Rubrik Penilaian Proyek', '', '| Aspek | 1 Perlu Perbaikan | 2 Cukup | 3 Baik | 4 Sangat Baik |', '|---|---|---|---|---|'];
    L.RUBRIK.forEach(r => o.push(`| ${r.n} | ${r.d.join(' | ')} |`)); o.push('', '**Nilai individu (skala 1–4):** kontribusi, penilaian sejawat, refleksi.', `**Nilai akhir = ${P.wKel}% nilai kelompok + ${P.wInd}% nilai individu.**`);
    ['a', 'b', 'c'].forEach(k => o.push('- ' + L.RUBRIK_KHUSUS[k])); return o.join('\n');
  };
  L.markdownPemetaan = function () { const p = L.PEMETAAN, o = ['# Tabel Pemetaan Kognitif', '', '| ' + p.kepala.join(' | ') + ' |', '|' + p.kepala.map(() => '---').join('|') + '|']; p.baris.forEach(r => o.push('| ' + r.join(' | ') + ' |')); o.push('', '**Mengapa adil dan terukur:** ' + p.alasan); return o.join('\n'); };

  /* ---------- pengaturan guru yang menimpa isi bawaan (disimpan di rooms/KODE/lkpd/cfg) ---------- */
  const clone = o => JSON.parse(JSON.stringify(o));
  L.DIAG0 = clone(L.DIAG); L.PEMETAAN0 = clone(L.PEMETAAN); L.RUBRIK0 = clone(L.RUBRIK); L.RUBRIK_KHUSUS0 = clone(L.RUBRIK_KHUSUS);
  L.applyCfg = function (cfg) {
    cfg = cfg || {};
    const dg = cfg.dg || {}; L.DIAG = L.DIAG0.map(q0 => { const q = clone(q0), o = dg[q.id]; if (o && typeof o === 'object') { if (o.c) q.c = String(o.c); if (o.t) q.t = String(o.t); const ps = o.p || {}; q.p.forEach((p, i) => { const x = ps[i]; if (!x) return; if (x.l) p.l = String(x.l); if (p.k === 'n') { if (x.a !== undefined && x.a !== '' && isFinite(num(x.a))) { p.a = num(x.a); } if (x.tol !== undefined && x.tol !== '' && isFinite(num(x.tol))) p.tol = num(x.tol); } else { const op = Array.isArray(x.o) ? x.o : (x.o && typeof x.o === 'object' ? Object.values(x.o) : null); if (op && op.length >= 2) p.o = op.map(String); if (x.a !== undefined && x.a !== '' && p.o.indexOf(String(x.a)) >= 0) p.a = String(x.a); } if (x.kunci) p.kunci = String(x.kunci); }); } return q; });
    const pm = cfg.pm; L.PEMETAAN = clone(L.PEMETAAN0);
    if (pm && typeof pm === 'object') { const kp = Array.isArray(pm.kepala) ? pm.kepala : (pm.kepala && typeof pm.kepala === 'object' ? Object.values(pm.kepala) : null); if (kp && kp.length === L.PEMETAAN.kepala.length) L.PEMETAAN.kepala = kp.map(String);
      const br = pm.baris && typeof pm.baris === 'object' ? (Array.isArray(pm.baris) ? pm.baris : Object.values(pm.baris)) : null; if (br && br.length) { L.PEMETAAN.baris = br.map(r => (Array.isArray(r) ? r : Object.values(r || {})).map(String)).filter(r => r.length === L.PEMETAAN.kepala.length); }
      if (pm.alasan) L.PEMETAAN.alasan = String(pm.alasan); }
    const rb = cfg.rb || {}; L.RUBRIK = L.RUBRIK0.map(r0 => { const r = clone(r0), o = rb[r.k]; if (o && typeof o === 'object') { if (o.n) r.n = String(o.n); const dd = Array.isArray(o.d) ? o.d : (o.d && typeof o.d === 'object' ? Object.values(o.d) : null); if (dd && dd.length === 4) r.d = dd.map(String); } return r; });
    L.RUBRIK_KHUSUS = Object.assign(clone(L.RUBRIK_KHUSUS0), (cfg.rk && typeof cfg.rk === 'object') ? cfg.rk : {});
  };
  /* langkah hitung acuan dengan angka siswa: bahan guru memeriksa asal-usul jawaban */
  L.derive = function (lv, v, P) {
    P = Object.assign({}, L.DEF, P || {}); v = v || {}; const e = L.expect(lv, v, P), f = x => String(r2(x)).replace('.', ','); if (!e) return [];
    if (lv === 'a') return [`t = ${f(P.t)} m (parameter guru), j = ${f(num(v.j))} m (hasil ukur siswa)`, `t² = ${f(P.t)} × ${f(P.t)} = ${f(e.t2)}`, `j² = ${f(num(v.j))} × ${f(num(v.j))} = ${f(e.j2)}`, `t² + j² = ${f(e.t2)} + ${f(e.j2)} = ${f(e.s)}`, `c = √${f(e.s)} ≈ ${f(e.c)} m (dibulatkan 2 desimal)`];
    if (lv === 'b') return [`p = ${f(num(v.p))} m, l = ${f(num(v.l))} m (hasil ukur siswa)`, `p² = ${f(e.p2)}, l² = ${f(e.l2)}`, `d = √(${f(e.p2)} + ${f(e.l2)}) = √${f(e.p2 + e.l2)} ≈ ${f(e.d)} m`, `selisih jalan pintas = p + l − d = ${f(num(v.p))} + ${f(num(v.l))} − ${f(e.d)} = ${f(e.sel)} m`];
    return [`c = ${f(e.c)} m, b = ${f(e.b)} m (parameter guru / hasil ukur)`, `a = √(c² − b²) = √(${f(e.c * e.c)} − ${f(e.b * e.b)}) ≈ ${f(e.a)} m`, e.dec ? `Bandingkan a = ${f(e.a)} dengan tinggi target ${f(num(v.h))} + ambang ${f(P.h0)} = ${f(num(v.h) + P.h0)} → ${e.dec === 'layak' ? 'LAYAK' : 'TIDAK LAYAK'}` : 'Tinggi target belum diisi siswa.'];
  };

  /* ---------- uji mandiri tiga contoh dari prompt ---------- */
  L.selfTest = function () {
    const a = L.expect('a', { j: 1.2 }, { t: 2 }), b = L.expect('b', { p: 40, l: 25 }), c = L.expect('c', { h: 3.2 }, { c: 3.2, b: 0.8 }), c2 = L.expect('c', { h: 3 }, { c: 3.2, b: 0.8 });
    return { a: a.c === 2.33, b: b.d === 47.17 && b.sel === 17.83, c: c.a === 3.1 && c.dec === 'tidak' && c2.dec === 'layak' };
  };
})();
