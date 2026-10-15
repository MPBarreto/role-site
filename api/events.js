const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 12;
const CACHE_CONTROL = 'public, max-age=30, s-maxage=120, stale-while-revalidate=600';

function jsonHeaders(key) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`
  };
}

function publicCoverUrl(baseUrl, path) {
  if (typeof path !== 'string' || !path.trim()) return null;
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${baseUrl}/storage/v1/object/public/role-event-covers/${encodedPath}`;
}

async function callRpc(baseUrl, key, functionName, body) {
  const response = await fetch(`${baseUrl}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: jsonHeaders(key),
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`rpc_${functionName}_${response.status}`);
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limitValue = Number(req.query?.limit ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(limitValue)
    ? Math.max(1, Math.min(Math.floor(limitValue), MAX_LIMIT))
    : DEFAULT_LIMIT;
  const baseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';

  if (!baseUrl || !publishableKey) {
    res.setHeader('Cache-Control', 'public, max-age=20, s-maxage=60');
    return res.status(200).json({ events: [], source: 'unavailable' });
  }

  try {
    const rows = await callRpc(baseUrl, publishableKey, 'search_public_event_directory', {
      p_search: null,
      p_city: null,
      p_category: null,
      p_starts_at_from: null,
      p_starts_at_before: null,
      p_limit: limit,
      p_offset: 0
    });
    const events = Array.isArray(rows) ? rows : [];
    const coverRows = events.length
      ? await callRpc(baseUrl, publishableKey, 'get_public_event_cover_media', {
        p_event_ids: events.map(event => event.id)
      }).catch(() => [])
      : [];
    const covers = new Map(
      (Array.isArray(coverRows) ? coverRows : [])
        .map(cover => [cover.event_id, publicCoverUrl(baseUrl, cover.cover_image_path)])
        .filter(([, url]) => url)
    );

    const normalized = events.map(event => ({
      id: event.id,
      title: event.title,
      category: event.category,
      description: event.description,
      venueName: event.venue_name,
      venueAddress: event.venue_address,
      city: event.city,
      startsAt: event.starts_at,
      currency: event.currency || 'BRL',
      lowestPriceMinor: event.lowest_price_minor === null || event.lowest_price_minor === undefined
        ? null
        : Number(event.lowest_price_minor),
      coverUrl: covers.get(event.id) || null,
      tags: event.category ? [event.category] : []
    }));

    res.setHeader('Cache-Control', CACHE_CONTROL);
    return res.status(200).json({ events: normalized, source: 'supabase' });
  } catch {
    res.setHeader('Cache-Control', 'public, max-age=20, s-maxage=60');
    return res.status(200).json({ events: [], source: 'unavailable' });
  }
}
