'use client';

import { useTransform } from 'framer-motion';
import { useCallback, useMemo } from 'react';

import { useStoriesThumbnailsSlider } from '../lib/useStoriesThumbnailsSlider';
import {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
} from '../lib/useStoryViewerInteractions';
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

/** До этой точки по Y рельс миниатюр остаётся скрыт при открытии из story (как раньше [0, -28, …]). */
const SWIPE_THUMB_STRIP_EARLY_PX = -28;

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
		viewersStage,
		onCloseToStory: closeViewersMode,
		onCollapseToThumbnails: collapseViewersToThumbnails,
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

	/** 0 → story; миниатюры видны у `SWIPE_UP_THUMBNAILS_PX`; в expanded — скрыт. */
	const swipeRevealOpacity = useTransform(
		swipeUpDragY,
		[
			SWIPE_UP_DRAG_MAX_PX,
			SWIPE_UP_THUMBNAILS_PX,
			SWIPE_THUMB_STRIP_EARLY_PX,
			0,
		],
		[0, 1, 0, 0],
	);

	const interactive =
		isVerticalSwipeUpActive ||
		isViewersMode ||
		isVerticalSwipeDownCloseActive;

	if (stories.length <= 1) {
		return null;
	}

	return (
		<StorySwipeSliderContent
			style={{
				x: '-50%',
				y: thumbnailRailY,
			}}
		>
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
