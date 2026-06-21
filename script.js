// ---- Mobile nav ----
const burger = document.getElementById('burger');
const navList = document.getElementById('navList');
burger.addEventListener('click', () => navList.classList.toggle('open'));
navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));

// ---- Product data ----
const products = [
  {id:'p1', badge:'hit', badgeText:'Хит', title:'Крафт-бумага рулон', desc:'Натуральный коричневый крафт, плотность 90 г/м², рулон 100 м — универсальная упаковка', price:580, unit:'рулон', color:'#cdbb86'},
  {id:'p2', badge:'', badgeText:'', title:'Цветная упаковочная', desc:'Яркие рулоны 12 оттенков, 50 м каждый — для подарков и подарочной упаковки', price:1290, unit:'набор', color:'#e08fc0'},
  {id:'p3', badge:'new', badgeText:'Новинка', title:'Папиросная бумага', desc:'Нежная тонкая бумага для деликатной упаковки — 100 листов, мятый белый', price:340, unit:'упаковка', color:'#ece6da'},
  {id:'p4', badge:'', badgeText:'', title:'Пузырчатая плёнка', desc:'Надёжная защита хрупких изделий, рулон 25 м — классический bubble wrap', price:460, unit:'рулон', color:'#dce6ea'},
  {id:'p5', badge:'hit', badgeText:'Хит', title:'Гофрокартон листы', desc:'3-слойный гофрокартон ВС, 10 листов — для перевозок и хранения', price:890, unit:'пачка', color:'#c8a06a'},
  {id:'p6', badge:'', badgeText:'', title:'Бумага для посылок', desc:'Мягкая обёрточная бумага 60 г/м², рулон 50 м — экономичное решение', price:320, unit:'рулон', color:'#e3d8c2'},
  {id:'p7', badge:'sale', badgeText:'−20%', title:'Металлизированная бумага', desc:'Золотая и серебряная фольга, 20 листов А4 — для премиум-упаковки', price:490, unit:'набор', color:'#e9d27a'},
  {id:'p8', badge:'', badgeText:'', title:'Подарочная с узором', desc:'Рулоны с принтами — геометрия, флористика, абстракция, 4 м на рулон', price:260, unit:'рулон', color:'#cfe0a8'},
  {id:'p9', badge:'new', badgeText:'Новинка', title:'Сотовая бумага', desc:'Honeycomb-структура для декоративной и защитной упаковки, рулон 25 м', price:620, unit:'рулон', color:'#e7c9a3'},
  {id:'p10', badge:'', badgeText:'', title:'Вощёная бумага', desc:'Водонепроницаемая, пищевая — для упаковки еды, сэндвичей и фастфуда', price:380, unit:'рулон', color:'#f0eadb'},
  {id:'p11', badge:'sale', badgeText:'−15%', title:'Крепированная бумага', desc:'Креп-бумага для гирлянд, цветов и декора — 50 рулонов, радуга цветов', price:760, unit:'набор', color:'#e5b3c9'},
  {id:'p12', badge:'hit', badgeText:'Хит', title:'Целлофан прозрачный', desc:'Прозрачная плёнка для конфет, букетов и подарков — рулон 50 м', price:290, unit:'рулон', color:'#dfeef5'}
];

function formatPrice(n){
  return n.toLocaleString('ru-RU') + ' ₽';
}

const grid = document.getElementById('cardsGrid');
products.forEach(p => {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    ${p.badge ? `<div class="badge ${p.badge}">${p.badgeText}</div>` : ''}
    <div class="card-thumb" style="background:${p.color}">
      <svg width="46" height="46" viewBox="0 0 100 100"><use href="#flower" fill="#15151b" opacity="0.18"/></svg>
    </div>
    <h3>${p.title}</h3>
    <p>${p.desc}</p>
    <div class="card-foot">
      <span class="price">${formatPrice(p.price)} / ${p.unit}</span>
      <button class="buy" data-id="${p.id}">Купить</button>
    </div>
  `;
  grid.appendChild(card);
});

// ---- CART LOGIC ----
const CART_KEY = 'bp_cart_v1';
let cart = loadCart();

function loadCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function findProduct(id){
  return products.find(p => p.id === id);
}

function addToCart(id){
  const existing = cart.find(i => i.id === id);
  if(existing){
    existing.qty += 1;
  } else {
    cart.push({id, qty:1});
  }
  saveCart();
  renderCart();
  const p = findProduct(id);
  showToast(`${p.title} добавлен в корзину`);
}

function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function cartTotalCount(){
  return cart.reduce((sum, i) => sum + i.qty, 0);
}
function cartTotalPrice(){
  return cart.reduce((sum, i) => {
    const p = findProduct(i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}

const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');

function renderCart(){
  const count = cartTotalCount();
  if(count > 0){
    cartCountEl.style.display = 'flex';
    cartCountEl.textContent = count;
  } else {
    cartCountEl.style.display = 'none';
  }

  if(cart.length === 0){
    cartItemsEl.innerHTML = '<div class="cart-empty">Корзина пуста</div>';
    checkoutBtn.disabled = true;
  } else {
    checkoutBtn.disabled = false;
    cartItemsEl.innerHTML = cart.map(item => {
      const p = findProduct(item.id);
      if(!p) return '';
      const lineTotal = p.price * item.qty;
      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-thumb" style="background:${p.color}">
            <svg viewBox="0 0 100 100"><use href="#flower" fill="#15151b" opacity="0.18"/></svg>
          </div>
          <div class="cart-item-info">
            <h4>${p.title}</h4>
            <div class="cart-item-price">${formatPrice(p.price)} / ${p.unit}</div>
            <div class="cart-item-controls">
              <div class="qty-control">
                <button class="qty-minus" data-id="${p.id}" aria-label="Уменьшить">−</button>
                <span>${item.qty}</span>
                <button class="qty-plus" data-id="${p.id}" aria-label="Увеличить">+</button>
              </div>
              <span class="cart-line-total">${formatPrice(lineTotal)}</span>
            </div>
            <button class="remove-btn" data-id="${p.id}" style="margin-top:10px;">Удалить</button>
          </div>
        </div>
      `;
    }).join('');
  }

  cartTotalEl.textContent = formatPrice(cartTotalPrice());
}

cartItemsEl.addEventListener('click', (e) => {
  const minus = e.target.closest('.qty-minus');
  const plus = e.target.closest('.qty-plus');
  const remove = e.target.closest('.remove-btn');
  if(minus) changeQty(minus.dataset.id, -1);
  if(plus) changeQty(plus.dataset.id, 1);
  if(remove) removeFromCart(remove.dataset.id);
});

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.buy');
  if(btn) addToCart(btn.dataset.id);
});

// drawer open/close
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');

function openCart(){
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
}
function closeCart(){
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
}
cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

checkoutBtn.addEventListener('click', () => {
  showToast('Заявка принята! Мы свяжемся с вами для оформления заказа.');
  cart = [];
  saveCart();
  renderCart();
  setTimeout(closeCart, 1200);
});

// toast
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg){
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

renderCart();

// ---- Parallax ----
const decos = Array.from(document.querySelectorAll('.deco'));
let ticking = false;
function updateParallax(){
  const scrollY = window.scrollY;
  decos.forEach(el => {
    const speed = parseFloat(el.dataset.speed) || 0.2;
    const offset = scrollY * speed;
    el.style.transform = `translateY(${offset * -0.5}px)`;
  });
  ticking = false;
}
window.addEventListener('scroll', () => {
  if(!ticking){
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
});
updateParallax();
