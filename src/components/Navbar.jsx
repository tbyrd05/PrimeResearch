import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, signOut, isOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const navLinkClass = ({ isActive }) =>
    [
      'text-xs sm:text-sm font-bold transition-colors uppercase tracking-widest',
      isActive ? 'text-white' : 'text-slate-400 hover:text-white',
    ].join(' ');

  useEffect(() => {
    if (location.pathname === '/catalog') {
      setSearchTerm(searchParams.get('q') || '');
    }
  }, [location.pathname, searchParams]);

  function submitSearch(event) {
    event.preventDefault();
    const trimmedSearch = searchTerm.trim();
    const nextUrl = trimmedSearch ? `/catalog?q=${encodeURIComponent(trimmedSearch)}` : '/catalog';
    navigate(nextUrl);
  }

  return (
    <nav className="bg-navy-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded flex flex-shrink-0 items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">biotech</span>
              </div>
              <span className="truncate text-base sm:text-xl font-extrabold tracking-tighter uppercase">Prime Research</span>
            </Link>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <Link to="/cart" className="relative rounded-lg p-1.5 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">shopping_cart</span>
                <span className="absolute -top-2 -right-2 bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="bg-primary hover:bg-primary-hover px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all active:scale-95"
              >
                {user ? 'Sign Out' : 'Account'}
              </button>
            </div>
          </div>

          <form
            onSubmit={submitSearch}
            className="flex items-center bg-white/5 border border-white/10 px-3 sm:px-4 py-2.5 rounded-xl group focus-within:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400 text-sm mr-2 shrink-0">search</span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search compounds..." 
              className="bg-transparent border-none text-sm focus:ring-0 w-full text-white placeholder:text-slate-500 font-medium"
            />
          </form>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:hidden">
            <NavLink to="/catalog" className={navLinkClass}>Catalog</NavLink>
            <NavLink to="/lab-results" className={navLinkClass}>COAs and Test Results</NavLink>
            <NavLink to="/support" className={navLinkClass}>Support</NavLink>
            {isOwner ? <NavLink to="/owner/orders" className={navLinkClass}>Orders</NavLink> : null}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/catalog" className={navLinkClass}>Catalog</NavLink>
            <NavLink to="/lab-results" className={navLinkClass}>COAs and Test Results</NavLink>
            <NavLink to="/support" className={navLinkClass}>Support</NavLink>
            {isOwner ? <NavLink to="/owner/orders" className={navLinkClass}>Orders</NavLink> : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
