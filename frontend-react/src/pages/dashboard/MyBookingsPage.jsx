import { useState, useEffect, useCallback } from 'react';
import { Download, Search, BookOpen, RefreshCw, X, Printer } from 'lucide-react';
import UserSidebar from '../../components/layout/UserSidebar';
import { StatusBadge, ConfirmModal, EmptyState, Pagination } from '../../components/shared/UI';
import { reservationsApi } from '../../api/client';
import { useToast, useAuth } from '../../context/AppContext';

const STATUSES = ['All', 'Confirmed', 'Pending', 'CheckedOut', 'Cancelled'];
const PER_PAGE = 4;

/** Receipt modal — shows booking details and a print/download option */
function ReceiptModal({ booking, onClose }) {
  if (!booking) return null;
  const id       = booking.reservationId;
  const room     = booking.roomNumber  ? `Room ${booking.roomNumber}` : `Room #${booking.roomId}`;
  const type     = booking.roomType    || '';
  const checkIn  = String(booking.checkInDate  ?? '').slice(0, 10);
  const checkOut = String(booking.checkOutDate ?? '').slice(0, 10);
  const nights   = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 1;
  const amount   = Number(booking.totalAmount ?? 0);
  const taxes    = Math.round(amount * (1 - 1/1.1)); // reverse the 10% we added
  const subtotal = amount - taxes;
  const ref      = `HRV-${String(id).padStart(6, '0')}`;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
         onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
           onClick={e => e.stopPropagation()}>
        {/* Receipt header */}
        <div className="bg-navy-800 text-white p-6 text-center relative">
          <button onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <X size={14}/>
          </button>
          <div className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="font-display font-bold text-navy-900 text-lg">H</span>
          </div>
          <h2 className="font-display font-bold text-lg">Harborview Grand Hotel</h2>
          <p className="text-navy-300 text-xs mt-1">Booking Receipt</p>
        </div>

        {/* Receipt body */}
        <div className="p-6">
          <div className="text-center mb-5">
            <p className="text-xs text-mid-gray">Reference Number</p>
            <p className="font-mono font-bold text-navy-800 text-xl tracking-widest">{ref}</p>
            <StatusBadge status={booking.status} className="mt-2"/>
          </div>

          <div className="space-y-3 text-sm border-t border-light-gray pt-4">
            {[
              ['Room',      `${room}${type ? ` · ${type}` : ''}`],
              ['Check-in',  checkIn  || '—'],
              ['Check-out', checkOut || '—'],
              ['Duration',  `${nights} night${nights !== 1 ? 's' : ''}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-mid-gray">{k}</span>
                <span className="font-medium text-dark-text">{v}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm border-t border-light-gray mt-4 pt-4">
            <div className="flex justify-between">
              <span className="text-mid-gray">Subtotal</span>
              <span>LKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mid-gray">Taxes & Fees (10%)</span>
              <span>LKR {taxes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-dark-text border-t border-light-gray pt-2 mt-1">
              <span>Total Paid</span>
              <span className="text-navy-800 text-lg">LKR {amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-cream rounded-xl border border-light-gray text-xs text-mid-gray text-center">
            Thank you for choosing Harborview Grand Hotel.<br/>
            We look forward to welcoming you!
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={handlePrint}
            className="flex-1 btn-outline flex items-center justify-center gap-2 py-2.5 text-sm">
            <Printer size={14}/> Print
          </button>
          <button onClick={onClose}
            className="flex-1 btn-primary py-2.5 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('All');
  const [page,        setPage]        = useState(1);
  const [cancelModal, setCancelModal] = useState({ open: false, id: null });
  const [receipt,     setReceipt]     = useState(null);

  const load = useCallback(() => {
    const customerId = user?.customerId ?? user?.id;
    if (!customerId) return;
    setLoading(true);
    setError(null);
    reservationsApi.getByCustomer(customerId)
      .then(data => setBookings(Array.isArray(data) ? data : []))
      .catch(err => { setError(err.message); setBookings([]); })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const getId   = b => b.reservationId;
  const getRoom = b => b.roomNumber ? `Room ${b.roomNumber}` : `Room #${b.roomId}`;
  const getIn   = b => b.checkInDate  ? String(b.checkInDate).slice(0, 10)  : '—';
  const getOut  = b => b.checkOutDate ? String(b.checkOutDate).slice(0, 10) : '—';
  const getAmt  = b => Number(b.totalAmount ?? 0);
  const getStat = b => b.status;

  const displayStatus = s => s === 'CheckedOut' ? 'Checked-out' : s;

  const filtered = bookings.filter(b =>
    (filter === 'All' || getStat(b) === filter) &&
    (String(getId(b)).toLowerCase().includes(search.toLowerCase()) ||
     getRoom(b).toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCancel = async (id) => {
    try {
      await reservationsApi.cancel(id);
      // Update local state — reservation stays as Cancelled (not removed)
      setBookings(prev => prev.map(b => getId(b) === id ? { ...b, status: 'Cancelled' } : b));
      addToast('Booking cancelled successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to cancel booking.', 'error');
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ⚠ {error}. Make sure the backend server is running.
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID or room..."
              className="input-field pl-9"/>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${filter === s ? 'bg-navy-800 text-white' : 'bg-white border border-light-gray text-mid-gray hover:border-navy-400'}`}>
                {s === 'CheckedOut' ? 'Checked Out' : s}
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
            description={bookings.length === 0
              ? "You haven't made any reservations yet."
              : "No bookings match your current filter."}
            action={<a href="/rooms" className="btn-primary inline-block">Browse Rooms</a>}
          />
        ) : (
          <div className="space-y-4">
            {paged.map(b => (
              <div key={getId(b)} className="card animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-navy-100 rounded-xl flex items-center justify-center flex-shrink-0 text-navy-700 font-bold text-lg">
                      {b.roomNumber || `#${b.roomId}`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-mid-gray">#{getId(b)}</span>
                        <StatusBadge status={displayStatus(getStat(b))}/>
                      </div>
                      <h3 className="font-display font-semibold text-dark-text">{getRoom(b)}</h3>
                      {b.roomType && <p className="text-xs text-mid-gray">{b.roomType}</p>}
                      <p className="text-xs text-mid-gray mt-1">{getIn(b)} → {getOut(b)}</p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-right">
                      <p className="font-display font-bold text-navy-800 text-lg">LKR {getAmt(b).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {/* Receipt button — now opens the receipt modal */}
                      <button
                        onClick={() => setReceipt(b)}
                        className="btn-outline py-2 px-3 text-xs flex items-center gap-1">
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
          message="Are you sure you want to cancel this booking? The status will be updated to Cancelled."
          confirmLabel="Yes, Cancel"
          danger
        />

        {/* Receipt Modal */}
        <ReceiptModal booking={receipt} onClose={() => setReceipt(null)}/>
      </main>
    </div>
  );
}
