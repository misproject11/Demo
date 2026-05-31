/* ============================================================
   WARUNG NUSANTARA — order.js
   Step navigation, form validation, QRIS countdown,
   WhatsApp message generator, order confirmation
   ============================================================ */

'use strict';

/* ── CONFIG — ganti dengan data bisnis Anda ─────────────────── */
const CONFIG = {
  WA_NUMBER:    '6281234567890',   // Nomor WhatsApp admin (format internasional)
  STORE_NAME:   'Warung Nusantara',
  DELIVERY_FEE: 5000,
  QRIS_TIMEOUT: 15 * 60,           // 15 menit dalam detik
};

/* ── STATE ──────────────────────────────────────────────────── */
let currentStep  = 1;
let countdownVal = CONFIG.QRIS_TIMEOUT;
let countdownInt = null;
let customerData = {};
let selectedPayment = 'qris';
let ongkirFee    = CONFIG.DELIVERY_FEE;

/* ── HELPERS ────────────────────────────────────────────────── */
function formatRupiah(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

function getCart() {
  return JSON.parse(localStorage.getItem('wn_cart') || '[]');
}

function getMenuById(id) {
  return (window.MENU_DATA || []).find(m => m.id === id);
}

function getCartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function getGrandTotal() {
  return getCartTotal() + ongkirFee;
}

/* ── STEP NAVIGATION ────────────────────────────────────────── */
window.goStep = function(n) {
  // Validate before step 1 → 2 is handled separately
  const panels = document.querySelectorAll('.order-section');
  panels.forEach(p => p.style.display = 'none');
  const target = document.getElementById(`panel-${n}`);
  if (target) {
    target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  currentStep = n;
  updateStepIndicator(n);
  lucide.createIcons();

  if (n === 2) renderStep2Summary();
  if (n === 3) renderStep3Confirm();
  if (n === 3) startCountdown();
};

function updateStepIndicator(active) {
  for (let i = 1; i <= 4; i++) {
    const dot  = document.getElementById(`step-dot-${i}`);
    const line = document.getElementById(`step-line-${i}`);
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i < active)  dot.classList.add('done');
    if (i === active) dot.classList.add('active');
    if (line) line.classList.toggle('done', i < active);
  }
}

/* ── STEP 1 — RENDER ORDER ITEMS ───────────────────────────── */
function renderStep1() {
  const cart    = getCart();
  const list    = document.getElementById('order-items-list');
  const empty   = document.getElementById('order-empty');
  const rows    = document.getElementById('summary-rows');
  const grand   = document.getElementById('summary-grand');
  const nextBtn = document.getElementById('btn-next-1');

  if (!list) return;

  if (cart.length === 0) {
    list.style.display   = 'none';
    empty.style.display  = 'flex';
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  empty.style.display = 'none';
  list.style.display  = 'flex';
  list.innerHTML = '';

  const FOOD_SVG = window.FOOD_SVG || {};

  cart.forEach(item => {
    const menuItem = getMenuById(item.id);
    const icon     = menuItem ? (FOOD_SVG[menuItem.icon] || FOOD_SVG.nasi) : '';
    const el = document.createElement('div');
    el.className = 'order-item';
    el.innerHTML = `
      <div class="order-item-icon">${icon}</div>
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-region">${menuItem ? menuItem.region : ''}</div>
      </div>
      <div class="order-item-qty-price">
        <div class="qty-label">${item.qty}x ${formatRupiah(item.price)}</div>
        <div class="item-total">${formatRupiah(item.price * item.qty)}</div>
      </div>
      <button class="order-item-remove" onclick="removeFromOrderList(${item.id})" aria-label="Hapus">
        <i data-lucide="x"></i>
      </button>`;
    list.appendChild(el);
  });

  // Summary rows
  if (rows) {
    rows.innerHTML = cart.map(i =>
      `<div class="summary-row">
        <span>${i.name} x${i.qty}</span>
        <span>${formatRupiah(i.price * i.qty)}</span>
      </div>`
    ).join('');
  }
  if (grand) grand.textContent = formatRupiah(getCartTotal());

  lucide.createIcons();
}

window.removeFromOrderList = function(id) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem('wn_cart', JSON.stringify(cart));
  renderStep1();
  if (typeof renderCart === 'function') renderCart();
};

/* ── STEP 2 — SUMMARY & ONGKIR ─────────────────────────────── */
function renderStep2Summary() {
  const cart    = getCart();
  const rows    = document.getElementById('summary-rows-2');
  const grand   = document.getElementById('summary-grand-2');
  const ongkir  = document.getElementById('ongkir-label');
  const delivery = document.getElementById('inp-delivery');

  ongkirFee = delivery?.value === 'pickup' || delivery?.value === 'dinein'
    ? 0 : CONFIG.DELIVERY_FEE;

  if (rows) {
    rows.innerHTML = cart.map(i =>
      `<div class="summary-row">
        <span>${i.name} x${i.qty}</span>
        <span>${formatRupiah(i.price * i.qty)}</span>
      </div>`
    ).join('');
  }

  if (ongkir) ongkir.textContent = ongkirFee > 0 ? `+${formatRupiah(ongkirFee)}` : 'Gratis';
  if (grand)  grand.textContent  = formatRupiah(getGrandTotal());
}

document.addEventListener('change', e => {
  if (e.target.id === 'inp-delivery') renderStep2Summary();
});

/* ── STEP 2 — VALIDATE ──────────────────────────────────────── */
window.validateStep2 = function() {
  const nama    = document.getElementById('inp-nama');
  const hp      = document.getElementById('inp-hp');
  const alamat  = document.getElementById('inp-alamat');
  const delivery = document.getElementById('inp-delivery');
  let valid = true;

  [nama, hp, alamat].forEach(el => el?.classList.remove('error'));

  if (!nama?.value.trim()) {
    nama?.classList.add('error'); valid = false;
  }
  if (!hp?.value.trim() || hp.value.replace(/\D/g,'').length < 9) {
    hp?.classList.add('error'); valid = false;
  }
  if (!alamat?.value.trim() && delivery?.value === 'delivery') {
    alamat?.classList.add('error'); valid = false;
  }

  if (!valid) {
    showToast('Lengkapi data yang wajib diisi', 'error');
    return;
  }

  // Save customer data
  customerData = {
    nama:     nama.value.trim(),
    hp:       hp.value.trim(),
    alamat:   alamat?.value.trim(),
    catatan:  document.getElementById('inp-catatan')?.value.trim(),
    delivery: delivery?.value,
  };

  ongkirFee = (customerData.delivery === 'pickup' || customerData.delivery === 'dinein')
    ? 0 : CONFIG.DELIVERY_FEE;

  goStep(3);
};

/* ── STEP 3 — CONFIRM DETAIL ────────────────────────────────── */
function renderStep3Confirm() {
  const cart    = getCart();
  const detail  = document.getElementById('confirm-detail');
  const grand   = document.getElementById('summary-grand-3');
  const qrisTotal = document.getElementById('qris-total');

  const deliveryLabel = {
    delivery: 'Antar ke Alamat',
    pickup:   'Ambil Sendiri',
    dinein:   'Makan di Tempat',
  };

  if (detail) {
    detail.innerHTML = `
      <div class="confirm-row"><span>Nama</span><span>${customerData.nama}</span></div>
      <div class="confirm-row"><span>WhatsApp</span><span>${customerData.hp}</span></div>
      <div class="confirm-row"><span>Metode</span><span>${deliveryLabel[customerData.delivery] || '-'}</span></div>
      ${customerData.delivery === 'delivery' ? `<div class="confirm-row"><span>Alamat</span><span>${customerData.alamat}</span></div>` : ''}
      ${customerData.catatan ? `<div class="confirm-row"><span>Catatan</span><span>${customerData.catatan}</span></div>` : ''}
      <div class="confirm-row"><span>Subtotal</span><span>${formatRupiah(getCartTotal())}</span></div>
      <div class="confirm-row"><span>Ongkir</span><span>${ongkirFee > 0 ? formatRupiah(ongkirFee) : 'Gratis'}</span></div>
    `;
  }

  const total = getGrandTotal();
  if (grand)     grand.textContent = formatRupiah(total);
  if (qrisTotal) qrisTotal.textContent = formatRupiah(total);
}

/* ── PAYMENT METHOD TOGGLE ──────────────────────────────────── */
document.addEventListener('change', e => {
  if (e.target.name !== 'payment') return;
  selectedPayment = e.target.value;

  document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
  e.target.closest('.pay-method')?.classList.add('active');

  const qrisPanel     = document.getElementById('qris-panel');
  const transferPanel = document.getElementById('transfer-panel');
  const codPanel      = document.getElementById('cod-panel');

  [qrisPanel, transferPanel, codPanel].forEach(p => p && (p.style.display = 'none'));

  if (selectedPayment === 'qris')     { qrisPanel.style.display     = 'block'; resetCountdown(); startCountdown(); }
  if (selectedPayment === 'transfer') transferPanel.style.display   = 'block';
  if (selectedPayment === 'cod')      codPanel.style.display        = 'block';

  lucide.createIcons();
});

/* ── QRIS COUNTDOWN ─────────────────────────────────────────── */
function startCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  clearInterval(countdownInt);
  countdownVal = CONFIG.QRIS_TIMEOUT;

  countdownInt = setInterval(() => {
    countdownVal--;
    const m = String(Math.floor(countdownVal / 60)).padStart(2, '0');
    const s = String(countdownVal % 60).padStart(2, '0');
    if (el) el.textContent = `${m}:${s}`;
    if (countdownVal <= 0) {
      clearInterval(countdownInt);
      if (el) el.textContent = 'Sesi habis';
      showToast('Sesi QR habis. Klik konfirmasi untuk memperbarui.', 'error');
    }
  }, 1000);
}

