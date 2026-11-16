# Membuat frame jalan (kaki bergerak) dari sprite diam, TANPA membelah gambar:
# badan atas tetap utuh; hanya bagian kaki di bawah pinggul yang digeser/dipendekkan, dengan rampa halus (tanpa sambungan).
import numpy as np, os, sys, math
from PIL import Image
NAMES = ['boy_0','boy_5','boy_6','girl_0','girl_3','hijab_0','hijab_1','teacher_0','teacher_1','teacher_2','teacher_3']
N = 8
def analyze(a):
    H, W = a.shape
    ys = np.where(a.any(1))[0]; bottom = ys.max(); top = ys.min()
    lo, hi = int(W*0.28), int(W*0.72)
    def gap(r):
        row = a[r]; xs = np.where(row)[0]
        if len(xs) == 0: return None
        l, rr = xs.min(), xs.max()
        cols = [c for c in range(max(lo, l+2), min(hi, rr-1)) if not row[c]]
        # celah harus diapit piksel terisi di kiri dan kanan
        cols = [c for c in cols if row[l:c].any() and row[c:rr+1].any()]
        return cols
    r = bottom; miss = 0; hip = bottom; centers = []
    while r > top + (bottom-top)*0.35:
        g = gap(r)
        if g: centers.append(np.mean(g)); hip = r; miss = 0
        else:
            miss += 1
            if miss > 2: break
        r -= 1
    cx = float(np.median(centers)) if centers else W/2
    return bottom, hip, cx
def frame(im, bottom, hip, cx, k, amp=1.0):
    a = np.array(im); H, W = a.shape[:2]
    ph = 2*math.pi*k/N
    out = np.zeros_like(a)
    legH = bottom - hip + 1
    bob = int(round(abs(math.sin(ph)) * 2 * amp))      # badan naik sedikit saat satu kaki menapak
    # badan atas utuh (sampai pinggul)
    out[:hip+1-bob if False else hip+1][...] = 0
    up = a[:hip+1].copy()
    # tempatkan badan atas turun/naik bob
    def put(src, y0):
        for i in range(src.shape[0]):
            y = y0 + i
            if 0 <= y < H:
                m = src[i,:,3] > 0
                out[y][m] = src[i][m]
    # kaki: kiri/kanan beda fase
    mask_all = a[...,3] > 0
    for side in (0, 1):
        s = math.sin(ph + (0 if side == 0 else math.pi))
        lift = max(0.0, math.cos(ph + (0 if side == 0 else math.pi)))     # kaki terangkat saat melangkah maju
        dx_max = 5.0 * amp; lift_px = 6.0 * amp * lift
        for r in range(hip+1, bottom+1):
            t = (r - hip) / max(1, legH-1)
            # baris sumber diperpendek agar telapak naik
            sc = (legH - lift_px) / legH
            dy = int(round(lift_px * t))                    # telapak naik
            dx = int(round(dx_max * s * (t ** 1.2)))
            y = r - dy - bob
            if not (0 <= y < H): continue
            row = a[r].copy()
            xs = np.zeros(W, bool); 
            if side == 0: xs[:int(round(cx))] = True
            else: xs[int(round(cx)):] = True
            m = (row[:,3] > 0) & xs
            idx = np.where(m)[0]
            for c in idx:
                c2 = c + dx
                if 0 <= c2 < W: out[y, c2] = row[c]
                if dy and y+1 < H and out[y+1, c2, 3] == 0: out[y+1, c2] = row[c]   # tutup celah vertikal
    put(up, bob*0 + (0 - bob) if False else -bob)
    # pastikan tak ada lubang di antara badan atas dan kaki (isi sambungan 1 baris)
    return Image.fromarray(out)
if __name__ == '__main__':
    src = sys.argv[1]; dst = sys.argv[2]; os.makedirs(dst, exist_ok=True)
    for n in NAMES:
        im = Image.open(os.path.join(src, n + '.png')).convert('RGBA')
        a = np.array(im)[...,3] > 40
        bottom, hip, cx = analyze(a)
        H = bottom
        hip = int(H * (0.80 if n.startswith(('girl','hijab')) else 0.70))
        # pusat belahan kaki = tengah badan pada baris kaki
        rows = a[hip:bottom+1]; xs = np.where(rows.any(0))[0]; cx = (xs.min() + xs.max()) / 2.0
        print(n, im.size, 'bawah', bottom, 'pinggul', hip, 'celah x', round(cx,1))
        for k in range(N):
            frame(im, bottom, hip, cx, k).save(os.path.join(dst, '%s_w%d.png' % (n, k)))
