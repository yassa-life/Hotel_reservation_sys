import { useState } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-card-hover w-full ${maxWidth} animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-gray">
          <h3 className="font-display text-lg font-semibold text-navy-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-mid-gray hover:bg-light-gray transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-mid-gray mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-outline py-2 px-5 text-sm">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={danger ? 'btn-danger' : 'btn-primary'}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function StatusBadge({ status }) {
  const map = {
    'Confirmed':   'badge-confirmed',
    'Pending':     'badge-pending',
    'Cancelled':   'badge-cancelled',
    'Checked-in':  'badge-checkedin',
    'Checked-out': 'badge-checkedout',
    'Available':   'badge bg-green-100 text-green-700',
    'Occupied':    'badge bg-blue-100 text-blue-700',
    'Maintenance': 'badge bg-orange-100 text-orange-700',
  };
  return <span className={map[status] || 'badge bg-gray-100 text-gray-600'}>{status}</span>;
}

export function PlaceholderImage({ label, className = '' }) {
  return (
    <div className={`placeholder-img ${className}`}>
      <span className="text-center px-4">{label}</span>
    </div>
  );
}

export function StarRating({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#d4af37' : '#e9ecef'}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className={`${s} border-2 border-navy-200 border-t-navy-700 rounded-full animate-spin`} />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mb-4">
        <Icon size={28} className="text-navy-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-dark-text mb-2">{title}</h3>
      <p className="text-sm text-mid-gray max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-mid-gray mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-light-gray">/</span>}
          {item.href
            ? <a href={item.href} className="hover:text-navy-700 transition-colors">{item.label}</a>
            : <span className={i === items.length - 1 ? 'text-dark-text font-medium' : ''}>{item.label}</span>
          }
        </span>
      ))}
    </nav>
  );
}

export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button disabled={page === 1} onClick={() => onPage(page - 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-light-gray disabled:opacity-40
                   hover:border-navy-400 transition-colors">
        Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
            ${p === page ? 'bg-navy-800 text-white' : 'hover:bg-light-gray text-dark-text'}`}>
          {p}
        </button>
      ))}
      <button disabled={page === totalPages} onClick={() => onPage(page + 1)}
        className="px-3 py-1.5 text-sm rounded-lg border border-light-gray disabled:opacity-40
                   hover:border-navy-400 transition-colors">
        Next
      </button>
    </div>
  );
}
