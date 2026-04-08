import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import NotificationPanel from '../common/NotificationPanel';
import {
  LayoutDashboard, Ticket, Users, ChevronLeft, ChevronRight,
  LogOut, GraduationCap, ClipboardList, Settings, Building2, CalendarDays, Bell
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  const nav = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/tickets', label: 'All Tickets', icon: Ticket },
    ...(isAdmin ? [
      { to: '/dashboard/resources', label: 'Resources', icon: Building2 },
      { to: '/dashboard/bookings', label: 'All Bookings', icon: CalendarDays },
      { to: '/dashboard/users', label: 'User Management', icon: Users },
    ] : []),
    { to: '/dashboard/my-assignments', label: 'My Assignments', icon: ClipboardList, show: user?.role === 'TECHNICIAN' },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { to: '/dashboard/profile', label: 'Profile', icon: Settings },
  ].filter(n => n.show !== false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <aside className={`bg-white border-r border-border flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'}`}>
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          {!collapsed && <span className="font-semibold text-sm text-text-primary truncate">Operations Hub</span>}
        </div>
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {nav.map(n => (
            <Link key={n.to} to={n.to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(n.to) ? 'bg-primary-50 text-primary-700' : 'text-text-secondary hover:bg-surface-alt'}`}
              title={collapsed ? n.label : undefined}>
              <n.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{n.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-2 shrink-0">
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-md text-text-muted hover:bg-surface-alt">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-border h-14 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-sm font-medium text-text-secondary">
            {user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Technician Dashboard'}
          </h2>
          <div className="flex items-center gap-3">
            <NotificationPanel />
            <span className="text-xs text-text-muted">{user?.fullName}</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-primary-100 text-primary-700">{user?.role}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="p-1.5 rounded-md text-text-muted hover:bg-surface-alt" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
