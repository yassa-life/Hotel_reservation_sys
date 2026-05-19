import { useState, useEffect } from 'react';
import { Save, Plus, Edit2, Trash2, Phone } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { useToast } from '../../context/AppContext';
import { staffApi } from '../../api/client';
import { Modal, ConfirmModal } from '../../components/shared/UI';

function Section({ title, children }) {
  return (
    <div className="card mb-6">
      <h2 className="font-display font-semibold text-navy-800 mb-5 pb-3 border-b border-light-gray">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { addToast } = useToast();

  const [hotel, setHotel] = useState({
    name: 'Harborview Grand Hotel',
    tagline: 'Where Luxury Meets the Sea',
    address: '1 Harborview Boulevard, Colombo 03',
    phone: '+94 11 234 5678',
    email: 'info@harborviewhotel.lk',
    website: 'www.harborviewhotel.lk',
    checkIn: '15:00',
    checkOut: '12:00',
  });

  const [policy, setPolicy] = useState({
    freeCancellation: '48',
    depositRequired: true,
    depositPercent: '30',
    minNights: '1',
    maxNights: '30',
  });

  // Real staff states
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffEditId, setStaffEditId] = useState(null);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '', role: 'Admin', originalPassword: '' });
  const [staffCountryCode, setStaffCountryCode] = useState('+94');
  const [staffPhoneNum, setStaffPhoneNum] = useState('');
  const [staffDelId, setStaffDelId] = useState(null);
  const [savingStaff, setSavingStaff] = useState(false);

  const parsePhone = (p) => {
    const raw = (p || '').trim();
    const codes = ['+94', '+1', '+44', '+91', '+61', '+65', '+34', '+39'];
    for (const code of codes) {
      if (raw.startsWith(code)) {
        return { countryCode: code, phoneNum: raw.slice(code.length).trim() };
      }
    }
    return { countryCode: '+94', phoneNum: raw };
  };

  const getStaffId = s => s.id ?? s.staffId ?? s.staff_id;

  const loadStaff = async () => {
    setStaffLoading(true);
    try {
      const data = await staffApi.getAll();
      setStaff(Array.isArray(data) ? data : []);
    } catch {
      addToast('Failed to load staff list.', 'error');
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const openAddStaff = () => {
    setStaffForm({ name: '', email: '', password: '', role: 'Admin', originalPassword: '' });
    setStaffCountryCode('+94');
    setStaffPhoneNum('');
    setStaffEditId(null);
    setStaffModalOpen(true);
  };

  const openEditStaff = (member) => {
    const id = getStaffId(member);
    setStaffForm({
      name: member.name || '',
      email: member.email || '',
      password: '', // leave empty if not changing
      role: member.role || 'Admin',
      originalPassword: member.password || '',
    });
    const parsed = parsePhone(member.phone);
    setStaffCountryCode(parsed.countryCode);
    setStaffPhoneNum(parsed.phoneNum);
    setStaffEditId(id);
    setStaffModalOpen(true);
  };

  const saveStaff = async () => {
    if (!staffForm.name.trim() || !staffForm.email.trim()) {
      addToast('Name and email are required.', 'error');
      return;
    }

    // Strict email check regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(staffForm.email)) {
      addToast('Valid email required.', 'error');
      return;
    }

    // Phone validation
    const cleanPhone = staffPhoneNum.replace(/[\s\-]/g, '');
    const phoneRegex = /^[0-9]{7,12}$/;
    if (!cleanPhone) {
      addToast('Phone number is required.', 'error');
      return;
    } else if (!phoneRegex.test(cleanPhone)) {
      addToast('Valid phone number required (7 to 12 digits).', 'error');
      return;
    }

    if (!staffEditId && !staffForm.password.trim()) {
      addToast('Password is required for new staff members.', 'error');
      return;
    }

    setSavingStaff(true);
    try {
      const payload = {
        name: staffForm.name,
        email: staffForm.email,
        password: staffForm.password.trim() || staffForm.originalPassword,
        role: staffForm.role,
        phone: `${staffCountryCode} ${staffPhoneNum}`,
      };
      if (staffEditId) {
        await staffApi.update({ ...payload, id: staffEditId, staffId: staffEditId });
        addToast('Staff member updated.', 'success');
      } else {
        await staffApi.create(payload);
        addToast('Staff member added.', 'success');
      }
      setStaffModalOpen(false);
      loadStaff();
    } catch (err) {
      addToast(err?.message || 'Failed to save staff member.', 'error');
    } finally {
      setSavingStaff(false);
    }
  };

  const deleteStaff = async (id) => {
    try {
      await staffApi.delete(id);
      addToast('Staff member deleted.', 'success');
      setStaffDelId(null);
      loadStaff();
    } catch {
      addToast('Failed to delete staff member.', 'error');
    }
  };

  const save = (section) => {
    addToast(`${section} settings saved successfully.`, 'success');
  };

  const setH = k => e => setHotel(p => ({...p,[k]:e.target.value}));
  const setP = k => e => setPolicy(p => ({...p,[k]:typeof p[k]==='boolean'?e.target.checked:e.target.value}));
  const setSF = k => e => setStaffForm(p => ({...p,[k]:e.target.value}));

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar/>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="section-title">Settings</h1>
          <p className="text-mid-gray text-sm mt-1">Configure hotel and system settings</p>
        </div>

        <div className="max-w-3xl">
          {/* Hotel Information */}
          <Section title="Hotel Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Hotel Name</label>
                <input value={hotel.name} onChange={setH('name')} className="input-field"/>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Tagline</label>
                <input value={hotel.tagline} onChange={setH('tagline')} className="input-field"/>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <input value={hotel.address} onChange={setH('address')} className="input-field"/>
              </div>
              <div>
                <label className="label">Phone</label>
                <input value={hotel.phone} onChange={setH('phone')} className="input-field"/>
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={hotel.email} onChange={setH('email')} className="input-field"/>
              </div>
              <div>
                <label className="label">Website</label>
                <input value={hotel.website} onChange={setH('website')} className="input-field"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Check-in Time</label>
                  <input type="time" value={hotel.checkIn} onChange={setH('checkIn')} className="input-field"/>
                </div>
                <div>
                  <label className="label">Check-out Time</label>
                  <input type="time" value={hotel.checkOut} onChange={setH('checkOut')} className="input-field"/>
                </div>
              </div>
            </div>
            <button onClick={() => save('Hotel')} className="btn-primary mt-5 flex items-center gap-2">
              <Save size={15}/> Save Hotel Info
            </button>
          </Section>

          {/* Cancellation Policy */}
          <Section title="Booking & Cancellation Policy">
            <div className="space-y-4">
              <div>
                <label className="label">Free Cancellation Window (hours before check-in)</label>
                <input type="number" value={policy.freeCancellation} onChange={setP('freeCancellation')}
                  min={0} className="input-field max-w-xs"/>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={policy.depositRequired} onChange={setP('depositRequired')}
                  className="accent-navy-700 w-4 h-4"/>
                <span className="text-sm font-medium text-dark-text">Require deposit at booking</span>
              </label>
              {policy.depositRequired && (
                <div>
                  <label className="label">Deposit Percentage (%)</label>
                  <input type="number" value={policy.depositPercent} onChange={setP('depositPercent')}
                    min={0} max={100} className="input-field max-w-xs"/>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div>
                  <label className="label">Min Nights</label>
                  <input type="number" value={policy.minNights} onChange={setP('minNights')} min={1} className="input-field"/>
                </div>
                <div>
                  <label className="label">Max Nights</label>
                  <input type="number" value={policy.maxNights} onChange={setP('maxNights')} min={1} className="input-field"/>
                </div>
              </div>
            </div>
            <button onClick={() => save('Policy')} className="btn-primary mt-5 flex items-center gap-2">
              <Save size={15}/> Save Policy
            </button>
          </Section>

          {/* Real Admin Users Management */}
          <Section title="Staff & Admin Management">
            {staffLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-navy-800 border-t-transparent rounded-full animate-spin"/>
              </div>
            ) : staff.length === 0 ? (
              <p className="text-sm text-mid-gray mb-5">No staff members found.</p>
            ) : (
              <div className="space-y-3 mb-5">
                {staff.map(a => {
                  const sId = getStaffId(a);
                  return (
                    <div key={sId} className="flex items-center justify-between p-4 rounded-xl border border-light-gray bg-cream">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-navy-200 flex items-center justify-center">
                          <span className="font-bold text-navy-800">{a.name?.charAt(0).toUpperCase() || 'S'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-dark-text">{a.name}</p>
                          <p className="text-xs text-mid-gray">{a.email} • {a.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-confirmed text-xs">{a.role}</span>
                        <button
                          onClick={() => openEditStaff(a)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 transition-colors"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setStaffDelId(sId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={openAddStaff} className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
              <Plus size={15}/> Add Staff Member
            </button>
          </Section>
        </div>

        {/* Add/Edit Staff Modal */}
        <Modal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)}
          title={staffEditId ? 'Edit Staff Member' : 'Add Staff Member'} maxWidth="max-w-md">
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input value={staffForm.name} onChange={setSF('name')} placeholder="e.g. John Doe" className="input-field" />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={staffForm.email} onChange={setSF('email')} placeholder="e.g. john@harborviewhotel.lk" className="input-field" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div className="flex gap-2">
                <select value={staffCountryCode} onChange={e => setStaffCountryCode(e.target.value)}
                  className="input-field max-w-[100px] text-sm bg-white">
                  <option value="+94">+94 (SL)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+65">+65 (SG)</option>
                  <option value="+34">+34 (ES)</option>
                  <option value="+39">+39 (IT)</option>
                </select>
                <div className="relative flex-1">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
                  <input type="tel" value={staffPhoneNum} onChange={e => setStaffPhoneNum(e.target.value)} placeholder="77 123 4567"
                    className="input-field pl-9" />
                </div>
              </div>
            </div>
            <div>
              <label className="label">Role</label>
              <select value={staffForm.role} onChange={setSF('role')} className="input-field">
                {['Admin', 'Receptionist', 'Manager'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{staffEditId ? 'Password (leave blank to keep current)' : 'Password'}</label>
              <input type="password" value={staffForm.password} onChange={setSF('password')} placeholder="••••••••" className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setStaffModalOpen(false)} className="btn-outline py-2 px-5 text-sm" disabled={savingStaff}>Cancel</button>
            <button onClick={saveStaff} className="btn-primary py-2 px-5 text-sm" disabled={savingStaff}>
              {savingStaff ? 'Saving…' : staffEditId ? 'Save Changes' : 'Add Staff'}
            </button>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!staffDelId}
          onClose={() => setStaffDelId(null)}
          onConfirm={() => deleteStaff(staffDelId)}
          title="Delete Staff Member"
          message="Are you sure you want to permanently delete this staff member? This action cannot be undone."
          confirmLabel="Delete"
          danger
        />
      </main>
    </div>
  );
}
