/* =========================================================
   DATA KONTEN — Petualangan Pythagoras
   Materi mengacu pada: Global Matematika SMP Kelas VIII (Bab 2: Teorema Pythagoras)
   Setiap soal numerik memiliki `chk` (ekspresi JS) yang diperiksa oleh test/verify-data.js
   ========================================================= */
window.PP = window.PP || {};

PP.TUJUAN = [
  { t: 'Memahami Pengertian Teorema Pythagoras', d: 'Menjelaskan bunyi Teorema Pythagoras pada segitiga siku-siku: c² = a² + b².', icon: 'ic_book' },
  { t: 'Mengenal Asal Usul dan Kajian Ilmunya', d: 'Menceritakan asal usul Teorema Pythagoras (Babilonia, India, Tiongkok, Mesir, Pythagoras, Euclid) dan sebab teorema ini lahir.', icon: 'ic_pin' },
  { t: 'Mengenali Sisi Segitiga Siku-Siku', d: 'Menentukan sisi miring (hipotenusa) dan sisi siku-siku pada segitiga dengan berbagai posisi.', icon: 'ic_star' },
  { t: 'Menemukan dan Membuktikan Teorema', d: 'Menemukan sifat c² = a² + b² melalui kegiatan menyusun persegi dan membuktikannya dengan luas persegi (a + b)².', icon: 'ic_gear' },
  { t: 'Menghitung Panjang Sisi', d: 'Menghitung panjang sisi miring atau sisi siku-siku jika dua sisi lainnya diketahui.', icon: 'ic_game' },
  { t: 'Menerapkan pada Bangun Datar', d: 'Menentukan keliling dan luas persegi panjang, trapesium, layang-layang, serta jajargenjang dengan Teorema Pythagoras.', icon: 'ic_medal' },
  { t: 'Memecahkan Masalah Nyata', d: 'Menyelesaikan masalah tiang, tali, dan jembatan, serta menentukan apakah sebuah segitiga siku-siku.', icon: 'ic_trophy' }
];

/* ---------------- POS PETUALANGAN ---------------- */
PP.POS = [
  { id: 1, name: 'Gerbang Geometri', mission: 'Mengenal segitiga siku-siku.', sprite: 'portal', materi: ['1'], kind: 'quick', pts: 'quick1',
    intro: 'Selamat datang di Gerbang Geometri! Gerbang ini hanya terbuka bagi yang mengenal segitiga siku-siku.' },
  { id: 2, name: 'Hutan Sisi Segitiga', mission: 'Mengenal sisi alas, sisi tegak, dan sisi miring (hipotenusa).', sprite: 'pine_a', materi: ['2'], kind: 'game', game: 'A',
    intro: 'Di hutan ini setiap sisi segitiga punya nama. Susun nama-namanya dengan benar!' },
  { id: 3, name: 'Kerajaan Persegi', mission: 'Memahami hubungan luas persegi pada setiap sisi segitiga siku-siku.', sprite: 'school', materi: ['3'], kind: 'quick', pts: 'quick3',
    intro: 'Kerajaan Persegi menyimpan rahasia luas. Bandingkan luas persegi pada tiap sisi!' },
  { id: 4, name: 'Lembah Pythagoras', mission: 'Memahami dan menemukan rumus Teorema Pythagoras.', sprite: 'windmill', materi: ['3b', '4'], kind: 'game', game: 'B',
    intro: 'Inilah Lembah Pythagoras. Temukan panjang sisi yang hilang dengan rumus a² + b² = c².' },
  { id: 5, name: 'Jembatan Tantangan', mission: 'Menyelesaikan perhitungan dan soal cerita.', sprite: 'bridge', materi: ['5'], kind: 'game', game: 'C',
    intro: 'Bantu penjelajah menyeberang! Hitung panjang tangga, tali, dan jembatan dengan tepat.' },
  { id: 6, name: 'Istana Matematika', mission: 'Menyelesaikan tantangan akhir.', sprite: 'castle', materi: ['6'], kind: 'game', game: 'D',
    intro: 'Ini tantangan terakhir di Istana Matematika. Kamu punya tiga nyawa. Semangat!' }
];

