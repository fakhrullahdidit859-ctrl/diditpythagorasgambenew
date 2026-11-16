# PROMPT LENGKAP — Petualangan Pythagoras

Kumpulan prompt untuk membangun ulang, mengembangkan, dan merawat seluruh fitur aplikasi. Pakai prompt UTAMA lebih dulu (konteks tetap), lalu prompt modul satu per satu. Tempelkan hasil/kode sebelumnya bila AI perlu melanjutkan.

---
## 0. PROMPT UTAMA (konteks tetap — tempel di awal setiap sesi)

Bertindaklah sebagai programmer web senior yang teliti. Kamu membangun "Petualangan Pythagoras": game edukasi bergaya pixel-art untuk Matematika SMP Kelas VIII, Bab Teorema Pythagoras (acuan: buku Global Matematika SMP Kelas VIII). Pembuat: Didit Fakhrullah (watermark "Made by Didit Fakhrullah" harus tetap tampil). Aturan teknis:
- Murni HTML + CSS + JavaScript biasa (tanpa framework, tanpa proses build), berjalan dari server statis. Bahasa antarmuka: Bahasa Indonesia.
- Satu namespace global `PP` (layar di `PP.screens.*` berbentuk fungsi yang mengembalikan `{html, mount(app,arg), unmount()}`; rute berbasis hash `#nama-argumen`). Penyimpanan lokal `PPStore` (localStorage), penyimpanan bersama `PPCloud` (Firebase Realtime Database lewat REST, dengan cadangan lokal), audio terpusat `PPAudio`, UI helper `PP.ui` (modal, konfirmasi, toast, confetti).
- Tampilan layar penuh responsif untuk HP landscape, tablet, dan komputer; tombol besar; kontras baik; aksesibel (label, fokus, bisa dibaca pembaca layar).
- Setiap data penting disimpan permanen (lokal + online), tidak boleh hilang saat muat ulang; data siswa tidak boleh bocor; siswa tidak mengetahui keberadaan fitur guru.
- Guru masuk dengan PIN 4–6 angka per ruangan (hash SHA-256 di `meta/pin`). Ruangan = kode 3–10 huruf/angka; semua data bersama di `{root}/rooms/{KODE}/...`.
- Setelah menulis kode: jalankan `node --check`, uji di browser (Playwright), pastikan tidak ada galat konsol, lalu laporkan secara jujur apa yang belum teruji.

---
## 1. Inti aplikasi (app.js, store.js, fx.js, icons/ikon/deco)
Buat inti aplikasi: router hash, HUD atas (avatar, nama, level, bintang/XP, tombol suara, aksesibilitas), dock navigasi bawah, helper UI (modal, confirm, toast, confetti, transisi), dan layar: pembuka (nama, kelas, sekolah, pilih avatar), petunjuk, profil, menu utama (kartu fitur berwarna dengan ikon SVG), tujuan, peta, pos, finish. `PPStore` menyimpan XP, level, bintang, lencana, progres di localStorage (tahan jika localStorage diblokir). Sediakan sistem ikon SVG seragam (`PP.ICONS`), dekor pohon/semak/bunga utuh, dan skrip animasi `FX` (ikon animasi, efek bintang, goyang, denyut) tanpa library.

## 2. Audio terpusat (audio-config.js, audio.js)
Satu file konfigurasi mendaftarkan semua audio (musik latar per layar, efek suara). Aturan: satu musik latar pada satu waktu dengan crossfade antar halaman dan loop; efek suara (klik, benar, salah, bintang, misi, buka kunci) dipicu `PPAudio.sfx(nama)`; tombol suara mengatur musik/efek terpisah; tahan autoplay browser (mulai setelah sentuhan pertama); pesan jelas bila berkas hilang. Sertakan PETUNJUK_AUDIO.txt (cara mengganti/menambah audio).

## 3. Kegiatan Pendahuluan (pendahuluan.js, pend_art.js)
Alur pembuka pembelajaran: Doa → Kesepakatan Kelas → Lagu Kebangsaan (video/audio, tombol lewati jika error) → Absensi (memakai layar absen) → Apersepsi 1 → Apersepsi 2 → Materi. Rute `#pendahuluan`, `#pendahuluan-doa`, `-sepakat`, `-lagu`, `-aps1`, `-aps2`. Seni vektor buatan kode: tokoh Rafi (berpeci) dan teman berhijab, lentera, bulan sabit, bintang, rehal, bingkai doa. Progres tiap langkah tersimpan.

