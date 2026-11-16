/* =========================================================
   CERITA RAFI — materi yang diceritakan oleh karakter utama.
   Papan peraga (kiri/atas) berganti gambar, Rafi bergerak dan mulutnya membuka-menutup saat bicara.
   Isi mengikuti Buku Siswa Teorema Pythagoras (Pengantar: A Pengertian, B Asal Usul, C Sebab Adanya).
   ========================================================= */
(function () {
  const bd = inner => `<svg class="bdsvg" viewBox="0 0 400 230" role="img" aria-label="Papan peraga">${inner}</svg>`;
  const T = (x, y, t, cls, sz, an) => `<text x="${x}" y="${y}" class="bt ${cls || ''}" style="font-size:${sz || 15}px" text-anchor="${an || 'middle'}">${t}</text>`;
  const L = (x1, y1, x2, y2, cls) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="bl ${cls || ''}"/>`;
  const POLY = (pts, cls) => `<polygon points="${pts}" class="bp ${cls || ''}"/>`;
  const title = t => T(200, 26, t, 'bt-title', 17);

  /* segitiga siku-siku di papan: sudut siku-siku kiri-bawah */
  function boardTri(o) {
    o = o || {};
    const A = [110, 190], B = [110, 56], C = [290, 190];
    let s = title(o.title || 'Segitiga siku-siku');
    s += POLY(`${A} ${B} ${C}`, 'tri');
    s += L(...A, ...B, o.legs ? 'y' : '') + L(...A, ...C, o.legs ? 'y' : '') + L(...B, ...C, o.hyp ? 'c hot' : '');
    s += `<path class="bl ${o.mark ? 'y pulse' : ''}" d="M110,172 L128,172 L128,190" fill="none"/>`;
    if (o.mark) s += T(150, 176, '90°', 'y', 15);
    s += T(92, 128, 'a', '', 17) + T(200, 214, 'b', '', 17) + T(214, 112, 'c', o.hyp ? 'c' : '', 17);
    if (o.hyp) s += T(296, 108, 'sisi miring', 'c', 14, 'start') + T(296, 126, '(hipotenusa)', 'c', 14, 'start');
    if (o.legs) s += T(20, 120, 'sisi', 'y', 13, 'start') + T(20, 136, 'siku-siku', 'y', 13, 'start') + T(210, 232, '', '');
    return bd(s);
  }
  function boardFormula() {
    return bd(title('Teorema Pythagoras') + `<rect x="60" y="62" width="280" height="76" rx="12" class="bp box"/>` +
      `<text x="200" y="112" class="bt big" text-anchor="middle"><tspan class="c">c²</tspan> = <tspan class="a">a²</tspan> + <tspan class="b">b²</tspan></text>` +
      T(200, 168, 'kuadrat sisi miring = jumlah kuadrat', '', 14) + T(200, 188, 'kedua sisi siku-siku', '', 14) +
      POLY('300,215 330,215 330,200', 'tri') + L(300, 215, 330, 215) + L(330, 215, 330, 200) + L(300, 215, 330, 200, 'c'));
  }
  function boardConverse() {
    return bd(title('Kebalikannya juga benar') + T(200, 66, 'sisi 5, 12, dan 13', 'y', 16) +
      T(200, 104, '5² + 12² = 25 + 144 = 169', '', 17) + T(200, 132, '13² = 169', '', 17) +
      T(200, 168, 'Sama! Maka segitiganya', 'c', 15) + T(200, 188, 'siku-siku ✓', 'c', 18));
  }
  const sqSvg = () => PPViz.squares(3, 4, { grid: true, anim: true, w: 400, h: 230, m: 10 }).svg.replace('<svg class="viz sqv"', '<svg class="viz sqv bdsvg"');

  /* ----- kartu ilustrasi sejarah ----- */
  function boardSamos() {
    return bd(title('Pythagoras · ± 570–495 SM') +
      `<circle cx="95" cy="110" r="34" class="bp tri"/><circle cx="305" cy="150" r="34" class="bp tri"/>` +
      T(95, 116, 'Samos', 'y', 15) + T(305, 156, 'Kroton', 'y', 15) + T(95, 160, 'Yunani', '', 12) + T(305, 200, 'Italia Selatan', '', 12) +
      `<path d="M130 118 C190 70 250 90 272 138" class="bl dashed" fill="none"/><polygon points="272,138 262,126 280,128" class="bp fillw"/>` +
      T(200, 62, 'Kaum Pythagorean', 'c', 14) + T(200, 218, 'bilangan · geometri · musik · astronomi', '', 13));
  }
  function boardUnknown() {
    return bd(title('Siapa penemu pertamanya?') + `<rect x="120" y="44" width="160" height="136" rx="10" class="bp scroll"/><path d="M130 66 h140 M130 86 h140 M130 106 h100" class="bl thin" fill="none"/>` +
      T(200, 158, '?', 'big c', 46) + T(200, 206, 'Tidak ada tulisan langsung dari Pythagoras', '', 13));
  }
  function boardBabilonia() {
    let w = ''; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) w += `<path d="M${130 + c * 24} ${74 + r * 22} l9 0 l-4.5 12 z" class="bp fillw"/>`;
    return bd(title('Babilonia · ± 1800 SM') + `<rect x="110" y="56" width="180" height="108" rx="10" class="bp clay"/>` + w + T(200, 194, 'Lempeng tanah liat Plimpton 322', 'y', 15) + T(200, 214, 'daftar bilangan yang memenuhi sifat ini', '', 12));
  }
  function boardIndia() {
    return bd(title('India · Sulbasutra · ± 800 SM') + `<rect x="80" y="62" width="100" height="100" class="bp clay"/><rect x="210" y="82" width="120" height="60" class="bp clay"/>` +
      T(130, 118, 'persegi', '', 14) + T(270, 118, 'persegi panjang', '', 13) + T(200, 196, 'Membuat altar dengan sudut siku-siku', 'y', 14) + T(200, 214, 'dari tali dan sifat segitiga siku-siku', '', 12));
  }
  function boardRope() {
    const knots = (a, b, n) => { let s = ''; for (let i = 0; i <= n; i++) s += `<circle cx="${a[0] + (b[0] - a[0]) * i / n}" cy="${a[1] + (b[1] - a[1]) * i / n}" r="4.6" class="bp knot"/>`; return s; };
    const P = [120, 168], Q = [240, 168], R = [120, 72];
    return bd(title('Tiongkok dan Mesir') + L(...P, ...Q, 'rope') + L(...P, ...R, 'rope') + L(...Q, ...R, 'rope') + knots(P, Q, 4) + knots(P, R, 3) + knots(Q, R, 5) +
      `<path class="bl y" d="M120,152 L136,152 L136,168" fill="none"/>` + T(104, 124, '3', 'y', 16) + T(180, 190, '4', 'y', 16) + T(196, 108, '5', 'c', 16) +
      T(318, 100, 'Zhoubi', '', 13) + T(318, 118, 'Suanjing', '', 13) + T(318, 146, 'Tali berbuhul', 'y', 13) + T(318, 164, 'Mesir 3 : 4 : 5', 'y', 13));
  }
  function boardEuclid() {
    return bd(title('Euclid · ± 300 SM') + `<rect x="70" y="50" width="120" height="136" rx="8" class="bp book"/><path d="M130 50 V186" class="bl thin"/>` + T(130, 100, 'Elements', 'y', 15) +
      T(130, 122, 'Buku I', '', 13) + T(250, 96, 'Proposisi 47', 'c', 16, 'start') + T(250, 114, 'Teorema Pythagoras', '', 12, 'start') + T(250, 150, 'Proposisi 48', 'y', 16, 'start') + T(250, 168, 'kebalikannya', '', 12, 'start'));
  }
  function boardGarfield() {
    const a = 50, b = 80, x0 = 120, y0 = 190, k = 1.0;
    const P = (x, y) => `${x0 + x * k},${y0 - y * k}`;
    return bd(title('James A. Garfield · 1876') + POLY(`${P(0, 0)} ${P(a, 0)} ${P(0, b)}`, 'tri') + POLY(`${P(a, 0)} ${P(a + b, 0)} ${P(a + b, a)}`, 'tri2') +
      POLY(`${P(0, b)} ${P(a, 0)} ${P(a + b, a)}`, 'fillc') + T(x0 + 8, y0 - 18, 'a', '', 13, 'start') + T(x0 + a + b / 2, y0 + 16, 'b', '', 13) + T(x0 + 22, y0 - b / 2 - 6, 'b', '', 13) + T(x0 + a / 2 + b / 2 + 4, y0 - 22, 'c', 'c', 15) +
      T(300, 74, 'Bukti dengan', '', 13, 'start') + T(300, 92, 'trapesium', 'y', 15, 'start') + T(300, 120, 'kemudian menjadi', '', 12, 'start') + T(300, 138, 'Presiden AS', 'c', 14, 'start'));
  }
  function boardTimeline() {
    const items = [['1800 SM', 'Babilonia', 50], ['800 SM', 'India', 130], ['570 SM', 'Pythagoras', 205], ['300 SM', 'Euclid', 280], ['1876', 'Garfield', 350]];
    let s = title('Perjalanan sebuah teorema') + L(30, 116, 380, 116, 'rope');
    items.forEach(([y, n, x], i) => { s += `<circle cx="${x}" cy="116" r="8" class="bp ${i === 2 ? 'hotc' : 'knot'}"/>` + T(x, 96 - (i % 2) * 22, y, 'y', 12) + T(x, 148 + (i % 2) * 22, n, '', 12); });
    return bd(s);
  }

  /* ----- ilustrasi "sebab" ----- */
  function boardCorner() {
    return bd(title('1 · Membuat sudut siku-siku') + `<rect x="70" y="120" width="200" height="80" class="bp clay"/>` + L(70, 120, 270, 120, 'y') + L(70, 120, 70, 200, 'y') +
      `<path class="bl y" d="M70,138 L88,138 L88,120" fill="none"/>` + T(170, 108, 'dinding', '', 13) + T(318, 150, 'rumah', 'y', 15) + T(318, 170, 'kuil, piramida', '', 12) + T(318, 188, 'lahan setelah banjir', '', 12));
  }
  function boardRiver() {
    return bd(title('2 · Mengukur tanpa mengukur langsung') + `<rect x="0" y="92" width="400" height="56" class="bp water"/>` + T(200, 126, 'sungai', '', 14) +
      L(90, 168, 90, 60, 'y') + L(90, 168, 250, 168, 'y') + L(90, 60, 250, 168, 'c dashed') + `<path class="bl y" d="M90,152 L106,152 L106,168" fill="none"/>` +
      T(70, 118, '?', 'c', 20) + T(170, 192, 'terukur', 'y', 13) + T(200, 98, 'cukup dua panjang!', '', 12, 'start'));
  }
  function boardPattern() {
    return bd(title('3 · Pola bilangan dan bangun') + T(110, 78, '3, 4, 5', 'y', 17) + T(110, 102, '9 + 16 = 25', '', 14) + T(110, 140, '5, 12, 13', 'y', 17) + T(110, 164, '25 + 144 = 169', '', 14) +
      `<rect x="250" y="70" width="70" height="70" class="bp tri"/>` + L(250, 140, 320, 70, 'c') + T(285, 62, '1', '', 13) + T(334, 108, '1', '', 13) + T(262, 106, '√2', 'c', 18) + T(285, 172, 'diagonal = √2', 'c', 14) + T(285, 192, 'bukan pecahan', '', 12));
  }
  function boardUse() {
    const it = [['🏢', 'gedung', 60], ['🌉', 'jembatan', 140], ['🏠', 'atap', 220], ['🪜', 'tangga', 300], ['📺', 'layar TV', 100, 1], ['🧭', 'peta dan navigasi', 250, 1]];
    let s = title('4 · Kegunaan dalam kehidupan');
    it.forEach(([e, n, x, r]) => { const y = r ? 168 : 86; s += `<text x="${x}" y="${y}" class="emo" text-anchor="middle">${e}</text>` + T(x, y + 26, n, '', 12); });
    return bd(s);
  }
  function boardReady() {
    return bd(title('Ayo temukan sendiri!') + POLY('110,170 110,70 230,170', 'tri') + L(110, 170, 110, 70, 'y') + L(110, 170, 230, 170, 'y') + L(110, 70, 230, 170, 'c') +
      `<rect x="260" y="90" width="44" height="44" class="bp sqa"/><rect x="308" y="90" width="44" height="44" class="bp sqb" transform="rotate(8 330 112)"/>` + T(280, 168, 'puzzle', 'y', 14) + T(280, 188, 'dan kegiatan', '', 13));
  }

  /* ---------------- DAFTAR CERITA ---------------- */
  PP.CERITA = {
    s1: { title: 'Cerita Didit 1: Apa itu Teorema Pythagoras?', steps: [
      { b: () => boardTri(), pose: 'wave', say: 'Halo, teman-teman! Aku Didit Fakhrullah. Hari ini aku mau mengenalkan sebuah sifat penting pada segitiga siku-siku. Namanya Teorema Pythagoras.' },
      { b: () => boardTri({ mark: 1 }), pose: 'point', say: 'Segitiga siku-siku adalah segitiga yang salah satu sudutnya besarnya 90°. Lihat kotak kecil di sudutnya? Itulah tanda sudut siku-siku.' },
      { b: () => boardTri({ mark: 1, hyp: 1, legs: 1 }), pose: 'point', say: 'Sisi yang berada di depan sudut siku-siku disebut sisi miring atau hipotenusa. Ia sisi yang paling panjang. Dua sisi lainnya kita sebut sisi siku-siku.' },
      { b: boardFormula, pose: 'idea', say: 'Teorema Pythagoras berbunyi: pada setiap segitiga siku-siku, kuadrat panjang sisi miring sama dengan jumlah kuadrat panjang kedua sisi siku-sikunya. Jika sisi siku-sikunya a dan b, dan sisi miringnya c, maka c² = a² + b².' },
      { b: sqSvg, pose: 'point', say: 'Bilangan berpangkat dua bisa kita bayangkan sebagai luas persegi. Contohnya segitiga dengan sisi 3, 4, dan 5: 3² + 4² = 9 + 16 = 25 = 5². Luas persegi terbesar sama dengan jumlah dua persegi lainnya!' },
      { b: boardConverse, pose: 'idea', say: 'Sebaliknya juga berlaku. Jika pada sebuah segitiga, kuadrat sisi terpanjangnya sama dengan jumlah kuadrat dua sisi lainnya, maka segitiga itu pasti siku-siku. Seru, kan? Yuk lanjut ke ceritaku berikutnya!' }
    ] },
    s2: { title: 'Cerita Didit 2: Asal Usul dan Kajian Ilmunya', steps: [
      { b: boardSamos, pose: 'point', say: 'Nama teorema ini diambil dari Pythagoras, filsuf dan matematikawan Yunani yang hidup kira-kira tahun 570 sampai 495 SM. Ia berasal dari Pulau Samos, lalu mendirikan perkumpulan pengikutnya, kaum Pythagorean, di Kroton, Italia Selatan. Di sana mereka mempelajari bilangan, geometri, musik, dan astronomi.' },
      { b: boardUnknown, pose: 'idea', say: 'Menurut tradisi, Pythagoras atau para pengikutnya adalah yang pertama membuktikan sifat ini. Namun tidak ada tulisan langsung dari Pythagoras, jadi para sejarawan berhati-hati menyebut siapa penemu pertamanya.' },
      { b: boardBabilonia, pose: 'point', say: 'Hubungan sisi pada segitiga siku-siku ternyata sudah dikenal jauh sebelum masa Pythagoras! Di Babilonia, ada lempeng tanah liat bernama Plimpton 322 (sekitar 1800 SM) yang memuat daftar bilangan yang memenuhi sifat ini.' },
      { b: boardIndia, pose: 'point', say: 'Di India, kitab Sulbasutra (sekitar 800 SM) menyatakan sifat ini untuk membuat altar yang berbentuk persegi dan persegi panjang.' },
      { b: boardRope, pose: 'point', say: 'Di Tiongkok, naskah kuno Zhoubi Suanjing membahas hubungan sisi segitiga siku-siku 3, 4, 5. Orang Mesir kuno memakai tali berbuhul dengan perbandingan 3 : 4 : 5 untuk membuat sudut siku-siku pada bangunan.' },
      { b: boardEuclid, pose: 'idea', say: 'Bukti tertulis yang paling terkenal ada dalam buku Elements karya Euclid, sekitar 300 SM. Teoremanya ada di Buku I Proposisi 47, dan kebalikannya pada Proposisi 48.' },
      { b: boardGarfield, pose: 'wave', say: 'Sesudah itu, ratusan bukti lain ditemukan oleh banyak orang. Salah satunya memakai trapesium, ditemukan James A. Garfield pada tahun 1876, yang kemudian menjadi Presiden Amerika Serikat!' },
      { b: boardTimeline, pose: 'wave', say: 'Jadi teorema ini bukan milik satu orang saja, tetapi hasil pemikiran banyak peradaban. Hebat, ya! Selanjutnya, mengapa teorema ini sampai lahir? Yuk, kita lihat di ceritaku yang ketiga.' }
    ] },
    s3: { title: 'Cerita Didit 3: Sebab Adanya Teorema Ini', steps: [
      { b: boardCorner, pose: 'point', say: 'Teorema Pythagoras lahir dari kebutuhan manusia yang sangat nyata. Pertama, kebutuhan membuat sudut siku-siku. Untuk membangun rumah, kuil, dan piramida, serta membagi kembali lahan pertanian setelah banjir sungai, manusia purba membutuhkan cara yang pasti untuk membuat sudut 90°.' },
      { b: boardRiver, pose: 'point', say: 'Kedua, kebutuhan mengukur jarak tanpa mengukur langsung. Tinggi tiang, lebar sungai, atau panjang tangga sulit diukur langsung. Dengan teorema ini, cukup dua panjang yang mudah diukur, lalu panjang yang ketiga dapat dihitung.' },
      { b: boardPattern, pose: 'idea', say: 'Ketiga, rasa ingin tahu terhadap pola bilangan dan bangun. Orang tertarik pada bilangan seperti 3, 4, 5 dan 5, 12, 13 yang membuat luas persegi saling berhubungan. Kajian ini juga mengantar pada bilangan yang tidak dapat ditulis sebagai pecahan, misalnya √2, yaitu panjang diagonal persegi yang sisinya 1.' },
      { b: boardUse, pose: 'wave', say: 'Keempat, kegunaan dalam kehidupan. Hingga kini teorema ini dipakai dalam pembangunan gedung dan jembatan, pembuatan atap dan tangga, penentuan ukuran layar televisi, hingga perhitungan jarak pada peta dan navigasi.' },
      { b: boardReady, pose: 'wave', say: 'Pada halaman-halaman berikutnya, kalian akan menemukan sendiri sifat ini melalui kegiatan, melihat buktinya, lalu menggunakannya untuk menyelesaikan soal. Siap? Ayo lanjut!' }
    ] }
  };

  /* ---------------- PEMUTAR CERITA ---------------- */
  PP.storyHTML = id => `<div class="story" data-sid="${id}">
    <div class="st-stage"><div class="st-board"><div class="st-bd" aria-live="polite"></div></div>
      <div class="st-rafi pose-wave">${PP.Rafi.body()}</div></div>
    <div class="st-dialog"><div class="st-portrait">${PP.Rafi.head()}</div>
      <div class="st-box"><div class="st-name"><b>Didit Fakhrullah</b><span class="st-count"></span></div><p class="st-text" tabindex="0"></p>
        <div class="st-ctl"><button class="btn sm nosfx" data-st="prev" aria-label="Sebelumnya">◀</button><div class="dots st-dots"></div>
          <button class="btn sm gold nosfx" data-st="skip" aria-label="Tampilkan semua teks">⏭</button><button class="btn sm green nosfx" data-st="next">Lanjut ▶</button></div></div></div></div>`;

  PP.storyMount = function (root, id) {
    const def = PP.CERITA[id], el = PP.$('.story[data-sid="' + id + '"]', root); if (!el) return;
    const bdEl = PP.$('.st-bd', el), txt = PP.$('.st-text', el), rafi = PP.$$('.rafi', el), body = PP.$('.st-rafi', el);
    const dots = PP.$('.st-dots', el), nextB = PP.$('[data-st=next]', el), prevB = PP.$('[data-st=prev]', el), cnt = PP.$('.st-count', el);
    let i = 0, timer = null, typing = false, started = false;
    const talk = on => rafi.forEach(r => r.classList.toggle('talk', on));
    const stop = () => { clearTimeout(timer); typing = false; talk(false); };
    const show = k => {
      stop(); i = Math.max(0, Math.min(def.steps.length - 1, k)); const st = def.steps[i];
      const svg = typeof st.b === 'function' ? st.b() : st.b;
      bdEl.classList.remove('swap'); void bdEl.offsetWidth; bdEl.innerHTML = svg; bdEl.classList.add('swap');
      body.className = 'st-rafi pose-' + (st.pose || 'idle');
      dots.innerHTML = def.steps.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('');
      cnt.textContent = (i + 1) + '/' + def.steps.length;
      prevB.disabled = i === 0; nextB.textContent = i === def.steps.length - 1 ? 'Ulangi ↺' : 'Lanjut ▶';
      const full = st.say; txt.textContent = ''; typing = true; talk(true); let n = 0;
      const tick = () => {
        if (!el.isConnected) return;
        n = Math.min(full.length, n + 2); txt.textContent = full.slice(0, n);
        if (n >= full.length) { typing = false; talk(false); return; }
        timer = setTimeout(tick, /[.,!?]/.test(full[n - 1]) ? 120 : 26);
      };
      tick();
      if (PP.PPAudio && PP.PPAudio.sfx) try { PP.PPAudio.sfx('tick'); } catch (e) {}
    };
    const finish = () => { stop(); txt.textContent = def.steps[i].say; };
    nextB.onclick = () => { if (typing) { finish(); return; } show(i === def.steps.length - 1 ? 0 : i + 1); };
    prevB.onclick = () => show(i - 1);
    PP.$('[data-st=skip]', el).onclick = finish;
    txt.onclick = () => { if (typing) finish(); };
    const vis = () => !!el.offsetParent;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !started) { started = true; show(0); }
      else if (!e.isIntersecting && started) { stop(); started = false; }
    }), { threshold: 0.05 });
    io.observe(el);
    if (vis() && !started) { started = true; show(0); }
  };
})();
