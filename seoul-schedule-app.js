
// ── Place data: [key, lat, lng] ──
var GEO = {
 icn:[37.4473,126.4505], andaz:[37.5255,127.0289], cheongdam:[37.5258,127.0523],
 hwang:[37.5191,127.0517], shinsegae:[37.5126,127.1067], hyundai:[37.5274,127.0275],
 seongsu:[37.5446,127.0561], coex:[37.5119,127.0591], lotte:[37.5126,127.1027],
 museum:[37.524,126.9803], ntower:[37.535,126.9871], myeongdong:[37.5609,126.9864],
 gwanghwamun:[37.5716,126.9769], hannam:[37.5382,127.0074], jinju:[37.5638,126.9752],
 hwang_new:[37.5247,127.0440], seongsu_new:[37.5442,127.0544], coex_new:[37.5125,127.0588], daiso:[37.5628,127.0005], lotte_new:[37.5137,127.1042]
};
// Shinsegae Gangnam approx (Express Bus Terminal)
GEO.shinsegae = [37.5045,127.0049];
var GEO_C = {};

var DEFAULTS = {
 days: [
  {id:"d21",label:"Sun Sep 21",slots:[
   {t:"",n:"Arrive ICN T1 (인천공항 1터미널)",d:"Philippine Airlines lands 19:15 at T1. ~40 min immigration+bags.",g:"icn",cat:"move",lock:1},
   {t:"",n:"Airport Bus 6703 → Andaz (안다즈 서울 강남)",d:"Airport bus 6703 to Gangnam ≈ 70–90 min. Get off at Eulji Hospital / Four Points Gangnam & Hotel Sunshine stop.",g:"icn",cat:"move"},
   {t:"",n:"Check in — Andaz Seoul Gangnam, by Hyatt (안다즈 서울 강남)",d:"Base for all 5 nights. Apgujeong Rodeo area, late-night convenience nearby.",g:"andaz",cat:"hotel",lock:1}]},
  {id:"d22",label:"Mon Sep 22",slots:[
   {t:"",n:"Ocellas at Andaz B2 (오셀라스 안다즈 서울 강남점)",d:"In-hotel facial + sauna. No transit — go downstairs. Afternoon wind-down.",g:"andaz",cat:"spot"},
   {t:"",n:"Prima Spa (프리마스파)",d:"One of the most high-end quality spas open to the general public. Evening slot near Cheongdam.",g:"cheongdam",cat:"spot"},
   {t:"",n:"Shinsegae Gangnam (신세계백화점 강남점)",d:"House of Shinsegae — premium night-dining social space, wine cellar, Suite Park desserts. Open till 10pm.",g:"shinsegae",cat:"spot"}]},
  {id:"d23",label:"Tue Sep 23",slots:[
   {t:"",n:"Hwanggeumhee Aesthetics Cheongdam (황금희에스테틱 청담본점)",d:"30-year esthetic house popular with celebrities. Afternoon course ≈ 90 min–2 hrs.",g:"hwang_new",cat:"spot",addr:"강남구 압구정로80길 34 6층"},
   {t:"",n:"Seongsu-dong (성수동)",d:"aka Brooklyn of Seoul / Gangnam of young Koreans. New+retro vibe, popup stores. ~20 min from Cheongdam.",g:"seongsu_new",cat:"spot"},
   {t:"",n:"Olive Young N Seongsu (올리브영N 성수)",d:"Biggest Olive Young in Korea. Flagship exclusives + photo zones.",g:"seongsu_new",cat:"spot",addr:"성동구 연무장7길 13 팩토리얼 성수"},
   {t:"",n:"Starfield COEX Mall (별마당도서관 코엑스몰)",d:"Massive book wall (Starfield Library). ~10 min from Seongsu.",g:"coex_new",cat:"spot",addr:"강남구 영동대로 513 스타필드 코엑스몰 B1"},
   {t:"",n:"Lotte World Tower (롯데월드타워)",d:"Seoul Sky Observatory floors 117–123 (night view). Base: Avenuel, aquarium, cinema, concert hall. ~15 min from COEX.",g:"lotte_new",cat:"spot",addr:"올림픽로 300"}]},,
  {id:"d24",label:"Wed Sep 24",slots:[
   {t:"",n:"Gwanghwamun Square Bitmorak Autumn Festival (광화문광장 빛모락 가을축제)",d:"10am-2pm, lunch at food stands. ~30 min from Andaz.",g:"gwanghwamun",cat:"spot"},
   {t:"",n:"Gyeongbokgung Palace (경복궁)",d:"3-6pm palace visit. Next to Gwanghwamun Square, walkable.",g:"gyeongbok",cat:"spot"}]},
  {id:"d25",label:"Thu Sep 25",slots:[
   {t:"",n:"Depart ICN T1 (인천공항 1터미널) 20:30",d:"Philippine Airlines 20:30 from T1. Arrive 2.5 hrs prior = 18:00 at airport.",g:"icn",cat:"move",lock:1}]}
 ],
 food: [
  {t:"",n:"Traditional Korean Dining (한정식)",d:"Full-course Korean set meal.",g:"andaz",cat:"food"},
  {t:"",n:"Korean Beef, fresh cut never frozen chilled (한우고기)",d:"Premium hanwoo BBQ.",g:"andaz",cat:"food"},
  {t:"",n:"Market (시장)",d:"Street food + local stalls.",g:"gwanghwamun",cat:"food"},
  {t:"",n:"Korea House (한국의집)",d:"Traditional performance + dining. Chungmuro.",g:"chungmuro",cat:"food"},
  {t:"",n:"Jinju Hoegwan (진주회관)",d:"Jung-gu kongguksu + kimchi. Near Seoul Plaza.",g:"jinju",cat:"food"}
 ],
 spots: [
  {t:"",n:"Olive Young Myeongdong Station (올리브영 명동역점)",d:"Flagship beauty store near Myeongdong Station.",g:"myeongdong",cat:"spot"},
  {t:"",n:"Daiso Myeongdong Station (다이소 명동역점)",d:"Large variety store.",g:"daiso",cat:"spot",addr:"서울 중구 퇴계로 134-1"}
 ]
};

