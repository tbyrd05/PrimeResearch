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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
          <span>/</span>
          <span className="text-neutral-800 uppercase">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <ProductArtwork
              product={product}
              sizeLabel={selectedOption.size}
              className="shadow-[0_28px_80px_rgba(15,23,42,0.12)]"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">{product.purity} Analytical Purity</span>
              <h1 className="text-5xl font-extrabold text-navy-dark tracking-tighter mb-4 uppercase leading-none">{product.name}</h1>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6 whitespace-nowrap overflow-hidden text-ellipsis">CAS Number: {product.cas}</p>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-black text-primary">{selectedOption.price}</span>
              </div>

              {product.options.length > 1 && (
                <div className="mb-8 p-6 bg-white border border-neutral-200 rounded-xl shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Select Size (mg)</p>
                  <div className="flex flex-wrap gap-3">
                    {product.options.map((option) => (
                      <button
                        key={option.size}
                        onClick={() => setSelectedOption(option)}
                        className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${
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

              <p className="text-neutral-600 leading-relaxed font-medium mb-8">
                {product.name} is a high-purity research compound synthesized to the highest clinical standards. Our laboratory-grade research standard is HPLC-verified to ensure maximum consistency. Each vial is vacuum-sealed and temperature-controlled.
              </p>

              <div className="mb-8 p-6 bg-white border border-neutral-200 rounded-xl shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">Quantity</p>
                <div className="inline-flex items-center border border-neutral-200 rounded-xl overflow-hidden">
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
                    className="w-20 text-center font-bold text-navy-dark border-x border-neutral-200 py-3 outline-none"
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

            <div className="space-y-6 border-t border-neutral-200 pt-8 mb-12">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Testing</span>
                <span className="text-sm font-bold text-navy-dark uppercase">Independent HPLC Verified</span>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <button
                onClick={() => addItem(product, selectedOption, quantity)}
                className="w-full bg-navy-dark text-white py-5 px-8 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary transition-all shadow-xl shadow-navy-dark/10 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">add_shopping_cart</span>
                Add to Research
              </button>
              <Link to="/lab-results" className="w-full block py-4 border-2 border-neutral-200 text-neutral-500 hover:border-navy-dark hover:text-navy-dark transition-all font-bold rounded-xl text-xs uppercase tracking-widest text-center">
                Download Certificate of Analysis (PDF)
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-navy-dark text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Prime Research Global Operations</p>
        </div>
      </footer>
    </div>
  );
}
