/* ============================================================
   WARUNG NUSANTARA — admin.js
   Dashboard: auth guard, menu CRUD, orders, promo, settings
   ============================================================ */

'use strict';

/* ── AUTH GUARD ─────────────────────────────────────────────── */
(function() {
  if (localStorage.getItem('wn_admin_auth') !== 'true') {
    window.location.replace('login.html');
  }
  // Session timeout: 8 hours
  const loginTime = parseInt(localStorage.getItem('wn_admin_time') || '0');
  if (Date.now() - loginTime > 8 * 60 * 60 * 1000) {
    localStorage.removeItem('wn_admin_auth');
    window.location.replace('login.html');
  }
})();

/* ── HELPERS ────────────────────────────────────────────────── */
function fmt(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
function uid()  { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function fmtDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'2-digit' })
       + ' ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
}

/* ── DATA STORES ────────────────────────────────────────────── */
function getMenus() {
  const saved = localStorage.getItem('wn_menus');
  if (saved) return JSON.parse(saved);
  // seed from app.js MENU_DATA
  const seed = (window.MENU_DATA || []).map(m => ({ ...m, active: true }));
  localStorage.setItem('wn_menus', JSON.stringify(seed));
  return seed;
}
function saveMenus(data) { localStorage.setItem('wn_menus', JSON.stringify(data)); }

function getOrders()  { return JSON.parse(localStorage.getItem('wn_orders')  || '[]'); }
function saveOrders(d){ localStorage.setItem('wn_orders', JSON.stringify(d)); }

function getPromos()  { return JSON.parse(localStorage.getItem('wn_promos')  || '[]'); }
function savePromos(d){ localStorage.setItem('wn_promos', JSON.stringify(d)); }

function getSettings() {
  return JSON.parse(localStorage.getItem('wn_settings') || JSON.stringify({
    name:'Warung Nusantara', wa:'6281234567890',
    alamat:'Jl. Raya Nusantara No. 12, Jakarta Selatan',
    open:'08.00', close:'21.00', ongkir:5000,
    maps:'https://maps.google.com/?q=Warung+Nusantara',
    username:'admin', password:'nusantara2025',
  }));
}

/* ── PANEL NAVIGATION ───────────────────────────────────────── */
const panelTitles = {
  overview: 'Ringkasan', orders: 'Pesanan Masuk',
  menu: 'Kelola Menu',   promo: 'Promo & Diskon', settings: 'Pengaturan Toko',
};

window.switchPanel = function(name) {
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const panel = document.getElementById(`panel-${name}`);
  if (panel) panel.classList.add('active');
  const link = document.querySelector(`[data-panel="${name}"]`);
  if (link) link.classList.add('active');
  const titleEl = document.getElementById('topbarTitle');
  if (titleEl) titleEl.textContent = panelTitles[name] || name;

  if (name === 'overview') renderOverview();
  if (name === 'orders')   renderOrdersTable();
  if (name === 'menu')     renderMenuTable();
  if (name === 'promo')    renderPromoTable();
  if (name === 'settings') loadSettings();

  // Close sidebar on mobile
  if (window.innerWidth < 900) {
    document.getElementById('dashSidebar').classList.remove('open');
  }
};

