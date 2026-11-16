/* Kegiatan Pendahuluan: Doa -> Kesepakatan Kelas -> Lagu Kebangsaan -> Absensi -> Apersepsi 1 -> Apersepsi 2 -> Materi.
   Rute: #pendahuluan (beranda alur), #pendahuluan-doa | -sepakat | -lagu | -aps1 | -aps2. Absensi memakai layar Absen yang sudah ada.
   Penyimpanan: PPStore.data.pend (progres), localStorage 'pp_doa_v1' (teks doa yang diedit guru), IndexedDB 'pp_media' (video lagu). */
(function () {
  'use strict';
  const A = PPArt, S = PPStore, $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const P = () => { const d = S.data; d.pend = d.pend || {}; const p = d.pend; p.done = p.done || {}; p.jawab = p.jawab || {}; if (p.narr == null) p.narr = false; if (p.vol == null) p.vol = 0.9; return p; };
  const STEPS = [['doa', 'Doa'], ['sepakat', 'Kesepakatan'], ['lagu', 'Lagu Kebangsaan'], ['absen', 'Absensi'], ['aps1', 'Apersepsi 1'], ['aps2', 'Apersepsi 2']];
  const ROUTE = { doa: 'pendahuluan-doa', sepakat: 'pendahuluan-sepakat', lagu: 'pendahuluan-lagu', absen: 'absen', aps1: 'pendahuluan-aps1', aps2: 'pendahuluan-aps2' };
  const nextOf = k => { const i = STEPS.findIndex(s => s[0] === k); return i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1][0] : null; };
  const done = k => !!P().done[k];
  const mark = k => { P().done[k] = Date.now(); S.save(); };
  const goStep = k => PP.go(k ? ROUTE[k] : 'materi');
  const sfx = n => { try { PPAudio.sfx(n); } catch (e) { } };
  const cur = { timers: [], off: [], fs: [] };                   // sumber daya layar aktif (dibersihkan saat pindah halaman)
  const later = (f, ms) => { const t = setTimeout(f, ms); cur.timers.push(t); return t; };
  const clearCur = () => { cur.timers.forEach(clearTimeout); cur.timers = []; cur.off.forEach(f => { try { f(); } catch (e) { } }); cur.off = []; };

  /* ---------- AUDIO: ducking musik latar (tanpa memulai ulang lagu) ---------- */
  const Duck = {
    n: 0, prev: 1, raf: 0,
    ramp(to, ms) {
      cancelAnimationFrame(Duck.raf); const from = PPAudio.duck, t0 = performance.now();
      const step = now => { const k = Math.min(1, (now - t0) / ms); PPAudio.duck = from + (to - from) * k; try { PPAudio.applyVolumes(); } catch (e) { } if (k < 1) Duck.raf = requestAnimationFrame(step); };
      if (ms <= 0) { PPAudio.duck = to; try { PPAudio.applyVolumes(); } catch (e) { } return; } Duck.raf = requestAnimationFrame(step);
    },
    on() { if (Duck.n++ === 0) { Duck.prev = PPAudio.duck > 0.95 ? 1 : PPAudio.duck; Duck.ramp(0.0, 500); } },
    off() { if (Duck.n === 0) return; if (--Duck.n === 0) Duck.ramp(Duck.prev || 1, 1600); },
    reset() { if (Duck.n > 0) { Duck.n = 0; Duck.ramp(Duck.prev || 1, 900); } }
  };
  /* ---------- NARASI (suara perangkat, opsional) + animasi mulut ---------- */
  const Tts = {
    ok: () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    stop() { try { speechSynthesis.cancel(); } catch (e) { } },
    say(text, lang, onEnd) {
      Tts.stop(); const p = P(); if (!p.narr || !Tts.ok()) { onEnd && onEnd(); return false; }
      try { const u = new SpeechSynthesisUtterance(text); u.lang = lang || 'id-ID'; u.volume = p.vol; u.rate = 0.92; u.onend = u.onerror = () => onEnd && onEnd(); speechSynthesis.speak(u); return true; } catch (e) { onEnd && onEnd(); return false; }
    }
  };
  const talkFor = (el, text) => { if (!el) return; el.classList.add('pd-talk'); const ms = Math.min(9000, Math.max(1200, String(text).length * 55)); later(() => el.classList.remove('pd-talk'), ms); };
  const typeInto = (el, text, ms) => { el.textContent = ''; let i = 0; const iv = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(iv); }, ms || 24); cur.off.push(() => clearInterval(iv)); };
  const fit = (el, min) => { if (!el) return; el.style.fontSize = ''; let fs = parseFloat(getComputedStyle(el).fontSize) || 20, n = 0; min = min || 13; while (el.scrollHeight > el.clientHeight + 1 && fs > min && n++ < 60) { fs *= 0.94; el.style.fontSize = fs + 'px'; } };

  /* ---------- DATA DOA ---------- */
  const ISLAM = [
    { judul: 'Doa Sebelum Belajar', arab: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا وَرَسُولًا، رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا',
      latin: "Rodhiitu billaahi robbaa, wa bil islaami diinaa, wa bi Muhammadin nabiyyaa wa rosuulaa. Robbi zidnii 'ilmaa warzuqnii fahmaa.",
      arti: 'Aku ridha Allah sebagai Tuhanku, Islam sebagai agamaku, Nabi Muhammad sebagai nabi dan rasulku. Ya Allah, tambahkanlah ilmu kepadaku dan berikanlah aku pemahaman.' },
    { judul: 'Doa Nabi Musa AS', arab: 'رَبِّ اشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِي أَمْرِي ۝ وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي ۝ يَفْقَهُوا قَوْلِي',
      latin: "Robbisrohli sodri, wayassirli amri, wahlul 'uqdatammil lisani yafqohu qouli.",
      arti: 'Ya Tuhanku, lapangkanlah dadaku, mudahkanlah urusanku, dan lepaskanlah kekakuan dari lidahku, agar mereka mengerti perkataanku.' }
  ];
  const AGAMA = [
    { k: 'islam', nama: 'Islam', pose: 'pray', mus: true, ic: 'crescent' },
    { k: 'kristen', nama: 'Kristen Protestan', pose: 'fold', ic: 'cross' },
    { k: 'katolik', nama: 'Katolik', pose: 'fold', ic: 'cross2' },
    { k: 'hindu', nama: 'Hindu', pose: 'anjali', ic: 'lotus' },
    { k: 'buddha', nama: 'Buddha', pose: 'anjali', ic: 'wheel' },
    { k: 'konghucu', nama: 'Konghucu', pose: 'anjali', ic: 'scroll' }
  ];
  const KEY = 'pp_doa_v1';
  const loadEdit = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const saveEdit = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (e) { PP.ui.toast('Penyimpanan penuh atau diblokir.'); return false; } };
  const doaOf = k => { const ed = loadEdit()[k]; if (k === 'islam' && !ed) return ISLAM; if (ed) return [Object.assign({ judul: 'Doa Sebelum Belajar', arab: '', latin: '', arti: '', cat: '' }, ed)]; return [{ judul: 'Doa Sebelum Belajar', arab: '', latin: '', arti: '', kosong: true }]; };
  const AGICON = {
    crescent: '<path d="M42 8 A22 22 0 1 0 56 40 A17 17 0 1 1 42 8Z" fill="#ffd34d" stroke="#3b2412" stroke-width="3" stroke-linejoin="round"/><path d="M50 14 l2.4 5.2 5.6 .8 -4 4 1 5.6 -5 -2.8 -5 2.8 1 -5.6 -4 -4 5.6 -.8z" fill="#fff2a8" stroke="#3b2412" stroke-width="2"/>',
    cross: '<path d="M26 6 H38 V22 H54 V34 H38 V58 H26 V34 H10 V22 H26Z" fill="#fff8e6" stroke="#3b2412" stroke-width="3" stroke-linejoin="round"/><path d="M29 12 V54" stroke="#e8c24a" stroke-width="3"/>',
    cross2: '<path d="M26 4 H38 V20 H54 V32 H38 V54 H26 V32 H10 V20 H26Z" fill="#fff8e6" stroke="#3b2412" stroke-width="3" stroke-linejoin="round"/><path d="M32 58 q-14 0 -14 -8 M32 58 q14 0 14 -8" fill="none" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="58" r="3" fill="#e8c24a" stroke="#3b2412" stroke-width="1.6"/>',
    lotus: '<path d="M32 12 Q44 28 32 50 Q20 28 32 12Z" fill="#ff9bb5" stroke="#3b2412" stroke-width="3" stroke-linejoin="round"/><path d="M14 22 Q34 28 32 50 Q8 46 14 22Z" fill="#ffc2d4" stroke="#3b2412" stroke-width="3" stroke-linejoin="round"/><path d="M50 22 Q30 28 32 50 Q56 46 50 22Z" fill="#ffc2d4" stroke="#3b2412" stroke-width="3" stroke-linejoin="round"/><path d="M10 52 Q32 60 54 52" fill="none" stroke="#3f9a3a" stroke-width="4" stroke-linecap="round"/>',
    wheel: '<circle cx="32" cy="32" r="22" fill="#ffd34d" stroke="#3b2412" stroke-width="3"/><circle cx="32" cy="32" r="7" fill="#fff2a8" stroke="#3b2412" stroke-width="2.4"/><g stroke="#3b2412" stroke-width="3" stroke-linecap="round"><path d="M32 10 V25 M32 39 V54 M10 32 H25 M39 32 H54 M16 16 L26 26 M38 38 L48 48 M48 16 L38 26 M26 38 L16 48"/></g>',
    scroll: '<path d="M14 12 H46 Q52 12 52 18 V48 Q52 54 46 54 H18" fill="#fff8e6" stroke="#3b2412" stroke-width="3" stroke-linejoin="round"/><path d="M14 12 Q8 12 8 18 Q8 24 14 24 V48 Q14 54 20 54 Q26 54 26 48" fill="#e8c24a" stroke="#3b2412" stroke-width="3" stroke-linejoin="round"/><path d="M30 24 H46 M30 33 H46 M30 42 H42" stroke="#c0392b" stroke-width="3" stroke-linecap="round"/>'
  };
  const agIcon = k => `<svg viewBox="0 0 64 64" class="pd-agic" aria-hidden="true">${AGICON[k]}</svg>`;

  /* ---------- KERANGKA UMUM ---------- */
  const chips = (active) => `<ol class="pd-steps" aria-label="Langkah kegiatan pendahuluan">${STEPS.map((s, i) => `<li class="${s[0] === active ? 'on' : ''} ${done(s[0]) ? 'ok' : ''}"><span>${done(s[0]) ? '✓' : i + 1}</span><em>${s[1]}</em></li>`).join('')}</ol>`;
  const frame = (step, inner) => `<div class="pdk pdk-${step}">${chips(step)}<div class="pd-stage" id="pdStage">${inner}</div><div class="pd-nav" id="pdNav"></div></div>`;
  const nav = (btns) => { const n = $('#pdNav'); if (!n) return; n.innerHTML = btns.map(b => `<button class="btn ${b.c || ''} ${b.big ? 'lg' : ''}" id="${b.id}" ${b.dis ? 'disabled' : ''}>${b.t}</button>`).join(''); btns.forEach(b => { const e = $('#' + b.id); if (e && b.f) e.onclick = () => { sfx('tick'); b.f(); }; }); };
  const particles = (n) => { let h = ''; for (let i = 0; i < (n || 14); i++) h += `<i style="left:${(i * 37 + 11) % 100}%;animation-delay:${(i * 0.7) % 6}s;animation-duration:${6 + (i % 5)}s;--s:${0.5 + (i % 4) * 0.25}"></i>`; return `<div class="pd-part" aria-hidden="true">${h}</div>`; };
  const bubble = (name, id) => `<div class="pd-bub"><b>${esc(name)}</b><p id="${id}"></p></div>`;
  const audioBar = () => `<div class="pd-aud" role="group" aria-label="Pengaturan suara narasi"><button class="btn sm ${P().narr ? 'green' : ''}" id="pdNarr" aria-pressed="${P().narr}">${P().narr ? 'Narasi: Hidup' : 'Narasi: Mati'}</button><label class="pd-vol">Volume <input type="range" id="pdVol" min="0" max="1" step="0.05" value="${P().vol}" aria-label="Volume narasi"></label></div>`;
  const wireAudio = (onChange) => { const b = $('#pdNarr'), v = $('#pdVol'); if (b) b.onclick = () => { const p = P(); p.narr = !p.narr; S.save(); b.className = 'btn sm ' + (p.narr ? 'green' : ''); b.textContent = p.narr ? 'Narasi: Hidup' : 'Narasi: Mati'; b.setAttribute('aria-pressed', p.narr); if (!p.narr) Tts.stop(); else onChange && onChange(); if (p.narr && !Tts.ok()) PP.ui.toast('Perangkat ini tidak mendukung suara narasi.'); }; if (v) v.oninput = () => { P().vol = +v.value; S.save(); }; };

  /* =====================================================
     BERANDA ALUR
     ===================================================== */
  function hub(root) {
    const p = P(), nextK = (STEPS.find(s => !done(s[0])) || [])[0];
    const ic = { doa: A.crescent(), sepakat: A.icons.belajar, lagu: A.flag(), absen: PP.ICONS.absen, aps1: A.icons.perlengkapan, aps2: A.icons.waktu };
    root.innerHTML = `<div class="pdk pd-hub"><div class="pd-hubhead"><div class="pd-hubic">${PP.ICONS.pendahuluan}</div><div><h2 class="h-title" style="margin:0">Kegiatan Pendahuluan</h2><p class="small" style="margin:0">Ikuti urutan ini sebelum masuk ke materi Teorema Pythagoras.</p></div></div>
      <ol class="pd-flow">${STEPS.map((s, i) => { const lock = (s[0] === 'aps1' || s[0] === 'aps2') && !done('absen'); return `<li><button class="pd-fl ${done(s[0]) ? 'ok' : ''} ${s[0] === nextK ? 'next' : ''}" data-s="${s[0]}" ${lock ? 'data-lock="1"' : ''}><span class="pd-fn">${done(s[0]) ? '✓' : i + 1}</span><span class="pd-fi">${ic[s[0]]}</span><b>${s[1]}</b><small>${lock ? 'Setelah absensi' : done(s[0]) ? 'Selesai' : s[0] === nextK ? 'Berikutnya' : 'Belum'}</small></button></li>`; }).join('')}</ol>
      <div class="pd-hubnav"><button class="btn green lg" id="pdGo">${nextK ? (STEPS.some(s => done(s[0])) ? 'Lanjutkan' : 'Mulai Kegiatan') : 'Mulai Belajar Pythagoras'}</button><button class="btn" id="pdReset">Ulangi dari awal</button></div></div>`;
    $$('.pd-fl', root).forEach(b => b.onclick = () => { if (b.dataset.lock) { PP.ui.toast('Selesaikan absensi dulu, baru Apersepsi.'); sfx('wrong'); return; } p.flow = true; S.save(); goStep(b.dataset.s); });
    $('#pdGo').onclick = () => { p.flow = true; S.save(); goStep(nextK || null); };
    $('#pdReset').onclick = () => PP.ui.confirm('Ulangi kegiatan pendahuluan dari awal? Data absensi tidak dihapus.', 'Ya, ulangi', () => { p.done = {}; p.jawab = {}; S.save(); PP.go('pendahuluan'); });
  }

  /* =====================================================
     1. DOA SEBELUM BELAJAR
     ===================================================== */
  function doa(root) {
    root.innerHTML = frame('doa', '');
    const st = $('#pdStage'); let ag = null, idx = 0, started = false;
    const finishAll = () => { Tts.stop(); Duck.reset(); };
    cur.off.push(finishAll);
    const pilih = () => {
      Tts.stop(); Duck.reset(); ag = null; started = false;
      st.innerHTML = `<div class="pd-pilih">${particles(10)}<div class="pd-deco" aria-hidden="true"><span class="l1">${A.lantern()}</span><span class="m1">${A.crescent()}</span><span class="l2">${A.lantern()}</span></div>
        <h2 class="pd-title">MARILAH KITA BERDOA SEBELUM BELAJAR</h2>
        <p class="pd-sub">Sebelum memulai pembelajaran, mari kita berdoa menurut agama dan kepercayaan masing-masing agar kegiatan belajar hari ini berjalan lancar dan ilmu yang kita pelajari menjadi bermanfaat.</p>
        <div class="pd-ag">${AGAMA.map((a, i) => `<button class="pd-agc" data-k="${a.k}" style="--i:${i}">${agIcon(a.ic)}<b>${a.nama}</b></button>`).join('')}</div></div>`;
      $$('.pd-agc', st).forEach(b => b.onclick = () => { sfx('tick'); b.classList.add('pop'); later(() => buka(b.dataset.k), 260); });
      nav([{ id: 'pdBack', t: 'Kembali', f: () => PP.go('pendahuluan') }]);
      fit($('.pd-sub', st), 11);
    };
    const buka = (k) => {
      ag = AGAMA.find(a => a.k === k); idx = 0; started = false; P().agama = k; S.save(); Duck.on();
      draw();
    };
    const draw = () => {
      const list = doaOf(ag.k), d = list[idx], isI = ag.k === 'islam' && list === ISLAM, mus = !!ag.mus;
      const pose = started ? ag.pose : 'stand', eyes = started ? 'closed' : 'open';
      const chars = A.char({ sex: 'm', mus, pose, eyes }) + A.char({ sex: 'f', mus, pose, eyes });
      st.innerHTML = `<div class="pd-doa ${isI ? 'islam' : 'umum'} ${started ? 'mulai' : ''}">${particles(16)}
        <div class="pd-who" aria-hidden="true">${chars}</div>
        <div class="pd-panel"><div class="pd-ptop"><span class="pd-ptl">${A.lantern()}</span><div class="pd-badge">${isI ? 'DOA SEBELUM BELAJAR' : 'DOA ' + ag.nama.toUpperCase()}</div><span class="pd-ptr">${A.lantern()}</span></div>
          <div class="pd-ptxt" id="pdTxt">${d.kosong ? `<p class="pd-empty"><b>Teks doa ${esc(ag.nama)} belum diisi.</b><br>Guru atau pembimbing agama dapat mengisinya lewat tombol “Ubah Teks Doa”. Teks suci sebaiknya diverifikasi sebelum dipakai di kelas.</p>` : ''}
            ${d.judul && isI ? `<div class="pd-dj">${esc(d.judul)} <small>(${idx + 1}/${list.length})</small></div>` : ''}
            ${d.arab ? `<div class="pd-ar pd-rv" lang="ar" dir="rtl">${esc(d.arab).split('۝').join('<span class="pd-ayah" aria-hidden="true"></span>')}</div>` : ''}
            ${d.latin ? `<div class="pd-lt pd-rv"><span class="pd-tag">Latin</span>${esc(d.latin)}</div>` : ''}
            ${d.arti ? `<div class="pd-ti pd-rv"><span class="pd-tag">Artinya</span>“${esc(d.arti)}”</div>` : ''}
            ${d.cat ? `<div class="pd-cat pd-rv">${esc(d.cat)}</div>` : ''}</div>
          <div class="pd-pbot">${audioBar()}<button class="btn sm" id="pdEdit">Ubah Teks Doa</button></div></div></div>`;
      wireAudio(() => ucap(d));
      $('#pdEdit').onclick = () => editor(ag.k);
      const btns = [{ id: 'pdBack', t: 'Kembali', f: () => { if (idx > 0) { idx--; started = started; draw(); } else pilih(); } }];
      if (!started) btns.push({ id: 'pdStart', t: 'Mulai Berdoa', c: 'gold', big: true, f: () => { started = true; sfx('star'); draw(); ucap(doaOf(ag.k)[idx]); } });
      else {
        if (idx < list.length - 1) btns.push({ id: 'pdNext', t: 'Doa Selanjutnya', c: 'blue', f: () => { idx++; draw(); ucap(doaOf(ag.k)[idx]); } });
        btns.push({ id: 'pdFin', t: 'Selesai Berdoa', c: 'green', big: true, f: () => { Tts.stop(); Duck.reset(); mark('doa'); P().flow = true; S.save(); sfx('star'); selesaiAnim(() => goStep('sepakat')); } });
      }
      nav(btns);
      later(() => { const t = $('#pdTxt'); if (t) fit(t, 6); }, 60);
      if (started) { const tx = $('#pdTxt'); $$('.pd-rv', tx).forEach((e, i) => { e.style.animationDelay = (i * 0.9) + 's'; }); }
    };
    const ucap = (d) => { if (!P().narr || !d) return; const txt = [d.judul, d.latin, d.arti].filter(Boolean).join('. '); Tts.say(txt, 'id-ID'); };
    const selesaiAnim = (cb) => { const o = document.createElement('div'); o.className = 'pd-done'; o.innerHTML = `<div class="pd-donebox"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="#2fa84f" stroke="#3b2412" stroke-width="4"/><path class="tk" d="M22 42 L35 55 L59 27" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg><b>Doa selesai. Semoga ilmunya bermanfaat!</b></div>`; $('.pdk').appendChild(o); later(cb, 1100); };
    const editor = (k) => {
      const ed = loadEdit(), base = doaOf(k)[0], v = ed[k] || (k === 'islam' ? {} : base);
      PP.ui.modal(`<h3>Ubah Teks Doa: ${esc(AGAMA.find(a => a.k === k).nama)}</h3><p class="small muted">Isi dengan teks yang sudah diverifikasi guru/pembimbing agama. ${k === 'islam' ? 'Mengisi di sini akan menggantikan dua doa bawaan (setel ulang untuk mengembalikan).' : ''}</p>
        <label class="pd-f">Teks asli (Arab/aksara/bahasa doa)<textarea id="edA" rows="3" dir="auto">${esc(v.arab || '')}</textarea></label>
        <label class="pd-f">Latin / bacaan<textarea id="edL" rows="3">${esc(v.latin || '')}</textarea></label>
        <label class="pd-f">Arti / terjemahan<textarea id="edT" rows="3">${esc(v.arti || '')}</textarea></label>
        <label class="pd-f">Sumber / diverifikasi oleh<input id="edC" maxlength="120" value="${esc(v.cat || '')}"></label>
        <div class="row end"><button class="btn" id="edR">Setel ulang</button><button class="btn" data-close>Batal</button><button class="btn green" id="edS">Simpan</button></div>`);
      $('#edS').onclick = () => { const o = loadEdit(); o[k] = { arab: $('#edA').value.trim(), latin: $('#edL').value.trim(), arti: $('#edT').value.trim(), cat: $('#edC').value.trim() }; if (saveEdit(o)) { PP.ui.close(); idx = 0; draw(); PP.ui.toast('Teks doa disimpan.'); } };
      $('#edR').onclick = () => { const o = loadEdit(); delete o[k]; saveEdit(o); PP.ui.close(); idx = 0; draw(); };
    };
    pilih();
  }

  /* =====================================================
     2. KESEPAKATAN KELAS
     ===================================================== */
  const SK = [
    ['waktu', 'Ketepatan Waktu', 'Datang ke sekolah dan masuk kelas tepat waktu, serta menghargai waktu belajar.'],
    ['belajar', 'Sikap Saat Belajar', 'Menyimak dan mendengarkan dengan baik saat guru atau teman sedang berbicara, serta mengangkat tangan sebelum berbicara.'],
    ['hormat', 'Saling Menghormati', 'Menggunakan bahasa yang sopan, tidak berkata kasar, tidak mengejek, dan menolak tindakan bullying atau perundungan.'],
    ['perlengkapan', 'Tanggung Jawab Perlengkapan', 'Membawa perlengkapan sekolah secara mandiri dan mengembalikan barang atau buku ke tempat semula.'],
    ['bersih', 'Kebersihan Lingkungan', 'Menjaga kebersihan dan kerapian kelas serta melaksanakan tugas piket sesuai jadwal.'],
    ['gawai', 'Penggunaan Gawai/Ponsel', 'Tidak menggunakan ponsel atau alat komunikasi saat jam pelajaran berlangsung kecuali atas izin guru.']
  ];
  const OPEN1 = 'Sebelum kita mulai belajar, mari kita sepakati beberapa aturan bersama agar pembelajaran menjadi nyaman, tertib, menyenangkan, dan saling menghargai.';
  function sepakat(root) {
    root.innerHTML = frame('sepakat', ''); const st = $('#pdStage'); const seen = {}; let sel = 0;
    const who = (pose, one) => `<div class="pd-duo" aria-hidden="true">${one ? '' : `<span class="pd-g girl">${A.char({ sex: 'f', pose: 'stand', talk: true })}</span>`}<span class="pd-g boy">${A.char({ sex: 'm', pose, talk: true })}</span></div>`;
    const intro = () => {
      st.innerHTML = `<div class="pd-sk intro"><div class="pd-board"><div class="pd-boardtitle">★ KESEPAKATAN KELAS ★</div><div class="pd-boardgrid">${SK.map(s => `<span>${A.icons[s[0]]}</span>`).join('')}</div></div>${who('explain')}
        <div class="pd-say"><h2 class="pd-title sm">YUK, BUAT KESEPAKATAN KELAS!</h2>${bubble('Didit', 'skSay')}${audioBar()}</div></div>`;
      const el = $('#skSay'); typeInto(el, OPEN1, 22); talkFor($('.pd-duo'), OPEN1); Tts.say(OPEN1);
      wireAudio(() => Tts.say(OPEN1)); cur.off.push(() => Tts.stop());
      nav([{ id: 'pdBack', t: 'Kembali', f: () => PP.go('pendahuluan-doa') }, { id: 'pdSee', t: 'Lihat Kesepakatan', c: 'gold', big: true, f: () => { Tts.stop(); cards(); } }]);
    };
    const cards = () => {
      st.innerHTML = `<div class="pd-sk cards"><div class="pd-ribbon">KESEPAKATAN KELAS</div><div class="pd-skg">${SK.map((s, i) => `<button class="pd-skc ${seen[i] ? 'seen' : ''}" data-i="${i}" style="--i:${i}"><span class="pd-ski">${A.icons[s[0]]}</span><b>${s[1]}</b>${seen[i] ? '<i class="pd-ck">✓</i>' : ''}</button>`).join('')}</div><p class="pd-hint small">Ketuk setiap kartu untuk membaca penjelasannya (${Object.keys(seen).length}/6).</p></div>`;
      $$('.pd-skc', st).forEach(b => b.onclick = () => { sel = +b.dataset.i; sfx('tick'); detail(); });
      nav([{ id: 'pdBack', t: 'Kembali', f: intro }, { id: 'pdNx', t: 'Selanjutnya', c: 'blue', f: final }]);
    };
    const detail = () => {
      const s = SK[sel]; seen[sel] = 1;
      st.innerHTML = `<div class="pd-sk detail"><div class="pd-big">${A.icons[s[0]]}</div><div class="pd-say"><div class="pd-num">Kesepakatan ${sel + 1} dari 6</div><h2 class="pd-title sm">${s[1].toUpperCase()}</h2><p class="pd-skt" id="skT"></p></div>${who('explain', true)}</div>`;
      typeInto($('#skT'), s[2], 18); talkFor($('.pd-duo'), s[2]);
      nav([{ id: 'pdBack', t: 'Kembali', f: cards }, { id: 'pdNx', t: sel < 5 ? 'Selanjutnya' : 'Selesai Membaca', c: 'blue', f: () => { if (sel < 5) { sel++; detail(); } else final(); } }]);
    };
    const final = () => {
      st.innerHTML = `<div class="pd-sk final">${particles(10)}<div class="pd-duo big" aria-hidden="true"><span class="pd-g girl">${A.char({ sex: 'f', pose: 'wave', talk: true })}</span><span class="pd-g boy">${A.char({ sex: 'm', pose: 'cheer', talk: true })}</span></div>
        <div class="pd-say"><h2 class="pd-title sm">Apakah kita semua siap mematuhi kesepakatan kelas ini?</h2><div class="pd-ready"><button class="btn green lg" id="skReady">Saya Siap!</button><button class="btn gold lg" id="skGo">Mari Mulai Belajar!</button></div><div class="pd-okmark" id="skOk" hidden><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="#2fa84f" stroke="#3b2412" stroke-width="4"/><path class="tk" d="M22 42 L35 55 L59 27" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div></div>`;
      const ok = (cb) => { const m = $('#skOk'); m.hidden = false; m.classList.remove('go'); void m.offsetWidth; m.classList.add('go'); sfx('star'); mark('sepakat'); if (cb) later(cb, 1100); };
      $('#skReady').onclick = () => ok();
      $('#skGo').onclick = () => ok(() => goStep('lagu'));
      nav([{ id: 'pdBack', t: 'Kembali', f: cards }, { id: 'pdNx', t: 'Selanjutnya', c: 'blue', f: () => { mark('sepakat'); goStep('lagu'); } }]);
    };
    intro();
  }

  /* =====================================================
     3. LAGU KEBANGSAAN (unggah video, disimpan di IndexedDB)
     ===================================================== */
  const DB = {
    open() { return new Promise((res, rej) => { try { const r = indexedDB.open('pp_media', 1); r.onupgradeneeded = () => r.result.createObjectStore('v'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); },
    async get(k) { const db = await DB.open(); return new Promise((res, rej) => { const q = db.transaction('v').objectStore('v').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); }); },
    async set(k, v) { const db = await DB.open(); return new Promise((res, rej) => { const t = db.transaction('v', 'readwrite'); t.objectStore('v').put(v, k); t.oncomplete = () => res(true); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); },
    async del(k) { const db = await DB.open(); return new Promise((res, rej) => { const t = db.transaction('v', 'readwrite'); t.objectStore('v').delete(k); t.oncomplete = () => res(true); t.onerror = () => rej(t.error); }); }
  };
  const fmtT = s => { s = Math.max(0, s | 0); return (s / 60 | 0) + ':' + String(s % 60).padStart(2, '0'); };
  function lagu(root) {
    root.innerHTML = frame('lagu', `<div class="pd-lg"><div class="pd-lgtop"><span class="pd-fl1">${A.flag()}</span><h2 class="pd-title sm">MARI MENYANYIKAN LAGU KEBANGSAAN INDONESIA RAYA</h2><span class="pd-fl2">${A.flag()}</span></div>
      <div class="pd-lgmain"><div class="pd-frame" id="vFrame"><div class="pd-ribbonf" aria-hidden="true"></div><div class="pd-screen"><video id="vid" playsinline preload="metadata"></video><div class="pd-vempty" id="vEmpty"><b>Belum ada video</b><span>Unggah video lagu kebangsaan milikmu (MP4).</span></div></div>
        <div class="pd-vctl" id="vCtl"><button class="pd-vb" id="vPlay" aria-label="Putar">▶</button><input type="range" id="vSeek" min="0" max="1000" value="0" aria-label="Posisi video"><span class="pd-vt" id="vTime">0:00</span><button class="pd-vb" id="vMute" aria-label="Suara">🔊</button><input type="range" id="vVol" min="0" max="1" step="0.05" value="1" aria-label="Volume video"><button class="pd-vb" id="vFs" aria-label="Layar penuh">⛶</button></div></div>
        <div class="pd-lgside"><div class="pd-hormat" aria-hidden="true">${A.char({ sex: 'm', pose: 'hormat' })}</div><div class="pd-file"><div class="pd-fname" id="vName">Belum ada file</div><div class="row"><label class="btn sm blue" for="vFile" id="vPick">Pilih Video</label><input type="file" id="vFile" accept="video/mp4,video/*" hidden><button class="btn sm" id="vDel" hidden>Hapus</button></div></div></div></div></div>`);
    const vid = $('#vid'), ctl = $('#vCtl'); let url = null, played = false;
    const setUrl = (blob, name) => { if (url) URL.revokeObjectURL(url); url = blob ? URL.createObjectURL(blob) : null; if (url) vid.src = url; else vid.removeAttribute('src'); vid.load(); $('#vEmpty').hidden = !!url; $('#vName').textContent = blob ? `${name || 'video'} · ${(blob.size / 1048576).toFixed(1)} MB` : 'Belum ada file'; $('#vDel').hidden = !blob; $('#vPick').textContent = blob ? 'Ganti Video' : 'Pilih Video'; ctl.classList.toggle('dis', !blob); };
    cur.off.push(() => { try { vid.onplay = vid.onpause = vid.onended = vid.ontimeupdate = vid.onerror = null; vid.pause(); vid.removeAttribute('src'); vid.load(); } catch (e) { } if (url) URL.revokeObjectURL(url); url = null; if (ducked) { ducked = false; Duck.off(); } });
    let ducked = false; const dOn = () => { if (!ducked) { ducked = true; Duck.on(); } }, dOff = () => { if (ducked) { ducked = false; Duck.off(); } };
    DB.get('anthem').then(r => { if (r && r.blob) setUrl(r.blob, r.name); else setUrl(null); }).catch(() => { setUrl(null); $('#vName').textContent = 'Penyimpanan video tidak tersedia di peramban ini'; });
    $('#vFile').onchange = async e => {
      const f = e.target.files && e.target.files[0]; if (!f) return; if (!/^video\//.test(f.type) && !/\.(mp4|webm|mov|m4v|ogv)$/i.test(f.name)) return PP.ui.toast('Pilih file video (MP4).');
      if (f.size > 400 * 1048576) return PP.ui.toast('Video terlalu besar (maksimal 400 MB).');
      setUrl(f, f.name); let saved = true; try { await DB.set('anthem', { blob: f, name: f.name, t: Date.now() }); } catch (er) { saved = false; }
      PP.ui.toast(saved ? 'Video disimpan di perangkat ini.' : 'Video dipakai sementara (tidak bisa disimpan di peramban ini).'); e.target.value = '';
    };
    $('#vDel').onclick = () => PP.ui.confirm('Hapus video lagu kebangsaan dari perangkat ini?', 'Ya, hapus', async () => { vid.pause(); try { await DB.del('anthem'); } catch (e) { } setUrl(null); played = false; refresh(); });
    $('#vPlay').onclick = () => { if (!url) return PP.ui.toast('Unggah video dulu.'); vid.paused ? vid.play().catch(() => { }) : vid.pause(); };
    $('#vSeek').oninput = e => { if (vid.duration) vid.currentTime = vid.duration * e.target.value / 1000; };
    $('#vVol').oninput = e => { vid.volume = +e.target.value; vid.muted = vid.volume === 0; $('#vMute').textContent = vid.muted ? '🔇' : '🔊'; };
    $('#vMute').onclick = () => { vid.muted = !vid.muted; $('#vMute').textContent = vid.muted ? '🔇' : '🔊'; };
    $('#vFs').onclick = () => { const fr = $('#vFrame'); const f = fr.requestFullscreen || fr.webkitRequestFullscreen; if (document.fullscreenElement) document.exitFullscreen(); else if (f) f.call(fr); else if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen(); };
    vid.onplay = () => { if (!$('#vPlay')) return; $('#vPlay').textContent = '⏸'; $('#vPlay').setAttribute('aria-label', 'Jeda'); dOn(); played = true; refresh(); };
    vid.onpause = () => { if (!$('#vPlay')) return; $('#vPlay').textContent = '▶'; $('#vPlay').setAttribute('aria-label', 'Putar'); dOff(); };
    vid.onended = () => { dOff(); played = true; mark('lagu'); refresh(); };
    vid.ontimeupdate = () => { if (!$('#vSeek')) return; if (vid.duration) $('#vSeek').value = vid.currentTime / vid.duration * 1000; $('#vTime').textContent = fmtT(vid.currentTime) + ' / ' + fmtT(vid.duration || 0); };
    const refresh = () => nav([{ id: 'pdBack', t: 'Kembali', f: () => PP.go('pendahuluan-sepakat') },
      { id: 'pdStart', t: 'Mulai Menyanyikan', c: 'gold', f: () => { if (!url) return PP.ui.toast('Unggah video dulu, atau lanjut tanpa video.'); vid.currentTime = 0; vid.play().catch(() => { }); } },
      { id: 'pdFin', t: 'Video Selesai', c: 'green', dis: !played, f: () => { vid.pause(); mark('lagu'); P().flow = true; S.save(); sfx('star'); PP.ui.toast('Lagu kebangsaan selesai.'); } },
      { id: 'pdNx', t: 'Selanjutnya', c: 'blue', big: true, f: () => { vid.pause(); mark('lagu'); P().flow = true; S.save(); goStep('absen'); } }]);
    refresh();
  }

  /* bar lanjut di layar Absen (alur pendahuluan) */
  function absenBar(root) {
    const p = P(); if (!p.flow) return; const wrap = $('.wrap', root); if (!wrap) return;
    const bar = document.createElement('div'); bar.className = 'pd-abbar'; bar.innerHTML = `<span>Kegiatan Pendahuluan · langkah 4 dari 6</span><button class="btn sm" id="abBack">Kembali</button><button class="btn green" id="abNext">Absensi Selesai · Lanjut ke Apersepsi</button>`; wrap.appendChild(bar);
    $('#abBack', bar).onclick = () => PP.go('pendahuluan-lagu');
    $('#abNext', bar).onclick = () => { let sm = null; try { sm = PPAbsen.summary(); } catch (e) { } const go = () => { mark('absen'); goStep('aps1'); }; if (!sm || sm.total === 0 || sm.kosong > 0) PP.ui.confirm(sm && sm.total ? `Masih ada ${sm.kosong} siswa yang belum diabsen. Tetap lanjut ke apersepsi?` : 'Daftar siswa masih kosong. Tetap lanjut ke apersepsi?', 'Ya, lanjut', go); else go(); };
  }

  /* =====================================================
     4-5. APERSEPSI
     ===================================================== */
  const Q1 = 'Pernahkah kalian melihat tukang bangunan yang sedang memasang tangga bersandar di tembok? Menurut kalian, bagaimana cara tukang tersebut memastikan tangganya tidak terlalu curam atau terlalu landai agar aman dinaiki?';
  const D1 = 'Teman-teman, coba perhatikan tukang bangunan ini. Ia sedang memasang tangga untuk menjangkau bagian atas tembok. Menurut kalian, bagaimana cara mengetahui panjang tangga dan jaraknya dari tembok?';
  const Q2 = 'Bayangkan kalian berdiri di pojok lapangan sekolah dan ingin menuju ke pojok seberangnya. Lebih cepat mana, berjalan memutari pinggir lapangan atau langsung memotong jalan secara diagonal? Mengapa?';
  const D2 = 'Bayangkan kita sedang berada di pojok lapangan sekolah. Teman kita berada di pojok seberang. Kita bisa berjalan mengikuti pinggir lapangan, tetapi kita juga bisa memotongnya secara diagonal. Menurut kalian, jalan mana yang lebih pendek?';
  const AKH = 'Nah, ternyata dalam kehidupan sehari-hari kita sering menemukan situasi yang berhubungan dengan jarak, tinggi, dan garis diagonal. Lalu, bagaimana cara menghitungnya dengan tepat? Hari ini kita akan mempelajari Teorema Pythagoras!';

  const sceneLadder = () => `<svg class="pd-scene" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-label="Tukang bangunan memasang tangga bersandar pada tembok">
    <defs><linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e8f6ff"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#skyA)"/><g class="cloud" fill="#fff" opacity=".9"><ellipse cx="120" cy="60" rx="40" ry="14"/><ellipse cx="150" cy="52" rx="26" ry="12"/></g><g class="cloud c2" fill="#fff" opacity=".85"><ellipse cx="430" cy="42" rx="36" ry="12"/><ellipse cx="458" cy="36" rx="22" ry="10"/></g>
    <rect y="300" width="640" height="60" fill="#79c553"/><rect y="300" width="640" height="10" fill="#5fae3f"/>
    <g><rect x="470" y="40" width="150" height="262" fill="#f0c27a" stroke="#3b2412" stroke-width="4"/><path d="M470 40 H620 V30 H470Z" fill="#c6603f" stroke="#3b2412" stroke-width="4"/>
      <g fill="#bfe6ff" stroke="#3b2412" stroke-width="3.5"><rect x="492" y="66" width="40" height="46"/><rect x="558" y="66" width="40" height="46"/><rect x="492" y="140" width="40" height="46"/><rect x="558" y="140" width="40" height="46"/></g>
      <path d="M492 89 H532 M512 66 V112 M558 89 H598 M578 66 V112" stroke="#3b2412" stroke-width="2.4"/><rect x="520" y="228" width="52" height="74" fill="#8a5a2b" stroke="#3b2412" stroke-width="4"/><circle cx="562" cy="266" r="3.5" fill="#ffd34d"/></g>
    <line x1="30" y1="300" x2="610" y2="300" stroke="#3b2412" stroke-width="0" />
    <g class="ap-lines"><line class="l-base" x1="330" y1="318" x2="470" y2="318" stroke="#2a62d9" stroke-width="5" stroke-linecap="round"/><text class="l-tx t1" x="400" y="342" text-anchor="middle" font-weight="800" font-size="17" fill="#2a62d9">alas (jarak ke tembok)</text>
      <line class="l-h" x1="452" y1="300" x2="452" y2="96" stroke="#2fa84f" stroke-width="5" stroke-linecap="round" stroke-dasharray="6 7"/><text class="l-tx t2" x="436" y="205" text-anchor="end" font-weight="800" font-size="17" fill="#1c7a38">tinggi</text>
      <line class="l-m" x1="330" y1="300" x2="452" y2="96" stroke="#ff8a1f" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 7"/><text class="l-tx t3" x="400" y="126" text-anchor="end" font-weight="800" font-size="17" fill="#c25a00">tangga (miring)</text>
      <path class="l-right" d="M452 300 H434 V282 H452" fill="none" stroke="#e5484d" stroke-width="3.4"/><text class="l-tx t4" x="428" y="290" text-anchor="end" font-weight="800" font-size="14" fill="#e5484d">90°</text></g>
    <g class="ap-ladder"><g class="ap-lad"><path d="M0 0 L122 -204" stroke="#8a5a2b" stroke-width="9" stroke-linecap="round"/><path d="M26 0 L148 -204" stroke="#a46b34" stroke-width="9" stroke-linecap="round"/><g stroke="#8a5a2b" stroke-width="5" stroke-linecap="round"><path d="M16 -26 L40 -26 M28 -46 L52 -46 M40 -66 L64 -66 M52 -86 L76 -86 M64 -106 L88 -106 M76 -126 L100 -126 M88 -146 L112 -146 M100 -166 L124 -166 M112 -186 L136 -186"/></g></g></g>
    <g class="ap-man">${A.char({ sex: 'm', mus: false, hat: 'helmet', pose: 'explain' }).replace('<svg ', '<svg x="176" y="148" width="128" height="166" ')}</g></svg>`;

  const sceneField = () => `<svg class="pd-scene" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" aria-label="Lapangan sekolah dilihat dari atas: jalur pinggir dan jalur diagonal">
    <rect width="640" height="360" fill="#cfeec0"/><g><rect x="150" y="10" width="340" height="44" rx="4" fill="#f0c27a" stroke="#3b2412" stroke-width="4"/><path d="M146 12 H494 V4 H146Z" fill="#c6603f" stroke="#3b2412" stroke-width="3.5"/><g fill="#bfe6ff" stroke="#3b2412" stroke-width="2.6"><rect x="170" y="22" width="28" height="22"/><rect x="214" y="22" width="28" height="22"/><rect x="258" y="22" width="28" height="22"/><rect x="354" y="22" width="28" height="22"/><rect x="398" y="22" width="28" height="22"/><rect x="442" y="22" width="28" height="22"/></g><rect x="300" y="22" width="40" height="32" fill="#8a5a2b" stroke="#3b2412" stroke-width="3"/></g>
    <rect x="90" y="76" width="460" height="260" rx="8" fill="#5fc04a" stroke="#fff" stroke-width="5"/><g fill="#6dcf55"><rect x="90" y="76" width="77" height="260"/><rect x="244" y="76" width="77" height="260"/><rect x="398" y="76" width="77" height="260"/></g><rect x="90" y="76" width="460" height="260" rx="8" fill="none" stroke="#fff" stroke-width="5"/>
    <circle cx="320" cy="206" r="40" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M320 76 V336" stroke="#fff" stroke-width="3" opacity=".55"/>
    <rect x="76" y="62" width="488" height="288" rx="14" fill="none" stroke="#c9b17a" stroke-width="12" opacity=".75"/>
    <path class="fp-edge" d="M104 322 V90 H536" fill="none" stroke="#2a62d9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 0"/>
    <path class="fp-diag" d="M104 322 L536 90" fill="none" stroke="#e5484d" stroke-width="5" stroke-linecap="round" stroke-dasharray="12 9"/>
    <g class="fp-arr"><path d="M104 214 l-9 14 h18z" fill="#2a62d9"/><path d="M320 90 l-14 -9 v18z" fill="#2a62d9" transform="translate(40 0)"/><path d="M320 206 l-16 4 l6 -14z" fill="#e5484d" transform="rotate(-30 320 206) translate(0 0)"/></g>
    <g class="fp-lab"><rect x="116" y="188" width="96" height="26" rx="8" fill="#fff" stroke="#3b2412" stroke-width="2.4"/><text x="164" y="206" text-anchor="middle" font-weight="800" font-size="14" fill="#2a62d9">Jalur A</text>
      <rect x="338" y="186" width="96" height="26" rx="8" fill="#fff" stroke="#3b2412" stroke-width="2.4"/><text x="386" y="204" text-anchor="middle" font-weight="800" font-size="14" fill="#e5484d">Jalur B</text></g>
    <g class="fp-me">${A.char({ sex: 'm', pose: 'wave' }).replace('<svg ', '<svg x="70" y="262" width="62" height="80" ')}</g>
    <g class="fp-fr">${A.char({ sex: 'f', pose: 'wave' }).replace('<svg ', '<svg x="510" y="30" width="62" height="80" ')}</g></svg>`;

  function aps(root, n) {
    const Q = n === 1 ? Q1 : Q2, D = n === 1 ? D1 : D2, key = 'aps' + n;
    if (!done('absen')) { root.innerHTML = frame(key, `<div class="pd-lock"><h2 class="pd-title sm">Apersepsi dibuka setelah absensi</h2><p>Selesaikan kegiatan absensi dulu ya.</p></div>`); nav([{ id: 'pdA', t: 'Ke Absensi', c: 'green', f: () => PP.go('absen') }, { id: 'pdB', t: 'Kembali', f: () => PP.go('pendahuluan') }]); return; }
    root.innerHTML = frame(key, `<div class="pd-ap n${n}"><div class="pd-vis">${n === 1 ? sceneLadder() : sceneField()}</div>
      <div class="pd-side"><div class="pd-guide" aria-hidden="true"><span class="pd-g boy">${A.char({ sex: 'm', pose: 'explain', talk: true })}</span></div>${bubble('Didit', 'apSay')}</div>
      <div class="pd-q"><div class="pd-qtag">Apersepsi ${n}</div><p id="apQ">${esc(Q)}</p>${n === 2 ? `<div class="pd-ch" id="apCh"><button class="pd-cho" data-c="A"><b>A</b>Mengikuti pinggir lapangan.</button><button class="pd-cho" data-c="B"><b>B</b>Langsung melalui jalur diagonal.</button></div>` : ''}<div class="pd-resp" id="apResp" hidden></div>${audioBar()}</div></div>`);
    const guide = $('.pd-guide'), say = $('#apSay');
    const speak = () => { typeInto(say, D, 20); talkFor(guide, D); Tts.say(D); };
    cur.off.push(() => Tts.stop()); later(speak, 400); wireAudio(() => Tts.say(D));
    const vis = $('.pd-vis'); const replay = () => { vis.classList.remove('play'); void vis.offsetWidth; vis.classList.add('play'); }; later(replay, 150);
    const ans = (txt) => { const r = $('#apResp'); r.hidden = false; r.innerHTML = txt; sfx('star'); };
    const saved = P().jawab[key]; 
    if (n === 2) {
      $$('.pd-cho').forEach(b => { if (saved && saved.c === b.dataset.c) b.classList.add('on'); b.onclick = () => { $$('.pd-cho').forEach(x => x.classList.remove('on')); b.classList.add('on'); P().jawab[key] = { c: b.dataset.c }; S.save(); sfx('tick');
        ans(b.dataset.c === 'A' ? '<b>Pilihanmu: mengikuti pinggir lapangan.</b><br>Jalur ini berbelok di sudut. Coba bayangkan lagi: kalau kamu berjalan lurus langsung ke pojok seberang, apakah jaraknya lebih panjang atau lebih pendek? Simpan idemu, nanti kita buktikan bersama.'
          : '<b>Pilihanmu: langsung melalui jalur diagonal.</b><br>Wah, dugaan yang menarik! Tapi seberapa lebih pendek jalur itu? Bisakah kita menghitungnya dengan tepat? Simpan idemu, nanti kita buktikan bersama.'); }; });
      if (saved) $('.pd-cho.on') && $('.pd-cho.on').click();
    }
    const btns = [{ id: 'pdBack', t: 'Kembali', f: () => PP.go(n === 1 ? 'absen' : 'pendahuluan-aps1') }];
    if (n === 1) btns.push({ id: 'pdAns', t: 'Saya Punya Jawaban', c: 'gold', f: () => jawab1() });
    btns.push({ id: 'pdNx', t: n === 1 ? 'Lanjut ke Situasi Berikutnya' : 'Selesai Apersepsi', c: 'green', big: true, f: () => { mark(key); P().flow = true; S.save(); if (n === 1) goStep('aps2'); else akhir(root); } });
    nav(btns);
    $('#pdStage') && $$('.pd-q p', root).forEach(e => fit(e, 12));
    function jawab1() {
      const o = ['Mengukur panjang tangga dan jaraknya dari tembok', 'Memperkirakan saja dengan mata', 'Menghitung dengan sisi-sisi segitiga siku-siku', 'Belum tahu, ingin belajar dulu'], sv = P().jawab.aps1 || {};
      PP.ui.modal(`<h3>Saya Punya Jawaban</h3><p class="small muted">Pilih responsmu atau tulis dengan kata-katamu sendiri.</p><div class="pd-opts">${o.map((t, i) => `<button class="pd-cho ${sv.c === i ? 'on' : ''}" data-i="${i}"><b>${'ABCD'[i]}</b>${t}</button>`).join('')}</div><label class="pd-f">Tulis jawabanmu (boleh dikosongkan)<textarea id="jaw" rows="3" maxlength="300">${esc(sv.t || '')}</textarea></label><div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="jawOk">Simpan</button></div>`);
      let ch = sv.c == null ? -1 : sv.c; $$('.pd-opts .pd-cho').forEach(b => b.onclick = () => { $$('.pd-opts .pd-cho').forEach(x => x.classList.remove('on')); b.classList.add('on'); ch = +b.dataset.i; });
      $('#jawOk').onclick = () => { P().jawab.aps1 = { c: ch, t: $('#jaw').value.trim() }; S.save(); PP.ui.close(); ans('<b>Terima kasih atas jawabanmu!</b><br>Ide itu menarik. Nanti kita cek bersama apakah cara itu benar. Yuk lanjut ke situasi berikutnya.'); };
    }
  }
  function akhir(root) {
    root.innerHTML = frame('aps2', `<div class="pd-ap akhir">${particles(16)}<div class="pd-duo big" aria-hidden="true"><span class="pd-g boy jump">${A.char({ sex: 'm', pose: 'cheer', talk: true })}</span></div><div class="pd-say">${bubble('Didit', 'akSay')}<button class="btn gold xl pd-mulai" id="pdMulai">MULAI BELAJAR PYTHAGORAS</button></div></div>`);
    typeInto($('#akSay'), AKH, 20); talkFor($('.pd-duo'), AKH); Tts.say(AKH); cur.off.push(() => Tts.stop());
    $('#pdMulai').onclick = () => { mark('aps2'); P().flow = false; P().selesai = Date.now(); S.save(); sfx('star'); try { PP.ui.confetti && PP.ui.confetti(); } catch (e) { } PP.go('materi'); };
    nav([{ id: 'pdBack', t: 'Kembali', f: () => PP.go('pendahuluan-aps2') }]);
  }

  /* ---------- rute ---------- */
  PP.screens.pendahuluan = function (arg) {
    arg = arg || '';
    return {
      html: '<div class="wrap pdwrap"><div class="pdroot" id="pdRoot"></div></div>',
      mount(app) {
        clearCur(); const root = $('#pdRoot', app);
        const F = { doa, sepakat, lagu }[arg];
        if (arg === 'aps1') aps(root, 1); else if (arg === 'aps2') aps(root, 2); else if (F) F(root); else hub(root);
        const onR = () => $$('.pd-ptxt,.pd-sub').forEach(e => fit(e, 12)); window.addEventListener('resize', onR); cur.off.push(() => window.removeEventListener('resize', onR));
      },
      unmount() { clearCur(); Tts.stop(); Duck.reset(); }
    };
  };
  window.PPPend = { absenBar, Duck, Tts, STEPS, state: P };
})();
