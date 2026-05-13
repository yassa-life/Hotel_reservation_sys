import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, Search, Check, RefreshCw,
  Upload, X, ImageOff, Star, Images
} from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { StatusBadge, Modal, ConfirmModal } from '../../components/shared/UI';
import { roomsApi } from '../../api/client';
import { useToast } from '../../context/AppContext';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/hotel-system/api').replace(/\/$/, '');
const TOMCAT   = BASE_URL.replace('/api', '');

const BLANK = { roomNumber: '', type: 'Single', pricePerNight: '', status: 'Available', description: '' };

const getPrice  = r => r.pricePerNight  ?? r.price_per_night  ?? 0;
const getNumber = r => r.roomNumber     ?? r.room_number       ?? '';
const getId     = r => r.roomId         ?? r.room_id;
const absUrl    = (url) => url ? `${TOMCAT}${url}` : null;

const getPrimary = (room) => {
  const imgs = room.images ?? [];
  if (!imgs.length) return null;
  const primary = imgs.find(i => i.isPrimary || i.is_primary);
  return absUrl((primary ?? imgs[0]).imageUrl ?? (primary ?? imgs[0]).image_url);
};

/* ─── Room Thumbnail ──────────────────────────────────────────────────────── */
function RoomThumb({ room, className = '' }) {
  const [err, setErr] = useState(false);
  const src = getPrimary(room);
  if (!src || err) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 ${className}`}>
        <ImageOff size={28} className="mb-1 opacity-50" />
        <span className="text-xs font-medium">Room {getNumber(room)}</span>
      </div>
    );
  }
  return <img src={src} alt={`Room ${getNumber(room)}`} onError={() => setErr(true)} className={`object-cover ${className}`} />;
}

/* ─── Image Gallery Manager ──────────────────────────────────────────────── */
function ImageGallery({ roomId, initialImages = [], onImagesChange }) {
  const [images,     setImages]     = useState(initialImages);
  const [uploading,  setUploading]  = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const [tab,        setTab]        = useState('url');  // 'url' | 'upload'
  const [urlInput,   setUrlInput]   = useState('');
  const [urlPreview, setUrlPreview] = useState(null);
  const [urlError,   setUrlError]   = useState('');
  const inputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => { onImagesChange?.(images); }, [images]);

  /* ── File upload ── */
  const upload = useCallback(async (file) => {
    if (!roomId) { addToast('Save the room first before uploading images.', 'warning'); return; }
    if (!file?.type.startsWith('image/')) { addToast('Please select a valid image file.', 'error'); return; }
    setUploading(true);
    try {
      const result = await roomsApi.uploadImage(roomId, file);
      if (result.success) {
        setImages(prev => [...prev, result.image]);
        addToast('Image uploaded successfully.', 'success');
      }
    } catch (err) {
      addToast(`Upload failed: ${err?.message || 'Check Tomcat is running and uploads folder is writable.'}`, 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [roomId]);

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files[0]); };

  /* ── URL input ── */
  const handleUrlChange = (val) => {
    setUrlInput(val);
    setUrlError('');
    if (val.match(/^https?:\/\/.+/i) || val.startsWith('/uploads/')) {
      setUrlPreview(val);
    } else {
      setUrlPreview(null);
    }
  };

  const submitUrl = async () => {
    const url = urlInput.trim();
    if (!url) { setUrlError('Please enter an image URL.'); return; }
    if (!url.match(/^https?:\/\/.+/i) && !url.startsWith('/')) {
      setUrlError('Enter a full URL starting with http:// or https://');
      return;
    }
    if (!roomId) { addToast('Save the room first before adding images.', 'warning'); return; }
    setUploading(true);
    try {
      const result = await roomsApi.addImageByUrl(roomId, url);
      if (result.success) {
        setImages(prev => [...prev, result.image]);
        setUrlInput('');
        setUrlPreview(null);
        addToast('Image added successfully.', 'success');
      }
    } catch (err) {
      setUrlError(err?.message || 'Failed to save URL.');
    } finally {
      setUploading(false);
    }
  };

  /* ── Shared image actions ── */
  const makePrimary = async (img) => {
    if (!roomId) return;
    try {
      await roomsApi.setPrimary(img.imageId ?? img.image_id, roomId);
      setImages(prev => prev.map(i => ({ ...i, isPrimary: (i.imageId ?? i.image_id) === (img.imageId ?? img.image_id) })));
      addToast('Primary image updated.', 'success');
    } catch { addToast('Failed to set primary.', 'error'); }
  };

  const remove = async (img) => {
    if (!roomId) { setImages(prev => prev.filter(i => i !== img)); return; }
    try {
      await roomsApi.deleteImage(img.imageId ?? img.image_id);
      setImages(prev => prev.filter(i => (i.imageId ?? i.image_id) !== (img.imageId ?? img.image_id)));
      addToast('Image removed.', 'success');
    } catch { addToast('Failed to remove image.', 'error'); }
  };

  return (
    <div className="sm:col-span-2 space-y-3">
      {/* Header */}
      <label className="label flex items-center gap-2">
        <Images size={14} /> Room Images
        <span className="text-xs text-mid-gray font-normal">
          ({images.length} photo{images.length !== 1 ? 's' : ''} — ⭐ = primary thumbnail)
        </span>
      </label>

      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img) => {
            const url   = absUrl(img.imageUrl ?? img.image_url);
            const isPri = img.isPrimary || img.is_primary;
            const imgId = img.imageId ?? img.image_id;
            return (
              <div key={imgId}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all
                  ${isPri ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-transparent hover:border-navy-200'}`}>
                <img src={url} alt="Room" className="w-full h-20 object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }} />
                {isPri && (
                  <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star size={8} fill="currentColor" /> Primary
                  </div>
                )}
                <div className="absolute inset-0 bg-navy-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!isPri && (
                    <button onClick={() => makePrimary(img)} title="Set as primary"
                      className="bg-yellow-400 text-yellow-900 rounded-full p-1.5 hover:bg-yellow-300 transition-colors">
                      <Star size={11} fill="currentColor" />
                    </button>
                  )}
                  <button onClick={() => remove(img)} title="Remove"
                    className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors">
                    <X size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex rounded-xl overflow-hidden border border-light-gray text-xs font-medium">
        {[['url', '🔗 Paste URL'], ['upload', '📁 Upload File']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`flex-1 py-2 transition-colors
              ${tab === key ? 'bg-navy-800 text-white' : 'text-mid-gray hover:bg-light-gray'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* URL Tab */}
      {tab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={e => handleUrlChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitUrl()}
              placeholder="https://example.com/room-photo.jpg"
              className="input-field flex-1 text-sm"
            />
            <button type="button" onClick={submitUrl} disabled={uploading || !urlInput.trim()}
              className="btn-primary py-2 px-4 text-sm disabled:opacity-50 whitespace-nowrap">
              {uploading
                ? <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Adding…</span>
                : 'Add'}
            </button>
          </div>
          {urlError && <p className="text-xs text-red-500">{urlError}</p>}
          {urlPreview && (
            <div className="relative rounded-xl overflow-hidden border border-light-gray">
              <img src={urlPreview} alt="Preview" className="w-full h-32 object-cover"
                onError={() => { setUrlPreview(null); setUrlError('Could not load image from that URL.'); }} />
              <span className="absolute bottom-1 left-2 text-[10px] bg-navy-900/70 text-white px-2 py-0.5 rounded-full">Preview</span>
            </div>
          )}
          <p className="text-xs text-mid-gray">Paste any public image link — Google Images, Unsplash, Pexels, etc.</p>
        </div>
      )}

      {/* Upload Tab */}
      {tab === 'upload' && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 h-32 rounded-xl border-2 border-dashed
            cursor-pointer transition-colors select-none
            ${dragOver ? 'border-navy-500 bg-navy-50' : 'border-light-gray hover:border-navy-300 hover:bg-navy-50/40'}`}
        >
          {uploading
            ? <div className="w-7 h-7 border-2 border-navy-400 border-t-transparent rounded-full animate-spin" />
            : (<>
                <Upload size={22} className="text-mid-gray" />
                <span className="text-sm text-mid-gray font-medium">Click or drag &amp; drop</span>
                <span className="text-xs text-mid-gray">JPEG · PNG · WEBP · max 10 MB</span>
              </>)}
        </div>
      )}

      {!roomId && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⚠ Save the room details first — then you can add images.
        </p>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function AdminRoomsPage() {
  const { addToast } = useToast();
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState(BLANK);
  const [delId,   setDelId]   = useState(null);
  const [saving,  setSaving]  = useState(false);

  const [imgRoomId,   setImgRoomId]   = useState(null);
  const [imgRoomName, setImgRoomName] = useState('');

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
    [getNumber(r), r.type, r.description ?? ''].some(v =>
      v.toLowerCase().includes(search.toLowerCase())
    )
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
    setSaving(true);
    const payload = { ...form, pricePerNight: Number(form.pricePerNight) };
    try {
      if (editId) {
        await roomsApi.update({ ...payload, roomId: editId });
        setRooms(prev => prev.map(r => getId(r) === editId ? { ...r, ...payload } : r));
        addToast('Room updated.', 'success');
      } else {
        await roomsApi.create(payload);
        await load();
        addToast('Room added. Open Edit to add images.', 'success');
      }
      setAddOpen(false);
    } catch (err) {
      addToast(err?.message || 'Failed to save room.', 'error');
    } finally {
      setSaving(false);
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
      addToast(`Room ${getNumber(r)} → ${next}.`, 'success');
    } catch {
      addToast('Failed to update status.', 'error');
    }
  };

  const refreshRoom = async (roomId) => {
    try {
      const fresh = await roomsApi.getById(roomId);
      if (fresh) setRooms(prev => prev.map(r => getId(r) === roomId ? fresh : r));
    } catch {}
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Room Management</h1>
            <p className="text-mid-gray text-sm mt-1">{rooms.length} rooms total</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="btn-outline py-2 px-3">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Add Room
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search rooms..." className="input-field pl-9" />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="w-full h-44 bg-light-gray rounded-xl mb-4" />
                <div className="h-5 bg-light-gray rounded w-2/3 mb-2" />
                <div className="h-4 bg-light-gray rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(room => (
              <div key={getId(room)} className="card animate-fade-in overflow-hidden">
                {/* Thumbnail */}
                <div className="relative -mx-5 -mt-5 mb-4">
                  <RoomThumb room={room} className="w-full h-44" />
                  {(room.images?.length ?? 0) > 0 && (
                    <div className="absolute bottom-2 left-2 bg-navy-900/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Images size={11} /> {room.images.length} photo{room.images.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  <button
                    onClick={() => { setImgRoomId(getId(room)); setImgRoomName(`Room ${getNumber(room)}`); }}
                    className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1.5 text-xs font-medium
                               text-navy-700 shadow hover:bg-navy-50 transition-colors flex items-center gap-1"
                  >
                    <Upload size={12} /> Manage Images
                  </button>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="badge badge-confirmed text-xs mb-1 block w-fit">{room.type}</span>
                    <h3 className="font-display font-semibold text-dark-text">Room {getNumber(room)}</h3>
                  </div>
                  <StatusBadge status={room.status === 'Booked' ? 'Confirmed' : room.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 my-3 text-xs text-mid-gray">
                  <div><p className="font-medium text-dark-text">LKR {Number(getPrice(room)).toLocaleString()}</p><p>per night</p></div>
                  <div><p className="font-medium text-dark-text">{room.status}</p><p>status</p></div>
                </div>
                <p className="text-xs text-mid-gray line-clamp-2 mb-4">{room.description}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-light-gray">
                  <button onClick={() => openEdit(room)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-navy-700 hover:bg-navy-50 transition-colors">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => toggleStatus(room)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors">
                    <Check size={13} /> {room.status === 'Available' ? 'Set Maintenance' : 'Set Available'}
                  </button>
                  <button onClick={() => setDelId(getId(room))}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit Modal */}
        <Modal isOpen={addOpen} onClose={() => setAddOpen(false)}
          title={editId ? 'Edit Room' : 'Add New Room'} maxWidth="max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Room Number</label>
              <input value={form.roomNumber} onChange={setF('roomNumber')} placeholder="e.g. 101" className="input-field" />
            </div>
            <div>
              <label className="label">Room Type</label>
              <select value={form.type} onChange={setF('type')} className="input-field">
                {['Single', 'Double', 'Suite', 'Deluxe'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price per Night (LKR)</label>
              <input type="number" value={form.pricePerNight} onChange={setF('pricePerNight')} placeholder="8500" className="input-field" />
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
                placeholder="Room description..." className="input-field resize-none" />
            </div>

            {editId ? (
              <ImageGallery
                roomId={editId}
                initialImages={rooms.find(r => getId(r) === editId)?.images ?? []}
                onImagesChange={(imgs) =>
                  setRooms(prev => prev.map(r => getId(r) === editId ? { ...r, images: imgs } : r))
                }
              />
            ) : (
              <p className="sm:col-span-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠ Save the room first — then open <strong>Edit</strong> to add images.
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setAddOpen(false)} className="btn-outline py-2 px-5 text-sm" disabled={saving}>Cancel</button>
            <button onClick={saveRoom} className="btn-primary py-2 px-5 text-sm" disabled={saving}>
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </Modal>

        {/* Dedicated Image Management Modal */}
        <Modal isOpen={!!imgRoomId} onClose={() => { setImgRoomId(null); refreshRoom(imgRoomId); }}
          title={`Manage Images — ${imgRoomName}`} maxWidth="max-w-lg">
          <ImageGallery
            roomId={imgRoomId}
            initialImages={rooms.find(r => getId(r) === imgRoomId)?.images ?? []}
            onImagesChange={(imgs) =>
              setRooms(prev => prev.map(r => getId(r) === imgRoomId ? { ...r, images: imgs } : r))
            }
          />
          <div className="flex justify-end mt-6">
            <button onClick={() => { setImgRoomId(null); refreshRoom(imgRoomId); }} className="btn-primary py-2 px-5 text-sm">
              Done
            </button>
          </div>
        </Modal>

        {/* Confirm Delete */}
        <ConfirmModal
          isOpen={!!delId}
          onClose={() => setDelId(null)}
          onConfirm={() => deleteRoom(delId)}
          title="Delete Room"
          message="Permanently delete this room and all its images? This cannot be undone."
          confirmLabel="Delete"
          danger
        />
      </main>
    </div>
  );
}
