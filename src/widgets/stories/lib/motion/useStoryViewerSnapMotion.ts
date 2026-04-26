'use client';

import { animate, type MotionValue } from 'framer-motion';
import { type RefObject, useCallback } from 'react';

import type { ViewersStage } from '../../constants';
import {
	DISMISS_CLOSE_DISTANCE_PX,
	DISMISS_CLOSE_VELOCITY_PX_S,
	DISMISS_DRAG_MAX_PX,
	EXPAND_COMMIT_SWIPE_UP_PX,
	MID_SNAP_STORY_THUMB_PX,
	MID_SNAP_THUMB_EXPAND_PX,
	SWIPE_UP_OPEN_DISTANCE_PX,
	SWIPE_UP_OPEN_VELOCITY_PX_S,
} from '../gestures/storyViewerGestureConstants';
import {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
	VIEWERS_CHROME_OPEN_SPRING,
} from './storyViewerMotionConstants';

type UseStoryViewerSnapMotionArgs = {
	dismissDragY: MotionValue<number>;
	swipeUpDragY: MotionValue<number>;
	onClose: () => void;
	suppressTapClickRef: RefObject<boolean>;
	setViewersStage: (stage: ViewersStage) => void;
	setIsVerticalSwipeUpActive: (v: boolean) => void;
	setIsVerticalSwipeDownCloseActive: (v: boolean) => void;
};

export function useStoryViewerSnapMotion({
	dismissDragY,
	swipeUpDragY,
	onClose,
	suppressTapClickRef,
	setViewersStage,
	setIsVerticalSwipeUpActive,
	setIsVerticalSwipeDownCloseActive,
}: UseStoryViewerSnapMotionArgs) {
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

	const animateDismissTo = useCallback(
		(target: number, onComplete?: () => void) => {
			return animate(dismissDragY, target, {
				...VIEWERS_CHROME_OPEN_SPRING,
				onComplete,
			});
		},
		[dismissDragY],
	);

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
				suppressTapClickRef.current = true;
				void animateDismissTo(y + velocityY / 5, onClose);
			} else {
				void animateDismissTo(0);
			}
		},
		[animateDismissTo, dismissDragY, onClose, suppressTapClickRef],
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
				setViewersStage('story');
				void animateSwipeTo(0, () => {
					setIsVerticalSwipeUpActive(false);
				});
			}
		},
		[
			animateSwipeTo,
			setIsVerticalSwipeUpActive,
			setViewersStage,
			swipeUpDragY,
		],
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
		[
			animateSwipeTo,
			setIsVerticalSwipeDownCloseActive,
			setIsVerticalSwipeUpActive,
			setViewersStage,
			swipeUpDragY,
		],
	);

	const finishSwipeDownCloseViewersOrSnap = useCallback(
		(velocityY: number) => {
			const y = swipeUpDragY.get();
			const strongDown = velocityY > -SWIPE_UP_OPEN_VELOCITY_PX_S;

			if (
				y > MID_SNAP_STORY_THUMB_PX ||
				(strongDown && y > SWIPE_UP_THUMBNAILS_PX)
			) {
				setViewersStage('story');
				void animateSwipeTo(0, () => {
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
		[
			animateSwipeTo,
			setIsVerticalSwipeDownCloseActive,
			setViewersStage,
			swipeUpDragY,
		],
	);

	return {
		applyResistance,
		applyUpResistance,
		animateDismissTo,
		animateSwipeTo,
		finishDismissOrSnap,
		finishSwipeUpOrSnap,
		finishSwipeUpExpandOrSnap,
		finishSwipeDownCloseViewersOrSnap,
	};
}
