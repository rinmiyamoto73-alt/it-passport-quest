'use strict';
// キャラクターのイラスト（SVG）。100×100の座標で描き、data URL にして <img> で表示する。
// 太い輪郭線・2段のセル塗り・ハイライト・大きな目の、アニメ調ちびキャラ。
const Chars=(()=>{
const OL='#2a2238';
const cache=new Map();
const url=(key,make)=>{if(!cache.has(key))cache.set(key,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(make()));return cache.get(key);};
const mix=(hex,to,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-t)+to*t).toString(16).padStart(2,'0')).join('');
const dark=(c,t=.28)=>mix(c,0,t),light=(c,t=.45)=>mix(c,255,t);
const svg=(body,defs='')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${defs}</defs><g stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
// 影：本体の形で切り抜いて、右下に暗い色を重ねる
// 本体を暗い色で塗り、同じ形を左上にずらして元の色で重ねる → 右下のふちだけ影になる
const shaded=(id,d,c,{sx=10,sy=10,hl=null}={})=>`<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})"><rect x="-10" y="-10" width="120" height="120" fill="${dark(c,.2)}"/><path d="${d}" fill="${c}" transform="translate(${-sx*.6} ${-sy*.6})"/>${hl||''}</g><path d="${d}" fill="none" stroke="${OL}" stroke-width="3"/>`;
const ground=(w=30,y=93)=>`<ellipse cx="50" cy="${y}" rx="${w}" ry="3.5" fill="#000" opacity=".22"/>`;
// 目：type = normal（キラキラ）/ happy（にっこり）/ angry / sleepy / glow（光る）
function eyes(x1,x2,y,{type='normal',size=1,color=OL,glow='#ffe27a'}={}){const e=x=>{const rx=4.2*size,ry=5.6*size;
if(type==='happy')return `<path d="M${x-rx} ${y+1} Q${x} ${y-ry} ${x+rx} ${y+1}" fill="none" stroke="${OL}" stroke-width="2.6"/>`;
if(type==='glow')return `<ellipse cx="${x}" cy="${y}" rx="${rx+1.8}" ry="${ry*.8+1.2}" fill="${glow}" opacity=".35"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry*.75}" fill="${glow}" stroke="${OL}" stroke-width="1.6"/><ellipse cx="${x-1.2*size}" cy="${y-1.2*size}" rx="${1.3*size}" ry="${1*size}" fill="#fff"/>`;
if(type==='sleepy')return `<path d="M${x-rx} ${y} Q${x} ${y+ry*.8} ${x+rx} ${y}" fill="${color}" stroke="${OL}" stroke-width="2"/><path d="M${x-rx-1} ${y-.5} L${x+rx+1} ${y-.5}" stroke="${OL}" stroke-width="2.4"/>`;
const brow=type==='angry'?`<path d="M${x-rx-1.5} ${y-ry-3} L${x+rx+1} ${y-ry+(x<50?1.5:-1.5)*1.6}" stroke="${OL}" stroke-width="2.6" transform="${x<50?'':`scale(-1 1) translate(${-2*x} 0)`}"/>`:'';
return `${brow}<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}"/><ellipse cx="${x-1.4*size}" cy="${y-2*size}" rx="${1.7*size}" ry="${2*size}" fill="#fff"/><circle cx="${x+1.6*size}" cy="${y+2.2*size}" r="${.9*size}" fill="#fff"/>`;};return e(x1)+e(x2);}
const blush=(x1,x2,y,c='#ff8fab')=>`<ellipse cx="${x1}" cy="${y}" rx="4.5" ry="2.4" fill="${c}" opacity=".55"/><ellipse cx="${x2}" cy="${y}" rx="4.5" ry="2.4" fill="${c}" opacity=".55"/>`;
function mouth(x,y,type='smile',w=6){if(type==='open')return `<path d="M${x-w} ${y} Q${x} ${y+w*1.5} ${x+w} ${y} Z" fill="#7a2b3a" stroke="${OL}" stroke-width="2"/><path d="M${x-w*.5} ${y+w*.7} Q${x} ${y+w*.35} ${x+w*.5} ${y+w*.7}" fill="#ff8a9a"/>`;
if(type==='fang')return `<path d="M${x-w} ${y} Q${x} ${y+w*.9} ${x+w} ${y}" fill="none" stroke="${OL}" stroke-width="2.4"/><path d="M${x-w*.55} ${y+.8} l1.6 3.4 l1.6 -3" fill="#fff" stroke="${OL}" stroke-width="1.2"/><path d="M${x+w*.55-3.2} ${y+.8} l1.6 3.4 l1.6 -3" fill="#fff" stroke="${OL}" stroke-width="1.2"/>`;
if(type==='grin')return `<path d="M${x-w} ${y-1} Q${x} ${y+w*1.2} ${x+w} ${y-1} Z" fill="#fff" stroke="${OL}" stroke-width="2.2"/><path d="M${x-w*.5} ${y} v3 M${x} ${y+.4} v4 M${x+w*.5} ${y} v3" stroke="${OL}" stroke-width="1.2"/>`;
if(type==='o')return `<ellipse cx="${x}" cy="${y+2}" rx="${w*.45}" ry="${w*.55}" fill="#7a2b3a" stroke="${OL}" stroke-width="2"/>`;
if(type==='flat')return `<path d="M${x-w*.7} ${y+1} L${x+w*.7} ${y+1}" stroke="${OL}" stroke-width="2.4"/>`;
return `<path d="M${x-w} ${y} Q${x} ${y+w} ${x+w} ${y}" fill="none" stroke="${OL}" stroke-width="2.6"/>`;}
const shine=(x,y,r=1,rot=-30)=>`<ellipse cx="${x}" cy="${y}" rx="${4*r}" ry="${8*r}" fill="#fff" opacity=".55" transform="rotate(${rot} ${x} ${y})"/><circle cx="${x-1*r}" cy="${y+11*r}" r="${2*r}" fill="#fff" opacity=".55"/>`;
const crown=(x=50,y=6,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 12 L-16 -2 L-7 5 L0 -6 L7 5 L16 -2 L14 12 Z" fill="#ffd34d" stroke="${OL}" stroke-width="2.6"/><path d="M-14 12 L14 12 L14 8 L-14 8 Z" fill="#e6a817" stroke="${OL}" stroke-width="2"/><circle cx="0" cy="3" r="2.6" fill="#e0405a" stroke="${OL}" stroke-width="1.4"/><circle cx="-8" cy="6" r="1.6" fill="#63dcc7"/><circle cx="8" cy="6" r="1.6" fill="#63dcc7"/></g>`;
const sparkle=(x,y,s=1,c='#ffe27a')=>`<path d="M${x} ${y-5*s} L${x+1.4*s} ${y-1.4*s} L${x+5*s} ${y} L${x+1.4*s} ${y+1.4*s} L${x} ${y+5*s} L${x-1.4*s} ${y+1.4*s} L${x-5*s} ${y} L${x-1.4*s} ${y-1.4*s} Z" fill="${c}" stroke="${OL}" stroke-width="1"/>`;

// ===== 体の形 =====
const D={
slime:'M50 15 C57 27 83 40 85 63 C87 82 71 91 50 91 C29 91 13 82 15 63 C17 40 43 27 50 15 Z',
blob:'M50 22 C70 22 86 40 86 62 C86 82 72 91 50 91 C28 91 14 82 14 62 C14 40 30 22 50 22 Z',
cube:'M22 36 Q22 26 32 26 L68 26 Q78 26 78 36 L80 80 Q80 90 70 90 L30 90 Q20 90 20 80 Z',
cloud:'M24 86 C10 86 8 68 20 64 C14 50 28 40 38 46 C40 30 62 28 66 42 C78 36 92 48 84 62 C96 66 92 86 78 86 Z',
ghost:'M22 52 C22 28 36 16 50 16 C64 16 78 28 78 52 L78 82 Q72 91 65 83 Q58 91 51 83 Q44 91 37 83 Q30 91 22 83 Z',
cap:'M10 54 C10 27 29 13 50 13 C71 13 90 27 90 54 C90 61 80 63 50 63 C20 63 10 61 10 54 Z',
stem:'M33 58 L67 58 Q70 74 68 84 Q66 92 50 92 Q34 92 32 84 Q30 74 33 58 Z',
batBody:'M50 32 C63 32 71 42 71 55 C71 68 62 76 50 76 C38 76 29 68 29 55 C29 42 37 32 50 32 Z',
wingL:'M33 50 C24 34 12 30 3 37 C11 40 11 46 6 52 C14 51 16 57 13 64 C21 59 27 61 31 64 Z',
golemBody:'M20 44 Q20 36 28 36 L72 36 Q80 36 80 44 L82 74 Q82 82 74 82 L26 82 Q18 82 18 74 Z',
golemHead:'M32 14 Q32 8 38 8 L62 8 Q68 8 68 14 L69 36 L31 36 Z',
roboHead:'M22 22 Q22 14 30 14 L70 14 Q78 14 78 22 L78 46 Q78 54 70 54 L30 54 Q22 54 22 46 Z',
roboBody:'M30 56 L70 56 Q74 56 74 62 L72 80 Q71 86 64 86 L36 86 Q29 86 28 80 L26 62 Q26 56 30 56 Z',
book:'M22 14 L76 14 Q82 14 82 20 L82 84 Q82 90 76 90 L22 90 Q18 90 18 86 L18 18 Q18 14 22 14 Z',
openBook:'M50 30 C38 22 20 22 8 28 L8 82 C20 76 38 76 50 84 C62 76 80 76 92 82 L92 28 C80 22 62 22 50 30 Z'};
const mirror=d=>d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g,(m,x,y)=>`${100-x} ${y}`);
D.wingR=mirror(D.wingL);
const part=(id,d,c,o)=>shaded(id,d,c,o);

