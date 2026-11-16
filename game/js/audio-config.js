/* =========================================================
   PETUALANGAN PYTHAGORAS — KONFIGURASI AUDIO TERPUSAT
   ---------------------------------------------------------
   Semua audio didaftarkan di sini. Cara menambah / mengganti audio:
   1. Letakkan file di folder assets/audio/ (sfx/ atau bgm/).
   2. Isi `file` pada trek yang sesuai (atau tambah trek baru).
   3. Sambungkan ke peristiwa pada bagian `events` (efek) atau
      `sceneMusic` (musik latar per halaman).

   Struktur folder:
     assets/audio/sfx/01_klik_tombol.wav          ... 08_kemenangan_akhir.wav
     assets/audio/bgm/09_musik_latar_eksplorasi_loop.wav
     assets/audio/bgm/bgm_*.mp3                   (musik latar asli guru)
   ========================================================= */
window.PP_AUDIO_CONFIG = {
  basePath: 'assets/audio/',

  // Pengali volume per kategori (dikalikan dengan slider pengguna)
  categories: {
    bgm:       { channel: 'music',     gain: 1.0 },
    character: { channel: 'narration', gain: 1.0 },
    narration: { channel: 'narration', gain: 1.0 },
    sfx:       { channel: 'sfx',       gain: 1.0 }
  },

  tracks: {
    /* ---------- MUSIK LATAR ---------- */
    bgm_main_theme: { file: 'bgm/bgm_main_theme.mp3', category: 'bgm', loop: true, volume: 0.70, available: true,
                      use: 'Halaman pembuka, profil, petunjuk, dan FINISH' },
    bgm_adventure:  { file: 'bgm/bgm_adventure.mp3',  category: 'bgm', loop: true, volume: 0.70, available: true,
                      use: 'Peta petualangan dan pos' },
    bgm_learning:   { file: 'bgm/bgm_learning.mp3',   category: 'bgm', loop: true, volume: 0.55, available: true,
                      use: 'Menu utama, tujuan, materi, video, refleksi, penilaian' },
    bgm_game:       { file: 'bgm/bgm_game.mp3',       category: 'bgm', loop: true, volume: 0.55, available: true,
                      use: 'Game A, Game B, dan kuis (volume lebih rendah)' },
    bgm_race:       { file: 'bgm/bgm_race.mp3',       category: 'bgm', loop: true, volume: 0.55, available: true,
                      use: 'Game C (Misi Jembatan) dan Game D (Tantangan Akhir)' },
    /* 09 — musik latar eksplorasi (loop ±12,9 dtk), dipakai di halaman Eksplorasi */
    bgm_explore:    { file: 'bgm/09_musik_latar_eksplorasi_loop.wav', category: 'bgm', loop: true, volume: 0.50, available: true,
                      use: 'Eksplorasi Pythagoras' },

    /* ---------- 8 EFEK SUARA (WAV dari guru) ---------- */
    sfx_klik:       { file: 'sfx/01_klik_tombol.wav',          category: 'sfx', volume: 0.70, available: true, synth: 'click',   use: 'Tombol ditekan' },
    sfx_menu:       { file: 'sfx/02_perpindahan_menu.wav',     category: 'sfx', volume: 0.75, available: true, synth: 'page',    use: 'Pindah halaman / menu' },
    sfx_benar:      { file: 'sfx/03_jawaban_benar.wav',        category: 'sfx', volume: 0.90, available: true, synth: 'correct', use: 'Jawaban benar',  group: 'jawab' },
    sfx_salah:      { file: 'sfx/04_jawaban_salah.wav',        category: 'sfx', volume: 0.85, available: true, synth: 'wrong',   use: 'Jawaban salah',  group: 'jawab' },
    sfx_misi:       { file: 'sfx/05_misi_selesai.wav',         category: 'sfx', volume: 0.95, available: true, synth: 'mission', use: 'Misi selesai',   duck: 0.35 },
    sfx_bintang:    { file: 'sfx/06_bintang_hadiah.wav',       category: 'sfx', volume: 0.90, available: true, synth: 'star',    use: 'Bintang / hadiah' },
    sfx_lokasi:     { file: 'sfx/07_lokasi_baru_terbuka.wav',  category: 'sfx', volume: 0.95, available: true, synth: 'start',   use: 'Lokasi baru terbuka', duck: 0.35 },
    sfx_menang:     { file: 'sfx/08_kemenangan_akhir.wav',     category: 'sfx', volume: 1.00, available: true, synth: 'victory', use: 'Kemenangan akhir', duck: 0.2 },

    /* ---------- SUARA KARAKTER & NARASI (opsional, belum diunggah) ---------- */
    character_greeting: { file: 'character/character_greeting.mp3', category: 'character', volume: 1, available: false, use: 'Sapaan karakter' },
    character_mission:  { file: 'character/character_mission.mp3',  category: 'character', volume: 1, available: false, use: 'Petunjuk saat memasuki misi' },
    character_praise:   { file: 'character/character_praise.mp3',   category: 'character', volume: 1, available: false, use: 'Pujian saat misi selesai' },
    character_retry:    { file: 'character/character_retry.mp3',    category: 'character', volume: 1, available: false, use: 'Semangat saat jawaban salah' },
    narration_materi_1: { file: 'narration/narration_materi_1.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 1' },
    narration_materi_2: { file: 'narration/narration_materi_2.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 2' },
    narration_materi_3: { file: 'narration/narration_materi_3.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 3' },
    narration_materi_3b:{ file: 'narration/narration_materi_3b.mp3',category: 'narration', volume: 1, available: false, use: 'Narasi Pembuktian' },
    narration_materi_4: { file: 'narration/narration_materi_4.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 4' },
    narration_materi_5: { file: 'narration/narration_materi_5.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 5' },
    narration_materi_6: { file: 'narration/narration_materi_6.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 6' }
  },

  /* Musik latar per halaman. Perpindahan antar-halaman memakai crossfade
     dan hanya satu musik yang dimainkan pada satu waktu. */
  sceneMusic: {
    splash: 'bgm_main_theme', petunjuk: 'bgm_main_theme', profil: 'bgm_main_theme', finish: 'bgm_main_theme',
    menu: 'bgm_learning', tujuan: 'bgm_learning', materi: 'bgm_learning', video: 'bgm_learning',
    refleksi: 'bgm_learning', nilai: 'bgm_learning',
    eksplorasi: 'bgm_explore', jelajah: 'bgm_explore', papan: 'bgm_learning',
    peta: 'bgm_adventure', pos: 'bgm_adventure',
    games: 'bgm_game', 'game-A': 'bgm_game', 'game-B': 'bgm_game',
    'game-C': 'bgm_race', 'game-D': 'bgm_race',
    kuis: 'bgm_game'
  },
  // Pengali volume musik pada halaman tertentu (kuis dibuat lebih pelan)
  sceneGain: { kuis: 0.6 },

  /* Peristiwa (nama yang dipakai di kode game) -> trek efek suara.
     Beberapa nama lama dipetakan ke efek yang paling sesuai. */
  events: {
    click: 'sfx_klik', tick: 'sfx_klik', quizSelect: 'sfx_klik',
    page: 'sfx_menu', start: 'sfx_menu', end: 'sfx_menu', selectPos: 'sfx_menu',
    correct: 'sfx_benar', wrong: 'sfx_salah',
    mission: 'sfx_misi', star: 'sfx_bintang', point: 'sfx_bintang', point_now: 'sfx_bintang',
    unlock: 'sfx_lokasi', victory: 'sfx_menang'
  },

  /* Efek "semantik" (jawaban, hadiah, misi...) menahan klik biasa yang
     datang bersamaan, supaya satu ketukan tidak menghasilkan dua suara. */
  generic: ['click', 'tick', 'quizSelect'],
  // Pengali volume khusus peristiwa tertentu (mis. 'tick' lebih pelan dari klik)
  eventGain: { tick: 0.6, quizSelect: 0.8, point: 0.8 },
  // Jeda minimum antar pemutaran trek yang sama (ms) -> mencegah suara berulang
  minGap: { sfx_klik: 70, sfx_menu: 160, sfx_benar: 250, sfx_salah: 250, sfx_bintang: 120 }
};