/* ---------------- KUIS MISI CEPAT (Pos 1 & 3) ---------------- */
PP.QUICK = {
  quick1: [
    { q: 'Segitiga siku-siku memiliki satu sudut sebesar…', o: ['45°', '60°', '90°', '180°'], a: 2, e: 'Segitiga siku-siku memiliki tepat satu sudut siku-siku, yaitu 90°.' },
    { q: 'Tanda kotak kecil pada sudut sebuah segitiga menunjukkan…', o: ['Sudut siku-siku (90°)', 'Sudut lancip', 'Sisi miring', 'Sisi terpendek'], a: 0, e: 'Kotak kecil adalah penanda sudut siku-siku (90°).' },
    { q: 'Segitiga yang sudut-sudutnya 30°, 60°, dan 90° termasuk segitiga…', o: ['Sama sisi', 'Siku-siku', 'Tumpul', 'Sembarang yang tidak punya nama'], a: 1, e: 'Salah satu sudutnya 90°, jadi segitiga tersebut siku-siku. Jumlah sudutnya 30° + 60° + 90° = 180°.' }
  ],
  quick3: [
    { q: 'Luas persegi dengan panjang sisi 3 cm adalah…', o: ['6 cm²', '9 cm²', '12 cm²', '3 cm²'], a: 1, e: 'Luas persegi = sisi × sisi = 3 × 3 = 9 cm².', chk: '3*3', ans: '9' },
    { q: 'Persegi pada sisi 3, 4, dan 5 memiliki luas 9, 16, dan 25. Hubungan luasnya adalah…', o: ['9 + 16 = 25', '9 × 16 = 25', '25 − 16 = 8', '9 + 25 = 16'], a: 0, e: 'Luas persegi terbesar (25) sama dengan jumlah dua luas persegi lainnya: 9 + 16 = 25.' },
    { q: 'Luas persegi pada dua sisi siku-siku adalah 36 dan 64. Luas persegi pada sisi miring adalah…', o: ['28', '100', '10', '2.304'], a: 1, e: 'Luas persegi sisi miring = 36 + 64 = 100.', chk: '36+64', ans: '100' }
  ]
};

/* ---------------- GAME B: TEMUKAN PANJANG SISI ---------------- */
// unk: sisi yang dicari ('a' = sisi tegak, 'b' = sisi alas, 'c' = sisi miring). Nilai a, b, c sudah lengkap untuk verifikasi.
PP.POOL_B = {
  easy: [
    { a: 3, b: 4, c: 5, unk: 'c' }, { a: 6, b: 8, c: 10, unk: 'c' }, { a: 7, b: 24, c: 25, unk: 'c' },
    { a: 24, b: 32, c: 40, unk: 'c' }, { a: 8, b: 15, c: 17, unk: 'c' }, { a: 5, b: 12, c: 13, unk: 'c' }
  ],
  medium: [
    { a: 6, b: 8, c: 10, unk: 'a' }, { a: 10, b: 24, c: 26, unk: 'b' }, { a: 8, b: 15, c: 17, unk: 'a' },
    { a: 5, b: 12, c: 13, unk: 'b' }, { a: 24, b: 10, c: 26, unk: 'b' }, { a: 7, b: 24, c: 25, unk: 'a' }
  ],
  hard: [
    { a: 12, b: 3.5, c: 12.5, unk: 'b' }, { a: 10, b: 10.5, c: 14.5, unk: 'a' }, { a: 24, b: 32, c: 40, unk: 'a' },
    { a: 15, b: 8, c: 17, unk: 'b' }, { a: 12, b: 16, c: 20, unk: 'c' }, { a: 9, b: 12, c: 15, unk: 'a' }
  ]
};

