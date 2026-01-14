import { useMemo, useState } from 'react';
import { cn } from '../../utils/cn';
import { resolveGatewayUrl } from '../../utils/runtimeUrls';
import SafeImage from '../common/SafeImage';

const isImageKitUrl = (url) => url.includes('imagekit.io') || url.includes('ik.imagekit.io');

const withTransform = (url, transform) => {
	if (!url) return url;
	if (!isImageKitUrl(url)) return url;
	if (url.includes('tr=')) return url;
	return url + (url.includes('?') ? '&' : '?') + `tr=${transform}`;
};

export default function LuxImage({
	src,
	alt,
	className = '',
	transform = 'w-400,h-300',
	heroTransform = 'w-1400,h-900',
	mode = 'card',
	fallback = '/images/placeholder.svg',
	...props
}) {
	const [loaded, setLoaded] = useState(false);

	const finalSrc = useMemo(() => {
		if (!src) return null;
		const raw = String(src);
		const resolved = raw.startsWith('http') ? raw : resolveGatewayUrl(raw);
		return withTransform(resolved, mode === 'hero' ? heroTransform : transform);
	}, [src, transform, heroTransform, mode]);

	if (!finalSrc) {
		return (
			<div
				className={cn(
					'flex items-center justify-center rounded-2xl bg-soft/60 text-charcoal/60 dark:bg-white/10 dark:text-sand/60',
					className
				)}
			>
				No image
			</div>
		);
	}

	return (
		<div className={cn('relative overflow-hidden', className)}>
			{!loaded && (
				<div
					aria-hidden="true"
					className={cn(
						'absolute inset-0 h-full w-full rounded-2xl bg-soft/60 dark:bg-white/10',
						'animate-pulse'
					)}
				/>
			)}
			<SafeImage
				src={finalSrc}
				fallback={fallback}
				alt={alt || ''}
				loading={props.loading || 'lazy'}
				decoding={props.decoding || 'async'}
				onLoad={(e) => {
					setLoaded(true);
					props.onLoad?.(e);
				}}
				onError={(e) => {
					// Ensure the skeleton goes away even if the primary image fails.
					setLoaded(true);
					props.onError?.(e);
				}}
				className={cn(
					'h-full w-full object-cover',
					loaded ? 'opacity-100' : 'opacity-0',
					'transition-opacity duration-500'
				)}
				{...props}
			/>
		</div>
	);
}
