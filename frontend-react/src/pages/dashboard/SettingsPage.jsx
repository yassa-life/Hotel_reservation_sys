import { useState } from 'react';
import { Bell, Globe, Shield, Trash2 } from 'lucide-react';
import UserSidebar from '../../components/layout/UserSidebar';
import { useToast } from '../../context/AppContext';

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} type="button"
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0
        ${checked ? 'bg-navy-700' : 'bg-light-gray'}`}>
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform
        ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}/>
    </button>
  );
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const [notifs, setNotifs] = useState({
    email: true, sms: false, promo: true, checkin: true,
  });
  const [prefs, setPrefs] = useState({
    currency: 'USD', language: 'English', timezone: 'Asia/Colombo',
  });

  const saveNotifs = () => addToast('Notification preferences saved.', 'success');
  const savePrefs  = () => addToast('Preferences saved.', 'success');

  return (
    <div className="flex min-h-screen bg-cream">
      <UserSidebar/>
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">
        <div className="mb-8">
          <h1 className="section-title">Settings</h1>
          <p className="text-mid-gray text-sm mt-1">Manage your account preferences</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Notifications */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-navy-100 flex items-center justify-center">
                <Bell size={18} className="text-navy-700"/>
              </div>
              <h2 className="font-display font-semibold text-navy-800">Notifications</h2>
            </div>
            <div className="space-y-4">
              {[
                { key:'email',   label:'Email Notifications', desc:'Receive booking confirmations and updates via email' },
                { key:'sms',     label:'SMS Alerts',          desc:'Get text messages for check-in reminders' },
                { key:'promo',   label:'Promotional Offers',  desc:'Receive exclusive deals and member benefits' },
                { key:'checkin', label:'Check-in Reminders',  desc:'Get reminders 24 hours before your check-in' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-dark-text">{n.label}</p>
                    <p className="text-xs text-mid-gray mt-0.5">{n.desc}</p>
                  </div>
                  <Toggle checked={notifs[n.key]} onChange={v => setNotifs(p => ({...p,[n.key]:v}))}/>
                </div>
              ))}
            </div>
            <button onClick={saveNotifs} className="btn-primary mt-5 py-2.5 px-5 text-sm">Save Preferences</button>
          </div>

          {/* Preferences */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-navy-100 flex items-center justify-center">
                <Globe size={18} className="text-navy-700"/>
              </div>
              <h2 className="font-display font-semibold text-navy-800">Preferences</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Currency</label>
                <select value={prefs.currency} onChange={e=>setPrefs(p=>({...p,currency:e.target.value}))} className="input-field">
                  {['USD','EUR','GBP','LKR','INR','AUD'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select value={prefs.language} onChange={e=>setPrefs(p=>({...p,language:e.target.value}))} className="input-field">
                  {['English','Sinhala','Tamil','French','German'].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Timezone</label>
                <select value={prefs.timezone} onChange={e=>setPrefs(p=>({...p,timezone:e.target.value}))} className="input-field">
                  {['Asia/Colombo','America/New_York','Europe/London','Asia/Kolkata','Australia/Sydney'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button onClick={savePrefs} className="btn-primary mt-5 py-2.5 px-5 text-sm">Save Preferences</button>
          </div>

          {/* Security */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-navy-100 flex items-center justify-center">
                <Shield size={18} className="text-navy-700"/>
              </div>
              <h2 className="font-display font-semibold text-navy-800">Security</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-xl border border-light-gray hover:border-navy-400 transition-colors text-sm font-medium text-dark-text">
                Enable Two-Factor Authentication
              </button>
              <button className="w-full text-left p-4 rounded-xl border border-light-gray hover:border-navy-400 transition-colors text-sm font-medium text-dark-text">
                View Active Sessions
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border border-red-200 bg-red-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600"/>
              </div>
              <h2 className="font-display font-semibold text-red-700">Danger Zone</h2>
            </div>
            <p className="text-sm text-red-600 mb-4">
              Deleting your account is permanent and cannot be undone. All your data will be removed.
            </p>
            <button className="btn-danger py-2.5 px-5 text-sm">Delete Account</button>
          </div>
        </div>
      </main>
    </div>
  );
}
