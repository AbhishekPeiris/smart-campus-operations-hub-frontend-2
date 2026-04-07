import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../../api/bookings';
import { BOOKING_STATUSES, getBookingStatusBadge, formatDate, formatDateShort } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

export default function MyBookings() {
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    getMyBookings({ status: statusFilter || undefined, page, size: 10 })
      .then(res => setData(res.data.data || { content: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelModal.id, { reason: cancelReason });
      setCancelModal(null);
      setCancelReason('');
      load();
    } catch {} finally { setCancelling(false); }
  };

  const bookings = data.content || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">My Bookings</h1>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="text-xs border border-border rounded-md px-2 py-1.5 bg-white">
          <option value="">All Statuses</option>
          {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : bookings.length === 0 ? (
          <EmptyState message="No bookings found" icon={CalendarDays} />
        ) : (
          <>
            <div className="divide-y divide-border">
              {bookings.map(b => {
                const bs = getBookingStatusBadge(b.status);
                return (
                  <div key={b.id} className="px-4 py-4 hover:bg-surface-alt/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary">{b.resourceName || b.resourceId}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-text-muted">
                          <span className="flex items-center gap-1"><CalendarDays size={11} />{formatDateShort(b.bookingDate)}</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{b.startTime} – {b.endTime}</span>
                          {b.location && <span className="flex items-center gap-1"><MapPin size={11} />{b.location}</span>}
                        </div>
                        {b.purpose && <p className="text-xs text-text-secondary mt-1.5">{b.purpose}</p>}
                        {b.reviewReason && <p className="text-xs text-text-muted mt-1 italic">Review: {b.reviewReason}</p>}
                        {b.rejectionReason && <p className="text-xs text-danger mt-1">Rejected: {b.rejectionReason}</p>}
                        {b.cancellationReason && <p className="text-xs text-text-muted mt-1">Cancelled: {b.cancellationReason}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={bs.color}>{bs.label}</Badge>
                        {b.status === 'APPROVED' && (
                          <Button size="sm" variant="danger" onClick={() => setCancelModal(b)}>Cancel</Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 pb-3">
              <Pagination currentPage={data.currentPage || 0} totalPages={data.totalPages || 0} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Booking">
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">Are you sure you want to cancel this booking?</p>
          <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation..."
            className="w-full px-3 py-2 text-sm border border-border rounded-md resize-none" rows={3} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setCancelModal(null)}>Keep Booking</Button>
            <Button variant="danger" size="sm" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Cancelling...' : 'Cancel Booking'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
