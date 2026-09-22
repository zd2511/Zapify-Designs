(()=>{
 const body=document.body,type=body.dataset.template||'salon';
 const presets={
  salon:[{name:'Blush',accent:'#e32976',bg:'#fff2f7',ink:'#19191f'},{name:'Sage',accent:'#789b88',bg:'#f1f7f2',ink:'#17221b'},{name:'Noir',accent:'#111',bg:'#f2f2f3',ink:'#111'}],
  mechanic:[{name:'Volt',accent:'#ffb44c',bg:'#111a20',ink:'#fff'},{name:'Redline',accent:'#ef4b45',bg:'#211619',ink:'#fff'},{name:'Electric',accent:'#38bdf8',bg:'#0d1820',ink:'#fff'}],
  restaurant:[{name:'Terracotta',accent:'#f5d2aa',bg:'#3b1515',ink:'#fff'},{name:'Olive',accent:'#d7d8a0',bg:'#27301f',ink:'#fff'},{name:'Midnight',accent:'#d9b7ff',bg:'#211a2b',ink:'#fff'}],
  photographer:[{name:'Mono',accent:'#111',bg:'#f1f1f1',ink:'#111'},{name:'Rose',accent:'#ff7fb8',bg:'#fff1f7',ink:'#22151c'},{name:'Cobalt',accent:'#72a7ff',bg:'#eef4ff',ink:'#101827'}],
  construction:[{name:'Safety',accent:'#f4c84a',bg:'#202a22',ink:'#fff'},{name:'Orange',accent:'#ff7b36',bg:'#2c211c',ink:'#fff'},{name:'Signal Blue',accent:'#63b3ed',bg:'#152433',ink:'#fff'}],
  scrapbook:[{name:'Candy',accent:'#e95f9f',bg:'#fff8fb',ink:'#2b1e27'},{name:'Sunny',accent:'#e5a72b',bg:'#fff8df',ink:'#332a18'},{name:'Ocean',accent:'#3d8fc7',bg:'#edf8ff',ink:'#182a36'}]
 };
 function apply(data={}){
  const p=(presets[type]||[])[Number(data.preset||0)]||presets[type]?.[0]; if(!p)return;
  const root=document.documentElement;root.style.setProperty('--tpl-accent',p.accent);root.style.setProperty('--tpl-bg',p.bg);root.style.setProperty('--tpl-ink',p.ink);root.style.setProperty('--tpl-button-ink',['#fff','#ffffff'].includes(p.accent)?'#111':'#fff');
  if(data.fontFamily)root.style.setProperty('--tpl-body',data.fontFamily);
  document.querySelectorAll('[data-brand]').forEach(e=>e.textContent=data.business||e.textContent);
  document.querySelectorAll('[data-headline]').forEach(e=>{if(data.headline)e.textContent=data.headline});
  document.querySelectorAll('[data-services]').forEach(e=>{if(data.services)e.textContent=data.services});
  document.querySelectorAll('[data-about]').forEach(e=>{if(data.about)e.textContent=data.about});
  document.querySelectorAll('[data-cta]').forEach(e=>{if(data.cta)e.textContent=data.cta});
  document.querySelectorAll('[data-hero]').forEach(e=>{e.style.backgroundColor=p.bg;e.style.color=p.ink});
  const imgs=[...(data.images||[])];document.querySelectorAll('[data-upload-slot]').forEach((e,i)=>{const img=imgs[i];if(img){e.style.backgroundImage=`url("${img}")`;e.style.backgroundSize='cover';e.style.backgroundPosition=data.imagePosition||'center';e.textContent='';e.classList.add('has-image')}});
  if(data.heroImage){document.querySelector('[data-hero-image]')?.style.setProperty('background-image',`url("${data.heroImage}")`);document.querySelector('[data-hero-image]')?.classList.add('has-image')}
  document.body.className=[...document.body.classList].filter(x=>!x.startsWith('feature-')).join(' ');
  (data.features||[]).forEach(f=>{const id=typeof f==='string'?f:f.id;if(id)document.body.classList.add('feature-'+id)});
  if(data.customBackground)root.style.setProperty('--custom-bg',`url("${data.customBackground}")`);
  const count=(data.features||[]).length;document.querySelectorAll('[data-feature-count]').forEach(e=>e.textContent=count?`${count} custom feature${count===1?'':'s'} selected`:'Standard layout');
 }
 let data={};try{data=JSON.parse(localStorage.getItem('zapifyTemplatePreview')||'{}')}catch(e){} apply(data);
 window.addEventListener('message',e=>{if(e.data?.type==='zapify-preview'){data={...data,...(e.data.config||{})};apply(data)}});
 window.ZAPIFY_TEMPLATE_PRESETS=presets[type]||[];
})();
