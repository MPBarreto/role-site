export function sameRequestOrigin(req, { allowMissingOrigin = false, allowFetchSiteFallback = false } = {}) {
  const origin = req.headers.origin;
  if (typeof origin !== 'string') {
    if (allowMissingOrigin) return true;
    return allowFetchSiteFallback && req.headers['sec-fetch-site'] === 'same-origin';
  }
  if (!origin) return allowMissingOrigin;

  const forwardedHost = req.headers['x-forwarded-host'];
  const hostHeader = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host || '';
  const requestHost = String(hostHeader).split(',')[0].trim().toLowerCase();
  if (!requestHost) return allowFetchSiteFallback && req.headers['sec-fetch-site'] === 'same-origin';

  try {
    return new URL(origin).host.toLowerCase() === requestHost;
  } catch {
    return false;
  }
}
