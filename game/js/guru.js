/* =========================================================
   PPGuru — akun guru berbasis PIN (4–6 angka) per ruangan.
   PIN disimpan sebagai hash (SHA-256 + kode ruangan) di rooms/{KODE}/meta/pin.
   Pembuatan pertama = membuat akun guru. Masuk = PIN cocok.
   CATATAN: pembatasan ini dijaga oleh aplikasi (klien). Untuk penguncian penuh di
   server, aktifkan Firebase Authentication (lihat PETUNJUK_FIREBASE.md).
   ========================================================= */
(function () {
  'use strict';
  const SK = 'pp_guru_on';
  const G = { listeners: [] };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  async function hash(pin) {
    const s = 'pp|' + PPCloud.room() + '|' + pin;
    try { if (window.crypto && crypto.subtle) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''); } } catch (e) { }
    let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return 'f' + h.toString(16);   // cadangan bila tak ada crypto
  }
  const emit = () => G.listeners.forEach(f => { try { f(G.isGuru()); } catch (e) { } });
  G.onChange = f => { G.listeners.push(f); return () => { G.listeners = G.listeners.filter(x => x !== f); }; };
  G.isGuru = () => { try { return sessionStorage.getItem(SK) === PPCloud.room(); } catch (e) { return false; } };
  G.name = () => { try { return localStorage.getItem('pp_guru_name') || 'Guru'; } catch (e) { return 'Guru'; } };
  G.logout = () => { try { sessionStorage.removeItem(SK); } catch (e) { } emit(); };
  const on = nama => { try { sessionStorage.setItem(SK, PPCloud.room()); if (nama) localStorage.setItem('pp_guru_name', nama); } catch (e) { } emit(); };
  const digits = v => /^\d{4,6}$/.test(v);
  /* tampilkan kotak masuk/buat akun; done(true) bila berhasil */
  G.login = async function (done) {
    if (G.isGuru()) return done && done(true);
    const meta = await PPCloud.get('meta/pin');
    if (meta === undefined) { PP.ui.toast('Tidak bisa menghubungi server. Coba lagi.'); return done && done(false); }
    const exists = !!(meta && meta.h);
    const ruang = PPCloud.room();
    PP.ui.modal(`<h3>${exists ? 'Masuk sebagai Guru' : 'Buat Akun Guru'}</h3>
      <p class="modal-text small">${exists ? 'Masukkan PIN guru untuk ruangan <b>' + esc(ruang) + '</b>.' : 'Belum ada akun guru di ruangan <b>' + esc(ruang) + '</b>. Buat PIN 4–6 angka. Hanya guru yang memegang PIN ini yang bisa mengubah absen dan melihat rekap nilai.'}</p>
      ${exists ? '' : '<input id="gNama" class="ab-inp" maxlength="40" placeholder="Nama guru (opsional)" autocomplete="off">'}
      <input id="gPin" class="ab-inp" type="password" inputmode="numeric" maxlength="6" placeholder="PIN 4–6 angka" autocomplete="off" aria-label="PIN guru">
      ${exists ? '' : '<input id="gPin2" class="ab-inp" type="password" inputmode="numeric" maxlength="6" placeholder="Ulangi PIN" autocomplete="off" aria-label="Ulangi PIN">'}
      <p class="err small" id="gErr" role="alert" hidden></p>
      <div class="row end"><button class="btn" data-close>Batal</button><button class="btn green" id="gOk">${exists ? 'Masuk' : 'Buat Akun'}</button></div>`);
    const err = t => { const e = PP.$('#gErr'); e.textContent = t; e.hidden = !t; };
    PP.$('#gPin').focus();
    PP.$('#gOk').onclick = async () => {
      const pin = PP.$('#gPin').value.trim();
      if (!digits(pin)) return err('PIN harus 4–6 angka.');
      if (exists) {
        if ((await hash(pin)) !== meta.h) return err('PIN salah.');
        on(meta.n); PP.ui.close(); PP.ui.toast('Masuk sebagai guru.'); done && done(true);
      } else {
        if (pin !== PP.$('#gPin2').value.trim()) return err('Kedua PIN tidak sama.');
        const nama = PP.$('#gNama').value.trim().slice(0, 40) || 'Guru';
        const again = await PPCloud.get('meta/pin');          // jaga-jaga: orang lain baru saja membuatnya
        if (again && again.h) { PP.ui.close(); PP.ui.toast('Akun guru sudah dibuat orang lain. Masuk dengan PIN.'); return G.login(done); }
        const ok = await PPCloud.put('meta/pin', { h: await hash(pin), n: nama, t: Date.now() });
        if (!ok) return err('Gagal menyimpan. Periksa koneksi lalu coba lagi.');
        on(nama); PP.ui.close(); PP.ui.toast('Akun guru dibuat. Simpan PIN-mu!'); done && done(true);
      }
    };
    PP.$('#gPin').addEventListener('keydown', e => { if (e.key === 'Enter') PP.$('#gOk').click(); });
  };
  G.require = cb => G.isGuru() ? cb() : G.login(ok => { if (ok) cb(); });
  /* tombol status kecil yang dipasang di layar fitur guru */
  G.bar = function (host) {
    if (!host) return () => { };
    const draw = () => { host.innerHTML = G.isGuru() ? `<span class="gr-pill on">Mode Guru: ${esc(G.name())}</span><button class="btn sm" data-gr="out">Keluar</button>` : `<span class="gr-pill">Mode Siswa (hanya baca)</span><button class="btn sm blue" data-gr="in">Masuk Guru</button>`; };
    host.onclick = e => { const b = e.target.closest('[data-gr]'); if (!b) return; if (b.dataset.gr === 'in') G.login(); else G.logout(); };
    draw(); return G.onChange(draw);
  };
  /* ganti PIN: verifikasi PIN lama, simpan hash PIN baru (langsung berlaku untuk masuk berikutnya) */
  G.changePin = async function (oldPin, newPin) {
    if (!digits(String(newPin))) return 'PIN baru harus 4–6 angka.';
    const meta = await PPCloud.get('meta/pin');
    if (meta === undefined) return 'Tidak bisa menghubungi server.';
    if (meta && meta.h && (await hash(String(oldPin))) !== meta.h) return 'PIN lama salah.';
    const ok = await PPCloud.put('meta/pin', { h: await hash(String(newPin)), n: (meta && meta.n) || G.name(), t: Date.now() });
    return ok ? '' : 'Gagal menyimpan. Coba lagi.';
  };
  window.PPGuru = G;
})();
