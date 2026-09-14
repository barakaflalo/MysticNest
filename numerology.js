/* ============================================================
   MysticNest — Numerology module
   Offline: real calculation (life-path from birth date,
   expression number from name — Hebrew gematria or Latin
   Pythagorean) + original Hebrew meanings.
   Pro: optional AI deepening. Entertainment & inspiration only.
   ============================================================ */

/* ---- letter values ---- */
const NUM_HEB={'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ך':20,'ל':30,'מ':40,'ם':40,'נ':50,'ן':50,'ס':60,'ע':70,'פ':80,'ף':80,'צ':90,'ץ':90,'ק':100,'ר':200,'ש':300,'ת':400};
const NUM_LAT={a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8};

/* reduce to a single digit, preserving master numbers 11/22/33 */
function numReduce(n){
  while(n>9 && n!==11 && n!==22 && n!==33){
    n=String(n).split('').reduce((a,d)=>a+(+d),0);
  }
  return n;
}
function lifePathFromDate(iso){ // iso: "YYYY-MM-DD"
  const digits=(iso||'').replace(/[^0-9]/g,'');
  if(digits.length<8)return null;
  const sum=digits.split('').reduce((a,d)=>a+(+d),0);
  return numReduce(sum);
}
function expressionFromName(name){
  const s=(name||'').trim(); if(!s)return null;
  let sum=0,counted=0;
  for(const ch of s){
    if(NUM_HEB[ch]!==undefined){sum+=NUM_HEB[ch];counted++;}
    else{const l=ch.toLowerCase();if(NUM_LAT[l]!==undefined){sum+=NUM_LAT[l];counted++;}}
  }
  if(!counted)return null;
  return numReduce(sum);
}

/* ---- meanings (original Hebrew phrasings of the classic archetypes) ---- */
const NUM_MEANINGS={
  1:{he:"המנהיג",  m:"עצמאות, יוזמה וכוח רצון. מספר 1 קשור לחלוצים ולמובילים — אנשים עם דחף להתחיל, ליצור וללכת בדרך משלהם. האתגר: לא להישאר לבד או עקשן מדי."},
  2:{he:"המגשר",   m:"רגישות, שיתוף פעולה והרמוניה. מספר 2 קשור לדיפלומטיה, אמפתיה וזוגיות. כוחו בחיבור בין אנשים. האתגר: לא לוותר על עצמך כדי לרצות אחרים."},
  3:{he:"היוצר",   m:"ביטוי עצמי, יצירתיות ושמחת חיים. מספר 3 קשור לתקשורת, אמנות ואופטימיות. כוחו בהשראה ובקלילות. האתגר: מיקוד — לא לפזר את האנרגיה."},
  4:{he:"הבנאי",   m:"יציבות, סדר ועבודה קשה. מספר 4 קשור לאמינות, מעשיות ובנייה לטווח ארוך. כוחו ביסודות מוצקים. האתגר: גמישות — לא להיתקע בשגרה."},
  5:{he:"החופשי",  m:"חופש, שינוי והרפתקה. מספר 5 קשור לסקרנות, גיוון וניסיון החיים. כוחו בהסתגלות ובחיוניות. האתגר: התמדה — לא לברוח מכל מחויבות."},
  6:{he:"המטפח",   m:"אחריות, אהבה ודאגה לזולת. מספר 6 קשור למשפחה, הרמוניה ונתינה. כוחו בחום ובאכפתיות. האתגר: לדאוג גם לעצמך, לא רק לאחרים."},
  7:{he:"המחפש",   m:"חוכמה, התבוננות ורוחניות. מספר 7 קשור לחשיבה עמוקה, אינטואיציה וחיפוש אמת. כוחו בעומק ובהבנה. האתגר: לא להסתגר יותר מדי."},
  8:{he:"בעל העוצמה", m:"כוח, שאפתנות והצלחה חומרית. מספר 8 קשור להנהגה, ניהול והישגים. כוחו בגשמיות ובנחישות. האתגר: איזון בין חומר לרוח."},
  9:{he:"ההומניטרי", m:"חמלה, נדיבות ואידיאליזם. מספר 9 קשור לראייה רחבה, אמנות ותרומה לעולם. כוחו בלב הגדול. האתגר: לשחרר ולסלוח."},
  11:{he:"11 · המואר (מספר-אב)", m:"מספר-אב של אינטואיציה והשראה. 11 מחבר בין העולם המעשי לרוחני — חזון, רגישות גבוהה ויכולת לעורר אחרים. האתגר: להתמודד עם עוצמת הרגישות."},
  22:{he:"22 · הבנאי הגדול (מספר-אב)", m:"מספר-אב של הגשמה בקנה מידה גדול. 22 מחבר חלום גדול עם יכולת מעשית לבנות אותו במציאות. האתגר: לא להירתע מגודל הייעוד."},
  33:{he:"33 · המורה הגדול (מספר-אב)", m:"מספר-אב של חמלה והדרכה. 33 קשור לנתינה, ריפוי והוראה מתוך אהבה. האתגר: לאזן בין נתינה לזולת לבין שמירה על עצמך."},
};

