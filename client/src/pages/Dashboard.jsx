import useAuth from '../auth/useAuth';
import Card from '../components/ui/Card';
import SectionHeader from '../components/ui/SectionHeader';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { useReveal } from '../hooks/useReveal';

export default function Dashboard() {
	const headerRevealRef = useReveal();
	const welcomeRevealRef = useReveal();
	const accountRevealRef = useReveal();
	const nextRevealRef = useReveal();
	const discoverRevealRef = useReveal();
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="container-app page-section">
				<Loader label="Loading dashboard…" />
			</div>
		);
	}

	return (
		<div className="container-app page-section max-w-5xl">
			<div ref={headerRevealRef} data-reveal>
				<SectionHeader title="Dashboard" subtitle="Your control center for trips, buddies, and AI." />
			</div>

			<div ref={welcomeRevealRef} data-reveal style={{ ['--reveal-delay']: '80ms' }}>
				<Card className="mt-6 p-6 overflow-hidden">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
					<div className="min-w-0">
						<div className="text-xs font-semibold tracking-wide text-charcoal/60 dark:text-sand/60">WELCOME</div>
						<div className="mt-1 text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-mountain dark:text-sand">
							{user ? `Hi, ${user?.name || 'Traveler'}` : 'Hi there'}
						</div>
						<div className="mt-2 text-sm text-charcoal/70 dark:text-sand/70 max-w-2xl">
							Build a premium trip plan, book creator experiences, and match with buddies.
						</div>
						<div className="mt-3 flex flex-wrap items-center gap-2">
							<Badge tone="accent">Fast planning</Badge>
							<Badge tone="gold">Creator packages</Badge>
							<Badge>Community</Badge>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-2 md:w-[320px]">
						<Button as={Link} to="/packages" className="w-full">Browse</Button>
						<Button as={Link} to="/plan-trip" variant="secondary" className="w-full">Plan Trip</Button>
						<Button as={Link} to="/buddy/profile" variant="secondary" className="w-full">Buddy</Button>
						<Button as={Link} to="/ai/itinerary" variant="ghost" className="w-full">AI</Button>
					</div>
				</div>
				</Card>
			</div>

			<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
				<div ref={accountRevealRef} data-reveal style={{ ['--reveal-delay']: '160ms' }}>
					<Card className="p-6">
					<div className="text-xs font-semibold tracking-wide text-charcoal/60 dark:text-sand/60">ACCOUNT</div>
					<div className="mt-2 text-sm text-charcoal/80 dark:text-sand/80">
						<div className="flex items-center justify-between">
							<span className="font-semibold">Role</span>
							<Badge tone="accent">{user?.role || 'user'}</Badge>
						</div>
						<div className="mt-2 flex items-center justify-between">
							<span className="font-semibold">Email</span>
							<span className="text-charcoal/70 dark:text-sand/70 truncate max-w-[55%]">{user?.email || '—'}</span>
						</div>
					</div>
					<div className="mt-4">
						<Button as={Link} to="/profile" variant="secondary" size="sm">Manage profile</Button>
					</div>
					</Card>
				</div>

				<div ref={nextRevealRef} data-reveal style={{ ['--reveal-delay']: '240ms' }}>
					<Card className="p-6">
					<div className="text-xs font-semibold tracking-wide text-charcoal/60 dark:text-sand/60">NEXT</div>
					<div className="mt-2 text-lg font-heading font-bold text-mountain dark:text-sand">Create your buddy profile</div>
					<div className="mt-2 text-sm text-charcoal/70 dark:text-sand/70">Better matches come from better preferences.</div>
					<div className="mt-4">
						<Button as={Link} to="/buddy/profile" size="sm">Update buddy profile</Button>
					</div>
					</Card>
				</div>

				<div ref={discoverRevealRef} data-reveal style={{ ['--reveal-delay']: '320ms' }}>
					<Card className="p-6">
					<div className="text-xs font-semibold tracking-wide text-charcoal/60 dark:text-sand/60">DISCOVER</div>
					<div className="mt-2 text-lg font-heading font-bold text-mountain dark:text-sand">Premium packages</div>
					<div className="mt-2 text-sm text-charcoal/70 dark:text-sand/70">Hand-picked creator trips with clean booking flow.</div>
					<div className="mt-4">
						<Button as={Link} to="/packages" variant="secondary" size="sm">Explore packages</Button>
					</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
