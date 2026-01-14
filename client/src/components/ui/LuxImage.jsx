import { useMemo, useState } from 'react';
import { cn } from '../../utils/cn';
import { resolveGatewayUrl } from '../../utils/runtimeUrls';

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
	...props
}) {
	const [loaded, setLoaded] = useState(false);

	const finalSrc = useMemo(() => {
		if (!src) return null;
		const raw = String(src);
		const resolved = raw.startsWith('http') ? raw : resolveGatewayUrl(raw);
		return withTransform(resolved, mode === 'hero' ? heroTransform : transform);
	}, [src, transform, heroTransform, mode]);

	const blurSrc = useMemo(() => {
		if (!finalSrc) return null;
		// lightweight blur-up (ImageKit only)
		if (!isImageKitUrl(finalSrc)) return null;
		return withTransform(finalSrc, 'w-40,h-30,q-30,bl-20');
	}, [finalSrc]);

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
			{blurSrc && (
				<img
					src={blurSrc}
					alt=""
					aria-hidden="true"
					className={cn(
						'absolute inset-0 h-full w-full object-cover scale-110 blur-2xl',
						loaded ? 'opacity-0' : 'opacity-100',
						'transition-opacity duration-300'
					)}
				/>
			)}
			<img
				src={finalSrc}
				alt={alt || ''}
				loading="lazy"
				decoding="async"
				onLoad={() => setLoaded(true)}
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
