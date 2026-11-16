/* =========================================================
   PPA11y — Panel Aksesibilitas (tersimpan di localStorage 'pp_a11y').
   Bacakan soal (speechSynthesis id-ID, kecepatan, suara, otomatis), kontras tinggi,
   font ramah disleksia (Lexend) + jarak, ukuran teks 100/125/150%, tombol besar,
   kurangi gerak, ramah buta warna, tombol panah di layar untuk Jelajah, suara terpisah.
   ========================================================= */
(function () {
  'use strict';
  const KEY = 'pp_a11y';
  const DEF = { auto: false, rate: 1, voice: '', hc: false, dys: false, space: false, size: 100, big: false, rm: false, cb: false, arrows: false };
  let st = Object.assign({}, DEF);
  try { st = Object.assign(st, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { }
  const A = {}; const TTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const saveSt = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  A.state = () => st;
  /* ---- terapkan ---- */
  function apply() {
    const r = document.documentElement, c = r.classList;
    c.toggle('a11y-hc', !!st.hc); c.toggle('a11y-dys', !!st.dys); c.toggle('a11y-sp', !!st.space); c.toggle('a11y-big', !!st.big); c.toggle('a11y-rm', !!st.rm); c.toggle('a11y-cb', !!st.cb);
    r.style.fontSize = st.size === 100 ? '' : st.size + '%';
    if (st.dys && !document.getElementById('a11yFont')) { const l = document.createElement('link'); l.id = 'a11yFont'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap'; document.head.appendChild(l); }
    arrows();
  }
  /* ---- bacakan ---- */
  const speech = t => String(t || '').replace(/<[^>]+>/g, ' ')
    .replace(/(\w)\s*²/g, '$1 kuadrat').replace(/(\w)\s*³/g, '$1 pangkat tiga').replace(/\^2\b/g, ' kuadrat').replace(/\^3\b/g, ' pangkat tiga').replace(/²/g, ' kuadrat').replace(/³/g, ' pangkat tiga')
    .replace(/√\s*\(?(\d+|\w)\)?/g, 'akar dari $1 ').replace(/√/g, 'akar dari ').replace(/sqrt\(([^)]+)\)/gi, 'akar dari $1').replace(/×/g, ' kali ').replace(/÷/g, ' bagi ').replace(/[−–]/g, ' kurang ').replace(/\+/g, ' tambah ').replace(/=/g, ' sama dengan ').replace(/π/g, ' pi ').replace(/°/g, ' derajat').replace(/\s+/g, ' ').trim();
  A.speak = function (text) {
    if (!TTS) return false; A.stop(); const u = new SpeechSynthesisUtterance(speech(text)); u.lang = 'id-ID'; u.rate = st.rate;
    const v = speechSynthesis.getVoices(); const pick = (st.voice && v.find(x => x.voiceURI === st.voice)) || v.find(x => /^id/i.test(x.lang)); if (pick) u.voice = pick;
    try { window.PPAudio && PPAudio.duck && PPAudio.duck(true); } catch (e) { } u.onend = u.onerror = () => { try { window.PPAudio && PPAudio.duck && PPAudio.duck(false); } catch (e) { } setBtn(false); };
    speechSynthesis.speak(u); setBtn(true); return true;
  };
  A.stop = () => { try { if (TTS) speechSynthesis.cancel(); } catch (e) { } setBtn(false); };
  const target = () => {
    const q = document.querySelector('#xQ:not([hidden]) .xq-card'); if (q) return q.querySelector('.xq-q, h3') ? [q.querySelector('.xq-q, h3').textContent].concat(Array.from(q.querySelectorAll('.opt')).map((o, i) => 'Pilihan ' + 'ABCD'[i] + '. ' + o.textContent.replace(/^[A-D]/, ''))).join('. ') : q.textContent;
    const m = document.querySelector('#modal:not([hidden])'); if (m) return m.textContent;
    const z = document.querySelector('#qz .qz-ask, #qz .qz-q'); if (z) return z.textContent + '. ' + Array.from(document.querySelectorAll('#qz .opt')).map((o, i) => 'Pilihan ' + 'ABCD'[i] + '. ' + o.textContent.replace(/^[A-D]/, '')).join('. ');
    const a = document.getElementById('app'); return a ? a.innerText.slice(0, 1800) : '';
  };
  let btn = null;
  const setBtn = on => { if (btn) { btn.classList.toggle('on', !!on); btn.setAttribute('aria-label', on ? 'Hentikan bacaan' : 'Bacakan layar ini'); const i = btn.querySelector('img'); if (i) i.src = 'assets/lomba/ikon/' + (on ? 'ikon_bacakan_berhenti' : 'ikon_bacakan') + '.png'; } };
  function mkBtn() {
    if (!TTS || btn) return; btn = document.createElement('button'); btn.id = 'a11yRead'; btn.type = 'button'; btn.className = 'nosfx'; btn.setAttribute('aria-label', 'Bacakan layar ini'); btn.innerHTML = '<img class="px" src="assets/lomba/ikon/ikon_bacakan.png" alt="">';
    btn.onclick = () => { if (btn.classList.contains('on')) A.stop(); else A.speak(target()); }; document.body.appendChild(btn);
  }
  /* ---- tombol panah di layar (Jelajah) ---- */
  let pad = null;
  function arrows() {
    if (btn) btn.classList.toggle('jel', /^#jelajah/.test(location.hash));
    const on = st.arrows && /^#jelajah/.test(location.hash);
    if (!on) { if (pad) { pad.remove(); pad = null; } return; }
    if (pad) return; pad = document.createElement('div'); pad.id = 'a11yPad'; pad.setAttribute('role', 'group'); pad.setAttribute('aria-label', 'Tombol arah');
    const K = [['ArrowUp', 'panah_atas', 'Atas'], ['ArrowLeft', 'panah_kiri', 'Kiri'], ['ArrowDown', 'panah_bawah', 'Bawah'], ['ArrowRight', 'panah_kanan', 'Kanan']];
    pad.innerHTML = K.map(k => `<button type="button" class="nosfx" data-k="${k[0]}" aria-label="${k[2]}"><img class="px" src="assets/lomba/ikon/ikon_${k[1]}.png" alt=""></button>`).join('');
    const fire = (type, key) => window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
    pad.querySelectorAll('button').forEach(b => { const k = b.dataset.k; const dn = e => { e.preventDefault(); fire('keydown', k); b.classList.add('on'); }; const upf = e => { e && e.preventDefault(); fire('keyup', k); b.classList.remove('on'); }; b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', upf); b.addEventListener('pointerleave', upf); b.addEventListener('pointercancel', upf); });
    document.body.appendChild(pad);
  }
  window.addEventListener('hashchange', arrows);
  /* ---- bacakan otomatis saat kuis/dialog muncul ---- */
  let lastAuto = '';
  new MutationObserver(() => {
    if (!st.auto || !TTS) return; const q = document.querySelector('#xQ:not([hidden]) .xq-card'), m = document.querySelector('#modal:not([hidden])'), t = q ? target() : m ? m.textContent : '';
    if (t && t !== lastAuto && t.length > 3) { lastAuto = t; setTimeout(() => A.speak(t.slice(0, 1500)), 300); } else if (!t) lastAuto = '';
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  /* ---- aria untuk dialog dan pesan ---- */
  function aria() {
    const m = document.getElementById('modal'); if (m) { m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); }
    const t = document.getElementById('toasts'); if (t) t.setAttribute('role', 'status');
    document.querySelectorAll('button:not([aria-label])').forEach(b => { if (!b.textContent.trim() && b.title) b.setAttribute('aria-label', b.title); });
  }
  /* ---- panel ---- */
  const sw = (k, label, ic, hint) => `<label class="a11y-row"><img class="px" src="assets/lomba/ikon/${ic}.png" alt=""><span><b>${label}</b>${hint ? `<small>${hint}</small>` : ''}</span><input type="checkbox" data-k="${k}" ${st[k] ? 'checked' : ''} role="switch" aria-label="${label}"></label>`;
  A.open = function () {
    const voices = TTS ? speechSynthesis.getVoices() : [];
    PP.ui.modal(`<h3>Aksesibilitas</h3><div class="a11y-p scrollbox">
      ${TTS ? `<div class="a11y-sec"><div class="a11y-row"><img class="px" src="assets/lomba/ikon/ikon_bacakan.png" alt=""><span><b>Bacakan soal</b><small>Tombol speaker di pojok kiri bawah membacakan soal, dialog, atau layar.</small></span><button class="btn sm blue" id="a11yTest">Coba</button></div>
        ${sw('auto', 'Bacakan otomatis', 'ikon_bacakan', 'Soal dan dialog dibacakan saat muncul.')}
        <label class="a11y-row col"><span><b>Kecepatan suara: <output id="a11yRO">${st.rate.toFixed(1)}×</output></b></span><input type="range" min="0.7" max="1.3" step="0.1" value="${st.rate}" id="a11yRate" aria-label="Kecepatan suara"></label>
        ${voices.length ? `<label class="a11y-row col"><span><b>Suara</b></span><select id="a11yVoice" aria-label="Pilih suara"><option value="">Otomatis (Indonesia)</option>${voices.map(v => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === st.voice ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></label>` : ''}</div>` : '<p class="small ab-note">Perangkat ini tidak mendukung suara pembaca, jadi fitur Bacakan disembunyikan.</p>'}
      <div class="a11y-sec">${sw('hc', 'Kontras tinggi', 'ikon_kontras_tinggi', 'Teks lebih tegas, batas tombol tebal.')}${sw('dys', 'Font ramah disleksia', 'ikon_font_disleksia', 'Memakai font Lexend (butuh internet saat pertama).')}${sw('space', 'Jarak huruf & baris lebih lebar', 'ikon_font_disleksia')}
        <div class="a11y-row"><img class="px" src="assets/lomba/ikon/ikon_ukuran_teks.png" alt=""><span><b>Ukuran teks</b></span><span class="a11y-seg" role="group" aria-label="Ukuran teks">${[100, 125, 150].map(n => `<button type="button" class="btn sm ${st.size === n ? 'green' : ''}" data-size="${n}" aria-pressed="${st.size === n}">${n}%</button>`).join('')}</span></div>
        ${sw('big', 'Tombol besar (≥ 48 px)', 'ikon_ukuran_teks')}${sw('rm', 'Kurangi gerak', 'ikon_kurangi_gerak', 'Mematikan animasi dan kilau.')}${sw('cb', 'Ramah buta warna', 'ikon_buta_warna', 'Tambah pola dan huruf pada warna penting.')}${sw('arrows', 'Tombol panah di layar (Jelajah)', 'ikon_panah_kanan', 'Alternatif joystick.')}</div>
      <p class="small ab-note">Suara dan musik diatur terpisah lewat tombol speaker di kanan atas. Seluruh game bisa dipakai dengan keyboard: Tab, Enter/Spasi, dan Esc untuk menutup jendela.</p></div>
      <div class="row end"><button class="btn" id="a11yReset">Atur ulang</button><button class="btn green" data-close>Selesai</button></div>`);
    const m = document.getElementById('modal');
    m.querySelectorAll('input[data-k]').forEach(i => i.onchange = () => { st[i.dataset.k] = i.checked; saveSt(); apply(); });
    m.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { st.size = +b.dataset.size; saveSt(); apply(); m.querySelectorAll('[data-size]').forEach(x => { x.classList.toggle('green', x === b); x.setAttribute('aria-pressed', x === b); }); });
    const r = m.querySelector('#a11yRate'); if (r) r.oninput = () => { st.rate = +r.value; m.querySelector('#a11yRO').textContent = st.rate.toFixed(1) + '×'; saveSt(); };
    const v = m.querySelector('#a11yVoice'); if (v) v.onchange = () => { st.voice = v.value; saveSt(); };
    const t = m.querySelector('#a11yTest'); if (t) t.onclick = () => A.speak('Halo! Kuadrat sisi miring sama dengan jumlah kuadrat sisi siku-siku. c kuadrat sama dengan a kuadrat tambah b kuadrat.');
    m.querySelector('#a11yReset').onclick = () => { st = Object.assign({}, DEF); saveSt(); apply(); A.open(); };
  };
  /* ---- tombol di bilah atas ---- */
  function hudBtn() {
    const h = document.getElementById('hud'); if (!h || document.getElementById('a11yBtn')) return; const b = document.createElement('button'); b.id = 'a11yBtn'; b.type = 'button'; b.className = 'hud-btn nosfx'; b.setAttribute('aria-label', 'Aksesibilitas'); b.title = 'Aksesibilitas'; b.innerHTML = '<img class="px" src="assets/lomba/ikon/ikon_aksesibilitas.png" alt="">'; b.onclick = A.open;
    const stars = h.querySelector('.hud-stars'); h.insertBefore(b, stars || null);
  }
  setTimeout(() => { hudBtn(); mkBtn(); aria(); apply(); if (TTS) try { speechSynthesis.getVoices(); } catch (e) { } }, 0);
  window.PPA11y = A; apply();
})();
