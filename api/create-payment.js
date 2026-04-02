import {
  getNowPaymentsIpnUrl,
  nowPaymentsRequest,
  readJsonBody,
  sendJson,
} from './_lib/nowpayments.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const orderId = String(body?.orderId || '').trim();
    const priceAmount = Number(body?.priceAmount);
    const payCurrency = String(body?.payCurrency || 'btc').toLowerCase();

    if (!orderId) {
      return sendJson(res, 400, { error: 'orderId is required' });
    }

    if (!Number.isFinite(priceAmount) || priceAmount <= 0) {
      return sendJson(res, 400, { error: 'priceAmount must be a positive number' });
    }

    const payment = await nowPaymentsRequest('/payment', {
      method: 'POST',
      body: {
        price_amount: priceAmount,
        price_currency: 'usd',
        pay_currency: payCurrency,
        order_id: orderId,
        order_description: `Order ${orderId}`,
        ipn_callback_url: getNowPaymentsIpnUrl(),
      },
    });

    return sendJson(res, 200, {
      payment_id: payment.payment_id,
      pay_address: payment.pay_address,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency,
      payment_status: payment.payment_status,
      order_id: payment.order_id,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: 'Failed to create NOWPayments payment',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

