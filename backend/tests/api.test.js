const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// Set environment for test mode
process.env.NODE_ENV = 'test';
process.env.ALLOW_OFFLINE_HEALTH = 'true';
process.env.PORT = '0'; // Ephemeral port

const app = require('../server');

let server;
let baseUrl;

describe('Smart Tourism API Cloud Readiness Tests', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
    await new Promise((resolve) => server.close(resolve));
  });

  test('GET /health returns 200 with cloud health metrics', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.service, 'smart-tourism-api');
    assert.ok(typeof body.uptime === 'number');
    assert.ok(body.timestamp);
    assert.ok(body.database);
    assert.ok(['healthy', 'degraded'].includes(body.status));
  });

  test('GET /api/health alias matches /health output', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.service, 'smart-tourism-api');
  });

  test('GET / returns API discovery metadata', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.message.includes('Smart Tourism API'));
    assert.equal(body.health, '/health');
  });

  test('POST /api/recommend returns 400 when required fields are missing', async () => {
    const res = await fetch(`${baseUrl}/api/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('required'));
  });

  test('POST /api/auth/register returns 400 when body is empty', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('required'));
  });

  test('Non-existent route returns 404 JSON response', async () => {
    const res = await fetch(`${baseUrl}/non-existent-route-xyz`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.ok(body.message.includes('Route not found'));
  });
});
