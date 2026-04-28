import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Breadcrumb } from '../components/shared/UI';
import { useToast } from '../context/AppContext';

export default function BookingFormPage() {
  const { state } = useLocation();
  const nav = useNavigate();
  const { addToast } = useToast();
  const room = state?.room;

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    country: 'Sri Lanka', special: '',
  });
  const [errors, setErrors] = useState({});

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: API call to POST /api/bookings
    nav('/payment', { state: { room: state?.room, checkIn: state?.checkIn, checkOut: state?.checkOut, nights: state?.nights, guests: state?.guests, guest: form } });
  };

  if (!room) return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-navy-800 mb-2">No Room Selected</h2>
          <button onClick={()=>nav('/rooms')} className="btn-primary mt-4">Browse Rooms</button>
        </div>
      </div>
      <Footer/>
    </div>
  );

  const subtotal = room.price * (state?.nights || 1);
  const taxes    = Math.round(subtotal * 0.1);
  const total    = subtotal + taxes;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <Breadcrumb items={[{label:'Home',href:'/'},{label:'Rooms',href:'/rooms'},{label:'Guest Details'}]}/>
        <h1 className="section-title mb-8">Guest Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} noValidate>
              {/* Personal Info */}
              <div className="card mb-6">
                <h2 className="font-display font-semibold text-navy-800 mb-5">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key:'firstName', label:'First Name', type:'text',  placeholder:'John' },
                    { key:'lastName',  label:'Last Name',  type:'text',  placeholder:'Doe' },
                    { key:'email',     label:'Email Address', type:'email', placeholder:'john@example.com', span:true },
                    { key:'phone',     label:'Phone Number', type:'tel', placeholder:'+1 555 000 0000' },
                  ].map(f => (
                    <div key={f.key} className={f.span ? 'sm:col-span-2' : ''}>
                      <label className="label">{f.label}</label>
                      <input type={f.type} value={form[f.key]} onChange={set(f.key)}
                        placeholder={f.placeholder}
                        className={`input-field ${errors[f.key] ? 'input-error' : ''}`}/>
                      {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label className="label">Country</label>
                    <select value={form.country} onChange={set('country')} className="input-field">
                      {['Sri Lanka','United States','United Kingdom','India','Australia','Singapore','UAE'].map(c=>(
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="card mb-6">
                <h2 className="font-display font-semibold text-navy-800 mb-3">Special Requests</h2>
                <p className="text-xs text-mid-gray mb-3">Optional — we'll do our best to accommodate your requests.</p>
                <textarea value={form.special} onChange={set('special')} rows={4}
                  placeholder="e.g. Late check-in, high floor room, anniversary decoration..."
                  className="input-field resize-none"/>
              </div>

              {/* Policies */}
              <div className="card mb-6 bg-cream border border-light-gray shadow-none">
                <h3 className="font-semibold text-dark-text mb-3 text-sm">Booking Policies</h3>
                <ul className="text-xs text-mid-gray space-y-2">
                  <li>• Free cancellation up to 48 hours before check-in</li>
                  <li>• Check-in: 3:00 PM — Check-out: 12:00 PM</li>
                  <li>• Valid ID required at check-in</li>
                  <li>• Taxes and fees are included in the total</li>
                </ul>
              </div>

              <button type="submit" className="btn-gold w-full py-4 text-base">
                Continue to Payment
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div>
            <div className="card sticky top-20">
              <h2 className="font-display font-semibold text-navy-800 mb-4">Booking Summary</h2>
              <div className="h-40 bg-light-gray rounded-xl flex items-center justify-center mb-4">
                <span className="text-mid-gray text-sm">{room.name}</span>
              </div>
              <h3 className="font-semibold text-dark-text">{room.name}</h3>
              <p className="text-xs text-mid-gray mt-1 mb-4">{room.type} · {room.size}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mid-gray">Check-in</span>
                  <span className="font-medium">{state?.checkIn || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid-gray">Check-out</span>
                  <span className="font-medium">{state?.checkOut || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid-gray">Guests</span>
                  <span className="font-medium">{state?.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid-gray">Nights</span>
                  <span className="font-medium">{state?.nights}</span>
                </div>
              </div>

              <hr className="my-4 border-light-gray"/>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mid-gray">${room.price} × {state?.nights} night{state?.nights>1?'s':''}</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid-gray">Taxes & fees (10%)</span>
                  <span>${taxes}</span>
                </div>
                <div className="flex justify-between font-bold text-dark-text border-t border-light-gray pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-navy-800 text-lg">${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