## 4. Materi & Cerita Rafi (materi.js, cerita.js, bookfig.js, flip.js, flip_data.js)
Materi Bab 2 Teorema Pythagoras: tiap subbab berisi penjelasan, contoh, gambar bangun datar dari koordinat (`PP.Fig.svg`), dan karakter Rafi yang bercerita (mulut membuka-menutup, papan peraga berganti gambar). Buku Digital flipbook: halaman dibalik dengan animasi, ukuran buku bisa diatur, semua gambar SVG hasil perhitungan, bangun datar fokus pada Pythagoras (persegi, persegi panjang, segitiga, trapesium, layang-layang, belah ketupat, jajar genjang).

## 5. Eksplorasi Pythagoras (eksplor3d.js, puzzle.js, jalur.js, viz.js)
Layar pilihan awal dua fitur: (1) Eksplor dengan Edukasi: Geser Sisi (visual a²+b²=c²), puzzle persegi, puzzle bukti, cari hipotenusa, Jalur Belajar; (2) "Kode QR Objek 3D Augmented Reality (AR)": unggah/tampilkan kode QR objek 3D, kolom catatan tambahan (hanya guru yang menambah/menghapus; semua siswa membaca; disimpan di `eks3d/notes`), dan panduan bawaan: scan QR memakai kamera perangkat kedua atau perangkat yang sama, pastikan jaringan stabil, buka web/aplikasi Assembler Edu → fitur scan (tanpa login) → "turn on camera" → scan QR → tunggu objek 3D AR tampil; saran memakai HP dengan kamera belakang; objek digerakkan dengan menyentuh layar; berlaku khusus Assembler Edu. Visualisasi matematika SVG dihitung dari angka asli.

## 6. Kuis, Game, Latihan (quiz.js, games.js, latihan_data.js, data.js, gen.js, petunjuk.js)
Kuis interaktif 15 soal (timer dapat diatur, jawaban tersimpan, pembahasan). Empat game: A Susun Segitiga, B Temukan Panjang Sisi, C Misi Jembatan, D Tantangan Akhir. Mode Latihan dengan pembahasan langkah (bersumber dari buku siswa) dan petunjuk bertingkat tanpa AI: (1) ingatkan konsep, (2) langkah awal (hadiah −25%), (3) hapus 2 pilihan salah. Pembuat soal otomatis `PPGen` (hipotenusa, sisi siku-siku, tripel, diagonal, keliling/luas) beserta gambar SVG. Setiap soal numerik memiliki kunci dan toleransi pembulatan.

## 7. Jelajah Dunia (explore.js, explore_life.js, shapes.js, jsetup.js, kota*.js, laut*.js, nusantara.js, art*.js, portal_art.js)
Dunia terbuka 2D pandangan atas dengan joystick dan tombol aksi. Warga bertanda "!" mengajukan soal dari bank soal. Tiga dunia: Desa, Kota Hipotenusa (peta ubin 40×34, lalu lintas jalur kiri, lampu merah, gedung/toko dari atlas gambar), Penjelajah Laut (6 pos × 3 soal acak, sprite renang). Dunia Nusantara: soal bangunan/budaya Indonesia dengan tripel Pythagoras terverifikasi saat dimuat. Kehidupan dunia: animasi langkah luwes, kendaraan, hewan, burung, kupu-kupu, polisi (seni piksel prosedural). Layar persiapan: biodata → pilih sumber soal → mulai. Bangun datar digambar di tanah dengan ukuran dan rumus. Portal "Kembali" pixel-art.

## 8. Server bersama & mode online (online.js, server.js, cloud.js, papan.js, firebase-config.js)
Satu ruangan = satu server realtime: pemain saling melihat (nama di atas karakter, posisi, status online/offline lewat onDisconnect) memakai Firebase SDK dari CDN gstatic bila tersedia; fitur lain memakai REST. `PPCloud` menyediakan get/put/patch/del/keys/watch dengan cadangan lokal saat Firebase kosong. Papan peringkat bersama (rute `#papan`, perbarui tiap 6 detik). Konfigurasi di `firebase-config.js` (databaseURL, storageBucket, root, defaultRoom). Sertakan `database.rules.json`, `storage.rules`, `PETUNJUK_FIREBASE.md` (5 langkah).

