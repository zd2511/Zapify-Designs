
document.addEventListener('DOMContentLoaded',()=>{
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  const current=(location.pathname.split('/').pop()||'index.html');
  document.querySelectorAll('.nav-track a').forEach(a=>{if(a.getAttribute('href')===current)a.classList.add('active')});
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('pointermove',e=>{if(innerWidth<800)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*6}deg) translateY(-5px)`});
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });
  const form=document.querySelector('#contactForm');
  if(form)form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const body=encodeURIComponent(`Hello Zapify Designs, I would like to make an enquiry.\nName: ${d.get('name')}\nEmail: ${d.get('email')}\nService: ${d.get('service')}\nProject details: ${d.get('message')}`);window.open(`https://wa.me/27743899657?text=${body}`,'_blank','noopener,noreferrer')});
});
