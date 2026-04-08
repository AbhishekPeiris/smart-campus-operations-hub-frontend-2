export const INCIDENT_CATEGORIES = [
  { value: 'HARDWARE_ISSUE', label: 'Hardware Issue' },
  { value: 'SOFTWARE_ISSUE', label: 'Software Issue' },
  { value: 'NETWORK_ISSUE', label: 'Network Issue' },
  { value: 'ELECTRICAL_ISSUE', label: 'Electrical Issue' },
  { value: 'FACILITY_DAMAGE', label: 'Facility Damage' },
  { value: 'SAFETY_CONCERN', label: 'Safety Concern' },
  { value: 'CLEANLINESS_ISSUE', label: 'Cleanliness Issue' },
  { value: 'OTHER', label: 'Other' },
];

export const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'High', color: 'bg-amber-100 text-amber-700' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700' },
];

export const TICKET_STATUSES = [
  { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-slate-100 text-slate-600' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

export const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LABORATORY', label: 'Laboratory' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'OFFICE_SPACE', label: 'Office Space' },
  { value: 'COMMON_AREA', label: 'Common Area' },
  { value: 'LIBRARY', label: 'Library' },
  { value: 'OTHER', label: 'Other' },
];

export const RESOURCE_STATUSES = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service', color: 'bg-red-100 text-red-700' },
];

export const BOOKING_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-700' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-slate-100 text-slate-600' },
];

export const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

export const NOTIFICATION_TYPES = [
  { value: 'BOOKING_APPROVED', label: 'Booking Approved', icon: '[OK]' },
  { value: 'BOOKING_REJECTED', label: 'Booking Rejected', icon: '[X]' },
  { value: 'TICKET_STATUS_CHANGED', label: 'Ticket Status Changed', icon: '[~]' },
  { value: 'TICKET_COMMENT_ADDED', label: 'Comment Added', icon: '[C]' },
];

export const NOTIFICATION_SYNC_EVENT = 'smart-campus:notifications-sync';

export function getNotificationIcon(type) {
  return NOTIFICATION_TYPES.find((item) => item.value === type)?.icon || '[!]';
}

export function getNotificationLabel(type) {
  return NOTIFICATION_TYPES.find((item) => item.value === type)?.label || type;
}

export function emitNotificationsSync() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(NOTIFICATION_SYNC_EVENT));
}

export const USER_ROLES = [
  { value: 'USER', label: 'User' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'ADMIN', label: 'Admin' },
];

export function getStatusBadge(status) {
  return TICKET_STATUSES.find((item) => item.value === status) || TICKET_STATUSES[0];
}

export function getPriorityBadge(priority) {
  return PRIORITY_LEVELS.find((item) => item.value === priority) || PRIORITY_LEVELS[0];
}

export function getCategoryLabel(category) {
  return INCIDENT_CATEGORIES.find((item) => item.value === category)?.label || category;
}

export function getBookingStatusBadge(status) {
  return BOOKING_STATUSES.find((item) => item.value === status) || BOOKING_STATUSES[0];
}

export function getResourceStatusBadge(status) {
  return RESOURCE_STATUSES.find((item) => item.value === status) || RESOURCE_STATUSES[0];
}

export function getResourceTypeLabel(type) {
  return RESOURCE_TYPES.find((item) => item.value === type)?.label || type;
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime && !endTime) return '-';
  if (!startTime) return endTime;
  if (!endTime) return startTime;
  return `${startTime} - ${endTime}`;
}