## 9. Akun guru & absen (guru.js, absen.js)
Akun guru berbasis PIN per ruangan (buat pertama kali, masuk, keluar, ganti PIN dengan verifikasi PIN lama). Absen manual online per kelas SMP: daftar siswa (`absen/roster/{kelas}/{id}`), rekaman per tanggal (`absen/rec/{tanggal}`), hanya guru yang mengubah, siswa membaca; tautan ke absen milik guru.

## 10. Bank soal, impor, buat soal (bank.js, impor.js, buatsoal.js)
Bank soal terpusat (`bank/{id}` dengan pertanyaan, opsi, kunci, pembahasan, topik, level, sumber, batch) dipakai Kuis, Game, dan Jelajah. Impor dari PDF/Word/Excel/CSV/teks dalam 3 langkah: Baca → Periksa (tabel bisa diedit) → Simpan; hanya guru. Fitur Buat Soal: guru dan siswa mengajukan soal; yang disetujui muncul sebagai warga "Soal Teman: <nama>" di dunia Jelajah.

## 11. Misi, toko, lencana, lomba (misi.js, lomba.js)
Misi harian, streak, lencana, toko, dan lemari kostum (koin dari Jelajah). Hub Fitur Lomba: rekap, misi, toko, lencana, buat soal, sertifikat, aksesibilitas, memakai ikon PNG di `assets/lomba/ikon`.

## 12. Laporan, sertifikat, rapor, rekap (laporan.js, rapor.js, rekap.js, report.js)
Sertifikat Penjelajah (kanvas 1754×1240 A4 landscape, unduh PNG/cetak/bagikan) memuat baris "Nilai LKPD Proyek". Rapor siswa memuat semua kategori nilai dan dikirim ke `rapor/{idPemain}` (debounce) agar guru dapat merekap. Rekap nilai guru: tabel semua kategori + kehadiran + kolom LKPD (lkl, lkn), urut, cetak, unduh CSV / Excel (.xlsx asli) / Word (.doc) / PDF lewat cetak. Video animasi, refleksi, dan program penilaian.

## 13. Video & aksesibilitas (video.js, a11y.js)
Video otomatis di Menu Utama; guru dapat "Ganti Video" (URL atau unggah ke Storage; disimpan di `video/active`). Panel aksesibilitas (localStorage `pp_a11y`): bacakan soal (speechSynthesis id-ID, kecepatan, suara, otomatis), kontras tinggi, ukuran huruf, kurangi gerak.

## 14. Alat Bantu: Kalkulator Ajaib & Papan Tulis (jba-mesin.js, jba-alat.js, alat_pasang.js)
Mesin hitung presisi pecahan BigInt tanpa `eval` (0,1+0,2 = 0,3). Alat di Shadow DOM (satu global `JBAlat`): kalkulator, papan tulis digital (pena, penghapus, warna, undo), mode kecil dan penuh, dapat digeser. Aturan: alat hanya aktif (menangkap papan ketik) setelah disentuh/ditekan; pada mode kecil tidak boleh mencuri ketikan fitur lain. `JBAlat.setKalk(on)` menyalakan/mematikan kalkulator per kelompok. `alat_pasang.js` memasangnya ke layar yang tampil tanpa mengubah fitur lama.

## 15. Planning Guru (planning.js)
Quest Journal guru: perencanaan pembelajaran bergaya jurnal misi, data terpisah di localStorage `pp_planning_v1`, video panduan `panduan_planning.mp4`.

## 16. LKPD PROYEK (lkpd.js, lkpd_data.js, lkpd_ikon.js, qrlib.js)
Model PjBL berdiferensiasi, tema "Tim Satgas Keselamatan & Fasilitas Sekolah". Tiga level dari tes diagnostik: A Dasar (Kelompok Dasar), B Menengah (Kelompok Menengah), C Mahir (Kelompok Mahir) dengan LKPD berbeda tingkat tantangan. Peran ganda dirotasi tiap fase.

