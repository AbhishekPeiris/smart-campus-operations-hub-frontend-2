import { useState, useEffect } from 'react';
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications';
import { formatDate } from '../../utils/constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = () => {
    setLoading(true);
    getMyNotifications({ page, size: 20, unreadOnly })
      .then(res => setData(res.data.data || { content: res.data.data || [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, unreadOnly]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setData(prev => ({
        ...prev,
        content: (prev.content || []).map(n => n.id === id ? { ...n, read: true } : n)
      }));
    } catch {}
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setData(prev => ({
        ...prev,
        content: (prev.content || []).map(n => ({ ...n, read: true }))
      }));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setData(prev => ({
        ...prev,
        content: (prev.content || []).filter(n => n.id !== id)
      }));
    } catch {}
  };

  const notifications = data.content || [];

  const typeIcon = (type) => {
    const map = { BOOKING_APPROVED: '✅', BOOKING_REJECTED: '❌', TICKET_STATUS_CHANGED: '🔄', TICKET_COMMENT_ADDED: '💬' };
    return map[type] || '🔔';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold">Notifications</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" checked={unreadOnly} onChange={e => { setUnreadOnly(e.target.checked); setPage(0); }} className="accent-primary-600" />
            Unread only
          </label>
          <Button size="sm" variant="secondary" onClick={handleMarkAll}>
            <CheckCheck size={13} className="mr-1" /> Mark all read
          </Button>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : notifications.length === 0 ? (
          <EmptyState message="No notifications" icon={Bell} />
        ) : (
          <>
            <div className="divide-y divide-border">
              {notifications.map(n => (
                <div key={n.id} className={`px-4 py-3.5 flex gap-3 hover:bg-surface-alt/50 transition-colors ${!n.read ? 'bg-primary-50/30' : ''}`}>
                  <span className="text-lg shrink-0">{typeIcon(n.type || n.notificationType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                      {n.message || n.content || n.title}
                    </p>
                    <p className="text-xs text-text-muted mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="p-1.5 rounded hover:bg-surface-alt text-text-muted hover:text-primary-600" title="Mark as read">
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded hover:bg-surface-alt text-text-muted hover:text-danger" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pb-3">
              <Pagination currentPage={data.currentPage || 0} totalPages={data.totalPages || 0} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
