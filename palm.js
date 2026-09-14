/* ============================================================
   MysticNest — Palm reading module (chiromancy)
   Two layers, matching the app's pattern:
   - Base (offline, no key): interactive line guide + built-in meanings
   - Pro (BYOK vision AI): personal reading from a palm photo
   Entertainment & inspiration only.
   ============================================================ */

/* ---- offline: hand shapes (elements) ---- */
const PALM_SHAPES=[
  { id:"fire", he:"יד האש", en:"Fire hand", icon:"🔥",
    meaning:"כף יד מלבנית (ארוכה) עם אצבעות קצרות. נקשרת למרץ, ספונטניות, ביטחון ותשוקה לפעולה. בעלי 'יד אש' נוטים להתלהב מהר ולהוביל, ולעיתים להתקשות בסבלנות לפרטים." },
  { id:"earth", he:"יד האדמה", en:"Earth hand", icon:"🌍",
    meaning:"כף יד ריבועית עם אצבעות קצרות וקווים ברורים ומעטים. נקשרת ליציבות, מעשיות, אמינות וחיבור לטבע ולגוף. בעלי 'יד אדמה' מוערכים על שיקול דעת ורגליים על הקרקע." },
  { id:"air", he:"יד האוויר", en:"Air hand", icon:"💨",
    meaning:"כף יד ריבועית עם אצבעות ארוכות ורשת קווים עשירה. נקשרת לחשיבה, סקרנות, תקשורת וצורך בגירוי אינטלקטואלי. בעלי 'יד אוויר' נהנים מרעיונות, שיחה וניתוח." },
  { id:"water", he:"יד המים", en:"Water hand", icon:"💧",
    meaning:"כף יד מלבנית (ארוכה) עם אצבעות ארוכות וקווים דקים ורבים. נקשרת לרגישות, אינטואיציה, יצירתיות ועומק רגשי. בעלי 'יד מים' קולטים אווירה בעדינות ומושפעים מסביבתם." },
];

/* ---- offline: mounts (gvaot) ---- */
const PALM_MOUNTS=[
  { id:"jupiter", he:"גבעת צדק (יופיטר)", en:"Mount of Jupiter",
    meaning:"מתחת לאצבע המורה. קשורה לשאפתנות, מנהיגות, ביטחון עצמי וגאווה בריאה. גבעה מלאה מרמזת על רצון להוביל ולהשפיע." },
  { id:"saturn", he:"גבעת שבתאי (סטורן)", en:"Mount of Saturn",
    meaning:"מתחת לאצבע האמצעית. קשורה לאחריות, משמעת, חוכמה והתבוננות. גבעה בולטת מרמזת על רצינות ונטייה למחשבה מעמיקה." },
  { id:"apollo", he:"גבעת השמש (אפולו)", en:"Mount of Apollo",
    meaning:"מתחת לאצבע הקמיצה. קשורה ליצירתיות, ביטוי עצמי, כריזמה והנאה מיופי. גבעה מלאה מרמזת על כישרון אמנותי ואופטימיות." },
  { id:"mercury", he:"גבעת מרקורי", en:"Mount of Mercury",
    meaning:"מתחת לאצבע הזרת. קשורה לתקשורת, שנינות, מסחר וקשרים. גבעה בולטת מרמזת על כושר ביטוי ויכולת לשכנע ולהתחבר." },
  { id:"venus", he:"גבעת ונוס", en:"Mount of Venus",
    meaning:"הבסיס הרך שסביב האגודל. קשורה לאהבה, חום, חיוניות ותשוקת חיים. גבעה מלאה מרמזת על אנרגיה, נדיבות ויכולת ליהנות." },
  { id:"mars", he:"גבעות מאדים", en:"Mounts of Mars",
    meaning:"שני אזורים (עליון ותחתון) בצדי כף היד. קשורים לאומץ, נחישות ועמידות מול קושי. מרמזים על היכולת לעמוד על שלך ולהתמיד." },
  { id:"moon", he:"גבעת הירח (לונה)", en:"Mount of the Moon",
    meaning:"בבסיס כף היד בצד הזרת. קשורה לדמיון, אינטואיציה, חלומות ורגש. גבעה מלאה מרמזת על עולם פנימי עשיר ויצירתי." },
];

