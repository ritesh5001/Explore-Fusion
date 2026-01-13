import useAuth from '../auth/useAuth';
import Card from '../components/ui/Card';
import SectionHeader from '../components/ui/SectionHeader';
import Loader from '../components/ui/Loader';

export default function Dashboard() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="container-app page-section">
				<Loader label="Loading dashboard…" />
			</div>
		);
	}

	return (
		<div className="container-app page-section max-w-3xl">
			<SectionHeader title="Dashboard" subtitle="Your account overview." />
			<Card className="mt-6 p-6">
				<p className="text-charcoal/80 dark:text-sand/80">Welcome, {user?.name || 'User'}</p>
				<p className="mt-1 text-charcoal/80 dark:text-sand/80">Role: {user?.role || 'user'}</p>
			</Card>
		</div>
	);
}
