/* Jalur Belajar (JB) – tambahan di Eksplorasi. Semua kode berada di namespace window.JB. */
(function () {
  'use strict';
  const JB_ENABLED = true;
  const JB = window.JB = { enabled: false, version: '1.0' };
  try {
    if (!JB_ENABLED || !window.PP) return;
    const PP = window.PP, S = window.PPStore || PP.PPStore;
    const A = 'assets/jalur_belajar/';
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fmt = n => String(Math.round(n * 100) / 100).replace('.', ',');
    const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

    /* ---------- penyimpanan lokal (jb_) ---------- */
    const store = {
      get(k, d) { try { const v = localStorage.getItem('jb_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
      set(k, v) { try { localStorage.setItem('jb_' + k, JSON.stringify(v)); } catch (e) { } }
    };
    const progress = () => store.get('progress', {});
    const logAdd = e => { const l = store.get('log', []); l.push(Object.assign({ t: Date.now() }, e)); store.set('log', l.slice(-300)); };

    /* ---------- data materi ---------- */
    const NPC = { guru: ['npc_bu_guru', 'Bu Guru'], arsitek: ['npc_pak_arsitek', 'Pak Arsitek'], pemandu: ['npc_pak_pemandu', 'Pak Pemandu'] };
    const RUMUS = {
      miring: { t: 'Mengenali sisi miring', f: 'Sisi miring (c) selalu berhadapan dengan sudut siku-siku dan paling panjang.', n: 'Dua sisi lainnya disebut sisi tegak (a dan b).' },
      hipo: { t: 'Mencari sisi miring', f: 'c² = a² + b²   →   c = √(a² + b²)', n: 'Kuadratkan kedua sisi tegak, jumlahkan, lalu akar.' },
      kaki: { t: 'Mencari sisi tegak', f: 'a² = c² − b²   →   a = √(c² − b²)', n: 'Sisi miring dikuadratkan dulu, lalu dikurangi kuadrat sisi tegak yang diketahui.' },
      bukti: { t: 'Bukti Pythagoras', f: 'a² + b² = c²', n: 'Luas persegi pada kedua sisi tegak sama dengan luas persegi pada sisi miring.' }
    };
    const CONTOH = {
      miring: [{ a: 6, b: 8, c: 10, u: 'c', teks: 'Segitiga siku-siku punya sisi 6, 8, dan 10. Sisi miringnya yang paling panjang, yaitu 10.' }],
      hipo: [{ a: 5, b: 12, c: 13, u: 'c', teks: 'Sisi tegak 5 cm dan 12 cm. Berapa sisi miringnya?' }, { a: 8, b: 15, c: 17, u: 'c', teks: 'Sisi tegak 8 cm dan 15 cm. Berapa sisi miringnya?' }],
      kaki: [{ a: 8, b: 15, c: 17, u: 'b', teks: 'Sisi miring 17 cm dan satu sisi tegak 8 cm. Berapa sisi tegak yang lain?' }, { a: 9, b: 12, c: 15, u: 'b', teks: 'Sisi miring 15 cm dan satu sisi tegak 9 cm. Berapa sisi tegak yang lain?' }],
      bukti: [{ a: 3, b: 4, c: 5, u: 'c', teks: '3² + 4² = 9 + 16 = 25 = 5².' }]
    };
    const T = (a, b, c, u, o) => Object.assign({ a, b, c, u }, o || {});
    const STASIUN = [
      T(4, 3, 5, 'c', { nama: 'Tangga di dinding rumah', prop: 'prop_rumah_tangga', satuan: 'm', teks: 'Dinding setinggi 4 m. Kaki tangga berjarak 3 m dari dinding. Berapa panjang tangga?' }),
      T(24, 18, 30, 'c', { nama: 'Buku cetak', prop: 'prop_buku_cetak', satuan: 'cm', teks: 'Buku berukuran 24 cm × 18 cm. Berapa panjang diagonal sampulnya?' }),
      T(32, 24, 40, 'c', { nama: 'Layar televisi', prop: 'prop_televisi', satuan: 'inci', teks: 'Layar TV lebarnya 32 inci dan tingginya 24 inci. Ukuran layar adalah panjang diagonalnya. Berapa inci?' }),
      T(12, 5, 13, 'a', { nama: 'Tangga besar', prop: 'prop_tangga_dinding', satuan: 'm', teks: 'Tangga 13 m bersandar di dinding, kakinya 5 m dari dinding. Berapa tinggi ujung tangga dari tanah?' }),
      T(0.9, 1.2, 1.5, 'c', { nama: 'Ramp kursi roda', prop: 'prop_ramp_kursi_roda', satuan: 'm', teks: 'Ramp naik 0,9 m dengan jarak datar 1,2 m. Berapa panjang lintasan miringnya?' }),
      T(1.5, 2, 2.5, 'b', { nama: 'Gerobak naik ke truk', prop: 'prop_gerobak_truk', satuan: 'm', teks: 'Papan sepanjang 2,5 m disandarkan ke bak truk setinggi 1,5 m. Berapa jarak datar ujung papan dari truk?' }),
      T(24, 7, 25, 'c', { nama: 'Layang-layang', prop: 'prop_layang_layang', satuan: 'm', teks: 'Layang-layang terbang setinggi 24 m dan berada 7 m dari anak yang memegang benang. Berapa panjang benang yang terulur?' }),
      T(6, 8, 10, 'b', { nama: 'Atap rumah', prop: 'prop_atap_rumah', satuan: 'm', teks: 'Atap pelana: tinggi 6 m, panjang kasau 10 m. Berapa setengah lebar rumah?' }),
      T(40, 30, 50, 'c', { nama: 'Lapangan bola', prop: 'prop_lapangan_bola', satuan: 'm', teks: 'Lapangan berukuran 40 m × 30 m. Berapa panjang jalan lintas diagonalnya?' }),
      T(8, 15, 17, 'b', { nama: 'Tenda pramuka', prop: 'prop_tenda_pramuka', satuan: 'm', teks: 'Tali tambat 17 m diikat ke puncak tiang tenda setinggi 8 m. Berapa jarak ujung tali di tanah dari tiang?' }),
      T(15, 8, 17, 'c', { nama: 'Tiang bendera', prop: 'tiang', satuan: 'm', teks: 'Tiang bendera setinggi 15 m. Tali ditarik ke tanah pada jarak 8 m dari tiang. Berapa panjang tali?' }),
      T(12, 9, 15, 'c', { nama: 'Gedung Melayu Riau', prop: 'landmark_gedung_melayu_riau', satuan: 'm', ilus: true, teks: 'Atap gedung: tinggi 12 m dan setengah lebar 9 m. Berapa panjang sisi miring atap?' })
    ];

    /* ---------- pembantu hitung & soal ---------- */
    const val = (q, k) => q[k];
    function solSteps(q) {
      const { a, b, c, u } = q, f = fmt;
      if (u === 'c') return ['Yang dicari sisi miring (c).', `c² = a² + b² = ${f(a)}² + ${f(b)}² = ${f(a * a)} + ${f(b * b)} = ${f(a * a + b * b)}`, `c = √${f(a * a + b * b)} = ${f(c)}`];
      const k = u === 'a' ? b : a;
      return ['Yang dicari sisi tegak, jadi sisi miring dikurangi.', `${u}² = c² − ${u === 'a' ? 'b' : 'a'}² = ${f(c)}² − ${f(k)}² = ${f(c * c)} − ${f(k * k)} = ${f(c * c - k * k)}`, `${u} = √${f(c * c - k * k)} = ${f(q[u])}`];
    }
    function mkNum(a, b, c, u, o) {
      const q = Object.assign({ tipe: 'isian', a, b, c, u, ans: q0(u, a, b, c), tol: 0.01, rumus_id: u === 'c' ? 'hipo' : 'kaki', unit: '' }, o);
      q.h1 = q.h1 || (u === 'c' ? 'Sisi miring (c) adalah sisi terpanjang. Dua sisi lainnya adalah sisi tegak.' : 'Sisi miring (c) sudah diketahui. Yang dicari adalah salah satu sisi tegak.');
      q.h2 = q.h2 || (u === 'c' ? 'Gunakan c² = a² + b².' : `Gunakan ${u}² = c² − ${u === 'a' ? 'b' : 'a'}².`);
      q.sol = q.sol || solSteps(q); return q;
    }
    function q0(u, a, b, c) { return u === 'a' ? a : u === 'b' ? b : c; }
    const choice = (teks, opsi, ans, o) => Object.assign({ tipe: 'pilihan', teks, opsi, ans, h1: 'Ingat: sisi miring berada di depan sudut siku-siku.', h2: 'Sisi miring juga sisi yang paling panjang.', rumus_id: 'miring', sol: ['Cari sudut siku-siku (kotak kecil).', 'Sisi di depannya adalah sisi miring.'] }, o);

    function buildPos() {
      return [
        { id: 1, judul: 'Sisi Segitiga Siku-siku', npc: 'guru', rumus: 'miring',
          bicara: ['Selamat datang di Pos 1! Aku Bu Guru.', 'Sebelum menghitung, kita kenali dulu nama sisi-sisi segitiga siku-siku.'],
          materi: ['Segitiga siku-siku punya satu sudut 90°.', 'Sisi di depan sudut 90° disebut <b>sisi miring</b> (c). Ia selalu yang terpanjang.', 'Dua sisi lainnya disebut <b>sisi tegak</b> (a dan b).'],
          contoh: { a: 6, b: 8, c: 10, u: 'c', fig: { la: 'a', lb: 'b', lc: 'c (miring)' }, teks: 'Pada segitiga ini sudut siku-siku ada di kiri bawah. Sisi di depannya adalah sisi miring.' },
          soal: [
            choice('Pada segitiga ini, sisi manakah yang merupakan sisi miring?', ['p', 'q', 'r'], 'r', { a: 6, b: 8, c: 10, fig: { la: 'p', lb: 'q', lc: 'r' } }),
            choice('Sekarang segitiganya diputar. Sisi manakah yang miring?', ['x', 'y', 'z'], 'x', { a: 5, b: 12, c: 13, fig: { la: 'y', lb: 'z', lc: 'x', rot: 1 } }),
            choice('Sebuah segitiga siku-siku bersisi 3, 4, dan 5. Sisi miringnya yang mana?', ['3', '4', '5'], '5', { h1: 'Sisi miring adalah sisi yang paling panjang.', h2: 'Bandingkan ketiga angka. Mana yang terbesar?' })
          ],
          mudah: choice('Segitiga bersisi 6, 8, dan 10. Mana sisi miringnya?', ['6', '8', '10'], '10', { h1: 'Sisi miring paling panjang.' }) },
        { id: 2, judul: 'Mencari Sisi Miring', npc: 'guru', rumus: 'hipo',
          bicara: ['Selamat datang di Pos 2!', 'Sekarang kita pakai rumus Pythagoras untuk mencari sisi miring.'],
          materi: ['Teorema Pythagoras: <b>c² = a² + b²</b>.', 'Langkah: kuadratkan a dan b, jumlahkan, lalu tarik akar.', 'Contoh cepat: 3² + 4² = 9 + 16 = 25, jadi c = 5.'],
          contoh: { a: 5, b: 12, c: 13, u: 'c', teks: '5² + 12² = 25 + 144 = 169. Maka c = √169 = 13.' },
          soal: [mkNum(6, 8, 10, 'c', { teks: 'Sisi tegak 6 cm dan 8 cm. Berapa panjang sisi miringnya?', unit: 'cm' }), mkNum(9, 12, 15, 'c', { teks: 'Sisi tegak 9 cm dan 12 cm. Berapa panjang sisi miringnya?', unit: 'cm' }), mkNum(7, 24, 25, 'c', { teks: 'Sisi tegak 7 cm dan 24 cm. Berapa panjang sisi miringnya?', unit: 'cm' })],
          mudah: mkNum(3, 4, 5, 'c', { teks: 'Sisi tegak 3 cm dan 4 cm. Berapa panjang sisi miringnya?', unit: 'cm' }) },
        { id: 3, judul: 'Mencari Sisi Tegak', npc: 'guru', rumus: 'kaki',
          bicara: ['Selamat datang di Pos 3!', 'Kali ini sisi miring sudah diketahui dan kita cari sisi tegaknya.'],
          materi: ['Dari c² = a² + b² kita dapat <b>a² = c² − b²</b>.', 'Sisi miring dikuadratkan dulu, lalu dikurangi kuadrat sisi tegak yang diketahui.', 'Hasil akhirnya diakarkan.'],
          contoh: { a: 8, b: 15, c: 17, u: 'b', teks: 'c = 17 dan a = 8. b² = 17² − 8² = 289 − 64 = 225, jadi b = 15.' },
          soal: [mkNum(5, 12, 13, 'b', { teks: 'Sisi miring 13 cm dan satu sisi tegak 5 cm. Berapa sisi tegak yang lain?', unit: 'cm' }), mkNum(6, 8, 10, 'b', { teks: 'Sisi miring 10 cm dan satu sisi tegak 6 cm. Berapa sisi tegak yang lain?', unit: 'cm' }), mkNum(7, 24, 25, 'a', { teks: 'Sisi miring 25 cm dan satu sisi tegak 24 cm. Berapa sisi tegak yang lain?', unit: 'cm' })],
          mudah: mkNum(3, 4, 5, 'b', { teks: 'Sisi miring 5 cm dan satu sisi tegak 3 cm. Berapa sisi tegak yang lain?', unit: 'cm' }) },
        { id: 4, judul: 'Bangun Datar & Kehidupan Nyata', npc: 'arsitek', rumus: 'hipo', stasiun: true,
          bicara: ['Halo, aku Pak Arsitek. Selamat datang di Pos 4!', 'Di sini ada 12 stasiun. Di tiap stasiun, ada benda nyata yang bentuknya memuat segitiga siku-siku.'],
          materi: ['Cari segitiga siku-siku tersembunyi pada benda itu.', 'Tentukan mana sisi miring dan mana sisi tegak.', 'Lalu pakai c² = a² + b² atau a² = c² − b².'],
          contoh: { a: 4, b: 3, c: 5, u: 'c', teks: 'Tangga 4 m tinggi dan 3 m jarak kaki: 4² + 3² = 25, jadi tangga 5 m.' },
          soal: STASIUN.map((s, i) => mkNum(s.a, s.b, s.c, s.u, { teks: s.teks, unit: s.satuan, st: s, nomor: i + 1, rumus_id: s.u === 'c' ? 'hipo' : 'kaki' })),
          mudah: mkNum(3, 4, 5, 'c', { teks: 'Layar kecil lebar 3 inci dan tinggi 4 inci. Berapa inci diagonalnya?', unit: 'inci' }) },
        { id: 5, judul: 'Soal Cerita', npc: 'pemandu', rumus: 'hipo',
          bicara: ['Aku Pak Pemandu. Selamat datang di Pos 5!', 'Soal cerita: gambar dulu segitiganya, baru hitung.'],
          materi: ['Baca cerita pelan-pelan. Gambar sketsa segitiga siku-siku.', 'Beri tanda sisi miring dan sisi tegak.', 'Boleh menjawab dengan koma atau titik, misalnya 1,5 atau 1.5.'],
          contoh: { a: 9, b: 12, c: 15, u: 'c', teks: 'Berjalan 9 m ke utara lalu 12 m ke timur. Jarak lurus ke titik awal: √(81 + 144) = 15 m.' },
          soal: [
            mkNum(12, 5, 13, 'c', { teks: 'Sebuah kapal berlayar 12 km ke utara lalu 5 km ke timur. Berapa jarak kapal dari titik awal?', unit: 'km' }),
            mkNum(2, 1.5, 2.5, 'a', { teks: 'Tangga 2,5 m bersandar di dinding. Kakinya 1,5 m dari dinding. Berapa tinggi ujung tangga? (boleh pakai koma)', unit: 'm' }),
            choice('Tali 10 m ditarik dari puncak tiang setinggi 8 m ke tanah. Berapa jarak ujung tali dari dasar tiang?', ['4 m', '6 m', '9 m'], '6 m', { a: 8, b: 6, c: 10, u: 'b', rumus_id: 'kaki', h1: 'Tiang, tanah, dan tali membentuk segitiga siku-siku. Tali adalah sisi miringnya.', h2: 'Gunakan b² = c² − a² = 10² − 8².', sol: ['Tali = sisi miring (10 m), tiang = sisi tegak (8 m).', 'b² = 10² − 8² = 100 − 64 = 36', 'b = √36 = 6 m'] }),
            mkNum(0.5, 1.2, 1.3, 'b', { teks: 'Ramp sepanjang 1,3 m naik setinggi 0,5 m. Berapa jarak datar ramp?', unit: 'm' })
          ],
          mudah: mkNum(3, 4, 5, 'c', { teks: 'Anak berjalan 3 km ke barat lalu 4 km ke utara. Berapa jarak lurus dari titik awal?', unit: 'km' }) },
        { id: 6, judul: 'Misi Pembuktian', npc: 'pemandu', rumus: 'bukti', misi: true,
          bicara: ['Ini Pos terakhir. Saatnya membuktikan Teorema Pythagoras sendiri!', 'Susun potongan di papan, lalu jawab dua pertanyaan renungan.'],
          materi: ['Ada bingkai besar dan 4 segitiga siku-siku yang sama.', 'Cara 1: 4 segitiga + persegi miring (c²).', 'Cara 2: 4 segitiga + persegi a² + persegi b². Kedua bingkai sama besar, jadi a² + b² = c².'],
          contoh: { a: 3, b: 4, c: 5, u: 'c', teks: '3² + 4² = 9 + 16 = 25 = 5².' },
          soal: [
            { tipe: 'misi', teks: 'Misi: susun bingkai dengan potongan-potongannya. Lanjut aktif setelah bingkai penuh.', rumus_id: 'bukti', sol: [] },
            choice('Apa yang dibuktikan oleh kedua susunan bingkai tadi?', ['a² + b² = c²', 'a + b = c', 'a² = b² + c²'], 'a² + b² = c²', { rumus_id: 'bukti', h1: 'Kedua bingkai luasnya sama.', h2: 'Luas persegi pada sisi tegak dijumlahkan.' }),
            choice('Teorema Pythagoras hanya berlaku untuk segitiga…', ['sembarang', 'siku-siku', 'sama sisi'], 'siku-siku', { rumus_id: 'bukti', h1: 'Perhatikan segitiga pada bukti tadi.', h2: 'Ada satu sudut 90°.' })
          ],
          mudah: null }
      ];
    }
    let POS = buildPos();

    /* ---------- gambar segitiga (SVG) ---------- */
    function tri(o) {
      const a = o.a, b = o.b, W = 200, H = 150, sc = Math.min(130 / a, 90 / b), A_ = a * sc, B_ = b * sc, rot = o.rot || 0;
      const sx = rot === 1 ? -1 : 1, x0 = sx > 0 ? (W - A_) / 2 : (W + A_) / 2, y0 = (H + B_) / 2;
      const R = [x0, y0], Hh = [x0 + sx * A_, y0], V = [x0, y0 - B_], ce = [(R[0] + Hh[0] + V[0]) / 3, (R[1] + Hh[1] + V[1]) / 3];
      const lab = (m, t, hl) => { let dx = m[0] - ce[0], dy = m[1] - ce[1]; const d = Math.hypot(dx, dy) || 1; const x = m[0] + dx / d * 13, y = m[1] + dy / d * 13 + 4; return `<text x="${x}" y="${y}" text-anchor="middle" class="jb-tl${hl ? ' q' : ''}">${esc(t)}</text>`; };
      const L = o.labels, s = 9, rx = R[0] + sx * s;
      return `<svg class="jb-tri" viewBox="0 0 ${W} ${H}" role="img" aria-label="segitiga siku-siku"><polygon points="${R} ${Hh} ${V}" class="jb-tp"/><path d="M${rx},${R[1]} V${R[1] - s} H${R[0]}" class="jb-ra"/>
        ${lab([(R[0] + Hh[0]) / 2, R[1]], L.a, L.a === '?')}${lab([R[0], (R[1] + V[1]) / 2], L.b, L.b === '?')}${lab([(Hh[0] + V[0]) / 2, (Hh[1] + V[1]) / 2], L.c, L.c === '?')}</svg>`;
    }
    const labelsOf = (q, hide) => { const u = hide ? q.u : null, un = q.unit ? ' ' + q.unit : ''; const f = (k) => k === u ? '?' : fmt(q[k]) + un; return { a: f('a'), b: f('b'), c: f('c') }; };
    function figHtml(q, solved) {
      if (q.fig) return tri({ a: q.a, b: q.b, labels: { a: q.fig.la, b: q.fig.lb, c: q.fig.lc }, rot: q.fig.rot });
      if (q.tipe === 'misi') return `<div class="jb-big">🧩</div>`;
      if (q.tipe === 'pilihan' && !q.a) return `<div class="jb-big">📐</div>`;
      const L0 = labelsOf(q, !solved), t = q.st ? tri({ a: q.b, b: q.a, labels: { a: L0.b, b: L0.a, c: L0.c } }) : tri({ a: q.a, b: q.b, labels: L0 });
      if (q.st) return `<div class="jb-st">${propHtml(q.st)}<div class="jb-st-t">${q.nomor}/12 · ${esc(q.st.nama)}</div>${t}${q.st.ilus ? '<div class="jb-ilus">Gambar terinspirasi, angka ilustrasi</div>' : ''}</div>`;
      return t;
    }
    function propHtml(s) {
      if (s.prop === 'tiang') return `<div class="jb-prop jb-sp" data-sp="prop_tiang_bendera" data-n="8" data-fps="6"></div>`;
      const pre = s.prop.indexOf('landmark') === 0 ? 'statis/' : 'statis/';
      return `<img class="jb-prop" src="${A}${pre}${s.prop}.png" alt="${esc(s.nama)}" draggable="false">`;
    }

    /* ---------- sprite (NPC & efek) ---------- */
    function sprite(el, file, n, fps, loop, onEnd) {
      if (!el) return; clearInterval(el.__t); let i = 0;
      el.style.backgroundImage = `url(${A}spritesheet/${file}.png)`; el.style.backgroundSize = `${n * 100}% 100%`;
      const set = () => { el.style.backgroundPosition = n > 1 ? `${i * 100 / (n - 1)}% 0` : '0 0'; }; set();
      el.__t = setInterval(() => { i++; if (i >= n) { if (loop) i = 0; else { clearInterval(el.__t); onEnd && onEnd(); return; } } set(); }, 1000 / fps);
    }
    function mountSprites(root) { $$('.jb-sp', root).forEach(e => sprite(e, e.dataset.sp, +e.dataset.n, +e.dataset.fps, true)); }

    /* ---------- animasi penjelasan ---------- */
    let exTok = 0;
    JB.explain = function (a, b, c, unknown, host, onNext) {
      const tok = ++exTok, u = unknown || 'c', f = fmt;
      const mx = Math.max(a, b, c), k = 1; void mx; void k;
      const x0 = -b, x1 = a + b, y0 = -(a + b), y1 = a, pad = Math.max(a, b) * 0.15, vw = x1 - x0 + 2 * pad, vh = y1 - y0 + 2 * pad;
      const P = ps => ps.map(p => p.join(',')).join(' ');
      const sqA = [[0, 0], [a, 0], [a, a], [0, a]], sqB = [[0, 0], [0, -b], [-b, -b], [-b, 0]], sqC = [[a, 0], [0, -b], [b, -a - b], [a + b, -a]];
      const fs = Math.max(a, b) * 0.28, txt = (x, y, t, cl) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs}" class="${cl || ''}">${esc(t)}</text>`;
      const sq = (v, k) => k === u ? '?' : f(v * v);
      const svg = `<svg class="jb-ex-svg" viewBox="${x0 - pad} ${y0 - pad} ${vw} ${vh}">
        <g class="ex-sq" style="opacity:0"><polygon points="${P(sqA)}" class="ex-a"/><polygon points="${P(sqB)}" class="ex-b"/><polygon points="${P(sqC)}" class="ex-c"/>
        ${txt(a / 2, a / 2 + fs / 3, 'a²=' + sq(a, 'a'), 'ex-t')}${txt(-b / 2, -b / 2 + fs / 3, 'b²=' + sq(b, 'b'), 'ex-t')}${txt((a + b) / 2 + b / 2 - a / 2 + (a - b) / 2 * 0, -(a + b) / 2 + fs / 3, 'c²=' + sq(c, 'c'), 'ex-t')}</g>
        <polygon points="0,0 ${a},0 0,${-b}" class="ex-tri" stroke-width="${fs / 10}"/>
        </svg>`;
      host.innerHTML = `<div class="jb-ex"><div class="jb-ex-fig">${svg}</div><div class="jb-ex-cap" aria-live="polite"></div><div class="jb-ex-eq"></div>
        <div class="jb-row"><button class="btn sm" data-ex="ulang">Ulang</button><button class="btn sm" data-ex="lewati">Lewati</button>${onNext ? '<button class="btn green sm" data-ex="lanjut">Lanjut</button>' : ''}</div></div>`;
      const cap = $('.jb-ex-cap', host), eq = $('.jb-ex-eq', host), sqs = $('.ex-sq', host);
      const ph = [
        () => { cap.textContent = `Fase 1. Ini segitiga siku-siku. Sisi miringnya ${u === 'c' ? 'yang dicari' : 'sudah diketahui'}.`; eq.innerHTML = ''; sqs.style.opacity = 0; },
        () => { cap.textContent = 'Fase 2. Pada tiap sisi kita buat persegi. Luas persegi = kuadrat sisinya.'; sqs.style.opacity = 1; },
        () => { cap.textContent = 'Fase 3. Luas dua persegi kecil dijumlahkan sama dengan luas persegi besar.'; eq.innerHTML = u === 'c' ? `a² + b² = c²<br>${f(a)}² + ${f(b)}² = c²` : `${u === 'a' ? 'a' : 'b'}² = c² − ${u === 'a' ? 'b' : 'a'}²<br>${u === 'a' ? 'a' : 'b'}² = ${f(c)}² − ${f(u === 'a' ? b : a)}²`; },
        () => { const r = q0(u, a, b, c); cap.textContent = `Fase 4. Hasilnya: ${u} = ${f(r)}.`; eq.innerHTML += u === 'c' ? `<br>${f(a * a)} + ${f(b * b)} = ${f(c * c)}<br><b>c = √${f(c * c)} = ${f(c)}</b>` : `<br>= ${f(u === 'a' ? a * a : b * b)}<br><b>${u} = √${f(u === 'a' ? a * a : b * b)} = ${f(r)}</b>`; }
      ];
      let i = 0, tm; const run = () => { if (tok !== exTok) return; ph[i](); i++; if (i < ph.length) tm = setTimeout(run, 1900); };
      const skip = () => { clearTimeout(tm); for (; i < ph.length; i++) ph[i](); };
      host.onclick = e => { const bt = e.target.closest('[data-ex]'); if (!bt) return; const k2 = bt.dataset.ex; if (k2 === 'ulang') { clearTimeout(tm); i = 0; exTok++; const t2 = exTok; run2(t2); } else if (k2 === 'lewati') { clearTimeout(tm); skipAll(); } else if (k2 === 'lanjut') { clearTimeout(tm); exTok++; onNext && onNext(); } };
      const run2 = t2 => { const go = () => { if (t2 !== exTok) return; ph[i](); i++; if (i < ph.length) tm = setTimeout(go, 1900); }; go(); };
      const skipAll = () => { i = 0; ph.forEach(p => p()); i = ph.length; };
      run(); return { skip };
    };

    /* ---------- mesin keadaan ---------- */
    const SEC = ['BICARA', 'MATERI', 'CONTOH', 'KUIS', 'REFERENSI', 'PETUNJUK', 'ANIMASI', 'SOLUSI', 'RINGKAS'];
    let root = null, st = null;
    const sec = n => $(`[data-st="${n}"]`, root);
    JB.go = function (state, opt) {
      if (!root || !st) return; st.prev = st.state; st.state = state;
      SEC.forEach(n => { const e = sec(n); if (e) e.hidden = n !== state; });
      const fn = RENDER[state]; if (fn && !(opt && opt.keep)) fn(opt || {});
      talk(state === 'BICARA' || state === 'MATERI' || state === 'CONTOH' || state === 'PETUNJUK' || state === 'SOLUSI');
    };
    function talk(on) {
      const n = $('.jb-npc', root); if (!n) return; const k = NPC[st.def.npc][0];
      sprite(n, k + (on ? '_bicara' : '_diam'), on ? 8 : 4, on ? 8 : 2, true);
      if (on) { clearTimeout(st.tt); st.tt = setTimeout(() => { if (root && root.isConnected) sprite(n, k + '_diam', 4, 2, true); }, 2600); }
    }
    const cur = () => st.qs[st.qi];
    const setFig = (h) => { const f = $('.jb-fig', root); f.innerHTML = h; mountSprites(f); };
    const say = h => `<div class="jb-say"><b>${NPC[st.def.npc][1]}:</b> ${h}</div>`;
    const btn = (id, label, cls) => `<button class="btn ${cls || 'green'}" data-a="${id}">${label}</button>`;
    function fx(kind) { const e = $('.jb-fx', root); if (!e) return; e.hidden = false; sprite(e, kind === 'benar' ? 'efek_benar' : 'efek_salah', 8, 12, false, () => { e.hidden = true; }); }

    const RENDER = {
      BICARA() { setFig(`<div class="jb-big">${['', '📐', '➕', '➖', '🏗️', '📖', '🧩'][st.def.id]}</div>`); sec('BICARA').innerHTML = `<h3>Pos ${st.def.id}: ${esc(st.def.judul)}</h3>${st.def.bicara.map(say).join('')}<div class="jb-act">${btn('materi', 'Lanjut')}</div>`; },
      MATERI() { const r = RUMUS[st.def.rumus]; setFig(`<div class="jb-formula">${esc(r.f)}</div>`); sec('MATERI').innerHTML = `<h3>Materi</h3><ul class="jb-ul">${st.def.materi.map(m => `<li>${m}</li>`).join('')}</ul><div class="jb-act">${btn('contoh', 'Lihat Contoh')}</div>`; },
      CONTOH() { const c = st.def.contoh; const q = Object.assign({ unit: '' }, c); setFig(c.fig ? tri({ a: c.a, b: c.b, labels: { a: c.fig.la, b: c.fig.lb, c: c.fig.lc } }) : tri({ a: c.a, b: c.b, labels: labelsOf(q, false) })); sec('CONTOH').innerHTML = `<h3>Contoh</h3>${say(esc(c.teks))}<div class="jb-act">${c.fig ? '' : btn('exContoh', 'Lihat Animasi', 'blue')}${btn('kuis', st.def.misi ? 'Mulai Misi' : 'Mulai Latihan')}</div>`; },
      KUIS() { renderQ(); },
      REFERENSI(o) {
        const id = cur().rumus_id || st.def.rumus, r = RUMUS[id] || RUMUS.hipo;
        let html;
        if (o.mode === 'contoh') {
          const list = CONTOH[id] || CONTOH.hipo, qn = cur(), pick = list.find(x => !(qn.a === x.a && qn.b === x.b)) || list[0];
          html = `<h3>Contoh</h3>${say(esc(pick.teks))}<div class="jb-mini">${tri({ a: pick.a, b: pick.b, labels: labelsOf(Object.assign({ unit: '' }, pick), false) })}</div>`;
        } else html = `<h3>${esc(r.t)}</h3><div class="jb-formula big">${esc(r.f)}</div><p>${esc(r.n)}</p>`;
        sec('REFERENSI').innerHTML = html + `<div class="jb-act">${btn('balik', 'Kembali ke soal')}</div>`;
      },
      PETUNJUK(o) { sec('PETUNJUK').innerHTML = `<div class="jb-bulb"></div><h3>Petunjuk</h3>${say(esc(cur().h1))}<div class="jb-h2" ${o.more ? '' : 'hidden'}>${say(esc(cur().h2))}</div><div class="jb-act">${o.more ? '' : btn('more', 'Petunjuk lagi', 'blue')}${btn('coba', 'Coba lagi')}</div>`; sprite($('.jb-bulb', root), 'efek_bohlam_petunjuk', 8, 8, true); },
      ANIMASI() { const q = cur(); const host = sec('ANIMASI'); JB.explain(q.a, q.b, q.c, q.u, host, nextQ); },
      SOLUSI() { const q = cur(); const ans = q.tipe === 'pilihan' ? q.ans : fmt(q.ans) + (q.unit ? ' ' + q.unit : ''); sec('SOLUSI').innerHTML = `<h3>Pembahasan lengkap</h3><div class="jb-sol">${q.sol.map((s, i) => `<div>${i + 1}. ${esc(s)}</div>`).join('')}<div><b>Jawaban: ${esc(ans)}</b></div></div><div class="jb-act">${q.a ? btn('exSol', 'Lihat Animasi', 'blue') : ''}${btn('next', 'Lanjut')}</div>`; },
      RINGKAS() {
        const benar = st.stat.benar, tot = st.stat.total, bintang = tot ? (benar / tot >= 0.9 ? 3 : benar / tot >= 0.6 ? 2 : 1) : 1, lemah = Object.keys(st.stat.lemah);
        const p = progress(); p[st.def.id] = Math.max(p[st.def.id] || 0, bintang); store.set('progress', p);
        try { if (S && S.addXP && !st.xpGiven) { st.xpGiven = 1; S.addXP(20 + bintang * 10); } } catch (e) { }
        try { PP.ui.confetti && PP.ui.confetti(); } catch (e) { }
        const nm = { miring: 'mengenali sisi miring', hipo: 'mencari sisi miring', kaki: 'mencari sisi tegak', bukti: 'konsep pembuktian' };
        setFig(`<div class="jb-big">${'⭐'.repeat(bintang)}</div>`);
        sec('RINGKAS').innerHTML = `<h3>Pos ${st.def.id} selesai!</h3><p>Benar tanpa bantuan: <b>${benar}</b> dari ${tot} soal.</p>${lemah.length ? `<p class="jb-weak">Perlu diulang: ${lemah.map(k => nm[k] || k).join(', ')}.</p>` : '<p>Tidak ada materi yang lemah. Hebat!</p>'}<div class="jb-act">${btn('peta', 'Ke Peta Jalur', 'blue')}${st.def.id < 6 ? btn('nextpos', 'Pos ' + (st.def.id + 1)) : ''}</div>`;
        talk(false);
      }
    };

    function renderQ() {
      const q = cur(), s = sec('KUIS'), total = st.qs.length;
      setFig(figHtml(q, false));
      if (q.tipe === 'misi') {
        s.innerHTML = `<h3>${esc(q.teks)}</h3><div class="jb-puz"></div><div class="jb-act"><button class="btn green" data-a="next" disabled>Lanjut</button></div>`;
        const host = $('.jb-puz', s), nb = $('[data-a=next]', s);
        const note = document.createElement('div'); note.className = 'pz-note'; note.hidden = true; host.parentNode.insertBefore(note, host.nextSibling);
        try { const wrap = document.createElement('div'); host.appendChild(wrap); PP.puzzle.proof(wrap, 1, 3, 4); new MutationObserver(() => { if (!note.hidden) nb.disabled = false; }).observe(note, { attributes: true, attributeFilter: ['hidden'] }); }
        catch (e) { nb.disabled = false; }
        // catatan: puzzle menaruh pz-note di parent host; amati juga di sana
        const alt = $('.pz-note', host); if (alt) new MutationObserver(() => { if (!alt.hidden) nb.disabled = false; }).observe(alt, { attributes: true, attributeFilter: ['hidden'] });
        setTimeout(() => { if (nb) nb.disabled = false; }, 90000);
        return;
      }
      const head = `<div class="jb-qh"><span>Soal ${st.qi + 1}/${total}</span>${st.wrong ? '<span class="jb-w">Percobaan ke-' + (st.wrong + 1) + '</span>' : ''}</div>`;
      if (q.tipe === 'pilihan') s.innerHTML = `${head}<p class="jb-q">${esc(q.teks)}</p><div class="jb-opts">${q.opsi.map(o => `<button class="btn opt" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div><div class="jb-act">${btn('cek', 'Periksa')}</div>`;
      else s.innerHTML = `${head}<p class="jb-q">${esc(q.teks)}</p><label class="jb-in"><span>Jawaban${q.unit ? ' (' + esc(q.unit) + ')' : ''}</span><input inputmode="decimal" autocomplete="off" aria-label="jawaban"></label><div class="jb-act">${btn('cek', 'Periksa')}</div>`;
      const inp = $('input', s); if (inp) { inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); }); }
    }

    function check() {
      const q = cur(), s = sec('KUIS'); let ok = false, given = '';
      if (q.tipe === 'pilihan') { const on = $('.opt.on', s); if (!on) { PP.ui.toast('Pilih salah satu jawaban dulu.'); return; } given = on.dataset.o; ok = given === q.ans; }
      else { const inp = $('input', s); given = inp.value.trim(); const v = parseNum(given); if (v === null) { PP.ui.toast('Tulis angka dulu. Boleh pakai koma.'); return; } ok = Math.abs(v - q.ans) <= (q.tol || 0.01) + 1e-9; }
      logAdd({ pos: st.def.id, q: st.qi, tipe: q.tipe, rumus: q.rumus_id, jawab: given, benar: ok, salah_ke: st.wrong });
      if (ok) { fx('benar'); try { window.PPAudio && PPAudio.sfx && PPAudio.sfx('correct'); } catch (e) { } if (st.wrong === 0) st.stat.benar++; st.stat.total = st.base; if (q.a && q.tipe === 'isian' || q.a && q.tipe === 'pilihan' && q.u) JB.go('ANIMASI'); else { setTimeout(nextQ, 650); } }
      else {
        fx('salah'); try { window.PPAudio && PPAudio.sfx && PPAudio.sfx('wrong'); } catch (e) { }
        st.wrong++; st.stat.lemah[q.rumus_id || st.def.rumus] = 1;
        if (st.wrong === 1) JB.go('PETUNJUK', {}); else { st.stat.total = st.base; if (!st.adapted && st.def.mudah) { st.adapted = true; st.qs.splice(st.qi + 1, 0, st.def.mudah); } JB.go('SOLUSI'); }
      }
    }
    function parseNum(s) { const t = String(s).replace(',', '.').replace(/[^0-9.\-]/g, ''); if (!t || isNaN(Number(t))) return null; return Number(t); }
    function nextQ() { if (!st) return; st.qi++; st.wrong = 0; if (st.qi >= st.qs.length) JB.go('RINGKAS'); else JB.go('KUIS'); }

    /* ---------- peta & layar ---------- */
    function renderPeta() {
      const p = progress(); st = null;
      root.innerHTML = `<div class="jb-peta"><div class="jb-top"><button class="btn sm" data-a="keluar">‹ Eksplorasi</button><h2>Jalur Belajar</h2></div><p class="jb-sub">Selesaikan pos satu per satu. Pos berikutnya terbuka setelah pos sebelumnya selesai.</p>
        <div class="jb-pos">${POS.map(d => { const done = !!p[d.id], open = d.id === 1 || !!p[d.id - 1]; const img = done ? `ikon_pos_${d.id}_selesai` : open ? `ikon_pos_${d.id}` : 'ikon_pos_terkunci'; return `<button class="jb-p ${done ? 'done' : ''}" data-pos="${d.id}" ${open ? '' : 'disabled'} aria-label="Pos ${d.id}"><img src="${A}statis/${img}.png" alt="" draggable="false"><b>Pos ${d.id}</b><span>${esc(d.judul)}</span>${done ? `<em>${'★'.repeat(p[d.id])}</em>` : ''}</button>`; }).join('')}</div></div>`;
    }
    function start(id) {
      const def = POS.find(x => x.id === id); if (!def) return;
      st = { def, qs: def.soal.slice(), qi: 0, wrong: 0, state: '', prev: '', base: def.soal.length, stat: { benar: 0, total: def.soal.length, lemah: {} } };
      root.innerHTML = `<div class="jb-play"><div class="jb-stage"><div class="jb-npc" role="img" aria-label="${NPC[def.npc][1]}"></div><div class="jb-fig"></div><div class="jb-fx" hidden></div></div>
        <div class="jb-panel">${SEC.map(n => `<section data-st="${n}" hidden></section>`).join('')}</div>
        <div class="jb-bar"><button class="btn sm" data-a="peta">‹ Peta</button><button class="btn sm blue" data-a="rumus">Lihat Rumus</button><button class="btn sm blue" data-a="contohref">Lihat Contoh</button></div></div>`;
      JB.go('BICARA');
    }
    function onClick(e) {
      const t = e.target.closest('[data-a],[data-pos],.opt'); if (!t || !root) return;
      if (t.dataset.pos) { start(+t.dataset.pos); return; }
      if (t.classList.contains('opt')) { $$('.opt', root).forEach(o => o.classList.toggle('on', o === t)); return; }
      const a = t.dataset.a;
      if (a === 'keluar') PP.go('eksplorasi'); else if (a === 'peta') renderPeta();
      else if (!st) return;
      else if (a === 'materi') JB.go('MATERI'); else if (a === 'contoh') JB.go('CONTOH');
      else if (a === 'kuis') { st.qi = 0; JB.go('KUIS'); }
      else if (a === 'cek') check();
      else if (a === 'rumus' || a === 'contohref') { if (st.state === 'REFERENSI' || st.state === 'RINGKAS' || st.state === 'ANIMASI') return; if (!st.qs[st.qi]) return; st.back = st.state; JB.go('REFERENSI', { mode: a === 'rumus' ? 'rumus' : 'contoh' }); }
      else if (a === 'balik') JB.go(st.back || 'KUIS', { keep: true });
      else if (a === 'coba') JB.go('KUIS', { keep: true });
      else if (a === 'more') JB.go('PETUNJUK', { more: true });
      else if (a === 'next') nextQ();
      else if (a === 'exSol') { const q = cur(), h = sec('SOLUSI'); JB.explain(q.a, q.b, q.c, q.u, h, () => { exTok++; JB.go('SOLUSI'); }); }
      else if (a === 'exContoh') { const c = st.def.contoh, h = sec('CONTOH'); JB.explain(c.a, c.b, c.c, c.u, h, () => { exTok++; JB.go('CONTOH'); }); }
      else if (a === 'nextpos') start(st.def.id + 1);
    }
    PP.screens.jalur = function () {
      return {
        html: `<div class="jb" id="jbRoot"></div>`,
        mount(r) { root = $('#jbRoot', r); root.addEventListener('click', onClick); st = null; renderPeta(); },
        unmount() { exTok++; if (st) clearTimeout(st.tt); root = null; st = null; }
      };
    };
    JB.state = () => st && st.state;
    JB.reset = () => { try { localStorage.removeItem('jb_progress'); localStorage.removeItem('jb_log'); } catch (e) { } };
    JB.log = () => store.get('log', []);
    JB._cur = () => st && st.qs[st.qi];
    JB.enabled = true;
  } catch (err) { JB.enabled = false; try { console.warn('JB nonaktif:', err); } catch (e) { } }
})();
