import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  LayoutDashboard, Ticket, Users, ChevronLeft, ChevronRight,
  LogOut, GraduationCap, ClipboardList, Settings, Building2, CalendarDays, Sparkles,
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
    <div className="min-h-screen p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1680px] gap-5">
        <aside className={`flex flex-col bg-slate-950 text-white ${collapsed ? 'w-[92px]' : 'w-[285px]'} rounded-[28px] p-3 shadow-[0_24px_60px_rgba(15,23,42,0.28)] transition-all duration-200`}>
          <div className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/10 text-white">
                <GraduationCap size={20} />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Operations Hub</p>
                  <p className="mt-0.5 text-xs text-white/60">Control center</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="mt-4 rounded-[18px] border border-white/10 bg-white/6 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-[14px] bg-primary-500/20 text-primary-200">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">Modern operations workflow</p>
                    <p className="mt-1 text-xs leading-5 text-white/60">Tickets, resources, bookings, and users in one structured workspace.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <nav className="mt-4 flex-1 overflow-y-auto">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={`group mb-1.5 flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm transition-all ${
                  isActive(item.to)
                    ? 'bg-white text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.28)]'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="mt-3 rounded-[22px] border border-white/10 bg-white/5 px-3 py-3">
            {!collapsed && (
              <div className="mb-3 flex items-center gap-3 px-2 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
                  <p className="mt-0.5 text-xs text-white/60">{user?.role}</p>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setCollapsed((prev) => !prev)}
                className="inline-flex flex-1 items-center justify-center rounded-[16px] border border-white/10 bg-white/8 px-3 py-3 text-white/70 transition-colors hover:bg-white/12 hover:text-white"
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              {!collapsed && (
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/10 bg-white/8 text-white/70 transition-colors hover:bg-red-500/20 hover:text-white"
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
                <h1 className="mt-2 text-[1.8rem] font-semibold tracking-tight text-text-primary">{currentItem.label}</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="surface-panel-muted hidden sm:flex items-center gap-3 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{user?.fullName}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{user?.role}</p>
                  </div>
                </div>
                {collapsed && (
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-border bg-white text-text-secondary transition-colors hover:bg-surface-alt hover:text-text-primary"
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
