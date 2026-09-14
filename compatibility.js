/* ============================================================
   MysticNest — Compatibility module
   Offline: numerological "relationship number" for two people
   (reuses numerology.js calc). Pro: optional AI deepening.
   Entertainment & inspiration only.
   ============================================================ */

/* meaning of the combined relationship number (original Hebrew phrasings) */
const COMPAT_MEANINGS={
  1:{he:"קשר של יוזמה", m:"אנרגיה של התחלות, עצמאות והובלה. קשר שדוחף כל אחד לצמוח ולהעז — ובלבד ששני הצדדים ישאירו מקום זה לזה ולא יתחרו."},
  2:{he:"קשר של הרמוניה", m:"אנרגיה של קרבה, רגישות ושיתוף. קשר שמבוסס על הקשבה, איזון ותמיכה הדדית — אחד החיבורים הרגשיים והזוגיים ביותר."},
  3:{he:"קשר של שמחה", m:"אנרגיה של יצירתיות, תקשורת וקלילות. קשר מלא צחוק, ביטוי והשראה הדדית — האתגר הוא לשמור על עומק לצד הכיף."},
  4:{he:"קשר של יציבות", m:"אנרגיה של ביטחון, מחויבות ובנייה משותפת. קשר אמין ומעשי שנבנה לאורך זמן — האתגר הוא לא לשקוע בשגרה."},
  5:{he:"קשר של הרפתקה", m:"אנרגיה של חופש, גיוון וריגוש. קשר דינמי ומלא חוויות — האתגר הוא למצוא יציבות ומחויבות בתוך התנועה."},
  6:{he:"קשר של אהבה ואכפתיות", m:"אנרגיה של טיפוח, נאמנות ובית. קשר חם ומגונן, לרוב משפחתי מאוד — האתגר הוא לאזן נתינה עם צרכים אישיים."},
  7:{he:"קשר של עומק", m:"אנרגיה של חיבור נפשי, אמון ורוחניות. קשר מופנם ומשמעותי — האתגר הוא תקשורת פתוחה ולא להסתגר."},
  8:{he:"קשר של עוצמה", m:"אנרגיה של שאפתנות, הישגים ובניית משהו גדול יחד. קשר עוצמתי ומצליח — האתגר הוא לאזן כוח, כסף ורגש."},
  9:{he:"קשר של חמלה", m:"אנרגיה של נדיבות, אידיאלים ולב רחב. קשר שמביט אל מעבר לעצמו — האתגר הוא לא לשכוח את הקטן והאישי שביניכם."},
  11:{he:"קשר מואר (מספר-אב)", m:"אנרגיה רוחנית ואינטואיטיבית גבוהה. חיבור עם תחושת ייעוד וחיבור עמוק — עוצמתי, אך דורש קרקוע ורגישות זה לזה."},
  22:{he:"קשר של בנייה גדולה (מספר-אב)", m:"אנרגיה של הגשמה משותפת בקנה מידה גדול. זוג/צמד שיכול לבנות משהו משמעותי יחד — האתגר הוא לא להישחק מגודל החזון."},
  33:{he:"קשר של אהבה מרפאה (מספר-אב)", m:"אנרגיה של חמלה, הדדיות וריפוי. חיבור נותן ותומך מאוד — האתגר הוא לשמור על גבולות ואיזון בנתינה."},
};

