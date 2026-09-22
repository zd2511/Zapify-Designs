const API_BASE=(window.ZAPIFY_API_BASE||'').replace(/\/$/,'');
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
let catalog = null;
let preset = 0;
let images = Array(5).fill(null);
let extraImages = [];
let heroImage = null;
let features = new Set();
let previewReady = false;

const defaults = {
  salon:{business:'Lumi Beauty',headline:'Beautiful hair, made personal.',services:'Hair · Colour · Styling',about:'Modern beauty, thoughtful service and a calm studio experience designed around every client.',cta:'Book an appointment ↗',font:'DM Sans, sans-serif'},
  mechanic:{business:'Vaal Auto',headline:'SERVICE YOU CAN TRUST.',services:'Diagnostics · Repairs · Fitment',about:'Practical automotive service for drivers who want clear answers, reliable workmanship and no-nonsense communication.',cta:'Book a service ↗',font:'DM Sans, sans-serif'},
  restaurant:{business:'Casa Vero',headline:'Good food. Good company.',services:'Lunch · Dinner · Events',about:'A warm restaurant concept built around seasonal plates, generous tables and memorable evenings.',cta:'Reserve a table ↗',font:'Georgia, serif'},
  photographer:{business:'Nova Studio',headline:'Stories, captured honestly.',services:'Portraits · Events · Brands',about:'An image-first portfolio for photographers whose work should do most of the talking.',cta:'View portfolio ↗',font:'Inter, system-ui, sans-serif'},
  construction:{business:'Build Vaal',headline:'BUILT WITH PURPOSE.',services:'Renovations · Building · Projects',about:'A structured construction concept for teams that need to communicate capability, process and trust clearly.',cta:'Request a quote ↗',font:'DM Sans, sans-serif'},
  scrapbook:{business:'Your Story',headline:'Your story deserves a place to live.',services:'Photos · Notes · Moments',about:'A warm, layered digital scrapbook for birthdays, milestones, family memories, travel, personal stories and creative projects.',cta:'Save the memories ↗',font:'Georgia, serif'}
};

const presetMap = {
  salon:[['Blush','#e32976','#fff2f7','#19191f'],['Sage','#789b88','#f1f7f2','#17221b'],['Noir','#111111','#f2f2f3','#111111']],
  mechanic:[['Volt','#ffb44c','#111a20','#ffffff'],['Redline','#ef4b45','#211619','#ffffff'],['Electric','#38bdf8','#0d1820','#ffffff']],
  restaurant:[['Terracotta','#c56d4a','#f7eee7','#241713'],['Olive','#89956a','#f2f4e9','#20251a'],['Midnight','#9c7bd9','#17131e','#ffffff']],
  photographer:[['Mono','#111111','#f1f1f1','#111111'],['Rose','#d76a91','#fff1f7','#22151c'],['Cobalt','#4f78c8','#eef4ff','#101827']],
  construction:[['Safety','#e0ad2e','#202a22','#ffffff'],['Orange','#e56e32','#2c211c','#ffffff'],['Signal Blue','#4f8ebc','#152433','#ffffff']],
  scrapbook:[['Candy','#d65d92','#fff8fb','#2b1e27'],['Sunny','#d29b2f','#fff8df','#332a18'],['Ocean','#3f83a7','#edf8ff','#182a36']]
};

