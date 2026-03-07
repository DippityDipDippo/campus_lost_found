/* ─────────────────────────────────────────────────
   home.js — logic for index.html
───────────────────────────────────────────────── */

let allItems = [];

async function loadHome() {
  try {
    const data = await apiFetch(API);
    allItems = data.data || [];
    updateStats(allItems);
    renderGrid('homeGrid', allItems);
  } catch (e) {
    document.getElementById('homeGrid').innerHTML = errorHTML(e.message);
  }
}

function updateStats(items) {
  document.getElementById('stat-total').textContent    = items.length;
  document.getElementById('stat-lost').textContent     = items.filter(i => i.category === 'Lost').length;
  document.getElementById('stat-found').textContent    = items.filter(i => i.category === 'Found').length;
  document.getElementById('stat-resolved').textContent = items.filter(i => i.status !== 'Active').length;
}

function filterHome() {
  const q   = document.getElementById('homeSearch').value.toLowerCase();
  const cat = document.getElementById('homeFilter').value;
  let filtered = allItems;
  if (cat) filtered = filtered.filter(i => i.category === cat);
  if (q)   filtered = filtered.filter(i =>
    i.title.toLowerCase().includes(q) ||
    i.description.toLowerCase().includes(q) ||
    i.location.toLowerCase().includes(q)
  );
  renderGrid('homeGrid', filtered);
}

// Called by shared.js after delete/status update
function reloadGrid() { loadHome(); }

document.addEventListener('DOMContentLoaded', () => {
  loadHome();
  document.getElementById('homeSearch').addEventListener('input', debounce(filterHome, 250));
  document.getElementById('homeFilter').addEventListener('change', filterHome);
});
