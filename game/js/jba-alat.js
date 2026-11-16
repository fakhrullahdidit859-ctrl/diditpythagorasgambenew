/* JBA Alat Bantu: Kalkulator Ajaib + Papan Tulis Digital.
   Terisolasi penuh (Shadow DOM, satu global: window.JBAlat). Tidak menyentuh CSS/JS game lama. */
(function () {
  'use strict';
  const M = window.JBAMesin;
  const CFG = {
    baseAset: 'aset/',                 // folder aset (berisi ikon_*.png, spritesheet/, tekstur/)
    aktif: true,                        // saklar utama
    getKonteks: null,                   // () => ({id, teks, gambar})  soal yang sedang tampil
    izinPythagoras: () => true,         // () => boolean ; false saat kuis/penilaian
    terapkanJawaban: null,              // (teksKoma) => boolean ; isi kolom jawaban game
    onBuka: null, onTutup: null,        // jeda / lanjut game
    dock: { sisi: 'kanan', y: 0.56 },   // posisi awal dock
    tampilDock: true
  };
  const SPR = { efek_debu_kapur: [112, 72, 8, 10], efek_hasil_muncul: [160, 72, 8, 14], bintang_ajaib: [112, 112, 8, 8] };
  const FALL = { kalkulator: '🖩', papan_tulis: '✎', kapur: '✎', penghapus: '⌫', undo: '↶', redo: '↷', hapus_semua: '🗑', simpan: '⭳', garis: '╱', segitiga_siku: '◺', tutup: '✕', geser: '⋮⋮', latar: '▦', tebal: '≡', warna: '●', salin: '⧉', pakai_jawaban: '➜' };
  const safe = (f, d) => { try { return f(); } catch (e) { return d; } };
  const lsGet = k => safe(() => localStorage.getItem(k), null);
  const lsSet = (k, v) => safe(() => localStorage.setItem(k, v));

  const CSS = `
:host{all:initial}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.root{position:fixed;inset:0;pointer-events:none;z-index:2147483000;font-family:var(--jba-font,system-ui,"Nunito",sans-serif);color:#3a2418}
button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;padding:0;touch-action:manipulation}
span.i{display:block;width:100%;height:100%}
img.ic{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none}
.ic-t{display:grid;place-items:center;width:100%;height:100%;font-weight:800;font-size:1.1em}
/* dock */
.dock{position:fixed;pointer-events:auto;display:flex;flex-direction:column;gap:6px;padding:6px;background:#8a5a2bcc;border:2px solid #3a2418;border-radius:16px;box-shadow:0 3px 0 #3a2418;transition:opacity .3s;touch-action:none;align-items:center}
.dock.pudar{opacity:.55}
@media (orientation:portrait){.dock{flex-direction:row}.dock .g{width:18px;height:46px}}.dock.tutup{display:none}
.dock .b{width:46px;height:46px;border-radius:12px;background:#fff3cf;border:2px solid #3a2418;padding:3px;box-shadow:0 2px 0 #3a2418}
.dock .b:active{transform:translateY(2px);box-shadow:none}
.dock .g{width:46px;height:18px;cursor:grab;opacity:.9}
@media (max-height:480px){.dock{gap:3px;padding:3px;border-radius:12px}.dock .b{width:32px;height:32px;border-radius:9px;padding:2px}.dock .g{width:32px;height:14px}}
/* overlay */
.ov{position:fixed;inset:0;display:none;pointer-events:auto;background:#1e140acc;padding:max(6px,env(safe-area-inset-top)) max(6px,env(safe-area-inset-right)) max(6px,env(safe-area-inset-bottom)) max(6px,env(safe-area-inset-left));overscroll-behavior:contain;touch-action:none}
.ov.buka{display:block}
.win{height:100%;width:100%;max-width:1400px;margin:0 auto;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:#fbeec6;border:3px solid #3a2418;border-radius:16px;box-shadow:0 4px 0 #3a2418;overflow:hidden}
.hd{display:flex;gap:8px;align-items:center;padding:6px 8px;background:#8a5a2b;color:#fff;border-bottom:3px solid #3a2418;min-height:44px}
.hd .judul{font-weight:800;font-size:clamp(13px,2.2vmin + 7px,18px);white-space:nowrap}
.soal{flex:1;min-width:0;display:flex;gap:8px;align-items:center;background:#fff8e4;color:#3a2418;border:2px solid #3a2418;border-radius:10px;padding:4px 8px;font-size:clamp(11px,1.8vmin + 5px,15px);line-height:1.25;cursor:pointer;text-align:left}
.soal .tx{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1}
.soal.luas .tx{-webkit-line-clamp:6}
.soal img{height:34px;width:48px;object-fit:contain;background:#fff;border-radius:6px}
.soal.kosong{display:none}
.x{width:38px;height:38px;flex:none}
.bd{min-height:0;display:flex;gap:8px;padding:8px}
.tabs{display:flex;gap:6px;padding:6px 8px;background:#e9cf94;border-top:3px solid #3a2418}
.tabs button{flex:1;min-height:42px;border-radius:12px;border:2px solid #3a2418;background:#fff3cf;font-weight:800;display:flex;align-items:center;justify-content:center;gap:6px;font-size:14px}
.tabs button .i{width:26px;height:26px}.tabs button.on{background:#ffc83d;box-shadow:inset 0 -3px 0 #c9901c}
.pp,.kk{min-width:0;min-height:0;display:flex}
.pp{flex:1;flex-direction:column;gap:6px}
.kk{flex:none;width:clamp(250px,36vw,380px);flex-direction:column;gap:6px}
.win[data-tab=papan] .kk{display:none}.win[data-tab=kalk] .pp{display:none}
.win[data-tab=kalk] .kk{width:100%;flex:1}
.kl{display:contents}.kp{order:5}.kl>.aks{order:9}
@media (orientation:landscape) and (min-width:560px) and (min-height:461px){
  .tabs{display:none!important}.win .pp,.win .kk{display:flex!important}.win[data-tab=kalk] .kk{width:clamp(250px,36vw,380px);flex:none}
  .pp{flex-direction:row}
}
@media (orientation:landscape) and (max-height:460px){
  .ov{padding:3px max(6px,env(safe-area-inset-right)) 3px max(6px,env(safe-area-inset-left))}
  .hd{min-height:34px;padding:3px 6px}.x{width:30px;height:30px}.bd{padding:5px}
  .tabs{padding:3px 6px}.tabs button{min-height:32px;font-size:13px}.tabs button .i{width:22px;height:22px}
  .pp{flex-direction:row}
  .kk{flex-direction:row;gap:6px}
  .kl{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}.kl>.aks{order:0}.kp{order:0;flex:1;grid-auto-rows:minmax(24px,1fr)}
  .kt button{min-height:26px}.ds{padding:3px 8px}.ex{font-size:13px;min-height:1.1em}.hs{font-size:clamp(20px,6vmin,30px);min-height:1.1em}.cat{display:none}
  .rnd button{min-height:22px}.aks button{min-height:28px}.aks button .i{width:16px;height:16px}
  .kk[data-tab=pyth] .ex{display:none}.fl button{min-height:32px}.lg{font-size:11px;max-height:5.4em;padding:2px 6px}
  .pita{max-height:3.4em}
}
/* papan */
.cvw{position:relative;flex:1;min-height:0;min-width:0;border:12px solid #8a5a2b;border-image:url(__BASE__statis/bingkai_papan.png) 32 round;background-color:#265c46;background-image:url(__BASE__tekstur/tekstur_papan_hijau.png);background-repeat:repeat;border-radius:4px;overflow:hidden}
.cvw[data-bg=putih]{background-color:#faf9f4;background-image:url(__BASE__tekstur/tekstur_papan_putih.png)}
.cvw[data-bg=kotak]{background-color:#fffdf4;background-image:url(__BASE__tekstur/tekstur_kertas_kotak.png)}
canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block;cursor:crosshair}
.cvw[data-alat=penghapus] canvas{cursor:url(__BASE__statis/kursor_penghapus.png) 6 26,cell}
.cvw[data-alat=pena] canvas{cursor:url(__BASE__statis/kursor_kapur.png) 4 28,crosshair}
.efek{position:absolute;pointer-events:none;left:50%;top:50%;transform:translate(-50%,-50%) scale(2.2);image-rendering:auto}
.tb{display:grid;gap:5px;grid-template-columns:repeat(7,minmax(0,1fr));flex:none}
.tb button{height:clamp(34px,6.4vmin + 8px,46px);border-radius:10px;border:2px solid #3a2418;background:#fff3cf;box-shadow:0 2px 0 #3a2418;padding:3px;position:relative}
.tb button:active{transform:translateY(2px);box-shadow:none}
.tb button.on{background:#ffc83d;outline:3px solid #fff}
.tb button .w{position:absolute;left:50%;top:50%;width:min(24px,70%);aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;border:2px solid #3a2418}
.tb button:disabled{opacity:.4}
@media (orientation:landscape) and (min-width:560px) and (min-height:461px),(orientation:landscape) and (max-height:460px){
  .tb{grid-template-columns:repeat(2,minmax(34px,42px));grid-auto-rows:minmax(26px,44px);align-content:space-between;height:100%}
  .tb button{height:auto;min-height:26px}
}
/* kalkulator */
.kt{display:flex;gap:5px;flex:none}
.kt button{flex:1;min-height:34px;border:2px solid #3a2418;border-radius:10px;background:#fff3cf;font-weight:800;font-size:clamp(11px,1.8vmin + 6px,15px);padding:2px 4px;position:relative}
.kt button.on{background:#ffc83d;box-shadow:inset 0 -3px 0 #c9901c}.kt button.kunci{opacity:.55}
.ds{flex:none;background:#c4f4ce;border:3px solid #3a2418;border-radius:12px;padding:6px 10px;display:flex;flex-direction:column;gap:2px;position:relative;overflow:hidden;color:#244b3a}
.ex{font-size:clamp(14px,2.6vmin + 6px,20px);white-space:nowrap;overflow:hidden;text-align:right;min-height:1.3em;font-weight:700}
.ex .gh{opacity:.4}
.hs{font-size:clamp(24px,5.4vmin + 8px,40px);font-weight:900;text-align:right;white-space:nowrap;overflow:hidden;min-height:1.2em;position:relative;z-index:1}
.hs.live{opacity:.7}.hs.err{font-size:clamp(12px,2vmin + 6px,16px);color:#b02828;white-space:normal}
.cat{font-size:clamp(10px,1.6vmin + 5px,13px);text-align:right;min-height:1.2em;font-weight:700;opacity:.85}
.hm{position:absolute;right:6px;top:2px;background:#fff3;border-radius:6px;padding:0 5px;font-size:12px;font-weight:800}
.rnd{display:flex;gap:4px;flex:none;align-items:center;font-size:12px;font-weight:800}
.rnd button{flex:1;min-height:26px;border:2px solid #3a2418;border-radius:8px;background:#fff3cf;font-weight:800}
.rnd button.on{background:#ffc83d}
.aks{display:flex;gap:5px;flex:none}
.aks button{flex:1;min-height:34px;border:2px solid #3a2418;border-radius:10px;background:#fff3cf;font-weight:800;font-size:clamp(11px,1.6vmin + 5px,14px);display:flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 2px 0 #3a2418}
.aks button .i{width:20px;height:20px}.aks button:disabled{opacity:.4}
.aks .hijau{background:#8de0a0}
.kp{flex:1;min-height:0;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(30px,1fr);gap:5px}
.kp button{border:2px solid #3a2418;border-radius:10px;background:#fffaf0;font-weight:900;font-size:clamp(15px,3vmin + 6px,24px);box-shadow:0 3px 0 #3a2418;min-height:0}
.kp button:active{transform:translateY(3px);box-shadow:none}
.kp .op{background:#ffd166}.kp .fn{background:#cdbcff}.kp .ak{background:#9fe0c4}.kp .cl{background:#ffb0a0}.kp .eq{background:#8de0a0;grid-column:span 2}
.kp .off{opacity:.3;pointer-events:none}
.pita{flex:none;display:flex;flex-wrap:wrap;gap:4px;max-height:5.6em;overflow:hidden;align-content:flex-start}
.pita .ch{background:#fff;border:2px solid #3a2418;border-radius:8px;padding:1px 6px;font-weight:800;font-size:13px}
.pita .kos{font-size:12px;font-weight:700;opacity:.7}
.fl{display:flex;gap:5px;flex:none}
.fl button{flex:1;border:2px solid #3a2418;border-radius:10px;background:#fff;min-height:40px;font-weight:900;font-size:clamp(14px,2.4vmin + 6px,20px);padding:2px;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}
.fl button small{font-size:10px;font-weight:700;opacity:.7}.fl button.on{background:#ffe08a;outline:3px solid #ffc83d}
.lg{flex:none;font-size:clamp(11px,1.6vmin + 5px,14px);font-weight:700;line-height:1.35;background:#fff8e4;border:2px solid #3a2418;border-radius:10px;padding:4px 8px;max-height:7.6em;overflow:hidden}
.lg div.l3{color:#1d8f4f;font-weight:900}
.kun{flex:none;background:#ffe9e0;border:2px solid #3a2418;border-radius:10px;padding:8px;font-size:13px;font-weight:700}
.toast{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#3a2418;color:#fff;padding:8px 14px;border-radius:12px;font-weight:800;font-size:14px;pointer-events:none;opacity:0;transition:opacity .2s;z-index:5}
.toast.on{opacity:1}
/* kartu menu */
.kartu{display:block;font-family:var(--jba-font,system-ui,sans-serif);color:#3a2418;background:#fff3cf;border:3px solid #3a2418;border-radius:16px;padding:10px;box-shadow:0 4px 0 #3a2418}
.kartu h3{margin:0 0 8px;font-size:clamp(14px,2.4vmin + 6px,20px);display:flex;align-items:center;gap:8px}
.kartu .ms{width:34px;height:34px;flex:none;background-repeat:no-repeat}
.kartu .bt{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.kartu .bt button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;border-radius:12px;border:3px solid #3a2418;box-shadow:0 3px 0 #3a2418;font-weight:900;font-size:clamp(12px,1.9vmin + 5px,16px);min-height:0}
.kartu .bt button:first-child{background:#8fb4f5}.kartu .bt button:last-child{background:#8de0a0}
.kartu .bt img{width:min(100%,92px);height:min(14vmin,92px);object-fit:contain}
.kartu .bt button:active{transform:translateY(3px);box-shadow:none}
`;
  let ROOT, SH, S = {};   // S = state
  const el = (t, a, ...k) => { const e = document.createElement(t); if (a) for (const x in a) { if (x === 'class') e.className = a[x]; else if (x.startsWith('on')) e.addEventListener(x.slice(2), a[x]); else if (x === 'text') e.textContent = a[x]; else e.setAttribute(x, a[x]); } k.flat().forEach(c => c != null && e.append(c)); return e; };
  function ic(n, cls) {
    const i = el('img', { class: 'ic', src: CFG.baseAset + 'statis/ikon_' + n + '.png', alt: '', draggable: 'false' });
    const w = el('span', { class: cls || 'i' }, i);
    i.addEventListener('error', () => { w.replaceChildren(el('span', { class: 'ic-t', text: FALL[n] || '?' })); });
    return w;
  }
  function sprite(host, nama, once, scale) {
    const d = SPR[nama]; if (!d) return null;
    const [w, h, n, fps] = d, e = el('div', { class: 'efek' });
    e.style.cssText = `width:${w}px;height:${h}px;background:url(${CFG.baseAset}spritesheet/${nama}.png) 0 0/${w * n}px ${h}px no-repeat;animation:sp-${nama} ${n / fps}s steps(${n}) ${once ? 1 : 'infinite'} forwards;${scale ? 'transform:translate(-50%,-50%) scale(' + scale + ')' : ''}`;
    host.append(e); if (once) setTimeout(() => e.remove(), n / fps * 1000 + 80); return e;
  }
  function spriteCss() { return Object.entries(SPR).map(([k, [w, , n]]) => `@keyframes sp-${k}{to{background-position-x:-${w * n}px}}`).join('\n'); }
  function toast(t) { S.toast.textContent = t; S.toast.classList.add('on'); clearTimeout(S.tt); S.tt = setTimeout(() => S.toast.classList.remove('on'), 1700); }

  /* =================== KALKULATOR =================== */
  const K = { tab: 'hitung', expr: '', hist: '', ans: null, adaHasil: false, pita: [], pitaMode: 'jumlah', pitaIn: '', dec: null, pf: { a: '', b: '', c: '' }, pfok: 'a', teksHasil: '', nilai: null };
  const opKeys = '+−×÷';
  function bukaKurung(e) { return (e.match(/\(/g) || []).length - (e.match(/\)/g) || []).length; }
  function segAngka(e) { const m = e.match(/[\d,]+$/); return m ? m[0] : ''; }
  function tekan(k) {
    const t = K.tab;
    if (t === 'hitung') return tekanHitung(k);
    if (t === 'jumlah') return tekanJumlah(k);
    return tekanPyth(k);
  }
  function tekanHitung(k) {
    let e = K.expr;
    if (K.adaHasil) { if (/^\d$|^,$|^√$|^\($/.test(k)) { e = ''; K.hist = ''; } else if (opKeys.includes(k) || k === '²') { e = 'Ans'; } else if (k === '⌫' || k === 'C') { e = ''; K.hist = ''; if (k === '⌫') { K.adaHasil = false; K.expr = ''; return render(); } } K.adaHasil = false; }
    const last = e.slice(-1);
    if (/^\d$/.test(k)) e += (e.endsWith('Ans') || e.endsWith('²') || e.endsWith(')')) ? '×' + k : k;
    else if (k === ',') { if (segAngka(e).includes(',')) return; e += segAngka(e) ? ',' : '0,'; }
    else if (opKeys.includes(k)) { if (!e) { if (k === '−') e = '−'; else if (K.ans) e = 'Ans' + k; else return; } else if (opKeys.includes(last)) e = e.slice(0, -1) + k; else if (last === '(' && k !== '−') return; else e += k; }
    else if (k === '²') { if (/[\d)²s]$/.test(e)) e += '²'; }
    else if (k === '√') e += '√(';
    else if (k === '(') e += (e && /[\d)²s]$/.test(e)) ? '×(' : '(';
    else if (k === ')') { if (bukaKurung(e) > 0 && !opKeys.includes(last) && last !== '(') e += ')'; }
    else if (k === 'Ans') { if (!K.ans) return toast('Belum ada hasil sebelumnya'); e += (e && /[\d)²s]$/.test(e)) ? '×Ans' : 'Ans'; }
    else if (k === '⌫') { e = e.endsWith('Ans') ? e.slice(0, -3) : e.endsWith('√(') ? e.slice(0, -2) : e.slice(0, -1); }
    else if (k === 'C') { e = ''; K.hist = ''; }
    else if (k === '=') {
      const r = M.hitung(e, K.ans, true);
      if (!r || r.galat) { if (r && r.galat) toast(r.galat); return; }
      K.hist = tampil(e) + ' ='; K.ans = r.nilai; K.adaHasil = true; K.expr = e; render(true); return;
    }
    K.expr = e; render();
  }
  const tampil = e => e + ')'.repeat(Math.max(0, bukaKurung(e)));
  function tekanJumlah(k) {
    let e = K.pitaIn;
    if (/^\d$/.test(k)) e += k;
    else if (k === ',') { if (e.includes(',')) return; e += e ? ',' : '0,'; }
    else if (k === '⌫') e = e.slice(0, -1);
    else if (k === 'C') { e = ''; if (!K.pitaIn) { K.pita = []; } }
    else if (k === '=') { if (!e) return; try { K.pita.push(M.parseNum(e)); K.pitaIn = ''; render(true); return; } catch (x) { return toast('Angka tidak valid'); } }
    else return;
    K.pitaIn = e; render();
  }
  function tekanPyth(k) {
    let v = K.pf[K.pfok] || '';
    if (/^\d$/.test(k)) v += k;
    else if (k === ',') { if (v.includes(',')) return; v += v ? ',' : '0,'; }
    else if (k === '⌫') v = v.slice(0, -1);
    else if (k === 'C') v = '';
    else if (k === '=') { const o = ['a', 'b', 'c'], i = o.indexOf(K.pfok); const nx = o.find((x, j) => j > i && !K.pf[x]) || o.find(x => !K.pf[x]); if (nx) K.pfok = nx; render(); return; }
    else return;
    if (v.length > 12) return; K.pf[K.pfok] = v; render();
  }
  function hasilFormat(r) {
    const f = M.fmt(r, K.dec); return f;
  }
  function render(efek) {
    const w = S.win; if (!w) return; S.kk.dataset.tab = K.tab;
    // tab kalkulator
    S.kt.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.t === K.tab));
    const lock = K.tab === 'pyth' && !CFG.izinPythagoras();
    const ex = S.ex, hs = S.hs, cat = S.cat, hm = S.hm;
    let tx = '', hasil = null, err = '', note = '';
    S.pita.style.display = K.tab === 'jumlah' ? 'flex' : 'none';
    S.fl.style.display = K.tab === 'pyth' ? 'flex' : 'none';
    S.lg.style.display = K.tab === 'pyth' ? 'block' : 'none';
    S.kun.style.display = lock ? 'block' : 'none';
    S.kp.style.display = lock ? 'none' : 'grid';
    S.pm.style.display = K.tab === 'jumlah' ? 'flex' : 'none';
    S.kp.classList.toggle('mode-j', K.tab !== 'hitung');
    S.kp.querySelectorAll('[data-k]').forEach(b => { const kk = b.dataset.k; b.classList.toggle('off', K.tab !== 'hitung' && !/^\d$|^,$|^⌫$|^C$|^=$/.test(kk)); });
    const eqb = S.kp.querySelector('[data-k="="]'); eqb.textContent = K.tab === 'jumlah' ? 'Masuk' : K.tab === 'pyth' ? 'Lanjut' : '=';
    if (K.tab === 'hitung') {
      ex.replaceChildren(document.createTextNode(K.adaHasil ? K.hist : K.expr), el('span', { class: 'gh', text: K.adaHasil ? '' : ')'.repeat(Math.max(0, bukaKurung(K.expr))) }));
      if (K.adaHasil) hasil = K.ans;
      else { const r = M.hitung(K.expr, K.ans, true); if (r && r.nilai) hasil = r.nilai; else if (r && r.galat && K.expr && !/^Ekspresi|^Kurung|^Angka/.test(r.galat)) err = r.galat; }
    } else if (K.tab === 'jumlah') {
      const ml = { jumlah: 'a + b + …', kuadrat: 'a² + b² + …', akar: '√a + √b + …' }[K.pitaMode];
      ex.textContent = K.pitaIn ? 'Angka: ' + K.pitaIn : ml;
      try { const p = M.jumlahPita(K.pita, K.pitaMode); hasil = K.pita.length ? p.total : null; S.pita.replaceChildren(...(K.pita.length ? K.pita.slice(-8).map((x, i) => { const f = M.fmt(x).teks; const lab = K.pitaMode === 'kuadrat' ? f + '²' : K.pitaMode === 'akar' ? '√' + f : f; const v = M.fmt(p.baris[K.pita.length - Math.min(8, K.pita.length) + i], 4).teks; return el('span', { class: 'ch', text: K.pitaMode === 'jumlah' ? lab : lab + '=' + M.fmt(p.baris[K.pita.length - Math.min(8, K.pita.length) + i]).teks }); }) : [el('span', { class: 'kos', text: 'Ketik angka lalu tekan Masuk. Total muncul otomatis.' })])); if (K.pita.length > 8) S.pita.prepend(el('span', { class: 'kos', text: '+' + (K.pita.length - 8) + ' lagi' })); } catch (x) { err = x.message; }
    } else {
      ex.textContent = lock ? '' : 'Kosongkan sisi yang dicari';
      S.fl.querySelectorAll('button').forEach(b => { const k = b.dataset.f; b.firstChild.textContent = (K.pf[k] || '?') ; b.classList.toggle('on', K.pfok === k); });
      try { const p = lock ? null : M.pyth(K.pf); K.py = p; if (p) { hasil = p.hasil; S.lg.replaceChildren(...p.langkah.map((l, i) => el('div', { class: i === 2 ? 'l3' : '', text: l }))); note = '' } else S.lg.replaceChildren(el('div', { text: 'Isi dua sisi, sisi ketiga dikosongkan. Hasil dan langkah muncul otomatis.' })); } catch (x) { err = x.message; S.lg.replaceChildren(el('div', { text: '' })); }
    }
    hs.className = 'hs' + (K.tab === 'hitung' && !K.adaHasil ? ' live' : '');
    hm.style.display = 'none';
    if (err) { hs.classList.add('err'); hs.textContent = err; cat.textContent = ''; K.nilai = null; K.teksHasil = ''; }
    else if (hasil) {
      const f = hasilFormat(hasil); K.nilai = hasil; K.teksHasil = f.teks;
      hs.textContent = (f.hampir ? '≈ ' : '') + f.teks;
      cat.textContent = '';
      if (efek && !S.reduce) sprite(S.ds, 'efek_hasil_muncul', true, 1);
    } else { hs.textContent = K.tab === 'pyth' || K.tab === 'jumlah' ? '0' : '0'; cat.textContent = ''; K.nilai = null; K.teksHasil = ''; }
    // catatan bentuk akar (mis. √72 = 6√2) untuk hasil akar tidak bulat
    if (K.tab === 'pyth' && K.py && K.py.rad) cat.textContent = 'Bentuk akar: ' + K.py.rad;
    S.pakai.disabled = !K.teksHasil; S.salin.disabled = !K.teksHasil;
    S.rnd.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(K.dec) === b.dataset.d));
    S.pm.querySelectorAll('button').forEach(b => b.classList.toggle('on', K.pitaMode === b.dataset.m));
    ex.scrollLeft = ex.scrollWidth;
  }
  function kalkUI() {
    const kt = el('div', { class: 'kt' }, ...[['hitung', 'Hitung'], ['jumlah', 'Jumlah'], ['pyth', 'Pythagoras']].map(([t, n]) => el('button', { 'data-t': t, text: n, onclick: () => { K.tab = t; render(); } })));
    const ex = el('div', { class: 'ex' }), hs = el('div', { class: 'hs', text: '0' }), cat = el('div', { class: 'cat' }), hm = el('div', { class: 'hm' });
    const ds = el('div', { class: 'ds' }, ex, hs, cat, hm);
    const rnd = el('div', { class: 'rnd' }, el('span', { text: 'Bulatkan' }), ...[[null, 'Auto'], [0, '0'], [1, '1'], [2, '2'], [3, '3']].map(([d, n]) => el('button', { 'data-d': String(d), text: n, onclick: () => { K.dec = d; render(); } })));
    const pm = el('div', { class: 'rnd' }, ...[['jumlah', 'Jumlah'], ['kuadrat', 'Jumlah kuadrat'], ['akar', 'Jumlah akar']].map(([m, n]) => el('button', { 'data-m': m, text: n, onclick: () => { K.pitaMode = m; render(); } })));
    const pita = el('div', { class: 'pita' });
    const fl = el('div', { class: 'fl' }, ...['a', 'b', 'c'].map(k => el('button', { 'data-f': k, onclick: () => { K.pfok = k; render(); } }, el('span', { text: '?' }), el('small', { text: k === 'c' ? 'c (miring)' : k + (k === 'a' ? ' (tegak)' : ' (alas)') }))));
    const lg = el('div', { class: 'lg' });
    const kun = el('div', { class: 'kun', text: 'Tab Pythagoras dimatikan saat penilaian supaya kamu menghitung sendiri. Pakai tab Hitung untuk kuadrat dan akar.' });
    const salin = el('button', { onclick: () => salinHasil() }, ic('salin'), 'Salin');
    const pakai = el('button', { class: 'hijau', onclick: () => pakaiJawaban() }, ic('pakai_jawaban'), 'Pakai jawaban');
    const aks = el('div', { class: 'aks' }, salin, pakai);
    const kp = el('div', { class: 'kp' });
    const L = [['C', 'cl'], ['⌫', 'cl'], ['(', 'fn'], [')', 'fn'], ['²', 'fn', 'x²'], ['√', 'fn'], ['Ans', 'fn'], ['÷', 'op'], ['7'], ['8'], ['9'], ['×', 'op'], ['4'], ['5'], ['6'], ['−', 'op'], ['1'], ['2'], ['3'], ['+', 'op'], ['0'], [','], ['=', 'eq']];
    L.forEach(([k, c, lab]) => kp.append(el('button', { 'data-k': k, class: c || '', text: lab || k, onclick: () => { tekan(k); } })));
    Object.assign(S, { kt, ex, hs, cat, hm, ds, rnd, pm, pita, fl, lg, kun, salin, pakai, kp, aks });
    const kk = el('div', { class: 'kk', 'data-tab': 'hitung' }, el('div', { class: 'kl' }, kt, ds, rnd, pm, pita, fl, lg, kun, aks), kp); S.kk = kk; return kk;
  }
  function salinHasil() {
    if (!K.teksHasil) return; const t = K.teksHasil.replace('−', '-');
    safe(() => { const pr = navigator.clipboard.writeText(t); if (pr && pr.catch) pr.catch(() => {}); }); toast('Disalin: ' + K.teksHasil);
  }
  function pakaiJawaban() {
    if (!K.teksHasil) return; const t = K.teksHasil.replace('−', '-');
    let ok = false; try { ok = CFG.terapkanJawaban ? !!CFG.terapkanJawaban(t) : false; } catch (e) { }
    if (ok) { tutup(); } else { salinHasil(); }
  }

  /* =================== PAPAN TULIS =================== */
  const P = { alat: 'pena', bg: 'hijau', ci: 0, tb: 1, strokes: [], redo: [], undo: [], cur: null, boards: {}, pen: 0 };
  const WARNA = { hijau: ['#f8f8f0', '#ffe05a', '#78c8fa', '#fa828c'], putih: ['#222222', '#2060d0', '#d03030', '#1f9a63'], kotak: ['#222222', '#2060d0', '#d03030', '#1f9a63'] };
  const TEBAL = [0.004, 0.008, 0.016];
  function cvSize() { const r = S.cv.getBoundingClientRect(); return { w: Math.max(1, r.width), h: Math.max(1, r.height), dpr: Math.min(3, window.devicePixelRatio || 1) }; }
  function fitCanvas() {
    const z = cvSize(), c = S.cv; const W = Math.round(z.w * z.dpr), H = Math.round(z.h * z.dpr);
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; } redrawAll();
  }
  const ptPx = (p, W) => [p[0] * W, p[1] * W];
  function drawStroke(ctx, s, W, from) {
    const col = s.t === 'erase' ? '#000' : WARNA[P.bg][s.ci], lw = Math.max(1, s.w * W);
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.fillStyle = col;
    ctx.globalCompositeOperation = s.t === 'erase' ? 'destination-out' : 'source-over';
    const pts = s.pts.map(p => ptPx(p, W));
    if (s.t === 'pena' || s.t === 'erase') {
      if (pts.length === 1) { ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], lw / 2, 0, 7); ctx.fill(); }
      else { ctx.beginPath(); const i0 = from ? Math.max(0, from - 1) : 0; ctx.moveTo(pts[i0][0], pts[i0][1]); for (let i = i0 + 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
    } else if (s.t === 'garis' && pts.length > 1) { ctx.beginPath(); ctx.moveTo(...pts[0]); ctx.lineTo(...pts[pts.length - 1]); ctx.stroke(); }
    else if (s.t === 'segitiga' && pts.length > 1) {
      const a = pts[0], c = pts[pts.length - 1], b = [a[0], c[1]];
      ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.closePath(); ctx.stroke();
      const m = Math.min(Math.abs(c[0] - b[0]), Math.abs(a[1] - b[1]), 22 * (W / 600 + .5)) * .5, sx = Math.sign(c[0] - b[0]) || 1, sy = Math.sign(a[1] - b[1]) || -1;
      ctx.lineWidth = Math.max(1, lw * .6); ctx.beginPath(); ctx.moveTo(b[0] + sx * m, b[1]); ctx.lineTo(b[0] + sx * m, b[1] + sy * m); ctx.lineTo(b[0], b[1] + sy * m); ctx.stroke();
    }
    ctx.restore();
  }
  function redrawAll() {
    const c = S.cv, ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height);
    const W = c.width; P.strokes.forEach(s => drawStroke(ctx, s, W));
    if (P.cur) drawStroke(ctx, P.cur, W);
  }
  function posOf(e) { const r = S.cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * (r.width / r.width) * 1, 0, r]; }
  function norm(e) { const r = S.cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.width]; }
  function pushUndo() { P.undo.push(P.strokes.slice()); if (P.undo.length > 100) P.undo.shift(); P.redo = []; }
  function setupCanvas() {
    const c = S.cv; let aktif = null;
    c.addEventListener('pointerdown', e => {
      if (e.pointerType === 'pen') P.pen = Date.now();
      if (e.pointerType === 'touch' && Date.now() - P.pen < 1500) return;      // tolak telapak tangan saat pakai pena
      if (aktif !== null) return; if (e.pointerType === 'mouse' && e.button !== 0) return;
      aktif = e.pointerId; c.setPointerCapture(e.pointerId); e.preventDefault();
      const t = P.alat === 'penghapus' ? 'erase' : P.alat;
      P.cur = { t, ci: P.ci, w: TEBAL[P.tb] * (t === 'erase' ? 3.2 : 1), pts: [norm(e)] };
      const ctx = c.getContext('2d'); drawStroke(ctx, P.cur, c.width);
    });
    c.addEventListener('pointermove', e => {
      if (e.pointerId !== aktif || !P.cur) return; e.preventDefault();
      const ev = (e.getCoalescedEvents && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
      const s = P.cur; const from = s.pts.length;
      if (s.t === 'pena' || s.t === 'erase') { ev.forEach(x => s.pts.push(norm(x))); drawStroke(c.getContext('2d'), s, c.width, from); }
      else { s.pts[1] = norm(e); s.pts.length = 2; redrawAll(); }
    });
    const fin = e => { if (e.pointerId !== aktif) return; aktif = null; if (P.cur) { if (P.cur.pts.length > 0) { pushUndo(); P.strokes.push(P.cur); } P.cur = null; redrawAll(); updTb(); } };
    c.addEventListener('pointerup', fin); c.addEventListener('pointercancel', fin);
    c.addEventListener('contextmenu', e => e.preventDefault());
    c.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    new ResizeObserver(() => fitCanvas()).observe(S.cvw);
  }
  function updTb() {
    S.tb.querySelectorAll('[data-a]').forEach(b => b.classList.toggle('on', b.dataset.a === P.alat));
    S.tb.querySelectorAll('[data-c]').forEach(b => { const i = +b.dataset.c; b.firstChild.style.background = WARNA[P.bg][i]; b.classList.toggle('on', P.ci === i && P.alat !== 'penghapus'); });
    S.tb.querySelector('[data-x="undo"]').disabled = !P.undo.length; S.tb.querySelector('[data-x="redo"]').disabled = !P.redo.length;
    S.tb.querySelector('[data-x="clear"]').disabled = !P.strokes.length;
    S.cvw.dataset.bg = P.bg; S.cvw.dataset.alat = P.alat;
    const tbn = S.tb.querySelector('[data-x="tebal"]'); tbn.title = 'Tebal garis: ' + (P.tb + 1);
    tbn.firstChild.style.transform = 'scale(' + (0.8 + P.tb * .15) + ')';
  }
  function boardUI() {
    const cv = el('canvas'), cvw = el('div', { class: 'cvw', 'data-bg': 'hijau' }, cv);
    const B = (a, n, ttl) => el('button', { 'data-a': a, title: ttl, 'aria-label': ttl, onclick: () => { P.alat = a; updTb(); } }, ic(n));
    const C = i => el('button', { 'data-c': i, 'aria-label': 'Warna ' + (i + 1), onclick: () => { P.ci = i; if (P.alat === 'penghapus') P.alat = 'pena'; updTb(); } }, el('span', { class: 'w' }));
    const X = (x, n, ttl, f) => el('button', { 'data-x': x, title: ttl, 'aria-label': ttl, onclick: f }, ic(n));
    const tb = el('div', { class: 'tb' },
      B('pena', 'kapur', 'Pena'), B('penghapus', 'penghapus', 'Penghapus'), B('garis', 'garis', 'Garis lurus'), B('segitiga', 'segitiga_siku', 'Segitiga siku-siku'),
      C(0), C(1), C(2), C(3),
      X('tebal', 'tebal', 'Tebal garis', () => { P.tb = (P.tb + 1) % 3; updTb(); }),
      X('latar', 'latar', 'Ganti latar', () => { P.bg = { hijau: 'putih', putih: 'kotak', kotak: 'hijau' }[P.bg]; updTb(); redrawAll(); }),
      X('undo', 'undo', 'Urungkan', () => { if (!P.undo.length) return; P.redo.push(P.strokes); P.strokes = P.undo.pop(); redrawAll(); updTb(); }),
      X('redo', 'redo', 'Ulangi', () => { if (!P.redo.length) return; P.undo.push(P.strokes); P.strokes = P.redo.pop(); redrawAll(); updTb(); }),
      X('clear', 'hapus_semua', 'Hapus semua', () => { if (!P.strokes.length) return; pushUndo(); P.strokes = []; redrawAll(); updTb(); if (!S.reduce) sprite(cvw, 'efek_debu_kapur', true); }),
      X('simpan', 'simpan', 'Simpan gambar', simpanPNG));
    Object.assign(S, { cv, cvw, tb });
    return el('div', { class: 'pp' }, cvw, tb);
  }
  function simpanPNG() {
    const z = cvSize(), W = S.cv.width, H = S.cv.height, o = document.createElement('canvas'); o.width = W; o.height = H;
    const x = o.getContext('2d'); x.fillStyle = { hijau: '#265c46', putih: '#faf9f4', kotak: '#fffdf4' }[P.bg]; x.fillRect(0, 0, W, H);
    if (P.bg === 'kotak') { x.strokeStyle = '#aac8eb'; const g = 32 * z.dpr; for (let i = 0; i < W; i += g) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let j = 0; j < H; j += g) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); } }
    x.drawImage(S.cv, 0, 0);
    const a = document.createElement('a'); a.download = 'coretan-' + (S.ctxId || 'umum') + '.png'; a.href = o.toDataURL('image/png'); a.click(); toast('Gambar disimpan');
  }
  function simpanPapan() { if (S.ctxId != null) P.boards[S.ctxId] = { strokes: P.strokes, undo: P.undo, redo: P.redo }; }
  function muatPapan(id) { const b = P.boards[id]; P.strokes = b ? b.strokes : []; P.undo = b ? b.undo : []; P.redo = b ? b.redo : []; P.cur = null; }

  /* =================== OVERLAY / DOCK =================== */
  function konteks() {
    let k = null; try { k = CFG.getKonteks ? CFG.getKonteks() : null; } catch (e) { }
    return k || { id: 'umum', teks: '' };
  }
  function setSoal(k) {
    const s = S.soal; s.classList.toggle('kosong', !k.teks && !k.gambar); s.classList.remove('luas');
    const tx = el('span', { class: 'tx', text: k.teks || '' }); const kids = [];
    if (k.gambar) { const src = /^\s*<svg/i.test(k.gambar) ? 'data:image/svg+xml;utf8,' + encodeURIComponent(k.gambar) : k.gambar; kids.push(el('img', { src, alt: '' })); }
    kids.push(tx); s.replaceChildren(...kids);
  }
  /* ---- Pilihan tampilan: jendela kecil di atas fitur lain, atau satu layar penuh ---- */
  const MODE_CSS = `
.hd .mode{display:flex;border:2px solid #3a2418;border-radius:10px;overflow:hidden;flex:none}
.hd .mode button{padding:4px 9px;font-weight:800;font-size:12px;background:#fff3cf;color:#3a2418;border:0;cursor:pointer;white-space:nowrap}
.hd .mode button.on{background:#ffc83d;box-shadow:inset 0 -3px 0 #c9901c}
.ov.kecil{background:transparent;pointer-events:none;padding:0;touch-action:auto}
.ov.kecil .win{position:fixed;pointer-events:auto;width:min(440px,94vw);height:min(540px,calc(100dvh - 120px));max-width:none;margin:0;right:10px;bottom:70px;box-shadow:0 12px 32px #000a,0 4px 0 #3a2418}
.ov.kecil .hd{cursor:grab;touch-action:none}.ov.kecil .hd .judul{display:none}.ov.kecil .soal{display:none}.ov.kecil .hd .mode{margin-right:auto}
.ov.kecil .tabs{display:flex!important}
.ov.kecil .win[data-tab=papan] .kk{display:none!important}
.ov.kecil .win[data-tab=kalk] .pp{display:none!important}
.ov.kecil .win .pp{flex-direction:column!important;flex:1!important}
.ov.kecil .win .kk{width:100%!important;flex:1!important;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y}
.ov.kecil .win .cvw{flex:1 1 auto!important;min-height:140px!important;height:auto!important}
.ov.kecil .win .tb{grid-template-columns:repeat(7,minmax(0,1fr))!important;grid-auto-rows:auto!important;align-content:start!important;height:auto!important;flex:none!important}
.ov.kecil .win .tb button{height:34px!important;min-height:0!important}
@media (max-height:460px){.ov.kecil .win{height:calc(100dvh - 16px);bottom:8px;width:min(440px,60vw)}.ov.kecil .win .tb button{height:28px!important}}
@media (max-width:560px){.ov.kecil .win{left:3vw;right:3vw;width:auto;bottom:66px;height:min(58dvh,500px)}}
.ov.penuh .hd .mode{margin-left:auto;margin-right:4px}`;
  function modeAwal() { try { return localStorage.getItem('jba_mode') === 'penuh' ? 'penuh' : 'kecil'; } catch (e) { return 'kecil'; } }
  function setMode(m, awal) {
    S.mode = m === 'penuh' ? 'penuh' : 'kecil';
    S.ov.classList.toggle('kecil', S.mode === 'kecil'); S.ov.classList.toggle('penuh', S.mode === 'penuh');
    [...S.modeBar.children].forEach(b => { const on = b.dataset.mode === S.mode; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    if (!awal) { try { localStorage.setItem('jba_mode', S.mode); } catch (e) { } if (S.win) { S.win.style.left = S.win.style.top = S.win.style.right = S.win.style.bottom = ''; if (S.mode === 'kecil') posisiKecil(); } requestAnimationFrame(() => { fitCanvas(); updTb(); render(); }); }
  }
  function posisiKecil() { try { const q = JSON.parse(localStorage.getItem('jba_kecil_pos') || 'null'); if (q && S.win) { const r = S.win.getBoundingClientRect(); S.win.style.left = Math.max(0, Math.min(innerWidth - 60, q.x)) + 'px'; S.win.style.top = Math.max(0, Math.min(innerHeight - 60, q.y)) + 'px'; S.win.style.right = 'auto'; S.win.style.bottom = 'auto'; } } catch (e) { } }
  function pasangSeret(hd) {
    let d = null;
    hd.addEventListener('pointerdown', e => {
      if (S.mode !== 'kecil' || e.target.closest('button')) return;
      const r = S.win.getBoundingClientRect(); d = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      S.win.style.right = S.win.style.bottom = 'auto'; S.win.style.left = r.left + 'px'; S.win.style.top = r.top + 'px';
      try { hd.setPointerCapture(e.pointerId); } catch (x) { } hd.style.cursor = 'grabbing';
    });
    hd.addEventListener('pointermove', e => {
      if (!d) return; const w = S.win.offsetWidth, h = S.win.offsetHeight;
      S.win.style.left = Math.max(-w + 80, Math.min(innerWidth - 80, e.clientX - d.dx)) + 'px'; S.win.style.top = Math.max(0, Math.min(innerHeight - 50, e.clientY - d.dy)) + 'px';
    });
    const end = () => { if (!d) return; d = null; hd.style.cursor = ''; try { const r = S.win.getBoundingClientRect(); localStorage.setItem('jba_kecil_pos', JSON.stringify({ x: r.left, y: r.top })); } catch (x) { } };
    hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end);
  }
  function setKalk(on) {
    S.kalkOff = !on; if (!S.ready) return;
    let st = SH.querySelector('#kalkoff'); if (!st) { st = el('style', { id: 'kalkoff' }); SH.append(st); }
    st.textContent = on ? '' : '.dock [data-ak="kalk"],.tabs [data-tt="kalk"]{display:none!important}.win[data-tab="kalk"] .kk{display:none!important}';
    if (!on && S.win && S.win.dataset.tab === 'kalk') S.win.dataset.tab = 'papan';
  }
  function buka(tab) {
    if (!CFG.aktif || !S.ov) return;
    if (S.kalkOff && tab === 'kalk') tab = 'papan';
    const k = konteks(); simpanPapan(); S.ctxId = k.id == null ? 'umum' : k.id; muatPapan(S.ctxId); setSoal(k);
    S.win.dataset.tab = tab === 'kalk' ? 'kalk' : 'papan';
    S.ov.classList.add('buka'); S.dock.classList.add('tutup'); S.terbuka = true; S.aktif = true;
    if (S.mode === 'kecil') posisiKecil();
    if (CFG.onBuka) safe(CFG.onBuka);
    S.ov.focus && S.ov.focus();
    requestAnimationFrame(() => { fitCanvas(); updTb(); render(); });
  }
  function tutup() {
    if (!S.terbuka) return; simpanPapan(); S.ov.classList.remove('buka'); S.terbuka = false; if (CFG.tampilDock) S.dock.classList.remove('tutup');
    if (CFG.onTutup) safe(CFG.onTutup);
  }
  function keyHandler(e) {
    if (!S.terbuka) return;
    /* Mode kecil: tombol keyboard hanya dipakai bila alat sedang disentuh/diketuk. Selain itu ketikan milik fitur lain. */
    if (S.mode === 'kecil' && !S.aktif) return;
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key; let map = null;
    if (k === 'Escape') { e.preventDefault(); return tutup(); }
    if (S.win.dataset.tab === 'papan' && !matchMedia('(orientation:landscape) and (min-width:560px) and (min-height:461px)').matches) return;
    if (/^\d$/.test(k)) map = k; else if (k === ',' || k === '.') map = ','; else if (k === '+') map = '+'; else if (k === '-') map = '−'; else if (k === '*' || k === 'x' || k === 'X') map = '×'; else if (k === '/') map = '÷';
    else if (k === '(' || k === ')') map = k; else if (k === '^') map = '²'; else if (k === 'Enter' || k === '=') map = '='; else if (k === 'Backspace') map = '⌫'; else if (k === 'Delete') map = 'C';
    if (map) { e.preventDefault(); tekan(map); }
  }
  function dockPos() {
    const d = S.dock, r = d.getBoundingClientRect(); const W = innerWidth, H = innerHeight;
    const por = innerHeight > innerWidth; S.por = por;
    const p = safe(() => JSON.parse(lsGet(por ? 'jba_dock_p' : 'jba_dock_l')), null) || (por ? { sisi: 'kanan', y: 0.86 } : CFG.dock);
    const y = Math.min(Math.max(8, p.y * H - r.height / 2), H - r.height - 8);
    d.style.top = y + 'px'; d.style.bottom = 'auto';
    if (p.sisi === 'kiri') { d.style.left = '8px'; d.style.right = 'auto'; } else { d.style.right = '8px'; d.style.left = 'auto'; }
  }
  function dockDrag() {
    const d = S.dock, g = S.grip; let st = null;
    g.addEventListener('pointerdown', e => { const r = d.getBoundingClientRect(); st = { dx: e.clientX - r.left, dy: e.clientY - r.top }; g.setPointerCapture(e.pointerId); e.preventDefault(); });
    g.addEventListener('pointermove', e => { if (!st) return; d.style.left = (e.clientX - st.dx) + 'px'; d.style.top = (e.clientY - st.dy) + 'px'; d.style.right = 'auto'; });
    g.addEventListener('pointerup', e => { if (!st) return; st = null; const r = d.getBoundingClientRect(); const sisi = (r.left + r.width / 2) < innerWidth / 2 ? 'kiri' : 'kanan'; lsSet(S.por ? 'jba_dock_p' : 'jba_dock_l', JSON.stringify({ sisi, y: (r.top + r.height / 2) / innerHeight })); dockPos(); });
    let to; const pud = () => { S.dock.classList.add('pudar'); }; const nyala = () => { S.dock.classList.remove('pudar'); clearTimeout(to); to = setTimeout(pud, 3500); };
    d.addEventListener('pointerdown', nyala); d.addEventListener('pointerenter', nyala); nyala();
  }
  function init(opt) {
    if (S.ready) return; Object.assign(CFG, opt || {});
    if (!CFG.aktif) return;
    try {
      S.reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
      ROOT = el('div', { id: 'jba-host' }); document.body.append(ROOT); SH = ROOT.attachShadow({ mode: 'open' });
      SH.append(el('style', { text: CSS.replace(/__BASE__/g, CFG.baseAset) + spriteCss() }));
      SH.append(el('style', { text: MODE_CSS }));
      const root = el('div', { class: 'root' }); SH.append(root);
      S.toast = el('div', { class: 'toast' });
      const soal = el('button', { class: 'soal kosong', title: 'Ketuk untuk memperluas soal', onclick: () => soal.classList.toggle('luas') }); S.soal = soal;
      const x = el('button', { class: 'x', 'aria-label': 'Tutup', onclick: tutup }, ic('tutup'));
      const mBtn = (k, t, tt) => el('button', { type: 'button', 'data-mode': k, title: tt, 'aria-pressed': 'false', onclick: () => setMode(k) }, t);
      const modeBar = el('div', { class: 'mode', role: 'group', 'aria-label': 'Pilih tampilan' }, mBtn('kecil', '◱ Kecil', 'Jendela kecil di atas fitur lain'), mBtn('penuh', '⛶ Penuh', 'Satu layar penuh'));
      S.modeBar = modeBar;
      const hd = el('div', { class: 'hd' }, el('span', { class: 'judul', text: 'Alat Bantu' }), modeBar, soal, x);
      const pp = boardUI(), kk = kalkUI();
      const bd = el('div', { class: 'bd' }, pp, kk);
      const tabs = el('div', { class: 'tabs' },
        el('button', { 'data-tt': 'papan', onclick: () => { S.win.dataset.tab = 'papan'; S.tabs.forEach(t => t.classList.toggle('on', t.dataset.tt === 'papan')); requestAnimationFrame(fitCanvas); } }, ic('papan_tulis'), 'Papan Tulis'),
        el('button', { 'data-tt': 'kalk', onclick: () => { S.win.dataset.tab = 'kalk'; S.tabs.forEach(t => t.classList.toggle('on', t.dataset.tt === 'kalk')); render(); } }, ic('kalkulator'), 'Kalkulator'));
      S.tabs = [...tabs.children];
      S.win = el('div', { class: 'win', 'data-tab': 'papan' }, hd, bd, tabs);
      const mo = new MutationObserver(() => S.tabs.forEach(t => t.classList.toggle('on', t.dataset.tt === S.win.dataset.tab))); mo.observe(S.win, { attributes: true, attributeFilter: ['data-tab'] });
      S.ov = el('div', { class: 'ov', tabindex: '-1', role: 'dialog', 'aria-label': 'Kalkulator dan papan tulis' }, S.win);
      setMode(modeAwal(), true); pasangSeret(hd); try { new ResizeObserver(() => { if (S.terbuka) fitCanvas(); }).observe(S.win); } catch (e) { }
      S.grip = el('button', { class: 'g', 'aria-label': 'Geser' }, ic('geser'));
      S.dock = el('div', { class: 'dock' }, S.grip,
        el('button', { class: 'b', 'data-ak': 'kalk', 'aria-label': 'Kalkulator ajaib', title: 'Kalkulator Ajaib', onclick: () => buka('kalk') }, ic('kalkulator')),
        el('button', { class: 'b', 'aria-label': 'Papan tulis', title: 'Papan Tulis', onclick: () => buka('papan') }, ic('papan_tulis')));
      if (!CFG.tampilDock) S.dock.classList.add('tutup');
      root.append(S.dock, S.ov, S.toast);
      setupCanvas(); dockDrag(); dockPos(); addEventListener('resize', () => { dockPos(); if (S.terbuka) fitCanvas(); }); addEventListener('orientationchange', () => setTimeout(() => { dockPos(); if (S.terbuka) fitCanvas(); }, 250));
      addEventListener('keydown', keyHandler, true); addEventListener('keyup', e => { if (S.terbuka && (S.mode !== 'kecil' || S.aktif)) e.stopPropagation(); }, true);
      addEventListener('pointerdown', e => { try { S.aktif = !!(S.terbuka && S.win && e.composedPath().indexOf(S.win) >= 0); } catch (x) { S.aktif = false; } }, true);
      S.ready = true; updTb(); render();
    } catch (err) { console.warn('[JBAlat] gagal init, game lama tetap jalan:', err); try { ROOT && ROOT.remove(); } catch (e) { } }
  }
  function pasangKartuMenu(wadah) {
    if (!wadah || !S.ready) return null;
    const host = el('div'); const sh = host.attachShadow({ mode: 'open' });
    sh.append(el('style', { text: CSS.replace(/__BASE__/g, CFG.baseAset) + spriteCss() }));
    const ms = el('div', { class: 'ms' }); ms.style.cssText = `background:url(${CFG.baseAset}spritesheet/bintang_ajaib.png) 0 0/${112 * 8 * .3}px ${112 * .3}px no-repeat;animation:spm 1s steps(8) infinite;`;
    sh.append(el('style', { text: '@keyframes spm{to{background-position-x:-' + 112 * 8 * .3 + 'px}}' }));
    const im = n => { const i = el('img', { src: CFG.baseAset + 'statis/' + n + '.png', alt: '' }); i.addEventListener('error', () => i.remove()); return i; };
    sh.append(el('div', { class: 'kartu' }, el('h3', null, ms, 'Alat Bantu Belajar'), el('div', { class: 'bt' },
      el('button', { onclick: () => buka('kalk') }, im('prop_kalkulator'), 'Kalkulator Ajaib'),
      el('button', { onclick: () => buka('papan') }, im('prop_papan_tulis'), 'Papan Tulis'))));
    wadah.append(host); return host;
  }
  window.JBAlat = { init, buka, tutup, setKalk, pasangKartuMenu, setKonteks: k => { CFG.getKonteks = () => k; }, config: CFG, Mesin: M, _K: K, _P: P };
})();
