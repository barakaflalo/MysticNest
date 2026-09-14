/* ============================================================
   MysticNest — Horoscope / Zodiac module
   Offline: 12 signs with original Hebrew personality profiles.
   Pro: optional AI daily reading. Entertainment only.
   Uses Unicode zodiac glyphs (no copyrighted imagery).
   ============================================================ */

const ZODIAC=[
  { id:"aries", sym:"♈", he:"טלה", en:"Aries", el:"fire",  from:[3,21], to:[4,19],
    m:"מזל אש נלהב ופורץ דרך. בני טלה נועזים, אנרגטיים ותחרותיים — הראשונים לקפוץ למים. כוחם ביוזמה ובאומץ; האתגר שלהם הוא סבלנות וריסון הפזיזות." },
  { id:"taurus", sym:"♉", he:"שור", en:"Taurus", el:"earth", from:[4,20], to:[5,20],
    m:"מזל אדמה יציב ונאמן. בני שור מעשיים, עקביים ואוהבי נוחות ויופי. כוחם בהתמדה ובאמינות; האתגר הוא גמישות ופתיחות לשינוי." },
  { id:"gemini", sym:"♊", he:"תאומים", en:"Gemini", el:"air", from:[5,21], to:[6,20],
    m:"מזל אוויר סקרן ותקשורתי. בני תאומים שנונים, מסתגלים ואוהבי גיוון ורעיונות. כוחם בגמישות ובחברותיות; האתגר הוא מיקוד והתמדה." },
  { id:"cancer", sym:"♋", he:"סרטן", en:"Cancer", el:"water", from:[6,21], to:[7,22],
    m:"מזל מים רגיש ומטפח. בני סרטן אמפתיים, נאמנים וקשורים לבית ולמשפחה. כוחם באינטואיציה ובחום; האתגר הוא לא להסתגר במעטפת מגן." },
  { id:"leo", sym:"♌", he:"אריה", en:"Leo", el:"fire", from:[7,23], to:[8,22],
    m:"מזל אש כריזמטי ונדיב. בני אריה בטוחים, יצירתיים ואוהבי במה. כוחם בלב הגדול ובמנהיגות; האתגר הוא ענווה והקשבה לזולת." },
  { id:"virgo", sym:"♍", he:"בתולה", en:"Virgo", el:"earth", from:[8,23], to:[9,22],
    m:"מזל אדמה מדויק ואנליטי. בני בתולה חרוצים, קשובים לפרטים ורוצים לשפר ולעזור. כוחם בשקדנות ובשירות; האתגר הוא להרפות מביקורתיות-יתר." },
  { id:"libra", sym:"♎", he:"מאזניים", en:"Libra", el:"air", from:[9,23], to:[10,22],
    m:"מזל אוויר הרמוני ודיפלומטי. בני מאזניים אוהבי צדק, יופי ושותפות. כוחם באיזון ובקסם חברתי; האתגר הוא החלטיות ועמידה על שלהם." },
  { id:"scorpio", sym:"♏", he:"עקרב", en:"Scorpio", el:"water", from:[10,23], to:[11,21],
    m:"מזל מים עז ועמוק. בני עקרב נחושים, אינטואיטיביים ובעלי עוצמה רגשית. כוחם בעומק ובנאמנות; האתגר הוא אמון ושחרור שליטה." },
  { id:"sagittarius", sym:"♐", he:"קשת", en:"Sagittarius", el:"fire", from:[11,22], to:[12,21],
    m:"מזל אש הרפתקן ואופטימי. בני קשת חופשיים, סקרנים ואוהבי מסע וידע. כוחם בחזון ובאמונה; האתגר הוא מחויבות ותשומת לב לפרטים." },
  { id:"capricorn", sym:"♑", he:"גדי", en:"Capricorn", el:"earth", from:[12,22], to:[1,19],
    m:"מזל אדמה שאפתן ואחראי. בני גדי ממושמעים, סבלניים ובונים לטווח ארוך. כוחם בהתמדה ובאחריות; האתגר הוא לאזן עבודה עם הנאה." },
  { id:"aquarius", sym:"♒", he:"דלי", en:"Aquarius", el:"air", from:[1,20], to:[2,18],
    m:"מזל אוויר מקורי וחדשני. בני דלי עצמאיים, הומניטריים וחושבים מחוץ לקופסה. כוחם בחזון ובמקוריות; האתגר הוא חיבור רגשי וקרבה." },
  { id:"pisces", sym:"♓", he:"דגים", en:"Pisces", el:"water", from:[2,19], to:[3,20],
    m:"מזל מים חלומי וחומל. בני דגים אמנותיים, אינטואיטיביים ורגישים לזולת. כוחם בדמיון ובאמפתיה; האתגר הוא גבולות ורגליים על הקרקע." },
];
const ZODIAC_ELEM={fire:"🔥",earth:"🌍",air:"💨",water:"💧"};

