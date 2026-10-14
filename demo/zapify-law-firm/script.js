const slides = [
  { title: 'Family & Personal Law', description: 'Sensitive matters deserve thoughtful advice and a practical path forward.', image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=300&q=80' },
  { title: 'Business & Commercial', description: 'Make important decisions with clearer terms, careful review, and perspective.', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=300&q=80' },
  { title: 'Dispute Resolution', description: 'Understand your options and work towards a considered resolution.', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80' },
  { title: 'Wills & Estate Planning', description: 'Plan thoughtfully for the people and priorities that matter to you.', image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=300&q=80' }
];
const tabs = [...document.querySelectorAll('.feature-tab')];
function setSlide(index) {
  const slide = slides[index];
  document.getElementById('featureNumber').textContent = `0${index + 1}`;
  document.getElementById('featureTitle').textContent = slide.title;
  document.getElementById('featureDescription').textContent = slide.description;
  document.getElementById('featurePhoto').style.backgroundImage = `url("${slide.image}")`;
  tabs.forEach((tab, i) => { tab.classList.toggle('active', i === index); tab.setAttribute('aria-pressed', String(i === index)); });
}
tabs.forEach((tab) => tab.addEventListener('click', () => setSlide(Number(tab.dataset.slide))));
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); }));
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('contactForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = encodeURIComponent(`Website enquiry — ${data.get('matter')}`);
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not provided'}\nMatter: ${data.get('matter')}\n\nMessage:\n${data.get('message')}\n\nConsent: Contact requested via website form.`);
  document.getElementById('formFeedback').textContent = 'Your email app will open with the enquiry prepared. Please review and send it there.';
  window.location.href = `mailto:hello@zapifylaw.co.za?subject=${subject}&body=${body}`;
});
setSlide(0);
