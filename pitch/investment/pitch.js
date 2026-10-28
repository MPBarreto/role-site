const slides = [...document.querySelectorAll('[data-slide]')];
const pageButtons = [...document.querySelectorAll('[data-go]')];
const previousButton = document.querySelector('[data-previous]');
const nextButton = document.querySelector('[data-next]');
const counter = document.querySelector('[data-counter]');
const progress = document.querySelector('.deck-progress');
const progressFill = document.querySelector('[data-progress-fill]');
let current = 0;
let pointerStart = null;

function showSlide(index, { updateHash = true } = {}) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => {
    const active = i === current;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.toggleAttribute('inert', !active);
  });
  pageButtons.forEach((button, i) => {
    if (i === current) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  const shown = String(current + 1).padStart(2, '0');
  counter.innerHTML = `${shown} <i>/</i> ${String(slides.length).padStart(2, '0')}`;
  const percent = ((current + 1) / slides.length) * 100;
  progressFill.style.width = `${percent}%`;
  progress.setAttribute('aria-valuenow', String(current + 1));
  previousButton.disabled = current === 0;
  nextButton.disabled = current === slides.length - 1;
  if (updateHash) history.replaceState(null, '', `#slide-${current + 1}`);
  document.title = `${shown} · Rolê — Investor Pitch`;
}

previousButton.addEventListener('click', () => showSlide(current - 1));
nextButton.addEventListener('click', () => showSlide(current + 1));
pageButtons.forEach(button => button.addEventListener('click', () => showSlide(Number(button.dataset.go) - 1)));
document.querySelector('[data-print]').addEventListener('click', () => window.print());

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    showSlide(current + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    showSlide(current - 1);
  } else if (event.key === 'Home') {
    event.preventDefault();
    showSlide(0);
  } else if (event.key === 'End') {
    event.preventDefault();
    showSlide(slides.length - 1);
  } else if (event.key.toLowerCase() === 'f') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
});

document.addEventListener('touchstart', event => {
  pointerStart = event.changedTouches[0]?.clientX ?? null;
}, { passive: true });
document.addEventListener('touchend', event => {
  if (pointerStart === null) return;
  const endX = event.changedTouches[0]?.clientX ?? pointerStart;
  const delta = endX - pointerStart;
  if (Math.abs(delta) > 72) showSlide(current + (delta < 0 ? 1 : -1));
  pointerStart = null;
}, { passive: true });
document.addEventListener('touchcancel', () => { pointerStart = null; }, { passive: true });

const hashMatch = location.hash.match(/^#slide-(\d{1,2})$/);
showSlide(hashMatch ? Number(hashMatch[1]) - 1 : 0, { updateHash: false });
