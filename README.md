# Smart Campus Operations Hub – Frontend

React + Vite + Tailwind CSS frontend for the Smart Campus Operations Hub platform.

## Tech Stack

- React 19 with Vite 8
- Tailwind CSS 4
- React Router DOM 7
- Axios for API calls
- Lucide React icons

## Features

### Module A – Facilities & Assets Catalogue (Member 1)
- Browse and search resources (lecture halls, labs, equipment, etc.)
- Filter by type, capacity, location, and status
- Admin CRUD: create, edit, delete resources
- Manage availability windows per resource
- Toggle resource status (ACTIVE / OUT_OF_SERVICE)

### Module B – Booking Management (Member 2)
- Users can request bookings with date, time, purpose, and attendees
- Pre-booking conflict check endpoint integration
- View own bookings with status filters
- Cancel approved bookings with reason
- Admin: view all bookings, approve/reject pending requests
- Resource selection with live availability info

### Module C – Maintenance & Incident Ticketing (Member 3)
- Create incident tickets (resource-based or location-based)
- Upload attachment metadata (file name, type, URL)
- View/delete attachments per ticket
- Add/delete comments with ownership rules
- View technician update activity log
- Admin: assign technicians, update status, reject, resolve tickets
- Technician: update status, resolve tickets

### Module D – Notifications (Member 4)
- Real-time unread notification count (polled every 30s)
- Notification dropdown panel in header
- Full notifications page with pagination
- Mark individual/all notifications as read
- Delete notifications
- Notification types: booking approved/rejected, ticket status changed, comment added

### Module E – Authentication & Authorization (Member 4)
- Email/password login and registration
- Google OAuth 2.0 sign-in (auto-discovers config from backend)
- Role-based routing: USER → /portal, ADMIN/TECHNICIAN → /dashboard
- JWT token management with auto-redirect on 401
- Admin role management: change user roles
- Admin user management: enable/disable accounts, create users

## Role-Based Access

| Feature | USER | TECHNICIAN | ADMIN |
|---|---|---|---|
| Browse resources | ✅ | ✅ | ✅ |
| Create bookings | ✅ | ✅ | ✅ |
| View own bookings | ✅ | ✅ | ✅ |
| Cancel own bookings | ✅ | ✅ | ✅ |
| View all bookings | ❌ | ❌ | ✅ |
| Approve/reject bookings | ❌ | ❌ | ✅ |
| Create tickets | ✅ | ✅ | ✅ |
| View tickets | ✅ | ✅ | ✅ |
| Add comments | ✅ | ✅ | ✅ |
| Assign technician | ❌ | ❌ | ✅ |
| Update ticket status | ❌ | ✅ | ✅ |
| Resolve tickets | ❌ | ✅ | ✅ |
| Reject tickets | ❌ | ❌ | ✅ |
| Manage resources (CRUD) | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Notifications | ✅ | ✅ | ✅ |

## Project Structure

```
src/
├── api/                    # API service layer
│   ├── auth.js             # Login, register, Google OAuth
│   ├── axios.js            # Axios instance with JWT interceptor
│   ├── bookings.js         # Booking CRUD, conflict check
│   ├── resources.js        # Resource CRUD, search
│   ├── notifications.js    # Notification endpoints
│   ├── tickets.js          # Ticket CRUD, assign, status
│   ├── comments.js         # Comment CRUD
│   ├── attachments.js      # Attachment metadata
│   └── users.js            # User management, role update
├── components/
│   ├── common/             # Reusable UI components
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── NotificationPanel.jsx
│   │   ├── Pagination.jsx
│   │   ├── Select.jsx
│   │   ├── Spinner.jsx
│   │   └── Textarea.jsx
│   └── layout/
│       ├── DashboardLayout.jsx   # Admin/Tech sidebar layout
│       └── UserLayout.jsx        # User top-nav layout
├── context/
│   └── AuthContext.jsx     # Auth state management
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx         # Login + Google OAuth
│   │   └── RegisterPage.jsx
│   ├── user/                     # USER portal pages
│   │   ├── UserDashboard.jsx     # Overview with ticket + booking stats
│   │   ├── MyTickets.jsx
│   │   ├── NewTicket.jsx
│   │   ├── TicketDetail.jsx
│   │   ├── ResourceBrowser.jsx   # Browse & search resources
│   │   ├── NewBooking.jsx        # Create booking with conflict check
│   │   ├── MyBookings.jsx        # View & cancel bookings
│   │   ├── NotificationsPage.jsx # Full notification view
│   │   └── ProfilePage.jsx
│   └── dashboard/                # ADMIN/TECHNICIAN pages
│       ├── DashboardOverview.jsx # Stats for tickets, bookings, resources
│       ├── AllTickets.jsx
│       ├── DashboardTicketDetail.jsx
│       ├── ResourceManagement.jsx # CRUD resources (Admin)
│       ├── AllBookings.jsx        # Manage all bookings (Admin)
│       ├── UserManagement.jsx     # Users + role management (Admin)
│       ├── MyAssignments.jsx      # Technician assignments
│       └── NotificationsPage.jsx
└── utils/
    └── constants.js        # Enums, badge helpers, formatters
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. The app runs on `http://localhost:5173` by default.

## Configuration

The API base URL is configured in `src/api/axios.js`:
```
http://localhost:8081/api/v1/
```

Make sure the backend is running on port 8081.

## Backend API

The frontend connects to all endpoints documented in the backend README:
- Auth: `/api/v1/auth/*` (login, register, Google OAuth)
- Users: `/api/v1/users/*` (profile, list, role update, status)
- Resources: `/api/v1/resources/*` (CRUD, search, metadata)
- Bookings: `/api/v1/bookings/*` (CRUD, review, cancel, conflicts)
- Tickets: `/api/v1/tickets/*` (CRUD, assign, status, resolve, reject)
- Comments: `/api/v1/tickets/comments/*`
- Attachments: `/api/v1/tickets/attachments/*`
- Updates: `/api/v1/tickets/updates/*`
- Notifications: `/api/v1/notifications/*`
