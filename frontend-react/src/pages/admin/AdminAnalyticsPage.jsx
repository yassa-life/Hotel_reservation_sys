import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { reportsApi, reservationsApi, customersApi, roomsApi } from '../../api/client';


const COLORS = ['#1e3a5f','#d4af37','#4caf50','#9e9e9e'];

const OCCUPANCY_DATA = [
  { month:'Jan', rate:62 },{ month:'Feb', rate:58 },{ month:'Mar', rate:71 },
  { month:'Apr', rate:78 },{ month:'May', rate:74 },{ month:'Jun', rate:88 },
  { month:'Jul', rate:92 },{ month:'Aug', rate:95 },{ month:'Sep', rate:84 },
  { month:'Oct', rate:76 },{ month:'Nov', rate:68 },{ month:'Dec', rate:82 },
];

const POPULAR_PERIODS = [
  { period:'Jan-Feb', bookings:242 },{ period:'Mar-Apr', bookings:348 },
  { period:'May-Jun', bookings:384 },{ period:'Jul-Aug', bookings:526 },
  { period:'Sep-Oct', bookings:418 },{ period:'Nov-Dec', bookings:392 },
];

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card">
      <div className="mb-5">
        <h2 className="font-display font-semibold text-navy-800">{title}</h2>
        {subtitle && <p className="text-xs text-mid-gray mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [summary,     setSummary]     = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [roomRevData, setRoomRevData] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [year,        setYear]        = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    Promise.all([
      reportsApi.getSummary().catch(() => ({})),
      reportsApi.getRevenue(year).catch(() => []),
      roomsApi.getAll().catch(() => []),
      customersApi.getAll().catch(() => []),
    ]).then(([sum, rev, rooms, custs]) => {
      setSummary({ ...sum, totalCustomers: custs.length, availableRooms: rooms.filter(r => (r.status||'').toLowerCase() === 'available').length });
      setRevenueData(Array.isArray(rev) && rev.length > 0 ? rev : []);
      // Build room revenue breakdown from room types
      const typeMap = {};
      rooms.forEach(r => { typeMap[r.type] = (typeMap[r.type] || 0) + 1; });
      const total = rooms.length || 1;
      setRoomRevData(Object.entries(typeMap).map(([name, count]) => ({ name, value: Math.round(count/total*100) })));
    }).finally(() => setLoading(false));
  }, [year]);

  const roomRevDisplay = roomRevData.length > 0 ? roomRevData : [

    { name: 'Single', value: 25 }, { name: 'Double', value: 40 },
    { name: 'Suite',  value: 20 }, { name: 'Deluxe', value: 15 },
  ];


  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar/>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="section-title">Analytics</h1>
          <p className="text-mid-gray text-sm mt-1">Insights and performance metrics</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label:'Total Revenue',   val: summary.totalRevenue    ? `Rs.${Number(summary.totalRevenue).toLocaleString()}` : '—' },
            { label:'Total Bookings',  val: summary.totalReservations ?? '—' },
            { label:'Total Customers', val: summary.totalCustomers  ?? '—' },
            { label:'Available Rooms', val: summary.availableRooms  ?? '—' },
          ].map(k => (
            <div key={k.label} className="card">
              <p className="text-xs text-mid-gray mb-1">{k.label}</p>
              <p className="font-display font-bold text-2xl text-dark-text">
                {loading ? <span className="text-mid-gray">…</span> : k.val}
              </p>
            </div>
          ))}
        </div>


        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-semibold text-navy-800">Revenue Trends</h2>
                <p className="text-xs text-mid-gray mt-0.5">Monthly revenue</p>
              </div>
              <select value={year} onChange={e => setYear(+e.target.value)}
                className="text-xs border border-light-gray rounded px-2 py-1 outline-none text-navy-700 bg-cream">
                {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData} margin={{top:5,right:10,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef"/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:'#6c757d'}}/>
                <YAxis tick={{fontSize:11,fill:'#6c757d'}} tickFormatter={v=>`Rs.${v/1000}k`}/>
                <Tooltip formatter={v=>[`Rs.${v.toLocaleString()}`, 'Revenue']}
                         contentStyle={{fontSize:12,border:'1px solid #e9ecef',borderRadius:8}}/>
                <Bar dataKey="revenue" fill="#1e3a5f" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ChartCard title="Occupancy Rate" subtitle="Monthly occupancy percentage">

            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={OCCUPANCY_DATA} margin={{top:5,right:10,left:0,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef"/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:'#6c757d'}}/>
                <YAxis tick={{fontSize:11,fill:'#6c757d'}} tickFormatter={v=>`${v}%`}/>
                <Tooltip formatter={v=>[`${v}%`,'Occupancy']}
                         contentStyle={{fontSize:12,border:'1px solid #e9ecef',borderRadius:8}}/>
                <Line type="monotone" dataKey="rate" stroke="#d4af37" strokeWidth={2.5}
                      dot={{fill:'#d4af37',r:3}} activeDot={{r:5}}/>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue by Room Type */}
          <ChartCard title="Revenue by Room Type" subtitle="Room type distribution">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={roomRevDisplay} cx="50%" cy="50%" outerRadius={80}
                     dataKey="value" nameKey="name" label={({name,value})=>`${name} ${value}%`}
                     labelLine={false}>
                  {roomRevDisplay.map((_,i) => <Cell key={i} fill={COLORS[i]}/>)}
                </Pie>
                <Tooltip formatter={v=>[`${v}%`,'Share']}
                         contentStyle={{fontSize:12,border:'1px solid #e9ecef',borderRadius:8}}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {roomRevDisplay.map((r,i) => (
                <div key={r.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{background:COLORS[i]}}/>
                  <span className="text-xs text-mid-gray">{r.name}: <strong>{r.value}%</strong></span>
                </div>
              ))}
            </div>
          </ChartCard>


          {/* Popular Booking Periods */}
          <div className="lg:col-span-2">
            <ChartCard title="Popular Booking Periods" subtitle="Bookings by bi-monthly period">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={POPULAR_PERIODS} layout="vertical" margin={{top:5,right:20,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:11,fill:'#6c757d'}}/>
                  <YAxis type="category" dataKey="period" tick={{fontSize:11,fill:'#6c757d'}} width={60}/>
                  <Tooltip contentStyle={{fontSize:12,border:'1px solid #e9ecef',borderRadius:8}}/>
                  <Bar dataKey="bookings" fill="#1e3a5f" radius={[0,4,4,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </main>
    </div>
  );
}
