import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllTickets } from '../../api/tickets';
import { getAllUsers } from '../../api/users';
import { getAllBookings } from '../../api/bookings';
import { searchResources } from '../../api/resources';
import { getStatusBadge, getPriorityBadge, getBookingStatusBadge, formatDate, formatDateShort } from '../../utils/constants';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { Ticket, Users, AlertTriangle, CheckCircle, Clock, ShieldAlert, Building2, CalendarDays } from 'lucide-react';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [resourceCount, setResourceCount] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const promises = [
      getAllTickets(0, 200).catch(() => ({ data: { data: { content: [], totalElements: 0 } } })),
      getAllUsers(0, 1).catch(() => ({ data: { data: { totalElements: 0 } } })),
    ];
    if (isAdmin) {
      promises.push(getAllBookings({ size: 200 }).catch(() => ({ data: { data: { content: [], totalElements: 0 } } })));
      promises.push(searchResources({ size: 1 }).catch(() => ({ data: { data: { totalElements: 0 } } })));
    }
    Promise.all(promises).then(([tRes, uRes, bRes, rRes]) => {
      setTickets(tRes.data.data?.content || []);
      setUserCount(uRes.data.data?.totalElements || 0);
      if (isAdmin && bRes) {
        const bContent = bRes.data.data?.content || [];
        setBookingCount(bRes.data.data?.totalElements || bContent.length);
        setPendingBookings(bContent.filter(b => b.status === 'PENDING').length);
        setRecentBookings(bContent.slice(0, 5));
      }
      if (isAdmin && rRes) {
        setResourceCount(rRes.data.data?.totalElements || 0);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;

  const counts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    critical: tickets.filter(t => t.priorityLevel === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length,
  };

  const stats = [
    { label: 'Total Tickets', value: counts.total, icon: Ticket, bg: 'bg-primary-50', fg: 'text-primary-600' },
    { label: 'Open', value: counts.open, icon: AlertTriangle, bg: 'bg-amber-50', fg: 'text-amber-600' },
    { label: 'In Progress', value: counts.inProgress, icon: Clock, bg: 'bg-blue-50', fg: 'text-blue-600' },
    { label: 'Resolved', value: counts.resolved, icon: CheckCircle, bg: 'bg-emerald-50', fg: 'text-emerald-600' },
    { label: 'Critical Active', value: counts.critical, icon: ShieldAlert, bg: 'bg-red-50', fg: 'text-red-600' },
    ...(isAdmin ? [
      { label: 'Total Users', value: userCount, icon: Users, bg: 'bg-violet-50', fg: 'text-violet-600' },
      { label: 'Resources', value: resourceCount, icon: Building2, bg: 'bg-cyan-50', fg: 'text-cyan-600' },
      { label: 'Pending Bookings', value: pendingBookings, icon: CalendarDays, bg: 'bg-orange-50', fg: 'text-orange-600' },
    ] : []),
  ];

  const recent = [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-5">Dashboard Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}><s.icon size={18} className={s.fg} /></div>
              <div>
                <p className="text-2xl font-semibold leading-none">{s.value}</p>
                <p className="text-[11px] text-text-muted mt-1">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className={`grid ${isAdmin ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        <Card>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Tickets</h3>
            <Link to="/dashboard/tickets" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt text-xs text-text-muted">
                  <th className="text-left px-4 py-2 font-medium">Code</th>
                  <th className="text-left px-4 py-2 font-medium">Title</th>
                  <th className="text-left px-4 py-2 font-medium">Priority</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map(t => (
                  <tr key={t.id} className="hover:bg-surface-alt/50 cursor-pointer" onClick={() => window.location.href = `/dashboard/tickets/${t.id}`}>
                    <td className="px-4 py-2.5 text-xs text-text-muted font-mono">{t.ticketCode}</td>
                    <td className="px-4 py-2.5 font-medium max-w-[200px] truncate">{t.ticketTitle}</td>
                    <td className="px-4 py-2.5"><Badge className={getPriorityBadge(t.priorityLevel).color}>{getPriorityBadge(t.priorityLevel).label}</Badge></td>
                    <td className="px-4 py-2.5"><Badge className={getStatusBadge(t.status).color}>{getStatusBadge(t.status).label}</Badge></td>
                    <td className="px-4 py-2.5 text-xs text-text-muted">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {isAdmin && recentBookings.length > 0 && (
          <Card>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent Bookings</h3>
              <Link to="/dashboard/bookings" className="text-xs text-primary-600 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border">
              {recentBookings.map(b => {
                const bs = getBookingStatusBadge(b.status);
                return (
                  <div key={b.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{b.resourceName || b.resourceId}</p>
                      <p className="text-xs text-text-muted mt-0.5">{b.requestedByName} · {formatDateShort(b.bookingDate)} · {b.startTime}–{b.endTime}</p>
                    </div>
                    <Badge className={bs.color}>{bs.label}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
