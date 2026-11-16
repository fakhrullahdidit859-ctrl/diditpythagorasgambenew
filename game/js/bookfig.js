/* =========================================================
   GAMBAR BUKU + KARAKTER RAFI
   - PP.Fig.svg(spec): menggambar bangun datar dari koordinat titik (semua gambar di Buku Siswa Pythagoras)
   - PP.Rafi.svg()/head(): karakter pemandu yang tubuhnya bergerak dan mulutnya membuka-menutup saat berbicara
   ========================================================= */
(function () {
  const f = n => (Math.round(n * 100) / 100).toString().replace('.', ',');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* ---------------- GAMBAR BANGUN DATAR ----------------
     spec = {
       pts:   { A:[x,y], ... }  (y ke bawah)
       fill:  [ ['A','B','C'] , ... ]                 daerah berwarna
       seg:   [ ['A','B','label', {dash,side,tick,q}] ]   ruas garis (label opsional)
       rt:    [ ['B','A','C'] ]                          tanda siku-siku di titik B (arah ke A dan C)
       names: { A:1, B:1 }   atau true  → nama titik ditulis di dekat titik
     }                                                                           */
  function svg(s, o) {
    o = o || {};
    const W = o.w || 340, H = o.h || 240, m = o.m || 36, P = s.pts, ks = Object.keys(P);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, cx = 0, cy = 0;
    ks.forEach(k => { x0 = Math.min(x0, P[k][0]); x1 = Math.max(x1, P[k][0]); y0 = Math.min(y0, P[k][1]); y1 = Math.max(y1, P[k][1]); cx += P[k][0]; cy += P[k][1]; });
    cx /= ks.length; cy /= ks.length;
    const sc = Math.min((W - 2 * m) / ((x1 - x0) || 1), (H - 2 * m) / ((y1 - y0) || 1));
    const ox = (W - (x1 - x0) * sc) / 2 - x0 * sc, oy = (H - (y1 - y0) * sc) / 2 - y0 * sc;
    const T = k => [P[k][0] * sc + ox, P[k][1] * sc + oy], C = [cx * sc + ox, cy * sc + oy];
    let out = `<svg class="viz fig" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || s.aria || 'Gambar bangun datar')}">`;
    (s.fill || []).forEach((p, i) => { out += `<polygon class="fg-fill f${(s.fc && s.fc[i]) || 0}" points="${p.map(k => T(k).map(v => v.toFixed(1)).join(',')).join(' ')}"/>`; });
    (s.seg || []).forEach(sg => {
      const [a, b, lab, op] = sg, A = T(a), B = T(b), d = op || {};
      out += `<line class="fg-seg${d.dash ? ' dash' : ''}${d.hl ? ' hl' : ''}" x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}"/>`;
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
      let nx = -dy / L, ny = dx / L;
      const away = (mx - C[0]) * nx + (my - C[1]) * ny;
      if (d.side) { nx *= d.side; ny *= d.side; } else if (away < 0) { nx = -nx; ny = -ny; }
      if (d.tick) {
        const tx = dx / L * 5, ty = dy / L * 5;
        out += `<line class="fg-tick" x1="${mx - nx * 6 - tx * 0}" y1="${my - ny * 6}" x2="${mx + nx * 6}" y2="${my + ny * 6}"/>`;
      }
      if (lab != null && lab !== '') {
        const off = d.off || 15;
        out += `<text class="vlab fg-lab${d.q || /[?]/.test(lab) ? ' q' : ''}" x="${(mx + nx * off).toFixed(1)}" y="${(my + ny * off + 5).toFixed(1)}" text-anchor="middle">${esc(lab)}</text>`;
      }
    });
    (s.rt || []).forEach(r => {
      const V0 = T(r[0]), A = T(r[1]), B = T(r[2]), k = o.rk || 11;
      const u = [A[0] - V0[0], A[1] - V0[1]], w = [B[0] - V0[0], B[1] - V0[1]], lu = Math.hypot(...u) || 1, lw = Math.hypot(...w) || 1;
      const ux = u[0] / lu * k, uy = u[1] / lu * k, wx = w[0] / lw * k, wy = w[1] / lw * k;
      out += `<path class="rmark" d="M${(V0[0] + ux).toFixed(1)},${(V0[1] + uy).toFixed(1)} L${(V0[0] + ux + wx).toFixed(1)},${(V0[1] + uy + wy).toFixed(1)} L${(V0[0] + wx).toFixed(1)},${(V0[1] + wy).toFixed(1)}"/>`;
    });
    if (s.names) ks.forEach(k => {
      if (s.names !== true && !s.names[k]) return;
      const p = T(k); let nx = p[0] - C[0], ny = p[1] - C[1]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      out += `<text class="fg-pt" x="${(p[0] + nx * 14).toFixed(1)}" y="${(p[1] + ny * 14 + 5).toFixed(1)}" text-anchor="middle">${esc(k)}</text>`;
    });
    (s.txt || []).forEach(t => { const p = T(t[0]); out += `<text class="vlab fg-lab${/[?]/.test(t[1]) ? ' q' : ''}" x="${p[0].toFixed(1)}" y="${(p[1] + 5).toFixed(1)}" text-anchor="middle">${esc(t[1])}</text>`; });
    return out + '</svg>';
  }

  /* segitiga siku-siku bebas orientasi — kaki horizontal ha, kaki vertikal vb, sudut siku-siku di corner */
  function tri(ha, vb, lab, corner) {
    corner = corner || 'bl';
    const pos = { bl: { P: [0, vb], A: [ha, vb], B: [0, 0] }, br: { P: [ha, vb], A: [0, vb], B: [ha, 0] }, tl: { P: [0, 0], A: [ha, 0], B: [0, vb] }, tr: { P: [ha, 0], A: [0, 0], B: [ha, vb] } }[corner];
    const l = lab || {};
    return svg({ pts: { P: pos.P, A: pos.A, B: pos.B }, fill: [['P', 'A', 'B']], rt: [['P', 'A', 'B']],
      seg: [['P', 'A', l.h || '', { q: /[?]/.test(l.h || '') }], ['P', 'B', l.v || ''], ['A', 'B', l.c || '']] });
  }

  /* ---------------- gambar-gambar pada Buku Siswa ---------------- */
  const FIG = {
    // Gambar 2.3 : ΔABC siku-siku di C
    abc: () => svg({ pts: { B: [0, 0], C: [0, 12], A: [15, 12] }, fill: [['B', 'C', 'A']], rt: [['C', 'A', 'B']], names: true,
      seg: [['B', 'C', 'BC = ?'], ['C', 'A', '12 cm'], ['B', 'A', '15 cm']] }),
    // Gambar 2.7 : trapesium siku-siku
    trap: () => svg({ pts: { A: [0, 0], D: [27, 0], C: [34, 24], B: [0, 24] }, fill: [['A', 'D', 'C', 'B']], rt: [['A', 'D', 'B'], ['B', 'A', 'C']], names: true,
      seg: [['A', 'D', '27 cm'], ['D', 'C', ''], ['C', 'B', '34 cm'], ['B', 'A', '24 cm']] }),
    trapSol: () => svg({ pts: { A: [0, 0], D: [27, 0], C: [34, 24], B: [0, 24], E: [27, 24] }, fill: [['A', 'D', 'C', 'B']], rt: [['A', 'D', 'B'], ['B', 'A', 'C'], ['E', 'D', 'C']], names: true,
      seg: [['A', 'D', '27'], ['D', 'C', '25'], ['C', 'B', ''], ['B', 'A', '24'], ['D', 'E', '24', { dash: 1, side: -1 }], ['E', 'C', '7'], ['B', 'E', '27', { off: 14 }]] }),
    // layang-layang ABCD (Ayo Berlatih 4)
    kite: () => svg({ pts: { A: [0, -5], B: [-12, 0], C: [0, 9], D: [12, 0], O: [0, 0] }, fill: [['A', 'B', 'C', 'D']], rt: [['O', 'A', 'D']], names: true,
      seg: [['A', 'B', 'AB = ?'], ['B', 'C', ''], ['C', 'D', ''], ['D', 'A', ''], ['B', 'D', 'BD = 24 cm', { dash: 1, side: 1, off: 12 }], ['A', 'C', '', { dash: 1 }], ['A', 'O', 'AO = 5', { side: -1, off: 14 }], ['O', 'C', 'CO = 9', { side: -1, off: 14 }]] }),
    // persegi panjang dan diagonalnya (Ayo Berlatih 3)
    rect: () => svg({ pts: { A: [0, 0], B: [10.5, 0], C: [10.5, 10], D: [0, 10] }, fill: [['A', 'B', 'C', 'D']], rt: [['B', 'A', 'C']], names: true,
      seg: [['A', 'B', '10,5 cm'], ['B', 'C', 'l = ?'], ['C', 'D', ''], ['D', 'A', ''], ['A', 'C', '14,5 cm', { dash: 1, side: -1, off: 20 }]] }),
    // Gambar 2.8 : persegi panjang OCDE dan belah ketupat EFAB
    gab: (sol) => svg({ pts: { F: [0, 8], O: [6, 8], B: [12, 8], C: [18, 8], E: [6, 0], D: [18, 0], A: [6, 16] }, fill: [['E', 'D', 'C', 'O'], ['E', 'F', 'A', 'B']], fc: [1, 2],
      rt: [['O', 'B', 'E']], names: true,
      seg: [['F', 'E', ''], ['E', 'D', sol ? '12' : ''], ['D', 'C', ''], ['C', 'B', sol ? '6' : '', { tick: 1 }], ['B', 'A', ''], ['A', 'F', ''], ['F', 'O', sol ? '6' : '', { tick: 1 }], ['O', 'B', '6 cm', { tick: 1 }], ['E', 'O', sol ? '8' : '', { side: -1 }], ['E', 'B', '10 cm', { side: 1 }]] }),
    // Gambar 2.9 : ΔABC dengan BD ⟂ AC
    abd: (sol) => svg({ pts: { A: [0, 16], D: [6, 16], C: [21, 16], B: [6, 0] }, fill: [['A', 'B', 'D'], ['B', 'D', 'C']], fc: [1, 2], rt: [['D', 'C', 'B']], names: true,
      seg: [['A', 'B', '10 cm'], ['B', 'C', '17 cm'], ['A', 'D', '6 cm'], ['D', 'C', sol ? '15' : ''], ['B', 'D', sol ? '8' : '', { side: 1, off: 12 }]] }),
    // Gambar 2.10 : jajargenjang + segitiga siku-siku
    jaj: (sol) => svg({ pts: { L: [0, 12], R: [35, 12], S: [35, 24], U: [6, 1.6], T: [41, 1.6] }, fill: [['L', 'R', 'T', 'U'], ['L', 'R', 'S']], fc: [1, 2], rt: [['R', 'L', 'S']],
      seg: [['L', 'R', sol ? '35 cm' : '', { dash: 1, side: 1, off: 14 }], ['R', 'S', '12 cm', { tick: 1 }], ['L', 'S', '37 cm'], ['L', 'U', '', { tick: 1 }], ['R', 'T', '', { tick: 1 }], ['U', 'T', sol ? '35 cm' : '']] }),
    // Gambar 2.11
    ab: (sol) => svg({ pts: { A: [0, 0], B: [0, 12], C: [9, 12], D: [16, 12] }, fill: [['A', 'B', 'D']], rt: [['B', 'D', 'A']], names: true,
      seg: [['A', 'B', '12 cm'], ['A', 'C', '15 cm', { side: 1 }], ['A', 'D', '20 cm'], ['B', 'C', sol ? '9' : ''], ['C', 'D', sol ? '7' : 'CD = ?'], ['B', 'D', '']] }),
    // Ayo Berdiskusi : jembatan kabel pancang
    hang: () => svg({ pts: { A: [10, 0], B: [0, 9], D: [10, 9], C: [20, 9] }, fill: [['A', 'B', 'D'], ['A', 'D', 'C']], fc: [1, 2], rt: [['D', 'C', 'A']], names: true,
      seg: [['A', 'B', 'AB'], ['A', 'C', 'AC'], ['A', 'D', 'AD', { side: 1, off: 10 }], ['B', 'D', 'BD'], ['D', 'C', 'CD']] }),
    // tiang + tali + patok
    pole: (t, d, h, tq) => svg({ pts: { T: [0, 0], K: [0, t], P: [d, t] }, fill: [['T', 'K', 'P']], rt: [['K', 'P', 'T']],
      seg: [['T', 'K', tq || 't = ?'], ['K', 'P', d + ' m'], ['T', 'P', h + ' m']] }),
    // gambar 2.2 (a)
    sq: (a, b, o) => PPViz.squares(a, b, Object.assign({ grid: true, w: 340, h: 300 }, o || {})).svg,
    tri
  };

  /* gambar umum untuk soal kuis: tiga panjang sisi pada segitiga siku-siku */
  function triQ(a, b, c, unk, corner) {
    // a = kaki tegak, b = kaki alas, c = sisi miring; unk = 'a'|'b'|'c' disembunyikan menjadi "?" atau huruf
    const lab = k => { const v = { a, b, c }[k]; return unk === k ? (k + ' = ?') : (f(v) + (o_unit ? ' ' + o_unit : '')); };
    const o_unit = triQ.unit || 'cm';
    return svg({ pts: { P: [0, b > a ? a * 12 / b : 12], A: [b > a ? 12 : b * 12 / a, b > a ? a * 12 / b : 12], B: [0, 0] }, fill: [['P', 'A', 'B']], rt: [['P', 'A', 'B']],
      seg: [['P', 'A', lab('b')], ['P', 'B', lab('a')], ['A', 'B', lab('c')]] }, { w: 300, h: 190 });
  }

  /* ---------------- KARAKTER RAFI ---------------- */
  const Rafi = {
    body(cls) {
      return `<svg class="rafi ${cls || ''}" viewBox="0 0 120 190" role="img" aria-label="Rafi, pemandu belajar">
        <ellipse cx="60" cy="184" rx="30" ry="5" fill="rgba(0,0,0,.28)"/>
        <g class="rf-body">
          <g class="rf-leg"><rect x="41" y="128" width="16" height="44" rx="5" fill="#2f5f9e"/><rect x="63" y="128" width="16" height="44" rx="5" fill="#2f5f9e"/>
            <ellipse cx="49" cy="174" rx="12" ry="6" fill="#6b3d1d"/><ellipse cx="71" cy="174" rx="12" ry="6" fill="#6b3d1d"/></g>
          <g class="rf-arm-l"><rect x="22" y="86" width="14" height="30" rx="7" fill="#e8743b"/><rect x="23" y="108" width="12" height="20" rx="6" fill="#f6c79a"/><circle cx="29" cy="130" r="7" fill="#f6c79a"/></g>
          <rect x="35" y="84" width="50" height="52" rx="10" fill="#e8743b"/>
          <path d="M37 104 h46 v26 a8 8 0 0 1 -8 8 h-30 a8 8 0 0 1 -8 -8z" fill="#3b78c8"/>
          <rect x="44" y="84" width="7" height="22" fill="#3b78c8"/><rect x="69" y="84" width="7" height="22" fill="#3b78c8"/>
          <circle cx="47.5" cy="108" r="2.6" fill="#ffd36b"/><circle cx="72.5" cy="108" r="2.6" fill="#ffd36b"/><rect x="51" y="116" width="18" height="12" rx="3" fill="#2f5f9e"/>
          <g class="rf-arm-r"><rect x="84" y="86" width="14" height="30" rx="7" fill="#e8743b"/><rect x="85" y="108" width="12" height="20" rx="6" fill="#f6c79a"/><circle cx="91" cy="130" r="7" fill="#f6c79a"/></g>
          ${Rafi.headG()}
        </g></svg>`;
    },
    headG() {
      return `<g class="rf-head">
        <rect x="52" y="78" width="16" height="10" rx="4" fill="#f6c79a"/>
        <circle cx="31" cy="60" r="6" fill="#f0b98a"/><circle cx="89" cy="60" r="6" fill="#f0b98a"/>
        <circle cx="60" cy="56" r="29" fill="#f8cfa2"/>
        <path d="M31 52 q-2 -26 29 -26 q31 0 29 26 q-8 -10 -29 -10 q-21 0 -29 10z" fill="#6b3d1d"/>
        <path d="M30 44 q0 -22 30 -23 q30 1 30 23 z" fill="#3fa34d"/><rect x="30" y="41" width="60" height="7" rx="3" fill="#2f8a3d"/><path d="M60 41 q26 0 40 6 q-2 6 -14 4 q-14 -2 -26 -4z" fill="#2f8a3d"/>
        <circle cx="60" cy="24" r="3.4" fill="#ffd36b"/>
        <g class="rf-eyes"><ellipse cx="49" cy="59" rx="3.6" ry="4.6" fill="#2b1a0f"/><ellipse cx="71" cy="59" rx="3.6" ry="4.6" fill="#2b1a0f"/><circle cx="50.2" cy="57.4" r="1.2" fill="#fff"/><circle cx="72.2" cy="57.4" r="1.2" fill="#fff"/></g>
        <path d="M43 51 q6 -4 11 -1 M66 50 q5 -3 11 1" fill="none" stroke="#6b3d1d" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="42" cy="68" r="4.5" fill="#f4a39a" opacity=".6"/><circle cx="78" cy="68" r="4.5" fill="#f4a39a" opacity=".6"/>
        <path class="rf-mc" d="M52 71 q8 7 16 0" fill="none" stroke="#7a2a2a" stroke-width="2.6" stroke-linecap="round"/>
        <g class="rf-mo"><ellipse cx="60" cy="73" rx="7" ry="6" fill="#7a2a2a"/><ellipse cx="60" cy="76" rx="4.2" ry="2.4" fill="#e8736f"/></g>
      </g>`;
    },
    head(cls) {
      return `<svg class="rafi head ${cls || ''}" viewBox="26 14 68 78" role="img" aria-label="Rafi">${Rafi.headG()}</svg>`;
    },
    /* mulai/hentikan gerak mulut (class .talk pada elemen .rafi) */
    talk(root, on) { PP_all(root, '.rafi').forEach(e => e.classList.toggle('talk', !!on)); }
  };
  function PP_all(root, sel) { return Array.from((root || document).querySelectorAll(sel)); }

  PP.Fig = { svg, tri, triQ, FIG, f };
  PP.Rafi = Rafi;
})();
