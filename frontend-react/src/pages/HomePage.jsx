import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Star, Wifi, Coffee, Car, Waves } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { PlaceholderImage, StarRating } from '../components/shared/UI';
import { roomsApi } from '../api/client';
import { ROOMS, TESTIMONIALS, AMENITIES } from '../data/mockData';

const AMENITY_ICONS = {
  Waves, Dumbbell: Coffee, UtensilsCrossed: Coffee, Wifi, Car, Spa: Star
};

function SearchBar() {
  const nav = useNavigate();
  const [form, setForm] = useState({ checkIn: '', checkOut: '', guests: '1', type: '' });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = form.checkIn || today;

  return (
    <div className="bg-white rounded-2xl shadow-card-hover p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="label">Check-in</label>
          <input type="date" value={form.checkIn} min={today} onChange={set('checkIn')} className="input-field"/>
        </div>
        <div>
          <label className="label">Check-out</label>
          <input type="date" value={form.checkOut} min={minCheckOut} onChange={set('checkOut')} className="input-field"/>
        </div>
        <div>
          <label className="label">Guests</label>
          <select value={form.guests} onChange={set('guests')} className="input-field">
            {[1,2,3,4,5,6].map(n => <option key={n}>{n} {n===1?'Guest':'Guests'}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Room Type</label>
          <select value={form.type} onChange={set('type')} className="input-field">
            <option value="">All Types</option>
            {['Standard','Deluxe','Suite','Penthouse'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => nav('/rooms')} className="btn-gold w-full flex items-center justify-center gap-2">
            <Search size={16}/> Search
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    roomsApi.getAll().then(data => {
      const valid = Array.isArray(data) && data.length > 0 ? data : ROOMS;
      setFeatured(valid.slice(0, 3));
    }).catch(() => setFeatured(ROOMS.slice(0, 3)));
  }, []);

  const getId    = r => r.roomId ?? r.room_id ?? r.id;
  const getName  = r => r.name ?? `Room ${r.roomNumber ?? r.room_number ?? ''}`;
  const getPrice = r => Number(r.pricePerNight ?? r.price_per_night ?? r.price ?? 0);
  const getAmenities = r => r.amenities || ['King Bed', 'Free WiFi', 'Air Conditioning'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>

      {/* Hero */}
      <section className="relative bg-navy-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-navy-800 via-navy-900 to-navy-900"/>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-gold-500/10"/>
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-navy-700/50"/>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-3xl animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 rounded-full px-4 py-1.5 mb-6">
              <Star size={14} className="text-gold-400 fill-gold-400"/>
              <span className="text-gold-300 text-xs font-semibold tracking-wider uppercase">Award-Winning Luxury</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Your Perfect Stay<br/>
              <span className="text-gold-400">Awaits at Harborview</span>
            </h1>
            <p className="text-navy-300 text-lg mb-10 max-w-xl leading-relaxed">
              Discover world-class luxury, breathtaking ocean views, and personalized service that redefines hospitality on the emerald island.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/rooms" className="btn-gold text-base px-8 py-3.5">Explore Rooms</Link>
              <Link to="/signup" className="border-2 border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold text-base hover:border-white/60 transition-all">
                Book Now
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
            {[
              { val: '200+', label: 'Luxury Rooms' },
              { val: '4.9', label: 'Average Rating' },
              { val: '15k+', label: 'Happy Guests' },
            ].map(s => (
              <div key={s.label}>
                <p className="font-display text-2xl font-bold text-gold-400">{s.val}</p>
                <p className="text-navy-400 text-sm mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 w-full">
        <SearchBar/>
      </section>

      {/* Featured Rooms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-wider mb-2">Our Collection</p>
            <h2 className="section-title">Featured Rooms & Suites</h2>
          </div>
          <Link to="/rooms" className="btn-outline py-2.5 text-sm hidden sm:block">View All Rooms</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map(room => (
            <Link key={getId(room)} to={`/rooms/${getId(room)}`} className="card card-hover group animate-fade-in">
              <PlaceholderImage label={getName(room)} className="w-full h-52 rounded-xl mb-4 group-hover:scale-[1.02] transition-transform duration-300"/>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="badge badge-confirmed mb-2">{room.type || 'Standard'}</span>
                  <h3 className="font-display font-semibold text-dark-text text-lg leading-tight">{getName(room)}</h3>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-navy-800 text-xl">LKR {getPrice(room).toLocaleString()}</p>
                  <p className="text-xs text-mid-gray">per night</p>
                </div>
              </div>
              {room.rating && (
                <div className="flex items-center gap-2 mb-3">
                  <StarRating rating={room.rating}/>
                  <span className="text-xs text-mid-gray">({room.reviews})</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {getAmenities(room).slice(0, 3).map(a => (
                  <span key={a} className="text-xs bg-cream text-mid-gray px-2.5 py-1 rounded-full border border-light-gray">{a}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link to="/rooms" className="btn-outline inline-block">View All Rooms</Link>
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-navy-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-wider mb-2">World-Class Facilities</p>
            <h2 className="section-title">Hotel Amenities</h2>
            <p className="text-mid-gray mt-3 max-w-xl mx-auto">Everything you need for a perfect stay, from recreational activities to gourmet dining experiences.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {AMENITIES.map((a, i) => (
              <div key={i} className="card card-hover flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center flex-shrink-0">
                  <Star size={22} className="text-navy-700"/>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-dark-text mb-1">{a.label}</h3>
                  <p className="text-sm text-mid-gray">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-gold-500 text-sm font-semibold uppercase tracking-wider mb-2">Guest Experiences</p>
          <h2 className="section-title">What Our Guests Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card">
              <StarRating rating={t.rating} size={18}/>
              <p className="text-dark-text text-sm leading-relaxed mt-4 mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-light-gray">
                <div className="w-10 h-10 rounded-full bg-navy-200 flex items-center justify-center">
                  <span className="font-display font-bold text-navy-800 text-sm">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-dark-text text-sm">{t.name}</p>
                  <p className="text-xs text-mid-gray">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-navy-800 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready for an Unforgettable Experience?
          </h2>
          <p className="text-navy-300 mb-8">Book your stay today and enjoy exclusive member benefits and best rate guarantee.</p>
          <Link to="/signup" className="btn-gold text-base px-10 py-4 inline-block">Reserve Your Room</Link>
        </div>
      </section>

      <Footer/>
    </div>
  );
}
