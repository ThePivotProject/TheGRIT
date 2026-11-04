
// GRIT Roster Sync - syncs Team roster + athlete updates both ways
(function(){
try{
  var ROSTER_KEY='grit-team-roster-v1';
  var CHECKINS_KEY='grit-checkins-v1';
  var lastRosterJSON='';
  function slugify(name){ return (name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'athlete'; }
  function getRoster(){ try{ return JSON.parse(localStorage.getItem(ROSTER_KEY)||'[]'); }catch(e){ return []; } }
  function getCheckins(){ try{ return JSON.parse(localStorage.getItem(CHECKINS_KEY)||'{}'); }catch(e){ return {}; } }
  async function pushRoster(){
    try{
      if(!window.GRIT_SUPABASE) return;
      var roster=getRoster();
      var json=JSON.stringify(roster);
      if(json===lastRosterJSON) return;
      // Only push if we have config
      var cfg=window.GRIT_SUPABASE.getConfig();
      if(!cfg||!cfg.url) return;
      var res=await window.GRIT_SUPABASE.publishRoster(roster);
      if(res&&res.ok){ lastRosterJSON=json; console.log('GRIT roster pushed', roster.length); }
      // Also push each athlete's training
      var checkins=getCheckins();
      for(var slug in checkins){
        var data=checkins[slug];
        if(!data) continue;
        var name=data.profile?.name||data.name||slug;
        await window.GRIT_SUPABASE.publishAthlete(slugify(name), name, {
          profile: data.profile||{},
          homework: data.homework||[],
          workout: data.workout||'',
          checkin: data.grit||data.checkin||{}
        });
      }
    }catch(e){ console.log('push roster error',e); }
  }
  async function pullRoster(){
    try{
      if(!window.GRIT_SUPABASE) return;
      var cfg=window.GRIT_SUPABASE.getConfig();
      if(!cfg||!cfg.url) return;
      var data=await window.GRIT_SUPABASE.fetchRoster();
      if(!data||data.length===0) return;
      var local=getRoster();
      // Merge: cloud roster wins for same slug, add new ones
      var bySlug={};
      local.forEach(function(r){ bySlug[slugify(r.name||r.id)]=r; });
      var changed=false;
      data.forEach(function(row){
        var slug=row.athlete_slug;
        var profile=row.profile||{};
        // profile already contains id/name/position etc.
        var entry=profile && profile.name ? profile : { id: slug, name: row.athlete_name||slug, position: '', photo: '' };
        if(!bySlug[slug]){ bySlug[slug]=entry; changed=true; }
        else {
          // Update if cloud newer - we don't have timestamps per roster item, so merge profile fields if different
          var localJson=JSON.stringify(bySlug[slug]);
          var cloudJson=JSON.stringify(entry);
          if(localJson!==cloudJson){ bySlug[slug]=entry; changed=true; }
        }
      });
      if(changed){
        var merged=Object.values(bySlug);
        localStorage.setItem(ROSTER_KEY, JSON.stringify(merged));
        lastRosterJSON=JSON.stringify(merged);
        console.log('GRIT roster pulled', merged.length);
        // Trigger React re-render by dispatching storage event + reload if on Team page
        // We do a soft refresh if roster changed and user is on Team tab
        if(window.location.hash.includes('team') || document.body.innerText.includes('The GRIT Team')){
          // Don't force reload, just dispatch event
          window.dispatchEvent(new Event('grit-roster-updated'));
        }
      }
      // Also pull trainings
      var trainings=await window.GRIT_SUPABASE.fetchAll();
      if(trainings && trainings.length){
        var checkins=getCheckins();
        var tChanged=false;
        trainings.forEach(function(row){
          var slug=row.athlete_slug;
          var existing=checkins[slug];
          var cloudUpdated=new Date(row.updated_at||0).getTime();
          var localUpdated=existing?.savedAt ? new Date(existing.savedAt).getTime() : 0;
          if(!existing || cloudUpdated>localUpdated){
            checkins[slug]={
              homework: row.homework||[],
              workout: row.workout||'',
              grit: row.checkin||{},
              profile: row.profile||{},
              savedAt: row.updated_at,
              fromCloud: true
            };
            tChanged=true;
          }
        });
        if(tChanged){
          localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins));
          console.log('GRIT trainings pulled', trainings.length);
          window.dispatchEvent(new Event('grit-trainings-updated'));
        }
      }
    }catch(e){ console.log('pull roster error',e); }
  }
  // Init: pull on load, push on change
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(pullRoster, 1500);
    setTimeout(pushRoster, 2500);
    // Poll every 30s for athlete updates - coach sees updates when athletes save
    setInterval(pullRoster, 30000);
    // Watch localStorage changes (roster saved)
    var origSet=localStorage.setItem;
    localStorage.setItem=function(k,v){
      origSet.apply(this, arguments);
      if(k===ROSTER_KEY || k===CHECKINS_KEY){
        setTimeout(pushRoster, 800);
      }
    };
    // Also listen to storage events from other tabs
    window.addEventListener('storage', function(e){
      if(e.key===ROSTER_KEY||e.key===CHECKINS_KEY) setTimeout(pullRoster, 500);
    });
    window.addEventListener('grit-roster-updated', function(){ console.log('roster updated'); });
  });
  // Expose for manual sync button
  window.GRIT_ROSTER_SYNC={ push: pushRoster, pull: pullRoster };
}catch(e){ console.log('roster sync init error',e); }
})();
