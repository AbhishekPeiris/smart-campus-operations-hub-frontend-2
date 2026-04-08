import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import NotificationPanel from '../common/NotificationPanel';
import { LayoutDashboard, Plus, FileText, User, LogOut, GraduationCap, CalendarDays, Building2, CalendarPlus, Bell } from 'lucide-react';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const nav = [
    { to: '/portal', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portal/resources', label: 'Resources', icon: Building2 },
    { to: '/portal/book', label: 'Book', icon: CalendarPlus },
    { to: '/portal/bookings', label: 'My Bookings', icon: CalendarDays },
    { to: '/portal/tickets', label: 'My Tickets', icon: FileText },
    { to: '/portal/new-ticket', label: 'Report Incident', icon: Plus },
    { to: '/portal/notifications', label: 'Notifications', icon: Bell },
    { to: '/portal/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <Link to="/portal" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-primary-600 text-white">
              <GraduationCap size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Smart Campus</p>
              <p className="text-xs text-text-muted">Operations portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <NotificationPanel />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-text-primary">{user?.fullName}</p>
              <p className="text-xs text-text-muted">User portal</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="inline-flex h-9 w-9 items-center justify-center border border-border bg-white text-text-secondary hover:bg-surface-alt hover:text-text-primary" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-0 overflow-x-auto border-t border-border bg-white px-2">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm whitespace-nowrap transition-colors ${
                isActive(item.to)
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary'
              }`}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </header>

      <main className="px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
