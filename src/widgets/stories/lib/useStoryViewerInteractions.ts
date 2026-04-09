'use client';

import {
	animate,
	useMotionValue,
	useReducedMotion,
	useTransform,
} from 'framer-motion';
import {
	type MouseEvent,
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

/** Вертикальное смещение при свайпе вниз для закрытия (≥ 0). */
export const DISMISS_DRAG_MAX_PX = 420;
export const DISMISS_CLOSE_DISTANCE_PX = 110;
export const DISMISS_CLOSE_VELOCITY_PX_S = 520;
export const GESTURE_AXIS_LOCK_PX = 10;
export const SHELL_MIN_SCALE = 0.92;
export const OVERLAY_BASE_OPACITY = 0.92;
export const OVERLAY_DIMMEST_OPACITY = 0.34;

const HOLD_SUPPRESS_CLICK_MS = 200;

type GestureMode = 'idle' | 'pending' | 'verticalDismiss';

const getNow = (): number =>
	typeof performance !== 'undefined' ? performance.now() : Date.now();

function runTapIfNotSuppressed(
	e: MouseEvent<HTMLButtonElement>,
	suppressRef: React.RefObject<boolean | null>,
	action: () => void,
): void {
	if (suppressRef.current) {
		suppressRef.current = false;
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	action();
}

type UseStoryViewerInteractionsArgs = {
	activeIndex: number;
	onClose: () => void;
	onTapPrevious: () => void;
	onTapNext: () => void;
};

export function useStoryViewerInteractions({
	activeIndex,
	onClose,
	onTapPrevious,
	onTapNext,
}: UseStoryViewerInteractionsArgs) {
	const [holdPaused, setHoldPaused] = useState(false);
	const [isVerticalDismissActive, setIsVerticalDismissActive] =
		useState(false);
	const suppressTapClickRef = useRef<boolean>(false);
	const holdStartedAtRef = useRef(0);

	const dismissDragY = useMotionValue(0);
	const reducedMotion = useReducedMotion() ?? false;

	const shellScale = useTransform(
		dismissDragY,
		[0, DISMISS_DRAG_MAX_PX],
		[1, SHELL_MIN_SCALE],
	);
	const dimmerOpacity = useTransform(
		dismissDragY,
		[0, DISMISS_DRAG_MAX_PX],
		[OVERLAY_BASE_OPACITY, OVERLAY_DIMMEST_OPACITY],
	);

	useEffect(() => {
		dismissDragY.set(0);
		setIsVerticalDismissActive(false);
	}, [activeIndex, dismissDragY]);

	const modeRef = useRef<GestureMode>('idle');
	const startYRef = useRef(0);
	const startXRef = useRef(0);
	const activePointerIdRef = useRef<number | null>(null);
	const lastMoveYRef = useRef(0);
	const lastMoveTRef = useRef(0);
	const velocityYRef = useRef(0);

	const applyResistance = useCallback((dy: number) => {
		if (dy <= DISMISS_DRAG_MAX_PX) {
			return dy;
		}
		const over = dy - DISMISS_DRAG_MAX_PX;
		return DISMISS_DRAG_MAX_PX + over * 0.22;
	}, []);

	const animateYTo = useCallback(
		(target: number, onComplete?: () => void) => {
			const spring = reducedMotion
				? {
						type: 'tween' as const,
						duration: 0.15,
					}
				: {
						type: 'tween' as const,
						duration: 0.2,
					};
			return animate(dismissDragY, target, {
				...spring,
				onComplete,
			});
		},
		[dismissDragY, reducedMotion],
	);

	const finishDismissOrSnap = useCallback(
		(velocityY: number) => {
			const y = dismissDragY.get();
			const shouldClose =
				y >= DISMISS_CLOSE_DISTANCE_PX ||
				velocityY > DISMISS_CLOSE_VELOCITY_PX_S;
			if (shouldClose) {
				const exitY =
					typeof window !== 'undefined'
						? window.innerHeight + 80
						: y + 400;
				suppressTapClickRef.current = true;
				void animateYTo(exitY, onClose);
			} else {
				void animateYTo(0);
			}
		},
		[animateYTo, dismissDragY, onClose],
	);

	const beginHold = useCallback(() => {
		suppressTapClickRef.current = false;
		holdStartedAtRef.current = getNow();
		setHoldPaused(true);
	}, []);

	const endHoldAfterRelease = useCallback(() => {
		const elapsed = getNow() - holdStartedAtRef.current;
		if (elapsed >= HOLD_SUPPRESS_CLICK_MS) {
			suppressTapClickRef.current = true;
		}
		setHoldPaused(false);
	}, []);

	const endHoldCancel = useCallback(() => {
		setHoldPaused(false);
	}, []);

	const onShellPointerDown = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			beginHold();
			const t = e.target;
			if (t instanceof Element && t.closest('button')) {
				return;
			}
			e.currentTarget.setPointerCapture(e.pointerId);
		},
		[beginHold],
	);

	const onShellPointerEnd = useCallback(() => {
		endHoldAfterRelease();
	}, [endHoldAfterRelease]);

	const initStoryPointerTracking = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			if (e.button !== 0 && e.pointerType === 'mouse') {
				return;
			}
			modeRef.current = 'pending';
			startYRef.current = e.clientY;
			startXRef.current = e.clientX;
			activePointerIdRef.current = e.pointerId;
			lastMoveYRef.current = e.clientY;
			lastMoveTRef.current =
				typeof performance !== 'undefined'
					? performance.now()
					: Date.now();
			velocityYRef.current = 0;
		},
		[],
	);

	const onStoryMove = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			if (
				activePointerIdRef.current !== null &&
				e.pointerId !== activePointerIdRef.current
			) {
				return;
			}
			const m = modeRef.current;
			if (m === 'idle') {
				return;
			}
			const dx = e.clientX - startXRef.current;
			const dy = e.clientY - startYRef.current;

			if (m === 'pending') {
				if (
					dy > GESTURE_AXIS_LOCK_PX &&
					Math.abs(dy) > Math.abs(dx) * 1.05
				) {
					modeRef.current = 'verticalDismiss';
					setIsVerticalDismissActive(true);
					e.currentTarget.setPointerCapture(e.pointerId);
					suppressTapClickRef.current = true;
				} else if (
					Math.abs(dx) > GESTURE_AXIS_LOCK_PX ||
					Math.abs(dy) > GESTURE_AXIS_LOCK_PX
				) {
					if (Math.abs(dx) >= Math.abs(dy)) {
						modeRef.current = 'idle';
					}
				}
			}

			if (modeRef.current !== 'verticalDismiss') {
				return;
			}

			const pullDown = Math.max(0, dy);
			dismissDragY.set(applyResistance(pullDown));

			const now =
				typeof performance !== 'undefined'
					? performance.now()
					: Date.now();
			const dt = Math.max(1, now - lastMoveTRef.current);
			velocityYRef.current =
				((e.clientY - lastMoveYRef.current) / dt) * 1000;
			lastMoveYRef.current = e.clientY;
			lastMoveTRef.current = now;
		},
		[applyResistance, dismissDragY],
	);

	const onStoryUpCapture = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			if (
				activePointerIdRef.current !== null &&
				e.pointerId !== activePointerIdRef.current
			) {
				return;
			}
			const m = modeRef.current;
			activePointerIdRef.current = null;

			if (m === 'verticalDismiss') {
				try {
					e.currentTarget.releasePointerCapture(e.pointerId);
				} catch {
					/* ignore */
				}
				finishDismissOrSnap(velocityYRef.current);
			}

			modeRef.current = 'idle';
			setIsVerticalDismissActive(false);
			endHoldAfterRelease();
		},
		[endHoldAfterRelease, finishDismissOrSnap],
	);

	const onStoryCancelCapture = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			if (
				activePointerIdRef.current !== null &&
				e.pointerId !== activePointerIdRef.current
			) {
				return;
			}
			activePointerIdRef.current = null;
			if (modeRef.current === 'verticalDismiss') {
				try {
					e.currentTarget.releasePointerCapture(e.pointerId);
				} catch {
					/* ignore */
				}
				void animateYTo(0);
			}
			modeRef.current = 'idle';
			setIsVerticalDismissActive(false);
			endHoldCancel();
		},
		[animateYTo, endHoldCancel],
	);

	const onStoryDownCapture = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			initStoryPointerTracking(e);
			beginHold();
		},
		[beginHold, initStoryPointerTracking],
	);

	const onTapPreviousGuarded = useCallback(
		(e: MouseEvent<HTMLButtonElement>) =>
			runTapIfNotSuppressed(e, suppressTapClickRef, onTapPrevious),
		[onTapPrevious],
	);

	const onTapNextGuarded = useCallback(
		(e: MouseEvent<HTMLButtonElement>) =>
			runTapIfNotSuppressed(e, suppressTapClickRef, onTapNext),
		[onTapNext],
	);

	return {
		dismissDragY,
		shellScale,
		dimmerOpacity,
		holdPaused,
		isVerticalDismissActive,
		shellPointerProps: {
			onPointerDown: onShellPointerDown,
			onPointerUp: onShellPointerEnd,
			onPointerCancel: onShellPointerEnd,
		},
		storyWrapPointerProps: {
			onPointerDownCapture: onStoryDownCapture,
			onPointerMove: onStoryMove,
			onPointerUpCapture: onStoryUpCapture,
			onPointerCancelCapture: onStoryCancelCapture,
		},
		onTapPreviousGuarded,
		onTapNextGuarded,
	};
}
