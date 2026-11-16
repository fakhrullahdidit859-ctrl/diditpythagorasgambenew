/* =========================================================
   KUIS INTERAKTIF — 15 soal, timer dapat diatur, jawaban tersimpan, pembahasan
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio;
  PP.screens = PP.screens || {};
  const N = () => PP.QUIZ.length;

  function predikat(score) { return S.predikat(score); }
  function mmss(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }

  const OPEN = ['Coba hitung ini ya.', 'Perhatikan gambarnya baik-baik.', 'Ayo, kamu pasti bisa.', 'Ingat rumus Pythagoras.', 'Pelan-pelan saja.'];
  const askHTML = it => `<div class="qz-ask"><div class="qz-rafi">${PP.Rafi.head()}</div><div class="qz-bubble"><h3 class="q-text">${it.q}</h3></div></div><div class="qz-main">${it.fig ? `<div class="qz-fig">${typeof it.fig === 'function' ? it.fig() : it.fig}</div>` : ''}<div class="qz-right">`;
  const rafiTalk = (root, ms) => { const r = PP.$('.qz-rafi .rafi', root); if (!r) return; r.classList.add('talk'); setTimeout(() => r.classList.remove('talk'), ms || 1400); };

  PP.screens.kuis = function () {
    const inst = { timers: [], unmount() { this.timers.forEach(clearInterval); } };
    inst.html = '<div class="wrap narrowish"><div class="panel fill pad" id="qz"></div></div>';
    inst.mount = function (root) {
      const box = PP.$('#qz', root); const q = S.data.quiz;
      const draft = q.draft;
      const lv = PP.QUIZ.reduce((o, x) => (o[x.lv] = (o[x.lv] || 0) + 1, o), {});

      const intro = () => {
        const best = q.best;
        box.innerHTML = `<div class="qz-intro"><h2 class="h-title">Kuis Interaktif</h2>
          <p style="margin:0">${N()} soal pilihan ganda: ${Object.keys(lv).map(k => lv[k] + ' ' + k.toLowerCase()).join(', ')}. Satu soal tampil pada satu waktu, jawaban tersimpan otomatis, pembahasan muncul setelah selesai.</p>
          ${best ? `<p class="pill big">Nilai terbaik: ${best.score} · ${predikat(best.score).t}</p>` : ''}
          <div class="live-box" id="qLive" hidden></div>
          <label class="fld">Waktu pengerjaan
            <select id="qTime"><option value="0">Tanpa timer</option>${[5, 10, 15, 20, 30].map(m => `<option value="${m}" ${q.timerMin === m ? 'selected' : ''}>${m} menit</option>`).join('')}</select></label>
          <div class="row center"><button class="btn gold" id="qPrac">Mode Latihan (ada pembahasan langsung)</button></div>
          <div class="row center" style="margin-top:6px">${window.PPBank && PPBank.count() ? `<button class="btn blue sm" id="qPracB">Latihan Soal Guru (${PPBank.count()})</button>` : ''}<button class="btn sm" id="qPracA">Latihan Soal Otomatis</button></div>
          <div class="row center">${draft ? '<button class="btn blue" id="qResume">Lanjutkan Kuis Sebelumnya</button>' : ''}<button class="btn green xl" id="qStart">${draft ? 'Mulai Baru' : 'MULAI KUIS'}</button></div></div>`;
        const SV = window.PPServer;
        if (SV && SV.mode() !== 'off') {
          const paint = () => {
            const el = PP.$('#qLive'); if (!el) { off && off(); return; }
            const rows = SV.list().slice(0, 6); el.hidden = rows.length < 1;
            el.innerHTML = `<h4><span class="live-dot"></span>Teman di server ${PP.esc(SV.room())} (${SV.count()} online)</h4><ol class="sv-list">${rows.map(p => `<li class="${p.me ? 'me' : ''}"><span class="sv-av">${PP.img((PP.AV[p.avatar] || PP.AV.boy).idle)}</span><span class="sv-n"><b>${PP.esc(p.name || 'Pemain')}${p.me ? ' (kamu)' : ''}</b><small>${p.scene === 'kuis' && p.qz ? 'mengerjakan soal ' + p.qz.i + '/' + p.qz.n : typeof p.quiz === 'number' ? 'nilai kuis ' + p.quiz : p.scene === 'jelajah' ? 'sedang menjelajah' : 'belum kuis'}</small></span><span class="sv-xp">${p.xp | 0} XP</span></li>`).join('')}</ol>`;
          };
          let off = SV.onChange(paint); paint();
        }
        PP.$('#qTime').onchange = e => { q.timerMin = +e.target.value; S.save(); };
        PP.$('#qStart').onclick = () => { A.sfx('start'); run({ ans: Array(N()).fill(null), idx: 0, end: q.timerMin ? Date.now() + q.timerMin * 60000 : 0, min: q.timerMin }); };
        PP.$('#qPrac').onclick = () => practice();
        { const pb = PP.$('#qPracB'), pa = PP.$('#qPracA'); if (pb) pb.onclick = () => practice('bank'); if (pa) pa.onclick = () => practice('auto'); }
        if (draft) PP.$('#qResume').onclick = () => run(draft);
      };

      const run = (st) => {
        const persist = () => { q.draft = st; S.save(); };
        persist();
        let timer = null;
        const finish = (auto) => {
          clearInterval(timer);
          const res = grade(st); q.draft = null; q.last = res; q.attempts++;
          if (!q.best || res.score > q.best.score) q.best = res;
          S.data.tally.correct += res.correct; S.data.tally.wrong += res.wrong + res.blank; S.save();
          S.addXP(res.correct * 3 + (res.score >= 80 ? 20 : 0), true);
          if (res.score >= 80) S.award('quiz80'); if (res.score >= 100) S.award('perfect');
          A.sfx(res.score >= 70 ? 'mission' : 'end'); if (res.score >= 70) PP.ui.confetti(40);
          const net = PPNet.active() ? PPNet.sync() : null;
          result(res, auto, net);
        };
        const draw = () => {
          const it = PP.QUIZ[st.idx], sel = st.ans[st.idx], answered = st.ans.filter(a => a != null).length;
          try { window.PPServer && PPServer.quizProgress(st.idx + 1, N(), answered); } catch (e) {}
          box.innerHTML = `<div class="qz-top"><span class="pill">Soal ${st.idx + 1}/${N()}</span><span class="pill lv-${it.lv}">${it.lv}</span><span class="pill">Terjawab ${answered}/${N()}</span>${st.end ? `<span class="pill timer" id="qTimer">${mmss(Math.ceil((st.end - Date.now()) / 1000))}</span>` : '<span class="pill">Tanpa timer</span>'}</div>
            <div class="bar"><i style="width:${answered / N() * 100}%"></i></div>
            ${askHTML(it)}
            <div class="opts grid2 qz-opts">${it.o.map((o, k) => `<button class="opt nosfx ${sel === k ? 'sel' : ''}" style="--d:${k * 70}ms" data-k="${k}"><span class="ol">${'ABCD'[k]}</span>${o}</button>`).join('')}</div></div></div>
            <nav class="qnav" aria-label="Nomor soal">${st.ans.map((a, k) => `<button class="qn nosfx ${k === st.idx ? 'cur' : ''} ${a != null ? 'done' : ''}" data-i="${k}" aria-label="Soal ${k + 1}${a != null ? ' sudah dijawab' : ''}">${k + 1}</button>`).join('')}</nav>
            <div class="row between"><button class="btn" id="qPrev" ${st.idx === 0 ? 'disabled' : ''}>◀ Sebelumnya</button><button class="btn sm gold" id="qDone2">Selesai</button>
              ${st.idx < N() - 1 ? '<button class="btn green" id="qNext">Berikutnya ▶</button>' : '<button class="btn blue" id="qDone">Kirim</button>'}</div>
`;
          rafiTalk(box);
          PP.$$('.opt', box).forEach(b => b.onclick = () => { st.ans[st.idx] = +b.dataset.k; persist(); A.sfx('quizSelect'); draw(); });
          PP.$$('.qn', box).forEach(b => b.onclick = () => { st.idx = +b.dataset.i; persist(); A.sfx('tick'); draw(); });
          const go = d => () => { st.idx = Math.max(0, Math.min(N() - 1, st.idx + d)); persist(); draw(); };
          PP.$('#qPrev').onclick = go(-1); if (PP.$('#qNext')) PP.$('#qNext').onclick = go(1);
          const ask = () => {
            const blank = st.ans.filter(a => a == null).length;
            PP.ui.modal(`<h3>Selesaikan kuis?</h3><p class="modal-text">${blank ? blank + ' soal belum dijawab dan akan dihitung salah.' : 'Semua soal sudah terjawab.'} Setelah selesai, jawaban tidak dapat diubah.</p><div class="row end"><button class="btn" data-close>Kembali</button><button class="btn green" id="qOk">Ya, selesai</button></div>`);
            PP.$('#qOk').onclick = () => { PP.ui.close(); finish(false); };
          };
          if (PP.$('#qDone')) PP.$('#qDone').onclick = ask; if (PP.$('#qDone2')) PP.$('#qDone2').onclick = ask;
        };
        const tick = () => {
          if (!st.end) return;
          const left = Math.ceil((st.end - Date.now()) / 1000), t = PP.$('#qTimer');
          if (t) { t.textContent = mmss(left); t.classList.toggle('low', left <= 60); }
          if (left <= 0) { PP.ui.close(); PP.ui.toast('Waktu habis. Kuis diselesaikan otomatis.', 'owl'); finish(true); }
        };
        if (st.end) { timer = setInterval(tick, 1000); inst.timers.push(timer); }
        if (st.end && st.end - Date.now() <= 0) { finish(true); return; }
        draw();
      };

      const practice = mode => {
        const POOL = mode === 'bank' && window.PPBank ? PPBank.pool().sort(() => Math.random() - .5).slice(0, 15) : mode === 'auto' && window.PPGen ? PPGen.batch(10, Math.floor(Math.random() * 4e9)) : PP.QUIZ, PN = () => POOL.length;
        if (!POOL.length) { PP.ui.toast('Belum ada soal untuk latihan ini.'); return intro(); }
        let i = 0, ok = 0, checked = false, pick = null;
        const draw = () => {
          const it = POOL[i]; checked = false; pick = null;
          box.innerHTML = `<div class="qz-top"><span class="pill">Latihan ${i + 1}/${PN()}</span><span class="pill lv-${it.lv}">${it.lv}</span><span class="pill">Benar ${ok}</span></div>
            <div class="bar"><i style="width:${i / PN() * 100}%"></i></div>${askHTML(it)}
            <div class="opts grid2 qz-opts">${it.o.map((o, k) => `<button class="opt nosfx" style="--d:${k * 70}ms" data-k="${k}"><span class="ol">${'ABCDE'[k]}</span>${o}</button>`).join('')}</div>
            <div class="qz-fb" id="pFb" aria-live="polite">${OPEN[i % OPEN.length]}</div></div></div>
            <div class="row between"><button class="btn sm" id="pExit">Keluar</button><button class="btn blue" id="pCheck" disabled>Periksa</button></div>`;
          rafiTalk(box);
          if (window.PPHint) PPHint.attach(box, it, { id: 'p' + i, free: true, opts: () => PP.$$('.opt', box), after: () => PP.$('.qz-opts', box) });
          PP.$$('.opt', box).forEach(b => b.onclick = () => { if (checked || b.disabled) return; pick = +b.dataset.k; PP.$$('.opt', box).forEach(x => x.classList.toggle('sel', x === b)); PP.$('#pCheck').disabled = false; A.sfx('quizSelect'); });
          PP.$('#pExit').onclick = intro;
          PP.$('#pCheck').onclick = () => {
            if (checked) { if (i >= PN() - 1) return end(); i++; return draw(); }
            checked = true; const good = pick === it.a; if (good) ok++;
            PP.$$('.opt', box).forEach((x, k) => { x.classList.remove('sel'); if (k === it.a) x.classList.add('good'); else if (k === pick) x.classList.add('bad'); });
            const fb = PP.$('#pFb'); fb.className = 'qz-fb ' + (good ? 'ok' : 'no'); fb.innerHTML = `<b>${good ? 'Benar!' : 'Belum tepat.'}</b> ${it.e}`;
            A.sfx(good ? 'correct' : 'wrong'); rafiTalk(box, 2200); if (good) PP.ui.confetti(12);
            PP.$('#pCheck').textContent = i >= PN() - 1 ? 'Selesai' : 'Soal berikutnya ▶';
          };
        };
        const end = () => { S.addXP(ok * 2, true); S.save(); box.innerHTML = `<div class="qz-intro"><div class="qz-rafi big">${PP.Rafi.head()}</div><h2 class="h-title">Latihan selesai</h2><p class="pill big">${ok} dari ${PN()} benar</p><p>Mode latihan tidak mengubah nilai. Coba Mode Ujian untuk mendapatkan nilai.</p><div class="row center"><button class="btn" id="pAg">Latihan lagi</button><button class="btn green" id="pBack">Kembali</button></div></div>`; rafiTalk(box, 2500); PP.$('#pAg').onclick = practice; PP.$('#pBack').onclick = intro; };
        draw();
      };

      const grade = st => {
        let correct = 0, wrong = 0, blank = 0;
        st.ans.forEach((a, i) => { if (a == null) blank++; else if (a === PP.QUIZ[i].a) correct++; else wrong++; });
        return { score: Math.round(correct / N() * 100), correct, wrong, blank, total: N(), ans: st.ans.slice(), date: Date.now() };
      };

      const result = (res, auto, net) => {
        const pr = predikat(res.score), stars = S.starsFor(res.score);
        let ri = 0;
        box.innerHTML = `<div class="result" style="display:flex;flex-direction:column;min-height:0;flex:1">
          <div class="qz-res-top"><div class="res-stars">${PP.stars(stars)}</div><div><h2 class="h-title" style="margin:0">Hasil Kuis</h2><p class="pill big" style="margin:0">${pr.t}</p></div></div>
          ${auto ? '<p class="fb no" style="margin:2px 0">Waktu habis, kuis diselesaikan otomatis.</p>' : ''}
          <p class="net-st" id="qNet" ${net ? '' : 'hidden'}>Mengirim skor ke ruangan ${PPNet.room()}…</p>
          <div class="fin-stats"><div><b>${res.score}</b><span>Nilai</span></div><div><b>${res.correct}</b><span>Benar</span></div><div><b>${res.wrong}</b><span>Salah</span></div><div><b>${res.blank}</b><span>Kosong</span></div></div>
          <div class="rv-head"><b class="h-sub" style="margin:0">Pembahasan</b><span class="pill" id="rvPos"></span></div>
          <div class="review scrollbox" id="rvBox" style="flex:1"></div>
          <div class="row between" style="margin:4px 0 0"><button class="btn sm" id="rvPrev">◀</button><button class="btn green sm" id="qAgain">Ulangi Kuis</button><button class="btn sm" data-go="${PPNet.configured() ? 'papan' : 'nilai'}">${PPNet.configured() ? 'Peringkat' : 'Penilaian'}</button><button class="btn sm" id="rvNext">▶</button></div></div>`;
        const drawRv = () => {
          const it = PP.QUIZ[ri], a = res.ans[ri], ok = a === it.a;
          PP.$('#rvPos').textContent = (ri + 1) + ' / ' + N();
          PP.$('#rvBox').innerHTML = `<article class="rv ${a == null ? 'blank' : ok ? 'ok' : 'no'}"><h4>${ri + 1}. ${it.q} <span class="pill lv-${it.lv}">${it.lv}</span></h4>
            <p class="small">Jawabanmu: <b>${a == null ? 'tidak dijawab' : 'ABCD'[a] + '. ' + it.o[a]}</b> ${ok ? '✓' : ''}</p>
            ${ok ? '' : `<p class="small">Kunci: <b>${'ABCD'[it.a]}. ${it.o[it.a]}</b></p>`}<p class="small">${it.e}</p></article>`;
          PP.$('#rvPrev').disabled = ri === 0; PP.$('#rvNext').disabled = ri === N() - 1;
        };
        PP.$('#rvPrev').onclick = () => { ri--; drawRv(); }; PP.$('#rvNext').onclick = () => { ri++; drawRv(); };
        drawRv();
        PP.$('#qAgain').onclick = intro;
        if (net) net.then(r => { const e = PP.$('#qNet'); if (!e) return; e.className = 'net-st ' + (r.ok ? 'ok' : 'bad'); e.textContent = r.ok ? 'Skor terkirim ke ruangan ' + PPNet.room() + '. Lihat Peringkat.' : 'Skor belum terkirim. Akan dicoba lagi otomatis saat internet tersedia.'; });
      };
      intro();
    };
    return inst;
  };
})();
