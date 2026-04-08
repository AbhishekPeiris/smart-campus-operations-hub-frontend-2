import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getAllTickets } from '../../api/tickets';
import { getStatusBadge, getPriorityBadge, formatDate, TICKET_STATUSES } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { ClipboardList } from 'lucide-react';

export default function MyAssignments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    getAllTickets(0, 200)
      .then((res) => {
        const currentUserId = user?.id || user?.userId;
        const mine = (res.data.data?.content || []).filter((ticket) => ticket.assignedTechnicianId === currentUserId || ticket.assignedTechnicianUserId === currentUserId);
        setTickets(mine);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id, user?.userId]);

  const filtered = statusFilter === 'ALL' ? tickets : tickets.filter((ticket) => ticket.status === statusFilter);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="app-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Technician Queue</p>
          <h1 className="page-title">My Assignments</h1>
          <p className="page-subtitle">Focus on the tickets currently assigned to you and track their working status in one list.</p>
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-w-[200px] text-sm">
          <option value="ALL">All Statuses</option>
          {TICKET_STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
        </select>
      </div>

      <Card className="section-card">
        {filtered.length === 0 ? (
          <EmptyState message="No assignments found" icon={ClipboardList} />
        ) : (
          <div className="app-list">
            {filtered.map((ticket) => (
              <div key={ticket.id} onClick={() => navigate(`/dashboard/tickets/${ticket.id}`)} className="app-list-item cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{ticket.ticketTitle}</p>
                    <p className="mt-1 text-xs text-text-muted">{ticket.ticketCode} - {formatDate(ticket.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Badge className={getPriorityBadge(ticket.priorityLevel).color}>{getPriorityBadge(ticket.priorityLevel).label}</Badge>
                    <Badge className={getStatusBadge(ticket.status).color}>{getStatusBadge(ticket.status).label}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
