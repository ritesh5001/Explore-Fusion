import { RefObject, useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type HookConfig = {
		duration?: number;
		ease?: [number, number, number, number];
		multiplier?: number;
};

const DEFAULT_CONFIG: Required<HookConfig> = {
		duration: 0.45,
		ease: [0.22, 0.61, 0.36, 1],
		multiplier: 1,
};


export default function useVerticalToHorizontalScroll(
	containerRef: RefObject<HTMLElement>,
	config: HookConfig = {}
) {
	const { duration, ease, multiplier } = { ...DEFAULT_CONFIG, ...config };
	const isEngagedRef = useRef(false);
	const wheelDeltaRef = useRef(0);
	const rafRef = useRef<number | null>(null);
	const animationRef = useRef<ReturnType<typeof animate> | null>(null);
	const fallbackRef = useRef(false);

	useEffect(() => {
		if (typeof window === 'undefined') return undefined;

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const getConnection = () =>
			navigator.connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

		const computeFallback = () => {
			const connection = getConnection();
			const lowPower = Boolean(
				connection?.saveData ||
				(connection?.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType))
			);
			fallbackRef.current = mediaQuery.matches || lowPower;
		};

		computeFallback();

		const connection = getConnection();
		connection?.addEventListener?.('change', computeFallback);

		const addMediaListener = (handler: () => void) => {
			if (mediaQuery.addEventListener) {
				mediaQuery.addEventListener('change', handler);
				return () => mediaQuery.removeEventListener('change', handler);
			}
			mediaQuery.addListener(handler);
			return () => mediaQuery.removeListener(handler);
		};

		const removeMediaListener = addMediaListener(computeFallback);

		return () => {
			removeMediaListener();
			connection?.removeEventListener?.('change', computeFallback);
		};
	}, []);

	useEffect(() => {
		const node = containerRef.current;
		if (!node) return undefined;

		const scheduleMotion = () => {
			if (rafRef.current != null) return;
			rafRef.current = window.requestAnimationFrame(() => {
				rafRef.current = null;
				const delta = wheelDeltaRef.current;
				wheelDeltaRef.current = 0;
				if (delta === 0) return;
				const container = containerRef.current;
				if (!container) return;
				const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
				const start = container.scrollLeft;
				const target = clamp(start + delta, 0, maxScroll);
				if (target === start) return;
				animationRef.current?.stop();
				animationRef.current = animate(start, target, {
					duration,
					ease,
					onUpdate(value) {
						container.scrollLeft = value;
					},
					onComplete() {
						animationRef.current = null;
					},
				});
			});
		};

		const handleWheel = (event: WheelEvent) => {
			if (!isEngagedRef.current || event.defaultPrevented) return;
			const container = containerRef.current;
			if (!container) return;
			const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
			if (maxScroll <= 0) return;
			event.preventDefault();
			const delta = event.deltaY;
			const adjustedDelta = delta * multiplier;
			if (fallbackRef.current) {
				// Native fallback directly adjusts scrollLeft.
				container.scrollLeft = clamp(container.scrollLeft + adjustedDelta, 0, maxScroll);
				return;
			}
			wheelDeltaRef.current += adjustedDelta;
			scheduleMotion();
		};

		const handleEnter = () => {
			isEngagedRef.current = true;
		};

		const handleLeave = () => {
			isEngagedRef.current = false;
			wheelDeltaRef.current = 0;
			animationRef.current?.stop();
			animationRef.current = null;
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.stopPropagation();
				isEngagedRef.current = false;
				wheelDeltaRef.current = 0;
				animationRef.current?.stop();
				animationRef.current = null;
			}
		};

		node.addEventListener('mouseenter', handleEnter);
		node.addEventListener('mouseleave', handleLeave);
		node.addEventListener('focusin', handleEnter);
		node.addEventListener('focusout', handleLeave);
		node.addEventListener('wheel', handleWheel, { passive: false });
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			node.removeEventListener('mouseenter', handleEnter);
			node.removeEventListener('mouseleave', handleLeave);
			node.removeEventListener('focusin', handleEnter);
			node.removeEventListener('focusout', handleLeave);
			node.removeEventListener('wheel', handleWheel);
			window.removeEventListener('keydown', handleKeyDown);
			if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
			animationRef.current?.stop();
		};
	}, [containerRef, duration, ease]);
}
