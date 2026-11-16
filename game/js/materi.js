/* =========================================================
   MATERI PEMBELAJARAN + EKSPLORASI INTERAKTIF
   Sumber: Global Matematika SMP Kelas VIII, Bab 2 Teorema Pythagoras
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio, V = PPViz, f = V.fmt;
  PP.screens = PP.screens || {};
  PP.MATERI_IDS = ['s1', 's2', 's3', '1', '2', '3', '3b', '4', '5', '6'];
  const TABLAB = { s1: 'Cerita 1', s2: 'Cerita 2', s3: 'Cerita 3' };
  const TITLES = {
    '1': 'Mengenal Segitiga Siku-Siku', '2': 'Mengenal Sisi-Sisi Segitiga', '3': 'Konsep Teorema Pythagoras',
    '3b': 'Pembuktian Teorema Pythagoras', '4': 'Contoh Perhitungan', '5': 'Penerapan pada Bangun Datar dan Kehidupan', '6': 'Kebalikan Teorema Pythagoras'
  };
  const sq = n => `${f(n)}²`;

  /* ---------- narasi ---------- */
  function narrBar(id) {
    const key = 'narration_materi_' + id, st = A.narrationState(key);
    return `<div class="narr ${st === 'missing' ? 'off' : ''}"><button class="btn sm ${st === 'missing' ? 'dis' : 'blue'}" data-act="narr" data-id="${key}" ${st === 'missing' ? 'disabled' : ''}>${st === 'playing' ? '❚❚ Jeda narasi' : '▶ Dengarkan narasi'}</button>
      <span class="small muted">${st === 'missing' ? 'Narasi belum diunggah. Guru dapat menambahkannya di assets/audio/narration/.' : 'Narasi suara tersedia.'}</span></div>`;
  }
  PP.acts.narr = el => {
    const id = el.dataset.id, st = A.narrationState(id);
    if (st === 'playing') A.pauseNarration(); else if (st === 'paused') A.resumeNarration(); else A.playNarration(id);
  };
  A.on(() => PP.$$('[data-act=narr]').forEach(b => {
    const st = A.narrationState(b.dataset.id);
    if (st !== 'missing') b.textContent = st === 'playing' ? '❚❚ Jeda narasi' : '▶ Dengarkan narasi';
  }));

  /* ---------- stepper: tampilkan langkah satu per satu ---------- */
  function stepper(root, id) {
    const box = PP.$('#' + id, root); if (!box) return;
    const items = PP.$$('.stp', box), btn = PP.$('.stp-btn', box), rst = PP.$('.stp-rst', box);
    let n = 0;
    const draw = () => {
      items.forEach((li, i) => li.classList.toggle('show', i < n));
      btn.disabled = n >= items.length; btn.textContent = n === 0 ? 'Mulai langkah' : n >= items.length ? 'Selesai' : 'Langkah berikutnya';
      rst.hidden = n === 0;
    };
    btn.onclick = () => { n = Math.min(items.length, n + 1); draw(); A.sfx('tick'); };
    rst.onclick = () => { n = 0; draw(); };
    draw();
  }
  const stepBox = (id, lines, head) => `<div class="stepper" id="${id}">${head || ''}<ol class="steps">${lines.map(l => `<li class="stp">${l}</li>`).join('')}</ol>
    <div class="row"><button class="btn sm green stp-btn nosfx">Mulai langkah</button><button class="btn sm stp-rst nosfx" hidden>Ulangi</button></div></div>`;
  const eq = t => `<span class="eq-line">${t}</span>`;

  /* =====================================================
     HALAMAN MATERI
     ===================================================== */
  const PAGES = {};

  ['s1', 's2', 's3'].forEach(id => {
    PAGES[id] = function () { return { body: PP.storyHTML(id), mount(root) { PP.storyMount(root, id); } }; };
    TITLES[id] = id;
  });

  PAGES['1'] = function () {
    return {
      body: `<p><b>Segitiga siku-siku</b> adalah segitiga yang salah satu sudutnya berukuran <b>90°</b> (sudut siku-siku). Sudut siku-siku diberi tanda kotak kecil.</p>
        <div class="two">
          <div class="figure"><div id="m1fig">${V.tri({ H: 4, V: 3, corner: 'bl', angleText: true, labels: {}, aria: 'Segitiga siku-siku dengan sudut 90 derajat' }).svg}</div>
            <div class="row center"><button class="btn sm" data-act="m1-rot">Putar posisi segitiga</button></div>
            <p class="cap">Posisi segitiga boleh berubah, tetapi sudut 90° tetap ada.</p></div>
          <div><h4>Ciri-ciri</h4><ul class="ticks">
            <li>Memiliki <b>satu</b> sudut siku-siku (90°).</li>
            <li>Dua sudut lainnya lancip, dan jumlah keduanya 90°.</li>
            <li>Sisi di depan sudut siku-siku adalah sisi <b>terpanjang</b>.</li>
            <li>Jumlah ketiga sudut tetap 180°.</li></ul>
            <div class="tip">${PP.img('ic_help', 'tip-i')}<span>Contoh sudut: 30° + 60° + 90° = 180°. Segitiga ini siku-siku.</span></div></div></div>`,
      mount(root) {
        let k = 0; const cs = ['bl', 'br', 'tr', 'tl'];
        PP.acts['m1-rot'] = () => { k = (k + 1) % 4; PP.$('#m1fig').innerHTML = V.tri({ H: 4, V: 3, corner: cs[k], angleText: true, labels: {} }).svg; };
      }
    };
  };

  PAGES['2'] = function () {
    const info = {
      h: ['Sisi alas', 'Kaki segitiga yang mendatar (horizontal) di dekat sudut siku-siku.'],
      v: ['Sisi tegak', 'Kaki segitiga yang tegak (vertikal) di dekat sudut siku-siku.'],
      hyp: ['Sisi miring (hipotenusa)', 'Sisi yang berada di hadapan sudut siku-siku. Sisi ini selalu paling panjang.']
    };
    const draw = (corner, hl) => V.tri({ H: 4, V: 3, corner, hl, labels: { h: 'alas', v: 'tegak', hyp: 'miring' }, off: 20, w: 340, h: 240 }).svg;
    return {
      body: `<p>Setiap sisi segitiga siku-siku punya nama. Ketuk sisinya pada gambar atau pilih tombol di bawah.</p>
        <div class="two"><div class="figure"><div id="m2fig">${draw('bl')}</div>
          <div class="row center"><button class="btn sm" data-act="m2-rot">Putar posisi</button></div></div>
        <div><div class="chips" id="m2chips"><button class="chip" data-side="h">Alas</button><button class="chip" data-side="v">Tegak</button><button class="chip" data-side="hyp">Miring</button></div>
          <div class="panel-i" id="m2info"><b>Pilih sebuah sisi</b><p>Penjelasan sisi akan muncul di sini.</p></div>
          <ul class="ticks small"><li>Alas dan tegak disebut <b>sisi siku-siku</b>.</li><li>Sisi miring selalu berseberangan dengan sudut 90°.</li></ul></div></div>`,
      mount(root) {
        let k = 0, hl = null; const cs = ['bl', 'br', 'tr', 'tl'];
        const upd = () => {
          PP.$('#m2fig', root).innerHTML = draw(cs[k], hl);
          PP.$$('#m2chips .chip', root).forEach(c => c.classList.toggle('on', c.dataset.side === hl));
          if (hl) PP.$('#m2info', root).innerHTML = `<b>${info[hl][0]}</b><p>${info[hl][1]}</p>`;
          PP.$$('#m2fig [data-side]', root).forEach(l => l.addEventListener('click', () => { hl = l.dataset.side; upd(); }));
        };
        PP.$('#m2chips', root).addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { hl = c.dataset.side; upd(); } });
        PP.acts['m2-rot'] = () => { k = (k + 1) % 4; upd(); };
        upd();
      }
    };
  };

  PAGES['3'] = function () {
    const ex = [[3, 4], [6, 8], [5, 12]];
    return {
      body: `<p>Gambar persegi pada setiap sisi segitiga siku-siku. Hitung luas masing-masing persegi dan bandingkan.</p>
        <div class="chips" id="m3chips">${ex.map((e, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-i="${i}">Sisi ${e[0]}, ${e[1]}, ${Math.hypot(e[0], e[1])}</button>`).join('')}</div>
        <div class="two"><div class="figure"><div id="m3fig"></div><div class="row center"><button class="btn sm" data-act="m3-replay">Putar ulang animasi</button></div></div>
          <div><div class="calc" id="m3calc"></div>
            <div class="formula">a² + b² = c²</div>
            <p class="small">Luas persegi pada sisi miring sama dengan jumlah luas persegi pada kedua sisi siku-siku.</p></div></div>
        <div class="note"><h4>Kegiatan kelompok</h4><ol class="small">
          <li>Buat persegi dari kertas berpetak dengan sisi 3, 4, dan 5 satuan.</li><li>Gunting, lalu tempel sehingga ketiganya membentuk segitiga di bagian tengah.</li>
          <li>Hitung luas tiap persegi: 3² = 9, 4² = 16, dan 5² = 25. Ternyata 9 + 16 = 25.</li><li>Ulangi dengan sisi 5, 12, dan 13: 25 + 144 = 169. Hasilnya juga sama.</li></ol></div>`,
      mount(root) {
        let i = 0;
        const upd = () => {
          const [a, b] = ex[i], c = Math.hypot(a, b);
          PP.$('#m3fig', root).innerHTML = V.squares(a, b, { grid: true, anim: true, w: 420, h: 380 }).svg;
          PP.$('#m3calc', root).innerHTML = `<div class="cl"><span class="dot sq-a"></span>Persegi tegak: ${a}² = <b>${a * a}</b></div><div class="cl"><span class="dot sq-b"></span>Persegi alas: ${b}² = <b>${b * b}</b></div>
            <div class="cl"><span class="dot sq-c"></span>Persegi miring: ${f(c)}² = <b>${f(c * c)}</b></div><div class="cl sum">${a * a} + ${b * b} = ${a * a + b * b} = ${f(c * c)} ✓</div>`;
          PP.$$('#m3chips .chip', root).forEach((x, k) => x.classList.toggle('on', k === i));
        };
        PP.$('#m3chips', root).addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { i = +c.dataset.i; upd(); } });
        PP.acts['m3-replay'] = upd; upd();
      }
    };
  };

  PAGES['3b'] = function () {
    return {
      body: `<p>Mengapa c² = a² + b² selalu benar? Perhatikan dua pembuktian berikut. Gunakan tombol untuk membuka langkahnya satu per satu.</p>
        <div class="two"><div class="figure">${V.proof('a')}<p class="cap">Gambar (a): persegi besar sisi (a + b) berisi persegi miring c² dan 4 segitiga siku-siku.</p></div>
          <div><h4>Pembuktian pertama</h4>${stepBox('pf1', [
            'Luas persegi besar = (a + b)².', 'Luas persegi dalam c² = luas persegi besar − 4 luas segitiga.',
            eq('c² = (a + b)² − 4(½ × a × b)'), eq('c² = a² + 2ab + b² − 2ab'), eq('c² = a² + b²') + ' <b>(terbukti)</b>'])}</div></div>
        <div class="two"><div class="figure">${V.proof('b')}<p class="cap">Gambar (b): persegi yang sama disusun ulang menjadi a², b², dan dua persegi panjang ab.</p></div>
          <div><h4>Pembuktian kedua</h4>${stepBox('pf2', [
            'Gambar (a): (a + b)² = 4(½ × a × b) + c².', 'Gambar (b): (a + b)² = a² + b² + 2ab.',
            'Luas kedua gambar sama, maka ' + eq('4(½ab) + c² = a² + b² + 2ab'), eq('2ab + c² = a² + b² + 2ab'), eq('c² = a² + b²') + ' <b>(terbukti)</b>'])}</div></div>`,
      mount(root) { stepper(root, 'pf1'); stepper(root, 'pf2'); }
    };
  };

  PAGES['4'] = function () {
    const ex1 = V.tri({ H: 4, V: 3, corner: 'bl', labels: { h: 'b = 4 cm', v: 'a = 3 cm', hyp: 'c = ?' }, w: 300, h: 210, off: 20 }).svg;
    const ex2 = V.tri({ H: 12, V: 9, corner: 'br', labels: { h: 'AC = 12 cm', v: 'BC = ?', hyp: 'AB = 15 cm' }, w: 320, h: 220, off: 20 }).svg;
    // tabel latihan (Tabel 2.1 pada buku): 1 sisi dicari
    const rows = [[3, 4, 5, 'c'], [6, 8, 10, 'a'], [10, 24, 26, 'b'], [7, 24, 25, 'c'], [8, 15, 17, 'a']];
    return {
      body: `<h4>Contoh 1: mencari sisi miring</h4>
        <div class="two"><div class="figure">${ex1}</div><div>${stepBox('ex1', [
          '<b>Diketahui:</b> a = 3 cm dan b = 4 cm.', '<b>Ditanyakan:</b> panjang sisi miring c.', eq('c² = a² + b²'), eq('c² = 3² + 4²'), eq('c² = 9 + 16'), eq('c² = 25'), eq('c = √25 = 5 cm') + ' <b>Jadi sisi miringnya 5 cm.</b>'])}</div></div>
        <h4>Contoh 2: mencari sisi siku-siku</h4>
        <p class="small">Segitiga ABC siku-siku di C dengan AB = 15 cm dan AC = 12 cm. Tentukan panjang BC.</p>
        <div class="two"><div class="figure">${ex2}</div><div>${stepBox('ex2', [
          'ΔABC siku-siku di C, maka AB adalah sisi miring.', eq('AB² = BC² + AC²'), eq('15² = BC² + 12²'), eq('BC² = 15² − 12²'), eq('BC² = 225 − 144 = 81'), eq('BC = √81 = 9 cm') + ' <b>Jadi BC = 9 cm.</b>'])}</div></div>
        <h4>Coba sendiri: lengkapi tabel</h4>
        <p class="small">Segitiga siku-siku dengan c sebagai sisi miring. Isi sisi yang masih kosong, lalu tekan Periksa.</p>
        <div class="tbl-wrap"><table class="tbl" id="trip"><thead><tr><th>No</th><th>a</th><th>b</th><th>c</th><th>a²</th><th>b²</th><th>c²</th></tr></thead><tbody>
        ${rows.map((r, i) => `<tr data-i="${i}"><td>${i + 1}</td>${['a', 'b', 'c'].map((k, j) => k === r[3] ? `<td><input class="cell" inputmode="decimal" data-k="${k}" aria-label="Nilai ${k} baris ${i + 1}"></td>` : `<td>${r[j]}</td>`).join('')}
          <td class="sq" data-s="a"></td><td class="sq" data-s="b"></td><td class="sq" data-s="c"></td></tr>`).join('')}</tbody></table></div>
        <div class="row"><button class="btn green sm" data-act="tbl-check">Periksa</button><button class="btn sm" data-act="tbl-show">Tampilkan jawaban</button><span class="small" id="tblMsg"></span></div>`,
      mount(root) {
        stepper(root, 'ex1'); stepper(root, 'ex2');
        const cells = () => PP.$$('#trip tbody tr', root);
        const inputs = () => PP.$$('#trip input.cell', root);
        const msg = t => { const m = PP.$('#tblMsg', root); if (m) m.textContent = t; };
        let checked = false;
        const showBtn = () => PP.$('[data-act=tbl-show]', root);
        const syncBtn = () => { const b = showBtn(); if (b) { b.disabled = !checked; b.classList.toggle('dis', !checked); } };
        const fill = (tr, r, force) => {
          const inp = PP.$('input', tr), idx = { a: 0, b: 1, c: 2 }[r[3]], val = r[idx];
          if (force) inp.value = String(val).replace('.', ',');
          const v = parseFloat(String(inp.value).replace(',', '.'));
          const ok = Math.abs(v - val) < 1e-9;
          inp.classList.toggle('ok', ok); inp.classList.toggle('no', inp.value.trim() !== '' && !ok);
          const all = { a: r[0], b: r[1], c: r[2] };
          ['a', 'b', 'c'].forEach(k => { PP.$('[data-s=' + k + ']', tr).textContent = (ok || force) ? all[k] * all[k] : ''; });
          return ok;
        };
        inputs().forEach(i => i.addEventListener('input', () => { checked = false; syncBtn(); msg(''); }));
        PP.acts['tbl-check'] = () => {
          const empty = inputs().filter(i => i.value.trim() === '').length;
          if (empty) { A.sfx('wrong'); msg('Isi dulu ' + empty + ' kolom yang masih kosong, lalu tekan Periksa.'); return; }
          let n = 0; cells().forEach((tr, i) => { if (fill(tr, rows[i])) n++; });
          checked = true; syncBtn();
          msg(n === rows.length ? 'Semua benar! Skor 5 dari 5. Hebat!' : 'Skor ' + n + ' dari ' + rows.length + '. Yang merah belum tepat. Tekan Tampilkan jawaban untuk melihat yang benar.');
          A.sfx(n === rows.length ? 'correct' : 'wrong');
        };
        PP.acts['tbl-show'] = () => {
          if (!checked) { msg('Isi semua kolom dan tekan Periksa dulu.'); return; }
          cells().forEach((tr, i) => fill(tr, rows[i], true)); msg('Jawaban yang benar ditampilkan.');
        };
        syncBtn();
      }
    };
  };

  PAGES['5'] = function () {
    const F = PP.Fig.FIG;
    const items = {
      pole: { t: 'Tali dan tiang', svg: F.pole(15, 8, 17, 't = ?'), steps: ['Tiang tegak lurus tanah, sehingga tiang, tanah, dan tali membentuk segitiga siku-siku. Tali adalah sisi miring, jarak patok adalah alas, dan tinggi tiang adalah sisi tegak.', eq('t² = 17² − 8²'), eq('t² = 289 − 64 = 225'), eq('t = √225 = 15 m'), 'Jadi tinggi tiang adalah <b>15 m</b>.'] },
      rect: { t: 'Diagonal persegi panjang', svg: F.rect(), steps: ['Diagonal membagi persegi panjang menjadi dua segitiga siku-siku. Diagonal adalah sisi miring, panjang dan lebar adalah sisi siku-siku.', eq('l² = 14,5² − 10,5²'), eq('l² = 210,25 − 110,25 = 100, jadi l = 10 cm'), eq('Luas = 10,5 × 10 = 105 cm²'), eq('Keliling = 2 × (10,5 + 10) = 41 cm')] },
      trap: { t: 'Keliling trapesium', svg: F.trapSol(), steps: ['Trapesium siku-siku ini punya sisi miring CD yang belum diketahui. Tarik garis dari D tegak lurus ke BC di titik E, sehingga terbentuk persegi panjang ABED dan segitiga siku-siku DEC.', eq('BE = AD = 27 cm, DE = AB = 24 cm'), eq('EC = BC − BE = 34 − 27 = 7 cm'), eq('CD² = 24² + 7² = 576 + 49 = 625, CD = 25 cm'), eq('Keliling = 24 + 34 + 25 + 27 = 110 cm')] },
      kite: { t: 'Layang-layang', svg: F.kite(), steps: ['Diagonal layang-layang saling tegak lurus di titik O, sehingga terbentuk empat segitiga siku-siku. Sisi layang-layang menjadi sisi miring.', eq('AB² = AO² + BO² = 5² + 12² = 169, AB = 13 cm'), eq('CB² = CO² + BO² = 9² + 12² = 225, CB = 15 cm'), 'Dua pasang sisi yang sama panjang (13 cm dan 15 cm) memang ciri layang-layang.'] },
      hang: { t: 'Jembatan Hangzhou', svg: F.hang(), steps: ['Jembatan ini dibangun dengan kabel pancang yang membentuk bangun segitiga siku-siku. Tiang AD berdiri tegak lurus terhadap dasar BC di titik D.', eq('Pada ΔADB: AB² = AD² + BD²'), eq('Pada ΔADC: AC² = AD² + CD²'), 'Jika BD = CD maka AB = AC. Jika ∠BAC juga siku-siku, berlaku pula BC² = AB² + AC².'] }
    };
    const keys = Object.keys(items);
    return {
      body: `<p>Teorema Pythagoras dipakai untuk menghitung bagian bangun datar dan masalah sehari-hari. Pilih salah satu situasi dari buku.</p>
        <div class="chips" id="m5chips">${keys.map((k, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-k="${k}">${items[k].t}</button>`).join('')}</div>
        <div class="two"><div class="figure" id="m5fig"></div><div id="m5txt"></div></div>`,
      mount(root) {
        const show = k => {
          PP.$('#m5fig', root).innerHTML = items[k].svg;
          PP.$('#m5txt', root).innerHTML = `<h4>${items[k].t}</h4>` + stepBox('m5st', items[k].steps);
          stepper(root, 'm5st'); PP.$$('#m5chips .chip', root).forEach(c => c.classList.toggle('on', c.dataset.k === k));
        };
        PP.$('#m5chips', root).addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) show(c.dataset.k); });
        show(keys[0]);
      }
    };
  };

  PAGES['6'] = function () {
    return {
      body: `<h4>Kebalikan Teorema Pythagoras</h4>
        <p>Jika pada sebuah segitiga kuadrat sisi terpanjang sama dengan jumlah kuadrat dua sisi lainnya, maka sudut yang menghadap sisi terpanjang adalah <b>sudut siku-siku</b>. Dengan cara ini kita bisa memeriksa apakah sebuah segitiga siku-siku.</p>
        <div class="tool panel-i"><b>Alat cek segitiga</b><p class="small">Masukkan panjang tiga sisi.</p>
          <div class="row"><input class="cell" id="cs1" inputmode="decimal" value="10" aria-label="Sisi pertama"><input class="cell" id="cs2" inputmode="decimal" value="17" aria-label="Sisi kedua"><input class="cell" id="cs3" inputmode="decimal" value="21" aria-label="Sisi ketiga"></div>
          <div id="csOut" class="tool-out"></div></div>
        <h4>Contoh dari buku</h4>
        <div class="two"><div class="figure">${PP.Fig.FIG.abd(true)}</div><div>${stepBox('ex6', [
          'ΔABC dengan AB = 10 cm, BC = 17 cm, AD = 6 cm, dan CD = 15 cm. BD tegak lurus AC. Apakah ∠B siku-siku?', eq('AC = AD + CD = 6 + 15 = 21 cm'), eq('AB² + BC² = 100 + 289 = 389'), eq('AC² = 21² = 441'),
          eq('389 ≠ 441') + ' Jadi ∠B <b>bukan</b> sudut siku-siku. Sudut siku-siku pada gambar ada di titik D.'])}</div></div>
        <h4>Segitiga siku-siku pada buku</h4>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sisi-sisinya</th><th>Pemeriksaan</th></tr></thead><tbody>
          ${[[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [10, 24, 26], [24, 32, 40]].map(t => `<tr><td>${t.join(', ')}</td><td>${t[0]}² + ${t[1]}² = ${t[0] ** 2} + ${t[1] ** 2} = ${t[2] ** 2} = ${t[2]}²</td></tr>`).join('')}</tbody></table></div>`,
      mount(root) {
        stepper(root, 'ex6');
        const num = id => parseFloat(String(PP.$(id, root).value).replace(',', '.'));
        const chk = () => {
          const v = [num('#cs1'), num('#cs2'), num('#cs3')], out = PP.$('#csOut', root);
          if (v.some(x => !(x > 0))) { out.innerHTML = '<span class="err">Isi ketiga sisi dengan bilangan positif.</span>'; return; }
          const s = v.slice().sort((a, b) => a - b), [a, b, c] = s;
          if (a + b <= c) { out.innerHTML = `<span class="err">Ketiga panjang itu tidak dapat membentuk segitiga, karena ${f(a)} + ${f(b)} ≤ ${f(c)}.</span>`; return; }
          const l = a * a + b * b, r = c * c, ok = Math.abs(l - r) < 1e-9;
          out.innerHTML = `Sisi terpanjang = ${f(c)}. ${f(a)}² + ${f(b)}² = ${f(l)} dan ${f(c)}² = ${f(r)}.<br><b class="${ok ? 'okc' : 'noc'}">${ok ? 'Sama, jadi segitiga ini siku-siku.' : 'Tidak sama, jadi segitiga ini bukan siku-siku.'}</b>`;
        };
        ['#cs1', '#cs2', '#cs3'].forEach(i => PP.$(i, root).addEventListener('input', chk)); chk();
      }
    };
  };

  /* ---------- bagian materi (judul, isi, mount) ---------- */
  PP.materiParts = function (id) {
    const p = PAGES[id]();
    return { id, title: PP.CERITA && PP.CERITA[id] ? PP.CERITA[id].title : 'Materi ' + id.toUpperCase() + ': ' + TITLES[id], body: p.body, mount: p.mount };
  };
  function markSeen(id) {
    if (!S.data.materiSeen[id]) { S.data.materiSeen[id] = Date.now(); S.save(); S.addXP(5, true); S.checkBadges(); }
  }

  /* ---------- pecah isi materi menjadi slide agar muat satu layar ---------- */
  function splitGroups(el) {
    const groups = [[]];
    Array.from(el.children).forEach(n => {
      const g = groups[groups.length - 1], has = sel => g.some(x => x.matches(sel));
      const brk = g.length && (n.matches('h4') || n.matches('.note') || (n.matches('.two') && has('.two')) || (n.matches('.tbl-wrap') && has('.tool,.two')));
      if (brk) groups.push([]);
      groups[groups.length - 1].push(n);
    });
    return groups;
  }

  /* =====================================================
     PP.book — "buku" satu layar: tab + slide + tombol Sebelumnya/Berikutnya
     spec.pages: [{label,title,html,mount} | {lesson:'3b'}], spec.start: indeks halaman awal,
     spec.last: {label, route} tombol pada slide terakhir
     ===================================================== */
  PP.book = function (spec) {
    const pages = spec.pages;
    const lab = p => p.lesson ? (TABLAB[p.lesson] || p.lesson.toUpperCase()) : p.label;
    const html = `<div class="wrap narrowish"><div class="book">
      <nav class="tabs" aria-label="Daftar halaman">${pages.map((p, i) => `<button class="tab" data-bk="${i}">${lab(p)}</button>`).join('')}</nav>
      <section class="panel book-card"><div class="bk-head"><h2 id="bkTitle"></h2></div><div class="bk-body" id="bkBody"></div>
        <div class="bk-foot"><button class="btn" id="bkPrev"><span>◀</span><span class="lab"> Sebelumnya</span></button><div class="dots" id="bkDots"></div><button class="btn green" id="bkNext"><span class="lab">Berikutnya </span><span>▶</span></button></div></section></div></div>`;
    const inst = { html };
    inst.mount = function (root) {
      const body = PP.$('#bkBody', root), slides = [];
      pages.forEach((p, pi) => {
        if (p.lesson) {
          const part = PP.materiParts(p.lesson), host = document.createElement('div');
          host.className = 'lesson-body'; host.dataset.mid = p.lesson; host.innerHTML = part.body; host.hidden = true; body.appendChild(host);
          try { part.mount && part.mount(body); } catch (e) { console.error(e); }
          const groups = splitGroups(host).filter(g => g.length);
          groups.forEach((g, gi) => {
            const el = document.createElement('div'); el.className = 'slide-pg lesson-body'; el.hidden = true;
            g.forEach(n => el.appendChild(n)); body.appendChild(el);
            slides.push({ el, page: pi, title: part.title + (groups.length > 1 ? ` (${gi + 1}/${groups.length})` : ''), lesson: p.lesson, gi, gn: groups.length });
          });
          host.remove();
        } else {
          const el = document.createElement('div'); el.className = 'slide-pg'; el.hidden = true; el.innerHTML = p.html; body.appendChild(el);
          try { p.mount && p.mount(el); } catch (e) { console.error(e); }
          slides.push({ el, page: pi, title: p.title, gi: 0, gn: 1 });
        }
      });
      let cur = -1;
      const firstOf = pi => slides.findIndex(s => s.page === pi);
      const show = i => {
        i = Math.max(0, Math.min(slides.length - 1, i));
        if (i === cur) return; cur = i;
        slides.forEach((s, k) => s.el.hidden = k !== i);
        const s = slides[i];
        if (s.lesson) markSeen(s.lesson);
        PP.$('#bkTitle', root).textContent = s.title;
        PP.$$('.tab', root).forEach((t, pi) => {
          t.classList.toggle('on', pi === s.page);
          const pg = pages[pi]; t.classList.toggle('seen', !!(pg.lesson && S.data.materiSeen[pg.lesson]));
          if (pi === s.page) t.scrollIntoView && t.scrollIntoView({ block: 'nearest', inline: 'center' });
        });
        const same = slides.filter(x => x.page === s.page);
        PP.$('#bkDots', root).innerHTML = same.length > 1 ? same.map(x => `<i class="${x === s ? 'on' : ''}"></i>`).join('') : '';
        const prev = PP.$('#bkPrev', root), next = PP.$('#bkNext', root), end = i === slides.length - 1;
        prev.disabled = i === 0; prev.classList.toggle('dis', i === 0);
        next.innerHTML = end && spec.last ? `<span class="lab">${spec.last.label}</span><span>▶</span>` : '<span class="lab">Berikutnya </span><span>▶</span>';
        next.dataset.end = end && spec.last ? '1' : '';
        body.scrollTop = 0; s.el.scrollTop = 0;
      };
      PP.$('#bkPrev', root).onclick = () => show(cur - 1);
      PP.$('#bkNext', root).onclick = e => { if (e.currentTarget.dataset.end) PP.go(spec.last.route); else show(cur + 1); };
      PP.$$('.tab', root).forEach((t, pi) => t.onclick = () => show(firstOf(pi)));
      show(firstOf(spec.start || 0));
    };
    return inst;
  };

  PP.screens.materi = function (arg) {
    const idx = Math.max(0, PP.MATERI_IDS.indexOf(arg));
    return PP.book({ pages: PP.MATERI_IDS.map(m => ({ lesson: m })), start: idx, last: { label: 'Ke Peta Petualangan', route: 'peta' } });
  };

  /* =====================================================
     EKSPLORASI INTERAKTIF
     ===================================================== */
  PP.screens.eksplorasiSlider = function () {
    return {
      html: `<div class="wrap narrowish"><div class="panel fill pad"><h2 class="h-title">Eksplorasi Pythagoras</h2>
        <p>Geser pengaturan sisi a (tegak) dan b (alas). Segitiga, sisi miring, dan luas persegi berubah otomatis.</p>
        <div class="ex-wrap"><div class="figure"><div id="exFig"></div></div>
          <div class="ex-ctl">
            <label class="slide"><span>Sisi tegak a</span><input type="range" id="exA" min="1" max="20" step="0.5" value="3"><input type="number" id="exAn" min="1" max="20" step="0.5" value="3"></label>
            <label class="slide"><span>Sisi alas b</span><input type="range" id="exB" min="1" max="20" step="0.5" value="4"><input type="number" id="exBn" min="1" max="20" step="0.5" value="4"></label>
            <p class="err" id="exErr" hidden></p>
            <div class="chips" id="exPre"><button class="chip" data-a="3" data-b="4">3 · 4</button><button class="chip" data-a="5" data-b="12">5 · 12</button><button class="chip" data-a="8" data-b="15">8 · 15</button><button class="chip" data-a="6" data-b="8">6 · 8</button><button class="chip" data-a="1" data-b="1">1 · 1</button></div>
            <div class="calc" id="exCalc"></div></div></div>
        <div class="tip">${PP.img('owl_1', 'tip-i')}<span>Misi: coba a = 3 dan b = 4. Bandingkan luas persegi kecil (a² dan b²) dengan luas persegi pada sisi miring (c²). Apa yang kamu temukan? Coba juga pasangan lain.</span></div></div></div>`,
      mount(root) {
        const R = id => PP.$(id, root); let changes = 0;
        const read = (id) => { const v = parseFloat(String(R(id).value).replace(',', '.')); return v; };
        const draw = () => {
          let a = read('#exAn'), b = read('#exBn'); const err = R('#exErr');
          if (!(a >= 1 && a <= 20 && b >= 1 && b <= 20)) { err.hidden = false; err.textContent = 'Isi a dan b dengan angka antara 1 dan 20.'; return; }
          err.hidden = true;
          const c = Math.hypot(a, b), tri = Math.abs(c - Math.round(c)) < 1e-9;
          R('#exFig').innerHTML = V.squares(a, b, { w: 460, h: 420 }).svg;
          R('#exCalc').innerHTML = `<div class="cl"><span class="dot sq-a"></span>a² = ${f(a)}² = <b>${f(a * a)}</b></div><div class="cl"><span class="dot sq-b"></span>b² = ${f(b)}² = <b>${f(b * b)}</b></div>
            <div class="cl sum">c² = a² + b² = ${f(a * a)} + ${f(b * b)} = <b>${f(a * a + b * b)}</b></div><div class="cl"><span class="dot sq-c"></span>c = √${f(a * a + b * b)} = <b>${f(c)}</b></div>
            <div class="cl ok">Selalu benar: a² + b² = c², yaitu ${f(a * a)} + ${f(b * b)} = ${f(a * a + b * b)}.</div>`;
        };
        const set = (a, b) => { ['A', 'B'].forEach((k, i) => { const v = i ? b : a; R('#ex' + k).value = v; R('#ex' + k + 'n').value = v; }); draw(); };
        ['A', 'B'].forEach(k => {
          R('#ex' + k).addEventListener('input', e => { R('#ex' + k + 'n').value = e.target.value; draw(); bump(); });
          R('#ex' + k + 'n').addEventListener('input', e => { const v = parseFloat(String(e.target.value).replace(',', '.')); if (v >= 1 && v <= 20) R('#ex' + k).value = v; draw(); bump(); });
        });
        R('#exPre').addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) { set(+c.dataset.a, +c.dataset.b); bump(); } });
        const bump = () => { changes++; if (changes === 6) { S.data.explored++; S.save(); S.award('explorer'); S.addXP(10); } };
        draw();
      }
    };
  };
})();
