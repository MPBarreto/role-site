const EVENT_COVER_BUCKET = 'role-event-covers';
const PUBLIC_CODE_PATTERN = /^[0-9a-f]{16}$/;

export default async function eventShareHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Método não permitido.');
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) {
    return sendPage(res, 503, errorPage('Estamos preparando esta página', 'Tente novamente em instantes.'), 'no-store');
  }

  const origin = getOrigin(req);
  const directory = queryValue(req, 'directory') === '1';
  try {
    if (directory) {
      const search = (queryValue(req, 'q') || '').trim().slice(0, 120);
      const offset = parseOffset(queryValue(req, 'offset'));
      const rows = await invokeRpc(supabaseUrl, publishableKey, 'search_public_event_share_directory', {
        p_search: search || null,
        p_limit: 24,
        p_offset: offset,
      });
      const html = directoryPage(rows, { origin, search, offset, supabaseUrl });
      return sendPage(res, 200, html, 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    }

    const shareCode = (queryValue(req, 'shareCode') || '').toLowerCase();
    if (!PUBLIC_CODE_PATTERN.test(shareCode)) {
      return sendPage(res, 404, errorPage('Evento não encontrado', 'Confira o link ou explore os próximos rolês.'), 'public, max-age=0, s-maxage=60');
    }
    const rows = await invokeRpc(supabaseUrl, publishableKey, 'get_public_event_share_page', { p_share_code: shareCode });
    const event = Array.isArray(rows) ? rows[0] : null;
    if (!event) {
      return sendPage(res, 404, errorPage('Evento não encontrado', 'Este evento não está disponível para acesso público.'), 'public, max-age=0, s-maxage=60');
    }
    const priceMinor = await findLowestPrice(supabaseUrl, publishableKey, event).catch(() => null);
    const html = eventPage(event, { origin, supabaseUrl, shareCode, priceMinor });
    return sendPage(res, 200, html, 'public, max-age=0, s-maxage=300, stale-while-revalidate=900');
  } catch (error) {
    console.error('event share page failed', error instanceof Error ? error.name : 'unknown');
    return sendPage(res, 503, errorPage('Não foi possível carregar o evento', 'Tente novamente em instantes.'), 'no-store');
  }
};

function getOrigin(req) {
  const configured = process.env.EVENT_SHARE_ORIGIN;
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:' || parsed.hostname === 'localhost') return parsed.origin;
    } catch { /* Use the verified request host below. */ }
  }

  const hostHeader = firstHeader(req.headers && (req.headers['x-forwarded-host'] || req.headers.host));
  const host = (hostHeader || '').split(',')[0].trim().toLowerCase();
  const hostname = host.replace(/:\d+$/, '');
  if (hostname !== 'localhost') return 'https://role.events';
  const forwardedProtocol = firstHeader(req.headers && req.headers['x-forwarded-proto']);
  const protocol = forwardedProtocol !== 'https' ? 'http' : 'https';
  return `${protocol}://${host}`;
}

function firstHeader(value) {
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : '';
}

function queryValue(req, key) {
  const value = req.query && req.query[key];
  if (Array.isArray(value)) return value[0];
  if (typeof value === 'string') return value;
  try {
    return new URL(req.url || '/', 'https://role.events').searchParams.get(key) || '';
  } catch {
    return '';
  }
}

function parseOffset(value) {
  const offset = Number.parseInt(value || '0', 10);
  return Number.isFinite(offset) ? Math.max(0, Math.min(offset, 10000)) : 0;
}

async function invokeRpc(supabaseUrl, publishableKey, name, payload) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`supabase_rpc_${response.status}`);
  return response.json();
}

