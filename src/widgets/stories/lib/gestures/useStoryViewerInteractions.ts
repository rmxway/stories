'use client';

import { useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import {
	type MouseEvent,
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

import {
	STORY_SHELL_HEIGHT_OVER_WIDTH,
	type ViewersStage,
} from '../../constants';
import {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
	VIEWERS_EXPAND_THUMB_RAIL_VIEWPORT_RATIO,
} from '../motion/storyViewerMotionConstants';
import { useStoryViewerSnapMotion } from '../motion/useStoryViewerSnapMotion';
import {
	DISMISS_DRAG_MAX_PX,
	GESTURE_AXIS_LOCK_PX,
	HOLD_SUPPRESS_CLICK_MS,
	HORIZONTAL_CANCEL_MIN_PX,
	OVERLAY_BASE_OPACITY,
	OVERLAY_DIMMEST_OPACITY,
	SHELL_MIN_SCALE,
	VERTICAL_DOMINANCE_OVER_HORIZONTAL,
	VIEWERS_CHROME_SCALE_MAX,
	VIEWERS_CHROME_SCALE_MIN,
} from './storyViewerGestureConstants';
import { isInsideViewersInteractiveTarget } from './storyViewerGestureDom';
import { runTapIfNotSuppressed } from './storyViewerTapGesture';

/** Реэкспорт для существующих импортов из хука. */
export type { ViewersStage };
export {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
} from '../motion/storyViewerMotionConstants';
export {
	DISMISS_CLOSE_DISTANCE_PX,
	DISMISS_CLOSE_VELOCITY_PX_S,
	DISMISS_DRAG_MAX_PX,
	GESTURE_AXIS_LOCK_PX,
	OVERLAY_BASE_OPACITY,
	OVERLAY_DIMMEST_OPACITY,
	SHELL_MIN_SCALE,
	SWIPE_UP_OPEN_DISTANCE_PX,
	SWIPE_UP_OPEN_VELOCITY_PX_S,
	VIEWERS_CHROME_SCALE_MAX,
	VIEWERS_CHROME_SCALE_MIN,
} from './storyViewerGestureConstants';

type GestureMode =
	| 'idle'
	| 'pending'
	| 'verticalDismiss'
	| 'verticalSwipeUp'
	| 'verticalSwipeUpExpand'
	| 'verticalSwipeDownCloseViewers';

const getNow = (): number =>
	typeof performance !== 'undefined' ? performance.now() : Date.now();

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
	const isWindowDefined = typeof window !== 'undefined';
	const [viewportHeight, setViewportHeight] = useState<number>(() =>
		isWindowDefined ? window.innerHeight : 800,
	);
	const [viewportWidth, setViewportWidth] = useState<number>(() =>
		isWindowDefined ? window.innerWidth : 400,
	);

	const [holdPaused, setHoldPaused] = useState(false);
	const [isVerticalDismissActive, setIsVerticalDismissActive] =
		useState(false);
	const [isVerticalSwipeUpActive, setIsVerticalSwipeUpActive] =
		useState(false);
	const [isVerticalSwipeDownCloseActive, setIsVerticalSwipeDownCloseActive] =
		useState(false);
	const [viewersStage, setViewersStage] = useState<ViewersStage>('story');
	const viewersStageRef = useRef<ViewersStage>('story');
	viewersStageRef.current = viewersStage;
	const isViewersMode = viewersStage !== 'story';

	const suppressTapClickRef = useRef<boolean>(false);
	const holdStartedAtRef = useRef(0);

	const dismissDragY = useMotionValue(0);
	const swipeUpDragY = useMotionValue(0);
	const reducedMotion = useReducedMotion() ?? false;

	useEffect(() => {
		if (!isWindowDefined) {
			return;
		}

		const onResize = () => {
			setViewportHeight(window.innerHeight);
			setViewportWidth(window.innerWidth);
		};

		onResize();
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, [isWindowDefined]);

	const {
		applyResistance,
		applyUpResistance,
		animateDismissTo,
		animateSwipeTo,
		finishDismissOrSnap,
		finishSwipeDownCloseViewersOrSnap,
		finishSwipeUpExpandOrSnap,
		finishSwipeUpOrSnap,
	} = useStoryViewerSnapMotion({
		dismissDragY,
		swipeUpDragY,
		reducedMotion,
		onClose,
		suppressTapClickRef,
		setViewersStage,
		setIsVerticalSwipeUpActive,
		setIsVerticalSwipeDownCloseActive,
	});

	const { shellScale, dimmerOpacity } = useTransform(
		dismissDragY,
		[0, DISMISS_DRAG_MAX_PX],
		{
			shellScale: [1, SHELL_MIN_SCALE],
			dimmerOpacity: [OVERLAY_BASE_OPACITY, OVERLAY_DIMMEST_OPACITY],
		},
	);
	const storyHeightPx = isWindowDefined
		? Math.min(
				viewportHeight,
				viewportWidth * STORY_SHELL_HEIGHT_OVER_WIDTH,
			)
		: 800;
	const thumbnailsHeightPx = storyHeightPx * 0.5;
	const panelCollapsedHeightPx = storyHeightPx * 0.5;

	const {
		storyScale,
		storyHeight,
		panelY,
		panelHeightPx,
		thumbnailRailY,
		viewersChromeOpacity,
		viewersChromeScale,
		viewersChromeTransform,
	} = useTransform(
		swipeUpDragY,
		[0, SWIPE_UP_THUMBNAILS_PX, SWIPE_UP_DRAG_MAX_PX],
		{
			storyScale: [1, 0.5, 0.5],
			storyHeight: [
				storyHeightPx - 10,
				thumbnailsHeightPx - 10,
				thumbnailsHeightPx - 10,
			],
			panelY: [panelCollapsedHeightPx, 0, 0],
			panelHeightPx: [
				panelCollapsedHeightPx,
				panelCollapsedHeightPx,
				storyHeightPx,
			],
			thumbnailRailY: [
				0,
				VIEWERS_EXPAND_THUMB_RAIL_VIEWPORT_RATIO,
				-storyHeightPx * VIEWERS_EXPAND_THUMB_RAIL_VIEWPORT_RATIO,
			],
			viewersChromeOpacity: [0, 1, 1],
			viewersChromeScale: [
				VIEWERS_CHROME_SCALE_MIN,
				VIEWERS_CHROME_SCALE_MAX,
				VIEWERS_CHROME_SCALE_MAX,
			],
			viewersChromeTransform: [
				`scale(${VIEWERS_CHROME_SCALE_MIN})`,
				`scale(${VIEWERS_CHROME_SCALE_MAX})`,
				`scale(${VIEWERS_CHROME_SCALE_MAX})`,
			],
		},
	);

	const { previewRevealOpacity } = useTransform(
		swipeUpDragY,
		[0, SWIPE_UP_THUMBNAILS_PX + 2, SWIPE_UP_THUMBNAILS_PX],
		{
			previewRevealOpacity: [1, 1, 0],
		},
	);

	const { previewOpacity } = useTransform(
		swipeUpDragY,
		[0, SWIPE_UP_THUMBNAILS_PX / 2, SWIPE_UP_THUMBNAILS_PX],
		{
			previewOpacity: [1, 0, 0],
		},
	);

	const prevActiveIndexRef = useRef(activeIndex);

	useEffect(() => {
		dismissDragY.set(0);
		setIsVerticalDismissActive(false);
		setIsVerticalSwipeUpActive(false);
		if (!isViewersMode) {
			swipeUpDragY.set(0);
		}
	}, [activeIndex, dismissDragY, isViewersMode, swipeUpDragY]);

	useEffect(() => {
		if (isViewersMode && prevActiveIndexRef.current !== activeIndex) {
			if (viewersStage === 'expanded') {
				swipeUpDragY.set(SWIPE_UP_DRAG_MAX_PX);
			} else {
				swipeUpDragY.set(SWIPE_UP_THUMBNAILS_PX);
			}
		}
		prevActiveIndexRef.current = activeIndex;
	}, [activeIndex, isViewersMode, swipeUpDragY, viewersStage]);

	const modeRef = useRef<GestureMode>('idle');
	const startYRef = useRef(0);
	const startXRef = useRef(0);
	const activePointerIdRef = useRef<number | null>(null);
	const lastMoveYRef = useRef(0);
	const lastMoveTRef = useRef(0);
	const velocityYRef = useRef(0);
	const swipeUpStartValRef = useRef(0);

	const closeViewersMode = useCallback(() => {
		/* Как при жесте swipe-down-close: держим chromeInteractive, иначе панель/лента
		 * получают opacity:0 сразу и анимация panelY не видна. */
		setIsVerticalSwipeDownCloseActive(true);
		/* Stage «story» до анимации: иначе до onComplete действует classic opacity и соседи
		 * резко пропадают в последний кадр. */
		setViewersStage('story');
		void animateSwipeTo(0, () => {
			setIsVerticalSwipeUpActive(false);
			setIsVerticalSwipeDownCloseActive(false);
		});
	}, [animateSwipeTo]);

	const openViewersMode = useCallback(() => {
		setViewersStage('thumbnails');
		setIsVerticalSwipeUpActive(false);
		setIsVerticalSwipeDownCloseActive(false);
		void animateSwipeTo(SWIPE_UP_THUMBNAILS_PX);
	}, [animateSwipeTo]);

	const collapseViewersToThumbnails = useCallback(() => {
		setViewersStage('thumbnails');
		void animateSwipeTo(SWIPE_UP_THUMBNAILS_PX);
	}, [animateSwipeTo]);

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
			const t = e.target;
			if (
				isInsideViewersInteractiveTarget(t) ||
				(t instanceof Element && t.closest('button'))
			) {
				return;
			}
			beginHold();
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
				return false;
			}
			const t = e.target;
			if (isInsideViewersInteractiveTarget(t) && !isViewersMode) {
				return false;
			}
			if (
				t instanceof Element &&
				t.closest('button[aria-label="Закрыть"]')
			) {
				return false;
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
			swipeUpStartValRef.current = swipeUpDragY.get();
			return true;
		},
		[isViewersMode, swipeUpDragY],
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
					Math.abs(dy) >
						Math.abs(dx) * VERTICAL_DOMINANCE_OVER_HORIZONTAL
				) {
					if (isViewersMode) {
						modeRef.current = 'verticalSwipeDownCloseViewers';
						setIsVerticalSwipeDownCloseActive(true);
						e.currentTarget.setPointerCapture(e.pointerId);
						suppressTapClickRef.current = true;
					} else {
						modeRef.current = 'verticalDismiss';
						setIsVerticalDismissActive(true);
						e.currentTarget.setPointerCapture(e.pointerId);
						suppressTapClickRef.current = true;
					}
				} else if (
					dy < -GESTURE_AXIS_LOCK_PX &&
					Math.abs(dy) >
						Math.abs(dx) * VERTICAL_DOMINANCE_OVER_HORIZONTAL
				) {
					if (!isViewersMode) {
						modeRef.current = 'verticalSwipeUp';
						setIsVerticalSwipeUpActive(true);
						e.currentTarget.setPointerCapture(e.pointerId);
						suppressTapClickRef.current = true;
					} else if (viewersStageRef.current === 'thumbnails') {
						modeRef.current = 'verticalSwipeUpExpand';
						setIsVerticalSwipeUpActive(true);
						e.currentTarget.setPointerCapture(e.pointerId);
						suppressTapClickRef.current = true;
					}
				} else if (
					Math.abs(dx) >= HORIZONTAL_CANCEL_MIN_PX &&
					Math.abs(dx) > Math.abs(dy) * 1.35 &&
					dy >= -GESTURE_AXIS_LOCK_PX &&
					!(isViewersMode && dy > GESTURE_AXIS_LOCK_PX)
				) {
					modeRef.current = 'idle';
				}
			}

			const now =
				typeof performance !== 'undefined'
					? performance.now()
					: Date.now();
			const dt = Math.max(1, now - lastMoveTRef.current);
			velocityYRef.current =
				((e.clientY - lastMoveYRef.current) / dt) * 1000;
			lastMoveYRef.current = e.clientY;
			lastMoveTRef.current = now;

			if (modeRef.current === 'verticalDismiss') {
				const pullDown = Math.max(0, dy);
				dismissDragY.set(applyResistance(pullDown));
			} else if (
				modeRef.current === 'verticalSwipeUp' ||
				modeRef.current === 'verticalSwipeUpExpand'
			) {
				const pullUp = Math.min(0, dy);
				swipeUpDragY.set(
					applyUpResistance(swipeUpStartValRef.current + pullUp),
				);
			} else if (modeRef.current === 'verticalSwipeDownCloseViewers') {
				const pullDown = Math.max(0, dy);
				swipeUpDragY.set(
					Math.min(0, swipeUpStartValRef.current + pullDown),
				);
			}

			const committedVertical =
				modeRef.current === 'verticalDismiss' ||
				modeRef.current === 'verticalSwipeUp' ||
				modeRef.current === 'verticalSwipeUpExpand' ||
				modeRef.current === 'verticalSwipeDownCloseViewers';
			if (committedVertical) {
				e.stopPropagation();
			}
		},
		[
			applyResistance,
			applyUpResistance,
			dismissDragY,
			isViewersMode,
			swipeUpDragY,
		],
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

			if (
				m === 'verticalDismiss' ||
				m === 'verticalSwipeUp' ||
				m === 'verticalSwipeUpExpand' ||
				m === 'verticalSwipeDownCloseViewers'
			) {
				try {
					e.currentTarget.releasePointerCapture(e.pointerId);
				} catch {
					/* ignore */
				}
				if (m === 'verticalDismiss') {
					finishDismissOrSnap(velocityYRef.current);
				} else if (m === 'verticalSwipeUp') {
					finishSwipeUpOrSnap(velocityYRef.current);
				} else if (m === 'verticalSwipeUpExpand') {
					finishSwipeUpExpandOrSnap(velocityYRef.current);
				} else if (m === 'verticalSwipeDownCloseViewers') {
					finishSwipeDownCloseViewersOrSnap(velocityYRef.current);
				}
			}

			modeRef.current = 'idle';
			setIsVerticalDismissActive(false);
			if (m !== 'verticalSwipeUp' && m !== 'verticalSwipeUpExpand') {
				setIsVerticalSwipeUpActive(false);
			}
			if (m !== 'verticalSwipeDownCloseViewers') {
				setIsVerticalSwipeDownCloseActive(false);
			}
			endHoldAfterRelease();
		},
		[
			endHoldAfterRelease,
			finishDismissOrSnap,
			finishSwipeDownCloseViewersOrSnap,
			finishSwipeUpExpandOrSnap,
			finishSwipeUpOrSnap,
		],
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

			const cancelMode = modeRef.current;

			if (cancelMode === 'verticalDismiss') {
				try {
					e.currentTarget.releasePointerCapture(e.pointerId);
				} catch {
					/* ignore */
				}
				void animateDismissTo(0);
			} else if (cancelMode === 'verticalSwipeUp') {
				try {
					e.currentTarget.releasePointerCapture(e.pointerId);
				} catch {
					/* ignore */
				}
				setViewersStage('story');
				void animateSwipeTo(0);
			} else if (cancelMode === 'verticalSwipeUpExpand') {
				try {
					e.currentTarget.releasePointerCapture(e.pointerId);
				} catch {
					/* ignore */
				}
				void animateSwipeTo(SWIPE_UP_THUMBNAILS_PX, () => {
					setViewersStage('thumbnails');
					setIsVerticalSwipeUpActive(false);
				});
			} else if (cancelMode === 'verticalSwipeDownCloseViewers') {
				try {
					e.currentTarget.releasePointerCapture(e.pointerId);
				} catch {
					/* ignore */
				}
				const restoreY = swipeUpStartValRef.current;
				if (restoreY === 0) {
					setViewersStage('story');
				} else if (restoreY === SWIPE_UP_THUMBNAILS_PX) {
					setViewersStage('thumbnails');
				} else {
					setViewersStage('expanded');
				}
				void animateSwipeTo(restoreY, () => {
					setIsVerticalSwipeDownCloseActive(false);
				});
			}

			modeRef.current = 'idle';
			setIsVerticalDismissActive(false);
			setIsVerticalSwipeUpActive(false);
			if (cancelMode !== 'verticalSwipeDownCloseViewers') {
				setIsVerticalSwipeDownCloseActive(false);
			}
			endHoldCancel();
		},
		[animateDismissTo, animateSwipeTo, endHoldCancel],
	);

	const onStoryDownCapture = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			if (!initStoryPointerTracking(e)) {
				return;
			}
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

		viewersStage,
		isViewersMode,
		isVerticalSwipeUpActive,
		isVerticalSwipeDownCloseActive,
		swipeUpDragY,
		storyScale,
		storyHeight,
		panelY,
		panelHeightPx,
		thumbnailRailY,
		previewOpacity,
		previewRevealOpacity,
		viewersChromeOpacity,
		viewersChromeScale,
		viewersChromeTransform,
		closeViewersMode,
		openViewersMode,
		collapseViewersToThumbnails,

		pointerProps: {
			onPointerDownCapture: onStoryDownCapture,
			onPointerMoveCapture: onStoryMove,
			onPointerUpCapture: onStoryUpCapture,
			onPointerCancelCapture: onStoryCancelCapture,
			onPointerDown: onShellPointerDown,
			onPointerUp: onShellPointerEnd,
			onPointerCancel: onShellPointerEnd,
		},
		onTapPreviousGuarded,
		onTapNextGuarded,

		animateDismissTo,
		animateSwipeTo,
	};
}
