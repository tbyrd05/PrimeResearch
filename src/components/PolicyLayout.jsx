import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function PolicyLayout({ title, intro, sections }) {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 sm:mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
          <span>/</span>
          <span className="text-neutral-800">{title}</span>
        </nav>

        <header className="mb-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:mb-10 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Prime Research</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tighter text-navy-dark sm:text-4xl">{title}</h1>
          <p className="mt-4 text-sm font-medium leading-relaxed text-neutral-600 sm:text-base">{intro}</p>
        </header>

        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.heading} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-extrabold tracking-tight text-navy-dark sm:text-2xl">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-sm font-medium leading-relaxed text-neutral-600 sm:text-base">
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="mt-4 space-y-3 text-sm font-medium text-neutral-600 sm:text-base">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
