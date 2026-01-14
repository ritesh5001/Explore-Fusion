import { useEffect, useMemo, useRef } from 'react';

// Avoid console spam: only log a given failing src once (dev only).
const loggedFailures = new Set();

const normalizeFallback = (fallback) => {
	if (!fallback) return null;
	return String(fallback);
};

export default function SafeImage({
	src,
	fallback = '/images/placeholder.svg',
	alt = '',
	className,
	onLoad,
	onError,
	...props
}) {
	const primarySrc = useMemo(() => (src ? String(src) : ''), [src]);
	const fallbackSrc = useMemo(() => normalizeFallback(fallback), [fallback]);
	const triedFallbackRef = useRef(false);
	const lastPrimaryRef = useRef(primarySrc);

	useEffect(() => {
		lastPrimaryRef.current = primarySrc;
		triedFallbackRef.current = false;
	}, [primarySrc]);

	const handleError = (e) => {
		if (import.meta.env.DEV && primarySrc && !loggedFailures.has(primarySrc)) {
			loggedFailures.add(primarySrc);
			// Warn once per unique src to avoid spamming.
			console.warn('[SafeImage] failed to load:', primarySrc);
		}

		if (!triedFallbackRef.current && fallbackSrc) {
			try {
				triedFallbackRef.current = true;
				e.currentTarget.src = fallbackSrc;
				return;
			} catch {
				// ignore
			}
		}

		// If even fallback fails, hide the element.
		try {
			e.currentTarget.style.display = 'none';
		} catch {
			// ignore
		}

		onError?.(e);
	};

	const handleLoad = (e) => {
		onLoad?.(e);
	};

	return (
		<img
			src={primarySrc || fallbackSrc || ''}
			alt={alt}
			className={className}
			loading={props.loading || 'lazy'}
			decoding={props.decoding || 'async'}
			onError={handleError}
			onLoad={handleLoad}
			{...props}
		/>
	);
}
