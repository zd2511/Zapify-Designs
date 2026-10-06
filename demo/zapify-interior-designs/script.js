const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.animate([{opacity:0,transform:"translateY(24px)"},{opacity:1,transform:"none"}],{duration:700,easing:"cubic-bezier(.2,.7,.2,1)",fill:"forwards"})}),{threshold:.12});document.querySelectorAll("section").forEach(s=>{s.style.opacity=0;io.observe(s)});document.querySelector(".menu")?.addEventListener("click",()=>document.querySelector("nav").classList.toggle("open"));
document.addEventListener('DOMContentLoaded',()=>{
 const els=document.querySelectorAll('section, .service-card, .project-card, .gallery-card, .value-card, .cta-card');
 els.forEach(el=>el.classList.add('reveal'));
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.12});
 els.forEach(el=>io.observe(el));
});
