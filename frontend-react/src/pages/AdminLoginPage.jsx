import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth, useToast } from '../context/AppContext';
import { staffApi } from '../api/client';

export default function AdminLoginPage() {
  const nav = useNavigate();
  const { loginAdmin } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password) e.password = 'Password required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await staffApi.login(form.email, form.password);
      if (data?.success) {
        loginAdmin({ ...data.staff, email: form.email });
        addToast(`Welcome, ${data.staff?.name ?? 'Admin'}!`, 'success');
        nav('/admin/dashboard');
      } else {
        setErrors({ password: 'Invalid credentials. Check email and password.' });
      }
    } catch (err) {
      // Show error from server (e.g. HTTP 401) — do NOT fall back to demo mode
      setErrors({ password: err.message || 'Invalid credentials. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4"
         style={{ background: 'linear-gradient(135deg, #0f1e30 0%, #1e3a5f 100%)' }}>
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-500/20 border border-gold-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-gold-400"/>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-navy-300 text-sm mt-1">Harborview Grand Hotel — Admin Access Only</p>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5"/>
          <p className="text-amber-300 text-xs">
            Restricted area. Unauthorized access is prohibited and will be logged.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-200 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"/>
                <input type="email" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@hotel.com"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 pl-10 text-sm text-white
                             placeholder-navy-400 focus:outline-none focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20"/>
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-200 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400"/>
                <input type={show?'text':'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-white
                             placeholder-navy-400 focus:outline-none focus:border-gold-500/60 focus:ring-2 focus:ring-gold-500/20"/>
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-200">
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs text-navy-400">
              <p className="font-medium text-navy-300 mb-1">Default credentials:</p>
              <p>Email: <span className="text-navy-200">admin@hotel.com</span></p>
              <p>Password: <span className="text-navy-200">admin123</span></p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gold-500 text-navy-900 py-3.5 rounded-xl font-semibold text-sm
                         hover:bg-gold-400 transition-colors flex items-center justify-center gap-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-navy-700 border-t-transparent rounded-full animate-spin"/>
                : <><Lock size={15}/> Sign In</>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-navy-500 mt-6">
          All admin activity is monitored and logged.
        </p>
      </div>
    </div>
  );
}
