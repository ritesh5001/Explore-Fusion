import Loader from './Loader';

export default function PageLoader({ label = 'Loading…', className = '' }) {
	return (
		<div className={`min-h-[60vh] flex items-center justify-center ${className}`}>
			<Loader label={label} />
		</div>
	);
}
