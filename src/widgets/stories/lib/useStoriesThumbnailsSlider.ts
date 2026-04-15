'use client';

import { animate, useMotionValue, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';

/** Ширина карточки + зазор (должно совпадать с CSS трека). */
export const STORIES_THUMB_CARD_WIDTH_PX = 140;
export const STORIES_THUMB_GAP_PX = 16;
export const STORIES_THUMB_ITEM_STRIDE_PX =
	STORIES_THUMB_CARD_WIDTH_PX + STORIES_THUMB_GAP_PX;

const SWIPE_VELOCITY_BLEND = 0.18;

function resolveNextIndexAfterSwipe(input: {
	activeIndex: number;
	storiesLength: number;
	itemStridePx: number;
	offsetX: number;
	velocityX: number;
}): number {
	const swipe = input.offsetX + input.velocityX * SWIPE_VELOCITY_BLEND;
	const half = input.itemStridePx / 2;

	if (swipe < -half && input.activeIndex < input.storiesLength - 1) {
		return input.activeIndex + 1;
	}
	if (swipe > half && input.activeIndex > 0) {
		return input.activeIndex - 1;
	}
	return input.activeIndex;
}

function snapSpringConfig(reducedMotion: boolean) {
	return reducedMotion
		? { type: 'tween' as const, duration: 0.22, ease: 'easeOut' as const }
		: { type: 'spring' as const, damping: 28, stiffness: 380 };
}

type UseStoriesThumbnailsSliderArgs = {
	activeIndex: number;
	storiesLength: number;
	onChangeActiveIndex: (index: number) => void;
};

export function useStoriesThumbnailsSlider({
	activeIndex,
	storiesLength,
	onChangeActiveIndex,
}: UseStoriesThumbnailsSliderArgs) {
	const sliderX = useMotionValue(0);
	const reducedMotion = useReducedMotion() ?? false;
	const isDraggingRef = useRef(false);

	const itemStridePx = STORIES_THUMB_ITEM_STRIDE_PX;

	useEffect(() => {
		if (isDraggingRef.current) {
			return;
		}
		const targetX = -activeIndex * itemStridePx;
		void animate(sliderX, targetX, snapSpringConfig(reducedMotion));
	}, [activeIndex, itemStridePx, reducedMotion, sliderX]);

	const snapToActiveIndex = useCallback(() => {
		void animate(
			sliderX,
			-activeIndex * itemStridePx,
			snapSpringConfig(reducedMotion),
		);
	}, [activeIndex, itemStridePx, reducedMotion, sliderX]);

	const onDragStart = useCallback(() => {
		isDraggingRef.current = true;
	}, []);

	const onDragEnd = useCallback(
		(
			_e: unknown,
			{
				offset,
				velocity,
			}: {
				offset: { x: number; y: number };
				velocity: { x: number; y: number };
			},
		) => {
			isDraggingRef.current = false;
			const nextIndex = resolveNextIndexAfterSwipe({
				activeIndex,
				storiesLength,
				itemStridePx,
				offsetX: offset.x,
				velocityX: velocity.x,
			});

			if (nextIndex !== activeIndex) {
				onChangeActiveIndex(nextIndex);
			} else {
				snapToActiveIndex();
			}
		},
		[
			activeIndex,
			itemStridePx,
			onChangeActiveIndex,
			snapToActiveIndex,
			storiesLength,
		],
	);

	const onPointerCancel = useCallback(() => {
		if (!isDraggingRef.current) {
			return;
		}
		isDraggingRef.current = false;
		snapToActiveIndex();
	}, [snapToActiveIndex]);

	const maxDragLeft = -Math.max(0, (storiesLength - 1) * itemStridePx);

	return {
		sliderX,
		maxDragLeft,
		onDragStart,
		onDragEnd,
		onPointerCancel,
	};
}
