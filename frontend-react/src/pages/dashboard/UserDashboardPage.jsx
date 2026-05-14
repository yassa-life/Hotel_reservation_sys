import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, DollarSign, BookOpen, ArrowRight } from 'lucide-react';
import UserSidebar from '../../components/layout/UserSidebar';
import { StatusBadge } from '../../components/shared/UI';
import { reservationsApi } from '../../api/client';
import { useAuth } from '../../context/AppContext';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white"/>
      </div>
      <div>
        <p className="text-xs text-mid-gray">{label}</p>
        <p className="font-display font-bold text-xl text-dark-text">{value}</p>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!user) return;
    const customerId = user.customerId ?? user.id;
    if (!customerId) return;

    setLoading(true);
    reservationsApi.getByCustomer(customerId)
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setError(err.message);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Computed stats from real data
  const upcoming  = bookings.filter(b => ['Confirmed', 'Pending'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'CheckedOut');
  const totalSpent = bookings
    .filter(b => b.status !== 'Cancelled')
    .reduce((sum, b) => sum + Number(b.totalAmount ?? 0), 0);

  const recent = [...bookings].slice(0, 3);

  const getId   = b => b.reservationId;
  const getRoom = b => `Room #${b.roomId}`;
  const getIn   = b => b.checkInDate ? String(b.checkInDate).slice(0, 10) : '—';
  const getOut  = b => b.checkOutDate ? String(b.checkOutDate).slice(0, 10) : '—';
  const getAmt  = b => Number(b.totalAmount ?? 0);

  return (
    <div className="flex min-h-screen bg-cream">
      <UserSidebar/>
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8 overflow-auto">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-mid-gray text-sm mb-1">{greeting()},</p>
          <h1 className="font-display text-2xl font-bold text-navy-800">{user?.name ?? 'Guest'}</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ⚠ Could not load bookings: {error}. Make sure the backend server is running.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen}   label="Total Bookings"   value={loading ? '…' : bookings.length}   color="bg-navy-700"/>
          <StatCard icon={Calendar}   label="Upcoming Stays"   value={loading ? '…' : upcoming.length}   color="bg-gold-500"/>
          <StatCard icon={Clock}      label="Completed Stays"  value={loading ? '…' : completed.length}  color="bg-green-500"/>
          <StatCard icon={DollarSign} label="Total Spent (LKR)"
            value={loading ? '…' : `Rs.${totalSpent.toLocaleString()}`}
            color="bg-purple-500"/>
        </div>

        {/* Upcoming Reservations */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg text-navy-800">Upcoming Reservations</h2>
            <Link to="/dashboard/bookings" className="text-sm text-gold-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={13}/>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-16 rounded-xl bg-light-gray/60 animate-pulse"/>)}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-mid-gray text-sm py-8 text-center">No upcoming reservations.</p>
          ) : (
            <div className="space-y-4">
              {upcoming.slice(0, 2).map(b => (
                <div key={getId(b)} className="flex items-center justify-between p-4 rounded-xl border border-light-gray bg-cream hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-navy-700"/>
                    </div>
                    <div>
                      <p className="font-semibold text-dark-text text-sm">{getRoom(b)}</p>
                      <p className="text-xs text-mid-gray mt-0.5">{getIn(b)} → {getOut(b)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={b.status}/>
                    <p className="text-xs text-mid-gray mt-1">LKR {getAmt(b).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Book a Room',      to: '/rooms',              color: 'bg-navy-800 text-white' },
            { label: 'View My Bookings', to: '/dashboard/bookings', color: 'bg-gold-500 text-navy-900' },
            { label: 'Edit Profile',     to: '/dashboard/profile',  color: 'bg-light-gray text-dark-text' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className={`${a.color} rounded-xl py-4 px-5 font-semibold text-sm text-center hover:opacity-90 transition-opacity shadow-sm`}>
              {a.label}
            </Link>
          ))}
        </div>

        {/* Recent Bookings Table */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-navy-800 mb-4">Recent Bookings</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-10 rounded-lg bg-light-gray/50 animate-pulse"/>)}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-center text-mid-gray text-sm py-6">No bookings yet. <Link to="/rooms" className="text-navy-700 underline">Browse rooms →</Link></p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Booking ID','Room','Check-in','Check-out','Amount','Status'].map(h => (
                      <th key={h} className="table-th first:rounded-l-lg last:rounded-r-lg">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(b => (
                    <tr key={getId(b)} className="hover:bg-cream/60 transition-colors">
                      <td className="table-td font-mono text-xs text-navy-600">#{getId(b)}</td>
                      <td className="table-td font-medium">{getRoom(b)}</td>
                      <td className="table-td">{getIn(b)}</td>
                      <td className="table-td">{getOut(b)}</td>
                      <td className="table-td font-semibold text-navy-800">LKR {getAmt(b).toLocaleString()}</td>
                      <td className="table-td"><StatusBadge status={b.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