function directoryPage(rows, { origin, search, offset, supabaseUrl }) {
  const events = Array.isArray(rows) ? rows : [];
  const total = Number(events[0] && events[0].total_count || 0);
  const cards = events.map((event) => {
    const url = shareUrl(origin, event.public_share_code, event.title);
    const image = coverUrl(supabaseUrl, event.cover_image_path) || fallbackCover(origin);
    const date = formatEventDate(event.starts_at, event.event_timezone);
    return `<a class="event-card" href="${escapeHtml(url)}">
      <img src="${escapeHtml(image)}" alt="Capa do evento ${escapeHtml(event.title)}" loading="lazy">
      <div class="event-copy"><span class="eyebrow">${escapeHtml(event.category)} · ${escapeHtml(event.city)}</span>
        <h2>${escapeHtml(event.title)}</h2><p>${escapeHtml(date)} · ${escapeHtml(event.venue_name)}</p>
        <span class="card-link">Ver evento <span aria-hidden="true">→</span></span></div>
    </a>`;
  }).join('');
  const nextOffset = offset + events.length;
  const nextLink = nextOffset < total
    ? `<a class="button button-secondary" href="/eventos?offset=${nextOffset}${search ? `&q=${encodeURIComponent(search)}` : ''}">Ver mais eventos</a>`
    : '';
  const content = cards || `<div class="empty"><div class="sparkle">✦</div><h2>Nenhum rolê encontrado</h2><p>Tente outra busca ou volte em breve para descobrir novos eventos.</p></div>`;
  const canonical = `${origin}/eventos`;
  return pageShell({
    title: 'Eventos | Rolê',
    description: 'Encontre eventos incríveis, veja quem já vai e dê match antes do rolê começar.',
    image: fallbackCover(origin),
    canonical,
    body: `<header class="masthead"><a class="brand" href="/" aria-label="Rolê, página inicial"><span class="brand-mark">R</span> ROLÊ</a><a class="top-link" href="/#app">Baixar o app <span aria-hidden="true">↗</span></a></header>
      <main class="directory-main"><section class="intro"><p class="eyebrow">DESCUBRA SEU PRÓXIMO ROLÊ</p><h1>Eventos para <em>viver juntos.</em></h1><p class="lead">Encontre eventos incríveis, veja quem já vai e dê match antes do rolê começar.</p>
      <form class="search" action="/eventos" method="get"><label class="sr-only" for="event-search">Buscar evento, cidade ou casa de show</label><input id="event-search" name="q" value="${escapeHtml(search)}" placeholder="Evento, cidade ou casa de show"><button type="submit">Buscar</button></form></section>
      <section class="event-grid" aria-label="Eventos públicos">${content}</section><div class="more">${nextLink}</div></main>
      <footer class="footer">Rolê · Boas festas, novas pessoas, conexões reais.</footer>`,
  });
}

function eventPage(event, { origin, supabaseUrl, shareCode, priceMinor }) {
  const title = String(event.title || 'Evento no Rolê');
  const canonical = shareUrl(origin, shareCode, title);
  const image = coverUrl(supabaseUrl, event.cover_image_path) || fallbackCover(origin);
  const description = truncate(String(event.description || `Descubra ${title} no Rolê.`), 220);
  const location = [event.venue_name, event.venue_address, event.city].filter(Boolean).join(' · ');
  const startsAt = formatEventDate(event.starts_at, event.event_timezone);
  const endsAt = event.ends_at ? formatEventDate(event.ends_at, event.event_timezone) : '';
  const price = priceMinor === null || priceMinor === undefined ? '' : formatMoney(priceMinor, event.currency);
  const appUrl = `${origin}/#app`;
  const isAvailable = event.status === 'published';
  const whatsappText = encodeURIComponent(`${title}\n${location}\n${startsAt}\n${canonical}`);
  const state = event.status === 'cancelled'
    ? '<p class="status status-cancelled">Este evento foi cancelado.</p>'
    : event.status === 'completed'
      ? '<p class="status">Este rolê já aconteceu. Confira outros eventos.</p>'
      : '';
  const body = `<header class="masthead masthead-overlay"><a class="brand" href="/" aria-label="Rolê"><img src="/assets/logo/logo-role-branco.webp" alt="Rolê" width="142" height="48"></a><a class="top-link" href="/eventos">Todos os eventos <span aria-hidden="true">→</span></a></header>
    <main class="event-main"><article class="event-hero"><img class="hero-image" src="${escapeHtml(image)}" alt="Capa de ${escapeHtml(title)}"><div class="hero-shade"></div>
      <div class="hero-content"><p class="eyebrow">${escapeHtml(event.category || 'EVENTO')} · ${escapeHtml(event.city || '')}</p><h1>${escapeHtml(title)}</h1><p class="hero-description">${escapeHtml(description)}</p></div>
    </article><section class="event-details"><div class="details-copy">${state}<div class="detail-line"><span class="detail-icon" aria-hidden="true">◷</span><div><strong>${escapeHtml(startsAt)}</strong>${endsAt ? `<span>Até ${escapeHtml(endsAt)}</span>` : ''}</div></div>
      <div class="detail-line"><span class="detail-icon" aria-hidden="true">⌖</span><div><strong>${escapeHtml(event.venue_name || '')}</strong><span>${escapeHtml([event.venue_address, event.city].filter(Boolean).join(' · '))}</span></div></div>
      ${price ? `<div class="detail-line"><span class="detail-icon" aria-hidden="true">R$</span><div><strong>Ingressos a partir de ${escapeHtml(price)}</strong><span>Consulte a disponibilidade no app Rolê.</span></div></div>` : ''}
      <h2>Sobre o evento</h2><p>${escapeHtml(description)}</p>
      <div class="cta-row"><a class="button" href="${escapeHtml(isAvailable ? appUrl : '/eventos')}">${isAvailable ? 'Ver ingressos no app' : 'Explorar próximos eventos'} <span aria-hidden="true">→</span></a><a class="button button-secondary" href="https://wa.me/?text=${whatsappText}" target="_blank" rel="noreferrer">Compartilhar no WhatsApp</a></div>
      <p class="fine-print">As informações e a disponibilidade dos ingressos são confirmadas pela casa de show.</p></div><aside class="side-card"><span class="side-logo">✦</span><h2>Viva esse rolê com a gente</h2><p>Encontre eventos incríveis, veja quem já vai e dê match antes do rolê começar.</p><a href="/eventos">Explorar eventos <span aria-hidden="true">→</span></a></aside></section></main>
    <footer class="footer">Rolê · Boas festas, novas pessoas, conexões reais.</footer>`;
  const structuredData = eventStructuredData(event, { title, description, image, canonical, priceMinor });
  return pageShell({
    title: `${title} | Rolê`,
    description,
    image,
    canonical,
    body,
    structuredData,
    robots: event.status === 'completed' ? 'noindex,follow' : 'index,follow',
  });
}

