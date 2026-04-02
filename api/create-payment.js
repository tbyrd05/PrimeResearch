import { nowPaymentsRequest, readJsonBody, sendJson } from './_lib/nowpayments.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const orderId = String(body?.orderId || `order_${Date.now()}`).trim();
    const priceAmount = Number(body?.priceAmount ?? 50);
    const payCurrency = String(body?.payCurrency || 'btc').toLowerCase();

    if (!orderId) {
      return sendJson(res, 400, { error: 'orderId is required' });
    }

    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      return sendJson(res, 400, { error: 'priceAmount must be a positive number' });
    }

    const payment = await nowPaymentsRequest('/invoice', {
      method: 'POST',
      body: {
        price_amount: priceAmount,
        price_currency: 'usd',
        pay_currency: payCurrency,
        order_id: orderId,
        order_description: 'Prime Research Order',
      },
    });

    return sendJson(res, 200, {
      ...payment,
      payment_id: payment.payment_id || payment.id || null,
      pay_address: payment.pay_address || payment.payin_address || null,
      pay_amount: payment.pay_amount || payment.price_amount || null,
      pay_currency: payment.pay_currency || payCurrency,
      payment_status: payment.payment_status || payment.status || 'waiting',
      invoice_url: payment.invoice_url || null,
      order_id: payment.order_id || orderId,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: 'Failed to create NOWPayments invoice',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
