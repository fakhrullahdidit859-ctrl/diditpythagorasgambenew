/* Ikon SVG bergaya seragam (lencana warna + gambar putih). Dipakai di dock, tujuan, HUD. */
(function () {
  const G = {
    home: '<path d="M4 12 L12 4 L20 12 M6 11 V20 H18 V11 M10 20 V14 H14 V20"/>',
    map: '<path d="M3 6 L9 4 L15 6 L21 4 V18 L15 20 L9 18 L3 20 Z M9 4 V18 M15 6 V20"/>',
    book: '<path d="M12 6 C9 4 6 4 3 5 V19 C6 18 9 18 12 20 C15 18 18 18 21 19 V5 C18 4 15 4 12 6 Z M12 6 V20"/>',
    game: '<path d="M7 8 H17 C20 8 21 12 21 15 C21 17.5 19 18 18 17 L16 15 H8 L6 17 C5 18 3 17.5 3 15 C3 12 4 8 7 8 Z M8 10.5 V13.5 M6.5 12 H9.5"/><circle cx="15" cy="11" r=".6"/><circle cx="17.2" cy="13" r=".6"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.2 9.3 C9.2 6.6 14.8 6.6 14.8 9.6 C14.8 11.8 12 11.8 12 14.2 M12 17.2 V17.3"/>',
    explore: '<circle cx="12" cy="12" r="9"/><path d="M15.8 8.2 L13.6 13.6 L8.2 15.8 L10.4 10.4 Z"/>',
    trophy: '<path d="M8 4 H16 V10 C16 13 14 14 12 14 C10 14 8 13 8 10 Z M8 6 H5 C5 9 6 10 8 10 M16 6 H19 C19 9 18 10 16 10 M12 14 V18 M8 20 H16"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7 V12 L15.5 14"/>',
    sides: '<path d="M5 19 V5 L19 19 Z M5 14.5 H9.5 V19"/>',
    puzzle: '<path d="M5 5 H10 C10 2.5 14 2.5 14 5 H19 V10 C21.5 10 21.5 14 19 14 V19 H14 C14 16.5 10 16.5 10 19 H5 Z"/>',
    calc: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 7 H15 M9 11.5 H9.1 M12 11.5 H12.1 M15 11.5 H15.1 M9 15 H9.1 M12 15 H12.1 M15 15 H15.1 M9 18 H9.1 M12 18 H15"/>',
    shapes: '<path d="M4 4 H12 V12 H4 Z"/><circle cx="16.5" cy="16.5" r="4"/>',
    bulb: '<path d="M9 18 H15 M10 21 H14 M12 3 C8 3 6 6 6 9 C6 11 7.5 12.5 8.5 14 C9 15 9 16 9 17 H15 C15 16 15 15 15.5 14 C16.5 12.5 18 11 18 9 C18 6 16 3 12 3 Z"/>',
    pause: '<path d="M8.5 5 V19 M15.5 5 V19" stroke-width="3.4"/>',
    task: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4 V2.5 H15 V4 M8.5 10 H15.5 M8.5 14 H15.5 M8.5 17.5 H12.5"/>',
    star: '<path d="M12 3 L14.6 9 L21 9.6 L16.2 13.9 L17.6 20.3 L12 17 L6.4 20.3 L7.8 13.9 L3 9.6 L9.4 9 Z"/>',
    chat: '<path d="M4 5 H20 V16 H11 L6 20 V16 H4 Z"/>',
    path: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8 18 H13 C16 18 16 12 12 12 C8 12 8 6 11 6 H16"/>'
  };
  const COL = { home: 'o', map: 'g', book: 'r', game: 'p', quiz: 'b', explore: 't', trophy: 'y', clock: 'p', sides: 'g', puzzle: 'o', calc: 'b', shapes: 't', bulb: 'y', pause: 'b', task: 'o', star: 'y', chat: 'g', path: 'p' };
  window.PP = window.PP || {};
  PP.ico = (n, extra) => `<span class="ico c-${COL[n] || 'o'} ${extra || ''}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${G[n] || G.star}</svg></span>`;
})();
