const toggle = document.querySelector('.menu-toggle');
const frame = document.querySelector('.site-frame');
toggle?.addEventListener('click', () => {
  const opened = frame.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', String(opened));
  toggle.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
});
document.querySelectorAll('.side-nav a').forEach(link => link.addEventListener('click', () => {
  frame.classList.remove('menu-open');
  toggle?.setAttribute('aria-expanded', 'false');
}));
document.getElementById('year').textContent = new Date().getFullYear();
