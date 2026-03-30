import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductArtwork from '../components/ProductArtwork';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import { paymentConfig } from '../data/paymentConfig';

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

export default function Cart() {
  const { user } = useAuth();
  const { items, itemCount, subtotal, formattedSubtotal, updateQuantity, removeItem, clearCart, formatPrice } = useCart();
  const { placeOrder } = useOrders();
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
    bitcoinNotes: '',
  });
  const [checkoutComplete, setCheckoutComplete] = useState(false);

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

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    const orderId = `PR-${Date.now()}`;
    const paymentSummary = paymentMethod === 'cashapp'
      ? {
          label: 'Cash App',
          detail: `Customer instructed to send payment to ${paymentConfig.cashAppTag}`,
        }
      : {
          label: 'Bitcoin',
          detail: paymentDetails.bitcoinNotes?.trim() || 'Customer selected Bitcoin checkout and is awaiting payment confirmation.',
        };

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
      paymentStatus: 'Awaiting Confirmation',
      items: cartItems,
      subtotal: formattedSubtotal,
      shipping: formatPrice(shipping),
      total: formatPrice(total),
    });
    setCheckoutComplete(true);
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

        {checkoutComplete && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5">
            <p className="text-sm font-black uppercase tracking-widest text-emerald-700 mb-1">Order Completed</p>
            <p className="text-neutral-700 font-medium">Once payment has been confirmed, your order will be sent alongside an email. If payment has not been received, you will receive an email regarding that.</p>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center shadow-sm">
            <p className="text-xl font-extrabold text-navy-dark mb-3">Your cart is empty.</p>
            <p className="text-neutral-500 font-medium mb-6">Add products from the catalog to begin checkout.</p>
            <Link to="/catalog" className="inline-flex items-center justify-center bg-navy-dark text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors">
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
                          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-2">Size: {item.size}</p>
                          <p className="text-sm font-bold text-neutral-500 mt-3">Unit Price: {item.price}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Line Total</p>
                          <p className="text-2xl font-black text-primary mt-1">{item.lineTotal}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex w-fit max-w-full items-center overflow-hidden rounded-xl border border-neutral-200">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="px-4 py-3 text-navy-dark hover:bg-neutral-100 transition-colors"
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
                            className="px-4 py-3 text-navy-dark hover:bg-neutral-100 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-colors"
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
                <h2 className="text-xl font-extrabold tracking-tight text-navy-dark mb-6">Order Summary</h2>
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
                  <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-navy-dark">
                    <span className="uppercase tracking-widest text-xs">Total</span>
                    <span className="text-2xl font-black text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Checkout</p>
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Payment Method</p>
                  <div className="grid grid-cols-1 gap-3">
                    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition-colors ${paymentMethod === 'cashapp' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-neutral-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cashapp"
                        checked={paymentMethod === 'cashapp'}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-navy-dark">Cash App</p>
                        <p className="mt-1 text-sm text-neutral-500">Pay with Cash App using the tag and QR code below, then press complete checkout.</p>
                      </div>
                    </label>

                    <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition-colors ${paymentMethod === 'bitcoin' ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-neutral-50'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bitcoin"
                        checked={paymentMethod === 'bitcoin'}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-navy-dark">Bitcoin</p>
                        <p className="mt-1 text-sm text-neutral-500">Place the order with Bitcoin selected and payment confirmation will be handled after checkout.</p>
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
                    <p className="text-sm font-medium text-neutral-500">Once you have completed payment, press complete checkout.</p>
                  </div>
                ) : null}

                {paymentMethod === 'bitcoin' ? (
                  <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-sm font-medium text-neutral-500">{paymentConfig.bitcoinInstructions}</p>
                    <textarea
                      rows="3"
                      placeholder="Optional Bitcoin payment notes"
                      value={paymentDetails.bitcoinNotes}
                      onChange={(event) => setPaymentDetails((current) => ({ ...current, bitcoinNotes: event.target.value }))}
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-primary"
                    />
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="w-full bg-navy-dark text-white py-4 px-6 rounded-xl font-black uppercase tracking-[0.18em] text-xs hover:bg-primary transition-colors"
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
