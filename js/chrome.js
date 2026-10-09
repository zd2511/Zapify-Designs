/* Zapify shared chrome: mobile menu, active link, header state, scroll animations */
(()=>{
  const d=document, root=d.documentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- header: scrolled state + progress bar
  const header=d.querySelector('.zx-header'), bar=d.querySelector('.zx-progress');
  const onScroll=()=>{
    const y=scrollY;
    header&&header.classList.toggle('is-scrolled',y>8);
    if(bar){const h=root.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')'}
  };
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // ---- mobile menu
  const menu=d.querySelector('.zx-menu'), links=d.querySelector('.zx-links');
  const setMenu=open=>{
    if(!menu||!links)return;
    links.classList.toggle('open',open);
    menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
  };
  menu&&menu.addEventListener('click',()=>setMenu(!links.classList.contains('open')));
  links&&links.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
  d.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
  addEventListener('resize',()=>{if(innerWidth>940)setMenu(false)});

  // ---- mark current page
  const here=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const inProducts=/\/products\//.test(location.pathname);
  d.querySelectorAll('.zx-links a:not(.zx-cta-mobile)').forEach(a=>{
    const f=(a.getAttribute('href')||'').split('#')[0].split('/').pop().toLowerCase();
    if(f&&f===here&&!inProducts)a.setAttribute('aria-current','page');
  });
  if(inProducts)d.querySelectorAll('.zx-links a[href$="projects.html"]').forEach(a=>a.setAttribute('aria-current','page'));

  // ---- scroll reveal
  const groups=[
    ['.hero-copy','left'],['.hero-art','right'],
    ['.page-intro .wrap > *','up'],['.page-hero .wrap > *, .page-hero > *','up'],
    ['.section-head > *','up'],['.split > *','up'],
    ['.grid > *, .project-grid > *, .service-list > *, .tool-card, .product-card','up'],
    ['.tech-grid > *','zoom'],['.pill-list > *','zoom'],
    ['.cta-band','zoom'],['.table-wrap','up'],['.form','up'],
    ['.service-group .group-intro','up'],
    ['.zx-footer-grid > *','up']
  ];
  const seen=new Set();
  const targets=[];
  groups.forEach(([sel,kind])=>{
    d.querySelectorAll(sel).forEach(el=>{
      if(seen.has(el)||el.classList.contains('reveal')||el.closest('.zx-header'))return;
      seen.add(el);
      el.setAttribute('data-zx',kind);
      // stagger among siblings (max 6 steps)
      const sibs=[...el.parentElement.children].filter(c=>seen.has(c));
      el.style.setProperty('--zd',Math.min(sibs.indexOf(el),6)*.08+'s');
      targets.push(el);
    });
  });
  if(reduce||!('IntersectionObserver' in window)||!targets.length)return;
  root.classList.add('zx-anim');
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target;io.unobserve(el);
    el.classList.add('zx-in');
    setTimeout(()=>el.classList.add('zx-done'),1100); // drop delay so hover transitions stay snappy
  }),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  targets.forEach(el=>io.observe(el));
  // safety net: never leave content hidden
  setTimeout(()=>targets.forEach(el=>{if(!el.classList.contains('zx-in')&&el.getBoundingClientRect().top<innerHeight)el.classList.add('zx-in')}),1500);
})();
