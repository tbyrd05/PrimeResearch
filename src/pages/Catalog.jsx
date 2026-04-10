import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductArtwork from '../components/ProductArtwork';
import { useCart } from '../context/CartContext';
import { getBasePrice, getDefaultOption, isProductInStock, products } from '../data/products';

function parsePrice(price) {
  return Number.parseFloat(String(price || '$0').replace(/[^0-9.]/g, '')) || 0;
}

function getCatalogPriceLabel(product) {
  if (product.options.length <= 1) {
    return getDefaultOption(product).price;
  }

  const prices = product.options
    .map((option) => parsePrice(option.price))
    .sort((a, b) => a - b);

  const lowest = prices[0] || 0;
  const highest = prices[prices.length - 1] || 0;

  return `$${lowest.toFixed(2)}-$${highest.toFixed(2)}`;
}

export default function Catalog() {
  const [sortBy, setSortBy] = useState('newest');
  const [quantities, setQuantities] = useState({});
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const searchableText = [
      product.name,
      product.cas,
      product.purity,
      product.status,
      product.mg,
      ...product.options.map((option) => `${option.size} ${option.price}`),
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(searchQuery);
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const stockDifference = Number(isProductInStock(b)) - Number(isProductInStock(a));
    if (stockDifference !== 0) return stockDifference;
    if (sortBy === 'price-low') return getBasePrice(a) - getBasePrice(b);
    if (sortBy === 'price-high') return getBasePrice(b) - getBasePrice(a);
    if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
    return b.id - a.id;
  });

  function getQuantity(productId) {
    return quantities[productId] || 1;
  }

  function setQuantity(productId, nextQuantity) {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(1, Number(nextQuantity) || 1),
    }));
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <header className="bg-white border-b border-neutral-200 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="text-neutral-800">Catalog</span>
              </nav>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-dark tracking-tighter">Research Catalog</h1>
              <p className="mt-2 text-neutral-500 font-medium text-base sm:text-lg">High-purity reagents and compounds for analytical research use only.</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full sm:w-auto bg-white border border-neutral-200 rounded-lg px-4 py-2 text-sm font-bold text-navy-dark outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {searchQuery ? (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-4 sm:px-5 py-4">
            <p className="text-sm font-bold text-neutral-500 break-words">
              Search results for <span className="text-navy-dark">"{searchParams.get('q')}"</span>
            </p>
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
              {sortedProducts.length} result{sortedProducts.length === 1 ? '' : 's'}
            </p>
          </div>
        ) : null}

        {sortedProducts.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-extrabold text-navy-dark mb-3">No products found.</p>
            <p className="text-neutral-500 font-medium">Try another search term from the top navigation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 sm:gap-8 xl:grid-cols-3">
            {sortedProducts.map((product) => {
              const defaultOption = getDefaultOption(product);
              const inStock = isProductInStock(product);
              const hasMultipleOptions = product.options.length > 1;
              const catalogPriceLabel = getCatalogPriceLabel(product);

              return (
              <div key={product.id} className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="bg-white p-3 pb-2 sm:p-4">
                  <ProductArtwork
                    product={product}
                    compact
                    className="rounded-[1.5rem] transition-transform duration-500 group-hover:-translate-y-1"
                    imageClassName="transition-transform duration-500 group-hover:scale-[1.1]"
                  />
                </div>

                <div className="p-3 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="min-w-0 text-[13px] font-extrabold text-navy-dark tracking-tight leading-tight uppercase break-normal sm:text-xl">
                      {product.name}
                    </h3>
                    <span className="shrink-0 text-[13px] sm:text-xl font-black text-primary">{catalogPriceLabel}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 sm:mb-6 break-all">CAS: {product.cas}</p>
                  <div className="mb-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {!hasMultipleOptions ? (
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Quantity</span>
                      <div className="inline-flex max-w-full items-center border border-neutral-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, getQuantity(product.id) - 1)}
                          className="px-3 py-2 text-navy-dark hover:bg-neutral-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={getQuantity(product.id)}
                          onChange={(event) => setQuantity(product.id, event.target.value)}
                          disabled={!inStock}
                          className="w-14 border-x border-neutral-200 text-center text-sm font-bold text-navy-dark py-2 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(product.id, getQuantity(product.id) + 1)}
                          disabled={!inStock}
                          className="px-3 py-2 text-navy-dark hover:bg-neutral-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500 sm:text-xs">
                      Multiple sizes available
                    </div>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <Link
                      to={`/detail/${product.id}`}
                      className="flex-1 text-center py-3 border border-neutral-200 rounded-lg text-[10px] sm:text-sm font-bold text-navy-dark hover:bg-neutral-50 transition-colors uppercase tracking-widest"
                    >
                      View Details
                    </Link>
                    {hasMultipleOptions ? (
                      <Link
                        to={`/detail/${product.id}`}
                        className="min-h-[2.75rem] sm:min-w-[7.5rem] bg-navy-dark hover:bg-navy-dark/90 text-white px-3 rounded-lg transition-all active:scale-95 flex items-center justify-center text-[10px] sm:text-xs font-black uppercase tracking-[0.18em]"
                      >
                        Select Options
                      </Link>
                    ) : (
                      <button
                        onClick={() => addItem(product, defaultOption, getQuantity(product.id))}
                        disabled={!inStock}
                        className="min-h-[2.75rem] sm:min-w-[7.5rem] bg-navy-dark hover:bg-navy-dark/90 text-white px-3 rounded-lg transition-all active:scale-95 flex items-center justify-center disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
                      >
                        {inStock ? (
                          <span className="material-symbols-outlined">add_shopping_cart</span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-[0.18em]">Out of Stock</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </main>

      <footer className="bg-navy-dark text-white py-14 sm:py-20 mt-16 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">biotech</span>
                </div>
                <span className="text-lg font-extrabold tracking-tighter uppercase">Prime Research</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-6 sm:mb-8 leading-relaxed">
                Global leader in high-purity research compounds. Our commitment to analytical precision ensures the integrity of your clinical laboratory research.
              </p>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-slate-500 hover:text-white transition-colors cursor-pointer">verified</span>
                <span className="material-symbols-outlined text-slate-500 hover:text-white transition-colors cursor-pointer">shield</span>
                <span className="material-symbols-outlined text-slate-500 hover:text-white transition-colors cursor-pointer">lock</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-white">Quick Links</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link></li>
                <li><Link to="/lab-results" className="hover:text-primary transition-colors">COA Database</Link></li>
                <li><Link to="/support/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
                <li><Link to="/support/terms-and-conditions" className="hover:text-primary transition-colors">Terms and Conditions</Link></li>
                <li><Link to="/support/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/support/refund-and-return" className="hover:text-primary transition-colors">Refund and Return</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-6 text-white">Newsletter</h4>
              <p className="text-xs text-slate-400 mb-4">Get updates on new compounds and testing results.</p>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="Email Address" className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none" />
                <button className="bg-primary hover:bg-primary-hover p-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">Subscribe</button>
              </div>
            </div>
          </div>

          <div className="mt-12 sm:mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center md:text-left">
              Copyright 2024 Prime Research. Lab research use only. Not for human consumption.
            </p>
            <div className="flex flex-wrap justify-center gap-4 opacity-30 grayscale invert">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
