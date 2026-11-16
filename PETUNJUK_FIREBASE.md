# Menyambungkan Game ke Firebase (papan peringkat bersama)

Game memakai **Firebase Realtime Database** lewat REST. Tidak perlu menginstal apa pun.
Yang Anda butuhkan: akun Google (gratis, paket Spark sudah cukup untuk satu sekolah).

## 1. Buat project
1. Buka https://console.firebase.google.com lalu **Tambahkan project** (Add project).
2. Beri nama, mis. `pythagoras-kelas8`. Google Analytics boleh dimatikan.

## 2. Buat Realtime Database
1. Menu kiri **Build > Realtime Database > Create Database**.
2. Pilih lokasi terdekat (mis. `asia-southeast1` Singapura).
3. Pilih **Start in locked mode** (aturan dipasang di langkah 3).
4. Salin alamat di bagian atas halaman Data, bentuknya
   `https://NAMA-PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app`

## 3. Pasang aturan akses
Tab **Rules**, hapus isinya, tempel seluruh isi file `database.rules.json`, klik **Publish**.
Aturan ini hanya mengizinkan data di `pythagoras/rooms/KODE/players/...`, memeriksa bentuk dan batas nilai
(nama maksimal 40 huruf, skor 0 sampai 100), dan menolak data lain.
Field yang disimpan per siswa: name, kelas, sekolah, avatar (pilihan karakter), xp, level, stars, coins, final, pos,
online, scene, loc {w,x,y,f,a} (posisi di dunia jelajah), qz {i,n,ok} (progres kuis), updated.

### Server bersama (kuis + dunia jelajah)
Semua siswa dengan kode ruang yang sama berada di satu server. Kode ruang diisi saat pendaftaran dan diingat di perangkat.
Bila `defaultRoom` di `firebase-config.js` diisi, itu menjadi ruang awal. Game memakai SDK Firebase (onValue untuk status koneksi,
onChildAdded/onChildChanged/onChildRemoved untuk pemain lain). Jika SDK gagal dimuat, game beralih ke polling REST tiap 2 detik.
Nama siswa tampil di atas karakternya di dunia jelajah. Jalur Belajar hanya menyimpan data di perangkat (tidak dikirim ke Firebase).

## 4. Tempel alamat ke game
Buka `js/firebase-config.js`, isi:
```js
window.PP_FIREBASE = {
  databaseURL: 'https://NAMA-PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app',
  root: 'pythagoras'
};
```

## 5. Pasang game di internet
Siswa harus membuka game lewat alamat web, bukan file di komputer. Pilihan gratis:
- **Firebase Hosting** (satu project yang sama): `npm i -g firebase-tools`, `firebase login`, `firebase init hosting`
  (folder publik = folder game), lalu `firebase deploy`.
