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

import {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
	VIEWERS_CHROME_OPEN_SPRING,
	VIEWERS_EXPAND_THUMB_RAIL_VIEWPORT_RATIO,
	type ViewersStage,
} from '../constants';

/** Реэкспорт для существующих импортов из хука. */
export {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
	type ViewersStage,
} from '../constants';

/** Вертикальное смещение при свайпе вниз для закрытия (≥ 0). */
export const DISMISS_DRAG_MAX_PX = 320;
export const DISMISS_CLOSE_DISTANCE_PX = 110;
export const DISMISS_CLOSE_VELOCITY_PX_S = 420;
export const VIEWERS_CHROME_SCALE_MIN = 0.8;
export const VIEWERS_CHROME_SCALE_MAX = 1;
export const SWIPE_UP_OPEN_DISTANCE_PX = -150;
export const SWIPE_UP_OPEN_VELOCITY_PX_S = -320;
const SWIPE_UP_REVEAL_FADE_END_RANGE_PX = 1;

/** Порог начала жеста; вертикаль вверх/вниз используют одинаковое доминирование над горизонталью. */
export const GESTURE_AXIS_LOCK_PX = 10;
const VERTICAL_DOMINANCE_OVER_HORIZONTAL = 0.92;
/** Свайп вниз с трека миниатюр даёт больше dx — не отменяем жест, если уже явно тянем вниз. */
const HORIZONTAL_CANCEL_MIN_PX = 18;
export const SHELL_MIN_SCALE = 0.92;
export const OVERLAY_BASE_OPACITY = 1;
export const OVERLAY_DIMMEST_OPACITY = 0.34;

const HOLD_SUPPRESS_CLICK_MS = 200;
const VIEWERS_INTERACTIVE_ATTR = 'data-viewers-interactive';
const STORIES_THUMB_STRIP_ATTR = 'data-stories-thumbnail-strip';

type GestureMode =
	| 'idle'
	| 'pending'
	| 'verticalDismiss'
	| 'verticalSwipeUp'
	| 'verticalSwipeUpExpand'
	| 'verticalSwipeDownCloseViewers';

/** Между story и thumbnails (середина 0 … SWIPE_UP_THUMBNAILS_PX). */
const MID_SNAP_STORY_THUMB_PX = SWIPE_UP_THUMBNAILS_PX / 2;
/** Между thumbnails и expanded. */
const MID_SNAP_THUMB_EXPAND_PX =
	(SWIPE_UP_THUMBNAILS_PX + SWIPE_UP_DRAG_MAX_PX) / 2;
/** Порог раннего автодотягивания в expanded при свайпе вверх из thumbnails. */
const EXPAND_COMMIT_SWIPE_UP_PX =
	SWIPE_UP_THUMBNAILS_PX +
	(SWIPE_UP_DRAG_MAX_PX - SWIPE_UP_THUMBNAILS_PX) * 0.1;

function expandProgressFromSwipeY(v: number): number {
	if (v > SWIPE_UP_THUMBNAILS_PX) {
		return 0;
	}
	return Math.min(
		1,
		Math.max(
			0,
			(v - SWIPE_UP_THUMBNAILS_PX) /
				(SWIPE_UP_DRAG_MAX_PX - SWIPE_UP_THUMBNAILS_PX),
		),
	);
}

const getNow = (): number =>
	typeof performance !== 'undefined' ? performance.now() : Date.now();

function isInsideViewersInteractiveTarget(target: EventTarget | null): boolean {
	return target instanceof Element
		? Boolean(target.closest(`[${VIEWERS_INTERACTIVE_ATTR}="true"]`))
		: false;
}

function isInsideStoriesThumbnailStrip(target: EventTarget | null): boolean {
	return target instanceof Element
		? Boolean(target.closest(`[${STORIES_THUMB_STRIP_ATTR}="true"]`))
		: false;
}

