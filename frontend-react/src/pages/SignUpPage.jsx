import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth, useToast } from '../context/AppContext';
import { customersApi } from '../api/client';

export default function SignUpPage() {
  const nav = useNavigate();
  const { loginUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', password:'', confirm:'', agree: false,
  });
  const [countryCode, setCountryCode] = useState('+94');
  const [phoneNum, setPhoneNum] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';

    // Strict email check regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) e.email = 'Valid email required';

    // Strict phone number check regex (7 to 12 digits, ignoring spaces/dashes)
    const cleanPhone = phoneNum.replace(/[\s\-]/g, '');
    const phoneRegex = /^[0-9]{7,12}$/;
    if (!cleanPhone) {
      e.phone = 'Required';
    } else if (!phoneRegex.test(cleanPhone)) {
      e.phone = 'Valid phone number required (7 to 12 digits)';
    }

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
    try {
      const customer = await customersApi.register({
        name:     `${form.firstName} ${form.lastName}`,
        email:    form.email,
        password: form.password,
        phone:    `${countryCode} ${phoneNum}`,
        address:  '',
      });
      // Auto-login after successful registration
      loginUser(customer || { name: `${form.firstName} ${form.lastName}`, email: form.email });
      addToast('Account created! Welcome to Harborview.', 'success');
      nav('/dashboard');
    } catch (err) {
      addToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
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
              <div className="flex gap-2">
                <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
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
                  <input type="tel" value={phoneNum} onChange={e => setPhoneNum(e.target.value)} placeholder="77 123 4567"
                    className={`input-field pl-9 ${errors.phone?'input-error':''}`}/>
                </div>
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
