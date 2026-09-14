/* ============================================================
   MysticNest — Coffee reading (tasseography)
   Base (offline): guide to common cup symbols + meanings.
   Pro (BYOK vision AI): reading from a photo of the grounds.
   Entertainment & inspiration only.
   ============================================================ */

const COFFEE_SYMBOLS=[
  { icon:"❤️", he:"לב", meaning:"אהבה, רגש וקשר. לב ברור מבשר חום ביחסים או התחלה רגשית; לב מטושטש — רגש שעדיין מתגבש." },
  { icon:"🐦", he:"ציפור", meaning:"בשורה וחדשות. ציפור מסמלת מסר שבדרך — לרוב חדשות טובות או שינוי מרענן." },
  { icon:"🌳", he:"עץ", meaning:"צמיחה ויציבות. עץ מבשר התפתחות אישית, שורשים מתחזקים או משאלה שמבשילה עם הזמן." },
  { icon:"🐍", he:"נחש", meaning:"זהירות והתחדשות. נחש מזמין לשים לב למי או למה שדורש אמון מחודש — או לשינוי שמשיל את הישן." },
  { icon:"💍", he:"טבעת", meaning:"מחויבות ואיחוד. טבעת שלמה מבשרת קשר או הבטחה; טבעת שבורה — התלבטות סביב מחויבות." },
  { icon:"⭐", he:"כוכב", meaning:"תקווה והצלחה. כוכב הוא מסימני המזל הטובים — הגשמה, הכרה ואור בקצה הדרך." },
  { icon:"🌙", he:"סהר", meaning:"אינטואיציה ושינוי. סהר מזמין להקשיב לתחושת הבטן ולתת מקום לרגש ולמחזוריות." },
  { icon:"🔑", he:"מפתח", meaning:"פתרון והזדמנות. מפתח מבשר דלת שנפתחת — תשובה, הבנה או התחלה חדשה בהישג יד." },
  { icon:"🐟", he:"דג", meaning:"שפע ומזל. דג נחשב לסימן מבשר טובות — שגשוג, פוריות רעיונית או בשורה כלכלית." },
  { icon:"⚓", he:"עוגן", meaning:"יציבות וביטחון. עוגן מבשר בסיס איתן, מנוחה אחרי מסע, או קשר שנותן ביטחון." },
  { icon:"🚪", he:"קו/שביל", meaning:"דרך ומסע. קו ישר מסמל התקדמות ברורה; קו מפותל — דרך עם פניות, אך עדיין קדימה." },
  { icon:"⭕", he:"עיגול", meaning:"שלמות וסגירת מעגל. עיגול שלם מבשר הצלחה והשלמה; מעגל פתוח — משהו שעוד מבקש להיסגר." },
  { icon:"☁️", he:"ענן", meaning:"אי-ודאות זמנית. ענן מזמין סבלנות — משהו עדיין לא ברור, אך יתבהר עם הזמן." },
  { icon:"🦋", he:"פרפר", meaning:"שינוי וקלילות. פרפר מבשר טרנספורמציה עדינה, שמחה מתחדשת או שחרור מהכבד." },
  { icon:"🏔️", he:"הר", meaning:"אתגר ומטרה. הר מסמל יעד גדול או מכשול שדורש התמדה — אך גם פסגה שמתקרבת." },
];

let coffeeMode='guide';
let coffeeImage=null;

