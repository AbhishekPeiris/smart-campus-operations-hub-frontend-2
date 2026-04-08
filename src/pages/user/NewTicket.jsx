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
    const uniqueLocations = [...new Set(
      resources
        .map((resource) => resource.location)
        .filter(Boolean)
    )];

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

      setForm({ ...form, [key]: digitsOnlyValue });
      return;
    }

    setForm({ ...form, [key]: event.target.value });
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

    if (
      form.preferredContactPhoneNumber
      && !/^\d{1,10}$/.test(form.preferredContactPhoneNumber)
    ) {
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold mb-5">Report an Incident</h1>
      <Card className="p-6">
        {error && <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-danger">{error}</div>}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded">
            <ul className="list-disc pl-4 text-xs text-danger space-y-1">
              {validationErrors.map((value, index) => <li key={`${value}-${index}`}>{value}</li>)}
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
                <input type="radio" name="locType" checked={locationType === 'resource'} onChange={() => handleLocationTypeChange('resource')} className="accent-primary-600" />
                <span>Resource-based</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="locType" checked={locationType === 'location'} onChange={() => handleLocationTypeChange('location')} className="accent-primary-600" />
                <span>Location-based</span>
              </label>
            </div>
          </div>

          {locationType === 'resource' ? (
            <div className="space-y-4">
              <Select
                label="Select Resource *"
                value={selectedResourceId}
                onChange={handleSelectResource}
                options={resources.map((resource) => ({
                  value: resource.id,
                  label: `${resource.resourceName} (${resource.resourceCode})${resource.location ? ` - ${resource.location}` : ''}`,
                }))}
                disabled={resourcesLoading}
              />

              {selectedResource && (
                <div className="rounded-md border border-border bg-surface-alt px-4 py-3 text-xs text-text-secondary space-y-2">
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
                label="Select Location *"
                value={selectedLocationName}
                onChange={handleSelectLocation}
                options={locationOptions}
                disabled={resourcesLoading}
              />

              {selectedLocationName && (
                <div className="rounded-md border border-border bg-surface-alt px-4 py-3">
                  <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                    <MapPin size={14} />
                    {selectedLocationName}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {resourcesAtSelectedLocation.length} active resource(s) found at this location.
                  </p>
                  {resourcesAtSelectedLocation.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resourcesAtSelectedLocation.slice(0, 8).map((resource) => (
                        <span key={resource.id} className="px-2 py-1 rounded-full bg-white border border-border text-xs text-text-secondary">
                          {resource.resourceName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-text-secondary mb-3">Contact Information</p>
            <div className="grid grid-cols-3 gap-4">
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
      </Card>
    </div>
  );
}