**Siswa.** Beranda dengan kartu level (level kelompok lain terkunci; siswa tanpa kelompok hanya membaca naskah). Tes diagnostik 5 soal (konfirmasi "Apakah kamu yakin dengan hasil tes diagnostik ini?", hasil terkunci, tombol "Beritahu guru" bila salah). Penempatan otomatis ke kelompok sesuai level dengan kapasitas 4/5/6 (penuh → kelompok lain/baru). LKPD 6 langkah: (1) cerita & pertanyaan, (2) peran, alat, jadwal otomatis+manual, (3) tabel pengukuran, (4) perhitungan dengan pemeriksaan toleransi (level A bertemplat + kartu bantuan, B dan C tulis langkah sendiri), (5) kesimpulan + foto beranotasi/coretan/berkas bukti, (6) diskusi, refleksi pribadi, daftar periksa privasi/keselamatan. Tombol Panduan Foto & Coret di bilah atas. Batas waktu per level dengan hitung mundur dan kirim otomatis saat habis. Kirim ke guru → jendela edit 5 menit (atur guru) → terkunci, hanya riwayat. Riwayat pengerjaan lengkap (isian, jawaban, foto, aktivitas). Presentasi: editor slide (judul, teks, foto/video, data, tanya jawab; 4 tema; urutan; versi; hapus), penayang dengan hitung mundur durasi yang diatur guru.

**Guru (panel tersembunyi, 5 ketukan pada ikon / tombol saat login guru).** Tab Kelompok (ukuran 4/5/6, penempatan otomatis, bentuk otomatis, tambah/hapus/ganti nama, reset siswa/semua, permintaan siswa), Pantau (status, fase, sisa waktu, detail hasil, tambah waktu/kunci/batalkan kirim), Nilai (skala rubrik 1–4 atau angka 0–100, umpan balik, tersinkron ke siswa), Presentasi (lihat/tayangkan/sembunyikan, durasi), Parameter (semua angka acuan dapat diedit, asal-usul, uji hitung, toleransi desimal, hitung ulang setelah simpan), Pengaturan (durasi per level, waktu edit, kalkulator per level, ukuran kelompok, ganti PIN), Naskah (cetak LKPD kosong/kelompok dengan pratinjau, salin Markdown, editor Pemetaan Kognitif, Diagnostik+kunci, Rubrik). Data di `lkpd/{cfg,diag,map,grp,blob,rub,nilai,pres,presv,req}`; berkas bukti ke Storage atau dipecah di database (maks 6 MB). Semua perubahan tersimpan dan terbaca ulang oleh siswa.

