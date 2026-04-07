import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications';
import { formatDate } from '../../utils/constants';

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const loadUnread = () => {
    getUnreadCount().then(res => {
      const count = res.data.data?.unreadCount ?? res.data.data ?? 0;
      setUnread(typeof count === 'number' ? count : 0);
    }).catch(() => {});
  };

  const loadNotifications = () => {
    setLoading(true);
    getMyNotifications({ page: 0, size: 30 })
      .then(res => setNotifications(res.data.data?.content || res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      const n = notifications.find(x => x.id === id);
      setNotifications(prev => prev.filter(x => x.id !== id));
      if (n && !n.read) setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const typeIcon = (type) => {
    const map = {
      BOOKING_APPROVED: '✅',
      BOOKING_REJECTED: '❌',
      TICKET_STATUS_CHANGED: '🔄',
      TICKET_COMMENT_ADDED: '💬',
    };
    return map[type] || '🔔';
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
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
                <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                  <CheckCheck size={12} /> Mark all read
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
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-surface-alt/50 transition-colors ${!n.read ? 'bg-primary-50/30' : ''}`}>
                    <span className="text-base shrink-0 mt-0.5">{typeIcon(n.type || n.notificationType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                        {n.message || n.content || n.title}
                      </p>
                      <p className="text-[10px] text-text-muted mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                    <div className="flex items-start gap-1 shrink-0">
                      {!n.read && (
                        <button onClick={() => handleMarkRead(n.id)} className="p-1 text-text-muted hover:text-primary-600" title="Mark as read">
                          <Check size={12} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(n.id)} className="p-1 text-text-muted hover:text-danger" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
