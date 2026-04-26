'use client';

import { type MotionValue } from 'framer-motion';
import {
	type MouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { getBlurDataURL } from '@/lib/getBlurDataURL';

import {
	STORY_COVER_PINCH_MAX,
	STORY_RAIL_IMAGE_SIZES,
	type StoryItem,
} from '../../constants';
import {
	useStoriesViewerInteraction,
	useStoriesViewerSession,
} from '../../ui/StoriesViewerContext';
import { useStoryCoverPinch } from '../gestures';
import { useStorySlidePhase } from '../media';
import { useStoryThumbnailRailItemMotion } from '../motion';

export type StoryThumbnailRailItemStateArgs = {
	story: StoryItem;
	index: number;
	isActive: boolean;
	sliderX: MotionValue<number>;
	swipeThumbOpacityClassic: MotionValue<number>;
	swipeStoryNeighborOpacity: MotionValue<number>;
	itemStridePx: number;
	onClick: () => void;
};

export function useStoryThumbnailRailItemState({
	story,
	index,
	isActive,
	sliderX,
	itemStridePx,
	swipeThumbOpacityClassic,
	swipeStoryNeighborOpacity,
	onClick,
}: StoryThumbnailRailItemStateArgs) {
	const [pinchExpanded, setPinchExpanded] = useState(false);

	const storyBlur = useMemo(
		() => (story?.src ? getBlurDataURL(story.src) : undefined),
		[story?.src],
	);
	const { phase, onLoad, onError, mainImgRef, isContentReady } =
		useStorySlidePhase(story?.src ?? '');
	const pinchTransformShellRef = useRef<HTMLDivElement | null>(null);

	const { setActiveSlideContentReady, setRailPinchActive } =
		useStoriesViewerSession();
	const {
		onTapPreviousGuarded,
		onTapNextGuarded,
		onTapPreviousFromShell,
		onTapNextFromShell,
		viewersStage,
		storyHeight,
		storyScale,
		swipeUpDragY,
	} = useStoriesViewerInteraction();

	const shellNavBlockUntilRef = useRef(0);

	const {
		scale,
		opacity,
		packedOffsetX,
		swipeLayerOpacity,
		previewBackgroundOpacity,
	} = useStoryThumbnailRailItemMotion({
		index,
		sliderX,
		itemStridePx,
		isActive,
		storyScale,
		swipeThumbOpacityClassic,
		swipeStoryNeighborOpacity,
		swipeUpDragY,
	});

	useEffect(() => {
		if (!isActive) {
			return;
		}
		setActiveSlideContentReady(isContentReady);
	}, [isActive, isContentReady, setActiveSlideContentReady]);

	useEffect(() => {
		if (!isActive || viewersStage !== 'story') {
			return;
		}
		setRailPinchActive(pinchExpanded);
		return () => {
			setRailPinchActive(false);
		};
	}, [isActive, viewersStage, pinchExpanded, setRailPinchActive]);

	const allowPointerEvents = viewersStage !== 'story' || isActive;
	/** Двухпальцевый зум — только в полноэкранном «сторис», не в зрителях/миниатюрах. */
	const pinchEnabled =
		allowPointerEvents &&
		isActive &&
		viewersStage === 'story' &&
		phase === 'loaded';

	useStoryCoverPinch({
		shellRef: pinchTransformShellRef,
		storyId: story.id,
		enabled: pinchEnabled,
		maxScale: STORY_COVER_PINCH_MAX,
		onExpandedChange: setPinchExpanded,
		shellNavBlockUntilRef,
	});

	const onPinchShellClick = useCallback(
		(e: MouseEvent<HTMLDivElement>) => {
			if (viewersStage !== 'story' || !isActive) {
				return;
			}
			e.stopPropagation();
			if (e.button !== 0) {
				return;
			}
			if (Date.now() < shellNavBlockUntilRef.current) {
				return;
			}
			const { currentTarget } = e;
			const rect = currentTarget.getBoundingClientRect();
			if (rect.width <= 0) {
				return;
			}
			const x = e.clientX - rect.left;
			if (x < rect.width * 0.5) {
				onTapPreviousFromShell();
			} else {
				onTapNextFromShell();
			}
		},
		[viewersStage, isActive, onTapPreviousFromShell, onTapNextFromShell],
	);

	const onThumbWrapClick = useCallback(
		(e: MouseEvent<HTMLDivElement>): void => {
			const t = e.target;
			if (!(t instanceof Element)) {
				return;
			}
			if (t.closest('[data-viewers-preview="true"]')) {
				return;
			}
			onClick();
		},
		[onClick],
	);

	return {
		storyBlur,
		storyRailImageSizes: STORY_RAIL_IMAGE_SIZES,
		phase,
		onLoad,
		onError,
		mainImgRef,
		pinchTransformShellRef,
		pinchExpanded,
		packedOffsetX,
		swipeLayerOpacity,
		scale,
		opacity,
		previewBackgroundOpacity,
		viewersStage,
		storyHeight,
		storyScale,
		onTapPreviousGuarded,
		onTapNextGuarded,
		onPinchShellClick,
		onThumbWrapClick,
		allowPointerEvents,
	};
}
