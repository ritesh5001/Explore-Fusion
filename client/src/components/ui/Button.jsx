import { createElement } from 'react';
import { cn } from '../../utils/cn';

const base =
	'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';

const variants = {
	primary:
		'text-white bg-charcoal shadow-[0_18px_48px_rgba(0,0,0,0.10)] hover:shadow-[0_22px_60px_rgba(0,0,0,0.12)] active:translate-y-px',
	secondary:
		'border border-border bg-white/70 text-charcoal backdrop-blur-sm hover:border-charcoal/20',
	ghost:
		'text-charcoal hover:bg-black/5',
	danger:
		'text-white bg-red-600 hover:bg-red-700 shadow-[0_14px_40px_rgba(239,68,68,0.25)] active:scale-[0.99]',
	link: 'text-charcoal hover:text-gold hover:underline',
	// Back-compat
	outline: 'border border-border bg-white/70 text-charcoal backdrop-blur-sm hover:border-charcoal/20',
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
				'focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-2 focus-visible:ring-offset-sand',
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
