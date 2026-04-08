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
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Welcome back, {user.fullName}</h1>
          <p className="text-sm text-text-muted mt-0.5">Here is an overview of your booking, ticket, and notification activity.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/portal/notifications" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-border text-text-secondary text-sm font-medium rounded-md hover:bg-surface-alt">
            <Bell size={16} />
            View Notifications
          </Link>
          <Link to="/portal/book" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-border text-text-secondary text-sm font-medium rounded-md hover:bg-surface-alt">
            <CalendarPlus size={16} />
            Book Resource
          </Link>
          <Link to="/portal/new-ticket" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700">
            <Plus size={16} />
            Report Incident
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.color}`}><stat.icon size={20} /></div>
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
              {tickets.slice(0, 5).map((ticket) => (
                <Link key={ticket.id} to={`/portal/tickets/${ticket.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-surface-alt transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{ticket.ticketTitle}</p>
                    <p className="text-xs text-text-muted mt-0.5">{ticket.ticketCode} - {formatDate(ticket.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Badge className={getPriorityBadge(ticket.priorityLevel).color}>{getPriorityBadge(ticket.priorityLevel).label}</Badge>
                    <Badge className={getStatusBadge(ticket.status).color}>{getStatusBadge(ticket.status).label}</Badge>
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
              {bookings.slice(0, 5).map((booking) => {
                const statusBadge = getBookingStatusBadge(booking.status);

                return (
                  <div key={booking.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {booking.resourceName || booking.resourceCode || booking.resourceId}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
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
