import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createBooking, checkConflicts } from '../../api/bookings';
import { searchResources } from '../../api/resources';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function NewBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resources, setResources] = useState([]);
  const [conflictResult, setConflictResult] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

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
      .then(res => setResources(res.data.data?.content || []))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setConflictResult(null);
  };

  const handleCheckConflict = async () => {
    if (!form.resourceId || !form.bookingDate || !form.startTime || !form.endTime) return;
    setCheckingConflict(true);
    try {
      const res = await checkConflicts(form.resourceId, form.bookingDate, form.startTime, form.endTime);
      setConflictResult(res.data.data);
    } catch {
      setConflictResult(null);
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.expectedAttendees) payload.expectedAttendees = parseInt(payload.expectedAttendees, 10);
      else delete payload.expectedAttendees;
      await createBooking(payload);
      navigate('/portal/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const selectedResource = resources.find(r => r.id === form.resourceId);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold mb-5">New Booking Request</h1>
      <Card className="p-6">
        {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Resource *</label>
            <select value={form.resourceId} onChange={set('resourceId')} required
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Select a resource...</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.resourceName} ({r.resourceCode}) — {r.location || 'No location'}</option>
              ))}
            </select>
          </div>

          {selectedResource && (
            <div className="p-3 bg-surface-alt rounded-md text-xs text-text-secondary space-y-1">
              <p><strong>Type:</strong> {selectedResource.resourceType} | <strong>Capacity:</strong> {selectedResource.capacity || '—'}</p>
              {selectedResource.availabilityWindows?.length > 0 && (
                <p><strong>Available:</strong> {selectedResource.availabilityWindows.map(w => `${w.dayOfWeek?.slice(0, 3)} ${w.startTime}-${w.endTime}`).join(', ')}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <Input label="Booking Date *" type="date" value={form.bookingDate} onChange={set('bookingDate')} required />
            <Input label="Start Time *" type="time" value={form.startTime} onChange={set('startTime')} required />
            <Input label="End Time *" type="time" value={form.endTime} onChange={set('endTime')} required />
          </div>

          {form.resourceId && form.bookingDate && form.startTime && form.endTime && (
            <div>
              <Button type="button" variant="secondary" size="sm" onClick={handleCheckConflict} disabled={checkingConflict}>
                {checkingConflict ? 'Checking...' : 'Check for Conflicts'}
              </Button>
              {conflictResult && (
                <div className={`mt-2 p-2.5 rounded text-xs flex items-start gap-2 ${conflictResult.conflict ? 'bg-red-50 border border-red-200 text-danger' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
                  {conflictResult.conflict ? <AlertTriangle size={14} className="shrink-0 mt-0.5" /> : <CheckCircle size={14} className="shrink-0 mt-0.5" />}
                  <div>
                    {conflictResult.conflict ? (
                      <>
                        <p className="font-medium">Scheduling conflict detected!</p>
                        {conflictResult.conflictingBookings?.map((b, i) => (
                          <p key={i} className="mt-1">{b.requestedByName}: {b.startTime}–{b.endTime} ({b.status})</p>
                        ))}
                      </>
                    ) : (
                      <p className="font-medium">No conflicts — time slot is available!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Textarea label="Purpose *" value={form.purpose} onChange={set('purpose')} required placeholder="Describe the purpose of this booking..." />
          <Input label="Expected Attendees" type="number" value={form.expectedAttendees} onChange={set('expectedAttendees')} placeholder="Optional" />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
