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
			<Card className="mt-6 p-6 animate-fade-in">
				{user ? (
					<div className="space-y-2">
						<p className="text-charcoal/80 dark:text-sand/80">
							<span className="mr-2">👋</span>
							Welcome, <span className="font-semibold">{user?.name || 'User'}</span>
						</p>
						<p className="text-charcoal/70 dark:text-sand/70 text-sm">
							<span className="mr-2">🛡️</span>
							Role: <span className="font-semibold">{user?.role || 'user'}</span>
						</p>
						<p className="text-charcoal/60 dark:text-sand/60 text-sm">
							<span className="mr-2">✨</span>
							Tip: Use Packages to discover trips and start booking.
						</p>
					</div>
				) : (
					<div className="text-charcoal/70 dark:text-sand/70">
						No profile data available right now.
					</div>
				)}
			</Card>
		</div>
	);
}
