import { describe, expect, it } from 'vitest';
import {
  normalizeBooking,
  normalizeNotification,
  normalizePaginatedData,
  normalizeSessionUser,
} from './apiData';

describe('apiData utilities', () => {
  it('normalizes session users with mixed id fields', () => {
    expect(normalizeSessionUser({
      id: 'user-1',
      name: 'Alex Johnson',
      email: 'alex@example.edu',
      role: 'ADMIN',
    })).toEqual({
      id: 'user-1',
      userId: 'user-1',
      name: 'Alex Johnson',
      email: 'alex@example.edu',
      fullName: 'Alex Johnson',
      universityEmailAddress: 'alex@example.edu',
      contactNumber: '',
      role: 'ADMIN',
    });
  });

  it('normalizes paginated payloads and applies item normalizers', () => {
    const result = normalizePaginatedData(
      {
        content: [{ bookingId: 'booking-1', status: 'APPROVED' }],
        totalPages: 3,
        currentPage: 1,
      },
      normalizeBooking
    );

    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(1);
    expect(result.content[0]).toMatchObject({
      id: 'booking-1',
      bookingId: 'booking-1',
      status: 'APPROVED',
    });
  });

  it('normalizes booking details from nested resource and requester objects', () => {
    expect(normalizeBooking({
      bookingId: 'booking-9',
      bookingDate: '2026-04-15',
      startTime: '10:00',
      endTime: '12:00',
      resource: {
        id: 'resource-2',
        resourceName: 'Lecture Hall A',
        resourceCode: 'LH-A-01',
        location: 'Engineering Block',
      },
      requestedBy: {
        userId: 'user-3',
        fullName: 'Jane Doe',
      },
    })).toMatchObject({
      id: 'booking-9',
      resourceId: 'resource-2',
      resourceName: 'Lecture Hall A',
      resourceCode: 'LH-A-01',
      location: 'Engineering Block',
      requestedByUserId: 'user-3',
      requestedByName: 'Jane Doe',
    });
  });

  it('normalizes notifications with alternate field names', () => {
    expect(normalizeNotification({
      notificationId: 'note-1',
      notificationType: 'BOOKING_APPROVED',
      subject: 'Booking approved',
      isRead: true,
      sentAt: '2026-04-08T10:00:00Z',
    })).toMatchObject({
      id: 'note-1',
      notificationId: 'note-1',
      type: 'BOOKING_APPROVED',
      notificationType: 'BOOKING_APPROVED',
      message: 'Booking approved',
      read: true,
      isRead: true,
      createdAt: '2026-04-08T10:00:00Z',
    });
  });
});
