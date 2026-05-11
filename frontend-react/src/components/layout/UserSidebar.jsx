import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, User, Settings, LogOut, Menu, X, Star
} from 'lucide-react';

import { useAuth } from '../../context/AppContext';

const navItems = [
  { to: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/bookings', icon: BookOpen,         label: 'My Bookings' },
  { to: '/dashboard/reviews',  icon: Star,             label: 'My Reviews' },
  { to: '/dashboard/profile',  icon: User,             label: 'Profile' },
  { to: '/dashboard/settings', icon: Settings,         label: 'Settings' },
];

export default function UserSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const { user, logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    nav('/signin');
  };

  const SidebarContent = () => (
    <>
      {/* Profile */}
      <div className="px-4 py-5 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-navy-900 text-base">
              {user?.name?.charAt(0) ?? 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.name ?? 'Guest'}</p>
            <p className="text-xs text-navy-400">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}>
              <Icon size={18}/>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-navy-800">
        <button onClick={handleLogout}
          className="sidebar-link text-red-400 hover:bg-red-900/30 hover:text-red-300 w-full">
          <LogOut size={18}/>
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-60 bg-navy-900 min-h-screen flex-col sticky top-0 flex-shrink-0">
        <div className="px-4 py-5 border-b border-navy-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="text-navy-900 font-display font-bold text-xs">H</span>
            </div>
            <span className="font-display font-bold text-white text-lg">
              Harbor<span className="text-gold-400">view</span>
            </span>
          </Link>
        </div>
        <SidebarContent/>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-navy-900 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-white">Harborview<span className="text-gold-400">.</span></Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1.5">
          {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-30 bg-navy-900/50" onClick={() => setMobileOpen(false)}/>
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-40 w-64 bg-navy-900 flex flex-col animate-slide-in">
            <div className="px-4 py-5 border-b border-navy-800 flex items-center justify-between">
              <span className="font-display font-bold text-white">Harborview<span className="text-gold-400">.</span></span>
              <button onClick={() => setMobileOpen(false)} className="text-navy-400"><X size={18}/></button>
            </div>
            <SidebarContent/>
          </aside>
        </>
      )}
    </>
  );
}
