import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, signIn, signUp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = useMemo(() => location.state?.from || '/catalog', [location.state]);
  const [mode, setMode] = useState('signin');
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (mode === 'create') {
      if (form.password !== form.confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      const result = signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (!result.ok) {
        setErrorMessage(result.message || 'Unable to create account.');
        return;
      }

      navigate('/catalog', { replace: true });
      return;
    }

    const result = signIn({
      email: form.email.trim(),
      password: form.password,
    });

    if (!result.ok) {
      setErrorMessage(result.message || 'Unable to sign in.');
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-dark font-sans text-white">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 grayscale-[0.2]"
        style={{ backgroundImage: "url('/onyx_style_bg_1774467782051.png')" }}
      ></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-navy-dark/95 via-slate-dark/90 to-transparent"></div>

      <div className="relative z-20 flex min-h-screen flex-col lg:flex-row">
        <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-16 lg:py-12">
          <div className="mb-10 sm:mb-12">
            <div className="mb-6 flex items-center gap-3 sm:mb-8">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary sm:h-12 sm:w-12">
                <span className="material-symbols-outlined text-white text-3xl">biotech</span>
              </div>
              <h1 className="min-w-0 text-2xl font-extrabold uppercase tracking-tighter text-white sm:text-3xl">Prime Research</h1>
            </div>

            <h2 className="mb-6 text-4xl font-extrabold leading-[0.95] tracking-tighter text-white sm:mb-8 sm:text-5xl lg:text-6xl">
              Clinical Quality. <br />
              <span className="text-primary italic">Absolute</span> Precision.
            </h2>

            <p className="mb-8 max-w-xl text-base font-medium text-slate-300 sm:mb-12 sm:text-lg lg:text-xl">
              We provide the highest purity research compounds, backed by rigorous third-party testing and secure global logistics.
            </p>

            <div className="max-w-xl space-y-4 sm:space-y-6">
              <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10 sm:p-6">
                <div className="rounded-lg bg-primary/20 p-2">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                </div>
                <div>
                  <h3 className="mb-1 text-base font-bold text-white sm:text-lg">Exclusive Member Access</h3>
                  <p className="text-sm text-slate-400">Create an account before browsing the full research catalog.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10 sm:p-6">
                <div className="rounded-lg bg-primary/20 p-2">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                </div>
                <div>
                  <h3 className="mb-1 text-base font-bold text-white sm:text-lg">Secure Shipping</h3>
                  <p className="text-sm text-slate-400">Fast, reliable, and discreet delivery across our global network.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10 sm:p-6">
                <div className="rounded-lg bg-primary/20 p-2">
                  <span className="material-symbols-outlined text-primary">science</span>
                </div>
                <div>
                  <h3 className="mb-1 text-base font-bold text-white sm:text-lg">Third-Party Tested</h3>
                  <p className="text-sm text-slate-400">COAs published for every batch to ensure 99.8%+ analytical purity.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">50+ Compounds Available</p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase leading-none tracking-widest">
              <span className="px-3 py-2 border border-white/10 rounded-full bg-white/5">Peptides</span>
              <span className="px-3 py-2 border border-white/10 rounded-full bg-white/5">Research Chemicals</span>
              <span className="px-3 py-2 border border-white/10 rounded-full bg-white/5">Analytical Standards</span>
            </div>
          </div>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center bg-white p-4 shadow-2xl sm:p-6 lg:min-h-screen lg:w-[32rem] lg:p-10">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-extrabold text-navy-dark sm:text-3xl">Member Entrance</h2>
              <p className="text-sm font-medium text-neutral-500 sm:text-base">You must create an account or sign in before accessing the shop.</p>
            </div>

            <div className="flex border-b border-neutral-200">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-3 text-sm font-bold transition-colors sm:py-4 ${mode === 'signin' ? 'border-b-2 border-primary text-primary' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 py-3 text-sm font-bold transition-colors sm:py-4 ${mode === 'create' ? 'border-b-2 border-primary text-primary' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                Create Account
              </button>
            </div>

            <div className="relative pt-2 sm:pt-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold bg-white px-4 text-neutral-400">continue with email</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'create' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-black outline-none transition-all placeholder:text-neutral-300 focus:border-transparent focus:ring-2 focus:ring-primary sm:p-4"
                  />
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="you@email.com"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-black outline-none transition-all placeholder:text-neutral-300 focus:border-transparent focus:ring-2 focus:ring-primary sm:p-4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-black outline-none transition-all placeholder:text-neutral-300 focus:border-transparent focus:ring-2 focus:ring-primary sm:p-4"
                />
              </div>

              {mode === 'create' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(event) => updateField('confirmPassword', event.target.value)}
                    placeholder="Confirm password"
                    className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-black outline-none transition-all placeholder:text-neutral-300 focus:border-transparent focus:ring-2 focus:ring-primary sm:p-4"
                  />
                </div>
              ) : null}

              {errorMessage ? <p className="text-sm font-bold text-red-500">{errorMessage}</p> : null}

              <button type="submit" className="btn-primary w-full block">
                {mode === 'create' ? 'Create account and browse ->' : 'Sign in to browse ->'}
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-4 pt-4 text-neutral-400 sm:gap-6 sm:pt-8">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">lock</span> <span className="text-[10px] font-bold uppercase tracking-widest">SSL Encrypted</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">verified</span> <span className="text-[10px] font-bold uppercase tracking-widest">Data Protected</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
