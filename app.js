(() => {
  const config = window.ROLE_CONFIG || {};
  const startedAt = Date.now();
  let contactToken = null;

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  menuButton?.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('is-open');
    mobileMenu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 })
    : null;
  document.querySelectorAll('.reveal').forEach((el) => {
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add('is-visible');
  });

  const bindStoreLinks = () => {
    [
      ['[data-app-store]', config.APP_STORE_URL],
      ['[data-play-store]', config.GOOGLE_PLAY_URL]
    ].forEach(([selector, url]) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (url) {
          el.href = url;
          el.target = '_blank';
          el.rel = 'noopener noreferrer';
          el.removeAttribute('aria-disabled');
        } else {
          el.setAttribute('aria-disabled', 'true');
          el.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelector('#app')?.scrollIntoView({ behavior: 'smooth' });
          });
        }
      });
    });
  };
  bindStoreLinks();

  const mockEvents = [
    { name: 'Techno District by KØDA', badge: 'SÁB · 24 AGO · 22:00', venue: 'Audio Club · São Paulo, SP', attendeesLabel: '1,2 mil pessoas já vão', tags: ['Techno', 'House', 'Eletrônica'] },
    { name: 'Sunset Club Opening', badge: 'SEX · 23 AGO · 23:00', venue: 'Selina · Rio de Janeiro, RJ', attendeesLabel: '842 pessoas já vão', tags: ['House', 'Deep House', 'Indie Dance'] },
    { name: 'Rooftop Sessions by Rolê', badge: 'DOM · 25 AGO · 20:00', venue: 'Vista Rooftop · Belo Horizonte, MG', attendeesLabel: '653 pessoas já vão', tags: ['Hip Hop', 'Funk', 'Open Format'] }
  ];

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);

  const renderEvents = (events) => {
    const grid = document.querySelector('[data-events-grid]');
    if (!grid) return;
    grid.innerHTML = events.slice(0, 3).map((event, index) => {
      const tags = Array.isArray(event.tags) ? event.tags : [];
      return `
        <article class="event-card theme-${index % 3}">
          <div class="event-card-media">
            <img src="/assets/role-icon.png" alt="" />
            <span class="event-badge">${escapeHtml(event.badge || event.dateLabel || 'Próximo Rolê')}</span>
          </div>
          <div class="event-card-body">
            <h3>${escapeHtml(event.name || 'Evento Rolê')}</h3>
            <div class="event-meta"><span>⌖ ${escapeHtml(event.venue || event.location || 'Local a confirmar')}</span></div>
            <div class="event-social">
              <div class="avatar-stack" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
              <span class="attending">${escapeHtml(event.attendeesLabel || `${event.attendees || 0} pessoas já vão`)}</span>
            </div>
            <div class="event-tags">${tags.slice(0, 3).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
          </div>
        </article>`;
    }).join('');
  };

  const loadEvents = async () => {
    try {
      const endpoint = config.EVENTS_API_URL || '/api/events';
      const response = await fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=3`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('events unavailable');
      const payload = await response.json();
      const events = Array.isArray(payload) ? payload : payload.events;
      if (!Array.isArray(events) || !events.length) throw new Error('empty events');
      renderEvents(events);
    } catch (_) {
      renderEvents(mockEvents);
    }
  };
  loadEvents();

  const getContactToken = async () => {
    try {
      const response = await fetch(config.CONTACT_TOKEN_URL || '/api/contact-token', { credentials: 'same-origin' });
      if (!response.ok) return null;
      const payload = await response.json();
      return payload.token || null;
    } catch (_) {
      return null;
    }
  };
  getContactToken().then((token) => { contactToken = token; });

  const contactButton = document.querySelector('[data-whatsapp]');
  const contactStatus = document.querySelector('[data-contact-status]');
  contactButton?.addEventListener('click', async () => {
    if (contactButton.disabled) return;
    contactButton.disabled = true;
    const original = contactButton.innerHTML;
    contactButton.textContent = 'Abrindo WhatsApp…';
    if (contactStatus) contactStatus.textContent = '';
    try {
      if (!contactToken) contactToken = await getContactToken();
      if (!contactToken) throw new Error('Não foi possível validar esta sessão.');
      const response = await fetch(config.CONTACT_URL || '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ token: contactToken, startedAt, website: '' })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Contato temporariamente indisponível.');
      window.location.href = payload.url;
    } catch (error) {
      if (contactStatus) contactStatus.textContent = error.message || 'Não foi possível abrir o contato agora.';
    } finally {
      contactButton.disabled = false;
      contactButton.innerHTML = original;
    }
  });
})();