/* ---- offline line database (original Hebrew phrasings) ---- */
const PALM_LINES=[
  { id:"heart", color:"#e0567a",
    he:"קו הלב", en:"Heart line",
    meaning:"הקו העליון, הקשור לרגש, לאהבה ולמערכות יחסים. קו ארוך ועמוק מרמז על נפש רגשית ומעורבת; קו עדין או קטוע — על ריסון רגשי או תקופות של שינוי בלב. עקומה כלפי מעלה נחשבת למבטאת חום וספונטניות, וקו ישר — לגישה שקולה יותר ברגש." },
  { id:"head", color:"#d4af37",
    he:"קו הראש", en:"Head line",
    meaning:"הקו האמצעי, הקשור לחשיבה, ללמידה ולסגנון קבלת ההחלטות. קו ארוך מרמז על מחשבה יסודית ומפורטת; קו קצר — על גישה ישירה ומעשית. קו ישר נקשר להיגיון, וקו משופע כלפי מטה — לדמיון ולנטייה יצירתית." },
  { id:"life", color:"#4fbf8f",
    he:"קו החיים", en:"Life line",
    meaning:"הקו המקיף את בסיס האגודל. בניגוד לאמונה הרווחת, הוא אינו מודד את אורך החיים אלא את החיוניות, האנרגיה והיציבות. קו רחב וברור נקשר לכוח וחיוניות; קו קרוב לאגודל — לזהירות; שינויים לאורכו — למעברים משמעותיים בחיים." },
  { id:"fate", color:"#8a7cff",
    he:"קו הגורל", en:"Fate line",
    meaning:"קו אנכי העולה לעבר האצבע האמצעית (לא לכולם יש אותו). הוא נקשר למסלול החיים, לקריירה ולתחושת הכיוון. קו ברור מרמז על נתיב ממוקד; קו קטוע או כפול — על שינויי דרך, ולעיתים על אדם שמעצב את דרכו בעצמו יותר מפעם אחת." },
  { id:"sun", color:"#f0a074",
    he:"קו השמש (אפולו)", en:"Sun line",
    meaning:"קו אנכי לעבר אצבע הקמיצה, הנקשר ליצירתיות, להכרה ולסיפוק. כשהוא נוכח וברור הוא מרמז על ביטוי עצמי, כישרון או תחושת הגשמה. היעדרו אינו סימן שלילי — רבים פורחים גם בלעדיו." },
];

let palmMode='guide';       // 'guide' | 'photo'
let palmImage=null;         // {media,data} for AI

function renderPalm(){
  // mode chips
  const chips=document.getElementById('palmModeChips'); chips.innerHTML='';
  [['guide','palmModeGuide'],['photo','palmModePhoto']].forEach(([m,k])=>{
    const b=document.createElement('button');
    b.className='chip'+(palmMode===m?' sel':'');
    b.textContent=T(k);
    b.onclick=()=>{palmMode=m;renderPalm();};
    chips.appendChild(b);
  });
  document.getElementById('palmGuide').classList.toggle('hidden',palmMode!=='guide');
  document.getElementById('palmPhoto').classList.toggle('hidden',palmMode!=='photo');
  document.getElementById('palmSub').textContent=T('palmSub');
  document.getElementById('palmH').textContent=T('palmH');
  if(palmMode==='guide') renderPalmGuide(); else renderPalmPhoto();
}

/* ---- offline guide: diagram + line list ---- */
/* hotspot positions (% of image) roughly over each line, matched to PALM_LINES colors */
const PALM_HOTSPOTS=[
  {id:"sun",   x:61, y:44, c:"#f0a074"},
  {id:"heart", x:74, y:48, c:"#e0567a"},
  {id:"head",  x:66, y:56, c:"#d4af37"},
  {id:"fate",  x:55, y:64, c:"#8a7cff"},
  {id:"life",  x:45, y:61, c:"#4fbf8f"},
];
function palmDiagram(){
  let dots='';
  PALM_HOTSPOTS.forEach(h=>{
    dots+=`<button class="palm-hot" style="left:${h.x}%;top:${h.y}%;--c:${h.c}" aria-label="${h.id}" onclick="palmJump('${h.id}')"></button>`;
  });
  return `<div class="palm-diagram-wrap">
    <img class="guide-img" style="margin:0" src="assets/guide/palm-diagram.webp" alt="${T('palmH')}" onerror="this.style.display='none'">
    ${dots}
  </div>`;
}
function palmJump(id){
  const card=document.getElementById('pl-'+id); if(!card)return;
  card.scrollIntoView({behavior:'smooth',block:'center'});
  card.style.transition='border-color .2s';
  card.style.borderColor='var(--gold,#d4af37)';
  setTimeout(()=>{card.style.borderColor='';},1400);
}
function renderPalmGuide(){
  const box=document.getElementById('palmGuide');
  let html=`<p class="small" style="text-align:center;margin:4px 0 6px">${T('palmGuideIntro')}</p>${palmDiagram()}<div id="palmLineList">`;
  PALM_LINES.forEach(l=>{
    html+=`<div class="palm-line-card" id="pl-${l.id}">
      <div class="h"><span class="dotc" style="background:${l.color}"></span>${state.lang==='he'?l.he:l.en}</div>
      <div class="m">${l.meaning}</div></div>`;
  });
  // hand shapes
  html+=`<div class="palm-section-title">${T('palmShapesTitle')}</div>`;
  PALM_SHAPES.forEach(s=>{
    html+=`<div class="palm-line-card"><div class="h">${s.icon} ${state.lang==='he'?s.he:s.en}</div><div class="m">${s.meaning}</div></div>`;
  });
  // mounts
  html+=`<div class="palm-section-title">${T('palmMountsTitle')}</div>`;
  PALM_MOUNTS.forEach(m=>{
    html+=`<div class="palm-line-card"><div class="h">✦ ${state.lang==='he'?m.he:m.en}</div><div class="m">${m.meaning}</div></div>`;
  });
  html+=`</div><div class="disc" style="margin-top:12px">${T('palmDisc')}</div>`;
  box.innerHTML=html;
}

