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
      'text-sm font-bold transition-colors uppercase tracking-widest',
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4 lg:gap-6">
            <Link to="/" className="flex items-center gap-2 -ml-2 group">
              <div className="w-10 h-10 bg-primary rounded flex flex-shrink-0 items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">biotech</span>
              </div>
              <span className="text-xl font-extrabold tracking-tighter uppercase whitespace-nowrap">Prime Research</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/catalog" className={navLinkClass}>Catalog</NavLink>
              <NavLink to="/lab-results" className={navLinkClass}>COAs and Test Results</NavLink>
              <NavLink to="/support" className={navLinkClass}>Support</NavLink>
              {isOwner ? <NavLink to="/owner/orders" className={navLinkClass}>Orders</NavLink> : null}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <form
              onSubmit={submitSearch}
              className="hidden lg:flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-lg group focus-within:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-400 text-sm mr-2">search</span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search compounds..." 
                className="bg-transparent border-none text-sm focus:ring-0 w-48 text-white placeholder:text-slate-500 font-medium"
              />
            </form>
            
            <div className="flex items-center gap-4">
              <Link to="/cart" className="relative hover:text-primary transition-colors">
                <span className="material-symbols-outlined">shopping_cart</span>
                <span className="absolute -top-2 -right-2 bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="bg-primary hover:bg-primary-hover px-5 py-2 text-sm font-bold rounded-lg transition-all active:scale-95"
              >
                {user ? 'Sign Out' : 'Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
