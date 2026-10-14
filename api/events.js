function normalizeEvent(event, index) {
  return {
    id: event.id || event.slug || index,
    name: event.name || event.title || 'Evento Rolê',
    badge: event.badge || event.dateLabel || event.date_label || 'Próximo Rolê',
    venue: event.venue || event.location || event.place || 'Local a confirmar',
    attendees: Number(event.attendees || event.attendee_count || event.participants_count || 0),
    attendeesLabel: event.attendeesLabel || event.attendees_label || undefined,
    tags: Array.isArray(event.tags) ? event.tags : (Array.isArray(event.genres) ? event.genres : [])
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = Math.max(1, Math.min(Number(req.query?.limit || 3), 12));
  const upstream = process.env.EVENTS_API_URL;

  if (!upstream) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ events: [], source: 'fallback' });
  }

  try {
    const headers = { Accept: 'application/json' };
    if (process.env.EVENTS_API_TOKEN) headers.Authorization = `Bearer ${process.env.EVENTS_API_TOKEN}`;
    const url = new URL(upstream);
    url.searchParams.set('limit', String(limit));
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
    const payload = await response.json();
    const rawEvents = Array.isArray(payload) ? payload : (payload.events || payload.data || []);
    const events = rawEvents.slice(0, limit).map(normalizeEvent);
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=180, stale-while-revalidate=3600');
    return res.status(200).json({ events, source: 'upstream' });
  } catch {
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
    return res.status(200).json({ events: [], source: 'fallback', warning: 'upstream_unavailable' });
  }
}
