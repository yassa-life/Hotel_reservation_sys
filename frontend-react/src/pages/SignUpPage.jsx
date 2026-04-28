import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth, useToast } from '../context/AppContext';

export default function SignUpPage() {
  const nav = useNavigate();
  const { loginUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'', password:'', confirm:'', agree: false,
  });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim())     e.phone     = 'Required';
    if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!form.agree) e.agree = 'You must accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // TODO: API call to POST /api/auth/register
    await new Promise(r => setTimeout(r, 1000));
    loginUser({ name: `${form.firstName} ${form.lastName}`, email: form.email });
    addToast('Account created! Welcome to Harborview.', 'success');
    nav('/dashboard');
    setLoading(false);
  };

  const strength = () => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const s = strength();

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
            Start your luxury<br/>
            <span className="text-gold-400">journey today</span>
          </h2>
          <p className="text-navy-300 leading-relaxed mb-8">
            Join thousands of guests who enjoy exclusive member benefits, personalized service, and the finest accommodations.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-navy-800 rounded-lg flex items-center justify-center">
                <span className="text-gold-400 font-display font-bold text-sm">H</span>
              </div>
              <span className="font-display font-bold text-navy-800 text-xl">Harborview<span className="text-gold-500">.</span></span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-navy-800">Create your account</h1>
            <p className="text-mid-gray text-sm mt-2">
              Already have an account?{' '}
              <Link to="/signin" className="text-navy-700 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Google */}
            <button type="button"
              className="w-full flex items-center justify-center gap-3 border border-light-gray rounded-xl py-3 text-sm font-medium text-dark-text hover:bg-light-gray transition-colors">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.1 0 5.6 1.1 7.6 2.9l5.6-5.6C33.5 3.5 29 1.5 24 1.5 14.7 1.5 6.8 7.2 3.3 15.3l6.6 5.1C11.5 14 17.3 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
                <path fill="#FBBC05" d="M9.9 28.6C9.3 26.9 9 25.1 9 23.3s.3-3.6.9-5.3L3.3 12.9A22.7 22.7 0 001.5 23.3c0 3.7.9 7.2 2.4 10.3l6-5z"/>
                <path fill="#34A853" d="M24 46.5c5.4 0 10-1.8 13.3-4.9l-7.4-5.7c-1.8 1.2-4 1.9-5.9 1.9-6.7 0-12.5-4.5-14.1-10.9l-6.6 5.1C6.8 39.8 14.7 46.5 24 46.5z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-light-gray"/>
              <span className="text-xs text-mid-gray">or register with email</span>
              <div className="flex-1 h-px bg-light-gray"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
                  <input value={form.firstName} onChange={set('firstName')} placeholder="John"
                    className={`input-field pl-9 ${errors.firstName?'input-error':''}`}/>
                </div>
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input value={form.lastName} onChange={set('lastName')} placeholder="Doe"
                  className={`input-field ${errors.lastName?'input-error':''}`}/>
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
                  className={`input-field pl-9 ${errors.email?'input-error':''}`}/>
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+94 77 000 0000"
                  className={`input-field pl-9 ${errors.phone?'input-error':''}`}/>
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
                <input type={show?'text':'password'} value={form.password} onChange={set('password')}
                  placeholder="Min 8 characters"
                  className={`input-field pl-9 pr-10 ${errors.password?'input-error':''}`}/>
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mid-gray">
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < s ? strengthColors[s-1] : 'bg-light-gray'}`}/>
                    ))}
                  </div>
                  <p className="text-xs text-mid-gray mt-1">Password strength: <span className="font-medium">{strengthLabels[s-1] || 'Enter password'}</span></p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="••••••••"
                className={`input-field ${errors.confirm?'input-error':''}`}/>
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={form.agree}
                onChange={e => setForm(p => ({...p, agree: e.target.checked}))}
                className="accent-navy-700 w-4 h-4 mt-0.5 rounded flex-shrink-0"/>
              <span className="text-xs text-mid-gray">
                I agree to the{' '}
                <a href="#" className="text-navy-700 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-navy-700 hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.agree && <p className="text-xs text-red-500">{errors.agree}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
