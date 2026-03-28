import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductArtwork from '../components/ProductArtwork';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';

export default function Detail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id || '1', 10)) || products[0];
  const [selectedOption, setSelectedOption] = useState(product.options[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    setSelectedOption(product.options[0]);
    setQuantity(1);
  }, [product]);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 sm:mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
          <span>/</span>
          <span className="text-neutral-800 uppercase">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="space-y-4 sm:space-y-6">
            <ProductArtwork
              product={product}
              sizeLabel={selectedOption.size}
              className="shadow-[0_28px_80px_rgba(15,23,42,0.12)]"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">{product.purity} Analytical Purity</span>
              <h1 className="mb-4 break-words text-3xl font-extrabold uppercase leading-none tracking-tighter text-navy-dark sm:text-4xl lg:text-5xl">{product.name}</h1>
              <p className="mb-6 break-all text-xs font-bold uppercase tracking-widest text-neutral-400">CAS Number: {product.cas}</p>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-3xl font-black text-primary sm:text-4xl">{selectedOption.price}</span>
              </div>

              {product.options.length > 1 && (
                <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Select Size (mg)</p>
                  <div className="flex flex-wrap gap-3">
                    {product.options.map((option) => (
                      <button
                        key={option.size}
                        onClick={() => setSelectedOption(option)}
                        className={`rounded-lg border px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all sm:px-6 ${
                          selectedOption.size === option.size
                            ? 'bg-navy-dark text-white border-navy-dark shadow-md'
                            : 'bg-neutral-50 text-navy-dark border-neutral-200 hover:border-navy-dark'
                        }`}
                      >
                        {option.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="mb-8 text-sm font-medium leading-relaxed text-neutral-600 sm:text-base">
                {product.name} is a high-purity research compound synthesized to the highest clinical standards. Our laboratory-grade research standard is HPLC-verified to ensure maximum consistency. Each vial is vacuum-sealed and temperature-controlled.
              </p>

              <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Quantity</p>
                <div className="inline-flex max-w-full items-center overflow-hidden rounded-xl border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="px-4 py-3 text-navy-dark hover:bg-neutral-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                    className="w-16 border-x border-neutral-200 py-3 text-center font-bold text-navy-dark outline-none sm:w-20"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="px-4 py-3 text-navy-dark hover:bg-neutral-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-10 space-y-6 border-t border-neutral-200 pt-6 sm:mb-12 sm:pt-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Testing</span>
                <span className="text-sm font-bold text-navy-dark uppercase">Independent HPLC Verified</span>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <button
                onClick={() => addItem(product, selectedOption, quantity)}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-navy-dark px-6 py-4 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-navy-dark/10 transition-all hover:bg-primary active:scale-[0.98] sm:px-8 sm:py-5 sm:text-xs"
              >
                <span className="material-symbols-outlined">add_shopping_cart</span>
                Add to Research
              </button>
              <Link to="/lab-results" className="block w-full rounded-xl border-2 border-neutral-200 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-500 transition-all hover:border-navy-dark hover:text-navy-dark sm:text-xs">
                Download Certificate of Analysis (PDF)
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 bg-navy-dark py-10 text-white sm:mt-20 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Prime Research Global Operations</p>
        </div>
      </footer>
    </div>
  );
}
