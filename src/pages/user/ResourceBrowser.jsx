import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchResources } from '../../api/resources';
import { RESOURCE_TYPES, RESOURCE_STATUSES, getResourceTypeLabel, getResourceStatusBadge } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { Search, MapPin, Users, Calendar, Building2 } from 'lucide-react';

export default function ResourceBrowser() {
  const navigate = useNavigate();
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ resourceType: '', minCapacity: '', location: '', status: 'ACTIVE' });

  const load = () => {
    setLoading(true);
    searchResources({ ...filters, page, size: 12 })
      .then(res => setData(res.data.data || { content: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    load();
  };

  const resources = data.content || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Browse Resources</h1>
      </div>

      <Card className="p-4 mb-5">
        <form onSubmit={handleSearch} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select value={filters.resourceType} onChange={e => setFilters(f => ({ ...f, resourceType: e.target.value }))}
            className="text-xs border border-border rounded-md px-2 py-2 bg-white">
            <option value="">All Types</option>
            {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            placeholder="Location..." className="text-xs border border-border rounded-md px-3 py-2 bg-white" />
          <input type="number" value={filters.minCapacity} onChange={e => setFilters(f => ({ ...f, minCapacity: e.target.value }))}
            placeholder="Min capacity" className="text-xs border border-border rounded-md px-3 py-2 bg-white" />
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="text-xs border border-border rounded-md px-2 py-2 bg-white">
            <option value="">All Statuses</option>
            {RESOURCE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button type="submit" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700">
            <Search size={13} /> Search
          </button>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : resources.length === 0 ? (
        <Card><EmptyState message="No resources found" icon={Building2} /></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(r => (
              <Card key={r.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/portal/book?resourceId=${r.id}&resourceName=${encodeURIComponent(r.resourceName)}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{r.resourceName}</p>
                    <p className="text-[11px] text-text-muted font-mono mt-0.5">{r.resourceCode}</p>
                  </div>
                  <Badge className={getResourceStatusBadge(r.status).color}>{getResourceStatusBadge(r.status).label}</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-text-secondary">
                  <div className="flex items-center gap-2"><Building2 size={12} className="text-text-muted shrink-0" />{getResourceTypeLabel(r.resourceType)}</div>
                  {r.location && <div className="flex items-center gap-2"><MapPin size={12} className="text-text-muted shrink-0" />{r.location}</div>}
                  {r.capacity && <div className="flex items-center gap-2"><Users size={12} className="text-text-muted shrink-0" />Capacity: {r.capacity}</div>}
                  {r.availabilityWindows?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Calendar size={12} className="text-text-muted shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {r.availabilityWindows.slice(0, 3).map((w, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-surface-alt rounded text-[10px]">{w.dayOfWeek?.slice(0, 3)} {w.startTime}-{w.endTime}</span>
                        ))}
                        {r.availabilityWindows.length > 3 && <span className="text-[10px] text-text-muted">+{r.availabilityWindows.length - 3} more</span>}
                      </div>
                    </div>
                  )}
                </div>
                {r.description && <p className="text-xs text-text-muted mt-2 line-clamp-2">{r.description}</p>}
                {r.status === 'ACTIVE' && (
                  <button className="mt-3 w-full text-xs font-medium text-primary-600 bg-primary-50 py-1.5 rounded-md hover:bg-primary-100 transition-colors">
                    Book This Resource →
                  </button>
                )}
              </Card>
            ))}
          </div>
          <div className="mt-4">
            <Pagination currentPage={data.currentPage || 0} totalPages={data.totalPages || 0} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
