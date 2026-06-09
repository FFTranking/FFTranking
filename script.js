const CSV_FILE = 'ranking.csv';
const AUTO_REFRESH_MS = 5000;
const MONTH_ORDER = ['January','February','March','April','May','June','July','August','September','October','November','December'];
let allRows = [];
let currentHash = '';
let selectedYear = '';
let selectedMonth = '';

const $ = (id) => document.getElementById(id);
const statusEl = $('status');

function parseCSV(text){
  // Remove UTF-8 BOM if present
  text = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], cell = '', inQuotes = false;
  for(let i=0;i<text.length;i++){
    const c = text[i], n = text[i+1];
    if(c === '"' && inQuotes && n === '"'){ cell += '"'; i++; }
    else if(c === '"'){ inQuotes = !inQuotes; }
    else if(c === ',' && !inQuotes){ row.push(cell); cell = ''; }
    else if((c === '\n' || c === '\r') && !inQuotes){
      if(c === '\r' && n === '\n') i++;
      row.push(cell); cell = '';
      if(row.some(v => String(v).trim() !== '')) rows.push(row);
      row = [];
    } else { cell += c; }
  }
  if(cell.length || row.length){ row.push(cell); if(row.some(v => String(v).trim() !== '')) rows.push(row); }
  if(!rows.length) return [];
  const headers = rows[0].map(h => String(h).trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = (r[i] ?? '').trim());
    return normalizeRow(obj);
  }).filter(r => r.year && r.month && r.id && r.name);
}

function toNumber(v){
  if(v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/,/g,''));
  return Number.isFinite(n) ? n : 0;
}
function normalizeRow(o){
  return {
    year: String(o['Year'] || '').trim(),
    month: String(o['Month'] || '').trim(),
    id: String(o['Employee ID'] || '').replace(/\.0$/,'').trim(),
    name: String(o['Name'] || '').trim(),
    department: String(o['Department'] || '').trim(),
    correct: toNumber(o['Correct Answers (0-20)']),
    time: toNumber(o['Wearing Time (sec)']),
    total: toNumber(o['Total Score']),
    rank: toNumber(o['Rank'])
  };
}
async function loadCSV(force=false){
  try{
    const res = await fetch(CSV_FILE + '?v=' + Date.now(), {cache:'no-store'});
    if(!res.ok) throw new Error('Cannot load ranking.csv');
    const text = await res.text();
    const hash = text.length + ':' + text.slice(0,80);
    if(!force && hash === currentHash) return;
    currentHash = hash;
    allRows = parseCSV(text);
    buildFilters();
    render();
    statusEl.textContent = 'Updated ' + new Date().toLocaleTimeString();
  }catch(err){
    statusEl.textContent = 'CSV not found / cannot load';
    console.error(err);
  }
}
function monthIndex(value){
  const m = String(value || '').trim();
  const lower = m.toLowerCase();
  const aliases = {
    jan:0, january:0, '1':0, '01':0, 'มกราคม':0,
    feb:1, february:1, '2':1, '02':1, 'กุมภาพันธ์':1,
    mar:2, march:2, '3':2, '03':2, 'มีนาคม':2,
    apr:3, april:3, '4':3, '04':3, 'เมษายน':3,
    may:4, '5':4, '05':4, 'พฤษภาคม':4,
    jun:5, june:5, '6':5, '06':5, 'มิถุนายน':5,
    jul:6, july:6, '7':6, '07':6, 'กรกฎาคม':6,
    aug:7, august:7, '8':7, '08':7, 'สิงหาคม':7,
    sep:8, sept:8, september:8, '9':8, '09':8, 'กันยายน':8,
    oct:9, october:9, '10':9, 'ตุลาคม':9,
    nov:10, november:10, '11':10, 'พฤศจิกายน':10,
    dec:11, december:11, '12':11, 'ธันวาคม':11
  };
  return aliases[lower] ?? 99;
}

