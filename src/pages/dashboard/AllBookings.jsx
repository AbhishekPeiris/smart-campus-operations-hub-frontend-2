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
    <div>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold">All Bookings</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Review, approve, reject, or cancel booking requests across all resources.
          </p>
        </div>
        {filteredSummary && (
          <div className="text-xs text-text-muted flex items-center gap-1">
            <Search size={12} />
            {filteredSummary}
          </div>
        )}
      </div>

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(0);
            }}
            className="text-xs border border-border rounded-md px-2 py-2 bg-white"
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
            className="text-xs border border-border rounded-md px-2 py-2 bg-white"
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
            className="text-xs border border-border rounded-md px-2 py-2 bg-white"
          >
            <option value="">All Requesters</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.fullName}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mt-3">
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
                  {bookings.map((booking) => {
                    const statusBadge = getBookingStatusBadge(booking.status);

                    return (
                      <tr
                        key={booking.id}
                        className="hover:bg-surface-alt/50 cursor-pointer"
                        onClick={() => handleOpenDetails(booking)}
                      >
                        <td className="px-4 py-2.5 font-medium text-xs">
                          <div>
                            <p>{booking.resourceName || booking.resourceCode || booking.resourceId}</p>
                            {booking.location && (
                              <p className="text-text-muted mt-1">{booking.location}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-text-muted">
                          {booking.requestedByName || booking.requestedByUserId}
                        </td>
                        <td className="px-4 py-2.5 text-xs">{formatDateShort(booking.bookingDate)}</td>
                        <td className="px-4 py-2.5 text-xs text-text-muted">
                          {formatTimeRange(booking.startTime, booking.endTime)}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-text-muted max-w-[220px] truncate">
                          {booking.purpose || '-'}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
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
                                  className="p-1.5 rounded hover:bg-emerald-50 text-text-muted hover:text-emerald-600"
                                  title="Approve"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setActionModal({ booking, action: 'reject' });
                                    setReason('');
                                  }}
                                  className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-danger"
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
                                className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-danger"
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
            <div className="px-4 pb-3">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-text-primary">
                  {selectedBooking.resourceName || selectedBooking.resourceCode || selectedBooking.resourceId}
                </p>
                <p className="text-sm text-text-muted mt-1">
                  {formatDateShort(selectedBooking.bookingDate)} - {formatTimeRange(selectedBooking.startTime, selectedBooking.endTime)}
                </p>
              </div>
              <Badge className={getBookingStatusBadge(selectedBooking.status).color}>
                {getBookingStatusBadge(selectedBooking.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted">Requested By</p>
                <p className="text-sm font-medium">{selectedBooking.requestedByName || selectedBooking.requestedByUserId || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Requested At</p>
                <p className="text-sm font-medium">{formatDate(selectedBooking.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Location</p>
                <p className="text-sm font-medium">{selectedBooking.location || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Expected Attendees</p>
                <p className="text-sm font-medium">{selectedBooking.expectedAttendees || '-'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-text-muted">Purpose</p>
              <p className="text-sm text-text-secondary whitespace-pre-wrap mt-1">
                {selectedBooking.purpose || '-'}
              </p>
            </div>

            {selectedBooking.reviewReason && (
              <div>
                <p className="text-xs text-text-muted">Review Note</p>
                <p className="text-sm text-text-secondary mt-1">{selectedBooking.reviewReason}</p>
              </div>
            )}

            {selectedBooking.rejectionReason && (
              <div>
                <p className="text-xs text-text-muted">Rejection Reason</p>
                <p className="text-sm text-danger mt-1">{selectedBooking.rejectionReason}</p>
              </div>
            )}

            {selectedBooking.cancellationReason && (
              <div>
                <p className="text-xs text-text-muted">Cancellation Reason</p>
                <p className="text-sm text-text-secondary mt-1">{selectedBooking.cancellationReason}</p>
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
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            {actionModal?.action === 'approve' && 'Approve this booking request?'}
            {actionModal?.action === 'reject' && 'Reject this booking request?'}
            {actionModal?.action === 'cancel' && 'Cancel this approved booking?'}
          </p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason..."
            className="w-full px-3 py-2 text-sm border border-border rounded-md resize-none"
            rows={3}
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
