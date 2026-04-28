import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Check, RefreshCw } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { StatusBadge, Modal, ConfirmModal, PlaceholderImage } from '../../components/shared/UI';
import { roomsApi } from '../../api/client';
import { useToast } from '../../context/AppContext';

const BLANK = {
  roomNumber: '', type: 'Single', pricePerNight: '', status: 'Available', description: '',
};

// Map backend field names to display
const getPrice  = r => r.pricePerNight  ?? r.price_per_night  ?? 0;
const getNumber = r => r.roomNumber     ?? r.room_number       ?? '';
const getId     = r => r.roomId         ?? r.room_id;

export default function AdminRoomsPage() {
  const { addToast } = useToast();
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState(BLANK);
  const [delId,   setDelId]   = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await roomsApi.getAll();
      setRooms(Array.isArray(data) ? data : []);
    } catch {
      addToast('Could not load rooms from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = rooms.filter(r =>
    [getNumber(r), r.type, r.description ?? ''].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setForm(BLANK); setEditId(null); setAddOpen(true); };
  const openEdit = r => {
    setForm({
      roomNumber:    getNumber(r),
      type:          r.type,
      pricePerNight: getPrice(r),
      status:        r.status,
      description:   r.description ?? '',
      roomId:        getId(r),
    });
    setEditId(getId(r));
    setAddOpen(true);
  };

  const saveRoom = async () => {
    const payload = { ...form, pricePerNight: Number(form.pricePerNight) };
    try {
      if (editId) {
        await roomsApi.update({ ...payload, roomId: editId });
        setRooms(prev => prev.map(r => getId(r) === editId ? { ...r, ...payload } : r));
        addToast('Room updated successfully.', 'success');
      } else {
        await roomsApi.create(payload);
        await load(); // reload to get new ID from backend
        addToast('Room added successfully.', 'success');
      }
      setAddOpen(false);
    } catch {
      addToast('Failed to save room.', 'error');
    }
  };

  const deleteRoom = async (id) => {
    try {
      await roomsApi.delete(id);
      setRooms(prev => prev.filter(r => getId(r) !== id));
      addToast('Room deleted.', 'success');
    } catch {
      addToast('Failed to delete room.', 'error');
    }
  };

  const toggleStatus = async (r) => {
    const next = r.status === 'Available' ? 'Maintenance' : 'Available';
    try {
      await roomsApi.update({ ...r, [r.roomId ? 'roomId' : 'room_id']: getId(r), status: next, pricePerNight: getPrice(r), roomNumber: getNumber(r) });
      setRooms(prev => prev.map(x => getId(x) === getId(r) ? { ...x, status: next } : x));
      addToast(`Room ${getNumber(r)} status → ${next}.`, 'success');
    } catch {
      addToast('Failed to update status.', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar/>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Room Management</h1>
            <p className="text-mid-gray text-sm mt-1">{rooms.length} rooms total</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn-outline py-2 px-3">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>
            </button>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2">
              <Plus size={16}/> Add Room
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rooms..."
            className="input-field pl-9"/>
        </div>

        {/* Grid */}
        {loading
          ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-full h-40 bg-light-gray rounded-xl mb-4"/>
                  <div className="h-5 bg-light-gray rounded w-2/3 mb-2"/>
                  <div className="h-4 bg-light-gray rounded w-1/2"/>
                </div>
              ))}
            </div>
          )
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(room => (
                <div key={getId(room)} className="card animate-fade-in">
                  <PlaceholderImage label={`Room ${getNumber(room)}`} className="w-full h-40 rounded-xl mb-4"/>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="badge badge-confirmed text-xs mb-1 block w-fit">{room.type}</span>
                      <h3 className="font-display font-semibold text-dark-text">Room {getNumber(room)}</h3>
                    </div>
                    <StatusBadge status={room.status === 'Booked' ? 'Confirmed' : room.status}/>
                  </div>
                  <div className="grid grid-cols-2 gap-2 my-3 text-xs text-mid-gray">
                    <div><p className="font-medium text-dark-text">LKR {Number(getPrice(room)).toLocaleString()}</p><p>per night</p></div>
                    <div><p className="font-medium text-dark-text">{room.status}</p><p>status</p></div>
                  </div>
                  <p className="text-xs text-mid-gray line-clamp-2 mb-4">{room.description}</p>
                  <div className="flex items-center gap-2 pt-3 border-t border-light-gray">
                    <button onClick={() => openEdit(room)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-navy-700 hover:bg-navy-50 transition-colors">
                      <Edit2 size={13}/> Edit
                    </button>
                    <button onClick={() => toggleStatus(room)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors">
                      <Check size={13}/> {room.status === 'Available' ? 'Set Maintenance' : 'Set Available'}
                    </button>
                    <button onClick={() => setDelId(getId(room))}
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={13}/> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {/* Add / Edit Modal */}
        <Modal isOpen={addOpen} onClose={() => setAddOpen(false)}
          title={editId ? 'Edit Room' : 'Add New Room'} maxWidth="max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Room Number</label>
              <input value={form.roomNumber} onChange={setF('roomNumber')} placeholder="e.g. 101" className="input-field"/>
            </div>
            <div>
              <label className="label">Room Type</label>
              <select value={form.type} onChange={setF('type')} className="input-field">
                {['Single', 'Double', 'Suite', 'Deluxe'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price per Night (LKR)</label>
              <input type="number" value={form.pricePerNight} onChange={setF('pricePerNight')} placeholder="8500" className="input-field"/>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={setF('status')} className="input-field">
                {['Available', 'Booked', 'Maintenance'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={setF('description')} rows={3}
                placeholder="Room description..." className="input-field resize-none"/>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setAddOpen(false)} className="btn-outline py-2 px-5 text-sm">Cancel</button>
            <button onClick={saveRoom} className="btn-primary py-2 px-5 text-sm">
              {editId ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!delId}
          onClose={() => setDelId(null)}
          onConfirm={() => deleteRoom(delId)}
          title="Delete Room"
          message="Permanently delete this room? This cannot be undone."
          confirmLabel="Delete"
          danger
        />
      </main>
    </div>
  );
}
