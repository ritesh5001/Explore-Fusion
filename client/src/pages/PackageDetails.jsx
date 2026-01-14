import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { getPackageById } from '../api/packages';
import BookPackageButton from '../components/BookPackageButton';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import LuxImage from '../components/ui/LuxImage';

const PackageDetails = () => {
	const { id } = useParams();
	const [pkg, setPkg] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!id) return;
		let ignore = false;

		const run = async () => {
			setError('');
			setLoading(true);
			try {
				const pkgData = await getPackageById(id);
				if (!ignore) setPkg(pkgData || null);
			} catch (e) {
				const msg = e?.response?.data?.message || e?.message || 'Failed to load package';
				if (!ignore) {
					setError(msg);
					setPkg(null);
				}
			} finally {
				if (!ignore) setLoading(false);
			}
		};

		run();
		return () => {
			ignore = true;
		};
	}, [id]);

	if (loading) return <Loader label="Loading package…" />;

	if (error || !pkg) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-10">
				<Card className="p-6">
					<SectionHeader title="Package not available" subtitle={error || 'Not found'} />
					<div className="mt-4">
						<Button as={Link} to="/packages" variant="outline" size="sm">
							← Back to packages
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	const creatorDisplay = (() => {
		const c = pkg?.creator ?? pkg?.createdBy ?? pkg?.creatorId;
		if (!c) return null;
		if (typeof c === 'object') return c?.name || c?.email || c?._id || null;
		return String(c);
	})();

	return (
		<div className="max-w-5xl mx-auto px-4 py-10 pb-28 md:pb-10">
			<div className="mb-6 flex items-center justify-between gap-4">
				<Button as={Link} to="/packages" variant="ghost" size="sm">
					← Back
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<Card className="overflow-hidden">
					{pkg?.images?.[0] ? (
						<LuxImage
							src={pkg.images[0]}
							alt={pkg.title}
							mode="hero"
							heroTransform="w-1400,h-900"
							className="w-full h-80"
						/>
					) : (
						<div className="w-full h-80 bg-soft/60 dark:bg-white/10 flex items-center justify-center text-charcoal/60 dark:text-sand/60">
							No image
						</div>
					)}
					<div className="p-6">
						<SectionHeader
							title={pkg.title}
							subtitle={pkg.destination ? `📍 ${pkg.destination}` : undefined}
							right={
								<div className="text-right">
									<div className="text-xs text-charcoal/60 dark:text-sand/60">Price</div>
									<div className="text-xl font-bold">${pkg.price}</div>
								</div>
							}
						/>

						<p className="mt-4 text-sm text-charcoal/80 dark:text-sand/80 leading-relaxed">{pkg.description}</p>

						<div className="mt-4 flex flex-wrap gap-3 text-sm">
							{!!pkg.destination && (
								<span className="px-3 py-1 rounded-full bg-soft/70 dark:bg-white/10">📍 {pkg.destination}</span>
							)}
							{!!pkg.duration && (
								<span className="px-3 py-1 rounded-full bg-soft/70 dark:bg-white/10">⏳ {pkg.duration}</span>
							)}
						</div>

						{creatorDisplay && (
							<div className="mt-4 text-sm text-charcoal/80 dark:text-sand/80">
								<span className="font-semibold">Creator:</span> {creatorDisplay}
							</div>
						)}

						<div className="mt-6 border-t pt-4">
							<BookPackageButton packageId={id} />
						</div>
					</div>
				</Card>

				<Card className="p-6 h-fit">
					<SectionHeader title="Details" />
					<div className="mt-3 text-sm text-charcoal/80 dark:text-sand/80 space-y-2">
						<div>
							<span className="font-semibold">Destination:</span> {pkg.destination}
						</div>
						<div>
							<span className="font-semibold">Duration:</span> {pkg.duration}
						</div>
						<div>
							<span className="font-semibold">Price:</span> ${pkg.price}
						</div>
					</div>

					<div className="mt-6 md:mt-6 md:static md:bottom-auto md:left-auto md:right-auto md:z-auto md:px-0 fixed bottom-4 left-0 right-0 z-40 px-4">
						<div className="md:max-w-none max-w-5xl mx-auto">
							<div className="md:p-0 md:border-0 md:bg-transparent md:shadow-none rounded-2xl shadow-xl border border-soft dark:border-white/10 bg-white/90 dark:bg-[#0F1F1A]/90 backdrop-blur-md p-4">
								<div className="md:hidden text-xs font-semibold text-charcoal/70 dark:text-sand/70 mb-2">Ready to book?</div>
								<BookPackageButton packageId={id} />
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default PackageDetails;
