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
  const items=DB.getJSON('history',[]);
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
  if(d.body) inner+=`<div class="hist-detail-label">${T('historyBodyLabel')}</div><div class="bd" style="white-space:pre-wrap;font-size:14px;line-height:1.7;margin-bottom:12px">${esc(d.body)}</div>`;
  if(d.ai) inner+=`<div class="ai-box"><div class="hd">✨ ${T('historyAiLabel')}</div><div class="bd" style="white-space:pre-wrap">${esc(d.ai)}</div></div>`;
  inner+=`<button class="btn ghost" onclick="this.closest('.modal').remove()" style="margin-top:16px">✓</button></div>`;
  m.innerHTML=inner;
  document.body.appendChild(m);
}

function clearHistory(){
  if(!confirm(T('historyConfirmClear')))return;
  DB.setJSON('history',[]);
  // keep dream journal intact (separate store); just clear the unified history list
  renderHistory();
  toast(T('cleared'));
}
