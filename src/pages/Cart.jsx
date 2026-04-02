import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductArtwork from '../components/ProductArtwork';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import { paymentConfig } from '../data/paymentConfig';

const FINAL_NOWPAYMENTS_STATUSES = new Set(['finished', 'confirmed']);

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

function buildBitcoinQrUrl(address, amount) {
  const uri = amount ? `bitcoin:${address}?amount=${amount}` : `bitcoin:${address}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(uri)}`;
}

function formatPaymentStatus(status) {
  const normalized = String(status || '').toLowerCase();

  switch (normalized) {
    case 'waiting':
      return 'Waiting for Payment';
    case 'confirming':
      return 'Confirming on Blockchain';
    case 'confirmed':
      return 'Confirmed';
    case 'finished':
      return 'Finished';
    case 'failed':
      return 'Failed';
    case 'expired':
      return 'Expired';
    case 'partially_paid':
      return 'Partially Paid';
    case 'sending':
      return 'Sending';
    case 'refunded':
      return 'Refunded';
    default:
      return status || 'Awaiting Confirmation';
  }
}

function BitcoinPaymentCard({
  bitcoinPayment,
  bitcoinStatusLabel,
  paymentStatusLoading,
  copyFeedback,
  onCopy,
  onRefresh,
}) {
  if (!bitcoinPayment) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-amber-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
          <img
            src={buildBitcoinQrUrl(bitcoinPayment.pay_address, bitcoinPayment.pay_amount)}
            alt="Bitcoin payment QR code"
            className="mx-auto aspect-square w-full max-w-[15rem] object-contain"
          />
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Payment Status</p>
            <p className="mt-2 text-lg font-extrabold text-navy-dark">{bitcoinStatusLabel}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Pay Amount</p>
            <p className="mt-2 break-all text-lg font-extrabold text-navy-dark">
              {bitcoinPayment.pay_amount} {String(bitcoinPayment.pay_currency || '').toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Pay Address</p>
        <p className="mt-2 break-all text-sm font-bold text-navy-dark">{bitcoinPayment.pay_address}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCopy}
          className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-navy-dark transition-colors hover:border-primary hover:text-primary"
        >
          {copyFeedback || 'Copy Address'}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={paymentStatusLoading}
          className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-navy-dark transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {paymentStatusLoading ? 'Checking Status...' : 'Refresh Status'}
        </button>
      </div>
    </div>
  );
}

