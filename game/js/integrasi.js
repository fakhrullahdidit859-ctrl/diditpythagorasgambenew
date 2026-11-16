/* =========================================================
   INTEGRASI PLATFORM — menautkan game dengan platform lain (Canva, Google AI Studio, Zeepquiz, Wordwall,
   dan platform tambahan seperti Google Formulir, YouTube, Quizizz, Kahoot, Padlet, dll.).
   - Guru menambah tautan secara manual, menempel dari papan klip, mengunggah gambar kode QR, atau memindai QR dengan kamera;
     tautan otomatis terbaca dan tersimpan, lalu tersinkron ke semua siswa di ruangan yang sama (pembaruan tiap ± 6 detik).
   - Siswa menekan kartu platform: bila ada tautan utama (atau hanya satu tautan) langsung berpindah ke platform; bila banyak,
     daftar tautan tampil. Tiap tautan punya kode QR agar dapat dibuka di perangkat lain.
   - Data: rooms/{KODE}/integrasi/links/{platform}/{id} = {t,u,n,k,o,main,hid,ts,by}  ·  integrasi/plat/{id} = {n,e,c,d}
   - Hanya tautan http(s) yang diterima. Mengubah/menghapus hanya untuk guru (PIN). Cadangan: ekspor/impor berkas JSON.
   Rute: #integrasi
   ========================================================= */
