import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchResources } from '../../api/resources';
import { RESOURCE_TYPES, RESOURCE_STATUSES, getResourceTypeLabel, getResourceStatusBadge } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
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

  const load = useCallback(() => {
    setLoading(true);
    searchResources({ ...filters, page, size: 12 })
      .then((res) => setData(res.data.data || { content: [] }))
      .catch((err) => {
        console.error('Failed to load resources:', err);
      })
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);

    return () => clearTimeout(timer);
  }, [load]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(0);
    load();
  };

  const resources = data.content || [];

  return (
    <div className="app-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Campus Spaces</p>
          <h1 className="page-title">Browse Resources</h1>
          <p className="page-subtitle">Explore available rooms, labs, and shared campus assets before submitting a booking request.</p>
        </div>
      </div>

      <Card className="toolbar-panel">
        <form onSubmit={handleSearch} className="filter-grid">
          <select value={filters.resourceType} onChange={(event) => setFilters((prev) => ({ ...prev, resourceType: event.target.value }))} className="text-sm">
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
          <input value={filters.location} onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))} placeholder="Location" className="text-sm" />
          <input type="number" value={filters.minCapacity} onChange={(event) => setFilters((prev) => ({ ...prev, minCapacity: event.target.value }))} placeholder="Minimum capacity" className="text-sm" />
          <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} className="text-sm">
            <option value="">All Statuses</option>
            {RESOURCE_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
          <Button type="submit">
            <Search size={15} />
            Search
          </Button>
        </form>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : resources.length === 0 ? (
        <Card><EmptyState message="No resources found" icon={Building2} /></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {resources.map((resource) => (
              <Card
                key={resource.id}
                className="group relative overflow-hidden px-5 py-5 transition-transform duration-150 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/portal/book?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.resourceName)}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-text-primary">{resource.resourceName}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{resource.resourceCode}</p>
                  </div>
                  <Badge className={getResourceStatusBadge(resource.status).color}>{getResourceStatusBadge(resource.status).label}</Badge>
                </div>

                <div className="mt-5 space-y-3 text-sm text-text-secondary">
                  <div className="flex items-center gap-2"><Building2 size={15} className="text-text-muted shrink-0" />{getResourceTypeLabel(resource.resourceType)}</div>
                  {resource.location && <div className="flex items-center gap-2"><MapPin size={15} className="text-text-muted shrink-0" />{resource.location}</div>}
                  {resource.capacity && <div className="flex items-center gap-2"><Users size={15} className="text-text-muted shrink-0" />Capacity: {resource.capacity}</div>}
                  {resource.availabilityWindows?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Calendar size={15} className="text-text-muted shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-2">
                        {resource.availabilityWindows.slice(0, 3).map((window, index) => (
                          <span key={`${window.dayOfWeek}-${index}`} className="rounded-[10px] border border-border bg-white/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                            {window.dayOfWeek?.slice(0, 3)} {window.startTime}-{window.endTime}
                          </span>
                        ))}
                        {resource.availabilityWindows.length > 3 && <span className="text-[11px] text-text-muted">+{resource.availabilityWindows.length - 3} more</span>}
                      </div>
                    </div>
                  )}
                </div>

                {resource.description && <p className="mt-4 text-sm leading-6 text-text-muted line-clamp-2">{resource.description}</p>}

                {resource.status === 'ACTIVE' && (
                  <div className="mt-5 flex items-center justify-between rounded-[18px] border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition-colors group-hover:bg-primary-100">
                    <span>Book this resource</span>
                    <span aria-hidden="true">+</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
          <div className="mt-5">
            <Pagination currentPage={data.currentPage || 0} totalPages={data.totalPages || 0} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
