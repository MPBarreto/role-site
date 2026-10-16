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

async function callRpc(baseUrl, key, functionName, body) {
  const response = await fetch(`${baseUrl}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: jsonHeaders(key),
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`rpc_${functionName}_${response.status}`);
  return response.json();
}

function publicCoverUrl(baseUrl, path) {
  if (typeof path !== 'string' || !path.trim() || path.split('/').some(segment => segment === '..')) return null;
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${baseUrl}/storage/v1/object/public/role-event-covers/${encodedPath}`;
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
  const baseUrl = (process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  if (!baseUrl || !publishableKey) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '30');
    return res.status(503).json({ events: [], source: 'unavailable' });
  }

  try {
    const [rows, shareRows] = await Promise.all([
      callRpc(baseUrl, publishableKey, 'search_public_event_directory', {
        p_search: null,
        p_city: null,
        p_category: null,
        p_starts_at_from: null,
        p_starts_at_before: null,
        p_limit: limit,
        p_offset: 0
      }),
      callRpc(baseUrl, publishableKey, 'search_public_event_share_directory', {
        p_search: null,
        p_limit: 48,
        p_offset: 0
      })
    ]);
    const events = Array.isArray(rows) ? rows : [];
    const shareById = new Map((Array.isArray(shareRows) ? shareRows : [])
      .map(event => [event.event_id, event]));

    const normalized = events.map(event => ({
      id: event.id,
      publicShareCode: shareById.get(event.id)?.public_share_code || null,
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
      coverUrl: publicCoverUrl(baseUrl, shareById.get(event.id)?.cover_image_path) || null,
      tags: event.category ? [event.category] : []
    }));

    res.setHeader('Cache-Control', CACHE_CONTROL);
    return res.status(200).json({ events: normalized, source: 'supabase' });
  } catch (error) {
    console.error('[api/events] Supabase request failed:', error instanceof Error ? error.message : 'unknown error');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '30');
    return res.status(502).json({ events: [], source: 'unavailable' });
  }
}
