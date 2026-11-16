import test from 'node:test';
import assert from 'node:assert/strict';
import eventShareHandler, { buildEventAppUrl } from './event-share.js';

const eventId = 'c2e7828b-5535-4cc5-8748-253a59392c6b';

test('builds the canonical app event URL with ticket intent', () => {
  assert.equal(
    buildEventAppUrl(eventId),
    `https://app.matchie.events/events/${eventId}?ingressos`,
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
    `https://app.matchie.events/events/${eventId}?ingressos`,
  );
  assert.equal(buildEventAppUrl('25846ead121040c5'), null);
});

test('renders the event page CTA and venue map after the event description', async () => {
  const response = await renderEventSharePage('org-1/venues/venue-1/venue-map/map-1.jpg');

  assert.equal(response.statusCode, 200);
  assert.ok(response.body.includes('href="https://app.matchie.events/events/' + eventId + '?ingressos"'));
  assert.match(response.body, /Compre pelo app/);
  assert.match(response.body, /<h2>Sobre o evento<\/h2>[\s\S]*<section class="venue-map"/);
  assert.match(response.body, /Mapa do local/);
  assert.match(response.body, /src="https:\/\/database\.example\/storage\/v1\/object\/public\/role-event-covers\/org-1\/venues\/venue-1\/venue-map\/map-1\.jpg"/);
});

test('omits the venue map section when the venue has no map', async () => {
  const response = await renderEventSharePage(null);

  assert.equal(response.statusCode, 200);
  assert.doesNotMatch(response.body, /class="venue-map"/);
});

async function renderEventSharePage(venueMapImagePath) {
  const originalFetch = globalThis.fetch;
  const originalEnvironment = {
    supabaseUrl: process.env.SUPABASE_URL,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  };
  process.env.SUPABASE_URL = 'https://database.example';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';

  globalThis.fetch = async (url) => {
    const rpc = new URL(url).pathname.split('/').at(-1);
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
      : rpc === 'get_public_event_detail'
        ? [{ venue_map_image_path: venueMapImagePath }]
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
      headers: { host: 'matchie.events' },
      query: { shareCode: '0123456789abcdef' },
    }, response);
    return response;
  } finally {
    globalThis.fetch = originalFetch;
    if (originalEnvironment.supabaseUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalEnvironment.supabaseUrl;
    if (originalEnvironment.publishableKey === undefined) delete process.env.SUPABASE_PUBLISHABLE_KEY;
    else process.env.SUPABASE_PUBLISHABLE_KEY = originalEnvironment.publishableKey;
  }
}
