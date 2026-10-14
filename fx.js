'use strict';
// 正解時の紙吹雪・浮かぶ文字・画面の光。動きを減らす設定のときは表示しない。
const FX=(()=>{
const COLORS=['#b9f46b','#63dcc7','#ffe27a','#ff9ec7','#9fb8ff','#ffffff'];
const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const pick=a=>a[Math.floor(Math.random()*a.length)];
let layer;
function host(){if(!layer){layer=document.createElement('div');layer.className='fx-layer';layer.setAttribute('aria-hidden','true');document.body.append(layer);}return layer;}
function add(cls,css,life,text=''){const el=document.createElement('i');el.className=cls;el.style.cssText=css;el.textContent=text;host().append(el);setTimeout(()=>el.remove(),life);return el;}
function center(el){const r=el.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}
function burst(el,count){if(calm()||!el)return;const [x,y]=center(el);for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,d=50+Math.random()*(80+count*2),star=Math.random()<.3,c=pick(COLORS);add('fx-bit'+(star?' star':''),`left:${x}px;top:${y}px;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-40}px;--r:${Math.random()*720-360}deg;${star?'color':'background'}:${c}`,1000,star?'✦':'');}}
function float(el,text,kind=''){if(calm()||!el)return;const [x,y]=center(el),edge=Math.min(110,innerWidth/2);add('fx-float '+kind,`left:${Math.min(Math.max(x,edge),innerWidth-edge)}px;top:${y}px`,1100,text);}
function flash(stage){if(calm())return;add('fx-flash',`opacity:${Math.min(1,.4+stage*.12)}`,700);}
function confetti(count){if(calm())return;const w=innerWidth;for(let i=0;i<count;i++)add('fx-confetti',`left:${Math.random()*w}px;background:${pick(COLORS)};--dx:${Math.random()*160-80}px;--r:${Math.random()*1080}deg;animation-duration:${1.8+Math.random()*1.6}s;animation-delay:${Math.random()*.8}s`,4300);}
function slash(el){if(calm()||!el)return;const [x,y]=center(el);add('fx-slash',`left:${x}px;top:${y}px`,450);}
function clearText(){layer?.querySelectorAll('.fx-float').forEach(el=>el.remove());}
return {burst,float,flash,confetti,slash,clearText};
})();
