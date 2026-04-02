import { nowPaymentsRequest, sendJson } from '../_lib/nowpayments.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const paymentId = String(req.query?.paymentId || '').trim();
    console.log('[API payment-status] requested paymentId', paymentId);

    if (!paymentId) {
      return sendJson(res, 400, { error: 'paymentId is required' });
    }

    const payment = await nowPaymentsRequest(`/payment/${paymentId}`);
    console.log('[API payment-status] NOWPayments response', payment);

    return sendJson(res, 200, {
      payment_id: payment.payment_id,
      order_id: payment.order_id,
      pay_address: payment.pay_address,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency,
      payment_status: payment.payment_status,
      actually_paid: payment.actually_paid,
      actually_paid_at_fiat: payment.actually_paid_at_fiat,
      purchase_id: payment.purchase_id,
      outcome_amount: payment.outcome_amount,
      outcome_currency: payment.outcome_currency,
    });
  } catch (error) {
    console.error('[API payment-status] failed', error);

    return sendJson(res, 500, {
      error: 'Failed to fetch NOWPayments payment status',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
