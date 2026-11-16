/* =========================================================
   PWA — pendaftaran Service Worker, tombol Pasang Aplikasi, dan layar "Mode Offline" (#offline).
   Layar ini mengunduh semua aset (gambar, suara, video; musik opsional) ke cache agar game
   bisa dimainkan tanpa internet. Daftar aset dibaca dari pp-assets.json (dibuat saat build).
   Data siswa tetap di localStorage; fitur online (Firebase) otomatis memakai mode lokal saat offline.
   ========================================================= */
(function () {
  'use strict';
  window.PP = window.PP || {}; PP.screens = PP.screens || {};
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MB = n => (n / 1048576).toFixed(1) + ' MB';
  let deferred = null, reg = null, listeners = [];
  const ok = 'serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; listeners.forEach(f => f()); });
  window.addEventListener('appinstalled', () => { deferred = null; listeners.forEach(f => f()); });
  if (ok) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').then(r => { reg = r; r.addEventListener('updatefound', () => { const n = r.installing; if (n) n.addEventListener('statechange', () => { if (n.state === 'installed' && navigator.serviceWorker.controller) { try { PP.ui.toast('Versi baru siap. Muat ulang untuk memperbarui.'); } catch (e) { } } }); }); }).catch(() => { }); });
  }
  const send = m => navigator.serviceWorker.ready.then(r => { (r.active || navigator.serviceWorker.controller).postMessage(m); });
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  PP.PWA = { supported: ok, send };

  PP.screens.offline = function () {
    let root = null, info = null, onMsg = null, onL = null;
    const paint = (st) => {
      if (!root) return;
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      root.querySelector('#pwStat').innerHTML = `Koneksi: <b>${navigator.onLine ? 'online' : 'offline'}</b> · Service Worker: <b>${ok ? (navigator.serviceWorker.controller ? 'aktif' : 'belum aktif (muat ulang sekali)') : 'tidak didukung di sini (butuh https / localhost)'}</b> · Tersimpan: <b>${st ? st.n + ' berkas' : '–'}</b> · ${standalone() ? 'Berjalan sebagai aplikasi' : 'Berjalan di peramban'}`;
      const ib = root.querySelector('#pwInst'); ib.style.display = standalone() ? 'none' : ''; ib.disabled = !deferred && !ios;
      root.querySelector('#pwIos').style.display = ios && !standalone() ? '' : 'none';
    };
    const stat = () => ok && send({ type: 'STATUS' });
    return {
      html: `<div class="wrap"><div class="panel fill pad" id="pwRoot"><h2>Mode Offline (PWA)</h2>
        <p class="small">Pasang game seperti aplikasi dan unduh semua isinya agar bisa dimainkan tanpa internet. Fitur online (peringkat, absen, LKPD bersama) akan tersimpan di perangkat dan tidak tersinkron sampai kamu online lagi.</p>
        <p class="small" id="pwStat">Memeriksa…</p>
        <div class="row"><button class="btn green" id="pwInst">📲 Pasang aplikasi</button><button class="btn blue" id="pwAll">⬇ Unduh semua untuk offline</button><button class="btn red" id="pwClr">Hapus data offline</button></div>
        <label class="small"><input type="checkbox" id="pwBgm"> Sertakan musik latar (± 19 MB)</label>
        <div class="bar" style="height:14px;border-radius:8px;background:#0002;overflow:hidden;margin:8px 0"><div id="pwBar" style="height:100%;width:0;background:#3aa05a;transition:width .2s"></div></div><p class="small" id="pwMsg"></p>
        <p class="small muted" id="pwIos" style="display:none">iPhone/iPad: ketuk tombol Bagikan lalu <b>Tambahkan ke Layar Utama</b>.</p></div></div>`,
      mount(app) {
        root = app.querySelector('#pwRoot'); const msg = t => { const m = root.querySelector('#pwMsg'); if (m) m.textContent = t; };
        onL = () => paint(info); listeners.push(onL); paint(null); stat();
        if (ok) { onMsg = e => { const d = e.data || {}; if (!root) return; if (d.type === 'STATUS') { info = d; paint(d); } if (d.type === 'PROGRESS') { root.querySelector('#pwBar').style.width = Math.round(d.done / d.total * 100) + '%'; msg(`Mengunduh… ${d.done}/${d.total}${d.fail ? ' (gagal ' + d.fail + ')' : ''}`); } if (d.type === 'DONE') { msg(d.fail ? `Selesai dengan ${d.fail} berkas gagal. Coba lagi saat koneksi baik.` : 'Selesai! Game siap dimainkan offline.'); stat(); } if (d.type === 'CLEARED') { msg('Data offline dihapus.'); root.querySelector('#pwBar').style.width = '0'; stat(); } }; navigator.serviceWorker.addEventListener('message', onMsg); }
        root.querySelector('#pwInst').onclick = async () => { if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (e) { } deferred = null; paint(info); } else msg('Gunakan menu peramban: "Instal aplikasi" / "Tambahkan ke layar utama".'); };
        root.querySelector('#pwAll').onclick = async () => {
          if (!ok) return msg('Peramban/alamat ini tidak mendukung mode offline. Buka lewat https atau localhost.');
          msg('Membaca daftar berkas…'); try { const j = await (await fetch('pp-assets.json', { cache: 'no-store' })).json(); let list = j.core.concat(j.assets.map(a => a[0])); if (root.querySelector('#pwBgm').checked) list = list.concat(j.bgm.map(a => a[0])); const tot = j.assets.reduce((s, a) => s + a[1], 0) + (root.querySelector('#pwBgm').checked ? j.bgm.reduce((s, a) => s + a[1], 0) : 0); msg(`Mengunduh ${list.length} berkas (${MB(tot)})…`); send({ type: 'CACHE_ALL', urls: list.map(u => encodeURI(u)) }); } catch (e) { msg('Gagal membaca daftar berkas. Periksa koneksi.'); }
        };
        root.querySelector('#pwClr').onclick = () => ok && send({ type: 'CLEAR' });
      },
      unmount() { if (onMsg) navigator.serviceWorker.removeEventListener('message', onMsg); listeners = listeners.filter(f => f !== onL); root = null; }
    };
  };
})();
