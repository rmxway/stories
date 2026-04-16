'use client';

import type { PanInfo } from 'framer-motion';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { GESTURE_AXIS_LOCK_PX } from './useStoryViewerInteractions';

type DragGestureHandler = (
	event: MouseEvent | TouchEvent | PointerEvent,
	info: PanInfo,
) => void;

/** Как в useStoryViewerInteractions при фиксации вертикали. */
const VERTICAL_OVER_HORIZONTAL = 0.92;
const HORIZONTAL_DOMINANCE = 1.08;
const AXIS_LOCK_MIN_PX = 12;
/** Свайп вниз по полосе миниатюр для выхода из режима зрителей (px). */
const STRIP_SWIPE_DOWN_CLOSE_MIN_PX = 48;

type UseViewersThumbnailStripInteractionArgs = {
	isViewersMode: boolean;
	onCloseViewersMode: () => void;
};

type StripPointerState = {
	pointerId: number;
	x0: number;
	y0: number;
	decided: 'pending' | 'horizontal' | 'vertical';
};

/**
 * Жесты по рельсу миниатюр в режиме зрителей:
 * — горизонтальный drag Framer не считается закрытием;
 * — явный свайп вниз вызывает onCloseViewersMode;
 * — allowThumbClickRef блокирует «клик» после горизонтального drag.
 */
export function useViewersThumbnailStripInteraction({
	isViewersMode,
	onCloseViewersMode,
}: UseViewersThumbnailStripInteractionArgs) {
	const stripPtrRef = useRef<StripPointerState | null>(null);
	const allowThumbClickRef = useRef(true);
	const allowThumbClickTimeoutRef = useRef<number | null>(null);

	const clearAllowThumbClickTimeout = useCallback(() => {
		if (allowThumbClickTimeoutRef.current !== null) {
			window.clearTimeout(allowThumbClickTimeoutRef.current);
			allowThumbClickTimeoutRef.current = null;
		}
	}, []);

	const scheduleAllowThumbClick = useCallback(
		(ms: number) => {
			clearAllowThumbClickTimeout();
			allowThumbClickTimeoutRef.current = window.setTimeout(() => {
				allowThumbClickRef.current = true;
				allowThumbClickTimeoutRef.current = null;
			}, ms);
		},
		[clearAllowThumbClickTimeout],
	);

	useEffect(() => {
		return () => {
			clearAllowThumbClickTimeout();
		};
	}, [clearAllowThumbClickTimeout]);

	const markHorizontalFromFramerDrag = useCallback(() => {
		const s = stripPtrRef.current;
		if (s?.decided === 'pending') {
			s.decided = 'horizontal';
		}
	}, []);

	const onPointerDownCapture = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			if (!isViewersMode || e.button !== 0) {
				stripPtrRef.current = null;
				return;
			}
			stripPtrRef.current = {
				pointerId: e.pointerId,
				x0: e.clientX,
				y0: e.clientY,
				decided: 'pending',
			};
		},
		[isViewersMode],
	);

	const onPointerMove = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			const s = stripPtrRef.current;
			if (
				!isViewersMode ||
				!s ||
				s.pointerId !== e.pointerId ||
				s.decided !== 'pending'
			) {
				return;
			}
			const dx = e.clientX - s.x0;
			const dy = e.clientY - s.y0;
			if (
				Math.abs(dx) < AXIS_LOCK_MIN_PX &&
				Math.abs(dy) < AXIS_LOCK_MIN_PX
			) {
				return;
			}
			if (Math.abs(dx) >= Math.abs(dy) * HORIZONTAL_DOMINANCE) {
				s.decided = 'horizontal';
				return;
			}
			if (
				dy > GESTURE_AXIS_LOCK_PX &&
				Math.abs(dy) > Math.abs(dx) * VERTICAL_OVER_HORIZONTAL
			) {
				s.decided = 'vertical';
				return;
			}
			s.decided = 'horizontal';
		},
		[isViewersMode],
	);

	const finishStripPointer = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			const s = stripPtrRef.current;
			if (!s || s.pointerId !== e.pointerId) {
				return;
			}
			stripPtrRef.current = null;
			if (!isViewersMode || s.decided !== 'vertical') {
				return;
			}
			const dy = e.clientY - s.y0;
			if (dy < STRIP_SWIPE_DOWN_CLOSE_MIN_PX) {
				return;
			}
			allowThumbClickRef.current = false;
			onCloseViewersMode();
			scheduleAllowThumbClick(120);
		},
		[isViewersMode, onCloseViewersMode, scheduleAllowThumbClick],
	);

	const onPointerUpCapture = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			finishStripPointer(e);
		},
		[finishStripPointer],
	);

	const onPointerCancelCapture = useCallback(() => {
		stripPtrRef.current = null;
	}, []);

	const wrapDragStart = useCallback(
		(orig?: DragGestureHandler) => {
			const wrapped: DragGestureHandler = (e, info) => {
				allowThumbClickRef.current = false;
				markHorizontalFromFramerDrag();
				orig?.(e, info);
			};
			return wrapped;
		},
		[markHorizontalFromFramerDrag],
	);

	const wrapDragEnd = useCallback((orig?: DragGestureHandler) => {
		const wrapped: DragGestureHandler = (e, info) => {
			orig?.(e, info);
			scheduleAllowThumbClick(70);
		};
		return wrapped;
	}, [scheduleAllowThumbClick]);

	return {
		allowThumbClickRef,
		stripPointerProps: {
			onPointerDownCapture,
			onPointerMove,
			onPointerUpCapture,
			onPointerCancelCapture,
		},
		wrapDragStart,
		wrapDragEnd,
	};
}
