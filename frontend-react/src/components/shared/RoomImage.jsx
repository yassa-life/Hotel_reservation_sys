import { useState } from 'react';
import { ImageOff } from 'lucide-react';

const TOMCAT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/hotel-system/api')
  .replace(/\/api$/, '');

/**
 * Shared RoomImage component to handle relative and absolute URLs
 * and provide a consistent fallback UI.
 */
export default function RoomImage({ room, className = '' }) {
  const [err, setErr] = useState(false);
  
  const imgs = room?.images ?? [];
  const primary = imgs.find(i => i.isPrimary || i.is_primary) ?? imgs[0] ?? null;
  const rawUrl = primary ? (primary.imageUrl ?? primary.image_url) 
                         : (room?.imageUrl ?? room?.image_url ?? null);

  const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${TOMCAT}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const src = resolveUrl(rawUrl);

  if (!src || err) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 border border-slate-200 ${className}`}>
        <ImageOff size={28} className="mb-1 opacity-50" />
        <span className="text-xs font-medium">Room {room?.roomNumber ?? room?.room_number ?? ''}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={`Room ${room?.roomNumber ?? room?.room_number}`} 
      onError={() => setErr(true)} 
      className={`object-cover ${className}`} 
    />
  );
}
