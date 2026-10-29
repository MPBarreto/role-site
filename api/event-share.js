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
  const content = cards || `<div class="empty"><h2>Nenhum rolê encontrado</h2><p>Tente outra busca ou volte em breve para descobrir novos eventos.</p></div>`;
  const canonical = `${origin}/eventos`;
  return pageShell({
    title: 'Eventos | Matchie',
    description: 'Veja quem vai ao mesmo evento, dê match e comece a conversa antes de chegar.',
    image: fallbackCover(origin),
    canonical,
    body: `<header class="masthead"><a class="brand" href="/" aria-label="Matchie, página inicial"><img src="/assets/logo/matchie-branca-chama-gradiente.png" alt="Matchie" width="142" height="71"></a><a class="top-link" href="/#app">Baixar o app <span aria-hidden="true">↗</span></a></header>
      <main class="directory-main"><section class="intro"><p class="eyebrow">DESCUBRA SEU PRÓXIMO EVENTO</p><h1>Conheça quem vai <em>antes de chegar.</em></h1><p class="lead">Veja quem vai ao mesmo evento, dê match e comece a conversa antes da festa.</p>
      <form class="search" action="/eventos" method="get"><label class="sr-only" for="event-search">Buscar evento, cidade ou casa de show</label><input id="event-search" name="q" value="${escapeHtml(search)}" placeholder="Evento, cidade ou casa de show"><button type="submit">Buscar</button></form></section>
      <section class="event-grid" aria-label="Eventos públicos">${content}</section><div class="more">${nextLink}</div></main>
      <footer class="footer">Matchie · Boas festas, novas pessoas, conexões reais.</footer>`,
  });
}

