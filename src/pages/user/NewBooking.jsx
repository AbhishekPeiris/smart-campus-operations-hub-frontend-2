import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CalendarDays, CheckCircle, Clock, MapPin, Users } from 'lucide-react';
import {
  checkConflicts,
  createBooking,
  getBookingsByResource,
} from '../../api/bookings';
import { searchResources } from '../../api/resources';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import {
  formatDateShort,
  formatTimeRange,
  getBookingStatusBadge,
  getResourceTypeLabel,
} from '../../utils/constants';
import {
  extractApiData,
  normalizeBooking,
  normalizePaginatedData,
  normalizeResource,
} from '../../utils/apiData';

const today = new Date().toISOString().split('T')[0];
const activeScheduleStatuses = new Set(['PENDING', 'APPROVED']);

export default function NewBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resources, setResources] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [conflictResult, setConflictResult] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictChecked, setConflictChecked] = useState(false);

  const [form, setForm] = useState({
    resourceId: searchParams.get('resourceId') || '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });

  useEffect(() => {
    searchResources({ status: 'ACTIVE', size: 200 })
      .then((res) => {
        const payload = extractApiData(res);
        const items = normalizePaginatedData(payload, normalizeResource).content;
        setResources(items);
      })
      .catch((err) => {
        console.error('Failed to load resources for booking:', err);
      });
  }, []);

  useEffect(() => {
    if (!form.resourceId || !form.bookingDate) {
      setSchedule([]);
      return;
    }

    setScheduleLoading(true);
    getBookingsByResource(form.resourceId, { bookingDate: form.bookingDate, page: 0, size: 50 })
      .then((res) => {
        const payload = extractApiData(res);
        const items = normalizePaginatedData(payload, normalizeBooking).content
          .filter((booking) => activeScheduleStatuses.has(booking.status));
        setSchedule(items);
      })
      .catch((err) => {
        console.error('Failed to load existing bookings for resource:', err);
        setSchedule([]);
      })
      .finally(() => setScheduleLoading(false));
  }, [form.resourceId, form.bookingDate]);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setConflictResult(null);
    setConflictChecked(false);
    setError('');
  };

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === form.resourceId),
    [resources, form.resourceId]
  );

  const attendeeWarning = selectedResource?.capacity
    && form.expectedAttendees
    && Number(form.expectedAttendees) > Number(selectedResource.capacity)
    ? `Expected attendees exceed the resource capacity of ${selectedResource.capacity}.`
    : '';

  const validateForm = () => {
    if (!form.resourceId.trim()) return 'Resource is required';
    if (!form.bookingDate.trim()) return 'Booking date is required';
    if (!form.startTime.trim()) return 'Start time is required';
    if (!form.endTime.trim()) return 'End time is required';
    if (!form.purpose.trim()) return 'Purpose is required';
    if (form.bookingDate < today) return 'Booking date cannot be in the past';
    if (form.startTime >= form.endTime) return 'End time must be after start time';
    if (form.expectedAttendees && (!Number.isInteger(Number(form.expectedAttendees)) || Number(form.expectedAttendees) < 1)) {
      return 'Expected attendees must be a positive whole number';
    }
    return '';
  };

  const handleCheckConflict = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setConflictResult(null);
      return;
    }

    setCheckingConflict(true);
    setError('');

    try {
      const res = await checkConflicts(
        form.resourceId,
        form.bookingDate,
        form.startTime,
        form.endTime
      );
      const payload = extractApiData(res) || {};
      setConflictResult({
        conflict: Boolean(payload.conflict),
        conflictingBookings: (payload.conflictingBookings || []).map(normalizeBooking),
      });
      setConflictChecked(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check for conflicts');
      console.error('Conflict check error:', err);
      setConflictResult(null);
      setConflictChecked(false);
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!conflictChecked) {
      setError('Please check for scheduling conflicts before submitting.');
      return;
    }

    if (conflictResult?.conflict) {
      setError('Cannot submit a booking with scheduling conflicts.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : undefined,
      };

      if (!payload.expectedAttendees) delete payload.expectedAttendees;

      await createBooking(payload);
      navigate('/portal/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error('Booking creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page max-w-6xl">
      <div className="page-header">
        <div>
          <p className="page-kicker">Reservation Request</p>
          <h1 className="page-title">New Booking Request</h1>
          <p className="page-subtitle">Choose a resource, review the day schedule, run a conflict check, and submit with confidence.</p>
        </div>
      </div>

      <Card className="section-card overflow-hidden">
        <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="px-6 py-6">
            {error && (
              <div className="soft-alert mb-5 border-red-200 bg-red-50 text-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-muted mb-2">Resource</label>
                <select
                  value={form.resourceId}
                  onChange={setField('resourceId')}
                  required
                  className="w-full px-4 py-3 text-sm"
                >
                  <option value="">Select a resource...</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.resourceName} ({resource.resourceCode}) - {resource.location || 'No location'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedResource && (
                <div className="surface-panel-muted px-4 py-4">
                  <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                    <span><strong>Type:</strong> {getResourceTypeLabel(selectedResource.resourceType)}</span>
                    <span><strong>Capacity:</strong> {selectedResource.capacity || '-'}</span>
                    <span><strong>Status:</strong> {selectedResource.status || '-'}</span>
                  </div>
                  {selectedResource.location && (
                    <p className="mt-3 text-sm text-text-secondary flex items-center gap-2">
                      <MapPin size={14} />
                      {selectedResource.location}
                    </p>
                  )}
                  {selectedResource.availabilityWindows?.length > 0 && (
                    <p className="mt-3 text-sm text-text-secondary">
                      <strong>Availability:</strong>{' '}
                      {selectedResource.availabilityWindows
                        .map((window) => `${window.dayOfWeek?.slice(0, 3)} ${formatTimeRange(window.startTime, window.endTime)}`)
                        .join(', ')}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Booking Date"
                  type="date"
                  min={today}
                  value={form.bookingDate}
                  onChange={setField('bookingDate')}
                  required
                />
                <Input
                  label="Start Time"
                  type="time"
                  value={form.startTime}
                  onChange={setField('startTime')}
                  required
                />
                <Input
                  label="End Time"
                  type="time"
                  value={form.endTime}
                  onChange={setField('endTime')}
                  required
                />
              </div>

              <Textarea
                label="Purpose"
                value={form.purpose}
                onChange={setField('purpose')}
                required
                placeholder="Describe why you need this booking..."
              />

              <Input
                label="Expected Attendees"
                type="number"
                min="1"
                value={form.expectedAttendees}
                onChange={setField('expectedAttendees')}
                placeholder="Optional"
              />

              {attendeeWarning && (
                <div className="soft-alert border-amber-200 bg-amber-50 text-amber-700 flex items-start gap-2">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>{attendeeWarning}</span>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCheckConflict}
                  disabled={checkingConflict}
                >
                  {checkingConflict ? 'Checking...' : 'Check for conflicts'}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !conflictChecked}
                >
                  {loading ? 'Submitting...' : 'Submit request'}
                </Button>
              </div>
            </form>
          </div>

          <div className="border-l border-border bg-[linear-gradient(180deg,rgba(239,245,252,0.82),rgba(233,240,248,0.95))] px-6 py-6 space-y-5">
            <div>
              <p className="page-kicker">Schedule Preview</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Same-day visibility before you submit</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Existing pending and approved bookings for the selected resource and date appear here.
              </p>
            </div>

            <Card className="surface-panel-muted p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <p className="detail-tile__label">Selected Day</p>
                {form.bookingDate && (
                  <span className="text-sm font-semibold text-text-primary">{formatDateShort(form.bookingDate)}</span>
                )}
              </div>

              {!form.resourceId || !form.bookingDate ? (
                <p className="py-6 text-sm text-text-muted">
                  Select a resource and date to see that day's bookings.
                </p>
              ) : scheduleLoading ? (
                <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
              ) : schedule.length === 0 ? (
                <p className="py-6 text-sm text-text-muted">
                  No active bookings found for this resource on the selected date.
                </p>
              ) : (
                <div className="space-y-3">
                  {schedule.map((booking) => {
                    const statusBadge = getBookingStatusBadge(booking.status);

                    return (
                      <div key={booking.id} className="rounded-[18px] border border-border bg-white/85 px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">
                              {formatTimeRange(booking.startTime, booking.endTime)}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {booking.requestedByName || 'Unknown requester'}
                              </span>
                              {booking.expectedAttendees ? (
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  {booking.expectedAttendees} attendees
                                </span>
                              ) : null}
                            </div>
                            {booking.purpose && (
                              <p className="mt-2 text-xs text-text-secondary">{booking.purpose}</p>
                            )}
                          </div>
                          <span className={`rounded-[12px] border border-transparent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {conflictResult && (
              <Card className={`p-5 ${conflictResult.conflict ? 'border-red-200 bg-red-50/75' : 'border-emerald-200 bg-emerald-50/80'}`}>
                <div className={`flex items-start gap-3 text-sm ${conflictResult.conflict ? 'text-danger' : 'text-emerald-700'}`}>
                  {conflictResult.conflict ? (
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle size={18} className="mt-0.5 shrink-0" />
                  )}
                  <div>
                    {conflictResult.conflict ? (
                      <>
                        <p className="font-semibold">Scheduling conflict detected.</p>
                        <p className="mt-1 text-xs">Pick a different time slot or date before submitting this request.</p>
                        {conflictResult.conflictingBookings?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {conflictResult.conflictingBookings.map((booking) => (
                              <div key={booking.id} className="rounded-[14px] bg-white/80 px-3 py-3 text-xs">
                                <div className="flex items-center gap-2">
                                  <CalendarDays size={12} />
                                  <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                                  <span className="text-text-muted">-</span>
                                  <span>{booking.requestedByName || 'Unknown requester'}</span>
                                  <span className="text-text-muted">({booking.status})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">No conflicts found.</p>
                        <p className="mt-1 text-xs">This time slot is currently available to request.</p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
