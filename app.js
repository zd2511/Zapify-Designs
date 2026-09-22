(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  // Sticky header + active navigation
  const header = $('.site-header');
  const navLinks = $$('.desktop-nav a');
  const sections = $$('main section[id]');
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 18);
    let current = 'home';
    sections.forEach(section => { if (window.scrollY >= section.offsetTop - 160) current = section.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Mobile menu
  const menuButton = $('.menu-toggle'), mobileMenu = $('#mobile-menu');
  const closeMobile = () => {
    menuButton?.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false');
    mobileMenu?.classList.remove('open'); mobileMenu?.setAttribute('aria-hidden','true');
  };
  menuButton?.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    menuButton.classList.toggle('open', open); menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('open', open); mobileMenu.setAttribute('aria-hidden', String(!open));
  });
  $$('#mobile-menu a').forEach(a => a.addEventListener('click', closeMobile));

  // Scroll reveal
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }), {threshold:.12});
    revealItems.forEach(el => io.observe(el));
  } else revealItems.forEach(el => el.classList.add('visible'));

  // Service expanders
  $$('.service-open').forEach(button => button.addEventListener('click', () => {
    const card = button.closest('.service-card');
    const wasOpen = card.classList.contains('open');
    $$('.service-card.open').forEach(c => c.classList.remove('open'));
    card.classList.toggle('open', !wasOpen);
  }));

  // Quote prefill
  const serviceSelect = $('#service-select');
  const packageLinks = $$('[data-package]');
  const prefillLinks = $$('[data-prefill]');
  const setService = value => {
    if (!serviceSelect) return;
    serviceSelect.value = value;
    $('#contact')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto':'smooth'});
    setTimeout(() => serviceSelect.focus(), 500);
  };
  packageLinks.forEach(a => a.addEventListener('click', () => setTimeout(() => setService('Website'), 30)));
  prefillLinks.forEach(a => a.addEventListener('click', () => setTimeout(() => setService(a.dataset.prefill), 30)));
  $$('.service-quote').forEach(a => a.addEventListener('click', () => setTimeout(() => setService(a.dataset.prefill), 30)));

  // Quote form opens a WhatsApp enquiry — no pretend backend.
  $('#quote-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget, data = new FormData(form);
    const fields = [
      ['Service', data.get('service')], ['Name', data.get('name')], ['Business', data.get('business')],
      ['Email', data.get('email')], ['Phone / WhatsApp', data.get('phone')], ['Budget', data.get('budget')],
      ['Timeline', data.get('timeline')], ['Project', data.get('message')]
    ];
    const body = ['Hi Zapify Designs, I would like to request a quote.', '', ...fields.map(([k,v]) => `${k}: ${v || 'Not specified'}`)].join('\n');
    const url = 'https://wa.me/27743899657?text=' + encodeURIComponent(body);
    const status = $('#form-status');
    status.textContent = 'Opening WhatsApp with your enquiry…';
    window.open(url, '_blank', 'noopener');
  });

  // Lightweight structured FAQ chatbot. Replace answer() with a real API call later if desired.
  const chatToggle = $('.chat-toggle'), chatPanel = $('#chat-panel'), chatClose = $('.chat-close'), chatMessages = $('#chat-messages'), chatForm = $('#chat-form'), chatInput = $('#chat-input');
  const openChat = () => { chatPanel?.classList.add('open'); chatPanel?.setAttribute('aria-hidden','false'); chatToggle?.setAttribute('aria-expanded','true'); setTimeout(() => chatInput?.focus(), 120); };
  const closeChat = () => { chatPanel?.classList.remove('open'); chatPanel?.setAttribute('aria-hidden','true'); chatToggle?.setAttribute('aria-expanded','false'); };
  chatToggle?.addEventListener('click', () => chatPanel.classList.contains('open') ? closeChat() : openChat());
  chatClose?.addEventListener('click', closeChat);
  const addMessage = (text, who='bot') => { const div=document.createElement('div'); div.className=who==='user'?'user-message':'bot-message'; div.textContent=text; chatMessages.appendChild(div); chatMessages.scrollTop=chatMessages.scrollHeight; };
  const answer = q => {
    const s=q.toLowerCase();
    if (s.includes('price') || s.includes('cost') || s.includes('package')) return 'Website packages start at R800. Starter is R1,250, Premium R2,100 and Professional R3,500. Custom software and larger systems are quoted around scope.';
    if (s.includes('service')) return 'Zapify Designs offers website development, SEO, maintenance, hosting, analytics, marketing, automation, AI and custom software development.';
    if (s.includes('seo') || s.includes('google')) return 'SEO can include technical setup, on-page SEO, sitemaps, Search Console, Bing Webmaster Tools, local SEO foundations and monitoring. Rankings are never guaranteed.';
    if (s.includes('maintenance') || s.includes('fix') || s.includes('update')) return 'Yes. Maintenance can cover content updates, bug fixes, performance work, security checks, backups and ongoing support. Packages are quoted around the work.';
    if (s.includes('hosting') || s.includes('domain')) return 'We can assist with domain registration, DNS, hosting, deployment, SSL/HTTPS and business email setup.';
    if (s.includes('software') || s.includes('dashboard') || s.includes('crm')) return 'Yes. Custom work can include SaaS apps, dashboards, CRM-style systems, inventory, customer portals, databases and APIs.';
    if (s.includes('ai') || s.includes('automation') || s.includes('chatbot')) return 'We can build structured AI interfaces, chatbots and automated workflows. A real AI provider/API would need to be configured for live AI generation.';
    if (s.includes('quote') || s.includes('project') || s.includes('start')) { setTimeout(() => document.querySelector('#contact')?.scrollIntoView({behavior:'smooth'}), 250); return 'Absolutely. I can take you to the quote form. Tell us what you need and the form will prepare a WhatsApp enquiry.'; }
    if (s.includes('whatsapp') || s.includes('contact')) return 'You can WhatsApp Zapify Designs on 074 389 9657 or email zapifydesigns@gmail.com. You can also use the quote form on this page.';
    return 'I can help with services, pricing, SEO, maintenance, hosting, software, AI or starting a project. Try one of the suggested questions below.';
  };
  const handleChat = q => { if (!q.trim()) return; addMessage(q,'user'); chatInput.value=''; setTimeout(()=>addMessage(answer(q)),250); };
  chatForm?.addEventListener('submit', e => { e.preventDefault(); handleChat(chatInput.value); });
  $$('.chat-suggestions button').forEach(b => b.addEventListener('click', () => { openChat(); handleChat(b.dataset.question); }));

  // Product concept modals: interactive enough to demonstrate each concept without pretending a backend exists.
  const modal = $('#demo-modal'), modalContent = $('#modal-content');
  const demos = {
    os: `<div class="modal-inner"><p class="section-kicker pink">ZAPIFY OS · CONCEPT</p><h3>Your business, in one place.</h3><p>This interactive prototype shows the kind of dashboard Zapify Designs could build. Click a module to change the overview label.</p><div class="demo-action-grid">${['Overview','Customers','Quotes','Invoices','Bookings','Products','Website','Marketing','Settings'].map(x=>`<button type="button" data-os-tab="${x}">${x}<br><small>Open ${x.toLowerCase()}</small></button>`).join('')}</div><p id="demo-feedback" style="margin-top:18px;color:#f22b8f;font-weight:800">Overview selected.</p></div>`,
    roast: `<div class="modal-inner" style="background:#faf8ff"><p class="section-kicker" style="color:#7957e7">THE WEBSITE ROAST</p><h3>Drop a URL. Get a mini roast.</h3><p>This demo is a frontend concept. It does not fetch or scan a real site until a backend audit service is connected.</p><label style="display:grid;gap:7px;font-size:11px;font-weight:800">Website URL<input id="roast-url-input" placeholder="https://example.co.za" style="padding:12px;border:1px solid #ddd4f1;border-radius:8px"></label><button id="run-roast" class="btn" style="background:#7957e7;color:#fff;margin-top:12px">Run sample audit ⚡</button><div id="roast-result" style="margin-top:20px"></div></div>`,
    templates: `<div class="modal-inner"><p class="section-kicker" style="color:#b08017">ZAPIFY TEMPLATES</p><h3>Preview a ready-made site.</h3><p>These are lightweight concept previews that can become full template products.</p><div class="demo-action-grid"><button type="button" data-template="Salon">Salon — R299</button><button type="button" data-template="Mechanic">Mechanic — R299</button><button type="button" data-template="Restaurant">Restaurant — R399</button><button type="button" data-template="Photographer">Photographer — R299</button><button type="button" data-template="Construction">Construction — R399</button></div><div id="template-preview" style="margin-top:18px;padding:24px;background:linear-gradient(135deg,#fff7df,#fff);border:1px solid #eadfbd;border-radius:12px"><b>Choose a template to preview it.</b></div></div>`,
    packs: `<div class="modal-inner"><p class="section-kicker pink">ZAPIFY DESIGN PACKS</p><h3>Design products, ready to use.</h3><p>Starter Business Pack includes logo, business card, email signature, social profile image, Facebook cover and five post templates. Social Starter Pack includes ten Instagram templates, ten Facebook templates, five story templates and highlight covers.</p><div class="demo-action-grid"><button type="button">Starter Business Pack<br><small>Logo · card · email · social</small></button><button type="button">Social Starter Pack<br><small>Templates · stories · highlights</small></button></div></div>`,
    ai: `<div class="modal-inner"><p class="section-kicker pink">ZAPIFY AI · CONCEPT</p><h3>Turn a rough idea into a digital plan.</h3><p>Type a business problem below. This prototype returns a structured example answer; connect an AI API later for live generation.</p><input id="ai-input-demo" placeholder="e.g. I run a car wash and need more bookings." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px"><button id="run-ai" class="btn btn-pink" style="margin-top:12px">Generate plan</button><div id="ai-result" style="margin-top:18px"></div></div>`,
    toolbox: `<div class="modal-inner"><p class="section-kicker" style="color:#2868ef">ZAPIFY TOOLBOX</p><h3>Useful tools without the boring interface.</h3><p>Some tools can be fully client-side. This prototype includes a working VAT calculator example.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px"><label style="font-size:11px;font-weight:800">Amount<input id="vat-amount" type="number" value="1000" style="display:block;width:100%;padding:10px;margin-top:5px"></label><label style="font-size:11px;font-weight:800">VAT %<input id="vat-rate" type="number" value="15" style="display:block;width:100%;padding:10px;margin-top:5px"></label></div><button id="calc-vat" class="btn" style="background:#2868ef;color:#fff;margin-top:12px">Calculate VAT</button><div id="vat-result" style="margin-top:15px;font-weight:900"></div></div>`,
    dev: `<div class="modal-inner" style="background:#fffdf7"><p class="section-kicker" style="color:#b78b25">ZAPIFY DEV</p><h3>The experimental lab.</h3><p>Advanced work can include interactive car configurators, mini games, 3D websites, AI tools, dashboards, productivity apps and other prototypes. Each experiment starts with a clear use case rather than technology for its own sake.</p><div class="demo-action-grid"><button>3D websites</button><button>Car configurator</button><button>Mini games</button><button>Business dashboards</button><button>AI tools</button><button>Productivity apps</button></div></div>`
  };
  $$('.product-action').forEach(btn => btn.addEventListener('click', () => {
    const key=btn.dataset.demo; if(!modal || !demos[key]) return; modalContent.innerHTML=demos[key]; modal.showModal();
    bindDemoControls(key);
  }));
  function bindDemoControls(key){
    if(key==='os') $$('#modal-content [data-os-tab]').forEach(b=>b.onclick=()=>$('#demo-feedback').textContent=b.dataset.osTab+' selected. This is where the module would load its real data.');
    if(key==='roast') $('#run-roast')?.addEventListener('click',()=>{ const u=$('#roast-url-input').value.trim()||'yourwebsite.co.za'; $('#roast-result').innerHTML=`<div style="display:grid;gap:7px"><b style="color:#7957e7">Sample audit for ${escapeHtml(u)}</b><span>Mobile: ⚠️</span><span>Speed: ⚠️</span><span>SEO: ❌</span><span>Design: 😬</span><span>WhatsApp CTA: ❌</span><strong style="margin-top:8px">Overall: Needs work</strong><a href="#contact" onclick="document.querySelector('.demo-modal').close()" style="color:#7957e7;font-weight:900">Want us to fix it? ↗</a></div>`; });
    if(key==='templates') $$('#modal-content [data-template]').forEach(b=>b.onclick=()=>$('#template-preview').innerHTML=`<b>${escapeHtml(b.dataset.template)} template</b><p style="font-size:12px;color:#777;margin:7px 0">A polished responsive demo with category-specific content, imagery, calls to action and editable sections.</p><strong style="color:#b08017">Ready-made price from R299.</strong><br><a href="#contact" onclick="document.querySelector('.demo-modal').close()" style="color:#f22b8f;font-weight:900">Need customization? +R500 ↗</a>`);
    if(key==='ai') $('#run-ai')?.addEventListener('click',()=>{ const q=$('#ai-input-demo').value.trim()||'I need more customers.'; $('#ai-result').innerHTML=`<div style="background:#fff5fa;padding:16px;border-radius:10px;border:1px solid #f3d4e3"><b>Example plan for: ${escapeHtml(q)}</b><ul><li>Website structure with a focused homepage and service pages</li><li>Local SEO keyword ideas and meta description</li><li>Google Business Profile actions</li><li>Social content and CTA ideas</li></ul><a href="#contact" onclick="document.querySelector('.demo-modal').close()" style="color:#f22b8f;font-weight:900">Want us to build it? ↗</a></div>`; });
    if(key==='toolbox') $('#calc-vat')?.addEventListener('click',()=>{const a=Number($('#vat-amount').value)||0,r=Number($('#vat-rate').value)||0; const vat=a*r/100; $('#vat-result').textContent=`VAT: R${vat.toFixed(2)} · Total incl.: R${(a+vat).toFixed(2)}`});
  }
  $('.modal-close')?.addEventListener('click',()=>modal.close());
  modal?.addEventListener('click',e=>{if(e.target===modal)modal.close()});
  const escapeHtml = str => String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  // Desktop-only custom cursor.
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('custom-cursor');
    const dot=$('.cursor-dot'), ring=$('.cursor-ring');
    window.addEventListener('pointermove', e => { dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px'; ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px'; }, {passive:true});
    $$('a,button,select,input,textarea').forEach(el=>{el.addEventListener('pointerenter',()=>ring.classList.add('hover'));el.addEventListener('pointerleave',()=>ring.classList.remove('hover'))});
  }

  // Gentle magnetic CTA on pointer devices.
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.magnetic').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`}));
    $$('.magnetic').forEach(el=>el.addEventListener('pointerleave',()=>el.style.transform=''));
  }
})();