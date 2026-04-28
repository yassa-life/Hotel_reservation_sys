import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Shield, Check } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Breadcrumb } from '../components/shared/UI';
import { useToast } from '../context/AppContext';

const METHODS = [
  { id: 'card',   label: 'Credit / Debit Card' },
  { id: 'paypal', label: 'PayPal' },
];

function CardInput({ label, value, onChange, placeholder, type='text', maxLength, className='' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        maxLength={maxLength} className="input-field"/>
    </div>
  );
}

export default function PaymentPage() {
  const { state } = useLocation();
  const nav = useNavigate();
  const { addToast } = useToast();

  const [method, setMethod] = useState('card');
  const [card,   setCard]   = useState({ number:'', expiry:'', cvv:'', name:'' });
  const [billing, setBilling] = useState({ address:'', city:'', zip:'', country:'Sri Lanka' });
  const [loading, setLoading] = useState(false);

  const room    = state?.room;
  const nights  = state?.nights || 1;
  const subtotal = room ? room.price * nights : 0;
  const taxes    = Math.round(subtotal * 0.1);
  const fees     = 15;
  const total    = subtotal + taxes + fees;

  const formatCard = v => v.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19);
  const formatExpiry = v => v.replace(/\D/g,'').replace(/^(.{2})(.*)/, (_,a,b) => b ? `${a}/${b}` : a).slice(0,5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: API call to POST /api/payments
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    const ref = 'HRV-' + Math.random().toString(36).substr(2,8).toUpperCase();
    nav('/booking/confirmation', { state: { ...state, ref, total } });
  };

  if (!room) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="text-mid-gray">No booking data. <a href="/rooms" className="text-navy-700 underline">Browse rooms</a></p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <Breadcrumb items={[{label:'Home',href:'/'},{label:'Rooms',href:'/rooms'},{label:'Guest Details'},{label:'Payment'}]}/>
        <h1 className="section-title mb-8">Secure Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Method Selection */}
              <div className="card mb-6">
                <h2 className="font-display font-semibold text-navy-800 mb-4">Payment Method</h2>
                <div className="flex gap-3 flex-wrap">
                  {METHODS.map(m => (
                    <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-medium transition-all
                        ${method===m.id ? 'border-navy-700 bg-navy-50 text-navy-800' : 'border-light-gray text-mid-gray hover:border-navy-300'}`}>
                      <CreditCard size={16}/>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {method === 'card' && (
                <div className="card mb-6">
                  <h2 className="font-display font-semibold text-navy-800 mb-5">Card Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label">Card Number</label>
                      <div className="relative">
                        <input type="text" value={card.number} placeholder="1234 5678 9012 3456"
                          onChange={e => setCard(p=>({...p, number: formatCard(e.target.value)}))}
                          maxLength={19} className="input-field pl-11"/>
                        <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mid-gray"/>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Cardholder Name</label>
                      <input type="text" value={card.name} placeholder="John Doe"
                        onChange={e => setCard(p=>({...p, name: e.target.value}))}
                        className="input-field"/>
                    </div>
                    <div>
                      <label className="label">Expiry Date</label>
                      <input type="text" value={card.expiry} placeholder="MM/YY"
                        onChange={e => setCard(p=>({...p, expiry: formatExpiry(e.target.value)}))}
                        maxLength={5} className="input-field"/>
                    </div>
                    <div>
                      <label className="label">CVV</label>
                      <input type="password" value={card.cvv} placeholder="•••"
                        onChange={e => setCard(p=>({...p, cvv: e.target.value.replace(/\D/g,'').slice(0,4)}))}
                        className="input-field"/>
                    </div>
                  </div>
                </div>
              )}

              {method === 'paypal' && (
                <div className="card mb-6 text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-blue-700 text-lg">PP</span>
                  </div>
                  <p className="text-mid-gray text-sm">You will be redirected to PayPal to complete your payment.</p>
                </div>
              )}

              {/* Billing Address */}
              <div className="card mb-6">
                <h2 className="font-display font-semibold text-navy-800 mb-5">Billing Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Street Address</label>
                    <input value={billing.address} onChange={e=>setBilling(p=>({...p,address:e.target.value}))}
                      placeholder="123 Main Street" className="input-field"/>
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input value={billing.city} onChange={e=>setBilling(p=>({...p,city:e.target.value}))}
                      placeholder="Colombo" className="input-field"/>
                  </div>
                  <div>
                    <label className="label">ZIP / Postal Code</label>
                    <input value={billing.zip} onChange={e=>setBilling(p=>({...p,zip:e.target.value}))}
                      placeholder="00100" className="input-field"/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Country</label>
                    <select value={billing.country} onChange={e=>setBilling(p=>({...p,country:e.target.value}))} className="input-field">
                      {['Sri Lanka','United States','United Kingdom','India','Australia','Singapore','UAE'].map(c=>(
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                {[
                  { icon: Lock,   label: 'SSL Encrypted' },
                  { icon: Shield, label: 'Secure Payment' },
                  { icon: Check,  label: 'Best Rate Guarantee' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2">
                    <b.icon size={16} className="text-green-600"/>
                    <span className="text-xs font-medium text-green-700">{b.label}</span>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-4 text-base flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-navy-700 border-t-transparent rounded-full animate-spin"/>
                    Processing...
                  </>
                ) : (
                  <><Lock size={16}/> Complete Booking · ${total}</>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card sticky top-20">
              <h2 className="font-display font-semibold text-navy-800 mb-4">Order Summary</h2>
              <div className="h-36 bg-light-gray rounded-xl flex items-center justify-center mb-4 text-mid-gray text-sm">
                {room.name}
              </div>
              <h3 className="font-semibold text-dark-text text-sm">{room.name}</h3>
              <p className="text-xs text-mid-gray mb-1">{room.type} · Floor {room.floor}</p>

              <div className="mt-4 text-xs text-mid-gray space-y-1">
                <p>Check-in:  <span className="text-dark-text font-medium">{state?.checkIn}</span></p>
                <p>Check-out: <span className="text-dark-text font-medium">{state?.checkOut}</span></p>
                <p>Guests:    <span className="text-dark-text font-medium">{state?.guests}</span></p>
              </div>

              <hr className="my-4 border-light-gray"/>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mid-gray">Room · {nights} night{nights>1?'s':''}</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid-gray">Taxes (10%)</span>
                  <span>${taxes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid-gray">Service fee</span>
                  <span>${fees}</span>
                </div>
                <div className="flex justify-between font-bold text-dark-text border-t border-light-gray pt-3 mt-1">
                  <span>Total Due</span>
                  <span className="text-navy-800 text-xl">${total}</span>
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