/* ---- photo / AI mode ---- */
function renderPalmPhoto(){
  document.getElementById('palmHint').textContent=T('palmHint');
  document.getElementById('palmCamT').textContent=T('palmCamT');
  document.getElementById('palmGalT').textContent=T('palmGalT');
  document.getElementById('palmPrivacy').textContent=T('palmPrivacy');
  // if no AI connected, show a gentle notice (guide still available)
  const res=document.getElementById('palmResult');
  if(!(AI.provider&&AI.key)){
    res.innerHTML=`<div class="reading" style="margin-top:14px;border-color:var(--gold)"><div class="m">${T('palmNoAI')}</div>
      <button class="btn ghost" style="margin-top:10px" onclick="go('settings');setTimeout(openAI,250)">${T('palmConnectAI')}</button></div>`;
  }
}
function palmPicked(e){
  const f=e.target.files&&e.target.files[0]; if(!f)return;
  const reader=new FileReader();
  reader.onload=()=>resizePalm(reader.result);
  reader.readAsDataURL(f);
  e.target.value=''; // allow re-pick same file
}
function resizePalm(dataUrl){
  const img=new Image();
  img.onload=()=>{
    const max=1024;
    let {width:w,height:h}=img;
    if(w>max||h>max){const s=Math.min(max/w,max/h);w=Math.round(w*s);h=Math.round(h*s);}
    const c=document.createElement('canvas');c.width=w;c.height=h;
    c.getContext('2d').drawImage(img,0,0,w,h);
    const out=c.toDataURL('image/jpeg',0.85);
    palmImage={media:'image/jpeg',data:out.split(',')[1]};
    // preview + read button
    const pv=document.getElementById('palmPreview');
    pv.innerHTML=`<img class="palm-preview-img" src="${out}" alt="palm">
      <button class="btn" onclick="readPalm()" ${(!(AI.provider&&AI.key))?'disabled':''}>${T('palmReadBtn')}</button>
      <button class="btn ghost" onclick="palmReset()">${T('palmRetake')}</button>`;
    document.getElementById('palmResult').innerHTML='';
    if(!(AI.provider&&AI.key)) renderPalmPhoto();
  };
  img.src=dataUrl;
}
function palmReset(){palmImage=null;document.getElementById('palmPreview').innerHTML='';document.getElementById('palmResult').innerHTML='';renderPalmPhoto();}

async function readPalm(){
  if(!palmImage||!(AI.provider&&AI.key))return;
  const res=document.getElementById('palmResult');
  res.innerHTML=`<div class="ai-box"><div class="hd">✨ ${T('palmReading')}</div><div class="bd"><span class="spin"></span></div></div>`;
  const langName=LANG_NAMES[state.lang];
  const sys=`את/ה קורא/ת כף יד (צ'ירומנטיה) חם/ה, סקרן/ית ומעורר/ת השראה, בגישה מסורתית-סמלית. ענה/י בשפה: ${langName}. הסתכל/י על התמונה של כף היד וזה/י את הקווים העיקריים שנראים (קו הלב, קו הראש, קו החיים, ואם נראים גם קו הגורל וצורת היד/האצבעות). תאר/י מה נראה ותן/י קריאה סמלית זורמת המקשרת בין הקווים. אם התמונה אינה כף יד ברורה, אמור/י זאת בעדינות ובקש/י תמונה טובה יותר. טון: חם ומעצים, לא מפחיד, לא רפואי. סיים/י בצעד מעשי קטן אחד. אורך: 3-4 פסקאות. הבהר/י בעדינות שזו קריאה להשראה והרהור בלבד, לא ניבוי.`;
  const prompt=`הנה תמונה של כף היד שלי. קרא/י בה בבקשה.`;
  try{
    const ans=await callAI(prompt,sys,palmImage);
    res.innerHTML=`<div class="ai-box"><div class="hd">🖐️ ${T('palmYourReading')}</div><div class="bd">${esc(ans)}</div></div>
      <div class="disc" style="margin-top:12px">${T('palmDisc')}</div>`;
  }catch(e){
    res.innerHTML=`<div class="ai-box"><div class="hd">⚠️</div><div class="bd">${T('aiFail')}${esc(e.message)}</div></div>`;
  }
}