var state = load() || JSON.parse(JSON.stringify(DEFAULTS));
function load(){ try{ var h=location.hash.match(/s=([^&]+)/); var s=null; if(h){ s=JSON.parse(decodeURIComponent(escape(atob(h[1])))); } else { var l=localStorage.getItem('seoul25v2'); if(l) s=JSON.parse(l); } if(s){ if(s.geoC){ GEO_C=s.geoC; for(var k in s.geoC) GEO[k]=s.geoC[k]; }
  // 고정 슬롯 강제 lock (DB 구버전·드래그 덮어쓰기 방지)
  var FIXED=["Arrive ICN T1","Check in \u2014 Andaz","Depart ICN T1"];
  (s.days||[]).forEach(function(d){ (d.slots||[]).forEach(function(x){ for(var i=0;i<FIXED.length;i++) if((x.n||'').indexOf(FIXED[i])===0) x.lock=1; }); });
  return s; } }catch(e){} return null; }
function persist(){ try{ state.geoC=GEO_C; localStorage.setItem('seoul25v2', JSON.stringify(state)); pushHistory(); }catch(e){} }
// 히스토리: 최근 20개 자동 저장 (리셋·실수 대비)
function pushHistory(){
 try{
  var h=JSON.parse(localStorage.getItem('seoul25v2_hist')||'[]');
  var snap=JSON.stringify(state);
  if(h.length&&h[0].snap===snap) return; // 동일하면 스킵
  h.unshift({at:new Date().toISOString().slice(0,16).replace('T',' '),snap:snap});
  localStorage.setItem('seoul25v2_hist', JSON.stringify(h.slice(0,20)));
 }catch(e){}
}
function showHistory(){
 var h=[]; try{ h=JSON.parse(localStorage.getItem('seoul25v2_hist')||'[]'); }catch(e){}
 if(!h.length){ alert('No history yet.'); return; }
 var list=h.map(function(x,i){ return (i+1)+'. '+x.at+' ('+countSlots(JSON.parse(x.snap))+' stops)'; }).join('\n');
 var pick=prompt('Restore which version? (number)\n'+list);
 var i=parseInt(pick,10)-1;
 if(h[i]){ if(!confirm('Replace current with #'+pick+'?'))return; state=JSON.parse(h[i].snap); location.hash=''; render(); }
}
function countSlots(s){ var n=0; (s.days||[]).forEach(function(d){n+=d.slots.length;}); return n; }

