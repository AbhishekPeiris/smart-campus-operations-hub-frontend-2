import { useState, useEffect } from 'react';
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

  const load = (p) => {
    setLoading(true);
    getAllTickets(p, 15).then(res => setData(res.data.data || { content: [], totalPages: 0 }))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  let filtered = data.content || [];
  if (statusFilter !== 'ALL') filtered = filtered.filter(t => t.status === statusFilter);
  if (priorityFilter !== 'ALL') filtered = filtered.filter(t => t.priorityLevel === priorityFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">All Tickets</h1>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-border rounded-md px-2 py-1.5 bg-white">
            <option value="ALL">All Statuses</option>
            {TICKET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="text-xs border border-border rounded-md px-2 py-1.5 bg-white">
            <option value="ALL">All Priorities</option>
            {PRIORITY_LEVELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>
      <Card>
        {loading ? <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div> :
          filtered.length === 0 ? <EmptyState message="No tickets found" icon={Ticket} /> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-alt text-xs text-text-muted">
                      <th className="text-left px-4 py-2 font-medium">Code</th>
                      <th className="text-left px-4 py-2 font-medium">Title</th>
                      <th className="text-left px-4 py-2 font-medium">Category</th>
                      <th className="text-left px-4 py-2 font-medium">Priority</th>
                      <th className="text-left px-4 py-2 font-medium">Status</th>
                      <th className="text-left px-4 py-2 font-medium">Reporter</th>
                      <th className="text-left px-4 py-2 font-medium">Assigned</th>
                      <th className="text-left px-4 py-2 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(t => (
                      <tr key={t.id} className="hover:bg-surface-alt/50 cursor-pointer" onClick={() => navigate(`/dashboard/tickets/${t.id}`)}>
                        <td className="px-4 py-2.5 text-xs text-text-muted font-mono">{t.ticketCode}</td>
                        <td className="px-4 py-2.5 font-medium max-w-[180px] truncate">{t.ticketTitle}</td>
                        <td className="px-4 py-2.5 text-xs">{getCategoryLabel(t.incidentCategory)}</td>
                        <td className="px-4 py-2.5"><Badge className={getPriorityBadge(t.priorityLevel).color}>{getPriorityBadge(t.priorityLevel).label}</Badge></td>
                        <td className="px-4 py-2.5"><Badge className={getStatusBadge(t.status).color}>{getStatusBadge(t.status).label}</Badge></td>
                        <td className="px-4 py-2.5 text-xs text-text-muted">{t.createdByName}</td>
                        <td className="px-4 py-2.5 text-xs text-text-muted">{t.assignedTechnicianName || '—'}</td>
                        <td className="px-4 py-2.5 text-xs text-text-muted">{formatDate(t.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-3">
                <Pagination currentPage={data.currentPage} totalPages={data.totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
      </Card>
    </div>
  );
}
