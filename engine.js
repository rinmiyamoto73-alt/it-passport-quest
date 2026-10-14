'use strict';
// 学習エンジン：保存、間隔反復（忘れかけた頃にもう一度）、出題の選び方、毎日の仕掛け、宝箱、相棒、模試の採点、合格予測。
const KEY='itpassport-quest-v1',DAY=864e5;
// 箱（0〜5）ごとの次の出題までの日数。一発正解で1つ上がり、間違えると0に戻る
const BOX_DAYS=[0,1,3,7,14,30];
const EXAM={full:{count:100,minutes:120,label:'本番模試'},mini:{count:20,minutes:24,label:'ミニ模試'}};
const AREA_KEYS=Object.keys(AREAS);
// 全問題：IPA公開問題（pastq.js）とオリジナル問題（questions.js）
const ALL=[...(window.PAST||[]),...QUESTIONS].filter(q=>SUBS[q.sub]&&q.options?.length===4&&Number.isInteger(q.answer));
const QMAP=new Map(ALL.map(q=>[q.id,q]));
const isObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const blank=()=>({version:1,xp:0,answers:{},daily:{},sessions:[],stages:{},monsters:{},gold:0,items:{},look:{},title:null,buddies:{},buddy:null,eggs:[],chestBox:[],chests:{opened:0,pity:0},streak:{count:0,best:0,last:null,freezes:1},login:{last:null,days:0},missions:null,story:{seen:[]},mocks:[],restAt:0,goal:30});
let state=blank(),storageOK=true;
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return;const p=JSON.parse(raw);if(p.version!==1||!Number.isFinite(p.xp)||p.xp<0||!isObj(p.answers)||!isObj(p.daily)||!Array.isArray(p.sessions))return;const b=blank();state={...b,...p};for(const k of Object.keys(b))if(isObj(b[k])&&!isObj(state[k]))state[k]=b[k];else if(Array.isArray(b[k])&&!Array.isArray(state[k]))state[k]=b[k];
for(const [id,a] of Object.entries(state.answers))if(!isObj(a)||!Number.isInteger(a.attempts)||!Number.isInteger(a.correct)||a.correct<0||a.attempts<a.correct)delete state.answers[id];else{if(!Number.isInteger(a.box))a.box=a.review?0:Math.min(2,a.correct);if(!a.due)a.due=a.last||new Date().toISOString();}
for(const id of Object.keys(state.monsters))if(!ENEMIES[id])delete state.monsters[id];for(const id of Object.keys(state.buddies))if(!BUDDIES.some(b=>b.id===id))delete state.buddies[id];if(state.buddy&&!state.buddies[state.buddy])state.buddy=null;}catch{storageOK=false;}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{if(storageOK&&typeof toast==='function')toast('この端末に保存できません');storageOK=false;}}
function dayKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
const dayDiff=(a,b)=>Math.round((new Date(b+'T00:00')-new Date(a+'T00:00'))/DAY);
function level(){return Math.floor(state.xp/100)+1;}
function shuffle(a){return [...a].map(v=>({v,n:Math.random()})).sort((a,b)=>a.n-b.n).map(x=>x.v);}
const pick=a=>a[Math.floor(Math.random()*a.length)];
function seeded(seed){let s=0;for(const c of seed)s=(s*31+c.charCodeAt(0))%233280;return ()=>(s=(s*9301+49297)%233280)/233280;}

