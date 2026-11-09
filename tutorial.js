import { pendingFeatures, tutorialSections } from './tutorial-content.js';

const nav = document.querySelector('[data-tutorial-nav]');
const chapters = document.querySelector('[data-tutorial-chapters]');
const pending = document.querySelector('[data-tutorial-pending]');

if (nav && chapters && pending) {
  nav.innerHTML = `<div class="container tutorial-nav-inner"><span class="tutorial-nav-label">Na jornada</span><div class="tutorial-nav-links">${tutorialSections.map(section => `<a href="#${section.id}">${section.nav}</a>`).join('')}</div><a class="tutorial-nav-live" href="/events">Abrir o app <span aria-hidden="true">↗</span></a></div>`;

  chapters.innerHTML = tutorialSections.map((section, index) => `
    <section class="tutorial-chapter ${index % 2 ? 'tutorial-chapter-alt' : ''}" id="${section.id}" aria-labelledby="${section.id}-title">
      <div class="container tutorial-chapter-inner">
        <header class="tutorial-chapter-heading">
          <span class="tutorial-chapter-index" aria-hidden="true">${section.number}</span>
          <div><p class="eyebrow">${section.eyebrow}</p><h2 id="${section.id}-title">${section.title}</h2><p>${section.intro}</p></div>
        </header>
        <div class="tutorial-screen-list">${section.screens.map((screen, screenIndex) => `
          <article class="tutorial-screen ${screenIndex % 2 ? 'tutorial-screen-reverse' : ''}" id="${screen.id}">
            <figure class="tutorial-screen-figure">
              <img src="${screen.image}" alt="${screen.imageAlt}" width="1179" height="2556" loading="lazy" decoding="async" />
              <figcaption><span>Captura real do app</span><span>iPhone 16 · visualização móvel</span></figcaption>
            </figure>
            <div class="tutorial-screen-copy">
              <p class="tutorial-screen-kicker">${section.number}.${String(screenIndex + 1).padStart(2, '0')}</p>
              <h3>${screen.title}</h3>
              <p>${screen.description}</p>
              <h4>Ações disponíveis</h4>
              <ul class="tutorial-action-list">${screen.actions.map(action => `<li>${action}</li>`).join('')}</ul>
              <aside class="tutorial-tip"><span aria-hidden="true">✳</span><p>${screen.tip}</p></aside>
            </div>
          </article>`).join('')}</div>
      </div>
    </section>`).join('');

  pending.innerHTML = pendingFeatures.map((feature, index) => `
    <article class="tutorial-next-feature">
      <div class="tutorial-next-feature-heading"><i>${String(index + 1).padStart(2, '0')}</i><h3>${feature.title}</h3></div>
      <p>${feature.description}</p>
      <ul>${feature.actions.map(action => `<li>${action}</li>`).join('')}</ul>
      <aside>${feature.tip}</aside>
    </article>`).join('');

  const sections = [...document.querySelectorAll('.tutorial-chapter[id]')];
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => {
        const active = link.hash === `#${visible.target.id}`;
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .15, .4] });
    sections.forEach(section => observer.observe(section));
  }
}
