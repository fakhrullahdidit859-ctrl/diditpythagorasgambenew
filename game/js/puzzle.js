/* Eksplorasi Pythagoras: hub kegiatan (geser sisi, puzzle persegi, puzzle bukti, cari hipotenusa) */
(function () {
  'use strict';
  const PP = window.PP, S = PP.PPStore || window.PPStore;
  const NS = 'http://www.w3.org/2000/svg';
  const rot = (p, r) => { let [x, y] = p; for (let i = 0; i < ((r % 4) + 4) % 4; i++) [x, y] = [-y, x]; return [x, y]; };
  const cen = pts => { let x = 0, y = 0; pts.forEach(p => { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; };
  const pstr = pts => pts.map(p => p[0].toFixed(3) + ',' + p[1].toFixed(3)).join(' ');
  const done = (key, xp) => { try { S.data.explored = (S.data.explored || 0) + 1; S.data['pz_' + key] = true; S.save(); S.award('explorer'); S.addXP(xp || 15); } catch (e) {} };
  const celebrate = () => { try { PP.ui.confetti && PP.ui.confetti(); } catch (e) {} try { window.PPAudio && PPAudio.sfx && PPAudio.sfx('win'); } catch (e) {} };

  /* ---------- mesin puzzle ---------- */
  function engine(root, cfg) {
    const { vb, bg, slots, pieces, say, onDone } = cfg;
    root.innerHTML = `<div class="pz"><div class="pz-top"><div class="pz-rafi">${PP.Rafi.head()}</div><div class="pz-say" aria-live="polite"></div>
      <div class="pz-btns"><button class="btn sm nosfx" data-pz="rot">⟳ Putar</button><button class="btn sm gold nosfx" data-pz="hint">💡 Petunjuk</button><button class="btn sm nosfx" data-pz="reset">↺ Ulang</button></div></div>
      <svg class="pz-svg" viewBox="${vb.join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Papan puzzle"></svg>
      <div class="pz-prog"><i></i></div></div>`;
    const svg = PP.$('.pz-svg', root), sayEl = PP.$('.pz-say', root), rafi = PP.$('.rafi', root), bar = PP.$('.pz-prog i', root);
    let st, sel = null, speakT;
    const speak = t => { sayEl.textContent = t; rafi.classList.add('talk'); clearTimeout(speakT); speakT = setTimeout(() => rafi.classList.remove('talk'), Math.min(2600, 500 + t.length * 30)); };
    function build() {
      svg.innerHTML = bg + slots.map((s, i) => `<polygon class="pz-slot" data-s="${i}" points="${pstr(s.poly)}"/>`).join('');
      st = { filled: slots.map(() => null), ps: pieces.map(p => ({ ...p, x: p.x0, y: p.y0, r: p.r0 || 0, locked: false })) };
      st.ps.forEach((p, i) => {
        const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pz-piece ' + (p.cls || '')); g.dataset.i = i;
        g.innerHTML = `<polygon points="${pstr(p.base)}"/>${p.lab ? `<text class="pz-lab" text-anchor="middle" dominant-baseline="central">${p.lab}</text>` : ''}`;
        svg.appendChild(g); place(i);
      });
      progress();
    }
    function place(i) { const p = st.ps[i], g = svg.querySelector(`.pz-piece[data-i="${i}"]`); g.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.r * 90})`); const t = g.querySelector('text'); if (t) t.setAttribute('transform', `rotate(${-p.r * 90})`); g.classList.toggle('locked', p.locked); g.classList.toggle('sel', sel === i); }
    function progress() { const n = st.filled.filter(x => x !== null).length; bar.style.width = (100 * n / slots.length) + '%'; return n; }
    const pt = e => { const m = svg.getScreenCTM().inverse(), q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; const r = q.matrixTransform(m); return [r.x, r.y]; };
    const tol = cfg.tol;
    function trySnap(i) {
      const p = st.ps[i];
      for (let k = 0; k < slots.length; k++) {
        const s = slots[k]; if (st.filled[k] !== null || s.kind !== p.kind) continue;
        if (p.rotatable && ((p.r % 4) + 4) % 4 !== s.rot) continue;
        if (Math.hypot(p.x - s.cx, p.y - s.cy) <= tol) { p.x = s.cx; p.y = s.cy; p.locked = true; st.filled[k] = i; svg.querySelector(`.pz-slot[data-s="${k}"]`).classList.add('ok'); place(i); try { window.PPAudio && PPAudio.sfx && PPAudio.sfx('correct'); } catch (e) {} return true; }
      }
      return false;
    }
    let drag = null;
    svg.addEventListener('pointerdown', e => {
      const g = e.target.closest('.pz-piece'); if (!g) return;
      const i = +g.dataset.i, p = st.ps[i], c = pt(e);
      if (p.locked) { const k = st.filled.indexOf(i); if (k >= 0) { st.filled[k] = null; svg.querySelector(`.pz-slot[data-s="${k}"]`).classList.remove('ok'); } p.locked = false; progress(); } drag = { i, dx: p.x - c[0], dy: p.y - c[1], sx: c[0], sy: c[1], moved: false };
      sel = i; svg.appendChild(g); svg.setPointerCapture(e.pointerId); st.ps.forEach((_, j) => place(j)); e.preventDefault();
    });
    svg.addEventListener('pointermove', e => {
      if (!drag) return; const c = pt(e), p = st.ps[drag.i];
      if (Math.hypot(c[0] - drag.sx, c[1] - drag.sy) > 0.15) drag.moved = true;
      if (drag.moved) { p.x = c[0] + drag.dx; p.y = c[1] + drag.dy; place(drag.i); }
    });
    const end = () => {
      if (!drag) return; const i = drag.i, p = st.ps[i];
      if (!drag.moved && p.rotatable) { p.r = (p.r + 1) % 4; place(i); }
      else if (drag.moved) {
        if (trySnap(i)) { const n = progress(); speak(n === slots.length ? 'Hebat!' : (say.ok[n % say.ok.length] || 'Pas!')); if (n === slots.length) setTimeout(() => { celebrate(); onDone && onDone(); speak(say.done); }, 350); }
        else speak(say.miss[Math.floor(Math.random() * say.miss.length)]);
      }
      drag = null;
    };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-pz]'); if (!b) return;
      if (b.dataset.pz === 'reset') { sel = null; build(); speak(say.start); }
      if (b.dataset.pz === 'rot') { const p = st.ps[sel]; if (p && p.rotatable && !p.locked) { p.r = (p.r + 1) % 4; place(sel); } else speak('Ketuk dulu potongan segitiga, lalu tekan Putar.'); }
      if (b.dataset.pz === 'hint') {
        const k = st.filled.findIndex(x => x === null); if (k < 0) return;
        const el = svg.querySelector(`.pz-slot[data-s="${k}"]`); el.classList.add('hint'); setTimeout(() => el.classList.remove('hint'), 1800); speak(slots[k].hint || 'Cari tempat yang berkedip.');
      }
    });
    build(); speak(say.start);
  }

  /* tata letak rak potongan: sizes = sisi kotak tiap potongan; hasil: posisi pusat relatif, lebar, tinggi */
  function pack(sizes, maxW, gap) {
    gap = gap || 0.4; const pos = []; let x = 0, y = 0, rowH = 0, W = 0;
    sizes.forEach(sz => { if (x > 0 && x + sz > maxW) { x = 0; y += rowH + gap; rowH = 0; } pos.push([x + sz / 2, y + sz / 2]); x += sz + gap; rowH = Math.max(rowH, sz); W = Math.max(W, x - gap); });
    return { pos, w: W, h: y + rowH };
  }

  /* ---------- Puzzle Bukti (a+b)^2 ---------- */
  function buildProof(root, stage, a, b) {
    const F = a + b, c2 = Math.hypot(a, b), land = window.innerWidth >= window.innerHeight * 0.9;
    const tb = [[0, 0], [a, 0], [0, b]], tc = cen(tb), base = tb.map(p => [p[0] - tc[0], p[1] - tc[1]]);
    const mkT = (P, r) => { const c = cen(tb.map(p => { const q = rot(p, r); return [q[0] + P[0], q[1] + P[1]]; })); const poly = base.map(p => { const q = rot(p, r); return [q[0] + c[0], q[1] + c[1]]; }); return { kind: 'T', cx: c[0], cy: c[1], rot: r, poly, hint: 'Segitiga ini butuh dipasang di pojok bingkai.' }; };
    let sl, pcs;
    const trSl = stage === 1 ? [mkT([0, 0], 0), mkT([F, 0], 1), mkT([F, F], 2), mkT([0, F], 3)] : [mkT([b, 0], 1), mkT([0, a], 3), mkT([b, a], 0), mkT([F, F], 2)];
    const sqP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    const extra = [];
    if (stage === 1) { const poly = [[a, 0], [F, a], [b, F], [0, b]], c = cen(poly); extra.push({ kind: 'C', cx: c[0], cy: c[1], rot: 0, poly, hint: 'Persegi miring c² masuk di tengah.' }); }
    else { const A = sqP(b, 0, a, a), B = sqP(0, a, b, b); extra.push({ kind: 'A', cx: b + a / 2, cy: a / 2, rot: 0, poly: A, hint: 'Persegi a² di pojok kanan atas.' }, { kind: 'B', cx: b / 2, cy: a + b / 2, rot: 0, poly: B, hint: 'Persegi b² di pojok kiri bawah.' }); }
    sl = [...trSl, ...extra];
    const szs = sl.map(q => q.kind === 'T' ? Math.max(a, b) + 0.3 : (q.kind === 'C' ? c2 : q.kind === 'A' ? a : b) + 0.3);
    const pk = pack(szs, land ? Math.max(10, Math.max(...szs) * 1.7) : Math.max(F, Math.max(...szs) * 1.7)), tx = land ? F + 1.2 : 0, ty = land ? 0 : F + 1.2;
    const pos = pk.pos.map(p => [p[0] + tx, p[1] + ty]);
    pcs = [];
    trSl.forEach((_, i) => pcs.push({ kind: 'T', base, rotatable: true, cls: 'p-tri', x0: pos[i][0], y0: pos[i][1], r0: [1, 2, 3, 2][i] % 4 }));
    extra.forEach((s, j) => { const poly = s.poly, c = cen(poly), bs = poly.map(p => [p[0] - c[0], p[1] - c[1]]), i = trSl.length + j; pcs.push({ kind: s.kind, base: bs, rotatable: false, cls: 'p-' + s.kind.toLowerCase(), lab: s.kind === 'C' ? 'c²' : s.kind === 'A' ? 'a²' : 'b²', x0: pos[i][0], y0: pos[i][1] }); });
    const W = land ? tx + pk.w : Math.max(F, pk.w), H = land ? Math.max(F, pk.h) : ty + pk.h;
    const bg = `<rect class="pz-frame" x="0" y="0" width="${F}" height="${F}"/><text class="pz-cap" x="${F / 2}" y="${-0.12}" text-anchor="middle">Bingkai ${F} × ${F}  (a + b)²</text>`;
    engine(root, { vb: [-0.3, -0.8, W + 0.6, H + 1.1], bg, slots: sl, pieces: pcs, tol: 0.1 * F,
      say: stage === 1 ? { start: 'Susun 4 segitiga di pojok bingkai, lalu isi tengahnya dengan persegi miring.', ok: ['Pas!', 'Satu lagi.', 'Bagus!', 'Hampir selesai.'], miss: ['Belum pas. Coba putar segitiganya.', 'Sisi tegaknya harus menempel ke tepi bingkai.'], done: 'Luas bingkai = 4 segitiga + persegi miring. Persegi miring itulah c².' }
        : { start: 'Sekarang bingkai yang sama diisi dengan persegi a², persegi b², dan 4 segitiga.', ok: ['Pas!', 'Mantap.', 'Satu lagi.', 'Tinggal sedikit.'], miss: ['Belum pas. Coba putar.', 'Coba tempat lain.'], done: 'Bingkainya sama! Jadi c² = a² + b². Itulah Teorema Pythagoras.' },
      onDone() { PP.$('.pz-note', root.parentNode) && (PP.$('.pz-note', root.parentNode).hidden = false); done('proof' + stage, 20); } });
  }

  /* ---------- Puzzle Persegi pada Sisi (pembuktian a² + b² = c²) ----------
     a² = 1 kotak utuh, b² = 4 puing, lalu a² + 4 puing b² mengisi c² (pembagian Perigal).
     Potongan tidak pernah terkunci: boleh dipindah dan dipisah lagi. */
  function clipHalf(poly, nx, ny, sg) {
    const o = [];
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i], B = poly[(i + 1) % poly.length], fa = sg * (A[0] * nx + A[1] * ny), fb = sg * (B[0] * nx + B[1] * ny);
      if (fa >= -1e-9) o.push(A);
      if ((fa >= -1e-9) !== (fb >= -1e-9)) { const t = fa / (fa - fb); o.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]); }
    }
    return o;
  }
  function buildSquares(root, a, b) {
    const c = Math.hypot(a, b), r2 = x => Math.round(x * 100) / 100, T = [0, -a], R = [b, 0];
    const d = [b / c, a / c], n = [a / c, -b / c];
    const Ac = [-a / 2, -a / 2], Bc = [b / 2, b / 2], Cc = [(T[0] + R[0]) / 2 + n[0] * c / 2, (T[1] + R[1]) / 2 + n[1] * c / 2];
    const sqr = (ce, w) => [[ce[0] - w / 2, ce[1] - w / 2], [ce[0] + w / 2, ce[1] - w / 2], [ce[0] + w / 2, ce[1] + w / 2], [ce[0] - w / 2, ce[1] + w / 2]];
    const Apoly = sqr(Ac, a), Bpoly = sqr(Bc, b);
    const Cpoly = [T, R, [R[0] + n[0] * c, R[1] + n[1] * c], [T[0] + n[0] * c, T[1] + n[1] * c]];
    // potongan b² (4 puing) – dipotong lewat pusat, sejajar dan tegak lurus sisi miring
    const rel = Bpoly.map(p => [p[0] - Bc[0], p[1] - Bc[1]]), parts = [];
    [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(([ss, st]) => {
      const q = clipHalf(clipHalf(rel, d[0], d[1], ss), n[0], n[1], st), ce = cen(q);
      const off = [Cc[0] - ss * c / 2 * d[0] - st * c / 2 * n[0], Cc[1] - ss * c / 2 * d[1] - st * c / 2 * n[1]];
      parts.push({ poly: q.map(p => [p[0] - ce[0], p[1] - ce[1]]), B: [Bc[0] + ce[0], Bc[1] + ce[1]], C: [off[0] + ce[0], off[1] + ce[1]] });
    });
    const pcs = [{ base: Apoly.map(p => [p[0] - Ac[0], p[1] - Ac[1]]), cls: 'p-a', lab: 'a²', tg: [{ reg: 'A', x: Ac[0], y: Ac[1] }, { reg: 'C', x: Cc[0], y: Cc[1] }] }];
    parts.forEach((q, i) => pcs.push({ base: q.poly, cls: 'p-b' + (i % 4), lab: '', tg: [{ reg: 'B', x: q.B[0], y: q.B[1] }, { reg: 'C', x: q.C[0], y: q.C[1] }] }));
    const land = window.innerWidth >= window.innerHeight * 0.9;
    const minX = Math.min(-a, Cpoly[3][0]) - 0.4, maxX = Math.max(b, Cpoly[2][0]) + 0.4, minY = Math.min(-a, Cpoly[2][1], Cpoly[3][1]) - 1.2, maxY = b + 0.4;
    const ext = pcs.map(p => Math.max(...p.base.map(q => Math.abs(q[0])), ...p.base.map(q => Math.abs(q[1]))) * 2 + 0.4);
    const pk = pack(ext, land ? Math.max(a + b, 9) : Math.max(maxX - minX, Math.max(...ext) * 1.6));
    const ox = land ? maxX + 1 : minX, oy = land ? minY : maxY + 1.2, pos = pk.pos.map((p, i) => { const sc = [0.6, -0.4][0]; return [p[0] + ox, p[1] + oy]; });
    pcs.forEach((p, i) => { p.x0 = pos[i][0]; p.y0 = pos[i][1]; });
    const lab = (x, y, t, k) => `<text class="pz-fcap ${k}" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central">${t}</text>`;
    const bg = `<polygon class="pz-reg" data-r="A" points="${pstr(Apoly)}"/><polygon class="pz-reg" data-r="B" points="${pstr(Bpoly)}"/><polygon class="pz-reg" data-r="C" points="${pstr(Cpoly)}"/>
      <polygon class="pz-tri" points="${pstr([[0, 0], T, R])}"/><path class="pz-ra" d="M0 -0.5 H0.5 V0" fill="none"/>
      ${lab(Ac[0], Ac[1], `a² = ${a * a}`, 'a')}${lab(Bc[0], Bc[1], `b² = ${b * b}`, 'b')}${lab(Cc[0], Cc[1], `c² = ${r2(c * c)}`, 'c')}
      <text class="pz-pt" x="${-a - 0.15}" y="${-a / 2}" text-anchor="end" dominant-baseline="central">a = ${a}</text><text class="pz-pt" x="${b / 2}" y="${b + 0.65}" text-anchor="middle">b = ${b}</text>`;
    const Wd = land ? ox + pk.w - minX : Math.max(maxX - minX, pk.w), Hd = land ? Math.max(maxY - minY, pk.h) : oy + pk.h - minY;
    const vb = [minX - 0.2, minY - 0.2, Wd + 0.4, Hd + 0.6];
    root.innerHTML = `<div class="pz"><div class="pz-top"><div class="pz-rafi">${PP.Rafi.head()}</div><div class="pz-say" aria-live="polite"></div>
      <div class="pz-btns"><button class="btn sm gold nosfx" data-pz="hint">💡 Petunjuk</button><button class="btn sm nosfx" data-pz="reset">↺ Ulang</button></div></div>
      <div class="pz-steps"><span data-st="A">1. a² = ${a * a}</span><span data-st="B">2. b² = ${b * b}</span><span data-st="C">3. c² = ${r2(c * c)}</span></div>
      <svg class="pz-svg" viewBox="${vb.join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Papan puzzle pembuktian"></svg></div>`;
    const svg = PP.$('.pz-svg', root), sayEl = PP.$('.pz-say', root), rafi = PP.$('.rafi', root);
    svg.innerHTML = bg; svg.__st = () => st;
    let st, speakT, drag = null;
    const speak = t => { sayEl.textContent = t; rafi.classList.add('talk'); clearTimeout(speakT); speakT = setTimeout(() => rafi.classList.remove('talk'), Math.min(2800, 600 + t.length * 30)); };
    const tol = 0.11 * c;
    const place = i => { const p = st.ps[i], g = svg.querySelector(`.pz-piece[data-i="${i}"]`); g.setAttribute('transform', `translate(${p.x} ${p.y})`); };
    const regionOk = reg => { const idx = reg === 'A' ? [0] : reg === 'B' ? [1, 2, 3, 4] : [0, 1, 2, 3, 4]; return idx.every(i => st.ps[i].at && st.ps[i].at.reg === reg); };
    const refresh = () => {
      ['A', 'B', 'C'].forEach(r => { const ok = regionOk(r); if (ok && !st.got[r]) st.got[r] = true; svg.querySelector(`.pz-reg[data-r="${r}"]`).classList.toggle('ok', ok); const sp = PP.$(`.pz-steps [data-st="${r}"]`, root); sp.classList.toggle('ok', !!st.got[r]); sp.classList.toggle('now', ok); });
    };
    const build = () => {
      svg.querySelectorAll('.pz-piece').forEach(n => n.remove());
      st = { got: {}, done: false, ps: pcs.map(p => ({ ...p, x: p.x0, y: p.y0, at: null })) };
      st.ps.forEach((p, i) => { const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pz-piece ' + p.cls); g.dataset.i = i; g.innerHTML = `<polygon points="${pstr(p.base)}"/>${p.lab ? `<text class="pz-lab" text-anchor="middle" dominant-baseline="central">${p.lab}</text>` : ''}`; svg.appendChild(g); place(i); });
      refresh(); speak(`Mulai dari a². Seret kotak a² ke bingkai a² = ${a * a}.`);
    };
    const pt = e => { const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; const r = q.matrixTransform(svg.getScreenCTM().inverse()); return [r.x, r.y]; };
    svg.addEventListener('pointerdown', e => {
      const g = e.target.closest('.pz-piece'); if (!g) return; const i = +g.dataset.i, p = st.ps[i], q = pt(e);
      drag = { i, dx: p.x - q[0], dy: p.y - q[1] }; if (p.at) { p.at = null; refresh(); } svg.appendChild(g); g.classList.add('drag'); svg.setPointerCapture(e.pointerId); e.preventDefault();
    });
    svg.addEventListener('pointermove', e => { if (!drag) return; const q = pt(e), p = st.ps[drag.i]; p.x = q[0] + drag.dx; p.y = q[1] + drag.dy; place(drag.i); });
    const end = () => {
      if (!drag) return; const i = drag.i, p = st.ps[i]; svg.querySelector(`.pz-piece[data-i="${i}"]`).classList.remove('drag'); drag = null;
      let best = null, bd = tol;
      p.tg.forEach(t => {
        if (t.reg === 'C' && !(st.got.A && st.got.B)) return;
        if (st.ps.some((o, j) => j !== i && o.at && o.at.reg === t.reg && Math.hypot(o.at.x - t.x, o.at.y - t.y) < 1e-6)) return;
        const dd = Math.hypot(p.x - t.x, p.y - t.y); if (dd < bd) { bd = dd; best = t; }
      });
      if (best) { p.x = best.x; p.y = best.y; p.at = best; place(i); try { window.PPAudio && PPAudio.sfx && PPAudio.sfx('correct'); } catch (e) {} }
      else if (p.tg.some(t => t.reg === 'C' && Math.hypot(p.x - t.x, p.y - t.y) < tol) && !(st.got.A && st.got.B)) speak('Buktikan dulu a² dan b² di bingkainya masing-masing.');
      const before = { ...st.got }; refresh();
      if (st.got.A && !before.A) speak(`Kotak a² pas memenuhi bingkai ${a * a}. Sekarang susun 4 puing hijau ke bingkai b² = ${b * b}.`);
      else if (st.got.B && !before.B) speak(`4 puing itu pas menjadi b² = ${b * b}. Sekarang pindahkan a² dan 4 puing ke bingkai c² yang miring.`);
      else if (st.got.C && !st.done) { st.done = true; speak(`Pas! ${a * a} + ${b * b} = ${r2(c * c)}. Jadi a² + b² = c².`); setTimeout(() => { celebrate(); done('sq' + a, 25); const nt = PP.$('.pz-note', root.parentNode); nt && (nt.hidden = false); }, 300); }
      else if (!best) speak('Belum pas. Dekatkan ke bingkai yang sesuai.');
    };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    root.addEventListener('click', e => {
      const bt = e.target.closest('[data-pz]'); if (!bt) return;
      if (bt.dataset.pz === 'reset') { build(); return; }
      let reg = !st.got.A ? 'A' : !st.got.B ? 'B' : 'C'; const el = svg.querySelector(`.pz-reg[data-r="${reg}"]`); el.classList.add('hint'); setTimeout(() => el.classList.remove('hint'), 1800);
      speak(reg === 'A' ? 'Seret kotak a² ke bingkai yang berkedip.' : reg === 'B' ? '4 puing hijau disusun menjadi persegi di bingkai yang berkedip.' : 'Pindahkan a² dan 4 puing ke bingkai c² yang berkedip. Puing mengelilingi kotak a².');
    });
    build();
  }

  /* ---------- Cari Hipotenusa ---------- */
  function hipo(root) {
    const NAMES = [['P', 'Q', 'R'], ['K', 'L', 'M'], ['A', 'B', 'C'], ['X', 'Y', 'Z'], ['D', 'E', 'F']];
    let round = 0, score = 0;
    const next = () => {
      if (round >= 5) { root.innerHTML = `<div class="pz-end"><div class="pz-rafi big">${PP.Rafi.head()}</div><h3>Selesai! Skor ${score}/5</h3><p>Sisi miring selalu berhadapan dengan sudut siku-siku dan merupakan sisi terpanjang.</p><button class="btn green" data-again>Main lagi</button></div>`; PP.$('.rafi', root).classList.add('talk'); if (score >= 4) { celebrate(); done('hipo', 15); } PP.$('[data-again]', root).onclick = () => { round = 0; score = 0; next(); }; return; }
      const nm = NAMES[round % NAMES.length].slice(), k = Math.floor(Math.random() * 3), ang = Math.random() * 360 * Math.PI / 180;
      const legs = [[3, 4], [5, 12], [6, 8], [8, 15], [7, 24]][Math.floor(Math.random() * 5)];
      const sc = 24 / Math.max(...legs), la = legs[0] * sc * 1.3, lb = legs[1] * sc * 1.3;
      // titik siku-siku di indeks k
      const raw = [[0, 0], [la, 0], [0, lb]]; const V = [null, null, null]; V[k] = raw[0]; V[(k + 1) % 3] = raw[1]; V[(k + 2) % 3] = raw[2];
      const rp = V.map(p => [p[0] * Math.cos(ang) - p[1] * Math.sin(ang), p[0] * Math.sin(ang) + p[1] * Math.cos(ang)]);
      const xs = rp.map(p => p[0]), ys = rp.map(p => p[1]), mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
      const P = rp.map(p => [p[0] - mx, p[1] - my]);
      const sides = [[0, 1], [1, 2], [2, 0]].map(([i, j]) => ({ i, j, name: [nm[i], nm[j]].sort().join(''), hyp: (i !== k && j !== k) }));
      const hyp = sides.find(s => s.hyp), legsS = sides.filter(s => !s.hyp);
      const L = (s, cls) => `<line class="${cls}" x1="${P[s.i][0]}" y1="${P[s.i][1]}" x2="${P[s.j][0]}" y2="${P[s.j][1]}"/>`;
      const ctr = cen(P), lab = i => { const v = [P[i][0] - ctr[0], P[i][1] - ctr[1]], d = Math.hypot(...v) || 1; return `<text class="hp-v" x="${P[i][0] + v[0] / d * 3.2}" y="${P[i][1] + v[1] / d * 3.2}" text-anchor="middle" dominant-baseline="central">${nm[i]}</text>`; };
      const ra = (() => { const a1 = P[(k + 1) % 3], a2 = P[(k + 2) % 3], o = P[k], u = [a1[0] - o[0], a1[1] - o[1]], w = [a2[0] - o[0], a2[1] - o[1]], lu = Math.hypot(...u), lw = Math.hypot(...w), s = 2.6; const p1 = [o[0] + u[0] / lu * s, o[1] + u[1] / lu * s], p2 = [p1[0] + w[0] / lw * s, p1[1] + w[1] / lw * s], p3 = [o[0] + w[0] / lw * s, o[1] + w[1] / lw * s]; return `<polyline class="hp-ra" points="${pstr([p1, p2, p3])}"/>`; })();
      root.innerHTML = `<div class="hp"><div class="pz-top"><div class="pz-rafi">${PP.Rafi.head()}</div><div class="pz-say">Soal ${round + 1} dari 5. Ketuk sisi miring (hipotenusa) segitiga ini.</div></div>
        <svg class="hp-svg" viewBox="-30 -30 60 60">${sides.map(s => L(s, 'hp-side')).join('')}${ra}${[0, 1, 2].map(lab).join('')}${sides.map(s => `<line class="hp-hit" data-n="${s.name}" data-h="${s.hyp ? 1 : 0}" x1="${P[s.i][0]}" y1="${P[s.i][1]}" x2="${P[s.j][0]}" y2="${P[s.j][1]}"/>`).join('')}</svg>
        <div class="hp-opts" hidden></div><p class="hp-fb" aria-live="polite"></p></div>`;
      const say = PP.$('.pz-say', root), fb = PP.$('.hp-fb', root), rf = PP.$('.rafi', root), opts = PP.$('.hp-opts', root);
      let answered = false;
      PP.$$('.hp-hit', root).forEach(h => h.addEventListener('click', () => {
        if (answered) return; answered = true; const ok = h.dataset.h === '1';
        PP.$$('.hp-side', root).forEach((l, i) => l.classList.toggle('hot', sides[i].hyp)); h.classList.add(ok ? 'good' : 'bad');
        fb.textContent = ok ? `Benar! ${hyp.name} berhadapan dengan sudut siku-siku di ${nm[k]}.` : `Belum tepat. Sisi miring adalah ${hyp.name}, yang berhadapan dengan sudut siku-siku di ${nm[k]}.`; fb.className = 'hp-fb ' + (ok ? 'ok' : 'no');
        if (ok) score++; rf.classList.add('talk'); setTimeout(() => rf.classList.remove('talk'), 1200); say.textContent = 'Sekarang pilih rumus Pythagoras yang benar.';
        const good = `${hyp.name}² = ${legsS[0].name}² + ${legsS[1].name}²`, bad1 = `${legsS[0].name}² = ${hyp.name}² + ${legsS[1].name}²`, bad2 = `${hyp.name} = ${legsS[0].name} + ${legsS[1].name}`;
        const list = [[good, 1], [bad1, 0], [bad2, 0]].sort(() => Math.random() - .5);
        opts.hidden = false; opts.innerHTML = list.map(([t, g]) => `<button class="opt nosfx" data-g="${g}">${t}</button>`).join('');
        let got = false; opts.onclick = e => { const b = e.target.closest('.opt'); if (!b || got) return; got = true; if (b.dataset.g === '1') { b.classList.add('good'); fb.textContent = 'Rumus yang benar. Kuadrat sisi miring sama dengan jumlah kuadrat sisi lainnya.'; fb.className = 'hp-fb ok'; } else { b.classList.add('bad'); PP.$('[data-g="1"]', opts).classList.add('good'); fb.textContent = 'Rumus yang benar ditandai hijau: kuadrat sisi miring = jumlah kuadrat dua sisi lainnya.'; fb.className = 'hp-fb no'; }
          setTimeout(() => { round++; next(); }, 1900); };
      }));
    };
    next();
  }

  /* ---------- Latihan & Pembahasan (dari Pembahasan_Latihan.zip) ---------- */
  function latihan(root) {
    const L = PP.LATIHAN || []; let cur = 0;
    const solved = () => (S.data.latihan = S.data.latihan || {});
    const num = v => { const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? null : n; };
    const draw = () => {
      const it = L[cur], sv = solved();
      root.innerHTML = `<div class="lt"><div class="chips lt-pick">${L.map((x, i) => `<button class="chip ${i === cur ? 'on' : ''} ${sv[i] ? 'done' : ''}" data-i="${i}">${i + 1}</button>`).join('')}</div>
        <div class="lt-card"><div class="lt-no">${PP.esc(it.no)}</div><h3 class="lt-h">${PP.esc(it.judul)}</h3><p class="lt-q">${PP.esc(it.soal)}</p>
        <div class="lt-imgs">${it.gambar.map(g => `<img src="${g}" alt="Gambar soal">`).join('')}</div>
        ${it.cek.length ? `<form class="lt-form">${it.cek.map((c, k) => `<label class="fld lt-f"><span>${PP.esc(c.l)}</span><input inputmode="decimal" autocomplete="off" data-k="${k}" placeholder="angka"></label>`).join('')}<button class="btn green sm" type="submit">Periksa jawaban</button></form>` : '<p class="small muted">Soal ini berupa penjelasan. Pikirkan jawabanmu dulu, lalu buka langkah-langkahnya.</p>'}
        <p class="lt-fb" aria-live="polite"></p>
        <div class="lt-steps" hidden><ol></ol></div>
        <div class="row center"><button class="btn gold sm" id="ltStep">Lihat langkah pembahasan</button></div>
        ${it.catatan ? `<p class="small muted lt-note">${PP.esc(it.catatan)}</p>` : ''}</div></div>`;
      const fb = PP.$('.lt-fb', root), box = PP.$('.lt-steps', root), ol = PP.$('ol', box); let shown = 0;
      PP.$('.lt-pick', root).onclick = e => { const b = e.target.closest('.chip'); if (b) { cur = +b.dataset.i; draw(); } };
      const more = () => {
        if (shown < it.langkah.length) { box.hidden = false; const li = document.createElement('li'); li.textContent = it.langkah[shown++]; ol.appendChild(li); }
        const btn = PP.$('#ltStep', root);
        if (shown >= it.langkah.length) { btn.textContent = 'Jawaban akhir ditampilkan'; btn.disabled = true; fb.className = 'lt-fb'; fb.innerHTML = `<b>Jawaban:</b> ${PP.esc(it.jawaban)}`; if (!it.cek.length) { sv[cur] = 1; S.save(); } }
        else btn.textContent = `Langkah berikutnya (${shown}/${it.langkah.length})`;
      };
      PP.$('#ltStep', root).onclick = more;
      const form = PP.$('.lt-form', root);
      if (form) form.onsubmit = e => {
        e.preventDefault();
        const ins = PP.$$('input', form), bad = [];
        ins.forEach((inp, k) => { const v = num(inp.value), ok = v != null && Math.abs(v - it.cek[k].v) < 0.01; inp.classList.toggle('good', ok); inp.classList.toggle('bad', !ok); if (!ok) bad.push(k); });
        if (!bad.length) {
          fb.className = 'lt-fb ok'; fb.textContent = 'Benar semua! ' + it.jawaban;
          if (!sv[cur]) { sv[cur] = 1; S.save(); S.addXP(8); try { PP.ui.confetti(14); } catch (x) {} done('lat' + cur, 0); }
        } else { fb.className = 'lt-fb no'; fb.textContent = bad.length === ins.length ? 'Belum tepat. Coba lagi, atau buka langkah pembahasan untuk petunjuk.' : 'Sebagian sudah benar (hijau). Periksa yang merah.'; }
      };
    };
    draw();
  }

  /* ---------- Hub ---------- */
  const TABS = [
    ['geser', '1. Geser Sisi', 'Ubah sisi segitiga dan amati luas persegi.'],
    ['persegi', '2. Bukti Persegi pada Sisi', 'Buktikan satu per satu: a², puing b², lalu gabungan keduanya mengisi c².'],
    ['bukti', '3. Puzzle Bukti', 'Susun bingkai (a+b)² dengan dua cara.'],
    ['cari', '4. Cari Hipotenusa', 'Temukan sisi miring dan rumusnya.'],
    ['latihan', '5. Latihan & Pembahasan', 'Kerjakan soal dari buku, periksa jawabanmu, lalu buka langkah pembahasannya.'],
    ['jalur', '6. Jalur Belajar', 'Enam pos belajar berurutan bersama Bu Guru, Pak Arsitek, dan Pak Pemandu.']
  ];
  PP.puzzle = { proof: buildProof, squares: buildSquares };
  PP.screens.eksplorasiEdu = function () {
    return {
      html: `<div class="wrap narrowish"><div class="panel fill pad exh"><h2 class="h-title">Eksplorasi Pythagoras</h2>
        <div class="exh-tabs" role="tablist">${TABS.map((t, i) => `<button class="tab${i ? '' : ' on'}" role="tab" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>
        <p class="exh-desc"></p><div class="exh-body"></div></div></div>`,
      mount(root) {
        const body = PP.$('.exh-body', root), desc = PP.$('.exh-desc', root); let cur = null;
        const show = id => {
          cur = id; PP.$$('.exh-tabs .tab', root).forEach(b => b.classList.toggle('on', b.dataset.t === id)); desc.textContent = TABS.find(t => t[0] === id)[2]; body.innerHTML = '';
          if (id === 'geser') { const s = PP.screens.eksplorasiSlider(); body.innerHTML = s.html.replace(/^<div class="wrap narrowish"><div class="panel fill pad"><h2 class="h-title">[^<]*<\/h2>\s*<p>[^<]*<\/p>/, '<div><div>'); s.mount(body); }
          else if (id === 'persegi') {
            body.innerHTML = `<div class="chips pz-pick"><button class="chip on" data-v="3,4">3 · 4 · 5</button><button class="chip" data-v="5,12">5 · 12 · 13</button></div><div class="pz-host"></div><div class="pz-note tip" hidden><span>Temuan: kotak a² dan 4 puing b² memenuhi bingkai c² dengan pas. Jadi a² + b² = c².</span></div>`;
            const host = PP.$('.pz-host', body), go = v => { const [a, b] = v.split(',').map(Number); PP.$('.pz-note', body).hidden = true; buildSquares(host, a, b); };
            PP.$('.pz-pick', body).onclick = e => { const c = e.target.closest('.chip'); if (!c) return; PP.$$('.chip', body).forEach(x => x.classList.toggle('on', x === c)); go(c.dataset.v); }; go('3,4');
          } else if (id === 'bukti') {
            body.innerHTML = `<div class="chips pz-pick"><button class="chip on" data-s="1">Cara 1: 4 segitiga + c²</button><button class="chip" data-s="2">Cara 2: 4 segitiga + a² + b²</button></div><div class="pz-host"></div><div class="pz-note tip" hidden><span>Kedua bingkai luasnya sama. Jadi c² = a² + b².</span></div>`;
            const host = PP.$('.pz-host', body), go = s => { PP.$('.pz-note', body).hidden = true; buildProof(host, s, 3, 4); };
            PP.$('.pz-pick', body).onclick = e => { const c = e.target.closest('.chip'); if (!c) return; PP.$$('.chip', body).forEach(x => x.classList.toggle('on', x === c)); go(+c.dataset.s); }; go(1);
          } else if (id === 'latihan') latihan(body);
          else if (id === 'jalur') {
            body.innerHTML = `<div class="jb-card"><div class="jb-card-t"><h3>Jalur Belajar</h3><p>Rute 6 pos di peta. Di tiap pos, guru bercerita, memberi contoh, lalu kamu mengerjakan soal dengan petunjuk bertahap dan animasi penjelasan. Pos berikutnya terbuka setelah pos sebelumnya selesai.</p><button class="btn green xl" id="jbGo">Mulai Jalur Belajar</button></div></div>`;
            PP.$('#jbGo', body).onclick = () => { try { if (window.JB && JB.enabled) PP.go('jalur'); else PP.ui.toast('Jalur Belajar sedang dinonaktifkan.'); } catch (e) { PP.ui.toast('Jalur Belajar belum bisa dibuka.'); } };
          } else hipo(body);
        };
        PP.$('.exh-tabs', root).onclick = e => { const b = e.target.closest('.tab'); if (b && b.dataset.t !== cur) show(b.dataset.t); };
        show('geser');
      }
    };
  };
})();