function resetCountdown() {
  clearInterval(countdownInt);
  countdownVal = CONFIG.QRIS_TIMEOUT;
  const el = document.getElementById('countdown');
  if (el) el.textContent = '15:00';
}

/* ── GENERATE WA MESSAGE ────────────────────────────────────── */
function generateWAMessage() {
  const cart   = getCart();
  const del    = { delivery: 'Antar ke Alamat', pickup: 'Ambil Sendiri', dinein: 'Makan di Tempat' };
  const payLabel = { qris: 'QRIS', transfer: 'Transfer Bank', cod: 'Bayar di Tempat (COD)' };

  const itemLines = cart.map(i =>
    `  • ${i.name} x${i.qty} = ${formatRupiah(i.price * i.qty)}`
  ).join('\n');

  const msg = [
    `*PESANAN BARU — ${CONFIG.STORE_NAME}*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `*Nama     :* ${customerData.nama}`,
    `*No. HP   :* ${customerData.hp}`,
    `*Metode   :* ${del[customerData.delivery] || '-'}`,
    customerData.delivery === 'delivery' ? `*Alamat   :* ${customerData.alamat}` : null,
    customerData.catatan ? `*Catatan  :* ${customerData.catatan}` : null,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `*DETAIL PESANAN:*`,
    itemLines,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `*Subtotal :* ${formatRupiah(getCartTotal())}`,
    `*Ongkir   :* ${ongkirFee > 0 ? formatRupiah(ongkirFee) : 'Gratis'}`,
    `*TOTAL    :* ${formatRupiah(getGrandTotal())}`,
    `*Bayar via:* ${payLabel[selectedPayment]}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Mohon dikonfirmasi. Terima kasih! 🙏`,
  ].filter(Boolean).join('\n');

  return msg;
}

/* ── CONFIRM ORDER ──────────────────────────────────────────── */
window.confirmOrder = function() {
  clearInterval(countdownInt);

  const msg = generateWAMessage();
  const url = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(msg)}`;

  // Generate order ID
  const orderId = 'WN-' + Date.now().toString(36).toUpperCase();

  // Save order to localStorage
  const order = {
    id:        orderId,
    customer:  customerData,
    cart:      getCart(),
    payment:   selectedPayment,
    ongkir:    ongkirFee,
    total:     getGrandTotal(),
    timestamp: new Date().toISOString(),
    status:    'pending',
  };
  const orders = JSON.parse(localStorage.getItem('wn_orders') || '[]');
  orders.unshift(order);
  localStorage.setItem('wn_orders', JSON.stringify(orders));

  // Clear cart
  localStorage.removeItem('wn_cart');

  // Go to success
  goStep(4);
  renderSuccessPage(orderId, order);

  // Open WhatsApp
  setTimeout(() => window.open(url, '_blank'), 800);
};

/* ── RENDER SUCCESS PAGE ────────────────────────────────────── */
function renderSuccessPage(orderId, order) {
  const info = document.getElementById('success-info');
  const msg  = document.getElementById('success-msg');
  const payLabel = { qris: 'QRIS', transfer: 'Transfer Bank', cod: 'Bayar di Tempat' };

  if (msg) {
    msg.textContent = selectedPayment === 'cod'
      ? 'Pesanan Anda berhasil dicatat. Pembayaran dilakukan saat barang tiba.'
      : 'Pesanan Anda telah dikirim ke WhatsApp admin. Tim kami akan segera mengkonfirmasi.';
  }

  if (info) {
    info.innerHTML = `
      <div class="confirm-row"><span>No. Pesanan</span><span><strong>${orderId}</strong></span></div>
      <div class="confirm-row"><span>Nama</span><span>${order.customer.nama}</span></div>
      <div class="confirm-row"><span>Metode Bayar</span><span>${payLabel[order.payment]}</span></div>
      <div class="confirm-row"><span>Total</span><span><strong style="color:var(--gold)">${formatRupiah(order.total)}</strong></span></div>
    `;
  }
}

/* ── COPY TEXT (BANK ACCOUNT) ───────────────────────────────── */
window.copyText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Nomor rekening disalin', 'success');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Nomor rekening disalin', 'success');
  });
};

/* ── URL PARAM: AUTO SELECT METHOD ─────────────────────────── */
function checkURLParam() {
  const params = new URLSearchParams(window.location.search);
  const method = params.get('method');
  if (!method) return;

  setTimeout(() => {
    const radio = document.querySelector(`input[name="payment"][value="${method}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, 300);
}

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Theme (already in app.js but reinit for standalone page)
  const saved = localStorage.getItem('wn_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  renderStep1();
  updateStepIndicator(1);
  checkURLParam();

  // If cart is empty on load, show step 1 with empty state
  const cart = getCart();
  if (cart.length === 0) {
    document.getElementById('btn-next-1') &&
      (document.getElementById('btn-next-1').disabled = true);
  }
});
