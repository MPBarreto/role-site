import config from './config.js';

const CONSENT_KEY = 'role-site-tracking-consent-v1';
const configuredAnalyticsId = config.GA4_MEASUREMENT_ID.trim();
const configuredTagManagerId = config.GTM_ID.trim();
const configuredMetaPixelId = config.META_PIXEL_ID.trim();
const analyticsId = /^G-[A-Z0-9]+$/i.test(configuredAnalyticsId) ? configuredAnalyticsId : '';
const tagManagerId = /^GTM-[A-Z0-9]+$/i.test(configuredTagManagerId) ? configuredTagManagerId : '';
const metaPixelId = /^\d{5,20}$/.test(configuredMetaPixelId) ? configuredMetaPixelId : '';
const hasGoogleId = Boolean(analyticsId || tagManagerId);
const hasTrackingIds = hasGoogleId || Boolean(metaPixelId);

const panel = document.querySelector('[data-consent-panel]');
const analyticsInput = document.querySelector('[data-consent-analytics]');
const marketingInput = document.querySelector('[data-consent-marketing]');
const settingsButton = document.querySelector('[data-consent-settings]');

function readConsent() {
  try {
    const value = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    if (value?.version !== 1 || typeof value.analytics !== 'boolean' || typeof value.marketing !== 'boolean') return null;
    return { analytics: value.analytics, marketing: value.marketing };
  } catch {
    return null;
  }
}

function saveConsent(consent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...consent, version: 1, updatedAt: new Date().toISOString() }));
  } catch {
    // Tracking remains limited to this page when browser storage is unavailable.
  }
}

function openPanel({ focus = false } = {}) {
  if (!panel) return;
  const current = readConsent() || { analytics: false, marketing: false };
  analyticsInput.checked = current.analytics;
  marketingInput.checked = current.marketing;
  panel.hidden = false;
  if (focus) {
    const firstAvailableInput = analyticsInput.closest('label').hidden ? marketingInput : analyticsInput;
    firstAvailableInput.focus();
  }
}

function closePanel() {
  if (panel) panel.hidden = true;
}

function injectScript(src, id) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  if (id) script.dataset.roleTracking = id;
  document.head.append(script);
}

function loadGoogleAnalytics(consent) {
  if (!analyticsId || !consent.analytics || window.__roleGa4Loaded) return;
  if (!/^G-[A-Z0-9]+$/i.test(analyticsId)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied'
  });
  window.gtag('js', new Date());
  window.gtag('config', analyticsId);
  window.__roleGa4Loaded = true;
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`, 'ga4');
}

function loadGoogleTagManager(consent) {
  if (!tagManagerId || !consent.analytics || !consent.marketing || window.__roleGtmLoaded) return;
  if (!/^GTM-[A-Z0-9]+$/i.test(tagManagerId)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  window.__roleGtmLoaded = true;
  injectScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(tagManagerId)}`, 'gtm');
}

function loadMetaPixel(consent) {
  if (!metaPixelId || !consent.marketing || window.__roleMetaPixelLoaded) return;
  if (!/^\d{5,20}$/.test(metaPixelId)) return;

  const fbq = function (...args) {
    if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
    else fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  window.__roleMetaPixelLoaded = true;
  injectScript('https://connect.facebook.net/en_US/fbevents.js', 'meta-pixel');
  window.fbq('init', metaPixelId);
  window.fbq('track', 'PageView');
}

function activateTracking(consent) {
  if (tagManagerId) loadGoogleTagManager(consent);
  else loadGoogleAnalytics(consent);
  loadMetaPixel(consent);
}

function updateConsent(nextConsent) {
  const previous = readConsent();
  const changed = previous && (previous.analytics !== nextConsent.analytics || previous.marketing !== nextConsent.marketing);
  saveConsent(nextConsent);
  closePanel();

  if (changed && (window.__roleGa4Loaded || window.__roleGtmLoaded || window.__roleMetaPixelLoaded)) {
    window.location.reload();
    return;
  }

  activateTracking(nextConsent);
}

function initializeTracking() {
  if (!panel || !settingsButton) return;
  settingsButton.hidden = !hasTrackingIds;
  panel.querySelector('[data-consent-analytics-option]').hidden = !hasGoogleId;
  panel.querySelector('[data-consent-marketing-option]').hidden = !(metaPixelId || tagManagerId);
  panel.querySelector('[data-consent-gtm-note]').hidden = !tagManagerId;
  if (!hasTrackingIds) {
    closePanel();
    return;
  }

  const consent = readConsent();
  if (consent) {
    activateTracking(consent);
    closePanel();
  } else {
    openPanel();
  }

  settingsButton.addEventListener('click', () => openPanel({ focus: true }));
  panel.querySelector('[data-consent-reject]')?.addEventListener('click', () => {
    updateConsent({ analytics: false, marketing: false });
  });
  panel.querySelector('[data-consent-accept]')?.addEventListener('click', () => {
    updateConsent({ analytics: hasGoogleId, marketing: Boolean(metaPixelId || tagManagerId) });
  });
  panel.querySelector('[data-consent-save]')?.addEventListener('click', () => {
    updateConsent({ analytics: analyticsInput.checked, marketing: marketingInput.checked });
  });
}

export { initializeTracking };
