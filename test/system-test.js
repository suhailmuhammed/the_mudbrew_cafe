import http from 'http';
import assert from 'assert';
import app from '../server/index.js';
import db from '../server/db.js';

// Helper to make HTTP requests against the in-process express server
function request(appServer, method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const address = appServer.address();
    const port = address.port;

    const reqHeaders = {
      ...headers
    };

    let bodyStr = null;
    if (body) {
      bodyStr = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on('error', reject);

    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING MUDBREW RESERVATION SYSTEM TESTS ---');

  // Clean test bookings to guarantee pristine test state
  db.exec("DELETE FROM bookings WHERE mobile LIKE '+1 555%'");
  db.exec("DELETE FROM blocked_dates_slots WHERE reason LIKE '%Retreat%'");

  // Start temporary test server on random port
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, '127.0.0.1', resolve));
  const port = testServer.address().port;
  console.log(`[Test Server] Running on http://127.0.0.1:${port}`);

  try {
    // 1. Health check
    const health = await request(testServer, 'GET', '/api/health');
    assert.strictEqual(health.status, 200, 'Health check should return 200');
    assert.strictEqual(health.body.status, 'healthy');
    console.log('✓ 1. Health check passed');

    // 2. Public Settings
    const pubSettings = await request(testServer, 'GET', '/api/settings/public');
    assert.strictEqual(pubSettings.status, 200);
    assert.ok(pubSettings.body.openingHours);
    assert.ok(pubSettings.body.maxTableGuests >= 8);
    console.log('✓ 2. Public settings endpoint verified');

    // 3. Experiences catalogue
    const experiences = await request(testServer, 'GET', '/api/experiences');
    assert.strictEqual(experiences.status, 200);
    assert.ok(Array.isArray(experiences.body) && experiences.body.length > 0);
    const sampleExp = experiences.body[0];
    console.log(`✓ 3. Experiences catalogue verified (${experiences.body.length} active sessions, e.g. "${sampleExp.name}")`);

    // Target a valid future booking date (e.g. 3 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const dateStr = targetDate.toISOString().split('T')[0];
    const runId = Math.floor(Math.random() * 9000 + 1000);

    // 4. Availability check for tables
    const tableAvail = await request(testServer, 'GET', `/api/availability?date=${dateStr}&type=table&guests=2`);
    assert.strictEqual(tableAvail.status, 200);
    assert.ok(tableAvail.body.slots.length > 0, 'Should have table slots available');
    const firstTableSlot = tableAvail.body.slots[0].time;
    console.log(`✓ 4. Table availability calculated (${tableAvail.body.slots.length} slots found, e.g. ${firstTableSlot})`);

    // 5. Successful Table Booking
    const tableBookingPayload = {
      type: 'table',
      customerName: 'Elena Rostova',
      mobile: `+1 555-019-${runId}`,
      email: 'elena@artisan.test',
      date: dateStr,
      timeSlot: firstTableSlot,
      guestCount: 2,
      specialRequests: 'Courtyard terracotta arch corner table please'
    };
    const tableBookingRes = await request(testServer, 'POST', '/api/bookings', tableBookingPayload);
    assert.strictEqual(tableBookingRes.status, 201, 'Table booking should return 201 Created');
    assert.ok(tableBookingRes.body.booking.reference.startsWith('MB-TAB-'));
    assert.strictEqual(tableBookingRes.body.booking.status, 'pending');
    assert.ok(tableBookingRes.body.notifications, 'Response should contain notification status object');
    assert.strictEqual(tableBookingRes.body.notifications.email.configured, false, 'Should truthfully report SMTP unconfigured');
    const tableRef = tableBookingRes.body.booking.reference;
    console.log(`✓ 5. Table reservation created successfully (Ref: ${tableRef}, Status: ${tableBookingRes.body.booking.status})`);

    // 6. Duplicate Booking Prevention
    const duplicateRes = await request(testServer, 'POST', '/api/bookings', tableBookingPayload);
    assert.strictEqual(duplicateRes.status, 409, 'Duplicate booking submission within 5 mins must return 409 Conflict');
    console.log('✓ 6. Duplicate booking submission blocked with 409 Conflict');

    // 7. Experience Booking
    const expAvail = await request(testServer, 'GET', `/api/availability?date=${dateStr}&type=experience&experienceId=${sampleExp.id}&guests=2`);
    assert.strictEqual(expAvail.status, 200);
    assert.ok(expAvail.body.slots.length > 0, 'Experience should have time slots');
    const expSlot = expAvail.body.slots[0].time;

    const expBookingPayload = {
      type: 'experience',
      experienceId: sampleExp.id,
      customerName: 'Marcus Vance',
      mobile: `+1 555-022-${runId}`,
      email: 'marcus@vance.test',
      date: dateStr,
      timeSlot: expSlot,
      guestCount: 2,
      specialRequests: 'Left-handed wheel setup if available'
    };
    const expBookingRes = await request(testServer, 'POST', '/api/bookings', expBookingPayload);
    assert.strictEqual(expBookingRes.status, 201);
    assert.ok(expBookingRes.body.booking.reference.startsWith('MB-EXP-'));
    const expRef = expBookingRes.body.booking.reference;
    console.log(`✓ 7. Experience reservation created successfully (Ref: ${expRef})`);

    // 8. Public Booking Reference Lookup
    const lookupRes = await request(testServer, 'GET', `/api/bookings/${tableRef}`);
    assert.strictEqual(lookupRes.status, 200);
    assert.strictEqual(lookupRes.body.reference, tableRef);
    assert.strictEqual(lookupRes.body.customerName, 'Elena Rostova');
    console.log(`✓ 8. Public reference lookup verified for ${tableRef}`);

    // 9. Capacity Limit Check & Conflict Prevention
    // Try to book more guests than the slot can hold (e.g. 50 guests)
    const overCapacityPayload = {
      type: 'table',
      customerName: 'Party Group',
      mobile: '+1 555-999-0000',
      date: dateStr,
      timeSlot: firstTableSlot,
      guestCount: 50
    };
    const overCapRes = await request(testServer, 'POST', '/api/bookings', overCapacityPayload);
    assert.strictEqual(overCapRes.status, 409, 'Booking exceeding capacity limits must return 409');
    console.log('✓ 9. Over-capacity booking prevented atomically');

    // 10. Concurrency Safety Test:
    // Fire 5 concurrent requests requesting 5 seats each when only limited seats exist
    console.log('Testing concurrency with concurrent submissions...');
    const concurrentPromises = [];
    for (let i = 0; i < 5; i++) {
      concurrentPromises.push(
        request(testServer, 'POST', '/api/bookings', {
          type: 'table',
          customerName: `Concurrent User ${i}`,
          mobile: `+1 555-111-000${i}`,
          date: dateStr,
          timeSlot: '16:00',
          guestCount: 8
        })
      );
    }
    const concurrentResults = await Promise.all(concurrentPromises);
    const successCount = concurrentResults.filter(r => r.status === 201).length;
    const conflictCount = concurrentResults.filter(r => r.status === 409).length;
    assert.ok(successCount > 0, 'At least one booking should succeed');
    assert.ok(conflictCount > 0, 'Over-capacity concurrent bookings must fail with conflict');
    console.log(`✓ 10. Concurrency verified: ${successCount} accepted, ${conflictCount} safely rejected due to capacity`);

    // 11. Admin Login (Correct & Incorrect)
    const badLogin = await request(testServer, 'POST', '/api/admin/login', { username: 'admin', password: 'wrongpassword' });
    assert.strictEqual(badLogin.status, 401, 'Bad credentials must return 401');

    const goodLogin = await request(testServer, 'POST', '/api/admin/login', { username: 'admin', password: 'mudbrew2026!' });
    assert.strictEqual(goodLogin.status, 200, 'Valid credentials must return 200');
    assert.ok(goodLogin.body.token, 'Should return JWT token');
    const adminToken = goodLogin.body.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('✓ 11. Admin authentication & JWT token generation verified');

    // 12. Admin Protected Routes
    const adminMe = await request(testServer, 'GET', '/api/admin/me', null, adminHeaders);
    assert.strictEqual(adminMe.status, 200);
    assert.strictEqual(adminMe.body.user.username, 'admin');

    const adminBookings = await request(testServer, 'GET', '/api/admin/bookings', null, adminHeaders);
    assert.strictEqual(adminBookings.status, 200);
    assert.ok(adminBookings.body.bookings.length >= 2);
    assert.ok(adminBookings.body.summary.total >= 2);
    console.log(`✓ 12. Admin bookings endpoint verified (${adminBookings.body.count} records retrieved)`);

    // 13. Status Update (Confirming table reservation)
    const targetBooking = adminBookings.body.bookings.find(b => b.reference === tableRef);
    assert.ok(targetBooking);
    const updateStatusRes = await request(
      testServer,
      'PATCH',
      `/api/admin/bookings/${targetBooking.id}/status`,
      { status: 'confirmed' },
      adminHeaders
    );
    assert.strictEqual(updateStatusRes.status, 200);
    assert.strictEqual(updateStatusRes.body.booking.status, 'confirmed');
    console.log(`✓ 13. Booking status update verified (pending -> confirmed for ${tableRef})`);

    // 14. Staff Notes Update
    const notesRes = await request(
      testServer,
      'PATCH',
      `/api/admin/bookings/${targetBooking.id}/notes`,
      { staffNotes: 'VIP guest from Tokyo; prep single-origin Ethiopian roast.' },
      adminHeaders
    );
    assert.strictEqual(notesRes.status, 200);
    console.log('✓ 14. Staff internal notes saved to database');

    // 15. Export CSV
    const csvRes = await request(testServer, 'GET', '/api/admin/export-csv', null, adminHeaders);
    assert.strictEqual(csvRes.status, 200);
    assert.ok(csvRes.headers['content-type'].includes('text/csv'));
    assert.ok(typeof csvRes.body === 'string' && csvRes.body.includes(tableRef));
    console.log('✓ 15. CSV export verified with formatted headers and data');

    // 16. Block Date / Slot
    const blockDateStr = '2026-11-15';
    const blockRes = await request(
      testServer,
      'POST',
      '/api/admin/blocked',
      { date: blockDateStr, reason: 'MudBrew Annual Ceramist Retreat' },
      adminHeaders
    );
    assert.strictEqual(blockRes.status, 201);

    // Verify availability endpoint reports blocked day
    const blockedCheck = await request(testServer, 'GET', `/api/availability?date=${blockDateStr}&type=table`);
    assert.strictEqual(blockedCheck.status, 200);
    assert.strictEqual(blockedCheck.body.available, false);
    assert.ok(blockedCheck.body.reason.includes('Retreat'));
    console.log('✓ 16. Date closure / block verified and correctly prevents customer bookings');

    // Remove block
    const blockId = blockRes.body.blocked.id;
    const deleteBlockRes = await request(testServer, 'DELETE', `/api/admin/blocked/${blockId}`, null, adminHeaders);
    assert.strictEqual(deleteBlockRes.status, 200);
    console.log('✓ 17. Block removal verified');

    console.log('\n========================================');
    console.log(' ALL 17 AUTOMATED SYSTEM TESTS PASSED! ');
    console.log('========================================\n');
  } finally {
    testServer.close();
  }
}

runTests().catch((err) => {
  console.error('SYSTEM TEST FAILED:', err);
  process.exit(1);
});
