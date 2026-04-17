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
    <div className="layout-shell flex min-h-screen text-text-primary">
      <aside className={`layout-sidebar flex flex-col transition-all duration-300 ${collapsed ? 'w-[88px]' : 'w-[270px]'}`}>
        <div className="layout-sidebar__section border-b px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="layout-brand-mark flex h-11 w-11 items-center justify-center shrink-0">
              <GraduationCap size={18} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Operations Hub</p>
                <p className="mt-0.5 text-xs text-white/65">Admin dashboard</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`${isActive(item.to) ? 'nav-link nav-link-active' : 'nav-link'} ${collapsed ? 'justify-center px-3' : ''}`}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="layout-sidebar__section border-t">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className={`nav-link w-full rounded-none border-0 px-4 py-4 ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 md:px-6">
        <header className="layout-header flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-text-muted">
              {user?.role === 'ADMIN' ? 'Administration' : 'Technician workspace'}
            </p>
            <h1 className="text-xl font-semibold text-text-primary">{currentItem?.label || 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">{user?.fullName}</p>
              <p className="text-xs text-text-muted">{user?.role}</p>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="icon-button h-10 w-10"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-1 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
