# Petualangan Pythagoras — Paket Lengkap

Game edukasi Teorema Pythagoras (pixel art 8-bit). HTML + CSS + JavaScript murni,
tanpa framework dan tanpa proses build. Buka `game/index.html` (atau jalankan server
statis, mis. `python3 -m http.server` di folder `game/`).

## Isi paket
- `game/` — seluruh proyek siap pakai
  - `index.html` — kerangka halaman (HUD, kontainer #app, dock navigasi, panel audio)
  - `css/style.css` — seluruh gaya; tata letak satu layar (100dvh), tanpa scroll halaman
  - `js/data.js` — konten: tujuan, pos, soal, kuis, lencana
  - `js/store.js` — penyimpanan localStorage, XP, level, bintang, misi, lencana
  - `js/audio-config.js` — **daftar semua audio** + pemetaan event -> suara + musik per halaman
  - `js/audio.js` — mesin audio (musik loop, efek tanpa saling menimpa, volume & ON/OFF terpisah, buka kunci autoplay)
  - `js/viz.js` — gambar SVG segitiga, persegi, adegan
  - `js/app.js` — router, HUD, dock, menu 3x3, peta, pos, finish, profil, panel suara
  - `js/materi.js` — materi (dibagi slide lewat `PP.book`), eksplorasi interaktif
  - `js/explore.js` — **mode Jelajah Dunia** (dunia terbuka 2D, joystick, warga bertanya dari PP.QUIZ, koin, lemari, 3 dunia & portal)
  - `js/firebase-config.js`, `js/online.js`, `js/papan.js` — **mode online**: ruangan, kirim skor, papan peringkat (Firebase REST)
  - `database.rules.json`, `PETUNJUK_FIREBASE.md` — aturan database dan panduan penyambungan
  - `js/art.js` — **pustaka seni piksel prosedural**: manusia beranimasi (jalan/lari/diam, tidak kaku), hewan hutan (monyet, singa, harimau, kijang, gajah, kelinci, burung), pohon, properti
  - `js/art_city.js` — aset kota: mobil, motor, bus, gedung, toko (Minimart, Apotek, dll), lampu lalu lintas, rambu, zebra cross, halte
  - `js/explore_life.js` — kehidupan dunia: lalu lintas (berhenti di lampu merah, mengerem untuk pemain), AI hewan (diam/jalan/kabur), burung
  - `js/kota.js` + `js/kota_data.js` — **Kota Hipotenusa** (dari zip aset kota): peta, bangunan y-sort, tabrakan, lalu lintas jalur kiri, lampu 20 detik, polisi, burung, air mancur
  - `assets/kota/` — gambar kota (peta, bangunan, properti, rambu, karakter, kendaraan, burung); `assets/img/walk/` — frame jalan karakter (kaki bergerak)
  - `js/icons.js` — ikon vektor menu
  - `js/shapes.js` — bangun datar di dunia Jelajah (gambar, ukuran, rumus)
  - `js/games.js` — Game A–D; `js/quiz.js` — kuis; `js/report.js` — video, refleksi, penilaian
  - `assets/img/` — sprite karakter, bangunan, logo (lama); `assets/img/new/` — ikon & dekorasi dari paket baru; `bg_village.svg`, `cloud.svg`
  - `assets/audio/sfx/` 01–08 `.wav`; `assets/audio/bgm/` 09 `.wav` + 5 musik latar `.mp3`
- `sumber_asli/ikon_animasi_asli/` — sprite sheet & GIF asli dari paket ikon
- `sumber_asli/paket_sound_asli/` — 9 WAV asli + petunjuk
- `sumber_asli/sprite_karakter_sebelum_dibersihkan/` — sprite karakter asli sebelum dibersihkan (lubang/tembus pandang)
- `alat/tools_clean_sprites.py` — skrip pembersih sprite (isi lubang, buang serpihan)
- `alat/tools_walk_frames.py` — pembuat frame jalan (kaki bergerak) dari sprite diam
- `alat/potong_sprite.py` — skrip Python (PIL, scipy) yang memotong sprite sheet menjadi `assets/img/new/*`
- `PETUNJUK_AUDIO.txt` — ringkasan struktur audio

## Peta audio (event -> file)
| Event | File |
|---|---|
| click / tick / quizSelect | 01_klik_tombol.wav |
| page / start / end / selectPos | 02_perpindahan_menu.wav |
| correct | 03_jawaban_benar.wav |
| wrong | 04_jawaban_salah.wav |
| mission | 05_misi_selesai.wav |
| star / point | 06_bintang_hadiah.wav |
| unlock | 07_lokasi_baru_terbuka.wav |
| victory | 08_kemenangan_akhir.wav |
| musik halaman Eksplorasi | 09_musik_latar_eksplorasi_loop.wav |
Memutar suara dari kode: `PPAudio.sfx('correct')`. Musik halaman diatur di `sceneMusic`.

## Catatan pengembangan ke platform lain
- Logika game ada di `js/*.js` dan memakai objek global `PP`, `PPStore`, `PPAudio`, `PPViz`.
- Progres tersimpan di localStorage kunci `pp_save_v1`; pengaturan suara di `pp_audio_v1`.
- Rute memakai hash (`#menu`, `#peta`, `#pos-1`, `#materi-3`, `#game-A`, `#kuis`, ...).
- Untuk Capacitor/Cordova/WebView: cukup bungkus folder `game/`. Untuk Unity/Godot/Flutter,
  pakai folder `assets/` dan `js/data.js` sebagai sumber konten.
- Font Pixelify Sans & Nunito dimuat dari Google Fonts (ada font cadangan bila offline).

## Mode Jelajah Dunia (baru)
- Rute `#jelajah`. Berjalan dengan joystick (komputer: panah/WASD, Shift lari, E/Spasi bicara).
- 15 warga bertanda "!" mengajukan soal dari `PP.QUIZ` (Mudah -> Desa, Sedang -> Hutan, Sulit -> Kota).
- Dunia, posisi warga, bangunan, portal: konstanta `WORLDS` di atas `js/explore.js`. Tambah dunia = tambah satu objek di array itu.
- Progres di `PPStore.data.explore` (koin, soal terjawab, dunia selesai, aksesori). Lencana baru: `jelajah`.

## Mode online (baru)
- Isi `js/firebase-config.js` (alamat Realtime Database). Panduan lengkap: `game/PETUNJUK_FIREBASE.md`; aturan: `game/database.rules.json`.
- Profil menerima **kode ruangan**; skor kuis dikirim otomatis; rute `#papan` menampilkan peringkat bersama (auto-refresh 6 dtk).
- Tanpa konfigurasi, game berjalan seperti biasa (fitur online nonaktif).

## Jelajah: bangun datar & warga bergerak
- `js/shapes.js`: 8 jenis bangun datar (persegi, persegi panjang, segitiga siku-siku, segitiga sama sisi, lingkaran, jajargenjang, trapesium siku-siku, belah ketupat) digambar di tanah lengkap dengan ukuran. Didekati -> tombol "Pelajari" -> kartu luas, keliling, dan langkah Pythagoras. Daftar bentuk per dunia: `shapes` di `WORLDS` (`js/explore.js`).
- 29 warga penanya (10 + 11 + 8): soal dari `PP.QUIZ` (nomor 0-14) dan `PP.POOL_D` (nomor 100+). Warga berkeliling di sekitar rumahnya, berhenti dan menoleh ke pemain saat didekati (< 120 satuan).

## Kota Hipotenusa (dari Aset_Kota_Hutan_Hipotenusa.zip)
- `js/kota.js` — mesin kota: ground, y-sort, tabrakan bangunan, kendaraan jalur kiri, lampu 20 detik, rem untuk pemain, warga, polisi mengatur, burung, air mancur
- `js/kota_data.js` — data peta + animasi; `js/kota_atlas.js` + `assets/kota/atlas.png` — semua sprite kecil digabung satu atlas; `assets/kota/01_peta_kota/peta_kota_ground.png` — tanah
- `sumber_asli/aset_kota_zip_asli/` — isi zip asli
- Animasi jalan karakter (`js/explore_life.js`): satu gambar utuh, kaki melangkah bergantian lewat rampa halus (tanpa belahan).

## Penjelajah Laut (dari Aset_Laut_Pythagoras.zip)
- `js/laut.js` — mesin laut: air beranimasi (3 kedalaman), pantai, dermaga, pos polisi, pulau harta, renang + percikan sekali, adegan Bawah Laut, hewan/kapal/rambu/lampu
- `js/laut_data.js` — 18 soal bertema laut (6 pos x 3 soal; satu dipilih acak tiap dibuka); `js/laut_atlas.js` — ukuran frame & fps
- `assets/laut/{spritesheet,statis,latar,av}` — aset dari zip
- Cara uji: selesaikan Kota -> portal 'Ke Laut' -> jawab pos 1-4 -> selam lewat portal di air dalam -> Peti Harta terbuka bila minimal 4 dari 5 pos lain selesai.

## Video Animasi
- `assets/video/petualangan-mengenal-pythagoras.mp4` (+ `.jpg` poster) — video asli Anda (720p, ringan untuk HP)
- Video YouTube: `PP.VIDEOS` di `js/data.js` (field `yt`: ID video). Untuk menambah video: tambah satu baris `{ id, title, desc, src:'assets/video/xxx.mp4' }` atau `{ ..., yt:'IDVIDEO' }`.