function eventStructuredData(event, { title, description, image, canonical, priceMinor }) {
  if (event.status === 'completed' || !event.starts_at) return null;
  const startDate = new Date(event.starts_at);
  if (Number.isNaN(startDate.getTime())) return null;
  const endDate = event.ends_at ? new Date(event.ends_at) : null;
  const currency = /^[A-Z]{3}$/.test(String(event.currency || '')) ? event.currency : 'BRL';
  const address = {
    '@type': 'PostalAddress',
    ...(event.venue_address ? { streetAddress: event.venue_address } : {}),
    ...(event.city ? { addressLocality: event.city } : {}),
    addressCountry: 'BR',
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    description,
    startDate: startDate.toISOString(),
    ...(endDate && !Number.isNaN(endDate.getTime()) ? { endDate: endDate.toISOString() } : {}),
    eventStatus: event.status === 'cancelled'
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue_name || event.city || title,
      address,
    },
    image: [image],
    url: canonical,
    ...(event.status === 'published' && priceMinor !== null && priceMinor !== undefined
      ? { offers: {
        '@type': 'Offer',
        price: (Number(priceMinor) / 100).toFixed(2),
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
        url: canonical,
      } }
      : {}),
  };
}

async function findLowestPrice(supabaseUrl, publishableKey, event) {
  if (!event.id || !event.starts_at) return null;
  const startsAt = new Date(event.starts_at);
  if (Number.isNaN(startsAt.getTime())) return null;
  const rows = await invokeRpc(supabaseUrl, publishableKey, 'search_public_event_directory', {
    p_search: null,
    p_city: event.city || null,
    p_category: null,
    p_starts_at_from: startsAt.toISOString(),
    p_starts_at_before: new Date(startsAt.getTime() + 1).toISOString(),
    p_limit: 50,
    p_offset: 0,
  });
  const match = Array.isArray(rows) ? rows.find((row) => row.id === event.id) : null;
  const priceMinor = match && match.lowest_price_minor !== null && match.lowest_price_minor !== undefined
    ? Number(match.lowest_price_minor)
    : null;
  return Number.isFinite(priceMinor) && priceMinor >= 0 ? priceMinor : null;
}

function formatMoney(minor, currency) {
  const safeCurrency = /^[A-Z]{3}$/.test(String(currency || '')) ? currency : 'BRL';
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: safeCurrency }).format(Number(minor) / 100);
  } catch {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(minor) / 100);
  }
}

