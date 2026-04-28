import { useState } from 'react';
import { Save } from 'lucide-react';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { useToast } from '../../context/AppContext';

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

  const [admins, setAdmins] = useState([
    { id:1, name:'John Admin', email:'john.admin@harborview.lk', role:'Super Admin', active:true },
    { id:2, name:'Mary Staff', email:'mary.staff@harborview.lk', role:'Manager',    active:true },
  ]);

  const save = (section) => {
    // TODO: API call to PUT /api/admin/settings/{section}
    addToast(`${section} settings saved successfully.`, 'success');
  };

  const setH = k => e => setHotel(p => ({...p,[k]:e.target.value}));
  const setP = k => e => setPolicy(p => ({...p,[k]:typeof p[k]==='boolean'?e.target.checked:e.target.value}));

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

          {/* Admin Users */}
          <Section title="Admin User Management">
            <div className="space-y-3 mb-5">
              {admins.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-light-gray bg-cream">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-200 flex items-center justify-center">
                      <span className="font-bold text-navy-800">{a.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-dark-text">{a.name}</p>
                      <p className="text-xs text-mid-gray">{a.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge badge-confirmed">{a.role}</span>
                    <button
                      onClick={() => setAdmins(prev => prev.map(x => x.id===a.id ? {...x,active:!x.active} : x))}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                        ${a.active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                      {a.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2">
              <Save size={15}/> Invite Admin User
            </button>
          </Section>
        </div>
      </main>
    </div>
  );
}
