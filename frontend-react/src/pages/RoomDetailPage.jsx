import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Users, Maximize2, Building2, Check, Star } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { PlaceholderImage, StarRating, StatusBadge, Breadcrumb } from '../components/shared/UI';
import { roomsApi, reservationsApi } from '../api/client';

export default function RoomDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [room,        setRoom]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [bookedRanges, setBookedRanges] = useState([]); // [{checkInDate, checkOutDate}]
  const [activeImg,   setActiveImg]   = useState(0);
  const [checkIn,     setCheckIn]     = useState('');
  const [checkOut,    setCheckOut]    = useState('');
  const [guests,      setGuests]      = useState(1);
  const [dateError,   setDateError]   = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      roomsApi.getById(id),
      reservationsApi.getBookedDates(id).catch(() => []),
    ]).then(([roomData, bookings]) => {
      if (roomData && Object.keys(roomData).length > 0) {
        setRoom(roomData);
      }
      // Store active bookings as date ranges
      const ranges = Array.isArray(bookings)
        ? bookings.filter(b => !['Cancelled'].includes(b.status)).map(b => ({
            start: String(b.checkInDate  ?? b.check_in_date  ?? '').slice(0, 10),
            end:   String(b.checkOutDate ?? b.check_out_date ?? '').slice(0, 10),
          }))
        : [];
      setBookedRanges(ranges);
    }).catch(() => {
      setRoom(null);
    }).finally(() => setLoading(false));
  }, [id]);

  // Check if a date falls inside any booked range
  const isDateBooked = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return bookedRanges.some(r => {
      const start = new Date(r.start);
      const end   = new Date(r.end);
      return d >= start && d < end; // check-in day is blocked; checkout day is free
    });
  };

  // Build a string for the min of checkout (day after checkin)
  const minCheckOut = checkIn
    ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    if (isDateBooked(val)) {
      setDateError('This date is already booked. Please choose another date.');
      setCheckIn('');
      return;
    }
    setDateError('');
    setCheckIn(val);
    if (checkOut && checkOut <= val) setCheckOut('');
  };

  const handleCheckOutChange = (e) => {
    const val = e.target.value;
    // Check if any date in the range is booked
    if (checkIn) {
      const start = new Date(checkIn);
      const end   = new Date(val);
      let current = new Date(start.getTime() + 86400000);
      let conflict = false;
      while (current < end) {
        const ds = current.toISOString().split('T')[0];
        if (isDateBooked(ds)) { conflict = true; break; }
        current = new Date(current.getTime() + 86400000);
      }
      if (conflict) {
        setDateError('Your selected range overlaps with an existing booking. Please choose different dates.');
        setCheckOut('');
        return;
      }
    }
    setDateError('');
    setCheckOut(val);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full"/>
      </div>
      <Footer/>
    </div>
  );

  if (!room) return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-navy-800 mb-2">Room Not Found</h2>
          <Link to="/rooms" className="btn-primary mt-4 inline-block">Back to Rooms</Link>
        </div>
      </div>
      <Footer/>
    </div>
  );

  const getPrice = r => Number(r.pricePerNight ?? r.price_per_night ?? r.price ?? 0);
  const getName  = r => r.name ?? `Room ${r.roomNumber ?? r.room_number ?? ''}`;

  const imgLabels = [
    `${getName(room)} - Main View`,
    `${getName(room)} - Bedroom`,
    `${getName(room)} - Bathroom`,
    `${getName(room)} - Balcony`,
  ];

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0;

  const handleBook = () => {
    if (!checkIn || !checkOut || nights < 1) {
      setDateError('Please select valid check-in and check-out dates.');
      return;
    }
    nav('/booking', { state: { room, checkIn, checkOut, nights, guests } });
  };

  const today = new Date().toISOString().split('T')[0];
  const isAvailable = (room.status ?? '').toLowerCase() === 'available';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumb items={[{label:'Home',href:'/'},{label:'Rooms',href:'/rooms'},{label:getName(room)}]}/>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <PlaceholderImage label={imgLabels[activeImg]} className="w-full h-80 rounded-2xl"/>
              <div className="flex gap-3 mt-3">
                {imgLabels.map((label,i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-1 rounded-xl overflow-hidden border-2 transition-all
                                ${i===activeImg ? 'border-gold-500 shadow-md' : 'border-transparent'}`}>
                    <PlaceholderImage label={`View ${i+1}`} className="h-16 w-full"/>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-confirmed">{room.type}</span>
                  <StatusBadge status={room.status}/>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy-800">{getName(room)}</h1>
                {room.rating && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={room.rating} size={18}/>
                    <span className="text-sm text-mid-gray font-medium">{room.rating} ({room.reviews} reviews)</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold text-navy-800">LKR {getPrice(room).toLocaleString()}</p>
                <p className="text-sm text-mid-gray">per night</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: Maximize2, label: 'Room Size', val: room.size || 'Standard' },
                { icon: Users,     label: 'Capacity',  val: `${room.capacity || 2} Guests` },
                { icon: Building2, label: 'Floor',     val: `Floor ${room.floor || 1}` },
              ].map(s => (
                <div key={s.label} className="card flex items-center gap-3 py-4">
                  <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                    <s.icon size={18} className="text-navy-700"/>
                  </div>
                  <div>
                    <p className="text-xs text-mid-gray">{s.label}</p>
                    <p className="text-sm font-semibold text-dark-text">{s.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card mb-6">
              <h2 className="font-display font-semibold text-lg text-navy-800 mb-3">About This Room</h2>
              <p className="text-mid-gray text-sm leading-relaxed">{room.description}</p>
            </div>

            <div className="card">
              <h2 className="font-display font-semibold text-lg text-navy-800 mb-4">Room Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(room.amenities || ['King Bed', 'Free WiFi', 'Air Conditioning', 'Mini Bar', 'TV', 'Ensuite']).map(a => (
                  <div key={a} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-green-600"/>
                    </div>
                    <span className="text-sm text-dark-text">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="font-display font-semibold text-lg text-navy-800 mb-5">Reserve This Room</h2>

              {/* Booked ranges notice */}
              {bookedRanges.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                  ⚠ Some dates are unavailable. Booked dates will be blocked automatically.
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="label">Check-in Date</label>
                  <input type="date" value={checkIn}
                    min={today}
                    onChange={handleCheckInChange}
                    className="input-field"/>
                </div>
                <div>
                  <label className="label">Check-out Date</label>
                  <input type="date" value={checkOut}
                    min={minCheckOut}
                    onChange={handleCheckOutChange}
                    className="input-field"/>
                </div>

                {dateError && (
                  <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-2">{dateError}</p>
                )}

                {/* Show booked date ranges for user info */}
                {bookedRanges.length > 0 && (
                  <div className="text-xs text-mid-gray space-y-1">
                    <p className="font-medium text-dark-text">Unavailable periods:</p>
                    {bookedRanges.map((r, i) => (
                      <p key={i} className="text-red-500">• {r.start} → {r.end}</p>
                    ))}
                  </div>
                )}

                <div>
                  <label className="label">Guests</label>
                  <select value={guests} onChange={e => setGuests(+e.target.value)} className="input-field">
                    {Array.from({length: room.capacity || 4}, (_,i) => i+1).map(n => (
                      <option key={n}>{n} {n===1?'Guest':'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="mt-5 pt-4 border-t border-light-gray space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-mid-gray">LKR {getPrice(room).toLocaleString()} × {nights} night{nights>1?'s':''}</span>
                    <span className="font-medium">LKR {(getPrice(room) * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-mid-gray">Taxes & fees (10%)</span>
                    <span className="font-medium">LKR {Math.round(getPrice(room) * nights * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-dark-text border-t border-light-gray pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-navy-800">LKR {Math.round(getPrice(room) * nights * 1.1).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button onClick={handleBook}
                disabled={!isAvailable || !!dateError}
                className="btn-gold w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed">
                {isAvailable ? 'Proceed to Book' : room.status}
              </button>

              <div className="flex items-center justify-center gap-2 mt-3">
                <Star size={12} className="text-gold-500 fill-gold-500"/>
                <span className="text-xs text-mid-gray">Best rate guarantee · Free cancellation*</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
