import { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  BookOpen,
  CalendarDays,
  ClipboardPlus,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Menu,
  Ticket,
  UserCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import NotificationPanel from '../common/NotificationPanel';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(() => ([
    { to: '/portal', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { to: '/portal/resources', label: 'Resources', icon: BookOpen },
    { to: '/portal/book', label: 'Book Resource', icon: ClipboardPlus },
    { to: '/portal/bookings', label: 'My Bookings', icon: CalendarDays },
    { to: '/portal/tickets', label: 'My Tickets', icon: Ticket },
    { to: '/portal/new-ticket', label: 'Report Issue', icon: BellRing },
    { to: '/portal/notifications', label: 'Notifications', icon: Bell },
    { to: '/portal/profile', label: 'Profile', icon: UserCircle2 },
  ]), []);

  const isActive = (item) => item.exact
    ? location.pathname === item.to
    : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

  const currentItem = navItems.find((item) => isActive(item)) || navItems[0];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen p-4 lg:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1680px] flex-col gap-5">
        <header className="surface-panel sticky top-4 z-30 overflow-hidden px-4 py-4 sm:px-5">
          <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top_right,rgba(79,109,245,0.22),transparent_48%)] pointer-events-none" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-950 text-white shadow-[0_18px_30px_rgba(15,23,42,0.2)]">
                <GraduationCap size={20} />
              </div>
              <div className="min-w-0">
                <p className="page-kicker">User Portal</p>
                <h1 className="truncate text-lg font-semibold tracking-tight text-text-primary">
                  {currentItem.label}
                </h1>
              </div>
            </div>

            <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
              <div className="tab-strip w-full max-w-4xl">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`tab-button ${isActive(item) ? 'tab-button-active' : ''}`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationPanel />

              <div className="surface-panel-muted hidden items-center gap-3 px-3 py-2.5 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-slate-950 text-sm font-semibold text-white">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{user?.fullName}</p>
                  <p className="mt-0.5 text-xs text-text-muted">Campus member</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden h-11 items-center gap-2 rounded-[16px] border border-border bg-white/85 px-4 text-sm font-semibold text-text-secondary transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-text-primary sm:inline-flex"
              >
                <LogOut size={15} />
                Sign out
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-border bg-white/85 text-text-secondary transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:text-text-primary xl:hidden"
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              >
                {mobileOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>

          <div className="relative mt-4 xl:hidden">
            <div className={`${mobileOpen ? 'grid' : 'hidden'} gap-2`}>
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`tab-button justify-start ${isActive(item) ? 'tab-button-active' : ''}`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="tab-button justify-start text-danger hover:text-danger"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            <Outlet />
          </main>

          <aside className="hidden xl:block">
            <div className="surface-panel sticky top-[8.5rem] overflow-hidden px-5 py-5">
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(79,109,245,0.18),transparent_55%)] pointer-events-none" />
              <div className="relative">
                <p className="page-kicker">Workspace</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">Stay organized</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Manage your requests, track booking approvals, and keep campus issues moving from one clean member workspace.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="surface-panel-muted px-4 py-4">
                    <p className="detail-tile__label">Current role</p>
                    <p className="detail-tile__value">{user?.role || 'USER'}</p>
                  </div>
                  <div className="surface-panel-muted px-4 py-4">
                    <p className="detail-tile__label">Recommended next step</p>
                    <p className="mt-2 text-sm font-medium text-text-primary">
                      {location.pathname.startsWith('/portal/book')
                        ? 'Review time slots before submitting your reservation.'
                        : 'Use the quick actions above to file new issues or reserve shared spaces.'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  <Link
                    to="/portal/new-ticket"
                    className="inline-flex items-center justify-center rounded-[18px] bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Report Incident
                  </Link>
                  <Link
                    to="/portal/book"
                    className="inline-flex items-center justify-center rounded-[18px] border border-border bg-white/92 px-4 py-3 text-sm font-semibold text-text-secondary transition-transform hover:-translate-y-0.5 hover:border-primary-200 hover:text-text-primary"
                  >
                    Request Booking
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
