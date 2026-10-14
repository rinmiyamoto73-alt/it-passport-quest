'use strict';
// 効果音とBGMをWeb Audio APIで合成する（音声ファイルなし）。BGMは盛り上がり段階（0〜5）に応じて楽器が増える。
const Sound=(()=>{
const KEY='itpassport-quest-sound',MUSIC_VOL=.3;
const CHORDS=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]];// C Am F G
const PENTA=[72,74,76,79,81,84,86,88,91,93,96];
let ctx=null,master,music,noiseBuf,timer=null,step=0,nextTime=0,stage=0,muted=false;
try{muted=localStorage.getItem(KEY)==='off';}catch{}
const freq=m=>440*2**((m-69)/12);
const sixteenth=()=>60/(100+stage*6)/4;
function ensure(){if(muted)return false;if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();master=ctx.createGain();master.gain.value=.7;master.connect(ctx.destination);music=ctx.createGain();music.gain.value=MUSIC_VOL;music.connect(master);noiseBuf=ctx.createBuffer(1,ctx.sampleRate*.5,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}if(ctx.state==='suspended')ctx.resume();return true;}
function tone(m,t,dur,{type='sine',vol=.2,dest=master,slide=0}={}){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq(m),t);if(slide)o.frequency.exponentialRampToValueAtTime(freq(m+slide),t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(dest);o.start(t);o.stop(t+dur+.05);}
function noise(t,dur,vol,hp=7000,dest=music){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f).connect(g).connect(dest);s.start(t);s.stop(t+dur+.02);}
function kick(t){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.18);g.gain.setValueAtTime(.8,t);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g).connect(music);o.start(t);o.stop(t+.32);}
// 1小節16ステップ。段階0はパッドのみ、1でキック、2でハイハット、3でベースと4つ打ち、4でアルペジオ、5でクラップとメロディ
function beat(i,t){const bar=Math.floor(i/16)%4,s=i%16,ch=CHORDS[bar],len=sixteenth();
if(s===0)ch.forEach(m=>tone(m,t,len*15,{type:'triangle',vol:.05,dest:music}));
if(stage>=1&&(stage>=3?s%4===0:s%8===0))kick(t);
if(stage>=2&&(stage>=5?s%2===0:s%4===2))noise(t,.05,s%4===2?.12:.05);
if(stage>=3&&[0,3,6,8,11,14].includes(s))tone(ch[0]-24,t,len*1.6,{type:'sawtooth',vol:.06,dest:music});
if(stage>=4)tone(ch[s%3]+(s>=8?24:12),t,len*.9,{type:'square',vol:.022,dest:music});
if(stage>=5){if(s===4||s===12)noise(t,.12,.22,1500);if(s%4===0)tone(PENTA[(bar*3+s/4)%PENTA.length],t,len*3,{type:'triangle',vol:.06,dest:music});}}
function tick(){while(nextTime<ctx.currentTime+.12){beat(step,nextTime);nextTime+=sixteenth();step++;}}
function startMusic(){if(!ensure()||timer)return;const t=ctx.currentTime;step=0;nextTime=t+.06;music.gain.cancelScheduledValues(t);music.gain.setValueAtTime(MUSIC_VOL,t);timer=setInterval(tick,25);}
function stopMusic(){if(!timer)return;clearInterval(timer);timer=null;const t=ctx.currentTime;music.gain.cancelScheduledValues(t);music.gain.setValueAtTime(music.gain.value,t);music.gain.linearRampToValueAtTime(0,t+.3);}
function duck(){if(!timer)return;const t=ctx.currentTime;music.gain.cancelScheduledValues(t);music.gain.setValueAtTime(MUSIC_VOL*.3,t);music.gain.linearRampToValueAtTime(MUSIC_VOL,t+.7);}
// コンボが続くほど音程が上がる
function correct(combo){if(!ensure())return;const t=ctx.currentTime,b=Math.min(Math.max(combo,1)-1,6);[0,2,4].forEach((k,i)=>{tone(PENTA[b+k],t+i*.07,.28,{type:'square',vol:.07});tone(PENTA[b+k]+12,t+i*.07,.2,{vol:.05});});if(combo>=3)noise(t+.14,.35,.08,9000,master);}
function hit(){if(!ensure())return;const t=ctx.currentTime;noise(t,.12,.3,800,master);tone(45,t,.15,{type:'square',vol:.1,slide:-12});}
function miss(){if(!ensure())return;const t=ctx.currentTime;duck();tone(62,t,.2,{vol:.2,slide:-7});tone(57,t+.15,.25,{vol:.16,slide:5});}
function levelUp(){if(!ensure())return;const t=ctx.currentTime+.35;[72,76,79,84].forEach((m,i)=>tone(m,t+i*.09,.35,{type:'square',vol:.07}));[72,76,79].forEach(m=>tone(m+12,t+.4,.9,{type:'triangle',vol:.06}));}
function clear(perfect){if(!ensure())return;const t=ctx.currentTime+.1,run=perfect?[72,76,79,84,88,91]:[72,76,79,84];run.forEach((m,i)=>tone(m,t+i*.1,.3,{type:'square',vol:.07}));const end=t+run.length*.1;[60,64,67,72].forEach(m=>tone(m+12,end,1.4,{type:'triangle',vol:.07}));kick(end);noise(end,.6,.1,6000,master);}
function setMuted(m){muted=m;try{localStorage.setItem(KEY,m?'off':'on');}catch{}if(m){stopMusic();ctx?.suspend();}}
document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else if(!muted)ctx.resume();});
return {startMusic,stopMusic,setStage:n=>{stage=n;},correct,hit,miss,levelUp,clear,setMuted,isMuted:()=>muted};
})();
