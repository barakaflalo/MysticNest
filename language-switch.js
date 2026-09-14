/* Reload initializes every content panel consistently; temporary draft stays in this tab. */
function cycleLang(){
 const dialog=document.createElement('dialog');dialog.className='card-zoom';dialog.setAttribute('aria-labelledby','languageTitle');
 const title=document.createElement('h2');title.id='languageTitle';title.textContent=T('rLang');dialog.append(title);
 for(const lang of ['he','en','ru','es','ar']){const button=document.createElement('button');button.type='button';button.className='btn ghost';button.lang=lang;button.dir=['he','ar'].includes(lang)?'rtl':'ltr';button.textContent=LANG_NAMES[lang]+(lang===state.lang?' ✓':'');button.onclick=()=>{if(lang===state.lang){dialog.close();return;}if(!saveLanguageDraft())return;DB.set('lang',lang);location.reload();};dialog.append(button);}
 const close=document.createElement('button');close.className='btn ghost';close.textContent=U('סגור ×');close.onclick=()=>dialog.close();dialog.append(close);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();
}
function saveLanguageDraft(){
 const fields={};for(const id of ['tarotQ','dreamText','dreamEmotion','dreamEnding','dreamFocus','dreamSignificance','dreamPersonal','journalSearch']){const el=document.getElementById(id);if(el)fields[id]=el.value;}
 try{sessionStorage.setItem('mysticLanguageDraft',JSON.stringify({fields,dream:currentDream,draw:currentDraw,page:document.querySelector('.screen:not(.hidden)')?.id}));return true;}catch(e){toast({he:'לא ניתן לשמור את הטיוטה להחלפת שפה. השפה לא שונתה.',en:'Your draft could not be preserved. The language was not changed.',ru:'Не удалось сохранить черновик. Язык не изменён.',es:'No se pudo conservar el borrador. No se cambió el idioma.',ar:'تعذّر حفظ المسودة. لم تتغيّر اللغة.'}[state.lang]);return false;}
}
function restoreLanguageDraft(){
 let draft;try{draft=JSON.parse(sessionStorage.getItem('mysticLanguageDraft')||'null');sessionStorage.removeItem('mysticLanguageDraft');}catch(e){}
 if(draft){
  for(const [id,value] of Object.entries(draft.fields||{})){const el=document.getElementById(id);if(el)el.value=value;}
  // Restore the user's working record without reinterpreting or overwriting its saved reading.
  if(draft.dream){currentDream=draft.dream;const focus=document.getElementById('dreamFocus');for(const row of dreamCatalog())if(row.id===draft.fields?.dreamFocus)focus.append(new Option(row.name,row.id));focus.value=draft.fields?.dreamFocus||'';}
  if(draft.draw){currentDraw=draft.draw;const flags=currentDraw.picks.map(p=>p.revealed);currentDraw.picks.forEach(p=>p.revealed=false);renderTarotDraw();flags.forEach((open,i)=>{if(open)flipCard(i);});}
  if(['s-home','s-tarot','s-dream','s-fortune','s-settings','s-about'].includes(draft.page))go(draft.page.slice(2));
 }
 const languageRow=document.getElementById('rLang').closest('.row');languageRow.tabIndex=0;languageRow.setAttribute('role','button');languageRow.setAttribute('aria-label',T('rLang'));languageRow.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();cycleLang();}};
 document.title=contentLang()==='he'?'MysticNest · מיסטיק':'MysticNest';document.getElementById('dreamText').dir='auto';document.getElementById('tarotQ').dir='auto';document.getElementById('dreamPersonal').dir='auto';
 if(['ru','es','ar'].includes(state.lang)){const note=document.createElement('p');note.className='small';note.textContent={ru:'Интерфейс на русском. Толкования, названия карт и база снов пока на английском.',es:'Interfaz en español. Las lecturas, los nombres de cartas y la biblioteca de sueños están en inglés por ahora.',ar:'الواجهة بالعربية. التفسيرات وأسماء البطاقات ومكتبة الأحلام بالإنجليزية حاليًا.'}[state.lang];document.getElementById('heroSub').after(note);}
}
