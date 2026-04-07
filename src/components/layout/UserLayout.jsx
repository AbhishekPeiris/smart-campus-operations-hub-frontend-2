import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../common/NotificationPanel';
import { LayoutDashboard, Plus, FileText, User, LogOut, GraduationCap, CalendarDays, Building2, CalendarPlus } from 'lucide-react';

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
    { to: '/portal/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link to="/portal" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="font-semibold text-sm text-text-primary hidden sm:block">Smart Campus</span>
            </Link>
            <nav className="flex items-center gap-1">
              {nav.map(n => (
                <Link key={n.to} to={n.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isActive(n.to) ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:bg-surface-alt'}`}>
                  <n.icon size={15} />
                  <span className="hidden md:inline">{n.label}</span>
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <NotificationPanel />
              <span className="text-xs text-text-secondary hidden sm:block">{user?.fullName}</span>
              <button onClick={() => { logout(); navigate('/login'); }} className="p-1.5 rounded-md text-text-muted hover:bg-surface-alt" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
