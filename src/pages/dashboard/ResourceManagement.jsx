import { useState, useEffect } from 'react';
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
  resourceCode: '', resourceName: '', resourceType: '', capacity: '', location: '', status: 'ACTIVE', description: '',
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

  const load = () => {
    setLoading(true);
    searchResources({ resourceType: typeFilter || undefined, status: statusFilter || undefined, page, size: 10 })
      .then(res => setData(res.data.data || { content: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, typeFilter, statusFilter]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (r) => {
    setEditId(r.id);
    setForm({
      resourceCode: r.resourceCode || '',
      resourceName: r.resourceName || '',
      resourceType: r.resourceType || '',
      capacity: r.capacity || '',
      location: r.location || '',
      status: r.status || 'ACTIVE',
      description: r.description || '',
      availabilityWindows: r.availabilityWindows || [],
    });
    setFormError('');
    setFormOpen(true);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const addWindow = () => setForm(f => ({ ...f, availabilityWindows: [...f.availabilityWindows, { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '18:00' }] }));
  const removeWindow = (i) => setForm(f => ({ ...f, availabilityWindows: f.availabilityWindows.filter((_, idx) => idx !== i) }));
  const updateWindow = (i, k, v) => setForm(f => ({
    ...f,
    availabilityWindows: f.availabilityWindows.map((w, idx) => idx === i ? { ...w, [k]: v } : w)
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.capacity) payload.capacity = parseInt(payload.capacity, 10);
      else delete payload.capacity;
      if (editId) await updateResource(editId, payload);
      else await createResource(payload);
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save resource');
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async (r) => {
    const newStatus = r.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      await updateResourceStatus(r.id, newStatus);
      load();
    } catch {}
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteResource(id);
      load();
    } catch {} finally { setDeleting(null); }
  };

  const resources = data.content || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Resource Management</h1>
        <Button onClick={openCreate}><Plus size={14} className="mr-1" /> Add Resource</Button>
      </div>

      <Card className="p-3 mb-4">
        <div className="flex items-center gap-3">
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
            className="text-xs border border-border rounded-md px-2 py-1.5 bg-white">
            <option value="">All Types</option>
            {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="text-xs border border-border rounded-md px-2 py-1.5 bg-white">
            <option value="">All Statuses</option>
            {RESOURCE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : resources.length === 0 ? (
          <EmptyState message="No resources found" icon={Building2} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt text-xs text-text-muted">
                    <th className="text-left px-4 py-2 font-medium">Code</th>
                    <th className="text-left px-4 py-2 font-medium">Name</th>
                    <th className="text-left px-4 py-2 font-medium">Type</th>
                    <th className="text-left px-4 py-2 font-medium">Location</th>
                    <th className="text-left px-4 py-2 font-medium">Capacity</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-left px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resources.map(r => (
                    <tr key={r.id} className="hover:bg-surface-alt/50">
                      <td className="px-4 py-2.5 text-xs font-mono text-text-muted">{r.resourceCode}</td>
                      <td className="px-4 py-2.5 font-medium">{r.resourceName}</td>
                      <td className="px-4 py-2.5 text-xs">{getResourceTypeLabel(r.resourceType)}</td>
                      <td className="px-4 py-2.5 text-xs text-text-muted">{r.location || '—'}</td>
                      <td className="px-4 py-2.5 text-xs">{r.capacity || '—'}</td>
                      <td className="px-4 py-2.5"><Badge className={getResourceStatusBadge(r.status).color}>{getResourceStatusBadge(r.status).label}</Badge></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-surface-alt text-text-muted hover:text-primary-600" title="Edit"><Pencil size={13} /></button>
                          <button onClick={() => handleToggleStatus(r)} className="p-1.5 rounded hover:bg-surface-alt text-text-muted hover:text-amber-600" title={r.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                            {r.status === 'ACTIVE' ? <PowerOff size={13} /> : <Power size={13} />}
                          </button>
                          <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="p-1.5 rounded hover:bg-surface-alt text-text-muted hover:text-danger disabled:opacity-50" title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3">
              <Pagination currentPage={data.currentPage || 0} totalPages={data.totalPages || 0} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editId ? 'Edit Resource' : 'Create Resource'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-danger">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Resource Code *" value={form.resourceCode} onChange={set('resourceCode')} required placeholder="LH-A-01" />
            <Input label="Resource Name *" value={form.resourceName} onChange={set('resourceName')} required placeholder="Lecture Hall A" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select label="Resource Type *" options={RESOURCE_TYPES} value={form.resourceType} onChange={set('resourceType')} required />
            <Input label="Capacity" type="number" value={form.capacity} onChange={set('capacity')} placeholder="120" />
            <Select label="Status" options={RESOURCE_STATUSES} value={form.status} onChange={set('status')} />
          </div>
          <Input label="Location" value={form.location} onChange={set('location')} placeholder="Engineering Block - Floor 1" />
          <Textarea label="Description" value={form.description} onChange={set('description')} placeholder="Description of the resource..." />

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-text-secondary">Availability Windows</p>
              <Button type="button" size="sm" variant="secondary" onClick={addWindow}><Plus size={12} className="mr-1" /> Add Window</Button>
            </div>
            {form.availabilityWindows.length === 0 && <p className="text-xs text-text-muted">No availability windows defined.</p>}
            {form.availabilityWindows.map((w, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-end">
                <div>
                  <label className="text-[10px] text-text-muted">Day</label>
                  <select value={w.dayOfWeek} onChange={e => updateWindow(i, 'dayOfWeek', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-white">
                    {DAYS_OF_WEEK.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted">Start</label>
                  <input type="time" value={w.startTime} onChange={e => updateWindow(i, 'startTime', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-white" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted">End</label>
                  <input type="time" value={w.endTime} onChange={e => updateWindow(i, 'endTime', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-border rounded-md bg-white" />
                </div>
                <button type="button" onClick={() => removeWindow(i)} className="p-1.5 text-text-muted hover:text-danger self-end mb-0.5"><Trash2 size={13} /></button>
              </div>
            ))}
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
