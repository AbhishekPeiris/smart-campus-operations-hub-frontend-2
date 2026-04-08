import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  LayoutDashboard, Ticket, Users, ChevronLeft, ChevronRight,
  LogOut, GraduationCap, ClipboardList, Settings, Building2, CalendarDays,
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
    { to: '/dashboard/profile', label: 'Profile', icon: Settings },
  ].filter((item) => item.show !== false);

  const isActive = (path) => location.pathname === path;
  const currentItem = nav.find((item) => item.to === location.pathname) || nav[0];

  return (
    <div className="flex min-h-screen bg-surface text-text-primary">
      <aside className={`flex flex-col border-r border-border bg-white transition-all duration-200 ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-primary-600 text-white">
              <GraduationCap size={18} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">Operations Hub</p>
                <p className="mt-0.5 text-xs text-text-muted">Admin dashboard</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-1 py-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isActive(item.to)
                  ? 'border-l-2 border-primary-600 bg-primary-50 font-semibold text-primary-700'
                  : 'border-l-2 border-transparent text-text-secondary hover:bg-surface-alt hover:text-text-primary'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-surface-alt hover:text-text-primary"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-white px-6 py-3">
          <div>
            <p className="text-xs text-text-muted">{user?.role === 'ADMIN' ? 'Administration' : 'Technician workspace'}</p>
            <h1 className="text-xl font-semibold text-text-primary">{currentItem?.label || 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">{user?.fullName}</p>
              <p className="text-xs text-text-muted">{user?.role}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="inline-flex h-9 w-9 items-center justify-center border border-border bg-white text-text-secondary hover:bg-surface-alt hover:text-text-primary"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
