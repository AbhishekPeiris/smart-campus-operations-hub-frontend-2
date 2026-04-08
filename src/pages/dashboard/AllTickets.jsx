import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTickets } from '../../api/tickets';
import { getStatusBadge, getPriorityBadge, getCategoryLabel, formatDate, TICKET_STATUSES, PRIORITY_LEVELS } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { Ticket } from 'lucide-react';

export default function AllTickets() {
  const navigate = useNavigate();
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const load = useCallback((nextPage) => {
    setLoading(true);
    getAllTickets(nextPage, 15)
      .then((res) => setData(res.data.data || { content: [], totalPages: 0 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load(page);
    }, 0);

    return () => clearTimeout(timer);
  }, [load, page]);

  let filtered = data.content || [];
  if (statusFilter !== 'ALL') filtered = filtered.filter((ticket) => ticket.status === statusFilter);
  if (priorityFilter !== 'ALL') filtered = filtered.filter((ticket) => ticket.priorityLevel === priorityFilter);

  return (
    <div className="app-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Service Desk</p>
          <h1 className="page-title">All Tickets</h1>
          <p className="page-subtitle">Review every reported issue with structured filters and a cleaner operational queue.</p>
        </div>
      </div>

      <Card className="toolbar-panel">
        <div className="filter-grid">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="text-sm">
            <option value="ALL">All Statuses</option>
            {TICKET_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
          <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="text-sm">
            <option value="ALL">All Priorities</option>
            {PRIORITY_LEVELS.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
          </select>
        </div>
      </Card>

      <Card className="section-card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No tickets found" icon={Ticket} />
        ) : (
          <>
            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Reporter</th>
                    <th>Assigned</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ticket) => (
                    <tr key={ticket.id} className="cursor-pointer" onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)}>
                      <td className="font-mono text-xs text-text-muted">{ticket.ticketCode}</td>
                      <td className="max-w-[220px] truncate font-semibold text-text-primary">{ticket.ticketTitle}</td>
                      <td className="text-xs text-text-secondary">{getCategoryLabel(ticket.incidentCategory)}</td>
                      <td><Badge className={getPriorityBadge(ticket.priorityLevel).color}>{getPriorityBadge(ticket.priorityLevel).label}</Badge></td>
                      <td><Badge className={getStatusBadge(ticket.status).color}>{getStatusBadge(ticket.status).label}</Badge></td>
                      <td className="text-xs text-text-muted">{ticket.createdByName}</td>
                      <td className="text-xs text-text-muted">{ticket.assignedTechnicianName || '-'}</td>
                      <td className="text-xs text-text-muted">{formatDate(ticket.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-4">
              <Pagination currentPage={data.currentPage} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
