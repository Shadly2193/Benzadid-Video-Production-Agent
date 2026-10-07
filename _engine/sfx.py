import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR=48000
def t(d): return np.linspace(0,d,int(SR*d),endpoint=False)
def save(n,x,g=0.9):
    x=x/ (np.max(np.abs(x))+1e-9)*g
    st=np.stack([x,x],1)
    wavfile.write(f"work/sfx/{n}.wav",SR,(st*32767).astype(np.int16))
def bp(x,lo,hi):return sosfilt(butter(2,[lo,hi],'band',fs=SR,output='sos'),x)
def lp(x,f):return sosfilt(butter(2,f,'low',fs=SR,output='sos'),x)
rng=np.random.default_rng(7)
# whoosh: noise through sweeping bandpass, bell envelope
d=0.55;n=rng.standard_normal(int(SR*d));out=np.zeros_like(n);blk=480
for i in range(0,len(n),blk):
    p=i/len(n);c=300+4500*np.sin(np.pi*p)**1.5
    out[i:i+blk]=bp(n[i:i+blk+0],max(c*0.6,80),min(c*1.6,20000))[:len(out[i:i+blk])]
env=np.sin(np.pi*np.linspace(0,1,len(n)))**2;save("whoosh",lp(out*env,9000))
# pop: pitch-dropping sine blip
x=t(0.12);f=900*np.exp(-x*30)+180;ph=2*np.pi*np.cumsum(f)/SR;save("pop",np.sin(ph)*np.exp(-x*38),0.8)
# tick/click for word captions
x=t(0.04);save("tick",(np.sin(2*np.pi*2400*x)+0.5*rng.standard_normal(len(x))*np.exp(-x*400))*np.exp(-x*160),0.55)
# impact: sub drop + noise burst
x=t(1.2);f=110*np.exp(-x*3)+38;sub=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*3.2)
save("impact",sub+lp(rng.standard_normal(len(x))*np.exp(-x*25),2500)*0.6)
# riser: noise + rising tone
x=t(1.6);env=(x/1.6)**2;f=200+1800*(x/1.6)**2
save("riser",(bp(rng.standard_normal(len(x)),400,8000)*0.5+0.4*np.sin(2*np.pi*np.cumsum(f)/SR))*env)
# ding: bell partials
x=t(1.5);b=sum(a*np.sin(2*np.pi*fr*x)*np.exp(-x*k) for fr,a,k in [(1568,1,3),(3136,.4,5),(4704,.2,7),(2093,.3,4)]);save("ding",b,0.6)
# glitch: stuttered square bursts
x=t(0.3);sq=np.sign(np.sin(2*np.pi*140*x))*(np.floor(x*40)%2)+0.4*rng.standard_normal(len(x));save("glitch",lp(sq,6000)*np.exp(-x*6),0.6)
# swipe (short whoosh for card slides)
d=0.25;n=rng.standard_normal(int(SR*d));save("swipe",bp(n,1500,7000)*np.sin(np.pi*np.linspace(0,1,len(n)))**3,0.6)
# typing keys
x=t(1.0);k=np.zeros(len(x))
for s in np.cumsum(rng.uniform(0.06,0.12,12)):
    i=int(s*SR)
    if i<len(x)-2000:k[i:i+1500]+=bp(rng.standard_normal(1500),1500,6000)*np.exp(-np.arange(1500)/150)
save("typing",k,0.5)
# music bed: 96bpm ambient pad + soft kick + hats, 60s
bpm=96;beat=60/bpm;L=60;x=t(L);mus=np.zeros(len(x))
chords=[[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[164.8,196,246.9]]  # Am F G Em
bar=beat*4
for ci in range(int(np.ceil(L/bar))):
    s=int(ci*bar*SR);e=min(int((ci+1)*bar*SR),len(x))
    if s>=len(x): break
    tt=x[s:e]-x[s]
    for f in chords[ci%4]:
        for det in (-0.6,0.6): mus[s:e]+=0.12*np.sin(2*np.pi*(f+det)*tt)*(1-np.exp(-tt*3))
    mus[s:e]+=0.10*np.sin(2*np.pi*chords[ci%4][0]/2*tt)
mus=lp(mus,1800)
for b in range(int(L/beat)):
    i=int(b*beat*SR);kt=t(0.35);kf=120*np.exp(-kt*25)+45
    kick=np.sin(2*np.pi*np.cumsum(kf)/SR)*np.exp(-kt*9)*0.55;j=min(len(kick),len(mus)-i);mus[i:i+j]+=kick[:j]
    # sidechain duck pad
    dk=1-0.35*np.exp(-t(beat)*8);j=min(len(dk),len(mus)-i);mus[i:i+j]*=dk[:j]
    hi=int((b+0.5)*beat*SR);ht=t(0.05);h=bp(rng.standard_normal(len(ht)),7000,15000)*np.exp(-ht*90)*0.15;j=min(len(h),len(mus)-hi)
    if j>0:mus[hi:hi+j]+=h[:j]
fade=np.ones(len(mus));fade[:SR*2]=np.linspace(0,1,SR*2);fade[-SR*3:]=np.linspace(1,0,SR*3)
save("music",mus*fade,0.7)
print("done")