// ---- 間隔反復 ----
const ans=q=>state.answers[q.id];
const isDue=q=>{const a=ans(q);return !!a&&new Date(a.due).getTime()<=Date.now();};
const mastered=q=>(ans(q)?.box||0)>=2;
function dueQuestions(){return ALL.filter(isDue).sort((a,b)=>(ans(a).box-ans(b).box)||new Date(ans(a).due)-new Date(ans(b).due));}
function record(q,ok){const a=state.answers[q.id]||{attempts:0,correct:0,box:0};const fresh=!a.attempts;a.attempts++;if(ok)a.correct++;a.box=ok?Math.min(5,(a.box||0)+1):0;a.review=!ok;a.last=new Date().toISOString();a.due=new Date(Date.now()+BOX_DAYS[a.box]*DAY).toISOString();a.lastOk=ok;state.answers[q.id]=a;state.daily[dayKey()]=(state.daily[dayKey()]||0)+1;touchStreak();bump('solved');if(ok)bump('first');if(fresh)bump('new');growBuddy();return fresh;}
// 出題の優先順：忘れかけ（期限切れ）→ まだ解いていない → 久しぶり。count問を選ぶ
function choose(pool,count){const now=Date.now(),score=q=>{const a=ans(q);if(!a)return 1+Math.random();if(new Date(a.due).getTime()<=now)return a.box*.1+Math.random()*.05;return 2+a.box+Math.random();};return pool.map(q=>[score(q),q]).sort((a,b)=>a[0]-b[0]).slice(0,count).map(x=>x[1]);}
function subPool(sub){return ALL.filter(q=>q.sub===sub);}
function areaPool(area){return ALL.filter(q=>SUBS[q.sub].area===area);}
function subMastery(sub){const p=subPool(sub);return p.length?p.filter(mastered).length/p.length:0;}
function subStars(sub){const r=state.stages[sub];if(!r)return 0;const m=subMastery(sub);return m>=.8?3:m>=.4?2:1;}
function subsOf(area){return Object.keys(SUBS).filter(k=>SUBS[k].area===area&&subPool(k).length);}
function subUnlocked(sub){const list=subsOf(SUBS[sub].area),i=list.indexOf(sub);return i<=0||!!state.stages[list[i-1]];}
function bossUnlocked(area){return subsOf(area).every(s=>state.stages[s]);}
// 合格予測：問題ごとの正解しやすさ（未回答は4択の当てずっぽう25%）の平均×1000
const P_BY_BOX=[.3,.6,.8,.9,.95,.97];
function predict(){const out={};let sum=0,n=0;for(const area of AREA_KEYS){const p=areaPool(area);const s=p.reduce((t,q)=>{const a=ans(q);return t+(a?P_BY_BOX[a.box]:.25);},0);out[area]=p.length?Math.round(s/p.length*1000):0;sum+=s;n+=p.length;}out.total=n?Math.round(sum/n*1000):0;out.pass=out.total>=600&&AREA_KEYS.every(a=>out[a]>=300);return out;}

// ---- 毎日の仕掛け ----
// 連続日数：休んだ日は「おやすみチケット」で自動的に埋める。チケットは7日続くごとに1枚（最大2枚）
function touchStreak(){const t=dayKey(),s=state.streak;if(s.last===t)return;const gap=s.last?dayDiff(s.last,t):1;if(gap===1)s.count++;else if(gap>1&&gap-1<=s.freezes){s.freezes-=gap-1;s.count++;toastLater(`おやすみチケットで れんぞく記録を まもった！`);}else s.count=1;s.last=t;s.best=Math.max(s.best,s.count);if(s.count%7===0&&s.freezes<2){s.freezes++;toastLater('おやすみチケットを 1枚 てにいれた！');}}
// ログインボーナス：7日で1周、7日目はレアの宝箱
function loginBonus(){const t=dayKey();if(state.login.last===t)return null;state.login.last=t;state.login.days=state.login.days%7+1;const d=state.login.days,r=d===7?{chest:2}:d===4?{chest:1}:{gold:20+d*10};if(r.chest!==undefined)state.chestBox.push(r.chest);else state.gold+=r.gold;save();return {day:d,...r};}
function todayMissions(){const t=dayKey();if(state.missions?.day!==t){const rnd=seeded(t),pool=[...MISSION_POOL].sort(()=>rnd()-.5),list=[];for(const m of pool){if(list.length===3)break;if(!list.some(x=>x.key===m.key))list.push({id:m.id,progress:0,claimed:false});}state.missions={day:t,list,bonus:false};}return state.missions;}
function bump(key,n=1){const ms=todayMissions();for(const m of ms.list){const def=MISSION_POOL.find(d=>d.id===m.id);if(def?.key!==key)continue;m.progress=key==='combo'?Math.max(m.progress,n):m.progress+n;}}
function claimMission(i){const ms=todayMissions(),m=ms.list[i],def=MISSION_POOL.find(d=>d.id===m?.id);if(!m||m.claimed||m.progress<def.target)return false;m.claimed=true;state.chestBox.push(0);if(!ms.bonus&&ms.list.every(x=>x.claimed)){ms.bonus=true;state.chestBox.push(1);}save();return true;}
// 休憩ボーナス：3時間ごとに宝箱が1つ届く（スキマ時間に戻ってくる理由）
const REST_MS=3*36e5;
function restReady(){return Date.now()>=state.restAt;}
function claimRest(){if(!restReady())return false;state.restAt=Date.now()+REST_MS;state.chestBox.push(0);save();return true;}

