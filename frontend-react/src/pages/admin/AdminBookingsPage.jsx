import { useState, useEffect } from 'react';
import { Search, Download, Eye, Check, X, LogOut } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { StatusBadge, Modal, ConfirmModal, Pagination } from '../../components/shared/UI';
import { reservationsApi } from '../../api/client';
import { useToast } from '../../context/AppContext';

const ALL_STATUSES = ['All', 'Confirmed', 'Pending', 'CheckedOut', 'Cancelled'];
const PER_PAGE = 8;

function mapStatus(s) {
  if (s === 'CheckedOut') return 'Checked-out';
  return s ?? 'Pending';
}

export default function AdminBookingsPage() {
  const { addToast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search,  setSearch]            = useState('');
  const [filter,  setFilter]            = useState('All');
  const [page,    setPage]              = useState(1);
  const [selected, setSelected]         = useState(null);
  const [cancelModal, setCancelModal]   = useState({ open: false, id: null });

  const load = async () => {
    setLoading(true);
    try {
      const data = await reservationsApi.getAll();
      setReservations(Array.isArray(data) ? data : []);
    } catch {
      addToast('Failed to load reservations from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getId   = r => r.reservationId   ?? r.reservation_id;
  // Use joined customer name — fall back to ID if not present
  const getCust  = r => r.customerName    ?? `Customer #${r.customerId ?? r.customer_id}`;
  // Use joined room number — fall back to ID if not present
  const getRoom  = r => r.roomNumber      ? `Room ${r.roomNumber}` : `Room #${r.roomId ?? r.room_id}`;
  const getIn    = r => r.checkInDate     ? String(r.checkInDate).slice(0,10)  : (r.check_in_date  ?? '—');
  const getOut   = r => r.checkOutDate    ? String(r.checkOutDate).slice(0,10) : (r.check_out_date ?? '—');
  const getAmt   = r => Number(r.totalAmount ?? r.total_amount ?? 0);

  const filtered = reservations.filter(r => {
    const matchStatus = filter === 'All' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = [getId(r), getCust(r), getRoom(r)].some(v => String(v).toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const confirmReservation = async (id) => {
    try {
      const res = reservations.find(r => getId(r) === id);
      if (!res) return;
      await reservationsApi.update({ ...res, status: 'Confirmed' });
      setReservations(prev => prev.map(r => getId(r) === id ? { ...r, status: 'Confirmed' } : r));
      addToast(`Reservation #${id} confirmed.`, 'success');
    } catch {
      addToast('Failed to update reservation.', 'error');
    }
  };

  const cancelReservation = async (id) => {
    try {
      await reservationsApi.cancel(id);
      setReservations(prev => prev.map(r => getId(r) === id ? { ...r, status: 'Cancelled' } : r));
      addToast(`Reservation #${id} cancelled.`, 'success');
    } catch {
      addToast('Failed to cancel reservation.', 'error');
    }
  };

  const checkoutReservation = async (id) => {
    try {
      const res = reservations.find(r => getId(r) === id);
      if (!res) return;
      await reservationsApi.update({ ...res, status: 'CheckedOut' });
      setReservations(prev => prev.map(r => getId(r) === id ? { ...r, status: 'CheckedOut' } : r));
      addToast(`Reservation #${id} checked out.`, 'success');
    } catch {
      addToast('Failed to check out reservation.', 'error');
    }
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Customer', 'Room', 'Check-in', 'Check-out', 'Amount', 'Status'],
      ...reservations.map(r => [getId(r), getCust(r), getRoom(r), getIn(r), getOut(r), getAmt(r), r.status])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'reservations.csv'; a.click();
    URL.revokeObjectURL(url);
    addToast('Reservations exported as CSV.', 'success');
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar/>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Reservations</h1>
            <p className="text-mid-gray text-sm mt-1">{reservations.length} total reservations</p>
          </div>
          <button onClick={exportCSV} className="btn-outline flex items-center gap-2 py-2.5 text-sm">
            <Download size={15}/> Export CSV
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID, customer, or room..."
              className="input-field pl-9"/>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map(s => (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${filter === s ? 'bg-navy-800 text-white' : 'bg-white border border-light-gray text-mid-gray hover:border-navy-400'}`}>
                {s === 'CheckedOut' ? 'Checked Out' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['ID', 'Customer', 'Room', 'Check-in', 'Check-out', 'Amount (LKR)', 'Status', 'Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="table-td">
                        <div className="h-4 w-16 bg-light-gray rounded animate-pulse"/>
                      </td>
                    ))}
                  </tr>
                ))
                : paged.map(r => (
                  <tr key={getId(r)} className="hover:bg-cream/60 transition-colors">
                    <td className="table-td font-mono text-xs text-navy-600">#{getId(r)}</td>
                    <td className="table-td text-sm font-medium">{getCust(r)}</td>
                    <td className="table-td text-sm">{getRoom(r)}</td>
                    <td className="table-td text-sm">{getIn(r)}</td>
                    <td className="table-td text-sm">{getOut(r)}</td>
                    <td className="table-td font-semibold text-navy-800">{getAmt(r).toLocaleString()}</td>
                    <td className="table-td"><StatusBadge status={mapStatus(r.status)}/></td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelected(r)}
                          className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-600 transition-colors" title="View">
                          <Eye size={15}/>
                        </button>
                        {r.status === 'Pending' && (
                          <button onClick={() => confirmReservation(getId(r))}
                            className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors" title="Confirm">
                            <Check size={15}/>
                          </button>
                        )}
                        {r.status === 'Confirmed' && (
                          <button onClick={() => checkoutReservation(getId(r))}
                            className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors" title="Check Out">
                            <LogOut size={15}/>
                          </button>
                        )}
                        {!['Cancelled', 'CheckedOut'].includes(r.status) && (
                          <button onClick={() => setCancelModal({ open: true, id: getId(r) })}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Cancel">
                            <X size={15}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          {!loading && paged.length === 0 && (
            <p className="text-center text-mid-gray py-10 text-sm">No reservations match your criteria.</p>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPage={setPage}/>

        {/* Detail Modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Reservation Details" maxWidth="max-w-lg">
          {selected && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Reservation ID', `#${getId(selected)}`],
                ['Status',         <StatusBadge status={mapStatus(selected.status)}/>],
                ['Customer',       getCust(selected)],
                ['Room',           getRoom(selected)],
                ['Check-in',       getIn(selected)],
                ['Check-out',      getOut(selected)],
                ['Total Amount',   `LKR ${getAmt(selected).toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-mid-gray">{k}</p>
                  <p className="font-medium text-dark-text">{v}</p>
                </div>
              ))}
            </div>
          )}
        </Modal>

        <ConfirmModal
          isOpen={cancelModal.open}
          onClose={() => setCancelModal({ open: false, id: null })}
          onConfirm={() => cancelReservation(cancelModal.id)}
          title="Cancel Reservation"
          message="Cancel this reservation? The guest will be notified."
          confirmLabel="Yes, Cancel"
          danger
        />
      </main>
    </div>
  );
}
