import bcrypt from 'bcryptjs';
import db, { initDb } from './db.js';

export function seedDefaults() {
  initDb();

  // 1. Seed default Admin if not exists
  const adminCheck = db.prepare('SELECT id FROM admin_users LIMIT 1').get();
  if (!adminCheck) {
    const defaultUser = process.env.ADMIN_DEFAULT_USER || 'admin';
    const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'mudbrew2026!';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPass, salt);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO admin_users (username, password_hash, name, role, created_at)
      VALUES (?, ?, ?, 'manager', ?)
    `).run(defaultUser, hash, 'MudBrew General Manager', now);
    console.log(`[Seed] Created default admin user '${defaultUser}'`);
  }

  // 2. Seed default settings if not exists
  const defaultSettings = [
    {
      key: 'opening_hours',
      value: JSON.stringify({
        monday: { open: '11:00', close: '23:00', closed: false },
        tuesday: { open: '11:00', close: '23:00', closed: false },
        wednesday: { open: '11:00', close: '23:00', closed: false },
        thursday: { open: '11:00', close: '23:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '10:30', close: '23:30', closed: false },
        sunday: { open: '10:30', close: '23:30', closed: false }
      })
    },
    { key: 'table_slot_interval', value: '60' },
    { key: 'table_capacity_per_slot', value: '24' },
    { key: 'max_table_guests_per_booking', value: '10' },
    { key: 'min_advance_hours', value: '2' },
    { key: 'max_advance_days', value: '30' },
    { key: 'auto_confirm_tables', value: 'false' },
    { key: 'auto_confirm_experiences', value: 'false' },
    { key: 'currency_symbol', value: '$' },
    { key: 'contact_email', value: 'hello@themudbrewcafe.com' },
    { key: 'contact_phone', value: '+1 (555) 782-2739' },
    { key: 'address', value: '428 Artisan Kiln Lane, Courtyard 4, Arts Quarter' }
  ];

  const now = new Date().toISOString();
  const upsertSetting = db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO NOTHING
  `);

  for (const s of defaultSettings) {
    upsertSetting.run(s.key, s.value, now);
  }

  // 3. Seed default curated coffee & studio experiences if table is empty
  const expCheck = db.prepare('SELECT id FROM experiences LIMIT 1').get();
  if (!expCheck) {
    const insertExp = db.prepare(`
      INSERT INTO experiences (name, tagline, description, price, duration_mins, max_participants, available_days, time_slots, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultExperiences = [
      {
        name: 'Artisanal Wheel Throwing & Glaze Session',
        tagline: 'Centering, shaping & kiln firing with our master ceramist',
        description: 'Immerse yourself in slower craft at one of our 12 Japanese Shimpo whisper wheels. Includes guided clay centering, cylinder shaping, trimming techniques, and clear bisque glazing. Every piece is kiln-fired and ready for table pickup within 10 days.',
        price: 45.00,
        duration_mins: 90,
        max_participants: 6,
        available_days: JSON.stringify([0, 1, 2, 3, 4, 5, 6]),
        time_slots: JSON.stringify(['11:30', '15:00', '18:30']),
        is_active: 1
      },
      {
        name: 'Specialty Coffee Cupping & Pour-Over Masterclass',
        tagline: 'Sensory tasting, brew geometry & single-origin discovery',
        description: 'An intimate exploratory journey with MudBrew lead baristas. Learn aroma grading, brew ratio extraction across V60, Chemex, and Aeropress, followed by comparative cupping of three single-origin micro-lots paired with warm terracotta pastries.',
        price: 32.00,
        duration_mins: 60,
        max_participants: 8,
        available_days: JSON.stringify([0, 2, 4, 6]), // Sun, Tue, Thu, Sat
        time_slots: JSON.stringify(['11:00', '14:00', '17:00']),
        is_active: 1
      },
      {
        name: 'Miniature RC Rock Crawling Terrain Challenge',
        tagline: '40ft carved sandstone course, suspension tuning & espresso flight',
        description: 'Take command of tuned 1:24 micro-crawlers over our hand-sculpted granite slab obstacles, timber bridges, and water-crossing gulches. Includes personalized vehicle setup, race timing, and our signature cold-brew flight.',
        price: 38.00,
        duration_mins: 75,
        max_participants: 6,
        available_days: JSON.stringify([0, 1, 3, 5, 6]), // Sun, Mon, Wed, Fri, Sat
        time_slots: JSON.stringify(['12:30', '16:00', '19:30']),
        is_active: 1
      }
    ];

    for (const exp of defaultExperiences) {
      insertExp.run(
        exp.name,
        exp.tagline,
        exp.description,
        exp.price,
        exp.duration_mins,
        exp.max_participants,
        exp.available_days,
        exp.time_slots,
        exp.is_active,
        now,
        now
      );
    }
    console.log('[Seed] Seeded default MudBrew experiences.');
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDefaults();
  console.log('[Seed] Database initialization and seeding complete.');
}

