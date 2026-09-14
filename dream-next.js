/* Clarifications and associations are explicit user choices, never silent inference. */
function availableDreamFollowups(txt,excluded=[]){
 const ids=new Set(dreamCatalog().filter(r=>!excluded.includes(r.id)&&dreamFind(txt,r.keys).length).map(r=>r.id));
 return DREAM_FOLLOWUPS.filter(g=>g.triggers.some(id=>ids.has(id))&&!g.options.some(([id])=>ids.has(id)));
}
function applyDreamAnswers(matched,personal,excluded){
 const ids=new Set(matched.map(r=>r.id)),catalog=dreamCatalog();
 for(const g of DREAM_FOLLOWUPS){if(!g.triggers.some(id=>ids.has(id))||g.options.some(([id])=>ids.has(id)))continue;
  const answer=g.options.find(([id])=>id===personal.answers?.[g.id]&&!excluded.includes(id));if(!answer)continue;
  const row=catalog.find(r=>r.id===answer[0]),parent=matched.find(r=>g.triggers.includes(r.id));
  matched.push({...row,fromAnswer:true,evidence:[U('תשובתך: ')+answer[1]],matches:parent.matches.map(m=>({...m,length:Math.max(3,m.length)}))});
 }
}
const DREAM_SEQUENCES=[
 ['pursuit','shelter',U('מרדף ולאחריו מחסה'),U('הרצף המפורש שסיפרת עובר מתנועה דחופה למקום מחסה. אפשר להתבונן במה שאיפשר את המעבר, בלי להניח שהמחסה בהכרח הרגיש בטוח.'),U('מה השתנה בתחושה שלך כשהגעת למחסה?')],
 ['shelter','pursuit',U('מחסה ולאחריו מרדף'),U('בסדר שסיפרת, מחסה מופיע לפני המרדף. כדאי לברר מה השתנה בסיפור, במקום לפרש אותו כסיום של הקלה.'),U('מה הוביל לשינוי אחרי השהייה במחסה?')],
 ['drown','reachshore',U('קושי במים ולאחריו חוף'),U('המעבר שתיארת מקושי במים לחוף מאפשר לתת מקום גם להגעה ולמה שעזר בדרך.'),U('מה תמך בך עד ההגעה לחוף?')],
 ['roughsea','reachshore',U('ים סוער ולאחריו חוף'),U('הרצף מזמין להתבונן בהבדל בין התנאים במים לבין התחושה עם ההגעה לחוף.'),U('האם ההגעה שינתה את הרגש שלך?')],
 ['lostway','rescue',U('אובדן דרך ולאחריו עזרה'),U('לאחר חיפוש הכיוון תיארת עזרה. אפשר לבחון מה היה מועיל בה וכיצד התקבלה.'),U('מה התאפשר בעזרת המפגש?')],
 ['search','lostfound',U('חיפוש ולאחריו מציאה'),U('הרצף מפנה מקום לדרך החיפוש ולתחושה עם המציאה, ולא רק לפרט שאבד.'),U('מה הבנת על חשיבותו של הדבר שמצאת?')],
 ['argument','reconcile',U('ויכוח ולאחריו פיוס'),U('הסדר שתיארת מאפשר להתבונן במעבר מן המחלוקת לניסיון תיקון. אין בכך תחזית לפיוס במציאות.'),U('מה בתיקון הרגיש משמעותי או חסר?')],
 ['reconcile','argument',U('פיוס ולאחריו ויכוח'),U('בסיפור שסיפרת הוויכוח מגיע אחרי פיוס. אפשר לברר מה עדיין לא קיבל מקום, בלי להניח שכך נראים היחסים במציאות.'),U('איזה דבר נשאר לא פתור בסיפור?')],
 ['locked','open',U('דלת נעולה ולאחר מכן פתוחה'),U('הרצף מציע לבחון את השינוי בנגישות ובאפשרות לפעול. כדאי לשאול מה קרה בין שני המצבים.'),U('מה איפשר את הפתיחה?')],
 ['open','locked',U('דלת פתוחה ולאחר מכן נעולה'),U('בסדר שתיארת האפשרות הפתוחה הופכת לסגורה. אפשר להתבונן במשמעות השינוי עבורך, בלי לראות בו סימן לעתיד.'),U('האם הסגירה הגבילה אותך או הגנה עליך?')],
 ['alarm','protectedroom',U('אזעקה ולאחריה מרחב מוגן'),U('הרצף מאפשר לתת מקום גם לתגובה ולמשאב שהופיע אחרי הדחיפות.'),U('מה עזר לך בזמן ההמתנה במרחב המוגן?')],
 ['packing','travelabroad',U('אריזה ולאחריה נסיעה'),U('הרצף מחבר בין הכנה לבין יציאה. אפשר לברר האם מה שלקחת התאים לצרכים בדרך.'),U('מה היה מועיל לקחת ומה היה חסר?')]
];
function dreamSequenceReadings(txt,excluded=[]){
 const tokens=[];for(const clause of String(txt).split(/[.!?;\n]+|\s+(?:אבל|אלא|but|instead)\s+/)){tokens.push(...dreamNormalize(clause).split(' ').filter(Boolean),'');}
 const catalog=dreamCatalog(),results=[];
 for(const [a,b,title,meaning,question] of DREAM_SEQUENCES){if(excluded.includes(a)||excluded.includes(b))continue;
  const x=catalog.find(r=>r.id===a),y=catalog.find(r=>r.id===b);if(!x||!y)continue;
  const pairs=dreamFind(txt,x.keys).flatMap(m=>dreamFind(txt,y.keys).map(n=>[m,n])).filter(([m,n])=>n.at>=m.at+m.length&&n.at-m.at<=35);
  const pair=pairs.find(([m,n])=>{const between=tokens.slice(m.at+m.length,n.at).join(' ');return /(?:^|\s)(?:ואז|אז|אחר כך|לאחר מכן|לבסוף|בסוף|בהמשך|then|after that|later|finally)(?:\s|$)/.test(between)&&!/(?:לפני|אחרי ש|לפני כן|before|after i)/.test(between);});
  if(pair)results.push({title,meaning,question,evidence:pair.map(m=>m.text).join(' ← ')});
 }return results.slice(0,2);
}
const beforeSequenceAnalysis=analyzeLocalDream;
analyzeLocalDream=function(txt,emotion='',ending='',excluded=[],personal={}){
 const a=beforeSequenceAnalysis(txt,emotion,ending,excluded,personal),sequences=dreamSequenceReadings(txt,excluded);
 if(sequences.length){a.summary=sequences[0].meaning+' '+a.summary;if(!personal.significance)a.question=sequences[0].question;}
 const answered=a.found.filter(r=>r.fromAnswer);if(answered.length)a.summary+=U(' לפי תשובות ההמשך שלך: ')+answered.map(r=>r.name).join(' · ')+'.';
 a.sequences=sequences;return a;
};
Object.assign(DREAM_PARENTS,{roughsea:['sea','water'],murkywater:['water'],clearwater:['water'],stairsup:['stairs'],stairsdown:['stairs'],passportlost:['passport'],lockedout:['house'],dogkind:['dog'],dogattack:['dog']});
function associationStore(){return DB.getJSON('dreamAssociations',{});}
function renderAssociations(){
 const list=document.getElementById('dreamAssociationList');if(!list)return;list.replaceChildren();const entries=Object.entries(associationStore());if(!entries.length)list.append(dreamEl('p',U('עדיין לא נשמרו אסוציאציות. אפשר לשמור קישור אישי מתוך פירוש של חלום.'),'small'));
 for(const [id,value] of entries){const card=dreamCatalog().find(r=>r.id===id);if(!card)continue;const row=dreamEl('details');row.append(dreamEl('summary',card.name));const select=dreamEl('select',null,'field');select.setAttribute('aria-label',U('שינוי המשמעות האישית של ')+card.name);for(const [v,t] of [['safe',U('ביטחון או קרבה')],['uncomfortable',U('אי־נוחות או פחד')],['memory',U('זיכרון אישי')],['new',U('משהו חדש או מסקרן')]])select.append(new Option(t,v));select.value=value.significance;
  const note=dreamEl('textarea',null,'field');note.maxLength=1500;note.value=value.note||'';note.setAttribute('aria-label',U('הערה אישית על ')+card.name);
  const save=dreamEl('button',U('שמירת השינוי'),'btn ghost');save.onclick=()=>{const all=associationStore();all[id]={significance:select.value,note:note.value.trim()};DB.setJSON('dreamAssociations',all);renderAssociations();};
  const remove=dreamEl('button',U('מחיקת האסוציאציה'),'btn ghost');remove.onclick=()=>{const all=associationStore();delete all[id];DB.setJSON('dreamAssociations',all);renderAssociations();if(currentDream)renderLocalDream();};row.append(select,note,save,remove);list.append(row);
 }
}
const beforeNextRender=renderLocalDream;
renderLocalDream=function(){
 beforeNextRender();const d=currentDream;if(!d)return;const res=document.getElementById('dreamResult');
 const follow=availableDreamFollowups(d.txt,d.excluded||[]);if(follow.length){const box=dreamEl('div',null,'reading');box.append(dreamEl('h3',U('כמה פרטים שיעזרו לדייק')),dreamEl('p',U('אפשר לענות רק על מה שזכור. הפירוש מתעדכן ונשמר עם התשובה.'),'small'));
  for(const g of follow.slice(0,3)){const label=dreamEl('label',g.question,'lbl');const s=dreamEl('select',null,'field');s.setAttribute('aria-label',g.question);s.append(new Option(U('לא זוכר/ת או לא מתאים'),''));for(const [id,text] of g.options)s.append(new Option(text,id));s.value=d.personal?.answers?.[g.id]||'';s.onchange=()=>{d.personal=d.personal||{};d.personal.answers={...(d.personal.answers||{}),[g.id]:s.value};renderLocalDream();persistDream();};label.append(s);box.append(label);}res.prepend(box);
 }
 for(const seq of dreamSequenceReadings(d.txt,d.excluded||[])){const section=dreamEl('details',null,'reading');section.append(dreamEl('summary',U('הרצף שסיפרת: ')+seq.title),dreamEl('p',seq.meaning),dreamEl('p',seq.question),dreamEl('p',U('מבוסס על: ')+seq.evidence,'small'));res.append(section);}
 const saved=associationStore();for(const row of dreamCatalog().filter(r=>saved[r.id]&&!d.excluded.includes(r.id)&&dreamFind(d.txt,r.keys).length).slice(0,3)){const box=dreamEl('div',null,'reading');box.append(dreamEl('p',U('שמורה אצלך אסוציאציה אישית ל־')+row.name+U('. להשתמש בה בחלום הזה?')));const use=dreamEl('button',U('שימוש בקישור השמור'),'btn ghost');use.onclick=()=>{d.personal={...(d.personal||{}),focus:row.id,...saved[row.id]};document.getElementById('dreamSignificance').value=d.personal.significance;document.getElementById('dreamPersonal').value=d.personal.note||'';renderLocalDream();persistDream();};box.append(use);res.append(box);}
 const chosen=d.found.find(r=>r.id===d.personal?.focus)||d.found[0];if(chosen&&d.personal?.significance){const save=dreamEl('button',U('שמירת הקישור ל־')+chosen.name+U(' גם לחלומות הבאים'),'btn ghost');save.onclick=()=>{const all=associationStore();all[chosen.id]={significance:d.personal.significance,note:d.personal.note||''};DB.setJSON('dreamAssociations',all);renderAssociations();save.textContent=U('הקישור נשמר. בחלום הבא תוכל לבחור אם להשתמש בו.');};res.append(save);}
};
function setupNextDreams(){const wrap=dreamEl('details',null,'reading');wrap.append(dreamEl('summary',U('האסוציאציות האישיות שלי')),dreamEl('p',U('קישורים ששמרת במפורש. הם מוצעים בחלומות הבאים ומופעלים רק לפי בחירתך.'),'small'));const list=dreamEl('div');list.id='dreamAssociationList';wrap.append(list);document.querySelector('.dream-library').after(wrap);renderAssociations();}
setupNextDreams();