function pageShell({ title, description, image, canonical, body, structuredData = null, robots = 'index,follow' }) {
  const jsonLd = structuredData
    ? `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`
    : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${escapeHtml(robots)}"><link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:type" content="website"><meta property="og:site_name" content="Rolê"><meta property="og:locale" content="pt_BR"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(image)}"><meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(image)}">
    <meta name="theme-color" content="#180b22">${jsonLd}<style>${styles}</style></head><body><div class="site">${body}</div></body></html>`;
}

function shareUrl(origin, code, title) {
  return `${origin}/events/${encodeURIComponent(String(code || ''))}/${encodeURIComponent(slugify(String(title || 'role')) || 'role')}`;
}

function coverUrl(supabaseUrl, path) {
  if (typeof path !== 'string' || !path || path.split('/').some((part) => part === '..')) return '';
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return `${supabaseUrl}/storage/v1/object/public/${EVENT_COVER_BUCKET}/${encodedPath}`;
}

function fallbackCover(origin) {
  return `${origin}/assets/derived/preview-event-baile.webp`;
}

function slugify(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96).replace(/-+$/g, '');
}

function formatEventDate(value, timeZone) {
  if (!value) return 'Data a confirmar';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: timeZone || 'America/Sao_Paulo',
    }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  }
}

function truncate(value, maxLength) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1).trimEnd()}…` : normalized;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function sendPage(res, statusCode, html, cacheControl) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res.status(statusCode).send(html);
}

function errorPage(title, description) {
  const origin = 'https://role.events';
  return pageShell({
    title: `${title} | Rolê`,
    description,
    image: fallbackCover(origin),
    canonical: `${origin}/eventos`,
    body: `<main class="error-page"><a class="brand" href="/eventos"><span class="brand-mark">R</span> ROLÊ</a><div class="sparkle">✦</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><a class="button" href="/eventos">Explorar eventos</a></main>`,
  });
}

