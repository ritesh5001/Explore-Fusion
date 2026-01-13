import useAuth from '../auth/useAuth';

export default function Dashboard() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<div className="text-gray-600">Loading…</div>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto px-4 py-10">
			<div className="bg-white shadow rounded-lg p-6">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<p className="mt-3 text-gray-700">Welcome, {user?.name || 'User'}</p>
				<p className="mt-1 text-gray-700">Role: {user?.role || 'user'}</p>
			</div>
		</div>
	);
}