function runTapIfNotSuppressed(
	e: MouseEvent<HTMLButtonElement>,
	suppressRef: React.RefObject<boolean>,
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
	const [isVerticalSwipeUpActive, setIsVerticalSwipeUpActive] =
		useState(false);
	/** Свайп вниз из режима зрителей: двигаем swipeUpDragY к 0 (закрытие). */
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

	/** 0 → режим миниатюр (swipeUpDragY = SWIPE_UP_THUMBNAILS_PX). */
	const SWIPE_UP_PREVIEW_FADE_RANGE_PX = -SWIPE_UP_THUMBNAILS_PX;

	const swipeUpOpenProgress = (v: number): number =>
		Math.min(1, Math.max(0, -v / SWIPE_UP_PREVIEW_FADE_RANGE_PX));

	/**
	 * Масштаб/сдвиг кадра — тот же прогресс `swipeUpOpenProgress`, что и у `previewOpacity`,
	 * иначе кадр «уезжает» по полной длине жеста быстрее, чем проявляется слой зрителей.
	 */
	const storyScale = useTransform(swipeUpDragY, (v) => {
		const t = swipeUpOpenProgress(v);
		return 1 + (0.5 - 1) * t;
	});

	/** Смещение панели зрителей по Y (выезд снизу до миниатюр). */
	const panelY = useTransform(swipeUpDragY, (v) => {
		const t = swipeUpOpenProgress(v);
		const offPx =
			typeof window !== 'undefined' ? window.innerHeight * 0.5 : 0;
		return (1 - t) * offPx;
	});

	/** Высота панели: 50% viewport → 100% при expanded (без конфликта с translateY). */
	const panelHeightPx = useTransform(swipeUpDragY, (v) => {
		const ex = expandProgressFromSwipeY(v);
		const h = typeof window !== 'undefined' ? window.innerHeight : 800;
		return h * (0.5 + 0.5 * ex);
	});

	/** Параллельный подъём рельса миниатюр при expanded. */
	const thumbnailRailY = useTransform(swipeUpDragY, (v) => {
		const ex = expandProgressFromSwipeY(v);
		const h = typeof window !== 'undefined' ? window.innerHeight : 800;
		return -ex * h * VIEWERS_EXPAND_THUMB_RAIL_VIEWPORT_RATIO;
	});

	const previewOpacity = useTransform(swipeUpDragY, (v) =>
		Math.min(1, Math.max(0, 1 + v / SWIPE_UP_PREVIEW_FADE_RANGE_PX)),
	);

	/**
	 * Кадр остаётся видимым (1) почти до конца жеста к миниатюрам; fade только в последних
	 * `SWIPE_UP_REVEAL_FADE_END_RANGE_PX` до `SWIPE_UP_THUMBNAILS_PX`. На миниатюрах и в expanded — 0.
	 */
	const previewRevealOpacity = useTransform(swipeUpDragY, (v) => {
		const thumb = SWIPE_UP_THUMBNAILS_PX;
		const bandEnd = thumb + SWIPE_UP_REVEAL_FADE_END_RANGE_PX;
		if (v > bandEnd) {
			return 1;
		}
		if (v > thumb) {
			return (v - thumb) / SWIPE_UP_REVEAL_FADE_END_RANGE_PX;
		}
		return 0;
	});

	/**
	 * Та же кривая, что у `previewOpacity`, но из одного источника `swipeUpDragY`
	 * (не цепочка `previewOpacity` → иначе слой мог кадрироваться и «прыгать»).
	 */
	const viewersChromeOpacity = useTransform(swipeUpDragY, (v) =>
		swipeUpOpenProgress(v),
	);

	/** Тот же прогресс `t`, что у opacity: 0.5 → 1 при открытии и обратно при закрытии. */
	const viewersChromeScale = useTransform(swipeUpDragY, (v) => {
		const t = swipeUpOpenProgress(v);
		return (
			VIEWERS_CHROME_SCALE_MIN +
			(VIEWERS_CHROME_SCALE_MAX - VIEWERS_CHROME_SCALE_MIN) * t
		);
	});

	/** Явный `transform: scale()` — в связке styled-components + motion `style.scale` может не попадать в DOM. */
	const viewersChromeTransform = useTransform(
		viewersChromeScale,
		(s) => `scale(${s})`,
	);

	const prevActiveIndexRef = useRef(activeIndex);

	/** Смена сториса: сброс dismiss; swipe вверх только если не режим зрителей. */
	useEffect(() => {
		dismissDragY.set(0);
		setIsVerticalDismissActive(false);
		setIsVerticalSwipeUpActive(false);
		if (!isViewersMode) {
			swipeUpDragY.set(0);
		}
	}, [activeIndex, dismissDragY, isViewersMode, swipeUpDragY]);

	/**
	 * В режиме зрителей при смене кадра — сохраняем стадию (миниатюры / expanded).
	 */
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

	const applyResistance = useCallback((dy: number) => {
		if (dy <= DISMISS_DRAG_MAX_PX) {
			return dy;
		}
		const over = dy - DISMISS_DRAG_MAX_PX;
		return DISMISS_DRAG_MAX_PX + over * 0.22;
	}, []);

	const applyUpResistance = useCallback((dy: number) => {
		if (dy >= SWIPE_UP_DRAG_MAX_PX) {
			return dy;
		}
		const over = dy - SWIPE_UP_DRAG_MAX_PX;
		return SWIPE_UP_DRAG_MAX_PX + over * 0.22;
	}, []);

	/** Централизованная анимация для dismiss (свайп вниз). */
	const animateDismissTo = useCallback(
		(target: number, onComplete?: () => void) => {
			const config = reducedMotion
				? {
						type: 'tween' as const,
						duration: 0.18,
						ease: 'easeOut' as const,
					}
				: { type: 'spring' as const, damping: 26, stiffness: 320 };

			return animate(dismissDragY, target, { ...config, onComplete });
		},
		[dismissDragY, reducedMotion],
	);

	/** Централизованная анимация для swipe up (режим зрителей). */
	const animateSwipeTo = useCallback(
		(target: number, onComplete?: () => void) => {
			return animate(swipeUpDragY, target, {
				...VIEWERS_CHROME_OPEN_SPRING,
				onComplete,
			});
		},
		[swipeUpDragY],
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
				void animateDismissTo(exitY, onClose);
			} else {
				void animateDismissTo(0);
			}
		},
		[animateDismissTo, dismissDragY, onClose],
	);

	const finishSwipeUpOrSnap = useCallback(
		(velocityY: number) => {
			const y = swipeUpDragY.get();
			const shouldOpen =
				y <= SWIPE_UP_OPEN_DISTANCE_PX ||
				velocityY < SWIPE_UP_OPEN_VELOCITY_PX_S;

			if (shouldOpen) {
				setViewersStage('thumbnails');
				setIsVerticalSwipeUpActive(false);
				void animateSwipeTo(SWIPE_UP_THUMBNAILS_PX);
			} else {
				void animateSwipeTo(0, () => {
					setViewersStage('story');
					setIsVerticalSwipeUpActive(false);
				});
			}
		},
		[animateSwipeTo, swipeUpDragY],
	);

	const finishSwipeUpExpandOrSnap = useCallback(
		(velocityY: number) => {
			const y = swipeUpDragY.get();
			const shouldExpand =
				y <= EXPAND_COMMIT_SWIPE_UP_PX ||
				velocityY < SWIPE_UP_OPEN_VELOCITY_PX_S;

			if (shouldExpand) {
				setViewersStage('expanded');
				setIsVerticalSwipeUpActive(false);
				void animateSwipeTo(SWIPE_UP_DRAG_MAX_PX, () => {
					setIsVerticalSwipeDownCloseActive(false);
				});
			} else {
				void animateSwipeTo(SWIPE_UP_THUMBNAILS_PX, () => {
					setViewersStage('thumbnails');
					setIsVerticalSwipeUpActive(false);
				});
			}
		},
		[animateSwipeTo, swipeUpDragY],
	);

	const finishSwipeDownCloseViewersOrSnap = useCallback(
		(velocityY: number) => {
			const y = swipeUpDragY.get();
			const strongDown = velocityY > -SWIPE_UP_OPEN_VELOCITY_PX_S;

			if (
				y > MID_SNAP_STORY_THUMB_PX ||
				(strongDown && y > SWIPE_UP_THUMBNAILS_PX)
			) {
				void animateSwipeTo(0, () => {
					setViewersStage('story');
					setIsVerticalSwipeDownCloseActive(false);
				});
				return;
			}

			if (y > MID_SNAP_THUMB_EXPAND_PX || strongDown) {
				void animateSwipeTo(SWIPE_UP_THUMBNAILS_PX, () => {
					setViewersStage('thumbnails');
					setIsVerticalSwipeDownCloseActive(false);
				});
				return;
			}

			void animateSwipeTo(SWIPE_UP_DRAG_MAX_PX, () => {
				setViewersStage('expanded');
				setIsVerticalSwipeDownCloseActive(false);
			});
		},
		[animateSwipeTo, swipeUpDragY],
	);

	/** Полный выход в обычный просмотр сторис (крестик, тап по активной миниатюре и т.д.). */
	const closeViewersMode = useCallback(() => {
		void animateSwipeTo(0, () => {
			setViewersStage('story');
			setIsVerticalSwipeUpActive(false);
			setIsVerticalSwipeDownCloseActive(false);
		});
	}, [animateSwipeTo]);

	/** Открыть режим миниатюр (превью зрителей). */
	const openViewersMode = useCallback(() => {
		setViewersStage('thumbnails');
		setIsVerticalSwipeUpActive(false);
		setIsVerticalSwipeDownCloseActive(false);
		void animateSwipeTo(SWIPE_UP_THUMBNAILS_PX);
	}, [animateSwipeTo]);

	/** Из expanded → thumbnails (например свайп вниз по рельсу). */
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
			/* Рельс миниатюр: горизонтальный drag / локальный свайп вниз — не смешивать с вертикалью оболочки. */
			if (isInsideStoriesThumbnailStrip(t) && !isViewersMode) {
				return false;
			}
			/* Вне режима зрителей панель со `data-viewers-interactive` не запускает вертикаль оболочки (горизонтальный слайдер и т.д.). */
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
					/* Не сбрасываем закрытие зрителей: по рельсу часто идёт диагональ с dx от слайдера. */
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
				void animateSwipeTo(0, () => setViewersStage('story'));
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
				void animateSwipeTo(restoreY, () => {
					setIsVerticalSwipeDownCloseActive(false);
					if (restoreY === 0) {
						setViewersStage('story');
					} else if (restoreY === SWIPE_UP_THUMBNAILS_PX) {
						setViewersStage('thumbnails');
					} else {
						setViewersStage('expanded');
					}
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

		// New viewers mode
		viewersStage,
		isViewersMode,
		isVerticalSwipeUpActive,
		isVerticalSwipeDownCloseActive,
		swipeUpDragY,
		storyScale,
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

		/**
		 * Единый объект pointer events.
		 * Capture-обработчики имеют приоритет и используются для gesture tracking.
		 * Обычные onPointer* используются для hold-логики на shell.
		 */
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

		// Экспонируем анимационные функции для возможного использования в компонентах
		animateDismissTo,
		animateSwipeTo,
	};
}
