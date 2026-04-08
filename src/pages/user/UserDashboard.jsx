import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CalendarPlus,
  CheckCircle,
  Clock,
  Plus,
  Ticket,
} from 'lucide-react';
import { getUnreadCount } from '../../api/notifications';
import { getMyBookings } from '../../api/bookings';
import { getAllTickets } from '../../api/tickets';
import {
  formatDate,
  formatDateShort,
  formatTimeRange,
  getBookingStatusBadge,
  getPriorityBadge,
  getStatusBadge,
} from '../../utils/constants';
import {
  extractApiData,
  normalizeBooking,
  normalizePaginatedData,
} from '../../utils/apiData';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/useAuth';

export default function UserDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    Promise.all([
      getAllTickets(0, 100)
        .then((res) => {
          const content = extractApiData(res)?.content || [];
          const mine = content.filter((ticket) => ticket.createdByUserId === user.id || ticket.createdByUserId === user.userId);
          setTickets(mine);
        })
        .catch((err) => {
          console.error('Failed to load dashboard tickets:', err);
        }),
      getMyBookings({ size: 100 })
        .then((res) => {
          setBookings(normalizePaginatedData(extractApiData(res), normalizeBooking).content);
        })
        .catch((err) => {
          console.error('Failed to load dashboard bookings:', err);
        }),
      getUnreadCount()
        .then((res) => {
          const payload = extractApiData(res);
          setUnreadNotifications(payload?.unreadCount ?? payload ?? 0);
        })
        .catch((err) => {
          console.error('Failed to load unread notifications:', err);
        }),
    ]).finally(() => setLoading(false));
  }, [user?.id, user?.userId]);

  const ticketCounts = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'OPEN').length,
    inProgress: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length,
  };

  const bookingCounts = {
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'PENDING').length,
    approved: bookings.filter((booking) => booking.status === 'APPROVED').length,
  };

  const stats = [
    { label: 'Total Tickets', value: ticketCounts.total, icon: Ticket, color: 'text-primary-600 bg-primary-50' },
    { label: 'Open Tickets', value: ticketCounts.open, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'In Progress', value: ticketCounts.inProgress, icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { label: 'Resolved', value: ticketCounts.resolved, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Total Bookings', value: bookingCounts.total, icon: CalendarDays, color: 'text-violet-600 bg-violet-50' },
    { label: 'Pending Bookings', value: bookingCounts.pending, icon: Clock, color: 'text-orange-600 bg-orange-50' },
    { label: 'Unread Notifications', value: unreadNotifications, icon: Bell, color: 'text-cyan-600 bg-cyan-50' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>;
  }

  return (
    <div className="app-page">
      <section className="hero-banner">
        <div className="page-header">
          <div>
            <p className="page-kicker">Portal Overview</p>
            <h1 className="page-title">Welcome back, {user.fullName}</h1>
            <p className="page-subtitle">
              Keep track of your bookings, incident reports, and campus notifications from one streamlined workspace.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/portal/notifications" className="inline-flex items-center gap-2 rounded-[16px] border border-border bg-white/85 px-4 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700">
              <Bell size={16} />
              View Notifications
            </Link>
            <Link to="/portal/book" className="inline-flex items-center gap-2 rounded-[16px] border border-border bg-white/85 px-4 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-primary-50 hover:text-primary-700">
              <CalendarPlus size={16} />
              Book Resource
            </Link>
            <Link to="/portal/new-ticket" className="inline-flex items-center gap-2 rounded-[16px] border border-primary-700 bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
              <Plus size={16} />
              Report Incident
            </Link>
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
                <p className="stat-card__meta">Updated from your live account activity</p>
              </div>
              <div className={`stat-card__icon ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="content-grid">
        <Card className="section-card">
          <div className="section-card__header">
            <div>
              <h3 className="section-card__title">Recent Tickets</h3>
              <p className="section-card__subtitle">Your latest reported incidents and their current status.</p>
            </div>
            <Link to="/portal/tickets" className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 hover:text-primary-800">View all</Link>
          </div>
          {tickets.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-text-muted">No tickets yet</p>
          ) : (
            <div className="app-list">
              {tickets.slice(0, 5).map((ticket) => (
                <Link key={ticket.id} to={`/portal/tickets/${ticket.id}`} className="app-list-item block">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">{ticket.ticketTitle}</p>
                      <p className="mt-1 text-xs text-text-muted">{ticket.ticketCode} - {formatDate(ticket.createdAt)}</p>
                    </div>
                    <div className="ml-4 flex items-center gap-2 shrink-0">
                      <Badge className={getPriorityBadge(ticket.priorityLevel).color}>{getPriorityBadge(ticket.priorityLevel).label}</Badge>
                      <Badge className={getStatusBadge(ticket.status).color}>{getStatusBadge(ticket.status).label}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="section-card">
          <div className="section-card__header">
            <div>
              <h3 className="section-card__title">Recent Bookings</h3>
              <p className="section-card__subtitle">Current and upcoming reservation activity for your account.</p>
            </div>
            <Link to="/portal/bookings" className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-700 hover:text-primary-800">View all</Link>
          </div>
          {bookings.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-text-muted">No bookings yet</p>
          ) : (
            <div className="app-list">
              {bookings.slice(0, 5).map((booking) => {
                const statusBadge = getBookingStatusBadge(booking.status);

                return (
                  <div key={booking.id} className="app-list-item flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {booking.resourceName || booking.resourceCode || booking.resourceId}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {formatDateShort(booking.bookingDate)} - {formatTimeRange(booking.startTime, booking.endTime)}
                      </p>
                    </div>
                    <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
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
