import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { getPackages } from '../api/packages';
import PackageCard from '../components/PackageCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import { Skeleton } from '../components/ui/Loader';

const Packages = () => {
	const { user } = useAuth();
	const [packages, setPackages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const canCreate =
		user?.role === 'creator' || user?.role === 'admin' || user?.role === 'superadmin';

	useEffect(() => {
		let ignore = false;
		const load = async () => {
			setError('');
			setLoading(true);
			try {
				const list = await getPackages();
				if (!ignore) setPackages(Array.isArray(list) ? list : []);
			} catch (e) {
				const serverMessage = e?.response?.data?.message || e?.response?.data?.error;
				if (!ignore) {
					setError(serverMessage || e?.message || 'Failed to load packages');
					setPackages([]);
				}
			} finally {
				if (!ignore) setLoading(false);
			}
		};
		load();
		return () => {
			ignore = true;
		};
	}, []);

	return (
		<div className="min-h-screen">
			<div className="container-app page-section">
				<SectionHeader
					title="Travel Packages"
					subtitle="Hand-picked experiences, creator trips, and community adventures."
					right={
						canCreate ? (
							<Button as={Link} to="/create-package" size="sm">
								+ Create Package
							</Button>
						) : null
					}
				/>

				{loading ? (
					<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, idx) => (
							<Card key={idx} className="overflow-hidden">
								<Skeleton className="h-44 w-full rounded-none" />
								<div className="p-6 space-y-3">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-10 w-full" />
								</div>
							</Card>
						))}
					</div>
				) : error ? (
					<Card className="mt-6 p-6">
						<div className="text-red-600 dark:text-red-300 font-semibold">Failed to load packages</div>
						<div className="text-sm mt-1 text-charcoal/70 dark:text-sand/70">{error}</div>
					</Card>
				) : (
					<div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
						{packages.map((pkg) => (
							<PackageCard
								key={pkg?._id}
								id={pkg?._id}
								title={pkg?.title}
								price={pkg?.price}
								destination={pkg?.destination}
								image={pkg?.images?.[0]}
							/>
						))}

						{packages.length === 0 && (
							<div className="md:col-span-3">
								<Card className="p-10 text-center">
									<p className="text-charcoal/70 dark:text-sand/70 text-lg">No packages found.</p>
									{canCreate && (
										<div className="mt-3">
											<Button as={Link} to="/create-package" variant="outline">
												Be the first to create one
											</Button>
										</div>
									)}
								</Card>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Packages;