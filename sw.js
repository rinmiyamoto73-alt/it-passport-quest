// オフラインでも遊べるよう、アプリのファイルを端末に保存する。ファイルを更新したら VERSION を上げる
const VERSION='ipq-v6';
const FILES=['./','index.html','style.css','questions.js','pastq.js','world.js','sprites.js','audio.js','fx.js','engine.js','app.js','manifest.webmanifest','img/icon-192.png','img/icon-512.png','img/r04-015.png','img/r04-032.png','img/r04-043.png','img/r04-079.png','img/r04-090.png','img/r04-097.png','img/r05-041.png','img/r05-059.png','img/r05-086.png','img/r06-041.png','img/r06-060.png','img/r06-067.png','img/r08-072.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// 自分のファイルはネット優先（新しい版を取りに行き、つながらなければ保存した版）。フォントなどは保存した版を優先
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const url=new URL(e.request.url);if(url.origin===location.origin){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(VERSION).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request)));}else{e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(VERSION).then(c=>c.put(e.request,copy));return r;})));}});