export default function Cart() {
  const formRef = useRef(null);
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
    bitcoinNotes: '',
  });
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [bitcoinOrderId, setBitcoinOrderId] = useState('');
  const [bitcoinPayment, setBitcoinPayment] = useState(null);
  const [paymentRequestLoading, setPaymentRequestLoading] = useState(false);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');

  const shipping = itemCount > 0 ? 20 : 0;
  const total = subtotal + shipping;
  const cartItems = useMemo(
    () => items.map((item) => ({
      ...item,
      product: products.find((product) => product.id === item.productId),
      lineTotal: formatPrice((Number(item.quantity) || 0) * (Number.parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0)),
    })),
    [formatPrice, items]
  );

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

  async function copyBitcoinAddress() {
    if (!bitcoinPayment?.pay_address) return;
    try {
      await navigator.clipboard.writeText(bitcoinPayment.pay_address);
      setCopyFeedback('Address copied');
    } catch {
      setCopyFeedback('Unable to copy');
    }
  }

  async function refreshBitcoinPaymentStatus() {
    if (!bitcoinPayment?.payment_id) return;

    setPaymentStatusLoading(true);
    setPaymentError('');

    try {
      const response = await fetch(`/api/payment-status/${encodeURIComponent(bitcoinPayment.payment_id)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to fetch payment status.');
      }

      setBitcoinPayment((current) => ({ ...current, ...data }));

      if (placedOrderId) {
        updateOrderPayment(placedOrderId, {
          paymentStatus: formatPaymentStatus(data.payment_status),
          payment: {
            label: 'Bitcoin via NOWPayments',
            detail: `Payment ${data.payment_id}`,
          },
          nowPayments: {
            paymentId: data.payment_id,
            payAddress: data.pay_address,
            payAmount: data.pay_amount,
            payCurrency: data.pay_currency,
            paymentStatus: data.payment_status,
          },
        });
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to fetch payment status.');
    } finally {
      setPaymentStatusLoading(false);
    }
  }

  useEffect(() => {
    if (!bitcoinPayment?.payment_id) {
      return undefined;
    }

    if (FINAL_NOWPAYMENTS_STATUSES.has(String(bitcoinPayment.payment_status || '').toLowerCase())) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      refreshBitcoinPaymentStatus();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [bitcoinPayment?.payment_id, bitcoinPayment?.payment_status, placedOrderId]);

  async function handleCreateBitcoinPayment() {
    if (!formRef.current?.reportValidity()) {
      return;
    }

    setPaymentRequestLoading(true);
    setPaymentError('');
    setCheckoutComplete(false);
    setCheckoutMessage('');

    try {
      const orderId = bitcoinOrderId || `PR-${Date.now()}`;
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          priceAmount: Number(total.toFixed(2)),
          payCurrency: 'btc',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.detail || 'Unable to create Bitcoin payment.');
      }

      setBitcoinOrderId(orderId);
      setBitcoinPayment(data);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to create Bitcoin payment.');
    } finally {
      setPaymentRequestLoading(false);
    }
  }

  function resetBitcoinState() {
    setBitcoinOrderId('');
    setBitcoinPayment(null);
    setPaymentError('');
    setCopyFeedback('');
    setPlacedOrderId('');
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

    const orderId = paymentMethod === 'bitcoin'
      ? bitcoinOrderId || `PR-${Date.now()}`
      : `PR-${Date.now()}`;

    if (paymentMethod === 'bitcoin' && !bitcoinPayment?.payment_id) {
      setPaymentError('Create the NOWPayments Bitcoin payment first, then complete checkout.');
      return;
    }

    const paymentSummary = paymentMethod === 'cashapp'
      ? {
          label: 'Cash App',
          detail: paymentDetails.cashAppNotes?.trim()
            ? `Cash App tag provided: ${paymentDetails.cashAppNotes.trim()}`
            : `Customer instructed to send payment to ${paymentConfig.cashAppTag}`,
        }
      : {
          label: 'Bitcoin via NOWPayments',
          detail: `Payment ${bitcoinPayment.payment_id}`,
        };

    const paymentStatus = paymentMethod === 'bitcoin'
      ? formatPaymentStatus(bitcoinPayment.payment_status)
      : 'Awaiting Confirmation';

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
      payment: paymentSummary,
      paymentStatus,
      nowPayments: paymentMethod === 'bitcoin'
        ? {
            paymentId: bitcoinPayment.payment_id,
            payAddress: bitcoinPayment.pay_address,
            payAmount: bitcoinPayment.pay_amount,
            payCurrency: bitcoinPayment.pay_currency,
            paymentStatus: bitcoinPayment.payment_status,
          }
        : null,
      items: cartItems,
      subtotal: formattedSubtotal,
      shipping: formatPrice(shipping),
      total: formatPrice(total),
    });

    setPlacedOrderId(orderId);
    setCheckoutComplete(true);
    setCheckoutMessage(
      paymentMethod === 'bitcoin'
        ? `Bitcoin payment created. Current status: ${formatPaymentStatus(bitcoinPayment.payment_status)}. We will continue checking for updates while you stay on this page.`
        : 'Once payment has been confirmed, your order will be sent alongside an email. If payment has not been received, you will receive an email regarding that.'
    );
    clearCart();
  }

  const bitcoinStatusLabel = bitcoinPayment ? formatPaymentStatus(bitcoinPayment.payment_status) : '';

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

        {checkoutComplete && paymentMethod === 'bitcoin' && bitcoinPayment ? (
          <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-xl font-extrabold tracking-tight text-navy-dark">Bitcoin Payment Details</h2>
            <BitcoinPaymentCard
              bitcoinPayment={bitcoinPayment}
              bitcoinStatusLabel={bitcoinStatusLabel}
              paymentStatusLoading={paymentStatusLoading}
              copyFeedback={copyFeedback}
              onCopy={copyBitcoinAddress}
              onRefresh={refreshBitcoinPaymentStatus}
            />
          </div>
        ) : null}

        {paymentError ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
            <p className="text-sm font-bold text-red-700">{paymentError}</p>
          </div>
        ) : null}

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <p className="mb-3 text-xl font-extrabold text-navy-dark">Your cart is empty.</p>
            <p className="mb-6 font-medium text-neutral-500">Add products from the catalog to begin checkout.</p>
            <Link to="/catalog" className="inline-flex items-center justify-center rounded-xl bg-navy-dark px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary">
              Browse Catalog
            </Link>
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
                            className="px-4 py-3 text-navy-dark transition-colors hover:bg-neutral-100"
                          >
                            <span className="material-symbols-outlined text-lg">remove</span>
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) => updateQuantity(item.productId, item.size, event.target.value)}
                            className="w-14 border-x border-neutral-200 py-3 text-center font-bold text-navy-dark outline-none sm:w-16"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="px-4 py-3 text-navy-dark transition-colors hover:bg-neutral-100"
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-sm font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-red-500"
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

                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={checkout.fullName}
                  onChange={(event) => setCheckout((current) => ({ ...current, fullName: event.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary"
                />
                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  value={checkout.email}
                  onChange={(event) => setCheckout((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary"
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone Number"
                  value={checkout.phone}
                  onChange={(event) => setCheckout((current) => ({ ...current, phone: event.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary"
                />
                <input
                  required
                  type="text"
                  placeholder="Shipping Address"
                  value={checkout.address}
                  onChange={(event) => setCheckout((current) => ({ ...current, address: event.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    required
                    type="text"
                    placeholder="City"
                    value={checkout.city}
                    onChange={(event) => setCheckout((current) => ({ ...current, city: event.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary"
                  />
                  <input
                    required
                    type="text"
                    placeholder="State"
                    value={checkout.state}
                    onChange={(event) => setCheckout((current) => ({ ...current, state: event.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary"
                  />
                  <input
                    required
                    type="text"
                    placeholder="ZIP"
                    value={checkout.zip}
                    onChange={(event) => setCheckout((current) => ({ ...current, zip: event.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Payment Method</p>
                  <div className="grid grid-cols-1 gap-3">
                    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition-colors ${paymentMethod === 'cashapp' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-neutral-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cashapp"
                        checked={paymentMethod === 'cashapp'}
                        onChange={(event) => handlePaymentMethodChange(event.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-navy-dark">Cash App</p>
                        <p className="mt-1 text-sm text-neutral-500">Use the Cash App tag and QR code below, then complete checkout.</p>
                      </div>
                    </label>

                    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition-colors ${paymentMethod === 'bitcoin' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-neutral-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bitcoin"
                        checked={paymentMethod === 'bitcoin'}
                        onChange={(event) => handlePaymentMethodChange(event.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-navy-dark">Bitcoin</p>
                        <p className="mt-1 text-sm text-neutral-500">Create a NOWPayments Bitcoin checkout, then send the exact amount shown.</p>
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
                      <textarea
                        rows="3"
                        placeholder="Comment section: add your Cash App tag here"
                        value={paymentDetails.cashAppNotes}
                        onChange={(event) => setPaymentDetails((current) => ({ ...current, cashAppNotes: event.target.value }))}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-primary"
                      />
                    </div>
                    <p className="text-sm font-medium text-neutral-500">Once you have completed payment, press complete checkout.</p>
                  </div>
                ) : null}

                {paymentMethod === 'bitcoin' ? (
                  <div className="space-y-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-sm font-medium text-neutral-600">{paymentConfig.bitcoinInstructions}</p>

                    <textarea
                      rows="3"
                      placeholder="Comment section: add your Bitcoin transaction number here"
                      value={paymentDetails.bitcoinNotes}
                      onChange={(event) => setPaymentDetails((current) => ({ ...current, bitcoinNotes: event.target.value }))}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-primary"
                    />

                    <button
                      type="button"
                      onClick={handleCreateBitcoinPayment}
                      disabled={paymentRequestLoading}
                      className="w-full rounded-xl bg-[#f7931a] px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#e78617] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {paymentRequestLoading ? 'Creating Payment...' : 'Pay with Bitcoin'}
                    </button>

                    <BitcoinPaymentCard
                      bitcoinPayment={bitcoinPayment}
                      bitcoinStatusLabel={bitcoinStatusLabel}
                      paymentStatusLoading={paymentStatusLoading}
                      copyFeedback={copyFeedback}
                      onCopy={copyBitcoinAddress}
                      onRefresh={refreshBitcoinPaymentStatus}
                    />
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-navy-dark px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary"
                >
                  Complete Checkout
                </button>
              </form>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
