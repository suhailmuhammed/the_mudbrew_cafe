import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please wait 15 minutes before trying again.'
});

// Admin Login
router.post('/login', loginLimiter, (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login error: ' + err.message });
  }
});

// Verify Current User Session
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Get Bookings with Search, Filter & Summary Metrics
router.get('/bookings', requireAuth, (req, res) => {
  try {
    const { status, type, date, search, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT b.*, e.name AS experience_name, e.price AS experience_price, e.duration_mins AS experience_duration
      FROM bookings b
      LEFT JOIN experiences e ON b.experience_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (type && type !== 'all') {
      query += ' AND b.type = ?';
      params.push(type);
    }

    if (date) {
      query += ' AND b.date = ?';
      params.push(date);
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ' AND (b.reference LIKE ? OR b.customer_name LIKE ? OR b.mobile LIKE ? OR b.email LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY b.date DESC, b.time_slot ASC, b.id DESC';

    const bookings = db.prepare(query).all(...params);

    // Compute Summary Counts across all bookings
    const summary = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN date = DATE('now') THEN 1 ELSE 0 END) AS today_total
      FROM bookings
    `).get();

    res.json({
      summary: {
        total: summary.total || 0,
        pending: summary.pending || 0,
        confirmed: summary.confirmed || 0,
        cancelled: summary.cancelled || 0,
        rejected: summary.rejected || 0,
        completed: summary.completed || 0,
        todayTotal: summary.today_total || 0
      },
      count: bookings.length,
      bookings
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve bookings: ' + err.message });
  }
});

// Update Booking Status (confirm, reject, cancel, complete)
router.patch('/bookings/:id/status', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status, staffNotes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const now = new Date().toISOString();
    let query = 'UPDATE bookings SET status = ?, updated_at = ?';
    const params = [status, now];

    if (staffNotes !== undefined) {
      query += ', staff_notes = ?';
      params.push(staffNotes);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);

    const updated = db.prepare(`
      SELECT b.*, e.name AS experience_name
      FROM bookings b
      LEFT JOIN experiences e ON b.experience_id = e.id
      WHERE b.id = ?
    `).get(id);

    res.json({ message: `Booking status updated to ${status}.`, booking: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status: ' + err.message });
  }
});

// Update Internal Staff Notes
router.patch('/bookings/:id/notes', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { staffNotes } = req.body;

    const now = new Date().toISOString();
    db.prepare('UPDATE bookings SET staff_notes = ?, updated_at = ? WHERE id = ?').run(staffNotes || '', now, id);

    res.json({ message: 'Staff notes updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update staff notes: ' + err.message });
  }
});

// Export Bookings as CSV
router.get('/export-csv', requireAuth, (req, res) => {
  try {
    const { status, type, date, search } = req.query;

    let query = `
      SELECT b.*, e.name AS experience_name
      FROM bookings b
      LEFT JOIN experiences e ON b.experience_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND b.status = ?';
      params.push(status);
    }
    if (type && type !== 'all') {
      query += ' AND b.type = ?';
      params.push(type);
    }
    if (date) {
      query += ' AND b.date = ?';
      params.push(date);
    }
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ' AND (b.reference LIKE ? OR b.customer_name LIKE ? OR b.mobile LIKE ? OR b.email LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY b.date DESC, b.time_slot ASC';
    const rows = db.prepare(query).all(...params);

    // Build CSV String
    const headers = [
      'Reference',
      'Type',
      'Experience Name',
      'Customer Name',
      'Mobile',
      'Email',
      'Date',
      'Time Slot',
      'Guest Count',
      'Status',
      'Special Requests',
      'Staff Notes',
      'Created At'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvLines = [headers.join(',')];
    for (const r of rows) {
      csvLines.push([
        escapeCsv(r.reference),
        escapeCsv(r.type),
        escapeCsv(r.experience_name || ''),
        escapeCsv(r.customer_name),
        escapeCsv(r.mobile),
        escapeCsv(r.email || ''),
        escapeCsv(r.date),
        escapeCsv(r.time_slot),
        r.guest_count,
        escapeCsv(r.status),
        escapeCsv(r.special_requests || ''),
        escapeCsv(r.staff_notes || ''),
        escapeCsv(r.created_at)
      ].join(','));
    }

    const csvContent = csvLines.join('\r\n');
    const filename = `mudbrew-bookings-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate CSV: ' + err.message });
  }
});

// Experiences CRUD
router.get('/experiences', requireAuth, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM experiences ORDER BY id ASC').all();
    const experiences = rows.map(r => ({
      ...r,
      available_days: JSON.parse(r.available_days || '[]'),
      time_slots: JSON.parse(r.time_slots || '[]')
    }));
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list experiences: ' + err.message });
  }
});

router.post('/experiences', requireAuth, (req, res) => {
  try {
    const { name, tagline, description, price, duration_mins, max_participants, available_days, time_slots, is_active = 1 } = req.body;

    if (!name || !description || price === undefined || !duration_mins || !max_participants) {
      return res.status(400).json({ error: 'Name, description, price, duration and max participants are required.' });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO experiences (
        name, tagline, description, price, duration_mins, max_participants,
        available_days, time_slots, is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      tagline ? tagline.trim() : '',
      description.trim(),
      parseFloat(price),
      parseInt(duration_mins, 10),
      parseInt(max_participants, 10),
      JSON.stringify(Array.isArray(available_days) ? available_days : [0, 1, 2, 3, 4, 5, 6]),
      JSON.stringify(Array.isArray(time_slots) ? time_slots : ['11:30', '15:00', '18:30']),
      is_active ? 1 : 0,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM experiences WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Experience created successfully.',
      experience: {
        ...created,
        available_days: JSON.parse(created.available_days),
        time_slots: JSON.parse(created.time_slots)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create experience: ' + err.message });
  }
});

router.put('/experiences/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { name, tagline, description, price, duration_mins, max_participants, available_days, time_slots, is_active } = req.body;

    const existing = db.prepare('SELECT * FROM experiences WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Experience not found.' });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE experiences
      SET name = ?, tagline = ?, description = ?, price = ?, duration_mins = ?,
          max_participants = ?, available_days = ?, time_slots = ?, is_active = ?, updated_at = ?
      WHERE id = ?
    `).run(
      name !== undefined ? name.trim() : existing.name,
      tagline !== undefined ? tagline.trim() : existing.tagline,
      description !== undefined ? description.trim() : existing.description,
      price !== undefined ? parseFloat(price) : existing.price,
      duration_mins !== undefined ? parseInt(duration_mins, 10) : existing.duration_mins,
      max_participants !== undefined ? parseInt(max_participants, 10) : existing.max_participants,
      available_days !== undefined ? JSON.stringify(available_days) : existing.available_days,
      time_slots !== undefined ? JSON.stringify(time_slots) : existing.time_slots,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      now,
      id
    );

    const updated = db.prepare('SELECT * FROM experiences WHERE id = ?').get(id);
    res.json({
      message: 'Experience updated successfully.',
      experience: {
        ...updated,
        available_days: JSON.parse(updated.available_days),
        time_slots: JSON.parse(updated.time_slots)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update experience: ' + err.message });
  }
});

router.delete('/experiences/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM experiences WHERE id = ?').run(id);
    res.json({ message: 'Experience removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete experience: ' + err.message });
  }
});

