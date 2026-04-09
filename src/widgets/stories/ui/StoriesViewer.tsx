'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { type ComponentProps, useEffect, useState } from 'react';

import { Flexbox, Icon, Space } from '@/shared/ui';

import {
	STORIES_SHELL_LAYOUT_ID,
	STORY_INFO_HIDE_DELAY_MS,
	type StoryItem,
} from '../constants';
import { useStoryViewerInteractions } from '../lib/useStoryViewerInteractions';
import { StoriesProgress } from './StoriesProgress';
import {
	CloseButton,
	Overlay,
	OverlayBackdrop,
	StoryImage,
	StoryImageInner,
	StoryImageWrap,
	StoryInfo,
	StoryShell,
	StoryTapZone,
	VisuallyHidden,
} from './styled';

const MotionOverlay = motion.create(Overlay);
const MotionOverlayBackdrop = motion.create(OverlayBackdrop);
const MotionStoryShell = motion.create(StoryShell);

type StoryTapZonePointerPressProps = Pick<
	ComponentProps<typeof StoryTapZone>,
	'onPointerDown' | 'onPointerUp' | 'onPointerCancel' | 'onPointerLeave'
>;

function storyTapZonePressPointerProps(
	setPressed: (value: boolean) => void,
): StoryTapZonePointerPressProps {
	return {
		onPointerDown: () => setPressed(true),
		onPointerUp: () => setPressed(false),
		onPointerCancel: () => setPressed(false),
		onPointerLeave: () => setPressed(false),
	};
}

type StoriesViewerProps = {
	stories: readonly StoryItem[];
	activeIndex: number;
	segmentReplayToken: number;
	onClose: () => void;
	onProgressComplete: (segmentIndex: number) => void;
	onTapPrevious: () => void;
	onTapNext: () => void;
};

export function StoriesViewer({
	stories,
	activeIndex,
	segmentReplayToken,
	onClose,
	onProgressComplete,
	onTapPrevious,
	onTapNext,
}: StoriesViewerProps) {
	const story = stories[activeIndex];
	const [leftTapPressed, setLeftTapPressed] = useState(false);
	const [rightTapPressed, setRightTapPressed] = useState(false);
	const [isStoryInfoVisible, setIsStoryInfoVisible] = useState(true);

	const {
		dismissDragY,
		shellScale,
		dimmerOpacity,
		holdPaused,
		isVerticalDismissActive,
		shellPointerProps,
		storyWrapPointerProps,
		onTapPreviousGuarded,
		onTapNextGuarded,
	} = useStoryViewerInteractions({
		activeIndex,
		onClose,
		onTapPrevious,
		onTapNext,
	});

	useEffect(() => {
		if (!holdPaused || isVerticalDismissActive) {
			setIsStoryInfoVisible(true);
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setIsStoryInfoVisible(false);
		}, STORY_INFO_HIDE_DELAY_MS);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [activeIndex, holdPaused, isVerticalDismissActive]);

	if (!story) {
		return null;
	}

	return (
		<MotionOverlay
			role="dialog"
			aria-modal="true"
			aria-label="Сторис"
			aria-describedby="stories-viewer-desc"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
		>
			<VisuallyHidden id="stories-viewer-desc">
				Листайте стрелками влево и вправо. Escape закрывает окно.
			</VisuallyHidden>
			<MotionOverlayBackdrop
				aria-hidden
				style={{ opacity: dimmerOpacity }}
			/>
			<MotionStoryShell
				layoutId={STORIES_SHELL_LAYOUT_ID}
				transition={{
					type: 'spring',
					damping: 30,
					stiffness: 280,
				}}
				style={{ y: dismissDragY, scale: shellScale }}
				{...shellPointerProps}
			>
				<StoriesProgress
					count={stories.length}
					activeIndex={activeIndex}
					segmentReplayToken={segmentReplayToken}
					holdPaused={holdPaused}
					onSegmentComplete={onProgressComplete}
				/>
				<AnimatePresence>
					{isStoryInfoVisible && (
						<StoryInfo
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							<Flexbox $gap={10} $align="center" $nowrap>
								<img src="/img/ava.jpg" alt="" />
								<Flexbox $direction="column">
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
									onClick={onClose}
								>
									<Icon icon="times-small" size={50} />
								</CloseButton>
							</Flexbox>
						</StoryInfo>
					)}
				</AnimatePresence>

				<StoryImageWrap {...storyWrapPointerProps}>
					<StoryImageInner>
						<StoryImage src={story.src} alt="" />
						<StoryTapZone
							type="button"
							aria-label="Предыдущий сторис"
							$side="left"
							$pressed={leftTapPressed}
							{...storyTapZonePressPointerProps(
								setLeftTapPressed,
							)}
							onClick={onTapPreviousGuarded}
						/>
						<StoryTapZone
							type="button"
							aria-label="Следующий сторис"
							$side="right"
							$pressed={rightTapPressed}
							{...storyTapZonePressPointerProps(
								setRightTapPressed,
							)}
							onClick={onTapNextGuarded}
						/>
					</StoryImageInner>
				</StoryImageWrap>
			</MotionStoryShell>
		</MotionOverlay>
	);
}