function eventPage(event, { origin, supabaseUrl, shareCode, priceMinor }) {
  const title = String(event.title || 'Evento no Matchie');
  const canonical = shareUrl(origin, shareCode, title);
  const image = coverUrl(supabaseUrl, event.cover_image_path) || fallbackCover(origin);
  const fullDescription = String(event.description || `Descubra ${title} no Matchie.`).trim();
  const description = truncate(fullDescription, 220);
  const location = [event.venue_name, event.venue_address, event.city].filter(Boolean).join(' · ');
  const mapUrl = location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}` : '';
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
  const body = `<header class="masthead masthead-overlay"><a class="brand" href="/" aria-label="Matchie"><img src="/assets/logo/matchie-branca-chama-gradiente.png" alt="Matchie" width="142" height="71"></a><a class="top-link" href="/eventos">Todos os eventos <span aria-hidden="true">→</span></a></header>
    <main class="event-main"><article class="event-hero"><img class="hero-image" src="${escapeHtml(image)}" alt="Capa de ${escapeHtml(title)}"><div class="hero-shade"></div>
      <div class="hero-content"><p class="eyebrow">${escapeHtml(event.category || 'EVENTO')} · ${escapeHtml(event.city || '')}</p><h1>${escapeHtml(title)}</h1><p class="hero-description">${escapeHtml(description)}</p></div>
    </article><section class="event-details"><div class="details-copy">${state}
      <div class="detail-line"><span class="detail-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 11h18"></path></svg></span><div><strong>${escapeHtml(startsAt)}</strong>${endsAt ? `<span>Até ${escapeHtml(endsAt)}</span>` : ''}</div></div>
      <div class="detail-line"><span class="detail-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg></span><div><strong>${escapeHtml(event.venue_name || '')}</strong><span>${escapeHtml([event.venue_address, event.city].filter(Boolean).join(' · '))}</span>${mapUrl ? `<a class="map-link" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer">Ver no mapa ↗</a>` : ''}</div></div>
      ${price ? `<div class="detail-line"><span class="detail-icon" aria-hidden="true">R$</span><div><strong>Ingressos a partir de ${escapeHtml(price)}</strong><span>Consulte a disponibilidade no app Matchie.</span></div></div>` : ''}
      <div class="cta-row"><a class="button" href="${escapeHtml(isAvailable ? appUrl : '/eventos')}">${isAvailable ? 'Ver ingressos no app' : 'Explorar próximos eventos'} <span aria-hidden="true">→</span></a><a class="button button-secondary" href="https://wa.me/?text=${whatsappText}" target="_blank" rel="noopener noreferrer">Compartilhar no WhatsApp</a></div>
      <h2>Sobre o evento</h2><p class="event-description">${escapeHtml(fullDescription)}</p><p class="fine-print">As informações e a disponibilidade dos ingressos são confirmadas pela casa de show.</p>
    </div><aside class="side-card"><p class="eyebrow">Matchie · eventos e conexões</p><h2>Conheça quem também vai</h2><p>Dê match com pessoas que vão ao mesmo evento e comece a conversar antes de chegar.</p><a href="/eventos">Explorar eventos <span aria-hidden="true">→</span></a></aside></section></main>
    <footer class="footer">Matchie · Boas festas, novas pessoas, conexões reais.</footer>`;
  const structuredData = eventStructuredData(event, { title, description: fullDescription, image, canonical, priceMinor });
  return pageShell({
    title: `${title} | Matchie`,
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
    <meta property="og:type" content="website"><meta property="og:site_name" content="Matchie"><meta property="og:locale" content="pt_BR"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(image)}"><meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(image)}">
    <meta name="theme-color" content="#09070d">${jsonLd}<style>${styles}</style></head><body><div class="site">${body}</div></body></html>`;
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
    title: `${title} | Matchie`,
    description,
    image: fallbackCover(origin),
    canonical: `${origin}/eventos`,
    body: `<main class="error-page"><a class="brand" href="/eventos" aria-label="Matchie"><img src="/assets/logo/matchie-branca-chama-gradiente.png" alt="Matchie" width="142" height="71"></a><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><a class="button" href="/eventos">Explorar eventos</a></main>`,
  });
}

const styles = `
  :root{color-scheme:dark;--bg:#09070d;--bg2:#100b14;--panel:#120e15;--panel2:rgba(12,8,16,.92);--pink:#ff2b8a;--coral:#ff5f74;--violet:#8a4dff;--text:#f7f5f8;--muted:#b9b2bf;--line:rgba(255,255,255,.12);--grad:linear-gradient(105deg,var(--pink),var(--coral) 62%,#ff9652);--shadow:0 34px 90px rgba(0,0,0,.48)}
  *{box-sizing:border-box}html{min-height:100%;background:var(--bg);scroll-behavior:smooth}body{min-height:100vh;margin:0;background:radial-gradient(ellipse at 12% 4%,rgba(138,77,255,.1),transparent 32%),radial-gradient(ellipse at 88% 18%,rgba(255,43,138,.08),transparent 28%),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased}.site{min-height:100vh}.masthead{position:sticky;top:0;z-index:10;height:82px;padding:0 max(20px,calc((100vw - 1180px)/2));display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);background:rgba(9,7,13,.84);backdrop-filter:blur(20px);color:var(--text)}.masthead .brand{display:inline-flex;align-items:center;margin-right:auto}.brand img{display:block;width:126px;height:auto}.masthead-overlay{position:absolute;top:0;left:0;right:0;z-index:2;background:linear-gradient(180deg,rgba(9,7,13,.65),transparent);border-bottom:0;backdrop-filter:none}.top-link{min-height:44px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:9px;border:1px solid rgba(255,255,255,.25);border-radius:14px;background:rgba(12,8,16,.5);color:#fff;text-decoration:none;font-size:14px;font-weight:800;transition:border-color .2s,transform .2s}.top-link:hover{transform:translateY(-2px);border-color:rgba(255,43,138,.7)}.directory-main{width:min(1180px,calc(100% - 40px));margin:0 auto;padding:68px 0 94px}.intro{max-width:780px;margin:0 0 42px}.eyebrow{margin:0 0 15px;color:#ff78ad;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.intro h1{margin:0 0 16px;font-size:clamp(42px,6vw,72px);line-height:.98;letter-spacing:-.06em}.intro h1 em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}.lead{max-width:650px;margin:0;color:var(--muted);font-size:18px;line-height:1.6}.search{display:flex;gap:10px;max-width:690px;margin-top:27px}.search input{min-width:0;flex:1;min-height:54px;border:1px solid var(--line);border-radius:16px;padding:0 17px;background:rgba(18,14,21,.88);color:var(--text);font:inherit;font-size:15px}.search input::placeholder{color:#8f8793}.search input:focus{border-color:rgba(255,43,138,.75);outline:2px solid rgba(255,43,138,.18)}.search button,.button{min-height:52px;border:0;border-radius:16px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;gap:9px;background:var(--grad);box-shadow:0 14px 36px rgba(255,43,138,.19);color:#fff;text-decoration:none;font:inherit;font-size:14px;font-weight:850;cursor:pointer;transition:transform .2s,box-shadow .2s}.search button:hover,.button:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(255,43,138,.27)}.event-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.event-card{overflow:hidden;border:1px solid var(--line);border-radius:27px;background:var(--panel);box-shadow:0 25px 60px rgba(0,0,0,.23);color:var(--text);text-decoration:none;transition:transform .25s,border-color .25s,box-shadow .25s}.event-card:hover{transform:translateY(-5px);border-color:rgba(255,43,138,.55);box-shadow:var(--shadow)}.event-card img{display:block;width:100%;aspect-ratio:1.55;object-fit:cover;background:#151018}.event-copy{padding:19px 20px 21px}.event-copy .eyebrow{margin:0 0 8px;color:#ff78ad;font-size:10px}.event-copy h2{margin:0 0 9px;font-size:22px;line-height:1.12;letter-spacing:-.035em}.event-copy p{margin:0 0 17px;color:var(--muted);font-size:13px;line-height:1.5}.card-link{color:#ff78ad;font-size:14px;font-weight:850}.empty{grid-column:1/-1;padding:58px 24px;border:1px solid var(--line);border-radius:27px;background:rgba(18,14,21,.78);text-align:center}.empty h2{margin:0 0 8px;font-size:26px;letter-spacing:-.03em}.empty p{margin:0;color:var(--muted)}.more{text-align:center;margin-top:34px}.button-secondary{background:rgba(12,8,16,.72);box-shadow:none;border:1px solid rgba(255,255,255,.2)}.button-secondary:hover{border-color:rgba(255,43,138,.7);box-shadow:none}.event-main{width:min(1180px,100%);margin:0 auto;padding-bottom:48px}.event-hero{position:relative;min-height:540px;overflow:hidden;border-radius:0 0 27px 27px;background:#100b14;color:#fff}.hero-image,.hero-shade{position:absolute;inset:0;width:100%;height:100%}.hero-image{object-fit:cover}.hero-shade{background:linear-gradient(90deg,rgba(9,7,13,.9),rgba(9,7,13,.58) 54%,rgba(9,7,13,.08)),linear-gradient(0deg,rgba(9,7,13,.84),transparent 68%)}.hero-content{position:absolute;left:max(24px,calc((100vw - 1060px)/2));right:24px;bottom:58px;max-width:740px}.hero-content .eyebrow{color:#ff78ad}.hero-content h1{margin:14px 0 12px;font-size:clamp(42px,8vw,76px);line-height:.98;letter-spacing:-.06em}.hero-description{max-width:700px;margin:0;color:#f0edf2;font-size:19px;line-height:1.5}.event-details{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(250px,.7fr);gap:42px;padding:38px 20px}.details-copy{max-width:700px}.detail-line{display:flex;align-items:center;gap:16px;margin:0 0 14px;padding:17px;border:1px solid var(--line);border-radius:18px;background:rgba(18,14,21,.82)}.detail-icon{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border:1px solid rgba(255,43,138,.26);border-radius:14px;background:rgba(255,43,138,.1);color:#ff78ad;font-size:19px;font-weight:800}.detail-line strong,.detail-line span{display:block}.detail-line strong{font-size:15px}.detail-line div span{margin-top:4px;color:var(--muted);font-size:13px}.details-copy h2{margin:34px 0 10px;font-size:27px;letter-spacing:-.04em}.details-copy>p{color:var(--muted);line-height:1.7}.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:25px}.fine-print{font-size:12px}.status{padding:12px 15px;border:1px solid rgba(255,43,138,.24);border-radius:14px;background:rgba(255,43,138,.1);color:#ffc1dc;font-weight:750}.status-cancelled{border-color:rgba(255,95,116,.3);background:rgba(255,95,116,.1);color:#ffabb5}.side-card{align-self:start;margin-top:0;padding:27px;border:1px solid rgba(255,43,138,.34);border-radius:24px;background:linear-gradient(145deg,rgba(24,13,29,.95),rgba(12,8,16,.96));box-shadow:var(--shadow);color:var(--text)}.side-card .eyebrow{margin:0 0 15px;color:#ff78ad}.side-card h2{margin:0 0 9px;font-size:24px;line-height:1.08;letter-spacing:-.04em}.side-card p:not(.eyebrow){color:var(--muted);line-height:1.55}.side-card a{color:#ff78ad;font-weight:850;text-decoration:none}.footer{padding:24px;border-top:1px solid var(--line);color:#8f8793;text-align:center;font-size:12px}.error-page{min-height:calc(100vh - 60px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center}.error-page .brand{margin:0 0 48px}.error-page .brand img{width:126px}.error-page h1{margin:5px 0;font-size:clamp(30px,5vw,42px);letter-spacing:-.045em}.error-page p{margin:0 0 24px;color:var(--muted)}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}a:focus-visible,button:focus-visible{outline:2px solid #ff78ad;outline-offset:4px}
  @media(max-width:760px){.masthead{height:72px;padding:0 18px}.brand img{width:112px}.directory-main{width:min(100% - 36px,1180px);padding:48px 0 64px}.intro{margin-bottom:32px}.intro h1{font-size:clamp(42px,10vw,58px)}.lead{font-size:16px}.event-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.event-copy{padding:15px}.event-copy h2{font-size:18px}.event-copy p{font-size:12px}.event-hero{min-height:470px;border-radius:0 0 22px 22px}.hero-content{left:22px;right:22px;bottom:34px}.hero-content h1{font-size:48px}.hero-description{font-size:16px}.event-details{grid-template-columns:1fr;gap:22px;padding:26px 18px}.side-card{margin:0}.cta-row{flex-direction:column}.cta-row .button{text-align:center}}
  @media(max-width:440px){.directory-main{width:calc(100% - 32px);padding-top:40px}.event-grid{grid-template-columns:1fr}.event-card img{aspect-ratio:1.7}.search{flex-direction:column}.search button{width:100%}.intro h1{font-size:40px}.event-hero{min-height:430px}.hero-content h1{font-size:42px}.event-details{padding:22px 16px}.cta-row .button{width:100%}}
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important}}
  .detail-line span.detail-icon{display:grid}.detail-icon svg{display:block;width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.map-link{display:inline-flex;align-items:center;margin-top:10px;color:#ff78ad;font-size:13px;font-weight:850;text-decoration:none}.map-link:hover{text-decoration:underline}.event-description{white-space:pre-line;overflow-wrap:anywhere}

`;
