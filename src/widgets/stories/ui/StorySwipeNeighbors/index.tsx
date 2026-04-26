'use client';

import { useTransform } from 'framer-motion';
import { useCallback, useMemo } from 'react';

import {
	useStoriesThumbnailsSlider,
	useViewersThumbnailStripInteraction,
} from '@/widgets/stories/lib/gestures';
import {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
} from '@/widgets/stories/lib/motion';

import {
	useStoriesViewerDomain,
	useStoriesViewerInteraction,
	useStoriesViewerSession,
} from '../StoriesViewerContext';
import { StoryThumbnailRailItem } from '../StoryThumbnailRailItem';
import { StorySwipeSliderContent, StorySwipeSliderWrap } from './styled';

export function StorySwipeNeighbors() {
	const { stories, activeIndex, onChangeActiveIndex } =
		useStoriesViewerDomain();
	const {
		swipeUpDragY,
		viewersStage,
		isViewersMode,
		isVerticalSwipeUpActive,
		isVerticalSwipeDownCloseActive,
		closeViewersMode,
		collapseViewersToThumbnails,
		thumbnailRailY,
	} = useStoriesViewerInteraction();

	const { railPinchActive } = useStoriesViewerSession();

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
		viewersStage,
	});

	const {
		allowThumbClickRef,
		stripPointerProps,
		wrapDragStart,
		wrapDragEnd,
	} = useViewersThumbnailStripInteraction({
		viewersStage,
		onCloseToStory: closeViewersMode,
		onCollapseToThumbnails: collapseViewersToThumbnails,
		railPinchActive,
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

	/** Как раньше для thumbnails / expanded: один множитель на все слайды. */
	const { swipeThumbOpacityClassic, swipeStoryNeighborOpacity } =
		useTransform(
			swipeUpDragY,
			[SWIPE_UP_DRAG_MAX_PX + 30, SWIPE_UP_THUMBNAILS_PX, 0],
			{
				swipeThumbOpacityClassic: [0, 1, 1],
				swipeStoryNeighborOpacity: [1, 1, 0],
			},
		);

	const interactive =
		isVerticalSwipeUpActive ||
		isViewersMode ||
		isVerticalSwipeDownCloseActive;

	return (
		<StorySwipeSliderContent
			style={{
				y: thumbnailRailY,
			}}
		>
			<StorySwipeSliderWrap
				data-viewers-interactive={interactive ? 'true' : undefined}
				drag={interactive ? 'x' : false}
				dragConstraints={{ left: maxDragLeft, right: 0 }}
				dragElastic={0.12}
				dragMomentum={false}
				dragSnapToOrigin={false}
				style={{
					x: sliderX,
					/* В режиме story drag выключен, но тап-зоны должны получать события;
					 * `none` ломает hit-testing у потомков в части окружений. */
					pointerEvents: 'auto',
				}}
				onDragStart={dragStart}
				onDragEnd={dragEnd}
				ref={sliderTrackRef}
				onPointerCancel={onPointerCancelCombined}
				{...stripPointerProps}
			>
				{stories.map((story, i) => (
					<StoryThumbnailRailItem
						key={story.id}
						story={story}
						index={i}
						isActive={i === activeIndex}
						sliderX={sliderX}
						itemStridePx={itemStridePx}
						swipeThumbOpacityClassic={swipeThumbOpacityClassic}
						swipeStoryNeighborOpacity={swipeStoryNeighborOpacity}
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
			</StorySwipeSliderWrap>
		</StorySwipeSliderContent>
	);
}
