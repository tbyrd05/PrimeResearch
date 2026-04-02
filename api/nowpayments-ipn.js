import {
  readJsonBody,
  sendJson,
  verifyNowPaymentsSignature,
} from './_lib/nowpayments.js';

const FINAL_PAYMENT_STATUSES = new Set(['finished', 'confirmed']);
const KNOWN_PAYMENT_STATUSES = new Set([
  'waiting',
  'confirming',
  'confirmed',
  'finished',
  'failed',
  'expired',
  'partially_paid',
  'sending',
  'refunded',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const payload = await readJsonBody(req);
    const signature = req.headers['x-nowpayments-sig'];

    if (!verifyNowPaymentsSignature(payload, signature)) {
      return sendJson(res, 401, { error: 'Invalid NOWPayments IPN signature' });
    }

    const paymentStatus = String(payload?.payment_status || '').toLowerCase();
    const normalizedStatus = KNOWN_PAYMENT_STATUSES.has(paymentStatus) ? paymentStatus : 'unknown';
    const isPaid = FINAL_PAYMENT_STATUSES.has(normalizedStatus);

    return sendJson(res, 200, {
      received: true,
      processed: true,
      payment_id: payload?.payment_id || null,
      order_id: payload?.order_id || null,
      payment_status: normalizedStatus,
      paid: isPaid,
      note: isPaid
        ? 'Payment is confirmed or finished and should be marked paid in persistent order storage.'
        : 'Payment update received.',
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: 'Failed to process NOWPayments IPN',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
