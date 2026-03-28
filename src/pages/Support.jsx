import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { faqItems, supportConfig } from '../data/supportConfig';

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-extrabold uppercase tracking-tight text-navy-dark">{item.question}</span>
        <span className="material-symbols-outlined text-neutral-400">
          {isOpen ? 'remove' : 'add'}
        </span>
      </button>
      {isOpen ? (
        <div className="px-6 pb-6 text-sm font-medium leading-relaxed text-neutral-600">
          {item.answer}
        </div>
      ) : null}
    </div>
  );
}

export default function Support() {
  const [openIndex, setOpenIndex] = useState(0);
  const hasEmail = Boolean(supportConfig.contactEmail);
  const hasTelegram = Boolean(supportConfig.telegramUrl);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-800">Support</span>
        </nav>

        <header className="mb-12 max-w-3xl">
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter text-navy-dark">Support</h1>
          <p className="mt-3 text-lg font-medium text-neutral-500">
            Answers to common questions, plus a direct place for customers to contact you about orders, products, and test documentation.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            {faqItems.map((item, index) => (
              <FaqItem
                key={item.question}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-navy-dark p-8 text-white shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Contact</p>
              <h2 className="mt-3 text-3xl font-extrabold uppercase tracking-tight">Need Help?</h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-300">
                {supportConfig.responseWindow}
              </p>

              <div className="mt-8 space-y-3">
                {hasEmail ? (
                  <>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Email</p>
                      <a
                        href={`mailto:${supportConfig.contactEmail}`}
                        className="mt-2 block break-all text-sm font-bold text-white hover:text-primary transition-colors"
                      >
                        {supportConfig.contactEmail}
                      </a>
                    </div>
                    <a
                      href={`mailto:${supportConfig.contactEmail}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
                    >
                      <span>Email Support</span>
                      <span className="material-symbols-outlined text-base">mail</span>
                    </a>
                  </>
                ) : null}

                {hasTelegram ? (
                  <a
                    href={supportConfig.telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
                  >
                    <span>Telegram</span>
                    <span className="material-symbols-outlined text-base">send</span>
                  </a>
                ) : null}
              </div>

              {!hasEmail && !hasTelegram ? (
                <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Add your email or Telegram link in <code>src/data/supportConfig.js</code> to enable customer contact.
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-neutral-400">Quick Help</p>
              <ul className="mt-4 space-y-3 text-sm font-medium text-neutral-600">
                <li>Include your order number when asking about shipping.</li>
                <li>Reference the product name clearly for stock or batch questions.</li>
                <li>Use the COAs and Test Results tab when you need supporting lab images.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
