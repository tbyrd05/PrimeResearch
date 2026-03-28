import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useOrders } from '../context/OrdersContext';

export default function Orders() {
  const { orders, updateOrderStatus } = useOrders();
  const pendingOrders = orders.filter((order) => order.status !== 'Sent');
  const sentOrders = orders.filter((order) => order.status === 'Sent');

  function renderOrderCard(order, showMarkAsSent) {
    return (
      <section key={order.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Order ID</p>
            <p className="text-xl font-extrabold text-navy-dark">{order.id}</p>
            <p className="mt-2 text-sm font-medium text-neutral-500">{order.placedAt}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start lg:min-w-[34rem]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Customer</p>
                <p className="text-sm font-bold text-navy-dark">{order.customer.fullName}</p>
                <p className="text-sm text-neutral-500">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Payment</p>
                <p className="text-sm font-bold text-navy-dark">{order.payment.label}</p>
                <p className="text-sm text-neutral-500">{order.payment.detail}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Total</p>
                <p className="text-xl font-black text-primary">{order.total}</p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                  order.status === 'Sent'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {order.status}
              </span>
              {showMarkAsSent ? (
                <button
                  type="button"
                  onClick={() => updateOrderStatus(order.id, 'Sent')}
                  className="rounded-xl bg-navy-dark px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary"
                >
                  Mark as Sent
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Customer Details</p>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-navy-dark">{order.customer.fullName}</p>
              <p className="text-neutral-700">{order.customer.email}</p>
              <p className="text-neutral-700">{order.customer.phone || 'No phone provided'}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Ship To</p>
            <div className="space-y-2 text-sm text-neutral-700">
              <p className="font-bold text-navy-dark">{order.customer.fullName}</p>
              <p>{order.customer.address}</p>
              <p>{order.customer.city}, {order.customer.state} {order.customer.zip}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Order Subtotal</p>
              <p className="font-bold text-navy-dark">{order.subtotal}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Shipping</p>
              <p className="font-bold text-navy-dark">{order.shipping}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Order Total</p>
              <p className="font-black text-primary">{order.total}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 text-xs font-black uppercase tracking-[0.2em] text-neutral-400">
                <th className="py-3 pr-4">Item</th>
                <th className="py-3 pr-4">Size</th>
                <th className="py-3 pr-4">Qty</th>
                <th className="py-3 pr-4">Unit</th>
                <th className="py-3">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={`${order.id}-${item.productId}-${item.size}`} className="border-b border-neutral-100 last:border-b-0">
                  <td className="py-4 pr-4 text-sm font-bold text-navy-dark">{item.name}</td>
                  <td className="py-4 pr-4 text-sm text-neutral-600">{item.size}</td>
                  <td className="py-4 pr-4 text-sm text-neutral-600">{item.quantity}</td>
                  <td className="py-4 pr-4 text-sm text-neutral-600">{item.price}</td>
                  <td className="py-4 text-sm font-bold text-primary">{item.lineTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-800">Orders</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-navy-dark tracking-tighter">Orders</h1>
          <p className="mt-2 text-neutral-500 font-medium">Owner view for all placed orders.</p>
        </header>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-extrabold text-navy-dark mb-3">No orders yet.</p>
            <p className="text-neutral-500 font-medium">Placed checkouts will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-navy-dark">Pending Orders</h2>
                  <p className="mt-1 text-sm font-medium text-neutral-500">Orders waiting to be shipped.</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                  {pendingOrders.length} Pending
                </span>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-lg font-extrabold text-navy-dark mb-2">No pending orders.</p>
                  <p className="text-neutral-500 font-medium">New checkouts will appear here first.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingOrders.map((order) => renderOrderCard(order, true))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-navy-dark">Sent Orders</h2>
                  <p className="mt-1 text-sm font-medium text-neutral-500">Orders you have already marked as sent.</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                  {sentOrders.length} Sent
                </span>
              </div>

              {sentOrders.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-lg font-extrabold text-navy-dark mb-2">No sent orders yet.</p>
                  <p className="text-neutral-500 font-medium">Orders you mark as sent will move here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sentOrders.map((order) => renderOrderCard(order, false))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
