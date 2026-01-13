import { useEffect, useState } from 'react';
import API from '../api';
import { useToast } from '../components/ToastProvider';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageLoader from '../components/ui/PageLoader';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeNotifications = (body) => {
  const data = body?.data ?? body;
  return asArray(data?.notifications ?? data?.items ?? data);
};

const getId = (n) => n?._id || n?.id;

const getIsRead = (n) => Boolean(n?.read ?? n?.isRead ?? n?.seen);

export default function Notifications() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [markingId, setMarkingId] = useState(null);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await API.get('/notifications/my');
      setItems(normalizeNotifications(res?.data));
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load notifications';
      setError(msg + (status ? ` (HTTP ${status})` : ''));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = async (id) => {
    if (!id) return;
    setMarkingId(id);
    try {
      await API.put(`/notifications/${id}/read`);
      setItems((prev) => asArray(prev).map((n) => (getId(n) === id ? { ...n, read: true, isRead: true, seen: true } : n)));
      showToast('Marked as read', 'success');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to mark read';
      showToast(msg, 'error');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="container-app page-section max-w-5xl">
      <SectionHeader
        title="Notifications"
        subtitle="Updates about bookings, buddies, and system messages."
        right={
          <Button variant="outline" size="sm" onClick={load} aria-label="Refresh notifications">
            Refresh
          </Button>
        }
      />

      {loading ? (
        <PageLoader label="Loading notifications…" />
      ) : error ? (
        <ErrorState title="Couldn’t load notifications" description={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="No notifications" description="You’re all caught up." icon="🔔" />
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const id = getId(n);
            const read = getIsRead(n);
            const title = n?.title || n?.type || 'Notification';
            const message = n?.message || n?.text || '';
            return (
              <Card
                key={id}
                className={`p-4 flex items-start justify-between gap-4 ${read ? 'opacity-90' : 'border-trail/30'}`}
              >
                <div>
                  <div className="font-semibold text-charcoal dark:text-sand">{title}</div>
                  {!!message && <div className="text-sm text-charcoal/80 dark:text-sand/80 mt-1">{message}</div>}
                  <div className="text-xs text-charcoal/60 dark:text-sand/60 mt-2">{read ? 'Read' : 'Unread'}</div>
                </div>

                {!read && (
                  <Button
                    onClick={() => markRead(id)}
                    disabled={markingId === id}
                    size="sm"
                    aria-label="Mark notification as read"
                  >
                    {markingId === id ? 'Marking…' : 'Mark Read'}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
