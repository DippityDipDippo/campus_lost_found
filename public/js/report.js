/* ─────────────────────────────────────────────────
   report.js — logic for report.html
───────────────────────────────────────────────── */

// ── CATEGORY TOGGLE ─────────────────────────────
function setCategory(cat) {
  document.getElementById('formCategory').value = cat;
  document.getElementById('toggleLost').classList.toggle('active',  cat === 'Lost');
  document.getElementById('toggleFound').classList.toggle('active', cat === 'Found');
}

document.getElementById('toggleLost').addEventListener('click',  () => setCategory('Lost'));
document.getElementById('toggleFound').addEventListener('click', () => setCategory('Found'));

// ── CLIENT-SIDE VALIDATION ───────────────────────
function validateForm(data) {
  const errors = {};
  if (!data.title       || data.title.length < 3)        errors.title       = 'Title must be at least 3 characters';
  if (!data.description || data.description.length < 10) errors.description = 'Description must be at least 10 characters';
  if (!data.location    || data.location.length < 3)     errors.location    = 'Location is required';
  if (!data.date_occurred)                               errors.date        = 'Date is required';
  else if (new Date(data.date_occurred) > new Date())    errors.date        = 'Date cannot be in the future';
  if (!data.contact_name  || data.contact_name.length < 2)             errors.name  = 'Contact name is required';
  if (!data.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) errors.email = 'Valid email is required';
  if (data.contact_phone && !/^[0-9\-\+\s]{8,20}$/.test(data.contact_phone))         errors.phone = 'Invalid phone number format';
  return errors;
}

function showFormErrors(errors) {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.field-group input, .field-group textarea').forEach(el => el.classList.remove('error'));
  const map = { title: 'f-title', description: 'f-description', location: 'f-location', date: 'f-date', name: 'f-name', email: 'f-email', phone: 'f-phone' };
  Object.entries(errors).forEach(([field, msg]) => {
    const errEl = document.getElementById(`err-${field}`);
    if (errEl) errEl.textContent = msg;
    if (map[field]) document.getElementById(map[field])?.classList.add('error');
  });
}

// ── FORM SUBMIT ─────────────────────────────────
document.getElementById('reportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('formId').value;
  const payload = {
    title:          document.getElementById('f-title').value.trim(),
    description:    document.getElementById('f-description').value.trim(),
    category:       document.getElementById('formCategory').value,
    location:       document.getElementById('f-location').value.trim(),
    date_occurred:  document.getElementById('f-date').value,
    contact_name:   document.getElementById('f-name').value.trim(),
    contact_email:  document.getElementById('f-email').value.trim(),
    contact_phone:  document.getElementById('f-phone').value.trim(),
  };

  const errors = validateForm(payload);
  if (Object.keys(errors).length) { showFormErrors(errors); return; }

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    if (id) {
      await apiFetch(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await apiFetch(API, { method: 'POST', body: JSON.stringify(payload) });
    }
    // Redirect to home with success message in URL
    window.location.href = '/index.html?submitted=1';
  } catch (err) {
    const fb = document.getElementById('formFeedback');
    fb.className = 'form-feedback error';
    fb.textContent = err.message || 'Something went wrong. Please try again.';
    btn.disabled = false;
    btn.textContent = id ? 'Update Report' : 'Submit Report';
  }
});

// ── ON LOAD: check URL params ────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Set max date to today
  document.getElementById('f-date').max = new Date().toISOString().split('T')[0];

  const params = new URLSearchParams(window.location.search);

  // Pre-select category if coming from home page buttons
  const cat = params.get('cat');
  if (cat === 'Found') setCategory('Found');

  // Load item data if editing
  const editId = params.get('edit');
  if (editId) {
    try {
      const data = await apiFetch(`${API}/${editId}`);
      const item = data.data;
      document.getElementById('formTitle').textContent = 'Edit Report';
      document.getElementById('submitBtn').textContent = 'Update Report';
      document.getElementById('formId').value          = item.id;
      document.getElementById('f-title').value         = item.title;
      document.getElementById('f-description').value   = item.description;
      document.getElementById('f-location').value      = item.location;
      document.getElementById('f-date').value          = item.date_occurred.split('T')[0];
      document.getElementById('f-name').value          = item.contact_name;
      document.getElementById('f-email').value         = item.contact_email;
      document.getElementById('f-phone').value         = item.contact_phone || '';
      setCategory(item.category);
    } catch (e) {
      showToast('Could not load item for editing', 'error');
    }
  }
});