// ── Render ──
function slotHTML(s, di, si, mapNum){
 if(!s._id)s._id='s'+Math.random().toString(36).slice(2,9);
 var badge = String(mapNum);
 return '<div class="slot '+s.cat+(s.lock?' locked':'')+'" data-uid="'+s._id+'" data-d="'+di+'" data-s="'+si+'" onclick="tapSlot(event,\''+s._id+'\')">'
 +'<span class="num" style="cursor:default">'+badge+'</span>'
 +(s.addr?'<div class="ad" onclick="editAddr(event,\''+s._id+'\')" title="tap to edit address" style="cursor:pointer">📍 '+esc(s.addr)+'</div>':'<div class="ad" onclick="editAddr(event,\''+s._id+'\')" title="tap to add address" style="cursor:pointer;opacity:.5">📍 (tap to add address)</div>')
 +(s.t?'<div class="t">'+esc(s.t)+'</div>':'')
 +'<div class="n" onclick="editText(event,\''+s._id+'\')" title="tap to edit" style="cursor:text">'+esc(s.n)+'</div>'
 +'<div class="d" onclick="editText(event,\''+s._id+'\')" title="tap to edit" style="cursor:text">'+esc(s.d||'(tap to add description)')+'</div>'
 +'<span class="lk" data-lk="'+s._id+'" title="tap: lock/unlock, hold 1s: remove" style="cursor:pointer">'+(s.lock?'🔒':'🔓')+'</span></div>';
}
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function setStatus(s){ var el=document.getElementById('fbStatus'); if(el) el.textContent=s; setTimeout(fbStatus, 3000); }
var collapsed = {};
function render(){
 var w = document.getElementById('days'); w.innerHTML='';
 state.days.forEach(function(d, di){
  var el = document.createElement('div'); el.className='day'; el.id='day-'+d.id;
  var hid = !!collapsed[d.id];
  el.innerHTML = '<div class="day-h" onclick="toggleDay(\''+d.id+'\')" style="cursor:pointer">'+esc(d.label)+'<span class="cnt">'+d.slots.length+' stops <span id="tog-'+d.id+'">'+(hid?'▸':'▾')+'</span></span></div><div class="slots" id="slots-'+d.id+'"'+(hid?' style="display:none"':'')+'></div>';
  var box = el.querySelector('.slots');
  d.slots.forEach(function(s, si){ box.insertAdjacentHTML('beforeend', slotHTML(s, di, si, 0)); });
  w.appendChild(el);
 });
 renderPool('pool-food', state.food, 'food');
 renderPool('pool-spots', state.spots, 'spot');
 initSortable(); drawMap(); setupScrollSpy(); bindLocks(); persist(); fbStart(); fbStatus();
 // 변경 시 Firebase 푸시 (디바운스 1초)
 clearTimeout(fbTimer); fbTimer=setTimeout(fbPush, 1000);
}
function renderPool(id, arr, kind){
 var box = document.getElementById(id); if(!box) return; box.innerHTML='';
 (arr||[]).forEach(function(s, i){ if(!s._id)s._id='s'+Math.random().toString(36).slice(2,9); box.insertAdjacentHTML('beforeend','<div class="slot '+s.cat+'" data-uid="'+s._id+'" data-p="'+kind+'" data-i="'+i+'"><span class="num" onclick="editAddr(event,\''+s._id+'\')" title="tap to set address" style="cursor:pointer">📍</span><div class="n" onclick="editText(event,\''+s._id+'\')" title="tap to edit" style="cursor:text">'+esc(s.n)+'</div><div class="d" onclick="editText(event,\''+s._id+'\')" title="tap to edit" style="cursor:text">'+esc(s.d)+'</div><span class="lk" data-lk="'+s._id+'" title="tap: lock/unlock, hold 1s: remove" style="cursor:pointer">'+(s.lock?'🔒':'🔓')+'</span></div>'); });
}
function toggleLock(e, id){ if(e&&e.stopPropagation)e.stopPropagation(); var s=findSlotById(id); if(!s) return; if(s.lock) delete s.lock; else s.lock=1; persist(); render(); }
function rmSlotById(id){ for(var di=0;di<state.days.length;di++){ var i=state.days[di].slots.findIndex(function(x){return x._id===id;}); if(i>=0){ var s=state.days[di].slots[i]; if(s.lock){alert('Locked \u2014 unlock first.');return;} if(!confirm('Remove to Spots Pool?'))return; state.days[di].slots.splice(i,1); state.spots.push(s); render(); return; } } for(var k of ['food','spots']){ var j=state[k].findIndex(function(x){return x._id===id;}); if(j>=0){ var t=state[k][j]; if(t.lock){alert('Locked \u2014 unlock first.');return;} if(!confirm('Delete permanently?'))return; state[k].splice(j,1); render(); return; } } }
function rmSlot(e, di, si){ e.stopPropagation(); var s=state.days[di].slots[si]; if(s.lock){ alert('Locked — unlock first.'); return; } modalConfirm('Remove to Spots Pool?', function(ok){ if(!ok)return; state.days[di].slots.splice(si,1); state.spots.push(s); render(); }); }
function toggleDay(id){ collapsed[id]=!collapsed[id]; var box=document.getElementById('slots-'+id); var t=document.getElementById('tog-'+id); if(!box)return; var hid=!!collapsed[id]; box.style.display=hid?'none':''; if(t)t.textContent=hid?'▸':'▾';
 // 요일 탭 누르면 지도도 해당일로 (펼치기·접기 모두)
 var di=state.days.findIndex(function(x){return x.id===id;}); if(di>=0){ mapDay=di; drawMap(); scrollSpyOff=Date.now()+5000; }
}
// 일정 1번 탭: 지도 해당일로 (화면 이동 없음). 2번 탭: 지도 스크롤 + 팝업
var lastTapId=null, lastTapT=0;
function tapSlot(e, id){
 e.stopPropagation();
 var di=state.days.findIndex(function(d){return d.slots.some(function(s){return s._id===id;});});
 if(di>=0&&di!==mapDay){ mapDay=di; drawMap(); }
 var now=Date.now();
 if(lastTapId===id&&now-lastTapT<2500){
  lastTapId=null;
  document.querySelector('.map-wrap').scrollIntoView({behavior:'smooth'});
  setTimeout(function(){ var mk=(window._markers||{})[id]; if(mk) mk.openPopup(); }, 500);
 } else { lastTapId=id; lastTapT=now; }
}
function rmPool(e, kind, i){ e.stopPropagation(); var s=state[kind==='food'?'food':'spots'][i]; if(s&&s.lock){ alert('Locked — unlock first.'); return; } modalConfirm('Delete permanently?', function(ok){ if(!ok)return; state[kind==='food'?'food':'spots'].splice(i,1); render(); }); }
function addCustom(kind){
 var inp = document.getElementById(kind==='food'?'newFood':'newSpot');
 var tm = document.getElementById(kind==='food'?'newFoodT':'newSpotT');
 var ad = document.getElementById(kind==='food'?'newFoodA':'newSpotA');
 var v = inp.value.trim(); if(!v) return;
 var addr = (ad&&ad.value.trim())||'';
 var slot = {t:(tm&&tm.value)||'',n:v,d:'Custom stop — add note by editing JSON.',g:'andaz',cat:kind==='food'?'food':'spot'};
 state[kind==='food'?'food':'spots'].push(slot);
 inp.value=''; if(tm)tm.value=''; if(ad)ad.value='';
 if(addr){ geocodeAddr(addr, slot); setStatus('Searching location…'); } else render();
}
// 주소 → 좌표 (Nominatim). 찾으면 지도에 찍힘, 못 찾으면 Andaz에 + 주소 표시
async function geocodeAddr(addr, slot){
 try{
  var r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(addr+', Seoul'));
  var j = await r.json();
  if(j&&j.length){
   var key='c_'+Date.now();
   GEO[key]=[parseFloat(j[0].lat),parseFloat(j[0].lon)]; GEO_C[key]=GEO[key];
   slot.g=key;
   slot.d=j[0].display_name.split(',').slice(0,3).join(',');
   setStatus('Pinned ✓');
  } else { slot.d='('+addr+') — not found, edit manually.'; setStatus('Address not found — added anyway.'); }
 }catch(e){ slot.d='('+addr+')'; setStatus('Search failed — added anyway.'); }
 render();
}
// ── Drag & drop (mouse + touch) ──
function initSortable(){
 var groups = {group:{name:'sched',pull:true,put:true},animation:150,ghostClass:'sortable-ghost',delay:600,delayOnTouchOnly:true,
  forceFallback:false,fallbackTolerance:8,preventOnFilter:false,
  filter:'.num,.lk,.n,.d,.ad',
  onEnd:function(){ syncFromDOM(); }};
 state.days.forEach(function(d){ var el=document.getElementById('slots-'+d.id); if(el&&!el._s) el._s=new Sortable(el,Object.assign({},groups,{filter:'.locked,.num,.lk,.n,.d,.ad',preventOnFilter:false,onMove:function(e){return !e.dragged.classList.contains('locked');}})); });
 ['pool-food','pool-spots'].forEach(function(id){ var el=document.getElementById(id); if(el&&!el._s) el._s=new Sortable(el,Object.assign({},groups)); });
}
function syncFromDOM(){
 // ID 기반으로 추적 (인덱스 꼬임 방지)
 function findSlot(id){
  for(var di=0;di<state.days.length;di++) for(var si=0;si<state.days[di].slots.length;si++)
   if(state.days[di].slots[si]._id===id) return state.days[di].slots[si];
  for(var k of ['food','spots']) for(var i=0;i<state[k].length;i++)
   if(state[k][i]._id===id) return state[k][i];
  return null;
 }
 state.days.forEach(function(d){
  var box=document.getElementById('slots-'+d.id); var out=[];
  box.querySelectorAll('.slot').forEach(function(el){
   var src=el.dataset.uid?findSlot(el.dataset.uid):null;
   if(!src){
    if(el.dataset.d!==undefined) src=state.days[+el.dataset.d].slots[+el.dataset.s];
    else src=state[el.dataset.p==='food'?'food':'spots'][+el.dataset.i];
   }
   if(src) out.push(src);
  });
  d.slots=out;
 });
 var onDays=new Set(); state.days.forEach(function(d){d.slots.forEach(function(s){if(s._id)onDays.add(s._id);else onDays.add(s);});});
 ['food','spots'].forEach(function(k){ state[k]=state[k].filter(function(s){return !(s._id?onDays.has(s._id):onDays.has(s));}); });
 ['pool-food|food','pool-spots|spots'].forEach(function(pair){
  var parts=pair.split('|'), box=document.getElementById(parts[0]), out=[];
  box.querySelectorAll('.slot').forEach(function(el){
   var src=el.dataset.uid?findSlot(el.dataset.uid):null;
   if(!src&&el.dataset.p!==undefined) src=(state[parts[1]].concat(collectDaySlots())).find(function(x){return x&&x.n===el.querySelector('.n').textContent;});
   if(src) out.push(src);
  });
  if(out.length||box.querySelectorAll('.slot').length===0) state[parts[1]]=out;
 });
 render();
}
function collectDaySlots(){ var a=[]; state.days.forEach(function(d){d.slots.forEach(function(s){a.push(s);});}); return a; }
// ── Map: one day at a time ──
var map, layerGroup, mapDay = 0;
function drawMap(){
 if(!map){
  map=L.map('map',{center:[37.53,127.02],zoom:11,scrollWheelZoom:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',subdomains:'abc',maxZoom:19}).addTo(map);
  map.on('click',function(){map.scrollWheelZoom.enable();});
 }
 if(layerGroup) layerGroup.clearLayers(); else layerGroup=L.layerGroup().addTo(map);
 // day buttons
 var bb=document.getElementById('mapDayBtns');
 if(bb){
  bb.innerHTML='';
  state.days.forEach(function(d,di){
   var b=document.createElement('button');
   var lbl=['Sun 21','Mon 22','Tue 23','Wed 24','Thu 25'][di]||('Day '+(di+1));
   b.textContent=lbl;
   b.title=d.label;
   b.style.cssText='margin:0 3px;padding:2px 10px;border-radius:12px;border:1px solid '+(di===mapDay?'#b8860b':'#d8e0ec')+';background:'+(di===mapDay?'#b8860b':'#fff')+';color:'+(di===mapDay?'#fff':'#64748b')+';cursor:pointer;font-size:12px;font-weight:700';
   b.onclick=function(){mapDay=di;drawMap();scrollSpyOff=Date.now()+5000;};
   // swipe 좌우로 요일 전환
   b.ontouchstart=function(e){var x=e.touches[0].clientX;var h=function(ev){var dx=ev.changedTouches[0].clientX-x;if(Math.abs(dx)>30){var nd=di+(dx<0?1:-1);if(nd>=0&&nd<state.days.length){mapDay=nd;drawMap();}scrollSpyOff=Date.now()+5000;}document.removeEventListener('touchend',h);};document.addEventListener('touchend',h);};
   bb.appendChild(b);
  });
 }
 if(mapDay>=state.days.length) mapDay=0;
 var d=state.days[mapDay];
 if(!d) return;
 // 호텔+공항 앵커: 지도에만 추가 (일정 건드리지 않음)
 var viewSlots=d.slots.slice();
 var HOTEL={t:"",n:"Andaz Seoul Gangnam (안다즈 서울 강남) — base",d:"Hotel base (map anchor).",g:"andaz",cat:"hotel"};
 if(!viewSlots.some(function(x){return x.cat==='hotel';})) viewSlots.push(HOTEL);
 var n=0, pts=[];
 var numMap={}; var markerById={}; window._markers=markerById;
 var jit=0;
 viewSlots.forEach(function(s){
  var g=GEO[s.g]||GEO.andaz;
  if(!GEO[s.g]||s.g==='andaz'){ jit++; g=[g[0]+jit*0.004, g[1]+jit*0.006]; }
  var isNum=s.cat!=='hotel'&&s.cat!=='move';
  if(isNum){ n++; if(s._id) numMap[s._id]=n; }
  else if(s._id) numMap[s._id]=0;
  var cls='';
  var label=String(numMap[s._id]||n+1);
  var icon=L.divIcon({className:'',html:'<div class="mk '+cls+'">'+label+'</div>',iconSize:[26,26],iconAnchor:[13,13],popupAnchor:[0,-14]});
  var mk=L.marker(g,{icon:icon}).addTo(layerGroup).bindPopup('<b>'+esc(s.n)+'</b><br>'+esc(d.label)+'<br><span style="font-size:11px;color:#8899b4">'+esc(s.d||'')+'</span>');
  if(s._id) markerById[s._id]=mk;
  pts.push(g);
 });
 if(pts.length>1){ L.polyline(pts,{color:'#b8860b',weight:2.5,dashArray:'6 4',opacity:.8}).addTo(layerGroup); }
 if(pts.length) map.fitBounds(L.latLngBounds(pts),{padding:[40,40]});
 // 일정 카드에 지도 번호 반영 — 전 요일 전부 (현재 요일 아니면 순서번호)
 (function(){
  var allMap={};
  state.days.forEach(function(dd){
   var nn=0; (dd.slots||[]).forEach(function(ss){ if(ss.cat!=='hotel'&&ss.cat!=='move'){ nn++; if(ss._id) allMap[ss._id]=nn; } });
  });
  window._numMap=allMap; refreshNums();
 })();
}
// 인앱 대응: prompt/confirm 대신 커스텀 모달 (카톡·라인 인앱은 prompt 막힘)
function modal(title, fields, cb){
 var m=document.getElementById('modal'); if(!m){ cb(fields.map(function(){return null;})); return; }
 document.getElementById('modalTitle').textContent=title;
 var box=document.getElementById('modalFields'); box.innerHTML='';
 var inputs=fields.map(function(f){
  var inp=document.createElement(f.multiline?'textarea':'input');
  inp.value=f.value||''; inp.placeholder=f.ph||'';
  inp.style.cssText='width:100%;box-sizing:border-box;padding:9px;margin-top:6px;border:1px solid #d8e0ec;border-radius:8px;font-size:14px;font-family:inherit';
  if(f.multiline) inp.rows=3;
  box.appendChild(inp); return inp;
 });
 m.style.display='flex';
 var done=function(ok){ m.style.display='none';
  document.getElementById('modalOk').onclick=null; document.getElementById('modalCancel').onclick=null;
  cb(ok?inputs.map(function(i){return i.value;}):null); };
 document.getElementById('modalOk').onclick=function(){done(true);};
 document.getElementById('modalCancel').onclick=function(){done(false);};
}
function modalConfirm(msg, cb){
 var m=document.getElementById('modal'); if(!m){ cb(window.confirm?window.confirm(msg):true); return; }
 document.getElementById('modalTitle').textContent=msg;
 document.getElementById('modalFields').innerHTML='';
 m.style.display='flex';
 var done=function(ok){ m.style.display='none'; document.getElementById('modalOk').onclick=null; document.getElementById('modalCancel').onclick=null; cb(ok); };
 document.getElementById('modalOk').onclick=function(){done(true);};
 document.getElementById('modalCancel').onclick=function(){done(false);};
}
function editText(e, id){
 e.stopPropagation();
 var s=findSlotById(id); if(!s||s.lock) return;
 modal('Edit card', [{value:s.n||'',ph:'Title'},{value:s.d||'',ph:'Description',multiline:1}], function(v){
  if(!v) return; s.n=(v[0]||'').trim(); s.d=(v[1]||'').trim(); render();
 });
}
function editAddr(e, id){
 e.stopPropagation();
 var s=findSlotById(id); if(!s) return;
 if(s.lock){ alert('Locked — unlock first.'); return; }
 var cur=s.addr||'';
 modal('Address for map pin (Korean OK)\n'+s.n, [{value:cur,ph:'e.g. 중구 세종대로 82'}], function(v){
 if(!v) return;
 s.addr=(v[0]||'').trim();
 if(!s.addr){ setStatus('Address cleared.'); render(); return; }
 setStatus('Searching location…');
 fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(s.addr)) 
 .then(function(r){return r.json();})
 .then(function(j){
  if(j&&j.length){
   var key='c_'+Date.now();
   GEO[key]=[parseFloat(j[0].lat),parseFloat(j[0].lon)]; GEO_C[key]=GEO[key];
   s.g=key;
   setStatus('Pinned ✓ '+j[0].display_name.split(',').slice(0,2).join(','));
  } else setStatus('Not found — kept anyway. Try more detail (e.g. 중구 세종대로 82).');
  render();
 })
 .catch(function(){ setStatus('Search failed — kept anyway.'); render(); });
 });
}
function refreshNums(){
 var m=window._numMap||{};
 document.querySelectorAll('#days .slot').forEach(function(el){
  var b=el.querySelector('.num'); if(!b) return;
  var id=el.dataset.uid; var s=findSlotById(id); if(!s) return;
  var n=m[id];
  b.textContent=(n>0?String(n):'•');
 });
}
function findSlotById(id){
 for(var di=0;di<state.days.length;di++) for(var si=0;si<state.days[di].slots.length;si++)
  if(state.days[di].slots[si]._id===id) return state.days[di].slots[si];
 for(var k of ['food','spots']) for(var i=0;i<state[k].length;i++)
  if(state[k][i]._id===id) return state[k][i];
 return null;
}
// 스크롤 따라 지도 요일 자동 전환 (수동 버튼 터치 후 5초간 비활성 — 리셋 방지)
var scrollSpyOff = 0;
function setupScrollSpy(){
 var wrap=document.querySelector('.map-wrap');
 if(wrap&&!wrap.dataset.sticky){ wrap.dataset.sticky='1';  }
 if('IntersectionObserver' in window){
  if(window._dayObs) window._dayObs.disconnect();
  window._dayObs=new IntersectionObserver(function(es){
   es.forEach(function(e){
    if(e.isIntersecting){
     var id=(e.target.id||'').replace('day-','');
     var di=state.days.findIndex(function(x){return x.id===id;});
     if(di>=0&&di!==mapDay&&Date.now()>scrollSpyOff){ mapDay=di; drawMap(); }
    }
   });
  },{rootMargin:'-30% 0px -55% 0px'});
  state.days.forEach(function(d){ var el=document.getElementById('day-'+d.id); if(el) window._dayObs.observe(el); });
 }
}
// ── Share / reset / export ──
function shareLink(){
 persist();
 var s=btoa(unescape(encodeURIComponent(JSON.stringify(state))));
 var url=location.href.split('#')[0]+'#s='+s;
 (navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(function(){alert('Share link copied — anyone opening it sees + edits this schedule.');},function(){prompt('Copy this link:',url);});
}
function resetAll(){ if(!confirm('Reset to default schedule? Current is saved in History.'))return; state=JSON.parse(JSON.stringify(DEFAULTS)); location.hash=''; render(); }
function toggleExport(){ var p=document.getElementById('export'); if(p.style.display==='block'){p.style.display='none';return;} p.textContent=JSON.stringify(state,null,1).slice(0,6000); p.style.display='block'; }
render();

function bindLocks(){
 document.querySelectorAll('.lk').forEach(function(el){
  if(el._bound) return; el._bound=1;
  var id=el.dataset.lk, timer=null;
  el.addEventListener('pointerdown', function(e){ e.stopPropagation(); timer=setTimeout(function(){ timer=null; rmSlotById(id); }, 900); });
  el.addEventListener('pointerup', function(e){ e.stopPropagation(); if(timer){ clearTimeout(timer); timer=null; toggleLock(e, id); } });
  el.addEventListener('pointerleave', function(){ if(timer){ clearTimeout(timer); timer=null; } });
  el.addEventListener('contextmenu', function(e){ e.preventDefault(); e.stopPropagation(); });
 });
}