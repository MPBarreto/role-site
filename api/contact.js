import crypto from 'node:crypto';

const SECRET = process.env.CONTACT_SECRET || 'dev-only-change-me-before-production';
const MIN_TOKEN_AGE_MS = 2500;
const MAX_TOKEN_AGE_MS = 2 * 60 * 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 6;
const attempts = globalThis.__roleContactAttempts || new Map();
globalThis.__roleContactAttempts = attempts;

function timingSafeEqual(a, b) {
  try {
    const aa = Buffer.from(a);
    const bb = Buffer.from(b);
    return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
  } catch {
    return false;
  }
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [timestampRaw, nonce, signature] = parts;
  if (!/^\d{13}$/.test(timestampRaw) || !nonce) return false;
  const payload = `${timestampRaw}.${nonce}`;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (!timingSafeEqual(signature, expected)) return false;
  const age = Date.now() - Number(timestampRaw);
  return age >= MIN_TOKEN_AGE_MS && age <= MAX_TOKEN_AGE_MS;
}

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

function originAllowed(req) {
  const expectedHost = process.env.SITE_HOST;
  if (!expectedHost) return true;
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === expectedHost;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const ip = getIp(req);
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' });
  if (!originAllowed(req)) return res.status(403).json({ error: 'Origem não autorizada.' });

  const { token, website } = req.body || {};
  if (website) return res.status(400).json({ error: 'Solicitação inválida.' });
  if (!verifyToken(token)) return res.status(403).json({ error: 'Sessão inválida ou muito recente. Aguarde alguns segundos e tente novamente.' });

  const rawNumber = process.env.WHATSAPP_NUMBER || '';
  const number = rawNumber.replace(/\D/g, '');
  if (!number) return res.status(503).json({ error: 'Canal de WhatsApp ainda não configurado.' });

  const message = process.env.WHATSAPP_MESSAGE || 'Olá! Quero saber como levar o Rolê para minha casa de eventos.';
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  return res.status(200).json({ url });
}
