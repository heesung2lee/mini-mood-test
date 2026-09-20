// Firebase realtime sync (same project/DB as v1)
var FB_URL='https://seoulwj-7f762-default-rtdb.firebaseio.com';
var FB_KEY='AIzaSyClSxL1PByJmnwZjbf_IgSPlQMDQvEvA';
var fbApp=null, fbRef=null;
try{
 fbApp=firebase.initializeApp({apiKey:FB_KEY,databaseURL:FB_URL,projectId:'seoulwj-7f762'});
 fbRef=firebase.database().ref('schedules/seoul-sep25');
}catch(e){}
function fbStatus(){
 var el=document.getElementById('fbStatus');
 if(!el) return;
 if(!fbRef){ el.textContent='○ offline'; return; }
 firebase.database().ref('.info/connected').on('value', function(s){
  el.textContent=s.val()?'● live':'○ connecting…';
  el.style.color=s.val()?'#3fb950':'#8899b4';
 });
}
