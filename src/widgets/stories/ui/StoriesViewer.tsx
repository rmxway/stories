'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { type ComponentProps, useEffect, useState } from 'react';

import { FadeInOutVariant, ImageFadeVariant } from '@/shared/lib/framer-motion';
import { Flexbox, Icon, Space } from '@/shared/ui';

import {
	STORIES_SHELL_LAYOUT_ID,
	STORY_AVATAR_SRC,
	STORY_INFO_HIDE_DELAY_MS,
	type StoryItem,
} from '../constants';
import {
	useProgressiveAvatarPhase,
	useStorySlidePhase,
} from '../lib/useStoryImagePreload';
import { useStoryViewerInteractions } from '../lib/useStoryViewerInteractions';
import { StoriesProgress } from './StoriesProgress';
import {
	CloseButton,
	Overlay,
	OverlayBackdrop,
	ProgressiveAvatarImg,
	ShimmerOverlay,
	StoryBlurFallback,
	StoryImageInner,
	StoryImageMain,
	StoryImageWrap,
	StoryInfo,
	StoryInfoAvatarWrap,
	StoryShell,
	StorySkeleton,
	StorySkeletonMotionWrap,
	StoryTapZone,
	VisuallyHidden,
} from './styled';

const MotionOverlay = motion.create(Overlay);
const MotionOverlayBackdrop = motion.create(OverlayBackdrop);

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

	const { phase, onLoad, onError, isContentReady, mainImgRef } =
		useStorySlidePhase(story?.src ?? '');
	const {
		sharp,
		onLoad: onLoadAvatar,
		onError: onErrorAvatar,
		imgRef: avatarImgRef,
	} = useProgressiveAvatarPhase(STORY_AVATAR_SRC);

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
		console.log(isStoryInfoVisible);
	}, [isStoryInfoVisible]);

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
			variants={FadeInOutVariant}
			initial="hidden"
			animate="visible"
			exit="hidden"
		>
			<VisuallyHidden id="stories-viewer-desc">
				Листайте стрелками влево и вправо. Escape закрывает окно.
			</VisuallyHidden>
			<MotionOverlayBackdrop
				aria-hidden
				style={{ opacity: dimmerOpacity }}
			/>
			<StoryShell
				layoutId={STORIES_SHELL_LAYOUT_ID}
				transition={{
					type: 'spring',
					damping: 30,
					stiffness: 280,
				}}
				style={{ y: dismissDragY, scale: shellScale }}
				{...shellPointerProps}
			>
				<motion.div
					variants={FadeInOutVariant}
					initial="hidden"
					animate={isStoryInfoVisible ? 'visible' : 'hidden'}
					style={{ zIndex: 1 }}
				>
					<StoriesProgress
						count={stories.length}
						activeIndex={activeIndex}
						segmentReplayToken={segmentReplayToken}
						holdPaused={holdPaused}
						isImageLoaded={isContentReady}
						onSegmentComplete={onProgressComplete}
					/>

					<StoryInfo>
						<Flexbox $gap={10} $align="center" $nowrap>
							<StoryInfoAvatarWrap>
								<ProgressiveAvatarImg
									ref={avatarImgRef}
									src={STORY_AVATAR_SRC}
									alt=""
									$sharp={sharp}
									onLoad={onLoadAvatar}
									onError={onErrorAvatar}
								/>
							</StoryInfoAvatarWrap>
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
				</motion.div>

				<StoryImageWrap {...storyWrapPointerProps}>
					<StoryImageInner>
						<AnimatePresence>
							{phase === 'loading' ? (
								<StorySkeletonMotionWrap
									key="story-skeleton"
									variants={ImageFadeVariant}
									initial="hidden"
									animate="visible"
									exit="hidden"
								>
									<StorySkeleton aria-hidden />
									<ShimmerOverlay aria-hidden />
								</StorySkeletonMotionWrap>
							) : null}
						</AnimatePresence>
						{phase === 'error' ? (
							<StoryBlurFallback src={story.src} alt="" />
						) : null}
						<StoryImageMain
							ref={mainImgRef}
							src={story.src}
							alt=""
							$phase={phase}
							onLoad={onLoad}
							onError={onError}
						/>
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
			</StoryShell>
		</MotionOverlay>
	);
}