let compatResult=null;
function renderCompat(){
  document.getElementById('compatH').textContent=T('compatH');
  document.getElementById('compatSub').textContent=T('compatSub');
  document.getElementById('lblCompatA').textContent=T('compatPersonA');
  document.getElementById('lblCompatB').textContent=T('compatPersonB');
  document.getElementById('compatNameA').placeholder=T('compatNamePlace');
  document.getElementById('compatNameB').placeholder=T('compatNamePlace');
  document.getElementById('compatCalcBtn').querySelector('span').textContent=T('compatCalcTxt');
}
function calcCompat(){
  if(typeof lifePathFromDate!=='function'){return;}
  const nameA=document.getElementById('compatNameA').value.trim();
  const nameB=document.getElementById('compatNameB').value.trim();
  const dateA=document.getElementById('compatDateA').value;
  const dateB=document.getElementById('compatDateB').value;
  const lifeA=lifePathFromDate(dateA), lifeB=lifePathFromDate(dateB);
  if(lifeA===null||lifeB===null){shake('compatDateA');shake('compatDateB');return;}
  const rel=numReduce(lifeA+lifeB);
  compatResult={nameA,nameB,lifeA,lifeB,rel};
  const mm=COMPAT_MEANINGS[rel];
  const res=document.getElementById('compatResult');
  const nA=nameA||T('compatPersonA'), nB=nameB||T('compatPersonB');
  let html=`<div class="reading" style="margin-top:16px">
    <div class="rc"><div class="h">👤 ${esc(nA)} <span class="p">${T('numLifePath')} ${lifeA}</span></div></div>
    <div class="rc"><div class="h">👤 ${esc(nB)} <span class="p">${T('numLifePath')} ${lifeB}</span></div></div>
    <div class="rc"><div class="h">🪬 ${T('compatRelNum')} <span class="p">${rel}</span></div><div class="m"><b>${mm.he}</b> — ${mm.m}</div></div>
  </div>`;
  if(AI.provider&&AI.key){
    html+=`<button class="btn ghost" id="compatDeepBtn" onclick="deepenCompat()">${T('compatDeepen')}</button><div id="compatAi"></div>`;
  }
  html+=`<div class="disc" style="margin-top:12px">${T('compatDisc')}</div>`;
  res.innerHTML=html;
  const body=`${nA}: ${T('numLifePath')} ${lifeA}\n${nB}: ${T('numLifePath')} ${lifeB}\n\n${T('compatRelNum')} ${rel} — ${mm.he}: ${mm.m}`;
  compatResult.hid=(typeof saveHistory==='function')?saveHistory('compat',`${nA} + ${nB}`,`${T('compatRelNum')} ${rel}`,{body}):null;
}
async function deepenCompat(){
  const box=document.getElementById('compatAi'),btn=document.getElementById('compatDeepBtn');btn.disabled=true;
  box.innerHTML=`<div class="ai-box"><div class="hd">✨ ${T('compatReading')}</div><div class="bd"><span class="spin"></span></div></div>`;
  const langName=LANG_NAMES[state.lang];
  const c=compatResult;
  const sys=`את/ה יועץ/ת תאימות נומרולוגית חם/ה ומעורר/ת השראה. ענה/י בשפה: ${langName}. תן/י קריאת תאימות זורמת בין שני האנשים לפי מספריהם, בטון חיובי ומאוזן — חוזקות הקשר וגם נקודות לתשומת לב, בלי לקבוע גורל. סיים/י בעצה קטנה אחת לקשר. אורך: 2-3 פסקאות. זו קריאה להשראה בלבד.`;
  const prompt=`אדם א': ${c.nameA||'(ללא שם)'} — מספר נתיב ${c.lifeA}\nאדם ב': ${c.nameB||'(ללא שם)'} — מספר נתיב ${c.lifeB}\nמספר הקשר המשולב: ${c.rel}\n\nתן/י קריאת תאימות אישית.`;
  try{ const ans=await callAI(prompt,sys); if(typeof updateHistoryAI==='function')updateHistoryAI(compatResult&&compatResult.hid,ans); box.innerHTML=`<div class="ai-box"><div class="hd">🪬 ${T('compatYourReading')}</div><div class="bd">${esc(ans)}</div></div>`; }
  catch(e){ box.innerHTML=`<div class="ai-box"><div class="hd">⚠️</div><div class="bd">${T('aiFail')}${esc(e.message)}</div></div>`; btn.disabled=false; }
}