- Netlify Drop (https://app.netlify.com/drop): seret folder `game/`.
- GitHub Pages.

## 6. Dipakai di kelas
1. Guru membuka game, menu **Profil**, mengisi nama, lalu menekan **Buat kode** (mis. `KQ7M42`) dan **Simpan Profil**.
2. Guru membagikan kode itu, atau tautan `https://ALAMAT-GAME/?room=KQ7M42` (tombol **Salin** di Papan Peringkat).
3. Siswa mengisi nama dan kode ruangan di Profil. Skor terkirim otomatis setiap kuis selesai.
4. Papan Peringkat (tombol **Peringkat** di Menu Utama atau setelah kuis) memperbarui diri tiap 6 detik.

Urutan peringkat: nilai kuis tertinggi, lalu nilai akhir, lalu siapa yang lebih dulu.
Tiap kelas memakai kode berbeda supaya papannya terpisah.

## Melihat atau menghapus data
Console Firebase > Realtime Database > Data > `pythagoras/rooms/KODE`. Hapus satu ruangan dengan menghapus simpulnya.

## Batasan yang perlu diketahui
- Tanpa login, siapa pun yang tahu kode ruangan dapat membaca papannya, dan pemain yang menguasai alat pengembang browser
  dapat menulis skor palsu atas namanya sendiri. Cukup untuk kelas. Untuk ujian bernilai tinggi, tambahkan
  Firebase Authentication (anonim) lalu ubah aturan memakai `auth.uid`.
- Kode ruangan dibuat acak 6 karakter supaya sulit ditebak. Jangan memakai kode yang mudah seperti `KELAS8`.
- Paket gratis Spark: 1 GB data dan 10 GB unduhan per bulan, jauh di atas kebutuhan satu sekolah.

## Fitur Lomba: data baru di ruangan
Salin ulang isi `database.rules.json` ke Console Firebase > Realtime Database > Aturan, lalu **Publikasikan**.
Jalur baru di bawah `pythagoras/rooms/KODE/`:
- `absen/roster/{kelas}/{id}` nama siswa (n) · `absen/rec/{tanggal}/{kelas}/{id}` = H/I/S/A
- `rapor/{idPemain}` nilai semua kategori (untuk Rekap Kelas)
- `eks3d/links/{id}` tautan 3D Nyata · `qr/{id}` gambar QR (JPEG terkompres, teks base64 ≤150 ribu karakter)
- `custom/{id}` soal buatan guru/siswa · `outfit/{idPemain}` kostum · `meta/pin` hash PIN guru

Penting: **PIN guru dicek di sisi aplikasi saja.** Aturan di atas tidak bisa membedakan guru dari siswa tanpa
Firebase Authentication. Untuk penguncian sungguhan, aktifkan Authentication (anonim/email) dan ubah `.write`
pada `absen`, `meta`, `custom` agar memakai `auth.uid` guru.
Tanpa Firebase (databaseURL kosong), semua fitur tetap jalan, tetapi data hanya tersimpan di perangkat itu.

### Uji manual singkat
1. Menu > Fitur Lomba > Absen: buat PIN guru, tambah nama siswa kelas 8A, buka dari HP lain dengan kode ruangan sama: nama terbaca, tombol edit tidak ada.
2. Rekap Kelas: unduh Excel/Word, atau Cetak/PDF.
3. Eksplorasi: pilih 3D Nyata, simpan tautan, tekan Jalankan; unggah beberapa gambar QR.
4. Jelajah: dunia Nusantara terbuka setelah dunia Kota selesai.

## Video Menu Utama, Bank Soal, dan Persiapan Jelajah
Jalur data baru: `video/active`, `video/hist/{versi}` (video), `bank/{id}` dan `bankb/{batch}` (Bank Soal).
Salin ulang `database.rules.json`. Tanpa Firebase, fitur tetap jalan dengan data lokal di perangkat itu.

### Video: penyimpanan & kompresi
- Bawaan: `assets/video/panduan_planning.mp4` (720p, ±6,7 MB, versi 0) sudah ikut di paket; siswa tidak perlu akun Google/Drive.
- Ganti video (guru): (a) tab **Tautan**: tempel URL https langsung ke .mp4/.webm (GitHub Pages, Netlify, Firebase Storage, dll.), atau
  (b) tab **Unggah berkas** — butuh Firebase Storage: isi `storageBucket` di `js/firebase-config.js` dan pasang `storage.rules`.
  Batas 100 MB, diunggah sekali jalan dengan bilah progres (potongan/chunk tidak diperlukan pada ukuran ini).
- Metadata (URL, nama, ukuran, versi, pengunggah, waktu) disimpan di Realtime Database, bukan localStorage; `?v=versi` dipakai agar cache segar.
  Riwayat versi + tombol "Kembalikan ke bawaan/versi sebelumnya" ada di tab Riwayat.
- Kompres ke ±720p: `ffmpeg -i asli.mp4 -vf scale=1280:720 -c:v libx264 -preset veryfast -crf 29 -c:a aac -b:a 64k -movflags +faststart video_720p.mp4`

### Impor soal
Menu > Fitur Lomba > Buat Soal > tab *Soal Kelas* (mode guru): Impor PDF / Word / Excel / Tempel Teks / Unduh Template.
Excel (.xlsx), CSV, Word (.docx) dibaca langsung di peramban tanpa pustaka luar. PDF memakai pdf.js dari CDN (butuh internet),
PDF scan diberi peringatan dan bisa dicoba OCR (Tesseract.js dari CDN, lambat).
