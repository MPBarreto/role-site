const DIRECTORY_RPC = 'search_public_event_share_directory';
const PAGE_SIZE = 48;
const MAX_SITEMAP_FILES = 49999;
const CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=1800';

export default async function sitemapHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed.');
  }

  const params = new URL(req.url || '/', 'https://role.events').searchParams;
  const set = params.get('set');
  if (set === 'pages') return sendXml(res, 200, staticPages(), CACHE_CONTROL);

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    return sendXml(res, 503, '<!-- Sitemap temporarily unavailable -->', 'no-store');
  }

  try {
    if (set === 'events') {
      const page = parsePage(params.get('page'));
      const rows = await searchDirectory(supabaseUrl, publishableKey, page * PAGE_SIZE);
      return sendXml(res, 200, eventSitemap(rows), CACHE_CONTROL);
    }

    const rows = await searchDirectory(supabaseUrl, publishableKey, 0, 1);
    const totalCount = Number(rows[0]?.total_count || 0);
    const total = Number.isFinite(totalCount) ? Math.max(0, totalCount) : 0;
    const eventSitemapCount = Math.min(Math.ceil(total / PAGE_SIZE), MAX_SITEMAP_FILES);
    const origin = siteOrigin();
    const sitemaps = [
      `${origin}/sitemap.xml?set=pages`,
      ...Array.from({ length: eventSitemapCount }, (_, page) => `${origin}/sitemap.xml?set=events&amp;page=${page}`),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps
      .map((loc) => `<sitemap><loc>${loc}</loc></sitemap>`).join('')}</sitemapindex>`;
    return sendXml(res, 200, xml, CACHE_CONTROL);
  } catch (error) {
    console.error('[api/sitemap] Supabase request failed:', error instanceof Error ? error.message : 'unknown error');
    return sendXml(res, 503, '<!-- Sitemap temporarily unavailable -->', 'no-store');
  }
}

async function searchDirectory(supabaseUrl, publishableKey, offset, limit = PAGE_SIZE) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${DIRECTORY_RPC}`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ p_search: null, p_limit: limit, p_offset: offset }),
  });
  if (!response.ok) throw new Error(`supabase_rpc_${response.status}`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function staticPages() {
  const origin = siteOrigin();
  const paths = ['/', '/eventos', '/produtores', '/reembolsos', '/terms', '/privacy', '/seguranca-infantil'];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths
    .map((path) => `<url><loc>${xmlEscape(`${origin}${path}`)}</loc></url>`).join('')}</urlset>`;
}

function eventSitemap(rows) {
  const origin = siteOrigin();
  const urls = rows
    .filter((event) => /^[0-9a-f]{16}$/i.test(String(event.public_share_code || '')))
    .map((event) => {
      const code = encodeURIComponent(event.public_share_code);
      const slug = encodeURIComponent(slugify(event.title) || 'role');
      return `<url><loc>${xmlEscape(`${origin}/events/${code}/${slug}`)}</loc></url>`;
    });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
}

function parsePage(value) {
  const page = Number.parseInt(value || '0', 10);
  return Number.isFinite(page) ? Math.max(0, Math.min(page, MAX_SITEMAP_FILES - 1)) : 0;
}

function siteOrigin() {
  const configured = process.env.EVENT_SHARE_ORIGIN;
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === 'https:' && ['role.events', 'www.role.events'].includes(url.hostname)) return 'https://role.events';
    } catch { /* Use the production canonical origin below. */ }
  }
  return 'https://role.events';
}

function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96).replace(/-+$/g, '');
}

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[character]);
}

function sendXml(res, statusCode, xml, cacheControl) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(statusCode).send(xml);
}
