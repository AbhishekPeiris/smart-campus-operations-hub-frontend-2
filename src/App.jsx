import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Spinner from './components/common/Spinner';

// Layouts
import UserLayout from './components/layout/UserLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import MyTickets from './pages/user/MyTickets';
import NewTicket from './pages/user/NewTicket';
import TicketDetail from './pages/user/TicketDetail';
import ProfilePage from './pages/user/ProfilePage';
import ResourceBrowser from './pages/user/ResourceBrowser';
import NewBooking from './pages/user/NewBooking';
import MyBookings from './pages/user/MyBookings';
import NotificationsPage from './pages/user/NotificationsPage';

// Dashboard pages
import DashboardOverview from './pages/dashboard/DashboardOverview';
import AllTickets from './pages/dashboard/AllTickets';
import DashboardTicketDetail from './pages/dashboard/DashboardTicketDetail';
import UserManagement from './pages/dashboard/UserManagement';
import MyAssignments from './pages/dashboard/MyAssignments';
import ResourceManagement from './pages/dashboard/ResourceManagement';
import AllBookings from './pages/dashboard/AllBookings';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'USER') return <Navigate to="/portal" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Portal */}
          <Route path="/portal" element={<ProtectedRoute allowedRoles={['USER']}><UserLayout /></ProtectedRoute>}>
            <Route index element={<UserDashboard />} />
            <Route path="tickets" element={<MyTickets />} />
            <Route path="new-ticket" element={<NewTicket />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            <Route path="resources" element={<ResourceBrowser />} />
            <Route path="book" element={<NewBooking />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin/Technician Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardOverview />} />
            <Route path="tickets" element={<AllTickets />} />
            <Route path="tickets/:id" element={<DashboardTicketDetail />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="my-assignments" element={<MyAssignments />} />
            <Route path="resources" element={<ResourceManagement />} />
            <Route path="bookings" element={<AllBookings />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
