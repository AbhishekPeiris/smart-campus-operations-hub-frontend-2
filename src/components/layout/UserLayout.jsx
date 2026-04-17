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
    <div className="min-h-screen px-4 pb-8 pt-4 md:px-6">
      <header className="sticky top-0 z-30 mb-6">
        <div className="layout-header px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link to="/portal" className="flex items-center gap-3">
                <div className="layout-brand-mark flex h-11 w-11 items-center justify-center shrink-0">
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
                <button onClick={() => { logout(); navigate('/login'); }} className="icon-button h-10 w-10" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={isActive(item.to) ? 'top-nav-link top-nav-link-active' : 'top-nav-link'}
                >
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="px-1">
        <Outlet />
      </main>
    </div>
  );
}
