'use strict';
// 世界の定義。エリア＝試験の3分野、ダンジョン＝シラバスの中分類（23）。問題は sub（中分類ID）でダンジョンに結びつく。
const AREAS={
strategy:{name:'知恵の森',field:'ストラテジ',desc:'企業活動・法務・経営戦略・システム戦略',scene:'forest',boss:'kingslime',share:35},
management:{name:'調和の塔',field:'マネジメント',desc:'開発・プロジェクト・サービス・監査',scene:'tower',boss:'pmgolem',share:20},
technology:{name:'技術の遺跡',field:'テクノロジ',desc:'基礎理論・コンピュータ・DB・ネットワーク・セキュリティ',scene:'ruins',boss:'malwarerobo',share:45}};
const SUBS={
s1:{area:'strategy',name:'企業活動',enemy:'leafslime'},
s2:{area:'strategy',name:'法務',enemy:'copyghost'},
s3:{area:'strategy',name:'経営戦略マネジメント',enemy:'swotdake'},
s4:{area:'strategy',name:'技術戦略マネジメント',enemy:'roadbat'},
s5:{area:'strategy',name:'ビジネスインダストリ',enemy:'marketgolem'},
s6:{area:'strategy',name:'システム戦略',enemy:'cloudslime'},
s7:{area:'strategy',name:'システム企画',enemy:'rfpbook'},
m1:{area:'management',name:'システム開発技術',enemy:'waterdake'},
m2:{area:'management',name:'ソフトウェア開発管理技術',enemy:'agilebat'},
m3:{area:'management',name:'プロジェクトマネジメント',enemy:'ganttghost'},
m4:{area:'management',name:'サービスマネジメント',enemy:'helprobo'},
m5:{area:'management',name:'システム監査',enemy:'auditbook'},
t1:{area:'technology',name:'基礎理論',enemy:'bitslime'},
t2:{area:'technology',name:'アルゴリズムとプログラミング',enemy:'flowbook'},
t3:{area:'technology',name:'コンピュータ構成要素',enemy:'cpugolem'},
t4:{area:'technology',name:'システム構成要素',enemy:'serverrobo'},
t5:{area:'technology',name:'ソフトウェア',enemy:'osghost'},
t6:{area:'technology',name:'ハードウェア',enemy:'memorydake'},
t7:{area:'technology',name:'ヒューマンインタフェース',enemy:'uibat'},
t8:{area:'technology',name:'マルチメディア',enemy:'pixelslime'},
t9:{area:'technology',name:'データベース',enemy:'sqlbook'},
t10:{area:'technology',name:'ネットワーク',enemy:'packetbat'},
t11:{area:'technology',name:'セキュリティ',enemy:'virusdake'}};
// sprite は sprites.js の形、pal はその色。boss は王冠付きで大きく表示する
const ENEMIES={
leafslime:{name:'リーフスライム',sprite:'slime',pal:{a:'#7ccf5a',b:'#d2f7a8',c:'#3f8a3a',r:'#f0a08a'},desc:'森の案内役。会社のしくみに くわしい。'},
copyghost:{name:'コピーライトゴースト',sprite:'ghost',pal:{a:'#f5e6b8',b:'#ffffff',c:'#c9b27a',r:'#f0a0a0'},desc:'無断コピーを見つけると あらわれる。'},
swotdake:{name:'スウォットダケ',sprite:'mushroom',pal:{a:'#d9534f',b:'#f3e3c3',c:'#8f2f2c',w:'#fff4e0'},desc:'強み・弱み・機会・脅威の4つの胞子をまく。'},
roadbat:{name:'ロードマップバット',sprite:'bat',pal:{a:'#8a6bd6',c:'#4e3a8a',k:'#1a1420',w:'#ffe27a'},desc:'技術の未来を先回りして飛ぶ。'},
marketgolem:{name:'マーケットゴーレム',sprite:'golem',pal:{a:'#7f9a6a',b:'#b3c99c',c:'#4f6343',y:'#ffe27a'},desc:'市場の動きを読みながら、ゆっくり動く。'},
cloudslime:{name:'クラウドスライム',sprite:'slime',pal:{a:'#e8f4ff',b:'#ffffff',c:'#9cc4e8',r:'#f0b0c0'},desc:'どこにでも あらわれ、必要なぶんだけ増える。'},
rfpbook:{name:'RFPブック',sprite:'book',pal:{a:'#f0e0c0',b:'#a0522d',y:'#d4a017'},desc:'提案依頼書のまもの。要件を ぎっしり書きこむ。'},
waterdake:{name:'ウォーターフォールダケ',sprite:'mushroom',pal:{a:'#4f9be8',b:'#e8f0ff',c:'#2a5f9e',w:'#cfe8ff'},desc:'上から下へ、決して後戻りしない。'},
agilebat:{name:'アジャイルバット',sprite:'bat',pal:{a:'#3fc48a',c:'#1f7a52',k:'#1a1420',w:'#ffffff'},desc:'短い周期で何度も飛び直す。'},
ganttghost:{name:'ガントゴースト',sprite:'ghost',pal:{a:'#d9d4f5',b:'#ffffff',c:'#9a92c9',r:'#f0a0c0'},desc:'横棒の予定表にとりつく。遅れを見つけると さわぐ。'},
helprobo:{name:'ヘルプデスクロボ',sprite:'robot',pal:{a:'#f0c060',b:'#63dcc7',c:'#a07a30',y:'#ffffff'},desc:'問い合わせを24時間受け付ける。SLAが口ぐせ。'},
auditbook:{name:'カンサブック',sprite:'book',pal:{a:'#d8e0e8',b:'#2f4f6f',y:'#c0392b'},desc:'独立した立場で すべてを記録する。'},
bitslime:{name:'ニシンスウスライム',sprite:'slime',pal:{a:'#9fb3c8',b:'#e0ecf8',c:'#5c6f84',r:'#ff9ec7'},desc:'0と1しか話さない。'},
flowbook:{name:'フローチャートブック',sprite:'book',pal:{a:'#e8fff0',b:'#2f8a5f',y:'#3fd0c9'},desc:'ページをめくると 処理の流れが見える。'},
cpugolem:{name:'CPUゴーレム',sprite:'golem',pal:{a:'#5a6a7a',b:'#8a9aaa',c:'#3a4a5a',y:'#63dcc7'},desc:'クロックに合わせて 正確に動く。'},
serverrobo:{name:'サーバーロボ',sprite:'robot',pal:{a:'#9fb3c8',b:'#63dcc7',c:'#5c6f84',y:'#ffe27a'},desc:'たくさんの依頼を同時にさばく。'},
osghost:{name:'OSゴースト',sprite:'ghost',pal:{a:'#b8f0d0',b:'#ffffff',c:'#6cb890',r:'#f0a0c0'},desc:'ハードとアプリの間に ひそんでいる。'},
memorydake:{name:'メモリダケ',sprite:'mushroom',pal:{a:'#e89a3f',b:'#fff0d8',c:'#9e5a1a',w:'#fff8e8'},desc:'電源が切れると すべてを忘れる。'},
uibat:{name:'UIバット',sprite:'bat',pal:{a:'#ff9ec7',c:'#b05a80',k:'#1a1420',w:'#ffffff'},desc:'使いやすさを求めて 画面を飛び回る。'},
pixelslime:{name:'ピクセルスライム',sprite:'slime',pal:{a:'#ff6b6b',b:'#ffd0d0',c:'#a03030',r:'#ffe27a'},desc:'RGBの3色で できている。'},
sqlbook:{name:'SQLブック',sprite:'book',pal:{a:'#e0e8ff',b:'#3a4a9e',y:'#ffd34d'},desc:'SELECTと となえると 中身を見せてくれる。'},
packetbat:{name:'パケットバット',sprite:'bat',pal:{a:'#5ad6c9',c:'#2a8a80',k:'#1a1420',w:'#ffffff'},desc:'データを小さく分けて 運んでいく。'},
virusdake:{name:'ウイルスダケ',sprite:'mushroom',pal:{a:'#7bd44a',b:'#e9f5d0',c:'#3f7a22',w:'#2b2b2b'},desc:'胞子で増える。ウイルス対策ソフトが苦手。'},
kingslime:{name:'キングスライム',sprite:'slime',boss:true,pal:{a:'#4fb3e8',b:'#cdeeff',c:'#2a6f9e',r:'#f0a08a'},desc:'知恵の森の主。ストラテジの王冠をかぶる。'},
pmgolem:{name:'PMゴーレム',sprite:'golem',boss:true,pal:{a:'#c9a14a',b:'#f0d58a',c:'#7d6128',y:'#63dcc7'},desc:'調和の塔の番人。品質・コスト・納期を見張る。'},
malwarerobo:{name:'マルウェアロボ',sprite:'robot',boss:true,pal:{a:'#c0392b',b:'#ff9e9e',c:'#7a1f16',y:'#ffe27a'},desc:'技術の遺跡の奥にひそむ。パスワードを狙う。'},
forgetghost:{name:'ワスレンボゴースト',sprite:'ghost',pal:{a:'#a8c8ff',b:'#ffffff',c:'#6c8ccc',r:'#ffb0c8'},desc:'忘れかけた問題に集まる。思い出すと消える。'},
noiseking:{name:'ノイズキング',sprite:'ghost',boss:true,pal:{a:'#3a2f5a',b:'#8a6bd6',c:'#1f1838',r:'#ff6b6b',k:'#ffd34d'},desc:'知識をノイズで消そうとする 試験の門の主。'}};
// 1回の学習でもらえるもの
const XP_RULE={first:20,retry:10,miss:5};
// レベルで手に入る装備（見た目が変わる）
const GEAR=[{lv:1,name:'ぬののふく',desc:'冒険のはじまりの服'},{lv:3,name:'ロジックソード',desc:'筋の通った考えで切りひらく'},{lv:5,name:'ファイアウォールの盾',desc:'あやしい通信をはね返す'},{lv:8,name:'暗号のマント',desc:'大事な情報を見えなくする'},{lv:12,name:'クラウドのかぶと',desc:'どこからでも知識を呼び出せる'},{lv:20,name:'マスターの王冠',desc:'ITの基礎をきわめた証'}];
const TITLES=[[1,'見習い冒険者'],[3,'駆け出し剣士'],[5,'守りの戦士'],[8,'暗号の旅人'],[12,'クラウドの騎士'],[20,'ITマスター'],[30,'伝説の賢者']];
// 宝箱の中身。rarity：0ふつう 1レア 2スーパーレア 3レジェンド
const RARITY=[{name:'ふつう',color:'#c9d3dc',weight:62},{name:'レア',color:'#63dcc7',weight:27},{name:'スーパーレア',color:'#d58aff',weight:9},{name:'レジェンド',color:'#ffd34d',weight:2}];
const LOOT=[
{id:'c_green',type:'color',rarity:0,name:'みどりの ふく',color:'#3f9a4a'},{id:'c_red',type:'color',rarity:0,name:'あかい ふく',color:'#c0392b'},{id:'c_gray',type:'color',rarity:0,name:'はいいろの ふく',color:'#7a8290'},{id:'c_orange',type:'color',rarity:0,name:'オレンジの ふく',color:'#e8833a'},
{id:'c_teal',type:'color',rarity:1,name:'ターコイズの ふく',color:'#1fa89a'},{id:'c_pink',type:'color',rarity:1,name:'さくらの ふく',color:'#e87aa8'},{id:'c_navy',type:'color',rarity:1,name:'しっこくの ふく',color:'#26305e'},
{id:'c_gold',type:'color',rarity:2,name:'こがねの ふく',color:'#d4a017'},{id:'c_white',type:'color',rarity:2,name:'しろがねの ふく',color:'#e8eef5'},
{id:'w_fire',type:'blade',rarity:1,name:'ほのおの つるぎ',color:'#ff7a3a'},{id:'w_ice',type:'blade',rarity:1,name:'こおりの つるぎ',color:'#8fd8ff'},{id:'w_thunder',type:'blade',rarity:2,name:'いかずちの つるぎ',color:'#ffe27a'},{id:'w_shadow',type:'blade',rarity:2,name:'やみの つるぎ',color:'#8a6bd6'},
{id:'a_mint',type:'aura',rarity:2,name:'ミントの オーラ',color:'#b9f46b'},{id:'a_gold',type:'aura',rarity:3,name:'おうごんの オーラ',color:'#ffd34d'},{id:'a_rainbow',type:'aura',rarity:3,name:'にじいろの オーラ',color:'rainbow'},
{id:'t_night',type:'title',rarity:0,name:'夜ふかし学者',desc:''},{id:'t_coffee',type:'title',rarity:0,name:'コーヒー片手の冒険者'},{id:'t_bit',type:'title',rarity:1,name:'ビットの申し子'},{id:'t_packet',type:'title',rarity:1,name:'パケットの運び手'},{id:'t_root',type:'title',rarity:2,name:'root権限の持ち主'},{id:'t_legend',type:'title',rarity:3,name:'伝説のパスポーター'},
{id:'egg',type:'egg',rarity:1,name:'あいぼうの たまご'},{id:'egg_rare',type:'egg',rarity:2,name:'ひかる たまご'}];
// 相棒。たまごから生まれ、一緒に解いた問題数で育つ
const BUDDIES=[
{id:'b_slime',sprite:'slime',name:'プルン',pal:{a:'#ff9ec7',b:'#ffe0ef',c:'#b05a80',r:'#ffffff'}},{id:'b_ghost',sprite:'ghost',name:'フワリ',pal:{a:'#cfe8ff',b:'#ffffff',c:'#8cb0d8',r:'#ffb0c8'}},
{id:'b_mush',sprite:'mushroom',name:'キノッピ',pal:{a:'#ffd34d',b:'#fff4e0',c:'#b08a20',w:'#ffffff'}},{id:'b_bat',sprite:'bat',name:'パタパタ',pal:{a:'#5a6ad6',c:'#2a3a8a',k:'#1a1420',w:'#ffd34d'}},
{id:'b_robo',sprite:'robot',name:'ピコ',pal:{a:'#e8eef5',b:'#ff9ec7',c:'#9aa8b8',y:'#63dcc7'}},{id:'b_book',sprite:'book',name:'ヨミ',pal:{a:'#fff4d8',b:'#7a3a8a',y:'#63dcc7'}},
{id:'b_gold',sprite:'slime',name:'キンプル',rare:true,pal:{a:'#ffd34d',b:'#fff4c0',c:'#b08a20',r:'#ff9ec7'}},{id:'b_dark',sprite:'ghost',name:'ヤミー',rare:true,pal:{a:'#3a2f5a',b:'#8a6bd6',c:'#1f1838',r:'#ff6b6b',k:'#ffd34d'}}];
const BUDDY_STAGES=[{at:0,name:'ちび'},{at:60,name:''},{at:250,name:'キング'}];
// ストーリー。need：その章を読めるようになる条件
const STORY=[
{id:1,title:'第1話 ノイズの夜',need:{answered:0},lines:[['narr','その夜、データの大陸から 知識の光が消えた。'],['king','フハハ…すべての知識を ノイズで うめつくしてやる。'],['narr','残されたのは 3つの土地にねむる「知識のクリスタル」だけ。'],['buddy','…だれか いる？ きみが うわさの 冒険者？'],['narr','こうして、あなたの旅が はじまった。']]},
{id:2,title:'第2話 森のささやき',need:{answered:20},lines:[['buddy','知恵の森は 会社や お金のことを 知っている森なんだ。'],['narr','木々の間から、スウォットダケの胞子が ただよってくる。'],['buddy','あれ…？ あのキノコ、目が 赤く光ってる！'],['king','森のクリスタルは もうすぐ 私のものだ…。']]},
{id:3,title:'第3話 ひとつめの光',need:{bossClear:'strategy'},lines:[['narr','キングスライムが 倒れると、森に光が もどった。'],['buddy','やった！ 知恵のクリスタルだ！'],['king','…ほう。少しは やるようだな。'],['king','だが 調和の塔は そう簡単には いかんぞ。'],['narr','空の向こうで、塔の時計が 狂ったように 鳴りはじめた。']]},
{id:4,title:'第4話 狂った時計塔',need:{answered:120},lines:[['narr','調和の塔では、すべての予定が バラバラに 動いていた。'],['buddy','ガントゴーストが 予定表を めちゃくちゃに してる…！'],['buddy','計画、品質、納期。ぜんぶ そろえないと 塔は 止まらないんだ。']]},
{id:5,title:'第5話 番人の正体',need:{bossClear:'management'},lines:[['narr','PMゴーレムの 体から ノイズが ぬけていく。'],['buddy','あやつられて いただけ だったんだね…。'],['narr','ゴーレムは 静かに、ふたつめのクリスタルを さしだした。'],['king','次は 技術の遺跡だ。そこで おまえの 旅は 終わる。']]},
{id:6,title:'第6話 遺跡の奥へ',need:{answered:250},lines:[['narr','技術の遺跡。0と1の光が 床を 走っている。'],['buddy','ここは ネットワークや セキュリティの 知識が ねむる場所。'],['buddy','…ねえ、パスワード、使い回して ないよね？'],['narr','遠くで マルウェアロボの 目が 光った。']]},
{id:7,title:'第7話 3つのクリスタル',need:{bossClear:'technology'},lines:[['narr','3つのクリスタルが そろい、大陸に 光が もどりはじめた。'],['king','…まだだ。「試験の門」で 待っている。'],['buddy','試験の門…。本番と 同じ 100問の たたかい だよ。'],['buddy','でも、ここまで 来た きみなら きっと 大丈夫。']]},
{id:8,title:'最終話 試験の門',need:{mockPass:1},lines:[['narr','100問の 嵐を くぐりぬけ、ノイズキングが ひざを つく。'],['king','…なぜだ。なぜ 知識は 消えない…。'],['buddy','くり返し 学んだ 知識は、ノイズなんかじゃ 消せないんだ！'],['narr','門が ひらく。その先は──本物の 試験会場。'],['buddy','いってらっしゃい。きみなら 合格できる！']]}];
// 毎日のミッション候補（毎日3つ選ぶ）
const MISSION_POOL=[
{id:'solve10',text:'問題を 10問 とく',key:'solved',target:10},{id:'solve20',text:'問題を 20問 とく',key:'solved',target:20},
{id:'first5',text:'一発正解を 5回',key:'first',target:5},{id:'combo5',text:'5コンボを 出す',key:'combo',target:5},
{id:'review3',text:'ふくしゅうを 3問',key:'review',target:3},{id:'quest2',text:'クエストを 2回 クリア',key:'quest',target:2},
{id:'mini1',text:'ミニ模試に ちょうせん',key:'mock',target:1},{id:'new5',text:'はじめての問題を 5問',key:'new',target:5}];
