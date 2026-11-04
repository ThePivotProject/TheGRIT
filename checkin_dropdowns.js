
(function(){
try{
function initDropdowns(){
  // Find all section headers (mr component)
  var headers = document.querySelectorAll('div.flex.items-baseline.gap-3');
  headers.forEach(function(h, idx){
    var parent = h.parentElement;
    if(!parent) return;
    if(parent.dataset.dropdownInit) return;
    // Parent is the section container (has marginTop)
    // The content is the next sibling after mr, or all following divs in parent
    var contentDivs = [];
    var next = h.nextElementSibling;
    while(next){
      contentDivs.push(next);
      next = next.nextElementSibling;
    }
    if(contentDivs.length===0) return;
    parent.dataset.dropdownInit='1';
    // Create wrapper
    var wrapper = document.createElement('div');
    wrapper.style.cssText='overflow:hidden;transition:max-height 0.3s ease, opacity 0.2s ease;';
    // Move content into wrapper
    contentDivs.forEach(function(c){ wrapper.appendChild(c); });
    parent.appendChild(wrapper);
    // Make header clickable
    h.style.cursor='pointer';
    h.style.userSelect='none';
    // Add arrow
    var arrow = document.createElement('span');
    arrow.textContent='▼';
    arrow.style.cssText='margin-left:auto;font-size:10px;color:#FF4D00;transition:transform 0.2s;';
    h.appendChild(arrow);
    // State: first section (Athlete Profile) and Workout open, others closed
    var title = h.textContent || '';
    var shouldOpen = title.includes('01') || title.includes('Athlete Profile') || title.includes('03') || title.includes('Workout');
    if(!shouldOpen){
      wrapper.style.maxHeight='0';
      wrapper.style.opacity='0';
      arrow.style.transform='rotate(-90deg)';
      wrapper.dataset.open='0';
    } else {
      wrapper.style.maxHeight='2000px';
      wrapper.style.opacity='1';
      wrapper.dataset.open='1';
    }
    h.addEventListener('click', function(){
      var isOpen = wrapper.dataset.open==='1';
      if(isOpen){
        wrapper.style.maxHeight='0';
        wrapper.style.opacity='0';
        arrow.style.transform='rotate(-90deg)';
        wrapper.dataset.open='0';
      } else {
        wrapper.style.maxHeight='2000px';
        wrapper.style.opacity='1';
        arrow.style.transform='rotate(0deg)';
        wrapper.dataset.open='1';
      }
    });
  });
}
document.addEventListener('DOMContentLoaded', function(){ setTimeout(initDropdowns, 800); setTimeout(initDropdowns, 2000); });
var obs = new MutationObserver(function(){ initDropdowns(); });
document.addEventListener('DOMContentLoaded', function(){ try{obs.observe(document.body,{childList:true,subtree:true});}catch(e){} });
}catch(e){console.log('dropdown init error',e)}
})();
