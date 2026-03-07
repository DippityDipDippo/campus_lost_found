/* ─────────────────────────────────────────────────
   shared.js — utilities used by every page
───────────────────────────────────────────────── */

const API = '/api/items';

// ── ESCAPE HTML (XSS prevention on frontend) ────
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── TOAST NOTIFICATION ──────────────────────────
function showToast(msg, type = 'default') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3200);
}

// ── API FETCH WRAPPER ───────────────────────────
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── DEBOUNCE ────────────────────────────────────
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── ITEM CARD HTML ──────────────────────────────
function cardHTML(item) {
  const cat    = item.category.toLowerCase();
  const status = item.status.toLowerCase();
  const date   = new Date(item.date_occurred).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
  return `
    <div class="item-card ${cat}" data-id="${item.id}">
      <div class="card-top">
        <span class="card-title">${escapeHTML(item.title)}</span>
        <span class="badge badge-${cat}">${item.category}</span>
      </div>
      <p class="card-desc">${escapeHTML(item.description)}</p>
      <div class="card-meta">
        <div class="meta-item"><span class="meta-icon">📍</span>${escapeHTML(item.location)}</div>
        <div class="meta-item"><span class="meta-icon">📅</span>${date}</div>
        <div class="meta-item"><span class="meta-icon">●</span>
          <span class="badge badge-${status}">${item.status}</span>
        </div>
      </div>
      <div class="card-actions" onclick="event.stopPropagation()">
        <button class="btn-sm btn-edit"   data-id="${item.id}">Edit</button>
        <button class="btn-sm danger btn-delete" data-id="${item.id}">Delete</button>
      </div>
    </div>`;
}

// ── RENDER GRID ─────────────────────────────────
function renderGrid(gridId, items) {
  const grid = document.getElementById(gridId);
  if (!items.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>No items found.</p></div>`;
    return;
  }
  grid.innerHTML = items.map(cardHTML).join('');

  grid.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-actions')) return;
      openModal(card.dataset.id);
    });
  });
  grid.querySelectorAll('.btn-edit').forEach(btn =>
    btn.addEventListener('click', () => {
      window.location.href = `/report.html?edit=${btn.dataset.id}`;
    })
  );
  grid.querySelectorAll('.btn-delete').forEach(btn =>
    btn.addEventListener('click', () => deleteItem(btn.dataset.id, gridId))
  );
}

// ── ERROR STATE ─────────────────────────────────
function errorHTML(msg) {
  return `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${escapeHTML(msg)}</p></div>`;
}

// ── DELETE ──────────────────────────────────────
async function deleteItem(id, gridId) {
  if (!confirm('Are you sure you want to delete this report? This cannot be undone.')) return;
  try {
    await apiFetch(`${API}/${id}`, { method: 'DELETE' });
    showToast('Report deleted successfully', 'success');
    // Re-trigger load on the current page
    if (typeof reloadGrid === 'function') reloadGrid();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ── MODAL ───────────────────────────────────────
async function openModal(id) {
  try {
    const data = await apiFetch(`${API}/${id}`);
    const item = data.data;
    const date    = new Date(item.date_occurred).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });
    const created = new Date(item.created_at).toLocaleString('en-MY');
    const cat     = item.category.toLowerCase();
    const statusClass = item.status.toLowerCase();

    document.getElementById('modalBody').innerHTML = `
      <div class="modal-badge-row">
        <span class="badge badge-${cat}">${item.category}</span>
        <span class="badge badge-${statusClass}">${item.status}</span>
      </div>
      <h2 class="modal-title">${escapeHTML(item.title)}</h2>
      <p class="modal-desc">${escapeHTML(item.description)}</p>
      <div class="modal-details">
        <div class="modal-detail-row"><span class="modal-detail-label">📍 Location</span><span>${escapeHTML(item.location)}</span></div>
        <div class="modal-detail-row"><span class="modal-detail-label">📅 Date</span><span>${date}</span></div>
        <div class="modal-detail-row"><span class="modal-detail-label">👤 Contact</span><span>${escapeHTML(item.contact_name)}</span></div>
        <div class="modal-detail-row"><span class="modal-detail-label">✉️ Email</span><span>${escapeHTML(item.contact_email)}</span></div>
        ${item.contact_phone ? `<div class="modal-detail-row"><span class="modal-detail-label">📞 Phone</span><span>${escapeHTML(item.contact_phone)}</span></div>` : ''}
        <div class="modal-detail-row"><span class="modal-detail-label">🕒 Reported</span><span>${created}</span></div>
      </div>
      <div class="modal-actions">
        <select class="status-select" id="modalStatus">
          <option ${item.status === 'Active'   ? 'selected' : ''}>Active</option>
          <option ${item.status === 'Claimed'  ? 'selected' : ''}>Claimed</option>
          <option ${item.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
        <button class="btn btn-primary" id="modalUpdateStatus" data-id="${item.id}">Update Status</button>
        <a href="/report.html?edit=${item.id}" class="btn btn-outline">Edit</a>
      </div>`;

    document.getElementById('modalUpdateStatus').addEventListener('click', async (e) => {
      const newStatus = document.getElementById('modalStatus').value;
      try {
        await apiFetch(`${API}/${e.target.dataset.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus })
        });
        showToast(`Status updated to ${newStatus}`, 'success');
        closeModal();
        if (typeof reloadGrid === 'function') reloadGrid();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    document.getElementById('modalOverlay').classList.add('open');
  } catch (e) {
    showToast('Could not load item details', 'error');
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// Wire up modal close button and overlay click (if modal exists on this page)
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('modalClose');
  const overlay  = document.getElementById('modalOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay)  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (hamburger) hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'));
});
