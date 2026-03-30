import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';

export default function Account() {
  const { user, signOut } = useAuth();
  const { orders } = useOrders();
  const userOrders = orders.filter(
    (order) => (order.accountEmail || order.customer?.email || '').toLowerCase() === (user?.email || '').toLowerCase()
  );

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 sm:mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-800">Account</span>
        </nav>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Account</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tighter text-navy-dark">Your Account</h1>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Name</p>
                <p className="mt-2 font-bold text-navy-dark">{user?.name || 'Prime Research Customer'}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Email</p>
                <p className="mt-2 break-all font-bold text-navy-dark">{user?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="mt-8 rounded-xl bg-navy-dark px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary"
            >
              Sign Out
            </button>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Order History</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-navy-dark">Past Orders</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                {userOrders.length} Orders
              </span>
            </div>

            {userOrders.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                <p className="text-lg font-extrabold text-navy-dark">No past orders yet.</p>
                <p className="mt-2 text-sm font-medium text-neutral-500">When you place orders, they will appear here automatically.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {userOrders.map((order) => (
                  <article key={order.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Order ID</p>
                        <p className="mt-1 break-all text-lg font-extrabold text-navy-dark">{order.id}</p>
                        <p className="mt-1 text-sm font-medium text-neutral-500">{order.placedAt}</p>
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                          order.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-sm font-bold text-primary">{order.total}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Payment</p>
                        <p className="mt-2 text-sm font-bold text-navy-dark">{order.payment?.label}</p>
                        <p className="mt-1 text-sm text-neutral-500">{order.paymentStatus || 'Awaiting Confirmation'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Shipping Address</p>
                        <p className="mt-2 text-sm text-neutral-700">{order.customer?.address}</p>
                        <p className="text-sm text-neutral-700">{order.customer?.city}, {order.customer?.state} {order.customer?.zip}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.productId}-${item.size}`} className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-bold text-navy-dark">{item.name}</p>
                            <p className="text-neutral-500">{item.size} x {item.quantity}</p>
                          </div>
                          <p className="font-bold text-primary">{item.lineTotal}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
