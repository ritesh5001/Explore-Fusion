import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { getPackageById } from '../api/packages';
import BookPackageButton from '../components/BookPackageButton';

const PackageDetails = () => {
	const { id } = useParams();
	const [pkg, setPkg] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const imageUrl = useMemo(() => {
		const first = pkg?.images?.[0];
		if (!first) return null;
		if (String(first).startsWith('http')) return first;
		return `http://localhost:5050${first}`;
	}, [pkg]);

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
				<div className="bg-white border rounded-lg p-6">
					<h1 className="text-xl font-bold mb-2">Package not available</h1>
					<p className="text-gray-600 mb-4">{error || 'Not found'}</p>
					<Link to="/packages" className="text-blue-600 font-semibold hover:underline">
						← Back to packages
					</Link>
				</div>
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
		<div className="max-w-5xl mx-auto px-4 py-10">
			<div className="mb-6">
				<Link to="/packages" className="text-blue-600 font-semibold hover:underline">
					← Back to packages
				</Link>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="bg-white rounded-lg shadow overflow-hidden">
					{imageUrl ? (
						<img src={imageUrl} alt={pkg.title} className="w-full h-80 object-cover" />
					) : (
						<div className="w-full h-80 bg-gray-100 flex items-center justify-center text-gray-500">No image</div>
					)}
					<div className="p-6">
						<div className="flex items-start justify-between gap-4">
							<h1 className="text-2xl font-bold">{pkg.title}</h1>
							<div className="text-right">
								<div className="text-sm text-gray-500">Price</div>
								<div className="text-xl font-bold">${pkg.price}</div>
							</div>
						</div>

						<p className="mt-4 text-sm text-gray-700 leading-relaxed">{pkg.description}</p>

						<div className="mt-4 flex flex-wrap gap-3 text-sm">
							<span className="px-3 py-1 rounded-full bg-gray-100">📍 {pkg.destination}</span>
							<span className="px-3 py-1 rounded-full bg-gray-100">⏳ {pkg.duration}</span>
						</div>

						{creatorDisplay && (
							<div className="mt-4 text-sm text-gray-700">
								<span className="font-semibold">Creator:</span> {creatorDisplay}
							</div>
						)}

						<div className="mt-6 border-t pt-4">
							<BookPackageButton packageId={id} />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6 h-fit">
					<h2 className="text-lg font-bold">Details</h2>
					<div className="mt-3 text-sm text-gray-700 space-y-2">
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
				</div>
			</div>
		</div>
	);
};

export default PackageDetails;
