'use strict';
// ドット絵。8文字の行は左半分で、左右反転して16×16にする。16文字の行はそのまま使う。
// 色の文字：o輪郭 a本体 b明るい c暗い k黒 w白 r赤み y金 h髪 s肌 m金属。'.'は透明
const PIX={
slime:['........','........','........','.......o','......ob','.....oba','....obaa','...oaaaa','..oaaaaa','..oawkaa','.oaakkaa','.oaaaaaa','.oraaaaa','.ocaaaak','..occccc','...ooooo'],
ghost:['........','.....ooo','....oaaa','...oabaa','..oabaaa','..oaaaaa','.oaaakka','.oaaakka','.oaaaaaa','.oraaaak','oaaaaaaa','oaaaaaaa','oaaaaaaa','ocaacaac','oo.oo.oo','........'],
mushroom:['........','........','.....ooo','...ooaaa','..oawwaa','.oawwwaa','.oaawaaa','oaaaaaaw','oaaaaaww','occccccc','.ooobbbb','...obkbb','...obkbb','...obbbk','...obbbb','....oooo'],
golem:['........','....oooo','...oaaaa','...oabaa','...oayaa','...oaaaa','.ooocccc','oaboaaaa','oaaoabaa','oaaoaaaa','oaaoaaca','ocooaaaa','.o.occcc','...oaao.','...oaao.','...oooo.'],
robot:['.......y','.......o','...ooooo','..oaaaaa','..obbbbb','..obkbbb','..obbbbb','..oaaaaa','...ooooo','.ooaaaaa','oaoayaaa','oaoaaaaa','.ooaaaaa','...oaao.','...oaao.','...oooo.'],
bat:['........','........','........','....o...','....oo..','o...oaoo','oo..oaaa','oao.oaka','oaaooaaa','oaaaoaaw','oaoaoaaa','o.oa.oaa','...o..oo','........','........','........'],
book:['........','........','..oooooo','.obbbbbb','.obaaaaa','.obaaaaa','.obawkaa','.obakkaa','.obaaaaa','.obaaaak','.obaaaaa','.obyyyyy','.obaaaaa','..oooooo','........','........'],
hero:['........','....oooo','...ohhhh','..ohhhhh','..ohssss','..ohskss','...ossss','....osss','...oaaaa','..oaaaaa','.oaoaaaa','.osobbbb','..ooaaaa','...occo.','...obbo.','...oooo.']};
const OVERLAY={
crown:['....y..yy..y....','....yyyyyyyy....','....yryyyyyry...'],
sword:['.w..............','.w..............','.w..............','.w..............','.w..............','.w..............','.w..............','yyy.............','.b..............'],
shield:['...........ooooo','...........oyyyo','...........oyryo','...........oyyyo','............oyo.','.............o..'],
helmet:['.......rr.......','....oooooooo....','...ommmmmmmmo...','..ommwmmmmmmmo..','..om........mo..']};
const BASE_PAL={o:'#1a1420',k:'#1a1420',w:'#ffffff'};
const CROWN_PAL={o:'#1a1420',y:'#ffd34d',r:'#e05a5a'};
// 地面のタイル：[地の色, 模様の色1, 模様の色2]
const TILES={forest:['#2e6b39','#3d8a46','#24552e'],tower:['#5a5470','#47425a','#6a6484'],ruins:['#1d2540','#3fd0c9','#2a3558'],field:['#4a8a3a','#5ea04a','#3a7030'],dream:['#3a2f5a','#5a4a8a','#2e2448']};
const Sprites=(()=>{
const cache=new Map();
const full=rows=>rows.map(r=>r.length===16?r:r+[...r].reverse().join(''));
function paint(ctx,rows,pal,dy=0){rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch==='.'||!pal[ch])return;ctx.fillStyle=pal[ch];ctx.fillRect(x,y+dy,1,1);}));}
function url(key,h,draw){if(!cache.has(key)){const c=document.createElement('canvas');c.width=16;c.height=h;draw(c.getContext('2d'));cache.set(key,c.toDataURL());}return cache.get(key);}
// 32×32の新しい絵（spritedata.js）。swap は {元の色: 新しい色}。なければ下の16×16の絵を使う
const ART=window.SPRITE_DATA||{},CH='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&()*+,-/:;<=>?@[]^_{|}~';
function art(name,swap={},key=name){const s=ART[name];if(!s)return null;if(!cache.has('A:'+key)){const c=document.createElement('canvas');c.width=c.height=32;const ctx=c.getContext('2d');for(let i=0;i<1024;i++){const ch=s.d[i];if(ch==='.')continue;const col=s.p[CH.indexOf(ch)];ctx.fillStyle=swap[col]||col;ctx.fillRect(i%32,i>>5,1,1);}cache.set('A:'+key,c.toDataURL());}return cache.get('A:'+key);}
const mix=(hex,to,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-t)+to*t).toString(16).padStart(2,'0')).join('');
// 主人公の服・剣は、指定の3色（明るい・ふつう・暗い）を選んだ色の3段階に置き換える
const TUNIC=[['#5a9edb','#3b82c4','#2a5f93'],['#9a6be0','#7a4bc4','#55328f']],BLADE=['#f4f8fb','#c9d3dc','#8a96a3'];
const shades=c=>[mix(c,255,.3),c,mix(c,0,.3)];
function swapOf(look){const sw={};if(look.color)for(const tri of TUNIC)shades(look.color).forEach((c,i)=>{sw[tri[i]]=c;});if(look.blade)shades(look.blade).forEach((c,i)=>{sw[BLADE[i]]=c;});return sw;}
// ボスは上に4マス足して、頭の上に王冠をのせる
function enemy(id){const a=art('enemy_'+id);if(a)return a;const e=ENEMIES[id],pal={...BASE_PAL,...e.pal},rows=full(PIX[e.sprite]);return url('e:'+id,e.boss?20:16,ctx=>{if(!e.boss)return paint(ctx,rows,pal);const top=rows.findIndex(r=>/[^.]/.test(r));paint(ctx,rows,pal,4);paint(ctx,OVERLAY.crown,CROWN_PAL,top+1);});}
// レベルで手に入れた装備の数に応じて見た目が変わる。color（服）と blade（剣）は宝箱で手に入る色
function hero(lv,look={}){const n=GEAR.filter(g=>lv>=g.lv).length,a=art('hero_'+n,swapOf(look),`hero_${n}:${look.color||''}:${look.blade||''}`);if(a)return a;return url(`h:${n}:${look.color||''}:${look.blade||''}`,16,ctx=>{paint(ctx,full(PIX.hero),{...BASE_PAL,h:'#7a4a24',s:'#f2c39b',a:look.color||(n>=4?'#7a4bc4':'#3b82c4'),c:'#2e3550',b:'#6b3f1f'});if(n>=2)paint(ctx,OVERLAY.sword,{w:look.blade||'#e8eef5',y:'#ffd34d',b:'#6b3f1f'},2);if(n>=3)paint(ctx,OVERLAY.shield,{o:'#1a1420',y:'#c9d3dc',r:'#e05a5a'},8);if(n>=6)paint(ctx,OVERLAY.crown,CROWN_PAL,0);else if(n>=5)paint(ctx,OVERLAY.helmet,{o:'#1a1420',m:'#c9d3dc',w:'#ffffff',r:'#e05a5a'},0);});}
function tile(kind){const [base,c1,c2]=TILES[kind];return url('t:'+kind,16,ctx=>{let seed=kind.length*7919;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;ctx.fillStyle=base;ctx.fillRect(0,0,16,16);
if(kind==='tower'){ctx.fillStyle=c1;for(let y=0;y<16;y+=4){ctx.fillRect(0,y,16,1);ctx.fillRect(y%8?8:0,y,1,4);}ctx.fillStyle=c2;for(let i=0;i<6;i++)ctx.fillRect(Math.floor(rnd()*16),Math.floor(rnd()*16),1,1);return;}
if(kind==='ruins'){ctx.fillStyle=c2;for(let i=0;i<14;i++)ctx.fillRect(Math.floor(rnd()*16),Math.floor(rnd()*16),1,1);ctx.fillStyle=c1;ctx.fillRect(0,5,10,1);ctx.fillRect(9,5,1,8);ctx.fillRect(9,12,7,1);ctx.fillRect(3,4,1,3);return;}
for(let i=0;i<46;i++){ctx.fillStyle=i%2?c1:c2;ctx.fillRect(Math.floor(rnd()*16),Math.floor(rnd()*16),1,i%5?1:2);}});}
// 相棒：育つと王冠がつく（stage 2）
function buddy(id,stage=0){const a=art(`buddy_${id}_${stage>=2?2:1}`);if(a)return a;const b=BUDDIES.find(x=>x.id===id),pal={...BASE_PAL,...b.pal},rows=full(PIX[b.sprite]);return url(`b:${id}:${stage>=2?1:0}`,stage>=2?20:16,ctx=>{if(stage<2)return paint(ctx,rows,pal);const top=rows.findIndex(r=>/[^.]/.test(r));paint(ctx,rows,pal,4);paint(ctx,OVERLAY.crown,CROWN_PAL,top+1);});}
// 宝箱とたまご
const CHEST=['................','................','................','................','..oooooooooooo..','.obbbbbbbbbbbbo.','.obaaaaaaaaaabo.','.oyyyyyoyyyyyyo.','.obaaaayyaaaabo.','.obaaaaoyaaaabo.','.obaaaaaaaaaabo.','.obaaaaaaaaaabo.','.obbbbbbbbbbbbo.','..oooooooooooo..','................','................'];
const EGG=['........','........','........','.......o','.....ooa','....oaaa','...oaaaa','...oabaa','..oaabba','..oaaaaa','..oaaaaa','..oaabaa','..oaaaaa','...oaaaa','....oooo','........'];
function chest(rarity){const a=art('chest_'+rarity);if(a)return a;const c=['#8a5a2a','#2a8a80','#7a3a9a','#b08a20'][rarity];return url('chest:'+rarity,16,ctx=>paint(ctx,CHEST,{o:'#1a1420',a:c,b:'#ffd34d',y:'#ffe9a0'}));}
function egg(rare){const a=art('egg_'+(rare?1:0));if(a)return a;return url('egg:'+(rare?1:0),16,ctx=>paint(ctx,full(EGG),{o:'#1a1420',a:rare?'#ffe27a':'#f4ecdc',b:rare?'#d58aff':'#63dcc7'}));}
const face=()=>art('hero_face');
return {enemy,hero,tile,buddy,chest,egg,face};
})();
