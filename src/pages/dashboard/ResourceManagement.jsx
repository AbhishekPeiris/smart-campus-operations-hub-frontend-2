import { useState, useEffect, useCallback } from 'react';
import { searchResources, createResource, updateResource, updateResourceStatus, deleteResource } from '../../api/resources';
import { RESOURCE_TYPES, RESOURCE_STATUSES, DAYS_OF_WEEK, getResourceTypeLabel, getResourceStatusBadge } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { Plus, Pencil, Trash2, Building2, Power, PowerOff } from 'lucide-react';

const emptyForm = {
  resourceCode: '',
  resourceName: '',
  resourceType: '',
  capacity: '',
  location: '',
  status: 'ACTIVE',
  description: '',
  availabilityWindows: [],
};

export default function ResourceManagement() {
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    searchResources({ resourceType: typeFilter || undefined, status: statusFilter || undefined, page, size: 10 })
      .then((res) => setData(res.data.data || { content: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (resource) => {
    setEditId(resource.id);
    setForm({
      resourceCode: resource.resourceCode || '',
      resourceName: resource.resourceName || '',
      resourceType: resource.resourceType || '',
      capacity: resource.capacity || '',
      location: resource.location || '',
      status: resource.status || 'ACTIVE',
      description: resource.description || '',
      availabilityWindows: resource.availabilityWindows || [],
    });
    setFormError('');
    setFormOpen(true);
  };

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const validateForm = () => {
    if (!form.resourceCode.trim()) return 'Resource Code is required';
    if (!form.resourceName.trim()) return 'Resource Name is required';
    if (!form.resourceType) return 'Resource Type is required';
    if (form.capacity && Number.isNaN(Number(form.capacity))) return 'Capacity must be a valid number';
    return '';
  };

  const addWindow = () => setForm((prev) => ({ ...prev, availabilityWindows: [...prev.availabilityWindows, { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '18:00' }] }));
  const removeWindow = (index) => setForm((prev) => ({ ...prev, availabilityWindows: prev.availabilityWindows.filter((_, currentIndex) => currentIndex !== index) }));
  const updateWindow = (index, key, value) => setForm((prev) => ({
    ...prev,
    availabilityWindows: prev.availabilityWindows.map((window, currentIndex) => currentIndex === index ? { ...window, [key]: value } : window),
  }));

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.capacity) {
        payload.capacity = parseInt(payload.capacity, 10);
        if (Number.isNaN(payload.capacity)) {
          setFormError('Capacity must be a valid number');
          setSaving(false);
          return;
        }
      } else {
        delete payload.capacity;
      }

      if (editId) {
        await updateResource(editId, payload);
      } else {
        await createResource(payload);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      const errorMsg = err.response?.data?.message || (err.response?.status === 403 ? 'You do not have permission to perform this action' : 'Failed to save resource');
      setFormError(errorMsg);
      console.error('Resource save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (resource) => {
    const newStatus = resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      await updateResourceStatus(resource.id, newStatus);
      load();
    } catch (err) {
      console.error('Failed to update resource status:', err);
      alert(err.response?.data?.message || 'Failed to update resource status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    setDeleting(id);
    try {
      await deleteResource(id);
      load();
    } catch (err) {
      console.error('Failed to delete resource:', err);
      alert(err.response?.data?.message || 'Failed to delete resource');
    } finally {
      setDeleting(null);
    }
  };

  const resources = data.content || [];

  return (
    <div className="app-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Facilities</p>
          <h1 className="page-title">Resource Management</h1>
          <p className="page-subtitle">Maintain campus spaces and equipment with cleaner list management and structured availability windows.</p>
        </div>
        <Button onClick={openCreate}><Plus size={14} /> Add Resource</Button>
      </div>

      <Card className="toolbar-panel">
        <div className="filter-grid">
          <select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setPage(0); }} className="text-sm">
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(0); }} className="text-sm">
            <option value="">All Statuses</option>
            {RESOURCE_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </div>
      </Card>

      <Card className="section-card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : resources.length === 0 ? (
          <EmptyState message="No resources found" icon={Building2} />
        ) : (
          <>
            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id}>
                      <td className="font-mono text-xs text-text-muted">{resource.resourceCode}</td>
                      <td className="font-semibold text-text-primary">{resource.resourceName}</td>
                      <td className="text-xs text-text-secondary">{getResourceTypeLabel(resource.resourceType)}</td>
                      <td className="text-xs text-text-muted">{resource.location || '-'}</td>
                      <td className="text-xs text-text-secondary">{resource.capacity || '-'}</td>
                      <td><Badge className={getResourceStatusBadge(resource.status).color}>{getResourceStatusBadge(resource.status).label}</Badge></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(resource)} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-primary-200 bg-primary-50 text-primary-700 transition-colors hover:bg-primary-100" title="Edit"><Pencil size={13} /></button>
                          <button onClick={() => handleToggleStatus(resource)} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-amber-200 bg-amber-50 text-amber-700 transition-colors hover:bg-amber-100" title={resource.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                            {resource.status === 'ACTIVE' ? <PowerOff size={13} /> : <Power size={13} />}
                          </button>
                          <button onClick={() => handleDelete(resource.id)} disabled={deleting === resource.id} className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-red-200 bg-red-50 text-danger transition-colors hover:bg-red-100 disabled:opacity-50" title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-4">
              <Pagination currentPage={data.currentPage || 0} totalPages={data.totalPages || 0} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editId ? 'Edit Resource' : 'Create Resource'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="soft-alert border-red-200 bg-red-50 text-danger">{formError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Resource Code" value={form.resourceCode} onChange={set('resourceCode')} required placeholder="LH-A-01" />
            <Input label="Resource Name" value={form.resourceName} onChange={set('resourceName')} required placeholder="Lecture Hall A" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Resource Type" options={RESOURCE_TYPES} value={form.resourceType} onChange={set('resourceType')} required />
            <Input label="Capacity" type="number" value={form.capacity} onChange={set('capacity')} placeholder="120" />
            <Select label="Status" options={RESOURCE_STATUSES} value={form.status} onChange={set('status')} />
          </div>
          <Input label="Location" value={form.location} onChange={set('location')} placeholder="Engineering Block - Floor 1" />
          <Textarea label="Description" value={form.description} onChange={set('description')} placeholder="Description of the resource..." />

          <div className="surface-panel-muted px-4 py-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="detail-tile__label">Availability Windows</p>
                <p className="mt-1 text-sm text-text-secondary">Define when this resource can be booked.</p>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={addWindow}><Plus size={12} /> Add Window</Button>
            </div>
            {form.availabilityWindows.length === 0 && <p className="text-xs text-text-muted">No availability windows defined.</p>}
            <div className="space-y-3">
              {form.availabilityWindows.map((window, index) => (
                <div key={`${window.dayOfWeek}-${index}`} className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <label className="block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-muted mb-2">Day</label>
                    <select value={window.dayOfWeek} onChange={(event) => updateWindow(index, 'dayOfWeek', event.target.value)} className="w-full px-4 py-3 text-sm">
                      {DAYS_OF_WEEK.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
                    </select>
                  </div>
                  <Input label="Start" type="time" value={window.startTime} onChange={(event) => updateWindow(index, 'startTime', event.target.value)} />
                  <Input label="End" type="time" value={window.endTime} onChange={(event) => updateWindow(index, 'endTime', event.target.value)} />
                  <button type="button" onClick={() => removeWindow(index)} className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-red-200 bg-red-50 text-danger transition-colors hover:bg-red-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update' : 'Create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
