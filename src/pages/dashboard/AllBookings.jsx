import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, CalendarDays, Check, Search, X } from 'lucide-react';
import {
  approveBooking,
  cancelBooking,
  getAllBookings,
  getBooking,
  rejectBooking,
  reviewBooking,
} from '../../api/bookings';
import { searchResources } from '../../api/resources';
import { getAllUsers } from '../../api/users';
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
  normalizeResource,
  normalizeUser,
} from '../../utils/apiData';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';

const toBookingPage = (payload) => normalizePaginatedData(payload, normalizeBooking);

export default function AllBookings() {
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [requesterFilter, setRequesterFilter] = useState('');
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAllBookings({
      status: statusFilter || undefined,
      resourceId: resourceFilter || undefined,
      requestedByUserId: requesterFilter || undefined,
      bookingDate: dateFilter || undefined,
      page,
      size: 15,
    })
      .then((res) => {
        setData(toBookingPage(extractApiData(res)));
      })
      .catch((err) => {
        console.error('Failed to load bookings:', err);
      })
      .finally(() => setLoading(false));
  }, [dateFilter, page, requesterFilter, resourceFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    searchResources({ size: 200 })
      .then((res) => {
        const payload = extractApiData(res);
        setResources(normalizePaginatedData(payload, normalizeResource).content);
      })
      .catch((err) => {
        console.error('Failed to load resources for booking filters:', err);
      });

    getAllUsers(0, 200)
      .then((res) => {
        const payload = extractApiData(res);
        setUsers(normalizePaginatedData(payload, normalizeUser).content);
      })
      .catch((err) => {
        console.error('Failed to load users for booking filters:', err);
      });
  }, []);

  const filteredSummary = useMemo(() => {
    const appliedFilters = [];
    if (statusFilter) appliedFilters.push(`status: ${statusFilter}`);
    if (dateFilter) appliedFilters.push(`date: ${formatDateShort(dateFilter)}`);
    if (resourceFilter) {
      const resource = resources.find((item) => item.id === resourceFilter);
      appliedFilters.push(`resource: ${resource?.resourceName || resourceFilter}`);
    }
    if (requesterFilter) {
      const requester = users.find((item) => item.id === requesterFilter);
      appliedFilters.push(`requester: ${requester?.fullName || requesterFilter}`);
    }
    return appliedFilters.join(' | ');
  }, [statusFilter, dateFilter, resourceFilter, requesterFilter, resources, users]);

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

  const handleAction = async () => {
    if (!actionModal) return;

    setActing(true);
    try {
      const { booking, action } = actionModal;

      try {
        if (action === 'approve') {
          await approveBooking(booking.id, { reason });
        } else if (action === 'reject') {
          await rejectBooking(booking.id, { reason });
        } else if (action === 'cancel') {
          await cancelBooking(booking.id, { reason });
        }
      } catch (err) {
        if ((action === 'approve' || action === 'reject') && err.response?.status === 404) {
          const decision = action === 'approve' ? 'APPROVED' : 'REJECTED';
          await reviewBooking(booking.id, { decision, reason });
        } else {
          throw err;
        }
      }

      setActionModal(null);
      setReason('');
      setSelectedBooking((prev) => (
        prev && prev.id === booking.id
          ? {
              ...prev,
              status: action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'CANCELLED',
              reviewReason: action !== 'cancel' ? reason || prev.reviewReason : prev.reviewReason,
              rejectionReason: action === 'reject' ? reason || prev.rejectionReason : prev.rejectionReason,
              cancellationReason: action === 'cancel' ? reason || prev.cancellationReason : prev.cancellationReason,
            }
          : prev
      ));
      load();
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Failed to ${actionModal?.action} booking`;
      alert(errorMsg);
      console.error(`Booking ${actionModal?.action} error:`, err);
    } finally {
      setActing(false);
    }
  };

  const bookings = data.content || [];

  return (
    <div className="app-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Booking Governance</p>
          <h1 className="page-title">All Bookings</h1>
          <p className="page-subtitle">
            Review, approve, reject, or cancel reservation requests with clear filters and a structured approval queue.
          </p>
        </div>
        {filteredSummary && (
          <div className="surface-panel-muted flex items-center gap-2 px-4 py-3 text-sm text-text-secondary">
            <Search size={14} className="text-primary-700" />
            {filteredSummary}
          </div>
        )}
      </div>

      <Card className="toolbar-panel">
        <div className="filter-grid">
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

          <Input
            type="date"
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value);
              setPage(0);
            }}
          />

          <select
            value={resourceFilter}
            onChange={(event) => {
              setResourceFilter(event.target.value);
              setPage(0);
            }}
            className="text-sm"
          >
            <option value="">All Resources</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.resourceName} ({resource.resourceCode})
              </option>
            ))}
          </select>

          <select
            value={requesterFilter}
            onChange={(event) => {
              setRequesterFilter(event.target.value);
              setPage(0);
            }}
            className="text-sm"
          >
            <option value="">All Requesters</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.fullName}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setStatusFilter('');
              setDateFilter('');
              setResourceFilter('');
              setRequesterFilter('');
              setPage(0);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      <Card className="section-card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : bookings.length === 0 ? (
          <EmptyState message="No bookings found" icon={CalendarDays} />
        ) : (
          <>
            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Requested By</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const statusBadge = getBookingStatusBadge(booking.status);

                    return (
                      <tr
                        key={booking.id}
                        className="cursor-pointer"
                        onClick={() => handleOpenDetails(booking)}
                      >
                        <td className="text-xs">
                          <div>
                            <p className="font-semibold text-text-primary">{booking.resourceName || booking.resourceCode || booking.resourceId}</p>
                            {booking.location && (
                              <p className="mt-1 text-text-muted">{booking.location}</p>
                            )}
                          </div>
                        </td>
                        <td className="text-xs text-text-muted">
                          {booking.requestedByName || booking.requestedByUserId}
                        </td>
                        <td className="text-xs text-text-secondary">{formatDateShort(booking.bookingDate)}</td>
                        <td className="text-xs text-text-muted">
                          {formatTimeRange(booking.startTime, booking.endTime)}
                        </td>
                        <td className="max-w-[240px] truncate text-xs text-text-muted">
                          {booking.purpose || '-'}
                        </td>
                        <td>
                          <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                            <Button size="sm" variant="secondary" onClick={() => handleOpenDetails(booking)}>
                              View
                            </Button>
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => {
                                    setActionModal({ booking, action: 'approve' });
                                    setReason('');
                                  }}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100"
                                  title="Approve"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setActionModal({ booking, action: 'reject' });
                                    setReason('');
                                  }}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-red-200 bg-red-50 text-danger transition-colors hover:bg-red-100"
                                  title="Reject"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            )}
                            {booking.status === 'APPROVED' && (
                              <button
                                onClick={() => {
                                  setActionModal({ booking, action: 'cancel' });
                                  setReason('');
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-red-200 bg-red-50 text-danger transition-colors hover:bg-red-100"
                                title="Cancel"
                              >
                                <Ban size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                <p className="detail-tile__label">Requested By</p>
                <p className="detail-tile__value">{selectedBooking.requestedByName || selectedBooking.requestedByUserId || '-'}</p>
              </div>
              <div className="detail-tile">
                <p className="detail-tile__label">Requested At</p>
                <p className="detail-tile__value">{formatDate(selectedBooking.createdAt)}</p>
              </div>
              <div className="detail-tile">
                <p className="detail-tile__label">Location</p>
                <p className="detail-tile__value">{selectedBooking.location || '-'}</p>
              </div>
              <div className="detail-tile">
                <p className="detail-tile__label">Expected Attendees</p>
                <p className="detail-tile__value">{selectedBooking.expectedAttendees || '-'}</p>
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

      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal ? `${actionModal.action.charAt(0).toUpperCase() + actionModal.action.slice(1)} Booking` : ''}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {actionModal?.action === 'approve' && 'Approve this booking request?'}
            {actionModal?.action === 'reject' && 'Reject this booking request?'}
            {actionModal?.action === 'cancel' && 'Cancel this approved booking?'}
          </p>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Add a reason for this decision..."
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setActionModal(null)}>
              Close
            </Button>
            <Button
              size="sm"
              variant={actionModal?.action === 'approve' ? 'success' : 'danger'}
              onClick={handleAction}
              disabled={acting}
            >
              {acting
                ? 'Processing...'
                : actionModal?.action === 'approve'
                  ? 'Approve'
                  : actionModal?.action === 'reject'
                    ? 'Reject'
                    : 'Cancel Booking'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
