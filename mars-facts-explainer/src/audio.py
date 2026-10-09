# Synthesizes a light, upbeat music bed plus transition whooshes and pops for the 90 s explainer.
import numpy as np, wave, sys
SR=44100; DUR=90.0; N=int(SR*DUR); t=np.arange(N)/SR
BPM=112; beat=60/BPM; bar=4*beat
rng=np.random.default_rng(7)
def note(m): return 440*2**((m-69)/12)
def env(n,a=.005,r=.3):
    x=np.arange(n)/SR; return np.minimum(1,x/a)*np.exp(-x/r)
def place(buf,sig,start):
    i=int(start*SR); j=min(len(buf),i+len(sig))
    if i<len(buf): buf[i:j]+=sig[:j-i]
def lowpass(x,fc):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/np.sqrt(1+(f/fc)**4); return np.fft.irfft(X,len(x))
L=np.zeros(N); R=np.zeros(N)
# I-V-vi-IV in D major
prog=[[62,66,69],[57,61,64],[59,62,66],[55,59,62]]
bass=[38,33,35,31]
nb=int(DUR/bar)+1
for b in range(nb):
    t0=b*bar; ch=prog[b%4]
    # warm pad
    n=int(bar*SR)+SR//2; x=np.arange(n)/SR
    pad=sum(np.sin(2*np.pi*note(m)*x)+.3*np.sin(2*np.pi*note(m)*2*x+.5) for m in ch)/3
    pe=np.minimum(1,x/.4)*np.minimum(1,np.maximum(0,(bar+.5-x)/.5))
    place(L,.10*pad*pe,t0); place(R,.10*pad*pe,t0)
    # bass on beats 1 and 3 (+ pickup)
    for k,off in enumerate([0,2*beat,3.5*beat]):
        n=int(.45*SR); x=np.arange(n)/SR; f=note(bass[b%4])
        s=(np.sin(2*np.pi*f*x)+.25*np.sin(4*np.pi*f*x))*env(n,.004,.22)
        place(L,.22*s,t0+off); place(R,.22*s,t0+off)
    # plucky arpeggio 8ths
    arp=[ch[0]+12,ch[1]+12,ch[2]+12,ch[1]+12,ch[0]+24,ch[2]+12,ch[1]+12,ch[2]+12]
    for k,m in enumerate(arp):
        n=int(.35*SR); x=np.arange(n)/SR; f=note(m)
        s=(np.sin(2*np.pi*f*x)+.4*np.sin(2*np.pi*2*f*x)*np.exp(-x/.05))*env(n,.002,.12)
        pan=.5+.3*np.sin(k)
        place(L,.07*s*(1-pan)*2,t0+k*beat/2); place(R,.07*s*pan*2,t0+k*beat/2)
    # kick on every beat, hat on offbeats, clap on 2 & 4
    for k in range(4):
        n=int(.25*SR); x=np.arange(n)/SR
        kick=np.sin(2*np.pi*(50*x+90*(1-np.exp(-x/.03))*.03*30))*np.exp(-x/.09)
        place(L,.30*kick,t0+k*beat); place(R,.30*kick,t0+k*beat)
        n=int(.06*SR); hat=rng.standard_normal(n)*np.exp(-np.arange(n)/SR/.012)
        hat=np.diff(np.concatenate([[0],hat]))
        place(L,.035*hat,t0+k*beat+beat/2); place(R,.045*hat,t0+k*beat+beat/2)
        if k in (1,3):
            n=int(.18*SR); cl=rng.standard_normal(n)*np.exp(-np.arange(n)/SR/.04)
            place(L,.05*lowpass(cl,3000),t0+k*beat); place(R,.05*lowpass(cl,3000),t0+k*beat)
# music fades
fade=np.minimum(1,t/1.5)*np.minimum(1,np.maximum(0,(DUR-t)/3.0))
L*=fade; R*=fade
# SFX: whoosh at each transition, pop on each number reveal, chime on outro
T_INTRO,T_SLIDE=7,7.4
bounds=[T_INTRO+i*T_SLIDE for i in range(11)]
for bnd in bounds:
    n=int(.8*SR); x=np.arange(n)/SR
    w=lowpass(rng.standard_normal(n),1800)*np.sin(np.pi*x/.8)**2
    place(L,.22*w*np.linspace(1.2,.4,n),bnd-.4); place(R,.22*w*np.linspace(.4,1.2,n),bnd-.4)
for i in range(10):
    s0=T_INTRO+i*T_SLIDE+.08; n=int(.15*SR); x=np.arange(n)/SR
    pop=np.sin(2*np.pi*(500*x+3000*x*x))*np.exp(-x/.03)
    place(L,.16*pop,s0); place(R,.16*pop,s0)
for k,m in enumerate([74,78,81,86]):
    n=int(1.6*SR); x=np.arange(n)/SR; f=note(m)
    s=(np.sin(2*np.pi*f*x)+.3*np.sin(2*np.pi*3*f*x))*env(n,.003,.6)
    place(L,.09*s,81.3+k*.1); place(R,.09*s,81.3+k*.1)
# intro title hit
n=int(.15*SR); x=np.arange(n)/SR; place(L,.2*np.sin(2*np.pi*(300*x+2000*x*x))*np.exp(-x/.04),.35); place(R,.2*np.sin(2*np.pi*(300*x+2000*x*x))*np.exp(-x/.04),.35)
st=np.stack([L,R],1)
rms=np.sqrt(np.mean(st**2)); st*=10**(-17/20)/rms
st=np.tanh(st*1.1)/1.1
pk=np.abs(st).max(); st*=min(1,10**(-1/20)/pk)
pcm=(st*32767).astype('<i2')
with wave.open(sys.argv[1],'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes(pcm.tobytes())
print('ok')
