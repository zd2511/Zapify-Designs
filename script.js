document.addEventListener('DOMContentLoaded',()=>{
  const page=(location.pathname.split('/').pop()||'index.html');
  document.querySelectorAll('.dock-nav a').forEach(a=>{if(a.dataset.page===page){a.classList.add('active');a.setAttribute('aria-current','page');a.setAttribute('aria-label',a.textContent.trim()+' — current page')}});
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -35px 0px'});
  document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=`${(i%4)*70}ms`;revealObserver.observe(el)});
  // Pointer-following cursor, limited to fine-pointer devices.
  const dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring');
  if(dot&&ring&&matchMedia('(hover:hover) and (pointer:fine)').matches){let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y;addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;dot.style.left=x+'px';dot.style.top=y+'px'});const follow=()=>{rx+=(x-rx)*.18;ry+=(y-ry)*.18;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(follow)};follow();document.querySelectorAll('a,button,[data-tilt]').forEach(el=>{el.addEventListener('pointerenter',()=>ring.classList.add('is-hover'));el.addEventListener('pointerleave',()=>ring.classList.remove('is-hover'))})}
  // Restrained 3D tilt; no hover-only dependency on touch screens.
  document.querySelectorAll('[data-tilt],.service-detail').forEach(card=>{card.addEventListener('pointermove',e=>{if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1000px) rotateX(${-y*4}deg) rotateY(${x*5}deg) translateY(-4px)`});card.addEventListener('pointerleave',()=>card.style.removeProperty('transform'))});
  // Tactile ripple on buttons and dock links.
  document.querySelectorAll('.btn,.dock-nav a,.nav-cta').forEach(el=>{el.addEventListener('pointerdown',e=>{const r=el.getBoundingClientRect(),s=document.createElement('span');s.className='ripple';s.style.left=(e.clientX-r.left)+'px';s.style.top=(e.clientY-r.top)+'px';el.style.position='relative';el.style.overflow='hidden';el.appendChild(s);setTimeout(()=>s.remove(),750);el.classList.add('touch-pop');setTimeout(()=>el.classList.remove('touch-pop'),400)})});
  const form=document.querySelector('#contactForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const body=encodeURIComponent(`Hello Zapify Designs, I would like to make an enquiry.\nName: ${d.get('name')}\nEmail: ${d.get('email')}\nService: ${d.get('service')}\nProject details: ${d.get('message')}`);window.open(`https://wa.me/27743899657?text=${body}`,'_blank','noopener,noreferrer')});
  const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
});
/* Zapify Designs cookie consent manager.
   Essential storage keeps the visitor's consent choice. Optional categories remain
   disabled unless the visitor explicitly opts in. */
document.addEventListener('DOMContentLoaded', () => {
  const CONSENT_COOKIE = 'zapify_cookie_consent';
  const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

  const readConsent = () => {
    const match = document.cookie.match(new RegExp('(?:^|; )' + CONSENT_COOKIE + '=([^;]*)'));
    if (!match) return null;
    try {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      return parsed && parsed.version === 1 ? parsed : null;
    } catch (_) { return null; }
  };

  const closePanel = () => {
    panel.hidden = true;
    panel.querySelector('[data-cookie-preferences]').hidden = true;
    panel.querySelector('.cookie-card').hidden = false;
  };

  const saveConsent = (preferences) => {
    const consent = {
      version: 1,
      necessary: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
      updatedAt: new Date().toISOString()
    };
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    window.dispatchEvent(new CustomEvent('zapify:consentchange', { detail: consent }));
    closePanel();
  };

  const panel = document.createElement('section');
  panel.className = 'cookie-panel';
  panel.id = 'zapify-cookie-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'cookie-title');
  panel.setAttribute('aria-describedby', 'cookie-description');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="cookie-card">
      <div class="cookie-cookie-icon" aria-hidden="true">🍪</div>
      <div class="cookie-copy">
        <p class="cookie-kicker">A tiny question before you explore</p>
        <h2 id="cookie-title">Would you like a cookie?</h2>
        <p id="cookie-description">Our website uses essential cookies to work properly. With your permission, we can also use optional cookies to understand site visits and improve your experience. Your choice is yours — no cookie-related guilt here.</p>
        <div class="cookie-actions">
          <button type="button" class="cookie-button cookie-no" data-cookie-reject>No, thank you</button>
          <button type="button" class="cookie-button cookie-yes" data-cookie-accept>YES, I LOVE COOKIES 🍪</button>
        </div>
        <button type="button" class="cookie-settings-link" data-cookie-settings>Let me choose my cookies</button>
      </div>
    </div>
    <div class="cookie-preferences" data-cookie-preferences hidden>
      <div class="cookie-preferences-head">
        <div><p class="cookie-kicker">The cookie jar controls</p><h3>Choose your cookie squad</h3></div>
        <button type="button" class="cookie-close" data-cookie-close aria-label="Close cookie settings">×</button>
      </div>
      <p class="cookie-preferences-intro">Essential cookies are always on because the website needs them to function. The optional ones stay off unless you switch them on.</p>
      <div class="cookie-choice"><div><strong>Essential cookies</strong><span>Needed for core website features and remembering your choice.</span></div><span class="cookie-always-on">Always on</span></div>
      <label class="cookie-choice" for="cookie-analytics"><span><strong>Analytics cookies</strong><span>Help us understand which pages visitors use so we can improve the website.</span></span><input id="cookie-analytics" type="checkbox"></label>
      <label class="cookie-choice" for="cookie-marketing"><span><strong>Marketing cookies</strong><span>May be used to measure marketing campaigns and relevant advertising.</span></span><input id="cookie-marketing" type="checkbox"></label>
      <div class="cookie-preference-actions">
        <button type="button" class="cookie-button cookie-no" data-cookie-save-essential>Essential only</button>
        <button type="button" class="cookie-button cookie-yes" data-cookie-save>Save my choices</button>
      </div>
    </div>`;
  document.body.appendChild(panel);

  const openPanel = (showPreferences = false) => {
    panel.hidden = false;
    panel.querySelector('[data-cookie-preferences]').hidden = !showPreferences;
    panel.querySelector('.cookie-card').hidden = showPreferences;
    if (showPreferences) {
      const current = readConsent();
      panel.querySelector('#cookie-analytics').checked = Boolean(current && current.analytics);
      panel.querySelector('#cookie-marketing').checked = Boolean(current && current.marketing);
      panel.querySelector('#cookie-analytics').focus();
    } else panel.querySelector('[data-cookie-reject]').focus();
  };

  panel.addEventListener('click', (event) => {
    if (event.target.closest('[data-cookie-reject]')) saveConsent({ analytics: false, marketing: false });
    if (event.target.closest('[data-cookie-accept]')) saveConsent({ analytics: true, marketing: true });
    if (event.target.closest('[data-cookie-settings]')) openPanel(true);
    if (event.target.closest('[data-cookie-save-essential]')) saveConsent({ analytics: false, marketing: false });
    if (event.target.closest('[data-cookie-save]')) saveConsent({
      analytics: panel.querySelector('#cookie-analytics').checked,
      marketing: panel.querySelector('#cookie-marketing').checked
    });
    if (event.target.closest('[data-cookie-close]')) closePanel();
  });

  document.querySelectorAll('.copyright').forEach((footer) => {
    if (!footer.querySelector('[data-open-cookie-settings]')) {
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'cookie-footer-link';
      link.dataset.openCookieSettings = '';
      link.textContent = 'Cookie settings';
      footer.appendChild(link);
    }
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-open-cookie-settings]')) openPanel(true);
  });

  if (!readConsent()) openPanel(false);
});
