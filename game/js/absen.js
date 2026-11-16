/* Absen Kehadiran: (1) absen manual ONLINE per kelas SMP (hanya guru yang mengubah, siswa membaca), (2) tautan ke absen milik guru.
   Data online: rooms/{KODE}/absen/roster/{kelas}/{id} = {n, o}; rooms/{KODE}/absen/rec/{tanggal}/{kelas}/{id} = 'H'|'I'|'S'|'A'.
   Cadangan lokal: localStorage 'pp_absen_v1'. */
(function () {
  'use strict';
  const KEY = 'pp_absen_v1', ST = { H: 'Hadir', I: 'Izin', S: 'Sakit', A: 'Alpa' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  let D = { tab: 'manual', link: '', kelas: '', siswa: [], rekam: {} };
  const KELAS = []; [7, 8, 9].forEach(g => 'ABCDEFGHIJ'.split('').forEach(r => KELAS.push(g + r)));
  const kelasLabel = k => k ? 'Kelas ' + k.slice(0, 1) + ' ' + k.slice(1) : 'Pilih kelas';
  try { Object.assign(D, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { PP.ui.toast('Penyimpanan penuh atau diblokir.'); } };
  const uid = () => 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const okUrl = u => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch (e) { return false; } };
  D.kelas = String(D.kelas || '').replace(/\s+/g, '').toUpperCase(); if (KELAS.indexOf(D.kelas) < 0) D.kelas = '';
  const A = window.PPAbsen = {
    KELAS, kelasLabel,
    data: () => D,
    summary(date) { const r = D.rekam[date || today()] || {}, c = { H: 0, I: 0, S: 0, A: 0, kosong: 0 }; D.siswa.forEach(s => { const v = r[s.id]; if (v && c[v] !== undefined) c[v]++; else c.kosong++; }); c.total = D.siswa.length; return c; },
    takenToday: () => { const s = A.summary(); return s.total > 0 && s.kosong === 0; }
  };

  const C = () => window.PPCloud, GR = () => !!(window.PPGuru && PPGuru.isGuru());
  const pRos = k => 'absen/roster/' + k, pRec = (d, k) => 'absen/rec/' + d + '/' + k;
  const rosterArr = o => Object.keys(o || {}).filter(id => o[id] && typeof o[id].n === 'string').map(id => ({ id, nama: o[id].n, o: +o[id].o || 0 })).sort((a, b) => a.o - b.o || a.nama.localeCompare(b.nama));
  /* ambil seluruh data kelas dari server (untuk CSV / rekap tanggal) */
  A.loadAll = async function (k) { const t = await C().get('absen/rec'); const out = {}; if (t) Object.keys(t).forEach(d => { if (t[d] && t[d][k]) out[d] = t[d][k]; }); return out; };

  PP.screens.absen = function () {
    let date = today(), stops = [], unG = null, unC = null, editing = false;
    return {
      html: '<div class="wrap narrowish"><div class="panel fill pad ab" id="abRoot"></div></div>',
      unmount() { stops.forEach(f => { try { f(); } catch (e) { } }); stops = []; unG && unG(); unC && unC(); },
      mount(root) {
        const box = PP.$('#abRoot', root);
        const draw = () => {
          const mode = D.tab;
          box.innerHTML = `<div class="ab-head"><span class="ab-ic">${PP.ICONS.absen}</span><div><h2 class="h-title" style="margin:0">Absen Kehadiran</h2><p class="small" style="margin:0">Jenjang SMP · data online, bisa dibaca semua teman.</p></div></div>
            <div class="gr-bar" id="abGr"></div>
            <div class="ab-tabs" role="tablist"><button role="tab" class="ab-tab ${mode === 'manual' ? 'on' : ''}" data-tab="manual" aria-selected="${mode === 'manual'}">Absen Manual</button><button role="tab" class="ab-tab ${mode === 'link' ? 'on' : ''}" data-tab="link" aria-selected="${mode === 'link'}">Absen Saya (Tautan)</button></div>
            <div class="ab-body">${mode === 'manual' ? manual() : linkTab()}</div>`;
          unG && unG(); unG = PPGuru.bar(PP.$('#abGr', box));
          wire(); if (mode === 'manual') startWatch();
        };
        const kelasSel = () => `<label class="ab-f">Kelas SMP <select id="abKelas" aria-label="Pilih kelas SMP"><option value="">— pilih kelas —</option>${[7, 8, 9].map(g => `<optgroup label="Kelas ${g}">${KELAS.filter(k => k[0] == g).map(k => `<option value="${k}" ${k === D.kelas ? 'selected' : ''}>${kelasLabel(k)}</option>`).join('')}</optgroup>`).join('')}</select></label>`;
        const manual = () => `<div class="ab-bar"><label class="ab-f">Tanggal <input type="date" id="abDate" value="${date}"></label>${kelasSel()}<span id="abTools" class="ab-tools"></span></div>
            <div class="ab-sum" id="abSum"></div>
            <div class="ab-list scrollbox" id="abList"></div>
            <div id="abAddBox"></div>
            <p class="small ab-note" id="abMode"></p>
            <div class="row end"><button class="btn sm" id="abCsv">Unduh CSV</button><button class="btn sm" id="abHist">Rekap Tanggal</button></div>`;
        const me = () => String(PP.nm ? PP.nm() : '').trim().toLowerCase();
        const drawList = () => {
          const L = PP.$('#abList', box); if (!L) return; const guru = GR();
          const r = D.rekam[date] || {}, sm = A.summary(date), m = me();
          const S = PP.$('#abSum', box); if (S) S.innerHTML = `<span class="pill ok">Hadir ${sm.H}</span><span class="pill">Izin ${sm.I}</span><span class="pill">Sakit ${sm.S}</span><span class="pill no">Alpa ${sm.A}</span><span class="pill">Belum ${sm.kosong}</span>`;
          if (!D.kelas) { L.innerHTML = '<p class="small" style="text-align:center">Pilih kelas SMP dulu untuk melihat daftar hadir.</p>'; }
          else L.innerHTML = D.siswa.length ? D.siswa.map((s, i) => `<div class="ab-row ${m && s.nama.trim().toLowerCase() === m ? 'me' : ''}" data-id="${s.id}"><span class="ab-n">${i + 1}</span><span class="ab-name" ${guru ? `title="Ketuk untuk mengubah nama" data-edit="${s.id}"` : ''}>${esc(s.nama)}${m && s.nama.trim().toLowerCase() === m ? ' <em class="ab-you">kamu</em>' : ''}</span>
              ${guru ? `<span class="ab-st">${Object.keys(ST).map(k => `<button class="ab-b ab-${k} ${r[s.id] === k ? 'on' : ''}" data-set="${k}" aria-label="${ST[k]}" aria-pressed="${r[s.id] === k}">${k}</button>`).join('')}</span><button class="ab-x" data-del="${s.id}" aria-label="Hapus ${esc(s.nama)}">×</button>`
              : `<span class="ab-ro ab-${r[s.id] || 'N'}">${r[s.id] ? ST[r[s.id]] : 'Belum'}</span>`}</div>`).join('') : `<p class="small" style="text-align:center">${guru ? 'Belum ada siswa. Tambahkan nama di bawah.' : 'Guru belum mengisi daftar siswa kelas ini.'}</p>`;
          L.classList.toggle('ro', !guru);
        };
        const drawTools = () => {
          const t = PP.$('#abTools', box), a = PP.$('#abAddBox', box), md = PP.$('#abMode', box); if (!t) return; const guru = GR();
          t.innerHTML = guru && D.kelas ? '<button class="btn sm green" id="abAllH">Semua Hadir</button><button class="btn sm" id="abImp">Impor dari pemain</button>' : '';
          a.innerHTML = guru && D.kelas ? '<form class="ab-add" id="abAdd"><input id="abName" maxlength="40" placeholder="Nama siswa (boleh banyak, pisahkan baris/koma)" aria-label="Nama siswa"><button class="btn sm blue" type="submit">Tambah</button></form>' : '';
          md.textContent = (C().online() ? 'Terhubung ke server ruangan ' + C().room() + '. ' : 'Mode lokal: Firebase belum diisi, data hanya ada di perangkat ini. ') + (guru ? 'Kamu bisa mengubah absen.' : 'Mode siswa: hanya guru yang bisa mengubah absen.');
        };
        const startWatch = () => {
          stops.forEach(f => { try { f(); } catch (e) { } }); stops = []; drawList(); drawTools();
          if (!D.kelas) return; const k = D.kelas, d = date;
          stops.push(C().watch(pRos(k), v => { if (D.kelas !== k) return; D.siswa = rosterArr(v); save(); if (!editing) drawList(); }, 4000));
          stops.push(C().watch(pRec(d, k), v => { if (D.kelas !== k || date !== d) return; D.rekam[d] = v && typeof v === 'object' ? v : {}; save(); if (!editing) drawList(); }, 3000));
        };
        const linkTab = () => `<p class="small" style="margin:0">Sudah punya absen sendiri (Google Form, Spreadsheet, dll)? Tempel tautannya, simpan, lalu buka kapan saja dengan satu tombol.</p>
          <label class="ab-f col">Tautan absen saya<input id="abLink" type="url" inputmode="url" placeholder="https://..." value="${esc(D.link)}"></label>
          <div class="row"><button class="btn green" id="abSaveLink">Simpan Tautan</button>${D.link ? '<button class="btn" id="abDelLink">Hapus</button>' : ''}</div>
          <div class="row center">${D.link ? `<a class="btn gold xl" id="abOpen" href="${esc(D.link)}" target="_blank" rel="noopener noreferrer">Buka Absen Saya</a>` : '<button class="btn gold xl" disabled>Buka Absen Saya</button>'}</div>
          ${D.link ? '<div class="row center"><button class="btn sm blue" id="abEmbed">Tampilkan di sini</button></div><div id="abFrame"></div>' : ''}
          <p class="small ab-note">Tautan tersimpan di perangkat ini. Sebagian situs (termasuk Google Form) tidak mau ditampilkan di dalam game; jika kosong, gunakan tombol Buka Absen Saya.</p>`;
        const guruOnly = f => (...a) => { if (!GR()) return PPGuru.login(ok => ok && f(...a)); f(...a); };
        const dl = (name, text) => { const blob = new Blob(['﻿' + text], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
        const wire = () => {
          PP.$$('[data-tab]', box).forEach(b => b.onclick = () => { D.tab = b.dataset.tab; save(); stops.forEach(f => f()); stops = []; draw(); });
          const g = id => PP.$(id, box);
          if (D.tab === 'manual') {
            g('#abDate').onchange = e => { date = e.target.value || today(); startWatch(); };
            g('#abKelas').onchange = e => { D.kelas = e.target.value; D.siswa = []; D.rekam = {}; save(); startWatch(); };
            box.onclick = e => {
              const t = e.target.closest('button, [data-edit]'); if (!t || !box.contains(t)) return;
              if (t.dataset.set) { const id = t.closest('.ab-row').dataset.id; if (!GR()) return; const r = D.rekam[date] = D.rekam[date] || {}, v = r[id] === t.dataset.set ? null : t.dataset.set; if (v) r[id] = v; else delete r[id]; save(); drawList(); C().put(pRec(date, D.kelas) + '/' + id, v).then(ok => { if (!ok) PP.ui.toast('Belum tersimpan di server. Coba lagi.'); }); }
              else if (t.id === 'abAllH') { if (!D.siswa.length) return PP.ui.toast('Tambahkan siswa dulu.'); const r = D.rekam[date] = {}; D.siswa.forEach(s => { r[s.id] = 'H'; }); save(); drawList(); C().put(pRec(date, D.kelas), r); }
              else if (t.dataset.del) { const s = D.siswa.find(x => x.id === t.dataset.del); if (!s || !GR()) return; PP.ui.confirm('Hapus ' + esc(s.nama) + ' dari daftar kelas? Catatan kehadirannya ikut dihapus.', 'Ya, hapus', async () => { D.siswa = D.siswa.filter(x => x.id !== s.id); Object.keys(D.rekam).forEach(d => { if (D.rekam[d]) delete D.rekam[d][s.id]; }); save(); drawList(); await C().del(pRos(D.kelas) + '/' + s.id); const all = await A.loadAll(D.kelas); Object.keys(all).forEach(d => { if (all[d][s.id]) C().del(pRec(d, D.kelas) + '/' + s.id); }); }); }
              else if (t.dataset.edit) { const s = D.siswa.find(x => x.id === t.dataset.edit); if (!s || !GR()) return; editing = true; PP.ui.modal(`<h3>Ubah nama</h3><input id="abEd" class="ab-inp" maxlength="40" value="${esc(s.nama)}"><div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="abEdOk">Simpan</button></div>`); PP.$('#abEd').focus(); const fin = () => { editing = false; drawList(); }; PP.$('#abEdOk').onclick = async () => { const v = PP.$('#abEd').value.trim().slice(0, 40); if (v) { s.nama = v; save(); await C().patch(pRos(D.kelas) + '/' + s.id, { n: v }); } PP.ui.close(); fin(); }; setTimeout(() => { const m = PP.$('#modal'); if (m) m.addEventListener('click', () => setTimeout(() => { editing = false; }, 50), { once: true }); }, 0); }
              else if (t.id === 'abImp') { if (!GR()) return; (async () => { let rows; try { rows = await PPNet.board(); } catch (e) { return PP.ui.toast('Daftar pemain belum bisa diambil (butuh server online).'); } const have = new Set(D.siswa.map(s => s.nama.trim().toLowerCase())); const add = rows.filter(p => String(p.kelas || '').replace(/\s+/g, '').toUpperCase() === D.kelas && !have.has(String(p.name).trim().toLowerCase())); if (!add.length) return PP.ui.toast('Tidak ada pemain baru dengan kelas ' + D.kelas + '.'); const o = Date.now(); const obj = {}; add.forEach((p, i) => { const id = uid(); obj[id] = { n: String(p.name).slice(0, 40), o: o + i }; D.siswa.push({ id, nama: obj[id].n, o: o + i }); }); save(); drawList(); await C().patch(pRos(D.kelas), obj); PP.ui.toast(add.length + ' siswa diimpor.'); })(); }
              else if (t.id === 'abCsv') { if (!D.kelas) return PP.ui.toast('Pilih kelas dulu.'); A.loadAll(D.kelas).then(all => { const dates = Object.keys(all).sort(), q = v => '"' + String(v).replace(/"/g, '""') + '"'; const head = ['No', 'Nama'].concat(dates, ['Hadir', 'Izin', 'Sakit', 'Alpa']); const rows = D.siswa.map((s, i) => { const v = dates.map(d => all[d][s.id] || ''); return [i + 1, s.nama].concat(v, ['H', 'I', 'S', 'A'].map(c => v.filter(x => x === c).length)).map(q).join(','); }); dl('absen_' + D.kelas + '.csv', head.map(q).join(',') + '\n' + rows.join('\n')); }); }
              else if (t.id === 'abHist') { if (!D.kelas) return PP.ui.toast('Pilih kelas dulu.'); A.loadAll(D.kelas).then(all => { const ds = Object.keys(all).sort().reverse(); PP.ui.modal(`<h3>Rekap per tanggal · ${esc(kelasLabel(D.kelas))}</h3><div class="scrollbox" style="max-height:50vh">${ds.length ? ds.map(d => { const c = { H: 0, I: 0, S: 0, A: 0 }; Object.values(all[d]).forEach(v => { if (c[v] !== undefined) c[v]++; }); return `<button class="btn sm ab-hd" data-d="${d}">${d} · H${c.H} I${c.I} S${c.S} A${c.A}</button>`; }).join('') : '<p>Belum ada rekap.</p>'}</div><div class="row end"><button class="btn" data-close>Tutup</button></div>`); PP.$$('.ab-hd').forEach(b => b.onclick = () => { date = b.dataset.d; PP.ui.close(); draw(); }); }); }
            };
            box.onsubmit = e => { if (e.target.id !== 'abAdd') return; e.preventDefault(); if (!GR()) return; const names = g('#abName').value.split(/[\n,;]+/).map(x => x.trim().slice(0, 40)).filter(Boolean); if (!names.length) return; if (D.siswa.length + names.length > 60) return PP.ui.toast('Satu kelas maksimal 60 siswa.'); const o = Date.now(), obj = {}; names.forEach((n, i) => { const id = uid(); obj[id] = { n, o: o + i }; D.siswa.push({ id, nama: n, o: o + i }); }); save(); drawList(); g('#abName').value = ''; C().patch(pRos(D.kelas), obj).then(ok => { if (!ok) PP.ui.toast('Belum tersimpan di server.'); }); };
          } else {
            g('#abSaveLink').onclick = () => { const v = g('#abLink').value.trim(); if (!okUrl(v)) return PP.ui.toast('Tautan harus diawali https://'); D.link = v; save(); PP.ui.toast('Tautan disimpan.'); draw(); };
            if (g('#abDelLink')) g('#abDelLink').onclick = () => PP.ui.confirm('Hapus tautan absen tersimpan?', 'Ya, hapus', () => { D.link = ''; save(); draw(); });
            if (g('#abEmbed')) g('#abEmbed').onclick = () => { const f = document.createElement('iframe'); f.className = 'ab-frame'; f.src = D.link; f.title = 'Absen saya'; f.referrerPolicy = 'no-referrer'; f.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin allow-popups'); g('#abFrame').replaceChildren(f); };
          }
        };
        unC = PPGuru.onChange(() => { if (D.tab === 'manual') { drawList(); drawTools(); } });
        draw();
        try { window.PPPend && PPPend.absenBar(root); } catch (e) { }
      }
    };
  };
})();
