import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, '../public/presentation-assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5000';

async function captureAll() {
  console.log('🚀 Starting MudBrew automated screenshot capture...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  try {
    // 1. MudBrew Homepage Hero
    console.log('📸 1/12 Capturing mudbrew-hero.png...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    // Bypass or wait for CafeIntro
    await page.evaluate(() => {
      sessionStorage.setItem('mudbrew_intro_played', 'true');
      const intro = document.querySelector('.cafe-intro-canvas') || document.querySelector('[class*="CafeIntro"]');
      if (intro) intro.style.display = 'none';
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-hero.png'), clip: { x: 0, y: 0, width: 1440, height: 860 } });

    // 2. MudBrew Homepage Full View
    console.log('📸 2/12 Capturing mudbrew-homepage.png...');
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-homepage.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

    // 3. Pottery Studio Section
    console.log('📸 3/12 Capturing mudbrew-pottery.png...');
    await page.evaluate(() => {
      const el = document.getElementById('studio');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-pottery.png'), clip: { x: 0, y: 80, width: 1440, height: 820 } });

    // 4. RC Rock Crawling Arena
    console.log('📸 4/12 Capturing mudbrew-rc-arena.png...');
    await page.evaluate(() => {
      const el = document.getElementById('arena');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-rc-arena.png'), clip: { x: 0, y: 80, width: 1440, height: 820 } });

    // 5. Menu & Dining Sanctuary
    console.log('📸 5/12 Capturing mudbrew-menu.png...');
    await page.evaluate(() => {
      const el = document.getElementById('menu');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-menu.png'), clip: { x: 0, y: 80, width: 1440, height: 820 } });

    // 6. Table Booking Page
    console.log('📸 6/12 Capturing mudbrew-table-booking.png...');
    await page.goto(`${BASE_URL}/book?category=table`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    // Select 4 guests for illustrative family scenario
    await page.evaluate(() => {
      const select = document.querySelector('select');
      if (select) {
        select.value = '4';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const nameInput = document.querySelector('input[placeholder*="Maya"]');
      if (nameInput) {
        nameInput.value = 'Sarah & Marcus Vance';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-table-booking.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

    // 7. Experience Catalogue Booking
    console.log('📸 7/12 Capturing mudbrew-experience-booking.png...');
    await page.goto(`${BASE_URL}/book?category=experience`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-experience-booking.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

    // 8. Booking Availability & Time Slots
    console.log('📸 8/12 Capturing mudbrew-booking-availability.png...');
    await page.evaluate(() => {
      window.scrollBy({ top: 400, behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-booking-availability.png'), clip: { x: 0, y: 100, width: 1440, height: 780 } });

    // 9. Booking Confirmation & Status Lookup
    console.log('📸 9/12 Capturing mudbrew-booking-status.png...');
    // Create or fetch sample reference
    const refRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'table',
        customerName: 'Marcus Vance',
        mobile: '+1 555-782-9900',
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        timeSlot: '13:00',
        guestCount: 4,
        specialRequests: 'Courtyard garden table with high chair if possible'
      })
    }).then(r => r.json()).catch(() => null);

    const ref = refRes?.booking?.reference || 'MB-TAB-2610-486F';
    await page.goto(`${BASE_URL}/booking/${ref}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-booking-status.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

    // 10. Admin Dashboard Overview
    console.log('📸 10/12 Capturing mudbrew-admin-dashboard.png...');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 500));
    // Fill credentials
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      if (inputs.length >= 2) {
        inputs[0].value = 'admin';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].value = 'mudbrew2026!';
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
        const form = document.querySelector('form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-admin-dashboard.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

    // 11. Admin Experiences Manager
    console.log('📸 11/12 Capturing mudbrew-experience-manager.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const expBtn = buttons.find(b => b.textContent.includes('Experiences'));
      if (expBtn) expBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-experience-manager.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

    // 12. Admin Operating Hours & Capacity Rules
    console.log('📸 12/12 Capturing mudbrew-operating-hours.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rulesBtn = buttons.find(b => b.textContent.includes('Schedule & Rules'));
      if (rulesBtn) rulesBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outputDir, 'mudbrew-operating-hours.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

    console.log('✅ ALL 12 SCREENSHOTS CAPTURED SUCCESSFULLY!');
    console.log(`📁 Saved to: ${outputDir}`);
  } catch (err) {
    console.error('❌ Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
}

captureAll();

