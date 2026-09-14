/* ============================================================
   MysticNest — Reading history (central)
   Lists every saved reading from all modules; opens full text
   (offline reading + AI reading). All data local.
   ============================================================ */

const HIST_ICON={tarot:"🔮",dream:"🌙",num:"🔢",horo:"♈",palm:"🖐️",coffee:"☕",compat:"🪬",fortune:"🥠"};
let histFilter='all';

function histDate(t){
  try{ return new Date(t).toLocaleString(state.lang==='he'?'he-IL':'en-US',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); }
  catch(e){ return ''; }
}
function renderHistory(){
  document.getElementById('historyH').textContent=T('historyH');
  document.getElementById('historySub').textContent=T('historySub');
  let items=DB.getJSON('history',[]);
  // backfill ids for older entries saved before the id/full-text feature, so they're openable
  let changed=false;
  items.forEach((i,idx)=>{ if(!i.id){ i.id='h'+(i.t||Date.now()).toString(36)+'x'+idx; changed=true; } });
  if(changed)DB.setJSON('history',items);
  const list=document.getElementById('historyList');
  const filterBox=document.getElementById('historyFilter');

  // filter chips (All + each type present)
  const types=[...new Set(items.map(i=>i.type))].filter(t=>HIST_ICON[t]);
  filterBox.innerHTML='';
  if(items.length){
    const mk=(val,label)=>{const b=document.createElement('button');b.className='chip'+(histFilter===val?' sel':'');b.textContent=label;b.onclick=()=>{histFilter=val;renderHistory();};return b;};
    filterBox.appendChild(mk('all',T('historyAll')));
    types.forEach(t=>filterBox.appendChild(mk(t,(HIST_ICON[t]||'')+' '+T('histType_'+t))));
  }

  const shown=items.filter(i=>histFilter==='all'||i.type===histFilter);
  if(!shown.length){
    list.innerHTML=`<div class="empty">${T('historyEmpty')}</div>`;
    return;
  }
  let html='';
  shown.forEach(i=>{
    const hasAI=i.details&&i.details.ai;
    html+=`<button class="hist-item" onclick="openHistoryEntry('${i.id}')" style="width:100%;text-align:start;cursor:pointer">
      <div class="hi">${HIST_ICON[i.type]||'✦'}</div>
      <div class="ht"><b>${esc(i.title||'')}</b><span>${esc(i.sub||'')}</span></div>
      <div style="text-align:end;flex-shrink:0">
        ${hasAI?'<div style="font-size:12px;color:var(--gold)">✨</div>':''}
        <div class="hd">${histDate(i.t).split(',')[0]||''}</div>
      </div>
    </button>`;
  });
  // clear button
  html+=`<button class="btn ghost" style="margin-top:14px;color:var(--danger)" onclick="clearHistory()">${T('historyClear')}</button>`;
  list.innerHTML=html;
}

function openHistoryEntry(id){
  const items=DB.getJSON('history',[]);
  const e=items.find(x=>x.id===id); if(!e)return;
  const d=e.details||{};
  const m=document.createElement('div');m.className='modal';m.onclick=(ev)=>{if(ev.target===m)m.remove();};
  let inner=`<div class="box"><h3>${HIST_ICON[e.type]||'✦'} ${esc(e.title||'')}</h3>
    <div class="small" style="color:var(--dim);margin-bottom:12px">${esc(histDate(e.t))}</div>`;
  if(e.sub) inner+=`<div class="small" style="margin-bottom:10px">${esc(e.sub)}</div>`;
  // dream text (dreams save the dream itself under details.txt)
  if(d.txt) inner+=`<div class="hist-detail-label">${T('lblDream')}</div><div class="bd" style="white-space:pre-wrap;font-size:14px;line-height:1.7;margin-bottom:12px">${esc(d.txt)}</div>`;
  // offline reading body
  if(d.body) inner+=`<div class="hist-detail-label">${T('historyBodyLabel')}</div><div class="bd" style="white-space:pre-wrap;font-size:14px;line-height:1.7;margin-bottom:12px">${esc(d.body)}</div>`;
  // dream local/emotion reading text
  if(d.reading && d.reading!==d.ai) inner+=`<div class="hist-detail-label">${T('historyBodyLabel')}</div><div class="bd" style="white-space:pre-wrap;font-size:14px;line-height:1.7;margin-bottom:12px">${esc(d.reading)}</div>`;
  // AI reading
  if(d.ai) inner+=`<div class="ai-box"><div class="hd">✨ ${T('historyAiLabel')}</div><div class="bd" style="white-space:pre-wrap">${esc(d.ai)}</div></div>`;
  // nothing full saved (older entry from before full-text saving)
  if(!d.txt && !d.body && !d.reading && !d.ai) inner+=`<div class="small" style="color:var(--dim)">${T('historyNoFull')}</div>`;
  const canShare=(d.txt||d.body||d.reading||d.ai);
  inner+=`<div style="display:flex;gap:10px;margin-top:16px">`;
  if(canShare) inner+=`<button class="btn" style="margin:0;flex:1" onclick="shareReadingImage('${id}')">${T('historyShare')}</button>`;
  inner+=`<button class="btn ghost" style="margin:0;flex:1" onclick="this.closest('.modal').remove()">✓</button></div></div>`;
  m.innerHTML=inner;
  document.body.appendChild(m);
}