/* ---------------- GAME C: MISI JEMBATAN ---------------- */
// kind menentukan gambar. nums: ukuran sesuai gambar. ask: yang ditanyakan. Jawaban dihitung dari rumus.
PP.SCENES_C = [
  { kind: 'pole', title: 'Tali Tiang Bendera', story: 'Sebuah tiang tegak berdiri di atas tanah. Seutas tali diikat dari ujung atas tiang ke sebuah patok di tanah. Tali panjangnya 17 m dan jarak patok ke tiang 8 m.',
    q: 'Berapa tinggi tiang tersebut?', legs: [0, 8], hypLen: 17, ask: 'leg', ans: 15, o: ['9 m', '15 m', '12 m', '25 m'], unit: 'm' },
  { kind: 'ladder', title: 'Tangga ke Jendela', story: 'Penjelajah harus naik ke jendela menara setinggi 12 m. Kaki tangga diletakkan 5 m dari dinding.',
    q: 'Berapa panjang tangga yang dibutuhkan?', legs: [12, 5], ask: 'hyp', ans: 13, o: ['11 m', '13 m', '15 m', '17 m'], unit: 'm' },
  { kind: 'bridge', title: 'Jurang Sungai', story: 'Tebing kiri 7 m lebih tinggi daripada tebing kanan. Lebar jurang 24 m. Sebuah papan miring dipasang dari tepi tebing kiri ke tepi tebing kanan.',
    q: 'Berapa panjang papan yang dibutuhkan?', legs: [7, 24], ask: 'hyp', ans: 25, o: ['17 m', '25 m', '31 m', '26 m'], unit: 'm' },
  { kind: 'field', title: 'Lapangan Latihan', story: 'Penjelajah berlari menyilang dari satu sudut ke sudut seberang pada lapangan berukuran 32 m × 24 m.',
    q: 'Berapa jarak lintasan diagonal tersebut?', legs: [24, 32], ask: 'hyp', ans: 40, o: ['56 m', '45 m', '40 m', '35 m'], unit: 'm' },
  { kind: 'pole', skin: 'tower', title: 'Kabel Jembatan', story: 'Seperti Jembatan Teluk Hangzhou, kabel pancang membentuk segitiga siku-siku bersama tiang dan jalan. Kabel sepanjang 26 m dan titik ikatnya di jalan berjarak 10 m dari kaki tiang.',
    q: 'Berapa tinggi tiang jembatan?', legs: [0, 10], hypLen: 26, ask: 'leg', ans: 24, o: ['16 m', '28 m', '24 m', '36 m'], unit: 'm' },
  { kind: 'pole', skin: 'tower', title: 'Menara Istana', story: 'Kabel bantu sepanjang 12,5 m dipasang dari puncak menara ke titik di tanah. Titik itu berjarak 3,5 m dari kaki menara.',
    q: 'Berapa tinggi menara tersebut?', legs: [0, 3.5], hypLen: 12.5, ask: 'leg', ans: 12, o: ['9 m', '16 m', '12 m', '15 m'], unit: 'm' }
];