## 17. PWA / offline (manifest.webmanifest, sw.js, offline.html, pwa.js, icons/, pp-assets.json)
Buat PWA: manifest (nama, ikon 192/512/maskable, standalone, tema #5e3716), service worker (precache inti, jaringan-dulu untuk halaman, cache-dulu untuk aset, dukungan Range untuk video/audio, font stale-while-revalidate, Firebase tidak pernah di-cache, pesan CACHE_ALL/STATUS/CLEAR), halaman offline cadangan, layar "Mode Offline" (#offline) dengan tombol Pasang aplikasi, Unduh semua untuk offline (opsi musik), Hapus data offline, progres, petunjuk iOS. Daftar aset dihasilkan skrip (pp-assets.json). Naikkan `VERSION` di sw.js tiap rilis.


## 17b. INTEGRASI PLATFORM (integrasi.js)
Buat fitur "Integrasi Platform" (rute #integrasi, kartu menu ungu) untuk menghubungkan game dengan platform lain: Canva, Google AI Studio, Zeepquiz, Wordwall, plus platform tambahan (Google Formulir, YouTube, Quizizz, Kahoot, Padlet, Liveworksheets, Google Drive, GeoGebra, atau buatan sendiri dengan emoji, warna, domain). Setiap platform punya ikon SVG sendiri bergaya pixel/lencana. Guru (PIN) menambah, mengubah, menghapus, mengurutkan tautan; tiap tautan punya judul, URL (hanya http/https), jenis, catatan, tanda "utama", dan "sembunyikan dari siswa". Tautan dapat dimasukkan dengan mengetik, menempel dari papan klip, mengunggah gambar kode QR (dibaca offline oleh QRRead), atau memindai QR dengan kamera; domain dikenali otomatis dan platform dipilih otomatis, dengan peringatan bila tidak cocok. Data tersimpan di `integrasi/links/{platform}/{id}` dan `integrasi/plat/{id}` dan tersinkron otomatis (watch ± 6 dtk) ke semua siswa. Siswa menekan kartu platform: bila ada tautan utama atau hanya satu tautan, langsung berpindah (jendela baru, noopener); bila banyak, daftar tampil dengan pencarian dan filter jenis. Cadangan jika popup diblokir: modal berisi QR, tautan, salin. Tambahan profesional: kode QR tiap tautan untuk perangkat lain, penghitung pembukaan, status sinkron, cadangan/pulihkan JSON, aturan database tervalidasi.

## 18. Firebase & hosting
Buat `firebase.json` (hosting dari folder game, header no-cache untuk sw.js, cache 7 hari untuk media; rules database & storage), `.firebaserc`, aturan Realtime Database yang membatasi kode ruangan `^[A-Z0-9]{3,10}$`, validasi tiap node (players, absen, bank, lkpd, dll.), dan aturan Storage (lkpd ≤ 25 MB, video ≤ 100 MB mp4/webm). Jelaskan cara deploy: `firebase login`, `firebase use <id>`, `firebase deploy`.

## 19. Prompt pembuatan aset
- **Sprite karakter piksel** (boy/girl, 7 frame jalan, 4 arah): "Gambar sprite pixel-art 32×48 karakter siswa SMP berseragam, 7 frame berjalan, latar transparan, garis tepi cokelat tua, palet hangat." Skrip bantu: tools_clean_sprites.py, tools_walk_frames.py.
- **Ikon menu**: "Ikon pixel-art 64×64 untuk fitur <nama>, lencana warna dengan garis tepi cokelat tua, gaya sama dengan set yang ada."
- **Musik latar**: "Musik latar loop 60–90 detik, ceria dan tenang, instrumental, tanpa vokal, tempo 90–110 BPM, cocok untuk belajar" (per layar: menu, materi, kuis, jelajah, laut, LKPD).
- **Efek suara**: klik, benar, salah, bintang, misi selesai, buka kunci, langkah — pendek (<1,5 dtk), mp3/ogg.
- **Video**: "Video animasi 60–90 dtk menjelaskan teorema Pythagoras dengan tokoh Rafi, 16:9, narasi bahasa Indonesia, takarir."
- **Objek 3D AR**: unggah ke Assembler Edu, buat QR, tempel ke fitur Eksplorasi.

## 20. Prompt perbaikan & pengujian
"Periksa seluruh kode untuk galat konsol, ID yang bentrok, data yang tertimpa, kondisi balapan saat menyimpan, dan akses yang tidak semestinya. Jalankan pengujian Playwright untuk alur siswa (tes → kelompok → LKPD → kirim → kunci → riwayat setelah muat ulang) dan alur guru (semua tab). Laporkan temuan dengan bukti, perbaiki, ulangi tes, dan nyatakan jujur bagian yang tidak dapat diuji (Firebase asli, kamera QR, perangkat nyata)."

## 21. Prompt dokumentasi
"Buat dokumen kode lengkap (semua berkas sumber dengan penjelasan fungsi tiap berkas), panduan Firebase, panduan PWA/offline, panduan audio, dan paket ZIP (game + musik). Sertakan cara menjalankan lokal (`python3 -m http.server`), di Wi-Fi yang sama, dan di hosting statis."

## 22. Prompt: Tampilan responsif semua perangkat
"Pastikan game nyaman di HP potret dan landscape, iPad, Chromebook, dan desktop. Tidak boleh ada geser horizontal. Menu utama: grid 6 kolom (desktop/Chromebook), hub di samping grid (tablet landscape), 4 kolom x 5 baris (potret). Pada layar pendek (tinggi <= 480px) kecilkan dock Kalkulator/Papan Tulis agar tidak menutupi konten, dan beri grid kartu minmax(0,1fr). Tab panjang boleh digeser menyamping. Gunakan safe-area untuk notch. Uji di 390x844, 360x640, 667x375, 740x360, 768x1024, 834x1194, 1024x768, 1280x720, 1366x768, 1920x1080."

## 23. Prompt: Menu v2 dan ikon
"Sederhanakan kartu menu: pelat ikon besar + judul, hilangkan deskripsi kecil, semua 19 fitur muat tanpa Fitur Lomba mengecil, ikon dibuat lebih cantik bergaya pixel-art."
