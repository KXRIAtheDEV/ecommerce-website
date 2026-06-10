/**
 * QUANTUM CUSTOMER PORTAL LOGIC
 */

let profile = {
  firstName: 'Eleanor', lastName: 'Vance',
  email: 'eleanor.vance@quantum.io', phone: '+1 (555) 204-8812',
  address: '142 Orion Avenue, Suite 7', city: 'San Francisco', zip: '94107',
  points: 3850,
};

let transactions = [
  { id: 'QTX-88412', items: 'Wireless Headphones Pro', status: 'Delivered', date: '2026-06-04', amount: 149.99 },
  { id: 'QTX-88391', items: 'Mechanical Keyboard RGB', status: 'Shipped',   date: '2026-06-07', amount: 89.50  },
  { id: 'QTX-88376', items: 'USB-C Hub (7-in-1)',      status: 'Processing',date: '2026-06-09', amount: 45.00  },
  { id: 'QTX-88254', items: 'Ergonomic Mouse + Pad',   status: 'Delivered', date: '2026-05-28', amount: 64.99  },
  { id: 'QTX-88103', items: 'Smart LED Desk Lamp',     status: 'Refunded',  date: '2026-05-15', amount: -34.99 },
  { id: 'QTX-87990', items: 'Portable SSD 1TB',        status: 'Delivered', date: '2026-05-08', amount: 119.00 },
  { id: 'QTX-87820', items: 'Webcam 4K Ultra HD',      status: 'Delivered', date: '2026-04-29', amount: 198.00 },
];

let isEditing = false;
let txQuery = '';

const heroName = document.getElementById('hero-name');
const heroEmail = document.getElementById('hero-email');
const heroAvatar = document.getElementById('hero-avatar');
const sidebarName = document.getElementById('sidebar-user-name');
const sidebarAvatar = document.getElementById('customer-avatar-sidebar');
const statOrders = document.getElementById('stat-orders');
const statSpent = document.getElementById('stat-spent');
const statPoints = document.getElementById('stat-points');
const fieldFirstName = document.getElementById('field-first-name');
const fieldLastName = document.getElementById('field-last-name');
const fieldEmail = document.getElementById('field-email');
const fieldPhone = document.getElementById('field-phone');
const fieldAddress = document.getElementById('field-address');
const fieldCity = document.getElementById('field-city');
const fieldZip = document.getElementById('field-zip');
const formActions = document.getElementById('form-actions');
const profileForm = document.getElementById('profile-form');
const btnEditProfile = document.getElementById('btn-edit-profile');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const txTableBody = document.getElementById('tx-table-body');
const txSearch = document.getElementById('tx-search');
const txShowing = document.getElementById('tx-showing');
const txTotal = document.getElementById('tx-total');
const txTotalSpent = document.getElementById('tx-total-spent');
const toastContainer = document.getElementById('toast-container');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

