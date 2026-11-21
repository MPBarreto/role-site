import { tutorialProducerSections, tutorialUserSections } from './tutorial-content.js';

const nav = document.querySelector('[data-tutorial-nav]');
const chapters = document.querySelector('[data-tutorial-chapters]');
const introNumber = document.querySelector('[data-tutorial-intro-number]');
const introEyebrow = document.querySelector('[data-tutorial-intro-eyebrow]');
const introTitle = document.querySelector('[data-tutorial-intro-title]');
const introCopy = document.querySelector('[data-tutorial-intro-copy]');
const introLink = document.querySelector('[data-tutorial-intro-link]');
const endTitle = document.querySelector('[data-tutorial-end-title]');
const endLink = document.querySelector('[data-tutorial-end-link]');

const audiences = {
  user: {
    label: 'Usuário',
    sections: tutorialUserSections,
    introNumber: '01–11',
    introEyebrow: 'Da descoberta às conexões',
    introTitle: 'Entenda o caminho até o rolê.',
    introCopy: 'Você pode consultar eventos, ver detalhes e escolher ingressos sem entrar. Para concluir a compra, o Matchie pede uma conta; depois, tickets, conexões e ajustes ficam reunidos nas áreas da sua conta.',
    introLink: '/events',
    introLinkLabel: 'Abrir eventos',
    endTitle: 'O próximo Match pode começar com um evento.',
    endLink: '/events',
    endLinkLabel: 'Encontrar meu próximo rolê'
  },
  producer: {
    label: 'Produtor',
    sections: tutorialProducerSections,
    introNumber: '01–03',
    introEyebrow: 'Da candidatura à operação',
    introTitle: 'Organize sua casa e acompanhe cada etapa.',
    introCopy: 'Veja quais dados separar para cadastrar a organização, como funciona a análise e o que o painel libera depois da aprovação. Em seguida, conheça os estados da conta Stripe e os manuais oficiais para concluir a configuração.',
    introLink: '/produtores',
    introLinkLabel: 'Conhecer para produtores',
    endTitle: 'Sua organização aprovada já pode preparar o próximo evento.',
    endLink: '/produtores',
    endLinkLabel: 'Ver a página para produtores'
  }
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character]);

let activeAudience = window.location.hash.startsWith('#produtor-') ? 'producer' : 'user';
let chapterObserver;

function renderNav(sections) {
  nav.innerHTML = `
    <div class="container tutorial-nav-inner">
      <div class="tutorial-audience-switch" role="group" aria-label="Escolha o público do tutorial">
        ${Object.entries(audiences).map(([key, audience]) => `
          <button type="button" data-audience-switch="${key}" aria-pressed="${activeAudience === key}">${audience.label}</button>
        `).join('')}
      </div>
      <span class="tutorial-nav-label">Na jornada</span>
      <div class="tutorial-nav-links" aria-label="Etapas deste guia">
        ${sections.map((section) => `<a href="#${section.id}">${escapeHtml(section.nav)}</a>`).join('')}
      </div>
      <a class="tutorial-nav-live" href="/events">Abrir o app <span aria-hidden="true">↗</span></a>
    </div>`;
}

function renderFormPreview(preview) {
  const fields = preview.fields.map((field) => `
    <div class="tutorial-form-field ${field.multiline ? 'tutorial-form-field-multiline' : ''}">
      <span class="tutorial-form-label">${escapeHtml(field.label)}</span>
      <span class="tutorial-form-value">${escapeHtml(field.placeholder)}</span>
    </div>`).join('');

  return `
    <div class="tutorial-form-preview" aria-hidden="true">
      <div class="tutorial-form-topbar"><span class="tutorial-form-back">←</span><span>${escapeHtml(preview.title)}</span></div>
      <div class="tutorial-form-heading">
        <span class="tutorial-form-building-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 21V7l9-4 9 4v14M8 21v-5h8v5M7 9h2m-2 3h2m6-3h2m-2 3h2M11 9h2m-2 3h2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span><strong>${escapeHtml(preview.subtitle)}</strong><small>Estas informações identificam a organização responsável pelos eventos e vendas.</small></span>
      </div>
      <div class="tutorial-form-logo-row"><span class="tutorial-form-logo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 21V7l9-4 9 4v14M8 21v-5h8v5M7 9h2m-2 3h2m6-3h2m-2 3h2m-5-3h2m-2 3h2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>${escapeHtml(preview.logo)}</span></div>
      <div class="tutorial-form-fields">${fields}</div>
      <div class="tutorial-form-privacy">Os dados legais ficam restritos à organização e à análise administrativa da candidatura.</div>
    </div>`;
}

function renderScreenMedia(screen, section) {
  const media = screen.preview === 'organization-form' && section.formPreview
    ? renderFormPreview(section.formPreview)
    : `<img src="${escapeHtml(screen.image)}" alt="${escapeHtml(screen.imageAlt)}" width="${escapeHtml(screen.imageWidth || 1179)}" height="${escapeHtml(screen.imageHeight || 2556)}" loading="lazy" decoding="async" />`;
  const captureLabel = screen.captureLabel || 'Chrome · iPhone 16 emulado';
  const captureTitle = screen.preview === 'organization-form' ? 'Prévia dos campos' : 'Captura real do app';
  return `<figure class="tutorial-screen-figure">${media}<figcaption><span>${captureTitle}</span><span>${escapeHtml(captureLabel)}</span></figcaption></figure>`;
}

