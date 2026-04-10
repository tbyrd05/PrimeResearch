import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useOrders } from '../context/OrdersContext';

function parseCurrency(value) {
  return Number.parseFloat(String(value || '$0').replace(/[^0-9.]/g, '')) || 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

function formatDayLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MetricCard({ label, value, description }) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">{label}</p>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-navy-dark">{value}</p>
      {description ? <p className="mt-2 text-sm font-medium text-neutral-500">{description}</p> : null}
    </article>
  );
}

function SalesTrendChart({ orders }) {
  const points = useMemo(() => {
    const grouped = orders.reduce((map, order) => {
      const parsed = new Date(order.placedAt);
      const key = Number.isNaN(parsed.getTime())
        ? 'Unknown'
        : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).toISOString();
      map.set(key, (map.get(key) || 0) + parseCurrency(order.total));
      return map;
    }, new Map());

    return Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total]) => ({ date, total }));
  }, [orders]);

  if (!points.length) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
        <p className="text-lg font-extrabold text-navy-dark">No sales data yet.</p>
        <p className="mt-2 text-sm font-medium text-neutral-500">The chart will update automatically as orders are placed over time.</p>
      </div>
    );
  }

  const max = Math.max(...points.map((point) => point.total), 1);
  const chartPoints = points
    .map((point, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
      const y = 100 - (point.total / max) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="mt-6">
      <div className="h-64 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 sm:p-6">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3366FF" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#3366FF" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <polyline fill="none" stroke="#3366FF" strokeWidth="2" vectorEffect="non-scaling-stroke" points={chartPoints} />
          <polyline fill="url(#sales-fill)" stroke="none" points={`0,100 ${chartPoints} 100,100`} />
          {points.map((point, index) => {
            const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
            const y = 100 - (point.total / max) * 100;
            return <circle key={`${point.date}-${index}`} cx={x} cy={y} r="2.4" fill="#0F2D4E" vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {points.map((point) => (
          <div key={point.date} className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400">{formatDayLabel(point.date)}</p>
            <p className="mt-2 font-extrabold text-navy-dark">{formatCurrency(point.total)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OwnerAnalytics() {
  const { orders } = useOrders();

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order) => order.status !== 'Sent').length;
    const sentOrders = orders.filter((order) => order.status === 'Sent').length;
    const grossSales = orders.reduce((sum, order) => sum + parseCurrency(order.total), 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + parseCurrency(order.discount), 0);
    const productRevenue = orders.reduce((sum, order) => sum + Math.max(0, parseCurrency(order.subtotal) - parseCurrency(order.discount)), 0);
    const shippingCollected = orders.reduce((sum, order) => sum + parseCurrency(order.shipping), 0);
    const averageOrderValue = totalOrders ? grossSales / totalOrders : 0;
    const cashAppOrders = orders.filter((order) => order.payment?.label === 'Cash App').length;
    const bitcoinOrders = orders.filter((order) => order.payment?.label === 'Bitcoin').length;

    return {
      totalOrders,
      pendingOrders,
      sentOrders,
      grossSales,
      productRevenue,
      totalDiscounts,
      shippingCollected,
      averageOrderValue,
      cashAppOrders,
      bitcoinOrders,
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 sm:mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-800">Owner Sales</span>
        </nav>

        <header className="mb-8 sm:mb-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Owner Dashboard</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tighter text-navy-dark sm:text-4xl">Sales and Profit Overview</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium text-neutral-500 sm:text-base">
            This view tracks order volume, payment mix, gross sales, shipping collected, and gross product revenue. Profit currently reflects sales performance because inventory costs are not being tracked yet.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Gross Sales" value={formatCurrency(stats.grossSales)} description="Total of all placed orders including shipping." />
          <MetricCard label="Product Revenue" value={formatCurrency(stats.productRevenue)} description="Sales collected from products after discounts and before shipping." />
          <MetricCard label="Shipping Collected" value={formatCurrency(stats.shippingCollected)} description="Total shipping charges collected from customers." />
          <MetricCard label="Average Order" value={formatCurrency(stats.averageOrderValue)} description="Average order value across all placed orders." />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Orders" value={String(stats.totalOrders)} description="All placed orders in the system." />
          <MetricCard label="Pending Orders" value={String(stats.pendingOrders)} description="Orders waiting to be marked as sent." />
          <MetricCard label="Sent Orders" value={String(stats.sentOrders)} description="Orders you have already marked as sent." />
          <MetricCard label="Discounts Given" value={formatCurrency(stats.totalDiscounts)} description="Total coupon discounts applied to products." />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold tracking-tight text-navy-dark">Payment Mix</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Cash App Orders</p>
                <p className="mt-2 text-2xl font-extrabold text-navy-dark">{stats.cashAppOrders}</p>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Bitcoin Orders</p>
                <p className="mt-2 text-2xl font-extrabold text-navy-dark">{stats.bitcoinOrders}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-navy-dark">Recent Orders</h2>
                <p className="mt-1 text-sm font-medium text-neutral-500">A quick snapshot of the most recent order activity.</p>
              </div>
              <Link to="/owner/orders" className="text-xs font-black uppercase tracking-[0.18em] text-primary transition-colors hover:text-primary-hover">
                View All Orders
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                <p className="text-lg font-extrabold text-navy-dark">No orders yet.</p>
                <p className="mt-2 text-sm font-medium text-neutral-500">Sales metrics will populate automatically as customers check out.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {orders.slice(0, 8).map((order) => (
                  <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-navy-dark">{order.customer?.fullName || 'Customer'}</p>
                      <p className="text-sm text-neutral-500">{order.id} | {order.payment?.label}</p>
                    </div>
                    <div className="flex flex-col gap-1 sm:items-end">
                      <span className="font-black text-primary">{order.total}</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                        order.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight text-navy-dark">Sales Trend</h2>
          <p className="mt-1 text-sm font-medium text-neutral-500">Daily gross sales update automatically over time as orders are placed.</p>
          <SalesTrendChart orders={orders} />
        </section>
      </main>
    </div>
  );
}
