import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllTickets } from '../../api/tickets';
import { getStatusBadge, getPriorityBadge, getCategoryLabel, formatDate, TICKET_STATUSES } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { FileText, Filter } from 'lucide-react';

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    getAllTickets(0, 200).then(res => {
      const mine = (res.data.data?.content || []).filter(t => t.createdByUserId === user.userId);
      setTickets(mine);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user.userId]);

  const filtered = statusFilter === 'ALL' ? tickets : tickets.filter(t => t.status === statusFilter);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">My Tickets</h1>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-muted" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-border rounded-md px-2 py-1.5 bg-white">
            <option value="ALL">All Statuses</option>
            {TICKET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <Card>
        {filtered.length === 0 ? <EmptyState message="No tickets found" icon={FileText} /> : (
          <div className="divide-y divide-border">
            {filtered.map(t => (
              <Link key={t.id} to={`/portal/tickets/${t.id}`} className="block px-4 py-3.5 hover:bg-surface-alt transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{t.ticketTitle}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                      <span>{t.ticketCode}</span>
                      <span>{getCategoryLabel(t.incidentCategory)}</span>
                      <span>{formatDate(t.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={getPriorityBadge(t.priorityLevel).color}>{getPriorityBadge(t.priorityLevel).label}</Badge>
                    <Badge className={getStatusBadge(t.status).color}>{getStatusBadge(t.status).label}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
