import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    getAllTickets(0, 200).then(res => {
      const mine = (res.data.data?.content || []).filter(t => t.assignedTechnicianId === user.userId || t.assignedTechnicianUserId === user.userId);
      setTickets(mine);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user.userId]);

  const filtered = statusFilter === 'ALL' ? tickets : tickets.filter(t => t.status === statusFilter);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">My Assignments</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-xs border border-border rounded-md px-2 py-1.5 bg-white">
          <option value="ALL">All Statuses</option>
          {TICKET_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <Card>
        {filtered.length === 0 ? <EmptyState message="No assignments found" icon={ClipboardList} /> : (
          <div className="divide-y divide-border">
            {filtered.map(t => (
              <div key={t.id} onClick={() => navigate(`/dashboard/tickets/${t.id}`)}
                className="px-4 py-3.5 hover:bg-surface-alt cursor-pointer transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{t.ticketTitle}</p>
                    <p className="text-xs text-text-muted mt-1">{t.ticketCode} · {formatDate(t.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Badge className={getPriorityBadge(t.priorityLevel).color}>{getPriorityBadge(t.priorityLevel).label}</Badge>
                    <Badge className={getStatusBadge(t.status).color}>{getStatusBadge(t.status).label}</Badge>
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