/* ── OVERVIEW ───────────────────────────────────────────────── */
function renderOverview() {
  const menus  = getMenus();
  const orders = getOrders();
  const today  = new Date().toDateString();

  const todayOrders   = orders.filter(o => new Date(o.timestamp).toDateString() === today);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const todayRevenue  = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalRevenue  = orders.reduce((s, o) => s + (o.total || 0), 0);

  // Stat cards
  const stats = [
    { label:'Total Menu', value: menus.filter(m=>m.active).length, icon:'utensils', color:'icon-gold', sub:`${menus.length} total menu` },
    { label:'Pesanan Hari Ini', value: todayOrders.length, icon:'receipt', color:'icon-blue', sub:`${pendingOrders.length} menunggu konfirmasi` },
    { label:'Pendapatan Hari Ini', value: fmt(todayRevenue), icon:'trending-up', color:'icon-green', sub:'dari pesanan terkonfirmasi' },
    { label:'Total Pendapatan', value: fmt(totalRevenue), icon:'banknote', color:'icon-red', sub:`dari ${orders.length} pesanan` },
  ];

  const grid = document.getElementById('statGrid');
  if (grid) {
    grid.innerHTML = stats.map(s => `
      <div class="stat-card">
        <div class="stat-card-icon ${s.color}"><i data-lucide="${s.icon}"></i></div>
        <div class="stat-card-label">${s.label}</div>
        <div class="stat-card-value">${s.value}</div>
        <div class="stat-card-sub">${s.sub}</div>
      </div>`).join('');
  }

  // Recent orders
  const tbody = document.getElementById('recent-orders-body');
  if (tbody) {
    const recent = orders.slice(0, 5);
    tbody.innerHTML = recent.length ? recent.map(o => `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.customer?.nama || '-'}</td>
        <td>${fmt(o.total || 0)}</td>
        <td>${statusBadge(o.status)}</td>
      </tr>`).join('') :
      '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1.5rem">Belum ada pesanan</td></tr>';
  }

  // Top menu
  const menuBody = document.getElementById('top-menu-body');
  if (menuBody) {
    const catLabel = { nasi:'Nasi & Lauk', soto:'Soto & Sup', gorengan:'Gorengan', minuman:'Minuman', promo:'Promo' };
    menuBody.innerHTML = menus.filter(m => m.active).slice(0, 6).map(m => `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td>${catLabel[m.category] || m.category}</td>
        <td>${fmt(m.price)}</td>
        <td><span class="status-badge ${m.active ? 'badge-active' : 'badge-off'}">${m.active ? 'Aktif' : 'Nonaktif'}</span></td>
      </tr>`).join('');
  }

  // Order badge
  const badge = document.getElementById('badge-orders');
  if (badge) {
    badge.textContent = pendingOrders.length;
    badge.style.display = pendingOrders.length ? 'inline-flex' : 'none';
  }

  lucide.createIcons();
}

function statusBadge(status) {
  const map = {
    pending: ['badge-pending', 'Pending'],
    confirmed: ['badge-active', 'Dikonfirmasi'],
    done: ['badge-done', 'Selesai'],
    cancelled: ['badge-cancel', 'Dibatalkan'],
  };
  const [cls, label] = map[status] || ['badge-off', status];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

/* ── ORDERS TABLE ───────────────────────────────────────────── */
function renderOrdersTable(filter = '') {
  let orders = getOrders();
  if (filter) {
    const q = filter.toLowerCase();
    orders = orders.filter(o =>
      (o.id || '').toLowerCase().includes(q) ||
      (o.customer?.nama || '').toLowerCase().includes(q)
    );
  }

  const tbody = document.getElementById('orders-body');
  if (!tbody) return;

  const payLabel = { qris:'QRIS', transfer:'Transfer Bank', cod:'COD' };

  tbody.innerHTML = orders.length ? orders.map(o => `
    <tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer?.nama || '-'}</td>
      <td>${fmt(o.total || 0)}</td>
      <td>${payLabel[o.payment] || o.payment || '-'}</td>
      <td style="font-size:0.72rem;color:var(--text-muted)">${fmtDate(o.timestamp)}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)" style="background:var(--bg-3);border:1px solid var(--border);border-radius:4px;padding:3px 6px;font-size:0.72rem;color:var(--text-primary);cursor:pointer;outline:none">
          <option value="pending"   ${o.status==='pending'   ?'selected':''}>Pending</option>
          <option value="confirmed" ${o.status==='confirmed' ?'selected':''}>Dikonfirmasi</option>
          <option value="done"      ${o.status==='done'      ?'selected':''}>Selesai</option>
          <option value="cancelled" ${o.status==='cancelled' ?'selected':''}>Dibatalkan</option>
        </select>
      </td>
      <td>
        <div class="td-actions">
          <button class="action-btn view" onclick="viewOrder('${o.id}')" title="Detail"><i data-lucide="eye"></i></button>
          <button class="action-btn del"  onclick="deleteOrder('${o.id}')" title="Hapus"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>`).join('') :
    '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem">Tidak ada pesanan ditemukan</td></tr>';

  lucide.createIcons();
}

window.filterOrders = function() {
  renderOrdersTable(document.getElementById('searchOrder')?.value || '');
};

window.updateOrderStatus = function(id, status) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx > -1) { orders[idx].status = status; saveOrders(orders); }
  showToast('Status pesanan diperbarui', 'success');
  renderOverview();
};

