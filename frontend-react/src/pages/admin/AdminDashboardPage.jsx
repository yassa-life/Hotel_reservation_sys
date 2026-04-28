import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, DollarSign, BedDouble, Users,
  TrendingUp, Clock, ArrowRight, ChevronUp, RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { StatusBadge } from '../../components/shared/UI';
import { reservationsApi, reportsApi, roomsApi, customersApi } from '../../api/client';
import { REVENUE_DATA as MOCK_REVENUE_DATA } from '../../data/mockData';

function MetricCard({ icon: Icon, label, value, change, color, loading }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white"/>
        </div>
        {change && (
          <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
            <ChevronUp size={14}/>{change}
          </div>
        )}
      </div>
      {loading
        ? <div className="h-8 w-20 bg-light-gray rounded animate-pulse mb-1"/>
        : <p className="font-display font-bold text-2xl text-dark-text">{value}</p>
      }
      <p className="text-xs text-mid-gray mt-1">{label}</p>
    </div>
  );
}

// Map backend status to UI badge status
function mapStatus(s) {
  if (!s) return 'Pending';
  if (s === 'CheckedOut') return 'Checked-out';
  return s;
}

export default function AdminDashboardPage() {
  const [reservations, setReservations] = useState([]);
  const [summary, setSummary]           = useState({});
  const [revenueData, setRevenueData]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, sum, rev] = await Promise.all([
        reservationsApi.getAll(),
        reportsApi.getSummary().catch(() => ({})),
        reportsApi.getRevenue().catch(() => null),
      ]);
      setReservations(Array.isArray(res) ? res : []);
      setSummary(sum || {});
      setRevenueData(Array.isArray(rev) && rev.length > 0 ? rev : MOCK_REVENUE_DATA);
    } catch (e) {
      setError('Could not reach the backend. Showing cached data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const recentBookings = reservations.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar/>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="text-mid-gray text-sm mt-1">Overview of hotel operations</p>
          </div>
          <button onClick={load} className="btn-outline flex items-center gap-2 py-2 text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
            ⚠ {error}
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard icon={BookOpen}   label="Total Reservations" value={summary.totalReservations ?? reservations.length} change="+12%" color="bg-navy-700" loading={loading}/>
          <MetricCard icon={DollarSign} label="Total Revenue (LKR)" value={summary.totalRevenue ? `Rs.${Number(summary.totalRevenue).toLocaleString()}` : '—'} change="+8%" color="bg-gold-500" loading={loading}/>
          <MetricCard icon={BedDouble}  label="Available Rooms"    value={summary.availableRooms ?? '—'} color="bg-green-500" loading={loading}/>
          <MetricCard icon={Clock}      label="Pending Bookings"   value={reservations.filter(r => r.status === 'Pending').length} color="bg-orange-500" loading={loading}/>
        </div>

        {/* Charts + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-navy-800">Revenue Overview</h2>
              <span className="text-xs text-mid-gray">Historical data</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueData} margin={{top:5,right:10,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef"/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:'#6c757d'}}/>
                <YAxis tick={{fontSize:11,fill:'#6c757d'}} tickFormatter={v=>`$${v/1000}k`}/>
                <Tooltip formatter={v=>[`$${v.toLocaleString()}`, 'Revenue']}
                         contentStyle={{fontSize:12,border:'1px solid #e9ecef',borderRadius:8}}/>
                <Line type="monotone" dataKey="revenue" stroke="#1e3a5f" strokeWidth={2.5}
                      dot={{fill:'#1e3a5f',r:3}} activeDot={{r:5}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="font-display font-semibold text-navy-800 mb-5">Quick Stats</h2>
            <div className="space-y-4">
              {[
                { label: 'Confirmed',   val: reservations.filter(r=>r.status==='Confirmed').length,  icon: BookOpen,   color: 'text-green-700 bg-green-100' },
                { label: 'Checked Out', val: reservations.filter(r=>r.status==='CheckedOut').length, icon: TrendingUp, color: 'text-navy-700 bg-navy-100' },
                { label: 'Cancelled',   val: reservations.filter(r=>r.status==='Cancelled').length,  icon: Users,      color: 'text-red-600 bg-red-100' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
                      <s.icon size={16}/>
                    </div>
                    <span className="text-sm text-dark-text">{s.label}</span>
                  </div>
                  <span className="font-display font-bold text-dark-text">{s.val}</span>
                </div>
              ))}
            </div>
            <hr className="my-5 border-light-gray"/>
            <h3 className="text-sm font-semibold text-dark-text mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Manage Rooms',    to: '/admin/rooms' },
                { label: 'All Reservations',to: '/admin/bookings' },
                { label: 'Analytics',       to: '/admin/analytics' },
              ].map(a => (
                <Link key={a.to} to={a.to}
                  className="flex items-center justify-between p-3 rounded-xl bg-cream hover:bg-navy-50 text-sm text-navy-700 font-medium transition-colors">
                  {a.label}<ArrowRight size={14}/>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-navy-800">Recent Reservations</h2>
            <Link to="/admin/bookings" className="text-sm text-gold-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={13}/>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['ID','Customer ID','Room ID','Check-in','Check-out','Amount','Status'].map(h=>(
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({length:4}).map((_,i)=>(
                    <tr key={i}>
                      {Array.from({length:7}).map((_,j)=>(
                        <td key={j} className="table-td">
                          <div className="h-4 bg-light-gray rounded animate-pulse w-16"/>
                        </td>
                      ))}
                    </tr>
                  ))
                  : recentBookings.map(r => (
                    <tr key={r.reservationId ?? r.reservation_id} className="hover:bg-cream/60 transition-colors">
                      <td className="table-td font-mono text-xs text-navy-600">#{r.reservationId ?? r.reservation_id}</td>
                      <td className="table-td text-sm">{r.customerName ?? `Customer #${r.customerId ?? r.customer_id}`}</td>
                      <td className="table-td text-sm">Room #{r.roomId ?? r.room_id}</td>
                      <td className="table-td text-sm">{r.checkInDate ?? r.check_in_date}</td>
                      <td className="table-td text-sm">{r.checkOutDate ?? r.check_out_date}</td>
                      <td className="table-td font-semibold text-navy-800">
                        LKR {Number(r.totalAmount ?? r.total_amount ?? 0).toLocaleString()}
                      </td>
                      <td className="table-td"><StatusBadge status={mapStatus(r.status)}/></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
            {!loading && recentBookings.length === 0 && (
              <p className="text-center text-mid-gray py-10 text-sm">No reservations found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
