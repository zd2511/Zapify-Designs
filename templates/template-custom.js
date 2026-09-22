(()=>{
 const body=document.body,type=body.dataset.template||'salon';
 if(window.top!==window.self)document.querySelector('.top .cta')?.remove();
 const presets={
  salon:[{name:'Blush',accent:'#e32976',bg:'#fff2f7',ink:'#19191f'},{name:'Sage',accent:'#789b88',bg:'#f1f7f2',ink:'#17221b'},{name:'Noir',accent:'#111',bg:'#f2f2f3',ink:'#111'}],
  mechanic:[{name:'Volt',accent:'#ffb44c',bg:'#111a20',ink:'#fff'},{name:'Redline',accent:'#ef4b45',bg:'#211619',ink:'#fff'},{name:'Electric',accent:'#38bdf8',bg:'#0d1820',ink:'#fff'}],
  restaurant:[{name:'Terracotta',accent:'#c56d4a',bg:'#f7eee7',ink:'#241713'},{name:'Olive',accent:'#89956a',bg:'#f2f4e9',ink:'#20251a'},{name:'Midnight',accent:'#9c7bd9',bg:'#17131e',ink:'#fff'}],
  photographer:[{name:'Mono',accent:'#111',bg:'#f1f1f1',ink:'#111'},{name:'Rose',accent:'#d76a91',bg:'#fff1f7',ink:'#22151c'},{name:'Cobalt',accent:'#4f78c8',bg:'#eef4ff',ink:'#101827'}],
  construction:[{name:'Safety',accent:'#e0ad2e',bg:'#202a22',ink:'#fff'},{name:'Orange',accent:'#e56e32',bg:'#2c211c',ink:'#fff'},{name:'Signal Blue',accent:'#4f8ebc',bg:'#152433',ink:'#fff'}],
  scrapbook:[{name:'Candy',accent:'#d65d92',bg:'#fff8fb',ink:'#2b1e27'},{name:'Sunny',accent:'#d29b2f',bg:'#fff8df',ink:'#332a18'},{name:'Ocean',accent:'#3f83a7',bg:'#edf8ff',ink:'#182a36'}]
 };
 const slots=[...document.querySelectorAll('[data-upload-slot]')];
 const defaults=slots.map(e=>e.style.backgroundImage||'');
 const hero=document.querySelector('[data-hero-image]');
 const heroDefault=hero?.style.backgroundImage||'';
 function apply(data={}){
  const list=presets[type]||[];const p=list[Number(data.preset||0)]||list[0];if(!p)return;
  const root=document.documentElement;root.style.setProperty('--tpl-accent',p.accent);root.style.setProperty('--tpl-bg',p.bg);root.style.setProperty('--tpl-ink',p.ink);root.style.setProperty('--tpl-button-ink',['#fff','#ffffff'].includes(p.accent)?'#111':'#fff');if(data.fontFamily)root.style.setProperty('--tpl-body',data.fontFamily);
  document.querySelectorAll('[data-brand]').forEach(e=>{if(data.business)e.textContent=data.business});
  document.querySelectorAll('[data-headline]').forEach(e=>{if(data.headline)e.textContent=data.headline});
  document.querySelectorAll('[data-services]').forEach(e=>{if(data.services)e.textContent=data.services});
  document.querySelectorAll('[data-about]').forEach(e=>{if(data.about)e.textContent=data.about});
  document.querySelectorAll('[data-cta]').forEach(e=>{if(data.cta)e.textContent=data.cta});
  const imgs=[...(data.images||[])];slots.forEach((e,i)=>{const img=imgs[i];e.style.backgroundImage=img?`url("${img}")`:defaults[i]||'';e.style.backgroundSize='cover';e.style.backgroundPosition=data.imagePosition||'center';e.classList.toggle('has-image',!!img)});
  if(hero){hero.style.backgroundImage=data.heroImage?`url("${data.heroImage}")`:heroDefault;hero.classList.toggle('has-image',!!data.heroImage)}
  document.body.className=[...document.body.classList].filter(x=>!x.startsWith('feature-')).join(' ');(data.features||[]).forEach(f=>{const id=typeof f==='string'?f:f.id;if(id)document.body.classList.add('feature-'+id)});
  document.querySelectorAll('[data-feature-count]').forEach(e=>{const count=(data.features||[]).length;e.textContent=count?`${count} custom feature${count===1?'':'s'} selected`:'Standard layout'});
 }
 let data={};try{data=JSON.parse(localStorage.getItem('zapifyTemplatePreview')||'{}')}catch(e){}apply(data);
 window.addEventListener('message',e=>{if(e.data?.type==='zapify-preview'){data={...data,...(e.data.config||{})};apply(data)}});
 window.ZAPIFY_TEMPLATE_PRESETS=presets[type]||[];
})();
