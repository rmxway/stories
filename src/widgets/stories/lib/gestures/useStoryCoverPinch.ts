'use client';

import { useReducedMotion } from 'framer-motion';
import { type RefObject, useEffect, useRef } from 'react';

function touchDistance(a: Touch, b: Touch): number {
	const dx = a.clientX - b.clientX;
	const dy = a.clientY - b.clientY;
	return Math.hypot(dx, dy);
}

function touchMid(a: Touch, b: Touch): { x: number; y: number } {
	return {
		x: (a.clientX + b.clientX) / 2,
		y: (a.clientY + b.clientY) / 2,
	};
}

function clamp(n: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, n));
}

type PinchGesture = {
	d0: number;
	s0: number;
	mid0: { x: number; y: number };
	t0x: number;
	t0y: number;
};

export type UseStoryCoverPinchArgs = {
	shellRef: RefObject<HTMLDivElement | null>;
	storyId: string;
	enabled: boolean;
	maxScale?: number;
	onExpandedChange: (expanded: boolean) => void;
	/**
	 * Синтетический click после multi-touch — иначе сработает смена слайда.
	 * Порог (timestamp): при `Date.now() < ref` тап с оболочки игнорировать.
	 */
	shellNavBlockUntilRef?: RefObject<number>;
};

/**
 * Двухпальцевый pinch поверх уже заполненного кадра (object-fit: cover): масштаб от 1,
 * без логики «вписать картинку» как у react-quick-pinch-zoom.
 */
