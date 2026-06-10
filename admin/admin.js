/**
 * QUANTUM ADMIN DASHBOARD LOGIC
 */

let users = [
  { id: 1, name: 'Eleanor Vance', email: 'eleanor.vance@quantum.io', role: 'Admin', status: 'Active', joinedDate: '2026-05-14' },
  { id: 2, name: 'Marcus Sterling', email: 'm.sterling@quantum.io', role: 'Customer', status: 'Active', joinedDate: '2026-05-28' },
  { id: 3, name: 'Sienna Brooks', email: 'sienna.b@quantum.io', role: 'Support', status: 'Pending', joinedDate: '2026-06-02' },
  { id: 4, name: 'Julian Cross', email: 'j.cross@gmail.com', role: 'Customer', status: 'Suspended', joinedDate: '2026-04-19' },
  { id: 5, name: 'Aria Thorne', email: 'aria.t@quantum.io', role: 'Customer', status: 'Active', joinedDate: '2026-06-08' }
];

let currentSearchQuery = '';

const userTableBody = document.getElementById('user-table-body');
const userSearchInput = document.getElementById('user-search');
const globalSearchInput = document.getElementById('global-search');
const totalUsersStat = document.getElementById('stat-total-users');
const userTrendPct = document.getElementById('stat-user-trend-pct');
const showingCountEl = document.getElementById('showing-count');
const totalCountEl = document.getElementById('total-count');
const addUserModal = document.getElementById('add-user-modal');
const btnOpenModal = document.getElementById('btn-open-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const addUserForm = document.getElementById('add-user-form');
const toastContainer = document.getElementById('toast-container');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
const dashboardTitle = document.getElementById('dashboard-title');
const dashboardSubtitle = document.getElementById('dashboard-subtitle');

function showToast(message, type = 'success') {
  const icons = { success: 'check-circle', danger: 'alert-triangle', warning: 'alert-circle', info: 'info' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="toast-icon" data-lucide="${icons[type]||'info'}"></i><div class="toast-content">${message}</div><i class="toast-close" data-lucide="x"></i>`;
  toastContainer.appendChild(toast);
  lucide.createIcons();
  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
  setTimeout(() => removeToast(toast), 4000);
}

function removeToast(toast) {
  if (toast.classList.contains('removing')) return;
  toast.classList.add('removing');
  toast.addEventListener('animationend', () => toast.remove());
}

function updateStats() {
  const count = users.length;
  totalUsersStat.textContent = count.toLocaleString();
  totalCountEl.textContent = count;
  const baseline = 4;
  const pct = ((count - baseline) / baseline) * 100;
  userTrendPct.textContent = pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
  const trendEl = userTrendPct.parentElement;
  trendEl.className = pct >= 0 ? 'stat-trend positive' : 'stat-trend negative';
  trendEl.querySelector('i').setAttribute('data-lucide', pct >= 0 ? 'trending-up' : 'trending-down');
  lucide.createIcons();
}

function renderUsers() {
  userTableBody.innerHTML = '';
  const filtered = users.filter(u => {
    const q = currentSearchQuery.toLowerCase().trim();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.status.toLowerCase().includes(q);
  });
  showingCountEl.textContent = filtered.length;
  if (filtered.length === 0) {
    userTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px"><i data-lucide="search-code" style="width:28px;height:28px;display:block;margin:0 auto 8px"></i>No users match your filter criteria.</td></tr>`;
    lucide.createIcons(); return;
  }
  filtered.forEach(user => {
    const tr = document.createElement('tr');
    const bc = user.status === 'Suspended' ? 'badge-suspended' : user.status === 'Pending' ? 'badge-pending' : 'badge-active';
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    const joined = new Date(user.joinedDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    tr.innerHTML = `
      <td><div class="user-cell"><div class="user-avatar-sm">${initials}</div><div class="user-details"><span style="font-weight:500">${user.name}</span><span class="user-email">${user.email}</span></div></div></td>
      <td><span style="font-weight:500">${user.role}</span></td>
      <td><span class="badge ${bc}" style="cursor:pointer" title="Click to cycle status" data-id="${user.id}">${user.status}</span></td>
      <td><span style="color:var(--text-secondary)">${joined}</span></td>
      <td style="text-align:right"><div style="display:inline-flex;gap:8px">
        <button class="btn-icon-only btn-edit" title="Cycle Role" data-id="${user.id}"><i data-lucide="shield-alert" style="width:16px;height:16px"></i></button>
        <button class="btn-icon-only btn-danger-link btn-delete" title="Delete" data-id="${user.id}"><i data-lucide="trash-2" style="width:16px;height:16px"></i></button>
      </div></td>`;
    userTableBody.appendChild(tr);
  });
  lucide.createIcons();
  attachTableEvents();
}

function attachTableEvents() {
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const idx = users.findIndex(u => u.id === id);
      if (idx > -1) { const name = users[idx].name; users.splice(idx,1); showToast(`"${name}" deleted`, 'danger'); updateStats(); renderUsers(); }
    });
  });
  document.querySelectorAll('.badge[data-id]').forEach(badge => {
    badge.addEventListener('click', () => {
      const user = users.find(u => u.id === parseInt(badge.dataset.id));
      if (user) { const s = user.status; user.status = s==='Active'?'Pending':s==='Pending'?'Suspended':'Active'; showToast(`${user.name} → ${user.status}`, 'info'); renderUsers(); }
    });
  });
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const user = users.find(u => u.id === parseInt(btn.dataset.id));
      if (user) { const r = user.role; user.role = r==='Customer'?'Support':r==='Support'?'Admin':'Customer'; showToast(`${user.name} → ${user.role}`, 'success'); renderUsers(); }
    });
  });
}

function openModal() { addUserModal.classList.add('open'); document.getElementById('new-user-name').focus(); }
function closeModal() { addUserModal.classList.remove('open'); addUserForm.reset(); }

function setupEventListeners() {
  userSearchInput.addEventListener('input', e => { currentSearchQuery = e.target.value; renderUsers(); });
  globalSearchInput.addEventListener('input', e => { currentSearchQuery = e.target.value; userSearchInput.value = currentSearchQuery; renderUsers(); });
  btnOpenModal.addEventListener('click', openModal);
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);
  addUserModal.addEventListener('click', e => { if (e.target === addUserModal) closeModal(); });
  addUserForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('new-user-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim();
    const role = document.getElementById('new-user-role').value;
    const status = document.getElementById('new-user-status').value;
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) { showToast(`${email} already registered!`, 'warning'); return; }
    users.push({ id: users.length ? Math.max(...users.map(u=>u.id))+1 : 1, name, email, role, status, joinedDate: new Date().toISOString().split('T')[0] });
    showToast(`Account created for ${name}!`, 'success');
    closeModal(); updateStats(); renderUsers();
  });
  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const name = item.querySelector('span').textContent;
      dashboardTitle.textContent = `${name} Administration`;
      dashboardSubtitle.textContent = `Viewing database resources for: ${name.toLowerCase()}`;
      showToast(`Viewing: ${name}`, 'info');
    });
  });
}

function init() { lucide.createIcons(); updateStats(); renderUsers(); setupEventListeners(); showToast('Welcome back, Admin Alex!', 'info'); }
window.addEventListener('DOMContentLoaded', init);