window.viewOrder = function(id) {
  const order = getOrders().find(o => o.id === id);
  if (!order) return;
  const body = document.getElementById('orderModalBody');
  const payLabel = { qris:'QRIS', transfer:'Transfer Bank', cod:'Bayar di Tempat' };
  const delLabel = { delivery:'Antar ke Alamat', pickup:'Ambil Sendiri', dinein:'Makan di Tempat' };

  const itemLines = (order.cart || []).map(i =>
    `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);">
      <span>${i.name} x${i.qty}</span>
      <span>${fmt(i.price * i.qty)}</span>
    </div>`).join('');

  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.82rem">
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">No. Pesanan</span><strong>${order.id}</strong></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Waktu</span><span>${fmtDate(order.timestamp)}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Nama</span><span>${order.customer?.nama || '-'}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">WhatsApp</span><span>${order.customer?.hp || '-'}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Metode</span><span>${delLabel[order.customer?.delivery] || '-'}</span></div>
      ${order.customer?.delivery === 'delivery' ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Alamat</span><span style="text-align:right;max-width:200px">${order.customer?.alamat}</span></div>` : ''}
      ${order.customer?.catatan ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Catatan</span><span>${order.customer.catatan}</span></div>` : ''}
      <div style="margin:0.5rem 0;border-top:1px solid var(--border);padding-top:0.5rem"><strong>Item Pesanan:</strong></div>
      ${itemLines}
      <div style="display:flex;justify-content:space-between;padding-top:0.5rem"><span style="color:var(--text-muted)">Ongkir</span><span>${order.ongkir > 0 ? fmt(order.ongkir) : 'Gratis'}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Pembayaran</span><span>${payLabel[order.payment] || order.payment}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:0.95rem;margin-top:4px"><strong>Total</strong><strong style="color:var(--gold)">${fmt(order.total)}</strong></div>
    </div>`;

  const waBtn = document.getElementById('orderWABtn');
  waBtn.onclick = () => {
    const msg = encodeURIComponent(`Halo ${order.customer?.nama}, pesanan Anda *${order.id}* sudah kami terima. Total: ${fmt(order.total)}. Terima kasih!`);
    window.open(`https://wa.me/${order.customer?.hp?.replace(/\D/g,'')}?text=${msg}`, '_blank');
  };

  openModal('orderModal');
};

window.deleteOrder = function(id) {
  openConfirm('Hapus pesanan ini?', 'Data pesanan akan dihapus permanen.', () => {
    const orders = getOrders().filter(o => o.id !== id);
    saveOrders(orders);
    renderOrdersTable();
    renderOverview();
    showToast('Pesanan dihapus', 'success');
  });
};

window.clearAllOrders = function() {
  openConfirm('Bersihkan semua pesanan?', 'Seluruh riwayat pesanan akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.', () => {
    saveOrders([]);
    renderOrdersTable();
    renderOverview();
    showToast('Semua pesanan dihapus', 'success');
  });
};

