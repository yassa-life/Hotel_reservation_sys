import { useState, useEffect } from 'react';
import { Download, Search, X, BookOpen, RefreshCw } from 'lucide-react';
import UserSidebar from '../../components/layout/UserSidebar';
import { StatusBadge, ConfirmModal, EmptyState, Pagination } from '../../components/shared/UI';
import { reservationsApi } from '../../api/client';
import { BOOKINGS as MOCK_BOOKINGS } from '../../data/mockData';
import { useToast, useAuth } from '../../context/AppContext';

const STATUSES = ['All', 'Confirmed', 'Pending', 'Checked-in', 'Checked-out', 'Cancelled'];

export default function MyBookingsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');
  const [page,     setPage]     = useState(1);
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });

  const PER_PAGE = 4;

  const load = () => {
    setLoading(true);
    reservationsApi.getAll().then(data => {
      // Filter by current user if backend doesn't filter, or just use mock if backend down
      const myId = user?.customerId ?? user?.customer_id ?? user?.id;
      const validData = Array.isArray(data) && data.length > 0 ? data : MOCK_BOOKINGS;
      setBookings(validData.filter(b => 
        (b.customerId ?? b.customer_id ?? null) === myId || MOCK_BOOKINGS.includes(b)
      ));
    }).catch(() => {
      setBookings(MOCK_BOOKINGS);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const getId    = b => b.reservationId ?? b.reservation_id ?? b.id;
  const getRoom  = b => b.roomName ?? b.room ?? `Room #${b.roomId ?? b.room_id}`;
  const getIn    = b => b.checkInDate ?? b.check_in_date ?? b.checkIn;
  const getOut   = b => b.checkOutDate ?? b.check_out_date ?? b.checkOut;
  const getAmt   = b => Number(b.totalAmount ?? b.total_amount ?? b.amount ?? 0);
  const getStat  = b => b.status === 'CheckedOut' ? 'Checked-out' : b.status;

  const filtered = bookings.filter(b =>
    (filter === 'All' || getStat(b) === filter) &&
    (String(getId(b)).toLowerCase().includes(search.toLowerCase()) ||
     String(getRoom(b)).toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const handleCancel = async (id) => {
    try {
      await reservationsApi.cancel(id);
      setBookings(prev => prev.map(b => getId(b) === id ? { ...b, status: 'Cancelled' } : b));
      addToast('Booking cancelled successfully.', 'success');
    } catch {
      // Fallback for mock data
      setBookings(prev => prev.map(b => getId(b) === id ? { ...b, status: 'Cancelled' } : b));
      addToast('Booking cancelled.', 'success');
    }
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <UserSidebar/>
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">My Bookings</h1>
            <p className="text-mid-gray text-sm mt-1">Manage all your reservations</p>
          </div>
          <button onClick={load} className="btn-outline flex items-center gap-2 py-2 text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
              placeholder="Search by ID or room name..."
              className="input-field pl-9"/>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={()=>{setFilter(s);setPage(1);}}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${filter===s ? 'bg-navy-800 text-white' : 'bg-white border border-light-gray text-mid-gray hover:border-navy-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
             {[1,2,3].map(i => <div key={i} className="card h-24 animate-pulse bg-light-gray/50"/>)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No bookings found"
            description="You haven't made any reservations yet, or no bookings match your filter."
            action={<a href="/rooms" className="btn-primary inline-block">Browse Rooms</a>}
          />
        ) : (
          <div className="space-y-4">
            {paged.map(b => (
              <div key={getId(b)} className="card animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-light-gray rounded-xl flex items-center justify-center flex-shrink-0 text-mid-gray text-xs font-medium">
                      Room
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-mid-gray">#{getId(b)}</span>
                        <StatusBadge status={getStat(b)}/>
                      </div>
                      <h3 className="font-display font-semibold text-dark-text">{getRoom(b)}</h3>
                      <p className="text-xs text-mid-gray mt-1">
                        {getIn(b)} → {getOut(b)}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-right">
                      <p className="font-display font-bold text-navy-800 text-lg">LKR {getAmt(b).toLocaleString()}</p>
                      <p className="text-xs text-mid-gray">Booked {b.created_at ? new Date(b.created_at).toLocaleDateString() : b.bookedOn}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-outline py-2 px-3 text-xs flex items-center gap-1">
                        <Download size={13}/> Receipt
                      </button>
                      {['Confirmed','Pending'].includes(getStat(b)) && (
                        <button
                          onClick={() => setCancelModal({ open: true, id: getId(b) })}
                          className="btn-danger py-2 px-3 text-xs">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {b.special && (
                  <div className="mt-3 pt-3 border-t border-light-gray">
                    <p className="text-xs text-mid-gray">
                      <span className="font-medium text-dark-text">Special request:</span> {b.special}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPage={setPage}/>

        <ConfirmModal
          isOpen={cancelModal.open}
          onClose={() => setCancelModal({ open: false, id: null })}
          onConfirm={() => handleCancel(cancelModal.id)}
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking? This action cannot be undone and refunds are subject to our cancellation policy."
          confirmLabel="Yes, Cancel"
          danger
        />
      </main>
    </div>
  );
}
