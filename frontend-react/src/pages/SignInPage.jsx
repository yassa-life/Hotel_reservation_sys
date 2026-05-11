import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth, useToast } from '../context/AppContext';
import { customersApi } from '../api/client';

export default function SignInPage() {
  const nav = useNavigate();
  const { loginUser } = useAuth();
  const { addToast } = useToast();
  const [form,    setForm]    = useState({ email:'', password:'', remember: false });
  const [show,    setShow]    = useState(false);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const customer = await customersApi.login(form.email, form.password);
      loginUser(customer);
      addToast(`Welcome back, ${customer.name}!`, 'success');
      nav('/dashboard');
    } catch (err) {
      setErrors({ password: err.message || 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-gold-500/10"/>
        <div className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-navy-700/50"/>
        <div className="relative">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-gold-500 rounded-xl flex items-center justify-center">
              <span className="font-display font-bold text-navy-900 text-lg">H</span>
            </div>
            <span className="font-display font-bold text-white text-2xl">Harborview<span className="text-gold-400">.</span></span>
          </Link>
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Welcome back to<br/>
            <span className="text-gold-400">luxury living</span>
          </h2>
          <p className="text-navy-300 leading-relaxed mb-8">
            Sign in to manage your reservations, access exclusive member rates, and enjoy a personalized experience.
          </p>
          <div className="space-y-4">
            {['Best Rate Guarantee', 'Priority Check-in', 'Exclusive Member Offers'].map(b => (
              <div key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gold-400"/>
                </div>
                <span className="text-navy-300 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
                <span className="text-gold-400 font-display font-bold text-sm">H</span>
              </div>
              <span className="font-display font-bold text-navy-800 text-xl">Harborview<span className="text-gold-500">.</span></span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-navy-800">Sign in to your account</h1>
            <p className="text-mid-gray text-sm mt-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-navy-700 font-semibold hover:underline">Create one</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mid-gray"/>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'input-error' : ''}`}/>
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label m-0">Password</label>
                <a href="#" className="text-xs text-navy-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mid-gray"/>
                <input type={show?'text':'password'} value={form.password} onChange={set('password')}
                  placeholder="••••••••"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}/>
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mid-gray hover:text-dark-text">
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.remember}
                onChange={e => setForm(p => ({...p, remember: e.target.checked}))}
                className="accent-navy-700 w-4 h-4 rounded"/>
              <span className="text-sm text-dark-text">Remember me for 30 days</span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : 'Sign In'}
            </button>

            <p className="text-center text-xs text-mid-gray">
              Don't have an account yet?{' '}
              <Link to="/signup" className="text-navy-700 font-semibold hover:underline">Sign up free</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