/* ── MENU TABLE ─────────────────────────────────────────────── */
function renderMenuTable(filter = '') {
  let menus = getMenus();
  if (filter) {
    const q = filter.toLowerCase();
    menus = menus.filter(m => m.name.toLowerCase().includes(q) || m.region.toLowerCase().includes(q));
  }

  const tbody = document.getElementById('menu-body');
  if (!tbody) return;

  const catLabel = { nasi:'Nasi & Lauk', soto:'Soto & Sup', gorengan:'Gorengan', minuman:'Minuman', promo:'Promo' };
  const badgeLabel = { new:'Baru', hot:'Laris', promo:'Promo', '':'-' };

  tbody.innerHTML = menus.length ? menus.map(m => `
    <tr>
      <td><strong>${m.name}</strong><br/><span style="font-size:0.7rem;color:var(--text-muted)">${m.desc ? m.desc.slice(0,40)+'...' : ''}</span></td>
      <td>${m.region}</td>
      <td>${catLabel[m.category] || m.category}</td>
      <td>${fmt(m.price)}${m.oldPrice ? `<br/><span style="text-decoration:line-through;color:var(--text-muted);font-size:0.7rem">${fmt(m.oldPrice)}</span>` : ''}</td>
      <td>${m.badge ? `<span class="status-badge badge-${m.badge === 'new' ? 'active' : m.badge === 'hot' ? 'pending' : 'cancel'}">${badgeLabel[m.badge]}</span>` : '-'}</td>
      <td>
        <div class="toggle" style="cursor:pointer" onclick="toggleMenuActive(${m.id || "'"+m.name+"'"})" title="Toggle aktif">
          <div class="toggle ${m.active ? 'on' : ''}" onclick="toggleMenuActive('${m.id || m.name}')"></div>
        </div>
        <span class="status-badge ${m.active ? 'badge-active' : 'badge-off'}" style="margin-top:4px">${m.active ? 'Aktif' : 'Nonaktif'}</span>
      </td>
      <td>
        <div class="td-actions">
          <button class="action-btn edit" onclick="openMenuModal('${m.id || m.name}')" title="Edit"><i data-lucide="pencil"></i></button>
          <button class="action-btn del"  onclick="deleteMenu('${m.id || m.name}')" title="Hapus"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>`).join('') :
    '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem">Tidak ada menu ditemukan</td></tr>';

  lucide.createIcons();
}

window.filterMenuTable = function() {
  renderMenuTable(document.getElementById('searchMenu')?.value || '');
};

window.toggleMenuActive = function(id) {
  const menus = getMenus();
  const m = menus.find(x => String(x.id) === String(id) || x.name === id);
  if (m) { m.active = !m.active; saveMenus(menus); renderMenuTable(); renderOverview(); }
};

window.openMenuModal = function(id) {
  document.getElementById('menuModalTitle').textContent = id ? 'Edit Menu' : 'Tambah Menu Baru';
  document.getElementById('menu-edit-id').value = id || '';

  // Clear
  ['m-name','m-region','m-price','m-old-price','m-desc'].forEach(i => {
    const el = document.getElementById(i);
    if (el) el.value = '';
  });
  document.getElementById('m-cat').value   = 'nasi';
  document.getElementById('m-badge').value = '';
  document.getElementById('m-icon').value  = 'nasi';
  document.getElementById('m-active').classList.add('on');

  if (id) {
    const menus = getMenus();
    const m = menus.find(x => String(x.id) === String(id) || x.name === id);
    if (m) {
      document.getElementById('m-name').value      = m.name;
      document.getElementById('m-region').value    = m.region;
      document.getElementById('m-price').value     = m.price;
      document.getElementById('m-old-price').value = m.oldPrice || '';
      document.getElementById('m-desc').value      = m.desc || '';
      document.getElementById('m-cat').value       = m.category;
      document.getElementById('m-badge').value     = m.badge || '';
      document.getElementById('m-icon').value      = m.icon || 'nasi';
      if (!m.active) document.getElementById('m-active').classList.remove('on');
    }
  }

  openModal('menuModal');
};

window.saveMenu = function() {
  const name  = document.getElementById('m-name').value.trim();
  const region = document.getElementById('m-region').value.trim();
  const price  = parseInt(document.getElementById('m-price').value);

  if (!name || !region || !price) {
    showToast('Nama, daerah, dan harga wajib diisi', 'error'); return;
  }

  const menus   = getMenus();
  const editId  = document.getElementById('menu-edit-id').value;
  const isActive = document.getElementById('m-active').classList.contains('on');

  const menuItem = {
    id:       editId ? (parseInt(editId) || editId) : Date.now(),
    name, region, price,
    oldPrice:  parseInt(document.getElementById('m-old-price').value) || null,
    category:  document.getElementById('m-cat').value,
    badge:     document.getElementById('m-badge').value || null,
    icon:      document.getElementById('m-icon').value,
    desc:      document.getElementById('m-desc').value.trim(),
    active:    isActive,
  };

  if (editId) {
    const idx = menus.findIndex(x => String(x.id) === String(editId) || x.name === editId);
    if (idx > -1) menus[idx] = menuItem; else menus.push(menuItem);
  } else {
    menus.push(menuItem);
  }

  saveMenus(menus);

  // Sync to MENU_DATA for live site
  if (window.MENU_DATA) window.MENU_DATA = menus;

  closeModal('menuModal');
  renderMenuTable();
  renderOverview();
  showToast(editId ? 'Menu berhasil diperbarui' : 'Menu baru ditambahkan', 'success');
};

