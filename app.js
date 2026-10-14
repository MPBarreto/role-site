(() => {
  const config = window.ROLE_CONFIG || {};
  const startedAt = Date.now();
  let contactToken = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const toast = $('[data-toast]');
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  const header = $('[data-header]');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const menuButton = $('[data-menu-toggle]');
  const mobileMenu = $('[data-mobile-menu]');
  menuButton?.addEventListener('click', () => {
    const open = mobileMenu?.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(Boolean(open)));
  });
  $$('[data-mobile-menu] a').forEach(a => a.addEventListener('click', () => {
    mobileMenu?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: 0.12 }) : null;
  $$('.reveal').forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));

  function configureStoreLinks() {
    const appStore = config.APP_STORE_URL || '';
    const playStore = config.GOOGLE_PLAY_URL || '';
    $$('[data-app-store]').forEach(el => {
      if (appStore) { el.href = appStore; el.target = '_blank'; el.rel = 'noopener'; }
      else el.addEventListener('click', e => { e.preventDefault(); showToast('O link da App Store será liberado assim que o app estiver publicado.'); });
    });
    $$('[data-play-store]').forEach(el => {
      if (playStore) { el.href = playStore; el.target = '_blank'; el.rel = 'noopener'; }
      else el.addEventListener('click', e => { e.preventDefault(); showToast('O link do Google Play será liberado assim que o app estiver publicado.'); });
    });
  }

  function configureProducerLinks() {
    const producerUrl = config.PRODUCER_SIGNUP_URL || '';
    if (!producerUrl) return;
    $$('[data-producer-link]').forEach(el => {
      el.href = producerUrl;
      el.target = '_blank';
      el.rel = 'noopener';
    });
  }

  function formatEventDate(iso) {
    if (!iso) return 'PRÓXIMO ROLÊ';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return String(iso);
    const day = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(date);
    const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '').toUpperCase();
    const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
    return `${day} ${month} · ${time}`;
  }

  function formatMoney(minor, currency = 'BRL') {
    if (minor === null || minor === undefined || Number.isNaN(Number(minor))) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency, minimumFractionDigits: 0 }).format(Number(minor) / 100);
  }

  function safeText(value, fallback = '') { return String(value ?? fallback).replace(/[<>]/g, ''); }

  function renderEvent(event) {
    const article = document.createElement('article');
    article.className = 'event-card reveal visible';
    const cover = safeText(event.coverUrl || event.cover_url || '');
    const coverStyle = cover ? `style="background-image:url('${cover.replace(/'/g, '%27')}')"` : '';
    const sold = Number(event.attendees || event.sold || 0);
    const soldLabel = event.attendeesLabel || event.attendees_label || (sold > 0 ? `${sold} ${sold === 1 ? 'pessoa já vai' : 'pessoas já vão'}` : 'Novo no Rolê');
    const price = formatMoney(event.minPriceMinor ?? event.min_price_minor, event.currency || 'BRL');
    const tags = (event.tags || event.vibeTags || event.vibe_tags || []).slice(0, 3);
    article.innerHTML = `
      <div class="event-cover" ${coverStyle}>
        <span class="event-date">${safeText(event.badge || formatEventDate(event.startsAt || event.starts_at))}</span>
        <span class="event-like" aria-hidden="true">♡</span>
      </div>
      <div class="event-body">
        <h3>${safeText(event.name || event.title, 'Evento no Rolê')}</h3>
        <p class="event-location">⌖ ${safeText(event.venue || [event.venueName || event.venue_name, event.city].filter(Boolean).join(' · '), 'Local a confirmar')}</p>
        <div class="event-meta"><b>${safeText(soldLabel)}</b><span>${price ? `a partir de ${price}` : 'Confira no app'}</span></div>
        <div class="event-tags">${tags.map(tag => `<span>${safeText(tag)}</span>`).join('')}</div>
        <a class="event-cta" href="#app"><span>Ver no app</span><b>→</b></a>
      </div>`;
    return article;
  }

  function updateHeroFromEvent(event) {
    if (!event) return;
    const cover = event.coverUrl || event.cover_url;
    const heroCover = $('[data-hero-cover]');
    if (heroCover && cover) heroCover.style.backgroundImage = `linear-gradient(0deg,rgba(9,7,13,.36),rgba(9,7,13,.08)),url('${cover.replace(/'/g, '%27')}')`;
    const title = $('[data-hero-title]');
    const venue = $('[data-hero-venue]');
    const date = $('[data-hero-date]');
    const social = $('[data-hero-social]');
    if (title) title.textContent = event.name || event.title || 'Seu próximo Rolê';
    if (venue) venue.textContent = event.venue || [event.venueName || event.venue_name, event.city].filter(Boolean).join(' · ');
    if (date) date.textContent = event.badge || formatEventDate(event.startsAt || event.starts_at);
    const sold = Number(event.attendees || event.sold || 0);
    if (social) social.textContent = sold > 0 ? `${sold} ${sold === 1 ? 'pessoa já vai' : 'pessoas já vão'}` : 'Veja quem também vai';
  }

  async function loadEvents() {
    const grid = $('[data-events-grid]');
    if (!grid) return;
    try {
      const endpoint = config.EVENTS_API_URL || '/api/events';
      const response = await fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=6`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`events_${response.status}`);
      const payload = await response.json();
      const events = Array.isArray(payload) ? payload : (payload.events || payload.data || []);
      if (!events.length) throw new Error('no_events');
      grid.innerHTML = '';
      events.forEach(event => grid.appendChild(renderEvent(event)));
      updateHeroFromEvent(events[0]);
    } catch {
      grid.innerHTML = '';
      const fallback = [
        { name: 'Sunset Club', badge: 'SÁB · 22:00', venue: 'São Paulo, SP', attendeesLabel: 'Novos encontros começam aqui', tags: ['House', 'Sunset', 'Conexões'] },
        { name: 'After Hours', badge: 'SEX · 23:30', venue: 'Curitiba, PR', attendeesLabel: 'Descubra quem também vai', tags: ['Eletrônica', 'Club', 'Late night'] },
        { name: 'Baile do Céu', badge: 'SÁB · 21:00', venue: 'São Paulo, SP', attendeesLabel: 'Seu próximo Rolê', tags: ['Funk', 'Open format', 'Dance'] }
      ];
      fallback.forEach(event => grid.appendChild(renderEvent(event)));
    }
  }

  async function getContactToken() {
    if (contactToken) return contactToken;
    const endpoint = config.CONTACT_TOKEN_URL || '/api/contact-token';
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('token');
    const payload = await response.json();
    contactToken = payload.token;
    return contactToken;
  }

  async function openContact() {
    try {
      const token = await getContactToken();
      const endpoint = config.CONTACT_URL || '/api/contact';
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, elapsedMs: Date.now() - startedAt, company: $('[data-honeypot]')?.value || '' })
      });
      if (!response.ok) throw new Error('contact');
      const payload = await response.json();
      if (!payload.url) throw new Error('url');
      window.open(payload.url, '_blank', 'noopener');
    } catch {
      showToast('Não foi possível abrir o contato agora. Tente novamente em instantes.');
    }
  }

  $$('[data-contact-trigger]').forEach(el => el.addEventListener('click', event => {
    event.preventDefault();
    openContact();
  }));
  $$('[data-producer-link]').forEach(el => el.addEventListener('click', event => {
    if (config.PRODUCER_SIGNUP_URL) return;
    event.preventDefault();
    openContact();
  }));

  configureStoreLinks();
  configureProducerLinks();
  loadEvents();
})();
