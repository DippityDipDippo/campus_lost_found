const express = require('express');
const router = express.Router();
const db = require('../config/db');
const {
  itemValidationRules,
  statusValidationRules,
  handleValidationErrors,
  sanitizeStr
} = require('../middleware/validation');

// ─── GET ALL ITEMS ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let sql = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (category && ['Lost', 'Found'].includes(category)) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status && ['Active', 'Claimed', 'Resolved'].includes(status)) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      const term = `%${sanitizeStr(search)}%`;
      sql += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)';
      params.push(term, term, term);
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('GET /api/items error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving items' });
  }
});

// ─── GET SINGLE ITEM ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid item ID' });

    const [rows] = await db.execute('SELECT * FROM items WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('GET /api/items/:id error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving item' });
  }
});

// ─── CREATE ITEM ────────────────────────────────────────────────────────────
router.post('/', itemValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, category, location, date_occurred, contact_name, contact_email, contact_phone } = req.body;

    const [result] = await db.execute(
      `INSERT INTO items (title, description, category, location, date_occurred, contact_name, contact_email, contact_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [title, description, category, location, date_occurred, contact_name, contact_email, contact_phone || null]
    );

    const [newItem] = await db.execute('SELECT * FROM items WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Item report submitted successfully', data: newItem[0] });
  } catch (err) {
    console.error('POST /api/items error:', err);
    res.status(500).json({ success: false, message: 'Server error creating item' });
  }
});

// ─── UPDATE FULL ITEM ───────────────────────────────────────────────────────
router.put('/:id', itemValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid item ID' });

    const [check] = await db.execute('SELECT id FROM items WHERE id = ?', [id]);
    if (check.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });

    const { title, description, category, location, date_occurred, contact_name, contact_email, contact_phone } = req.body;

    await db.execute(
      `UPDATE items SET title=?, description=?, category=?, location=?, date_occurred=?,
       contact_name=?, contact_email=?, contact_phone=? WHERE id=?`,
      [title, description, category, location, date_occurred, contact_name, contact_email, contact_phone || null, id]
    );

    const [updated] = await db.execute('SELECT * FROM items WHERE id = ?', [id]);
    res.json({ success: true, message: 'Item updated successfully', data: updated[0] });
  } catch (err) {
    console.error('PUT /api/items/:id error:', err);
    res.status(500).json({ success: false, message: 'Server error updating item' });
  }
});

// ─── UPDATE STATUS ──────────────────────────────────────────────────────────
router.patch('/:id/status', statusValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid item ID' });

    const [check] = await db.execute('SELECT id FROM items WHERE id = ?', [id]);
    if (check.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });

    const { status } = req.body;
    await db.execute('UPDATE items SET status = ? WHERE id = ?', [status, id]);

    const [updated] = await db.execute('SELECT * FROM items WHERE id = ?', [id]);
    res.json({ success: true, message: 'Status updated successfully', data: updated[0] });
  } catch (err) {
    console.error('PATCH /api/items/:id/status error:', err);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// ─── DELETE ITEM ────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid item ID' });

    const [check] = await db.execute('SELECT id FROM items WHERE id = ?', [id]);
    if (check.length === 0) return res.status(404).json({ success: false, message: 'Item not found' });

    await db.execute('DELETE FROM items WHERE id = ?', [id]);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/items/:id error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting item' });
  }
});

module.exports = router;
