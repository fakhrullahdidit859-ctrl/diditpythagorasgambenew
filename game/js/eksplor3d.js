/* =========================================================
   EKSPLORASI PYTHAGORAS — pilihan awal 2 fitur:
   (1) Eksplor Pythagoras dengan Edukasi  -> semua fitur lama (Geser Sisi … Jalur Belajar)
   (2) Eksplor Pythagoras dengan 3D Nyata -> tombol Jalankan (tautan tersimpan),
        Atur Tautan, Galeri QR (unggah banyak, tersimpan online), Panduan.
   Tautan: rooms/{KODE}/eks3d/links/{id} = {t, u, a}   (guru mengubah; siswa membaca)
   QR:     rooms/{KODE}/qr/{id} = {t, i(gambar), u, b, bn, ts}
   ========================================================= */
(function () {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const C = () => window.PPCloud, GR = () => !!(window.PPGuru && PPGuru.isGuru());
  const DEFAULT = { t: 'Assembler Edu · 3D Nyata Pythagoras', u: 'https://asblr.com/nQfSsdG' };
  const okUrl = u => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch (e) { return false; } };
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
  const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const canEditLinks = () => GR() || !C().online();           // tanpa server = perangkat pribadi
  const mqLand = () => { try { return matchMedia('(orientation: landscape) and (max-height: 520px)').matches; } catch (e) { return false; } };

  /* ---------- adegan 3D isometrik yang bisa diputar ---------- */
  function scene3d(el, o) {
    o = o || {}; let th = 0.6, drag = null, raf = 0, dead = false, last = 0;
    const tri = [[0, 0], [4, 0], [0, 3]];
    const sq = [
      { p: [[0, 0], [0, 3], [-3, 3], [-3, 0]], c: ['#7fc3ff', '#4f9be0', '#3a7cc0'], t: '9', h: .7 },
      { p: [[0, 0], [4, 0], [4, -4], [0, -4]], c: ['#9be38a', '#63bd55', '#479a3d'], t: '16', h: .7 },
      { p: [[4, 0], [0, 3], [3, 7], [7, 4]], c: ['#ff9f8c', '#e8695a', '#c44d3f'], t: '25', h: .7 },
      { p: tri, c: ['#ffd36e', '#e3a93b', '#bd8426'], t: '', h: .7 }
    ];
    const cu = 1.6, cv = 1.6, S = o.s || 17;
    const proj = (u, v, z) => { const a = u - cu, b = v - cv, c = Math.cos(th), s = Math.sin(th), x = a * c - b * s, y = a * s + b * c; return [(x - y) * .866 * S, (x + y) * .5 * S - z * S, x + y]; };
    const draw = () => {
      const items = sq.map(f => { const n = f.p.length, ctr = f.p.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n], [0, 0]); return { f, d: proj(ctr[0], ctr[1], 0)[2] }; }).sort((a, b) => a.d - b.d);
      let out = `<ellipse cx="0" cy="${(5.2 * S).toFixed(0)}" rx="${(8 * S).toFixed(0)}" ry="${(2.2 * S).toFixed(0)}" fill="rgba(0,0,0,.14)"/>`;
      items.forEach(({ f }) => {
        const p = f.p, n = p.length; let area = 0; for (let i = 0; i < n; i++) { const a = p[i], b = p[(i + 1) % n]; area += a[0] * b[1] - b[0] * a[1]; }
        const sgn = area > 0 ? 1 : -1, pts = (z, q) => q.map(pp => proj(pp[0], pp[1], z).slice(0, 2).map(v => v.toFixed(1)).join(',')).join(' ');
        for (let i = 0; i < n; i++) {
          const a = p[i], b = p[(i + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1]; let nu = ey * sgn, nv = -ex * sgn;
          const c = Math.cos(th), s = Math.sin(th), nx = nu * c - nv * s, ny = nu * s + nv * c;
          if (nx + ny > 0.0001) { const A = proj(a[0], a[1], 0), B = proj(b[0], b[1], 0), A2 = proj(a[0], a[1], f.h), B2 = proj(b[0], b[1], f.h); out += `<polygon points="${A[0].toFixed(1)},${A[1].toFixed(1)} ${B[0].toFixed(1)},${B[1].toFixed(1)} ${B2[0].toFixed(1)},${B2[1].toFixed(1)} ${A2[0].toFixed(1)},${A2[1].toFixed(1)}" fill="${(nx - ny) > 0 ? f.c[1] : f.c[2]}" stroke="#3b2412" stroke-width="1.2" stroke-linejoin="round"/>`; }
        }
        out += `<polygon points="${pts(f.h, p)}" fill="${f.c[0]}" stroke="#3b2412" stroke-width="1.6" stroke-linejoin="round"/>`;
        if (f.t) { const ctr = p.reduce((a, q) => [a[0] + q[0] / n, a[1] + q[1] / n], [0, 0]), P = proj(ctr[0], ctr[1], f.h); out += `<text x="${P[0].toFixed(1)}" y="${(P[1] + 5).toFixed(1)}" text-anchor="middle" font-family="Lilita One, Fredoka, sans-serif" font-size="${f.t.length > 1 ? 15 : 14}" fill="#fff" stroke="#3b2412" stroke-width="3" paint-order="stroke">${f.t}</text>`; }
        else { const q = proj(1.1, 1, f.h); out += `<path d="M${q[0] - 4},${q[1] + 3} l7,-3 l-1,7 z" fill="none"/>`; }
      });
      el.innerHTML = `<svg viewBox="-150 -118 300 250" role="img" aria-label="Segitiga siku-siku 3-4-5 dengan tiga persegi 3D: 9, 16, dan 25 yang bisa diputar"><g>${out}</g></svg>`;
    };
    draw();
    const loop = ts => { if (dead) return; if (!drag && !reduce() && ts - last > 40) { th += 0.012; last = ts; draw(); } raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const down = e => { drag = { x: e.clientX, t: th }; try { el.setPointerCapture(e.pointerId); } catch (x) { } };
    const move = e => { if (!drag) return; th = drag.t + (e.clientX - drag.x) * 0.012; draw(); };
    const up = () => { drag = null; };
    if (!o.still) { el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.style.touchAction = 'pan-y'; el.style.cursor = 'grab'; }
    return () => { dead = true; cancelAnimationFrame(raf); };
  }

  /* ---------- gambar QR: kecilkan + simpan sebagai JPEG ---------- */
  function shrink(file) {
    return new Promise((res, rej) => {
      const img = new Image(), u = URL.createObjectURL(file);
      img.onload = async () => {
        try {
          let max = 520, q = .86, out = '';
          for (let k = 0; k < 6; k++) {
            const sc = Math.min(1, max / Math.max(img.width, img.height)), w = Math.max(1, Math.round(img.width * sc)), h = Math.max(1, Math.round(img.height * sc));
            const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h);
            out = cv.toDataURL('image/jpeg', q);
            if (out.length <= 110000) { let url = ''; try { if ('BarcodeDetector' in window) { const r = await new BarcodeDetector({ formats: ['qr_code'] }).detect(cv); if (r && r[0] && okUrl(r[0].rawValue)) url = r[0].rawValue.slice(0, 300); } } catch (e) { } URL.revokeObjectURL(u); return res({ i: out, u: url }); }
            max = Math.round(max * .8); q = Math.max(.6, q - .06);
          }
          URL.revokeObjectURL(u); rej(new Error('besar'));
        } catch (e) { URL.revokeObjectURL(u); rej(e); }
      };
      img.onerror = () => { URL.revokeObjectURL(u); rej(new Error('bukan gambar')); };
      img.src = u;
    });
  }

  PP.screens.eksplorasi = function () {
    let view = 'home', stops = [], edu = null, cache = {}, links = [];
    const clearStops = () => { stops.forEach(f => { try { f(); } catch (e) { } }); stops = []; };
    return {
      html: '<div class="wrap narrowish"><div class="panel fill pad x3" id="x3"></div></div>',
      unmount() { clearStops(); try { edu && edu.unmount && edu.unmount(); } catch (e) { } },
      mount(app) {
        const root = PP.$('#x3', app);
        const head = (title, back, sub) => `<div class="x3-top">${back ? `<button class="btn sm x3-back" data-v="${back}" aria-label="Kembali">← Kembali</button>` : ''}<div class="x3-tt"><h2 class="h-title" style="margin:0">${title}</h2>${sub ? `<p class="small" style="margin:0">${sub}</p>` : ''}</div></div>`;
        const go = v => { clearStops(); try { edu && edu.unmount && edu.unmount(); } catch (e) { } edu = null; view = v; draw(); };
        const activeLink = () => { const a = links.find(l => l.a) || links[0]; return a || Object.assign({ id: 'def', a: 1, def: 1 }, DEFAULT); };

        /* ----- beranda: dua pilihan ----- */
        const home = () => {
          root.innerHTML = `${head('Eksplorasi Pythagoras', '', 'Pilih cara belajarmu.')}<div class="x3-two">
            <button class="x3-card x3-edu" data-v="edu"><span class="x3-art"><svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="44" width="36" height="36" fill="#7fc3ff" stroke="#3b2412" stroke-width="3"/><rect x="44" y="52" width="28" height="28" fill="#9be38a" stroke="#3b2412" stroke-width="3" transform="translate(0 0)"/><polygon points="44,44 44,80 72,80" fill="#ffd36e" stroke="#3b2412" stroke-width="3" stroke-linejoin="round" opacity="0"/><polygon points="44,8 8,44 44,80" fill="#ffd36e" stroke="#3b2412" stroke-width="3" stroke-linejoin="round"/><text x="26" y="67" text-anchor="middle" font-size="13" font-weight="800" fill="#3b2412">a²</text><text x="58" y="71" text-anchor="middle" font-size="13" font-weight="800" fill="#3b2412">b²</text></svg></span><b>Eksplor Pythagoras dengan Edukasi</b><span class="x3-d">Geser sisi, bukti persegi, puzzle, cari hipotenusa, latihan, dan Jalur Belajar.</span><span class="x3-go">Buka semua fitur ›</span></button>
            <button class="x3-card x3-3d" data-v="3d"><span class="x3-art" id="x3Mini"></span><b>Eksplor Pythagoras dengan 3D Nyata</b><span class="x3-d">Lihat bangun 3D asli lewat Assembler Edu. Ada tautan, kode QR, dan panduan.</span><span class="x3-go">Buka 3D Nyata ›</span></button></div>`;
          stops.push(scene3d(PP.$('#x3Mini', root), { s: 14, still: true }));
        };

        /* ----- fitur lama (edukasi) ----- */
        const eduV = () => {
          const e = PP.screens.eksplorasiEdu(); edu = e;
          root.innerHTML = `<div class="x3-top"><button class="btn sm x3-back" data-v="home" aria-label="Kembali ke pilihan">← Pilihan</button><b class="x3-crumb">Eksplor dengan Edukasi</b></div><div id="x3Edu" class="x3-edu-host"></div>`;
          const h = PP.$('#x3Edu', root); h.innerHTML = e.html; e.mount(h);
          const w = PP.$('.wrap', h); if (w) w.style.padding = '0';
        };

        /* ----- 3D nyata: beranda ----- */
        const v3d = () => {
          const L = activeLink();
          root.innerHTML = `${head('3D Nyata', 'home', 'Belajar Pythagoras dengan objek 3D sungguhan.')}
            <div class="x3-stage"><div class="x3-scene" id="x3Scene"></div>
              <div class="x3-run"><p class="small x3-cap">${esc(L.t)}${L.def ? ' (bawaan)' : ''}<br><span class="muted">${esc(host(L.u))}</span></p>
                <a class="btn gold xl x3-jalan" id="x3Run" href="${esc(L.u)}" target="_blank" rel="noopener noreferrer">▶ Jalankan 3D Nyata</a>
                <p class="small muted x3-hint">Terbuka di tab baru (Assembler Edu tidak bisa ditampilkan di dalam game).</p></div></div>
            <div class="x3-nav"><button class="x3-nb" data-v="3dlink"><img class="px" src="assets/lomba/ikon/ikon_topik.png" alt=""><b>Atur Tautan</b><span>Simpan & pilih link</span></button><button class="x3-nb" data-v="3dqr"><img class="px" src="assets/lomba/ikon/ikon_pratinjau.png" alt=""><b>Kode QR AR</b><span>Objek 3D Augmented Reality</span></button><button class="x3-nb" data-v="3dhelp"><img class="px" src="assets/lomba/ikon/ikon_tahukah_kamu.png" alt=""><b>Panduan</b><span>Cara memakai</span></button></div>`;
          stops.push(scene3d(PP.$('#x3Scene', root), { s: mqLand() ? 13 : 17 }));
          stops.push(C().watch('eks3d/links', v => { links = lArr(v); const a = activeLink(), r = PP.$('#x3Run', root); if (r) { r.href = a.u; const c = PP.$('.x3-cap', root); if (c) c.innerHTML = `${esc(a.t)}${a.def ? ' (bawaan)' : ''}<br><span class="muted">${esc(host(a.u))}</span>`; } }, 5000));
        };
        const lArr = v => Object.keys(v || {}).filter(k => v[k] && okUrl(v[k].u)).map(k => Object.assign({ id: k }, v[k])).sort((a, b) => (+a.ts || 0) - (+b.ts || 0));

        /* ----- atur tautan ----- */
        const vLink = () => {
          const draw2 = () => {
            const can = canEditLinks(), act = activeLink();
            root.innerHTML = `${head('Atur Tautan', '3d', 'Link yang dibuka saat menekan Jalankan.')}<div class="x3-body scrollbox">
              ${can ? '' : `<p class="small ab-note">Tautan kelas diatur oleh guru. Kamu hanya bisa membukanya. <button class="btn sm blue" id="x3In">Masuk Guru</button></p>`}
              <div class="x3-lk-list">${(links.length ? links : [act]).map(l => `<div class="x3-lk ${(l.a || (!links.some(z => z.a) && l === (links[0] || act))) ? 'on' : ''}"><div class="x3-lk-t"><b>${esc(l.t)}</b><span class="small muted">${esc(host(l.u))}${l.def ? ' · bawaan' : ''}</span></div>
                <a class="btn sm gold" href="${esc(l.u)}" target="_blank" rel="noopener noreferrer">Buka</a>${can && !l.def ? `<button class="btn sm green" data-act2="use" data-id="${l.id}">${l.a ? 'Aktif ✓' : 'Jadikan aktif'}</button><button class="btn sm" data-act2="del" data-id="${l.id}" aria-label="Hapus">×</button>` : ''}</div>`).join('')}</div>
              ${can ? `<form class="x3-form" id="x3F"><input id="x3T" maxlength="60" placeholder="Nama tautan (mis. 3D Teorema Pythagoras)" aria-label="Nama tautan"><input id="x3U" type="url" inputmode="url" maxlength="300" placeholder="https://..." aria-label="Alamat tautan"><button class="btn green" type="submit">Simpan Tautan</button></form>` : ''}
              <p class="small ab-note">${C().online() ? 'Tersimpan di server ruangan ' + esc(C().room()) + ': semua siswa membuka tautan aktif yang sama.' : 'Mode lokal: tersimpan di perangkat ini.'} Tombol Jalankan otomatis membuka tautan aktif.</p></div>`;
            const i = PP.$('#x3In', root); if (i) i.onclick = () => PPGuru.login(ok => ok && draw2());
            PP.$$('[data-act2]', root).forEach(b => b.onclick = async () => {
              if (b.dataset.act2 === 'del') { PP.ui.confirm('Hapus tautan ini?', 'Ya, hapus', async () => { await C().del('eks3d/links/' + b.dataset.id); await refresh(); }); return; }
              const upd = {}; links.forEach(l => { upd[l.id + '/a'] = l.id === b.dataset.id ? 1 : 0; }); await Promise.all(Object.keys(upd).map(p => C().put('eks3d/links/' + p, upd[p]))); await refresh();
            });
            const f = PP.$('#x3F', root); if (f) f.onsubmit = async e => {
              e.preventDefault(); const t = PP.$('#x3T').value.trim().slice(0, 60), u = PP.$('#x3U').value.trim();
              if (!okUrl(u)) return PP.ui.toast('Tautan harus diawali https://');
              const id = C().uid(), first = !links.length; const ok = await C().put('eks3d/links/' + id, { t: t || host(u) || 'Tautan 3D', u, a: first ? 1 : 0, ts: Date.now() });
              if (!ok) return PP.ui.toast('Belum tersimpan. Coba lagi.'); PP.ui.toast('Tautan disimpan.'); await refresh();
            };
          };
          const refresh = async () => { const v = await C().get('eks3d/links'); if (v !== undefined) links = lArr(v); draw2(); };
          draw2(); refresh();
        };

        /* ----- galeri QR ----- */
        const vQr = () => {
          let list = [], limit = 48, busy = false, ids = [];
          root.innerHTML = `${head('Kode QR Objek 3D Augmented Reality (AR)', '3d', 'Unggah QR sebanyak yang kamu mau. Semua orang di ruangan ini bisa melihatnya.')}
            <div class="x3-qbar"><label class="btn green x3-up" for="x3File">+ Unggah QR</label><input id="x3File" type="file" accept="image/*" multiple hidden><span class="small" id="x3Cnt"></span></div>
            <div class="x3-notes" id="x3Notes"></div><div class="x3-grid scrollbox" id="x3G"></div><p class="small ab-note" id="x3Mode"></p>`;
          /* panduan & catatan (bawaan + catatan tambahan; tambah/ubah/hapus hanya oleh guru) */
          const PAN = 'Untuk menampilkan Objek 3D dari kode QR ini, silakan scan, baik dengan perangkat yang sedang kamu gunakan maupun dengan perangkat kedua yang memiliki kamera. Pastikan jaringan stabil dan bagus. Objek 3D akan tampil seperti visual Augmented Reality (AR). Silakan buka web/aplikasi Assembler Edu, lalu cari fitur Scan (tanpa login pun bisa). Setelah memilih Scan, kamera akan menyala otomatis; klik Turn on camera, lalu scan kembali kode QR ini. Setelah loading selesai, Objek 3D Augmented Reality akan ditampilkan. Saran: gunakan HP/perangkat digital yang punya kamera belakang. Kamu dapat menggerakkan objek 3D AR tersebut dengan menyentuh layar perangkat yang kamu gunakan untuk memindai kode QR. Ini hanya berlaku untuk Assembler Edu ya!';
          let notes = {};
          const nBox = PP.$('#x3Notes', root);
          const nPaint = () => {
            const items = [{ id: 'ar', t: 'Cara menampilkan Objek 3D AR dari kode QR', b: (notes.ar && notes.ar.b) || PAN, def: !(notes.ar && notes.ar.b) }].concat(Object.keys(notes).filter(k => k !== 'ar' && notes[k] && notes[k].b).sort((a, b) => (+notes[a].ts || 0) - (+notes[b].ts || 0)).map(k => ({ id: k, t: notes[k].t || 'Catatan', b: notes[k].b })));
            nBox.innerHTML = `<div class="x3-nh"><b>Panduan & catatan</b>${GR() ? '<button class="btn xs green" id="x3NAdd">+ Tambah catatan</button>' : ''}</div>` + items.map(n => `<details class="x3-note" ${n.id === 'ar' ? 'open' : ''}><summary>${esc(n.t)}</summary><p>${esc(n.b).replace(/\n/g, '<br>')}</p>${GR() ? `<div class="row"><button class="btn xs" data-ne="${n.id}">Ubah</button>${n.id === 'ar' && n.def ? '' : `<button class="btn xs red" data-nd="${n.id}">${n.id === 'ar' ? 'Kembalikan bawaan' : 'Hapus'}</button>`}</div>` : ''}</details>`).join('');
            const edit = id => PPGuru.require(() => { const cur = id ? (id === 'ar' ? { t: 'Cara menampilkan Objek 3D AR dari kode QR', b: (notes.ar && notes.ar.b) || PAN } : notes[id]) : { t: '', b: '' };
              PP.ui.modal(`<h3>${id ? 'Ubah catatan' : 'Catatan baru'}</h3><input id="x3NT" class="ab-inp" maxlength="80" placeholder="Judul catatan" value="${esc(cur.t || '')}"><textarea id="x3NB" class="ab-inp" rows="9" maxlength="2500" placeholder="Tulis keterangan, cara akses, atau tautan…">${esc(cur.b || '')}</textarea><div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="x3NS">Simpan</button></div>`);
              PP.$('#x3NS').onclick = async () => { const t = PP.$('#x3NT').value.trim().slice(0, 80), b = PP.$('#x3NB').value.trim(); if (!b) return PP.ui.toast('Isi catatan dulu.'); const nid = id || C().uid(); const ok = await C().put('eks3d/notes/' + nid, { t: t || 'Catatan', b, ts: Date.now() }); notes[nid] = { t: t || 'Catatan', b, ts: Date.now() }; PP.ui.close(); PP.ui.toast(ok ? 'Catatan tersimpan.' : 'Gagal menyimpan.'); nPaint(); }; });
            const a = PP.$('#x3NAdd', nBox); if (a) a.onclick = () => edit(null);
            Array.from(nBox.querySelectorAll('[data-ne]')).forEach(b => b.onclick = () => edit(b.dataset.ne));
            Array.from(nBox.querySelectorAll('[data-nd]')).forEach(b => b.onclick = () => PPGuru.require(async () => { await C().del('eks3d/notes/' + b.dataset.nd); delete notes[b.dataset.nd]; nPaint(); }));
          };
          nPaint(); stops.push(PPGuru.onChange(() => nPaint()));
          stops.push(C().watch('eks3d/notes', v => { notes = v && typeof v === 'object' ? v : {}; nPaint(); }, 8000));
          const g = PP.$('#x3G', root), cnt = PP.$('#x3Cnt', root);
          PP.$('#x3Mode', root).textContent = C().online() ? 'Tersimpan online di ruangan ' + C().room() + '. Gambar dikecilkan otomatis agar hemat kuota.' : 'Mode lokal: Firebase belum diisi, QR hanya tampil di perangkat ini.';
          const mine = it => it.b === PPNet.id();
          const paint = () => {
            cnt.textContent = list.length + ' QR';
            g.innerHTML = list.length ? list.slice(0, limit).map(it => `<button class="x3-qr" data-id="${it.id}" aria-label="Buka QR ${esc(it.t)}"><img src="${it.i}" alt="Kode QR ${esc(it.t)}" loading="lazy"><span>${esc(it.t)}</span></button>`).join('') + (list.length > limit ? '<button class="btn sm x3-more" id="x3More">Tampilkan lebih banyak</button>' : '') : '<p class="small" style="grid-column:1/-1;text-align:center">Belum ada QR. Tekan “Unggah QR” untuk menambahkan.</p>';
            const m = PP.$('#x3More', g); if (m) m.onclick = () => { limit += 48; paint(); };
          };
          const sync = async () => {
            const k = await C().keys('qr'); if (k === undefined) return; ids = k;
            const miss = k.filter(id => !cache[id]); for (let i = 0; i < miss.length; i += 6) await Promise.all(miss.slice(i, i + 6).map(async id => { const v = await C().get('qr/' + id); if (v && typeof v.i === 'string') cache[id] = Object.assign({ id }, v); }));
            list = k.map(id => cache[id]).filter(Boolean).sort((a, b) => (+b.ts || 0) - (+a.ts || 0)); paint();
          };
          sync(); const t = setInterval(() => { if (!document.hidden && !busy) sync(); }, 7000); stops.push(() => clearInterval(t));
          PP.$('#x3File', root).onchange = async e => {
            const files = Array.from(e.target.files || []); e.target.value = ''; if (!files.length) return; busy = true; let ok = 0, fail = 0;
            for (let n = 0; n < files.length; n++) {
              cnt.textContent = 'Mengunggah ' + (n + 1) + '/' + files.length + '…';
              try { const r = await shrink(files[n]); const id = C().uid(), t = files[n].name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 60) || 'QR'; const rec = { t, i: r.i, u: r.u || '', b: PPNet.id(), bn: String(PP.nm()).slice(0, 40), ts: Date.now() }; if (await C().put('qr/' + id, rec)) { cache[id] = Object.assign({ id }, rec); ok++; } else fail++; } catch (x) { fail++; }
            }
            busy = false; PP.ui.toast(ok + ' QR terunggah' + (fail ? ', ' + fail + ' gagal (bukan gambar / penyimpanan penuh)' : '') + '.'); sync();
          };
          g.onclick = e => {
            const b = e.target.closest('.x3-qr'); if (!b) return; const it = cache[b.dataset.id]; if (!it) return; const can = mine(it) || GR();
            PP.ui.modal(`<h3 id="x3MT">${esc(it.t)}</h3><div class="x3-big"><img src="${it.i}" alt="Kode QR ${esc(it.t)}"></div><p class="small muted" style="margin:2px 0">Diunggah oleh ${esc(it.bn || 'siswa')}${it.u ? ' · ' + esc(host(it.u)) : ''}. Arahkan kamera HP ke gambar ini untuk memindai.</p>
              <div class="row end">${it.u ? `<a class="btn gold" href="${esc(it.u)}" target="_blank" rel="noopener noreferrer">Buka tautan</a>` : ''}<a class="btn" href="${it.i}" download="qr_${esc(it.t)}.jpg">Unduh</a>${can ? '<button class="btn" id="x3Ren">Ganti nama</button><button class="btn red" id="x3Del">Hapus</button>' : ''}<button class="btn" data-close>Tutup</button></div>`);
            const d = PP.$('#x3Del'); if (d) d.onclick = async () => { await C().del('qr/' + it.id); delete cache[it.id]; PP.ui.close(); sync(); };
            const r = PP.$('#x3Ren'); if (r) r.onclick = () => { PP.ui.close(); PP.ui.modal(`<h3>Nama QR</h3><input id="x3N" class="ab-inp" maxlength="60" value="${esc(it.t)}"><div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="x3Ok">Simpan</button></div>`); PP.$('#x3Ok').onclick = async () => { const v = PP.$('#x3N').value.trim().slice(0, 60); if (v) { await C().put('qr/' + it.id + '/t', v); it.t = v; } PP.ui.close(); paint(); }; };
          };
        };

        const vHelp = () => {
          root.innerHTML = `${head('Panduan 3D Nyata', '3d')}<div class="x3-body scrollbox"><ol class="x3-steps">
            <li><b>Jalankan.</b> Tekan <em>Jalankan 3D Nyata</em>. Tautan terbuka di tab baru, yaitu halaman Assembler Edu.</li>
            <li><b>Pakai HP?</b> Buka tab <em>Kode QR</em>, tekan QR yang diinginkan, lalu pindai dengan kamera HP lain atau tekan <em>Buka tautan</em>.</li>
            <li><b>Guru</b> masuk dengan PIN di <em>Atur Tautan</em> untuk menambah dan memilih tautan aktif. Semua siswa langsung memakai tautan itu.</li>
            <li><b>Unggah QR</b> bisa dilakukan siapa saja dan sebanyak apa pun. Yang bisa menghapus: pengunggah atau guru.</li>
            <li>Kembali ke <em>Eksplorasi dengan Edukasi</em> untuk Geser Sisi sampai Jalur Belajar.</li></ol>
            <p class="small ab-note">Objek 3D tampil di Assembler Edu (situs lain), bukan di dalam game. Gambar 3D di halaman ini hanya ilustrasi yang bisa kamu putar.</p></div>`;
        };

        function draw() {
          root.classList.toggle('x3-edu-on', view === 'edu');
          ({ home, edu: eduV, '3d': v3d, '3dlink': vLink, '3dqr': vQr, '3dhelp': vHelp }[view] || home)();
          root.scrollTop = 0;
        }
        root.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (b && root.contains(b)) go(b.dataset.v); });
        draw();
      }
    };
  };
})();
