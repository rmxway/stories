'use client';

import { animate, useMotionValue, useReducedMotion } from 'framer-motion';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

import {
	STORY_THUMBNAIL_TRACK_GAP_PX,
	type ViewersStage,
} from '../../constants';

const STORIES_THUMB_ASPECT_H_OVER_W = 1.8;

function getStoriesThumbStrideFallbackPx(): number {
	const assumedViewportH = 812;
	const stripHeightPx = assumedViewportH * 0.5;
	const cardWidthPx = stripHeightPx / STORIES_THUMB_ASPECT_H_OVER_W;
	return cardWidthPx + STORY_THUMBNAIL_TRACK_GAP_PX;
}

const INITIAL_ITEM_STRIDE_PX = getStoriesThumbStrideFallbackPx();

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
		: { type: 'spring' as const, damping: 30, stiffness: 300 };
}

function parseGapPx(track: HTMLElement): number {
	const g = getComputedStyle(track).gap;
	if (!g || g === 'normal') {
		return STORY_THUMBNAIL_TRACK_GAP_PX;
	}
	const n = Number.parseFloat(g);
	return Number.isFinite(n) ? n : STORY_THUMBNAIL_TRACK_GAP_PX;
}

type UseStoriesThumbnailsSliderArgs = {
	activeIndex: number;
	storiesLength: number;
	onChangeActiveIndex: (index: number) => void;
	/** В режиме story смена активного слайда без анимации рельса. */
	viewersStage: ViewersStage;
};

export function useStoriesThumbnailsSlider({
	activeIndex,
	storiesLength,
	onChangeActiveIndex,
	viewersStage,
}: UseStoriesThumbnailsSliderArgs) {
	const instantRail = viewersStage === 'story';
	const [itemStridePx, setItemStridePx] = useState(INITIAL_ITEM_STRIDE_PX);
	const sliderTrackRef = useRef<HTMLDivElement>(null);
	const sliderX = useMotionValue(-activeIndex * INITIAL_ITEM_STRIDE_PX);
	const reducedMotion = useReducedMotion() ?? false;
	const isDraggingRef = useRef(false);
	const lastMeasuredStrideRef = useRef<number | null>(null);
	const sliderXSnapAnimationRef = useRef<ReturnType<typeof animate> | null>(
		null,
	);

	useLayoutEffect(() => {
		lastMeasuredStrideRef.current = null;
		const track = sliderTrackRef.current;
		const first = track?.firstElementChild as HTMLElement | undefined;
		if (!track || !first) {
			return;
		}

		const measure = (): void => {
			if (isDraggingRef.current) {
				return;
			}
			const w = first.offsetWidth;
			const gap = parseGapPx(track);
			if (w <= 0) {
				return;
			}
			const next = w + gap;
			if (
				lastMeasuredStrideRef.current !== null &&
				Math.abs(lastMeasuredStrideRef.current - next) < 0.5
			) {
				return;
			}
			lastMeasuredStrideRef.current = next;
			setItemStridePx(next);
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(track);
		ro.observe(first);
		return () => ro.disconnect();
	}, [storiesLength]);

	const animateSliderXToTarget = useCallback(
		(targetX: number) => {
			if (Math.abs(sliderX.get() - targetX) < 0.5) {
				sliderXSnapAnimationRef.current?.stop();
				sliderXSnapAnimationRef.current = null;
				return;
			}
			sliderXSnapAnimationRef.current?.stop();
			if (instantRail) {
				sliderX.set(targetX);
				sliderXSnapAnimationRef.current = null;
				return;
			}
			sliderXSnapAnimationRef.current = animate(
				sliderX,
				targetX,
				snapSpringConfig(reducedMotion),
			);
		},
		[instantRail, reducedMotion, sliderX],
	);

	useEffect(() => {
		if (isDraggingRef.current) {
			return;
		}
		animateSliderXToTarget(-activeIndex * itemStridePx);
	}, [activeIndex, animateSliderXToTarget, itemStridePx]);

	useEffect(() => {
		return () => {
			sliderXSnapAnimationRef.current?.stop();
		};
	}, []);

	const snapToActiveIndex = useCallback(() => {
		animateSliderXToTarget(-activeIndex * itemStridePx);
	}, [activeIndex, animateSliderXToTarget, itemStridePx]);

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
				requestAnimationFrame(() => {
					snapToActiveIndex();
				});
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
		requestAnimationFrame(() => {
			snapToActiveIndex();
		});
	}, [snapToActiveIndex]);

	const maxDragLeft = -Math.max(0, (storiesLength - 1) * itemStridePx);

	return {
		sliderX,
		maxDragLeft,
		itemStridePx,
		sliderTrackRef,
		onDragStart,
		onDragEnd,
		onPointerCancel,
	};
}
