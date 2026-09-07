/* Card art is keyed by the existing IDs; meanings and draw probabilities are unchanged. */
function cardImagePath(id){return MYSTIC_DECK.base+'card-'+id+MYSTIC_DECK.extension;}
function deckText(he,en){return state.lang==='he'||state.lang==='ar'?he:en;}
function drawTarot(){
  const sp=SPREADS[state.spread];
  const picks=shuffle([...TAROT_MAJOR,...TAROT_MINOR]).slice(0,sp.n).map(card=>({card,rev:Math.random()<0.35,revealed:false}));
  currentDraw={q:document.getElementById('tarotQ').value.trim(),spread:state.spread,picks};
  renderTarotDraw();
  document.getElementById('drawTxt').textContent=T('redraw');
  saveHistory('tarot',currentDraw.q||sp[state.lang==='he'?'he':'en'],picks.map(p=>p.card.he).join(' · '),{
    spread:currentDraw.spread,picks:picks.map(p=>({id:p.card.id,rev:p.rev})),deckVersion:MYSTIC_DECK.version
  });
}
function renderTarotDraw(){
  const sp=SPREADS[currentDraw.spread];
  const positions=state.lang==='he'?sp.pos_he:sp.pos_en;
  const result=document.getElementById('tarotResult');
  result.replaceChildren();
  const hint=document.createElement('p');hint.className='ssub';hint.style.textAlign='center';
  hint.textContent=deckText('לחיצה לחשיפה · לחיצה נוספת להגדלה','Tap to reveal · tap again to enlarge');
  const spread=document.createElement('div');spread.className='spread '+(sp.n===1?'single':currentDraw.spread==='cross'?'cross':'');
  currentDraw.picks.forEach((pick,i)=>{
    const button=document.createElement('button');button.type='button';button.className='tcard';button.id='tc'+i;
    button.setAttribute('aria-label',positions[i]+' — '+deckText('חשוף קלף','Reveal card'));
    button.innerHTML='<span class="inner"><span class="face back"><img alt="" src="'+MYSTIC_DECK.back+'"></span><span class="face front'+(pick.rev?' rev':'')+'" aria-hidden="true"></span></span><span class="card-caption"><span class="card-position"></span><span class="card-name"></span><span class="card-state"></span></span>';
    button.querySelector('.card-position').textContent=positions[i];
    button.querySelector('.card-name').textContent=deckText('קלף נסתר','Hidden card');
    const front=button.querySelector('.front');
    const img=document.createElement('img');img.alt='';img.width=768;img.height=1152;img.decoding='async';
    if(pick.rev)img.className='rev-art';
    img.onerror=()=>showMissingArt(front,pick.card);
    if(MYSTIC_DECK.availableIds&&!MYSTIC_DECK.availableIds.includes(pick.card.id)){showMissingArt(front,pick.card);}else{img.src=cardImagePath(pick.card.id);front.append(img);}
    const back=button.querySelector('.back img');back.onerror=()=>{back.remove();const sym=document.createElement('span');sym.className='sym';sym.textContent='✦';button.querySelector('.back').append(sym);};
    button.onclick=()=>flipCard(i);spread.append(button);
  });
  const reading=document.createElement('div');reading.id='tarotReading';result.append(hint,spread,reading);
}
function showMissingArt(container,card){
  container.replaceChildren();const fallback=document.createElement('span');fallback.className='card-unavailable';
  const title=document.createElement('strong');title.textContent=card.he;
  const msg=document.createElement('span');msg.textContent=MYSTIC_DECK.availableIds&&!MYSTIC_DECK.availableIds.includes(card.id)?deckText('האיור בהכנה. הפירוש זמין למטה.','Artwork in progress. The meaning is available below.'):deckText('האיור אינו זמין כרגע. הפירוש זמין למטה.','Artwork unavailable. The meaning is available below.');
  fallback.append(title,msg);container.append(fallback);
}
function flipCard(i){
  const pick=currentDraw?.picks[i];if(!pick)return;
  if(pick.revealed){openCardZoom(i);return;}
  pick.revealed=true;
  const button=document.getElementById('tc'+i);button.classList.add('flip');
  button.querySelector('.front').removeAttribute('aria-hidden');
  button.querySelector('.back').setAttribute('aria-hidden','true');
  button.querySelector('.card-name').textContent=state.lang==='he'?pick.card.he:pick.card.en;
  const orientation=pick.rev?deckText('הפוך','Reversed'):deckText('ישר','Upright');
  button.querySelector('.card-state').textContent=orientation;
  button.setAttribute('aria-label',pick.card.he+' · '+orientation+' — '+deckText('הגדל קלף','Enlarge card'));
  if(currentDraw.picks.every(p=>p.revealed))showReading();
}
function showReading(){
  const box=document.getElementById('tarotReading');if(!box||box.childElementCount)return;
  const sp=SPREADS[currentDraw.spread],positions=state.lang==='he'?sp.pos_he:sp.pos_en;
  const reading=document.createElement('div');reading.className='reading';
  currentDraw.picks.forEach((pick,i)=>{
    const item=document.createElement('div');item.className='rc';
    const head=document.createElement('div');head.className='h';
    const thumb=document.createElement('img');thumb.className='card-thumb';thumb.alt='';thumb.src=cardImagePath(pick.card.id);thumb.onerror=()=>thumb.remove();
    const title=document.createElement('span');title.textContent=pick.card.he;
    const position=document.createElement('span');position.className='p';position.textContent=positions[i]+' · '+(pick.rev?deckText('הפוך','Reversed'):deckText('ישר','Upright'));
    head.append(thumb,title,position);
    const meaning=document.createElement('div');meaning.className='m';meaning.dir='rtl';meaning.lang='he';meaning.textContent=pick.rev?pick.card.rev:pick.card.up;
    item.append(head,meaning);const contextual=cardPositionReading(pick,sp.pos_he[i]);if(contextual){const p=document.createElement('p');p.className='position-hint';p.textContent=contextual.short;item.append(p);}reading.append(item);
  });
  box.append(reading);
  if(AI.provider&&AI.key){
    const btn=document.createElement('button');btn.id='deepBtn';btn.className='btn ghost';btn.textContent=T('deepen');btn.onclick=deepenTarot;
    const ai=document.createElement('div');ai.id='aiTarot';box.append(btn,ai);
  }
}
function openCardZoom(i){
  const pick=currentDraw?.picks[i];if(!pick||!pick.revealed)return;
  const trigger=document.getElementById('tc'+i);
  openCardDetail(pick,trigger,SPREADS[currentDraw.spread].pos_he[i]);
}
function openCardDetail(pick,trigger,position){
  const dialog=document.createElement('dialog');dialog.className='card-zoom';dialog.setAttribute('aria-labelledby','zoomTitle');
  const close=document.createElement('button');close.className='zoom-close';close.textContent=deckText('סגור ×','Close ×');close.onclick=()=>dialog.close();
  const layout=document.createElement('div');layout.className='zoom-layout';
  const imageWrap=document.createElement('div'),img=document.createElement('img');img.className='zoom-art'+(pick.rev?' rev-art':'');img.alt=pick.card.he;img.src=cardImagePath(pick.card.id);img.onerror=()=>showMissingArt(imageWrap,pick.card);imageWrap.append(img);
  const copy=document.createElement('div');copy.className='zoom-copy';
  const title=document.createElement('h2');title.id='zoomTitle';title.textContent=pick.card.he;
  const english=document.createElement('p');english.className='en';english.textContent=pick.card.en;
  const orientation=document.createElement('p');orientation.textContent=pick.rev?deckText('קלף הפוך','Reversed card'):deckText('קלף ישר','Upright card');
  const meaning=document.createElement('p');meaning.dir='rtl';meaning.lang='he';meaning.textContent=pick.rev?pick.card.rev:pick.card.up;
  copy.append(title,english,orientation,meaning);
  appendPositionReading(copy,pick,position);appendCardDetails(copy,pick);copy.append(feedbackWidget('tarot:'+pick.card.id+':'+(pick.rev?'rev':'up')+':'+(position||'library'),{type:'tarot',id:pick.card.id,rev:pick.rev,position:position||'library'}));layout.append(imageWrap,copy);dialog.append(close,layout);document.body.append(dialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{dialog.remove();trigger?.focus();},{once:true});dialog.showModal();
}

function appendCardDetails(copy,pick){
  const detail=globalThis.MYSTIC_CARD_DETAILS?.[pick.card.id];if(!detail)return;
  const content=document.createElement('div');content.className='card-details';content.dir='rtl';content.lang='he';
  for(const [heading,text] of [['מבט מעמיק',pick.rev?detail.rev:detail.up],['השפה הסמלית של הקלף',detail.symbols],['שאלה למחשבה',detail.question],['צעד קטן שאפשר לנסות',detail.step]]){
    const section=document.createElement('section'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=heading;p.textContent=text;section.append(h,p);content.append(section);
  }
  const note=document.createElement('p');note.className='detail-note';note.textContent='הפירוש מציע כיוון להתבוננות. אפשר לקחת ממנו את מה שמתאים לחוויה שלך.';content.append(note);copy.append(content);
}
