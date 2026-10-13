const nav = document.querySelector('.nav');
const toggle = document.querySelector('.menu-toggle');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? '×' : '☰';
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.textContent='☰';
}));
let cart = [];
const count = document.getElementById('cartCount');
const message = document.getElementById('cartMessage');
document.querySelectorAll('.add').forEach(btn => btn.addEventListener('click', () => {
  cart.push(btn.dataset.name); count.textContent = cart.length;
  message.textContent = `${btn.dataset.name} added to your bag. ${cart.length} item${cart.length===1?'':'s'} in your bag.`;
  btn.textContent = '✓'; setTimeout(() => btn.textContent = '+', 900);
}));
document.getElementById('cartButton').addEventListener('click', () => {
  if (cart.length) alert('Your bag:\\n' + cart.map((item,i)=>`${i+1}. ${item}`).join('\\n') + '\\n\\nDemo only — checkout is not connected yet.');
  else alert('Your bag is empty. Add something delicious from the menu!');
});
function filterDishes(category) {
  document.querySelectorAll('.dish-card').forEach(card => {
    card.hidden = category !== 'All' && card.dataset.category !== category;
  });
  document.querySelectorAll('.filter').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === category));
  document.querySelectorAll('.category-strip a').forEach(link => link.classList.toggle('selected', link.dataset.filter === category));
}
document.querySelectorAll('.filter, .category-strip a[data-filter]').forEach(btn => btn.addEventListener('click', () => filterDishes(btn.dataset.filter || 'All')));
document.querySelectorAll('.heart').forEach(btn => btn.addEventListener('click', () => {
  btn.classList.toggle('saved'); btn.textContent = btn.classList.contains('saved') ? '♥' : '♡';
}));
document.getElementById('showAll').addEventListener('click', () => {
  filterDishes('All'); document.querySelector('.filter-row').scrollIntoView({behavior:'smooth',block:'center'});
});
document.getElementById('newsletterForm').addEventListener('submit', e => {
  e.preventDefault(); document.getElementById('newsletterMessage').textContent = 'Thanks! Newsletter signup is a visual demo and is not connected yet.';
  e.target.reset();
});
document.getElementById('year').textContent = new Date().getFullYear();
