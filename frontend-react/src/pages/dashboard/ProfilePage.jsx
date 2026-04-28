import { useState } from 'react';
import { User, Lock, Camera } from 'lucide-react';
import UserSidebar from '../../components/layout/UserSidebar';
import { useAuth, useToast } from '../../context/AppContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('info');
  const [info, setInfo] = useState({
    firstName: 'Sarah', lastName: 'Mitchell',
    email: user?.email || 'sarah.m@example.com',
    phone: '+1 555-0101', country: 'USA', bio: '',
  });
  const [pwd,  setPwd]  = useState({ current:'', next:'', confirm:'' });
  const [saving, setSaving] = useState(false);

  const setI = k => e => setInfo(p => ({ ...p, [k]: e.target.value }));
  const setP = k => e => setPwd(p => ({ ...p, [k]: e.target.value }));

  const saveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    addToast('Profile updated successfully.', 'success');
  };

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) { addToast('Passwords do not match.', 'error'); return; }
    if (pwd.next.length < 8) { addToast('Password must be at least 8 characters.', 'error'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    addToast('Password changed successfully.', 'success');
    setPwd({ current:'', next:'', confirm:'' });
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <UserSidebar/>
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">
        <div className="mb-8">
          <h1 className="section-title">My Profile</h1>
          <p className="text-mid-gray text-sm mt-1">Manage your personal information and account security</p>
        </div>

        <div className="max-w-2xl">
          {/* Avatar */}
          <div className="card mb-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-navy-800 flex items-center justify-center">
                  <span className="font-display font-bold text-white text-2xl">S</span>
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center hover:bg-gold-400 transition-colors shadow-md">
                  <Camera size={13} className="text-navy-900"/>
                </button>
              </div>
              <div>
                <p className="font-display font-semibold text-dark-text text-lg">Sarah Mitchell</p>
                <p className="text-sm text-mid-gray">{user?.email}</p>
                <span className="badge badge-confirmed text-xs mt-1">Verified Member</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[{id:'info', icon:User, label:'Personal Info'}, {id:'password', icon:Lock, label:'Change Password'}].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${tab===t.id ? 'bg-navy-800 text-white shadow-md' : 'bg-white border border-light-gray text-mid-gray hover:border-navy-400'}`}>
                <t.icon size={15}/>{t.label}
              </button>
            ))}
          </div>

          {/* Personal Info */}
          {tab === 'info' && (
            <form onSubmit={saveInfo} className="card space-y-5 animate-fade-in">
              <h2 className="font-display font-semibold text-navy-800">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input value={info.firstName} onChange={setI('firstName')} className="input-field"/>
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input value={info.lastName} onChange={setI('lastName')} className="input-field"/>
                </div>
                <div className="col-span-2">
                  <label className="label">Email Address</label>
                  <input type="email" value={info.email} onChange={setI('email')} className="input-field"/>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input value={info.phone} onChange={setI('phone')} className="input-field"/>
                </div>
                <div>
                  <label className="label">Country</label>
                  <select value={info.country} onChange={setI('country')} className="input-field">
                    {['USA','UK','Sri Lanka','India','Australia','Singapore','UAE'].map(c=>(
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Bio <span className="text-mid-gray font-normal">(optional)</span></label>
                  <textarea value={info.bio} onChange={setI('bio')} rows={3}
                    placeholder="Tell us a bit about yourself..."
                    className="input-field resize-none"/>
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : null}
                Save Changes
              </button>
            </form>
          )}

          {/* Change Password */}
          {tab === 'password' && (
            <form onSubmit={changePwd} className="card space-y-5 animate-fade-in">
              <h2 className="font-display font-semibold text-navy-800">Change Password</h2>
              <div>
                <label className="label">Current Password</label>
                <input type="password" value={pwd.current} onChange={setP('current')} placeholder="••••••••" className="input-field"/>
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" value={pwd.next} onChange={setP('next')} placeholder="Min 8 characters" className="input-field"/>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" value={pwd.confirm} onChange={setP('confirm')} placeholder="••••••••" className="input-field"/>
              </div>
              <div className="bg-cream rounded-xl p-4 border border-light-gray text-xs text-mid-gray space-y-1">
                <p>Password requirements:</p>
                <ul className="pl-3 space-y-0.5">
                  <li>• Minimum 8 characters</li>
                  <li>• At least one uppercase letter</li>
                  <li>• At least one number</li>
                </ul>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : null}
                Update Password
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
