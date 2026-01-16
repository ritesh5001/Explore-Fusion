import { useEffect, useMemo, useRef, useState } from 'react';
import useVerticalToHorizontalScroll from '../../hooks/useVerticalToHorizontalScroll';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export default function HorizontalScroller({
	items,
	renderItem,
	ariaLabel,
	speed = 8, // px / second
	className = '',
	itemClassName = '',
}) {
	const baseItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
	const scrollerRef = useRef(null);
	const rafRef = useRef(null);
	const lastTsRef = useRef(null);
	const pausedRef = useRef(false);

	const [isDragging, setIsDragging] = useState(false);
	const dragRef = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: 0 });

	// Render duplicates to allow seamless looping.
	const loopItems = useMemo(() => {
		if (!baseItems.length) return [];
		return [...baseItems, ...baseItems];
	}, [baseItems]);

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;
		if (!baseItems.length) return;

		const pxPerMs = clamp(Number(speed) || 0, 0, 60) / 1000;

		const tick = (ts) => {
			const node = scrollerRef.current;
			if (!node) return;

			if (pausedRef.current || dragRef.current.active) {
				lastTsRef.current = ts;
				rafRef.current = requestAnimationFrame(tick);
				return;
			}

			const last = lastTsRef.current ?? ts;
			const dt = ts - last;
			lastTsRef.current = ts;

			// Scroll
			node.scrollLeft += dt * pxPerMs;

			// Loop back when reaching halfway (because items duplicated)
			const half = node.scrollWidth / 2;
			if (half > 0 && node.scrollLeft >= half) {
				node.scrollLeft -= half;
			}

			rafRef.current = requestAnimationFrame(tick);
		};

		lastTsRef.current = null;
		rafRef.current = requestAnimationFrame(tick);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			lastTsRef.current = null;
		};
	}, [baseItems.length, speed]);

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;

		const onEnter = () => {
			pausedRef.current = true;
		};
		const onLeave = () => {
			pausedRef.current = false;
		};

		el.addEventListener('mouseenter', onEnter);
		el.addEventListener('mouseleave', onLeave);
		el.addEventListener('focusin', onEnter);
		el.addEventListener('focusout', onLeave);

		return () => {
			el.removeEventListener('mouseenter', onEnter);
			el.removeEventListener('mouseleave', onLeave);
			el.removeEventListener('focusin', onEnter);
			el.removeEventListener('focusout', onLeave);
		};
	}, []);

	useVerticalToHorizontalScroll(scrollerRef, { multiplier: 1.75 });

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;

		const onPointerDown = (e) => {
			if (e.pointerType === 'touch') return; // native swipe is better
			if (e.button !== undefined && e.button !== 0) return;
			try {
				el.setPointerCapture(e.pointerId);
			} catch {
				// noop
			}
			dragRef.current = {
				active: true,
				startX: e.clientX,
				startScrollLeft: el.scrollLeft,
				moved: 0,
			};
			setIsDragging(true);
		};

		const onPointerMove = (e) => {
			if (!dragRef.current.active) return;
			const dx = e.clientX - dragRef.current.startX;
			dragRef.current.moved = Math.max(dragRef.current.moved, Math.abs(dx));
			el.scrollLeft = dragRef.current.startScrollLeft - dx;
		};

		const onPointerUp = (e) => {
			if (!dragRef.current.active) return;
			dragRef.current.active = false;
			setIsDragging(false);
			try {
				el.releasePointerCapture(e.pointerId);
			} catch {
				// noop
			}
		};

		const onClickCapture = (e) => {
			// Avoid accidental clicks when dragging.
			if (dragRef.current.moved > 6) {
				e.preventDefault();
				e.stopPropagation();
			}
		};

		el.addEventListener('pointerdown', onPointerDown);
		el.addEventListener('pointermove', onPointerMove);
		el.addEventListener('pointerup', onPointerUp);
		el.addEventListener('pointercancel', onPointerUp);
		el.addEventListener('click', onClickCapture, true);

		return () => {
			el.removeEventListener('pointerdown', onPointerDown);
			el.removeEventListener('pointermove', onPointerMove);
			el.removeEventListener('pointerup', onPointerUp);
			el.removeEventListener('pointercancel', onPointerUp);
			el.removeEventListener('click', onClickCapture, true);
		};
	}, []);

	if (!baseItems.length) return null;

	return (
		<div
			ref={scrollerRef}
			aria-label={ariaLabel}
			data-scroll="horizontal"
			className={
				'no-scrollbar overflow-x-auto overflow-y-hidden whitespace-nowrap select-none ' +
				'[-webkit-overflow-scrolling:touch] ' +
				(isDragging ? 'cursor-grabbing ' : 'cursor-grab ') +
				className
			}
		>
			<div className="flex items-stretch gap-6 py-2 pr-6">
				{loopItems.map((item, idx) => (
					<div key={idx} className={itemClassName}>
						{renderItem(item, idx % baseItems.length)}
					</div>
				))}
			</div>
		</div>
	);
}
