import Skeleton from './Skeleton';

export { Skeleton };

export default function Loader({ label = 'Loading…' }) {
	return (
		<div className="flex items-center justify-center gap-3 text-gray-700 dark:text-white/80 py-10">
			<div className="h-5 w-5 rounded-full border-2 border-soft dark:border-white/20 border-t-forest dark:border-t-trail animate-spin" />
			<div className="text-sm font-semibold">{label}</div>
		</div>
	);
}
