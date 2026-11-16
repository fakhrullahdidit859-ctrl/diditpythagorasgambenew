/* =========================================================
   PETUNJUK BERTINGKAT (tanpa AI) — dipakai di kuis Jelajah dan Mode Latihan.
   1) Ingatkan konsep (gratis)  2) Langkah awal (hadiah -25%)  3) Hapus 2 pilihan salah (hadiah -50%).
   Teks dari it.hint1/it.hint2 bila ada; bila tidak, dibuat otomatis dari jenis soal & angka pada soal.
   Catatan tersimpan: S.data.quizHints = {total, by:{idSoal:{h,w,ok}}}.
   Jawaban tidak pernah ditampilkan oleh petunjuk 1 dan 2.
   ========================================================= */
(function () {
  'use strict';
  const S = () => window.PPStore;
  const H = { session: {} };
  const MULT = [1, 1, 0.75, 0.5], COST = ['gratis', 'gratis', 'hadiah −25%', 'hadiah −50%'];
  const plain = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const nums = t => (t.match(/\d+(?:[.,]\d+)?/g) || []).map(x => +x.replace(',', '.')).filter(x => isFinite(x));
  const sq = n => n + '² = ' + (Math.round(n * n * 100) / 100);
  /* pembangkit petunjuk berbasis jenis soal */
  H.gen = function (it) {
    if (it.hint1 && it.hint2) return { h1: it.hint1, h2: it.hint2, kind: 'data' };
    const t = plain(it.q).toLowerCase(), n = nums(plain(it.q)).filter(x => x > 0);
    const hasMiring = /sisi miring|hipotenusa/.test(t), cari = /(panjang|tentukan|hitung|berapa)/.test(t);
    const given = (m => m ? m : null);
    let h1, h2, kind = 'umum';
    if (/apakah|tripel|merupakan segitiga siku|termasuk segitiga siku|jenis segitiga|segitiga (lancip|tumpul)/.test(t)) {
      kind = 'cek'; h1 = 'Untuk memeriksa segitiga siku-siku, bandingkan kuadrat sisi terpanjang dengan jumlah kuadrat dua sisi lainnya. Bila sama, segitiga itu siku-siku.';
      h2 = 'Langkah awal: urutkan sisi, tentukan yang terpanjang (calon c), kuadratkan ketiga sisi, lalu bandingkan c² dengan a² + b².' + (n.length >= 3 ? ' Mulai dari ' + sq(Math.max.apply(null, n.slice(0, 3))) + '.' : '');
    } else if (/(cm|m|km|meter|sentimeter)\b.*\b(ke|menjadi)\b.*(cm|m|km)|satuan/.test(t) || /\b\d+\s*(m|meter)\b.*\b\d+\s*(cm|sentimeter)\b/.test(t)) {
      kind = 'satuan'; h1 = 'Samakan dulu satuan semua sisi (misalnya semua dalam meter atau semua dalam cm) sebelum memakai rumus Pythagoras.';
      h2 = 'Langkah awal: ubah satuan yang berbeda, lalu tentukan mana sisi miring (c) dan mana sisi siku-siku, kemudian pilih rumus yang sesuai.';
    } else if (/luas (sebuah )?persegi|persegi pada sisi|luas persegi/.test(t)) {
      kind = 'persegi'; h1 = 'Luas persegi = sisi × sisi. Pada Teorema Pythagoras, luas persegi di sisi miring sama dengan jumlah luas persegi di dua sisi lainnya.';
      h2 = 'Langkah awal: hitung luas persegi yang sisinya diketahui' + (n.length ? ' (mis. ' + sq(n[0]) + ')' : '') + ', lalu jumlahkan atau kurangkan sesuai yang dicari.';
    } else if (hasMiring && cari && /(siku-siku|tegak|alas)/.test(t) && n.length >= 2 && /sisi miring[^.,;]*(=|adalah|sebesar|panjang)?\s*\d|miring\s*\(?c\)?\s*=\s*\d|miring[^0-9]{0,30}\d/.test(t) && /(sisi siku-siku|sisi tegak|alas|tinggi)[^.]*\?|panjang sisi (siku-siku|tegak|alas)|sisi (a|b|p|q|siku-siku) adalah/.test(t)) {
      kind = 'tegak'; h1 = 'Mencari sisi siku-siku: kuadrat sisi miring dikurangi kuadrat sisi siku-siku yang diketahui. Rumusnya a² = c² − b².';
      h2 = 'Langkah awal: tentukan dulu mana sisi miring (c), lalu hitung kuadratnya' + (n.length ? ' (mis. ' + sq(Math.max.apply(null, n.slice(0, 2))) + ')' : '') + ' dan kuadrat sisi yang lain, kemudian kurangkan. Setelah itu tarik akar.';
    } else if (cari && /(sisi miring|hipotenusa|jarak|panjang tangga|tali|kawat|diagonal)/.test(t) && n.length >= 2) {
      kind = 'miring'; h1 = 'Mencari sisi miring: jumlahkan kuadrat kedua sisi siku-siku, lalu akar hasilnya. Rumusnya c² = a² + b².';
      h2 = 'Langkah awal: hitung ' + sq(n[0]) + ' dan ' + sq(n[1]) + ', jumlahkan keduanya, lalu tarik akarnya.';
    } else if (/(tegak|alas|tinggi|siku-siku)/.test(t) && cari && n.length >= 2) {
      kind = 'tegak'; h1 = 'Bila yang dicari sisi siku-siku, pakai a² = c² − b² (kuadrat sisi miring dikurangi kuadrat sisi siku-siku lain).';
      h2 = 'Langkah awal: tentukan dulu mana sisi miring (c). Sisi miring selalu yang terpanjang dan berhadapan dengan sudut siku-siku.';
    } else {
      h1 = 'Ingat Teorema Pythagoras: pada segitiga siku-siku, c² = a² + b², dengan c sisi miring (sisi terpanjang).';
      h2 = 'Langkah awal: temukan sudut siku-siku. Sisi di depannya adalah sisi miring. Lalu pilih rumus yang cocok dengan yang ditanyakan.';
    }
    return { h1, h2, kind };
  };
  const rec = id => { const d = S().data; d.quizHints = d.quizHints || { total: 0, by: {} }; d.quizHints.by = d.quizHints.by || {}; return d.quizHints.by[id] = d.quizHints.by[id] || { h: 0, w: 0, ok: 0 }; };
  H.mult = lv => MULT[Math.max(0, Math.min(3, lv | 0))];
  H.wrong = id => { try { const s = H.session[id] = H.session[id] || { lv: 0, wrong: 0, gone: [] }; s.wrong++; rec(id).w++; S().save(); } catch (e) { } };
  H.right = id => { try { rec(id).ok = 1; S().save(); } catch (e) { } };
  H.total = () => { try { return (S().data.quizHints && S().data.quizHints.total) | 0; } catch (e) { return 0; } };
  /* pasang tombol petunjuk. card: elemen tempat bar disisipkan; it: soal; o: {id, opts:()=>[tombol], after:()=>elemen, onChange(mult,lv), free}.
     Mengembalikan {level(), mult()}. */
  H.attach = function (card, it, o) {
    o = o || {}; const id = String(o.id || ('q' + (it.q || '').length)); const s = H.session[id] = H.session[id] || { lv: 0, wrong: 0, gone: [] };
    const g = H.gen(it), bar = document.createElement('div'); bar.className = 'hn-bar';
    const label = () => s.lv >= 3 ? 'Petunjuk habis' : `<img class="px" src="assets/lomba/ikon/ikon_petunjuk_${s.lv + 1}.png" alt="">Petunjuk ${s.lv + 1} <em>(${o.free ? 'gratis' : COST[s.lv + 1]})</em>`;
    const paint = () => {
      bar.innerHTML = `<button class="btn sm hn-btn ${s.wrong && s.lv < 3 ? 'a-pulse hn-pulse' : ''}" type="button" ${s.lv >= 3 ? 'disabled' : ''} aria-label="Minta petunjuk">${label()}</button><div class="hn-txt" aria-live="polite">${s.lv >= 1 ? `<p><b>1.</b> ${g.h1}</p>` : ''}${s.lv >= 2 ? `<p><b>2.</b> ${g.h2}</p>` : ''}${s.lv >= 3 ? '<p><b>3.</b> Dua pilihan yang salah sudah dicoret.</p>' : ''}</div>`;
      const b = bar.querySelector('.hn-btn'); if (b) b.onclick = step;
    };
    const apply = () => { const ops = (o.opts ? o.opts() : []) || []; s.gone.forEach(k => { const e = ops[k]; if (e) { e.disabled = true; e.classList.add('hn-gone'); } }); };
    const step = () => {
      if (s.lv >= 3) return; s.lv++;
      if (s.lv === 3 && !s.gone.length) { const ops = o.opts ? o.opts() : []; const wrong = ops.map((e, k) => k).filter(k => k !== it.a); for (let i = wrong.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [wrong[i], wrong[j]] = [wrong[j], wrong[i]]; } s.gone = wrong.slice(0, Math.min(2, wrong.length)); }
      try { const d = S().data; d.quizHints = d.quizHints || { total: 0, by: {} }; d.quizHints.total = Math.min(999, (d.quizHints.total | 0) + 1); rec(id).h = Math.max(rec(id).h, s.lv); S().save(); } catch (e) { }
      try { window.PPAudio && PPAudio.sfx('tick'); } catch (e) { }
      apply(); paint(); o.onChange && o.onChange(H.mult(s.lv), s.lv);
    };
    const anchor = o.after ? o.after() : null;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor.nextSibling); else card.appendChild(bar);
    paint(); apply(); if (s.lv) o.onChange && o.onChange(H.mult(s.lv), s.lv);
    return { level: () => s.lv, mult: () => H.mult(s.lv), bar };
  };
  /* pengecekan sendiri saat game dimuat: semua soal harus menghasilkan petunjuk */
  setTimeout(() => { try { (PP.QUIZ || []).forEach((q, i) => { const g = H.gen(q); if (!g.h1 || !g.h2) console.error('Petunjuk kosong untuk soal', i); }); } catch (e) { console.error('petunjuk', e); } }, 1500);
  window.PPHint = H;
})();
