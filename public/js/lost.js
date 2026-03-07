/* ─────────────────────────────────────────────────
   lost.js — logic for lost.html
───────────────────────────────────────────────── */

async function loadLost() {
  const grid = document.getElementById('lostGrid');
  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  try {
    const q = document.getElementById('lostSearch').value;
    const s = document.getElementById('lostStatus').value;
    const params = new URLSearchParams({ category: 'Lost' });
    if (s) params.set('status', s);
    if (q) params.set('search', q);
    const data = await apiFetch(`${API}?${params}`);
    renderGrid('lostGrid', data.data || []);
  } catch (e) {
    document.getElementById('lostGrid').innerHTML = errorHTML(e.message);
  }
}

// Called by shared.js after delete/status update
function reloadGrid() { loadLost(); }

document.addEventListener('DOMContentLoaded', () => {
  loadLost();
  document.getElementById('lostSearch').addEventListener('input', debounce(loadLost, 300));
  document.getElementById('lostStatus').addEventListener('change', loadLost);
});
