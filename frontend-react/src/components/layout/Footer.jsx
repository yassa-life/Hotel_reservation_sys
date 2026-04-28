import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Share2, MessageCircle, Globe, Hash } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-navy-900 font-display font-bold text-sm">H</span>
              </div>
              <span className="font-display font-bold text-white text-xl">Harborview<span className="text-gold-400">.</span></span>
            </div>
            <p className="text-sm text-navy-300 leading-relaxed mb-5">
              Experience unparalleled luxury and comfort at Harborview Grand Hotel, where every stay becomes an unforgettable journey.
            </p>
            <div className="flex gap-3">
              {[Share2, MessageCircle, Globe, Hash].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center
                                           hover:bg-gold-500 hover:text-navy-900 text-navy-300 transition-all duration-200">
                  <Icon size={16}/>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/rooms', label: 'Our Rooms' },
                { to: '/signup', label: 'Book a Room' },
                { to: '/signin', label: 'Sign In' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-navy-300 hover:text-gold-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5">
              {['Infinity Pool', 'Fitness Center', 'Fine Dining', 'Luxury Spa', 'Valet Parking', 'Concierge'].map(s => (
                <li key={s}><span className="text-sm text-navy-300">{s}</span></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold-400 mt-0.5 flex-shrink-0"/>
                <span className="text-sm text-navy-300">1 Harborview Boulevard, Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold-400 flex-shrink-0"/>
                <span className="text-sm text-navy-300">+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold-400 flex-shrink-0"/>
                <span className="text-sm text-navy-300">info@harborviewhotel.lk</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-navy-800 my-8"/>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-navy-400">&copy; 2024 Harborview Grand Hotel. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
              <a key={t} href="#" className="text-xs text-navy-400 hover:text-gold-400 transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
