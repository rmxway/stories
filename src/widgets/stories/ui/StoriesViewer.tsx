'use client';

import { motion } from 'framer-motion';
import { type ComponentProps, useState } from 'react';

import { Icon } from '@/shared/ui';

import { STORIES_SHELL_LAYOUT_ID, type StoryItem } from '../constants';
import { useStoryViewerInteractions } from '../lib/useStoryViewerInteractions';
import { StoriesProgress } from './StoriesProgress';
import {
	CloseButton,
	Overlay,
	OverlayBackdrop,
	StoryImage,
	StoryImageInner,
	StoryImageWrap,
	StoryShell,
	StoryTapZone,
	VisuallyHidden,
} from './styled';

const MotionOverlay = motion(Overlay);
const MotionOverlayBackdrop = motion(OverlayBackdrop);
const MotionStoryShell = motion(StoryShell);

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
	const [shellLayoutId, setShellLayoutId] = useState<
		typeof STORIES_SHELL_LAYOUT_ID | undefined
	>(STORIES_SHELL_LAYOUT_ID);

	const {
		dismissDragY,
		shellScale,
		dimmerOpacity,
		holdPaused,
		shellPointerProps,
		storyWrapPointerProps,
		onTapPreviousGuarded,
		onTapNextGuarded,
	} = useStoryViewerInteractions({
		activeIndex,
		onClose,
		onTapPrevious,
		onTapNext,
		onSwipeDismissCommit: () => setShellLayoutId(undefined),
	});

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
				layoutId={shellLayoutId}
				transition={{
					type: 'spring',
					damping: 26,
					stiffness: 220,
				}}
				style={{ y: dismissDragY, scale: shellScale }}
				{...shellPointerProps}
			>
				<CloseButton
					type="button"
					aria-label="Закрыть"
					onClick={onClose}
				>
					<Icon icon="times-small" size={50} />
				</CloseButton>
				<StoriesProgress
					count={stories.length}
					activeIndex={activeIndex}
					segmentReplayToken={segmentReplayToken}
					holdPaused={holdPaused}
					onSegmentComplete={onProgressComplete}
				/>
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
