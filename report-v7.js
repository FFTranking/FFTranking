// FFT Report V7.7 - Force Two Pages, Report-only
(function(){
  const ROOT='reportV7Root', BUTTON='generateReportBtn';
  const EXT=['.jpg','.jpeg','.png','.webp'];
  const id=x=>document.getElementById(x);
  const esc=v=>typeof escapeHtml==='function'?escapeHtml(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const score=v=>typeof formatScore==='function'?formatScore(v):Number(v||0).toFixed(2).replace(/\.00$/,'');
  const correct=v=>v?`${v}/20`:'-';
  const time=v=>v?String(Math.round(Number(v))):'-';

  function ensureUI(){
    if(!id(BUTTON)){
      const b=document.createElement('button'); b.id=BUTTON; b.textContent='📄 Generate Report'; b.title='Generate monthly luxury report';
      const r=id('refreshBtn'); if(r&&r.parentNode) r.insertAdjacentElement('afterend',b);
    }
    if(!id(ROOT)){
      const s=document.createElement('section'); s.id=ROOT; s.className='report-v7-root'; s.setAttribute('aria-hidden','true'); document.body.appendChild(s);
    }
    let st=id('r7-style'); if(st) st.remove();
    st=document.createElement('style'); st.id='r7-style'; st.textContent=CSS; document.head.appendChild(st);
  }
  function photo(emp,cls=''){const b=`photos/${emp}`;return `<div class="r7-photo ${cls}"><img src="${b}.jpg" data-base="${b}" data-step="0" onerror="r7NextPhoto(this)"></div>`}
  function thumb(emp){const b=`photos/${emp}`;return `<img class="r7-thumb" src="${b}.jpg" data-base="${b}" data-step="0" onerror="r7NextPhoto(this)">`}
  window.r7NextPhoto=function(img){let s=Number(img.dataset.step||0); if(s<EXT.length-1){s++; img.dataset.step=s; img.src=img.dataset.base+EXT[s];}else{if(img.classList.contains('r7-thumb')) img.style.visibility='hidden'; else img.outerHTML='<div class="r7-no-photo">NO PHOTO</div>';}};
  function icon(d){d=String(d||'').toLowerCase().trim(); if(d==='fbk'||d.includes('kitchen'))return'👨‍🍳'; if(d.includes('security'))return'🛡️'; if(d.includes('front'))return'🛎️'; if(d.includes('engineering'))return'⚙️'; if(d.includes('house'))return'🛏️'; if(d.includes('f&b')||d.includes('fb')||d.includes('food'))return'🍽️'; return'👥';}
  function depts(rows,parts){const ids=new Set(parts.map(r=>r.id)), map={}; rows.forEach(r=>{const d=r.department||'Unspecified'; if(!map[d])map[d]=new Map(); map[d].set(r.id,r)}); return Object.keys(map).map(d=>{const total=map[d].size, trained=[...map[d].values()].filter(r=>ids.has(r.id)).length; return{dept:d,total,trained,pct:total?Math.round(trained/total*100):0}}).sort((a,b)=>b.trained-a.trained||a.dept.localeCompare(b.dept));}
  function topCard(r,n){if(!r)return'<article class="r7-top-card"></article>'; return `<article class="r7-top-card rank-${n}"><div class="r7-num">${n}</div><div class="r7-person"><h2>${esc(r.name)}</h2><p>${esc(r.department)}</p></div><div class="r7-person-photo">${photo(r.id,'top')}</div><div class="r7-score"><span>Exam <b>${correct(r.correct)}</b></span><span>Time <b>${time(r.time)} sec</b></span><strong>${score(r.total)} / 100</strong></div></article>`}
  function row(r,i){return `<tr><td class="rank">${i}</td><td class="pic">${thumb(r.id)}</td><td class="name">${esc(r.name)}</td><td class="dept">${esc(r.department)}</td><td>${correct(r.correct)}</td><td>${time(r.time)}</td><td>${score(r.total)}</td></tr>`}
  function table(title,rows,start){return `<div class="r7-tablebox"><div class="r7-tabletitle">${title}</div><table class="r7-table"><thead><tr><th>Rank</th><th>Photo</th><th>Name</th><th>Department</th><th>Exam</th><th>Time</th><th>Total</th></tr></thead><tbody>${rows.map((r,i)=>row(r,start+i)).join('')||'<tr><td colspan="7">No additional participants.</td></tr>'}</tbody></table></div>`}
  function twoCols(rows,start,per,title){const l=rows.slice(0,per), r=rows.slice(per,per*2);return `<section class="r7-cols">${table(title,l,start)}${table(title,r,start+per)}</section>`}
  function deptCards(ds,parts,all){let h=ds.map(d=>`<div class="r7-dept"><div class="r7-ic">${icon(d.dept)}</div><div><h3>${esc(d.dept)}</h3><p><b>${d.trained}</b> / ${d.total}<span>${d.pct}%</span></p><div class="r7-bar"><i style="width:${d.pct}%"></i></div></div></div>`).join(''); const pct=all.length?Math.round(parts.length/all.length*100):0; return h+`<div class="r7-dept total"><div class="r7-ic">👥</div><div><h3>TOTAL</h3><p><b>${parts.length}</b> / ${all.length}<span>${pct}%</span></p><div class="r7-bar"><i style="width:${pct}%"></i></div></div></div>`}
  function build(){
    ensureUI(); const root=id(ROOT);
    if(typeof getFiltered!=='function'||typeof getParticipants!=='function'){alert('Dashboard data not ready. Please reload the page.');return false}
    const all=getFiltered(), parts=getParticipants(); if(!all.length){alert('No data for selected month.');return false}
    const month=typeof selectedMonth!=='undefined'?selectedMonth:'', year=typeof selectedYear!=='undefined'?selectedYear:'', top=all.slice(0,3), rem=all.slice(3);
    const page1=rem.slice(0,28), page2=rem.slice(28), half=Math.ceil(page2.length/2), ds=depts(all,parts), gen=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
    root.innerHTML=`<div class="r7-page"><div class="r7-wm">FFT</div><header class="r7-head"><div><div class="r7-logo">CARLTON <span>✳</span></div><div class="r7-sub">HOTEL | BANGKOK SUKHUMVIT</div></div><div class="r7-title"><h1>Firefighting Training of ${esc(month)} ${esc(year)}</h1><div>★ ★ ★ ★ ★</div><p>TRAIN HARD · BE PREPARED · STAY SAFE · SAVE LIVES</p></div><div class="r7-badge">FFT</div></header><section class="r7-top">${topCard(top[0],1)}${topCard(top[1],2)}${topCard(top[2],3)}<aside class="r7-total"><h3>Total Participants</h3><b>${parts.length}</b><p>People from all departments</p></aside></section>${twoCols(page1,4,14,'All Participants Ranking')}<footer class="r7-foot"><span>Generated on ${esc(gen)}</span><strong>“Teamwork, Training, Preparation – The Key to Safety and Success”</strong><span>Stay Safe · Save Lives</span></footer></div>
    <div class="r7-page"><div class="r7-wm">FFT</div><header class="r7-head r7-h2"><div class="r7-logo small">CARLTON <span>✳</span></div><div class="r7-title"><h1>All Participants Ranking · Continued</h1><p>${esc(month)} ${esc(year)} · Total ${parts.length} Participants</p></div><div class="r7-badge small">FFT</div></header><div class="r7-table-area last">${twoCols(page2,32,half,'Continued')}</div><section class="r7-depts"><h2>Department Participation · Total ${parts.length} Participants</h2><div class="r7-deptgrid">${deptCards(ds,parts,all)}</div></section><footer class="r7-foot"><span>Generated on ${esc(gen)}</span><strong>FFT Ranking Dashboard</strong><span>Safety & Security Department</span></footer></div>`;
    return true;
  }
  function printReport(){if(!build())return; document.body.classList.add('r7-print-mode'); setTimeout(()=>window.print(),350)}
  window.addEventListener('afterprint',()=>document.body.classList.remove('r7-print-mode'));
  function init(){ensureUI(); const b=id(BUTTON); if(b&&!b.dataset.r7Bound){b.dataset.r7Bound='1'; b.addEventListener('click',printReport)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.FFTReportV7=printReport;
})();
const CSS=`
.report-v7-root{display:none}.r7-total em,.r7-qr{display:none!important}
@media print{
@page{size:A4 landscape;margin:4mm}
body.r7-print-mode{background:#fff!important;color:#061b33!important}
body.r7-print-mode .app,body.r7-print-mode .bg-orb,body.r7-print-mode .tabbar,body.r7-print-mode dialog{display:none!important}
body.r7-print-mode .report-v7-root{display:block!important}
.r7-page{width:289mm;height:202mm;position:relative;overflow:hidden;page-break-after:always;background:radial-gradient(circle at 90% 16%,rgba(223,180,92,.22),transparent 15%),linear-gradient(135deg,#fffaf0,#f8edd9 45%,#fff8ea);border:3px solid #061b33;box-shadow:inset 0 0 0 1.4mm #c89135,inset 0 0 0 2.2mm rgba(255,255,255,.85);padding:6mm 8mm 5mm;font-family:"Segoe UI",Arial,sans-serif;color:#061b33}
.r7-page:before{content:"";position:absolute;inset:3mm;border:1px solid rgba(180,122,33,.5)}.r7-wm{position:absolute;right:26mm;top:28mm;font:900 50mm Georgia,serif;color:rgba(180,122,33,.045);transform:rotate(-12deg)}
.r7-head,.r7-top,.r7-ranktitle,.r7-cols,.r7-depts,.r7-foot,.r7-table-area{position:relative;z-index:2}.r7-head{height:27mm;display:grid;grid-template-columns:58mm 1fr 22mm;gap:5mm;align-items:start}.r7-logo{font:400 10mm/1 Georgia,serif;color:#8f5d18;letter-spacing:.05em}.r7-logo span{font-size:7mm}.r7-logo.small{font-size:7mm}.r7-sub{margin-top:1.5mm;font-size:2.7mm;color:#7b4c10;font-weight:800;letter-spacing:.08em}.r7-title{text-align:center}.r7-title h1{margin:0;font:900 8mm/1.03 Georgia,serif;text-transform:uppercase;color:#061b33}.r7-title div{color:#b47a21;font-size:4mm;letter-spacing:2.3mm;margin-top:1.5mm;border-top:1px solid rgba(180,122,33,.48);padding-top:1.3mm}.r7-title p{margin:1.2mm 0 0;color:#9b6316;font-size:2.8mm;font-weight:950;letter-spacing:.07em}.r7-badge{width:18mm;height:18mm;border-radius:50%;background:radial-gradient(circle,#183755,#061b33);border:1.4mm solid #c89135;color:#e8c16b;display:grid;place-items:center;font:900 7mm Georgia,serif}.r7-badge.small{width:15mm;height:15mm;font-size:5mm}
.r7-top{height:65mm;display:grid;grid-template-columns:1fr 1fr 1fr 43mm;gap:4mm}.r7-top-card,.r7-total{position:relative;overflow:hidden;border:1.8px solid #c89135;border-radius:3mm;background:rgba(255,255,255,.78);box-shadow:inset 0 0 0 .55mm rgba(255,255,255,.75),0 2mm 7mm rgba(90,54,15,.12)}.r7-top-card:after{content:"";position:absolute;inset:0;border-radius:3mm;border:1.1px solid rgba(120,75,16,.32);pointer-events:none;z-index:6}.r7-top-card{display:grid;grid-template-columns:42% 58%;grid-template-areas:"info photo";padding:4mm}.r7-num{position:absolute;left:6mm;top:5mm;font:900 17mm Georgia,serif;color:#b47a21;z-index:3}.rank-2 .r7-num{color:#8b96a3}.rank-3 .r7-num{color:#a65d17}.r7-person{grid-area:info;margin-top:21mm;z-index:3}.r7-person h2{margin:0;font-size:5.1mm;line-height:1.05;text-transform:uppercase}.r7-person p{margin:1mm 0;color:#8c4f0a;font-size:2.7mm;font-weight:950;text-transform:uppercase}.r7-person-photo{grid-area:photo;height:100%}.r7-photo{width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center}.r7-photo img{width:100%;height:100%;object-fit:contain;object-position:center bottom}.r7-no-photo{display:grid;place-items:center;height:100%;color:#777;font-weight:900}
.r7-score{position:absolute;left:4mm;right:4mm;bottom:4mm;height:16mm;display:grid;grid-template-columns:1fr 1fr 1.15fr;border:1px solid #d6ad6b;border-radius:2mm;overflow:hidden;background:rgba(255,255,255,.92);z-index:4}.r7-score span{display:flex;flex-direction:column;gap:1mm;padding:2mm;font-size:2.35mm;font-weight:850;border-right:1px solid rgba(180,122,33,.3)}.r7-score b{font-size:3mm}.r7-score strong{display:grid;place-items:center;background:#061b33;color:#f4d58d;font-size:4.3mm;text-align:center}.r7-total{background:linear-gradient(135deg,#061b33,#061627);color:#fff;border:1.5mm solid #c89135;text-align:center;padding:11mm 4mm}.r7-total h3{margin:0 0 5mm;color:#f4d58d;text-transform:uppercase;font-size:3.7mm}.r7-total b{display:block;font-size:17mm;line-height:1;color:#f4d58d}.r7-total p{font-size:3mm;text-transform:uppercase;font-weight:950;margin-top:5mm}
.r7-ranktitle{margin-top:3mm;background:#061b33;color:white;border-radius:2mm 2mm 0 0;padding:1.5mm 3mm;font-size:3mm;font-weight:950;text-transform:uppercase}.r7-cols{display:grid;grid-template-columns:1fr 1fr;gap:3mm}.r7-tabletitle{background:#061b33;color:#f3d283;padding:1mm 2mm;font-size:2.4mm;font-weight:950;text-transform:uppercase}.r7-table{width:100%;border-collapse:collapse;table-layout:fixed;background:rgba(255,255,255,.78);font-size:2.05mm}.r7-table th{background:#061b33;color:#f3d283;border:1px solid rgba(255,255,255,.15);padding:.65mm .5mm;font-size:1.85mm;text-transform:uppercase}.r7-table td{border:1px solid rgba(190,141,64,.45);padding:.48mm .65mm;line-height:1.08;font-weight:800;color:#061b33;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.r7-table td:nth-child(1){width:7mm;text-align:center}.r7-table td:nth-child(2){width:7mm;text-align:center}.r7-table img{width:3.9mm;height:3.9mm;border-radius:50%;object-fit:cover}.r7-table .name{font-weight:950}
.r7-foot{position:absolute;left:8mm;right:8mm;bottom:2mm;display:flex;justify-content:space-between;align-items:center;color:#5b4728;font-size:2.15mm;font-weight:800}.r7-foot strong{font-family:Georgia,serif;color:#a26a1c;font-size:3mm;font-style:italic;font-weight:500}.r7-h2{height:18mm;border-bottom:1px solid rgba(180,122,33,.6);margin-bottom:3mm}.r7-table-area.last{height:108mm;overflow:hidden}.r7-table-area.last .r7-table{font-size:1.82mm}.r7-table-area.last .r7-table th{font-size:1.65mm;padding:.42mm .35mm}.r7-table-area.last .r7-table td{font-size:1.82mm;padding:.34mm .45mm;line-height:1.02}.r7-table-area.last .r7-table img{width:3.3mm;height:3.3mm}
.r7-depts{position:absolute;left:8mm;right:8mm;bottom:8mm;border:1.3px solid #c89135;border-radius:3mm;background:rgba(255,255,255,.68);padding:1.7mm}.r7-depts h2{text-align:center;margin:0 0 1.3mm;font-size:3.1mm;text-transform:uppercase;color:#061b33}.r7-deptgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2mm}.r7-dept{display:grid;grid-template-columns:7.4mm 1fr;gap:1.5mm;align-items:center;background:rgba(255,255,255,.86);border:1px solid rgba(196,142,50,.55);border-radius:1.8mm;padding:1mm}.r7-ic{font-size:4.8mm;text-align:center;filter:drop-shadow(0 1px 0 rgba(0,0,0,.15))}.r7-dept h3{margin:0;font-size:2.1mm;line-height:1;font-weight:950;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.r7-dept p{margin:.25mm 0 0;font-size:2.35mm;font-weight:900}.r7-dept p span{float:right;color:#0b2b4f;font-size:2.45mm}.r7-bar{clear:both;height:1.4mm;background:#e7e1d5;border-radius:999px;overflow:hidden;margin-top:.45mm}.r7-bar i{display:block;height:100%;background:linear-gradient(90deg,#0b4a86,#d89633)}
}
@media screen{body.r7-print-mode .report-v7-root{display:block;background:#222;padding:20px}}






.r7-ranktitle{display:none!important}


/* V7.10 Top Cards / Ranking Gap Fix */
.r7-top{
  margin-bottom:7.5mm!important;
}
.r7-ranktitle{
  display:none!important;
  height:0!important;
  margin:0!important;
  padding:0!important;
}
.r7-cols{
  margin-top:6.5mm!important;
}
.r7-tablebox{
  margin-top:0!important;
}
.r7-tabletitle{
  padding:.8mm 2mm!important;
}
.r7-table{
  font-size:1.92mm!important;
}
.r7-table th{
  font-size:1.72mm!important;
  padding:.48mm .4mm!important;
}
.r7-table td{
  font-size:1.92mm!important;
  padding:.40mm .55mm!important;
  line-height:1.03!important;
}
.r7-table img{
  width:3.55mm!important;
  height:3.55mm!important;
}


/* V7.10 Colored Column Header */
.r7-tablebox{
  border:1.45px solid #c89135!important;
  border-radius:2.3mm!important;
  overflow:hidden!important;
  background:rgba(255,255,255,.82)!important;
}
.r7-tabletitle{
  background:#fff7e6!important;
  color:#8f5d18!important;
  border-bottom:1.35px solid #c89135!important;
  text-align:center!important;
  letter-spacing:.04em!important;
}
.r7-table th{
  background:#061b33!important;
  color:#f3d283!important;
  border-top:1.2px solid #c89135!important;
  border-bottom:1.2px solid #c89135!important;
  border-left:1px solid rgba(200,145,53,.85)!important;
  border-right:1px solid rgba(200,145,53,.85)!important;
}
.r7-table th:first-child{border-left:0!important}
.r7-table th:last-child{border-right:0!important}
.r7-table td{border-color:rgba(200,145,53,.58)!important}

`;