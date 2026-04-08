import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
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

    Promise.all(promises)
      .then(([ticketRes, userRes, bookingRes, resourceRes]) => {
        const ticketContent = ticketRes.data.data?.content || [];
        setTickets(ticketContent);
        setUserCount(userRes.data.data?.totalElements || 0);

        if (isAdmin && bookingRes) {
          const bookingContent = bookingRes.data.data?.content || [];
          setBookingCount(bookingRes.data.data?.totalElements || bookingContent.length);
          setPendingBookings(bookingContent.filter((booking) => booking.status === 'PENDING' || booking.currentStatus === 'PENDING').length);
          setRecentBookings(bookingContent.slice(0, 5));
        }

        if (isAdmin && resourceRes) {
          setResourceCount(resourceRes.data.data?.totalElements || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  const counts = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'OPEN').length,
    inProgress: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length,
    critical: tickets.filter((ticket) => ticket.priorityLevel === 'CRITICAL' && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED').length,
  };

  const stats = [
    { label: 'Total Tickets', value: counts.total, icon: Ticket, bg: 'bg-primary-50', fg: 'text-primary-600' },
    { label: 'Open Issues', value: counts.open, icon: AlertTriangle, bg: 'bg-amber-50', fg: 'text-amber-600' },
    { label: 'In Progress', value: counts.inProgress, icon: Clock, bg: 'bg-blue-50', fg: 'text-blue-600' },
    { label: 'Resolved', value: counts.resolved, icon: CheckCircle, bg: 'bg-emerald-50', fg: 'text-emerald-600' },
    { label: 'Critical Active', value: counts.critical, icon: ShieldAlert, bg: 'bg-red-50', fg: 'text-red-600' },
    ...(isAdmin ? [
      { label: 'Registered Users', value: userCount, icon: Users, bg: 'bg-violet-50', fg: 'text-violet-600' },
      { label: 'Managed Resources', value: resourceCount, icon: Building2, bg: 'bg-cyan-50', fg: 'text-cyan-600' },
      { label: 'Pending Bookings', value: pendingBookings, icon: CalendarDays, bg: 'bg-orange-50', fg: 'text-orange-600' },
    ] : []),
  ];

  const recentTickets = [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return (
    <div className="app-page">
      <section className="hero-banner">
        <div className="page-header">
          <div>
            <p className="page-kicker">Overview</p>
            <h1 className="page-title">Campus operations at a glance</h1>
            <p className="page-subtitle">
              Monitor ticket throughput, booking review workload, and platform activity from a single operational surface.
            </p>
          </div>
          <div className="surface-panel-muted min-w-[250px] px-4 py-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-text-muted">Live Summary</p>
            <p className="mt-2 text-lg font-semibold text-text-primary">{bookingCount} booking requests tracked</p>
            <p className="mt-1 text-sm text-text-secondary">
              {isAdmin
                ? 'Administration view with full booking, resource, and user oversight.'
                : 'Technician view focused on issue management and assignment execution.'}
            </p>
          </div>
        </div>
      </section>

      <div className="stat-grid">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat-card">
            <div className="stat-card__top">
              <div>
                <p className="stat-card__label">{stat.label}</p>
                <p className="stat-card__value">{stat.value}</p>
                <p className="stat-card__meta">Real-time campus operations data</p>
              </div>
              <div className={`stat-card__icon ${stat.bg}`}>
                <stat.icon size={20} className={stat.fg} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className={`content-grid ${!isAdmin ? 'grid-cols-1' : ''}`}>
        <Card className="section-card">
          <div className="section-card__header">
            <div>
              <h3 className="section-card__title">Recent Tickets</h3>
              <p className="section-card__subtitle">Newest issues raised through the smart campus service flow.</p>
            </div>
            <Link to="/dashboard/tickets" className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 hover:text-primary-800">
              View all
            </Link>
          </div>
          <div className="app-table-wrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="cursor-pointer" onClick={() => { window.location.href = `/dashboard/tickets/${ticket.id}`; }}>
                    <td className="font-mono text-xs text-text-muted">{ticket.ticketCode}</td>
                    <td className="max-w-[230px] truncate font-semibold text-text-primary">{ticket.ticketTitle}</td>
                    <td><Badge className={getPriorityBadge(ticket.priorityLevel).color}>{getPriorityBadge(ticket.priorityLevel).label}</Badge></td>
                    <td><Badge className={getStatusBadge(ticket.status).color}>{getStatusBadge(ticket.status).label}</Badge></td>
                    <td className="text-xs text-text-muted">{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {isAdmin && recentBookings.length > 0 && (
          <Card className="section-card">
            <div className="section-card__header">
              <div>
                <h3 className="section-card__title">Recent Bookings</h3>
                <p className="section-card__subtitle">Latest reservation requests across shared resources.</p>
              </div>
              <Link to="/dashboard/bookings" className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 hover:text-primary-800">
                View all
              </Link>
            </div>
            <div className="app-list">
              {recentBookings.map((booking) => {
                const statusBadge = getBookingStatusBadge(booking.status || booking.currentStatus);

                return (
                  <div key={booking.id} className="app-list-item flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{booking.resourceName || booking.resourceId}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {booking.requestedByName} - {formatDateShort(booking.bookingDate)} - {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
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