/* ---------------- GAME D: TANTANGAN AKHIR (bank soal campuran) ---------------- */
PP.POOL_D = [
  { q: 'Nama Teorema Pythagoras diambil dari filsuf dan matematikawan Yunani yang berasal dari pulau…', o: ['Kreta', 'Samos', 'Sisilia', 'Rodos'], a: 1, e: 'Pythagoras (kira-kira 570–495 SM) berasal dari Pulau Samos. Ia kemudian mendirikan perkumpulan pengikutnya di Kroton, Italia Selatan.' },
  { q: 'Lempeng tanah liat Babilonia yang memuat daftar bilangan yang memenuhi sifat Pythagoras bernama…', o: ['Plimpton 322', 'Zhoubi Suanjing', 'Sulbasutra', 'Elements'], a: 0, e: 'Plimpton 322 (sekitar 1800 SM) dari Babilonia sudah memuat bilangan-bilangan yang memenuhi hubungan sisi segitiga siku-siku, jauh sebelum masa Pythagoras.' },
  { q: 'Orang Mesir kuno memakai tali berbuhul dengan perbandingan … untuk membuat sudut siku-siku pada bangunan.', o: ['1 : 2 : 3', '3 : 4 : 5', '2 : 3 : 4', '4 : 5 : 6'], a: 1, e: 'Tali dengan perbandingan 3 : 4 : 5 membentuk segitiga siku-siku, sebab 3² + 4² = 5².' },
  { q: 'Bukti tertulis Teorema Pythagoras yang paling terkenal terdapat dalam buku Elements karya…', o: ['Garfield', 'Plimpton', 'Euclid', 'Kuno'], a: 2, e: 'Euclid (sekitar 300 SM) membuktikannya pada Buku I Proposisi 47, dan kebalikannya pada Proposisi 48.' },
  { q: 'Pada tahun 1876, James A. Garfield (kemudian Presiden Amerika Serikat) menemukan bukti Teorema Pythagoras dengan bangun…', o: ['Lingkaran', 'Persegi panjang', 'Trapesium', 'Layang-layang'], a: 2, e: 'Bukti Garfield memakai trapesium yang tersusun dari tiga segitiga siku-siku.' },
  { q: 'Segitiga siku-siku dengan a = 10 dan sisi miring c = 26. Panjang b adalah…', o: ['16', '24', '36', '28'], a: 1, e: 'b² = c² − a² = 676 − 100 = 576, sehingga b = √576 = 24.', chk: 'Math.sqrt(26*26-10*10)', ans: '24', fig: () => PP.Fig.triQ(10, 24, 26, 'b', 'bl') },
  { q: 'Segitiga siku-siku dengan a = 7 dan b = 24. Panjang sisi miring c adalah…', o: ['31', '17', '26', '25'], a: 3, e: 'c² = 7² + 24² = 49 + 576 = 625, sehingga c = √625 = 25.', chk: 'Math.hypot(7,24)', ans: '25', fig: () => PP.Fig.triQ(7, 24, 25, 'c') },
  { q: 'Segitiga siku-siku dengan b = 15 dan sisi miring c = 17. Panjang a adalah…', o: ['8', '2', '12', '32'], a: 0, e: 'a² = c² − b² = 289 − 225 = 64, sehingga a = √64 = 8.', chk: 'Math.sqrt(17*17-15*15)', ans: '8', fig: () => PP.Fig.triQ(8, 15, 17, 'a') },
  { q: 'Sebuah segitiga siku-siku memiliki sisi miring 13 dan satu sisi siku-siku 5. Sisi siku-siku yang lain adalah…', o: ['8', '10', '12', '18'], a: 2, e: 'q² = 13² − 5² = 169 − 25 = 144, sehingga q = 12.', chk: 'Math.sqrt(13*13-5*5)', ans: '12', fig: () => PP.Fig.triQ(5, 12, 13, 'b') },
  { q: 'Sisi miring sebuah segitiga siku-siku adalah 26 dan salah satu sisi siku-sikunya 24. Sisi siku-siku yang lain adalah…', o: ['10', '2', '14', '50'], a: 0, e: 'z² = 26² − 24² = 676 − 576 = 100, sehingga z = 10.', chk: 'Math.sqrt(26*26-24*24)', ans: '10', fig: () => PP.Fig.triQ(24, 10, 26, 'b') },
  { q: 'Sisi miring sebuah segitiga siku-siku 12,5 dan salah satu sisi siku-sikunya 3,5. Sisi siku-siku yang lain adalah…', o: ['9', '16', '12', '15'], a: 2, e: 'e² = 12,5² − 3,5² = 156,25 − 12,25 = 144, sehingga e = 12.', chk: 'Math.sqrt(12.5*12.5-3.5*3.5)', ans: '12', fig: () => PP.Fig.triQ(12, 3.5, 12.5, 'a') },
  { q: 'Pada layang-layang ABCD, diagonal-diagonalnya saling tegak lurus di O. Jika AO = 5 cm dan BO = 12 cm, panjang AB adalah…', o: ['17 cm', '13 cm', '7 cm', '15 cm'], a: 1, e: 'ΔAOB siku-siku di O. AB² = AO² + BO² = 25 + 144 = 169, sehingga AB = 13 cm.', chk: 'Math.hypot(5,12)', ans: '13', fig: () => PP.Fig.FIG.kite() },
  { q: 'Pada layang-layang yang sama, CO = 9 cm dan BO = 12 cm. Panjang CB adalah…', o: ['21 cm', '15 cm', '3 cm', '13 cm'], a: 1, e: 'CB² = CO² + BO² = 81 + 144 = 225, sehingga CB = 15 cm.', chk: 'Math.hypot(9,12)', ans: '15', fig: () => PP.Fig.FIG.kite() },
  { q: 'Belah ketupat EFAB memiliki sisi EB = 10 cm dan setengah diagonal OB = 6 cm. Panjang setengah diagonal OE adalah…', o: ['4 cm', '8 cm', '16 cm', '12 cm'], a: 1, e: 'ΔEOB siku-siku di O. OE² = EB² − OB² = 100 − 36 = 64, sehingga OE = 8 cm.', chk: 'Math.sqrt(100-36)', ans: '8', fig: () => PP.Fig.FIG.gab(false) },
  { q: 'Manakah yang BUKAN kebutuhan yang melahirkan Teorema Pythagoras?', o: ['Membuat sudut siku-siku pada bangunan', 'Mengukur jarak tanpa mengukur langsung', 'Menghitung massa jenis air', 'Ingin tahu pola bilangan dan bangun'], a: 2, e: 'Kebutuhan yang melahirkan teorema ini: membuat sudut siku-siku, mengukur jarak tanpa mengukur langsung, rasa ingin tahu terhadap pola bilangan dan bangun, serta kegunaan dalam kehidupan.' },
  { q: 'Diagonal persegi yang sisinya 1 panjangnya √2. Bilangan seperti √2 termasuk bilangan yang…', o: ['dapat ditulis sebagai pecahan', 'tidak dapat ditulis sebagai pecahan', 'selalu bulat', 'selalu negatif'], a: 1, e: 'Kajian Teorema Pythagoras mengantar pada penemuan bilangan yang tidak dapat ditulis sebagai pecahan, misalnya √2, yaitu panjang diagonal persegi yang sisinya 1.' },
  { q: 'Pada pembuktian pertama, luas persegi dalam c² sama dengan luas persegi besar dikurangi…', o: ['luas satu segitiga', 'luas empat segitiga siku-siku', 'luas dua persegi', 'keliling persegi besar'], a: 1, e: 'c² = (a + b)² − 4(½ × a × b). Setelah dijabarkan, c² = a² + 2ab + b² − 2ab = a² + b².' },
  { q: 'Jajargenjang dan segitiga siku-siku pada gambar: sisi miring segitiga 37 cm dan sisi tegaknya 12 cm. Panjang alasnya (garis putus-putus) adalah…', o: ['25 cm', '35 cm', '49 cm', '37 cm'], a: 1, e: 'Alas² = 37² − 12² = 1.369 − 144 = 1.225, sehingga alas = 35 cm.', chk: 'Math.sqrt(37*37-12*12)', ans: '35', fig: () => PP.Fig.FIG.jaj(false) }
];

