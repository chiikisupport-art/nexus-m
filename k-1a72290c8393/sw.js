'use strict';
const CACHE='nexus-kaicho-shell-v7';
const FILES=['./','./index.html','./mobile.css','./mobile-platform.js','./onboard.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nexus-kaicho-shell-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
// 起動ロゴの絵は、しまっておいた物を先に使う（2026-11-21 監査：しばらく置いて開くと毎回ネットから取り直し、約1秒黒くなってロゴの出方がばらつく）
const BOOT_IMG = ['logo-big.webp', 'boot-mask.webp'], BOOT_CACHE = 'nexus-kaicho-bootimg-v1';
self.addEventListener('install', e => e.waitUntil(caches.open(BOOT_CACHE).then(c => c.addAll(BOOT_IMG.map(n => './' + n))).catch(() => {})));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin || !BOOT_IMG.some(n => u.pathname.endsWith('/' + n))) return;
  e.respondWith(caches.open(BOOT_CACHE).then(c => c.match(u.pathname).then(r => r || fetch(e.request).then(x => { if (x.ok) c.put(u.pathname, x.clone()); return x; }))));
});

self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.search||!FILES.some(p=>new URL(p,self.registration.scope).href===u.href))return;e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok){const k=r.clone();caches.open(CACHE).then(c=>c.put(e.request,k));}return r;}).catch(()=>caches.match(e.request)));});