(function () {
  'use strict';
  window.PP = window.PP || {}; PP.screens = PP.screens || {}; PP.ICONS = PP.ICONS || {};
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const C = () => window.PPCloud, GU = () => window.PPGuru, ui = () => PP.ui;
  const toast = (t, k) => { try { ui().toast(t, k); } catch (e) { } };
  const sfx = n => { try { window.PPAudio && PPAudio.sfx && PPAudio.sfx(n); } catch (e) { } };

  /* ---------- ikon (SVG 64x64, gaya sama dengan ikon lain: garis tepi cokelat tua) ---------- */
  const O = '#3b2412', ST = `stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const svg = b => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${b}</svg>`;
  PP.ICONS.int_canva = svg(`<defs><linearGradient id="icA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00c4cc"/><stop offset="1" stop-color="#7d2ae8"/></linearGradient></defs><circle cx="32" cy="32" r="27" fill="url(#icA)" ${ST}/><path d="M43 24.5c-2.5-4-6-6-10.2-6-7.2 0-12.3 5.7-12.3 13.4 0 7.4 4.7 13 11.3 13 4.6 0 8.2-2.4 11-6.6" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/><circle cx="46" cy="20" r="2.2" fill="#fff"/>`);
  PP.ICONS.int_aistudio = svg(`<defs><linearGradient id="icB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4285f4"/><stop offset=".55" stop-color="#9b72cb"/><stop offset="1" stop-color="#d96570"/></linearGradient></defs><rect x="6" y="6" width="52" height="52" rx="14" fill="url(#icB)" ${ST}/><path d="M30 14c1.6 9.4 5.8 14.4 14 16-8.2 1.6-12.4 6.6-14 16-1.6-9.4-5.8-14.4-14-16 8.2-1.6 12.4-6.6 14-16z" fill="#fff"/><path d="M47 38c.7 4 2.5 6 6 6.7-3.5.7-5.3 2.700-6 6.700-.7-4-2.500-6-6-6.700 3.500-.7 5.300-2.700 6-6.700z" fill="#fff" opacity=".92"/>`);
  PP.ICONS.int_zeepquiz = svg(`<defs><linearGradient id="icC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f06bb0"/><stop offset="1" stop-color="#8b3fd9"/></linearGradient></defs><path d="M10 12h44a5 5 0 0 1 5 5v26a5 5 0 0 1-5 5H34l-11 10v-10h-13a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5z" fill="url(#icC)" ${ST}/><path d="M21 22h20l-20 20h22" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="49" cy="25" r="4" fill="#ffe27a" stroke="${O}" stroke-width="2"/>`);
  PP.ICONS.int_wordwall = svg(`<rect x="5" y="5" width="25" height="25" rx="6" fill="#ef5350" ${ST}/><rect x="34" y="5" width="25" height="25" rx="6" fill="#ffca28" ${ST}/><rect x="5" y="34" width="25" height="25" rx="6" fill="#66bb6a" ${ST}/><rect x="34" y="34" width="25" height="25" rx="6" fill="#42a5f5" ${ST}/><path d="M11 13l3 11 3-8 3 8 3-11" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 17h13M40 22h9" stroke="#3b2412" stroke-width="3" stroke-linecap="round"/><path d="M12 44h12M12 50h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="46.500" cy="46.500" r="6" fill="none" stroke="#fff" stroke-width="3"/>`);
  PP.ICONS.int_link = svg(`<rect x="4" y="4" width="56" height="56" rx="16" fill="#8fa8d8" ${ST}/><path d="M27 37l10-10M24 30l-5 5a7 7 0 0 0 10 10l5-5M40 34l5-5a7 7 0 0 0-10-10l-5 5" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`);
  PP.ICONS.integrasi = svg(`<circle cx="32" cy="32" r="9" fill="#ffd54a" ${ST}/><path d="M32 23V12M32 41v11M23 32H12M41 32h11" stroke="${O}" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="9" r="5.5" fill="#00c4cc" ${ST}/><circle cx="32" cy="55" r="5.500" fill="#ef5350" ${ST}/><circle cx="9" cy="32" r="5.500" fill="#9b72cb" ${ST}/><circle cx="55" cy="32" r="5.500" fill="#66bb6a" ${ST}/>`);

  /* ---------- ikon menu (lebih kaya: gradasi, kilau, bayangan) ---------- */
  const svgm = (n, b) => `<svg class="mic mic-${n}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${b}</svg>`;
  const SH = '<ellipse cx="32" cy="60" rx="18" ry="2.6" fill="#0003"/>';
  PP.ICONS.m_lkpd = svgm('lkpd', `<defs><linearGradient id="mlA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd978"/><stop offset="1" stop-color="#e08a22"/></linearGradient><linearGradient id="mlB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fc4ff"/><stop offset="1" stop-color="#2f6fd0"/></linearGradient></defs>${SH}
    <rect x="9" y="8" width="46" height="50" rx="9" fill="url(#mlA)" ${ST}/><rect x="15" y="16" width="34" height="36" rx="4" fill="#fffdf4" stroke="${O}" stroke-width="2"/>
    <rect x="23" y="4" width="18" height="10" rx="4" fill="#b9c4d8" ${ST}/><circle cx="32" cy="9" r="2" fill="#fff"/>
    <path d="M20 40V24h16z" fill="url(#mlB)" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/><path d="M20 36h4v4" fill="none" stroke="#fff" stroke-width="1.6"/>
    <path d="M40 24h6M40 29h6M40 34h4" stroke="#8a6a44" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="23" cy="47" r="3" fill="#ef5350" stroke="${O}" stroke-width="1.6"/><circle cx="32" cy="47" r="3" fill="#66bb6a" stroke="${O}" stroke-width="1.6"/><circle cx="41" cy="47" r="3" fill="#ffca28" stroke="${O}" stroke-width="1.6"/>
    <path class="pl-tick" d="M44 12l3 3 6-7" fill="none" stroke="#2fb35c" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`);
  PP.ICONS.m_offline = svgm('offline', `<defs><linearGradient id="moA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe0ff"/><stop offset="1" stop-color="#3b86e6"/></linearGradient></defs>${SH}
    <path d="M18 46a12 12 0 0 1-1-23.900A15 15 0 0 1 45.500 20 11.500 11.500 0 0 1 46 46z" fill="url(#moA)" ${ST}/><path d="M20 27a10 10 0 0 1 12-7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <path d="M32 26v14M25.500 34l6.500 7 6.500-7" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="48" cy="46" r="10" fill="#4cc46a" ${ST}/><path d="M43 46l4 4 7-8" fill="none" stroke="#fff" stroke-width="3.600" stroke-linecap="round" stroke-linejoin="round"/>`);
  PP.ICONS.m_integrasi = svgm('integrasi', `<defs><radialGradient id="miA" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff3a8"/><stop offset="1" stop-color="#f0a21c"/></radialGradient><linearGradient id="miB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00c4cc"/><stop offset="1" stop-color="#7d2ae8"/></linearGradient></defs>${SH}
    <g class="int-orbit"><circle cx="32" cy="31" r="21" fill="none" stroke="${O}" stroke-width="2" stroke-dasharray="3 4" opacity=".55"/></g>
    <path d="M32 31L32 11M32 31L12 31M32 31L52 31M32 31L32 51" stroke="${O}" stroke-width="4.500" stroke-linecap="round"/><path d="M32 31L32 11M32 31L12 31M32 31L52 31M32 31L32 51" stroke="#fff" stroke-width="1.600" stroke-linecap="round" opacity=".7"/>
    <circle cx="32" cy="10" r="7" fill="url(#miB)" ${ST}/><circle cx="12" cy="31" r="7" fill="#ef5350" ${ST}/><circle cx="52" cy="31" r="7" fill="#4285f4" ${ST}/><circle cx="32" cy="52" r="7" fill="#ffca28" ${ST}/>
    <circle cx="32" cy="31" r="10" fill="url(#miA)" ${ST}/><path d="M28 28a6 6 0 0 1 6-3" fill="none" stroke="#fff" stroke-width="2.500" stroke-linecap="round"/><path d="M29 31h6M32 28v6" stroke="${O}" stroke-width="2.600" stroke-linecap="round"/>`);
  const ico = (id, cls) => `<span class="int-ic ${cls || ''}">${PP.ICONS['int_' + id] || PP.ICONS[id] || PP.ICONS.int_link}</span>`;

  /* ---------- platform ---------- */
  const BASE = [
    { id: 'canva', n: 'Canva', c: '#7d2ae8', d: ['canva.com', 'canva.link'], desc: 'Desain, poster, dan presentasi' },
    { id: 'aistudio', n: 'Google AI Studio', c: '#4285f4', d: ['aistudio.google.com', 'ai.studio', 'g.co'], desc: 'Aplikasi dan model AI' },
    { id: 'zeepquiz', n: 'Zeepquiz', c: '#e8449a', d: ['zeepquiz.com'], desc: 'Kuis interaktif kelas' },
    { id: 'wordwall', n: 'Wordwall', c: '#f59e0b', d: ['wordwall.net'], desc: 'Permainan dan aktivitas belajar' }
  ];
  const PRESET = [['📝', 'Google Formulir', 'docs.google.com,forms.gle'], ['▶️', 'YouTube', 'youtube.com,youtu.be'], ['🎯', 'Quizizz', 'quizizz.com'], ['🎲', 'Kahoot', 'kahoot.it,kahoot.com'], ['📌', 'Padlet', 'padlet.com'], ['📄', 'Liveworksheets', 'liveworksheets.com'], ['📁', 'Google Drive', 'drive.google.com'], ['🧮', 'GeoGebra', 'geogebra.org'], ['🔗', 'Platform lain', '']];
  const KIND = ['Materi', 'Kuis', 'Permainan', 'Desain', 'Proyek', 'Tugas', 'Lainnya'];
  const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return ''; } };
  const matchDom = (host, doms) => (doms || []).some(d => host === d || host.endsWith('.' + d));
  function normUrl(raw) {
    let u = String(raw || '').trim().replace(/\s+/g, ''); if (!u) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
    try { const x = new URL(u); if (!/^https?:$/.test(x.protocol) || !x.hostname.includes('.')) return ''; return x.href.slice(0, 600); } catch (e) { return ''; }
  }
  const rid = () => 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  PP.screens.integrasi = function () {
    let root = null, data = { links: {}, plat: {} }, view = 'home', filter = '', kind = '', stopW = null, stopCam = null, alive = true, loaded = false, stopBar = null;
    const S = () => (window.PPStore && PPStore.data) || {};
    const hits = () => { const d = S(); d.integrasi = d.integrasi || { hits: {} }; d.integrasi.hits = d.integrasi.hits || {}; return d.integrasi.hits; };
    const isG = () => GU().isGuru();
    const plats = () => BASE.map(b => Object.assign({ builtin: true }, b)).concat(Object.keys(data.plat || {}).filter(id => data.plat[id] && data.plat[id].n).map(id => ({ id, n: data.plat[id].n, e: data.plat[id].e || '🔗', c: data.plat[id].c || '#4a6fa5', d: String(data.plat[id].d || '').split(',').filter(Boolean), desc: 'Platform tambahan', builtin: false })));
    const linksOf = pid => Object.keys((data.links || {})[pid] || {}).map(id => Object.assign({ id, pid }, data.links[pid][id])).filter(l => l && l.u).filter(l => isG() || !l.hid).sort((a, b) => (b.main ? 1 : 0) - (a.main ? 1 : 0) || (a.o || 0) - (b.o || 0) || (a.ts || 0) - (b.ts || 0));
    const icon = (p, cls) => p.builtin ? ico(p.id, cls) : `<span class="int-ic emo ${cls || ''}" style="background:${E(p.c)}">${E(p.e)}</span>`;

    /* ---------- membuka platform ---------- */
    function openLink(l, force) {
      const u = normUrl(l.u); if (!u) return toast('Tautan tidak valid.', 'x');
      const h = hits(); h[l.id] = (h[l.id] || 0) + 1; try { PPStore.save(); } catch (e) { }
      sfx('click'); toast('Membuka ' + (l.t || hostOf(u)) + '…');
      let w = null; try { w = window.open(u, '_blank', 'noopener,noreferrer'); } catch (e) { }
      if (!w && !force) linkModal(l, 'Peramban memblokir jendela baru. Gunakan tombol di bawah, salin tautan, atau pindai QR dari perangkat lain.');
    }
    function qrSvg(u) { try { return QRMake.svg(u, { size: 220, level: 'M' }); } catch (e) { return '<p class="small">Tautan terlalu panjang untuk QR.</p>'; } }
    function linkModal(l, note) {
      const u = normUrl(l.u);
      ui().modal(`<h3>${E(l.t || hostOf(u))}</h3>${note ? `<p class="modal-text small">${E(note)}</p>` : ''}<div class="int-qr">${qrSvg(u)}</div><p class="small int-url">${E(u)}</p>
        <div class="row end"><button class="btn sm" id="inCp">Salin tautan</button><a class="btn sm green" href="${E(u)}" target="_blank" rel="noopener noreferrer">Buka ↗</a><button class="btn" data-close>Tutup</button></div>`);
      $('#inCp').onclick = () => { try { navigator.clipboard.writeText(u).then(() => toast('Tautan disalin.'), () => toast('Salin manual dari kotak tautan.', 'x')); } catch (e) { toast('Salin manual dari kotak tautan.', 'x'); } };
    }
    function clickPlatform(p) {
      const ls = linksOf(p.id), main = ls.find(l => l.main) || (ls.length === 1 ? ls[0] : null);
      if (main) return openLink(main);
      view = p.id; paint();
    }

    /* ---------- tambah / ubah tautan ---------- */
    function editModal(p, l) {
      const all = plats(), cur = l || { pid: p.id };
      ui().modal(`<h3>${l ? 'Ubah tautan' : 'Tambah tautan'} · ${E(p.n)}</h3>
        <label class="fld small">Judul<input class="ab-inp" id="ieT" maxlength="100" placeholder="mis. Kuis Teorema Pythagoras" value="${E(cur.t || '')}"></label>
        <label class="fld small">Tautan (URL)<input class="ab-inp" id="ieU" inputmode="url" maxlength="600" placeholder="https://…" value="${E(cur.u || '')}" autocomplete="off"></label>
        <div class="row"><button class="btn xs" id="ieP">📋 Tempel</button><label class="btn xs blue">🖼 Unggah QR<input type="file" id="ieQ" accept="image/*" hidden></label><button class="btn xs gold" id="ieC">📷 Pindai kamera</button></div>
        <video id="ieV" class="int-vid" playsinline muted hidden></video><p class="small" id="ieS" role="status"></p>
        <div class="row"><label class="small">Jenis<select id="ieK">${KIND.map(k => `<option ${cur.k === k ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
        <label class="small">Platform<select id="ieL">${all.map(x => `<option value="${x.id}" ${x.id === (cur.pid || p.id) ? 'selected' : ''}>${E(x.n)}</option>`).join('')}</select></label></div>
        <label class="fld small">Catatan untuk siswa (opsional)<textarea class="ab-inp" id="ieN" rows="2" maxlength="200" placeholder="Cara memakai, kode kelas, batas waktu…">${E(cur.n || '')}</textarea></label>
        <label class="lkpd-cb"><input type="checkbox" id="ieM" ${cur.main ? 'checked' : ''}> Jadikan tautan utama (kartu platform langsung membuka tautan ini)</label>
        <label class="lkpd-cb"><input type="checkbox" id="ieH" ${cur.hid ? 'checked' : ''}> Sembunyikan dari siswa</label>
        <p class="err small" id="ieE" role="alert" hidden></p>
        <div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="ieOk">💾 Simpan</button></div>`, { cls: 'int-modal' });
      const st = t => { $('#ieS').textContent = t; }, err = t => { const e = $('#ieE'); e.textContent = t; e.hidden = !t; };
      const got = (txt, how) => { const u = normUrl(txt); if (!u) return st('Isi kode QR bukan tautan web: ' + String(txt).slice(0, 60)); $('#ieU').value = u; if (!$('#ieT').value.trim()) $('#ieT').value = hostOf(u); const mt = all.find(x => matchDom(hostOf(u), x.d)); if (mt) $('#ieL').value = mt.id; st(`✓ Tautan terbaca dari ${how}${mt ? ' · dikenali: ' + mt.n : ''}`); sfx('star'); };
      const stopC = () => { if (stopCam) { stopCam(); stopCam = null; } const v = $('#ieV'); if (v && v.srcObject) { v.srcObject.getTracks().forEach(t => t.stop()); v.srcObject = null; v.hidden = true; } };
      $('#ieP').onclick = async () => { try { got(await navigator.clipboard.readText(), 'papan klip'); } catch (e) { st('Tidak bisa membaca papan klip. Tempel manual (tekan lama di kotak tautan).'); } };
      $('#ieQ').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; st('Membaca QR…'); try { const t = await QRRead.fromFile(f); t ? got(t, 'gambar QR') : st('QR tidak terbaca. Pakai gambar yang lebih jelas atau ketik tautannya.'); } catch (x) { st('Gambar tidak dapat dibaca.'); } };
      $('#ieC').onclick = async () => {
        if (stopCam) { stopC(); return st('Kamera dimatikan.'); }
        try { const v = $('#ieV'), s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); v.srcObject = s; v.hidden = false; await v.play(); st('Arahkan kamera ke kode QR…'); stopCam = QRRead.scanVideo(v, t => { stopC(); got(t, 'kamera'); }); } catch (x) { st('Kamera tidak bisa dipakai di sini. Gunakan Unggah QR atau tempel tautan.'); }
      };
      $('#ieU').addEventListener('input', () => { const mt = all.find(x => matchDom(hostOf(normUrl($('#ieU').value)), x.d)); if (mt) $('#ieL').value = mt.id; });
      $('#ieOk').onclick = () => {
        const u = normUrl($('#ieU').value); if (!u) return err('Tautan tidak valid. Gunakan alamat web yang diawali https://');
        const t = $('#ieT').value.trim().slice(0, 100) || hostOf(u), pid = $('#ieL').value, pl = all.find(x => x.id === pid), dom = pl && pl.d && pl.d.length && !matchDom(hostOf(u), pl.d);
        const save = async () => {
          const id = l ? l.id : rid(), o = { t, u, n: $('#ieN').value.trim().slice(0, 200), k: $('#ieK').value, ts: Date.now(), by: GU().name(), o: l ? (l.o || 0) : Date.now() % 100000000, main: $('#ieM').checked ? 1 : 0, hid: $('#ieH').checked ? 1 : 0 };
          if (l && l.pid !== pid) await C().del(`integrasi/links/${l.pid}/${l.id}`);
          if (o.main) for (const x of linksOf(pid)) if (x.id !== id && x.main) await C().patch(`integrasi/links/${pid}/${x.id}`, { main: 0 });
          const ok = await C().put(`integrasi/links/${pid}/${id}`, o); stopC(); ui().close();
          if (ok === false) return toast('Gagal menyimpan. Coba lagi.', 'x');
          toast('Tautan tersimpan dan tersinkron ke siswa.'); sfx('star'); await reload();
        };
        if (dom) ui().confirm(`Tautan ini bukan dari ${pl.n} (${pl.d[0]}). Tetap simpan di ${pl.n}?`, 'Tetap simpan', save); else save();
      };
      const cl = $('[data-close]', document.querySelector('.modal') || document); if (cl) cl.addEventListener('click', stopC);
    }
    function platModal() {
      ui().modal(`<h3>Tambah platform</h3><p class="modal-text small">Pilih contoh atau ketik nama sendiri. Ikon bisa berupa emoji.</p><div class="int-pre">${PRESET.map((p, i) => `<button class="chip" data-pp="${i}">${p[0]} ${E(p[1])}</button>`).join('')}</div>
        <label class="fld small">Nama platform<input class="ab-inp" id="ipN" maxlength="40"></label><div class="row"><label class="small">Ikon (emoji)<input class="ab-inp" id="ipE" maxlength="4" size="4" value="🔗"></label><label class="small">Warna<input type="color" id="ipC" value="#4a6fa5"></label></div>
        <label class="fld small">Domain (opsional, pisahkan koma)<input class="ab-inp" id="ipD" maxlength="120" placeholder="contoh.com"></label>
        <div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="ipOk">Tambah</button></div>`);
      $$('[data-pp]').forEach(b => b.onclick = () => { const p = PRESET[+b.dataset.pp]; $('#ipE').value = p[0]; $('#ipN').value = p[1] === 'Platform lain' ? '' : p[1]; $('#ipD').value = p[2]; });
      $('#ipOk').onclick = async () => { const n = $('#ipN').value.trim(); if (!n) return toast('Isi nama platform.', 'x'); const id = 'x' + Date.now().toString(36); const ok = await C().put('integrasi/plat/' + id, { n, e: $('#ipE').value.trim() || '🔗', c: $('#ipC').value, d: $('#ipD').value.trim().toLowerCase() }); ui().close(); toast(ok === false ? 'Gagal menyimpan.' : 'Platform ditambahkan.', ok === false ? 'x' : ''); await reload(); };
    }
    function backupModal() {
      const json = JSON.stringify({ app: 'pythagoras-integrasi', v: 1, links: data.links || {}, plat: data.plat || {} }, null, 1);
      ui().modal(`<h3>Cadangkan / pulihkan</h3><p class="modal-text small">Salin teks ini sebagai cadangan, atau tempel cadangan lama lalu tekan Pulihkan.</p><textarea class="ab-inp" id="ibT" rows="8" style="font-family:monospace;font-size:11px">${E(json)}</textarea><div class="row end"><button class="btn sm" id="ibC">Salin</button><button class="btn sm blue" id="ibR">Pulihkan dari teks</button><button class="btn" data-close>Tutup</button></div>`);
      $('#ibC').onclick = () => { $('#ibT').select(); try { navigator.clipboard.writeText($('#ibT').value); toast('Disalin.'); } catch (e) { document.execCommand && document.execCommand('copy'); } };
      $('#ibR').onclick = async () => { try { const j = JSON.parse($('#ibT').value); if (j.app !== 'pythagoras-integrasi') throw 0; let n = 0; for (const pid of Object.keys(j.plat || {})) await C().put('integrasi/plat/' + pid, j.plat[pid]); for (const pid of Object.keys(j.links || {})) for (const id of Object.keys(j.links[pid] || {})) { const l = j.links[pid][id]; if (l && normUrl(l.u)) { l.u = normUrl(l.u); await C().put(`integrasi/links/${pid}/${id}`, l); n++; } } ui().close(); toast(n + ' tautan dipulihkan.'); await reload(); } catch (e) { toast('Teks cadangan tidak valid.', 'x'); } };
    }

    /* ---------- tampilan ---------- */
    function paint() {
      if (!root) return; const g = isG();
      if (view !== 'home') {
        const p = plats().find(x => x.id === view); if (!p) { view = 'home'; return paint(); }
        let ls = linksOf(p.id); const kinds = Array.from(new Set(ls.map(l => l.k).filter(Boolean)));
        const q = filter.toLowerCase(); ls = ls.filter(l => (!kind || l.k === kind) && (!q || (l.t + ' ' + (l.n || '') + ' ' + l.u).toLowerCase().includes(q)));
        root.innerHTML = `<div class="int-top"><button class="btn sm" id="inBk">◀ Platform</button>${icon(p, 'sm')}<div class="int-tt"><b>${E(p.n)}</b><small>${linksOf(p.id).length} tautan · ${E(p.desc)}</small></div>${g ? '<button class="btn sm green lkpd-pulse" id="inAdd">+ Tambah tautan</button>' : ''}</div>
          <div class="int-tools"><input class="ab-inp" id="inQ" type="search" placeholder="Cari tautan…" value="${E(filter)}">${kinds.length > 1 ? `<span class="int-kinds"><button class="chip ${kind ? '' : 'on'}" data-k="">Semua</button>${kinds.map(k => `<button class="chip ${kind === k ? 'on' : ''}" data-k="${E(k)}">${E(k)}</button>`).join('')}</span>` : ''}</div>
          <div class="int-list">${ls.map(l => `<div class="int-link ${l.hid ? 'hid' : ''}"><div class="int-lh">${icon(p, 'sm')}<div class="int-lt"><b>${E(l.t)}</b> ${l.main ? '<span class="lkpd-pill ok">utama</span>' : ''} ${l.hid ? '<span class="lkpd-pill warn">tersembunyi</span>' : ''}<small>${E(hostOf(l.u))}${l.k ? ' · ' + E(l.k) : ''}${hits()[l.id] ? ' · dibuka ' + hits()[l.id] + '×' : ''}</small></div></div>${l.n ? `<p class="small int-note">${E(l.n)}</p>` : ''}
            <div class="int-acts"><button class="btn sm green" data-o="${l.id}">Buka ↗</button><button class="btn sm" data-q="${l.id}">QR</button>${g ? `<button class="btn xs" data-e="${l.id}">Ubah</button><button class="btn xs" data-u="${l.id}" title="Naik">↑</button><button class="btn xs" data-d="${l.id}" title="Turun">↓</button><button class="btn xs red" data-x="${l.id}">Hapus</button>` : ''}</div></div>`).join('') || `<div class="int-empty">${icon(p)}<p>${linksOf(p.id).length ? 'Tidak ada tautan yang cocok.' : g ? 'Belum ada tautan. Tekan <b>+ Tambah tautan</b> (ketik, tempel, atau unggah/pindai QR).' : 'Belum ada tautan dari guru.'}</p></div>`}</div>`;
        $('#inBk').onclick = () => { view = 'home'; filter = ''; kind = ''; paint(); };
        const ad = $('#inAdd'); if (ad) ad.onclick = () => editModal(p);
        $('#inQ').oninput = e => { filter = e.target.value; const pos = e.target.selectionStart; paint(); const n = $('#inQ'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) { } };
        $$('[data-k]', root).forEach(b => b.onclick = () => { kind = b.dataset.k; paint(); });
        const by = id => linksOf(p.id).find(l => l.id === id);
        $$('[data-o]', root).forEach(b => b.onclick = () => openLink(by(b.dataset.o)));
        $$('[data-q]', root).forEach(b => b.onclick = () => linkModal(by(b.dataset.q)));
        $$('[data-e]', root).forEach(b => b.onclick = () => GU().require(() => editModal(p, by(b.dataset.e))));
        $$('[data-x]', root).forEach(b => b.onclick = () => GU().require(() => ui().confirm('Hapus tautan ini untuk semua siswa?', 'Hapus', async () => { await C().del(`integrasi/links/${p.id}/${b.dataset.x}`); toast('Tautan dihapus.'); await reload(); })));
        const mv = async (id, dir) => { const arr = linksOf(p.id).filter(l => !l.main || true), i = arr.findIndex(l => l.id === id), j = i + dir; if (j < 0 || j >= arr.length) return; const a = arr[i], b2 = arr[j]; const oa = a.o || i, ob = b2.o || j; await C().patch(`integrasi/links/${p.id}/${a.id}`, { o: ob === oa ? ob + dir : ob }); await C().patch(`integrasi/links/${p.id}/${b2.id}`, { o: oa }); await reload(); };
        $$('[data-u]', root).forEach(b => b.onclick = () => GU().require(() => mv(b.dataset.u, -1)));
        $$('[data-d]', root).forEach(b => b.onclick = () => GU().require(() => mv(b.dataset.d, 1)));
        return;
      }
      const total = plats().reduce((s, p) => s + linksOf(p.id).length, 0);
      root.innerHTML = `<div class="int-hero">${ico('integrasi', 'lg lkpd-float')}<div><h2>Integrasi Platform</h2><p class="small">Hubungkan game dengan platform belajar favoritmu. Tekan kartu untuk langsung berpindah ke platform.</p></div></div>
        <div class="int-bar"><span class="int-sync"><i class="${C().online() ? 'on' : ''}"></i>${C().online() ? 'Tersinkron online' : 'Mode lokal'} · ${total} tautan · ruangan ${E(C().room())}</span><span id="inGuru"></span>${g ? '<button class="btn sm" id="inPl">+ Platform</button><button class="btn sm" id="inBu">Cadangan</button>' : ''}<button class="btn sm" id="inRf">↻ Muat</button></div>
        <div class="int-grid">${plats().map(p => { const n = linksOf(p.id).length, ls = linksOf(p.id), direct = ls.find(l => l.main) || (ls.length === 1 ? ls[0] : null); return `<div class="int-card" style="--pc:${E(p.c)}"><button class="int-main" data-p="${E(p.id)}" aria-label="${E(p.n)}">${icon(p, 'lkpd-pop')}<b>${E(p.n)}</b><small>${E(p.desc)}</small><span class="int-go">${n ? (direct ? 'Buka ' + E(p.n) + ' ↗' : 'Pilih tautan (' + n + ')') : (g ? 'Tambah tautan' : 'Belum ada tautan')}</span></button>${n > 0 || g ? `<button class="int-more" data-m="${E(p.id)}" title="Semua tautan">${n ? n : '+'}</button>` : ''}${g && !p.builtin ? `<button class="int-del" data-r="${E(p.id)}" title="Hapus platform">✕</button>` : ''}</div>`; }).join('')}</div>
        <div class="int-tip small">${g ? '<b>Mode guru:</b> buka platform lalu tambah tautan (ketik, tempel, unggah gambar QR, atau pindai kamera). Tautan utama membuat kartu langsung membuka platform.' : 'Hanya guru yang dapat menambah atau mengubah tautan. Jika ada tautan baru, daftar ini diperbarui otomatis.'}</div>`;
      if (stopBar) stopBar(); stopBar = GU().bar($('#inGuru'));
      $$('[data-p]', root).forEach(b => b.onclick = () => clickPlatform(plats().find(x => x.id === b.dataset.p)));
      $$('[data-m]', root).forEach(b => b.onclick = () => { view = b.dataset.m; paint(); });
      $$('[data-r]', root).forEach(b => b.onclick = () => GU().require(() => ui().confirm('Hapus platform ini beserta semua tautannya?', 'Hapus', async () => { await C().del('integrasi/plat/' + b.dataset.r); await C().del('integrasi/links/' + b.dataset.r); toast('Platform dihapus.'); await reload(); })));
      $('#inRf').onclick = () => reload(true);
      const pl = $('#inPl'); if (pl) pl.onclick = platModal; const bu = $('#inBu'); if (bu) bu.onclick = backupModal;
    }
    async function reload(say) { try { const v = await C().get('integrasi'); if (v !== undefined) { data = { links: (v && v.links) || {}, plat: (v && v.plat) || {} }; loaded = true; } } catch (e) { } if (alive) paint(); if (say) toast('Data terbaru dimuat.'); }

    return {
      html: '<div class="wrap wide"><div class="panel fill pad int-root" id="intRoot"><p class="small">Memuat…</p></div></div>',
      mount(app) {
        root = $('#intRoot', app); alive = true; paint();
        stopW = C().watch('integrasi', v => { data = { links: (v && v.links) || {}, plat: (v && v.plat) || {} }; loaded = true; if (alive && !document.querySelector('.modal-back, .modal, [role=dialog]')) paint(); }, 6000);
      },
      unmount() { alive = false; if (stopW) stopW(); if (stopCam) { stopCam(); stopCam = null; } if (stopBar) { try { stopBar(); } catch (e) { } } root = null; }
    };
  };
})();
