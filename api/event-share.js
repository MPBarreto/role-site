const EVENT_COVER_BUCKET = 'role-event-covers';
const PUBLIC_CODE_PATTERN = /^[0-9a-f]{16}$/;
const EVENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_APP_ORIGIN = 'https://app.matchie.events';
const EVENT_CATEGORIES = [
  ['party', 'Festa'],
  ['concert', 'Show'],
  ['club', 'Balada'],
  ['bar', 'Bar'],
  ['rooftop', 'Rooftop'],
  ['samba_pagode', 'Samba e pagode'],
  ['sertanejo', 'Sertanejo'],
  ['electronic', 'Eletrônica'],
  ['comedy', 'Stand-up e comédia'],
];
const EVENT_CATEGORY_NAMES = Object.fromEntries(EVENT_CATEGORIES);
const DIRECTORY_PAGE_SIZE = 24;

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
      const filters = parseDirectoryFilters(req);
      const offset = parseOffset(queryValue(req, 'offset'));
      const rows = filters.city || filters.date || filters.category
        ? await searchFilteredDirectory(supabaseUrl, publishableKey, filters, offset)
        : await invokeRpc(supabaseUrl, publishableKey, 'search_public_event_share_directory', {
          p_search: filters.search || null,
          p_limit: DIRECTORY_PAGE_SIZE,
          p_offset: offset,
        });
      const html = directoryPage(rows, { origin, ...filters, offset, supabaseUrl });
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
  if (hostname !== 'localhost') return 'https://matchie.events';
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
    return new URL(req.url || '/', 'https://matchie.events').searchParams.get(key) || '';
  } catch {
    return '';
  }
}

function parseOffset(value) {
  const offset = Number.parseInt(value || '0', 10);
  return Number.isFinite(offset) ? Math.max(0, Math.min(offset, 10000)) : 0;
}

function parseDirectoryFilters(req) {
  const search = (queryValue(req, 'q') || '').trim().slice(0, 120);
  const city = (queryValue(req, 'city') || '').trim().slice(0, 120);
  const rawCategory = (queryValue(req, 'category') || '').trim();
  const category = Object.hasOwn(EVENT_CATEGORY_NAMES, rawCategory) ? rawCategory : '';
  const rawDate = (queryValue(req, 'date') || '').trim();
  const date = isDateKey(rawDate) ? rawDate : '';
  const dateRange = date ? getDateRange(date) : null;

  return {
    search,
    city,
    category,
    date,
    startsAtFrom: dateRange?.from ?? null,
    startsAtBefore: dateRange?.before ?? null,
  };
}

function isDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

function getDateRange(date) {
  const [year, month, day] = date.split('-').map(Number);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
  const nextDate = [
    nextDay.getUTCFullYear(),
    String(nextDay.getUTCMonth() + 1).padStart(2, '0'),
    String(nextDay.getUTCDate()).padStart(2, '0'),
  ].join('-');

  // Event dates on the public site follow Brazil's primary event timezone.
  return {
    from: new Date(`${date}T00:00:00-03:00`).toISOString(),
    before: new Date(`${nextDate}T00:00:00-03:00`).toISOString(),
  };
}

