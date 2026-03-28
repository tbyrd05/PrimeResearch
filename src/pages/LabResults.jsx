import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { labImages } from '../data/labAssets';

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
      <h2 className="text-2xl font-extrabold text-navy-dark uppercase tracking-tight">No Images Added Yet</h2>
      <p className="mx-auto mt-3 max-w-2xl text-neutral-500 font-medium">
        Add your COA and testing-result image files into /public/coas or /public/test-results, then list them in src/data/labAssets.js and they will appear here.
      </p>
    </div>
  );
}

export default function LabResults() {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-800">COAs and Test Results</span>
        </nav>

        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-navy-dark tracking-tighter uppercase">COAs and Test Results</h1>
          <p className="mt-3 text-lg font-medium text-neutral-500">
            A single place for COA files, chromatography screenshots, purity reports, and other testing-result images.
          </p>
        </div>

        {labImages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {labImages.map((item) => (
              <article key={item.src} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="aspect-[4/5] bg-neutral-100 p-4">
                  <img src={item.src} alt={item.title} className="h-full w-full object-contain" />
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-extrabold text-navy-dark uppercase tracking-tight">{item.title}</h2>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