// ---- 宝箱 ----
function rollRarity(bonus=0){const w=RARITY.map((r,i)=>r.weight*(i?1+bonus:1)),total=w.reduce((a,b)=>a+b,0);let x=Math.random()*total;for(let i=0;i<w.length;i++){if((x-=w[i])<0)return i;}return 0;}
// 宝箱を開ける。10回スーパーレア以上が出ないと、次は必ずスーパーレア以上（天井）
function openChest(rarity){state.chests.opened++;let r=rarity;if(state.chests.pity>=9&&r<2)r=2;state.chests.pity=r>=2?0:state.chests.pity+1;const gold=[10,30,80,200][r]+Math.floor(Math.random()*10);state.gold+=gold;const pool=LOOT.filter(l=>l.rarity===r&&(l.type==='egg'||!state.items[l.id]));let item=pool.length?pick(pool):null;if(item?.type==='egg')state.eggs.push({rare:item.id==='egg_rare',progress:0});else if(item)state.items[item.id]=true;save();return {rarity:r,gold,item};}
// たまごは30問で ふ化。相棒は一緒に解いた問題数で育つ
const EGG_NEED=30;
function growBuddy(){if(state.buddy)state.buddies[state.buddy]=(state.buddies[state.buddy]||0)+1;const egg=state.eggs[0];if(egg){egg.progress++;}}
function hatchable(){return state.eggs.length&&state.eggs[0].progress>=EGG_NEED;}
function hatch(){if(!hatchable())return null;const egg=state.eggs.shift(),pool=BUDDIES.filter(b=>(egg.rare?b.rare:!b.rare)&&!(b.id in state.buddies)),b=pick(pool.length?pool:BUDDIES.filter(x=>egg.rare?x.rare:!x.rare));if(!(b.id in state.buddies))state.buddies[b.id]=0;if(!state.buddy)state.buddy=b.id;save();return b;}
function buddyStage(id){const xp=state.buddies[id]||0;return BUDDY_STAGES.reduce((s,st,i)=>xp>=st.at?i:s,0);}
function buddyName(id){const b=BUDDIES.find(x=>x.id===id),st=BUDDY_STAGES[buddyStage(id)].name;return st?`${st}${b.name}`:b.name;}

// ---- ストーリー ----
function storyOpen(ch){const n=ch.need,total=Object.values(state.answers).reduce((t,a)=>t+a.attempts,0);if(n.answered!==undefined)return total>=n.answered;if(n.bossClear)return !!state.stages['boss-'+n.bossClear];if(n.mockPass)return state.mocks.some(m=>m.kind==='full'&&m.pass);return false;}
function newStories(){return STORY.filter(c=>storyOpen(c)&&!state.story.seen.includes(c.id));}
function nextStoryHint(){const c=STORY.find(c=>!storyOpen(c));if(!c)return null;const n=c.need,total=Object.values(state.answers).reduce((t,a)=>t+a.attempts,0);if(n.answered!==undefined)return `あと ${n.answered-total}問で「${c.title}」`;if(n.bossClear)return `${AREAS[n.bossClear].name}の ボスを たおすと「${c.title}」`;return `本番模試に 合格すると「${c.title}」`;}

// ---- 模試 ----
function buildExam(kind,src){let qs;if(src){qs=ALL.filter(q=>q.src===src).sort((a,b)=>a.no-b.no);}else{const n=EXAM[kind].count;qs=AREA_KEYS.flatMap(area=>{const want=Math.round(n*AREAS[area].share/100),pool=shuffle(areaPool(area).filter(q=>q.past||kind==='mini'));return choose(pool,want);});}
return {kind,src:src||null,questions:qs,answers:Array(qs.length).fill(null),flags:Array(qs.length).fill(false),index:0,endsAt:Date.now()+EXAM[kind].minutes*6e4,startedAt:Date.now(),done:false};}
function scoreExam(ex){const by={};for(const area of AREA_KEYS)by[area]={c:0,n:0};let c=0;ex.questions.forEach((q,i)=>{const area=SUBS[q.sub].area,ok=ex.answers[i]===q.answer;by[area].n++;if(ok){by[area].c++;c++;}});const fields={};for(const a of AREA_KEYS)fields[a]=by[a].n?Math.round(by[a].c/by[a].n*1000):0;const total=Math.round(c/ex.questions.length*1000);return {total,fields,correct:c,count:ex.questions.length,pass:total>=600&&AREA_KEYS.every(a=>fields[a]>=300)};}
let pendingToasts=[];function toastLater(m){pendingToasts.push(m);}
load();
