// Seoul v2 — manual SAVE only. No auto-push. Transit = rough estimates.
var GEO = {
 icn:[37.4473,126.4505], andaz:[37.5255,127.0289],
 hwang_new:[37.5247,127.0440], seongsu_new:[37.5442,127.0544], coex_new:[37.5125,127.0588],
 daiso:[37.5608,126.9868], lotte_new:[37.5131,127.1010], gwanghwamun:[37.5716,126.9769],
 shinsegae_new:[37.5041,127.0040],
 c_1789825336409:[37.5267971,127.0445388], c_1789825856796:[37.523953,126.9803196],
 c_1789826104676:[37.5726106,126.9756026], c_1789826554500:[37.5757452,126.9766915]
};
var GEO_C = {};
// A→B 대중교통 대략 (알려진 소요 기준 추정, 정확하지 않음)
function transitNote(a, b){
 var k = (a||'') + '>' + (b||'');
 var M = {
  'icn>andaz': '🚇 Airport limo ICN→Gangnam ≈ 70–90 min',
  'hwang_new>lotte_new': '🚇 Cheongdam→Jamsil ≈ 20–30 min (subway + walk)',
  'lotte_new>coex_new': '🚇 Jamsil→COEX ≈ 15–20 min (line 2)',
  'coex_new>shinsegae_new': '🚇 COEX→Express Bus Terminal ≈ 20–30 min',
  'seongsu_new>daiso': '🚇 Seongsu→Myeongdong ≈ 25–35 min',
  'daiso>c_1789825856796': '🚇 Myeongdong→Ichon (museum) ≈ 15–20 min (line 4)',
  'andaz>c_1789826554500': '🚇 Andaz→Gyeongbokgung ≈ 30–40 min',
  'c_1789826554500>c_1789826104676': '🚶 Gyeongbokgung→Gwanghwamun Sq walkable ≈ 10 min',
  'c_1789826104676>gwanghwamun': '🚶 within Gwanghwamun area ≈ 5–10 min walk'
 };
 return M[k] || '';
}
var DEFAULTS = { days: [], food: [], spots: [] };
var state = JSON.parse(JSON.stringify(DEFAULTS));
var map, layerGroup, mapDay = 0, dirty = false;
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function setStatus(s){ var el=document.getElementById('status'); if(el) el.textContent=s||''; }
function markDirty(){ dirty=true; var b=document.getElementById('saveBtn'); if(b){ b.disabled=false; b.textContent='💾 SAVE *'; } }
function markClean(){ dirty=false; var b=document.getElementById('saveBtn'); if(b){ b.disabled=true; b.textContent='💾 SAVE'; } }
function computeNums(){
 var am={};
 state.days.forEach(function(dd){
  var nn=0; (dd.slots||[]).forEach(function(ss){ if(ss.cat!=='hotel'&&ss.cat!=='move'){ nn++; if(ss._id) am[ss._id]=nn; } });
 });
 return am;
}
function slotHTML(s, di, si, num, prevG){
 if(!s._id) s._id='s'+Math.random().toString(36).slice(2,9);
 var tn = transitNote(prevG, s.g);
 return '<div class="slot" data-uid="'+s._id+'" data-d="'+di+'" data-s="'+si+'">'
 +'<span class="num">'+(num>0?num:'•')+'</span>'
 +'<span class="mv mvup" onclick="mvSlot(\''+s._id+'\',-1)">↑</span>'
 +'<span class="mv mvdn" onclick="mvSlot(\''+s._id+'\',1)">↓</span>'
 +'<span class="rm" style="top:62px" onclick="dayPick(event,\''+s._id+'\')">📅</span>'
 +'<span class="rm" style="top:90px" onclick="rmSlot(\''+s._id+'\')">−</span>'
 +'<input class="ttl" data-f="n" data-id="'+s._id+'" value="'+esc(s.n).replace(/"/g,'&quot;')+'" oninput="edit(this)">'
 +'<div class="ad">📍 <input data-f="addr" data-id="'+s._id+'" value="'+esc(s.addr||'').replace(/"/g,'&quot;')+'" placeholder="address" oninput="edit(this)"></div>'
 +'<textarea data-f="d" data-id="'+s._id+'" rows="2" oninput="edit(this)">'+esc(s.d||'')+'</textarea>'
 +(tn?'<div class="dn">'+tn+'</div>':'')
 +'</div>';
}
function edit(inp){
 var id=inp.dataset.id, f=inp.dataset.f;
 for(var di=0;di<state.days.length;di++) for(var si=0;si<state.days[di].slots.length;si++){
  var s=state.days[di].slots[si];
  if(s._id===id){ s[f]=inp.value; markDirty(); return; }
 }
}
function mvSlot(id, dir){
 for(var di=0;di<state.days.length;di++){
  var a=state.days[di].slots;
  var i=a.findIndex(function(x){return x._id===id;});
  if(i>=0){
   var j=i+dir;
   if(j<0||j>=a.length) return;
   var t=a[i]; a[i]=a[j]; a[j]=t;
   markDirty(); render(); return;
  }
 }
}
function dayPick(e, id){
 e.stopPropagation();
 closeDayPick();
 var m=document.createElement('div'); m.id='daypick';
 m.style.cssText='position:fixed;z-index:200;background:#fff;border:1px solid #d8e0ec;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);padding:6px;min-width:150px';
 var r=e.target.getBoundingClientRect();
 m.style.top=Math.min(window.innerHeight-40-state.days.length*40, r.bottom+6)+'px';
 m.style.right=Math.max(8, window.innerWidth-r.right)+'px';
 state.days.forEach(function(d, di){
  var b=document.createElement('button'); b.textContent=d.label;
  b.style.cssText='display:block;width:100%;text-align:left;padding:9px 12px;border:0;background:none;font-size:14px;cursor:pointer;border-radius:8px';
  b.onclick=function(){ moveToDay(id, di); closeDayPick(); };
  m.appendChild(b);
 });
 document.body.appendChild(m);
 setTimeout(function(){ document.addEventListener('click', closeDayPick, {once:true}); }, 0);
}
function closeDayPick(){ var m=document.getElementById('daypick'); if(m) m.remove(); }
function poolHTML(s){
 if(!s._id) s._id='s'+Math.random().toString(36).slice(2,9);
 return '<div class="slot" data-uid="'+s._id+'">'
 +'<span class="num">•</span>'
 +'<span class="rm" onclick="poolToDay(event,\''+s._id+'\')">📅</span>'
 +'<span class="rm" style="top:34px" onclick="rmPool(\''+s._id+'\')">−</span>'
 +'<input class="ttl" data-pf="n" data-id="'+s._id+'" value="'+esc(s.n).replace(/"/g,'&quot;')+'" oninput="editPool(this)">'
 +'<div class="ad">📍 <input data-pf="addr" data-id="'+s._id+'" value="'+esc(s.addr||'').replace(/"/g,'&quot;')+'" placeholder="address" oninput="editPool(this)"></div>'
 +'<textarea data-pf="d" data-id="'+s._id+'" rows="2" oninput="editPool(this)">'+esc(s.d||'')+'</textarea>'
 +'</div>';
}
function editPool(inp){
 var id=inp.dataset.id, f=inp.dataset.pf;
 for(var i=0;i<(state.spots||[]).length;i++){ if(state.spots[i]._id===id){ state.spots[i][f]=inp.value; markDirty(); return; } }
}
function addPool(){
 var box=document.getElementById('new-pool');
 var v=(box&&box.value||'').trim(); if(!v) return;
 state.spots=state.spots||[];
 state.spots.push({t:'',n:v,d:'',g:'andaz',cat:'spot',addr:'',_id:'s'+Math.random().toString(36).slice(2,9)});
 box.value=''; markDirty(); render();
}
function rmPool(id){
 var i=(state.spots||[]).findIndex(function(x){return x._id===id;});
 if(i>=0){ state.spots.splice(i,1); markDirty(); render(); }
}
function poolToDay(e, id){
 e.stopPropagation();
 closeDayPick();
 var m=document.createElement('div'); m.id='daypick';
 m.style.cssText='position:fixed;z-index:200;background:#fff;border:1px solid #d8e0ec;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);padding:6px;min-width:150px';
 var r=e.target.getBoundingClientRect();
 m.style.top=Math.min(window.innerHeight-40-state.days.length*40, r.bottom+6)+'px';
 m.style.right=Math.max(8, window.innerWidth-r.right)+'px';
 state.days.forEach(function(d, di){
  var b=document.createElement('button'); b.textContent=d.label;
  b.style.cssText='display:block;width:100%;text-align:left;padding:9px 12px;border:0;background:none;font-size:14px;cursor:pointer;border-radius:8px';
  b.onclick=function(){ var j=(state.spots||[]).findIndex(function(x){return x._id===id;}); if(j>=0){ var mv=state.spots.splice(j,1)[0]; state.days[di].slots.push(mv); mapDay=di; markDirty(); render(); } closeDayPick(); };
  m.appendChild(b);
 });
 document.body.appendChild(m);
 setTimeout(function(){ document.addEventListener('click', closeDayPick, {once:true}); }, 0);
}
function moveToDay(id, di){
 for(var d2=0;d2<state.days.length;d2++){
  var i=state.days[d2].slots.findIndex(function(x){return x._id===id;});
  if(i>=0){ var mv=state.days[d2].slots.splice(i,1)[0]; state.days[di].slots.push(mv); mapDay=di; markDirty(); render(); return; }
 }
}
function rmSlot(id){
 for(var di=0;di<state.days.length;di++){
  var i=state.days[di].slots.findIndex(function(x){return x._id===id;});
  if(i>=0){ state.days[di].slots.splice(i,1); markDirty(); render(); return; }
 }
}
function render(){
 var w=document.getElementById('days'); w.innerHTML='';
 var numMap=computeNums();
 state.days.forEach(function(d, di){
  var el=document.createElement('div'); el.className='day'+(collapsed[d.id]?' closed':'');
  var h='<div class="day-h" onclick="toggleDay(\''+d.id+'\')">'+esc(d.label)+' · '+d.slots.length+' stops<span class="tg">'+(collapsed[d.id]?'▸':'▾')+'</span></div><div class="slots">';
  var prevG=null;
  d.slots.forEach(function(s, si){
   var n=(s.cat==='hotel'||s.cat==='move')?0:(numMap[s._id]||0);
   h+=slotHTML(s, di, si, n, prevG);
   prevG=s.g;
  });
  h+='</div>';
  el.innerHTML=h; w.appendChild(el);
 });
 // Others — backup pool (요일 밖 보관, 삭제 없이)
 var pool=(state.spots||[]).filter(function(s){ for(var di=0;di<state.days.length;di++){ var arr=state.days[di].slots; for(var si=0;si<arr.length;si++){ if(arr[si]._id&&arr[si]._id===s._id) return false; } } return true; });
 var pe=document.createElement('div'); pe.className='day'+(collapsed['others']?' closed':'');
 var ph='<div class="day-h" onclick="toggleDay(\'others\')">Others · backup pool<span class="tg">'+(collapsed['others']?'▸':'▾')+'</span></div><div class="slots">';
 pool.forEach(function(s){ ph+=poolHTML(s); });
 ph+='</div><div class="addrow"><input id="new-pool" placeholder="Add backup option…"><button onclick="addPool()">+</button></div>';
 pe.innerHTML=ph; w.appendChild(pe);
 drawMap();
}
function toggleDay(id){ collapsed[id]=!collapsed[id]; markDirty(); render(); }
var collapsed={};
function drawMap(){
 if(!map){
  map=L.map('map',{center:[37.53,127.02],zoom:11,scrollWheelZoom:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',subdomains:'abc',maxZoom:19}).addTo(map);
  map.on('click',function(){map.scrollWheelZoom.enable();});
 }
 if(layerGroup) layerGroup.clearLayers(); else layerGroup=L.layerGroup().addTo(map);
 var bb=document.getElementById('mapDayBtns');
 if(bb){
  bb.innerHTML='';
  state.days.forEach(function(d,di){
   var b=document.createElement('button'); b.textContent=['Mon 21','Tue 22','Wed 23','Thu 24','Fri 25'][di]||d.label;
   if(di===mapDay) b.className='on';
   b.onclick=function(){mapDay=di;render();};
   bb.appendChild(b);
  });
 }
 if(mapDay>=state.days.length) mapDay=0;
 var d=state.days[mapDay]; if(!d) return;
 document.getElementById('mapDayLbl').textContent=d.label;
 var numMap=computeNums(), pts=[];
 // 🏠 항상 맨 앞: 호텔에서 순서대로 출발
 var viewSlots=d.slots.filter(function(x){return x.cat!=='hotel';});
 viewSlots.unshift({_id:'_hotel',n:'Andaz Seoul Gangnam (안다즈 서울 강남) — base',cat:'hotel',g:'andaz',_anchor:1});
 viewSlots.forEach(function(s){
  var g=(s.g&&GEO[s.g])||GEO.andaz;
  var n2=numMap[s._id];
  var label=(s.cat==='hotel')?'🏠':String(n2>0?n2:'•');
  var icon=L.divIcon({className:'',html:'<div class="mk">'+label+'</div>',iconSize:[26,26],iconAnchor:[13,13]});
  L.marker(g,{icon:icon}).addTo(layerGroup).bindPopup('<b>'+esc(s.n)+'</b><br>'+esc(d.label));
  pts.push(g);
 });
 if(pts.length>1) L.polyline(pts,{color:'#b8860b',weight:2.5,dashArray:'6 4',opacity:.8}).addTo(layerGroup);
 if(pts.length) map.fitBounds(L.latLngBounds(pts),{padding:[40,40]});
}
function save(){
 if(!fbRef){ setStatus('offline — not saved'); return; }
 try{
  state.geoC=GEO_C; state.updatedAt=Date.now();
  fbRef.set(state);
  try{ localStorage.setItem('seoul25v2x', JSON.stringify(state)); }catch{ }
  markClean(); setStatus('Saved ✓ '+new Date().toLocaleTimeString());
 }catch{ setStatus('Save failed'); }
}
function load(){
 if(!fbRef) return;
 fbRef.once('value').then(function(snap){
  var v=snap.val();
  if(v&&v.days&&v.days.length){
   state=v;
   if(state.geoC){ GEO_C=state.geoC; for(var k in state.geoC) GEO[k]=state.geoC[k]; }
  }
  markClean(); render(); fbStatus();
 }).catch(function(){ render(); });
}
document.getElementById('saveBtn').onclick=save;
void [edit, editPool, mvSlot, dayPick, closeDayPick, moveToDay, rmSlot, rmPool, poolToDay, addPool, toggleDay];
load();