function signFromDate(iso){
  const m=(iso||'').split('-').map(Number); if(m.length<3)return null;
  const mo=m[1],dy=m[2];
  for(const z of ZODIAC){
    const [fm,fd]=z.from,[tm,td]=z.to;
    if(fm<=tm){ if((mo===fm&&dy>=fd)||(mo===tm&&dy<=td)||(mo>fm&&mo<tm))return z; }
    else { if((mo===fm&&dy>=fd)||(mo===tm&&dy<=td)||mo>fm||mo<tm)return z; } // capricorn wrap
  }
  return null;
}

let currentSign=null;
function renderHoroscope(){
  document.getElementById('horoH').textContent=T('horoH');
  document.getElementById('horoSub').textContent=T('horoSub');
  const grid=document.getElementById('horoGrid'); grid.innerHTML='';
  const saved=DB.get('sign');
  ZODIAC.forEach(z=>{
    const b=document.createElement('button');
    b.className='zsign'+((currentSign?.id||saved)===z.id?' sel':'');
    b.innerHTML=`<span class="zsym">${z.sym}</span><span class="znm">${state.lang==='he'?z.he:z.en}</span>`;
    b.onclick=()=>selectSign(z.id);
    grid.appendChild(b);
  });
  if(!currentSign && saved){const z=ZODIAC.find(x=>x.id===saved);if(z)selectSign(z.id);}
}
function selectSign(id){
  const z=ZODIAC.find(x=>x.id===id); if(!z)return;
  currentSign=z; DB.set('sign',id);
  document.querySelectorAll('#horoGrid .zsign').forEach(el=>el.classList.toggle('sel',el.querySelector('.znm').textContent===(state.lang==='he'?z.he:z.en)));
  const res=document.getElementById('horoResult');
  let html=`<div class="reading" style="margin-top:16px">
    <div class="rc"><div class="h">${z.sym} ${state.lang==='he'?z.he:z.en} <span class="p">${ZODIAC_ELEM[z.el]} ${T('horoEl_'+z.el)}</span></div>
    <div class="m">${z.m}</div></div></div>`;
  if(AI.provider&&AI.key){
    html+=`<button class="btn ghost" id="horoDayBtn" onclick="dailyHoroscope()">${T('horoDaily')}</button><div id="horoAi"></div>`;
  }
  html+=`<div class="disc" style="margin-top:12px">${T('horoDisc')}</div>`;
  res.innerHTML=html;
}
async function dailyHoroscope(){
  if(!currentSign)return;
  const box=document.getElementById('horoAi'),btn=document.getElementById('horoDayBtn');btn.disabled=true;
  box.innerHTML=`<div class="ai-box"><div class="hd">✨ ${T('horoReading')}</div><div class="bd"><span class="spin"></span></div></div>`;
  const langName=LANG_NAMES[state.lang];
  const today=new Date().toLocaleDateString(state.lang==='he'?'he-IL':'en-US',{weekday:'long',day:'numeric',month:'long'});
  const sys=`את/ה אסטרולוג/ית חם/ה ומעורר/ת השראה. ענה/י בשפה: ${langName}. תן/י הורוסקופ יומי קצר וזורם למזל הנתון, בטון חיובי ומעצים אך לא דטרמיניסטי. כלול/י נגיעה באהבה/עבודה/רגש וצעד קטן להיום. אורך: פסקה או שתיים. זו קריאה להשראה, לא ניבוי ודאי.`;
  const prompt=`מזל: ${currentSign.he} (${currentSign.en})\nתאריך: ${today}\n\nתן/י הורוסקופ יומי אישי.`;
  try{ const ans=await callAI(prompt,sys); box.innerHTML=`<div class="ai-box"><div class="hd">${currentSign.sym} ${T('horoToday')}</div><div class="bd">${esc(ans)}</div></div>`; }
  catch(e){ box.innerHTML=`<div class="ai-box"><div class="hd">⚠️</div><div class="bd">${T('aiFail')}${esc(e.message)}</div></div>`; btn.disabled=false; }
}
