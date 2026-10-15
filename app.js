import config from './config.js';
import { initializeTracking } from './tracking.js';

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
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menuButton.textContent = open ? 'Fechar' : 'Menu';
});
$$('[data-mobile-menu] a').forEach(link => link.addEventListener('click', () => {
  mobileMenu?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menu');
  if (menuButton) menuButton.textContent = 'Menu';
}));

const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 }) : null;
$$('.reveal').forEach(element => observer ? observer.observe(element) : element.classList.add('visible'));

function configureStoreLinks() {
  const appStore = config.APP_STORE_URL;
  const playStore = config.GOOGLE_PLAY_URL;
  $$('[data-app-store]').forEach(element => {
    if (appStore) {
      element.href = appStore;
      element.target = '_blank';
      element.rel = 'noopener';
    } else {
      element.addEventListener('click', event => {
        event.preventDefault();
        showToast('O link da App Store será liberado assim que o app estiver publicado.');
      });
    }
  });
  $$('[data-play-store]').forEach(element => {
    if (playStore) {
      element.href = playStore;
      element.target = '_blank';
      element.rel = 'noopener';
    } else {
      element.addEventListener('click', event => {
        event.preventDefault();
        showToast('O link do Google Play será liberado assim que o app estiver publicado.');
      });
    }
  });
}

function configureProducerLinks() {
  if (!config.PRODUCER_SIGNUP_URL) return;
  $$('[data-producer-link]').forEach(element => {
    element.href = config.PRODUCER_SIGNUP_URL;
    element.target = '_blank';
    element.rel = 'noopener';
  });
}

function formatEventDate(iso) {
  if (!iso) return 'PRÓXIMO ROLÊ';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'PRÓXIMO ROLÊ';
  const day = new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(date);
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', '').toUpperCase();
  const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
  return `${day} ${month} · ${time}`;
}

function formatMoney(minor, currency = 'BRL') {
  if (minor === null || minor === undefined || !Number.isFinite(Number(minor))) return null;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency, minimumFractionDigits: 0 }).format(Number(minor) / 100);
}

function addTextElement(parent, tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = value;
  parent.append(element);
  return element;
}

function renderEvent(event) {
  const article = document.createElement('article');
  article.className = 'event-card reveal visible';

  const cover = document.createElement('div');
  cover.className = 'event-cover';
  if (event.coverUrl) cover.style.backgroundImage = `url("${event.coverUrl.replace(/["\\\n\r]/g, '')}")`;
  addTextElement(cover, 'span', 'event-date', formatEventDate(event.startsAt));
  article.append(cover);

  const body = document.createElement('div');
  body.className = 'event-body';
  addTextElement(body, 'h3', '', event.title || 'Evento no Rolê');
  const location = [event.venueName, event.city].filter(Boolean).join(' · ') || 'Local a confirmar';
  addTextElement(body, 'p', 'event-location', location);
  const meta = document.createElement('div');
  meta.className = 'event-meta';
  addTextElement(meta, 'b', '', 'Descubra quem também vai');
  const price = formatMoney(event.lowestPriceMinor, event.currency);
  addTextElement(meta, 'span', '', price ? `a partir de ${price}` : 'Confira no app');
  body.append(meta);

  const tags = document.createElement('div');
  tags.className = 'event-tags';
  (Array.isArray(event.tags) ? event.tags : []).slice(0, 3).forEach(tag => addTextElement(tags, 'span', '', tag));
  body.append(tags);
  const link = document.createElement('a');
  link.className = 'event-cta';
  link.href = '#app';
  addTextElement(link, 'span', '', 'Ver no app');
  body.append(link);
  article.append(body);
  return article;
}

function renderEmptyEvents(grid) {
  grid.replaceChildren();
  const empty = document.createElement('div');
  empty.className = 'events-empty-state';
  addTextElement(empty, 'h3', '', 'Seu próximo Rolê está chegando.');
  addTextElement(empty, 'p', '', 'Ainda não há eventos publicados por aqui. Volte em breve para descobrir novidades.');
  grid.append(empty);
}

function renderEventsUnavailable(grid) {
  grid.replaceChildren();
  const unavailable = document.createElement('div');
  unavailable.className = 'events-empty-state events-unavailable-state';
  unavailable.setAttribute('role', 'status');
  addTextElement(unavailable, 'h3', '', 'Não foi possível carregar os eventos agora.');
  addTextElement(unavailable, 'p', '', 'Tente novamente em instantes.');
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'btn btn-ghost btn-small events-retry';
  retry.textContent = 'Tentar novamente';
  retry.addEventListener('click', () => loadEvents(retry));
  unavailable.append(retry);
  grid.append(unavailable);
}

async function loadEvents(retryButton = null) {
  const grid = $('[data-events-grid]');
  if (!grid) return;
  if (retryButton) {
    retryButton.disabled = true;
    retryButton.textContent = 'Tentando…';
  }
  try {
    const endpoint = config.EVENTS_API_URL;
    const response = await fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=6`, {
      headers: { Accept: 'application/json' }
    });
    const payload = await response.json();
    if (!response.ok || payload?.source === 'unavailable') throw new Error('events_unavailable');
    const events = Array.isArray(payload) ? payload : (payload.events || payload.data || []);
    if (!events.length) {
      renderEmptyEvents(grid);
      return;
    }
    grid.replaceChildren(...events.map(renderEvent));
  } catch {
    renderEventsUnavailable(grid);
  }
}

async function getContactToken() {
  if (contactToken) return contactToken;
  const response = await fetch(config.CONTACT_TOKEN_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('token');
  const payload = await response.json();
  contactToken = payload.token;
  return contactToken;
}

async function openContact() {
  try {
    const token = await getContactToken();
    const response = await fetch(config.CONTACT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

$$('[data-contact-trigger]').forEach(element => element.addEventListener('click', event => {
  event.preventDefault();
  openContact();
}));
$$('[data-producer-link]').forEach(element => element.addEventListener('click', event => {
  if (config.PRODUCER_SIGNUP_URL) return;
  event.preventDefault();
  openContact();
}));

configureStoreLinks();
configureProducerLinks();
initializeTracking();
loadEvents();
