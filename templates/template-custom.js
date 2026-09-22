(()=>{
const body=document.body;
const type=body.dataset.template||"salon";
const presets={
salon:[{accent:"#e32976",bg:"#fff2f7",ink:"#19191f"},{accent:"#789b88",bg:"#f1f7f2",ink:"#17221b"},{accent:"#111111",bg:"#f2f2f3",ink:"#111111"}],
mechanic:[{accent:"#ffb44c",bg:"#111a20",ink:"#ffffff"},{accent:"#ef4b45",bg:"#211619",ink:"#ffffff"},{accent:"#38bdf8",bg:"#0d1820",ink:"#ffffff"}],
restaurant:[{accent:"#f5d2aa",bg:"#3b1515",ink:"#ffffff"},{accent:"#d7d8a0",bg:"#27301f",ink:"#ffffff"},{accent:"#d9b7ff",bg:"#211a2b",ink:"#ffffff"}],
photographer:[{accent:"#111111",bg:"#f1f1f1",ink:"#111111"},{accent:"#ff7fb8",bg:"#fff1f7",ink:"#22151c"},{accent:"#72a7ff",bg:"#eef4ff",ink:"#101827"}],
construction:[{accent:"#f4c84a",bg:"#202a22",ink:"#ffffff"},{accent:"#ff7b36",bg:"#2c211c",ink:"#ffffff"},{accent:"#63b3ed",bg:"#152433",ink:"#ffffff"}],
scrapbook:[{accent:"#e95f9f",bg:"#fff8fb",ink:"#2b1e27"},{accent:"#e5a72b",bg:"#fff8df",ink:"#332a18"},{accent:"#3d8fc7",bg:"#edf8ff",ink:"#182a36"}]
};
function apply(data){
 const c=(presets[type]||[])[Number(data.preset||0)]||presets[type]?.[0];
 if(!c)return;
 document.documentElement.style.setProperty("--tpl-accent",c.accent);
 document.documentElement.style.setProperty("--tpl-bg",c.bg);
 document.documentElement.style.setProperty("--tpl-ink",c.ink);
 if(data.fontFamily)document.body.style.fontFamily=data.fontFamily;
 document.querySelectorAll("[data-brand]").forEach(e=>e.textContent=data.business||e.textContent);
 document.querySelectorAll("[data-headline]").forEach(e=>{if(data.headline)e.textContent=data.headline});
 document.querySelectorAll("[data-services]").forEach(e=>{if(data.services)e.textContent=data.services});
 document.querySelectorAll("[data-about]").forEach(e=>{if(data.about)e.textContent=data.about});
 document.querySelectorAll("[data-cta]").forEach(e=>{if(data.cta)e.textContent=data.cta});
 document.querySelectorAll("[data-accent]").forEach(e=>{e.style.background=c.accent;e.style.color=["#fff","#ffffff"].includes(c.accent)?"#111":"#fff"});
 document.querySelectorAll("[data-hero]").forEach(e=>{e.style.backgroundColor=c.bg;e.style.color=c.ink});
 document.querySelectorAll("[data-progress]").forEach(e=>e.style.background=c.accent);
 const imgs=[...(data.images||[])];
 document.querySelectorAll("[data-upload-slot]").forEach((e,i)=>{
   const img=imgs[i];
   if(img){e.style.backgroundImage=`url("${img}")`;e.style.backgroundSize="cover";e.style.backgroundPosition="center";e.textContent="";e.classList.add("has-image")}
 });
 if(type==="scrapbook"){
   const gallery=document.querySelector("[data-extra-gallery]");
   if(gallery){
     gallery.innerHTML="";
     (data.extraImages||[]).filter(Boolean).forEach((img,i)=>{
       const el=document.createElement("div");el.className="gallery-slot has-image";el.style.backgroundImage=`url("${img}")`;el.setAttribute("aria-label",`Additional scrapbook image ${i+1}`);gallery.appendChild(el);
     });
   }
   const featureCount=(data.features||[]).length;
   const note=document.querySelector("[data-feature-count]");
   if(note)note.textContent=featureCount?`${featureCount} custom feature${featureCount===1?"":"s"} selected`:"Standard scrapbook layout";
 }
}
let data={};
try{data=JSON.parse(localStorage.getItem("zapifyTemplatePreview")||"{}")}catch(e){}
apply(data);
window.addEventListener("message",e=>{if(e.data?.type==="zapify-preview"){data={...data,...(e.data.config||{})};apply(data)}});
window.ZAPIFY_TEMPLATE_PRESETS=presets[type]||[];
})();