import test from 'node:test';
import assert from 'node:assert/strict';
import eventShareHandler, { buildEventAppUrl } from './event-share.js';

const eventId = 'c2e7828b-5535-4cc5-8748-253a59392c6b';

test('builds the canonical app event URL with ticket intent', () => {
  assert.equal(
    buildEventAppUrl(eventId),
    `https://app.role.events/events/${eventId}?ingressos`,
  );
});

test('supports an explicit app origin without changing the event id', () => {
  assert.equal(
    buildEventAppUrl(eventId, 'https://app-preview.example'),
    `https://app-preview.example/events/${eventId}?ingressos`,
  );
});

test('uses the canonical app origin for invalid configuration and rejects invalid event ids', () => {
  assert.equal(
    buildEventAppUrl(eventId, 'javascript:alert(1)'),
    `https://app.role.events/events/${eventId}?ingressos`,
  );
  assert.equal(buildEventAppUrl('25846ead121040c5'), null);
});

test('renders the event page CTA with the database event id and ticket intent', async () => {
  const originalFetch = globalThis.fetch;
  const originalEnvironment = {
    supabaseUrl: process.env.SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  };
  process.env.SUPABASE_URL = 'https://database.example';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';

  globalThis.fetch = async (url) => {
    const rpc = String(url).split('/').at(-1);
    const responseBody = rpc === 'get_public_event_share_page'
      ? [{
        event_id: eventId,
        title: 'Noite de teste',
        status: 'published',
        starts_at: '2026-12-01T22:00:00Z',
        event_timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        public_share_code: '0123456789abcdef',
      }]
      : [{ id: eventId, lowest_price_minor: 10000 }];
    return { ok: true, json: async () => responseBody };
  };

  try {
    const response = {
      headers: {},
      statusCode: 0,
      body: '',
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      send(body) { this.body = body; return this; },
    };
    await eventShareHandler({
      method: 'GET',
      url: '/api/event-share?shareCode=0123456789abcdef',
      headers: { host: 'role.events' },
      query: { shareCode: '0123456789abcdef' },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.ok(response.body.includes('href="https://app.role.events/events/' + eventId + '?ingressos"'));
    assert.match(response.body, /Compre pelo app/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnvironment.supabaseUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalEnvironment.supabaseUrl;
    if (originalEnvironment.publishableKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
    else process.env.SUPABASE_PUBLISHABLE_KEY = originalEnvironment.publishableKey;
  }
});
