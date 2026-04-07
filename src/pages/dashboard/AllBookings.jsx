import { useState, useEffect } from 'react';
import { getAllBookings, reviewBooking, approveBooking, rejectBooking, cancelBooking } from '../../api/bookings';
import { BOOKING_STATUSES, getBookingStatusBadge, formatDateShort } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { CalendarDays, Check, X, Ban } from 'lucide-react';

export default function AllBookings() {
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [actionModal, setActionModal] = useState(null); // { booking, action: 'approve'|'reject'|'cancel' }
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    getAllBookings({ status: statusFilter || undefined, bookingDate: dateFilter || undefined, page, size: 15 })
      .then(res => setData(res.data.data || { content: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, statusFilter, dateFilter]);

  const handleAction = async () => {
    if (!actionModal) return;
    setActing(true);
    try {
      const { booking, action } = actionModal;
      if (action === 'approve') {
        // Try approve shortcut first, fallback to review
        try { await approveBooking(booking.id, { reason }); }
        catch { await reviewBooking(booking.id, { decision: 'APPROVED', reason }); }
      } else if (action === 'reject') {
        try { await rejectBooking(booking.id, { reason }); }
        catch { await reviewBooking(booking.id, { decision: 'REJECTED', reason }); }
      } else if (action === 'cancel') {
        await cancelBooking(booking.id, { reason });
      }
      setActionModal(null);
      setReason('');
      load();
    } catch {} finally { setActing(false); }
  };

  const bookings = data.content || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">All Bookings</h1>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(0); }}
            className="text-xs border border-border rounded-md px-2 py-1.5 bg-white" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="text-xs border border-border rounded-md px-2 py-1.5 bg-white">
            <option value="">All Statuses</option>
            {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : bookings.length === 0 ? (
          <EmptyState message="No bookings found" icon={CalendarDays} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt text-xs text-text-muted">
                    <th className="text-left px-4 py-2 font-medium">Resource</th>
                    <th className="text-left px-4 py-2 font-medium">Requested By</th>
                    <th className="text-left px-4 py-2 font-medium">Date</th>
                    <th className="text-left px-4 py-2 font-medium">Time</th>
                    <th className="text-left px-4 py-2 font-medium">Purpose</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-left px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map(b => {
                    const bs = getBookingStatusBadge(b.status);
                    return (
                      <tr key={b.id} className="hover:bg-surface-alt/50">
                        <td className="px-4 py-2.5 font-medium text-xs">{b.resourceName || b.resourceId}</td>
                        <td className="px-4 py-2.5 text-xs text-text-muted">{b.requestedByName || b.requestedByUserId}</td>
                        <td className="px-4 py-2.5 text-xs">{formatDateShort(b.bookingDate)}</td>
                        <td className="px-4 py-2.5 text-xs text-text-muted">{b.startTime}–{b.endTime}</td>
                        <td className="px-4 py-2.5 text-xs text-text-muted max-w-[150px] truncate">{b.purpose || '—'}</td>
                        <td className="px-4 py-2.5"><Badge className={bs.color}>{bs.label}</Badge></td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            {b.status === 'PENDING' && (
                              <>
                                <button onClick={() => { setActionModal({ booking: b, action: 'approve' }); setReason(''); }}
                                  className="p-1.5 rounded hover:bg-emerald-50 text-text-muted hover:text-emerald-600" title="Approve"><Check size={14} /></button>
                                <button onClick={() => { setActionModal({ booking: b, action: 'reject' }); setReason(''); }}
                                  className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-danger" title="Reject"><X size={14} /></button>
                              </>
                            )}
                            {b.status === 'APPROVED' && (
                              <button onClick={() => { setActionModal({ booking: b, action: 'cancel' }); setReason(''); }}
                                className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-danger" title="Cancel"><Ban size={14} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination currentPage={data.currentPage || 0} totalPages={data.totalPages || 0} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={actionModal ? `${actionModal.action.charAt(0).toUpperCase() + actionModal.action.slice(1)} Booking` : ''}>
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            {actionModal?.action === 'approve' && 'Approve this booking request?'}
            {actionModal?.action === 'reject' && 'Reject this booking request?'}
            {actionModal?.action === 'cancel' && 'Cancel this approved booking?'}
          </p>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (optional)..."
            className="w-full px-3 py-2 text-sm border border-border rounded-md resize-none" rows={3} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setActionModal(null)}>Close</Button>
            <Button size="sm" variant={actionModal?.action === 'approve' ? 'success' : 'danger'} onClick={handleAction} disabled={acting}>
              {acting ? 'Processing...' : (actionModal?.action === 'approve' ? 'Approve' : actionModal?.action === 'reject' ? 'Reject' : 'Cancel Booking')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
