import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api';
import { useToast } from '../components/ToastProvider';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Loader';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeNotifications = (body) => {
  const data = body?.data ?? body;
  return asArray(data?.notifications ?? data?.items ?? data);
};

const getId = (n) => n?._id || n?.id;

const getIsRead = (n) => Boolean(n?.read ?? n?.isRead ?? n?.seen);

const formatWhen = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export default function Notifications() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [markingId, setMarkingId] = useState(null);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = useMemo(() => asArray(items), [items]);

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
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-full max-w-[520px]" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-9 w-24 rounded-2xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState title="Couldn’t load notifications" description={error} onRetry={load} />
      ) : list.length === 0 ? (
        <EmptyState title="No notifications" description="You’re all caught up." icon="🔔" />
      ) : (
        <div className="mt-6 space-y-3">
          {list.map((n) => {
            const id = getId(n);
            const read = getIsRead(n);
            const title = n?.title || n?.type || 'Notification';
            const message = n?.message || n?.text || '';
            const when = formatWhen(n?.createdAt || n?.timestamp || n?.time);
            return (
              <Card
                key={id}
                className={`p-4 flex items-start justify-between gap-4 ${
                  read ? 'opacity-95' : 'border-trail/30 ring-1 ring-trail/10'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-charcoal dark:text-sand truncate">{title}</div>
                    <Badge tone={read ? 'default' : 'accent'}>{read ? 'Read' : 'New'}</Badge>
                  </div>
                  {!!message && <div className="text-sm text-charcoal/80 dark:text-sand/80 mt-1">{message}</div>}
                  {!!when && <div className="text-xs text-charcoal/60 dark:text-sand/60 mt-2">{when}</div>}
                </div>

                {!read && (
                  <Button
                    onClick={() => markRead(id)}
                    disabled={markingId === id}
                    size="sm"
                    variant="outline"
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