// Settings Management
router.get('/settings', requireAuth, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    for (const r of rows) {
      try {
        settings[r.key] = JSON.parse(r.value);
      } catch {
        settings[r.key] = r.value;
      }
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read settings: ' + err.message });
  }
});

router.put('/settings', requireAuth, (req, res) => {
  try {
    const updates = req.body;
    const now = new Date().toISOString();

    const upsert = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);

    for (const [k, v] of Object.entries(updates)) {
      const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
      upsert.run(k, valStr, now);
    }

    res.json({ message: 'Café booking rules and settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings: ' + err.message });
  }
});

// Blocked Dates and Slots Management
router.get('/blocked', requireAuth, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM blocked_dates_slots ORDER BY date ASC, time_slot ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get blocked dates: ' + err.message });
  }
});

router.post('/blocked', requireAuth, (req, res) => {
  try {
    const { date, timeSlot, reason } = req.body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'A valid date in YYYY-MM-DD format is required.' });
    }

    const now = new Date().toISOString();
    const result = db.prepare(`
      INSERT INTO blocked_dates_slots (date, time_slot, reason, created_at)
      VALUES (?, ?, ?, ?)
    `).run(date, timeSlot ? timeSlot.trim() : null, reason ? reason.trim() : null, now);

    res.status(201).json({
      message: 'Blocked slot added successfully.',
      blocked: {
        id: result.lastInsertRowid,
        date,
        time_slot: timeSlot || null,
        reason: reason || null,
        created_at: now
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block slot: ' + err.message });
  }
});

router.delete('/blocked/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM blocked_dates_slots WHERE id = ?').run(id);
    res.json({ message: 'Blocked slot removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove blocked slot: ' + err.message });
  }
});

export default router;

