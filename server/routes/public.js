import { Router } from 'express';
import crypto from 'crypto';
import db from '../db.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { sendBookingNotification } from '../utils/notifier.js';

const router = Router();

const bookingRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Booking request limit reached for this session. Please wait a few minutes before submitting again.'
});

function getSetting(key, defaultValue = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : defaultValue;
}

function generateReference(type) {
  const prefix = type === 'experience' ? 'EXP' : 'TAB';
  const now = new Date();
  const yearMonth = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `MB-${prefix}-${yearMonth}-${randomSuffix}`;
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Public Café Settings & Business Rules
router.get('/settings/public', (req, res) => {
  try {
    const openingHoursRaw = getSetting('opening_hours', '{}');
    const openingHours = JSON.parse(openingHoursRaw);
    const minAdvanceHours = parseInt(getSetting('min_advance_hours', '2'), 10);
    const maxAdvanceDays = parseInt(getSetting('max_advance_days', '30'), 10);
    const maxTableGuests = parseInt(getSetting('max_table_guests_per_booking', '10'), 10);
    const contactEmail = getSetting('contact_email', 'hello@themudbrewcafe.com');
    const contactPhone = getSetting('contact_phone', '+1 (555) 782-2739');
    const address = getSetting('address', '428 Artisan Kiln Lane, Courtyard 4, Arts Quarter');
    const currency = getSetting('currency_symbol', '$');

    res.json({
      openingHours,
      minAdvanceHours,
      maxAdvanceDays,
      maxTableGuests,
      contactEmail,
      contactPhone,
      address,
      currency
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load public settings: ' + err.message });
  }
});

// Active Approved Experiences Catalogue
router.get('/experiences', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, name, tagline, description, price, duration_mins, max_participants, available_days, time_slots
      FROM experiences
      WHERE is_active = 1
      ORDER BY id ASC
    `).all();

    const experiences = rows.map(r => ({
      ...r,
      available_days: JSON.parse(r.available_days || '[]'),
      time_slots: JSON.parse(r.time_slots || '[]')
    }));

    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch experiences: ' + err.message });
  }
});

// Calculate real-time available time slots
router.get('/availability', (req, res) => {
  try {
    const { date, type = 'table', experienceId, guests = 1 } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Valid date in YYYY-MM-DD format is required.' });
    }

    const requestedDate = new Date(`${date}T00:00:00`);
    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date provided.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxAdvanceDays = parseInt(getSetting('max_advance_days', '30'), 10);
    const maxFutureDate = new Date(today);
    maxFutureDate.setDate(maxFutureDate.getDate() + maxAdvanceDays);

    if (requestedDate < today) {
      return res.status(400).json({ error: 'Cannot book reservations in the past.' });
    }
    if (requestedDate > maxFutureDate) {
      return res.status(400).json({ error: `Bookings are open up to ${maxAdvanceDays} days in advance.` });
    }

    // Check full day blocks
    const fullDayBlock = db.prepare('SELECT reason FROM blocked_dates_slots WHERE date = ? AND time_slot IS NULL').get(date);
    if (fullDayBlock) {
      return res.json({
        date,
        available: false,
        reason: fullDayBlock.reason || 'Café is closed for a private event or holiday.',
        slots: []
      });
    }

    // Check partial blocked slots for this date
    const blockedSlots = db.prepare('SELECT time_slot, reason FROM blocked_dates_slots WHERE date = ? AND time_slot IS NOT NULL').all(date);
    const blockedSlotSet = new Set(blockedSlots.map(s => s.time_slot));

    const dayIndex = requestedDate.getDay();
    const dayName = DAYS[dayIndex];
    const openingHours = JSON.parse(getSetting('opening_hours', '{}'));
    const daySchedule = openingHours[dayName];

    if (!daySchedule || daySchedule.closed) {
      return res.json({
        date,
        available: false,
        reason: 'The MudBrew is closed on this day of the week.',
        slots: []
      });
    }

    const minAdvanceHours = parseInt(getSetting('min_advance_hours', '2'), 10);
    const now = new Date();

    if (type === 'table') {
      const tableCapacity = parseInt(getSetting('table_capacity_per_slot', '24'), 10);
      const slotInterval = parseInt(getSetting('table_slot_interval', '60'), 10);

      // Parse opening and closing hours
      const [openH, openM] = daySchedule.open.split(':').map(Number);
      const [closeH, closeM] = daySchedule.close.split(':').map(Number);

      const slots = [];
      let currentMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      // Table slots stop 1 hour before closing
      const lastBookingMinutes = closeMinutes - 60;

      while (currentMinutes <= lastBookingMinutes) {
        const hh = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
        const mm = String(currentMinutes % 60).padStart(2, '0');
        const timeSlotStr = `${hh}:${mm}`;

        // Check if blocked
        if (!blockedSlotSet.has(timeSlotStr)) {
          // Check if slot is in the past or violates minAdvanceHours
          const slotDateTime = new Date(`${date}T${timeSlotStr}:00`);
          const diffHours = (slotDateTime - now) / (1000 * 60 * 60);

          if (diffHours >= minAdvanceHours) {
            // Count current booked guests
            const bookedRow = db.prepare(`
              SELECT COALESCE(SUM(guest_count), 0) AS booked
              FROM bookings
              WHERE date = ? AND time_slot = ? AND type = 'table' AND status IN ('pending', 'confirmed')
            `).get(date, timeSlotStr);

            const booked = bookedRow ? bookedRow.booked : 0;
            const remainingCapacity = Math.max(0, tableCapacity - booked);

            slots.push({
              time: timeSlotStr,
              remainingCapacity,
              isAvailable: remainingCapacity >= parseInt(guests, 10),
              totalCapacity: tableCapacity
            });
          }
        }

        currentMinutes += slotInterval;
      }

      return res.json({
        date,
        type: 'table',
        available: slots.some(s => s.isAvailable),
        slots
      });
    } else if (type === 'experience') {
      if (!experienceId) {
        return res.status(400).json({ error: 'experienceId parameter is required for experience availability.' });
      }

      const experience = db.prepare('SELECT * FROM experiences WHERE id = ? AND is_active = 1').get(experienceId);
      if (!experience) {
        return res.status(404).json({ error: 'Configured experience not found or currently inactive.' });
      }

      const availableDays = JSON.parse(experience.available_days || '[]');
      if (!availableDays.includes(dayIndex)) {
        return res.json({
          date,
          type: 'experience',
          available: false,
          reason: `This experience is offered on specific days (${availableDays.map(d => DAYS[d].slice(0, 3).toUpperCase()).join(', ')}).`,
          slots: []
        });
      }

      const configuredSlots = JSON.parse(experience.time_slots || '[]');
      const slots = [];

      for (const timeSlotStr of configuredSlots) {
        if (!blockedSlotSet.has(timeSlotStr)) {
          const slotDateTime = new Date(`${date}T${timeSlotStr}:00`);
          const diffHours = (slotDateTime - now) / (1000 * 60 * 60);

          if (diffHours >= minAdvanceHours) {
            const bookedRow = db.prepare(`
              SELECT COALESCE(SUM(guest_count), 0) AS booked
              FROM bookings
              WHERE date = ? AND time_slot = ? AND type = 'experience' AND experience_id = ? AND status IN ('pending', 'confirmed')
            `).get(date, timeSlotStr, experience.id);

            const booked = bookedRow ? bookedRow.booked : 0;
            const remainingCapacity = Math.max(0, experience.max_participants - booked);

            slots.push({
              time: timeSlotStr,
              remainingCapacity,
              isAvailable: remainingCapacity >= parseInt(guests, 10),
              totalCapacity: experience.max_participants,
              durationMins: experience.duration_mins,
              price: experience.price
            });
          }
        }
      }

      return res.json({
        date,
        type: 'experience',
        experience: {
          id: experience.id,
          name: experience.name,
          duration_mins: experience.duration_mins,
          price: experience.price
        },
        available: slots.some(s => s.isAvailable),
        slots
      });
    }

    return res.status(400).json({ error: 'Invalid booking type.' });
  } catch (err) {
    res.status(500).json({ error: 'Error calculating availability: ' + err.message });
  }
});

// Create a new booking with ACID concurrency protection
router.post('/bookings', bookingRateLimiter, async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    const {
      type = 'table',
      experienceId,
      customerName,
      mobile,
      email,
      date,
      timeSlot,
      guestCount,
      specialRequests
    } = req.body;

    // 1. Rigorous Field Validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'A valid customer name (at least 2 characters) is required.' });
    }
    if (!mobile || typeof mobile !== 'string' || !/^[0-9+() -]{7,20}$/.test(mobile.trim())) {
      return res.status(400).json({ error: 'A valid mobile phone number is required.' });
    }
    if (email && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) {
      return res.status(400).json({ error: 'If provided, email must be a valid email address.' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'A valid date in YYYY-MM-DD format is required.' });
    }
    if (!timeSlot || typeof timeSlot !== 'string') {
      return res.status(400).json({ error: 'A valid time slot is required.' });
    }

    const guests = parseInt(guestCount, 10);
    if (isNaN(guests) || guests < 1) {
      return res.status(400).json({ error: 'Guest or participant count must be at least 1.' });
    }

    if (type !== 'table' && type !== 'experience') {
      return res.status(400).json({ error: 'Booking type must be either "table" or "experience".' });
    }

    // 2. Date rules & advance checks
    const requestedDate = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxAdvanceDays = parseInt(getSetting('max_advance_days', '30'), 10);
    const maxFutureDate = new Date(today);
    maxFutureDate.setDate(maxFutureDate.getDate() + maxAdvanceDays);

    if (requestedDate < today) {
      return res.status(400).json({ error: 'Reservations cannot be booked for past dates.' });
    }
    if (requestedDate > maxFutureDate) {
      return res.status(400).json({ error: `Reservations can only be made up to ${maxAdvanceDays} days in advance.` });
    }

    // Check minimum advance notice hours
    const minAdvanceHours = parseInt(getSetting('min_advance_hours', '2'), 10);
    const slotDateTime = new Date(`${date}T${timeSlot}:00`);
    const now = new Date();
    if ((slotDateTime - now) / (1000 * 60 * 60) < minAdvanceHours) {
      return res.status(400).json({ error: `Bookings require at least ${minAdvanceHours} hours advance notice.` });
    }

    // 3. Duplicate submission check (same mobile, date, time slot, type in last 5 mins)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const duplicate = db.prepare(`
      SELECT id, reference FROM bookings
      WHERE mobile = ? AND date = ? AND time_slot = ? AND type = ? AND created_at >= ? AND status NOT IN ('cancelled', 'rejected')
    `).get(mobile.trim(), date, timeSlot, type, fiveMinutesAgo);

    if (duplicate) {
      return res.status(409).json({
        error: 'A booking request with this mobile number for the same time slot was recently submitted.',
        reference: duplicate.reference
      });
    }

    // 4. Atomic Transaction for Concurrency & Capacity check
    db.exec('BEGIN IMMEDIATE');

    let insertedBooking = null;
    let experienceRecord = null;
    let initialStatus = 'pending';

    try {
      // Check full day blocks
      const dayBlock = db.prepare('SELECT reason FROM blocked_dates_slots WHERE date = ? AND time_slot IS NULL').get(date);
      if (dayBlock) {
        throw new Error(dayBlock.reason || 'Café is unavailable on this date.');
      }

      // Check slot block
      const slotBlock = db.prepare('SELECT reason FROM blocked_dates_slots WHERE date = ? AND time_slot = ?').get(date, timeSlot);
      if (slotBlock) {
        throw new Error(slotBlock.reason || 'The requested time slot has been blocked by café staff.');
      }

      if (type === 'table') {
        const maxTableGuests = parseInt(getSetting('max_table_guests_per_booking', '10'), 10);
        if (guests > maxTableGuests) {
          throw new Error(`Maximum guests per table booking is ${maxTableGuests}. For larger parties, please contact our concierge.`);
        }

        const tableCapacity = parseInt(getSetting('table_capacity_per_slot', '24'), 10);
        const bookedRow = db.prepare(`
          SELECT COALESCE(SUM(guest_count), 0) AS booked
          FROM bookings
          WHERE date = ? AND time_slot = ? AND type = 'table' AND status IN ('pending', 'confirmed')
        `).get(date, timeSlot);

        const currentBooked = bookedRow ? bookedRow.booked : 0;
        if (currentBooked + guests > tableCapacity) {
          throw new Error(`Insufficient table capacity for ${guests} guests at ${timeSlot}. Remaining seats: ${Math.max(0, tableCapacity - currentBooked)}.`);
        }

        const autoConfirm = getSetting('auto_confirm_tables', 'false') === 'true';
        initialStatus = autoConfirm ? 'confirmed' : 'pending';

      } else {
        // Experience booking
        if (!experienceId) {
          throw new Error('Please select a valid coffee or studio experience.');
        }

        experienceRecord = db.prepare('SELECT * FROM experiences WHERE id = ? AND is_active = 1').get(experienceId);
        if (!experienceRecord) {
          throw new Error('The selected experience is no longer available.');
        }

        const bookedRow = db.prepare(`
          SELECT COALESCE(SUM(guest_count), 0) AS booked
          FROM bookings
          WHERE date = ? AND time_slot = ? AND type = 'experience' AND experience_id = ? AND status IN ('pending', 'confirmed')
        `).get(date, timeSlot, experienceRecord.id);

        const currentBooked = bookedRow ? bookedRow.booked : 0;
        if (currentBooked + guests > experienceRecord.max_participants) {
          throw new Error(`Only ${Math.max(0, experienceRecord.max_participants - currentBooked)} participant slots remaining for this session.`);
        }

        const autoConfirm = getSetting('auto_confirm_experiences', 'false') === 'true';
        initialStatus = autoConfirm ? 'confirmed' : 'pending';
      }

      const reference = generateReference(type);
      const timestamp = new Date().toISOString();

      const insertStmt = db.prepare(`
        INSERT INTO bookings (
          reference, type, experience_id, customer_name, mobile, email,
          date, time_slot, guest_count, special_requests, status,
          staff_notes, ip_address, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)
      `);

      const result = insertStmt.run(
        reference,
        type,
        experienceRecord ? experienceRecord.id : null,
        customerName.trim(),
        mobile.trim(),
        email ? email.trim() : null,
        date,
        timeSlot,
        guests,
        specialRequests ? specialRequests.trim() : null,
        initialStatus,
        ip,
        timestamp,
        timestamp
      );

      insertedBooking = {
        id: result.lastInsertRowid,
        reference,
        type,
        experienceId: experienceRecord ? experienceRecord.id : null,
        experienceName: experienceRecord ? experienceRecord.name : null,
        customerName: customerName.trim(),
        mobile: mobile.trim(),
        email: email ? email.trim() : null,
        date,
        timeSlot,
        guestCount: guests,
        specialRequests: specialRequests ? specialRequests.trim() : null,
        status: initialStatus,
        createdAt: timestamp
      };

      db.exec('COMMIT');
    } catch (txError) {
      db.exec('ROLLBACK');
      return res.status(409).json({ error: txError.message });
    }

    // Dispatch async notification check (does not block client response)
    const notificationStatus = await sendBookingNotification(insertedBooking, experienceRecord);

    return res.status(201).json({
      message: initialStatus === 'confirmed'
        ? 'Your reservation has been automatically confirmed!'
        : 'Your booking request has been received and is under concierge review.',
      booking: insertedBooking,
      notifications: notificationStatus,
      followUpContact: {
        phone: getSetting('contact_phone', '+1 (555) 782-2739'),
        email: getSetting('contact_email', 'hello@themudbrewcafe.com'),
        address: getSetting('address', '428 Artisan Kiln Lane, Courtyard 4, Arts Quarter')
      }
    });

  } catch (err) {
    return res.status(500).json({ error: 'Server error processing booking: ' + err.message });
  }
});

// Fetch booking by reference code (for confirmation page lookup)
router.get('/bookings/:reference', (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ error: 'Reference code is required.' });
    }

    const booking = db.prepare(`
      SELECT b.*, e.name AS experience_name, e.price AS experience_price, e.duration_mins AS experience_duration
      FROM bookings b
      LEFT JOIN experiences e ON b.experience_id = e.id
      WHERE b.reference = ?
    `).get(reference.toUpperCase().trim());

    if (!booking) {
      return res.status(404).json({ error: 'Booking reservation reference not found.' });
    }

    res.json({
      reference: booking.reference,
      type: booking.type,
      customerName: booking.customer_name,
      mobile: booking.mobile,
      email: booking.email,
      date: booking.date,
      timeSlot: booking.time_slot,
      guestCount: booking.guest_count,
      specialRequests: booking.special_requests,
      status: booking.status,
      experienceName: booking.experience_name,
      experiencePrice: booking.experience_price,
      experienceDuration: booking.experience_duration,
      createdAt: booking.created_at,
      followUpContact: {
        phone: getSetting('contact_phone', '+1 (555) 782-2739'),
        email: getSetting('contact_email', 'hello@themudbrewcafe.com'),
        address: getSetting('address', '428 Artisan Kiln Lane, Courtyard 4, Arts Quarter')
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve booking: ' + err.message });
  }
});

export default router;

