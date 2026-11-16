/* =========================================================
   REKAP NILAI — tabel semua kategori nilai (siswa + kehadiran), urut, cetak,
   unduh CSV / Excel (.xlsx asli) / Word (.doc) / PDF (lewat cetak).
   Tab "Kelas" hanya untuk guru. Tab "Data Saya" untuk siapa saja.
   ========================================================= */
(function () {
  'use strict';
  const IN_VIEWER = !!window.claude;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const xe = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

  /* ---------- penulis berkas ---------- */
  const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = crcT[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {                                  // ZIP tanpa kompresi (cukup untuk .xlsx)
    const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
    const u16 = v => [v & 255, (v >> 8) & 255], u32 = v => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
    files.forEach(f => {
      const nm = enc.encode(f.name), d = enc.encode(f.data), crc = crc32(d);
      const h = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(nm.length), ...u16(0)]);
      parts.push(h, nm, d);
      cen.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(d.length), ...u32(d.length), ...u16(nm.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nm);
      off += h.length + nm.length + d.length;
    });
    const cl = cen.reduce((a, b) => a + b.length, 0);
    const end = new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cl), ...u32(off), 0, 0]);
    return new Blob([...parts, ...cen, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  const col = i => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
  function sheetXml(rows, widths) {
    const body = rows.map((r, ri) => `<row r="${ri + 1}"${ri === 0 ? ' ht="32" customHeight="1"' : ''}>${r.map((v, ci) => { const ref = col(ci) + (ri + 1); if (v === '' || v == null) return `<c r="${ref}"${ri === 0 ? ' s="1"' : ''}/>`; if (typeof v === 'number' && ri > 0) return `<c r="${ref}" s="2"><v>${v}</v></c>`; return `<c r="${ref}" t="inlineStr" s="${ri === 0 ? 1 : 3}"><is><t xml:space="preserve">${xe(v)}</t></is></c>`; }).join('')}</row>`).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane xSplit="2" ySplit="1" topLeftCell="C2" activePane="bottomRight" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${body}</sheetData></worksheet>`;
  }
  function xlsx(sheets) {                                // sheets: [{name, rows}]
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF8B5A2B"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFBBA77A"/></left><right style="thin"><color rgb="FFBBA77A"/></right><top style="thin"><color rgb="FFBBA77A"/></top><bottom style="thin"><color rgb="FFBBA77A"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/></cellXfs></styleSheet>`;
    const files = [
      { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>` },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xe(s.name).slice(0, 31)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
      { name: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
      { name: 'xl/styles.xml', data: styles }
    ];
    sheets.forEach((s, i) => files.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s.rows, s.rows[0].map((h, ci) => ci === 0 ? 26 : Math.max(9, Math.min(22, String(h).length + 3)))) }));
    return zip(files);
  }
  const save = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); };
  const csvText = rows => '﻿' + rows.map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const tsv = rows => rows.map(r => r.map(v => String(v == null ? '' : v).replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n');
  const tableHtml = (rows, id) => `<table${id ? ' id="' + id + '"' : ''} class="rk-tbl"><thead><tr>${rows[0].map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r => `<tr>${r.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const tgl = () => new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const docHtml = (title, sub, rows) => `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:29.7cm 21cm;mso-page-orientation:landscape;margin:1.2cm}body{font-family:Arial,sans-serif}h2{margin:0}table{border-collapse:collapse}th,td{border:1px solid #555;padding:3px 5px;font-size:8pt}th{background:#8b5a2b;color:#fff}</style></head><body><h2>${esc(title)}</h2><p>${esc(sub)}</p>${tableHtml(rows)}</body></html>`;
  function printRows(title, sub, rows) {                 // PDF: lewat dialog cetak (Simpan sebagai PDF)
    const d = document.createElement('div'); d.className = 'rk-printroot';
    d.innerHTML = `<h2>${esc(title)}</h2><p>${esc(sub)}</p>${tableHtml(rows)}<p class="small">Dicetak dari Petualangan Pythagoras · Made by Didit Fakhrullah</p>`;
    document.body.appendChild(d); document.body.classList.add('rk-printing');
    const done = () => { document.body.classList.remove('rk-printing'); d.remove(); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done); setTimeout(() => { try { window.print(); } catch (e) { PP.ui.toast('Cetak tidak tersedia di sini.'); done(); } setTimeout(done, 60000); }, 120);
  }

  PP.screens.rekap = function () {
    let tab = 'kelas', rows = [], ab = {}, kf = '', sortK = 'k', sortD = 1, q = '', loading = false, unG = null, stop = null;
    const COL = PPRapor.HEAD;
    return {
      html: `<div class="wrap"><div class="panel fill pad rk"><div class="rk-head"><span class="rk-ic"><img src="assets/lomba/ikon/ikon_rapor.png" alt="" class="px"></span><div><h2 class="h-title" style="margin:0">Rekap Nilai</h2><p class="small" style="margin:0">Semua kategori nilai dalam game, siap dicetak atau diunduh.</p></div></div>
        <div class="gr-bar" id="rkGr"></div>
        <div class="ab-tabs"><button class="ab-tab on" data-rk="kelas">Rekap Kelas (Guru)</button><button class="ab-tab" data-rk="saya">Data Saya</button></div>
        <div class="rk-body" id="rkBody"></div></div></div>`,
      unmount() { unG && unG(); },
      mount(root) {
        const body = PP.$('#rkBody', root);
        unG = PPGuru.bar(PP.$('#rkGr', root));
        const myRow = () => Object.assign({ id: PPNet.id() }, PPRapor.mine());
        const view = () => {
          let src = tab === 'saya' ? [myRow()] : rows.slice();
          if (tab === 'kelas') { if (kf) src = src.filter(r => r.k === kf); if (q) src = src.filter(r => r.n.toLowerCase().includes(q)); }
          const sk = sortK, f = r => { const c = PPRapor.cell(r, sk); return typeof c === 'number' ? c : String(c).toLowerCase(); };
          src.sort((a, b) => { const x = f(a), y = f(b); return (x < y ? -1 : x > y ? 1 : a.n.localeCompare(b.n)) * sortD; });
          return src;
        };
        const mkRows = src => [['No'].concat(COL.map(c => c[1]))].concat(src.map((r, i) => [i + 1].concat(COL.map(c => PPRapor.cell(r, c[0])))));
        const title = () => 'Rekap Nilai Petualangan Pythagoras' + (tab === 'kelas' && kf ? ' · Kelas ' + kf.slice(0, 1) + ' ' + kf.slice(1) : '');
        const sub = () => 'SMP · ruangan ' + PPCloud.room() + ' · ' + tgl();
        const absRows = () => {                          // lembar kedua: matriks kehadiran
          const rec = ab.rec || {}, ros = ab.roster || {}, dates = Object.keys(rec).sort(), out = [['Kelas', 'Nama'].concat(dates, ['Hadir', 'Izin', 'Sakit', 'Alpa'])];
          Object.keys(ros).sort().filter(k => !kf || k === kf).forEach(k => Object.keys(ros[k]).map(id => ({ id, n: ros[k][id].n, o: ros[k][id].o || 0 })).sort((a, b) => a.o - b.o).forEach(s => { const v = dates.map(d => (rec[d] && rec[d][k] && rec[d][k][s.id]) || ''); out.push([k.slice(0, 1) + ' ' + k.slice(1), s.n].concat(v, ['H', 'I', 'S', 'A'].map(c => v.filter(x => x === c).length))); }));
          return out;
        };
        const draw = () => {
          PP.$$('[data-rk]', root).forEach(b => b.classList.toggle('on', b.dataset.rk === tab));
          if (tab === 'kelas' && !PPGuru.isGuru()) { body.innerHTML = `<div class="rk-lock"><img class="px" src="assets/lomba/ikon/ikon_pin_guru.png" alt=""><h3>Khusus Guru</h3><p class="small">Rekap seluruh kelas memuat data semua siswa, jadi hanya bisa dibuka dengan akun guru.</p><button class="btn green" data-rkin>Masuk Guru</button></div>`; PP.$('[data-rkin]', body).onclick = () => PPGuru.login(ok => ok && load()); return; }
          const src = view(), tbl = mkRows(src);
          body.innerHTML = `${tab === 'kelas' ? `<div class="ab-bar"><label class="ab-f">Kelas<select id="rkK"><option value="">Semua kelas</option>${PPAbsen.KELAS.map(k => `<option value="${k}" ${k === kf ? 'selected' : ''}>${PPAbsen.kelasLabel(k)}</option>`).join('')}</select></label><label class="ab-f">Cari nama<input id="rkQ" value="${esc(q)}" placeholder="nama siswa"></label><button class="btn sm" id="rkRef">${loading ? 'Memuat…' : 'Muat ulang'}</button></div>` : '<p class="small" style="margin:0">Ini data milikmu di perangkat ini. Kirim ke guru atau cetak untuk laporan.</p>'}
            <div class="rk-sum small">${src.length} siswa${tab === 'kelas' && !PPCloud.online() ? ' · mode lokal (Firebase belum diisi: hanya data di perangkat ini)' : ''}</div>
            <div class="rk-scroll"><table class="rk-tbl" id="rkT"><thead><tr><th>No</th>${COL.map(c => `<th data-s="${c[0]}" class="${c[0] === sortK ? 'on' : ''}" title="Urutkan">${esc(c[1])}${c[0] === sortK ? (sortD > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}</tr></thead><tbody>${tbl.slice(1).map(r => `<tr>${r.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${COL.length + 1}" class="small">Belum ada data siswa di ruangan ini.</td></tr>`}</tbody></table></div>
            <div class="rk-act no-print"><button class="btn sm green" data-x="xlsx">Excel (.xlsx)</button><button class="btn sm blue" data-x="doc">Word (.doc)</button><button class="btn sm gold" data-x="pdf">PDF / Cetak</button><button class="btn sm" data-x="csv">CSV</button><button class="btn sm" data-x="copy">Salin tabel</button></div>
            ${IN_VIEWER ? '<p class="small ab-note">Pratinjau di dalam artefak tidak bisa mengunduh berkas; gunakan Salin tabel lalu tempel ke Excel/Docs. Unduhan bekerja di versi yang dibuka langsung.</p>' : ''}`;
          const k = PP.$('#rkK', body); if (k) k.onchange = e => { kf = e.target.value; draw(); };
          const qq = PP.$('#rkQ', body); if (qq) qq.oninput = e => { q = e.target.value.trim().toLowerCase(); const p = e.target.selectionStart; draw(); const n = PP.$('#rkQ', body); n.focus(); try { n.setSelectionRange(p, p); } catch (x) { } };
          const rf = PP.$('#rkRef', body); if (rf) rf.onclick = load;
          PP.$$('th[data-s]', body).forEach(th => th.onclick = () => { if (sortK === th.dataset.s) sortD = -sortD; else { sortK = th.dataset.s; sortD = 1; } draw(); });
          PP.$$('[data-x]', body).forEach(b => b.onclick = () => exp(b.dataset.x, tbl));
        };
        const exp = (kind, tbl) => {
          const base = 'rekap_nilai_' + (tab === 'kelas' ? (kf || 'semua') : 'saya') + '_' + new Date().toISOString().slice(0, 10);
          if (!tbl.length || tbl.length < 2) return PP.ui.toast('Belum ada data untuk diekspor.');
          try {
            if (kind === 'copy') { const t = tsv(tbl); const fb = () => PP.ui.modal(`<h3>Salin tabel</h3><p class="modal-text small">Pilih semua, salin, lalu tempel ke Excel atau Google Sheets.</p><textarea class="csvbox" readonly rows="10">${esc(t)}</textarea><div class="row end"><button class="btn" data-close>Tutup</button></div>`); if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(() => PP.ui.toast('Tabel disalin. Tempel di Excel/Sheets.'), fb); else fb(); }
            else if (IN_VIEWER && kind !== 'pdf') return PP.ui.toast('Unduhan tidak tersedia di pratinjau. Pakai Salin tabel.');
            else if (kind === 'csv') save(new Blob([csvText(tbl)], { type: 'text/csv;charset=utf-8' }), base + '.csv');
            else if (kind === 'xlsx') { const sh = [{ name: 'Nilai', rows: tbl }]; if (tab === 'kelas') { const a = absRows(); if (a.length > 1) sh.push({ name: 'Absensi', rows: a }); } save(xlsx(sh), base + '.xlsx'); }
            else if (kind === 'doc') save(new Blob(['﻿' + docHtml(title(), sub(), tbl)], { type: 'application/msword' }), base + '.doc');
            else if (kind === 'pdf') printRows(title(), sub(), tbl);
          } catch (e) { console.error(e); PP.ui.toast('Ekspor gagal: ' + (e.message || e)); }
        };
        const load = async () => {
          if (tab !== 'kelas' || !PPGuru.isGuru()) return draw(); loading = true; draw();
          try { const r = await PPRapor.all(); rows = r.rows; ab = r.ab; } catch (e) { PP.ui.toast('Data belum bisa diambil. Periksa koneksi.'); }
          loading = false; draw();
        };
        PP.$$('[data-rk]', root).forEach(b => b.onclick = () => { tab = b.dataset.rk; tab === 'kelas' ? load() : draw(); });
        const off = PPGuru.onChange(() => load()); const prev = unG; unG = () => { prev && prev(); off(); };
        PPRapor.push(true); load();
      }
    };
  };
})();
