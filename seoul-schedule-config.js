
// Firebase 실시간 동기화 (seoulwj 프로젝트)
var FB_URL='https://seoulwj-7f762-default-rtdb.firebaseio.com';
var FB_KEY='AIzaSyClSxL1PByJmnwZjbf_IgSPlQMDQvEvA';
var fbApp=null, fbRef=null, fbOn=false, fbTimer=null;
try{
 fbApp=firebase.initializeApp({apiKey:FB_KEY,databaseURL:FB_URL,projectId:'seoulwj-7f762'});
 fbRef=firebase.database().ref('schedules/seoul-sep25');
}catch(e){}
function fbPush(){
 if(!fbRef) return;
 try{ state.geoC=GEO_C; state.updatedAt=Date.now(); fbRef.set(state); }catch(e){}
}
function fbStart(){
 if(!fbRef||fbOn) return; fbOn=true;
 fbRef.on('value', function(snap){
  var v=snap.val(); if(!v||!v.days||!v.days.length) return; // 빈 DB 무시
  if(!v.food) v.food=[]; if(!v.spots) v.spots=[];
  if(v.updatedAt&&state.updatedAt&&v.updatedAt<=state.updatedAt) return;
  state=v; if(state.geoC){ GEO_C=state.geoC; for(var k in state.geoC) GEO[k]=state.geoC[k]; }
  render();
 });
}
function fbStatus(){
 var el=document.getElementById('fbStatus');
 if(!el) return;
 if(!fbRef){ el.textContent='○ offline'; return; }
 firebase.database().ref('.info/connected').on('value', function(s){
  el.textContent=s.val()?'● live':'○ connecting…';
  el.style.color=s.val()?'#3fb950':'#8899b4';
 });
}
