(()=>{
 const body=document.body,type=body.dataset.template||'salon';if(window.top!==window.self)document.querySelector('.top .cta')?.remove();
 const presets={salon:[{name:'Blush',accent:'#e32976',bg:'#fff2f7',ink:'#19191f'},{name:'Sage',accent:'#789b88',bg:'#f1f7f2',ink:'#17221b'},{name:'Noir',accent:'#111',bg:'#f2f2f3',ink:'#111'}],mechanic:[{name:'Volt',accent:'#ffb44c',bg:'#111a20',ink:'#fff'},{name:'Redline',accent:'#ef4b45',bg:'#211619',ink:'#fff'},{name:'Electric',accent:'#38bdf8',bg:'#0d1820',ink:'#fff'}],restaurant:[{name:'Terracotta',accent:'#c56d4a',bg:'#f7eee7',ink:'#241713'},{name:'Olive',accent:'#89956a',bg:'#f2f4e9',ink:'#20251a'},{name:'Midnight',accent:'#9c7bd9',bg:'#17131e',ink:'#fff'}],photographer:[{name:'Mono',accent:'#111',bg:'#f1f1f1',ink:'#111'},{name:'Rose',accent:'#d76a91',bg:'#fff1f7',ink:'#22151c'},{name:'Cobalt',accent:'#4f78c8',bg:'#eef4ff',ink:'#101827'}],construction:[{name:'Safety',accent:'#e0ad2e',bg:'#202a22',ink:'#fff'},{name:'Orange',accent:'#e56e32',bg:'#2c211c',ink:'#fff'},{name:'Signal Blue',accent:'#4f8ebc',bg:'#152433',ink:'#fff'}],scrapbook:[{name:'Candy',accent:'#d65d92',bg:'#fff8fb',ink:'#2b1e27'},{name:'Sunny',accent:'#d29b2f',bg:'#fff8df',ink:'#332a18'},{name:'Ocean',accent:'#3f83a7',bg:'#edf8ff',ink:'#182a36'}]};
 const slots=[...document.querySelectorAll('[data-upload-slot]')],defaults=slots.map(e=>e.style.backgroundImage||''),hero=document.querySelector('[data-hero-image]'),heroDefault=hero?.style.backgroundImage||'';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

 function featureSet(cfg){return new Set((cfg.features||[]).map(f=>typeof f==='string'?f:f.id).filter(Boolean))}
 function has(cfg,id){return featureSet(cfg).has(id)}
 function applyFeatureBehaviors(cfg){
  const fs=featureSet(cfg), root=document.documentElement, main=document.querySelector('main'), site=document.querySelector('.site');
  if(!main)return;
  root.style.setProperty('--gallery-columns',fs.has('gallery-columns')?'4':'5');
  root.style.setProperty('--gallery-gap',fs.has('gallery-gap')?'10px':'14px');
  root.style.setProperty('--image-position',cfg.imagePosition||'center');
  root.style.setProperty('--section-width',fs.has('section-width')?'1180px':'none');
  root.style.setProperty('--section-spacing',fs.has('section-spacing')?'55px':'70px');
  root.style.setProperty('--section-align',fs.has('section-alignment')?'center':'left');
  root.style.setProperty('--image-radius',fs.has('image-shapes')?'24px':'var(--visual-radius,30px)');
  root.style.setProperty('--letter-spacing',fs.has('letter-spacing')?'-0.02em':'normal');
  root.style.setProperty('--line-height',fs.has('line-height')?'1.9':'1.7');

  const gallery=document.querySelector('.template-gallery'), sections=document.querySelector('.sections'), hero=document.querySelector('.hero'), dyn=document.querySelector('#zapifyDynamicSections');
  if(gallery){
   gallery.classList.toggle('gallery-masonry',fs.has('gallery-layout')&&fs.has('masonry-gallery'));
   gallery.classList.toggle('gallery-featured',fs.has('gallery-layout')&&!fs.has('masonry-gallery'));
   gallery.style.setProperty('--gallery-columns',fs.has('gallery-columns')?'4':'5');
   gallery.style.setProperty('--gallery-gap',fs.has('gallery-gap')?'10px':'14px');
   if(fs.has('gallery-placement')&&dyn) main.appendChild(gallery);
  }
  document.querySelectorAll('.gallery-slot').forEach((el,i)=>{
   el.style.objectPosition=cfg.imagePosition||'center';
   el.style.backgroundPosition=cfg.imagePosition||'center';
   el.classList.toggle('captioned',fs.has('gallery-captions'));
   if(fs.has('gallery-captions')&&!el.querySelector('.gallery-caption')){const c=document.createElement('span');c.className='gallery-caption';c.textContent='Memory '+(i+1);el.appendChild(c)}
  });
  if(fs.has('gallery-lightbox')){
   document.querySelectorAll('.gallery-slot').forEach(el=>{el.onclick=()=>{const bg=getComputedStyle(el).backgroundImage;if(!bg||bg==='none')return;const m=bg.match(/url\(["']?(.*?)["']?\)/);if(!m)return;const o=document.createElement('div');o.className='zapify-lightbox';o.innerHTML='<button aria-label="Close">×</button><img alt="Gallery image">';o.querySelector('img').src=m[1];o.onclick=e=>{if(e.target===o||e.target.tagName==='BUTTON')o.remove()};document.body.appendChild(o)}})
  }
  if(fs.has('before-after-images')&&gallery&&!gallery.querySelector('.before-after')){
   const b=document.createElement('div');b.className='before-after';b.innerHTML='<span>BEFORE</span><span>AFTER</span>';gallery.prepend(b);
  }
  if(fs.has('scroll-to-top')&&!document.getElementById('zapifyTop')){const b=document.createElement('button');b.id='zapifyTop';b.type='button';b.textContent='↑';b.onclick=()=>scrollTo({top:0,behavior:'smooth'});document.body.appendChild(b)}
  const oldForm=document.getElementById('zapifyContactForm');if(oldForm)oldForm.remove();
  if(fs.has('contact-form')||fs.has('contact-section')){
   const contact=document.querySelector('.dynamic-contact');if(contact){const form=document.createElement('form');form.id='zapifyContactForm';form.className='zapify-contact-form';form.innerHTML='<input required placeholder="Name"><input required type="email" placeholder="Email"><textarea required placeholder="Message"></textarea><button class="cta" type="submit">Send enquiry</button><small class="form-status"></small>';form.onsubmit=e=>{e.preventDefault();form.querySelector('.form-status').textContent='Thanks — your enquiry is ready to send.'};contact.appendChild(form)}
  }
  document.querySelectorAll('.dynamic-faq').forEach(el=>{el.innerHTML='<span class="eyebrow">FAQ</span><h2>Frequently asked questions</h2><details><summary>What is included?</summary><p>The selected website design and the features shown in your customisation.</p></details><details><summary>Can I update content later?</summary><p>Yes. Content and images can be updated as part of the selected service.</p></details>'});
  if(fs.has('pricing-section'))document.querySelectorAll('.dynamic-pricing').forEach(el=>{el.innerHTML='<span class="eyebrow">PRICING</span><h2>Simple options</h2><div class="feature-price-row"><b>Starter</b><b>Basic</b><b>Premium</b></div>'});
  if(fs.has('animated-counters'))document.querySelectorAll('.tile').forEach((el,i)=>{if(!el.querySelector('.counter')){const c=document.createElement('strong');c.className='counter';c.textContent=(i+1)*25+'+';el.prepend(c)}});
  if(fs.has('social-links')){const foot=document.querySelector('.footer');if(foot&&!foot.querySelector('.social-links')){const s=document.createElement('div');s.className='social-links';s.innerHTML='<a href="'+(cfg.instagram||'#')+'">Instagram</a><a href="'+(cfg.facebook||'#')+'">Facebook</a><a href="'+(cfg.tiktok||'#')+'">TikTok</a><a href="'+(cfg.youtube||'#')+'">YouTube</a>';foot.appendChild(s)}}
  if(fs.has('booking-url')&&cfg.bookingUrl){document.querySelectorAll('.cta').forEach(a=>{a.href=cfg.bookingUrl;a.target='_blank';a.rel='noopener'})}
  if(fs.has('google-url')&&cfg.mapsUrl){document.querySelectorAll('.dynamic-contact,.hero-panel').forEach(el=>{if(!el.querySelector('.maps-link')){const a=document.createElement('a');a.className='cta maps-link';a.href=cfg.mapsUrl;a.target='_blank';a.rel='noopener';a.textContent='Open in Google Maps ↗';el.appendChild(a)}})}
  if(fs.has('whatsapp-button')&&cfg.whatsapp){const n=cfg.whatsapp.replace(/\D/g,'');if(n){let w=document.getElementById('zapifyWhatsapp');if(!w){w=document.createElement('a');w.id='zapifyWhatsapp';document.body.appendChild(w)}w.href='https://wa.me/'+n;w.target='_blank';w.rel='noopener';w.textContent='WhatsApp'}} 
  if(fs.has('sticky-navigation'))document.body.classList.add('feature-sticky-navigation');
  if(fs.has('smooth-scroll'))document.documentElement.style.scrollBehavior='smooth';
  if(fs.has('hover-effects'))document.body.classList.add('feature-hover-effects');
  if(fs.has('gradient-backgrounds'))document.body.classList.add('feature-gradient-backgrounds');
  if(fs.has('pattern-background'))document.body.classList.add('feature-pattern-background');
  if(fs.has('advanced-background'))document.body.classList.add('feature-gradient-backgrounds');
  if(fs.has('custom-loader')&&!document.getElementById('zapifyLoader')){const l=document.createElement('div');l.id='zapifyLoader';l.textContent='Loading…';document.body.appendChild(l);requestAnimationFrame(()=>setTimeout(()=>l.remove(),350))}
  if(fs.has('cursor-effect'))document.body.classList.add('feature-cursor-effect');
  if(fs.has('premium-mobile-layout'))document.body.classList.add('feature-premium-mobile-layout');
  if(fs.has('page-transition'))document.body.classList.add('feature-page-transition');
  if(fs.has('scroll-animations'))document.body.classList.add('feature-scroll-animations');
  if(fs.has('video-hero'))document.body.classList.add('feature-video-hero');
  if(fs.has('card-styling'))document.body.classList.add('feature-card-styling');
  if(fs.has('custom-borders')||fs.has('border-style'))document.body.classList.add('feature-border-style');
  if(fs.has('image-overlay'))document.body.classList.add('feature-image-overlay');
  if(fs.has('section-colours'))document.body.classList.add('feature-section-colours');
  if(fs.has('section-divider'))document.body.classList.add('feature-section-divider');
  if(fs.has('text-blocks')||fs.has('custom-text'))document.body.classList.add('feature-text-blocks');
  if(fs.has('service-cards'))document.body.classList.add('feature-service-cards');
  if(fs.has('custom-headings'))document.body.classList.add('feature-custom-headings');
  if(fs.has('footer-design'))document.body.classList.add('feature-footer-design');
  if(fs.has('image-size'))document.body.classList.add('feature-image-size');
  if(fs.has('logo-placement'))document.body.classList.add('feature-logo-placement');
  if(fs.has('hero-image-design'))document.body.classList.add('feature-hero-image-design');
  if(fs.has('gallery-filter'))document.body.classList.add('feature-gallery-filter');
  if(fs.has('accordion-content'))document.body.classList.add('feature-accordion-content');
  if(fs.has('social-sharing'))document.body.classList.add('feature-social-sharing');
  if(fs.has('open-graph'))document.body.classList.add('feature-open-graph');
  if(fs.has('seo-setup'))document.body.classList.add('feature-seo-setup');
  if(fs.has('analytics-tracking'))document.body.classList.add('feature-analytics-tracking');
  if(fs.has('section-order')){
   const order=cfg.sectionOrder||['hero','sections','gallery','dynamic'];
   const map={hero,sections,gallery,dynamic:document.querySelector('#zapifyDynamicSections')};
   order.forEach(k=>{if(map[k])main.appendChild(map[k])});
  }
 }
 function apply(cfg={}){
  const p=(presets[type]||[])[Number(cfg.preset||0)]||(presets[type]||[])[0];if(!p)return;const r=document.documentElement;
  const accent=cfg.accentColor||cfg.primaryColor||p.accent,bg=cfg.backgroundColor||p.bg,ink=cfg.textColor||p.ink;
  r.style.setProperty('--tpl-accent',accent);r.style.setProperty('--tpl-secondary',cfg.secondaryColor||bg);r.style.setProperty('--tpl-bg',bg);r.style.setProperty('--tpl-ink',ink);r.style.setProperty('--tpl-button',cfg.buttonColor||accent);r.style.setProperty('--tpl-body',cfg.fontFamily||'Inter,system-ui,sans-serif');r.style.setProperty('--tpl-heading',cfg.headingFont||cfg.fontFamily||'Inter,system-ui,sans-serif');r.style.setProperty('--tpl-font-size',(cfg.fontSize||16)+'px');r.style.setProperty('--card-radius',(cfg.radius??22)+'px');r.style.setProperty('--tpl-shadow',`0 18px 50px rgba(0,0,0,${Math.max(0,Math.min(80,cfg.shadow??40))/100*.45})`);r.style.setProperty('--tpl-spacing',((cfg.spacing||10)/10));r.style.setProperty('--hero-overlay-alpha',String((cfg.heroOverlay??35)/100));
  body.className=[...body.classList].filter(x=>!x.startsWith('feature-')&&!x.startsWith('nav-')).join(' ');(cfg.features||[]).forEach(f=>{const id=typeof f==='string'?f:f.id;if(id)body.classList.add('feature-'+id)});body.classList.toggle('no-animations',cfg.animations===false);body.classList.toggle('sticky-nav',cfg.stickyNav!==false);body.classList.toggle('transparent-header',!!cfg.transparentHeader);body.classList.add('nav-'+(cfg.navStyle||'minimal'),'hero-layout-'+(cfg.heroLayout||'split'),'button-'+(cfg.buttonStyle||'pill'),'nav-position-'+(cfg.navPosition||'top'));r.style.setProperty('--button-radius',cfg.buttonStyle==='square'?'4px':cfg.buttonStyle==='rounded'?'12px':cfg.buttonStyle==='outline'?'12px':'999px');
  document.querySelectorAll('[data-brand]').forEach(e=>{if(cfg.business)e.textContent=cfg.business});document.querySelectorAll('[data-headline]').forEach(e=>{if(cfg.headline)e.textContent=cfg.headline});document.querySelectorAll('[data-services]').forEach(e=>{if(cfg.services)e.textContent=cfg.services});document.querySelectorAll('[data-about]').forEach(e=>{if(cfg.about)e.textContent=cfg.about});document.querySelectorAll('[data-cta]').forEach(e=>{if(cfg.cta)e.textContent=cfg.cta;e.href=cfg.bookingUrl||e.getAttribute('href')});
  if(cfg.logoImage){document.querySelectorAll('.logo').forEach(e=>{e.textContent='';e.style.background=`url("${cfg.logoImage}") center/contain no-repeat`;e.style.minHeight='44px';e.style.minWidth='150px'})}
  const imgs=[...(cfg.images||[])];slots.forEach((e,i)=>{const img=imgs[i];e.style.backgroundImage=img?`url("${img}")`:defaults[i]||'';e.style.backgroundSize='cover';e.style.backgroundPosition=cfg.imagePosition||'center';e.classList.toggle('has-image',!!img)});if(hero){hero.style.backgroundImage=cfg.heroImage?`url("${cfg.heroImage}")`:heroDefault;hero.style.backgroundPosition=cfg.imagePosition||'center'}
  document.querySelectorAll('.sections .tile').forEach((e,i)=>{const visible=i===0?cfg.showServices:(i===1?cfg.showAbout:cfg.showContact);e.style.display=visible===false?'none':''});document.querySelector('.template-gallery')?.style.setProperty('display',cfg.showGallery===false?'none':'');
  const existing=document.getElementById('zapifyDynamicSections');if(existing)existing.remove();const wrap=document.createElement('section');wrap.id='zapifyDynamicSections';wrap.className='sections zapify-dynamic';const defs=[['showAbout','About','about'],['showTestimonials','Testimonials','testimonials'],['showFaq','FAQ','faq'],['showPricing','Pricing','pricing'],['showContact','Contact','contact'],['showNewsletter','Newsletter','newsletter'],['showBlog','Latest news','blog'],['showTimeline','Timeline','timeline']];defs.forEach(([flag,title,kind])=>{const featureMap={showTestimonials:'testimonial-section',showFaq:'faq-section',showPricing:'pricing-section',showContact:'contact-section',showNewsletter:'newsletter-section',showBlog:'blog-section',showTimeline:'timeline-section'};if(cfg[flag]||has(featureMap[flag])){const a=document.createElement('article');a.className='tile dynamic-'+kind;a.innerHTML=`<span class="eyebrow">${esc(title)}</span><h2>${esc(cfg.business||'Your website')}</h2><p>${kind==='contact'?'Send an enquiry, call or message us.':kind==='pricing'?'Flexible options can be presented here.':kind==='faq'?'Frequently asked questions can be published here.':kind==='timeline'?'A chronological story can be displayed here.':kind==='blog'?'News, updates and articles can be published here.':kind==='newsletter'?'Join the newsletter for updates.':kind==='testimonials'?'“Beautiful experience.” · “Exactly what we wanted.”':'Tell your story and give visitors useful information.'}</p>`;wrap.appendChild(a)}});if(wrap.children.length)document.querySelector('main')?.appendChild(wrap);
  let footer=document.querySelector('.brand-credit');if(footer&&cfg.footerText)footer.textContent=cfg.footerText;
  const old=document.getElementById('zapifyCustomCss');if(old)old.remove();if(cfg.customCss){const s=document.createElement('style');s.id='zapifyCustomCss';s.textContent=cfg.customCss.slice(0,10000);document.head.appendChild(s)}
  const oldMeta=document.getElementById('zapifySeoDescription');if(oldMeta)oldMeta.remove();if(cfg.seoDescription){const m=document.createElement('meta');m.id='zapifySeoDescription';m.name='description';m.content=cfg.seoDescription;document.head.appendChild(m)}if(cfg.seoTitle)document.title=cfg.seoTitle;if(cfg.noIndex){let m=document.querySelector('meta[name="robots"]');if(!m){m=document.createElement('meta');document.head.appendChild(m)}m.content='noindex,nofollow'}if(cfg.analyticsId&&!document.getElementById('zapifyAnalytics')){const ga=document.createElement('script');ga.id='zapifyAnalytics';ga.async=true;ga.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(cfg.analyticsId);document.head.appendChild(ga);const gs=document.createElement('script');gs.textContent=`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(cfg.analyticsId)})`;document.head.appendChild(gs)}if(cfg.ogImage){let og=document.getElementById('zapifyOgImage');if(!og){og=document.createElement('meta');og.id='zapifyOgImage';og.setAttribute('property','og:image');document.head.appendChild(og)}og.content=cfg.ogImage}if(cfg.faviconImage){let l=document.getElementById('zapifyFavicon');if(!l){l=document.createElement('link');l.id='zapifyFavicon';l.rel='icon';document.head.appendChild(l)}l.href=cfg.faviconImage}
  applyFeatureBehaviors(cfg);if(type==='scrapbook')renderScrapbook(cfg);
  const whatsapp=cfg.whatsappButton&&cfg.whatsapp?cfg.whatsapp.replace(/\D/g,''):'';let wb=document.getElementById('zapifyWhatsapp');if(wb)wb.remove();if(whatsapp){wb=document.createElement('a');wb.id='zapifyWhatsapp';wb.href=`https://wa.me/${whatsapp}`;wb.target='_blank';wb.rel='noopener';wb.textContent='WhatsApp';document.body.appendChild(wb)}
 }
 function renderScrapbook(cfg){let host=document.getElementById('zapifyScrapPages');if(!host){host=document.createElement('div');host.id='zapifyScrapPages';host.className='scrapbook-pages';document.querySelector('.scrap')?.appendChild(host)}host.innerHTML='';const pages=cfg.scrapbook?.pages||[];const title=cfg.scrapbook?.title||cfg.business||'Your Story';document.querySelectorAll('[data-headline]').forEach(e=>{if(cfg.headline)e.textContent=cfg.headline});pages.forEach((p,i)=>{const el=document.createElement('article');el.className='scrap-page-preview'+(p.private?' is-private':'');el.innerHTML=`<div class="scrap-page-head"><span>${esc(p.category||'Memory')}</span><b>${esc(p.date||'')}</b></div><h2>${esc(p.title||`Memory ${i+1}`)}</h2><p>${esc(p.text||'')}</p>${p.location?`<small>⌖ ${esc(p.location)}</small>`:''}${p.sticker?`<span class="page-sticker">${esc(p.sticker)}</span>`:''}<div class="page-photos"></div></article>`;const photo=el.querySelector('.page-photos');(p.images||[]).forEach(src=>{const im=document.createElement('img');im.src=src;im.alt='Memory photo';photo.appendChild(im)});host.appendChild(el)});if(!pages.length)host.innerHTML=`<article class="scrap-page-preview"><h2>${esc(title)}</h2><p>Add memories from the editor.</p></article>`}
 let data={};try{data=JSON.parse(localStorage.getItem('zapifyTemplatePreview')||'{}')}catch{}apply(data);window.addEventListener('message',e=>{if(e.data?.type==='zapify-preview')apply(e.data.config||{})});window.ZAPIFY_TEMPLATE_PRESETS=presets[type]||[];
})();
