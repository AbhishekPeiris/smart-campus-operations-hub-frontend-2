import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import NotificationPanel from '../common/NotificationPanel';
import { LayoutDashboard, Plus, FileText, User, LogOut, GraduationCap, CalendarDays, Building2, CalendarPlus, Bell, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1680px] flex-col gap-5">
        <header className="surface-panel sticky top-4 z-30 overflow-visible px-5 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Link to="/portal" className="flex items-center gap-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-[20px] bg-primary-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
                  <GraduationCap size={22} className="text-white" />
                </div>
                <div>
                  <p className="page-kicker">Smart Campus</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-text-primary">Operations Portal</p>
                </div>
              </Link>
              <div className="hidden xl:flex surface-panel-muted items-center gap-3 px-4 py-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary-100 text-primary-700">
                  <Sparkles size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Campus Access</p>
                  <p className="mt-1 text-sm text-text-secondary">Book resources, report incidents, and track updates in one workspace.</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <NotificationPanel />
              <div className="surface-panel-muted hidden sm:flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary-100 text-primary-700 font-semibold">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{user?.fullName}</p>
                  <p className="mt-0.5 text-xs text-text-muted">Student portal access</p>
                </div>
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-border bg-white/85 text-text-muted transition-colors hover:bg-red-50 hover:text-danger" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-2">
            {nav.map(n => (
              <Link
                key={n.to}
                to={n.to}
                className={`inline-flex items-center gap-2 rounded-[16px] border px-4 py-3 text-sm font-semibold transition-all ${isActive(n.to)
                    ? 'border-primary-200 bg-primary-50 text-primary-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]'
                    : 'border-border bg-white/80 text-text-secondary hover:border-primary-100 hover:bg-white hover:text-text-primary'
                  }`}
              >
                <n.icon size={16} />
                <span>{n.label}</span>
              </Link>
            ))}
          </nav>
        </header>

        <main className="min-h-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
