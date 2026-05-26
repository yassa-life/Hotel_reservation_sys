import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AppContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, logoutUser } = useAuth();
  const loc = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms' },
   
  ];

  return (
    <nav className="bg-white shadow-nav sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
              <span className="text-gold-400 font-display font-bold text-sm">H</span>
            </div>
            <span className="font-display font-bold text-navy-800 text-xl tracking-tight">
              Harborview<span className="text-gold-500">.</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${loc.pathname === l.to
                    ? 'bg-navy-50 text-navy-800'
                    : 'text-mid-gray hover:text-navy-700 hover:bg-navy-50'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA / User */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-light-gray transition-colors">
                  <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user.name?.charAt(0) ?? 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-dark-text">{user.name}</span>
                  <ChevronDown size={14} className="text-mid-gray" />
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card-hover border border-light-gray py-2 animate-fade-in">
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-dark-text hover:bg-light-gray">
                      <User size={15}/> My Dashboard
                    </Link>
                    <Link to="/dashboard/bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-dark-text hover:bg-light-gray">
                      <BookOpen size={15}/> My Bookings
                    </Link>
                    <hr className="my-1 border-light-gray"/>
                    <button onClick={logoutUser} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut size={15}/> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/signin" className="btn-ghost text-navy-800 text-sm">Sign In</Link>
                <Link to="/signup" className="btn-primary py-2 px-5 text-sm">Book Now</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-light-gray" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-light-gray px-4 py-4 space-y-2 animate-slide-up">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-dark-text hover:bg-light-gray">
              {l.label}
            </Link>
          ))}
          <hr className="border-light-gray my-2"/>
          {user ? (
            <>
              <Link to="/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-dark-text hover:bg-light-gray">Dashboard</Link>
              <button onClick={logoutUser} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/signin" className="block px-4 py-2.5 rounded-lg text-sm font-medium text-dark-text hover:bg-light-gray">Sign In</Link>
              <Link to="/signup" className="block btn-primary text-center mt-2">Book Now</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
