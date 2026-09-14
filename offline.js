/* Resumable, verified image download. Readiness is checked, never assumed from a saved flag. */
const DECK_CACHE='mysticnest-deck-'+MYSTIC_DECK.version;
const AVAILABLE_IDS=MYSTIC_DECK.availableIds||MYSTIC_DECK.ids;
const DECK_URLS=[...AVAILABLE_IDS.map(cardImagePath),...(MYSTIC_DECK.hasBack===false?[]:[MYSTIC_DECK.back])];
let deckState={done:0,total:DECK_URLS.length,busy:false,ready:false,error:false,supported:false,shellReady:false};
let swRegistration=null;
function renderDeckStatus(){
  const label=document.getElementById('deckStatusText'),progress=document.getElementById('deckProgress'),button=document.getElementById('deckSave');if(!label)return;
  progress.max=deckState.total;progress.value=deckState.done;progress.hidden=deckState.ready||!deckState.supported;
  if(!deckState.supported){label.textContent=deckText(U('שמירה ללא אינטרנט זמינה כשפותחים את האפליקציה דרך כתובת מאובטחת.'),'Offline saving is available when the app is opened from a secure web address.');button.hidden=true;return;}
  if(!deckState.shellReady){label.textContent=deckState.error?deckText(U('לא ניתן להשלים כעת את שמירת האפליקציה. נסה לרענן כשיש חיבור.'),'The app could not be saved. Reload when connected.'):deckText(U('מכין את האפליקציה לשימוש ללא אינטרנט…'),'Preparing the app for offline use…');button.hidden=true;return;}
  if(deckState.ready){label.textContent=AVAILABLE_IDS.length===78&&MYSTIC_DECK.hasBack!==false?deckText(U('כל 78 הקלפים נשמרו לשימוש ללא אינטרנט.'),'All 78 cards are saved for offline use.'):deckText(U('גרסת עבודה: ')+AVAILABLE_IDS.length+U(' מתוך 78 איורים נשמרו. שאר האיורים עדיין בהכנה.'),'Work in progress: '+AVAILABLE_IDS.length+' of 78 illustrations saved. Remaining art is in progress.');button.hidden=true;return;}
  if(deckState.busy){label.textContent=deckText(U('שומר את החפיסה במכשיר'),'Saving the deck on this device')+' · '+deckState.done+' / '+deckState.total;button.hidden=true;return;}
  label.textContent=deckState.error?deckText(U('השמירה לא הושלמה. אפשר להמשיך כשיש חיבור ומקום פנוי במכשיר.'),'Saving is incomplete. Resume with a connection and available device storage.'):deckText(U('החפיסה מוכנה להורדה לשימוש ללא אינטרנט.'),'The deck is ready to download for offline use.');
  button.hidden=false;button.textContent=deckText(U('המשך שמירת החפיסה'),'Save / resume deck');
}
function isImageResponse(response){return !!response&&response.ok&&/^image\//i.test(response.headers.get('content-type')||'');}
async function downloadDeck(){
  if(deckState.busy||!deckState.supported)return;
  deckState.busy=true;deckState.error=false;deckState.ready=false;deckState.done=0;renderDeckStatus();
  try{
    const cache=await caches.open(DECK_CACHE),missing=[];
    for(const url of DECK_URLS){if(isImageResponse(await cache.match(url)))deckState.done++;else missing.push(url);}
    renderDeckStatus();
    let next=0,failed=false;
    async function worker(){
      while(next<missing.length){
        const url=missing[next++];
        try{
          const response=await fetch(url,{cache:'reload',signal:AbortSignal.timeout(25000)});
          if(!isImageResponse(response))throw new Error('Missing image');
          // Decode before committing a newly downloaded asset to the offline deck.
          if(typeof createImageBitmap==='function'){
            const bitmap=await createImageBitmap(await response.clone().blob());
            if(!bitmap.width||!bitmap.height)throw new Error('Invalid image');bitmap.close();
          }
          await cache.put(url,response);deckState.done++;renderDeckStatus();
        }catch{failed=true;}
      }
    }
    await Promise.all(Array.from({length:4},worker));
    deckState.ready=!failed&&deckState.done===DECK_URLS.length;deckState.error=!deckState.ready;
  }catch{deckState.error=true;}
  finally{deckState.busy=false;renderDeckStatus();}
}
async function checkDeck(){
  if(deckState.busy||!deckState.supported)return;
  try{
    const cache=await caches.open(DECK_CACHE);let count=0;
    for(const url of DECK_URLS)if(isImageResponse(await cache.match(url)))count++;
    deckState.done=count;deckState.ready=count===DECK_URLS.length;renderDeckStatus();
  }catch{deckState.error=true;renderDeckStatus();}
}
function offerAppUpdate(reg){
  if(!reg.waiting)return;
  const button=document.getElementById('appUpdate');button.hidden=false;
  button.textContent=deckText(U('גרסה חדשה מוכנה — רענן'),'Update ready — reload');
  button.onclick=()=>{
    let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!reloading){reloading=true;location.reload();}},{once:true});
    reg.waiting.postMessage({type:'ACTIVATE_UPDATE'});
  };
}
async function initDeckOffline(){
  deckState.supported=!!(isSecureContext&&'serviceWorker' in navigator&&'caches' in globalThis&&location.protocol!=='file:');
  renderDeckStatus();if(!deckState.supported)return;
  try{
    swRegistration=await navigator.serviceWorker.register('./sw.js');
    offerAppUpdate(swRegistration);
    swRegistration.addEventListener('updatefound',()=>{
      const worker=swRegistration.installing;
      worker?.addEventListener('statechange',()=>{if(worker.state==='installed')offerAppUpdate(swRegistration);});
    });
    await navigator.serviceWorker.ready;
    deckState.shellReady=true;
    await checkDeck();
    if(!deckState.ready&&navigator.onLine)await downloadDeck();
  }catch{deckState.error=true;renderDeckStatus();}
  window.addEventListener('online',()=>{if(!deckState.ready)downloadDeck();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkDeck();});
}
