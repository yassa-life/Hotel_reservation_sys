import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, DollarSign, X, ImageOff } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { StarRating, StatusBadge, Breadcrumb, Pagination } from '../components/shared/UI';
import { roomsApi } from '../api/client';

const TOMCAT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/hotel-system/api')
  .replace(/\/api$/, '');

import RoomImage from '../components/shared/RoomImage';



const TYPES = ['All', 'Single', 'Double', 'Suite', 'Deluxe'];
const PER_PAGE = 4;

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [sort, setSort] = useState('price-asc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    roomsApi.getAll()
      .then(data => setRooms(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || 'Failed to load rooms.'))
      .finally(() => setLoading(false));
  }, []);


  const filtered = useMemo(() => {
    let r = rooms.filter(room => {
      const price = room.pricePerNight ?? room.price_per_night ?? room.price ?? 0;
      const rType = room.type || '';
      const name = room.name ?? `Room ${room.roomNumber ?? room.room_number ?? ''}`;
      
      return (type === 'All' || rType === type) &&
             price <= maxPrice &&
             (name.toLowerCase().includes(search.toLowerCase()) || rType.toLowerCase().includes(search.toLowerCase()));
    });
    
    if (sort === 'price-asc')  r = r.sort((a,b) => (a.pricePerNight||a.price||0) - (b.pricePerNight||b.price||0));
    if (sort === 'price-desc') r = r.sort((a,b) => (b.pricePerNight||b.price||0) - (a.pricePerNight||a.price||0));
    return r;
  }, [rooms, search, type, maxPrice, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const resetFilters = () => { setType('All'); setMaxPrice(50000); setSearch(''); setPage(1); };

  const getPrice = r => Number(r.pricePerNight ?? r.price_per_night ?? r.price ?? 0);
  const getId    = r => r.roomId ?? r.room_id ?? r.id;
  const getName  = r => r.name ?? `Room ${r.roomNumber ?? r.room_number ?? ''}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>

      {/* Header */}
      <div className="bg-navy-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{label:'Home',href:'/'},{label:'Rooms & Suites'}]}/>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Rooms &amp; Suites</h1>
          <p className="text-navy-300">Choose from {rooms.length} meticulously designed accommodations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mid-gray"/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
              placeholder="Search rooms..."
              className="input-field pl-9"/>
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="input-field sm:w-48">
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
          <button onClick={()=>setShowFilters(!showFilters)}
            className="flex items-center gap-2 btn-outline py-3 px-4 text-sm">
            <Filter size={16}/> Filters {type!=='All'||maxPrice<50000?'•':''}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="card mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-dark-text">Filter Rooms</h3>
              <button onClick={resetFilters} className="text-xs text-gold-600 hover:underline flex items-center gap-1">
                <X size={12}/> Reset All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Room Type</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {TYPES.map(t => (
                    <button key={t} onClick={()=>{setType(t);setPage(1);}}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                        ${type===t ? 'bg-navy-800 text-white' : 'bg-cream border border-light-gray text-mid-gray hover:border-navy-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <DollarSign size={14}/> Max Price: <span className="text-navy-700 font-semibold">LKR {maxPrice.toLocaleString()}/night</span>
                </label>
                <input type="range" min={2000} max={50000} step={1000} value={maxPrice}
                  onChange={e=>{setMaxPrice(+e.target.value);setPage(1);}}
                  className="w-full accent-navy-700 mt-2"/>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ⚠ Could not load rooms: {error}. Make sure the backend server is running.
          </div>
        )}
        {loading ? (

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {[1,2,3,4].map(i => <div key={i} className="card h-40 animate-pulse bg-light-gray/50"/>)}
           </div>
        ) : (
          <>
            <p className="text-sm text-mid-gray mb-5">Showing {filtered.length} room{filtered.length!==1?'s':''}</p>
            {filtered.length === 0 ? (
              <div className="card text-center py-16">
                <p className="text-mid-gray font-medium">No rooms match your search criteria.</p>
                <button onClick={resetFilters} className="btn-outline mt-4 py-2 px-5 text-sm inline-flex">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginated.map(room => (
                  <Link key={getId(room)} to={`/rooms/${getId(room)}`}
                    className="card card-hover group flex flex-col sm:flex-row gap-4 animate-fade-in">
                    <RoomImage room={room} className="sm:w-48 h-40 sm:h-auto rounded-xl flex-shrink-0"/>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <span className="badge badge-confirmed text-xs">{room.type}</span>
                        <StatusBadge status={room.status}/>
                      </div>
                      <h3 className="font-display font-semibold text-dark-text text-lg mt-2">{getName(room)}</h3>
                      {room.rating && (
                        <div className="flex items-center gap-2 my-2">
                          <StarRating rating={room.rating} size={14}/>
                          <span className="text-xs text-mid-gray">({room.reviews} reviews)</span>
                        </div>
                      )}
                      <p className="text-xs text-mid-gray line-clamp-2 mt-2 mb-3">{room.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="font-display font-bold text-navy-800 text-xl">LKR {getPrice(room).toLocaleString()}</span>
                          <span className="text-xs text-mid-gray ml-1">/night</span>
                        </div>
                        <span className="text-xs text-gold-600 font-semibold group-hover:underline">View Details →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Pagination page={page} totalPages={totalPages} onPage={setPage}/>
          </>
        )}
      </div>

      <Footer/>
    </div>
  );
}
