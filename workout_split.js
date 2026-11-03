(function(){
try{
function findWorkout(){
  var tas=document.querySelectorAll('textarea');
  for(var i=0;i<tas.length;i++){
    var ph=tas[i].getAttribute('placeholder')||'';
    if(ph.indexOf("Today's work")!==-1) return tas[i];
  }
  return null;
}
function split(){
  try{
    var w=findWorkout();
    if(!w) return;
    if(w.dataset.gritDone) return;
    w.dataset.gritDone='1';
    var wrap=document.createElement('div');
    wrap.style.cssText='display:flex;flex-direction:column;gap:8px;margin-bottom:8px;';
    function getVals(){
      var s=w.value||'';
      var st='',mn='',sp='';
      if(s.indexOf('STRETCH | CORE:')!==-1){
        try{
          st=s.split('STRETCH | CORE:')[1].split('MAIN MOVEMENT:')[0].trim();
          mn=s.split('MAIN MOVEMENT:')[1].split('SPEED | CHANGE OF DIRECTION:')[0].trim();
          sp=s.split('SPEED | CHANGE OF DIRECTION:')[1].trim();
        }catch(e){}
      } else if(s){ mn=s; }
      return {st:st,mn:mn,sp:sp};
    }
    var vals=getVals();
    function make(label,key,ph,val){
      var d=document.createElement('div');
      var l=document.createElement('div');
      l.textContent=label;
      l.style.cssText='color:#FF4D00;font-weight:700;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;';
      var ta=document.createElement('textarea');
      ta.value=val||'';
      ta.placeholder=ph;
      ta.rows=2;
      ta.style.cssText='width:100%;background:rgba(16,16,16,0.8);border:1px solid rgba(255,255,255,0.12);color:#EDEBE6;padding:12px;font-size:14px;line-height:1.6;';
      ta.addEventListener('input',function(){
        var cur={};
        var all=wrap.querySelectorAll('textarea[data-k]');
        for(var i=0;i<all.length;i++) cur[all[i].getAttribute('data-k')]=all[i].value;
        var combined='STRETCH | CORE:\n'+(cur.stretch||'')+'\n\nMAIN MOVEMENT:\n'+(cur.main||'')+'\n\nSPEED | CHANGE OF DIRECTION:\n'+(cur.speed||'');
        try{
          var setter=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
          setter.call(w,combined);
        }catch(e){ w.value=combined; }
        w.dispatchEvent(new Event('input',{bubbles:true}));
        w.dispatchEvent(new Event('change',{bubbles:true}));
      });
      ta.setAttribute('data-k',key);
      d.appendChild(l); d.appendChild(ta);
      return d;
    }
    wrap.appendChild(make('Stretch | Core','stretch','e.g. Dynamic warm-up, 90/90 hips, band pull-aparts...',vals.st));
    wrap.appendChild(make('Main Movement','main','e.g. Softball: 4x8 Trap Bar, 3x10 DB Bench... Baseball: 4x6 Front Squat...',vals.mn));
    wrap.appendChild(make('Speed | Change of Direction','speed','e.g. 6x10yd sprint, 5-10-5 shuttle, base-running...',vals.sp));
    var vd=document.createElement('div');
    vd.style.cssText='background:#161616;border:1px dashed rgba(255,77,0,0.5);padding:12px;text-align:center;';
    vd.innerHTML='<div style="color:#FF4D00;font-weight:700;font-size:11px;letter-spacing:0.08em;margin-bottom:6px;">WORKOUT VIDEO (OPTIONAL)</div><div style="color:#8A8A8A;font-size:11px;margin-bottom:8px;">Upload a video if needed - demo, cue, or drill</div>';
    var fi=document.createElement('input'); fi.type='file'; fi.accept='video/*'; fi.style.cssText='display:block;width:100%;color:#EDEBE6;font-size:12px;margin-bottom:8px;';
    var ui=document.createElement('input'); ui.type='url'; ui.placeholder='Or paste video link - YouTube / Instagram'; ui.style.cssText='width:100%;background:rgba(16,16,16,0.8);border:1px solid rgba(255,255,255,0.12);color:#EDEBE6;padding:10px;font-size:14px;margin-bottom:8px;';
    var pv=document.createElement('div');
    fi.onchange=function(e){ var f=e.target.files[0]; if(!f) return; var u=URL.createObjectURL(f); pv.innerHTML=''; var v=document.createElement('video'); v.controls=true; v.style.cssText='width:100%;max-height:220px;background:#000;'; v.src=u; pv.appendChild(v); };
    ui.addEventListener('input',function(){ var u=ui.value.trim(); if(u){ pv.innerHTML=''; var a=document.createElement('a'); a.href=u; a.target='_blank'; a.textContent='WATCH VIDEO - '+u; a.style.cssText='color:#FF4D00;font-weight:700;font-size:12px;'; pv.appendChild(a); } });
    vd.appendChild(fi); vd.appendChild(ui); vd.appendChild(pv);
    wrap.appendChild(vd);
    w.style.display='none';
    w.parentNode.insertBefore(wrap,w.nextSibling);
  }catch(e){ console.log('grit split error',e); }
}
document.addEventListener('DOMContentLoaded',function(){ setTimeout(split,1000); setTimeout(split,2500); });
var obs=new MutationObserver(function(){ split(); });
document.addEventListener('DOMContentLoaded',function(){ try{obs.observe(document.body,{childList:true,subtree:true});}catch(e){} });
}catch(e){ console.log('grit init error',e); }
})();
