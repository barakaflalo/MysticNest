/* Browsable cards, spread context and local journal tools. */
const POSITION_FRAMES={
 'המסר':['כמסר להתבוננות כעת, אפשר לבחון איך הנושא של הקלף פוגש את היום שלך.','איזה חלק מן המסר מתאים לך כרגע?'],
 'עבר':['במיקום העבר, הקלף מזמין לבדוק חוויה או דפוס שכבר פגשת ואת ההשפעה שנשארה מהם. אין בכך קביעה שזה אכן התרחש.','מה מן החוויה הזאת עדיין משפיע על הבחירות שלך?'],
 'הווה':['במיקום ההווה, הקלף מפנה תשומת לב למה שמעסיק אותך ולמרחב הבחירה הזמין עכשיו.','איפה הנושא הזה נוכח כרגע, ומה נמצא בידיך?'],
 'עתיד':['במיקום העתיד, הקלף מציע כיוון אפשרי לבחינה אם דפוס מסוים יימשך. זו אפשרות למחשבה, לא תוצאה שנקבעה מראש.','מה היית רוצה לטפח או לשנות לקראת ההמשך?'],
 'המצב':['במיקום המצב, הקלף הוא עדשה לבחינת הנושא המרכזי של השאלה. אפשר לבדוק מה הוא מאיר ומה אינו מתאים לחוויה שלך.','איזה חלק של המצב דורש כרגע תשומת לב?'],
 'האתגר':['במיקום האתגר, אפשר לבדוק היכן הנושא של הקלף דורש איזון, תרגול או התמודדות. גם תכונה מועילה יכולה להפוך לקושי כשהיא מופעלת במידה שאינה מתאימה.','מה מקשה עליך לפעול באופן שמתאים לצרכים שלך?'],
 'הבסיס':['במיקום הבסיס, הקלף מזמין לבחון צורך, ערך או הנחה שעליהם נשענת השאלה. אין בכך טענה לחשיפת מניע נסתר.','איזה צורך או ערך חשוב לך לשמור בתוך המצב?'],
 'העבר הקרוב':['במיקום העבר הקרוב, אפשר להתבונן באירוע או בתגובה מהתקופה האחרונה ולבדוק מה מהם ממשיך איתך.','מה קרה לאחרונה, ואיזה לקח כדאי לקחת ממנו?'],
 'התוצאה':['במיקום התוצאה, הקלף מזמין לדמיין אפשרות להמשך ולבחון מה עשוי לתמוך בה או לשנות אותה. התוצאה אינה הבטחה.','איזו בחירה קטנה יכולה להשפיע על ההמשך הרצוי לך?']
};
function cardPositionReading(pick,position){
 const frame=POSITION_FRAMES[position];if(!frame)return null;
 const detail=MYSTIC_CARD_DETAILS[pick.card.id];
 return {title:position+' · '+pick.card.he,short:frame[0],meaning:pick.rev?detail.rev:detail.up,question:frame[1]+' '+detail.question};
}
function appendPositionReading(copy,pick,position){const c=cardPositionReading(pick,position);if(!c)return;const section=dreamEl('section',null,'position-reading');section.dir='rtl';section.append(dreamEl('h3','הקלף במיקום: '+position),dreamEl('p',c.short),dreamEl('p','למחשבה: '+c.question));copy.append(section);}
function feedbackWidget(key,context){
 const wrap=dreamEl('details',null,'reading-feedback');wrap.append(dreamEl('summary','איך הפירוש פגש אותך?'));
 const saved=DB.getJSON('readingFeedback',[]).find(r=>r.key===key)||{};const row=dreamEl('div',null,'feedback-options');let choice=saved.choice||'';
 const save=()=>{const entries=DB.getJSON('readingFeedback',[]).filter(r=>r.key!==key);if(choice||note.value.trim())entries.unshift({key,context,choice,note:note.value.trim(),updated:Date.now()});DB.setJSON('readingFeedback',entries.slice(0,200));status.textContent='המשוב נשמר במכשיר שלך.';};
 const buttons=[];for(const [value,text] of [['yes','התאים לי'],['no','לא התאים לי'],['unclear','לא היה ברור']]){const b=dreamEl('button',text,'btn ghost');b.type='button';b.setAttribute('aria-pressed',String(choice===value));b.onclick=()=>{choice=choice===value?'':value;buttons.forEach(([el,v])=>el.setAttribute('aria-pressed',String(v===choice)));save();};buttons.push([b,value]);row.append(b);}
 const label=dreamEl('label','הערה אישית (אופציונלי)','lbl');const note=dreamEl('textarea',null,'field');note.maxLength=1000;note.value=saved.note||'';note.setAttribute('aria-label','הערה על הפירוש');label.append(note);const button=dreamEl('button','שמירת ההערה','btn ghost');button.type='button';button.onclick=save;const status=dreamEl('p','המשוב נשמר מקומית ונכלל בגיבוי; הוא אינו נשלח ואינו משנה את המאגר אוטומטית.','small');status.setAttribute('aria-live','polite');wrap.append(row,label,button,status);return wrap;
}
function setupCardLibrary(){
 const library=dreamEl('details',null,'reading card-library');library.id='cardLibrary';library.append(dreamEl('summary','ספריית 78 הקלפים'),dreamEl('p','אפשר לחפש ולקרוא על כל קלף ללא הגרלה.','small'));
 const search=dreamEl('input',null,'field');search.type='search';search.placeholder='חיפוש לפי שם בעברית או באנגלית';search.setAttribute('aria-label','חיפוש קלף');
 const suit=dreamEl('select',null,'field');suit.setAttribute('aria-label','סדרת קלפים');for(const [v,t] of [['','כל הסדרות'],['major','הארקנה הגדולה'],['wands','מקלות'],['cups','גביעים'],['swords','חרבות'],['pentacles','מטבעות']])suit.append(new Option(t,v));
 const orientation=dreamEl('select',null,'field');orientation.setAttribute('aria-label','מצב הקלף בספרייה');orientation.append(new Option('פירוש במצב ישר','up'),new Option('פירוש במצב הפוך','rev'));
 const counter=dreamEl('p',null,'small');counter.setAttribute('aria-live','polite');const grid=dreamEl('div',null,'library-grid');
 const render=()=>{grid.replaceChildren();const q=search.value.trim().toLowerCase();const cards=[...TAROT_MAJOR,...TAROT_MINOR].filter(c=>(!suit.value||suit.value===c.arc)&&(!q||(c.he+' '+c.en).toLowerCase().includes(q)));counter.textContent=cards.length?'מוצגים '+cards.length+' קלפים':'לא נמצאו קלפים. אפשר לנסות שם אחר או להסיר סינון.';
  for(const card of cards){const b=dreamEl('button',null,'library-card');b.type='button';b.setAttribute('aria-label','פתיחת '+card.he);const img=dreamEl('img');img.src=cardImagePath(card.id);img.alt='';img.loading='lazy';img.width=768;img.height=1152;img.onerror=()=>img.remove();b.append(img,dreamEl('span',card.he));b.onclick=()=>openCardDetail({card,rev:orientation.value==='rev',revealed:true},b,null);grid.append(b);}
 };search.oninput=render;suit.onchange=render;library.append(search,suit,orientation,counter,grid);document.getElementById('tarotResult').after(library);render();
 const home=dreamEl('button','📖 ספריית הקלפים','btn ghost');home.onclick=()=>{go('tarot');library.open=true;library.scrollIntoView({block:'start',behavior:'instant'});search.focus();};document.getElementById('backupReminder').before(home);
}
function setDreamMeta(id,patch){const meta=DB.getJSON('dreamMeta',{});meta[id]={...(meta[id]||{}),...patch};DB.setJSON('dreamMeta',meta);}
function journalMatches(item,meta,q,favorite,tag){return (!favorite||meta.favorite)&&(!tag||(meta.tags||[]).includes(tag))&&(!q||(item.txt+' '+item.reading+' '+(item.personal?.note||'')+' '+(meta.tags||[]).join(' ')).toLowerCase().includes(q.toLowerCase()));}
const baseRenderDreamJournal=renderDreamJournal;
renderDreamJournal=function(){
 const openIds=new Set(Array.from(document.querySelectorAll('#dreamJournal .dream-entry[open]')).map(e=>e.dataset.journalId));
 baseRenderDreamJournal();const root=document.getElementById('dreamJournal');if(!root)return;const items=DB.getJSON('dreamJournal',[]),meta=DB.getJSON('dreamMeta',{});
 root.querySelectorAll('.dream-entry').forEach((entry,i)=>{const item=items[i];if(!item)return;entry.dataset.journalId=item.journalId;entry.open=openIds.has(item.journalId);const m=meta[item.journalId]||{};const fav=dreamEl('button',m.favorite?'★ במועדפים':'☆ שמירה במועדפים','btn ghost');fav.type='button';fav.setAttribute('aria-pressed',String(!!m.favorite));fav.onclick=()=>{setDreamMeta(item.journalId,{favorite:!m.favorite});renderDreamJournal();};
  const label=dreamEl('label','תגיות, מופרדות בפסיקים','lbl');const tags=dreamEl('input',null,'field');tags.value=(m.tags||[]).join(', ');tags.maxLength=160;tags.setAttribute('aria-label','תגיות לחלום');label.append(tags);const save=dreamEl('button','שמירת תגיות','btn ghost');save.onclick=()=>{setDreamMeta(item.journalId,{tags:[...new Set(tags.value.split(/[,،]/).map(t=>t.trim()).filter(Boolean))].slice(0,8)});renderDreamJournal();};
  entry.append(fav,label,save,feedbackWidget('dream:'+item.journalId,{type:'dream',journalId:item.journalId}));
  entry.hidden=!journalMatches(item,m,document.getElementById('journalSearch')?.value.trim()||'',document.getElementById('journalFavorites')?.checked||false,document.getElementById('journalTag')?.value||'');
 });
 const select=document.getElementById('journalTag');if(select){const value=select.value;select.replaceChildren(new Option('כל התגיות',''));for(const t of [...new Set(items.flatMap(x=>meta[x.journalId]?.tags||[]))].sort())select.append(new Option(t,t));select.value=value;if(select.selectedIndex<0){select.value='';root.querySelectorAll('.dream-entry').forEach((e,i)=>{e.hidden=!journalMatches(items[i],meta[items[i].journalId]||{},document.getElementById('journalSearch').value.trim(),document.getElementById('journalFavorites').checked,'');});}}
 const count=document.getElementById('journalCount');if(count)count.textContent=items.length?(root.querySelectorAll('.dream-entry:not([hidden])').length+' מתוך '+items.length+' חלומות'):'עדיין אין חלומות ביומן.';
};
function setupJournalTools(){
 const controls=dreamEl('div',null,'journal-tools');const search=dreamEl('input',null,'field');search.id='journalSearch';search.type='search';search.placeholder='חיפוש בחלומות, בפירושים ובתגיות';search.setAttribute('aria-label','חיפוש ביומן');search.oninput=renderDreamJournal;
 const label=dreamEl('label',' מועדפים בלבד');const favorite=dreamEl('input');favorite.type='checkbox';favorite.id='journalFavorites';favorite.onchange=renderDreamJournal;label.prepend(favorite);const tag=dreamEl('select',null,'field');tag.id='journalTag';tag.setAttribute('aria-label','סינון לפי תגית');tag.onchange=renderDreamJournal;const count=dreamEl('p',null,'small');count.id='journalCount';count.setAttribute('aria-live','polite');controls.append(search,label,tag,count);document.getElementById('dreamJournal').before(controls);renderDreamJournal();
}
const baseRenderLocalDream=renderLocalDream;
renderLocalDream=function(){baseRenderLocalDream();if(currentDream?.journalId)document.getElementById('dreamResult').append(feedbackWidget('dream:'+currentDream.journalId,{type:'dream',journalId:currentDream.journalId}));};
setupCardLibrary();setupJournalTools();
