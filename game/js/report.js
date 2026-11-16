/* =========================================================
   VIDEO ANIMASI · REFLEKSI · PROGRAM PENILAIAN (laporan, CSV, cetak)
   ========================================================= */
(function () {
  const S = PPStore, A = PPAudio;
  PP.screens = PP.screens || {};
  const IN_VIEWER = !!window.claude;     // di dalam viewer artifact: unduh/cetak tidak tersedia

  /* =====================================================
     VIDEO
     ===================================================== */
  function ytId(u) { const m = String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/); return m ? m[1] : null; }
  const tm = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';

  PP.screens.video = function () {
    const inst = { timers: [], objUrl: null, unmount() { try { const v = document.querySelector('#vid'); if (v) { v.onplay = v.onpause = v.ontimeupdate = v.onloadedmetadata = v.onerror = null; v.pause(); } } catch (e) {} if (this.objUrl) URL.revokeObjectURL(this.objUrl); if (this.resume) this.resume(); } };
    inst.html = `<div class="wrap narrowish"><div class="panel fill pad vpanel"><div class="vhead"><h2 class="h-title" style="margin:0">Video Animasi</h2>
      <div class="chips" id="vTabs">${PP.VIDEOS.map((v, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-i="${i}">${i + 1}. ${v.yt ? 'YouTube' : 'Petualangan'}</button>`).join('')}</div><button class="btn sm" id="vSet" aria-label="Atur video (guru)">⚙ Guru</button></div><div id="vBox" class="vbox"></div></div></div>`;
    inst.mount = function (root) {
      const box = PP.$('#vBox', root); let cur = 0;
      const show = i => {
        cur = i; const v = PP.VIDEOS[i]; PP.$$('#vTabs .chip', root).forEach((c, k) => c.classList.toggle('on', k === i));
        { const o = PP.$('#vid', box); if (o) { o.onplay = o.onpause = o.ontimeupdate = o.onloadedmetadata = o.onerror = null; o.pause(); } }
        if (inst.objUrl) { URL.revokeObjectURL(inst.objUrl); inst.objUrl = null; }
        const saved = S.data.videoUrls[v.id] || '', src = v.src || saved, yt = v.yt || ytId(src);
        if (!yt && v.yt === undefined) { /* video berkas */ }
        let stage;
        if (yt) stage = `<div class="vstage ytcard" id="ytCard" role="button" tabindex="0" aria-label="Putar video YouTube"><div class="ytbg"></div><img class="ytth" alt="" src="https://i.ytimg.com/vi/${yt}/hqdefault.jpg" onerror="this.remove()"><svg class="yttri" viewBox="0 0 120 90" aria-hidden="true"><path d="M10 80 L10 10 L100 80 Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M10 68 h12 v12" fill="none" stroke="#fff" stroke-width="3"/><text x="2" y="48" fill="#ffd86b" font-size="12" font-weight="700">a</text><text x="48" y="88" fill="#ffd86b" font-size="12" font-weight="700">b</text><text x="62" y="36" fill="#ffd86b" font-size="12" font-weight="700">c</text></svg><div class="ytplay">▶</div><div class="ytcap">Ketuk untuk menonton</div></div>`;
        else if (src) stage = `<div class="vstage"><video id="vid" preload="metadata" playsinline webkit-playsinline controlslist="nodownload" ${v.poster ? `poster="${PP.esc(v.poster)}"` : ''} src="${PP.esc(src)}"></video><button class="vbig" id="vBig" aria-label="Putar video">▶</button></div>${controls()}<p class="err" id="vErr" hidden>Video tidak dapat dimuat. Periksa koneksi, lalu <a class="vlink" href="${PP.esc(src)}" target="_blank" rel="noopener">buka video langsung</a>.</p>`;
        else stage = `<div class="vstage ph"><div class="ph-in">${PP.img('ic_pause', 'ph-ic')}<b>Video belum tersedia</b><p>Guru dapat memasukkan video lewat tombol ⚙ Guru.</p></div></div>${controls(true)}`;
        box.innerHTML = `<div class="vwrap">${stage}</div>`;
        const stageEl = PP.$('.vstage', box); if (stageEl) stageEl.insertAdjacentHTML('afterend', '');
        box.insertAdjacentHTML('beforeend', `<div class="vfoot"><b class="vtt">${v.title}</b>${yt ? `<a class="btn sm red" href="https://www.youtube.com/watch?v=${yt}" target="_blank" rel="noopener">▶ Buka di YouTube</a>` : ''}</div>`);
        const setBtn = PP.$('#vSet', root);
        setBtn.onclick = () => {
          PP.ui.modal(`<h3>Masukkan video (untuk guru)</h3>
            <label class="fld">Pilih file MP4 dari perangkat<input type="file" id="vFile" accept="video/mp4,video/webm"></label>
            <p class="small muted">File yang dipilih hanya dipakai pada sesi ini.</p>
            <label class="fld">Atau tempel tautan MP4 / YouTube<input type="url" id="vUrl" placeholder="https://..." value="${PP.esc(saved)}"></label>
            <div class="row"><button class="btn green sm" id="vSave">Simpan tautan</button><button class="btn sm" id="vClear">Hapus tautan</button><button class="btn sm" data-close>Tutup</button></div>
            <p class="small muted">Tetap tersimpan: letakkan file di <code>assets/video/</code> lalu isi <code>src</code> pada <code>PP.VIDEOS</code> di <code>js/data.js</code>.</p><p class="err" id="vMsg" hidden></p>`);
          const M = PP.$('#modal');
          PP.$('#vFile', M).onchange = e => {
            const f = e.target.files[0]; if (!f) return;
            if (!/^video\//.test(f.type)) { const m = PP.$('#vMsg', M); m.hidden = false; m.textContent = 'File bukan video. Pilih file MP4.'; return; }
            inst.objUrl = URL.createObjectURL(f); PP.VIDEOS[i]._tmp = inst.objUrl;
            PP.ui.close && PP.ui.close();
            PP.$('.vwrap', box).innerHTML = `<div class="vstage"><video id="vid" preload="metadata" playsinline src="${inst.objUrl}"></video></div>`;
            const old = PP.$('.vctl', box); if (old) old.remove();
            PP.$('.vwrap', box).insertAdjacentHTML('afterend', controls()); bind(PP.$('#vid', box));
          };
          PP.$('#vSave', M).onclick = () => {
            const u = PP.$('#vUrl', M).value.trim(), m = PP.$('#vMsg', M);
            if (!/^https?:\/\//i.test(u) && !/^assets\//.test(u)) { m.hidden = false; m.textContent = 'Tautan harus diawali https://'; return; }
            S.data.videoUrls[v.id] = u; S.save(); PP.ui.close && PP.ui.close(); PP.ui.toast('Tautan video tersimpan.'); show(i);
          };
          PP.$('#vClear', M).onclick = () => { delete S.data.videoUrls[v.id]; S.save(); PP.ui.close && PP.ui.close(); show(i); };
        };
        const card = PP.$('#ytCard', box);
        if (card) {
          const canEmbed = /^https?:$/.test(location.protocol) && !/claude|anthropic/i.test(location.hostname);
          const go = () => {
            if (!canEmbed) { window.open('https://www.youtube.com/watch?v=' + yt, '_blank', 'noopener'); return; }
            card.classList.add('on'); card.removeAttribute('role');
            card.innerHTML = `<iframe src="https://www.youtube.com/embed/${yt}?rel=0&playsinline=1&modestbranding=1&autoplay=1" title="${PP.esc(v.title)}" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>`;
            try { Object.values(A.els).forEach(e => e.pause()); } catch (e) {}
          };
          card.onclick = go; card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
        }
        const vid = PP.$('#vid', box);
        if (vid) bind(vid);
        if (yt) { try { Object.values(A.els).forEach(e => e.pause()); } catch (e) {} } else resumeBgm();
              };
      const resumeBgm = () => { try { if (A.curId && A.set.master && A.set.musicOn && !A.userPaused) A.playBgm(A.curId); } catch (e) {} };
      inst.resume = resumeBgm;
      const controls = dis => `<div class="vctl ${dis ? 'off' : ''}"><button class="btn sm" id="vPlay" ${dis ? 'disabled' : ''} aria-label="Putar">▶</button>
        <input type="range" id="vProg" min="0" max="1000" value="0" ${dis ? 'disabled' : ''} aria-label="Progres video"><span class="small" id="vTime">0:00 / 0:00</span>
        <button class="btn sm" id="vMute" ${dis ? 'disabled' : ''} aria-label="Bisukan">♪</button><input type="range" id="vVol" min="0" max="1" step="0.05" value="0.8" ${dis ? 'disabled' : ''} aria-label="Volume video"><button class="btn sm" id="vFs" ${dis ? 'disabled' : ''} aria-label="Layar penuh">⛶</button></div>`;
      const bind = vid => {
        const $ = id => PP.$(id, box); vid.volume = 0.8;
        $('#vPlay').onclick = () => { vid.paused ? (A.pauseMusicForVideo && A.pauseMusicForVideo(), vid.play().catch(() => {})) : vid.pause(); };
        const big = $('#vBig'), fs = $('#vFs');
        if (big) big.onclick = $('#vPlay').onclick;
        vid.onclick = $('#vPlay').onclick;
        if (fs) fs.onclick = () => { const st = vid.parentElement; try { if (st.requestFullscreen) st.requestFullscreen().catch(() => {}); else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen(); else if (st.webkitRequestFullscreen) st.webkitRequestFullscreen(); } catch (e) {} };
        vid.onplay = () => { if (!$('#vPlay')) return; if (big) big.hidden = true; $('#vPlay').textContent = '❚❚'; Object.values(A.els).forEach(e => e.pause()); };
        vid.onpause = () => { if (!$('#vPlay')) return; if (big) big.hidden = false; $('#vPlay').textContent = '▶'; if (A.curId && A.set.master && A.set.musicOn && !A.userPaused) A.playBgm(A.curId); };
        vid.ontimeupdate = () => { if (!$('#vProg')) return; $('#vProg').value = vid.duration ? vid.currentTime / vid.duration * 1000 : 0; $('#vTime').textContent = tm(vid.currentTime) + ' / ' + tm(vid.duration); };
        vid.onloadedmetadata = vid.ontimeupdate;
        vid.onerror = () => { const e = $('#vErr'); if (e) e.hidden = false; if (big) big.hidden = true; };
        $('#vProg').oninput = e => { if (vid.duration) vid.currentTime = e.target.value / 1000 * vid.duration; };
        $('#vVol').oninput = e => { vid.volume = +e.target.value; vid.muted = false; $('#vMute').textContent = vid.volume ? '♪' : '✕'; };
        $('#vMute').onclick = () => { vid.muted = !vid.muted; $('#vMute').textContent = vid.muted ? '✕' : '♪'; };
      };
      PP.$('#vTabs', root).addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) show(+c.dataset.i); });
      show(0);
    };
    return inst;
  };

  /* =====================================================
     REFLEKSI
     ===================================================== */
  const RQ = ['Apa yang kamu temukan tentang hubungan luas persegi pada sisi-sisi segitiga siku-siku?', 'Apa yang kamu pelajari dari asal usul Teorema Pythagoras dan mengapa ilmu ini dikaji?', 'Bagian mana yang masih sulit, misalnya mencari sisi miring atau sisi siku-siku?', 'Di mana kamu bisa memakai Teorema Pythagoras dalam kehidupan sehari-hari? Beri satu contoh.'];
  PP.screens.refleksi = function () {
    const r = S.data.reflection || { a: ['', '', '', ''], date: 0 };
    return {
      html: `<div class="wrap narrow"><div class="panel fill pad"><h2 class="h-title">Refleksi Pembelajaran</h2>
        <p class="small" style="margin:0 0 4px">Ceritakan dengan kata-katamu sendiri. Tidak ada jawaban yang salah di sini.</p>
        <form id="rfForm" style="flex:1;min-height:0;display:flex;flex-direction:column">
        <div class="rv-head"><span class="pill" id="rfPos"></span><div class="dots" id="rfDots"></div></div>
        <div style="flex:1;min-height:0;display:flex;flex-direction:column">${RQ.map((q, i) => `<label class="fld rf-q" data-q="${i}" style="flex:1;min-height:0">${i + 1}. ${q}<textarea id="rf${i}" maxlength="600" style="flex:1;min-height:60px" placeholder="Tulis jawabanmu di sini">${PP.esc(r.a[i])}</textarea></label>`).join('')}</div>
        <p class="err" id="rfErr" hidden>Isi minimal satu jawaban sebelum menyimpan.</p>
        <p class="small muted" id="rfDate" style="margin:2px 0">${r.date ? 'Terakhir disimpan: ' + new Date(r.date).toLocaleString('id-ID') : 'Belum pernah disimpan.'}</p>
        <div class="row between" style="margin:2px 0 0"><button class="btn sm" type="button" id="rfPrev">◀</button><button class="btn green" type="submit">Simpan</button><button class="btn sm" type="button" id="rfNext">▶</button></div></form></div></div>`,
      mount(root) {
        let qi = 0;
        const draw = () => {
          PP.$$('.rf-q', root).forEach((l, i) => l.hidden = i !== qi);
          PP.$('#rfPos', root).textContent = 'Pertanyaan ' + (qi + 1) + ' / ' + RQ.length;
          PP.$('#rfDots', root).innerHTML = RQ.map((_, i) => `<i class="${i === qi ? 'on' : ''}"></i>`).join('');
          PP.$('#rfPrev', root).disabled = qi === 0; PP.$('#rfNext', root).disabled = qi === RQ.length - 1;
        };
        PP.$('#rfPrev', root).onclick = () => { qi--; draw(); }; PP.$('#rfNext', root).onclick = () => { qi++; draw(); };
        draw();
        PP.$('#rfForm', root).addEventListener('submit', e => {
          e.preventDefault();
          const a = RQ.map((_, i) => PP.$('#rf' + i, root).value.trim());
          if (!a.some(Boolean)) { PP.$('#rfErr', root).hidden = false; return; }
          PP.$('#rfErr', root).hidden = true;
          const first = !S.data.reflection; S.data.reflection = { a, date: Date.now() }; S.save();
          if (first) { S.award('reflect'); S.addXP(15, true); }
          PP.$('#rfDate', root).textContent = 'Terakhir disimpan: ' + new Date().toLocaleString('id-ID');
          PP.ui.toast('Refleksi tersimpan. Terima kasih!'); A.sfx('correct');
        });
      }
    };
  };

  /* =====================================================
     PROGRAM PENILAIAN
     ===================================================== */
  const GN = { A: 'Game A · Susun Segitiga', B: 'Game B · Temukan Panjang Sisi', C: 'Game C · Misi Jembatan', D: 'Game D · Tantangan Akhir' };
  function data() {
    const d = S.data, q = d.quiz.best, ql = d.quiz.last, score = S.finalScore();
    return { d, q, ql, score, pr: S.predikat(score) };
  }
  function csv() {
    const { d, q, score, pr } = data(), rows = [];
    const add = (...c) => rows.push(c.map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(','));
    add('Laporan Hasil Belajar - Petualangan Pythagoras'); add('Nama', d.name || '-'); add('Kelas', d.kelas || '-'); add('Tanggal cetak', new Date().toLocaleString('id-ID')); add();
    add('Ringkasan'); add('Progres misi', S.doneCount() + ' dari 6'); add('Level', S.level()); add('XP', d.xp); add('Total bintang', S.totalStars() + ' dari ' + S.maxStars());
    add('Nilai akhir', score); add('Predikat', pr.t); add('Jawaban benar (semua aktivitas)', d.tally.correct); add('Jawaban salah (semua aktivitas)', d.tally.wrong); add();
    add('Misi', 'Status', 'Bintang');
    PP.POS.forEach(p => add('Pos ' + p.id + ' ' + p.name, S.missionDone(p.id) ? 'Selesai' : 'Belum', S.missionDone(p.id) ? d.missions[p.id].stars : 0)); add();
    add('Game', 'Skor terbaik', 'Bintang', 'Jumlah main', 'Benar', 'Salah');
    ['A', 'B', 'C', 'D'].forEach(k => { const g = d.games[k]; add(GN[k], g ? g.best : 0, g ? g.stars : 0, g ? g.plays : 0, g ? g.correct : 0, g ? g.wrong : 0); }); add();
    add('Kuis', 'Nilai terbaik', 'Benar', 'Salah', 'Kosong', 'Percobaan'); add('Kuis Interaktif', q ? q.score : '-', q ? q.correct : '-', q ? q.wrong : '-', q ? q.blank : '-', d.quiz.attempts); add();
    add('Lencana', 'Diperoleh'); PP.BADGES.forEach(b => add(b.name, d.badges[b.id] ? 'Ya' : 'Belum'));
    return rows.join('\r\n');
  }
  function fileName() { return 'hasil-belajar-' + (S.data.name || 'siswa').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.csv'; }
  PP.acts['csv-dl'] = () => {
    try {
      const blob = new Blob(['﻿' + csv()], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName(); document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); PP.ui.toast('File CSV diunduh.');
    } catch (e) { PP.ui.toast('Unduhan gagal. Gunakan Salin CSV.', 'x'); }
  };
  PP.acts['csv-copy'] = () => {
    const t = csv();
    const fallback = () => PP.ui.modal(`<h3>Salin laporan CSV</h3><p class="modal-text small">Pilih semua teks di bawah, salin, lalu tempel ke Excel atau Google Sheets.</p><textarea class="csvbox" readonly rows="10">${PP.esc(t)}</textarea><div class="row end"><button class="btn" data-close>Tutup</button></div>`);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => PP.ui.toast('CSV disalin ke clipboard.'), fallback); else fallback();
  };
  PP.acts.print = () => { try { window.print(); } catch (e) { PP.ui.toast('Cetak tidak tersedia di sini.', 'x'); } };

  PP.screens.nilai = function () {
    const { d, q, score, pr } = data(), done = S.doneCount();
    const gr = ['A', 'B', 'C', 'D'].map(k => { const g = d.games[k]; return `<tr><td>${GN[k]}</td><td>${g ? g.best : '-'}</td><td>${g ? PP.stars(g.stars) : '-'}</td><td>${g ? g.correct : 0}</td><td>${g ? g.wrong : 0}</td></tr>`; }).join('');
    const tbl = (head, body) => `<div class="tbl-wrap"><table class="tbl"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
    const panes = {
      'Ringkasan': `<p class="pill big">Predikat: ${pr.t}</p><p>${pr.d}</p>
        <p class="small muted">Nilai akhir = 40% kuis + 40% rata-rata skor game + 20% progres misi.</p>
        <h3 class="h-sub">Progres Petualangan (${done}/6)</h3><div class="bar"><i style="width:${done / 6 * 100}%"></i></div>
        ${tbl(['Pos', 'Status', 'Bintang'], PP.POS.map(p => `<tr><td>${p.id}. ${p.name}</td><td>${S.missionDone(p.id) ? 'Selesai' : S.missionUnlocked(p.id) ? 'Terbuka' : 'Terkunci'}</td><td>${S.missionDone(p.id) ? PP.stars(d.missions[p.id].stars) : '-'}</td></tr>`).join(''))}`,
      'Game & Kuis': `<h3 class="h-sub">Skor Game</h3>${tbl(['Game', 'Terbaik', 'Bintang', 'Benar', 'Salah'], gr)}
        <h3 class="h-sub">Kuis Interaktif</h3>
        ${q ? `<div class="tbl-wrap"><table class="tbl"><tbody><tr><td>Nilai terbaik</td><td><b>${q.score}</b> (${S.predikat(q.score).t})</td></tr><tr><td>Benar / Salah / Kosong</td><td>${q.correct} / ${q.wrong} / ${q.blank}</td></tr><tr><td>Jumlah percobaan</td><td>${d.quiz.attempts}</td></tr></tbody></table></div>` : '<p class="muted">Kuis belum dikerjakan. <button class="btn sm green" data-go="kuis">Kerjakan Kuis</button></p>'}`,
      'Lencana': `<h3 class="h-sub">Lencana (${Object.keys(d.badges).length}/${PP.BADGES.length})</h3>
        <div class="badges">${PP.BADGES.map(b => `<div class="badge ${d.badges[b.id] ? 'got' : ''}" title="${b.desc}">${PP.img(b.icon)}<b>${b.name}</b><span>${b.desc}</span></div>`).join('')}</div>`,
      'Refleksi': d.reflection ? `<h3 class="h-sub">Refleksi</h3><ol class="small">${RQ.map((x, i) => `<li><b>${x}</b><br>${PP.esc(d.reflection.a[i]) || '-'}</li>`).join('')}</ol>` : '<p class="muted">Refleksi belum diisi. <button class="btn sm green" data-go="refleksi">Isi Refleksi</button></p>'
    };
    const names = Object.keys(panes);
    return {
      html: `<div class="wrap"><div class="panel fill pad report" id="report">
        <div class="rp-head"><div class="rp-av">${PP.img(PP.me().idle)}</div><div><h2 class="h-title" style="margin:0">Program Penilaian</h2><p style="margin:0"><b>${PP.esc(d.name || 'Belum mengisi nama')}</b>${d.kelas ? ' · Kelas ' + PP.esc(d.kelas) : ''}</p><p class="small muted" style="margin:0">Petualangan Pythagoras · ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
        ${d.name ? '' : '<p class="err" style="margin:2px 0">Nama belum diisi. <button class="btn sm" data-go="profil">Isi Profil</button></p>'}
        <div class="fin-stats"><div><b>${score}</b><span>Nilai Akhir</span></div><div><b>${S.totalStars()}/${S.maxStars()}</b><span>Bintang</span></div><div><b>Lv ${S.level()}</b><span>${d.xp} XP</span></div><div><b>${d.tally.correct}/${d.tally.wrong}</b><span>Benar/Salah</span></div></div>
        <nav class="tabs no-print">${names.map((n, i) => `<button class="tab ${i ? '' : 'on'}" data-rp="${i}">${n}</button>`).join('')}</nav>
        <div class="scrollbox grow">${names.map((n, i) => `<div class="rp-pane" data-p="${i}" ${i ? 'hidden' : ''}>${panes[n]}</div>`).join('')}</div>
        <div class="row center no-print" style="margin:4px 0 0">${IN_VIEWER ? '' : '<button class="btn green sm" data-act="print">Cetak</button><button class="btn blue sm" data-act="csv-dl">Unduh CSV</button>'}<button class="btn sm ${IN_VIEWER ? 'blue' : ''}" data-act="csv-copy">Salin CSV</button></div>
      </div></div>`,
      mount(root) {
        PP.$$('[data-rp]', root).forEach(b => b.onclick = () => {
          PP.$$('[data-rp]', root).forEach(x => x.classList.toggle('on', x === b));
          PP.$$('.rp-pane', root).forEach(p => p.hidden = p.dataset.p !== b.dataset.rp);
        });
      }
    };
  };
})();