function renderCoffee(){
  const chips=document.getElementById('coffeeModeChips'); chips.innerHTML='';
  [['guide','coffeeModeGuide'],['photo','coffeeModePhoto']].forEach(([m,k])=>{
    const b=document.createElement('button');
    b.className='chip'+(coffeeMode===m?' sel':'');
    b.textContent=T(k);
    b.onclick=()=>{coffeeMode=m;renderCoffee();};
    chips.appendChild(b);
  });
  document.getElementById('coffeeGuide').classList.toggle('hidden',coffeeMode!=='guide');
  document.getElementById('coffeePhoto').classList.toggle('hidden',coffeeMode!=='photo');
  document.getElementById('coffeeH').textContent=T('coffeeH');
  document.getElementById('coffeeSub').textContent=T('coffeeSub');
  if(coffeeMode==='guide')renderCoffeeGuide(); else renderCoffeePhoto();
}
function renderCoffeeGuide(){
  const box=document.getElementById('coffeeGuide');
  let html=`<img class="guide-img" src="assets/guide/coffee-cup.webp" alt="${T('coffeeH')}" onerror="this.style.display='none'">`;
  html+=`<p class="small" style="text-align:center;margin:4px 0 10px">${T('coffeeGuideIntro')}</p>`;
  COFFEE_SYMBOLS.forEach(s=>{
    html+=`<div class="palm-line-card"><div class="h">${s.icon} ${s.he}</div><div class="m">${s.meaning}</div></div>`;
  });
  html+=`<div class="disc" style="margin-top:12px">${T('coffeeDisc')}</div>`;
  box.innerHTML=html;
}
function renderCoffeePhoto(){
  document.getElementById('coffeeHint').textContent=T('coffeeHint');
  document.getElementById('coffeeCamT').textContent=T('palmCamT');
  document.getElementById('coffeeGalT').textContent=T('palmGalT');
  document.getElementById('coffeePrivacy').textContent=T('coffeePrivacy');
  const res=document.getElementById('coffeeResult');
  if(!(AI.provider&&AI.key)){
    res.innerHTML=`<div class="reading" style="margin-top:14px;border-color:var(--gold)"><div class="m">${T('coffeeNoAI')}</div>
      <button class="btn ghost" style="margin-top:10px" onclick="go('settings');setTimeout(openAI,250)">${T('palmConnectAI')}</button></div>`;
  }
}
function coffeePicked(e){
  const f=e.target.files&&e.target.files[0]; if(!f)return;
  const reader=new FileReader();
  reader.onload=()=>resizeCoffee(reader.result);
  reader.readAsDataURL(f);
  e.target.value='';
}
function resizeCoffee(dataUrl){
  const img=new Image();
  img.onload=()=>{
    const max=1024; let {width:w,height:h}=img;
    if(w>max||h>max){const s=Math.min(max/w,max/h);w=Math.round(w*s);h=Math.round(h*s);}
    const c=document.createElement('canvas');c.width=w;c.height=h;
    c.getContext('2d').drawImage(img,0,0,w,h);
    const out=c.toDataURL('image/jpeg',0.85);
    coffeeImage={media:'image/jpeg',data:out.split(',')[1]};
    document.getElementById('coffeePreview').innerHTML=`<img class="palm-preview-img" src="${out}" alt="coffee">
      <button class="btn" onclick="readCoffee()" ${(!(AI.provider&&AI.key))?'disabled':''}>${T('coffeeReadBtn')}</button>
      <button class="btn ghost" onclick="coffeeReset()">${T('palmRetake')}</button>`;
    document.getElementById('coffeeResult').innerHTML='';
    if(!(AI.provider&&AI.key))renderCoffeePhoto();
  };
  img.src=dataUrl;
}
function coffeeReset(){coffeeImage=null;document.getElementById('coffeePreview').innerHTML='';document.getElementById('coffeeResult').innerHTML='';renderCoffeePhoto();}
async function readCoffee(){
  if(!coffeeImage||!(AI.provider&&AI.key))return;
  const res=document.getElementById('coffeeResult');
  res.innerHTML=`<div class="ai-box"><div class="hd">✨ ${T('coffeeReading')}</div><div class="bd"><span class="spin"></span></div></div>`;
  const langName=LANG_NAMES[state.lang];
  const sys=`את/ה קורא/ת בספל קפה (טאסאוגרפיה) חם/ה, סקרן/ית ומעורר/ת השראה, בגישה מסורתית-סמלית. ענה/י בשפה: ${langName}. הסתכל/י על התמונה של שאריות הקפה בספל, תאר/י אילו צורות וסמלים אפשר לדמיין בהן (לב, ציפור, עץ, קו, עיגול וכו'), ותן/י קריאה סמלית זורמת. אם התמונה אינה ספל/שאריות קפה, אמור/י זאת בעדינות ובקש/י תמונה מתאימה. טון: חם ומעצים, לא מפחיד. סיים/י בצעד מעשי קטן. אורך: 3-4 פסקאות. הבהר/י שזו קריאה להשראה והרהור בלבד, לא ניבוי.`;
  const prompt=`הנה תמונה של ספל הקפה שלי אחרי השתייה. קרא/י בשאריות בבקשה.`;
  try{ const ans=await callAI(prompt,sys,coffeeImage);
    if(typeof saveHistory==='function')saveHistory('coffee',T('tCoffee'),new Date().toLocaleDateString(),{ai:ans});
    res.innerHTML=`<div class="ai-box"><div class="hd">☕ ${T('coffeeYourReading')}</div><div class="bd">${esc(ans)}</div></div>
      <div class="disc" style="margin-top:12px">${T('coffeeDisc')}</div>`;
  }catch(e){ res.innerHTML=`<div class="ai-box"><div class="hd">⚠️</div><div class="bd">${T('aiFail')}${esc(e.message)}</div></div>`; }
}
