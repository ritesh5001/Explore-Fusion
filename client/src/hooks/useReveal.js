import { useEffect, useRef } from 'react';

export function useReveal(options = {}) {
	const ref = useRef(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return undefined;

		// If already revealed (e.g. due to back/forward cache), don't re-animate.
		if (el.dataset.revealed === 'true') return undefined;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					entry.target.dataset.revealed = 'true';
					observer.disconnect();
					break;
				}
			},
			{
				root: null,
				threshold: 0.12,
				rootMargin: '0px 0px -8% 0px',
				...options,
			}
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [options]);

	return ref;
}
