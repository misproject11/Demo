/* ============================================================
   WARUNG NUSANTARA — app.js
   Menu data, cart system, filters, animations, UI logic
   ============================================================ */

'use strict';

/* ── MENU DATA ──────────────────────────────────────────────── */
const MENU_DATA = [
  {
    id: 1, name: 'Nasi Padang Komplit', region: 'Sumatera Barat',
    price: 28000, oldPrice: null, category: 'nasi',
    badge: 'new', desc: 'Nasi putih dengan rendang, gulai, sambal hijau, dan lalapan segar.',
    icon: 'nasi'
  },
  {
    id: 2, name: 'Rendang Daging Sapi', region: 'Sumatera Barat',
    price: 22000, oldPrice: null, category: 'nasi',
    badge: null, desc: 'Rendang autentik dimasak lebih dari 4 jam dengan 40+ rempah pilihan.',
    icon: 'rendang'
  },
  {
    id: 3, name: 'Soto Betawi', region: 'DKI Jakarta',
    price: 18000, oldPrice: 22000, category: 'soto',
    badge: 'promo', desc: 'Soto kuah santan kental dengan daging sapi, tomat, dan emping.',
    icon: 'soto'
  },
  {
    id: 4, name: 'Rawon Jawa Timur', region: 'Jawa Timur',
    price: 20000, oldPrice: null, category: 'soto',
    badge: null, desc: 'Sup hitam khas dengan kluwek, daging empuk, dan taoge segar.',
    icon: 'rawon'
  },
  {
    id: 5, name: 'Ayam Goreng Laos', region: 'Jawa Tengah',
    price: 15000, oldPrice: null, category: 'gorengan',
    badge: 'hot', desc: 'Ayam marinasi rempah lengkuas, digoreng garing harum.',
    icon: 'ayam'
  },
  {
    id: 6, name: 'Tempe Mendoan', region: 'Banyumas',
    price: 8000, oldPrice: null, category: 'gorengan',
    badge: null, desc: 'Tempe tipis berlumur tepung bumbu, setengah matang gurih.',
    icon: 'tempe'
  },
  {
    id: 7, name: 'Es Cendol Dawet', region: 'Jawa Tengah',
    price: 9000, oldPrice: 12000, category: 'minuman',
    badge: 'promo', desc: 'Cendol pandan segar dengan santan, gula jawa, dan es batu.',
    icon: 'cendol'
  },
  {
    id: 8, name: 'Gulai Ikan Patin', region: 'Riau',
    price: 24000, oldPrice: null, category: 'nasi',
    badge: null, desc: 'Ikan patin dalam kuah gulai kuning kaya rempah khas Melayu.',
    icon: 'gulai'
  },
  {
    id: 9, name: 'Soto Ayam Lamongan', region: 'Jawa Timur',
    price: 16000, oldPrice: null, category: 'soto',
    badge: null, desc: 'Soto bening gurih dengan ayam suwir, koya, dan telur rebus.',
    icon: 'soto'
  },
  {
    id: 10, name: 'Perkedel Jagung', region: 'Sulawesi Utara',
    price: 7000, oldPrice: null, category: 'gorengan',
    badge: 'new', desc: 'Bakwan jagung manis dengan udang cincang dan daun bawang.',
    icon: 'tempe'
  },
  {
    id: 11, name: 'Wedang Jahe Rempah', region: 'Jawa',
    price: 8000, oldPrice: null, category: 'minuman',
    badge: null, desc: 'Minuman hangat jahe, serai, kayu manis, dan gula aren.',
    icon: 'cendol'
  },
  {
    id: 12, name: 'Paket Keluarga', region: 'Spesial Warung',
    price: 85000, oldPrice: 120000, category: 'promo',
    badge: 'promo', desc: '4 nasi + 2 lauk pilihan + 4 minuman. Hemat & kenyang bersama.',
    icon: 'nasi'
  },
];

