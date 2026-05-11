import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Shield, Check } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Breadcrumb } from '../components/shared/UI';
import { useToast, useAuth } from '../context/AppContext';
import { reservationsApi, paymentsApi } from '../api/client';

const METHODS = [
  { id: 'Card',   label: 'Credit / Debit Card' },
  { id: 'Online', label: 'Online Transfer' },
  { id: 'Cash',   label: 'Cash on Arrival' },
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
  const { user } = useAuth();

  const [method,  setMethod]  = useState('Card');
  const [card,    setCard]    = useState({ number:'', expiry:'', cvv:'', name:'' });
  const [billing, setBilling] = useState({ address:'', city:'', zip:'', country:'Sri Lanka' });
  const [loading, setLoading] = useState(false);

  const room    = state?.room;
  const nights  = state?.nights || 1;
  const price   = room ? Number(room.pricePerNight ?? room.price_per_night ?? room.price ?? 0) : 0;
  const subtotal = price * nights;
  const taxes    = Math.round(subtotal * 0.1);
  const total    = subtotal + taxes;

  const formatCard   = v => v.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19);
  const formatExpiry = v => v.replace(/\D/g,'').replace(/^(.{2})(.*)/, (_,a,b) => b ? `${a}/${b}` : a).slice(0,5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (method === 'Card' && (!card.number || !card.expiry || !card.cvv || !card.name)) {
      addToast('Please fill in all card details.', 'error');
      return;
    }
    setLoading(true);

    try {
      // Resolve the logged-in customer's ID from the session object
      const customerId = user?.customerId ?? user?.id;
      if (!customerId) throw new Error('You must be logged in to complete a booking.');

      const roomId = room.roomId ?? room.room_id ?? room.id;
      if (!roomId) throw new Error('Invalid room data. Please go back and select a room.');

      // 1. Create the reservation
      const resResult = await reservationsApi.create({
        customerId:    customerId,
        roomId:        roomId,
        checkInDate:   state.checkIn,
        checkOutDate:  state.checkOut,
        status:        'Confirmed',
        totalAmount:   total,
      });

      // 2. Create the payment record (best-effort — don't block booking if it fails)
      try {
        await paymentsApi.create({
          reservationId: resResult?.reservationId ?? null,
          amount:        total,
          paymentMethod: method,
          status:        method === 'Cash' ? 'Pending' : 'Paid',
        });
      } catch {
        // Payment record creation failure is non-critical
      }

      const ref = 'HRV-' + Math.random().toString(36).substr(2,8).toUpperCase();
      addToast('Booking confirmed! See you soon.', 'success');
      nav('/booking/confirmation', { state: { ...state, ref, total } });
    } catch (err) {
      addToast(err.message || 'Failed to complete booking. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
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

              {method === 'Card' && (
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

              {method === 'Online' && (
                <div className="card mb-6 text-center py-10">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-blue-700 text-lg">OT</span>
                  </div>
                  <p className="text-mid-gray text-sm">You will receive bank transfer details after confirmation.</p>
                </div>
              )}

              {method === 'Cash' && (
                <div className="card mb-6 text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-green-600"/>
                  </div>
                  <p className="text-mid-gray text-sm">Payment will be collected at check-in. Your booking will be confirmed immediately.</p>
                </div>
              )}

              {/* Billing Address (only for card) */}
              {method === 'Card' && (
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
                  </div>
                </div>
              )}

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
                  <><Lock size={16}/> Complete Booking · LKR {total.toLocaleString()}</>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card sticky top-20">
              <h2 className="font-display font-semibold text-navy-800 mb-4">Order Summary</h2>
              <div className="h-36 bg-light-gray rounded-xl flex items-center justify-center mb-4 text-mid-gray text-sm">
                {room.name ?? `Room #${room.roomNumber ?? room.room_number}`}
              </div>
              <h3 className="font-semibold text-dark-text text-sm">
                {room.name ?? `Room ${room.roomNumber ?? room.room_number}`}
              </h3>
              <p className="text-xs text-mid-gray mb-1">{room.type}</p>

              <div className="mt-4 text-xs text-mid-gray space-y-1">
                <p>Check-in:  <span className="text-dark-text font-medium">{state?.checkIn}</span></p>
                <p>Check-out: <span className="text-dark-text font-medium">{state?.checkOut}</span></p>
                <p>Guests:    <span className="text-dark-text font-medium">{state?.guests}</span></p>
              </div>

              <hr className="my-4 border-light-gray"/>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mid-gray">Room · {nights} night{nights>1?'s':''}</span>
                  <span>LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mid-gray">Taxes (10%)</span>
                  <span>LKR {taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-dark-text border-t border-light-gray pt-3 mt-1">
                  <span>Total Due</span>
                  <span className="text-navy-800 text-xl">LKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Booking on behalf of */}
              {user && (
                <div className="mt-4 p-3 bg-navy-50 rounded-xl border border-navy-200 text-xs text-navy-700">
                  <p className="font-semibold mb-0.5">Booking as:</p>
                  <p>{user.name}</p>
                  <p className="text-mid-gray">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
