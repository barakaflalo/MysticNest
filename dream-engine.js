/* Expanded local engine. All text is authored and remains on device. */
const DREAM_SPELLINGS={'היתה':'הייתה','היתי':'הייתי','אמא':'אימא','אוניה':'אונייה','מוסיקה':'מוזיקה','תעופה':'תעופה','שרותים':'שירותים','שיטפון':'שיטפון','שטפון':'שיטפון','מעליט':'מעלית','רכוות':'רכבות'};
function dreamNormalize(t){return String(t||'').normalize('NFKC').replace(/[\u0591-\u05C7]/g,'').toLowerCase().replace(/can[’']t/g,'cannot').replace(/won[’']t/g,'will not').replace(/n[’']t/g,' not').replace(/[^א-תa-z0-9]+/g,' ').trim().split(/\s+/).map(w=>DREAM_SPELLINGS[w]||w).join(' ');}
function dreamFind(text,keys){
 const clauses=String(text).split(/[.!?;\n]+|\s+(?:אבל|אלא|but|instead)\s+/),found=[];let offset=0;
 const prefix=['ו','ב','ה','ל','מ','ש','כ','וה','וב','ול','שה','מה','בה','לה','כש'];
 clauses.forEach((clause,ci)=>{const words=dreamNormalize(clause).split(' ').filter(Boolean);
  for(const key of keys){const parts=dreamNormalize(key).split(' ');if(!parts[0])continue;
   for(let i=0;i<=words.length-parts.length;i++){
    if(!parts.every((w,j)=>words[i+j]===w||(w.length>=3&&prefix.some(p=>words[i+j]===p+w))))continue;
    const prev=words.slice(Math.max(0,i-3),i),inherent=['לא','אין','בלי','ללא','not','no','without','cannot'].includes(parts[0]);
    const neg=prev.findLastIndex(w=>['לא','ולא','בלי','ללא','אין','ואין','no','not','never','without'].includes(w));
    if(!inherent&&neg>=0&&prev.slice(neg+1).every(w=>['היה','הייתה','היו','ראיתי','ראינו','מצאתי','פגשתי','שם','שום','לי','a','an','any','the','was','were','is','see','saw','find','found','there'].includes(w)))continue;
    found.push({text:words.slice(i,i+parts.length).join(' '),at:offset+i,clause:ci,length:parts.length});
   }
  }offset+=words.length+1;
 });return found.filter((m,i,a)=>a.findIndex(x=>x.at===m.at&&x.text===m.text)===i);
}
function dreamEvidence(text,keys){return [...new Set(dreamFind(text,keys).map(m=>m.text))];}
const DREAM_KEY_REPAIRS={locked:['דלת נעולה','הדלת הייתה נעולה','לא הצלחתי לפתוח את הדלת'],test:['מבחן','בחינה','נבחן','נבחנת','נבחנתי','מבחנים'],death:['מוות','מתה','גסיסה','הלוויה','קבר','אדם מת','מישהו מת','אבי מת','אמי מת'],baby:['תינוק','תינוקת','לידה','היריון','עובר ברחם'],pregnancy:['בהיריון','היריון','הריון','בטן של היריון'],light:['אור','זוהר','מנורה','נר דולק','נרות'],ex:['אקס','אקסית','אהובה לשעבר','בן זוג לשעבר','בת זוג לשעבר','גרוש','גרושה'],friend:['חבר','חברה','חברים','חברות','ידיד','ידידה'],mountain:['הר','הרים','פסגה','מצוק'],garden:['פארק','גינה ציבורית','גן משחקים','גן פרחים'],door:['דלת','דלתות','שער','פתח בדלת'],teeth:['שיניים','שן','שיני','שיניים בריאות'],school:['בית ספר','בית הספר','ביתספר','ביהס','ביה״ס']};
const DREAM_PARENTS={dogkind:['dog'],dogattack:['dog'],snakebite:['snake'],snakestill:['snake'],houseold:['house'],houseempty:['house'],houseroom:['house'],housefire:['house','fire'],homerepair:['house'],brakesfail:['vehicle'],drivecalm:['vehicle'],carcrash:['vehicle'],elevatorstuck:['elevator'],elevatorup:['elevator'],elevatordown:['elevator'],bridgebroken:['bridge'],bridgecross:['bridge'],examunready:['test'],exampass:['test'],phonebroken:['phone'],phonenoconnect:['phone'],phonelost:['phone'],baglost:['bag'],keyslost:['keys'],walletlost:['wallet'],clothesmissing:['clothes','naked'],teethfall:['teeth'],newhome:['house'],houseold:['house'],flooded:['water'],calmwater:['water'],drown:['water'],swim:['water']};
Object.assign(DREAM_KEY_REPAIRS,{stairs:['מדרגות','מדרגה','חדר מדרגות'],spider:['עכביש','עכבישים','קורי עכביש'],rain:['גשם','גשמים','גשום','טיפות גשם'],moon:['ירח','ירח מלא','לבנה בשמים'],dog:['כלב','כלבים','כלבה','גור כלבים'],bird:['ציפור','ציפורים','יונה','ציפורי','נשר בשמים'],house:['בית','דירה','בית ילדות'],water:['מים','זרם מים'],child:['ילד','ילדה','ילדים','ילדות קטנות']});
function dreamCatalog(){
 if(contentLang()==='en')return EN_DREAM_CATALOG;
 const removed=new Set(['late','lost','chase','stuck','falling','flying','flood','exam']);
 const base=DREAM_DB.filter(s=>!removed.has(s.id)).map(s=>({id:s.id,name:s.he,keys:[...(DREAM_KEY_REPAIRS[s.id]||s.keys),...(DREAM_ALIASES[s.id]||[])],kind:'symbol',meaning:'כיוונים אפשריים להתבוננות: '+(DREAM_LENSES[s.id]||'האסוציאציה האישית שלך לפרט וההתרחשות שסביבו')+'. אין לפרט הזה משמעות אחת מחייבת.',question:'איזה זיכרון או רגש '+s.he+' מעורר בך, ומה היה תפקידו בסיפור?'}));
 const extra=DREAM_EXPANSION.symbols.map(r=>({...r,keys:DREAM_KEY_REPAIRS[r.id]||r.keys,kind:'symbol'}));
 const scenarios=[...DREAM_RULES,...DREAM_EXPANSION.scenarios].map(r=>({...r,keys:DREAM_KEY_REPAIRS[r.id]||r.keys,kind:'scenario'}));
 return [...scenarios,...base,...extra];
}
function analyzeLocalDream(txt,emotion='',ending='',excluded=[],personal={}){
 const denied=new Set(excluded);const matched=dreamCatalog().map(r=>{const matches=dreamFind(txt,r.keys);return {...r,matches,evidence:[...new Set(matches.map(m=>m.text))]};}).filter(r=>r.matches.length&&!denied.has(r.id));
 if(typeof applyDreamAnswers==='function')applyDreamAnswers(matched,personal,excluded);
 const ids=new Set(matched.map(r=>r.id));
 const combos=(contentLang()==='he'?DREAM_EXPANSION.combinations:EN_DREAM_COMBINATIONS).filter(c=>c.ids.every(id=>ids.has(id))).filter(c=>{
  const a=matched.find(r=>r.id===c.ids[0]),b=matched.find(r=>r.id===c.ids[1]);return a.matches.some(x=>b.matches.some(y=>Math.abs(x.clause-y.clause)<=1&&Math.abs(x.at-y.at)<=35));
 });
 const score=r=>(r.id===personal.focus?100:0)+(r.kind==='scenario'?20:0)+Math.max(...r.matches.map(m=>m.length))*3+Math.min(r.matches.length,3);
 matched.sort((a,b)=>score(b)-score(a)||a.matches[0].at-b.matches[0].at);
 const found=matched.filter(r=>!matched.some(s=>s.id!==r.id&&(DREAM_PARENTS[s.id]||[]).includes(r.id)&&r.id!==personal.focus));
 const chosen=found.find(r=>r.id===personal.focus)||found[0];
 const relevant=combos.sort((a,b)=>Number(b.ids.includes(chosen?.id))-Number(a.ids.includes(chosen?.id))).slice(0,2);
 let summary=found.length?U('בחלום זוהו: ')+found.slice(0,4).map(r=>r.name).join(' · ')+'. ':U('לא זוהו מספיק פרטים מוכרים. אפשר להוסיף תיאור של המקום, הפעולה או הדמות שהיו משמעותיים לך. ');
 if(relevant.length)summary+=relevant[0].meaning+' ';
 else if(chosen)summary+=chosen.meaning+' ';
 const em={fear:U('בחרת בפחד: אפשר להתמקד במה שהעניק או היה יכול להעניק ביטחון.'),calm:U('בחרת ברוגע: אין צורך להעניק לפרטים פירוש מאיים אם החוויה הייתה שלווה.'),joy:U('בחרת בשמחה: כדאי לזהות מה היה נעים ומה היית רוצה לקחת מן החוויה.'),confusion:U('בחרת בבלבול: אפשר לברר פרט אחד ולהשאיר את השאר פתוח.'),longing:U('בחרת בגעגוע: אפשר לתת מקום לזיכרון ולמה שחסר לך.'),sadness:U('בחרת בעצב: אפשר לברר מה היה יכול לנחם אותך בתוך הסיפור.')};
 if(em[emotion])summary+=em[emotion]+' ';
 const end={resolved:U('הסיום שבחרת מפנה תשומת לב גם למה שעזר בסיפור.'),unresolved:U('הסיום נשאר פתוח; אפשר לדמיין המשך שהיה נותן מענה לצורך שלך.'),woke:U('התעוררת באמצע; אין צורך להסיק כיצד הסיפור היה מסתיים.')};if(end[ending])summary+=end[ending]+' ';
 let question=relevant[0]?.question||chosen?.question||U('איזה פרט נשאר איתך ומה הוא מזכיר לך?');
 if(personal.significance&&chosen){const lens={safe:[U('הקישור האישי שלך ל־')+chosen.name+U(' הוא של ביטחון או קרבה. כדאי לתת לכך מקום גם אם דימוי כללי מציע כיוון אחר.'),U('מה בפרט הזה מעניק לך ביטחון?')],uncomfortable:[U('קישרת את ')+chosen.name+U(' לאי־נוחות. אפשר לברר את הגבול או הצורך שלך בלי להניח שהסמל מאיים כשלעצמו.'),U('איזה שינוי במפגש היה הופך אותו לנוח יותר?')],memory:[U('קישרת את ')+chosen.name+U(' לזיכרון אישי. אפשר להשוות בין הרגש בזיכרון לבין מה שהיה בחלום.'),U('מה דומה ומה שונה בין הזיכרון לבין החלום?')],new:[U('קישרת את ')+chosen.name+U(' לדבר חדש או מסקרן. אפשר להשאיר מקום לחקירה בלי למהר לקבוע משמעות.'),U('מה היית רוצה לשאול או לגלות על הפרט הזה?')]};if(lens[personal.significance]){summary+=lens[personal.significance][0];question=lens[personal.significance][1];}}
 if(personal.note?.trim())question=U('בהתייחס למה שכתבת על הקשר האישי: ')+question;
 return {found,summary,question,connections:relevant,version:DREAM_EXPANSION.version};
}
function setupDreamExpansion(){
 const controls=document.getElementById('dreamContext');
 const more=dreamEl('details',null,'dream-personal');more.append(dreamEl('summary',U('הקשר האישי שלי (אופציונלי)')));
 for(const [id,label,options] of [['dreamFocus',U('איזה פרט מרכזי עבורך?'),{'':U('אפשר לבחור אחרי הפירוש')}],['dreamSignificance',U('למה הפרט מתקשר אצלך?'),{'':U('ללא בחירה'),safe:U('ביטחון או קרבה'),uncomfortable:U('אי־נוחות או פחד'),memory:U('זיכרון אישי'),new:U('משהו חדש או מסקרן')}]]){const l=dreamEl('label',label,'lbl');l.htmlFor=id;const select=dreamEl('select',null,'field');select.id=id;for(const [v,t] of Object.entries(options))select.append(new Option(t,v));more.append(l,select);}
 const label=dreamEl('label',U('מה זה מזכיר לך? (במילים שלך)'),'lbl');label.htmlFor='dreamPersonal';const note=dreamEl('textarea',null,'field');note.id='dreamPersonal';note.maxLength=1500;more.append(label,note,dreamEl('p',U('הבחירות מכוונות את הקריאה המקומית. הטקסט החופשי נשמר כמחשבה שלך; הבינה יכולה להיעזר בו רק כשתבחר בהעמקה.'),'small'));controls.append(more);
 const catalog=dreamCatalog(),wrap=dreamEl('details',null,'reading dream-library');wrap.append(dreamEl('summary',U('עיון במאגר החלומות')),dreamEl('p',catalog.length+U(' סמלים ומצבים · ')+DREAM_EXPANSION.combinations.length+U(' חיבורים אפשריים'),'small'));
 const search=dreamEl('input',null,'field');search.type='search';search.setAttribute('aria-label',U('חיפוש במאגר החלומות'));search.placeholder=U('חיפוש נושא או מילה');const results=dreamEl('div');
 const show=()=>{results.replaceChildren();const q=dreamNormalize(search.value);const rows=catalog.filter(r=>!q||dreamNormalize(r.name+' '+r.keys.join(' ')).includes(q));results.append(dreamEl('p',rows.length+U(' תוצאות')+(rows.length>25?U(' · מוצגות 25 הראשונות, אפשר לצמצם בחיפוש'):''),'small'));for(const r of rows.slice(0,25)){const d=dreamEl('details');d.append(dreamEl('summary',r.name),dreamEl('p',r.meaning),dreamEl('p',r.question));results.append(d);}};search.oninput=show;wrap.append(search,results);document.querySelector('.dream-journal').after(wrap);show();
 document.getElementById('dreamText').maxLength=12000;
}
setupDreamExpansion();