/* ── SVG FOOD ICONS ─────────────────────────────────────────── */
const FOOD_SVG = {
  nasi: `<svg width="90" height="90" viewBox="0 0 90 90" fill="none">
    <ellipse cx="45" cy="68" rx="34" ry="7" fill="#c8973a" opacity="0.12"/>
    <ellipse cx="45" cy="56" rx="34" ry="8" fill="#1a1208" stroke="#c8973a" stroke-width="0.6" opacity="0.8"/>
    <ellipse cx="45" cy="42" rx="28" ry="18" fill="#f5e6c8"/>
    <ellipse cx="45" cy="36" rx="22" ry="12" fill="#f0ddb8"/>
    <ellipse cx="32" cy="46" rx="12" ry="8" fill="#5c2d0e"/>
    <ellipse cx="32" cy="43" rx="10" ry="6" fill="#7a3a12"/>
    <ellipse cx="60" cy="46" rx="9" ry="7" fill="#2d5a27"/>
    <ellipse cx="52" cy="52" rx="6" ry="3" fill="#8b1a1a"/>
  </svg>`,
  rendang: `<svg width="90" height="90" viewBox="0 0 90 90" fill="none">
    <ellipse cx="45" cy="68" rx="32" ry="6" fill="#c8973a" opacity="0.1"/>
    <ellipse cx="45" cy="55" rx="30" ry="7" fill="#2d1e0a" stroke="#c8973a" stroke-width="0.5" opacity="0.9"/>
    <path d="M20 42 Q45 22 70 42 Q65 60 45 64 Q25 60 20 42Z" fill="#4a2008"/>
    <path d="M24 40 Q45 26 66 40 Q61 55 45 58 Q29 55 24 40Z" fill="#5c2d0e"/>
    <path d="M30 38 Q45 28 60 38 Q57 50 45 53 Q33 50 30 38Z" fill="#7a3a12"/>
    <circle cx="38" cy="42" r="2" fill="#c8973a" opacity="0.4"/>
    <circle cx="52" cy="40" r="1.5" fill="#c8973a" opacity="0.3"/>
    <circle cx="45" cy="48" r="1.5" fill="#c8973a" opacity="0.35"/>
  </svg>`,
  soto: `<svg width="90" height="90" viewBox="0 0 90 90" fill="none">
    <ellipse cx="45" cy="68" rx="30" ry="6" fill="#c8973a" opacity="0.1"/>
    <ellipse cx="45" cy="60" rx="32" ry="8" fill="#2d1e0a" stroke="#c8973a" stroke-width="0.5"/>
    <path d="M16 48 Q45 35 74 48 L74 60 Q45 68 16 60 Z" fill="#d4900a" opacity="0.85"/>
    <path d="M16 45 Q45 32 74 45 Q45 52 16 45Z" fill="#e0a820"/>
    <ellipse cx="35" cy="50" rx="7" ry="4" fill="#f5e6c8" opacity="0.8"/>
    <ellipse cx="55" cy="52" rx="6" ry="3.5" fill="#f5e6c8" opacity="0.7"/>
    <path d="M40 30 Q38 20 42 14" stroke="#fff" stroke-width="1" opacity="0.2" fill="none" stroke-linecap="round"/>
    <path d="M50 28 Q48 18 52 12" stroke="#fff" stroke-width="1" opacity="0.15" fill="none" stroke-linecap="round"/>
  </svg>`,
  rawon: `<svg width="90" height="90" viewBox="0 0 90 90" fill="none">
    <ellipse cx="45" cy="68" rx="30" ry="6" fill="#c8973a" opacity="0.1"/>
    <ellipse cx="45" cy="60" rx="32" ry="8" fill="#2d1e0a" stroke="#c8973a" stroke-width="0.5"/>
    <path d="M16 48 Q45 35 74 48 L74 60 Q45 68 16 60 Z" fill="#1a0d05" opacity="0.95"/>
    <path d="M16 45 Q45 32 74 45 Q45 50 16 45Z" fill="#2a1508"/>
    <ellipse cx="38" cy="50" rx="8" ry="4" fill="#5c2d0e" opacity="0.9"/>
    <circle cx="52" cy="51" r="4" fill="#f5e6c8" opacity="0.5"/>
    <circle cx="30" cy="52" r="2" fill="#6aaa5a" opacity="0.7"/>
    <circle cx="60" cy="50" r="2" fill="#6aaa5a" opacity="0.6"/>
  </svg>`,
  ayam: `<svg width="90" height="90" viewBox="0 0 90 90" fill="none">
    <ellipse cx="45" cy="70" rx="28" ry="5" fill="#c8973a" opacity="0.12"/>
    <path d="M22 55 Q28 30 45 25 Q62 30 68 55 Q60 68 45 70 Q30 68 22 55Z" fill="#c8781a"/>
    <path d="M26 52 Q32 32 45 28 Q58 32 64 52 Q57 63 45 65 Q33 63 26 52Z" fill="#e09020"/>
    <path d="M30 50 Q36 34 45 31 Q54 34 60 50" stroke="#c8973a" stroke-width="0.5" opacity="0.4" fill="none"/>
    <ellipse cx="45" cy="60" rx="14" ry="7" fill="#8b4513" opacity="0.5"/>
  </svg>`,
  tempe: `<svg width="90" height="90" viewBox="0 0 90 90" fill="none">
    <ellipse cx="45" cy="68" rx="26" ry="5" fill="#c8973a" opacity="0.1"/>
    <rect x="18" y="38" width="54" height="24" rx="6" fill="#c8973a" opacity="0.15" transform="rotate(-8 18 38)"/>
    <rect x="20" y="36" width="50" height="22" rx="5" fill="#b8860b" transform="rotate(-8 20 36)"/>
    <rect x="22" y="34" width="46" height="20" rx="4" fill="#d4a020" transform="rotate(-8 22 34)"/>
    <circle cx="32" cy="44" r="2.5" fill="#8b6010" opacity="0.7"/>
    <circle cx="42" cy="42" r="2.5" fill="#8b6010" opacity="0.7"/>
    <circle cx="52" cy="46" r="2.5" fill="#8b6010" opacity="0.7"/>
    <circle cx="37" cy="52" r="2" fill="#8b6010" opacity="0.6"/>
    <circle cx="47" cy="50" r="2" fill="#8b6010" opacity="0.6"/>
  </svg>`,
  cendol: `<svg width="90" height="90" viewBox="0 0 90 90" fill="none">
    <ellipse cx="45" cy="70" rx="20" ry="5" fill="#c8973a" opacity="0.1"/>
    <rect x="28" y="30" width="34" height="38" rx="17" fill="#1a3020" stroke="#c8973a" stroke-width="0.6" opacity="0.9"/>
    <rect x="30" y="32" width="30" height="34" rx="15" fill="#0d2018"/>
    <!-- Ice -->
    <rect x="32" y="33" width="12" height="8" rx="2" fill="#d0eeff" opacity="0.6"/>
    <rect x="46" y="34" width="10" height="7" rx="2" fill="#d0eeff" opacity="0.5"/>
    <!-- Cendol worms -->
    <path d="M34 52 Q36 48 38 52 Q40 56 42 52" stroke="#2d7a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M44 54 Q46 50 48 54 Q50 58 52 54" stroke="#2d7a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- Coconut milk -->
    <ellipse cx="45" cy="58" rx="12" ry="5" fill="#f5e6c8" opacity="0.3"/>
    <!-- Straw -->
    <rect x="52" y="18" width="3" height="26" rx="1.5" fill="#c8973a" opacity="0.7"/>
  </svg>`,
  gulai: `<svg width="90" height="90" viewBox="0 0 90 90" fill="none">
    <ellipse cx="45" cy="68" rx="30" ry="6" fill="#c8973a" opacity="0.1"/>
    <ellipse cx="45" cy="60" rx="32" ry="8" fill="#2d1e0a" stroke="#c8973a" stroke-width="0.5"/>
    <path d="M16 47 Q45 34 74 47 L74 60 Q45 68 16 60 Z" fill="#c8780a" opacity="0.9"/>
    <path d="M16 44 Q45 31 74 44 Q45 50 16 44Z" fill="#e09020"/>
    <!-- Fish shape -->
    <path d="M30 48 Q45 38 60 48 Q55 56 45 57 Q35 56 30 48Z" fill="#f5c878" opacity="0.8"/>
    <circle cx="35" cy="49" r="1.5" fill="#1a0d05"/>
    <path d="M58 44 L64 40 L62 48 Z" fill="#f5c878" opacity="0.7"/>
  </svg>`,
};

