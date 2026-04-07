import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createTicket } from '../../api/tickets';
import { INCIDENT_CATEGORIES, PRIORITY_LEVELS, RESOURCE_TYPES } from '../../utils/constants';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function NewTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [locationType, setLocationType] = useState('resource');
  const [form, setForm] = useState({
    incidentCategory: '', ticketTitle: '', description: '', priorityLevel: 'MEDIUM',
    preferredContactName: user.fullName, preferredContactEmailAddress: user.universityEmailAddress,
    preferredContactPhoneNumber: '',
    resourceIdentifier: '', resourceName: '', resourceType: '',
    locationIdentifier: '', locationName: '',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors([]);
    setLoading(true);
    try {
      const payload = { ...form };
      if (locationType === 'resource') {
        delete payload.locationIdentifier;
        delete payload.locationName;
      } else {
        delete payload.resourceIdentifier;
        delete payload.resourceName;
        delete payload.resourceType;
      }
      await createTicket(user.userId, payload);
      navigate('/portal/tickets');
    } catch (err) {
      const serverData = err.response?.data;
      const details = Array.isArray(serverData?.validationErrors) ? serverData.validationErrors : [];
      setValidationErrors(details);
      setError(serverData?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold mb-5">Report an Incident</h1>
      <Card className="p-6">
        {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-danger">{error}</div>}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded">
            <ul className="list-disc pl-4 text-xs text-danger space-y-1">
              {validationErrors.map((v, idx) => <li key={`${v}-${idx}`}>{v}</li>)}
            </ul>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Incident Category *" options={INCIDENT_CATEGORIES} value={form.incidentCategory} onChange={set('incidentCategory')} required />
            <Select label="Priority Level *" options={PRIORITY_LEVELS} value={form.priorityLevel} onChange={set('priorityLevel')} required />
          </div>
          <Input label="Ticket Title *" value={form.ticketTitle} onChange={set('ticketTitle')} required placeholder="Brief description of the issue" />
          <Textarea label="Description *" value={form.description} onChange={set('description')} required placeholder="Provide detailed information about the incident..." />

          <div className="pt-2">
            <p className="text-sm font-medium text-text-secondary mb-2">Location Type</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="locType" checked={locationType === 'resource'} onChange={() => setLocationType('resource')} className="accent-primary-600" />
                <span>Resource-based</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="locType" checked={locationType === 'location'} onChange={() => setLocationType('location')} className="accent-primary-600" />
                <span>Location-based</span>
              </label>
            </div>
          </div>

          {locationType === 'resource' ? (
            <div className="grid grid-cols-3 gap-4">
              <Input label="Resource ID" value={form.resourceIdentifier} onChange={set('resourceIdentifier')} placeholder="RES-001" />
              <Input label="Resource Name" value={form.resourceName} onChange={set('resourceName')} placeholder="Projector" />
              <Select label="Resource Type" options={RESOURCE_TYPES} value={form.resourceType} onChange={set('resourceType')} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Location ID" value={form.locationIdentifier} onChange={set('locationIdentifier')} placeholder="LOC-001" />
              <Input label="Location Name" value={form.locationName} onChange={set('locationName')} placeholder="Building A, Room 101" />
            </div>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-text-secondary mb-3">Contact Information</p>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Name" value={form.preferredContactName} onChange={set('preferredContactName')} />
              <Input label="Email" type="email" value={form.preferredContactEmailAddress} onChange={set('preferredContactEmailAddress')} />
              <Input label="Phone" value={form.preferredContactPhoneNumber} onChange={set('preferredContactPhoneNumber')} placeholder="+94771234567" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Ticket'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