async function loadCatalog(){
  const r=await fetch(API_BASE+'/api/catalog',{cache:'no-store'});
  if(!r.ok) throw new Error('Pricing service unavailable. Start the Zapify server with npm start.');
  catalog=await r.json();
}
function currentTemplate(){return $('template').value}
function applyDefaults(){const d=defaults[currentTemplate()];$('business').value=d.business;$('headline').value=d.headline;$('services').value=d.services;$('about').value=d.about;$('cta').value=d.cta;$('fontFamily').value=d.font}
function renderPresets(){
  const map=presetMap[currentTemplate()]||[];
  $('presets').innerHTML=map.map((p,i)=>`<button type="button" class="preset ${i===preset?'active':''}" data-i="${i}" aria-label="${p[0]} colour preset"><span class="swatches"><i style="background:${p[1]}"></i><i style="background:${p[2]}"></i><i style="background:${p[3]}"></i></span><b>${p[0]}</b><small>${p[1]} · ${p[2]}</small></button>`).join('');
  $('presets').querySelectorAll('.preset').forEach(b=>b.onclick=()=>{preset=Number(b.dataset.i);$('customPalette').checked=false;features.delete('custom-palette');renderPresets();renderAddons();send()});
}
function readImage(file,cb){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)||file.size>5*1024*1024){alert('Please upload a JPG, PNG, WebP or AVIF image under 5MB.');return}
  const r=new FileReader();r.onload=()=>cb(r.result);r.readAsDataURL(file);
}
function renderUploads(){
  const box=$('uploads');box.innerHTML='';
  images.forEach((v,i)=>{
    const row=document.createElement('div');row.className='upload-row';row.innerHTML=`<label>Image ${i+1}${i===0?' · main image':''}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif"></label><button class="remove" type="button">Remove</button>`;
    box.appendChild(row);row.querySelector('input').onchange=()=>readImage(row.querySelector('input').files[0],val=>{images[i]=val;send()});row.querySelector('.remove').onclick=()=>{images[i]=null;send()};
  });
  extraImages.forEach((v,j)=>{
    const row=document.createElement('div');row.className='upload-row';row.innerHTML=`<label>Image ${6+j}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif"></label><button class="remove" type="button">Remove</button>`;
    box.appendChild(row);row.querySelector('input').onchange=()=>readImage(row.querySelector('input').files[0],val=>{extraImages[j]=val;send()});row.querySelector('.remove').onclick=()=>{extraImages.splice(j,1);renderUploads();send()};
  });
  updatePrice();
}
function renderAddons(){
  if(!catalog)return;
  const applicable=catalog.addons.filter(a=>a.id!=='custom-palette'&&(a.templates==='all'||a.templates.includes(currentTemplate())));
  const groups={design:'Design',images:'Images',content:'Content',functionality:'Functionality',privacy:'Privacy',premium:'Premium',scrapbook:'Scrapbook'};
  $('addons').innerHTML=Object.entries(groups).map(([key,label])=>{
    const list=applicable.filter(a=>a.category===key);if(!list.length)return '';
    return `<div class="addon-group"><h3>${label}</h3>${list.map(a=>`<label class="addon"><input type="checkbox" data-id="${a.id}" ${features.has(a.id)?'checked':''}><span><b>${a.name}</b><small>${a.description}</small></span><strong>+R${a.price}</strong></label>`).join('')}</div>`;
  }).join('');
  $('addons').querySelectorAll('input[data-id]').forEach(x=>x.onchange=()=>{x.checked?features.add(x.dataset.id):features.delete(x.dataset.id);renderCustomPaletteState();send()});
  renderCustomPaletteState();
}
function renderCustomPaletteState(){
  const enabled=features.has('custom-palette');$('customPaletteControls').classList.toggle('disabled',!enabled);$('customPaletteControls').querySelectorAll('input').forEach(x=>x.disabled=!enabled);
}
function getCustomColors(){return {accent:$('customAccent').value,bg:$('customBg').value,ink:$('customInk').value}}
function config(){
  return {template:currentTemplate(),preset,business:$('business').value,headline:$('headline').value,services:$('services').value,about:$('about').value,cta:$('cta').value,fontFamily:$('fontFamily').value,imagePosition:$('imagePosition').value,images:images.filter(Boolean),extraImages:extraImages.filter(Boolean),heroImage,features:[...features].map(id=>({id})),customColors:getCustomColors()};
}
function calculate(){
  const included=catalog?.imagesIncluded||5,totalImages=images.filter(Boolean).length+extraImages.filter(Boolean).length,extra=Math.max(0,totalImages-included),imageTotal=extra*(catalog?.additionalImagePrice||15),selected=(catalog?.addons||[]).filter(a=>features.has(a.id)),addTotal=selected.reduce((s,a)=>s+a.price,0),base=catalog?.templates?.[currentTemplate()]?.price??100;
  return {extra,imageTotal,addTotal,base,total:base+imageTotal+addTotal,selected,totalImages};
}
function updatePrice(){
  if(!catalog)return;const x=calculate();
  $('imageCost').textContent=`${x.totalImages} image${x.totalImages===1?'':'s'} · 5 included · ${x.extra} additional × R15`;
  $('purchaseBase').textContent='R'+x.base;$('purchaseImages').textContent='R'+x.imageTotal;$('purchaseFeatures').textContent='R'+x.addTotal;$('purchaseTotal').textContent='R'+x.total;
  $('priceHint').textContent=`${x.totalImages<=5?'5 included images':'5 included + '+x.extra+' paid image'+(x.extra===1?'':'s')} · ${x.selected.length} paid feature${x.selected.length===1?'':'s'}`;
}
function send(){
  const c=config();localStorage.setItem('zapifyTemplatePreview',JSON.stringify(c));updatePrice();
  const frame=$('preview');if(frame?.contentWindow)frame.contentWindow.postMessage({type:'zapify-preview',config:c},'*');
}
function loadPreview(){
  const key=currentTemplate(),frame=$('preview');
  previewReady=false;
  frame.onload=()=>{previewReady=true;send();$('previewStatus').textContent='Live · changes update instantly';};
  frame.onerror=()=>{$('previewStatus').textContent='Preview could not be loaded.'};
  // Directly load the real template. srcdoc was removed because it could fail to resolve template assets/scripts in static deployments.
  frame.src=`templates/${encodeURIComponent(key)}.html?preview=1`;
}
function resetEditor(){
  preset=0;images=Array(5).fill(null);extraImages=[];heroImage=null;features=new Set();$('heroUpload').value='';$('customAccent').value='#d65d92';$('customBg').value='#fff8fb';$('customInk').value='#2b1e27';applyDefaults();renderPresets();renderUploads();renderAddons();loadPreview();updatePrice();
}
function openPurchase(){
  $('purchasePanel').open=true;$('purchasePanel').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>$('buyerName').focus(),350);
}
$('heroUpload').onchange=()=>readImage($('heroUpload').files[0],v=>{heroImage=v;features.add('hero-image');renderAddons();send()});
$('resetHero').onclick=()=>{heroImage=null;features.delete('hero-image');$('heroUpload').value='';renderAddons();send()};
$('template').onchange=resetEditor;
$('addImage').onclick=()=>{extraImages.push(null);renderUploads()};
$('customPalette').onchange=()=>{if($('customPalette').checked){features.add('custom-palette')}else features.delete('custom-palette');renderCustomPaletteState();send()};
['customAccent','customBg','customInk'].forEach(id=>$(id).addEventListener('input',send));
['business','headline','services','about','cta','fontFamily','imagePosition'].forEach(id=>$(id).addEventListener('input',send));
document.querySelectorAll('.device').forEach(b=>b.onclick=()=>{document.querySelectorAll('.device').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('preview').style.width=b.dataset.device==='mobile'?'430px':'100%';$('preview').style.maxWidth=b.dataset.device==='mobile'?'430px':'none';$('preview').style.margin=b.dataset.device==='mobile'?'0 auto':'0'});
$('buyTop').onclick=openPurchase;
$('purchaseForm').addEventListener('submit',async e=>{
  e.preventDefault();if(!catalog)return;
  const pay=$('payButton'),status=$('payStatus');pay.disabled=true;status.textContent='Connecting to Yoco…';
  const clientRequestId=sessionStorage.getItem('zapifyClientRequestId')||crypto.randomUUID();
  const payload={template:currentTemplate(),clientRequestId,customization:config(),customer:{name:$('buyerName').value.trim(),email:$('email').value.trim(),phone:$('phone').value.trim(),businessName:$('businessName').value.trim(),category:$('category').value.trim(),description:$('description').value.trim(),products:$('products').value.trim(),notes:$('notes').value.trim()}};
  sessionStorage.setItem('zapifyClientRequestId',clientRequestId);
  try{
    const r=await fetch(API_BASE+'/api/create-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||`Payment service error (${r.status}).`);
    if(!data.redirectUrl)throw new Error('Yoco did not return a payment page. Please try again.');
    sessionStorage.setItem('zapifyCheckoutId',data.checkoutId||'');sessionStorage.setItem('zapifyOrderReference',data.orderReference||'');
    status.textContent='Opening Yoco secure payment…';window.location.href=data.redirectUrl;
  }catch(err){status.textContent=err.message||'Payment could not be started.';pay.disabled=false}
});
(async()=>{
  try{
    await loadCatalog();
    $('template').value=params.get('template')||'salon';
    applyDefaults();renderPresets();renderUploads();renderAddons();updatePrice();loadPreview();
  }catch(e){
    // The editor remains usable for preview/customisation even without the payment API.
    // The server is only required for live pricing validation and Yoco checkout creation.
    catalog=window.ZAPIFY_CATALOG_FALLBACK||{templates:Object.fromEntries(Object.keys(defaults).map(k=>[k,{price:100,name:k}])),addons:[],imagesIncluded:5,additionalImagePrice:15};
    $('template').value=params.get('template')||'salon';applyDefaults();renderPresets();renderUploads();renderAddons();updatePrice();$('previewStatus').textContent='Preview mode · payment server not connected';loadPreview();
  }
})();
