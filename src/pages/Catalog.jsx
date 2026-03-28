import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductArtwork from '../components/ProductArtwork';
import { useCart } from '../context/CartContext';
import { getBasePrice, products } from '../data/products';

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

      <header className="bg-white border-b border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="text-neutral-800">Catalog</span>
              </nav>
              <h1 className="text-4xl font-extrabold text-navy-dark tracking-tighter">Research Catalog</h1>
              <p className="mt-2 text-neutral-500 font-medium text-lg">High-purity reagents and compounds for analytical research use only.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="bg-white border border-neutral-200 rounded-lg px-4 py-2 text-sm font-bold text-navy-dark outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {searchQuery ? (
          <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-4">
            <p className="text-sm font-bold text-neutral-500">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((product) => (
              <div key={product.id} className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="bg-white p-4 pb-2">
                  <ProductArtwork
                    product={product}
                    compact
                    className="rounded-[1.5rem] transition-transform duration-500 group-hover:-translate-y-1"
                    imageClassName="transition-transform duration-500 group-hover:scale-[1.1]"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-extrabold text-navy-dark tracking-tight leading-none uppercase">{product.name}</h3>
                    <span className="text-xl font-black text-primary">{product.options[0].price}</span>
                  </div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6 whitespace-nowrap overflow-hidden text-ellipsis">CAS: {product.cas}</p>

                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Quantity</span>
                    <div className="inline-flex items-center border border-neutral-200 rounded-lg overflow-hidden">
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
                        className="w-14 border-x border-neutral-200 text-center text-sm font-bold text-navy-dark py-2 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(product.id, getQuantity(product.id) + 1)}
                        className="px-3 py-2 text-navy-dark hover:bg-neutral-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link 
                      to={`/detail/${product.id}`} 
                      className="flex-1 text-center py-3 border border-neutral-200 rounded-lg text-sm font-bold text-navy-dark hover:bg-neutral-50 transition-colors uppercase tracking-widest"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => addItem(product, product.options[0], getQuantity(product.id))}
                      className="bg-navy-dark hover:bg-navy-dark/90 text-white p-3 rounded-lg transition-all active:scale-95 flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-navy-dark text-white py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl">biotech</span>
                </div>
                <span className="text-lg font-extrabold tracking-tighter uppercase">Prime Research</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
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
                <li><Link to="/support" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
                <li><Link to="/support" className="hover:text-primary transition-colors">Terms of Service</Link></li>
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
          
          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              © 2024 Prime Research. Lab research use only. Not for human consumption.
            </p>
            <div className="flex gap-4 opacity-30 grayscale invert">
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
