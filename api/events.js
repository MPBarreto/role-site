const FALLBACK_EVENTS = [
  { name: 'Sunset Club', badge: 'SÁB · 22:00', venue: 'São Paulo, SP', attendeesLabel: 'Novos encontros começam aqui', tags: ['House', 'Sunset', 'Conexões'] },
  { name: 'After Hours', badge: 'SEX · 23:30', venue: 'Curitiba, PR', attendeesLabel: 'Descubra quem também vai', tags: ['Eletrônica', 'Club', 'Late night'] },
  { name: 'Baile do Céu', badge: 'SÁB · 21:00', venue: 'São Paulo, SP', attendeesLabel: 'Seu próximo Rolê', tags: ['Funk', 'Open format', 'Dance'] }
];

const DEFAULT_SUPABASE_URL = 'https://zilnfxbgzrwzqvspfkev.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_t-4MPj54cKvKn-78FeToyA_rk8Xbsvw';

function publicCoverUrl(baseUrl, path) {
  if (!path) return null;
  return `${baseUrl}/storage/v1/object/public/role-event-covers/${String(path).split('/').map(encodeURIComponent).join('/')}`;
}
function authHeaders(key) {
  return { Accept: 'application/json', apikey: key, Authorization: `Bearer ${key}` };
}
async function fetchJson(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${response.status}:${url}`);
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = Math.max(1, Math.min(Number(req.query?.limit || 6), 12));
  const baseUrl = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  try {
    const headers = authHeaders(publishableKey);
    const now = new Date().toISOString();
    const eventsUrl = new URL(`${baseUrl}/rest/v1/events`);
    eventsUrl.searchParams.set('select', 'id,title,category,venue_name,city,starts_at,currency,cover_image_path,vibe_tags,public_share_code');
    eventsUrl.searchParams.set('status', 'eq.published');
    eventsUrl.searchParams.set('starts_at', `gt.${now}`);
    eventsUrl.searchParams.set('order', 'starts_at.asc');
    eventsUrl.searchParams.set('limit', String(limit));

    const events = await fetchJson(eventsUrl, headers);
    if (!Array.isArray(events) || !events.length) {
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=120, stale-while-revalidate=600');
      return res.status(200).json({ events: FALLBACK_EVENTS.slice(0, limit), source: 'fallback' });
    }

    const ids = events.map(event => event.id);
    const ticketUrl = new URL(`${baseUrl}/rest/v1/event_ticket_types`);
    ticketUrl.searchParams.set('select', 'event_id,price_minor,inventory_sold,status');
    ticketUrl.searchParams.set('event_id', `in.(${ids.join(',')})`);
    ticketUrl.searchParams.set('status', 'eq.active');
    const ticketTypes = await fetchJson(ticketUrl, headers);

    const ticketStats = new Map();
    for (const ticket of ticketTypes || []) {
      const current = ticketStats.get(ticket.event_id) || { sold: 0, minPriceMinor: null };
      current.sold += Number(ticket.inventory_sold || 0);
      const price = Number(ticket.price_minor);
      if (Number.isFinite(price)) current.minPriceMinor = current.minPriceMinor === null ? price : Math.min(current.minPriceMinor, price);
      ticketStats.set(ticket.event_id, current);
    }

    const normalized = events.map(event => {
      const stat = ticketStats.get(event.id) || { sold: 0, minPriceMinor: null };
      return {
        id: event.id,
        name: event.title,
        title: event.title,
        category: event.category,
        venueName: event.venue_name,
        city: event.city,
        venue: [event.venue_name, event.city].filter(Boolean).join(' · '),
        startsAt: event.starts_at,
        currency: event.currency || 'BRL',
        coverUrl: publicCoverUrl(baseUrl, event.cover_image_path),
        tags: Array.isArray(event.vibe_tags) ? event.vibe_tags : [],
        shareCode: event.public_share_code,
        sold: stat.sold,
        attendees: stat.sold,
        minPriceMinor: stat.minPriceMinor
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=180, stale-while-revalidate=900');
    return res.status(200).json({ events: normalized, source: 'supabase' });
  } catch (error) {
    res.setHeader('Cache-Control', 'public, max-age=20, s-maxage=60');
    return res.status(200).json({ events: FALLBACK_EVENTS.slice(0, limit), source: 'fallback', warning: 'events_source_unavailable' });
  }
}