function showToast(message, type = 'success') {
  const icons = { success: 'check-circle', danger: 'alert-triangle', warning: 'alert-circle', info: 'info' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="toast-icon" data-lucide="${icons[type]||'info'}"></i><div class="toast-content">${message}</div><i class="toast-close" data-lucide="x"></i>`;
  toastContainer.appendChild(toast);
  lucide.createIcons();
  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
  setTimeout(() => removeToast(toast), 4500);
}

function removeToast(toast) {
  if (toast.classList.contains('removing')) return;
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove());
}

function getInitials(f, l) { return `${f[0]||''}${l[0]||''}`.toUpperCase(); }

function renderProfile() {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = getInitials(profile.firstName, profile.lastName);
  heroName.textContent = fullName;
  heroEmail.textContent = profile.email;
  heroAvatar.textContent = initials;
  sidebarName.textContent = fullName;
  sidebarAvatar.textContent = initials;
  const delivered = transactions.filter(t => t.status === 'Delivered').length;
  const totalSpend = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  statOrders.textContent = delivered;
  statSpent.textContent = `$${totalSpend.toFixed(0)}`;
  statPoints.textContent = profile.points.toLocaleString();
  fieldFirstName.value = profile.firstName;
  fieldLastName.value = profile.lastName;
  fieldEmail.value = profile.email;
  fieldPhone.value = profile.phone;
  fieldAddress.value = profile.address;
  fieldCity.value = profile.city;
  fieldZip.value = profile.zip;
}

function enableEditMode() {
  isEditing = true;
  [fieldFirstName,fieldLastName,fieldEmail,fieldPhone,fieldAddress,fieldCity,fieldZip].forEach(f => f.removeAttribute('readonly'));
  formActions.style.display = 'flex';
  btnEditProfile.style.display = 'none';
  fieldFirstName.focus();
  lucide.createIcons();
  showToast('You can now edit your profile details.', 'info');
}

function disableEditMode() {
  isEditing = false;
  [fieldFirstName,fieldLastName,fieldEmail,fieldPhone,fieldAddress,fieldCity,fieldZip].forEach(f => f.setAttribute('readonly', true));
  formActions.style.display = 'none';
  btnEditProfile.style.display = 'inline-flex';
}

function saveProfile() {
  const fn = fieldFirstName.value.trim(), ln = fieldLastName.value.trim(), em = fieldEmail.value.trim();
  if (!fn || !ln) { showToast('First and last name are required.', 'warning'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showToast('Please enter a valid email address.', 'warning'); return; }
  profile.firstName = fn; profile.lastName = ln; profile.email = em;
  profile.phone = fieldPhone.value.trim(); profile.address = fieldAddress.value.trim();
  profile.city = fieldCity.value.trim(); profile.zip = fieldZip.value.trim();
  disableEditMode(); renderProfile();
  showToast('Profile updated successfully!', 'success');
}

function statusBadge(s) { return { Delivered:'badge-active', Shipped:'badge-pending', Processing:'badge-pending', Refunded:'badge-suspended' }[s] || 'badge-pending'; }

function renderTransactions() {
  const filtered = transactions.filter(tx => {
    const q = txQuery.toLowerCase();
    return tx.id.toLowerCase().includes(q) || tx.items.toLowerCase().includes(q) || tx.status.toLowerCase().includes(q);
  });
  txShowing.textContent = filtered.length;
  txTotal.textContent = transactions.length;
  const total = filtered.filter(t => t.amount > 0).reduce((s,t) => s+t.amount, 0);
  txTotalSpent.innerHTML = `Total spent: <strong style="color:var(--text-primary)">$${total.toFixed(2)}</strong>`;
  txTableBody.innerHTML = '';
  if (filtered.length === 0) {
    txTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px"><i data-lucide="package-search" style="width:28px;height:28px;display:block;margin:0 auto 8px"></i>No transactions match your search.</td></tr>`;
    lucide.createIcons(); return;
  }
  filtered.forEach(tx => {
    const tr = document.createElement('tr');
    const amtCls = tx.amount < 0 ? 'tx-amount-negative' : 'tx-amount-positive';
    const amtLbl = tx.amount < 0 ? `−$${Math.abs(tx.amount).toFixed(2)}` : `+$${tx.amount.toFixed(2)}`;
    const dateLbl = new Date(tx.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    tr.innerHTML = `<td><span class="tx-order-id">${tx.id}</span></td><td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tx.items}</td><td><span class="badge ${statusBadge(tx.status)}">${tx.status}</span></td><td style="color:var(--text-secondary)">${dateLbl}</td><td style="text-align:right" class="${amtCls}">${amtLbl}</td>`;
    txTableBody.appendChild(tr);
  });
  lucide.createIcons();
}

function setupNav() {
  const pageMap = {
    profile: { title: 'My Profile', subtitle: 'Manage your personal information and account preferences' },
    orders: { title: 'My Orders', subtitle: 'Track and manage your current and past orders' },
    transactions: { title: 'Transaction History', subtitle: 'View all payments, refunds and billing history' },
    wishlist: { title: 'My Wishlist', subtitle: 'Items you have saved for later' },
    security: { title: 'Security Settings', subtitle: 'Password, two-factor authentication and sessions' },
    notifications: { title: 'Notification Preferences', subtitle: 'Choose what alerts you receive and how' },
  };
  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const meta = pageMap[item.dataset.section] || { title: item.dataset.section, subtitle: '' };
      pageTitle.textContent = meta.title;
      pageSubtitle.textContent = meta.subtitle;
      showToast(`Viewing: ${meta.title}`, 'info');
    });
  });
}

function setupEvents() {
  btnEditProfile.addEventListener('click', enableEditMode);
  btnCancelEdit.addEventListener('click', () => { disableEditMode(); renderProfile(); showToast('Edit cancelled.', 'warning'); });
  profileForm.addEventListener('submit', e => { e.preventDefault(); saveProfile(); });
  txSearch.addEventListener('input', e => { txQuery = e.target.value; renderTransactions(); });
}

function init() { lucide.createIcons(); renderProfile(); renderTransactions(); setupNav(); setupEvents(); showToast(`Welcome back, ${profile.firstName}! 👋`, 'info'); }
window.addEventListener('DOMContentLoaded', init);
