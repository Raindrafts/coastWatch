process.env.NODE_ENV = 'test';
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

let server;
let baseUrl;

test.before(async () => {
  const mod = await import('./dist/index.js');
  const app = mod.default?.default || mod.default;
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });
});


test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/health returns ok status and mode', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.data.status, 'ok');
  assert.equal(json.data.mode, 'demo');
  assert.ok(json.data.ai);
});

test('GET /api/reports returns paginated list of seed reports', async () => {
  const res = await fetch(`${baseUrl}/reports`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 10);
  assert.ok(json.meta);
  assert.equal(json.meta.page, 1);
});

test('GET /api/reports/:publicId returns single report with related items', async () => {
  const res = await fetch(`${baseUrl}/reports/RPT-000001`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.data.report.publicId, 'RPT-000001');
  assert.ok(json.data.related);
  assert.ok(Array.isArray(json.data.related.reports));
  assert.ok(Array.isArray(json.data.related.socialPosts));
});

test('POST /api/reports validates title and description length', async () => {
  const badRes = await fetch(`${baseUrl}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '',
      description: 'Too short',
      hazardType: 'coastal_flooding'
    })
  });
  assert.equal(badRes.status, 400);
  const json = await badRes.json();
  assert.equal(json.error.code, 'VALIDATION_ERROR');
});

test('POST /api/reports creates a report and assigns public ID', async () => {
  const res = await fetch(`${baseUrl}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'High water surge breaking over pier barrier',
      description: 'Extensive surge water observed climbing over sea defense pier walls during morning tide.',
      hazardType: 'coastal_flooding',
      reportedSeverity: 'high',
      latitude: '13.0450',
      longitude: '80.2800',
      placeName: 'Chennai Marina Pier'
    })
  });
  assert.equal(res.status, 201);
  const json = await res.json();
  assert.ok(json.data.report.publicId.startsWith('RPT-'));
  assert.equal(json.data.report.status, 'pending_review');
  assert.ok(json.data.report.aiAnalysis);
});

test('PATCH /api/reports/:publicId/status enforces status state machine and reason', async () => {
  // Test invalid reason on verified
  const noReasonRes = await fetch(`${baseUrl}/reports/RPT-000003/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'verified' })
  });
  // RPT-000003 is pending_review, cannot transition directly to verified
  assert.equal(noReasonRes.status, 409);

  // Valid transition: pending_review -> under_review
  const validTransition = await fetch(`${baseUrl}/reports/RPT-000003/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'under_review', notes: 'Reviewer actively assessing' })
  });
  assert.equal(validTransition.status, 200);
  const json = await validTransition.json();
  assert.equal(json.data.report.status, 'under_review');
  assert.ok(json.data.auditEventId);
});

test('GET /api/dashboard/summary calculates KPIs from dataset', async () => {
  const res = await fetch(`${baseUrl}/dashboard/summary`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json.data.totalReports > 0);
  assert.ok(json.data.activeIncidents >= 0);
  assert.ok(json.data.awaitingReview >= 0);
});

test('CSV preview and commit workflow functions end-to-end', async () => {
  const csvContent = `post_id,platform,text,created_at,latitude,longitude
post_test_901,twitter,"Huge coastal waves breaking over promenade wall #safety",2026-10-14T06:00:00Z,13.05,80.28
post_test_902,bluesky,"Water receding rapidly before abnormal surge tide",2026-10-14T06:05:00Z,13.06,80.29
`;

  const previewRes = await fetch(`${baseUrl}/social/import/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv: csvContent })
  });
  assert.equal(previewRes.status, 200);
  const previewJson = await previewRes.json();
  assert.ok(previewJson.data.previewToken);
  assert.equal(previewJson.data.validRows, 2);

  // Commit using the preview token
  const commitRes = await fetch(`${baseUrl}/social/import/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ previewToken: previewJson.data.previewToken })
  });
  assert.equal(commitRes.status, 201);
  const commitJson = await commitRes.json();
  assert.equal(commitJson.data.created, 2);

  // Reusing token must fail with 409
  const reuseRes = await fetch(`${baseUrl}/social/import/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ previewToken: previewJson.data.previewToken })
  });
  assert.equal(reuseRes.status, 409);
});

test('GET /api/notifications returns notification list and PATCH marks read', async () => {
  const res = await fetch(`${baseUrl}/notifications`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json.data.length > 0);

  const notifId = json.data[0].id;
  const readRes = await fetch(`${baseUrl}/notifications/${notifId}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(readRes.status, 200);
  const readJson = await readRes.json();
  assert.equal(readJson.data.notification.read, true);
});
