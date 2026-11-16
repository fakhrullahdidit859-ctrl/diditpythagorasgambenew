/* Gerbang Kembali (pixel-art buatan kode): lengkung batu + pusaran cahaya + siluet kota + panah. Dipakai untuk portal berlabel "Kembali ...". */
(function () {
  'use strict';
  const px = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function draw(c, x, y, K, t, label) {
    const u = 3 * K, W = 26, H = 30;                       // grid 26 x 30 unit
    c.save(); c.translate(Math.round(x - W * u / 2), Math.round(y - H * u + 4)); c.imageSmoothingEnabled = false;
    const R = (gx, gy, gw, gh, col) => px(c, gx * u, gy * u, gw * u, gh * u, col);
    // lantai batu
    R(1, 27, 24, 3, '#7a6f64'); R(1, 27, 24, 1, '#a99d8e'); R(3, 29, 20, 1, '#5b5249');
    // pilar kiri & kanan (batu bata)
    for (const sx of [2, 19]) {
      R(sx, 8, 5, 20, '#9b8f80'); R(sx, 8, 1, 20, '#c1b5a5'); R(sx + 4, 8, 1, 20, '#6d6256');
      for (let r = 0; r < 6; r++) R(sx, 11 + r * 3, 5, 1, '#7d7266');
      R(sx - 1, 6, 7, 3, '#b3a797'); R(sx - 1, 6, 7, 1, '#d6cab9');
    }
    // lengkung atas
    R(2, 3, 22, 4, '#a89c8c'); R(2, 3, 22, 1, '#d6cab9'); R(5, 1, 16, 3, '#b3a797'); R(8, 0, 10, 2, '#c1b5a5');
    R(11, 0, 4, 4, '#e8c24a'); R(12, 1, 2, 2, '#fff2a8');     // batu kunci emas
    // pusaran cahaya
    const gx = 7 * u, gy = 7 * u, gw = 12 * u, gh = 20 * u;
    c.save(); c.beginPath(); c.rect(gx, gy, gw, gh); c.clip();
    const g = c.createLinearGradient(0, gy, 0, gy + gh); g.addColorStop(0, '#2a62d9'); g.addColorStop(1, '#8be6ff'); c.fillStyle = g; c.fillRect(gx, gy, gw, gh);
    for (let k = 0; k < 6; k++) {
      const a = t * 1.6 + k * 1.05, rr = (3 + k * 1.7) * u;
      c.strokeStyle = k % 2 ? 'rgba(255,255,255,.75)' : 'rgba(150,220,255,.8)'; c.lineWidth = Math.max(2, u * 0.7);
      c.beginPath(); c.ellipse(gx + gw / 2, gy + gh * 0.55, rr * 0.55, rr * 0.95, 0, a, a + 2.3); c.stroke();
    }
    c.restore();
    // siluet kota kecil di atas pusaran
    const sk = '#1a2a5e';
    R(9, 11, 2, 4, sk); R(11, 9, 2, 6, sk); R(13, 12, 2, 3, sk); R(15, 10, 2, 5, sk);
    R(11.5, 10, 1, 1, '#ffe27a'); R(9.5, 12, 1, 1, '#ffe27a'); R(15.5, 11.5, 1, 1, '#ffe27a');
    // panah kembali
    const pul = 1 + Math.sin(t * 4) * 0.06;
    c.save(); c.translate(13 * u, 20 * u); c.scale(pul, pul);
    c.fillStyle = '#ffd24a'; c.strokeStyle = '#3a2418'; c.lineWidth = Math.max(2, u * 0.6);
    c.beginPath(); c.moveTo(-4.5 * u, 0); c.lineTo(0, -3.2 * u); c.lineTo(0, -1.3 * u); c.lineTo(4 * u, -1.3 * u); c.lineTo(4 * u, 1.3 * u); c.lineTo(0, 1.3 * u); c.lineTo(0, 3.2 * u); c.closePath(); c.fill(); c.stroke(); c.restore();
    // percikan
    for (let k = 0; k < 5; k++) { const ph = (t * 0.7 + k * 0.2) % 1; px(c, (8 + k * 2.4) * u, (26 - ph * 18) * u, u, u, `rgba(255,248,190,${1 - ph})`); }
    c.restore();
  }
  window.PPPortalArt = { draw };
})();
