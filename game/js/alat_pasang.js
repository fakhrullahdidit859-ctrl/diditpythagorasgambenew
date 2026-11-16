/* Penghubung Alat Bantu (Kalkulator Ajaib + Papan Tulis) ke game. Kode alat ada di jba-mesin.js dan jba-alat.js (Shadow DOM).
   Berkas ini hanya membaca layar yang tampil (tidak mengubah fitur lama). Matikan dengan JBAlat.config.aktif = false sebelum init. */
(function () {
  'use strict';
  if (!window.JBAlat) return;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const route = () => { const h = (location.hash || '').replace(/^#/, ''); const i = h.indexOf('-'); return i < 0 ? (h || 'splash') : h.slice(0, i); };
  const vis = e => !!e && !!(e.offsetParent || e.getClientRects().length) && getComputedStyle(e).visibility !== 'hidden';
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const QSEL = ['#modal:not([hidden]) .q-text', '#modal:not([hidden]) .xq-text', '#modal:not([hidden]) h3', '.q-text', '.jb-q', '.lt-q', '.lt-text', '.pz-desc'];
  function soalTeks() {
    for (const s of QSEL) { const e = $$(s).find(vis); if (e && e.textContent.trim()) return e.textContent.replace(/\s+/g, ' ').trim().slice(0, 400); }
    return '';
  }
  const kunciTes = { pos: 1, finish: 1, game: 1, games: 1, jelajah: 1 };
  function izinPythagoras() {
    const r = route();
    if (r === 'kuis') { const p = $('.qz-top .pill'); return !!(p && /^Latihan/.test(p.textContent.trim())); }
    if (r === 'jalur') { const s = window.JB && JB.state && JB.state(); return !s || ['BICARA', 'MATERI', 'CONTOH', 'REFERENSI'].indexOf(s) >= 0 || s === 'RINGKAS'; }
    return !kunciTes[r];
  }
  const inputOk = e => e.tagName === 'INPUT' && ['', 'text', 'number', 'tel'].indexOf(e.type || '') >= 0 && !e.readOnly && !e.disabled && vis(e) && !e.closest('#jba-host');
  function terapkan(t) {
    if (/^(absen|planning|profil)$/.test(route())) return false;
    const c = $$('#modal input, #app input').filter(inputOk); if (!c.length) return false;
    const a = document.activeElement; const i = (a && c.indexOf(a) >= 0 && a) || c.find(x => !x.value) || c[0];
    i.value = t; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  let t0 = 0;
  const pakai = () => { try { const k = 'jba_pakai_alat', d = JSON.parse(localStorage.getItem(k) || '{}'), r = route(); d[r] = (d[r] || 0) + 1; localStorage.setItem(k, JSON.stringify(d)); } catch (e) { } };
  function onBuka() { t0 = Date.now(); PP.alatOpen = true; pakai(); }
  function onTutup() {
    PP.alatOpen = false;
    try { const S = window.PPStore, d = S && S.data.quiz && S.data.quiz.draft; if (d && d.end && route() === 'kuis') { d.end += Date.now() - t0; S.save(); } } catch (e) { }
  }
  function posDock() {
    const h = $('#jba-host'), d = h && h.shadowRoot && h.shadowRoot.querySelector('.dock'); if (!d) return;
    if (!h.shadowRoot.querySelector('#jba-glue')) { const st = document.createElement('style'); st.id = 'jba-glue'; st.textContent = '@media (orientation:portrait){.dock{flex-direction:column !important}.dock .g{width:46px !important;height:18px !important}}@media not all and (orientation:landscape) and (max-height:460px){.kk{overflow-y:auto;min-height:0}.kp{flex:1 0 auto;min-height:190px;grid-auto-rows:minmax(26px,1fr)}.kp button{font-size:clamp(14px,2.4vmin + 4px,22px)}@media (max-height:720px){.rnd:has([data-d]){display:none !important}.kk{gap:4px}}.aks{position:sticky;bottom:0;z-index:1;background:#fbe9bd}}'; h.shadowRoot.appendChild(st); }
    const por = innerHeight > innerWidth, key = por ? 'jba_dock_p' : 'jba_dock_l'; let saved = null; try { saved = localStorage.getItem(key); } catch (e) { }
    if (saved) { autoHide(d); return; }
    if (route() === 'jelajah') { d.style.left = '8px'; d.style.right = 'auto'; d.style.top = Math.round(por ? innerHeight * 0.4 : Math.max(150, innerHeight * 0.3)) + 'px'; }
    else if (por) { d.style.right = '8px'; d.style.left = 'auto'; d.style.top = Math.round(innerHeight * 0.5 - 70) + 'px'; }
    else dispatchEvent(new Event('resize'));
    autoHide(d);
  }
  /* Layar tegak: dock menyelip ke tepi layar (hanya sisa kecil terlihat) agar tidak menutup tombol; ketuk sekali untuk membuka. */
  function autoHide(d) {
    if (d._ah) { d._ah.col(); return; }
    let t = 0; const por = () => innerHeight > innerWidth || innerHeight <= 520;
    const col = () => { clearTimeout(t); if (!por() || (window.PP && PP.alatOpen)) { d.style.transform = ''; delete d.dataset.col; return; } const r = d.getBoundingClientRect(), right = (r.left + r.width / 2) > innerWidth / 2; d.style.transition = 'transform .25s, opacity .3s'; d.style.transform = 'translateX(' + (right ? 70 : -70) + '%)'; d.dataset.col = '1'; };
    const arm = () => { clearTimeout(t); t = setTimeout(col, 3500); };
    d.addEventListener('pointerdown', e => { if (d.dataset.col) { e.stopPropagation(); e.preventDefault(); d.style.transform = ''; delete d.dataset.col; arm(); } else arm(); }, true);
    d._ah = { col }; setTimeout(col, 1200);
  }
  const tampil = () => { const h = $('#jba-host'); if (h && !(window.PP && PP.alatOpen)) h.style.display = /^(splash|profil|petunjuk)$/.test(route()) ? 'none' : ''; };
  function pasangKartu() {
    const side = $('.hub-side'); if (!side || $('.jba-slot', side) || !JBAlat._siap) return;
    const w = document.createElement('div'); w.className = 'jba-slot'; side.appendChild(w); JBAlat.pasangKartuMenu(w);
  }
  function mulai() {
    try {
      JBAlat.init({ baseAset: 'assets/alat/', getKonteks: () => { const t = soalTeks(); return { id: route() + '|' + hash(t), teks: t }; }, izinPythagoras, terapkanJawaban: terapkan, onBuka, onTutup });
      JBAlat._siap = !!$('#jba-host');
    } catch (e) { return; }
    addEventListener('hashchange', () => setTimeout(() => { tampil(); posDock(); }, 120)); tampil(); posDock();
    new MutationObserver(() => { pasangKartu(); tampil(); }).observe($('#app') || document.body, { childList: true, subtree: false });
    pasangKartu();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mulai, 0)); else setTimeout(mulai, 0);
})();
