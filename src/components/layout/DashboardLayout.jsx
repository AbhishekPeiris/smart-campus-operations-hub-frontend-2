import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  LayoutDashboard, Ticket, Users, ChevronLeft, ChevronRight,
  LogOut, GraduationCap, ClipboardList, Settings, Building2, CalendarDays, ShieldCheck
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
  ].filter(n => n.show !== false);

  const isActive = (path) => location.pathname === path;
  const currentItem = nav.find((item) => item.to === location.pathname) || nav[0];

  return (
    <div className="min-h-screen p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1720px] gap-5">
        <aside className={`surface-panel flex flex-col transition-all duration-200 ${collapsed ? 'w-[96px]' : 'w-[292px]'}`}>
          <div className="border-b border-border px-4 py-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
                <GraduationCap size={22} className="text-white" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary-700">Operations Hub</p>
                  <p className="mt-1 truncate text-lg font-semibold text-text-primary">Admin Console</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="mt-5 surface-panel-muted px-4 py-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-text-muted">Workspace</p>
                <p className="mt-2 text-sm font-semibold text-text-primary">Campus infrastructure control</p>
                <p className="mt-1 text-xs text-text-secondary">Bookings, tickets, users, and operational coverage in one place.</p>
              </div>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1.5">
              {nav.map(n => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`group flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-semibold transition-all ${
                    isActive(n.to)
                      ? 'border border-primary-200 bg-primary-50 text-primary-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
                      : 'border border-transparent text-text-secondary hover:border-border hover:bg-white/70 hover:text-text-primary'
                  }`}
                  title={collapsed ? n.label : undefined}
                >
                  <span className={`inline-flex h-11 w-11 items-center justify-center rounded-[14px] border transition-colors ${
                    isActive(n.to)
                      ? 'border-primary-200 bg-white text-primary-700'
                      : 'border-border bg-white/80 text-text-muted group-hover:text-text-primary'
                  }`}>
                    <n.icon size={18} className="shrink-0" />
                  </span>
                  {!collapsed && (
                    <span className="flex-1 truncate">
                      {n.label}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>
          <div className="border-t border-border p-3 shrink-0">
            {!collapsed && (
              <div className="surface-panel-muted mb-3 flex items-center gap-3 px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary-100 text-primary-700 font-semibold">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{user?.fullName}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{user?.role}</p>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="inline-flex flex-1 items-center justify-center rounded-[16px] border border-border bg-white/85 px-3 py-3 text-text-muted transition-colors hover:bg-surface-alt hover:text-text-primary"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              {!collapsed && (
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="inline-flex items-center justify-center rounded-[16px] border border-border bg-white/85 px-4 py-3 text-text-muted transition-colors hover:bg-red-50 hover:text-danger"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="surface-panel sticky top-4 z-20 px-5 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="page-kicker">{user?.role === 'ADMIN' ? 'Administration' : 'Technician Workspace'}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{currentItem?.label || 'Dashboard'}</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {user?.role === 'ADMIN'
                    ? 'Operational visibility with structured review tools for the full campus estate.'
                    : 'Action-focused workspace for responding to assigned tickets and service updates.'}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="surface-panel-muted flex items-center gap-3 px-4 py-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary-100 text-primary-700">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Signed in as</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{user?.fullName}</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-[14px] border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
                  {user?.role}
                </span>
                {collapsed && (
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-border bg-white/85 text-text-muted transition-colors hover:bg-red-50 hover:text-danger"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