const styles = `
  :root{color-scheme:dark;--ink:#1b1025;--muted:#756d7e;--pink:#f0009a;--coral:#ff624f;--paper:#fbf9fc;--line:#e9e2ec;--purple:#1a0d23}
  *{box-sizing:border-box}html{background:var(--paper)}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}.site{min-height:100vh}.masthead{height:76px;padding:0 max(24px,calc((100vw - 1160px)/2));display:flex;align-items:center;justify-content:space-between;background:var(--purple);color:#fff}.masthead-overlay{position:absolute;top:0;left:0;right:0;z-index:2;background:transparent}.brand{display:inline-flex;align-items:center;gap:10px;color:inherit;text-decoration:none;font-weight:900;letter-spacing:.12em}.brand-mark{width:32px;height:32px;display:grid;place-items:center;border-radius:11px;background:linear-gradient(130deg,var(--pink),var(--coral));font-size:17px;letter-spacing:0}.top-link{color:#fff;text-decoration:none;font-size:14px;font-weight:700}.directory-main{max-width:1160px;margin:0 auto;padding:56px 24px 72px}.intro{max-width:760px;margin:0 0 34px}.eyebrow{color:var(--pink);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.intro h1{margin:10px 0 12px;font-size:clamp(38px,7vw,68px);line-height:1.02;letter-spacing:-.045em}.intro h1 em{font-style:normal;color:var(--pink)}.lead{max-width:580px;color:#6e6677;font-size:18px;line-height:1.6}.search{display:flex;gap:10px;max-width:650px;margin-top:24px}.search input{min-width:0;flex:1;border:1px solid var(--line);border-radius:14px;padding:15px 16px;background:#fff;color:var(--ink);font-size:15px}.search button,.button{border:0;border-radius:999px;padding:14px 21px;background:linear-gradient(100deg,var(--pink),var(--coral));color:#fff;text-decoration:none;font-size:14px;font-weight:800;cursor:pointer}.event-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.event-card{overflow:hidden;border:1px solid var(--line);border-radius:22px;background:#fff;color:inherit;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease}.event-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px #24132b18}.event-card img{display:block;width:100%;aspect-ratio:1.55;object-fit:cover;background:#281434}.event-copy{padding:18px}.event-copy .eyebrow{font-size:10px}.event-copy h2{margin:8px 0;font-size:22px;line-height:1.15;letter-spacing:-.025em}.event-copy p{margin:0 0 15px;color:var(--muted);font-size:13px;line-height:1.5}.card-link{color:#d8008c;font-size:14px;font-weight:800}.empty{grid-column:1/-1;padding:58px 20px;border:1px solid var(--line);border-radius:22px;background:#fff;text-align:center}.empty h2{margin:16px 0 8px;font-size:25px}.empty p{margin:0;color:var(--muted)}.sparkle{width:72px;height:72px;display:grid;place-items:center;margin:0 auto 16px;border-radius:22px;background:#fce7f4;color:var(--pink);font-size:38px}.more{text-align:center;margin-top:34px}.button-secondary{background:#fff;color:var(--ink);border:1px solid var(--line)}.event-main{max-width:1160px;margin:0 auto;padding-bottom:48px}.event-hero{position:relative;min-height:490px;overflow:hidden;background:#24112e;color:#fff}.hero-image,.hero-shade{position:absolute;inset:0;width:100%;height:100%}.hero-image{object-fit:cover}.hero-shade{background:linear-gradient(90deg,rgba(20,8,29,.88),rgba(20,8,29,.46) 58%,rgba(20,8,29,.08)),linear-gradient(0deg,rgba(20,8,29,.72),transparent 60%)}.hero-content{position:absolute;left:max(24px,calc((100vw - 1060px)/2));right:24px;bottom:58px;max-width:740px}.hero-content .eyebrow{color:#ff70c5}.hero-content h1{margin:14px 0 12px;font-size:clamp(42px,8vw,76px);line-height:1;letter-spacing:-.05em}.hero-description{max-width:700px;margin:0;color:#f3e8f4;font-size:19px;line-height:1.5}.event-details{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(250px,.7fr);gap:42px;padding:38px 32px}.details-copy{max-width:700px}.detail-line{display:flex;align-items:center;gap:16px;margin:0 0 18px;padding:18px;border:1px solid var(--line);border-radius:17px;background:#fff}.detail-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:13px;background:#fce8f4;color:var(--pink);font-size:22px}.detail-line strong,.detail-line span{display:block}.detail-line strong{font-size:15px}.detail-line div span{margin-top:4px;color:var(--muted);font-size:13px}.details-copy h2{margin:34px 0 10px;font-size:25px}.details-copy>p{color:#635b6b;line-height:1.7}.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:25px}.fine-print{font-size:12px}.status{padding:12px 15px;border-radius:12px;background:#fce7f4;color:#961560;font-weight:700}.status-cancelled{background:#fff0ee;color:#ab352a}.side-card{align-self:start;margin-top:0;padding:26px;border-radius:22px;background:var(--purple);color:#fff}.side-logo{display:grid;width:48px;height:48px;place-items:center;border-radius:15px;background:#fce7f4;color:var(--pink);font-size:26px}.side-card h2{margin:19px 0 9px;font-size:23px}.side-card p{color:#d7cbdc;line-height:1.55}.side-card a{color:#ff72c7;font-weight:800;text-decoration:none}.footer{padding:24px;text-align:center;color:#827988;font-size:12px;border-top:1px solid var(--line)}.error-page{min-height:calc(100vh - 60px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center}.error-page .brand{margin-bottom:54px;color:var(--ink)}.error-page h1{margin:5px 0;font-size:34px}.error-page p{margin:0 0 24px;color:var(--muted)}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  @media(max-width:760px){.masthead{height:64px;padding:0 20px}.directory-main{padding:40px 18px 54px}.intro h1{font-size:44px}.lead{font-size:16px}.event-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.event-copy{padding:14px}.event-copy h2{font-size:18px}.event-copy p{font-size:12px}.event-hero{min-height:470px}.hero-content{left:22px;right:22px;bottom:34px}.hero-content h1{font-size:48px}.hero-description{font-size:16px}.event-details{grid-template-columns:1fr;gap:22px;padding:24px 18px}.side-card{margin:0}.cta-row{flex-direction:column}.cta-row .button{text-align:center}}
  @media(max-width:440px){.event-grid{grid-template-columns:1fr}.event-card img{aspect-ratio:1.7}.search{flex-direction:column}.search button{min-height:48px}.intro h1{font-size:40px}.event-hero{min-height:430px}.hero-content h1{font-size:42px}}
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important}}
`;