/* ── CART STATE ─────────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('wn_cart') || '[]');

function saveCart() {
  localStorage.setItem('wn_cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

/* ── RENDER CART ────────────────────────────────────────────── */
function renderCart() {
  const cartItems  = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal  = document.getElementById('cartTotal');
  const cartBadge  = document.getElementById('cartBadge');
  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);

  // Badge
  cartBadge.textContent = totalQty;
  cartBadge.classList.toggle('visible', totalQty > 0);

  // Save to localStorage for order page
  saveCart();

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="#c8973a" stroke-width="1" opacity="0.3"/>
          <path d="M20 24h24l-3 12H23L20 24z" stroke="#c8973a" stroke-width="1.5" fill="none"/>
          <circle cx="26" cy="40" r="2" fill="#c8973a" opacity="0.5"/>
          <circle cx="38" cy="40" r="2" fill="#c8973a" opacity="0.5"/>
        </svg>
        <p>Keranjang masih kosong</p>
      </div>`;
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'flex';
  cartTotal.textContent = formatRupiah(getCartTotal());

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatRupiah(item.price)}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id) {
  const item  = MENU_DATA.find(m => m.id === id);
  const exist = cart.find(c => c.id === id);
  if (exist) {
    exist.qty++;
  } else {
    cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
  }
  renderCart();
  showToast(`${item.name} ditambahkan ke keranjang`, 'success');
  // Pulse cart icon
  const badge = document.getElementById('cartBadge');
  badge.style.transform = 'scale(1.5)';
  setTimeout(() => badge.style.transform = '', 300);
}

function changeQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  renderCart();
}

window.changeQty = changeQty;

/* ── RENDER MENU CARDS ──────────────────────────────────────── */
function createMenuCard(item) {
  const card = document.createElement('div');
  card.className = 'menu-card reveal-up';
  card.dataset.category = item.category;
  card.dataset.id = item.id;

  const badgeHTML = item.badge
    ? `<span class="card-badge badge-${item.badge}">${
        item.badge === 'promo' ? 'Promo' :
        item.badge === 'new'   ? 'Baru'  :
        item.badge === 'hot'   ? 'Laris' : ''
      }</span>`
    : '';

  const oldPriceHTML = item.oldPrice
    ? `<span class="card-price-old">${formatRupiah(item.oldPrice)}</span>` : '';

  card.innerHTML = `
    ${badgeHTML}
    <div class="card-img">
      ${FOOD_SVG[item.icon] || FOOD_SVG.nasi}
    </div>
    <div class="card-body">
      <div class="card-name">${item.name}</div>
      <div class="card-region">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 1C4.3 1 3 2.3 3 4c0 2.6 3 7 3 7s3-4.4 3-7c0-1.7-1.3-3-3-3z"/>
          <circle cx="6" cy="4" r="1"/>
        </svg>
        ${item.region}
      </div>
      <div class="card-footer">
        <div class="card-price-wrap">
          ${oldPriceHTML}
          <span class="card-price">${formatRupiah(item.price)}</span>
        </div>
        <button class="card-add" aria-label="Tambah ke keranjang" onclick="addToCart(${item.id})">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="8" y1="2" x2="8" y2="14"/>
            <line x1="2" y1="8" x2="14" y2="8"/>
          </svg>
        </button>
      </div>
    </div>`;

  return card;
}

function renderMenuGrid(filter = 'all') {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const items = filter === 'all'
    ? MENU_DATA.slice(0, 8)
    : MENU_DATA.filter(m => m.category === filter).slice(0, 8);

  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem 0;font-size:0.9rem;">Tidak ada menu dalam kategori ini.</div>`;
    return;
  }

  items.forEach((item, i) => {
    const card = createMenuCard(item);
    card.style.animationDelay = `${i * 0.06}s`;
    grid.appendChild(card);
  });

  // Trigger reveal for newly added cards
  requestAnimationFrame(() => {
    grid.querySelectorAll('.reveal-up').forEach(el => {
      observer.observe(el);
    });
  });
}