let numResult=null;
function renderNumerology(){
  document.getElementById('numH').textContent=T('numH');
  document.getElementById('numSub').textContent=T('numSub');
  document.getElementById('lblNumName').textContent=T('lblNumName');
  document.getElementById('lblNumDate').textContent=T('lblNumDate');
  document.getElementById('numName').placeholder=T('numNamePlace');
  document.getElementById('numCalcBtn').querySelector('span').textContent=T('numCalcTxt');
}
function calcNumerology(){
  const name=document.getElementById('numName').value.trim();
  const date=document.getElementById('numDate').value;
  const life=lifePathFromDate(date);
  const expr=expressionFromName(name);
  if(life===null&&expr===null){shake('numName');return;}
  numResult={name,date,life,expr};
  const res=document.getElementById('numResult');
  let html='<div class="reading" style="margin-top:16px">';
  if(life!==null){
    const mm=NUM_MEANINGS[life];
    html+=`<div class="rc"><div class="h">🛤️ ${T('numLifePath')} <span class="p">${life}</span></div><div class="m"><b>${mm.he}</b> — ${mm.m}</div></div>`;
  }
  if(expr!==null){
    const mm=NUM_MEANINGS[expr];
    html+=`<div class="rc"><div class="h">🔠 ${T('numExpression')} <span class="p">${expr}</span></div><div class="m"><b>${mm.he}</b> — ${mm.m}</div></div>`;
  }
  html+='</div>';
  if(AI.provider&&AI.key){
    html+=`<button class="btn ghost" id="numDeepBtn" onclick="deepenNumerology()">${T('numDeepen')}</button><div id="numAi"></div>`;
  }
  html+=`<div class="disc" style="margin-top:12px">${T('numDisc')}</div>`;
  res.innerHTML=html;
  const body=[life!==null?(T('numLifePath')+' '+life+': '+NUM_MEANINGS[life].he+' — '+NUM_MEANINGS[life].m):'',expr!==null?(T('numExpression')+' '+expr+': '+NUM_MEANINGS[expr].he+' — '+NUM_MEANINGS[expr].m):''].filter(Boolean).join('\n\n');
  numResult.hid=(typeof saveHistory==='function')?saveHistory('num',(name||T('numLifePath')),`${life!==null?('נתיב '+life):''}${(life!==null&&expr!==null)?' · ':''}${expr!==null?('ביטוי '+expr):''}`,{body}):null;
}
async function deepenNumerology(){
  const box=document.getElementById('numAi'),btn=document.getElementById('numDeepBtn');btn.disabled=true;
  box.innerHTML=`<div class="ai-box"><div class="hd">✨ ${T('numReading')}</div><div class="bd"><span class="spin"></span></div></div>`;
  const langName=LANG_NAMES[state.lang];
  const sys=`את/ה יועץ/ת נומרולוגיה חם/ה ומעורר/ת השראה. ענה/י בשפה: ${langName}. תן/י קריאה אישית זורמת שמשלבת בין המספרים, בטון מעצים ולא דטרמיניסטי. סיים/י בצעד מעשי קטן. אורך: 2-3 פסקאות. זו קריאה להשראה והרהור, לא ניבוי ודאי.`;
  const prompt=`שם: ${numResult.name||'(לא נמסר)'}\nמספר נתיב חיים: ${numResult.life??'(לא חושב)'}\nמספר ביטוי (שם): ${numResult.expr??'(לא חושב)'}\n\nתן/י קריאה נומרולוגית אישית.`;
  try{ const ans=await callAI(prompt,sys); if(typeof updateHistoryAI==='function')updateHistoryAI(numResult&&numResult.hid,ans); box.innerHTML=`<div class="ai-box"><div class="hd">🔢 ${T('numYourReading')}</div><div class="bd">${esc(ans)}</div></div>`; }
  catch(e){ box.innerHTML=`<div class="ai-box"><div class="hd">⚠️</div><div class="bd">${T('aiFail')}${esc(e.message)}</div></div>`; btn.disabled=false; }
}
