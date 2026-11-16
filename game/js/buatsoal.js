/* =========================================================
   BUAT SOAL — guru dan siswa membuat soal; soal yang disetujui tampil sebagai warga
   "Soal Teman: <nama>" di dunia Jelajah semua siswa di ruangan yang sama.
   Data: rooms/{KODE}/custom/{id} = {q, o[4], k, lv, ex, tp, av, b, bn, st:'pending'|'approved', ts}
         rooms/{KODE}/custom/{id}/s/{idPemain} = 1   (penanda soal pernah dijawab benar orang lain)
   Semua teks pengguna di-escape; a^2 -> a², sqrt(25) -> √25.
   Tanpa Firebase: soal disimpan lokal dan langsung disetujui.
   ========================================================= */
(function () {
  'use strict';
  const S = () => window.PPStore, C = () => window.PPCloud, GR = () => !!(window.PPGuru && PPGuru.isGuru());
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LIM = { q: 200, o: 60, ex: 300, tp: 30, perSiswa: 5, perRuang: 50 };
  const B = { list: [], loaded: false }; const listeners = [];
  /* a^2 -> a², sqrt(25) -> √25, 3x4 tetap; dilakukan SETELAH escape */
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  B.fmt = t => esc(t).replace(/sqrt\(([^()]{1,20})\)/gi, '√($1)').replace(/√\((\w+)\)/g, '√$1').replace(/\^(\d)/g, (m, d) => SUP[d]).replace(/\^\((\d+)\)/g, (m, d) => d.split('').map(x => SUP[x]).join('')).replace(/\n/g, '<br>');
  const id = () => window.PPNet ? PPNet.id() : 'lokal';
  const norm = r => ({ id: r.id, q: String(r.q || '').slice(0, LIM.q), o: Array.isArray(r.o) ? r.o.slice(0, 4).map(x => String(x || '').slice(0, LIM.o)) : [], k: r.k | 0, lv: ['Mudah', 'Sedang', 'Sulit'].indexOf(r.lv) >= 0 ? r.lv : 'Sedang', ex: String(r.ex || '').slice(0, LIM.ex), tp: String(r.tp || 'Pythagoras').slice(0, LIM.tp), av: String(r.av || 'boy'), b: String(r.b || ''), bn: String(r.bn || 'Teman').slice(0, 40), st: r.st === 'approved' ? 'approved' : 'pending', ts: +r.ts || 0, solved: r.s ? Object.keys(r.s).length : 0, s: r.s || {} });
  const valid = r => r.q && r.o.length === 4 && r.o.every(Boolean) && r.k >= 0 && r.k < 4;
  B.refresh = async function () {
    const v = await C().get('custom'); if (v === undefined) return;
    B.list = Object.keys(v || {}).map(k => norm(Object.assign({ id: k }, v[k]))).filter(valid).sort((a, b) => a.ts - b.ts); B.loaded = true;
    listeners.forEach(f => { try { f(B.list); } catch (e) { } });
  };
  B.onChange = f => { listeners.push(f); return () => { const i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); }; };
  B.watch = () => C().watch('custom', v => { B.list = Object.keys(v || {}).map(k => norm(Object.assign({ id: k }, v[k]))).filter(valid).sort((a, b) => a.ts - b.ts); B.loaded = true; listeners.forEach(f => { try { f(B.list); } catch (e) { } }); }, 6000);
  B.approved = () => B.list.filter(x => x.st === 'approved');
  /* soal dalam bentuk yang dipakai kuis Jelajah (HTML sudah aman) */
  B.item = key => { const c = B.list.find(x => 'c_' + x.id === key); if (!c) return { lv: 'Sedang', q: 'Soal ini sudah dihapus.', o: ['OK', '-', '-', '-'], a: 0, e: '' }; return { lv: c.lv, q: B.fmt(c.q), o: c.o.map(B.fmt), a: c.k, e: B.fmt(c.ex || 'Terima kasih sudah menjawab soal temanmu!'), hi: 'Soal buatan ' + esc(c.bn) + (c.tp && c.tp !== 'Pythagoras' ? ' · ' + esc(c.tp) : '') }; };
  /* hadiah pembuat: +2 koin tiap soalnya dijawab benar orang lain (batas 20 koin per hari) */
  B.solved = key => { try { const c = B.list.find(x => 'c_' + x.id === key); if (c && c.b !== id()) C().put('custom/' + c.id + '/s/' + id(), 1); } catch (e) { } };
  B.claim = async function () {
    try {
      if (!B.loaded) await B.refresh(); const d = S().data, l = d.lomba = d.lomba || {}; l.claimed = l.claimed || {}; l.cday = l.cday || { d: '', n: 0 };
      const t = new Date().toISOString().slice(0, 10); if (l.cday.d !== t) l.cday = { d: t, n: 0 };
      let add = 0; B.list.filter(x => x.b === id()).forEach(x => { const n = Object.keys(x.s).filter(k => k !== id()).length, got = l.claimed[x.id] | 0; if (n > got) { const coin = Math.min((n - got) * 2, 20 - l.cday.n - add); if (coin > 0) { add += coin; l.claimed[x.id] = got + Math.ceil(coin / 2); } } });
      if (add > 0) { d.explore = d.explore || {}; d.explore.coins = (d.explore.coins | 0) + add; l.cday.n += add; S().save(); PP.ui.toast('Soalmu dijawab teman: +' + add + ' koin!'); }
    } catch (e) { }
  };
  setTimeout(() => { try { B.refresh().then(B.claim); } catch (e) { } }, 2500);

  /* ---------- layar ---------- */
  const AVK = () => Object.keys(PP.AV).slice(0, 12);
  const avImg = k => ((/src="([^"]+)"/.exec(PP.img((PP.AV[k] || PP.AV.boy).idle)) || [])[1]) || '';
  const csv = rows => '﻿' + rows.map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const dl = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
  PP.screens.buatsoal = function () {
    let tab = 'buat', draft = { q: '', o: ['', '', '', ''], k: 0, lv: 'Sedang', ex: '', tp: 'Pythagoras', av: '' }, stop = null, unG = null, editId = null;
    return {
      html: '<div class="wrap narrowish"><div class="panel fill pad bs" id="bsR"></div></div>',
      unmount() { stop && stop(); unG && unG(); },
      mount(root) {
        const box = PP.$('#bsR', root); if (!draft.av) draft.av = S().data.avatar || 'boy';
        const mine = () => B.list.filter(x => x.b === id());
        const quota = () => ({ me: mine().length, all: B.list.length });
        const draw = () => {
          const g = GR(), q = quota(), pend = B.list.filter(x => x.st === 'pending').length;
          box.innerHTML = `<div class="rk-head"><span class="rk-ic"><img class="px" src="assets/lomba/ikon/ikon_buat_soal.png" alt=""></span><div><h2 class="h-title" style="margin:0">Buat Soal</h2><p class="small" style="margin:0">Soalmu jadi warga di dunia Jelajah. Maks ${LIM.perSiswa} soal per siswa.</p></div></div>
            <div class="gr-bar" id="bsGr"></div>
            <div class="ab-tabs"><button class="ab-tab ${tab === 'buat' ? 'on' : ''}" data-t="buat">Buat</button><button class="ab-tab ${tab === 'daftar' ? 'on' : ''}" data-t="daftar">Soal Kelas (${B.list.length})</button><button class="ab-tab ${tab === 'bank' ? 'on' : ''}" data-t="bank">Bank Soal${window.PPBank ? ' (' + PPBank.list.length + ')' : ''}</button>${g ? `<button class="ab-tab ${tab === 'mod' ? 'on' : ''}" data-t="mod">Moderasi${pend ? ' (' + pend + ')' : ''}</button>` : ''}</div>
            <div class="bs-body scrollbox" id="bsB"></div>`;
          unG && unG(); unG = PPGuru.bar(PP.$('#bsGr', box));
          PP.$$('[data-t]', box).forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
          const Bd = PP.$('#bsB', box);
          if (tab === 'buat') form(Bd, q); else if (tab === 'daftar') daftar(Bd); else if (tab === 'bank') { PPBank.panel(Bd, draw); if (!window.__bkOff) window.__bkOff = PPBank.onChange(() => { if (tab === 'bank' && PP.$('#bsB')) PPBank.panel(PP.$('#bsB'), draw); }); } else mod(Bd);
        };
        /* --- formulir --- */
        function form(Bd, q) {
          const d = draft, g = GR(), left = LIM.perSiswa - q.me;
          Bd.innerHTML = `<div class="bs-form"><label>Pertanyaan <small>(${LIM.q} karakter, boleh a^2, sqrt(25))</small><textarea id="bsQ" maxlength="${LIM.q}" rows="3">${esc(d.q)}</textarea></label>
            <div class="bs-opts">${d.o.map((o, i) => `<label class="bs-o"><input type="radio" name="bsK" value="${i}" ${d.k === i ? 'checked' : ''} aria-label="Jawaban benar ${'ABCD'[i]}"><span>${'ABCD'[i]}</span><input class="bs-oi" data-o="${i}" maxlength="${LIM.o}" value="${esc(o)}" placeholder="Pilihan ${'ABCD'[i]}"></label>`).join('')}</div><p class="small" style="margin:0">Pilih bulat di samping jawaban yang benar.</p>
            <div class="bs-r2"><label>Tingkat<select id="bsLv">${['Mudah', 'Sedang', 'Sulit'].map(x => `<option ${d.lv === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label>Topik<input id="bsTp" maxlength="${LIM.tp}" value="${esc(d.tp)}"></label></div>
            <label>Pembahasan <small>(opsional)</small><textarea id="bsEx" maxlength="${LIM.ex}" rows="2">${esc(d.ex)}</textarea></label>
            <div><b class="small">Penampilan warga</b><div class="bs-av">${AVK().map(k => `<button type="button" class="bs-avb ${d.av === k ? 'on' : ''}" data-av="${k}" aria-label="${esc(PP.AV[k].name)}"><img class="px" src="${avImg(k)}" alt=""></button>`).join('')}</div></div>
            <p class="small ab-note" id="bsErr" role="alert" hidden></p>
            <div class="rk-act"><button class="btn sm blue" id="bsPv">Pratinjau</button><button class="btn sm green" id="bsSave" ${left <= 0 && !g ? 'disabled' : ''}>${editId ? 'Simpan Perubahan' : g ? 'Simpan (langsung disetujui)' : 'Kirim Soal'}</button>${editId ? '<button class="btn sm" id="bsCancel">Batal ubah</button>' : ''}</div>
            <p class="small ab-note">${g ? 'Soal guru langsung disetujui.' : 'Soal siswa menunggu persetujuan guru' + (C().online() ? '' : ' (mode lokal: langsung tampil)') + '. Sisa jatah kamu: ' + Math.max(0, left) + '. Soal ruangan: ' + q.all + '/' + LIM.perRuang + '.'}</p></div>`;
          const rd = () => { d.q = PP.$('#bsQ', Bd).value; d.o = PP.$$('.bs-oi', Bd).map(x => x.value); d.k = +(PP.$('input[name=bsK]:checked', Bd) || { value: 0 }).value; d.lv = PP.$('#bsLv', Bd).value; d.tp = PP.$('#bsTp', Bd).value; d.ex = PP.$('#bsEx', Bd).value; };
          PP.$$('[data-av]', Bd).forEach(b => b.onclick = () => { rd(); d.av = b.dataset.av; form(Bd, q); });
          const err = t => { const e = PP.$('#bsErr', Bd); e.textContent = t; e.hidden = !t; e.style.color = '#b3261e'; return !t; };
          const check = () => { rd(); const q2 = d.q.trim(), o = d.o.map(x => x.trim()); if (!q2) return err('Tulis pertanyaannya dulu.'); if (q2.length > LIM.q) return err('Pertanyaan maksimal ' + LIM.q + ' karakter.'); if (o.some(x => !x)) return err('Keempat pilihan harus diisi.'); if (o.some(x => x.length > LIM.o)) return err('Pilihan maksimal ' + LIM.o + ' karakter.'); if (new Set(o.map(x => x.toLowerCase())).size < 4) return err('Pilihan tidak boleh kembar.'); return err(''); };
          PP.$('#bsPv', Bd).onclick = () => { if (!check()) return; PP.ui.modal(`<h3>Pratinjau</h3><p class="xq-hi">Soal buatan ${esc(S().data.name)}</p><h4 class="xq-q">${B.fmt(d.q)}</h4><div class="xq-opts">${d.o.map((o, i) => `<div class="opt ${i === d.k ? 'right' : ''}"><span class="ol">${'ABCD'[i]}</span><span>${B.fmt(o)}</span></div>`).join('')}</div><p class="small">Pembahasan: ${B.fmt(d.ex || '-')}</p><div class="row end"><button class="btn green" data-close>Tutup</button></div>`); };
          const cn = PP.$('#bsCancel', Bd); if (cn) cn.onclick = () => { editId = null; draft = { q: '', o: ['', '', '', ''], k: 0, lv: 'Sedang', ex: '', tp: 'Pythagoras', av: S().data.avatar || 'boy' }; draw(); };
          PP.$('#bsSave', Bd).onclick = async () => {
            if (!check()) return; const g2 = GR(); await B.refresh();
            if (!editId) { if (!g2 && mine().length >= LIM.perSiswa) return err('Jatah soalmu (' + LIM.perSiswa + ') sudah habis.'); if (B.list.length >= LIM.perRuang) return err('Soal ruangan sudah penuh (' + LIM.perRuang + ').'); }
            const rec = { q: d.q.trim(), o: d.o.map(x => x.trim()), k: d.k, lv: d.lv, ex: d.ex.trim(), tp: d.tp.trim() || 'Pythagoras', av: d.av, b: id(), bn: String(PP.nm()).slice(0, 40), st: g2 || !C().online() ? 'approved' : 'pending', ts: Date.now() };
            let ok; if (editId) { const old = B.list.find(x => x.id === editId) || {}; rec.b = old.b || rec.b; rec.bn = old.bn || rec.bn; rec.ts = old.ts || rec.ts; rec.st = g2 ? 'approved' : old.st || rec.st; ok = await C().put('custom/' + editId, rec); }
            else { const nid = C().uid(); ok = await C().put('custom/' + nid, rec); if (ok && window.PPMisi) PPMisi.ev('buat'); }
            if (!ok) return err('Belum tersimpan. Coba lagi.');
            PP.ui.toast(rec.st === 'approved' ? 'Soal tersimpan dan sudah jadi warga di Jelajah!' : 'Soal terkirim. Menunggu persetujuan guru.'); editId = null; draft = { q: '', o: ['', '', '', ''], k: 0, lv: 'Sedang', ex: '', tp: 'Pythagoras', av: S().data.avatar || 'boy' }; await B.refresh(); tab = 'daftar'; draw();
          };
        }
        /* --- daftar & moderasi --- */
        const row = (x, g, modeMod) => `<div class="bs-it st-${x.st}"><img class="px bs-ic" src="assets/lomba/ikon/ikon_status_${x.st === 'approved' ? 'disetujui' : 'menunggu'}.png" alt="${x.st === 'approved' ? 'Disetujui' : 'Menunggu'}"><div class="bs-t"><b>${B.fmt(x.q)}</b><small>${esc(x.lv)} · ${esc(x.tp)} · oleh ${esc(x.bn)} · dijawab benar ${x.solved}×</small></div><div class="bs-ac">${modeMod && x.st === 'pending' ? `<button class="btn sm green" data-ok="${x.id}">Setujui</button>` : ''}${g || x.b === id() ? `<button class="btn sm" data-ed="${x.id}">Ubah</button><button class="btn sm" data-rm="${x.id}" aria-label="Hapus"><img class="px" src="assets/lomba/ikon/ikon_hapus.png" alt="" style="width:18px;height:18px"></button>` : ''}</div></div>`;
        function wireRows(Bd) {
          PP.$$('[data-ok]', Bd).forEach(b => b.onclick = async () => { await C().put('custom/' + b.dataset.ok + '/st', 'approved'); await B.refresh(); draw(); });
          PP.$$('[data-rm]', Bd).forEach(b => b.onclick = () => PP.ui.confirm('Hapus soal ini?', 'Ya, hapus', async () => { await C().del('custom/' + b.dataset.rm); await B.refresh(); draw(); }));
          PP.$$('[data-ed]', Bd).forEach(b => b.onclick = () => { const x = B.list.find(y => y.id === b.dataset.ed); if (!x) return; editId = x.id; draft = { q: x.q, o: x.o.slice(), k: x.k, lv: x.lv, ex: x.ex, tp: x.tp, av: x.av }; tab = 'buat'; draw(); });
        }
        function daftar(Bd) {
          const g = GR(), vis = B.list.filter(x => x.st === 'approved' || g || x.b === id());
          Bd.innerHTML = `${vis.length ? vis.slice().reverse().map(x => row(x, g, false)).join('') : '<p class="small" style="text-align:center">Belum ada soal. Buat yang pertama!</p>'}${g ? `<div class="rk-act"><button class="btn sm" id="bsEx">Ekspor JSON</button><button class="btn sm" id="bsCs">Unduh CSV</button><label class="btn sm" for="bsIm">Impor JSON</label><input id="bsIm" type="file" accept="application/json,.json" hidden><button class="btn sm gold" data-imp="pdf">Impor PDF</button><button class="btn sm gold" data-imp="docx">Impor Word</button><button class="btn sm gold" data-imp="xlsx">Impor Excel</button><button class="btn sm blue" data-imp="paste">Tempel Teks</button><button class="btn sm" id="bsTpl">Unduh Template</button></div>` : ''}`;
          wireRows(Bd); if (!g) return;
          PP.$$('[data-imp]', Bd).forEach(x => x.onclick = () => window.PPBank && PPBank.openImport(x.dataset.imp)); const tp = PP.$('#bsTpl', Bd); if (tp) tp.onclick = () => PPBank.templateMenu();
          PP.$('#bsEx', Bd).onclick = () => { if (window.claude) return PP.ui.toast('Unduhan tidak tersedia di pratinjau.'); dl('soal_buatan.json', JSON.stringify(B.list.map(x => ({ q: x.q, o: x.o, k: x.k, lv: x.lv, ex: x.ex, tp: x.tp, av: x.av, bn: x.bn })), null, 1), 'application/json'); };
          PP.$('#bsCs', Bd).onclick = () => { if (window.claude) return PP.ui.toast('Unduhan tidak tersedia di pratinjau.'); dl('soal_buatan.csv', csv([['No', 'Pertanyaan', 'A', 'B', 'C', 'D', 'Kunci', 'Tingkat', 'Topik', 'Pembuat', 'Status', 'Dijawab benar'], ...B.list.map((x, i) => [i + 1, x.q, x.o[0], x.o[1], x.o[2], x.o[3], 'ABCD'[x.k], x.lv, x.tp, x.bn, x.st === 'approved' ? 'Disetujui' : 'Menunggu', x.solved])]), 'text/csv'); };
          PP.$('#bsIm', Bd).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const arr = JSON.parse(await f.text()); if (!Array.isArray(arr)) throw 0; let n = 0; for (const r of arr.slice(0, LIM.perRuang)) { if (B.list.length + n >= LIM.perRuang) break; const x = norm(Object.assign({ id: 'x' }, r, { b: id(), st: 'approved', ts: Date.now() + n })); if (!valid(x) || new Set(x.o.map(s => s.toLowerCase())).size < 4) continue; await C().put('custom/' + C().uid(), { q: x.q, o: x.o, k: x.k, lv: x.lv, ex: x.ex, tp: x.tp, av: x.av, b: x.b, bn: x.bn, st: 'approved', ts: x.ts }); n++; } PP.ui.toast(n + ' soal diimpor.'); await B.refresh(); draw(); } catch (x) { PP.ui.toast('Berkas JSON tidak valid.'); } };
        }
        function mod(Bd) { const p = B.list.filter(x => x.st === 'pending'); Bd.innerHTML = p.length ? p.map(x => row(x, true, true)).join('') : '<p class="small" style="text-align:center">Tidak ada soal yang menunggu persetujuan.</p>'; wireRows(Bd); }
        stop = B.watch(); const off = B.onChange(() => { const a = document.activeElement; if (tab !== 'buat' || !(a && /TEXTAREA|INPUT|SELECT/.test(a.tagName))) draw(); }); const s0 = stop; stop = () => { s0(); off(); };
        const og = PPGuru.onChange(() => draw()); const s1 = stop; stop = () => { s1(); og(); }; B.refresh().then(draw); draw();
      }
    };
  };
  window.PPBuat = B;
})();
