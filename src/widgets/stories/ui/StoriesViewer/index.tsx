'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import {
	FadeInOutVariant,
	storyChromeVariants,
} from '@/shared/lib/framer-motion';
import { Flexbox, Icon, Space } from '@/shared/ui';

import {
	STORIES_SHELL_LAYOUT_ID,
	STORY_AVATAR_SRC,
	type StoryItem,
} from '../../constants';
import { CloseButton } from '../shared/styled';
import { StoriesProgress } from '../StoriesProgress';
import {
	StoriesViewerProvider,
	useStoriesViewerDomain,
	useStoriesViewerInteraction,
	useStoriesViewerSession,
} from '../StoriesViewerContext';
import { StorySwipeNeighbors } from '../StorySwipeNeighbors';
import { ViewerAvatar } from '../ViewerAvatar';
import { ViewersListPanel } from '../ViewersListPanel';
import {
	Overlay,
	OverlayBackdrop,
	StoryImageWrap,
	StoryInfo,
	StoryShell,
	ViewersLayer,
	VisuallyHidden,
} from './styled';

const MotionOverlay = motion.create(Overlay);
const MotionOverlayBackdrop = motion.create(OverlayBackdrop);

type StoriesViewerProps = {
	stories: readonly StoryItem[];
	activeIndex: number;
	segmentReplayToken: number;
	onClose: () => void;
	onProgressComplete: (segmentIndex: number) => void;
	onTapPrevious: () => void;
	onTapNext: () => void;
	onChangeActiveIndex: (index: number) => void;
	onResetSegmentTimer: () => void;
};

export function StoriesViewer({
	stories,
	activeIndex,
	segmentReplayToken,
	onClose,
	onProgressComplete,
	onTapPrevious,
	onTapNext,
	onChangeActiveIndex,
	onResetSegmentTimer,
}: StoriesViewerProps) {
	const story = stories[activeIndex];
	if (!story) {
		return null;
	}

	const domain: StoriesViewerProps = {
		stories,
		activeIndex,
		segmentReplayToken,
		onClose,
		onProgressComplete,
		onTapPrevious,
		onTapNext,
		onChangeActiveIndex,
		onResetSegmentTimer,
	};

	return (
		<MotionOverlay
			role="dialog"
			aria-modal="true"
			aria-label="Сторис"
			aria-describedby="stories-viewer-desc"
			variants={FadeInOutVariant}
			initial="hidden"
			animate="visible"
			exit="hidden"
		>
			<StoriesViewerProvider {...domain}>
				<StoriesViewerInner />
			</StoriesViewerProvider>
		</MotionOverlay>
	);
}

function StoriesViewerInner() {
	const {
		stories,
		activeIndex,
		segmentReplayToken,
		onClose,
		onProgressComplete,
		onResetSegmentTimer,
	} = useStoriesViewerDomain();

	const {
		dismissDragY,
		shellScale,
		dimmerOpacity,
		holdPaused,
		isVerticalDismissActive,
		isViewersMode,
		isVerticalSwipeUpActive,
		isVerticalSwipeDownCloseActive,
		panelHeightPx,
		panelY,
		previewOpacity,
		pointerProps,
		viewersStage,
		closeViewersMode,
	} = useStoriesViewerInteraction();

	const { railPinchActive } = useStoriesViewerSession();

	const story = stories[activeIndex];
	const [isStoryInfoVisible, setIsStoryInfoVisible] = useState(true);
	const isStoryInfoVisibleRef = useRef(isStoryInfoVisible);
	isStoryInfoVisibleRef.current = isStoryInfoVisible;

	const progressPaused =
		holdPaused ||
		isVerticalSwipeUpActive ||
		isViewersMode ||
		isVerticalSwipeDownCloseActive;
	const chromeInteractive =
		isViewersMode ||
		isVerticalSwipeUpActive ||
		isVerticalSwipeDownCloseActive;

	const suppressSegmentResetOnHideCompleteRef = useRef(false);

	useEffect(() => {
		if (isViewersMode) {
			suppressSegmentResetOnHideCompleteRef.current = false;
			setIsStoryInfoVisible(false);
			return;
		}

		if (!holdPaused || isVerticalDismissActive || isVerticalSwipeUpActive) {
			suppressSegmentResetOnHideCompleteRef.current = false;
			setIsStoryInfoVisible(true);
			return;
		}

		suppressSegmentResetOnHideCompleteRef.current = true;
		setIsStoryInfoVisible(false);
	}, [
		activeIndex,
		holdPaused,
		isVerticalDismissActive,
		isVerticalSwipeUpActive,
		isViewersMode,
	]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}
		for (const s of stories) {
			const img = new Image();
			img.decoding = 'async';
			img.src = s.src;
		}
	}, [stories]);

	if (!story) {
		return null;
	}

	return (
		<>
			<VisuallyHidden id="stories-viewer-desc">
				Листайте стрелками влево и вправо. Escape закрывает окно.
			</VisuallyHidden>
			<MotionOverlayBackdrop
				aria-hidden
				style={{ opacity: dimmerOpacity }}
			/>
			<StoryShell
				$viewersChrome={isViewersMode}
				layoutId={STORIES_SHELL_LAYOUT_ID}
				style={{ y: dismissDragY, scale: shellScale }}
				transition={{ type: 'tween', duration: 0.2 }}
				{...pointerProps}
			>
				<motion.div
					style={{
						zIndex: 40,
						opacity: previewOpacity,
						pointerEvents: isVerticalSwipeUpActive
							? 'auto'
							: 'none',
					}}
				>
					<motion.div
						variants={storyChromeVariants}
						layout={false}
						animate={isStoryInfoVisible ? 'visible' : 'hidden'}
						onAnimationComplete={() => {
							if (
								!isStoryInfoVisibleRef.current &&
								!suppressSegmentResetOnHideCompleteRef.current
							) {
								onResetSegmentTimer();
							}
						}}
					>
						<StoriesProgress
							count={stories.length}
							activeIndex={activeIndex}
							segmentReplayToken={segmentReplayToken}
							holdPaused={progressPaused}
							onSegmentComplete={onProgressComplete}
						/>

						<StoryInfo>
							<Flexbox $gap={10} $align="center" $nowrap>
								<ViewerAvatar
									userId={story.id}
									name="Евгений"
									img={STORY_AVATAR_SRC}
									sizes="40px"
									isAvatar
								/>
								<Flexbox $direction="column" $gap={2}>
									<span>
										<strong>Ваша история</strong> &bull;{' '}
										{activeIndex + 1}/{stories.length}
									</span>
									<span>{story.time}</span>
								</Flexbox>
								<Space />
								<CloseButton
									type="button"
									aria-label="Закрыть"
									$disabled={
										isVerticalSwipeUpActive || isViewersMode
									}
									onClick={onClose}
								>
									<Icon icon="times-small" size={5} />
								</CloseButton>
							</Flexbox>
						</StoryInfo>
					</motion.div>
				</motion.div>

				<StoryImageWrap
					$viewersMode={isViewersMode}
					$railPinchActive={railPinchActive}
				>
					<StorySwipeNeighbors />
				</StoryImageWrap>
				<ViewersLayer key="stories-viewers-layer">
					<ViewersListPanel
						viewers={story.viewers}
						panelY={panelY}
						panelHeightPx={panelHeightPx}
						interactive={chromeInteractive}
						lockVerticalTouch={
							viewersStage === 'thumbnails' ||
							viewersStage === 'expanded'
						}
						onClose={closeViewersMode}
					/>
				</ViewersLayer>
			</StoryShell>
		</>
	);
}
