(function(){
  const presets={
    salon:[{name:'Blush',accent:'#e32976',bg:'#fff2f7',ink:'#19191f'},{name:'Sage',accent:'#789b88',bg:'#f2f7f2',ink:'#18201b'},{name:'Noir',accent:'#111111',bg:'#f3f3f3',ink:'#111111'}],
    mechanic:[{name:'Volt',accent:'#ffb44c',bg:'#0c151b',ink:'#fff'},{name:'Redline',accent:'#ef4b45',bg:'#151515',ink:'#fff'},{name:'Electric',accent:'#38bdf8',bg:'#08131d',ink:'#fff'}],
    restaurant:[{name:'Terracotta',accent:'#f5d2aa',bg:'#3b1515',ink:'#fff'},{name:'Olive',accent:'#d7d8a0',bg:'#273021',ink:'#fff'},{name:'Midnight',accent:'#d9b7ff',bg:'#171326',ink:'#fff'}],
    photographer:[{name:'Mono',accent:'#fff',bg:'#0c1726',ink:'#fff'},{name:'Rose',accent:'#ff7fb8',bg:'#24151e',ink:'#fff'},{name:'Cobalt',accent:'#72a7ff',bg:'#0b1630',ink:'#fff'}],
    construction:[{name:'Safety',accent:'#f4c84a',bg:'#202a22',ink:'#fff'},{name:'Orange',accent:'#ff7b36',bg:'#211812',ink:'#fff'},{name:'Signal Blue',accent:'#63b3ed',bg:'#10202c',ink:'#fff'}],
    scrapbook:[{name:'Candy',accent:'#e95f9f',bg:'#fff7fb',ink:'#2b1e27'},{name:'Sunny',accent:'#e5a72b',bg:'#fffaf0',ink:'#2b2416'},{name:'Ocean',accent:'#3d8fc7',bg:'#f3fbff',ink:'#18232b'}]
  };
  const type=document.body.dataset.template||'';
  const data={}; try{Object.assign(data,JSON.parse(localStorage.getItem('zapifyTemplatePreview')||'{}'))}catch(e){}
  function apply(c){
    if(!c)return;
    document.documentElement.style.setProperty('--tpl-accent',c.accent);document.documentElement.style.setProperty('--tpl-bg',c.bg);document.documentElement.style.setProperty('--tpl-ink',c.ink);
    document.querySelectorAll('[data-brand]').forEach(e=>e.textContent=data.business||e.dataset.brand||e.textContent);
    if(data.headline) document.querySelectorAll('[data-headline]').forEach(e=>e.textContent=data.headline);
    if(data.services) document.querySelectorAll('[data-services]').forEach(e=>e.textContent=data.services);
    if(data.about) document.querySelectorAll('[data-about]').forEach(e=>e.textContent=data.about);
    if(data.cta) document.querySelectorAll('[data-cta]').forEach(e=>e.textContent=data.cta);
    document.querySelectorAll('[data-accent]').forEach(e=>{e.style.background=c.accent;e.style.color=(c.accent==='#fff'?'#111':e.style.color)});
    document.querySelectorAll('[data-hero]').forEach(e=>{e.style.background=c.bg;e.style.color=c.ink});
    document.querySelectorAll('[data-progress]').forEach(e=>e.style.background=c.accent);
    const imgs=data.images||[]; document.querySelectorAll('[data-upload-slot]').forEach((e,i)=>{if(imgs[i]){e.style.backgroundImage='url('+imgs[i]+')';e.style.backgroundSize='cover';e.style.backgroundPosition='center';e.textContent=''}});
  }
  apply((presets[type]||[])[Number(data.preset||0)]||presets[type]?.[0]);
  window.addEventListener('message',e=>{if(e.data&&e.data.type==='zapify-preview'){Object.assign(data,e.data.config||{});apply((presets[type]||[])[Number(data.preset||0)]||presets[type]?.[0]);}});
  window.ZAPIFY_TEMPLATE_PRESETS=presets[type]||[];
})();
