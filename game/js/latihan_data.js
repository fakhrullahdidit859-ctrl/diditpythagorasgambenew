/* Soal latihan + pembahasan (Pembahasan_Latihan.zip, bersumber dari buku siswa). cek = kunci jawaban angka. */
window.PP = window.PP || {};
PP.LATIHAN = [
 {
  "no": "Contoh 2 (hal. 34)",
  "judul": "Trapesium siku-siku: panjang BD dan BC",
  "soal": "Pada gambar, AB = 5 cm, AD = 13 cm, dan DC = 9 cm. Garis BD tegak lurus AB dan juga tegak lurus DC. Tentukan panjang BD dan BC.",
  "gambar": [
   "assets/latihan/contoh2_trapesium.png"
  ],
  "langkah": [
   "Segitiga ABD siku-siku di B, maka AD² = AB² + BD²",
   "13² = 5² + BD²  →  169 = 25 + BD²",
   "BD² = 169 − 25 = 144  →  BD = √144 = 12 cm",
   "Segitiga BCD siku-siku di D, maka BC² = CD² + BD²",
   "BC² = 9² + 12² = 81 + 144 = 225  →  BC = √225 = 15 cm"
  ],
  "jawaban": "BD = 12 cm dan BC = 15 cm",
  "catatan": "Catatan: di buku bangun ini bernama jajargenjang, padahal AB sejajar DC dengan panjang berbeda (5 cm dan 9 cm), jadi bentuk sebenarnya trapesium siku-siku. Hitungannya tidak berubah.",
  "cek": [
   {
    "l": "BD (cm)",
    "v": 12
   },
   {
    "l": "BC (cm)",
    "v": 15
   }
  ]
 },
 {
  "no": "No. 1 (hal. 35)",
  "judul": "Hubungan panjang sisi pada segitiga siku-siku",
  "soal": "Tuliskan hubungan antar panjang sisi untuk tiap segitiga siku-siku (a) sampai (e) dengan Teorema Pythagoras.",
  "gambar": [
   "assets/latihan/ab1_no1_a.png",
   "assets/latihan/ab1_no1_b.png",
   "assets/latihan/ab1_no1_c.png",
   "assets/latihan/ab1_no1_d.png",
   "assets/latihan/ab1_no1_e.png"
  ],
  "langkah": [
   "Cari sudut siku-siku (ditandai kotak kecil). Sisi di depannya adalah sisi miring.",
   "(a) sisi miring a → a² = b² + c²",
   "(b) sisi miring r → r² = p² + q²",
   "(c) sisi miring y → y² = x² + z²",
   "(d) sisi miring m → m² = k² + l²",
   "(e) sisi miring d → d² = e² + f²"
  ],
  "jawaban": "(a) a² = b² + c²;  (b) r² = p² + q²;  (c) y² = x² + z²;  (d) m² = k² + l²;  (e) d² = e² + f²",
  "catatan": null,
  "cek": []
 },
 {
  "no": "No. 2 (hal. 36)",
  "judul": "Mencari sisi yang belum diketahui",
  "soal": "Tentukan panjang sisi yang belum diketahui pada tiap segitiga siku-siku (a) sampai (e). Gambar di sini digambar sesuai skala ukurannya.",
  "gambar": [
   "assets/latihan/ab1_no2_a.png",
   "assets/latihan/ab1_no2_b.png",
   "assets/latihan/ab1_no2_c.png",
   "assets/latihan/ab1_no2_d.png",
   "assets/latihan/ab1_no2_e.png"
  ],
  "langkah": [
   "(a) Sisi miring 13, sisi tegak 5. q² = 13² − 5² = 169 − 25 = 144 → q = 12",
   "(b) Sisi miring 26, sisi tegak 24. z² = 26² − 24² = 676 − 576 = 100 → z = 10",
   "(c) Kedua sisi siku-siku 7 dan 24. m² = 7² + 24² = 49 + 576 = 625 → m = 25",
   "(d) Sisi miring 12,5, sisi tegak 3,5. e² = 12,5² − 3,5² = 156,25 − 12,25 = 144 → e = 12",
   "(e) Kedua sisi siku-siku 24 dan 32. a² = 24² + 32² = 576 + 1024 = 1600 → a = 40"
  ],
  "jawaban": "(a) q = 12;  (b) z = 10;  (c) m = 25;  (d) e = 12;  (e) a = 40",
  "catatan": null,
  "cek": [
   {
    "l": "(a) q",
    "v": 12
   },
   {
    "l": "(b) z",
    "v": 10
   },
   {
    "l": "(c) m",
    "v": 25
   },
   {
    "l": "(d) e",
    "v": 12
   },
   {
    "l": "(e) a",
    "v": 40
   }
  ]
 },
 {
  "no": "No. 3 (hal. 36)",
  "judul": "Luas dan keliling persegi panjang",
  "soal": "Sebuah persegi panjang memiliki diagonal 14,5 cm dan panjang 10,5 cm. Tentukan luas dan kelilingnya.",
  "gambar": [
   "assets/latihan/ab1_no3.png"
  ],
  "langkah": [
   "Diagonal membagi persegi panjang menjadi dua segitiga siku-siku, diagonal sebagai sisi miring",
   "l² = 14,5² − 10,5² = 210,25 − 110,25 = 100  →  l = 10 cm",
   "Luas = p × l = 10,5 × 10 = 105 cm²",
   "Keliling = 2 × (p + l) = 2 × (10,5 + 10) = 41 cm"
  ],
  "jawaban": "Luas = 105 cm² dan keliling = 41 cm",
  "catatan": null,
  "cek": [
   {
    "l": "Luas (cm²)",
    "v": 105
   },
   {
    "l": "Keliling (cm)",
    "v": 41
   }
  ]
 },
 {
  "no": "No. 4 (hal. 36)",
  "judul": "Layang-layang dan Teorema Pythagoras",
  "soal": "Pada layang-layang, apakah dua pasang sisinya dan diagonal-diagonalnya yang saling tegak lurus memenuhi Teorema Pythagoras? Jelaskan.",
  "gambar": [
   "assets/latihan/ab1_no4.png"
  ],
  "langkah": [
   "Diagonal AC dan BD berpotongan tegak lurus di O, sehingga terbentuk empat segitiga siku-siku (siku-siku di O).",
   "Tiap sisi layang-layang adalah sisi miring salah satu segitiga itu: AB² = AO² + BO², BC² = BO² + CO², CD² = CO² + DO², DA² = DO² + AO².",
   "Contoh angka: AO = 8, BO = 6 → AB² = 64 + 36 = 100 → AB = 10.",
   "Jadi sisi-sisi dan setengah-diagonalnya memenuhi Teorema Pythagoras."
  ],
  "jawaban": "Ya, memenuhi. Diagonal yang saling tegak lurus membentuk segitiga siku-siku dengan sisi layang-layang sebagai sisi miringnya.",
  "catatan": null,
  "cek": []
 },
 {
  "no": "No. 5 (hal. 36)",
  "judul": "Keliling trapesium siku-siku",
  "soal": "Trapesium ABCD memiliki AD = 27 cm, AB = 24 cm, dan BC = 34 cm, dengan sudut A dan B siku-siku. Tentukan kelilingnya.",
  "gambar": [
   "assets/latihan/ab1_no5.png"
  ],
  "langkah": [
   "Tarik garis dari D tegak lurus ke BC. Selisih sisi sejajar: 34 − 27 = 7 cm, tinggi = AB = 24 cm.",
   "CD² = 7² + 24² = 49 + 576 = 625  →  CD = 25 cm",
   "Keliling = AD + AB + BC + CD = 27 + 24 + 34 + 25 = 110 cm"
  ],
  "jawaban": "Keliling = 110 cm",
  "catatan": null,
  "cek": [
   {
    "l": "Keliling (cm)",
    "v": 110
   }
  ]
 },
 {
  "no": "No. 6 (hal. 36–37)",
  "judul": "Keliling persegi panjang OCDE dan bangun ABCDEF",
  "soal": "Pada gambar, panjang EB = 10 cm, dan FO = OB = BC = 6 cm (tanda garis kecil menunjukkan sama panjang). EO tegak lurus FC, dan OCDE persegi panjang. Tentukan (a) keliling persegi panjang OCDE dan (b) keliling bangun ABCDEF.",
  "gambar": [
   "assets/latihan/ab1_no6.png"
  ],
  "langkah": [
   "EO tegak lurus FC, jadi segitiga EOB siku-siku di O: EO² = EB² − OB² = 100 − 36 = 64  →  EO = 8 cm",
   "(a) OC = OB + BC = 6 + 6 = 12 cm, OE = 8 cm. Keliling OCDE = 2 × (12 + 8) = 40 cm",
   "(b) CD = OE = 8 cm dan DE = OC = 12 cm. Sisi EF: EF² = EO² + FO² = 64 + 36 = 100 → EF = 10 cm.",
   "Pada gambar, A berada tepat di bawah O dan simetris dengan E terhadap garis FB (OA = OE = 8 cm), sehingga AB = FA = 10 cm.",
   "Keliling ABCDEF = AB + BC + CD + DE + EF + FA = 10 + 6 + 8 + 12 + 10 + 10 = 56 cm"
  ],
  "jawaban": "(a) 40 cm;  (b) 56 cm",
  "catatan": "Asumsi untuk (b): titik A simetris dengan E (OA = OE). Panjang OA tidak tertulis di gambar. Bila di bukumu OA tertulis angka lain, ganti 8 dengan angka itu: AB = FA = √(36 + OA²).",
  "cek": [
   {
    "l": "(a) keliling OCDE (cm)",
    "v": 40
   },
   {
    "l": "(b) keliling ABCDEF (cm)",
    "v": 56
   }
  ]
 },
 {
  "no": "No. 7 (hal. 37)",
  "judul": "Panjang BD dan CD, serta uji sudut B",
  "soal": "Pada segitiga ABC, titik D pada AC dan BD tegak lurus AC. Diketahui AB = 10 cm, AD = 6 cm, dan BC = 17 cm. (a) Tentukan BD dan CD. (b) Buktikan bahwa sudut B siku-siku.",
  "gambar": [
   "assets/latihan/ab1_no7.png"
  ],
  "langkah": [
   "(a) Segitiga ABD siku-siku di D: BD² = AB² − AD² = 100 − 36 = 64  →  BD = 8 cm",
   "Segitiga BCD siku-siku di D: CD² = BC² − BD² = 289 − 64 = 225  →  CD = 15 cm",
   "(b) AC = AD + CD = 6 + 15 = 21 cm. Uji kebalikan Pythagoras di sudut B: AB² + BC² = 100 + 289 = 389, sedangkan AC² = 441.",
   "Karena 389 ≠ 441, sudut B tidak siku-siku (AC² > AB² + BC², jadi sudut B tumpul)."
  ],
  "jawaban": "(a) BD = 8 cm dan CD = 15 cm.  (b) Dengan angka pada soal, sudut B TIDAK siku-siku.",
  "catatan": "Perhatian: bagian (b) tidak dapat dibuktikan dengan angka yang tertulis, sebab 10² + 17² = 389 ≠ 21² = 441. Kemungkinan ada salah cetak di soal. Jika soal ini dipakai di game, sebaiknya bagian (b) diganti, misalnya menjadi \"Apakah sudut B siku-siku? Jelaskan\" (jawaban: bukan).",
  "cek": [
   {
    "l": "BD (cm)",
    "v": 8
   },
   {
    "l": "CD (cm)",
    "v": 15
   }
  ]
 },
 {
  "no": "No. 8 (hal. 37)",
  "judul": "Tinggi tiang",
  "soal": "Sebuah tiang berdiri tegak di tanah. Seutas tali dari puncak tiang diikat ke sebuah patok di tanah. Panjang tali 17 m dan jarak patok ke kaki tiang 8 m. Tentukan tinggi tiang.",
  "gambar": [
   "assets/latihan/ab1_no8.png"
  ],
  "langkah": [
   "Tiang, tanah, dan tali membentuk segitiga siku-siku dengan tali sebagai sisi miring.",
   "t² = 17² − 8² = 289 − 64 = 225",
   "t = √225 = 15 m"
  ],
  "jawaban": "Tinggi tiang = 15 m",
  "catatan": null,
  "cek": [
   {
    "l": "Tinggi tiang (m)",
    "v": 15
   }
  ]
 },
 {
  "no": "No. 9 (hal. 37)",
  "judul": "Keliling gabungan jajargenjang dan segitiga siku-siku",
  "soal": "Bangun pada gambar terdiri atas sebuah jajargenjang dan sebuah segitiga siku-siku. Sisi miring segitiga 37 cm, sisi tegaknya 12 cm, dan sisi miring jajargenjang sama panjang dengan sisi tegak itu (12 cm, ditandai garis kecil). Tentukan keliling bangun tersebut.",
  "gambar": [
   "assets/latihan/ab1_no9.png"
  ],
  "langkah": [
   "Alas segitiga (garis putus-putus): a² = 37² − 12² = 1369 − 144 = 1225  →  a = 35 cm",
   "Sisi atas jajargenjang sama panjang dengan alasnya, yaitu 35 cm.",
   "Sisi-sisi pada keliling luar: atas 35 + miring kanan 12 + tegak 12 + miring segitiga 37 + miring kiri 12",
   "Keliling = 35 + 12 + 12 + 37 + 12 = 108 cm"
  ],
  "jawaban": "Keliling = 108 cm",
  "catatan": "Garis putus-putus bukan bagian keliling karena berada di dalam bangun.",
  "cek": [
   {
    "l": "Keliling (cm)",
    "v": 108
   }
  ]
 },
 {
  "no": "No. 10 (hal. 37)",
  "judul": "Panjang CD",
  "soal": "Segitiga ABD siku-siku di B, dengan C terletak pada BD. Diketahui AB = 12 cm, AC = 15 cm, dan AD = 20 cm. Tentukan panjang CD.",
  "gambar": [
   "assets/latihan/ab1_no10.png"
  ],
  "langkah": [
   "Segitiga ABC siku-siku di B: BC² = AC² − AB² = 225 − 144 = 81  →  BC = 9 cm",
   "Segitiga ABD siku-siku di B: BD² = AD² − AB² = 400 − 144 = 256  →  BD = 16 cm",
   "CD = BD − BC = 16 − 9 = 7 cm"
  ],
  "jawaban": "CD = 7 cm",
  "catatan": null,
  "cek": [
   {
    "l": "CD (cm)",
    "v": 7
   }
  ]
 }
];
