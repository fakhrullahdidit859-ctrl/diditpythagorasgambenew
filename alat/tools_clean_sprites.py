"""Pembersih sprite karakter: hapus bayangan menyatu, pecahan liar, tepi putih; tutup lubang tembus pandang.
Sumber asli ada di assets/img/_orig/. Jalankan dari folder assets/img."""
from PIL import Image
import numpy as np, glob, os
from scipy import ndimage as ndi
names=sorted(glob.glob('_orig/boy_*.png')+glob.glob('_orig/girl_*.png')+glob.glob('_orig/hijab_*.png')+glob.glob('_orig/teacher_*.png')+glob.glob('_orig/owl_*.png'))
for path in names:
    n=os.path.basename(path)
    a=np.array(Image.open(path).convert('RGBA')); h,w=a.shape[:2]
    rgb=a[:,:,:3].astype(int); al=a[:,:,3]>0; mx=rgb.max(2); mn=rgb.min(2)
    sh=al&(np.arange(h)[:,None]>int(h*0.80))&((mx-mn)<20)&(mx>75)&(mx<200)
    al2=al&~sh
    grp,k=ndi.label(ndi.binary_dilation(al2,structure=np.ones((3,3)),iterations=3))
    sizes=ndi.sum(al2,grp,range(1,k+1)); big=max(sizes)
    keep=np.zeros_like(al2)
    for i,s in enumerate(sizes,1):
        if s>=big*0.06: keep|=(grp==i)&al2
    l8,k8=ndi.label(keep,structure=np.ones((3,3)))
    for i,sz in enumerate(ndi.sum(keep,l8,range(1,k8+1)),1):
        if sz<40: keep&=~(l8==i)
    P=6; pad=np.pad(keep,P)
    body=ndi.binary_dilation(pad,structure=np.ones((3,3)),iterations=2)
    lab,_=ndi.label(~body); border=set(lab[0,:])|set(lab[-1,:])|set(lab[:,0])|set(lab[:,-1]); border.discard(0)
    outside=np.isin(lab,list(border)); outside=ndi.binary_dilation(outside,structure=np.ones((3,3)),iterations=2)
    inner=((~pad)&(~outside))[P:-P,P:-P]&~keep
    # warna: terang -> warna asli; gelap -> warna tetangga terdekat
    out=a.copy(); light=inner&(mn>=200)
    dark=inner&~light
    idx=ndi.distance_transform_edt(~keep,return_indices=True)[1]
    for (yy,xx) in zip(*np.where(dark)): out[yy,xx,:3]=a[idx[0][yy,xx],idx[1][yy,xx],:3]
    full=keep|inner
    # buang tepi putih di luar garis tepi
    for _ in range(2):
        edge=full&~ndi.binary_erosion(full,structure=ndi.generate_binary_structure(2,1))
        fr=edge&(out[:,:,:3].min(2)>=225)&keep   # hanya piksel asli yang sangat terang di batas
        full=full&~fr
    out[:,:,3]=np.where(full,255,0); out[~full]=0
    ys,xs=np.where(full); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    Image.fromarray(out[y0:y1,x0:x1]).save(n)
print('selesai',len(names))
