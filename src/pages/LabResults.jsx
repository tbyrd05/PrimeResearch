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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 sm:mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-800">COAs and Test Results</span>
        </nav>

        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl font-extrabold uppercase tracking-tighter text-navy-dark sm:text-4xl">COAs and Test Results</h1>
          <p className="mt-3 text-base font-medium text-neutral-500 sm:text-lg">
            A single place for COA files, chromatography screenshots, purity reports, and other testing-result images.
          </p>
        </div>

        {labImages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3 xl:gap-8">
            {labImages.map((item) => (
              <article key={item.src} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="aspect-[4/5] bg-neutral-100 p-3 sm:p-4">
                  <img src={item.src} alt={item.title} className="h-full w-full object-contain" />
                </div>
                <div className="p-4 sm:p-5">
                  <h2 className="break-words text-base font-extrabold uppercase tracking-tight text-navy-dark sm:text-lg">{item.title}</h2>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
