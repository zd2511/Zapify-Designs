(()=>{
 const loader=document.querySelector('.loader'),pct=document.querySelector('#loadPct'),nav=document.querySelector('.photo-nav');
 let n=0;
 const timer=setInterval(()=>{n=Math.min(100,n+Math.round(Math.random()*16+7));if(pct)pct.textContent=n+'%';if(n>=100){clearInterval(timer);setTimeout(()=>loader?.classList.add('done'),450)}},130);
 addEventListener('scroll',()=>nav?.classList.toggle('scrolled',scrollY>30),{passive:true});
 const menu=document.querySelector('.photo-menu');
 menu?.addEventListener('click',()=>{const nav=document.querySelector('.photo-nav nav');nav?.classList.toggle('open');if(nav?.classList.contains('open')){nav.style.display='grid';nav.style.position='absolute';nav.style.top='70px';nav.style.right='20px';nav.style.background='#111';nav.style.padding='15px';nav.style.border='1px solid #333'}});
 const frames=[...document.querySelectorAll('.frame')]; const camera=document.querySelector('.real-camera'); const progress=document.querySelector('.story-progress span');
 addEventListener('scroll',()=>{const y=scrollY;frames.forEach((f,i)=>{const r=f.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));f.style.transform=`translateY(${(p-.5)*-35}px) rotate(${[-4,3,-1][i]}deg) scale(${1+p*.045})`; if(progress) progress.style.height=(p*100)+'%'})},{passive:true});
 document.querySelector('#photoForm')?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget);const text=`Hi Zapify Designs! Photography enquiry.%0AName: ${encodeURIComponent(d.get('name'))}%0APhone: ${encodeURIComponent(d.get('phone'))}%0AShoot: ${encodeURIComponent(d.get('type'))}%0AMessage: ${encodeURIComponent(d.get('message')||'')}`;open(`https://wa.me/27743899657?text=${text}`,'_blank','noopener')});
})();

addEventListener('scroll',()=>{if(!camera)return; const y=scrollY; const tilt=Math.max(-9,Math.min(9,(y/innerHeight)*7)); const lift=Math.min(90,y*.08); camera.style.transform=`translate3d(0,${-lift}px,0) rotate(${-5+tilt*.35}deg) rotateY(${-8+tilt}deg)`; camera.classList.toggle('focused',(y%900)>520)}, {passive:true});
