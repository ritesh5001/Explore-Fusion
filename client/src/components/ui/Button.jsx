const base =
	'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition transform focus:outline-none focus:ring-2 focus:ring-olive/40 disabled:opacity-60 disabled:cursor-not-allowed';

const variants = {
	primary:
		'bg-forest hover:bg-trail text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]',
	outline:
		'border border-soft bg-white/70 dark:bg-white/5 dark:border-white/10 text-charcoal dark:text-sand hover:border-trail hover:shadow-md hover:scale-[1.02] active:scale-[0.99] backdrop-blur-md',
	ghost:
		'text-charcoal dark:text-sand hover:bg-soft/60 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.99]',
	link: 'text-forest hover:text-trail hover:underline',
	danger:
		'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]',
};

const sizes = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2 text-sm',
	lg: 'px-5 py-3 text-base',
};

export default function Button({
	as: Comp = 'button',
	variant = 'primary',
	size = 'md',
	className = '',
	...props
}) {
	return <Comp className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props} />;
}
