import crypto from 'node:crypto';

const SECRET = process.env.CONTACT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-only-change-me-before-production');
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const attempts = globalThis.__roleLegalTokenAttempts || new Map();
globalThis.__roleLegalTokenAttempts = attempts;

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function rateLimit(ip) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || now - current.startedAt > WINDOW_MS) {
    attempts.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  attempts.set(ip, current);
  return current.count <= MAX_REQUESTS_PER_WINDOW;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
  if (typeof origin === 'string' && host) {
    try {
      return new URL(origin).host.toLowerCase() === host;
    } catch {
      return false;
    }
  }
  return req.headers['sec-fetch-site'] === 'same-origin';
}

function sign(payload) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SECRET) return res.status(503).json({ error: 'Verificação temporariamente indisponível.' });
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  const ip = getIp(req);
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Muitas tentativas. Tente novamente mais tarde.' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Origem não autorizada.' });

  const timestamp = Date.now();
  const nonce = crypto.randomBytes(18).toString('base64url');
  const payload = `${timestamp}.${nonce}`;
  const signature = sign(payload);

  return res.status(200).json({ token: `${payload}.${signature}` });
}
