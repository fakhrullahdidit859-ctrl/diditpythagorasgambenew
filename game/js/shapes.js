/* =========================================================
   BANGUN DATAR di dunia Jelajah — gambar di tanah, ukuran bertanda, info rumus.
   PP.Shapes.prep(s)      -> hitung bentuk & jari-jari sentuh (s.R)
   PP.Shapes.draw(g, s)   -> gambar ke kanvas tanah (satuan dunia)
   PP.Shapes.info(s)      -> {title, html} isi kartu penjelasan
   Tipe: persegi, pp (persegi panjang), sku (segitiga siku-siku), ss (sama sisi),
         lingk, jajar, trap (trapesium siku-siku), belah (belah ketupat)
   k = satuan dunia per meter (skala gambar).
   ========================================================= */
(function () {
  const fmt = n => String(Math.round(n * 100) / 100).replace('.', ',');
  const COL = { persegi: '#ff8a80', pp: '#ffd54f', sku: '#80d8ff', ss: '#b9f6ca', lingk: '#ea80fc', jajar: '#ffab91', trap: '#a5d6a7', belah: '#ce93d8' };
  const NAME = { persegi: 'Persegi', pp: 'Persegi Panjang', sku: 'Segitiga Siku-siku', ss: 'Segitiga Sama Sisi', lingk: 'Lingkaran', jajar: 'Jajargenjang', trap: 'Trapesium Siku-siku', belah: 'Belah Ketupat' };
  const hyp = (a, b) => Math.sqrt(a * a + b * b);

  function geom(s) {
    const k = s.k, o = { pts: [], lab: [], dash: [], rm: [], sq: [] };
    switch (s.t) {
      case 'persegi': { const S = s.s * k; o.pts = [[-S / 2, -S / 2], [S / 2, -S / 2], [S / 2, S / 2], [-S / 2, S / 2]];
        o.lab = [[0, S / 2 + 9, s.s + ' m'], [S / 2 + 14, 3, s.s + ' m']]; o.rm = [[-S / 2, S / 2, 1, -1]]; break; }
      case 'pp': { const P = s.p * k, L = s.l * k; o.pts = [[-P / 2, -L / 2], [P / 2, -L / 2], [P / 2, L / 2], [-P / 2, L / 2]];
        o.lab = [[0, L / 2 + 9, s.p + ' m'], [P / 2 + 14, 3, s.l + ' m'], [0, -3, 'd = ' + fmt(hyp(s.p, s.l)) + ' m']]; o.dash = [[-P / 2, -L / 2, P / 2, L / 2]]; o.rm = [[-P / 2, L / 2, 1, -1]]; break; }
      case 'sku': { const Wd = s.b * k, Ht = s.a * k; o.pts = [[-Wd / 2, Ht / 2], [Wd / 2, Ht / 2], [-Wd / 2, -Ht / 2]]; o.rm = [[-Wd / 2, Ht / 2, 1, -1]];
        const c = hyp(s.a, s.b);
        if (s.sq) {
          o.sq = [
            { pts: [[-Wd / 2, Ht / 2], [Wd / 2, Ht / 2], [Wd / 2, Ht / 2 + Wd], [-Wd / 2, Ht / 2 + Wd]], txt: s.b + '² = ' + s.b * s.b },
            { pts: [[-Wd / 2, -Ht / 2], [-Wd / 2, Ht / 2], [-Wd / 2 - Ht, Ht / 2], [-Wd / 2 - Ht, -Ht / 2]], txt: s.a + '² = ' + s.a * s.a },
            { pts: [[Wd / 2, Ht / 2], [-Wd / 2, -Ht / 2], [-Wd / 2 + Ht, -Ht / 2 - Wd], [Wd / 2 + Ht, Ht / 2 - Wd]], txt: fmt(c) + '² = ' + fmt(c * c) }
          ];
        } else o.lab = [[-Wd / 2 - 14, 3, 'a = ' + s.a], [0, Ht / 2 + 9, 'b = ' + s.b + ' m'], [16, -8, 'c = ' + fmt(c)]];
        break; }
      case 'ss': { const w = s.s * k, h = w * Math.sqrt(3) / 2; o.pts = [[0, -h / 2], [-w / 2, h / 2], [w / 2, h / 2]];
        o.lab = [[0, h / 2 + 9, s.s + ' m'], [w / 4 + 16, -2, s.s + ' m'], [5, 4, 't = ' + fmt(s.s * Math.sqrt(3) / 2)]]; o.dash = [[0, -h / 2, 0, h / 2]]; break; }
      case 'lingk': { o.circle = s.r * k; o.dash = [[0, 0, o.circle, 0]]; o.lab = [[o.circle / 2, -4, 'r = ' + s.r + ' m']]; break; }
      case 'jajar': { const w = s.alas * k, h = s.t2 * k, sh = Math.sqrt(s.sisi * s.sisi - s.t2 * s.t2) * k;
        o.pts = [[-w / 2 - sh / 2, h / 2], [w / 2 - sh / 2, h / 2], [w / 2 + sh / 2, -h / 2], [-w / 2 + sh / 2, -h / 2]];
        o.lab = [[-sh / 2, h / 2 + 9, s.alas + ' m'], [w / 2 + 20, 3, s.sisi + ' m'], [-w / 2 + sh / 2 + 15, 3, 't = ' + s.t2]]; o.dash = [[-w / 2 + sh / 2, -h / 2, -w / 2 + sh / 2, h / 2]]; o.rm = [[-w / 2 + sh / 2, h / 2, 1, -1]]; break; }
      case 'trap': { const A = s.a * k, B = s.b * k, T = s.t2 * k, c = hyp(s.t2, s.b - s.a);
        o.pts = [[-B / 2, T / 2], [B / 2, T / 2], [-B / 2 + A, -T / 2], [-B / 2, -T / 2]];
        o.lab = [[-B / 2 + A / 2, -T / 2 - 5, s.a + ' m'], [0, T / 2 + 9, s.b + ' m'], [-B / 2 - 14, 3, s.t2 + ' m'], [A / 2 + 6 + (B - A) / 4 + 14, 3, 'c = ' + fmt(c)]]; o.rm = [[-B / 2, T / 2, 1, -1], [-B / 2, -T / 2, 1, 1]]; break; }
      case 'belah': { const D1 = s.d1 * k, D2 = s.d2 * k; o.pts = [[0, -D2 / 2], [D1 / 2, 0], [0, D2 / 2], [-D1 / 2, 0]];
        o.dash = [[-D1 / 2, 0, D1 / 2, 0], [0, -D2 / 2, 0, D2 / 2]]; o.rm = [[0, 0, 1, -1]];
        o.lab = [[D1 / 4 + 4, -4, 'd₁ = ' + s.d1], [3, D2 / 4, 'd₂ = ' + s.d2], [D1 / 4 + 20, -D2 / 4 - 6, 's = ' + fmt(hyp(s.d1 / 2, s.d2 / 2))]]; break; }
    }
    // kotak pembatas
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const add = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
    o.pts.forEach(p => add(p[0], p[1])); o.sq.forEach(q => q.pts.forEach(p => add(p[0], p[1])));
    if (o.circle) { add(-o.circle, -o.circle); add(o.circle, o.circle); }
    o.box = [x0 - 16, y0 - 8, x1 + 16, y1 + 12];
    return o;
  }

  const Sh = {
    NAME,
    prep(s) { s._g = geom(s); const b = s._g.box; s.R = Math.max(b[2] - b[0], b[3] - b[1]) / 2 + 22; s.cx = s.x + (b[0] + b[2]) / 2; s.cy = s.y + (b[1] + b[3]) / 2; s.title = NAME[s.t]; return s; },
    draw(g, s) {
      const o = s._g || geom(s), col = COL[s.t];
      g.save(); g.translate(s.x, s.y); g.lineJoin = 'round'; g.lineCap = 'round';
      const poly = (pts, fill, stroke) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = stroke; g.lineWidth = 1.6; g.stroke(); };
      const text = (t, x, y, sz, c) => { g.font = '800 ' + (sz || 9.5) + 'px Nunito, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.92)'; g.strokeText(t, x, y); g.fillStyle = c || '#3a2312'; g.fillText(t, x, y); };
      o.sq.forEach((q, i) => { poly(q.pts, ['rgba(255,213,79,.55)', 'rgba(255,138,128,.55)', 'rgba(129,199,132,.6)'][i], 'rgba(58,35,18,.7)'); const cx = q.pts.reduce((a, p) => a + p[0], 0) / 4, cy = q.pts.reduce((a, p) => a + p[1], 0) / 4; text(q.txt, cx, cy + 3, 9.5); });
      if (o.circle) { g.beginPath(); g.arc(0, 0, o.circle, 0, 7); g.fillStyle = col + 'cc'; g.fill(); g.strokeStyle = '#3a2312'; g.lineWidth = 1.8; g.stroke(); }
      if (o.pts.length) poly(o.pts, col + 'cc', '#3a2312');
      g.setLineDash([3, 3]); g.strokeStyle = 'rgba(58,35,18,.85)'; g.lineWidth = 1.2; o.dash.forEach(d => { g.beginPath(); g.moveTo(d[0], d[1]); g.lineTo(d[2], d[3]); g.stroke(); }); g.setLineDash([]);
      g.strokeStyle = '#3a2312'; g.lineWidth = 1.2; o.rm.forEach(m => { const z = 6; g.beginPath(); g.moveTo(m[0] + m[2] * z, m[1]); g.lineTo(m[0] + m[2] * z, m[1] + m[3] * z); g.lineTo(m[0], m[1] + m[3] * z); g.stroke(); });
      o.lab.forEach(l => text(l[2], l[0], l[1], 9.5));
      text(NAME[s.t], (o.box[0] + o.box[2]) / 2, o.box[3] + 7, 11.5, '#5e3716');
      g.restore();
    },
    info(s) {
      const L = [], R = (a, b) => L.push(`<li><b>${a}</b> ${b}</li>`);
      let sizes = '';
      switch (s.t) {
        case 'persegi': sizes = `sisi = ${s.s} m`; R('Luas', `s × s = ${s.s} × ${s.s} = <b>${fmt(s.s * s.s)} m²</b>`); R('Keliling', `4 × s = 4 × ${s.s} = <b>${4 * s.s} m</b>`); R('Diagonal', `s√2 ≈ <b>${fmt(s.s * Math.SQRT2)} m</b>`); break;
        case 'pp': { const d = hyp(s.p, s.l); sizes = `panjang = ${s.p} m, lebar = ${s.l} m`; R('Luas', `p × l = ${s.p} × ${s.l} = <b>${fmt(s.p * s.l)} m²</b>`); R('Keliling', `2 × (p + l) = <b>${2 * (s.p + s.l)} m</b>`); R('Diagonal (Pythagoras)', `d² = ${s.p}² + ${s.l}² = ${s.p * s.p + s.l * s.l}, jadi d = <b>${fmt(d)} m</b>`); break; }
        case 'sku': { const c = hyp(s.a, s.b); sizes = `sisi tegak a = ${s.a} m, alas b = ${s.b} m`; R('Sisi miring (Pythagoras)', `c² = a² + b² = ${s.a}² + ${s.b}² = ${s.a * s.a} + ${s.b * s.b} = ${s.a * s.a + s.b * s.b}, jadi c = <b>${fmt(c)} m</b>`);
          R('Luas', `½ × a × b = ½ × ${s.a} × ${s.b} = <b>${fmt(s.a * s.b / 2)} m²</b>`); R('Keliling', `a + b + c = <b>${fmt(s.a + s.b + c)} m</b>`);
          if (s.sq) R('Luas persegi pada sisi', `${s.a * s.a} + ${s.b * s.b} = ${fmt(c * c)}. Luas persegi sisi miring = jumlah luas dua persegi lainnya.`); break; }
        case 'ss': { const h = s.s * Math.sqrt(3) / 2; sizes = `sisi = ${s.s} m`; R('Tinggi', `s√3 ÷ 2 ≈ <b>${fmt(h)} m</b> (dari Pythagoras: t² = ${s.s}² − ${s.s / 2}²)`); R('Luas', `½ × alas × tinggi ≈ <b>${fmt(s.s * h / 2)} m²</b>`); R('Keliling', `3 × s = <b>${3 * s.s} m</b>`); break; }
        case 'lingk': sizes = `jari-jari r = ${s.r} m`; R('Diameter', `2r = <b>${2 * s.r} m</b>`); R('Luas', `π × r² = 3,14 × ${s.r}² = <b>${fmt(3.14 * s.r * s.r)} m²</b>`); R('Keliling', `2 × π × r = <b>${fmt(2 * 3.14 * s.r)} m</b>`); break;
        case 'jajar': sizes = `alas = ${s.alas} m, tinggi = ${s.t2} m, sisi miring = ${s.sisi} m`; R('Luas', `alas × tinggi = ${s.alas} × ${s.t2} = <b>${fmt(s.alas * s.t2)} m²</b>`); R('Keliling', `2 × (alas + sisi miring) = <b>${2 * (s.alas + s.sisi)} m</b>`); R('Geseran puncak (Pythagoras)', `√(${s.sisi}² − ${s.t2}²) = <b>${fmt(Math.sqrt(s.sisi * s.sisi - s.t2 * s.t2))} m</b>`); break;
        case 'trap': { const c = hyp(s.t2, s.b - s.a); sizes = `sisi sejajar ${s.a} m dan ${s.b} m, tinggi = ${s.t2} m`; R('Sisi miring (Pythagoras)', `c² = ${s.t2}² + (${s.b} − ${s.a})² = ${s.t2 * s.t2 + (s.b - s.a) ** 2}, jadi c = <b>${fmt(c)} m</b>`); R('Luas', `½ × (${s.a} + ${s.b}) × ${s.t2} = <b>${fmt((s.a + s.b) * s.t2 / 2)} m²</b>`); R('Keliling', `${s.a} + ${s.b} + ${s.t2} + ${fmt(c)} = <b>${fmt(s.a + s.b + s.t2 + c)} m</b>`); break; }
        case 'belah': { const c = hyp(s.d1 / 2, s.d2 / 2); sizes = `diagonal d₁ = ${s.d1} m, d₂ = ${s.d2} m`; R('Sisi (Pythagoras)', `s² = ${s.d1 / 2}² + ${s.d2 / 2}² = ${(s.d1 / 2) ** 2 + (s.d2 / 2) ** 2}, jadi s = <b>${fmt(c)} m</b>`); R('Luas', `½ × d₁ × d₂ = <b>${fmt(s.d1 * s.d2 / 2)} m²</b>`); R('Keliling', `4 × s = <b>${fmt(4 * c)} m</b>`); break; }
      }
      return { title: NAME[s.t], html: `<h2 class="h-title">${NAME[s.t]}</h2><p class="small" style="margin:0 0 4px"><b>Ukuran:</b> ${sizes}</p><ul class="x-how sh-info">${L.join('')}</ul>` };
    }
  };
  window.PP = window.PP || {}; PP.Shapes = Sh;
})();
