import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../auth/useAuth';
import { getPackages } from '../api/packages';
import PackageCard from '../components/PackageCard';

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
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-6xl mx-auto py-10 px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">Travel Packages</h1>
					{canCreate && (
						<Link
							to="/create-package"
							className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
						>
							+ Create Package
						</Link>
					)}
				</div>

				{loading ? (
					<div className="bg-white border rounded-lg p-6 text-gray-600">Loading packages…</div>
				) : error ? (
					<div className="bg-white border rounded-lg p-6">
						<div className="text-red-600 font-semibold">Failed to load packages</div>
						<div className="text-gray-600 text-sm mt-1">{error}</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
							<div className="col-span-3 text-center py-20">
								<p className="text-gray-500 text-lg">No packages found.</p>
								{canCreate && (
									<Link to="/create-package" className="text-blue-600 font-semibold hover:underline">
										Be the first to create one
									</Link>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Packages;