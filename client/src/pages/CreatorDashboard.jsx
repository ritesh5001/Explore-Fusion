import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api';
import useAuth from '../auth/useAuth';
import { useToast } from '../components/ToastProvider';
import SectionHeader from '../components/ui/SectionHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const asArray = (v) => (Array.isArray(v) ? v : []);

const normalizeSales = (body) => {
  const data = body?.data ?? body;
  return asArray(data?.sales ?? data?.bookings ?? data?.items ?? data);
};

const getId = (row) => row?._id || row?.id;
const getPackage = (row) => row?.package || row?.packageId || row?.pkg || null;
const getTitle = (row) => getPackage(row)?.title || row?.packageTitle || row?.title || 'Package';
const getPrice = (row) => getPackage(row)?.price ?? row?.price;
const getCustomer = (row) => row?.user?.email || row?.userId || row?.user?.id || '—';
const getStatus = (row) => String(row?.status || row?.bookingStatus || 'confirmed').toLowerCase();

const money = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};

export default function CreatorDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/bookings/creator/${user._id}`);
      setSales(normalizeSales(res?.data));
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load creator dashboard';
      setSales([]);
      setError(msg + (status ? ` (HTTP ${status})` : ''));
      showToast('Failed to load creator dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const bookings = asArray(sales);
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, row) => acc + (Number(getPrice(row)) || 0), 0);
    return { totalBookings, totalRevenue };
  }, [sales]);

  return (
    <div className="container-app page-section max-w-6xl space-y-4">
      <SectionHeader
        title="Creator Dashboard"
        subtitle="Track your bookings and revenue."
        right={
          <Button variant="outline" size="sm" onClick={load} disabled={!user?._id || loading}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <PageLoader label="Loading creator stats…" />
      ) : error ? (
        <ErrorState title="Couldn’t load creator dashboard" description={error} onRetry={load} />
      ) : sales.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="Once travelers book your packages, they’ll show up here."
          icon="📈"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="text-sm font-semibold text-charcoal/70 dark:text-sand/70">Total bookings</div>
              <div className="mt-2 text-3xl font-heading font-extrabold tracking-tight text-mountain dark:text-sand">
                {stats.totalBookings}
              </div>
              <div className="mt-3">
                <Badge tone="accent">Creator</Badge>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm font-semibold text-charcoal/70 dark:text-sand/70">Revenue (est.)</div>
              <div className="mt-2 text-3xl font-heading font-extrabold tracking-tight text-mountain dark:text-sand">
                {money(stats.totalRevenue)}
              </div>
              <div className="mt-3 text-sm text-charcoal/60 dark:text-sand/60">Sum of booked package prices.</div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-soft/80 dark:border-white/10">
              <div className="font-heading font-extrabold tracking-tight text-mountain dark:text-sand">Recent bookings</div>
              <div className="mt-1 text-sm text-charcoal/70 dark:text-sand/70">Your latest sales activity.</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-sand/80 dark:bg-white/5">
                  <tr>
                    <th className="text-left font-semibold text-charcoal/70 dark:text-sand/70 px-5 py-3 whitespace-nowrap">
                      Package
                    </th>
                    <th className="text-left font-semibold text-charcoal/70 dark:text-sand/70 px-5 py-3 whitespace-nowrap">
                      Price
                    </th>
                    <th className="text-left font-semibold text-charcoal/70 dark:text-sand/70 px-5 py-3 whitespace-nowrap">
                      Customer
                    </th>
                    <th className="text-left font-semibold text-charcoal/70 dark:text-sand/70 px-5 py-3 whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft/80 dark:divide-white/10">
                  {sales.map((row) => {
                    const id = getId(row);
                    const status = getStatus(row);
                    const tone = status === 'cancelled' ? 'default' : status === 'pending' ? 'gold' : 'success';
                    return (
                      <tr key={id}>
                        <td className="px-5 py-3 whitespace-nowrap font-semibold text-mountain dark:text-sand">
                          {getTitle(row)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-charcoal/80 dark:text-sand/80">
                          {money(getPrice(row))}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-charcoal/80 dark:text-sand/80">
                          {String(getCustomer(row))}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <Badge tone={tone}>{status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}