export function useStoryCoverPinch({
	shellRef,
	storyId,
	enabled,
	maxScale = 3,
	onExpandedChange,
	shellNavBlockUntilRef,
}: UseStoryCoverPinchArgs): void {
	const reducedMotion = useReducedMotion() ?? false;
	const scaleRef = useRef(1);
	const txRef = useRef(0);
	const tyRef = useRef(0);
	const gestureRef = useRef<PinchGesture | null>(null);
	const rafResetRef = useRef<number | null>(null);
	const hadMultiTouchRef = useRef(false);

	useEffect(() => {
		const el = shellRef.current;

		const clearTransformOrigin = (): void => {
			if (el) {
				el.style.removeProperty('transform-origin');
			}
		};

		const apply = (): void => {
			if (!el) {
				return;
			}
			const s = scaleRef.current;
			const tx = txRef.current;
			const ty = tyRef.current;
			if (s === 1 && tx === 0 && ty === 0) {
				el.style.transform = '';
				clearTransformOrigin();
			} else {
				el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
			}
		};

		const setExpanded = (expanded: boolean): void => {
			onExpandedChange(expanded);
		};

		const stopAnim = (): void => {
			if (rafResetRef.current != null) {
				cancelAnimationFrame(rafResetRef.current);
				rafResetRef.current = null;
			}
		};

		const blockShellClickIfRef = (): void => {
			if (shellNavBlockUntilRef) {
				shellNavBlockUntilRef.current = Date.now() + 500;
			}
		};

		const resetAll = (): void => {
			stopAnim();
			scaleRef.current = 1;
			txRef.current = 0;
			tyRef.current = 0;
			gestureRef.current = null;
			if (el) {
				el.style.transition = '';
				el.style.transform = '';
				clearTransformOrigin();
			}
			setExpanded(false);
		};

		const animateToRest = (): void => {
			stopAnim();
			if (!el) {
				return;
			}
			const fromS = scaleRef.current;
			const fromTx = txRef.current;
			const fromTy = tyRef.current;
			if (
				fromS <= 1.001 &&
				Math.abs(fromTx) < 0.5 &&
				Math.abs(fromTy) < 0.5
			) {
				resetAll();
				return;
			}
			if (reducedMotion) {
				resetAll();
				return;
			}
			const durationMs = 220;
			const t0 = performance.now();
			el.style.transition = '';
			const tick = (now: number): void => {
				const t = Math.min(1, (now - t0) / durationMs);
				const ease = 1 - (1 - t) ** 3;
				scaleRef.current = fromS + (1 - fromS) * ease;
				txRef.current = fromTx * (1 - ease);
				tyRef.current = fromTy * (1 - ease);
				apply();
				setExpanded(scaleRef.current > 1.02);
				if (t < 1) {
					rafResetRef.current = requestAnimationFrame(tick);
				} else {
					rafResetRef.current = null;
					scaleRef.current = 1;
					txRef.current = 0;
					tyRef.current = 0;
					el.style.transform = '';
					clearTransformOrigin();
					setExpanded(false);
				}
			};
			rafResetRef.current = requestAnimationFrame(tick);
		};

		const onTouchStart = (e: TouchEvent): void => {
			if (!enabled) {
				return;
			}
			if (e.touches.length >= 2) {
				hadMultiTouchRef.current = true;
			}
			if (e.touches.length !== 2) {
				return;
			}
			const a = e.touches[0];
			const b = e.touches[1];
			const d0 = touchDistance(a, b);
			if (d0 < 8) {
				return;
			}
			stopAnim();
			const mid0 = touchMid(a, b);
			gestureRef.current = {
				d0,
				s0: scaleRef.current,
				mid0,
				t0x: txRef.current,
				t0y: tyRef.current,
			};

			if (el) {
				const rect = el.getBoundingClientRect();
				const w = el.offsetWidth;
				const h = el.offsetHeight;
				if (w > 0 && h > 0 && rect.width > 0) {
					const ox = ((mid0.x - rect.left) * w) / rect.width;
					const oy = ((mid0.y - rect.top) * h) / rect.height;
					el.style.transformOrigin = `${ox}px ${oy}px`;
				}
			}
		};

		const onTouchMove = (e: TouchEvent): void => {
			const g = gestureRef.current;
			if (!g || e.touches.length < 2) {
				return;
			}
			e.preventDefault();
			const a = e.touches[0];
			const b = e.touches[1];
			const d = touchDistance(a, b);
			if (d < 1) {
				return;
			}
			const nextScale = clamp(g.s0 * (d / g.d0), 1, maxScale);
			const mid = touchMid(a, b);
			scaleRef.current = nextScale;
			txRef.current = g.t0x + (mid.x - g.mid0.x);
			tyRef.current = g.t0y + (mid.y - g.mid0.y);
			apply();
			setExpanded(nextScale > 1.02);
		};

		const onTouchEnd = (e: TouchEvent): void => {
			if (
				hadMultiTouchRef.current &&
				e.touches.length < 2
			) {
				hadMultiTouchRef.current = false;
				blockShellClickIfRef();
			}
			if (!gestureRef.current) {
				return;
			}
			if (e.touches.length < 2) {
				gestureRef.current = null;
				animateToRest();
			}
		};

		const onTouchCancel = (): void => {
			if (hadMultiTouchRef.current) {
				hadMultiTouchRef.current = false;
				blockShellClickIfRef();
			}
			if (gestureRef.current) {
				gestureRef.current = null;
				animateToRest();
			}
		};

		resetAll();

		if (!enabled || !el) {
			return () => {
				resetAll();
			};
		}

		el.addEventListener('touchstart', onTouchStart, { passive: true });
		el.addEventListener('touchmove', onTouchMove, { passive: false });
		el.addEventListener('touchend', onTouchEnd, { passive: true });
		el.addEventListener('touchcancel', onTouchCancel, { passive: true });

		return () => {
			el.removeEventListener('touchstart', onTouchStart);
			el.removeEventListener('touchmove', onTouchMove);
			el.removeEventListener('touchend', onTouchEnd);
			el.removeEventListener('touchcancel', onTouchCancel);
			resetAll();
		};
	}, [
		enabled,
		storyId,
		maxScale,
		onExpandedChange,
		reducedMotion,
		shellRef,
		shellNavBlockUntilRef,
	]);
}
