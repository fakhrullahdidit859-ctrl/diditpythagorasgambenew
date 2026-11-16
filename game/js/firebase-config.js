/* =========================================================
   KONFIGURASI FIREBASE — isi SEKALI oleh guru / pengembang
   ---------------------------------------------------------
   Game memakai Firebase Realtime Database lewat REST (tanpa SDK,
   tanpa build). Yang dibutuhkan hanya alamat database.

   Cara mengisi: lihat PETUNJUK_FIREBASE.md (5 langkah, ±5 menit).

   databaseURL : alamat Realtime Database, contoh
                 'https://pythagoras-kelas8-default-rtdb.asia-southeast1.firebasedatabase.app'
                 Biarkan '' bila belum ada: game tetap bisa dimainkan
                 tanpa fitur online.
   root        : nama folder induk di database (boleh dibiarkan).
   ========================================================= */
window.PP_FIREBASE = {
  databaseURL: '',
  storageBucket: '',        // mis. 'NAMA-PROJECT.appspot.com' — untuk unggah video guru (opsional)
  root: 'pythagoras',
  defaultRoom: 'UMUM'      // server umum bila siswa tidak mengisi kode ruangan
};