/* ---------------- KUIS INTERAKTIF (15 soal) ---------------- */
PP.QUIZ = [
  { lv: 'Mudah', q: 'Pada segitiga siku-siku, sisi yang berada di depan sudut siku-siku disebut…', o: ['Sisi alas', 'Sisi miring (hipotenusa)', 'Sisi tegak', 'Sisi sejajar'], a: 1, e: 'Sisi di depan sudut siku-siku disebut sisi miring atau hipotenusa, dan ia sisi yang paling panjang. Dua sisi lainnya disebut sisi siku-siku.', fig: () => PP.Fig.tri(4, 3, { h: 'b', v: 'a', c: 'c = ?' }) },
  { lv: 'Mudah', q: 'Teorema Pythagoras menyatakan bahwa pada setiap segitiga siku-siku…', o: ['kuadrat sisi miring sama dengan jumlah kuadrat kedua sisi siku-sikunya', 'sisi miring sama dengan jumlah kedua sisi siku-sikunya', 'kuadrat sisi miring sama dengan selisih kuadrat kedua sisi siku-sikunya', 'jumlah ketiga sisinya 180°'], a: 0, e: 'Bunyinya: kuadrat panjang sisi miring sama dengan jumlah kuadrat panjang kedua sisi siku-sikunya, yaitu c² = a² + b².', fig: () => PP.Fig.FIG.sq(3, 4) },
  { lv: 'Mudah', q: 'Dua sisi siku-siku sebuah segitiga adalah 3 cm dan 4 cm. Panjang sisi miringnya adalah…', o: ['5 cm', '6 cm', '7 cm', '25 cm'], a: 0, e: 'c² = 3² + 4² = 9 + 16 = 25, sehingga c = √25 = 5 cm.', chk: 'Math.hypot(3,4)', ans: '5', fig: () => PP.Fig.triQ(3, 4, 5, 'c') },
  { lv: 'Mudah', q: 'Pada segitiga siku-siku dengan sisi miring r dan sisi siku-siku p dan q, hubungan yang benar adalah…', o: ['r² = p² + q²', 'p² = q² + r²', 'q² = p² + r²', 'r = p + q'], a: 0, e: 'Langkah: (1) temukan sudut siku-siku, (2) sisi di depannya adalah sisi miring, (3) kuadrat sisi miring sama dengan jumlah kuadrat dua sisi lainnya. Jadi r² = p² + q².', fig: () => PP.Fig.tri(3, 4, { h: 'q', v: 'p', c: 'r' }) },
  { lv: 'Mudah', q: 'Pada segitiga siku-siku dengan sisi miring c = 10 dan sisi siku-siku b = 8, panjang sisi siku-siku a adalah…', o: ['2', '4', '6', '18'], a: 2, e: 'a² = c² − b² = 100 − 64 = 36, sehingga a = √36 = 6.', chk: 'Math.sqrt(100-64)', ans: '6', fig: () => PP.Fig.triQ(6, 8, 10, 'a') },
  { lv: 'Sedang', q: 'Segitiga ABC siku-siku di C. Jika AB = 15 cm dan AC = 12 cm, panjang BC adalah…', o: ['3 cm', '9 cm', '27 cm', '13,5 cm'], a: 1, e: 'AB adalah sisi miring. BC² = AB² − AC² = 225 − 144 = 81, sehingga BC = √81 = 9 cm.', chk: 'Math.sqrt(15*15-12*12)', ans: '9', fig: () => PP.Fig.FIG.abc() },
  { lv: 'Sedang', q: 'Sisi siku-siku sebuah segitiga adalah 24 dan 32. Panjang sisi miringnya adalah…', o: ['56', '40', '8', '48'], a: 1, e: 'a² = 24² + 32² = 576 + 1.024 = 1.600, sehingga a = √1.600 = 40.', chk: 'Math.hypot(24,32)', ans: '40', fig: () => PP.Fig.triQ(24, 32, 40, 'c') },
  { lv: 'Sedang', q: 'Seutas tali 17 m dihubungkan dari ujung atas tiang tegak ke patok di tanah yang berjarak 8 m dari kaki tiang. Tinggi tiang adalah…', o: ['15 m', '9 m', '12 m', '25 m'], a: 0, e: 'Tali adalah sisi miring. t² = 17² − 8² = 289 − 64 = 225, sehingga t = 15 m.', chk: 'Math.sqrt(17*17-8*8)', ans: '15', fig: () => PP.Fig.FIG.pole(15, 8, 17) },
  { lv: 'Sedang', q: 'Persegi panjang memiliki diagonal 14,5 cm dan panjang 10,5 cm. Luas persegi panjang tersebut adalah…', o: ['100 cm²', '105 cm²', '152 cm²', '41 cm²'], a: 1, e: 'l² = 14,5² − 10,5² = 210,25 − 110,25 = 100, jadi l = 10 cm. Luas = 10,5 × 10 = 105 cm².', chk: 'Math.sqrt(14.5*14.5-10.5*10.5)*10.5', ans: '105', fig: () => PP.Fig.FIG.rect() },
  { lv: 'Sedang', q: 'Pada gambar, AB = 12 cm, AC = 15 cm, dan AD = 20 cm (siku-siku di B). Panjang CD adalah…', o: ['5 cm', '9 cm', '7 cm', '16 cm'], a: 2, e: 'BC² = 15² − 12² = 81, BC = 9. BD² = 20² − 12² = 256, BD = 16. CD = BD − BC = 16 − 9 = 7 cm.', chk: 'Math.sqrt(20*20-12*12)-Math.sqrt(15*15-12*12)', ans: '7', fig: () => PP.Fig.FIG.ab(false) },
  { lv: 'Sulit', q: 'Trapesium siku-siku ABCD dengan AD = 27 cm, AB = 24 cm, dan BC = 34 cm (siku-siku di A dan B). Keliling trapesium adalah…', o: ['100 cm', '110 cm', '120 cm', '85 cm'], a: 1, e: 'Tarik garis dari D tegak lurus ke BC di E. EC = 34 − 27 = 7 cm, DE = 24 cm, sehingga CD = √(24² + 7²) = 25 cm. Keliling = 24 + 34 + 25 + 27 = 110 cm.', chk: '24+34+27+Math.hypot(24,7)', ans: '110', fig: () => PP.Fig.FIG.trap() },
  { lv: 'Sulit', q: 'Pada gambar, OCDE persegi panjang dan EFAB belah ketupat. Jika OB = BC = 6 cm dan EB = 10 cm, keliling persegi panjang OCDE adalah…', o: ['28 cm', '34 cm', '40 cm', '56 cm'], a: 2, e: 'OE² = EB² − OB² = 100 − 36 = 64, jadi OE = 8 cm. OC = OB + BC = 12 cm. Keliling OCDE = 2 × (12 + 8) = 40 cm.', chk: '2*(12+Math.sqrt(100-36))', ans: '40', fig: () => PP.Fig.FIG.gab(false) },
  { lv: 'Sulit', q: 'Sebuah bangun terdiri atas jajargenjang dan segitiga siku-siku. Sisi miring segitiga 37 cm dan sisi tegaknya 12 cm, yang sama panjang dengan sisi miring jajargenjang. Keliling bangun adalah…', o: ['96 cm', '108 cm', '120 cm', '84 cm'], a: 1, e: 'Garis putus-putus = √(37² − 12²) = √1.225 = 35 cm. Keliling = 35 + 12 + 12 + 37 + 12 = 108 cm.', chk: '35+12+12+37+12', ans: '108', fig: () => PP.Fig.FIG.jaj(false) },
  { lv: 'Sulit', q: 'Pada ΔABC, BD tegak lurus AC dengan AB = 10 cm, AD = 6 cm, dan BC = 17 cm. Panjang CD adalah…', o: ['8 cm', '11 cm', '15 cm', '21 cm'], a: 2, e: 'BD² = AB² − AD² = 100 − 36 = 64, BD = 8 cm. CD² = BC² − BD² = 289 − 64 = 225, jadi CD = 15 cm.', chk: 'Math.sqrt(17*17-(10*10-6*6))', ans: '15', fig: () => PP.Fig.FIG.abd(false) },
  { lv: 'Sulit', q: 'Dengan data yang sama (AB = 10, BC = 17, AC = 21), apakah ∠B pada ΔABC siku-siku?', o: ['Ya, karena AB² + BC² = AC²', 'Tidak, karena AB² + BC² = 389 ≠ 441 = AC²', 'Ya, karena BD tegak lurus AC', 'Tidak, karena AC > AB + BC'], a: 1, e: 'Gunakan kebalikan Teorema Pythagoras: AC = AD + CD = 6 + 15 = 21. AB² + BC² = 100 + 289 = 389, sedangkan AC² = 441. Karena tidak sama, ∠B bukan sudut siku-siku. Yang siku-siku adalah sudut di D.', chk: '10*10+17*17', ans: '389', fig: () => PP.Fig.FIG.abd(true) }
];

