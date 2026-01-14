import { createElement } from 'react';
import { cn } from '../../utils/cn';

const base =
	'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';

const variants = {
	primary:
		'text-white bg-forest shadow-[0_14px_40px_rgba(10,27,63,0.30)] hover:shadow-[0_18px_55px_rgba(10,27,63,0.42)] active:scale-[0.99] ' +
		'bg-[linear-gradient(135deg,rgba(10,27,63,1),rgba(10,27,63,0.85),rgba(34,211,238,0.22))] hover:bg-[linear-gradient(135deg,rgba(10,27,63,1),rgba(10,27,63,0.88),rgba(34,211,238,0.30))]',
	secondary:
		'border border-soft/90 dark:border-white/10 bg-white/70 dark:bg-white/5 text-charcoal dark:text-sand backdrop-blur-md ' +
		'hover:border-trail/60 hover:shadow-[0_12px_40px_rgba(34,211,238,0.10)]',
	ghost:
		'text-charcoal dark:text-sand hover:bg-soft/60 dark:hover:bg-white/10',
	danger:
		'text-white bg-red-600 hover:bg-red-700 shadow-[0_14px_40px_rgba(239,68,68,0.25)] active:scale-[0.99]',
	link: 'text-forest hover:text-trail hover:underline',
	// Back-compat
	outline: 'border border-soft/90 dark:border-white/10 bg-white/70 dark:bg-white/5 text-charcoal dark:text-sand backdrop-blur-md hover:border-trail/60',
};

const sizes = {
	sm: 'h-10 px-4 text-sm',
	md: 'h-11 px-5 text-sm',
	lg: 'h-12 px-6 text-base',
};

function Spinner() {
	return <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />;
}

export default function Button({
	as: Component = 'button',
	variant = 'primary',
	size = 'md',
	className = '',
	loading = false,
	disabled,
	children,
	...props
}) {
	const v = variants[variant] || variants.primary;

	return createElement(
		Component,
		{
			disabled: disabled || loading,
			className: cn(
				base,
				'focus-visible:ring-2 focus-visible:ring-trail/35 focus-visible:ring-offset-2 focus-visible:ring-offset-sand dark:focus-visible:ring-offset-charcoal',
				v,
				sizes[size] || sizes.md,
				className
			),
			...props,
		},
		loading ? createElement(Spinner, { key: 'spinner' }) : null,
		createElement('span', { key: 'content', className: cn(loading ? 'opacity-90' : '') }, children)
	);
}
