/* ─────────────────────────────────────────────────
   found.js — logic for found.html
───────────────────────────────────────────────── */

async function loadFound() {
  const grid = document.getElementById('foundGrid');
  grid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  try {
    const q = document.getElementById('foundSearch').value;
    const s = document.getElementById('foundStatus').value;
    const params = new URLSearchParams({ category: 'Found' });
    if (s) params.set('status', s);
    if (q) params.set('search', q);
    const data = await apiFetch(`${API}?${params}`);
    renderGrid('foundGrid', data.data || []);
  } catch (e) {
    document.getElementById('foundGrid').innerHTML = errorHTML(e.message);
  }
}

// Called by shared.js after delete/status update
function reloadGrid() { loadFound(); }

document.addEventListener('DOMContentLoaded', () => {
  loadFound();
  document.getElementById('foundSearch').addEventListener('input', debounce(loadFound, 300));
  document.getElementById('foundStatus').addEventListener('change', loadFound);
});