function renderChapter(section, index) {
  const screens = section.screens?.length ? `
    <div class="tutorial-screen-list">
      ${section.screens.map((screen, screenIndex) => `
        <article class="tutorial-screen ${screenIndex % 2 ? 'tutorial-screen-reverse' : ''}" id="${escapeHtml(screen.id)}">
          ${renderScreenMedia(screen, section)}
          <div class="tutorial-screen-copy">
            <p class="tutorial-screen-kicker">${escapeHtml(section.number)}.${String(screenIndex + 1).padStart(2, '0')}</p>
            <h3>${escapeHtml(screen.title)}</h3>
            <p>${escapeHtml(screen.description)}</p>
            <h4>Ações disponíveis</h4>
            <ul class="tutorial-action-list">${screen.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join('')}</ul>
            <aside class="tutorial-tip"><span aria-hidden="true">✳</span><p>${escapeHtml(screen.tip)}</p></aside>
          </div>
        </article>`).join('')}
    </div>` : '';

  const details = section.details ? `
    <article class="tutorial-account-summary" aria-labelledby="${escapeHtml(section.id)}-details-title">
      <div class="tutorial-account-summary-copy">
        <p class="tutorial-screen-kicker">${escapeHtml(section.number)}.01</p>
        <h3 id="${escapeHtml(section.id)}-details-title">${escapeHtml(section.details.title)}</h3>
        <p>${escapeHtml(section.details.description)}</p>
      </div>
      <div>
        <h4>Ações disponíveis</h4>
        <ul class="tutorial-action-list">${section.details.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join('')}</ul>
        <aside class="tutorial-tip"><span aria-hidden="true">✳</span><p>${escapeHtml(section.details.tip)}</p></aside>
      </div>
    </article>` : '';

  const statusCards = section.statusCards?.length ? `
    <div class="tutorial-stripe-statuses" aria-label="Estados possíveis da conta Stripe">
      ${section.statusCards.map((card) => `
        <article class="tutorial-stripe-status">
          <span class="tutorial-stripe-status-dot" aria-hidden="true"></span>
          <div><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.description)}</p></div>
        </article>`).join('')}
    </div>` : '';

  const resources = section.resources?.length ? `
    <aside class="tutorial-resources" aria-labelledby="${escapeHtml(section.id)}-resources-title">
      <div><p class="eyebrow">Links oficiais</p><h3 id="${escapeHtml(section.id)}-resources-title">Manuais da Stripe</h3><p>Abra o manual correspondente ao que você precisa fazer na sua conta.</p></div>
      <ul>${section.resources.map((resource) => `
        <li><a href="${escapeHtml(resource.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.label)} <span aria-hidden="true">↗</span></a></li>
      `).join('')}</ul>
    </aside>` : '';

  return `
    <section class="tutorial-chapter ${index % 2 ? 'tutorial-chapter-alt' : ''}" id="${escapeHtml(section.id)}" aria-labelledby="${escapeHtml(section.id)}-title">
      <div class="container tutorial-chapter-inner">
        <header class="tutorial-chapter-heading">
          <span class="tutorial-chapter-index" aria-hidden="true">${escapeHtml(section.number)}</span>
          <div><p class="eyebrow">${escapeHtml(section.eyebrow)}</p><h2 id="${escapeHtml(section.id)}-title">${escapeHtml(section.title)}</h2><p>${escapeHtml(section.intro)}</p></div>
        </header>
        ${screens}
        ${statusCards}
        ${details}
        ${resources}
      </div>
    </section>`;
}

function observeChapters() {
  chapterObserver?.disconnect();
  const sections = [...chapters.querySelectorAll('.tutorial-chapter[id]')];
  const links = [...nav.querySelectorAll('.tutorial-nav-links a')];
  if (!('IntersectionObserver' in window) || !sections.length) return;

  chapterObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => {
      const active = link.hash === `#${visible.target.id}`;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .15, .4] });
  sections.forEach((section) => chapterObserver.observe(section));
}

function renderAudience() {
  const audience = audiences[activeAudience];
  renderNav(audience.sections);
  chapters.innerHTML = audience.sections.map(renderChapter).join('');
  introNumber.textContent = audience.introNumber;
  introEyebrow.textContent = audience.introEyebrow;
  introTitle.textContent = audience.introTitle;
  introCopy.textContent = audience.introCopy;
  introLink.href = audience.introLink;
  introLink.firstChild.textContent = audience.introLinkLabel;
  endTitle.textContent = audience.endTitle;
  endLink.href = audience.endLink;
  endLink.firstChild.textContent = audience.endLinkLabel;
  observeChapters();
}

if (nav && chapters && introNumber && introEyebrow && introTitle && introCopy && introLink && endTitle && endLink) {
  nav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-audience-switch]');
    if (!button || button.dataset.audienceSwitch === activeAudience) return;
    activeAudience = button.dataset.audienceSwitch;
    renderAudience();
    nav.querySelector(`[data-audience-switch="${activeAudience}"]`)?.focus();
  });

  renderAudience();
  if (window.location.hash) {
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const target = [...chapters.querySelectorAll('[id]')].find((element) => element.id === targetId);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
}
