import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { createTicket } from '../../api/tickets';
import { searchResources } from '../../api/resources';
import { INCIDENT_CATEGORIES, PRIORITY_LEVELS, getResourceTypeLabel } from '../../utils/constants';
import { extractApiData, normalizePaginatedData, normalizeResource } from '../../utils/apiData';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const toLocationIdentifier = (locationName) =>
  String(locationName || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function NewTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [locationType, setLocationType] = useState('resource');
  const [resources, setResources] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [form, setForm] = useState({
    incidentCategory: '',
    ticketTitle: '',
    description: '',
    priorityLevel: 'MEDIUM',
    preferredContactName: user.fullName,
    preferredContactEmailAddress: user.universityEmailAddress,
    preferredContactPhoneNumber: '',
    resourceIdentifier: '',
    resourceName: '',
    resourceType: '',
    locationIdentifier: '',
    locationName: '',
  });

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      setResourcesLoading(false);
      return;
    }

    searchResources({ status: 'ACTIVE', size: 200 })
      .then((res) => {
        const payload = extractApiData(res);
        setResources(normalizePaginatedData(payload, normalizeResource).content);
      })
      .catch((err) => {
        console.error('Failed to load resources for incident form:', err);
      })
      .finally(() => setResourcesLoading(false));
  }, []);

  const locationOptions = useMemo(() => {
    const uniqueLocations = [...new Set(resources.map((resource) => resource.location).filter(Boolean))];

    return uniqueLocations.map((location) => ({
      value: location,
      label: location,
    }));
  }, [resources]);

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === selectedResourceId),
    [resources, selectedResourceId]
  );

  const resourcesAtSelectedLocation = useMemo(
    () => resources.filter((resource) => resource.location === selectedLocationName),
    [resources, selectedLocationName]
  );

  const set = (key) => (event) => {
    if (key === 'preferredContactPhoneNumber') {
      const rawValue = event.target.value;
      const digitsOnlyValue = rawValue.replace(/\D/g, '').slice(0, 10);

      if (rawValue !== digitsOnlyValue) {
        if (rawValue.replace(/\D/g, '').length > 10) {
          setPhoneError('Phone number must be at most 10 digits');
        } else {
          setPhoneError('Phone number can contain digits only');
        }
      } else {
        setPhoneError('');
      }

      setForm((prev) => ({ ...prev, [key]: digitsOnlyValue }));
      return;
    }

    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleLocationTypeChange = (nextType) => {
    setLocationType(nextType);
    setValidationErrors([]);
    setError('');

    if (nextType === 'resource') {
      setSelectedLocationName('');
      setForm((prev) => ({
        ...prev,
        locationIdentifier: '',
        locationName: '',
      }));
    } else {
      setSelectedResourceId('');
      setForm((prev) => ({
        ...prev,
        resourceIdentifier: '',
        resourceName: '',
        resourceType: '',
      }));
    }
  };

  const handleSelectResource = (event) => {
    const resourceId = event.target.value;
    setSelectedResourceId(resourceId);
    setValidationErrors([]);
    setError('');

    const resource = resources.find((item) => item.id === resourceId);
    setForm((prev) => ({
      ...prev,
      resourceIdentifier: resource?.resourceCode || resource?.id || '',
      resourceName: resource?.resourceName || '',
      resourceType: resource?.resourceType || '',
      locationIdentifier: '',
      locationName: '',
    }));
  };

  const handleSelectLocation = (event) => {
    const locationName = event.target.value;
    setSelectedLocationName(locationName);
    setValidationErrors([]);
    setError('');

    setForm((prev) => ({
      ...prev,
      locationIdentifier: locationName ? toLocationIdentifier(locationName) : '',
      locationName,
      resourceIdentifier: '',
      resourceName: '',
      resourceType: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPhoneError('');
    setValidationErrors([]);

    if (form.preferredContactPhoneNumber && !/^\d{1,10}$/.test(form.preferredContactPhoneNumber)) {
      setPhoneError('Phone number can contain digits only and must be at most 10 digits');
      return;
    }

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

      await createTicket(user.id || user.userId, payload);
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
    <div className="app-page max-w-5xl">
      <div className="page-header">
        <div>
          <p className="page-kicker">Incident Reporting</p>
          <h1 className="page-title">Report an Incident</h1>
          <p className="page-subtitle">Create a structured issue report with a real resource or location instead of manual identifiers.</p>
        </div>
      </div>

      <Card className="section-card overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="px-6 py-6">
            {error && <div className="soft-alert mb-4 border-red-200 bg-red-50 text-danger">{error}</div>}
            {validationErrors.length > 0 && (
              <div className="soft-alert mb-4 border-red-200 bg-red-50 text-danger">
                <ul className="list-disc pl-4 text-xs space-y-1">
                  {validationErrors.map((value, index) => <li key={`${value}-${index}`}>{value}</li>)}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Incident Category" options={INCIDENT_CATEGORIES} value={form.incidentCategory} onChange={set('incidentCategory')} required />
                <Select label="Priority Level" options={PRIORITY_LEVELS} value={form.priorityLevel} onChange={set('priorityLevel')} required />
              </div>

              <Input label="Ticket Title" value={form.ticketTitle} onChange={set('ticketTitle')} required placeholder="Brief description of the issue" />
              <Textarea label="Description" value={form.description} onChange={set('description')} required placeholder="Provide detailed information about the incident..." />

              <div className="surface-panel-muted px-4 py-4">
                <p className="detail-tile__label">Location Type</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <label className={`inline-flex items-center gap-2 rounded-[14px] border px-4 py-3 text-sm font-semibold cursor-pointer ${locationType === 'resource' ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-border bg-white/80 text-text-secondary'}`}>
                    <input type="radio" name="locType" checked={locationType === 'resource'} onChange={() => handleLocationTypeChange('resource')} />
                    Resource-based
                  </label>
                  <label className={`inline-flex items-center gap-2 rounded-[14px] border px-4 py-3 text-sm font-semibold cursor-pointer ${locationType === 'location' ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-border bg-white/80 text-text-secondary'}`}>
                    <input type="radio" name="locType" checked={locationType === 'location'} onChange={() => handleLocationTypeChange('location')} />
                    Location-based
                  </label>
                </div>
              </div>

              {locationType === 'resource' ? (
                <div className="space-y-4">
                  <Select
                    label="Select Resource"
                    value={selectedResourceId}
                    onChange={handleSelectResource}
                    options={resources.map((resource) => ({
                      value: resource.id,
                      label: `${resource.resourceName} (${resource.resourceCode})${resource.location ? ` - ${resource.location}` : ''}`,
                    }))}
                    disabled={resourcesLoading}
                  />

                  {selectedResource && (
                    <div className="surface-panel-muted px-4 py-4 text-sm text-text-secondary space-y-2">
                      <p><strong>Resource Code:</strong> {selectedResource.resourceCode || '-'}</p>
                      <p><strong>Type:</strong> {getResourceTypeLabel(selectedResource.resourceType)}</p>
                      <p><strong>Location:</strong> {selectedResource.location || '-'}</p>
                      <p><strong>Capacity:</strong> {selectedResource.capacity || '-'}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Select
                    label="Select Location"
                    value={selectedLocationName}
                    onChange={handleSelectLocation}
                    options={locationOptions}
                    disabled={resourcesLoading}
                  />

                  {selectedLocationName && (
                    <div className="surface-panel-muted px-4 py-4">
                      <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <MapPin size={15} />
                        {selectedLocationName}
                      </p>
                      <p className="mt-2 text-xs text-text-muted">
                        {resourcesAtSelectedLocation.length} active resource(s) found at this location.
                      </p>
                      {resourcesAtSelectedLocation.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {resourcesAtSelectedLocation.slice(0, 8).map((resource) => (
                            <span key={resource.id} className="rounded-[10px] border border-border bg-white/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                              {resource.resourceName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="surface-panel-muted px-4 py-4">
                <p className="detail-tile__label">Contact Information</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Name" value={form.preferredContactName} onChange={set('preferredContactName')} />
                  <Input label="Email" type="email" value={form.preferredContactEmailAddress} onChange={set('preferredContactEmailAddress')} />
                  <Input
                    label="Phone"
                    value={form.preferredContactPhoneNumber}
                    onChange={set('preferredContactPhoneNumber')}
                    placeholder="+94771234567"
                    inputMode="numeric"
                    maxLength={10}
                    error={phoneError}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Ticket'}</Button>
              </div>
            </form>
          </div>

          <div className="border-l border-border bg-surface-alt px-6 py-6">
            <p className="page-kicker">Submission Guidance</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Create cleaner, actionable tickets</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-text-secondary">
              <div className="surface-panel-muted px-4 py-4">
                <p className="font-semibold text-text-primary">1. Choose the right source</p>
                <p className="mt-1">Use a specific resource when the issue belongs to a room or asset. Use a location when it affects an area more broadly.</p>
              </div>
              <div className="surface-panel-muted px-4 py-4">
                <p className="font-semibold text-text-primary">2. Be clear in the title</p>
                <p className="mt-1">A short, specific summary helps technicians triage the problem faster and route it correctly.</p>
              </div>
              <div className="surface-panel-muted px-4 py-4">
                <p className="font-semibold text-text-primary">3. Keep contact details reachable</p>
                <p className="mt-1">Phone input accepts digits only and is limited to 10 characters to match the backend validation.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