// ===== 種類ごとの絵 =====
// o：{c 本体色, c2 2色目, eye 目の種類, mouth 口, glow 光る目の色, extra 追加の絵（前）, back 追加の絵（後ろ）, boss, shape}
function slime(o){const d=D[o.shape||'slime'];return svg(`${ground(32)}${o.back||''}${part('b',d,o.c,{hl:shine(32,50)})}${o.inner||''}${eyes(39,61,62,{type:o.eye,glow:o.glow})}${o.eye==='glow'?'':blush(30,70,72)}${mouth(50,73,o.mouth||'open',6)}${o.extra||''}${o.boss?crown(50,8,1.15):''}`);}
function ghost(o){return svg(`${ground(24,95)}${o.back||''}<ellipse cx="18" cy="60" rx="7" ry="5" fill="${o.c}" stroke="${OL}" stroke-width="3" transform="rotate(-25 18 60)"/><ellipse cx="82" cy="60" rx="7" ry="5" fill="${dark(o.c,.15)}" stroke="${OL}" stroke-width="3" transform="rotate(25 82 60)"/>${part('b',D.ghost,o.c,{hl:shine(33,36)})}${eyes(40,60,46,{type:o.eye,glow:o.glow,color:o.eyeColor||OL})}${o.eye==='glow'||o.eye==='angry'?'':blush(31,69,57)}${mouth(50,58,o.mouth||'o',6)}${o.extra||''}${o.boss?crown(50,6,1.1):''}`);}
function mushroom(o){const spots=(o.spots||['#fff','#fff','#fff','#fff']).map((s,i)=>[[30,30,6],[52,22,7],[72,34,6],[46,44,4.5]][i]).map(([x,y,r],i)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${(o.spots||[])[i]||'#fff'}" stroke="${OL}" stroke-width="1.8"/>`).join('');return svg(`${ground(26)}${o.back||''}${part('s',D.stem,o.c2||'#f6e6c8',{sx:8,sy:4})}${part('c',D.cap,o.c,{hl:`<ellipse cx="28" cy="24" rx="9" ry="5" fill="#fff" opacity=".45" transform="rotate(-25 28 24)"/>`})}${o.noSpots?'':spots}${eyes(42,58,72,{type:o.eye,glow:o.glow,size:.85})}${o.eye==='glow'?'':blush(35,65,80)}${mouth(50,80,o.mouth||'smile',4)}${o.extra||''}${o.boss?crown(50,2,1):''}`);}
function bat(o){const w=o.c2||dark(o.c,.2);return svg(`${ground(22,95)}${o.back||''}${part('wl',D.wingL,w,{sx:4,sy:6})}${part('wr',D.wingR,w,{sx:4,sy:6})}<path d="M36 40 L33 20 L46 34 Z" fill="${o.c}" stroke="${OL}" stroke-width="3"/><path d="M64 40 L67 20 L54 34 Z" fill="${o.c}" stroke="${OL}" stroke-width="3"/><path d="M37 37 L36 26 L43 34 Z" fill="#ff9ec7" opacity=".7"/><path d="M63 37 L64 26 L57 34 Z" fill="#ff9ec7" opacity=".7"/>${part('b',D.batBody,o.c,{hl:shine(39,45,.7)})}<ellipse cx="50" cy="66" rx="10" ry="6" fill="${light(o.c,.35)}"/>${eyes(42,58,53,{type:o.eye,glow:o.glow,size:.95})}${o.eye==='glow'?'':blush(35,65,62)}${mouth(50,62,o.mouth||'fang',5)}<path d="M44 76 l-2 5 M56 76 l2 5" stroke="${OL}" stroke-width="2.6"/>${o.extra||''}${o.boss?crown(50,14,1):''}`);}
function golem(o){const c=o.c;return svg(`${ground(36)}${o.back||''}${part('al','M8 42 Q8 36 14 36 L22 36 Q26 36 26 42 L26 70 Q26 76 20 76 L12 76 Q6 76 6 70 Z',dark(c,.08),{sx:4,sy:4})}${part('ar','M74 42 Q74 36 80 36 L86 36 Q92 36 92 42 L94 70 Q94 76 88 76 L80 76 Q74 76 74 70 Z',dark(c,.08),{sx:4,sy:4})}${part('ll','M28 78 L44 78 L44 92 Q44 94 42 94 L30 94 Q28 94 28 92 Z',dark(c,.12),{sx:3,sy:3})}${part('lr','M56 78 L72 78 L72 92 Q72 94 70 94 L58 94 Q56 94 56 92 Z',dark(c,.12),{sx:3,sy:3})}${part('b',D.golemBody,c,{sx:6,sy:6})}${part('h',D.golemHead,c,{sx:5,sy:5,hl:`<rect x="35" y="11" width="10" height="4" rx="2" fill="#fff" opacity=".35"/>`})}${eyes(42,58,24,{type:o.eye||'glow',glow:o.glow,size:.8})}${mouth(50,30,o.mouth||'flat',5)}<path d="M30 48 l6 6 l-3 6 M66 66 l5 -4 l4 5" fill="none" stroke="${dark(c,.4)}" stroke-width="2"/>${o.extra||''}${o.boss?crown(50,-1,1):''}`);}
function robot(o){const c=o.c,v=o.c2||'#1f2a44';return svg(`${ground(26)}${o.back||''}<path d="M50 14 L50 5" stroke="${OL}" stroke-width="3"/><circle cx="50" cy="5" r="4.5" fill="${o.glow||'#ffe27a'}" stroke="${OL}" stroke-width="2.4"/>${part('al','M14 60 Q14 56 18 56 L24 56 L24 76 Q24 80 20 80 L18 80 Q14 80 14 76 Z',dark(c,.1),{sx:3,sy:3})}${part('ar','M76 56 L82 56 Q86 56 86 60 L86 76 Q86 80 82 80 L80 80 Q76 80 76 76 Z',dark(c,.1),{sx:3,sy:3})}${part('lg','M34 84 L44 84 L44 94 L34 94 Z',dark(c,.3),{sx:2,sy:2})}${part('rg','M56 84 L66 84 L66 94 L56 94 Z',dark(c,.3),{sx:2,sy:2})}${part('b',D.roboBody,c,{sx:6,sy:6})}${part('h',D.roboHead,c,{sx:6,sy:6,hl:`<rect x="27" y="18" width="14" height="4" rx="2" fill="#fff" opacity=".45"/>`})}<rect x="29" y="23" width="42" height="22" rx="8" fill="${v}" stroke="${OL}" stroke-width="2.6"/>${eyes(40,60,34,{type:o.eye||'glow',glow:o.glow||'#63dcc7',size:.85})}${o.boss?'':`<rect x="40" y="64" width="20" height="10" rx="3" fill="${v}" stroke="${OL}" stroke-width="2"/><circle cx="45" cy="69" r="2" fill="#ff6b6b"/><circle cx="51" cy="69" r="2" fill="#ffe27a"/><circle cx="57" cy="69" r="2" fill="#63dcc7"/>`}${o.extra||''}${o.boss?crown(50,0,1):''}`);}
function book(o){const c=o.c,s=o.c2||dark(c,.35);return svg(`${ground(32)}${o.back||''}<path d="M80 18 L84 20 L84 86 L80 88 Z" fill="#fff" stroke="${OL}" stroke-width="2.4"/><path d="M81 26 v54 M83 26 v54" stroke="#c9c2b0" stroke-width="1"/>${part('b',D.book,c,{sx:6,sy:6,hl:`<rect x="30" y="18" width="5" height="64" rx="2" fill="#fff" opacity=".25"/>`})}<path d="M18 18 Q18 14 22 14 L28 14 L28 90 L22 90 Q18 90 18 86 Z" fill="${s}" stroke="${OL}" stroke-width="3"/><path d="M18 30 h10 M18 74 h10" stroke="${o.trim||'#ffd34d'}" stroke-width="3"/>${eyes(43,65,46,{type:o.eye,glow:o.glow,size:1.05})}${o.eye==='glow'?'':blush(36,72,56)}${mouth(54,60,o.mouth||'grin',8)}<path d="M66 88 L66 98 L70 94 L74 98 L74 88" fill="${o.ribbon||'#e0405a'}" stroke="${OL}" stroke-width="2.2"/>${o.extra||''}${o.boss?crown(52,2,1):''}`);}
function openbook(o){const c=o.c;return svg(`${ground(36)}${part('p',D.openBook,'#fffdf6',{sx:4,sy:4})}<path d="M50 30 L50 84" stroke="${OL}" stroke-width="2.4"/><path d="M8 82 C20 76 38 76 50 84 C62 76 80 76 92 82 L92 88 C80 82 62 82 50 90 C38 82 20 82 8 88 Z" fill="${c}" stroke="${OL}" stroke-width="3"/>${eyes(30,70,46,{type:o.eye,size:.9})}${blush(22,78,56)}${mouth(50,60,'smile',5)}${o.extra||''}`);}

// ===== アクセサリー =====
const X={
leaf:`<path d="M50 16 Q50 8 54 4" fill="none" stroke="${OL}" stroke-width="2.6"/><path d="M53 6 C62 -2 76 4 74 12 C66 16 56 14 53 6 Z" fill="#5dbb46" stroke="${OL}" stroke-width="2.6"/><path d="M56 7 Q64 8 70 11" stroke="#2f7a2f" stroke-width="1.6" fill="none"/>`,
copyright:`<path d="M38 64 Q50 72 62 64" fill="none" stroke="#c9a14a" stroke-width="2"/><circle cx="50" cy="73" r="7" fill="#ffd34d" stroke="${OL}" stroke-width="2.4"/><path d="M53 70.5 A4 4 0 1 0 53 75.5" fill="none" stroke="${OL}" stroke-width="1.8"/>`,
copyBack:`<path d="${D.ghost}" fill="#fff6d8" fill-opacity=".28" stroke="#fff6d8" stroke-opacity=".6" stroke-width="2" stroke-dasharray="4 3" transform="translate(14 -6) scale(.9)"/>`,
scroll:`<g transform="rotate(-8 50 86)"><rect x="34" y="80" width="32" height="12" rx="2" fill="#f6e6c8" stroke="${OL}" stroke-width="2.4"/><path d="M38 84 h10 M38 88 h18 M52 84 l3 2 l5 -3" stroke="#c0392b" stroke-width="1.4" fill="none"/></g>`,
graph:`<path d="M28 66 L38 58 L46 64 L58 50 L70 56" fill="none" stroke="#ffe27a" stroke-width="3"/><path d="M66 50 L72 52 L70 58" fill="none" stroke="#ffe27a" stroke-width="2.4"/><path d="M24 40 q6 -6 12 0 q4 -5 10 -1" fill="#5dbb46" stroke="${OL}" stroke-width="1.8"/>`,
rfp:`<text x="56" y="38" font-family="Arial Black,Arial" font-weight="900" font-size="14" text-anchor="middle" fill="#8a5a2a">RFP</text><path d="M48 66 L64 86 L44 92 Z" fill="#fff" stroke="${OL}" stroke-width="2.2"/><path d="M50 74 h6 M50 80 h8" stroke="#aaa" stroke-width="1.2"/>`,
drip:`<path d="M20 60 q2 8 0 12 q-3 -4 0 -12 M80 60 q2 8 0 12 q-3 -4 0 -12 M30 62 q2 10 -1 16 q-3 -6 1 -16 M70 62 q2 10 -1 16 q-3 -6 1 -16" fill="#8fd0ff" stroke="${OL}" stroke-width="1.6"/><path d="M14 46 Q30 40 40 46 Q52 52 62 46 Q74 40 86 46" fill="none" stroke="#cfe8ff" stroke-width="3"/>`,
cycle:`<path d="M42 72 A9 9 0 1 1 58 72" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M56 68 l3 5 l-6 1" fill="none" stroke="#fff" stroke-width="2.4"/>`,
gantt:`<g transform="rotate(-6 78 70)"><rect x="62" y="58" width="32" height="24" rx="2" fill="#fff" stroke="${OL}" stroke-width="2.4"/><rect x="65" y="62" width="14" height="4" fill="#63dcc7"/><rect x="72" y="68" width="16" height="4" fill="#ffd34d"/><rect x="80" y="74" width="10" height="4" fill="#ff6b6b"/></g>`,
headset:`<path d="M24 34 Q24 6 50 6 Q76 6 76 34" fill="none" stroke="${OL}" stroke-width="4"/><rect x="16" y="26" width="9" height="16" rx="4" fill="#ff6b6b" stroke="${OL}" stroke-width="2.4"/><rect x="75" y="26" width="9" height="16" rx="4" fill="#ff6b6b" stroke="${OL}" stroke-width="2.4"/><path d="M20 42 Q22 54 36 52" fill="none" stroke="${OL}" stroke-width="2.4"/><circle cx="37" cy="52" r="3" fill="${OL}"/>`,
monocle:`<circle cx="65" cy="46" r="9" fill="#cfe8ff" fill-opacity=".35" stroke="#c9a14a" stroke-width="2.6"/><path d="M73 50 Q80 60 76 72" fill="none" stroke="#c9a14a" stroke-width="1.4"/><g transform="rotate(30 86 74)"><circle cx="86" cy="68" r="7" fill="#cfe8ff" fill-opacity=".5" stroke="${OL}" stroke-width="2.4"/><path d="M86 75 v10" stroke="#8a5a2a" stroke-width="4"/></g><path d="M38 24 l4 4 l8 -9" fill="none" stroke="#3fc48a" stroke-width="3.4"/>`,
bits:`<text x="50" y="47" font-family="Courier New,monospace" font-weight="900" font-size="15" text-anchor="middle" fill="#fff" opacity=".85">0101</text>`,
flow:`<path d="M50 34 l6 5 l-6 5 l-6 -5 Z M30 36 h10 M30 36 v8 M30 52 h10 M70 34 v10 M66 40 l4 4 l4 -4" fill="none" stroke="#2f8a5f" stroke-width="2"/><path d="M50 84 L50 96" stroke="#2f8a5f" stroke-width="2"/>`,
chip:`<rect x="38" y="50" width="24" height="22" rx="2" fill="#2a3a4a" stroke="${OL}" stroke-width="2.4"/><rect x="43" y="55" width="14" height="12" fill="#63dcc7" opacity=".85"/><path d="M42 50 v-4 M48 50 v-4 M54 50 v-4 M60 50 v-4 M42 72 v4 M48 72 v4 M54 72 v4 M60 72 v4 M38 56 h-4 M38 62 h-4 M38 68 h-4 M62 56 h4 M62 62 h4 M62 68 h4" stroke="#ffd34d" stroke-width="2"/>`,
rack:`<path d="M30 62 h40 M30 68 h40 M30 74 h40" stroke="${OL}" stroke-width="1.6"/><circle cx="64" cy="65" r="1.6" fill="#3fc48a"/><circle cx="64" cy="71" r="1.6" fill="#3fc48a"/><circle cx="64" cy="77" r="1.6" fill="#ffd34d"/>`,
gear:`<g transform="translate(80 72)"><circle r="8" fill="#9fb3c8" stroke="${OL}" stroke-width="2.4"/><circle r="3" fill="${OL}"/><path d="M0 -12 v4 M0 12 v-4 M-12 0 h4 M12 0 h-4 M-8.5 -8.5 l3 3 M8.5 8.5 l-3 -3 M-8.5 8.5 l3 -3 M8.5 -8.5 l-3 3" stroke="${OL}" stroke-width="3.6"/></g>`,
board:`<path d="M18 40 Q30 34 50 34 Q70 34 82 40" fill="none" stroke="#2f7a2f" stroke-width="2"/><path d="M26 30 h8 v6 h8 M58 26 v8 h10 M40 20 h6" fill="none" stroke="#2f7a2f" stroke-width="2"/><circle cx="34" cy="36" r="1.8" fill="#ffd34d"/><circle cx="68" cy="34" r="1.8" fill="#ffd34d"/>`,
cursor:`<path d="M66 74 L66 94 L71 89 L75 97 L78 95 L74 88 L81 88 Z" fill="#fff" stroke="${OL}" stroke-width="2.2"/>`,
envelope:`<g transform="rotate(-8 50 82)"><rect x="38" y="74" width="24" height="16" rx="2" fill="#fff" stroke="${OL}" stroke-width="2.4"/><path d="M38 75 L50 84 L62 75" fill="none" stroke="${OL}" stroke-width="2"/></g>`,
spores:`${[[14,30],[86,26],[10,62],[90,58]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.4" fill="#b06bd6" stroke="${OL}" stroke-width="1.6"/><path d="M${x-5} ${y} h10 M${x} ${y-5} v10" stroke="#b06bd6" stroke-width="1.4"/>`).join('')}`,
clock:`<circle cx="50" cy="60" r="10" fill="#fff" stroke="${OL}" stroke-width="2.6"/><path d="M50 60 v-6 M50 60 l5 3" stroke="${OL}" stroke-width="2.2"/><circle cx="50" cy="20" r="3.2" fill="#ff6b6b" stroke="${OL}" stroke-width="1.6"/>`,
horns:`<path d="M24 22 Q14 6 22 0 Q24 12 34 16 Z" fill="#4a1a1a" stroke="${OL}" stroke-width="2.4"/><path d="M76 22 Q86 6 78 0 Q76 12 66 16 Z" fill="#4a1a1a" stroke="${OL}" stroke-width="2.4"/>`,
key:`<g transform="rotate(-30 84 80)"><circle cx="84" cy="70" r="5" fill="none" stroke="#ffd34d" stroke-width="3"/><path d="M84 75 v14 M84 84 h4 M84 88 h3" stroke="#ffd34d" stroke-width="3"/></g><path d="M80 82 l4 -3 M82 88 l5 0" stroke="#fff" stroke-width="1.4"/>`,
question:`<text x="50" y="14" font-family="Arial Black,Arial" font-weight="900" font-size="16" text-anchor="middle" fill="#fff" stroke="${OL}" stroke-width="1.4">?</text>`,
cape:c=>`<path d="M18 40 Q10 70 14 94 L86 94 Q90 70 82 40 Z" fill="${c}" stroke="${OL}" stroke-width="3"/><path d="M50 50 L50 94" stroke="${dark(c,.3)}" stroke-width="2"/>`,
glitch:`<rect x="10" y="40" width="22" height="4" fill="#ff6b6b" opacity=".8"/><rect x="66" y="56" width="26" height="3" fill="#63dcc7" opacity=".8"/><rect x="20" y="70" width="14" height="3" fill="#fff" opacity=".7"/><rect x="72" y="30" width="12" height="3" fill="#ff6b6b" opacity=".7"/>`,
rgb:`<g clip-path="url(#b)"><rect x="0" y="0" width="38" height="100" fill="#ff5a5a"/><rect x="38" y="0" width="24" height="100" fill="#4fd36b"/><rect x="62" y="0" width="38" height="100" fill="#4f8fe8"/>${shine(32,50)}</g><path d="${D.slime}" fill="none" stroke="${OL}" stroke-width="3"/><path d="M38 22 L38 88 M62 22 L62 88" stroke="${OL}" stroke-width="1.4" opacity=".5"/>`,
table:`<rect x="32" y="22" width="40" height="26" rx="2" fill="#fff" fill-opacity=".7" stroke="#3a4a9e" stroke-width="2"/><path d="M32 30 h40 M32 39 h40 M45 22 v26 M58 22 v26" stroke="#3a4a9e" stroke-width="1.6"/>`};

// ===== 敵 =====
const ENEMY_ART={
leafslime:()=>slime({c:'#7ccf5a',extra:X.leaf}),
copyghost:()=>ghost({c:'#f5e6b8',back:X.copyBack,extra:X.copyright}),
swotdake:()=>mushroom({c:'#e2524e',spots:['#ffe27a','#8fd0ff','#9ae86b','#d58aff'],mouth:'smile'}),
roadbat:()=>bat({c:'#8a6bd6',extra:X.scroll}),
marketgolem:()=>golem({c:'#8aa375',glow:'#ffe27a',extra:X.graph}),
cloudslime:()=>slime({c:'#eaf5ff',shape:'cloud',mouth:'smile'}),
rfpbook:()=>book({c:'#f0e0c0',c2:'#b07a3a',extra:X.rfp}),
waterdake:()=>mushroom({c:'#4f9be8',noSpots:true,extra:X.drip}),
agilebat:()=>bat({c:'#3fc48a',extra:X.cycle,mouth:'open'}),
ganttghost:()=>ghost({c:'#d9d4f5',extra:X.gantt,mouth:'open'}),
helprobo:()=>robot({c:'#f0c060',extra:X.headset,glow:'#63dcc7'}),
auditbook:()=>book({c:'#e3e9ef',c2:'#2f4f6f',trim:'#c0392b',mouth:'flat',extra:X.monocle,ribbon:'#2f4f6f'}),
bitslime:()=>slime({c:'#9fb3c8',shape:'cube',extra:X.bits,mouth:'flat'}),
flowbook:()=>openbook({c:'#3fae7a',extra:X.flow}),
cpugolem:()=>golem({c:'#6b7b8c',glow:'#63dcc7',extra:X.chip}),
serverrobo:()=>robot({c:'#b8c6d6',extra:X.rack,glow:'#3fc48a'}),
osghost:()=>ghost({c:'#b8f0d0',extra:X.gear,mouth:'smile'}),
memorydake:()=>mushroom({c:'#e89a3f',noSpots:true,eye:'sleepy',mouth:'o',extra:X.board}),
uibat:()=>bat({c:'#ff9ec7',extra:X.cursor,mouth:'smile'}),
pixelslime:()=>slime({c:'#ff6b6b',inner:X.rgb,mouth:'smile'}),
sqlbook:()=>book({c:'#dfe7ff',c2:'#3a4a9e',extra:X.table,ribbon:'#ffd34d'}),
packetbat:()=>bat({c:'#5ad6c9',extra:X.envelope}),
virusdake:()=>mushroom({c:'#7bd44a',spots:['#b06bd6','#b06bd6','#b06bd6','#b06bd6'],eye:'angry',mouth:'fang',extra:X.spores}),
kingslime:()=>slime({c:'#4fb3e8',boss:true,eye:'angry',mouth:'fang',back:X.cape('#c0392b')}),
pmgolem:()=>golem({c:'#c9a14a',glow:'#63dcc7',boss:true,extra:X.clock}),
malwarerobo:()=>robot({c:'#c0392b',c2:'#2a0f14',glow:'#ff3b3b',boss:true,extra:X.horns+X.key}),
forgetghost:()=>ghost({c:'#a8c8ff',eye:'sleepy',mouth:'o',extra:X.question}).replace('<g stroke-linejoin','<g opacity=".82" stroke-linejoin'),
noiseking:()=>ghost({c:'#54447f',eye:'glow',glow:'#ff3b3b',mouth:'fang',boss:true,back:X.cape('#16101f'),extra:X.glitch})};
// ===== 相棒（敵より丸く、目を大きく） =====
const BUDDY_ART={
b_slime:s=>slime({c:'#ff9ec7',shape:'blob',mouth:'open',extra:s?crown(50,14,.8)+sparkle(18,30)+sparkle(84,40,.8):''}),
b_ghost:s=>ghost({c:'#cfe8ff',mouth:'smile',extra:s?crown(50,8,.8)+sparkle(88,24):''}),
b_mush:s=>mushroom({c:'#ffd34d',spots:['#fff','#ff9a4a','#fff','#ff9a4a'],mouth:'open',extra:s?crown(50,2,.75)+sparkle(10,20):''}),
b_bat:s=>bat({c:'#5a6ad6',mouth:'open',extra:s?crown(50,16,.75)+sparkle(90,20):''}),
b_robo:s=>robot({c:'#eef2f7',glow:'#ff9ec7',extra:s?crown(50,2,.75)+sparkle(12,24):''}),
b_book:s=>book({c:'#fff4d8',c2:'#7a3a8a',mouth:'smile',ribbon:'#63dcc7',extra:s?crown(52,4,.75)+sparkle(90,24):''}),
b_gold:s=>slime({c:'#ffd34d',shape:'blob',mouth:'open',extra:sparkle(16,34)+sparkle(84,30,.8)+sparkle(78,80,.6)+(s?crown(50,14,.8):'')}),
b_dark:s=>ghost({c:'#6a58a0',eye:'glow',glow:'#ffd34d',mouth:'smile',extra:s?crown(50,8,.8)+sparkle(90,24,.8,'#d58aff'):''})};

// ===== 主人公 =====
// n：手に入れた装備の数（1〜6）。color：服、blade：剣の刃
function hero(n,color,blade){const tunic=color||(n>=4?'#7a4bc4':'#3b82c4'),skin='#ffd9b8',hair='#7a4a24',bl=blade||'#e8eef5';
const cape=n>=4?`<path d="M30 56 Q20 78 24 94 L76 94 Q80 78 70 56 Z" fill="#5a2a8a" stroke="${OL}" stroke-width="3"/><path d="M36 60 Q30 78 32 92" stroke="#7a4bc4" stroke-width="3" fill="none"/>`:'';
const sword=n>=2?`<g transform="rotate(-12 24 74)"><path d="M21 30 L27 30 L27 66 L24 71 L21 66 Z" fill="${bl}" stroke="${OL}" stroke-width="2.6"/><path d="M24 33 L24 64" stroke="#fff" stroke-width="1.4" opacity=".8"/><rect x="15" y="66" width="18" height="5" rx="2" fill="#ffd34d" stroke="${OL}" stroke-width="2.4"/><rect x="21.5" y="71" width="5" height="9" rx="1.5" fill="#8a5a2a" stroke="${OL}" stroke-width="2"/></g>`:'';
const shield=n>=3?`<g><path d="M66 62 L88 62 L88 76 Q88 88 77 94 Q66 88 66 76 Z" fill="#c9d3dc" stroke="${OL}" stroke-width="3"/><path d="M70 66 L84 66 L84 76 Q84 85 77 89 Q70 85 70 76 Z" fill="#c0392b"/><path d="M77 70 C82 76 80 82 77 84 C73 82 72 77 75 74 C75 77 77 77 77 70 Z" fill="#ffd34d"/></g>`:'';
const helmet=n===5?`<path d="M28 34 Q28 12 50 12 Q72 12 72 34 L72 38 L28 38 Z" fill="#c9d3dc" stroke="${OL}" stroke-width="3"/><path d="M28 36 L72 36" stroke="#8a96a3" stroke-width="3"/><path d="M42 12 C40 4 50 2 52 8 C56 2 64 6 60 12" fill="#fff" stroke="${OL}" stroke-width="2.2"/>`:'';
const crownH=n>=6?crown(50,6,.95):'';
return svg(`${ground(26,95)}${cape}<rect x="38" y="80" width="10" height="13" rx="3" fill="#2e3550" stroke="${OL}" stroke-width="2.6"/><rect x="52" y="80" width="10" height="13" rx="3" fill="#2e3550" stroke="${OL}" stroke-width="2.6"/><path d="M36 92 L49 92 L49 96 L35 96 Z M51 92 L64 92 L65 96 L51 96 Z" fill="#7a4a24" stroke="${OL}" stroke-width="2.4"/>
${part('t','M36 58 L64 58 Q68 58 69 64 L70 84 L30 84 L31 64 Q32 58 36 58 Z',tunic,{sx:5,sy:5})}<rect x="31" y="72" width="38" height="5" fill="#7a4a24" stroke="${OL}" stroke-width="2"/><rect x="47" y="71" width="6" height="7" rx="1" fill="#ffd34d" stroke="${OL}" stroke-width="1.6"/><path d="M44 58 L50 64 L56 58" fill="#fff" stroke="${OL}" stroke-width="2"/>
<path d="M32 62 Q24 66 24 76" stroke="${OL}" stroke-width="9" fill="none"/><path d="M32 62 Q24 66 24 76" stroke="${tunic}" stroke-width="5" fill="none"/><circle cx="24" cy="78" r="4.4" fill="${skin}" stroke="${OL}" stroke-width="2.4"/>
<path d="M68 62 Q76 66 76 76" stroke="${OL}" stroke-width="9" fill="none"/><path d="M68 62 Q76 66 76 76" stroke="${dark(tunic,.15)}" stroke-width="5" fill="none"/><circle cx="76" cy="78" r="4.4" fill="${skin}" stroke="${OL}" stroke-width="2.4"/>
${sword}${shield}
<circle cx="50" cy="38" r="23" fill="${hair}" stroke="${OL}" stroke-width="3"/>${part('f','M31 38 Q31 22 50 22 Q69 22 69 38 Q69 58 50 58 Q31 58 31 38 Z',skin,{sx:4,sy:4})}
<path d="M28 38 Q26 16 50 14 Q74 16 72 38 Q66 30 62 24 Q58 32 50 30 Q44 32 40 26 Q34 32 28 38 Z" fill="${hair}" stroke="${OL}" stroke-width="3"/><path d="M40 20 Q48 16 58 19" stroke="#a8693a" stroke-width="2.4" fill="none"/>
${eyes(42,58,42,{size:.9,color:'#3a2418'})}${blush(36,64,50)}${mouth(50,49,'smile',3.5)}${helmet}${crownH}`);}
function face(){return svg(`<circle cx="50" cy="48" r="38" fill="#7a4a24" stroke="${OL}" stroke-width="3"/>${part('f','M18 50 Q18 22 50 22 Q82 22 82 50 Q82 86 50 86 Q18 86 18 50 Z','#ffd9b8',{sx:5,sy:5})}<path d="M14 50 Q10 12 50 10 Q90 12 86 50 Q76 36 70 26 Q64 40 50 36 Q40 40 34 30 Q24 40 14 50 Z" fill="#7a4a24" stroke="${OL}" stroke-width="3"/>${eyes(37,63,56,{size:1.5,color:'#3a2418'})}${blush(26,74,68)}${mouth(50,68,'open',6)}`);}
// ===== 宝箱・たまご =====
function chest(r){const c=['#a0662e','#2aa89a','#8a4ac0','#e0a92a'][r],t=['#ffd34d','#ffd34d','#ffd34d','#fff4c0'][r];return svg(`${ground(36)}${r>=2?sparkle(14,24,1.2)+sparkle(86,30):''}${r>=3?sparkle(80,8,.9,'#fff'):''}${part('l','M14 44 Q14 24 50 24 Q86 24 86 44 L86 50 L14 50 Z',c,{sx:4,sy:4})}${part('b','M14 50 L86 50 L86 86 Q86 90 82 90 L18 90 Q14 90 14 86 Z',dark(c,.1),{sx:5,sy:5})}<path d="M26 26 L26 90 M74 26 L74 90" stroke="${t}" stroke-width="5"/><path d="M14 50 L86 50" stroke="${OL}" stroke-width="3"/><rect x="42" y="44" width="16" height="18" rx="3" fill="${t}" stroke="${OL}" stroke-width="2.6"/><circle cx="50" cy="51" r="2.6" fill="${OL}"/><path d="M50 51 v6" stroke="${OL}" stroke-width="2.4"/>`);}
function egg(rare){const c=rare?'#ffe27a':'#f6f1e6',p=rare?'#b06bd6':'#63dcc7';return svg(`${ground(26)}${rare?sparkle(16,26)+sparkle(84,40,.8):''}${part('e','M50 8 C74 8 84 46 84 64 C84 84 70 94 50 94 C30 94 16 84 16 64 C16 46 26 8 50 8 Z',c,{sx:6,sy:6,hl:shine(36,34,.9)})}<path d="M22 58 L32 50 L42 60 L52 50 L62 60 L72 50 L80 58" fill="none" stroke="${p}" stroke-width="4"/><circle cx="40" cy="76" r="4" fill="${p}"/><circle cx="62" cy="78" r="3" fill="${p}"/>`);}
return {
enemy:id=>ENEMY_ART[id]?url('e:'+id,ENEMY_ART[id]):null,
buddy:(id,stage)=>BUDDY_ART[id]?url(`b:${id}:${stage>=2?1:0}`,()=>BUDDY_ART[id](stage>=2)):null,
hero:(n,color,blade)=>url(`h:${n}:${color||''}:${blade||''}`,()=>hero(n,color,blade)),
face:()=>url('face',face),chest:r=>url('c:'+r,()=>chest(r)),egg:rare=>url('egg:'+(rare?1:0),()=>egg(rare))};
})();
window.Chars=Chars;
