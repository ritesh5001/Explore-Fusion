import { useEffect, useState } from 'react';
import API from '../api';
import { useToast } from '../components/ToastProvider';

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
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={load} className="text-sm font-semibold text-blue-600 hover:underline">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white border rounded-lg p-6 text-gray-600">Loading…</div>
      ) : error ? (
        <div className="bg-white border rounded-lg p-6">
          <div className="text-red-600 font-semibold">Error</div>
          <div className="text-gray-700 text-sm mt-1">{error}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border rounded-lg p-6 text-gray-600">No notifications.</div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const id = getId(n);
            const read = getIsRead(n);
            const title = n?.title || n?.type || 'Notification';
            const message = n?.message || n?.text || '';
            return (
              <div
                key={id}
                className={`bg-white border rounded-lg p-4 flex items-start justify-between gap-4 ${
                  read ? 'opacity-80' : 'border-blue-200'
                }`}
              >
                <div>
                  <div className="font-semibold text-gray-900">{title}</div>
                  {!!message && <div className="text-sm text-gray-700 mt-1">{message}</div>}
                  <div className="text-xs text-gray-500 mt-2">{read ? 'Read' : 'Unread'}</div>
                </div>

                {!read && (
                  <button
                    onClick={() => markRead(id)}
                    disabled={markingId === id}
                    className="bg-blue-600 text-white font-semibold px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                  >
                    {markingId === id ? 'Marking…' : 'Mark Read'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
