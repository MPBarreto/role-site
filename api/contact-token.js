import crypto from 'node:crypto';

const SECRET = process.env.CONTACT_SECRET || 'dev-only-change-me-before-production';

function sign(payload) {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const timestamp = Date.now();
  const nonce = crypto.randomBytes(18).toString('base64url');
  const payload = `${timestamp}.${nonce}`;
  const signature = sign(payload);

  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json({ token: `${payload}.${signature}` });
}
