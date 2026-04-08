import { useCallback, useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import {
  deleteNotification,
  getMyNotifications,
  getNotification,
  markAllAsRead,
  markAsRead,
} from '../../api/notifications';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import {
  emitNotificationsSync,
  formatDate,
  getNotificationIcon,
  getNotificationLabel,
} from '../../utils/constants';
import {
  extractApiData,
  normalizeNotification,
  normalizePaginatedData,
} from '../../utils/apiData';

const toNotificationsPage = (payload) => normalizePaginatedData(payload, normalizeNotification);

export default function NotificationsPage() {
  const [data, setData] = useState({ content: [], totalPages: 0, currentPage: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getMyNotifications({ page, size: 20, unreadOnly })
      .then((res) => {
        setData(toNotificationsPage(extractApiData(res)));
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
      })
      .finally(() => setLoading(false));
  }, [page, unreadOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const updateNotification = (id, updater) => {
    setData((prev) => ({
      ...prev,
      content: prev.content.map((item) => (item.id === id ? updater(item) : item)),
    }));
  };

  const handleMarkRead = async (id, options = {}) => {
    try {
      await markAsRead(id);
      updateNotification(id, (item) => ({ ...item, read: true, isRead: true }));
      if (!options.silent) emitNotificationsSync();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      if (!options.silent) alert('Failed to mark notification as read');
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setData((prev) => ({
        ...prev,
        content: prev.content.map((item) => ({ ...item, read: true, isRead: true })),
      }));
      emitNotificationsSync();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      alert('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;

    try {
      await deleteNotification(id);
      setData((prev) => ({
        ...prev,
        content: prev.content.filter((item) => item.id !== id),
      }));
      if (selectedNotification?.id === id) setSelectedNotification(null);
      emitNotificationsSync();
    } catch (err) {
      console.error('Failed to delete notification:', err);
      alert('Failed to delete notification');
    }
  };

  const handleOpenDetails = async (notification) => {
    setSelectedNotification(notification);
    setDetailLoading(true);

    try {
      const res = await getNotification(notification.id);
      const detailedNotification = normalizeNotification(extractApiData(res) || notification);
      setSelectedNotification(detailedNotification);
      if (!detailedNotification.read) {
        await handleMarkRead(detailedNotification.id, { silent: true });
        setSelectedNotification((prev) => (prev ? { ...prev, read: true, isRead: true } : prev));
        emitNotificationsSync();
      }
    } catch (err) {
      console.error('Failed to load notification details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const notifications = data.content || [];
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="app-page">
      <div className="page-header">
        <div>
          <p className="page-kicker">Activity Center</p>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay on top of booking decisions, ticket changes, and account activity from one inbox.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-[14px] border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-danger">
              {unreadCount} unread on this page
            </span>
          )}
          <label className="surface-panel-muted flex items-center gap-2 px-4 py-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => {
                setUnreadOnly(event.target.checked);
                setPage(0);
              }}
            />
            Unread only
          </label>
          <Button size="sm" variant="secondary" onClick={handleMarkAll} disabled={notifications.length === 0}>
            <CheckCheck size={13} />
            Mark all read
          </Button>
        </div>
      </div>

      <Card className="section-card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        ) : notifications.length === 0 ? (
          <EmptyState message="No notifications" icon={Bell} />
        ) : (
          <>
            <div className="app-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`app-list-item flex gap-4 ${!notification.read ? 'bg-primary-50/45' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(notification)}
                    className="flex min-w-0 flex-1 gap-4 text-left"
                  >
                    <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border ${!notification.read ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-border bg-white/85 text-text-muted'}`}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-6 ${!notification.read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {getNotificationLabel(notification.type)} - {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-primary-200 bg-primary-50 text-primary-700 transition-colors hover:bg-primary-100"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-red-200 bg-red-50 text-danger transition-colors hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4">
              <Pagination
                currentPage={data.currentPage || 0}
                totalPages={data.totalPages || 0}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        title={selectedNotification ? getNotificationLabel(selectedNotification.type) : 'Notification'}
        size="md"
      >
        {detailLoading ? (
          <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : selectedNotification ? (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-primary-200 bg-primary-50 text-primary-700">
                {getNotificationIcon(selectedNotification.type)}
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">{selectedNotification.message}</p>
                <p className="mt-1 text-xs text-text-muted">{formatDate(selectedNotification.createdAt)}</p>
              </div>
            </div>
            <div className="surface-panel-muted px-4 py-4">
              <p className="detail-tile__label">Details</p>
              <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">
                {selectedNotification.content || selectedNotification.message}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              {!selectedNotification.read && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleMarkRead(selectedNotification.id)}
                >
                  Mark as read
                </Button>
              )}
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(selectedNotification.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