/* ---------------- LENCANA ---------------- */
PP.BADGES = [
  { id: 'm1', name: 'Pembuka Gerbang', desc: 'Selesaikan Pos 1', icon: 'star_bronze' },
  { id: 'm2', name: 'Penjelajah Hutan', desc: 'Selesaikan Pos 2', icon: 'star_bronze' },
  { id: 'm3', name: 'Raja Persegi', desc: 'Selesaikan Pos 3', icon: 'star_silver' },
  { id: 'm4', name: 'Penemu Rumus', desc: 'Selesaikan Pos 4', icon: 'star_silver' },
  { id: 'm5', name: 'Penyeberang Jembatan', desc: 'Selesaikan Pos 5', icon: 'star_gold' },
  { id: 'm6', name: 'Penakluk Istana', desc: 'Selesaikan Pos 6', icon: 'star_gold' },
  { id: 'finish', name: 'Pythagoras Sejati', desc: 'Capai FINISH', icon: 'crown' },
  { id: 'reader', name: 'Pembaca Setia', desc: 'Buka semua halaman materi', icon: 'ic_book' },
  { id: 'explorer', name: 'Ilmuwan Cilik', desc: 'Coba eksplorasi interaktif', icon: 'ic_gear' },
  { id: 'quiz80', name: 'Kuis Master', desc: 'Nilai kuis 80 atau lebih', icon: 'ribbon' },
  { id: 'jelajah', name: 'Penjelajah Dunia', desc: 'Selesaikan semua dunia di Jelajah', icon: 'star_gold' },
  { id: 'perfect', name: 'Sempurna!', desc: 'Skor 100 pada kuis atau game', icon: 'ic_trophy' },
  { id: 'reflect', name: 'Pemikir Bijak', desc: 'Simpan refleksi', icon: 'ic_medal' },
  { id: 'lv5', name: 'Level 5', desc: 'Capai level 5', icon: 'chest_small' }
];

