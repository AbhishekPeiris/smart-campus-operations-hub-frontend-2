import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
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
    getAllTickets(0, 200)
      .then((res) => {
        const mine = (res.data.data?.content || []).filter((ticket) => ticket.createdByUserId === user.userId || ticket.createdByUserId === user.id);
        setTickets(mine);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.userId, user.id]);

  const filtered = statusFilter === 'ALL' ? tickets : tickets.filter((ticket) => ticket.status === statusFilter);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="app-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Incident Desk</p>
          <h1 className="page-title">My Tickets</h1>
          <p className="page-subtitle">Review every incident you have reported and quickly jump into the detailed ticket timeline.</p>
        </div>
        <div className="surface-panel-muted flex items-center gap-2 px-4 py-3">
          <Filter size={14} className="text-primary-700" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-w-[190px] text-sm">
            <option value="ALL">All Statuses</option>
            {TICKET_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </div>
      </div>

      <Card className="section-card">
        {filtered.length === 0 ? (
          <EmptyState message="No tickets found" icon={FileText} />
        ) : (
          <div className="app-list">
            {filtered.map((ticket) => (
              <Link key={ticket.id} to={`/portal/tickets/${ticket.id}`} className="app-list-item block">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary">{ticket.ticketTitle}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                      <span>{ticket.ticketCode}</span>
                      <span>{getCategoryLabel(ticket.incidentCategory)}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={getPriorityBadge(ticket.priorityLevel).color}>{getPriorityBadge(ticket.priorityLevel).label}</Badge>
                    <Badge className={getStatusBadge(ticket.status).color}>{getStatusBadge(ticket.status).label}</Badge>
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
