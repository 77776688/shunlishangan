/* 上岸修行录 · 离线缓存（单文件版） */
const CACHE='shangan-single-v1';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html']).catch(()=>
    Promise.all(['./','./index.html'].map(u=>c.add(u).catch(()=>null))))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  if(new URL(r.url).origin!==self.location.origin)return;
  e.respondWith(caches.match(r).then(hit=>{
    if(hit){fetch(r).then(res=>{if(res&&res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()))}).catch(()=>{});return hit}
    return fetch(r).then(res=>{
      if(res&&res.ok){const c2=res.clone();caches.open(CACHE).then(c=>c.put(r,c2))}
      return res;
    }).catch(()=>r.mode==='navigate'?caches.match('./index.html'):new Response('',{status:504}));
  }));
});
