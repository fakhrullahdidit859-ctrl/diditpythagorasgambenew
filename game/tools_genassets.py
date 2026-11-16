import os,json
P='./'
core=['./','index.html','css/style.css','manifest.webmanifest','offline.html','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png']+['js/'+f for f in sorted(os.listdir(P+'js'))]
assets=[]
for r,_,fs in os.walk(P+'assets'):
    for f in fs:
        p=os.path.relpath(os.path.join(r,f),P)
        if '/_orig' in p or p.startswith('assets/audio/bgm'): continue
        assets.append([p,os.path.getsize(P+p)])
bgm=[['assets/audio/bgm/'+f,os.path.getsize(P+'assets/audio/bgm/'+f)] for f in sorted(os.listdir(P+'assets/audio/bgm'))]
json.dump({'v':26,'core':core,'assets':sorted(assets),'bgm':bgm},open(P+'pp-assets.json','w'))
print(len(core),len(assets),len(bgm))