window.deleteMenu = function(id) {
  openConfirm('Hapus menu ini?', 'Menu akan dihapus dari daftar.', () => {
    const menus = getMenus().filter(m => String(m.id) !== String(id) && m.name !== id);
    saveMenus(menus);
    if (window.MENU_DATA) window.MENU_DATA = menus;
    renderMenuTable();
    renderOverview();
    showToast('Menu dihapus', 'success');
  });
};

/* ── PROMO TABLE ────────────────────────────────────────────── */
function renderPromoTable() {
  const promos = getPromos();
  const tbody  = document.getElementById('promo-body');
  if (!tbody) return;

  tbody.innerHTML = promos.length ? promos.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td style="max-width:200px;font-size:0.78rem;color:var(--text-secondary)">${p.desc || '-'}</td>
      <td>${p.discount ? p.discount + '%' : '-'}</td>
      <td style="font-size:0.78rem">${p.until ? new Date(p.until).toLocaleDateString('id-ID') : '-'}</td>
      <td><span class="status-badge ${p.active ? 'badge-active' : 'badge-off'}">${p.active ? 'Aktif' : 'Nonaktif'}</span></td>
      <td>
        <div class="td-actions">
          <button class="action-btn edit" onclick="openPromoModal('${p.id}')" title="Edit"><i data-lucide="pencil"></i></button>
          <button class="action-btn del"  onclick="deletePromo('${p.id}')" title="Hapus"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>`).join('') :
    '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem">Belum ada promo</td></tr>';

  lucide.createIcons();
}

window.openPromoModal = function(id) {
  document.getElementById('promoModalTitle').textContent = id ? 'Edit Promo' : 'Tambah Promo';
  document.getElementById('promo-edit-id').value = id || '';
  ['p-name','p-desc','p-disc','p-until'].forEach(i => {
    const el = document.getElementById(i); if (el) el.value = '';
  });
  document.getElementById('p-active').classList.add('on');

  if (id) {
    const p = getPromos().find(x => x.id === id);
    if (p) {
      document.getElementById('p-name').value  = p.name;
      document.getElementById('p-desc').value  = p.desc || '';
      document.getElementById('p-disc').value  = p.discount || '';
      document.getElementById('p-until').value = p.until || '';
      if (!p.active) document.getElementById('p-active').classList.remove('on');
    }
  }
  openModal('promoModal');
};

window.savePromo = function() {
  const name = document.getElementById('p-name').value.trim();
  if (!name) { showToast('Nama promo wajib diisi', 'error'); return; }

  const promos  = getPromos();
  const editId  = document.getElementById('promo-edit-id').value;
  const isActive = document.getElementById('p-active').classList.contains('on');

  const item = {
    id:       editId || uid(),
    name,
    desc:     document.getElementById('p-desc').value.trim(),
    discount: parseInt(document.getElementById('p-disc').value) || null,
    until:    document.getElementById('p-until').value || null,
    active:   isActive,
  };

  if (editId) {
    const idx = promos.findIndex(p => p.id === editId);
    if (idx > -1) promos[idx] = item; else promos.push(item);
  } else {
    promos.push(item);
  }

  savePromos(promos);
  closeModal('promoModal');
  renderPromoTable();
  showToast(editId ? 'Promo diperbarui' : 'Promo ditambahkan', 'success');
};

window.deletePromo = function(id) {
  openConfirm('Hapus promo ini?', 'Data promo akan dihapus.', () => {
    savePromos(getPromos().filter(p => p.id !== id));
    renderPromoTable();
    showToast('Promo dihapus', 'success');
  });
};

/* ── SETTINGS ───────────────────────────────────────────────── */
function loadSettings() {
  const s = getSettings();
  const map = {
    'set-name': s.name, 'set-wa': s.wa, 'set-alamat': s.alamat,
    'set-open': s.open, 'set-close': s.close,
    'set-ongkir': s.ongkir, 'set-maps': s.maps,
    'set-user': s.username,
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  });
}

window.saveSettings = function() {
  const s = getSettings();
  const updated = {
    ...s,
    name:    document.getElementById('set-name')?.value.trim()   || s.name,
    wa:      document.getElementById('set-wa')?.value.trim()     || s.wa,
    alamat:  document.getElementById('set-alamat')?.value.trim() || s.alamat,
    open:    document.getElementById('set-open')?.value.trim()   || s.open,
    close:   document.getElementById('set-close')?.value.trim()  || s.close,
    ongkir:  parseInt(document.getElementById('set-ongkir')?.value) || s.ongkir,
    maps:    document.getElementById('set-maps')?.value.trim()   || s.maps,
  };
  localStorage.setItem('wn_settings', JSON.stringify(updated));
  showToast('Pengaturan disimpan', 'success');
};

window.changePassword = function() {
  const user  = document.getElementById('set-user')?.value.trim();
  const pass  = document.getElementById('set-pass')?.value;
  const pass2 = document.getElementById('set-pass2')?.value;

  if (!user) { showToast('Username tidak boleh kosong', 'error'); return; }
  if (pass && pass !== pass2) { showToast('Password tidak cocok', 'error'); return; }

  const s = getSettings();
  s.username = user;
  if (pass) s.password = pass;
  localStorage.setItem('wn_settings', JSON.stringify(s));

  document.getElementById('set-pass').value  = '';
  document.getElementById('set-pass2').value = '';
  showToast('Kredensial admin diperbarui. Berlaku saat login berikutnya.', 'success');
};

/* ── EXPORT / IMPORT ────────────────────────────────────────── */
window.exportData = function() {
  const data = {
    menus:    getMenus(),
    orders:   getOrders(),
    promos:   getPromos(),
    settings: getSettings(),
    exported: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `warung-nusantara-backup-${Date.now()}.json`;
  a.click();
  showToast('Data berhasil diekspor', 'success');
};

window.importData = function(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.menus)    { saveMenus(data.menus);     if (window.MENU_DATA) window.MENU_DATA = data.menus; }
      if (data.orders)   saveOrders(data.orders);
      if (data.promos)   savePromos(data.promos);
      if (data.settings) localStorage.setItem('wn_settings', JSON.stringify(data.settings));
      renderOverview();
      showToast('Data berhasil diimpor', 'success');
    } catch {
      showToast('File tidak valid. Pastikan format JSON benar.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
};

/* ── MODAL HELPERS ──────────────────────────────────────────── */
window.openModal = function(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; lucide.createIcons(); }
};
window.closeModal = function(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
};

// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});

let _confirmCb = null;
function openConfirm(title, msg, cb) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent   = msg;
  _confirmCb = cb;
  openModal('confirmModal');
}
document.getElementById('confirmOkBtn')?.addEventListener('click', () => {
  if (_confirmCb) { _confirmCb(); _confirmCb = null; }
  closeModal('confirmModal');
});

/* ── SIDEBAR TOGGLE ─────────────────────────────────────────── */
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('dashSidebar').classList.toggle('open');
});

/* ── LOGOUT ─────────────────────────────────────────────────── */
window.doLogout = function() {
  openConfirm('Keluar dari Dashboard?', 'Anda akan diarahkan ke halaman login.', () => {
    localStorage.removeItem('wn_admin_auth');
    localStorage.removeItem('wn_admin_time');
    window.location.replace('login.html');
  });
};

/* ── THEME ──────────────────────────────────────────────────── */
function initAdminTheme() {
  const btn   = document.getElementById('themeToggle');
  const saved = localStorage.getItem('wn_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const icon  = btn?.querySelector('svg');
  if (icon) icon.setAttribute('data-lucide', saved === 'dark' ? 'sun' : 'moon');

  btn?.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('wn_theme', next);
    const i = btn.querySelector('svg');
    if (i) i.setAttribute('data-lucide', next === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
  });
}

/* ── LOGIN TIME ─────────────────────────────────────────────── */
function setLoginTime() {
  const t  = parseInt(localStorage.getItem('wn_admin_time') || Date.now());
  const el = document.getElementById('login-time');
  if (el) el.textContent = 'Login ' + new Date(t).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
}

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initAdminTheme();
  setLoginTime();
  renderOverview();
});