/* ---- share a reading as a styled black-gold image ---- */
function shareReadingImage(id){
  const items=DB.getJSON('history',[]);
  const e=items.find(x=>x.id===id); if(!e)return;
  const d=e.details||{};
  const title=(HIST_ICON[e.type]||'✦')+' '+(e.title||'');
  const blocks=[];
  if(e.sub)blocks.push(e.sub);
  if(d.txt)blocks.push(d.txt);
  if(d.body)blocks.push(d.body);
  if(d.reading&&d.reading!==d.ai)blocks.push(d.reading);
  if(d.ai)blocks.push('✨ '+d.ai);
  const W=1080, pad=90, maxW=W-pad*2;
  const cv=document.createElement('canvas'); const ctx=cv.getContext('2d');
  const rtl=RTL_LANGS.includes(state.lang);
  // wrap helper
  function wrap(text,font){
    ctx.font=font; const out=[];
    text.split('\n').forEach(para=>{
      if(!para.trim()){out.push('');return;}
      let line='';
      para.split(' ').forEach(word=>{
        const test=line?line+' '+word:word;
        if(ctx.measureText(test).width>maxW&&line){out.push(line);line=word;}
        else line=test;
      });
      if(line)out.push(line);
    });
    return out;
  }
  const titleFont='800 52px Heebo, sans-serif';
  const bodyFont='400 34px Heebo, sans-serif';
  const dateFont='400 26px Heebo, sans-serif';
  // measure height
  let y=pad+70;
  const titleLines=wrap(title,titleFont); y+=titleLines.length*64+10;
  y+=44; // date
  const bodyLineSets=blocks.map(b=>wrap(b,bodyFont));
  bodyLineSets.forEach(ls=>{ y+=ls.length*48+30; });
  y+=100; // footer
  const H=Math.max(1080,y);
  cv.width=W; cv.height=H;
  // background
  ctx.fillStyle='#0d0d10'; ctx.fillRect(0,0,W,H);
  // gold border
  ctx.strokeStyle='#d4af37'; ctx.lineWidth=4; ctx.strokeRect(30,30,W-60,H-60);
  ctx.strokeStyle='rgba(212,175,55,.4)'; ctx.lineWidth=1.5; ctx.strokeRect(46,46,W-92,H-92);
  // text
  ctx.direction=rtl?'rtl':'ltr'; ctx.textAlign=rtl?'right':'left';
  const x=rtl?W-pad:pad;
  y=pad+70;
  ctx.fillStyle='#f0d67a'; ctx.font=titleFont;
  titleLines.forEach(l=>{ctx.fillText(l,x,y);y+=64;});
  y+=6;
  ctx.fillStyle='#9a927e'; ctx.font=dateFont; ctx.fillText(histDate(e.t),x,y); y+=54;
  ctx.font=bodyFont;
  bodyLineSets.forEach((ls,i)=>{
    ctx.fillStyle = blocks[i].startsWith('✨') ? '#f0d67a' : '#e8e0cc';
    ls.forEach(l=>{ctx.fillText(l,x,y);y+=48;});
    y+=30;
  });
  // footer
  ctx.textAlign='center'; ctx.direction='ltr';
  ctx.fillStyle='#d4af37'; ctx.font='700 30px Heebo, sans-serif';
  ctx.fillText('🔮 MysticNest',W/2,H-70);
  // export
  cv.toBlob(async(blob)=>{
    if(!blob){toast(T('aiFail'));return;}
    const file=new File([blob],'mysticnest-reading.png',{type:'image/png'});
    try{
      if(navigator.canShare&&navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:'MysticNest'});
      }else{
        const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mysticnest-reading.png';a.click();
        toast(T('saved'));
      }
    }catch(err){/* user cancelled share */}
  },'image/png');
}

function clearHistory(){
  if(!confirm(T('historyConfirmClear')))return;
  DB.setJSON('history',[]);
  // keep dream journal intact (separate store); just clear the unified history list
  renderHistory();
  toast(T('cleared'));
}
