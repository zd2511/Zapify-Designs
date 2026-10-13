const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.favorite').forEach(button => {
  button.addEventListener('click', () => {
    const saved = button.classList.toggle('saved');
    button.textContent = saved ? '♥' : '♡';
    button.setAttribute('aria-pressed', String(saved));
  });
});

const searchForm = document.getElementById('property-search');
const cards = [...document.querySelectorAll('.property-card')];
const resultsNote = document.getElementById('results-note');
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const location = document.getElementById('location-filter').value;
  const type = document.getElementById('type-filter').value;
  const priceRange = document.getElementById('price-filter').value;
  let min = 0, max = Infinity;
  if (priceRange) [min, max] = priceRange.split('-').map(Number);
  let visible = 0;
  cards.forEach(card => {
    const price = Number(card.dataset.price);
    const matches = (!location || card.dataset.location === location) &&
      (!type || card.dataset.type === type) && price >= min && price <= max;
    card.hidden = !matches;
    if (matches) visible++;
  });
  resultsNote.textContent = visible ? `${visible} ${visible === 1 ? 'property' : 'properties'} match your search` : 'No exact matches. Try broadening your filters.';
  document.getElementById('properties').scrollIntoView({behavior:'smooth', block:'start'});
});

const modal = document.getElementById('video-modal');
document.getElementById('watch-video').addEventListener('click', () => { modal.hidden = false; });
modal.querySelector('.modal-close').addEventListener('click', () => { modal.hidden = true; });
modal.addEventListener('click', event => { if (event.target === modal) modal.hidden = true; });
document.addEventListener('keydown', event => { if (event.key === 'Escape') modal.hidden = true; });

document.querySelectorAll('.dot').forEach((dot, index) => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.dot').forEach(d => d.style.background = '');
    dot.style.background = 'var(--gold-light)';
    resultsNote.textContent = `You're viewing featured collection ${index + 2}. More listings can be connected here.`;
  });
});
