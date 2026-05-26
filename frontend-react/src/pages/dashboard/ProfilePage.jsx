import { useState, useEffect } from 'react';
import { User, Lock, Camera, Save } from 'lucide-react';
import UserSidebar from '../../components/layout/UserSidebar';
import { useAuth, useToast } from '../../context/AppContext';
import { customersApi } from '../../api/client';

export default function ProfilePage() {
  const { user, loginUser } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('info');
  const [saving, setSaving] = useState(false);

  // Split stored name into first/last for the form
  const nameParts = (user?.name || '').split(' ');
  const [info, setInfo] = useState({
    firstName: nameParts[0] || '',
    lastName:  nameParts.slice(1).join(' ') || '',
    email:     user?.email    || '',
    phone:     user?.phone    || '',
    address:   user?.address  || '',
  });

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  // Refresh form if user context changes (e.g. after login)
  useEffect(() => {
    if (!user) return;
    const parts = (user.name || '').split(' ');
    setInfo({
      firstName: parts[0] || '',
      lastName:  parts.slice(1).join(' ') || '',
      email:     user.email   || '',
      phone:     user.phone   || '',
      address:   user.address || '',
    });
  }, [user]);

  const setI = k => e => setInfo(p => ({ ...p, [k]: e.target.value }));
  const setP = k => e => setPwd(p => ({ ...p, [k]: e.target.value }));

  const saveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fullName = `${info.firstName} ${info.lastName}`.trim();
      const payload = {
        id:       user?.id ?? user?.customerId,
        name:     fullName,
        email:    info.email,
        phone:    info.phone,
        address:  info.address,
        password: user?.password || '', // keep existing password
      };
      await customersApi.update(payload);
      // Update local session with new name/phone/address
      loginUser({ ...user, name: fullName, email: info.email, phone: info.phone, address: info.address });
      addToast('Profile updated successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) { addToast('Passwords do not match.', 'error'); return; }
    if (pwd.next.length < 8) { addToast('Password must be at least 8 characters.', 'error'); return; }
    setSaving(true);
    try {
      // Verify current password by attempting login
      await customersApi.login(user.email, pwd.current);
      // Update with new password
      await customersApi.update({
        id:       user?.id ?? user?.customerId,
        name:     user.name,
        email:    user.email,
        phone:    user.phone   || '',
        address:  user.address || '',
        password: pwd.next,
      });
      addToast('Password changed successfully.', 'success');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      if (err.message?.includes('Invalid')) {
        addToast('Current password is incorrect.', 'error');
      } else {
        addToast(err.message || 'Failed to change password.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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
                  <span className="font-display font-bold text-white text-2xl">{initials}</span>
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center hover:bg-gold-400 transition-colors shadow-md">
                  <Camera size={13} className="text-navy-900"/>
                </button>
              </div>
              <div>
                <p className="font-display font-semibold text-dark-text text-lg">{user?.name || 'Guest'}</p>
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
                  <input value={info.firstName} onChange={setI('firstName')} className="input-field" required/>
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input value={info.lastName} onChange={setI('lastName')} className="input-field"/>
                </div>
                <div className="col-span-2">
                  <label className="label">Email Address</label>
                  <input type="email" value={info.email} onChange={setI('email')} className="input-field" required/>
                </div>
                <div className="col-span-2">
                  <label className="label">Phone</label>
                  <input value={info.phone} onChange={setI('phone')} className="input-field" placeholder="+94 77 000 0000"/>
                </div>
                <div className="col-span-2">
                  <label className="label">Address <span className="text-mid-gray font-normal">(optional)</span></label>
                  <input value={info.address} onChange={setI('address')} className="input-field" placeholder="Your address"/>
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  : <Save size={15}/>}
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
                <input type="password" value={pwd.current} onChange={setP('current')} placeholder="••••••••" className="input-field" required/>
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" value={pwd.next} onChange={setP('next')} placeholder="Min 8 characters" className="input-field" required/>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" value={pwd.confirm} onChange={setP('confirm')} placeholder="••••••••" className="input-field" required/>
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
                {saving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  : <Lock size={15}/>}
                Update Password
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
