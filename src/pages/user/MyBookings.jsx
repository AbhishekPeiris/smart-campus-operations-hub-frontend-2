import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { cancelBooking, getBooking, getMyBookings } from '../../api/bookings';
import {
  BOOKING_STATUSES,
  formatDate,
  formatDateShort,
  formatTimeRange,
  getBookingStatusBadge,
} from '../../utils/constants';
import {
  extractApiData,
  normalizeBooking,
  normalizePaginatedData,
} from '../../utils/apiData';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';

const toBookingPage = (payload) => normalizePaginatedData(payload, normalizeBooking);

export default function MyBookings() {
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getMyBookings({
      status: statusFilter || undefined,
      bookingDate: dateFilter || undefined,
      page,
      size: 10,
    })
      .then((res) => {
        setData(toBookingPage(extractApiData(res)));
      })
      .catch((err) => {
        console.error('Failed to load bookings:', err);
      })
      .finally(() => setLoading(false));
  }, [dateFilter, page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenDetails = async (bookingSummary) => {
    setSelectedBooking(bookingSummary);
    setDetailLoading(true);

    try {
      const res = await getBooking(bookingSummary.id);
      setSelectedBooking(normalizeBooking(extractApiData(res) || bookingSummary));
    } catch (err) {
      console.error('Failed to load booking details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;

    setCancelling(true);
    try {
      await cancelBooking(cancelModal.id, { reason: cancelReason });
      setCancelModal(null);
      setCancelReason('');
      setSelectedBooking((prev) => (
        prev && prev.id === cancelModal.id
          ? { ...prev, status: 'CANCELLED', cancellationReason: cancelReason || prev.cancellationReason }
          : prev
      ));
      load();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel booking';
      alert(errorMsg);
      console.error('Booking cancellation error:', err);
    } finally {
      setCancelling(false);
    }
  };

  const bookings = data.content || [];

  return (
    <div className="app-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Reservations</p>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track booking decisions, view notes, and manage any approved reservations from one workspace.</p>
        </div>
      </div>

      <Card className="toolbar-panel">
        <div className="filter-grid">
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value);
              setPage(0);
            }}
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(0);
            }}
            className="text-sm"
          >
            <option value="">All Statuses</option>
            {BOOKING_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="section-card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : bookings.length === 0 ? (
          <EmptyState message="No bookings found" icon={CalendarDays} />
        ) : (
          <>
            <div className="app-list">
              {bookings.map((booking) => {
                const statusBadge = getBookingStatusBadge(booking.status);

                return (
                  <div key={booking.id} className="app-list-item">
                    <div className="flex items-start justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(booking)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="text-sm font-semibold text-text-primary">
                          {booking.resourceName || booking.resourceCode || booking.resourceId}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} />
                            {formatDateShort(booking.bookingDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatTimeRange(booking.startTime, booking.endTime)}
                          </span>
                          {booking.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {booking.location}
                            </span>
                          )}
                        </div>
                        {booking.purpose && (
                          <p className="mt-2 text-xs text-text-secondary">{booking.purpose}</p>
                        )}
                        {booking.reviewReason && (
                          <p className="mt-2 text-xs text-text-muted">Review note: {booking.reviewReason}</p>
                        )}
                        {booking.rejectionReason && (
                          <p className="mt-2 text-xs text-danger">Rejected: {booking.rejectionReason}</p>
                        )}
                        {booking.cancellationReason && (
                          <p className="mt-2 text-xs text-text-muted">Cancelled: {booking.cancellationReason}</p>
                        )}
                      </button>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                        <Button size="sm" variant="secondary" onClick={() => handleOpenDetails(booking)}>
                          View
                        </Button>
                        {booking.status === 'APPROVED' && (
                          <Button size="sm" variant="danger" onClick={() => setCancelModal(booking)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 pb-4">
              <Pagination
                currentPage={data.currentPage || 0}
                totalPages={data.totalPages || 0}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        size="md"
      >
        {detailLoading ? (
          <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : selectedBooking ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-text-primary">
                  {selectedBooking.resourceName || selectedBooking.resourceCode || selectedBooking.resourceId}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  {formatDateShort(selectedBooking.bookingDate)} - {formatTimeRange(selectedBooking.startTime, selectedBooking.endTime)}
                </p>
              </div>
              <Badge className={getBookingStatusBadge(selectedBooking.status).color}>
                {getBookingStatusBadge(selectedBooking.status).label}
              </Badge>
            </div>

            <div className="detail-grid">
              <div className="detail-tile">
                <p className="detail-tile__label">Location</p>
                <p className="detail-tile__value">{selectedBooking.location || '-'}</p>
              </div>
              <div className="detail-tile">
                <p className="detail-tile__label">Expected Attendees</p>
                <p className="detail-tile__value">{selectedBooking.expectedAttendees || '-'}</p>
              </div>
              <div className="detail-tile">
                <p className="detail-tile__label">Requested At</p>
                <p className="detail-tile__value">{formatDate(selectedBooking.createdAt)}</p>
              </div>
              <div className="detail-tile">
                <p className="detail-tile__label">Requested By</p>
                <p className="detail-tile__value">{selectedBooking.requestedByName || '-'}</p>
              </div>
            </div>

            <div className="surface-panel-muted px-4 py-4">
              <p className="detail-tile__label">Purpose</p>
              <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">
                {selectedBooking.purpose || '-'}
              </p>
            </div>

            {selectedBooking.reviewReason && (
              <div className="surface-panel-muted px-4 py-4">
                <p className="detail-tile__label">Review Note</p>
                <p className="mt-2 text-sm text-text-secondary">{selectedBooking.reviewReason}</p>
              </div>
            )}

            {selectedBooking.rejectionReason && (
              <div className="surface-panel-muted px-4 py-4">
                <p className="detail-tile__label">Rejection Reason</p>
                <p className="mt-2 text-sm text-danger">{selectedBooking.rejectionReason}</p>
              </div>
            )}

            {selectedBooking.cancellationReason && (
              <div className="surface-panel-muted px-4 py-4">
                <p className="detail-tile__label">Cancellation Reason</p>
                <p className="mt-2 text-sm text-text-secondary">{selectedBooking.cancellationReason}</p>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Booking">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to cancel this approved booking?
          </p>
          <Textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Reason for cancellation..."
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setCancelModal(null)}>
              Keep booking
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel booking'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