/* ---------------- PESAN MOTIVASI ---------------- */
PP.MSG = {
  right: ['Hebat! Jawabanmu benar!', 'Tepat sekali, petualang!', 'Keren! Kamu makin jago!', 'Luar biasa! Lanjutkan!', 'Mantap! Rumusnya kamu kuasai!'],
  wrong: ['Jangan menyerah, coba sekali lagi!', 'Hampir benar! Periksa lagi langkahmu.', 'Tidak apa-apa, salah itu bagian dari belajar.', 'Ayo semangat, kamu pasti bisa!'],
  done: ['Hebat! Kamu berhasil menyelesaikan misi!', 'Misi selesai! Petualanganmu makin seru!']
};
PP.pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------------- VIDEO (guru dapat mengisi `src`) ----------------
   Letakkan file MP4 di assets/video/ lalu isi src, contoh: 'assets/video/segitiga-siku-siku.mp4'
   Atau isi tautan video MP4/YouTube pada halaman Video Animasi (tersimpan di perangkat). */
PP.VIDEOS = [
  { id: 'v1', title: 'Petualangan Mengenal Teorema Pythagoras', desc: 'Didit Fakhrullah mengenalkan segitiga siku-siku, sisi miring (hipotenusa), dan bukti angka dengan segitiga 3-4-5.',
    src: 'assets/video/petualangan-mengenal-pythagoras.mp4', poster: 'assets/video/petualangan-mengenal-pythagoras.jpg' },
  { id: 'v2', title: 'Video Pembelajaran Pythagoras (YouTube)', desc: 'Video penjelasan tambahan. Membutuhkan koneksi internet.',
    yt: '_eYY0xEWiWc' }
];
