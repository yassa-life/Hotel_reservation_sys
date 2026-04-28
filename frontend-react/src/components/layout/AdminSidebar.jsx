import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, BedDouble, Users, BarChart2,
  Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AppContext';

const navItems = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/admin/bookings',   icon: BookOpen,         label: 'Bookings'   },
  { to: '/admin/rooms',      icon: BedDouble,        label: 'Rooms'      },
  { to: '/admin/customers',  icon: Users,            label: 'Customers'  },
  { to: '/admin/analytics',  icon: BarChart2,        label: 'Analytics'  },
  { to: '/admin/settings',   icon: Settings,         label: 'Settings'   },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const { logoutAdmin } = useAuth();

  const handleLogout = () => {
    logoutAdmin();
    nav('/admin/login');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} transition-all duration-300
                       bg-navy-900 min-h-screen flex flex-col sticky top-0 flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-navy-800">
        {!collapsed && (
          <span className="font-display font-bold text-white text-lg">
            Harbor<span className="text-gold-400">view</span>
          </span>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-800 transition-colors">
          {collapsed ? <ChevronRight size={18}/> : <Menu size={18}/>}
        </button>
      </div>

      {/* Admin Badge */}
      {!collapsed && (
        <div className="px-4 py-3 bg-navy-800 mx-3 mt-3 rounded-xl">
          <p className="text-xs text-navy-400 mb-0.5">Logged in as</p>
          <p className="text-sm font-semibold text-white">Admin Portal</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = loc.pathname.startsWith(to);
          return (
            <Link key={to} to={to}
              className={`sidebar-link ${active ? 'sidebar-link-active' : ''}
                          ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? label : undefined}>
              <Icon size={18} className="flex-shrink-0"/>
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-navy-800">
        <button onClick={handleLogout}
          className={`sidebar-link text-red-400 hover:bg-red-900/30 hover:text-red-300 w-full
                      ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}>
          <LogOut size={18} className="flex-shrink-0"/>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