async function searchFilteredDirectory(supabaseUrl, publishableKey, filters, offset) {
  const rows = await invokeRpc(supabaseUrl, publishableKey, 'search_public_event_directory', {
    p_search: filters.search || null,
    p_city: filters.city || null,
    p_category: filters.category || null,
    p_starts_at_from: filters.startsAtFrom,
    p_starts_at_before: filters.startsAtBefore,
    p_limit: DIRECTORY_PAGE_SIZE,
    p_offset: offset,
  });
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const hydratedRows = await Promise.all(rows.map(async (event) => {
    const detailRows = await invokeRpc(supabaseUrl, publishableKey, 'get_public_event_detail', {
      p_event_id: event.id,
    });
    const detail = Array.isArray(detailRows) ? detailRows[0] : detailRows;
    if (!detail) return null;

    return {
      ...event,
      public_share_code: detail.public_share_code,
      cover_image_path: detail.cover_image_path,
      total_count: event.total_count,
    };
  }));

  return hydratedRows.filter(Boolean);
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

function directoryPage(rows, { origin, search, city, date, category, offset, supabaseUrl }) {
  const events = Array.isArray(rows) ? rows : [];
  const total = Number(events[0] && events[0].total_count || 0);
  const cards = events.map((event) => {
    const url = shareUrl(origin, event.public_share_code, event.title);
    const image = coverUrl(supabaseUrl, event.cover_image_path) || fallbackCover(origin);
    const date = formatEventDate(event.starts_at, event.event_timezone);
    return `<article class="event-card">
      ${eventShareButton(url, event.title)}
      <a class="event-card-link" href="${escapeHtml(url)}">
        <span class="event-category-badge">${escapeHtml(EVENT_CATEGORY_NAMES[event.category] || 'Evento')}</span>
        <img src="${escapeHtml(image)}" alt="Capa do evento ${escapeHtml(event.title)}" loading="lazy">
        <div class="event-copy"><span class="eyebrow">${escapeHtml(event.city)}</span>
          <h2>${escapeHtml(event.title)}</h2><p>${escapeHtml(date)} · ${escapeHtml(event.venue_name)}</p>
          <span class="card-link">Ver evento <span aria-hidden="true">→</span></span></div>
      </a>
    </article>`;
  }).join('');
  const nextOffset = offset + events.length;
  const nextLink = nextOffset < total
    ? `<a class="button button-secondary" href="${escapeHtml(directoryHref({ search, city, date, category, offset: nextOffset }))}">Ver mais eventos</a>`
    : '';
  const content = cards || `<div class="empty"><h2>Nenhum rolê encontrado</h2><p>Tente outra busca ou volte em breve para descobrir novos eventos.</p></div>`;
  const canonical = `${origin}/events`;
  const activeFilterCount = [city, date, category].filter(Boolean).length;
  const filtersOpen = activeFilterCount > 0;
  const filterToggleLabel = activeFilterCount
    ? `${activeFilterCount} filtro${activeFilterCount === 1 ? '' : 's'} ativo${activeFilterCount === 1 ? '' : 's'}. Ocultar filtros`
    : 'Expandir filtros';
  const categoryOptions = EVENT_CATEGORIES.map(([value, label]) => `<option value="${value}"${category === value ? ' selected' : ''}>${label}</option>`).join('');
  return pageShell({
    title: 'Eventos | Matchie',
    description: 'Veja quem vai ao mesmo evento, dê match e comece a conversa antes da pista.',
    image: fallbackCover(origin),
    canonical,
    body: `<header class="masthead"><a class="brand" href="/" aria-label="Matchie, página inicial"><img src="/assets/logo/matchie-branca-chama-gradiente.webp" alt="Matchie" width="142" height="71"></a><a class="top-link" href="/#app">Baixar o app <span aria-hidden="true">↗</span></a></header>
      <main class="directory-main"><section class="intro"><p class="eyebrow">DESCUBRA SEU PRÓXIMO EVENTO</p><h1>Garanta seu ingresso e o<em> próximo match.</em></h1><p class="lead">Veja quem vai ao mesmo evento, dê match e comece a conversa antes da festa.</p>
      <form class="search" action="/events" method="get"><div class="search-row"><label class="sr-only" for="event-search">Buscar evento, cidade ou casa de show</label><input id="event-search" name="q" value="${escapeHtml(search)}" placeholder="Evento, cidade ou casa de show"><button class="filter-toggle" id="event-filters-toggle" type="button" data-active-count="${activeFilterCount}" aria-label="${filterToggleLabel}" aria-expanded="${filtersOpen}" aria-controls="event-filters" title="Filtrar eventos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h9m4 0h3M4 17h3m4 0h9"></path><circle cx="15" cy="7" r="2"></circle><circle cx="9" cy="17" r="2"></circle></svg>${activeFilterCount ? `<span class="filter-active-count" aria-hidden="true">${activeFilterCount}</span>` : ''}</button><button class="search-submit" type="submit">Buscar</button></div>
        <div class="filter-panel" id="event-filters"${filtersOpen ? '' : ' hidden'}><label for="event-city">Cidade<input id="event-city" name="city" value="${escapeHtml(city)}" placeholder="Ex.: Curitiba" autocomplete="address-level2"></label><label for="event-date">Data do evento<input id="event-date" name="date" type="date" value="${escapeHtml(date)}"></label><label for="event-category">Categoria<select id="event-category" name="category"><option value="">Todas as categorias</option>${categoryOptions}</select></label><a class="filter-clear" href="/events">Limpar filtros</a></div>
      </form><script>(function(){var button=document.getElementById('event-filters-toggle');var panel=document.getElementById('event-filters');if(!button||!panel)return;var activeCount=Number(button.getAttribute('data-active-count')||0);button.addEventListener('click',function(){var expanded=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!expanded));var activeLabel=activeCount===1?'1 filtro ativo. ':activeCount>1?activeCount+' filtros ativos. ':'';button.setAttribute('aria-label',activeLabel+(expanded?'Expandir filtros':'Ocultar filtros'));panel.hidden=expanded;});})();</script></section>
      <section class="event-grid" aria-label="Eventos públicos">${content}</section><div class="more">${nextLink}</div></main>
      ${siteFooter()}`,
  });
}

function directoryHref({ search, city, date, category, offset }) {
  const params = new URLSearchParams({ offset: String(offset) });
  if (search) params.set('q', search);
  if (city) params.set('city', city);
  if (date) params.set('date', date);
  if (category) params.set('category', category);
  return `/events?${params.toString()}`;
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
  const appUrl = buildEventAppUrl(event.event_id, process.env.EVENT_APP_ORIGIN || DEFAULT_APP_ORIGIN);
  const isAvailable = event.status === 'published' && Boolean(appUrl);
  const whatsappText = encodeURIComponent(`${title}\n${location}\n${startsAt}\n${canonical}`);
  const state = event.status === 'cancelled'
    ? '<p class="status status-cancelled">Este evento foi cancelado.</p>'
    : event.status === 'completed'
      ? '<p class="status">Este rolê já aconteceu. Confira outros eventos.</p>'
      : '';
  const body = `<header class="masthead masthead-overlay"><a class="brand" href="/" aria-label="Matchie"><img src="/assets/logo/matchie-branca-chama-gradiente.webp" alt="Matchie" width="142" height="71"></a><div class="masthead-actions">${eventShareButton(canonical, title)}<a class="top-link" href="/events">Todos os eventos <span aria-hidden="true">→</span></a></div></header>
    <main class="event-main"><article class="event-hero"><img class="hero-image" src="${escapeHtml(image)}" alt="Capa de ${escapeHtml(title)}"><div class="hero-shade"></div>
      <div class="hero-content"><p class="eyebrow">${escapeHtml(event.category || 'EVENTO')} · ${escapeHtml(event.city || '')}</p><h1>${escapeHtml(title)}</h1><p class="hero-description">${escapeHtml(description)}</p></div>
    </article><section class="event-details"><div class="details-copy">${state}
      <div class="detail-line"><span class="detail-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 11h18"></path></svg></span><div><strong>${escapeHtml(startsAt)}</strong>${endsAt ? `<span>Até ${escapeHtml(endsAt)}</span>` : ''}</div></div>
      <div class="detail-line"><span class="detail-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg></span><div><strong>${escapeHtml(event.venue_name || '')}</strong><span>${escapeHtml([event.venue_address, event.city].filter(Boolean).join(' · '))}</span>${mapUrl ? `<a class="map-link" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer">Ver no mapa ↗</a>` : ''}</div></div>
      ${price ? `<div class="detail-line"><span class="detail-icon" aria-hidden="true">R$</span><div><strong>Ingressos a partir de ${escapeHtml(price)}</strong><span>Consulte a disponibilidade no app Matchie.</span></div></div>` : ''}
      <div class="cta-row"><a class="button" href="${escapeHtml(isAvailable ? appUrl : '/events')}">${isAvailable ? 'Compre pelo app' : 'Explorar próximos eventos'} <span aria-hidden="true">→</span></a><a class="button button-secondary" href="https://wa.me/?text=${whatsappText}" target="_blank" rel="noopener noreferrer">Compartilhar no WhatsApp</a></div>
      <h2>Sobre o evento</h2><p class="event-description">${escapeHtml(fullDescription)}</p><p class="fine-print">As informações e a disponibilidade dos ingressos são confirmadas pela casa de show.</p>
    </div><aside class="side-card"><p class="eyebrow">Matchie · eventos e conexões</p><h2>Conheça quem também vai</h2><p>Dê match com pessoas que vão ao mesmo evento e comece a conversar antes da pista.</p><a href="/events">Explorar eventos <span aria-hidden="true">→</span></a></aside></section></main>
    ${siteFooter()}`;
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

export function buildEventAppUrl(eventId, configuredOrigin = DEFAULT_APP_ORIGIN) {
  if (typeof eventId !== 'string' || !EVENT_ID_PATTERN.test(eventId)) return null;

  let appOrigin = DEFAULT_APP_ORIGIN;
  try {
    const parsed = new URL(configuredOrigin);
    const localDevelopment = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if ((parsed.protocol === 'https:' || localDevelopment && parsed.protocol === 'http:')
        && !parsed.username && !parsed.password && parsed.pathname === '/' && !parsed.search && !parsed.hash) {
      appOrigin = parsed.origin;
    }
  } catch {
    // A bad deployment setting should still send buyers to the canonical app domain.
  }

  return `${appOrigin}/events/${encodeURIComponent(eventId)}?ingressos`;
}

function siteFooter() {
  const appStoreVisible = process.env.VITE_SHOW_APP_STORE_BADGE !== 'false';
  const googlePlayVisible = process.env.VITE_SHOW_GOOGLE_PLAY_BADGE !== 'false';
  const storesVisible = appStoreVisible || googlePlayVisible;
  const appStoreLink = appStoreVisible
    ? '<a class="footer-store-link" href="/#app"><img src="/assets/app%20store/app-store.webp" alt="" aria-hidden="true" width="128" height="128">App Store</a>'
    : '';
  const googlePlayLink = googlePlayVisible
    ? '<a class="footer-store-link" href="/#app"><img src="/assets/app%20store/google-play.png" alt="" aria-hidden="true" width="128" height="128">Google Play</a>'
    : '';

  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand"><a href="/" aria-label="Matchie — início"><img src="/assets/logo/matchie-branca-chama-gradiente.webp" alt="Matchie"></a><p>Vai pelo evento.<br><span>Fica pelas conexões.</span></p></div>
      <div class="footer-column"><h2>Matchie</h2><a href="/events">Eventos</a><a href="/#como-funciona">Como funciona</a><a href="/#seguranca">Segurança</a><a href="/produtores">Para produtores</a></div>
      <div class="footer-column"${storesVisible ? '' : ' hidden'}><h2>App</h2>${appStoreLink}${googlePlayLink}</div>
      <div class="footer-column"><h2>Legal</h2><a href="/terms">Termos de Uso</a><a href="/privacy">Privacidade</a><a href="/seguranca-infantil">Segurança infantil</a><a href="/reembolsos">Reembolsos</a></div>
      <div class="footer-contact"><h2>Quer colocar seu evento no Matchie?</h2><a class="button" href="/produtores#produtores-contato">Falar com nosso time</a></div>
    </div>
    <div class="container footer-bottom"><span>© 2026 Matchie. Todos os direitos reservados.</span><span>Feito para noites que conectam pessoas.</span></div>
  </footer>`;
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
  if (!event.event_id || !event.starts_at) return null;
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
  const match = Array.isArray(rows) ? rows.find((row) => row.id === event.event_id) : null;
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
    <meta name="theme-color" content="#09070d"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">${jsonLd}<style>${styles}</style></head><body><div class="site">${body}</div><div class="share-toast" data-share-toast role="status" aria-live="polite"></div><script src="/event-sharing.js" defer></script></body></html>`;
}

function eventShareButton(url, title) {
  const safeTitle = String(title || 'este evento');
  return `<button class="event-share-button" type="button" data-share-url="${escapeHtml(url)}" data-share-title="${escapeHtml(safeTitle)}" data-share-text="${escapeHtml(`Confira este evento no Matchie: ${safeTitle}`)}" aria-label="Compartilhar evento ${escapeHtml(safeTitle)}" title="Compartilhar evento"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4"></path></svg></button>`;
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
  const origin = 'https://matchie.events';
  return pageShell({
    title: `${title} | Matchie`,
    description,
    image: fallbackCover(origin),
    canonical: `${origin}/events`,
    body: `<main class="error-page"><a class="brand" href="/events" aria-label="Matchie"><img src="/assets/logo/matchie-branca-chama-gradiente.webp" alt="Matchie" width="142" height="71"></a><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><a class="button" href="/events">Explorar eventos</a></main>${siteFooter()}`,
  });
}

const footerStyles = `
  .site-footer{padding:78px 0 30px;background:#070609;border-top:1px solid var(--line);color:var(--text)}
  .site-footer .container{width:min(1180px,calc(100% - 40px));margin-inline:auto}
  .site-footer .footer-grid{display:grid;grid-template-columns:1.4fr .7fr .65fr .75fr 1.25fr;gap:35px}
  .site-footer .footer-brand>a{display:inline-flex}
  .site-footer .footer-brand img{display:block;width:140px;height:auto}
  .site-footer .footer-brand p{font-size:1.45rem;font-weight:900;line-height:1.08}
  .site-footer .footer-brand p span{color:#ff719f}
  .site-footer .footer-column,.site-footer .footer-contact{display:flex;flex-direction:column;gap:9px}
  .site-footer .footer-column h2,.site-footer .footer-contact h2{font-size:.9rem;color:#ff72aa;margin:0 0 7px}
  .site-footer .footer-column a{font-size:.9rem;color:#a8a1ab;text-decoration:none}
  .site-footer .footer-column a:hover{color:#fff}
  .site-footer .footer-store-link{display:inline-flex;align-items:center;gap:8px}
  .site-footer .footer-store-link img{width:18px;height:18px;flex:0 0 18px;object-fit:contain;border-radius:4px}
  .site-footer .footer-contact .button{align-self:flex-start}
  .site-footer .footer-bottom{border-top:1px solid var(--line);margin-top:48px;padding-top:23px;display:flex;justify-content:space-between;gap:20px;color:#99939d;font-size:.77rem}
  .site-footer [hidden]{display:none!important}
  @media(max-width:1040px){.site-footer .footer-grid{grid-template-columns:1.3fr repeat(3,.8fr)}.site-footer .footer-contact{grid-column:1/-1;border-top:1px solid var(--line);padding-top:24px}}
  @media(max-width:760px){.site-footer .container{width:min(100% - 28px,1180px)}.site-footer .footer-grid{grid-template-columns:1fr 1fr}.site-footer .footer-brand,.site-footer .footer-contact{grid-column:1/-1}.site-footer .footer-bottom{flex-direction:column}}
  @media(max-width:430px){.site-footer .footer-grid{gap:28px 18px}}
`;

const styles = `
  ${footerStyles}
  :root{color-scheme:dark;--bg:#09070d;--bg2:#100b14;--panel:#120e15;--panel2:rgba(12,8,16,.92);--pink:#ff2b8a;--coral:#ff5f74;--violet:#8a4dff;--text:#f7f5f8;--muted:#b9b2bf;--line:rgba(255,255,255,.12);--grad:linear-gradient(105deg,var(--pink),var(--coral) 62%,#ff9652);--shadow:0 34px 90px rgba(0,0,0,.48)}
  *{box-sizing:border-box}html{min-height:100%;background:var(--bg);scroll-behavior:smooth}body{min-height:100vh;margin:0;background:radial-gradient(ellipse at 12% 4%,rgba(138,77,255,.1),transparent 32%),radial-gradient(ellipse at 88% 18%,rgba(255,43,138,.08),transparent 28%),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased}.site{min-height:100vh}.masthead{position:sticky;top:0;z-index:10;height:82px;padding:0 max(20px,calc((100vw - 1180px)/2));display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);background:rgba(9,7,13,.84);backdrop-filter:blur(20px);color:var(--text)}.masthead .brand{display:inline-flex;align-items:center;margin-right:auto}.brand img{display:block;width:126px;height:auto}.masthead-overlay{position:absolute;top:0;left:0;right:0;z-index:2;background:linear-gradient(180deg,rgba(9,7,13,.65),transparent);border-bottom:0;backdrop-filter:none}.top-link{min-height:44px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;gap:9px;border:1px solid rgba(255,255,255,.25);border-radius:14px;background:rgba(12,8,16,.5);color:#fff;text-decoration:none;font-size:14px;font-weight:800;transition:border-color .2s,transform .2s}.top-link:hover{transform:translateY(-2px);border-color:rgba(255,43,138,.7)}.directory-main{width:min(1180px,calc(100% - 40px));margin:0 auto;padding:68px 0 94px}.intro{max-width:780px;margin:0 0 42px}.eyebrow{margin:0 0 15px;color:#ff78ad;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.intro h1{margin:0 0 16px;font-size:clamp(42px,6vw,72px);line-height:.98;letter-spacing:-.06em}.intro h1 em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}.lead{max-width:650px;margin:0;color:var(--muted);font-size:18px;line-height:1.6}.search{display:flex;gap:10px;max-width:690px;margin-top:27px}.search input{min-width:0;flex:1;min-height:54px;border:1px solid var(--line);border-radius:16px;padding:0 17px;background:rgba(18,14,21,.88);color:var(--text);font:inherit;font-size:15px}.search input::placeholder{color:#8f8793}.search input:focus{border-color:rgba(255,43,138,.75);outline:2px solid rgba(255,43,138,.18)}.search button,.button{min-height:52px;border:0;border-radius:16px;padding:0 22px;display:inline-flex;align-items:center;justify-content:center;gap:9px;background:var(--grad);box-shadow:0 14px 36px rgba(255,43,138,.19);color:#fff;text-decoration:none;font:inherit;font-size:14px;font-weight:850;cursor:pointer;transition:transform .2s,box-shadow .2s}.search button:hover,.button:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(255,43,138,.27)}.event-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.event-card{overflow:hidden;border:1px solid var(--line);border-radius:27px;background:var(--panel);box-shadow:0 25px 60px rgba(0,0,0,.23);color:var(--text);text-decoration:none;transition:transform .25s,border-color .25s,box-shadow .25s}.event-card:hover{transform:translateY(-5px);border-color:rgba(255,43,138,.55);box-shadow:var(--shadow)}.event-card img{display:block;width:100%;aspect-ratio:1.55;object-fit:cover;background:#151018}.event-copy{padding:19px 20px 21px}.event-copy .eyebrow{margin:0 0 8px;color:#ff78ad;font-size:10px}.event-copy h2{margin:0 0 9px;font-size:22px;line-height:1.12;letter-spacing:-.035em}.event-copy p{margin:0 0 17px;color:var(--muted);font-size:13px;line-height:1.5}.card-link{color:#ff78ad;font-size:14px;font-weight:850}.empty{grid-column:1/-1;padding:58px 24px;border:1px solid var(--line);border-radius:27px;background:rgba(18,14,21,.78);text-align:center}.empty h2{margin:0 0 8px;font-size:26px;letter-spacing:-.03em}.empty p{margin:0;color:var(--muted)}.more{text-align:center;margin-top:34px}.button-secondary{background:rgba(12,8,16,.72);box-shadow:none;border:1px solid rgba(255,255,255,.2)}.button-secondary:hover{border-color:rgba(255,43,138,.7);box-shadow:none}.event-main{width:min(1180px,100%);margin:0 auto;padding-bottom:48px}.event-hero{position:relative;min-height:540px;overflow:hidden;border-radius:0 0 27px 27px;background:#100b14;color:#fff}.hero-image,.hero-shade{position:absolute;inset:0;width:100%;height:100%}.hero-image{object-fit:cover}.hero-shade{background:linear-gradient(90deg,rgba(9,7,13,.9),rgba(9,7,13,.58) 54%,rgba(9,7,13,.08)),linear-gradient(0deg,rgba(9,7,13,.84),transparent 68%)}.hero-content{position:absolute;left:max(24px,calc((100vw - 1060px)/2));right:24px;bottom:58px;max-width:740px}.hero-content .eyebrow{color:#ff78ad}.hero-content h1{margin:14px 0 12px;font-size:clamp(42px,8vw,76px);line-height:.98;letter-spacing:-.06em}.hero-description{max-width:700px;margin:0;color:#f0edf2;font-size:19px;line-height:1.5}.event-details{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(250px,.7fr);gap:42px;padding:38px 20px}.details-copy{max-width:700px}.detail-line{display:flex;align-items:center;gap:16px;margin:0 0 14px;padding:17px;border:1px solid var(--line);border-radius:18px;background:rgba(18,14,21,.82)}.detail-icon{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border:1px solid rgba(255,43,138,.26);border-radius:14px;background:rgba(255,43,138,.1);color:#ff78ad;font-size:19px;font-weight:800}.detail-line strong,.detail-line span{display:block}.detail-line strong{font-size:15px}.detail-line div span{margin-top:4px;color:var(--muted);font-size:13px}.details-copy h2{margin:34px 0 10px;font-size:27px;letter-spacing:-.04em}.details-copy>p{color:var(--muted);line-height:1.7}.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:25px}.fine-print{font-size:12px}.status{padding:12px 15px;border:1px solid rgba(255,43,138,.24);border-radius:14px;background:rgba(255,43,138,.1);color:#ffc1dc;font-weight:750}.status-cancelled{border-color:rgba(255,95,116,.3);background:rgba(255,95,116,.1);color:#ffabb5}.side-card{align-self:start;margin-top:0;padding:27px;border:1px solid rgba(255,43,138,.34);border-radius:24px;background:linear-gradient(145deg,rgba(24,13,29,.95),rgba(12,8,16,.96));box-shadow:var(--shadow);color:var(--text)}.side-card .eyebrow{margin:0 0 15px;color:#ff78ad}.side-card h2{margin:0 0 9px;font-size:24px;line-height:1.08;letter-spacing:-.04em}.side-card p:not(.eyebrow){color:var(--muted);line-height:1.55}.side-card a{color:#ff78ad;font-weight:850;text-decoration:none}.footer{padding:24px;border-top:1px solid var(--line);color:#8f8793;text-align:center;font-size:12px}.error-page{min-height:calc(100vh - 60px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;text-align:center}.error-page .brand{margin:0 0 48px}.error-page .brand img{width:126px}.error-page h1{margin:5px 0;font-size:clamp(30px,5vw,42px);letter-spacing:-.045em}.error-page p{margin:0 0 24px;color:var(--muted)}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}a:focus-visible,button:focus-visible{outline:2px solid #ff78ad;outline-offset:4px}
  @media(max-width:760px){.masthead{height:72px;padding:0 18px}.brand img{width:112px}.directory-main{width:min(100% - 36px,1180px);padding:48px 0 64px}.intro{margin-bottom:32px}.intro h1{font-size:clamp(42px,10vw,58px)}.lead{font-size:16px}.event-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.event-copy{padding:15px}.event-copy h2{font-size:18px}.event-copy p{font-size:12px}.event-hero{min-height:470px;border-radius:0 0 22px 22px}.hero-content{left:22px;right:22px;bottom:34px}.hero-content h1{font-size:48px}.hero-description{font-size:16px}.event-details{grid-template-columns:1fr;gap:22px;padding:26px 18px}.side-card{margin:0}.cta-row{flex-direction:column}.cta-row .button{text-align:center}}
  @media(max-width:760px){.masthead-actions{gap:9px}.masthead-actions .event-share-button{flex-basis:44px;width:44px;height:44px}}
  @media(max-width:440px){.directory-main{width:calc(100% - 32px);padding-top:40px}.event-grid{grid-template-columns:1fr}.event-card img{aspect-ratio:1.7}.search{flex-direction:column}.search button{width:100%}.intro h1{font-size:40px}.event-hero{min-height:430px}.hero-content h1{font-size:42px}.event-details{padding:22px 16px}.cta-row .button{width:100%}}
  @media(max-width:440px){.masthead-actions{gap:7px}.masthead-actions .event-share-button{flex-basis:42px;width:42px;height:42px;border-radius:12px}.masthead-actions .top-link{min-height:42px;padding:0 9px;gap:6px;font-size:12px}.masthead .brand img{width:94px}}
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition:none!important}}
  .detail-line span.detail-icon{display:grid}.detail-icon svg{display:block;width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.map-link{display:inline-flex;align-items:center;margin-top:10px;color:#ff78ad;font-size:13px;font-weight:850;text-decoration:none}.map-link:hover{text-decoration:underline}.event-description{white-space:pre-line;overflow-wrap:anywhere}

  .search{display:block}
  .search-row{display:grid;grid-template-columns:minmax(0,1fr) 54px auto;gap:10px}
  .search-row input{width:100%;flex:none}
  .search .filter-toggle{width:54px;padding:0;border:1px solid var(--line);background:rgba(18,14,21,.88);box-shadow:none;color:var(--muted)}
  .search .filter-toggle{position:relative}
  .search .filter-toggle:hover{transform:translateY(-2px);border-color:rgba(255,43,138,.55);box-shadow:none;color:#fff}
  .search .filter-toggle[aria-expanded="true"]{border-color:rgba(255,43,138,.65);color:#ff78ad}
  .filter-toggle svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .filter-active-count{position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;padding:0 5px;display:grid;place-items:center;border:2px solid #09070d;border-radius:999px;background:var(--grad);box-shadow:0 4px 14px rgba(255,43,138,.35);color:#fff;font-size:10px;font-weight:900;line-height:1}
  .filter-panel{display:grid;grid-template-columns:minmax(130px,1fr) minmax(140px,.9fr) minmax(170px,1.1fr) auto;align-items:end;gap:12px;margin-top:12px;padding:16px;border:1px solid var(--line);border-radius:18px;background:rgba(18,14,21,.82)}
  .filter-panel[hidden]{display:none}
  .filter-panel label{display:grid;gap:7px;color:var(--muted);font-size:12px;font-weight:800}
  .filter-panel input,.filter-panel select{width:100%;min-width:0;min-height:44px;border:1px solid var(--line);border-radius:12px;padding:0 12px;background:#0b080e;color:var(--text);font:inherit;font-size:14px}
  .filter-panel input:focus,.filter-panel select:focus{border-color:rgba(255,43,138,.75);outline:2px solid rgba(255,43,138,.18)}
  .filter-clear{align-self:center;color:#ff78ad;font-size:13px;font-weight:800;text-decoration:none;white-space:nowrap}
  .filter-clear:hover{text-decoration:underline}
  @media(max-width:760px){.filter-panel{grid-template-columns:repeat(2,minmax(0,1fr))}.filter-clear{align-self:end;padding-bottom:12px}}
  @media(max-width:440px){.search .search-submit{width:auto;padding:0 17px}.filter-panel{grid-template-columns:1fr}.filter-clear{padding:0}}
  .event-card{position:relative}
  .event-card-link{display:block;color:inherit;text-decoration:none}
  .event-card-link:focus-visible{outline:2px solid #ff78ad;outline-offset:-4px;border-radius:25px}
  .event-share-button{position:absolute;top:14px;right:14px;z-index:3;width:44px;height:44px;padding:0;display:grid;place-items:center;border:1px solid rgba(255,255,255,.28);border-radius:14px;background:rgba(9,7,13,.82);backdrop-filter:blur(12px);color:#fff;cursor:pointer;transition:background .2s,border-color .2s,transform .2s}
  .event-share-button:hover{transform:translateY(-2px);border-color:rgba(255,43,138,.75);background:rgba(30,12,25,.95)}
  .event-share-button:disabled{cursor:wait;opacity:.7;transform:none}
  .event-share-button:focus-visible{outline:2px solid #ff78ad;outline-offset:3px}
  .event-share-button svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .masthead-actions{display:flex;align-items:center;gap:12px;flex:0 0 auto}
  .masthead-actions .event-share-button{position:static;top:auto;right:auto;flex:0 0 48px;width:48px;height:48px}
  .share-toast{position:fixed;left:50%;bottom:26px;z-index:100;max-width:min(90vw,520px);padding:13px 18px;border:1px solid rgba(255,255,255,.16);border-radius:14px;background:#171119;box-shadow:0 24px 60px rgba(0,0,0,.45);color:#fff;text-align:center;transform:translate(-50%,140%);transition:transform .3s}
  .share-toast.show{transform:translate(-50%,0)}
  .event-category-badge{position:absolute;top:14px;left:14px;z-index:1;max-width:calc(100% - 28px);padding:7px 11px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(9,7,13,.82);backdrop-filter:blur(12px);color:#fff;font-size:11px;font-weight:850;line-height:1.2;text-overflow:ellipsis;overflow:hidden;white-space:nowrap}
  @media(max-width:600px){.event-grid{grid-template-columns:1fr;max-width:640px;margin-inline:auto}.event-card img{aspect-ratio:1.7}}

`;
