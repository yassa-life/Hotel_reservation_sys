import { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { Modal, Pagination } from '../../components/shared/UI';
import { customersApi, reservationsApi } from '../../api/client';
import { useToast } from '../../context/AppContext';

const PER_PAGE = 8;

export default function AdminCustomersPage() {
  const { addToast } = useToast();
  const [customers,     setCustomers]     = useState([]);
  const [reservations,  setReservations]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [page,          setPage]          = useState(1);
  const [selected,      setSelected]      = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [custs, res] = await Promise.all([
        customersApi.getAll(),
        reservationsApi.getAll().catch(() => []),
      ]);
      setCustomers(Array.isArray(custs) ? custs : []);
      setReservations(Array.isArray(res) ? res : []);
    } catch {
      addToast('Could not load customers from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getId    = c => c.customerId  ?? c.customer_id;
  const getName  = c => c.name;
  const getEmail = c => c.email;
  const getPhone = c => c.phone ?? '—';
  const getAddr  = c => c.address ?? '—';

  const custBookings = (id) =>
    reservations.filter(r => (r.customerId ?? r.customer_id) === id);

  const filtered = customers.filter(c =>
    [getName(c), getEmail(c), getPhone(c)].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const mapStatus = s => s === 'CheckedOut' ? 'Checked-out' : (s ?? 'Pending');

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar/>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Customer Management</h1>
            <p className="text-mid-gray text-sm mt-1">{customers.length} registered customers</p>
          </div>
          <button onClick={load} className="btn-outline py-2 px-3">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or phone..."
            className="input-field pl-9"/>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Customer', 'Phone', 'Address', 'Reservations', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="table-td">
                        <div className="h-4 w-20 bg-light-gray rounded animate-pulse"/>
                      </td>
                    ))}
                  </tr>
                ))
                : paged.map(c => (
                  <tr key={getId(c)} className="hover:bg-cream/60 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-navy-200 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-navy-800 text-sm">{getName(c).charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-dark-text">{getName(c)}</p>
                          <p className="text-xs text-mid-gray">{getEmail(c)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-sm">{getPhone(c)}</td>
                    <td className="table-td text-sm text-mid-gray max-w-[140px] truncate">{getAddr(c)}</td>
                    <td className="table-td text-sm font-medium">{custBookings(getId(c)).length}</td>
                    <td className="table-td text-sm text-mid-gray">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : (c.created_at?.split(' ')[0] ?? '—')}
                    </td>
                    <td className="table-td">
                      <button onClick={() => setSelected(c)}
                        className="p-1.5 rounded-lg hover:bg-navy-100 text-navy-600 transition-colors">
                        <Eye size={15}/>
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          {!loading && paged.length === 0 && (
            <p className="text-center text-mid-gray py-10 text-sm">No customers found.</p>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPage={setPage}/>

        {/* Detail Modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Customer Profile" maxWidth="max-w-lg">
          {selected && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-navy-200 flex items-center justify-center">
                  <span className="font-display font-bold text-navy-800 text-2xl">{getName(selected).charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-dark-text text-lg">{getName(selected)}</h3>
                  <p className="text-sm text-mid-gray">{getEmail(selected)}</p>
                  <p className="text-xs text-mid-gray">{getPhone(selected)} · {getAddr(selected)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Customer ID',  val: `#${getId(selected)}` },
                  { label: 'Reservations', val: custBookings(getId(selected)).length },
                ].map(s => (
                  <div key={s.label} className="bg-cream rounded-xl p-3 text-center border border-light-gray">
                    <p className="font-display font-bold text-navy-800 text-xl">{s.val}</p>
                    <p className="text-xs text-mid-gray mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <h4 className="font-semibold text-dark-text text-sm mb-3">Reservation History</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {custBookings(getId(selected)).length > 0
                  ? custBookings(getId(selected)).map(r => (
                    <div key={r.reservationId ?? r.reservation_id}
                      className="flex items-center justify-between p-3 bg-cream rounded-xl border border-light-gray">
                      <div>
                        <p className="text-xs font-mono text-navy-600">#{r.reservationId ?? r.reservation_id}</p>
                        <p className="text-xs text-mid-gray">{r.checkInDate ?? r.check_in_date} → {r.checkOutDate ?? r.check_out_date}</p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-confirmed text-xs">{mapStatus(r.status)}</span>
                        <p className="text-sm font-bold text-navy-800 mt-1">
                          LKR {Number(r.totalAmount ?? r.total_amount ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                  : <p className="text-sm text-mid-gray text-center py-4">No reservations found.</p>
                }
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