/* ── FILTER LOGIC ───────────────────────────────────────────── */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenuGrid(btn.dataset.filter);
    });
  });
}

/* ── SCROLL REVEAL ──────────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal-up, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

/* ── NAVBAR ─────────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('menuToggle');
  const mobile = document.getElementById('navMobile');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  toggle?.addEventListener('click', () => {
    mobile.classList.toggle('open');
    const icon = toggle.querySelector('svg');
    if (mobile.classList.contains('open')) {
      icon.setAttribute('data-lucide', 'x');
    } else {
      icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
  });

  // Close mobile nav on link click
  mobile?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobile.classList.remove('open');
      const icon = toggle.querySelector('svg');
      icon.setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    });
  });
}

/* ── CART DRAWER ────────────────────────────────────────────── */
function initCartDrawer() {
  const toggle  = document.getElementById('cartToggle');
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  const close   = document.getElementById('cartClose');

  function openCart() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle?.addEventListener('click', openCart);
  close?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);

  // Pass cart to order page
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    saveCart();
  });
}

/* ── THEME TOGGLE ───────────────────────────────────────────── */
function initTheme() {
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('wn_theme') || 'dark';
  applyTheme(saved);

  btn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('wn_theme', next);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn  = document.getElementById('themeToggle');
  const icon = btn?.querySelector('svg');
  if (!icon) return;
  icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
  lucide.createIcons();
}

