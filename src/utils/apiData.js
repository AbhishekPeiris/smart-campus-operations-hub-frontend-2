const isPresent = (value) => value !== undefined && value !== null && value !== '';

const pickFirst = (source, keys, fallback = '') => {
  if (!source) return fallback;

  for (const key of keys) {
    const value = source[key];
    if (isPresent(value)) return value;
  }

  return fallback;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

export function extractApiData(response) {
  return response?.data?.data ?? response?.data ?? null;
}

export function getEntityId(entity, keys = []) {
  return pickFirst(entity, [...keys, 'id'], null);
}

export function normalizePaginatedData(payload, itemNormalizer = (item) => item) {
  const rawContent = Array.isArray(payload)
    ? payload
    : payload?.content || payload?.items || payload?.records || payload?.data || [];

  const content = (Array.isArray(rawContent) ? rawContent : []).map(itemNormalizer);
  const totalElements = Array.isArray(payload)
    ? content.length
    : payload?.totalElements ?? payload?.totalItems ?? payload?.numberOfElements ?? content.length;
  const totalPages = Array.isArray(payload)
    ? (content.length > 0 ? 1 : 0)
    : payload?.totalPages
      ?? payload?.page?.totalPages
      ?? (payload?.size ? Math.ceil(totalElements / payload.size) : (content.length > 0 ? 1 : 0));
  const currentPage = Array.isArray(payload)
    ? 0
    : payload?.currentPage ?? payload?.number ?? payload?.page?.number ?? payload?.pageNumber ?? 0;
  const size = Array.isArray(payload) ? content.length : payload?.size ?? payload?.pageSize ?? content.length;

  return {
    content,
    currentPage,
    totalElements,
    totalPages,
    size,
  };
}

export function normalizeSessionUser(user = {}) {
  const id = getEntityId(user, ['userId']);

  return {
    ...user,
    id,
    userId: id,
    fullName: pickFirst(user, ['fullName', 'name'], 'Unknown User'),
    universityEmailAddress: pickFirst(user, ['universityEmailAddress', 'email'], ''),
    contactNumber: pickFirst(user, ['contactNumber', 'phoneNumber', 'phone'], ''),
    role: pickFirst(user, ['role'], 'USER'),
  };
}

export function normalizeUser(user = {}) {
  const normalized = normalizeSessionUser(user);
  const enabled = toBoolean(
    user.accountEnabled ?? user.enabled ?? user.active,
    true
  );

  return {
    ...normalized,
    accountEnabled: enabled,
    enabled,
    createdAt: pickFirst(user, ['createdAt', 'createdDate', 'createdOn'], ''),
  };
}

export function normalizeResource(resource = {}) {
  const id = getEntityId(resource, ['resourceId']);

  return {
    ...resource,
    id,
    resourceId: id,
    resourceCode: pickFirst(resource, ['resourceCode', 'code'], ''),
    resourceName: pickFirst(resource, ['resourceName', 'name'], ''),
    resourceType: pickFirst(resource, ['resourceType', 'type'], ''),
    location: pickFirst(resource, ['location'], ''),
    description: pickFirst(resource, ['description'], ''),
    status: pickFirst(resource, ['status'], ''),
    capacity: resource.capacity ?? resource.maxCapacity ?? null,
    availabilityWindows: Array.isArray(resource.availabilityWindows) ? resource.availabilityWindows : [],
  };
}

export function normalizeBooking(booking = {}) {
  const id = getEntityId(booking, ['bookingId']);
  const resource = normalizeResource(booking.resource || {});
  const requester = normalizeUser(booking.requestedBy || booking.requestedByUser || booking.user || {});

  return {
    ...booking,
    id,
    bookingId: id,
    status: pickFirst(booking, ['status', 'currentStatus'], 'PENDING'),
    bookingDate: pickFirst(booking, ['bookingDate', 'date'], ''),
    startTime: pickFirst(booking, ['startTime'], ''),
    endTime: pickFirst(booking, ['endTime'], ''),
    purpose: pickFirst(booking, ['purpose'], ''),
    expectedAttendees: booking.expectedAttendees ?? booking.attendeeCount ?? '',
    reviewReason: pickFirst(booking, ['reviewReason', 'decisionReason'], ''),
    rejectionReason: pickFirst(booking, ['rejectionReason'], ''),
    cancellationReason: pickFirst(booking, ['cancellationReason', 'cancelReason'], ''),
    createdAt: pickFirst(booking, ['createdAt', 'requestedAt', 'createdDate'], ''),
    resourceId: pickFirst(booking, ['resourceId'], resource.id),
    resourceName: pickFirst(booking, ['resourceName'], resource.resourceName || resource.resourceCode),
    resourceCode: pickFirst(booking, ['resourceCode'], resource.resourceCode),
    location: pickFirst(booking, ['location', 'resourceLocation'], resource.location),
    resourceType: pickFirst(booking, ['resourceType'], resource.resourceType),
    requestedByUserId: pickFirst(booking, ['requestedByUserId', 'userId'], requester.id),
    requestedByName: pickFirst(booking, ['requestedByName', 'requesterName'], requester.fullName),
  };
}

export function normalizeNotification(notification = {}) {
  const id = getEntityId(notification, ['notificationId']);
  const read = toBoolean(notification.read ?? notification.isRead, false);
  const type = pickFirst(notification, ['type', 'notificationType', 'eventType'], 'GENERAL');
  const message = pickFirst(notification, ['message', 'content', 'title', 'subject'], 'Notification');

  return {
    ...notification,
    id,
    notificationId: id,
    read,
    isRead: read,
    type,
    notificationType: type,
    message,
    content: pickFirst(notification, ['content', 'message', 'title', 'subject'], message),
    title: pickFirst(notification, ['title', 'subject'], type),
    createdAt: pickFirst(notification, ['createdAt', 'createdDate', 'sentAt'], ''),
  };
}
