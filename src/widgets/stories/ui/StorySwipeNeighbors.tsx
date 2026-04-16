'use client';

import { useTransform } from 'framer-motion';
import { useCallback, useMemo } from 'react';

import { useStoriesThumbnailsSlider } from '../lib/useStoriesThumbnailsSlider';
import { SWIPE_UP_DRAG_MAX_PX } from '../lib/useStoryViewerInteractions';
import { useViewersThumbnailStripInteraction } from '../lib/useViewersThumbnailStripInteraction';
import {
	useStoriesViewerDomain,
	useStoriesViewerInteraction,
} from './StoriesViewerContext';
import { StoryThumbnailRailItem } from './StoryThumbnailRailItem';
import {
	StoriesSliderTrack,
	StorySwipeSliderContent,
	StorySwipeSliderWrap,
} from './styled';

export function StorySwipeNeighbors() {
	const { stories, activeIndex, onChangeActiveIndex } =
		useStoriesViewerDomain();
	const {
		swipeUpDragY,
		isViewersMode,
		isVerticalSwipeUpActive,
		isVerticalSwipeDownCloseActive,
		closeViewersMode,
	} = useStoriesViewerInteraction();

	const {
		sliderX,
		maxDragLeft,
		itemStridePx,
		sliderTrackRef,
		onDragStart,
		onDragEnd,
		onPointerCancel,
	} = useStoriesThumbnailsSlider({
		activeIndex,
		storiesLength: stories.length,
		onChangeActiveIndex,
	});

	const {
		allowThumbClickRef,
		stripPointerProps,
		wrapDragStart,
		wrapDragEnd,
	} = useViewersThumbnailStripInteraction({
		isViewersMode,
		onCloseViewersMode: closeViewersMode,
	});

	const dragStart = useMemo(
		() => wrapDragStart(onDragStart),
		[onDragStart, wrapDragStart],
	);
	const dragEnd = useMemo(
		() => wrapDragEnd(onDragEnd),
		[onDragEnd, wrapDragEnd],
	);

	const onPointerCancelCombined = useCallback(() => {
		onPointerCancel();
		window.setTimeout(() => {
			allowThumbClickRef.current = true;
		}, 70);
	}, [allowThumbClickRef, onPointerCancel]);

	const swipeRevealOpacity = useTransform(
		swipeUpDragY,
		[0, -28, SWIPE_UP_DRAG_MAX_PX],
		[0, 0, 1],
	);

	const interactive =
		isVerticalSwipeUpActive ||
		isViewersMode ||
		isVerticalSwipeDownCloseActive;

	if (stories.length <= 1) {
		return null;
	}

	return (
		<StorySwipeSliderContent>
			<StorySwipeSliderWrap
				data-stories-thumbnail-strip="true"
				data-viewers-interactive={interactive ? 'true' : undefined}
				drag={interactive ? 'x' : false}
				dragConstraints={{ left: maxDragLeft, right: 0 }}
				dragElastic={0.12}
				dragMomentum={false}
				dragSnapToOrigin={false}
				dragTransition={{
					power: 0.2,
					timeConstant: 200,
					bounceDamping: 40,
				}}
				style={{
					x: sliderX,
					opacity: swipeRevealOpacity,
					pointerEvents: interactive ? 'auto' : 'none',
				}}
				onDragStart={dragStart}
				onDragEnd={dragEnd}
				onPointerCancel={onPointerCancelCombined}
				{...stripPointerProps}
			>
				<StoriesSliderTrack ref={sliderTrackRef}>
					{stories.map((story, i) => (
						<StoryThumbnailRailItem
							key={story.id}
							story={story}
							index={i}
							activeIndex={activeIndex}
							sliderX={sliderX}
							itemStridePx={itemStridePx}
							onClick={() => {
								if (!allowThumbClickRef.current) {
									return;
								}
								if (i === activeIndex) {
									closeViewersMode();
								} else {
									onChangeActiveIndex(i);
								}
							}}
						/>
					))}
				</StoriesSliderTrack>
			</StorySwipeSliderWrap>
		</StorySwipeSliderContent>
	);
}
