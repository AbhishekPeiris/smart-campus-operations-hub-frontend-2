import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllTickets } from '../../api/tickets';
import { getMyBookings } from '../../api/bookings';
import { getStatusBadge, getPriorityBadge, getBookingStatusBadge, formatDate, formatDateShort } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { Ticket, AlertTriangle, CheckCircle, Clock, Plus, CalendarDays, CalendarPlus } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllTickets(0, 100).then(res => {
        const mine = (res.data.data?.content || []).filter(t => t.createdByUserId === user.userId);
        setTickets(mine);
      }).catch(() => {}),
      getMyBookings({ size: 100 }).then(res => setBookings(res.data.data?.content || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user.userId]);

  const ticketCounts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  const bookingCounts = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
  };

  const stats = [
    { label: 'Total Tickets', value: ticketCounts.total, icon: Ticket, color: 'text-primary-600 bg-primary-50' },
    { label: 'Open Tickets', value: ticketCounts.open, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'In Progress', value: ticketCounts.inProgress, icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { label: 'Resolved', value: ticketCounts.resolved, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Bookings', value: bookingCounts.total, icon: CalendarDays, color: 'text-violet-600 bg-violet-50' },
    { label: 'Pending Bookings', value: bookingCounts.pending, icon: Clock, color: 'text-orange-600 bg-orange-50' },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Welcome back, {user.fullName}</h1>
          <p className="text-sm text-text-muted mt-0.5">Here's an overview of your activity</p>
        </div>
        <div className="flex gap-2">
          <Link to="/portal/book" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-border text-text-secondary text-sm font-medium rounded-md hover:bg-surface-alt">
            <CalendarPlus size={16} /> Book Resource
          </Link>
          <Link to="/portal/new-ticket" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
            <Plus size={16} /> Report Incident
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="text-2xl font-semibold mt-1">{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon size={20} /></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Tickets</h3>
            <Link to="/portal/tickets" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {tickets.length === 0 ? (
            <p className="p-8 text-center text-sm text-text-muted">No tickets yet</p>
          ) : (
            <div className="divide-y divide-border">
              {tickets.slice(0, 5).map(t => (
                <Link key={t.id} to={`/portal/tickets/${t.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-surface-alt transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{t.ticketTitle}</p>
                    <p className="text-xs text-text-muted mt-0.5">{t.ticketCode} · {formatDate(t.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Badge className={getPriorityBadge(t.priorityLevel).color}>{getPriorityBadge(t.priorityLevel).label}</Badge>
                    <Badge className={getStatusBadge(t.status).color}>{getStatusBadge(t.status).label}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Bookings</h3>
            <Link to="/portal/bookings" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {bookings.length === 0 ? (
            <p className="p-8 text-center text-sm text-text-muted">No bookings yet</p>
          ) : (
            <div className="divide-y divide-border">
              {bookings.slice(0, 5).map(b => {
                const bs = getBookingStatusBadge(b.status);
                return (
                  <div key={b.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{b.resourceName || b.resourceId}</p>
                      <p className="text-xs text-text-muted mt-0.5">{formatDateShort(b.bookingDate)} · {b.startTime}–{b.endTime}</p>
                    </div>
                    <Badge className={bs.color}>{bs.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
