import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Download, Calendar, MapPin } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function BookingConfirmationPage() {
  const { state } = useLocation();
  const ref = state?.ref || 'HRV-XXXXXXXX';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full text-center animate-slide-up">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500"/>
          </div>

          <h1 className="font-display text-3xl font-bold text-navy-800 mb-2">Booking Confirmed!</h1>
          <p className="text-mid-gray mb-8">
            Your reservation has been successfully placed. A confirmation email will be sent to{' '}
            <span className="text-dark-text font-medium">{state?.guest?.email || 'your email'}</span>.
          </p>

          {/* Ref Card */}
          <div className="card mb-6 text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-light-gray">
              <div>
                <p className="text-xs text-mid-gray uppercase tracking-wider mb-1">Booking Reference</p>
                <p className="font-display font-bold text-2xl text-gold-600">{ref}</p>
              </div>
              <span className="badge badge-confirmed text-sm py-1.5 px-3">Confirmed</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-mid-gray mb-1">Room</p>
                <p className="font-semibold text-dark-text">{state?.room?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-mid-gray mb-1">Type</p>
                <p className="font-semibold text-dark-text">{state?.room?.type || '—'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-navy-500"/>
                <div>
                  <p className="text-xs text-mid-gray">Check-in</p>
                  <p className="font-semibold text-dark-text">{state?.checkIn || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-navy-500"/>
                <div>
                  <p className="text-xs text-mid-gray">Check-out</p>
                  <p className="font-semibold text-dark-text">{state?.checkOut || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-mid-gray">Nights</p>
                <p className="font-semibold text-dark-text">{state?.nights || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-mid-gray">Total Paid</p>
                <p className="font-bold text-navy-800">${state?.total || '—'}</p>
              </div>
            </div>
          </div>

          {/* Hotel Location Note */}
          <div className="flex items-start gap-3 text-left bg-navy-50 rounded-xl p-4 mb-8 border border-navy-100">
            <MapPin size={18} className="text-navy-600 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-semibold text-navy-800">Harborview Grand Hotel</p>
              <p className="text-xs text-mid-gray mt-0.5">1 Harborview Boulevard, Colombo 03, Sri Lanka</p>
              <p className="text-xs text-mid-gray">Check-in: 3:00 PM · Check-out: 12:00 PM</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-outline flex items-center gap-2 justify-center py-3">
              <Download size={16}/> Download Receipt
            </button>
            <Link to="/dashboard/bookings" className="btn-primary flex items-center gap-2 justify-center py-3">
              View My Bookings
            </Link>
          </div>

          <Link to="/" className="block mt-5 text-sm text-mid-gray hover:text-navy-700 transition-colors">
            Return to Homepage
          </Link>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
