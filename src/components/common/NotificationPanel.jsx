import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const notificationsPath = location.pathname.startsWith('/dashboard') || user?.role !== 'USER'
    ? '/dashboard/notifications'
    : '/portal/notifications';

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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-1.5 rounded-md text-text-muted hover:bg-surface-alt transition-colors"
        title="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[9px] font-bold flex items-center justify-center rounded-full">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-border rounded-lg shadow-xl z-50 max-h-[28rem] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-surface-alt">
                <X size={14} className="text-text-muted" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 h-5 w-5" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-center py-8 text-sm text-text-muted">No notifications</p>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 flex gap-3 hover:bg-surface-alt/50 transition-colors ${!notification.read ? 'bg-primary-50/30' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenNotifications(notification)}
                      className="flex gap-3 flex-1 min-w-0 text-left"
                    >
                      <span className="text-xs font-semibold shrink-0 mt-0.5 text-text-muted">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!notification.read ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-text-muted mt-1">{formatDate(notification.createdAt)}</p>
                      </div>
                    </button>
                    <div className="flex items-start gap-1 shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="p-1 text-text-muted hover:text-primary-600"
                          title="Mark as read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1 text-text-muted hover:text-danger"
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

          <div className="border-t border-border px-4 py-2.5">
            <button
              type="button"
              onClick={() => handleOpenNotifications()}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
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