/* ── BACK TO TOP ────────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── CUSTOM CURSOR ──────────────────────────────────────────── */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;

  let tx = 0, ty = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cursor.style.left = tx + 'px';
    cursor.style.top  = ty + 'px';
  });

  // Smooth trail
  function animate() {
    rx += (tx - rx) * 0.14;
    ry += (ty - ry) * 0.14;
    trail.style.left = rx + 'px';
    trail.style.top  = ry + 'px';
    requestAnimationFrame(animate);
  }
  animate();

  // Grow on interactive elements
  document.querySelectorAll('a, button, .menu-card, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '20px';
      cursor.style.height = '20px';
      trail.style.opacity = '0.5';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '';
      cursor.style.height = '';
      trail.style.opacity = '';
    });
  });
}

/* ── LOADER ─────────────────────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader?.classList.add('hidden');
    }, 1200);
  });
}

/* ── TOAST ──────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
window.showToast = showToast;

/* ── TESTIMONIAL SLIDER ─────────────────────────────────────── */
function initTestiSlider() {
  const track  = document.getElementById('testiTrack');
  const slide  = document.querySelector('.testi-slide');
  const prev   = document.getElementById('testiPrev');
  const next   = document.getElementById('testiNext');
  const dotsEl = document.getElementById('testiDots');
  if (!track || !slide) return;

  let current = 0;
  const cards = slide.querySelectorAll('.testi-card');
  const total = cards.length;

  // Build dots
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  }

  function goTo(idx) {
    current = (idx + total) % total;
    const cardW = cards[0].offsetWidth + 24; // gap
    slide.style.transform = `translateX(-${current * cardW}px)`;
    dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prev?.addEventListener('click', () => goTo(current - 1));
  next?.addEventListener('click', () => goTo(current + 1));

  // Auto-play
  let autoplay = setInterval(() => goTo(current + 1), 4500);
  track.addEventListener('mouseenter', () => clearInterval(autoplay));
  track.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current + 1), 4500);
  });

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  });
}

/* ── PARALLAX HERO ──────────────────────────────────────────── */
function initParallax() {
  const batik = document.querySelector('.hero-batik');
  if (!batik) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    batik.style.transform = `translateY(calc(-50% + ${y * 0.2}px))`;
  }, { passive: true });
}

/* ── SMOOTH ANCHOR SCROLL ───────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ── PROMO BANNER COUNTER ANIMATION ────────────────────────── */
function initCounterAnim() {
  const observer2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat strong').forEach(el => {
        const target = parseFloat(el.textContent);
        if (isNaN(target)) return;
        let start = 0;
        const suffix = el.textContent.replace(/[\d.]/g, '');
        const step = target / 40;
        const interval = setInterval(() => {
          start += step;
          if (start >= target) {
            el.textContent = target + suffix;
            clearInterval(interval);
          } else {
            el.textContent = (Number.isInteger(target) ? Math.floor(start) : start.toFixed(1)) + suffix;
          }
        }, 30);
      });
      observer2.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) observer2.observe(statsEl);
}

/* ── INIT ALL ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  initLoader();
  initTheme();
  initNavbar();
  initCartDrawer();
  initCursor();
  initBackToTop();
  initSmoothScroll();

  renderMenuGrid('all');
  renderCart();
  initFilters();

  initReveal();
  initTestiSlider();
  initParallax();
  initCounterAnim();
});