function buildFilters(){
  // Keep the original V2 UI. Only Year/Month dropdowns are rebuilt from ranking.csv.
  const years = [...new Set(allRows.map(r => String(r.year).trim()).filter(Boolean))]
    .sort((a,b) => Number(a) - Number(b) || String(a).localeCompare(String(b)));

  if(!years.includes(selectedYear)) selectedYear = years[years.length - 1] || '';

  const monthsForYear = [...new Set(
    allRows
      .filter(r => String(r.year).trim() === selectedYear)
      .map(r => String(r.month).trim())
      .filter(Boolean)
  )].sort((a,b) => monthIndex(a) - monthIndex(b) || String(a).localeCompare(String(b)));

  if(!monthsForYear.includes(selectedMonth)) {
    selectedMonth = monthsForYear[monthsForYear.length - 1] || '';
  }

  $('yearSelect').innerHTML = years.map(y => `<option value="${escapeHtml(y)}" ${y===selectedYear?'selected':''}>${escapeHtml(y)}</option>`).join('');
  $('monthSelect').innerHTML = monthsForYear.map(m => `<option value="${escapeHtml(m)}" ${m===selectedMonth?'selected':''}>${escapeHtml(m)}</option>`).join('');
}
function getFiltered(){
  return allRows.filter(r => r.year===selectedYear && r.month===selectedMonth)
    .sort((a,b) => (b.total-a.total) || (b.correct-a.correct) || ((a.time||99999)-(b.time||99999)) || a.name.localeCompare(b.name));
}
function render(){
  const rows = getFiltered();
  const ranked = rows.slice(0,10);
  const champion = ranked[0];
  $('kpiParticipants').textContent = rows.length;
  const times = rows.map(r=>r.time).filter(n=>n>0);
  $('kpiBestTime').textContent = times.length ? Math.min(...times) + ' sec' : '-';
  const corrects = rows.map(r=>r.correct).filter(n=>n>0);
  $('kpiBestCorrect').textContent = corrects.length ? Math.max(...corrects) + '/20' : '-';
  renderChampion(champion);
  $('rankList').innerHTML = ranked.map((r,i)=>rankCard(r,i)).join('');
  document.querySelectorAll('.rank-card').forEach((card,idx)=>{
    card.style.animationDelay = (idx*70)+'ms';
    card.addEventListener('click',()=>openProfile(ranked[idx], idx+1));
  });
}
function photoElement(id, cls='person-img'){
  const base = `photos/${id}`;
  return `<img class="${cls}" src="${base}.jpg" alt="" data-base="${base}" data-step="0" onerror="nextPhoto(this)">`;
}
window.nextPhoto = function(img){
  const exts = ['.jpeg','.png','.webp'];
  const step = Number(img.dataset.step || 0);
  if(step < exts.length){
    img.dataset.step = step + 1;
    img.src = img.dataset.base + exts[step];
  }else{
    img.outerHTML = `<div class="placeholder">NO PHOTO<br>${escapeHtml(img.dataset.base.split('/').pop())}</div>`;
  }
}
function renderChampion(r){
  if(!r){ $('championCard').innerHTML = '<div class="placeholder">NO DATA</div>'; return; }
  $('championCard').innerHTML = `
    <div>${photoElement(r.id)}</div>
    <div class="champ-info">
      <span class="badge">🏆 Champion of the Month</span>
      <div class="champ-name">${escapeHtml(r.name)}</div>
      <div class="meta">${escapeHtml(r.department)} · ID ${escapeHtml(r.id)} · ${escapeHtml(r.month)} ${escapeHtml(r.year)}</div>
      <div class="score-big">${formatScore(r.total)}</div>
      <div class="meta">Total Score</div>
      <div class="metrics">
        <div class="metric"><small>Correct Answers</small>${formatCorrect(r.correct)}</div>
        <div class="metric"><small>Wearing Time</small>${formatTime(r.time)}</div>
        <div class="metric"><small>Rank</small>#1</div>
      </div>
    </div>`;
}
function rankCard(r,i){
  const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
  return `<article class="rank-card ${i===0?'top1':''}">
    <div class="rank-no">${medal}</div>
    <div class="rank-img">${photoElement(r.id)}</div>
    <div class="rank-name">${escapeHtml(r.name)}</div>
    <div class="rank-dept">${escapeHtml(r.department)} · ID ${escapeHtml(r.id)}</div>
    <div class="rank-stats">
      <div class="stat"><small>Correct</small><b>${formatCorrect(r.correct)}</b></div>
      <div class="stat"><small>Time</small><b>${formatTime(r.time)}</b></div>
      <div class="stat total"><small>Total Score</small><b>${formatScore(r.total)}</b></div>
    </div>
  </article>`;
}
function openProfile(r, rankNo){
  $('profileContent').innerHTML = `<div class="profile">
    <div>${photoElement(r.id)}</div>
    <div>
      <span class="badge">Rank #${rankNo}</span>
      <h3>${escapeHtml(r.name)}</h3>
      <div class="meta">${escapeHtml(r.department)} · ${escapeHtml(r.month)} ${escapeHtml(r.year)}</div>
      <div class="profile-grid">
        <div class="profile-item"><small>Employee ID</small><b>${escapeHtml(r.id)}</b></div>
        <div class="profile-item"><small>Total Score</small><b>${formatScore(r.total)}</b></div>
        <div class="profile-item"><small>Correct Answers</small><b>${formatCorrect(r.correct)}</b></div>
        <div class="profile-item"><small>Wearing Time</small><b>${formatTime(r.time)}</b></div>
      </div>
    </div>
  </div>`;
  $('profileDialog').showModal();
}
function formatScore(n){ return Number(n||0).toFixed(2).replace(/\.00$/,''); }
function formatCorrect(n){ return n ? `${n}/20` : '-'; }
function formatTime(n){ return n ? `${n} sec` : '-'; }
function escapeHtml(s){ return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

$('yearSelect').addEventListener('change',e=>{selectedYear=e.target.value; selectedMonth=''; buildFilters(); render();});
$('monthSelect').addEventListener('change',e=>{selectedMonth=e.target.value; render();});
$('refreshBtn').addEventListener('click',()=>loadCSV(true));
$('closeDialog').addEventListener('click',()=>$('profileDialog').close());
loadCSV(true);
setInterval(()=>loadCSV(false), AUTO_REFRESH_MS);
