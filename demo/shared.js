(()=>{
 const nav=document.querySelector('.demo-nav');
 addEventListener('scroll',()=>nav?.classList.toggle('scrolled',scrollY>30),{passive:true});
 const menu=document.querySelector('.demo-menu'),mobile=document.querySelector('.demo-mobile');
 menu?.addEventListener('click',()=>mobile?.classList.toggle('open'));
 mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')));
 const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')),{threshold:.12});
 document.querySelectorAll('.reveal').forEach(e=>obs.observe(e));
 if(matchMedia('(pointer:fine)').matches){
  const dot=document.createElement('i'),ring=document.createElement('i');
  dot.className='cursor';ring.className='cursor-ring';document.body.append(dot,ring);
  addEventListener('pointermove',e=>{dot.style.left=ring.style.left=e.clientX+'px';dot.style.top=ring.style.top=e.clientY+'px'},{passive:true});
  document.querySelectorAll('a,button,.card').forEach(e=>{
   e.addEventListener('mouseenter',()=>ring.classList.add('hover'));
   e.addEventListener('mouseleave',()=>ring.classList.remove('hover'));
  });
 }
})();
