/* MysticNest: atomic shell installation, explicit updates, cache-first versioned art. */
importScripts('./deck-manifest.js');
const SHELL='mysticnest-shell-v11';
const ART='mysticnest-deck-'+MYSTIC_DECK.version;
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./privacy_policy.html','./tarot.css','./tarot.js','./card-details.js','./dreams.js','./dream-library.js','./dream-engine.js','./improvements.js','./offline.js','./deck-manifest.js'];
const scope=new URL('./',self.location.href);
const artPrefix=new URL(MYSTIC_DECK.base,scope).href;
const coreURLs=new Set(CORE.map(path=>new URL(path,scope).href));
self.addEventListener('install',event=>{event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(CORE.map(path=>new Request(new URL(path,scope),{cache:'reload'})))));});
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
async function getCore(request){
  const cache=await caches.open(SHELL),cached=await cache.match(request,{ignoreSearch:true});
  if(cached)return cached;
  if(request.mode==='navigate')return (await cache.match('./index.html'))||Response.error();
  try{return await fetch(request);}catch{return Response.error();}
}
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==scope.origin)return;
  if(url.href.startsWith(artPrefix)){event.respondWith(getArt(request));return;}
  url.search='';url.hash='';
  if(coreURLs.has(url.href)||(request.mode==='navigate'&&url.href.startsWith(scope.href)))event.respondWith(getCore(request));
});
