import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, DollarSign, Star, ArrowRight, BookOpen } from 'lucide-react';
import UserSidebar from '../../components/layout/UserSidebar';
import { StatusBadge } from '../../components/shared/UI';
import { BOOKINGS } from '../../data/mockData';
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

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    reservationsApi.getAll().then(data => {
      const myId = user?.customerId ?? user?.customer_id ?? user?.id;
      const validData = Array.isArray(data) && data.length > 0 ? data : BOOKINGS;
      setBookings(validData.filter(b => 
        (b.customerId ?? b.customer_id ?? null) === myId || BOOKINGS.includes(b)
      ));
    }).catch(() => setBookings(BOOKINGS));
  }, [user]);

  const upcoming  = bookings.filter(b => ['Confirmed','Pending'].includes(b.status)).slice(0,2);
  const recent    = bookings.slice(0,3);

  return (
    <div className="flex min-h-screen bg-cream">
      <UserSidebar/>
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8 overflow-auto">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-mid-gray text-sm mb-1">Good afternoon,</p>
          <h1 className="font-display text-2xl font-bold text-navy-800">{user?.name ?? 'Guest'}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BookOpen}  label="Total Bookings"  value={bookings.length}    color="bg-navy-700"/>
          <StatCard icon={Calendar}  label="Upcoming Stays"  value={upcoming.length}    color="bg-gold-500"/>
          <StatCard icon={Clock}     label="Completed Stays" value="3"    color="bg-green-500"/>
          <StatCard icon={DollarSign}label="Total Spent"     value="$8.2k" color="bg-purple-500"/>
        </div>

        {/* Upcoming Reservations */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg text-navy-800">Upcoming Reservations</h2>
            <Link to="/dashboard/bookings" className="text-sm text-gold-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={13}/>
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-mid-gray text-sm py-8 text-center">No upcoming reservations.</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map(b => (
                <div key={b.reservationId ?? b.reservation_id ?? b.id} className="flex items-center justify-between p-4 rounded-xl border border-light-gray bg-cream hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-navy-700"/>
                    </div>
                    <div>
                      <p className="font-semibold text-dark-text text-sm">{b.roomName ?? b.room ?? `Room #${b.roomId ?? b.room_id}`}</p>
                      <p className="text-xs text-mid-gray mt-0.5">{b.checkInDate ?? b.check_in_date ?? b.checkIn} → {b.checkOutDate ?? b.check_out_date ?? b.checkOut}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={b.status}/>
                    <p className="text-xs text-mid-gray mt-1">${Number(b.totalAmount ?? b.total_amount ?? b.amount ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Book a Room',     to: '/rooms',              color: 'bg-navy-800 text-white' },
            { label: 'View My Bookings',to: '/dashboard/bookings', color: 'bg-gold-500 text-navy-900' },
            { label: 'Edit Profile',    to: '/dashboard/profile',  color: 'bg-light-gray text-dark-text' },
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
                  <tr key={b.reservationId ?? b.reservation_id ?? b.id} className="hover:bg-cream/60 transition-colors">
                    <td className="table-td font-mono text-xs text-navy-600">#{b.reservationId ?? b.reservation_id ?? b.id}</td>
                    <td className="table-td font-medium">{b.roomName ?? b.room ?? `Room #${b.roomId ?? b.room_id}`}</td>
                    <td className="table-td">{b.checkInDate ?? b.check_in_date ?? b.checkIn}</td>
                    <td className="table-td">{b.checkOutDate ?? b.check_out_date ?? b.checkOut}</td>
                    <td className="table-td font-semibold text-navy-800">${Number(b.totalAmount ?? b.total_amount ?? b.amount ?? 0).toLocaleString()}</td>
                    <td className="table-td"><StatusBadge status={b.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
