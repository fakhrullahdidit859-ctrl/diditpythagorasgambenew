/* =========================================================
   Antarmuka IMPOR SOAL (PDF / Word / Excel / CSV / teks) + panel BANK SOAL.
   Alur 3 langkah: Baca -> Periksa (tabel bisa diedit) -> Simpan ke Bank Soal.
   Hanya guru (PIN) yang dapat membuka, menyimpan, dan membatalkan batch.
   Seluruh teks dari berkas di-escape (esc) saat dimasukkan ke HTML.
   ========================================================= */
(function () {
  'use strict';
  const B = window.PPBank, esc = B.esc, C = () => window.PPCloud;
  const ICON = (n, c) => window.FX ? FX.icon(n, c) : '';
  const dl = (name, blob) => { if (window.claude) { PP.ui.toast('Unduhan tidak tersedia di pratinjau. Pakai "Salin" atau buka lewat hosting.'); return false; } const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); return true; };
  const TY = { pg: 'Pilihan ganda', is: 'Isian singkat', bs: 'Benar-salah' };
  const ACCEPT = { pdf: '.pdf', docx: '.docx', xlsx: '.xlsx,.xls,.csv', paste: '' };
  const TITLE = { pdf: 'Impor Soal dari PDF', docx: 'Impor Soal dari Word', xlsx: 'Impor Soal dari Excel / CSV', paste: 'Impor Soal dari Teks' };
  /* Esc menutup dialog; Tab berputar di dalam dialog (focus trap) */
  if (!window.__ppEsc) {
    window.__ppEsc = 1;
    document.addEventListener('keydown', e => {
      const m = document.getElementById('modal'); if (!m || m.hidden) return;
      if (e.key === 'Escape') { PP.ui.close(); return; }
      if (e.key === 'Tab') { const f = Array.from(m.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(x => !x.disabled && x.offsetParent !== null); if (!f.length) return; const a0 = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a0) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a0.focus(); } }
    });
  }

  B.templateMenu = function () {
    PP.ui.modal(`<h3 style="margin:0 0 6px">Unduh Template</h3><p class="small">Isi templat, lalu impor lagi. Format sama dengan yang dikenali pembaca berkas.</p>
      <div class="bk-tpl"><button class="btn sm green" data-k="xlsx">${ICON('file-excel')} Excel (.xlsx)</button><button class="btn sm blue" data-k="docx">${ICON('file-word')} Word (.docx)</button><button class="btn sm" data-k="csv">${ICON('file-excel')} CSV</button><button class="btn sm gold" data-k="copy">Salin contoh teks</button></div><div class="row end"><button class="btn sm" data-close>Tutup</button></div>`);
    PP.$$('.bk-tpl [data-k]').forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (k === 'copy') { try { navigator.clipboard.writeText(B.TEMPLATE_TEXT); PP.ui.toast('Contoh disalin.'); } catch (e) { PP.ui.toast('Tidak bisa menyalin.'); } return; }
      const blob = k === 'xlsx' ? B.templateXlsx() : k === 'docx' ? B.templateDocx() : B.templateCsv(); dl('template_soal.' + k, blob);
    });
  };

  B.openImport = function (kind) {
    PPGuru.require(() => run(kind));
  };

  function run(kind) {
    let step = 1, items = [], fileName = '', src = kind === 'xlsx' ? 'xlsx' : kind, scanDoc = null, busy = false, result = null;
    const done = new Set(B.list.map(x => x.h));
    PP.ui.modal('<div class="fx-root bk-imp" id="bkI" data-view="import" data-state="idle"></div>', { cls: 'bk-wide' });
    const box = document.getElementById('bkI');
    const steps = () => `<ol class="fx-steps" aria-label="Langkah impor"><li class="${step > 1 ? 'is-done' : 'is-active'}"><span class="n">1</span>Baca</li><li class="${step > 2 ? 'is-done' : step === 2 ? 'is-active' : ''}"><span class="n">2</span>Periksa</li><li class="${step === 3 ? 'is-active' : ''}"><span class="n">3</span>Simpan</li></ol>`;
    /* hitung status baris */
    const status = it => { const e = B.errors(B.norm(Object.assign({}, it, { kEmpty: it.kEmpty }))); if (it.kEmpty && it.t === 'pg' && !e.length) e.push('Kunci kosong'); return e; };
    const stat = (it, seen) => { const e = status(it); if (e.length) return { c: 'is-error', t: e.join('; '), i: 'error' }; const h = B.hash(B.norm(it)); if (done.has(h) || seen[h]) return { c: 'is-dup', t: 'Duplikat (sudah ada)', i: 'warning', dup: true }; seen[h] = 1; return { c: '', t: 'Siap', i: 'check' }; };
    const analyze = () => { const seen = {}; items.forEach(it => { const s = stat(it, seen); it._s = s; }); };
    function draw() {
      if (step === 1) s1(); else if (step === 2) s2(); else s3();
      box.dataset.step = step; const hd = box.querySelector('h2'); if (hd) hd.setAttribute('tabindex', '-1');
    }
    /* ---------- langkah 1: baca ---------- */
    function s1() {
      box.innerHTML = `<h2 class="h-title" id="bkT" style="margin:0 0 6px">${TITLE[kind]}</h2>${steps()}
        <div class="bk-st1">
          ${kind === 'paste' ? '' : `<div class="dropzone" id="bkDz" tabindex="0" role="button" aria-label="Pilih berkas" aria-describedby="bkH"><svg class="dz-border" aria-hidden="true"><rect/></svg><input type="file" id="bkF" accept="${ACCEPT[kind]}" hidden><span class="icon-badge lg">${ICON(kind === 'pdf' ? 'file-pdf' : kind === 'docx' ? 'file-word' : 'file-excel')}</span><div class="dz-title">Tarik berkas ke sini atau ketuk untuk memilih</div><div class="dz-help" id="bkH">Maks ${B.LIM.file / 1048576} MB. Format: ${kind === 'xlsx' ? '.xlsx / .csv' : '.' + kind}</div></div>`}
          <details class="bk-paste" ${kind === 'paste' ? 'open' : ''}><summary>Atau tempel teks soal</summary><textarea id="bkP" rows="${kind === 'paste' ? 9 : 5}" placeholder="1. Pertanyaan…&#10;A. …&#10;B. …&#10;Kunci: A" aria-label="Teks soal"></textarea><button class="btn sm blue" id="bkRead">Baca teks</button></details>
          <progress id="bkPr" class="fx-progress" max="100" value="0" hidden aria-label="Progres membaca"></progress>
          <p class="small" id="bkSt" role="status" aria-live="polite"></p><div id="bkOcr"></div>
          <div class="row end"><button class="btn sm" id="bkTpl">Unduh Template</button><button class="btn sm" data-close>Tutup</button></div></div>`;
      const st = box.querySelector('#bkSt'), pr = box.querySelector('#bkPr'), say = (t, bad) => { st.textContent = t; st.style.color = bad ? '#b3261e' : ''; st.setAttribute('role', bad ? 'alert' : 'status'); };
      box.querySelector('#bkTpl').onclick = () => B.templateMenu();
      const finishRead = r => {
        if (r.scan) { scanDoc = r.doc; say('PDF ini tampak berupa gambar hasil scan (hampir tidak ada teks). Teks tidak bisa dibaca langsung.', true); box.querySelector('#bkOcr').innerHTML = `<div class="bk-warn" role="alert">${ICON('warning')}<span>Pembacaan otomatis (OCR) bisa dicoba, tetapi lambat (butuh internet, ±5–15 dtk per halaman) dan hasilnya perlu diperiksa teliti.</span><button class="btn sm gold" id="bkDoOcr">Coba OCR</button></div>`; box.querySelector('#bkDoOcr').onclick = ocr; box.dataset.state = 'error'; return; }
        if (!r.items.length) { say('Tidak ada soal yang dikenali. Cek format (lihat template) atau tempel teks manual.', true); box.dataset.state = 'error'; return; }
        items = r.items.slice(0, B.LIM.batch).map(it => Object.assign({ use: true }, it, auto(it))); if (r.items.length > B.LIM.batch) PP.ui.toast('Hanya ' + B.LIM.batch + ' soal pertama yang dibaca.');
        analyze(); items.forEach(it => { if (it._s.dup || it._s.c === 'is-error') it.use = false; }); step = 2; box.dataset.state = 'success'; draw();
      };
      const readFile = async f => {
        if (busy) return; busy = true; fileName = f.name; box.dataset.state = 'loading'; pr.hidden = false; pr.removeAttribute('value'); say('Membaca ' + f.name + '…');
        try { const r = await B.readFile(f, (p, n) => { pr.max = n; pr.value = p; say('Membaca halaman ' + p + ' / ' + n + '…'); }); src = r.kind; finishRead(r); } catch (e) { say(e.message || 'Gagal membaca berkas.', true); box.dataset.state = 'error'; }
        busy = false; pr.hidden = true;
      };
      async function ocr() {
        if (busy || !scanDoc) return; busy = true; const b = box.querySelector('#bkDoOcr'); b.disabled = true; b.setAttribute('aria-busy', 'true'); pr.hidden = false; pr.value = 0;
        try { const t = await B.ocrPdf(scanDoc, (p, n) => { pr.max = n; pr.value = p; say('OCR halaman ' + p + ' / ' + n + '…'); }); src = 'ocr'; const its = B.parseText(t); busy = false; pr.hidden = true; finishRead({ items: its, kind: 'ocr' }); }
        catch (e) { busy = false; pr.hidden = true; b.disabled = false; say(e.message || 'OCR gagal.', true); }
      }
      const dz = box.querySelector('#bkDz');
      if (dz) {
        const inp = box.querySelector('#bkF');
        dz.onclick = () => inp.click(); dz.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } };
        dz.ondragover = e => { e.preventDefault(); dz.classList.add('is-over'); }; dz.ondragleave = () => dz.classList.remove('is-over');
        dz.ondrop = e => { e.preventDefault(); dz.classList.remove('is-over'); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); };
        inp.onchange = () => { if (inp.files[0]) readFile(inp.files[0]); inp.value = ''; };
      }
      box.querySelector('#bkRead').onclick = () => { const t = box.querySelector('#bkP').value; if (t.trim().length < 10) return say('Tempel teks soal dulu.', true); fileName = 'Teks tempel'; src = 'teks'; finishRead({ items: B.parseText(t), kind: 'teks' }); };
    }
    /* bangun otomatis dari teks soal */
    function auto(it) { const d = window.PPGen && PPGen.detect(it.q); return d ? { fg: d.t, fp: d.p, fgAuto: true } : { fg: '', fp: null }; }
    /* ---------- langkah 2: periksa ---------- */
    const opts = it => it.t === 'bs' ? '<span class="small">Benar / Salah</span>' : it.t === 'is' ? `<input class="bk-i" data-f="ans" value="${esc(it.o[0] || '')}" aria-label="Jawaban isian" placeholder="Jawaban">` : [0, 1, 2, 3, 4].map(i => `<label class="bk-op"><span>${'ABCDE'[i]}</span><input class="bk-i" data-f="o${i}" value="${esc(it.o[i] || '')}" aria-label="Opsi ${'ABCDE'[i]}"></label>`).join('');
    const keySel = it => it.t === 'bs' ? `<select class="bk-i" data-f="k" aria-label="Kunci"><option value="0" ${it.k === 0 ? 'selected' : ''}>Benar</option><option value="1" ${it.k === 1 ? 'selected' : ''}>Salah</option></select>` : it.t === 'is' ? '<span class="small">—</span>' : `<select class="bk-i" data-f="k" aria-label="Kunci"><option value="-1" ${it.kEmpty ? 'selected' : ''}>(kosong)</option>${[0, 1, 2, 3, 4].filter(i => it.o[i]).map(i => `<option value="${i}" ${!it.kEmpty && it.k === i ? 'selected' : ''}>${'ABCDE'[i]}</option>`).join('')}</select>`;
    const row = (it, i) => `<tr data-i="${i}" class="${it._s.c}"><td><input type="checkbox" data-f="use" ${it.use ? 'checked' : ''} aria-label="Pakai soal ${i + 1}" ${it._s.c === 'is-error' ? '' : ''}></td><td>${esc(it.no)}</td>
      <td><select class="bk-i" data-f="t" aria-label="Tipe">${Object.keys(TY).map(k => `<option value="${k}" ${it.t === k ? 'selected' : ''}>${TY[k]}</option>`).join('')}</select></td>
      <td><textarea class="bk-i bk-q" data-f="q" rows="2" aria-label="Pertanyaan">${esc(it.q)}</textarea></td><td class="bk-opts">${opts(it)}</td><td>${keySel(it)}</td>
      <td><input class="bk-i" data-f="tp" value="${esc(it.tp)}" maxlength="${B.LIM.tp}" aria-label="Topik"></td>
      <td><select class="bk-i" data-f="lv" aria-label="Tingkat">${['Mudah', 'Sedang', 'Sulit'].map(l => `<option ${(it.lv || 'Sedang') === l ? 'selected' : ''}>${l}</option>`).join('')}</select></td>
      <td><select class="bk-i" data-f="fg" aria-label="Bangun datar"><option value="">Tanpa gambar</option>${(window.PPGen ? PPGen.SHAPES : []).map(s => `<option value="${s[0]}" ${it.fg === s[0] ? 'selected' : ''}>${s[1]}${it.fgAuto && it.fg === s[0] ? ' (otomatis)' : ''}</option>`).join('')}</select>${it.fg && !it.fp ? '<small class="bk-bad">Angka tidak terbaca</small>' : ''}</td>
      <td class="bk-stat">${ICON(it._s.i)}<span>${esc(it._s.t)}</span></td><td><button class="btn sm red" data-del="${i}" aria-label="Hapus soal ${i + 1}">${ICON('trash')}</button></td></tr>`;
    function summary() { const use = items.filter(x => x.use && x._s.c === ''), bad = items.filter(x => x._s.c === 'is-error').length, dup = items.filter(x => x._s.dup).length; const el = box.querySelector('#bkSum'); if (el) el.innerHTML = `<b>${items.length}</b> soal dibaca · <b>${use.length}</b> siap disimpan · <span class="${bad ? 'bk-bad' : ''}">${bad} bermasalah</span> · ${dup} duplikat`; const sv = box.querySelector('#bkSave'); if (sv) { sv.disabled = !use.length; sv.querySelector('span').textContent = 'Simpan ke Bank Soal (' + use.length + ')'; sv.setAttribute('aria-disabled', String(!use.length)); } }
    function s2() {
      box.innerHTML = `<h2 class="h-title" style="margin:0 0 6px">Periksa Soal</h2>${steps()}
        <p class="small" style="margin:6px 0" id="bkSum" role="status" aria-live="polite"></p>
        <p class="small ab-note" style="margin:0 0 6px">Sumber: <b>${esc(fileName)}</b>. Edit langsung di tabel. Baris merah harus diperbaiki atau dihapus; duplikat otomatis tidak dicentang. Soal lama tidak berubah.</p>
        <div class="bk-tw"><table class="fx-table bk-tab"><thead><tr><th>Pakai</th><th>No</th><th>Tipe</th><th>Soal</th><th>Opsi / jawaban</th><th>Kunci</th><th>Topik</th><th>Tingkat</th><th>Gambar</th><th>Status</th><th></th></tr></thead><tbody id="bkTb">${items.map(row).join('')}</tbody></table></div>
        <div class="row between" style="margin-top:8px"><button class="btn sm" id="bkBack">◀ Ganti berkas</button><button class="btn green" id="bkSave"><span>Simpan</span></button></div><p class="small" id="bkErr" role="alert" style="color:#b3261e;margin:4px 0 0"></p>`;
      summary();
      box.querySelector('#bkBack').onclick = () => { step = 1; draw(); };
      const tb = box.querySelector('#bkTb');
      const rowOf = el => { const tr = el.closest('tr'); return tr ? +tr.dataset.i : -1; };
      const rerow = i => { const tr = tb.querySelector('tr[data-i="' + i + '"]'), tmp = document.createElement('tbody'); tmp.innerHTML = row(items[i], i); tr.replaceWith(tmp.firstElementChild); };
      const refresh = () => { analyze(); items.forEach((it, i) => { const tr = tb.querySelector('tr[data-i="' + i + '"]'); if (!tr) return; tr.className = it._s.c; const sc = tr.querySelector('.bk-stat'); sc.innerHTML = ICON(it._s.i) + '<span>' + esc(it._s.t) + '</span>'; }); summary(); };
      tb.oninput = tb.onchange = e => {
        const el = e.target, f = el.dataset.f, i = rowOf(el); if (i < 0 || !f) return; const it = items[i];
        if (f === 'use') it.use = el.checked;
        else if (f === 'q') { it.q = el.value; if (it.fgAuto || !it.fg) { const d = window.PPGen && PPGen.detect(it.q); if (d) { it.fg = d.t; it.fp = d.p; it.fgAuto = true; } } }
        else if (f === 'tp') it.tp = el.value; else if (f === 'lv') it.lv = el.value;
        else if (f === 'ans') it.o = [el.value];
        else if (/^o\d$/.test(f)) { const n = +f[1]; it.o[n] = el.value; if (e.type === 'change') { it.o = it.o.map(x => x || ''); rerow(i); } }
        else if (f === 'k') { const v = +el.value; if (v < 0) it.kEmpty = true; else { it.kEmpty = false; it.k = v; } }
        else if (f === 't') { it.t = el.value; if (it.t === 'bs') { it.o = ['Benar', 'Salah']; it.k = it.k > 1 ? 0 : it.k; it.kEmpty = false; } if (it.t === 'is') it.o = [it.o[it.k] || it.o[0] || '']; rerow(i); }
        else if (f === 'fg') { it.fg = el.value; it.fgAuto = false; it.fp = it.fg && window.PPGen ? PPGen.params(it.fg, it.q) : null; rerow(i); }
        if (f === 'use' || f === 'k') { /* tidak perlu ganti baris */ }
        refresh();
      };
      tb.onclick = e => { const b = e.target.closest('[data-del]'); if (!b) return; items.splice(+b.dataset.del, 1); analyze(); s2(); };
      /* baris bermasalah bergetar sekali (sudah ada animasi CSS .is-error) */
      box.querySelector('#bkSave').onclick = async () => {
        if (busy) return; const use = items.filter(x => x.use && x._s.c === ''); const er = box.querySelector('#bkErr'); er.textContent = '';
        if (!use.length) { er.textContent = 'Belum ada soal yang siap disimpan.'; return; }
        const sv = box.querySelector('#bkSave'); busy = true; sv.disabled = true; sv.setAttribute('aria-busy', 'true'); box.dataset.state = 'loading';
        try { result = await B.saveBatch(use, { src, name: fileName, by: PPGuru.name() }); step = 3; box.dataset.state = 'success'; draw(); }
        catch (e) { er.textContent = e.message || 'Gagal menyimpan.'; box.dataset.state = 'error'; sv.disabled = false; sv.removeAttribute('aria-busy'); }
        busy = false;
      };
    }
    /* ---------- langkah 3: hasil ---------- */
    function s3() {
      box.innerHTML = `<h2 class="h-title" style="margin:0 0 6px">Selesai</h2>${steps()}<div class="fx-empty" data-state="success"><span class="icon-badge lg">${ICON('sparkle')}</span>
        <p><b id="bkN" style="font-size:2rem">0</b> soal ditambahkan</p><p class="small">Soal langsung tersedia di Kuis (mode latihan), Game, dan Jelajah Dunia. Pilih "Soal Unggahan Guru" di layar persiapan Jelajah.</p></div>
        <div class="row center"><button class="btn sm red" id="bkUndo">Batalkan batch ini</button><button class="btn sm blue" id="bkMore">Impor lagi</button><button class="btn sm green" data-close>Selesai</button></div>`;
      if (window.FX) { FX.countUp(box.querySelector('#bkN'), result.count, 900); FX.confetti(); FX.sfx.play('ok'); } else box.querySelector('#bkN').textContent = result.count;
      box.querySelector('#bkMore').onclick = () => { step = 1; items = []; draw(); };
      box.querySelector('#bkUndo').onclick = () => PP.ui.confirm('Hapus ' + result.count + ' soal dari batch ini? Soal lain tidak terpengaruh.', 'Ya, batalkan', async () => { const n = await B.undoBatch(result.batch); PP.ui.toast(n + ' soal dibatalkan.'); });
    }
    draw();
  }

  /* =====================================================
     PANEL BANK SOAL (di layar Buat Soal, khusus guru)
     ===================================================== */
  B.panel = function (Bd, redraw) {
    const g = !!(window.PPGuru && PPGuru.isGuru());
    const mcN = B.list.filter(x => B.toMC(x)).length;
    Bd.innerHTML = `<div class="bk-panel fx-root" data-view="bank"><div class="bk-sum"><b>${B.list.length}</b> soal di bank · <b>${mcN}</b> bisa dipakai Kuis/Game/Jelajah · ${B.batches.length} batch</div>
      <h4 style="margin:8px 0 4px">Batch impor</h4>${B.batches.length ? B.batches.map(b => `<div class="bs-it"><div class="bs-t"><b>${esc(b.n)}</b><small>${esc(B.SRCNAME[b.src] || b.src)} · ${b.c} soal · ${new Date(b.ts).toLocaleDateString('id-ID')} · ${esc(b.by)}</small></div><div class="bs-ac">${g ? `<button class="btn sm red" data-ub="${esc(b.id)}">Batalkan batch ini</button>` : ''}</div></div>`).join('') : '<div class="fx-empty"><span class="icon-badge lg">' + ICON('soal-unggahan') + '</span><p>Belum ada soal unggahan.</p><small>Impor dari PDF, Word, atau Excel lewat tab Soal Kelas.</small></div>'}
      ${B.list.length ? `<h4 style="margin:10px 0 4px">Daftar soal (${B.list.length})</h4>${B.list.slice().reverse().slice(0, 80).map(x => `<div class="bs-it"><div class="bs-t"><b>${PPBuat.fmt(x.q)}</b><small>${esc(TY[x.t])} · ${esc(x.lv)} · ${esc(x.tp)}${B.toMC(x) ? '' : ' · tidak dipakai di mode pilihan ganda'}</small></div><div class="bs-ac">${g ? `<button class="btn sm" data-rm="${esc(x.id)}" aria-label="Hapus soal">${ICON('trash')}</button>` : ''}</div></div>`).join('')}${B.list.length > 80 ? '<p class="small">Menampilkan 80 soal terbaru.</p>' : ''}` : ''}</div>`;
    PP.$$('[data-ub]', Bd).forEach(b => b.onclick = () => PP.ui.confirm('Hapus semua soal dari batch ini? Soal lain tidak terpengaruh.', 'Ya, batalkan', async () => { const n = await B.undoBatch(b.dataset.ub); PP.ui.toast(n + ' soal dibatalkan.'); redraw(); }));
    PP.$$('[data-rm]', Bd).forEach(b => b.onclick = () => PP.ui.confirm('Hapus soal ini dari bank?', 'Ya, hapus', async () => { await B.remove(b.dataset.rm); redraw(); }));
  };
})();
