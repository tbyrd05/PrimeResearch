import crypto from 'node:crypto';

const NOWPAYMENTS_BASE_URL = 'https://api.nowpayments.io/v1';

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getNowPaymentsApiKey() {
  return getEnv('NOWPAYMENTS_API_KEY');
}

export function getNowPaymentsIpnSecret() {
  return getEnv('NOWPAYMENTS_IPN_SECRET');
}

export function getNowPaymentsIpnUrl() {
  return getEnv('NOWPAYMENTS_IPN_URL');
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return req.body ? JSON.parse(req.body) : {};
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function sortObject(value) {
  if (Array.isArray(value)) {
    return value.map(sortObject);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObject(value[key]);
        return result;
      }, {});
  }

  return value;
}

export function verifyNowPaymentsSignature(payload, signature) {
  if (!signature) {
    return false;
  }

  const sortedPayload = JSON.stringify(sortObject(payload));
  const hmac = crypto.createHmac('sha512', getNowPaymentsIpnSecret());
  hmac.update(sortedPayload);
  const expectedSignature = hmac.digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(String(signature), 'utf8')
    );
  } catch {
    return false;
  }
}

export async function nowPaymentsRequest(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${NOWPAYMENTS_BASE_URL}${path}`, {
    method,
    headers: {
      'x-api-key': getNowPaymentsApiKey(),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || data?.error || `NOWPayments request failed with ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

