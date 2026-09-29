/* MysticNest: resilient install, network-first shell with cache fallback (never a blank 'not connected'), cache-first versioned art. */
importScripts('./deck-manifest.js');
const SHELL='mysticnest-shell-v32';
const ART='mysticnest-deck-'+MYSTIC_DECK.version;
const CORE=['./','./index.html','./deck.html','./i18n.js','./content-en.js','./followups-i18n.js','./language-switch.js','./manifest.json','./icon-192.png','./icon-512.png','./privacy_policy.html','./tarot.css','./tarot.js','./card-details.js','./dreams.js','./dream-library.js','./dream-engine.js','./improvements.js','./dream-next-data.js','./dream-next.js','./offline.js','./palm.js','./numerology.js','./horoscope.js','./coffee.js','./compatibility.js','./history.js','./assets/guide/palm-diagram.webp','./assets/guide/coffee-cup.webp','./deck-manifest.js'];
const scope=new URL('./',self.location.href);
const artPrefix=new URL(MYSTIC_DECK.base,scope).href;
const coreURLs=new Set(CORE.map(path=>new URL(path,scope).href));
self.addEventListener('install',event=>{event.waitUntil((async()=>{
  const cache=await caches.open(SHELL);
  // Resilient install: cache each file on its own so one failed/slow file can't abort the whole shell (fixes intermittent 'not connected').
  await Promise.allSettled(CORE.map(async path=>{
    const req=new Request(new URL(path,scope),{cache:'reload'});
    try{const res=await fetch(req); if(res&&res.ok) await cache.put(new URL(path,scope).href,res);}catch(e){}
  }));
  // Guarantee the offline fallback exists even if some files failed; retry the essentials once from the HTTP cache.
  const essentials=['./','./index.html','./deck-manifest.js','./i18n.js','./content-en.js','./tarot.js','./dreams.js'];
  await Promise.allSettled(essentials.map(async path=>{
    const href=new URL(path,scope).href; if(await cache.match(href,{ignoreSearch:true}))return;
    try{const res=await fetch(new URL(path,scope)); if(res&&res.ok) await cache.put(href,res);}catch(e){}
  }));
})());});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>{
  // Keep previous deck versions: another open window may still be using one.
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('mysticnest-shell-')&&key!==SHELL).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
async function getArt(request){
  const cache=await caches.open(ART),cached=await cache.match(request);
  if(cached?.ok&&/^image\//i.test(cached.headers.get('content-type')||''))return cached;
  try{
    const response=await fetch(request);
    // The page verifies and saves art. Never replace a missing image with HTML.
    return response;
  }catch{return new Response('',{status:503,statusText:'Artwork unavailable'});}
}
function offlinePage(){
  const html='<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MysticNest</title></head>'+
  '<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0d10;color:#f3ecd8;font-family:system-ui,sans-serif;text-align:center;padding:24px">'+
  '<div><div style="font-size:56px">🔮</div><h2 style="color:#d4af37">אין חיבור כרגע</h2><p style="color:#9a927e">האפליקציה צריכה חיבור פעם אחת כדי להיטען. בדוק את האינטרנט ונסה שוב.</p>'+
  '<button onclick="location.reload()" style="background:#d4af37;color:#1a1508;border:0;border-radius:12px;padding:12px 26px;font-size:16px;font-weight:800">נסה שוב</button></div></body></html>';
  return new Response(html,{status:200,headers:{'content-type':'text/html; charset=utf-8'}});
}
async function getCore(request){
  const cache=await caches.open(SHELL);
  const u=new URL(request.url);u.search='';u.hash='';const key=u.href;
  // Network-first (4s), fall back to cache, then to a friendly offline page. Never returns an error page.
  const net=fetch(request).catch(()=>null);
  const res=await Promise.race([net,new Promise(r=>setTimeout(()=>r(null),4000))]);
  if(res&&res.ok){cache.put(key,res.clone()).catch(()=>{});return res;}
  const cached=(await cache.match(key,{ignoreSearch:true}))||(request.mode==='navigate'?await cache.match(new URL('./index.html',scope).href):null);
  if(cached){net.then(r=>{if(r&&r.ok)cache.put(key,r.clone()).catch(()=>{});});return cached;}
  const late=res||await net;
  if(late)return late;
  return request.mode==='navigate'?offlinePage():Response.error();
}
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==scope.origin)return;
  if(url.href.startsWith(artPrefix)){event.respondWith(getArt(request));return;}
  url.search='';url.hash='';
  if(coreURLs.has(url.href)||(request.mode==='navigate'&&url.href.startsWith(scope.href)))event.respondWith(getCore(request));
});
