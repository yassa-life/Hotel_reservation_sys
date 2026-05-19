import { useState, useEffect, useCallback } from 'react';
import { Star, Edit2, Trash2, Plus, X, Check, RefreshCw, MessageSquare, ChevronDown } from 'lucide-react';
import UserSidebar from '../../components/layout/UserSidebar';
import { ConfirmModal, EmptyState } from '../../components/shared/UI';
import { reviewsApi, reservationsApi } from '../../api/client';
import { useAuth, useToast } from '../../context/AppContext';

// ─── Star Rating Picker ────────────────────────────────────────────────────────
function StarPicker({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            size={size}
            className={`transition-colors ${
              n <= (hover || value)
                ? 'text-gold-500 fill-gold-500'
                : 'text-light-gray'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          className={n <= rating
            ? 'text-gold-500 fill-gold-500'
            : 'text-light-gray fill-light-gray'}
        />
      ))}
    </div>
  );
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

// ─── Write / Edit Modal ────────────────────────────────────────────────────────
function ReviewModal({ mode, existing, bookings, customerId, onClose, onSaved }) {
  const { addToast } = useToast();
  const isEdit = mode === 'edit';

  const [selectedBookingId, setSelectedBookingId] = useState(
    isEdit ? existing.reservationId : (bookings[0]?.reservationId ?? '')
  );
  const [rating,  setRating]  = useState(isEdit ? existing.rating  : 5);
  const [comment, setComment] = useState(isEdit ? existing.comment : '');
  const [saving,  setSaving]  = useState(false);

  const selectedBooking = bookings.find(b => b.reservationId === Number(selectedBookingId));

  const roomLabel = (b) => {
    if (!b) return '';
    if (b.roomNumber) return `Room ${b.roomNumber}`;
    return `Room #${b.roomId}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) { addToast('Please write a comment.', 'error'); return; }
    if (!isEdit && !selectedBookingId) { addToast('Please select a booking.', 'error'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await reviewsApi.update({ reviewId: existing.reviewId, customerId, rating, comment });
        addToast('Review updated successfully!', 'success');
      } else {
        await reviewsApi.create({ reservationId: Number(selectedBookingId), customerId, rating, comment });
        addToast('Review submitted successfully!', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save review.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <div>
            <h2 className="font-display font-bold text-navy-800 text-lg">
              {isEdit ? 'Edit Your Review' : 'Write a Review'}
            </h2>
            <p className="text-xs text-mid-gray mt-0.5">
              {isEdit ? 'Update your rating and comment' : 'Share your experience'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-light-gray/50 hover:bg-light-gray flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Booking selector (only for new reviews) */}
          {!isEdit && (
            <div>
              <label className="label">Select Booking</label>
              {bookings.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                  No completed bookings available to review yet.
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedBookingId}
                    onChange={e => setSelectedBookingId(e.target.value)}
                    className="input-field appearance-none pr-8"
                    required
                  >
                    {bookings.map(b => (
                      <option key={b.reservationId} value={b.reservationId}>
                        {roomLabel(b)}
                        {b.roomType ? ` · ${b.roomType}` : ''}
                        {b.checkInDate ? ` · ${String(b.checkInDate).slice(0, 10)}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-mid-gray pointer-events-none"/>
                </div>
              )}
            </div>
          )}

          {/* Room info summary for edit mode */}
          {isEdit && existing.roomNumber && (
            <div className="p-3 bg-navy-50 rounded-xl border border-navy-200">
              <p className="text-xs font-medium text-navy-700">
                Room {existing.roomNumber} {existing.roomType ? `· ${existing.roomType}` : ''}
              </p>
            </div>
          )}

          {/* Star Rating */}
          <div>
            <label className="label mb-2">Your Rating</label>
            <StarPicker value={rating} onChange={setRating} size={30} />
            <p className="text-xs text-mid-gray mt-1.5 font-medium">
              {RATING_LABELS[rating]} &mdash; {rating} / 5 stars
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="label">Your Experience</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell us about your stay — cleanliness, comfort, service..."
              className="input-field resize-none mt-1"
              required
            />
            <p className="text-xs text-mid-gray mt-1 text-right">{comment.length} / 500</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-outline py-3 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (!isEdit && bookings.length === 0)}
              className="flex-1 btn-gold py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-navy-700 border-t-transparent rounded-full animate-spin" />
                : <Check size={15} />
              }
              {isEdit ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function MyReviewsPage() {
  const { user }     = useAuth();
  const { addToast } = useToast();
  const customerId   = user?.customerId ?? user?.id;

  const [reviews,       setReviews]       = useState([]);
  const [eligibleBookings, setEligible]   = useState([]);   // Completed bookings not yet reviewed
  const [allBookings,   setAllBookings]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [writeModal,    setWriteModal]    = useState(false);
  const [editModal,     setEditModal]     = useState(null);  // review object
  const [deleteConfirm, setDeleteConfirm] = useState(null);  // { reviewId }

  const load = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const [revs, bookings] = await Promise.allSettled([
        reviewsApi.getByCustomer(customerId),
        reservationsApi.getByCustomer(customerId),
      ]);

      const reviewList  = revs.status     === 'fulfilled' ? (Array.isArray(revs.value)     ? revs.value     : []) : [];
      const bookingList = bookings.status === 'fulfilled' ? (Array.isArray(bookings.value) ? bookings.value : []) : [];

      setReviews(reviewList);
      setAllBookings(bookingList);

      const reviewedIds = new Set(reviewList.map(r => r.reservationId));
      // Show checked-out bookings that haven't been reviewed
      const eligible = bookingList.filter(b =>
        b.status === 'CheckedOut' &&
        !reviewedIds.has(b.reservationId)
      );
      setEligible(eligible);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (reviewId) => {
    try {
      await reviewsApi.delete(reviewId, customerId);
      setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
      addToast('Review deleted.', 'success');
      load();
    } catch (err) {
      addToast(err.message || 'Failed to delete review.', 'error');
    }
  };

  const reviewedIds = new Set(reviews.map(r => r.reservationId));
  const bookingsForModal = allBookings.filter(b => b.status === 'CheckedOut' && !reviewedIds.has(b.reservationId));

  return (
    <div className="flex min-h-screen bg-cream">
      <UserSidebar />
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">My Reviews</h1>
            <p className="text-mid-gray text-sm mt-1">Share your experience for your stays</p>
          </div>
          <div className="flex gap-3">
            <button onClick={load} className="btn-outline flex items-center gap-2 py-2 text-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={() => setWriteModal(true)}
              className="btn-gold flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Plus size={15} /> Write a Review
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ⚠ {error}. Make sure the backend server is running.
          </div>
        )}

        {/* ── Pending reviews banner ───────────────────────────────────── */}
        {!loading && eligibleBookings.length > 0 && (
          <div className="card mb-6 border border-gold-300 bg-gold-50 shadow-none">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star size={18} className="text-navy-900 fill-navy-900" />
                </div>
                <div>
                  <p className="font-semibold text-navy-800 text-sm">
                    You have {eligibleBookings.length} booking{eligibleBookings.length !== 1 ? 's' : ''} to review
                  </p>
                  <p className="text-xs text-mid-gray mt-0.5">Share your experience to help others</p>
                </div>
              </div>
              <button onClick={() => setWriteModal(true)} className="btn-gold flex items-center gap-2 py-2 px-4 text-sm flex-shrink-0">
                <Plus size={14} /> Write Review
              </button>
            </div>
          </div>
        )}

        {/* ── Reviews List ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-navy-800">
              Your Reviews
              <span className="ml-2 text-xs text-mid-gray font-normal">({reviews.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card h-28 animate-pulse bg-light-gray/50" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No reviews yet"
              description="You haven't written any reviews. Click 'Write a Review' to get started!"
              action={
                <button
                  onClick={() => setWriteModal(true)}
                  className="btn-gold flex items-center gap-2 py-2.5 px-5 text-sm mx-auto"
                >
                  <Plus size={14} /> Write Your First Review
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {reviews.map(r => {
                const room     = r.roomNumber ? `Room ${r.roomNumber}` : `Booking #${r.reservationId}`;
                const dateStr  = r.reviewDate ? String(r.reviewDate).slice(0, 10) : '';
                const checkIn  = r.checkIn    ? String(r.checkIn).slice(0, 10)  : '';
                const checkOut = r.checkOut   ? String(r.checkOut).slice(0, 10) : '';

                return (
                  <div key={r.reviewId} className="card animate-fade-in group">
                    <div className="flex items-start justify-between gap-4">
                      {/* Room badge */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-navy-700 font-bold text-sm flex-shrink-0">
                          {r.roomNumber || <Star size={16}/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-display font-semibold text-dark-text">{room}</p>
                            {r.roomType && (
                              <span className="badge badge-confirmed text-xs">{r.roomType}</span>
                            )}
                          </div>
                          {(checkIn || checkOut) && (
                            <p className="text-xs text-mid-gray mb-2">
                              {checkIn} → {checkOut}
                            </p>
                          )}
                          <StarDisplay rating={r.rating} />
                          <p className="text-sm text-dark-text mt-2 leading-relaxed break-words">{r.comment}</p>
                          {dateStr && (
                            <p className="text-xs text-mid-gray mt-2">Reviewed: {dateStr}</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditModal(r)}
                          title="Edit"
                          className="w-8 h-8 rounded-lg bg-navy-50 hover:bg-navy-100 flex items-center justify-center text-navy-700 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ reviewId: r.reviewId })}
                          title="Delete"
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Modals ───────────────────────────────────────────────────── */}
        {writeModal && (
          <ReviewModal
            mode="write"
            bookings={bookingsForModal}
            customerId={customerId}
            onClose={() => setWriteModal(false)}
            onSaved={load}
          />
        )}

        {editModal && (
          <ReviewModal
            mode="edit"
            existing={editModal}
            bookings={[]}
            customerId={customerId}
            onClose={() => setEditModal(null)}
            onSaved={load}
          />
        )}

        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => { handleDelete(deleteConfirm.reviewId); setDeleteConfirm(null); }}
          title="Delete Review"
          message="Are you sure you want to delete this review? This cannot be undone."
          confirmLabel="Delete"
          danger
        />
      </main>
    </div>
  );
}
