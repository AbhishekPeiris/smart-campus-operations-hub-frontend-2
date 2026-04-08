import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import {
  deleteNotification,
  getMyNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '../../api/notifications';
import {
  emitNotificationsSync,
  formatDate,
  getNotificationIcon,
  NOTIFICATION_SYNC_EVENT,
} from '../../utils/constants';
import {
  extractApiData,
  normalizeNotification,
  normalizePaginatedData,
} from '../../utils/apiData';

const normalizeNotificationList = (payload) =>
  normalizePaginatedData(payload, normalizeNotification).content;

export default function NotificationPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const notificationsPath = '/portal/notifications';

  const loadUnread = useCallback(() => {
    getUnreadCount()
      .then((res) => {
        const payload = extractApiData(res);
        const count = payload?.unreadCount ?? payload ?? 0;
        setUnread(typeof count === 'number' ? count : 0);
      })
      .catch((err) => {
        console.error('Failed to load unread count:', err);
      });
  }, []);

  const loadNotifications = useCallback(() => {
    setLoading(true);
    getMyNotifications({ page: 0, size: 12 })
      .then((res) => {
        setNotifications(normalizeNotificationList(extractApiData(res)));
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUnread();

    const unreadInterval = setInterval(loadUnread, 30000);
    const handleSync = () => {
      loadUnread();
      if (open) loadNotifications();
    };

    window.addEventListener(NOTIFICATION_SYNC_EVENT, handleSync);

    return () => {
      clearInterval(unreadInterval);
      window.removeEventListener(NOTIFICATION_SYNC_EVENT, handleSync);
    };
  }, [loadNotifications, loadUnread, open]);

  useEffect(() => {
    if (!open) return undefined;

    const initialLoadTimeout = setTimeout(() => {
      loadNotifications();
    }, 0);
    const notificationInterval = setInterval(loadNotifications, 60000);

    return () => {
      clearTimeout(initialLoadTimeout);
      clearInterval(notificationInterval);
    };
  }, [loadNotifications, open]);

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id, options = {}) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((item) => (
        item.id === id ? { ...item, read: true, isRead: true } : item
      )));
      setUnread((prev) => Math.max(0, prev - 1));
      if (!options.silent) emitNotificationsSync();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true, isRead: true })));
      setUnread(0);
      emitNotificationsSync();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const existing = notifications.find((item) => item.id === id);
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      if (existing && !existing.read) setUnread((prev) => Math.max(0, prev - 1));
      emitNotificationsSync();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleOpenNotifications = async (notification) => {
    if (notification && !notification.read) {
      await handleMarkRead(notification.id, { silent: true });
    }
    setOpen(false);
    navigate(notificationsPath);
    emitNotificationsSync();
  };

  if (user?.role && user.role !== 'USER') {
    return null;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-[16px] border border-border bg-white/88 text-text-secondary shadow-[0_12px_24px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:text-text-primary"
        title="Notifications"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-slate-950 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-[0_8px_16px_rgba(15,23,42,0.18)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[9999] mt-3 flex max-h-[34rem] w-[23rem] flex-col overflow-hidden rounded-[24px] border border-border bg-white/94 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:w-[26rem]">
          <div className="shrink-0 border-b border-border bg-white/92 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="page-kicker">Activity</p>
                <h3 className="mt-2 text-base font-semibold text-text-primary">Notifications</h3>
              </div>
              <button onClick={() => setOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-border bg-white text-text-muted transition-colors hover:border-primary-200 hover:bg-surface-alt">
                <X size={14} className="text-text-muted" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 rounded-[14px] border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 h-5 w-5" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-text-muted">No notifications</p>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-3 px-5 py-4 transition-colors hover:bg-surface-alt ${!notification.read ? 'bg-primary-50/50' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenNotifications(notification)}
                      className="flex gap-3 flex-1 min-w-0 text-left"
                    >
                      <span className={`mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${!notification.read ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-border bg-white text-text-muted'}`}>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[11px] text-text-muted">{formatDate(notification.createdAt)}</p>
                      </div>
                    </button>
                    <div className="flex items-start gap-1 shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-text-muted transition-colors hover:bg-surface-alt hover:text-primary-700"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-text-muted transition-colors hover:bg-surface-alt hover:text-danger"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border bg-white/92 px-5 py-4">
            <button
              type="button"
              onClick={() => handleOpenNotifications()}
              className="flex w-full items-center justify-center gap-1.5 rounded-[16px] border border-border bg-white px-3 py-3 text-xs font-semibold text-primary-700 transition-colors hover:border-primary-200 hover:bg-surface-alt"
            >
              View all notifications
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
