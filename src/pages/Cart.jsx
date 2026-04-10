
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductArtwork from '../components/ProductArtwork';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import { paymentConfig } from '../data/paymentConfig';

const TERMINAL_PAYMENT_STATUSES = new Set(['finished', 'confirmed', 'failed', 'expired']);
const CONFIRMED_PAYMENT_STATUSES = new Set(['finished', 'confirmed']);
const DISCOUNT_CODES = {
  BYRD: {
    code: 'BYRD',
    percentageOff: 0.15,
  },
};

function PaymentQrCard({ src, tag }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
        {!hasError ? (
          <img
            src={src}
            alt="Cash App QR code"
            className="mx-auto aspect-square w-full max-w-[16rem] object-contain"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="mx-auto flex aspect-square w-full max-w-[16rem] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm font-medium text-neutral-500">
            Cash App QR goes here.
            <br />
            Add your image at <span className="font-bold">{src}</span>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-sm font-medium text-neutral-500">
        Send payment to <span className="font-black text-navy-dark">{tag}</span>, then press complete checkout.
      </p>
    </div>
  );
}

function buildInvoiceQrUrl(bitcoinPayment) {
  const target = bitcoinPayment?.invoice_url
    || (bitcoinPayment?.pay_address
      ? (bitcoinPayment?.pay_amount
        ? `bitcoin:${bitcoinPayment.pay_address}?amount=${bitcoinPayment.pay_amount}`
        : `bitcoin:${bitcoinPayment.pay_address}`)
      : '');

  return target
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(target)}`
    : '';
}

function getBitcoinStatusMeta(status) {
  const normalized = String(status || '').toLowerCase();

  switch (normalized) {
    case 'waiting':
      return {
        label: 'Waiting for payment',
        detail: 'Send the exact BTC amount shown below. We will detect it automatically.',
        tone: 'amber',
      };
    case 'confirming':
      return {
        label: 'Confirming payment...',
        detail: 'Payment detected. We are waiting for network confirmation.',
        tone: 'amber',
      };
    case 'partially_paid':
      return {
        label: 'Payment detected',
        detail: 'A payment was detected and we are waiting for the remaining network updates.',
        tone: 'amber',
      };
    case 'confirmed':
    case 'finished':
      return {
        label: 'Payment confirmed',
        detail: 'Payment confirmed. Your order has been received.',
        tone: 'emerald',
      };
    case 'failed':
      return {
        label: 'Payment failed',
        detail: 'We could not confirm this Bitcoin payment. Please try again.',
        tone: 'red',
      };
    case 'expired':
      return {
        label: 'Payment expired',
        detail: 'This Bitcoin payment window expired. Create a new payment to continue.',
        tone: 'red',
      };
    default:
      return {
        label: 'Invoice created',
        detail: 'Your Bitcoin payment details are ready below.',
        tone: 'amber',
      };
  }
}

function getStatusClasses(tone) {
  switch (tone) {
    case 'emerald':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'red':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-amber-200 bg-amber-50 text-amber-800';
  }
}

function BitcoinInvoiceCard({ bitcoinPayment, statusMeta, copyFeedback, onCopyAddress, onCopyAmount }) {
  if (!bitcoinPayment) {
    return null;
  }

  const qrUrl = buildInvoiceQrUrl(bitcoinPayment);

  return (
    <div className="space-y-4 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
      <div className={`rounded-2xl border px-4 py-3 ${getStatusClasses(statusMeta.tone)}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Bitcoin Status</p>
        <p className="mt-2 text-lg font-black">{statusMeta.label}</p>
        <p className="mt-1 text-sm font-medium opacity-90">{statusMeta.detail}</p>
      </div>

      {qrUrl ? (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
          <img
            src={qrUrl}
            alt="NOWPayments Bitcoin QR code"
            className="mx-auto aspect-square w-full max-w-[15rem] object-contain"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Payment ID</p>
          <p className="mt-2 break-all text-sm font-extrabold text-navy-dark">{bitcoinPayment.payment_id || 'N/A'}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Status</p>
          <p className="mt-2 text-lg font-extrabold text-navy-dark">{statusMeta.label}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Exact BTC Amount</p>
            <p className="mt-2 break-all text-lg font-extrabold text-navy-dark">
              {bitcoinPayment.pay_amount || bitcoinPayment.price_amount || 'N/A'} {String(bitcoinPayment.pay_currency || 'btc').toUpperCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={onCopyAmount}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-navy-dark transition-colors hover:border-primary hover:text-primary"
          >
            {copyFeedback === 'amount' ? 'Amount copied' : 'Copy Amount'}
          </button>
        </div>
      </div>

      {bitcoinPayment.pay_address ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Payment Address</p>
              <p className="mt-2 break-all text-sm font-bold text-navy-dark">{bitcoinPayment.pay_address}</p>
            </div>
            <button
              type="button"
              onClick={onCopyAddress}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-navy-dark transition-colors hover:border-primary hover:text-primary"
            >
              {copyFeedback === 'address' ? 'Address copied' : 'Copy Address'}
            </button>
          </div>
        </div>
      ) : null}

      {bitcoinPayment.invoice_url ? (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Invoice Link</p>
          <a
            href={bitcoinPayment.invoice_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all text-sm font-bold text-primary transition-colors hover:text-primary-hover"
          >
            {bitcoinPayment.invoice_url}
          </a>
        </div>
      ) : null}
    </div>
  );
}

async function parseApiResponse(response) {
  const rawResponse = await response.text();
  let data = {};

  try {
    data = rawResponse ? JSON.parse(rawResponse) : {};
  } catch {
    data = rawResponse ? { error: rawResponse } : {};
  }

  return { data, rawResponse };
}

export default function Cart() {
  const formRef = useRef(null);
  const hasCompletedBitcoinOrderRef = useRef(false);
  const { user } = useAuth();
  const { items, itemCount, subtotal, formattedSubtotal, updateQuantity, removeItem, clearCart, formatPrice } = useCart();
  const { placeOrder, updateOrderPayment } = useOrders();
  const [checkout, setCheckout] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cashapp');
  const [paymentDetails, setPaymentDetails] = useState({
    cashAppNotes: '',
  });
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [bitcoinOrderId, setBitcoinOrderId] = useState('');
  const [bitcoinPayment, setBitcoinPayment] = useState(null);
  const [paymentRequestLoading, setPaymentRequestLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  const shipping = itemCount > 0 ? 20 : 0;
  const normalizedDiscountCode = appliedDiscountCode.trim().toUpperCase();
  const activeDiscount = DISCOUNT_CODES[normalizedDiscountCode] || null;
  const discountAmount = activeDiscount ? Number((subtotal * activeDiscount.percentageOff).toFixed(2)) : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const total = discountedSubtotal + shipping;
  const cartItems = useMemo(
    () => items.map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
      lineTotal: formatPrice((Number(item.quantity) || 0) * (Number.parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0)),
    })),
    [formatPrice, items]
  );

  const normalizedBitcoinStatus = String(bitcoinPayment?.payment_status || '').toLowerCase();
  const bitcoinStatusMeta = getBitcoinStatusMeta(normalizedBitcoinStatus);
  const bitcoinPaymentCreated = Boolean(bitcoinPayment?.payment_id || bitcoinPayment?.invoice_url);
  const bitcoinPaymentConfirmed = CONFIRMED_PAYMENT_STATUSES.has(normalizedBitcoinStatus);
  const bitcoinPaymentTerminal = TERMINAL_PAYMENT_STATUSES.has(normalizedBitcoinStatus);
  const cartLocked = paymentMethod === 'bitcoin' && bitcoinPaymentCreated && !bitcoinPaymentConfirmed;

  function applyDiscountCode() {
    const normalizedCode = discountCodeInput.trim().toUpperCase();

    if (!normalizedCode) {
      setAppliedDiscountCode('');
      setDiscountMessage('Enter a discount code to apply it.');
      return;
    }

    const matchingDiscount = DISCOUNT_CODES[normalizedCode];
    if (!matchingDiscount) {
      setAppliedDiscountCode('');
      setDiscountMessage('That discount code is not valid.');
      return;
    }

    setAppliedDiscountCode(matchingDiscount.code);
    setDiscountCodeInput(matchingDiscount.code);
    setDiscountMessage(`${matchingDiscount.code} applied for ${Math.round(matchingDiscount.percentageOff * 100)}% off products only. Shipping is not discounted.`);
  }

  function removeDiscountCode() {
    setAppliedDiscountCode('');
    setDiscountCodeInput('');
    setDiscountMessage('Discount code removed.');
  }

  useEffect(() => {
    setCheckout((current) => ({
      ...current,
      fullName: current.fullName || user?.name || '',
      email: current.email || user?.email || '',
    }));
  }, [user]);

  useEffect(() => {
    if (!copyFeedback) return undefined;
    const timeout = window.setTimeout(() => setCopyFeedback(''), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyFeedback]);

  function buildBitcoinOrder(orderId, paymentData, paymentStatusLabel) {
    return {
      id: orderId,
      placedAt: new Date().toLocaleString(),
      accountEmail: user?.email?.toLowerCase() || checkout.email.toLowerCase(),
      customer: {
        fullName: checkout.fullName,
        email: checkout.email,
        phone: checkout.phone,
        address: checkout.address,
        city: checkout.city,
        state: checkout.state,
        zip: checkout.zip,
      },
      payment: {
        label: 'Bitcoin via NOWPayments',
        detail: paymentData?.pay_address || paymentData?.invoice_url || `Invoice ${paymentData?.payment_id || orderId}`,
      },
      paymentStatus: paymentStatusLabel,
      nowPayments: {
        paymentId: paymentData?.payment_id || null,
        invoiceUrl: paymentData?.invoice_url || null,
        payAddress: paymentData?.pay_address || null,
        payAmount: paymentData?.pay_amount || paymentData?.price_amount || null,
        payCurrency: paymentData?.pay_currency || 'btc',
        paymentStatus: paymentData?.payment_status || 'waiting',
      },
      status: 'Pending',
      paid: bitcoinPaymentConfirmed,
      paidAt: bitcoinPaymentConfirmed ? new Date().toLocaleString() : null,
      items: cartItems,
      subtotal: formattedSubtotal,
      discountCode: activeDiscount?.code || '',
      discount: formatPrice(discountAmount),
      shipping: formatPrice(shipping),
      total: formatPrice(total),
    };
  }

  function updateBitcoinOrderState(orderId, paymentData) {
    const nextStatusMeta = getBitcoinStatusMeta(paymentData?.payment_status);
    const isConfirmed = CONFIRMED_PAYMENT_STATUSES.has(String(paymentData?.payment_status || '').toLowerCase());

    updateOrderPayment(orderId, {
      paymentStatus: nextStatusMeta.label,
      payment: {
        label: 'Bitcoin via NOWPayments',
        detail: paymentData?.pay_address || paymentData?.invoice_url || `Invoice ${paymentData?.payment_id || orderId}`,
      },
      nowPayments: {
        paymentId: paymentData?.payment_id || null,
        invoiceUrl: paymentData?.invoice_url || null,
        payAddress: paymentData?.pay_address || null,
        payAmount: paymentData?.pay_amount || paymentData?.price_amount || null,
        payCurrency: paymentData?.pay_currency || 'btc',
        paymentStatus: paymentData?.payment_status || 'waiting',
      },
      paid: isConfirmed,
      paidAt: isConfirmed ? new Date().toLocaleString() : null,
    });
  }

  function finalizeBitcoinOrder(paymentData) {
    const orderId = paymentData?.order_id || bitcoinOrderId;
    if (!orderId || hasCompletedBitcoinOrderRef.current) {
      return;
    }

    hasCompletedBitcoinOrderRef.current = true;
    updateBitcoinOrderState(orderId, paymentData);
    setCheckoutComplete(true);
    setCheckoutMessage(`Payment confirmed. Your order has been received.${orderId ? ` Reference: ${orderId}.` : ''}`);
    setPaymentSuccess(orderId ? `Payment confirmed. Order reference: ${orderId}` : 'Payment confirmed. Your order has been received.');
    setPaymentError('');
    clearCart();
  }

  async function copyToClipboard(value, type) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopyFeedback(type);
    } catch {
      setCopyFeedback('error');
    }
  }

  async function handleCreateBitcoinPayment() {
    console.log('[Bitcoin Checkout] Pay with Bitcoin clicked');

    if (!formRef.current?.reportValidity()) {
      console.log('[Bitcoin Checkout] Form validation failed before create-payment request');
      setPaymentError('Please complete the required checkout fields before creating a Bitcoin payment.');
      setPaymentSuccess('');
      return;
    }

    setPaymentRequestLoading(true);
    setPaymentError('');
    setPaymentSuccess('');
    setCheckoutComplete(false);
    setCheckoutMessage('');
    hasCompletedBitcoinOrderRef.current = false;

    try {
      const orderId = `order_${Date.now()}`;
      const requestBody = {
        orderId,
        priceAmount: Number(total.toFixed(2)),
        payCurrency: 'btc',
      };

      console.log('[Bitcoin Checkout] create-payment request body', requestBody);

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const { data, rawResponse } = await parseApiResponse(response);
      console.log('[Bitcoin Checkout] create-payment response', {
        ok: response.ok,
        status: response.status,
        data,
        rawResponse,
      });

      if (!response.ok) {
        throw new Error(data?.detail || data?.error || rawResponse || 'Unable to create Bitcoin invoice.');
      }

      const nextPayment = {
        ...data,
        order_id: data?.order_id || orderId,
      };

      setBitcoinOrderId(nextPayment.order_id);
      setBitcoinPayment(nextPayment);
      setPaymentSuccess('Bitcoin payment created successfully.');
      placeOrder(buildBitcoinOrder(nextPayment.order_id, nextPayment, getBitcoinStatusMeta(nextPayment.payment_status).label));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create Bitcoin invoice.';
      console.error('[Bitcoin Checkout] create-payment failed', message);
      setPaymentError(message);
      setPaymentSuccess('');
    } finally {
      setPaymentRequestLoading(false);
    }
  }

  useEffect(() => {
    if (paymentMethod !== 'bitcoin' || !bitcoinPayment?.payment_id || bitcoinPaymentTerminal) {
      return undefined;
    }

    let cancelled = false;
    const currentPaymentId = bitcoinPayment.payment_id;
    const currentInvoiceUrl = bitcoinPayment.invoice_url || null;
    const currentPayAddress = bitcoinPayment.pay_address || null;
    const currentOrderId = bitcoinOrderId || bitcoinPayment.order_id || '';

    async function pollPaymentStatus() {
      try {
        console.log('[Bitcoin Checkout] polling payment status', currentPaymentId);
        const response = await fetch(`/api/payment-status/${encodeURIComponent(currentPaymentId)}`);
        const { data, rawResponse } = await parseApiResponse(response);

        console.log('[Bitcoin Checkout] payment-status response', {
          ok: response.ok,
          status: response.status,
          data,
          rawResponse,
        });

        if (!response.ok) {
          throw new Error(data?.detail || data?.error || rawResponse || 'Unable to fetch Bitcoin payment status.');
        }

        if (cancelled) {
          return;
        }

        const nextPayment = {
          ...bitcoinPayment,
          ...data,
          payment_id: data.payment_id || currentPaymentId,
          invoice_url: currentInvoiceUrl || data.invoice_url || null,
          pay_address: data.pay_address || currentPayAddress,
          order_id: data.order_id || currentOrderId,
        };

        setBitcoinPayment(nextPayment);
        setPaymentError('');

        const orderId = nextPayment.order_id || currentOrderId;
        if (orderId) {
          updateBitcoinOrderState(orderId, nextPayment);
        }

        if (CONFIRMED_PAYMENT_STATUSES.has(String(nextPayment.payment_status || '').toLowerCase())) {
          finalizeBitcoinOrder(nextPayment);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to fetch Bitcoin payment status.';
        console.error('[Bitcoin Checkout] payment-status polling failed', message);
        setPaymentError(message);
      }
    }

    pollPaymentStatus();
    const intervalId = window.setInterval(pollPaymentStatus, paymentConfig.bitcoinPollingMs || 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    paymentMethod,
    bitcoinPayment?.payment_id,
    bitcoinPayment?.invoice_url,
    bitcoinPayment?.pay_address,
    bitcoinPayment?.order_id,
    bitcoinPayment?.payment_status,
    bitcoinPaymentTerminal,
    bitcoinOrderId,
    updateOrderPayment,
  ]);

  function resetBitcoinState() {
    setBitcoinOrderId('');
    setBitcoinPayment(null);
    setPaymentError('');
    setPaymentSuccess('');
    setCopyFeedback('');
    hasCompletedBitcoinOrderRef.current = false;
  }

  function handlePaymentMethodChange(nextMethod) {
    setPaymentMethod(nextMethod);
    setCheckoutComplete(false);
    setCheckoutMessage('');

    if (nextMethod !== 'bitcoin') {
      resetBitcoinState();
    }
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    setPaymentError('');

    const orderId = `PR-${Date.now()}`;

    placeOrder({
      id: orderId,
      placedAt: new Date().toLocaleString(),
      accountEmail: user?.email?.toLowerCase() || checkout.email.toLowerCase(),
      customer: {
        fullName: checkout.fullName,
        email: checkout.email,
        phone: checkout.phone,
        address: checkout.address,
        city: checkout.city,
        state: checkout.state,
        zip: checkout.zip,
      },
      payment: {
        label: 'Cash App',
        detail: paymentDetails.cashAppNotes?.trim()
          ? `Cash App tag provided: ${paymentDetails.cashAppNotes.trim()}`
          : `Customer instructed to send payment to ${paymentConfig.cashAppTag}`,
      },
      paymentStatus: 'Awaiting Confirmation',
      items: cartItems,
      subtotal: formattedSubtotal,
      discountCode: activeDiscount?.code || '',
      discount: formatPrice(discountAmount),
      shipping: formatPrice(shipping),
      total: formatPrice(total),
      status: 'Pending',
      paid: false,
      paidAt: null,
    });

    setCheckoutComplete(true);
    setCheckoutMessage('Once payment has been confirmed, your order will be sent alongside an email. If payment has not been received, you will receive an email regarding that.');
    clearCart();
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 sm:mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
          <span>/</span>
          <span className="text-neutral-800">Cart</span>
        </nav>

        <div className="mb-8 flex flex-col gap-4 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-navy-dark sm:text-4xl">Your Cart</h1>
            <p className="mt-2 text-sm font-medium text-neutral-500 sm:text-base">Review your selections, adjust quantity, and complete checkout.</p>
          </div>
          <Link to="/catalog" className="text-sm font-bold uppercase tracking-widest text-primary hover:text-primary-hover transition-colors">
            Continue Shopping
          </Link>
        </div>

        {checkoutComplete ? (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5">
            <p className="mb-1 text-sm font-black uppercase tracking-widest text-emerald-700">Order Completed</p>
            <p className="font-medium text-neutral-700">{checkoutMessage}</p>
          </div>
        ) : null}

        {cartItems.length === 0 ? (
          <div className="space-y-8">
            {bitcoinPaymentConfirmed && bitcoinPayment ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 text-xl font-extrabold tracking-tight text-navy-dark">Bitcoin Payment Details</h2>
                <BitcoinInvoiceCard
                  bitcoinPayment={bitcoinPayment}
                  statusMeta={bitcoinStatusMeta}
                  copyFeedback={copyFeedback}
                  onCopyAddress={() => copyToClipboard(bitcoinPayment.pay_address, 'address')}
                  onCopyAmount={() => copyToClipboard(bitcoinPayment.pay_amount || bitcoinPayment.price_amount, 'amount')}
                />
              </div>
            ) : null}

            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
              <p className="mb-3 text-xl font-extrabold text-navy-dark">Your cart is empty.</p>
              <p className="mb-6 font-medium text-neutral-500">Add products from the catalog to begin checkout.</p>
              <Link to="/catalog" className="inline-flex items-center justify-center rounded-xl bg-navy-dark px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary">
                Browse Catalog
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.9fr] xl:gap-8">
            <section className="space-y-5">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-5 md:flex-row">
                    <div className="w-full shrink-0 md:w-40">
                      <ProductArtwork
                        product={item.product || { id: item.productId, name: item.name, mg: item.size }}
                        sizeLabel={item.size}
                        compact
                        className="rounded-2xl"
                        imageClassName="scale-[1.08]"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="break-words text-xl font-extrabold uppercase tracking-tight text-navy-dark sm:text-2xl">{item.name}</h2>
                          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-neutral-400">Size: {item.size}</p>
                          <p className="mt-3 text-sm font-bold text-neutral-500">Unit Price: {item.price}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Line Total</p>
                          <p className="mt-1 text-2xl font-black text-primary">{item.lineTotal}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex w-fit max-w-full items-center overflow-hidden rounded-xl border border-neutral-200">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            disabled={cartLocked}
                            className="px-4 py-3 text-navy-dark transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-lg">remove</span>
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) => updateQuantity(item.productId, item.size, event.target.value)}
                            disabled={cartLocked}
                            className="w-14 border-x border-neutral-200 py-3 text-center font-bold text-navy-dark outline-none disabled:bg-neutral-100 sm:w-16"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            disabled={cartLocked}
                            className="px-4 py-3 text-navy-dark transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          disabled={cartLocked}
                          className="text-sm font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-6 text-xl font-extrabold tracking-tight text-navy-dark">Order Summary</h2>
                <div className="space-y-4 text-sm font-bold">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Items</span>
                    <span>{itemCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={discountCodeInput}
                        onChange={(event) => setDiscountCodeInput(event.target.value)}
                        placeholder="Discount code"
                        className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold uppercase outline-none focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={applyDiscountCode}
                          className="rounded-xl bg-navy-dark px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary"
                        >
                          Apply
                        </button>
                        {activeDiscount ? (
                          <button
                            type="button"
                            onClick={removeDiscountCode}
                            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-navy-dark transition-colors hover:border-primary hover:text-primary"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <p className={`text-xs font-bold ${activeDiscount ? 'text-emerald-700' : 'text-neutral-500'}`}>
                      {discountMessage || 'Use code BYRD for 15% off products. Shipping is not discounted.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Discount</span>
                    <span>{discountAmount > 0 ? `-${formatPrice(discountAmount)}` : formatPrice(0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Shipping</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-navy-dark">
                    <span className="text-xs uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <form ref={formRef} onSubmit={handleCheckoutSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Checkout</p>
                  <h2 className="text-xl font-extrabold tracking-tight text-navy-dark">Research Checkout</h2>
                </div>

                <input required type="text" placeholder="Full Name" value={checkout.fullName} onChange={(event) => setCheckout((current) => ({ ...current, fullName: event.target.value }))} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary" />
                <input required type="email" placeholder="Email Address" value={checkout.email} onChange={(event) => setCheckout((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary" />
                <input required type="tel" placeholder="Phone Number" value={checkout.phone} onChange={(event) => setCheckout((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary" />
                <input required type="text" placeholder="Shipping Address" value={checkout.address} onChange={(event) => setCheckout((current) => ({ ...current, address: event.target.value }))} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input required type="text" placeholder="City" value={checkout.city} onChange={(event) => setCheckout((current) => ({ ...current, city: event.target.value }))} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary" />
                  <input required type="text" placeholder="State" value={checkout.state} onChange={(event) => setCheckout((current) => ({ ...current, state: event.target.value }))} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary" />
                  <input required type="text" placeholder="ZIP" value={checkout.zip} onChange={(event) => setCheckout((current) => ({ ...current, zip: event.target.value }))} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary" />
                </div>

                <div className="pt-2">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Payment Method</p>
                  <div className="grid grid-cols-1 gap-3">
                    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition-colors ${paymentMethod === 'cashapp' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-neutral-50'}`}>
                      <input type="radio" name="paymentMethod" value="cashapp" checked={paymentMethod === 'cashapp'} onChange={(event) => handlePaymentMethodChange(event.target.value)} className="mt-1" />
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-navy-dark">Cash App</p>
                        <p className="mt-1 text-sm text-neutral-500">Use the Cash App tag and QR code below, then complete checkout.</p>
                      </div>
                    </label>

                    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition-colors ${paymentMethod === 'bitcoin' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-neutral-50'}`}>
                      <input type="radio" name="paymentMethod" value="bitcoin" checked={paymentMethod === 'bitcoin'} onChange={(event) => handlePaymentMethodChange(event.target.value)} className="mt-1" />
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-navy-dark">Bitcoin</p>
                        <p className="mt-1 text-sm text-neutral-500">Create an automatic Bitcoin payment and we will confirm it live.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'cashapp' ? (
                  <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                      Cash App Tag: <span className="font-black">{paymentConfig.cashAppTag}</span>
                    </div>
                    <PaymentQrCard src={paymentConfig.cashAppQrSrc} tag={paymentConfig.cashAppTag} />
                    <div>
                      <p className="mb-2 text-sm font-medium text-neutral-600">
                        Please write down your Cash App tag below to help our team verify your payment faster.
                      </p>
                      <textarea rows="3" placeholder="Comment section: add your Cash App tag here" value={paymentDetails.cashAppNotes} onChange={(event) => setPaymentDetails((current) => ({ ...current, cashAppNotes: event.target.value }))} className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-primary" />
                    </div>
                    <p className="text-sm font-medium text-neutral-500">Once you have completed payment, press complete checkout.</p>
                  </div>
                ) : null}

                {paymentMethod === 'bitcoin' ? (
                  <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-sm font-medium text-neutral-600">{paymentConfig.bitcoinInstructions}</p>

                    {paymentError ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {paymentError}
                      </div>
                    ) : null}

                    {paymentSuccess && !bitcoinPaymentConfirmed ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {paymentSuccess}
                      </div>
                    ) : null}

                    {!bitcoinPaymentCreated ? (
                      <button type="button" onClick={handleCreateBitcoinPayment} disabled={paymentRequestLoading} className="w-full rounded-xl bg-[#f7931a] px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#e78617] disabled:cursor-not-allowed disabled:opacity-60">
                        {paymentRequestLoading ? 'Creating payment...' : 'Pay with Bitcoin'}
                      </button>
                    ) : null}

                    {bitcoinPaymentCreated ? (
                      <BitcoinInvoiceCard bitcoinPayment={bitcoinPayment} statusMeta={bitcoinStatusMeta} copyFeedback={copyFeedback} onCopyAddress={() => copyToClipboard(bitcoinPayment?.pay_address, 'address')} onCopyAmount={() => copyToClipboard(bitcoinPayment?.pay_amount || bitcoinPayment?.price_amount, 'amount')} />
                    ) : null}

                    {bitcoinPaymentCreated && !bitcoinPaymentTerminal ? (
                      <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-600">
                        We are checking your Bitcoin payment automatically every few seconds.
                      </div>
                    ) : null}

                    {bitcoinPaymentConfirmed ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-800">
                        <p className="font-black">Payment confirmed. Your order has been received.</p>
                        {bitcoinOrderId ? <p className="mt-1">Order reference: <span className="font-black">{bitcoinOrderId}</span></p> : null}
                      </div>
                    ) : null}

                    {bitcoinPaymentCreated && ['failed', 'expired'].includes(normalizedBitcoinStatus) ? (
                      <button type="button" onClick={handleCreateBitcoinPayment} disabled={paymentRequestLoading} className="w-full rounded-xl border border-neutral-200 bg-white px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-navy-dark transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60">
                        {paymentRequestLoading ? 'Creating payment...' : 'Retry Bitcoin Payment'}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  Make sure to press complete order after payment is made.
                </div>

                {paymentMethod !== 'bitcoin' ? (
                  <button type="submit" className="w-full rounded-xl bg-navy-dark px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary">
                    Complete Order
                  </button>
                ) : null}
              </form>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
