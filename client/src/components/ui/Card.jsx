export default function Card({ className = '', children }) {
	return (
		<div
			className={
				`rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 ` +
				`bg-white dark:bg-[#0F1F1A] border border-soft dark:border-white/10 ` +
				className
			}
		>
			{children}
		</div>
	);
}
