'use client';

import { motion } from 'framer-motion';
import {
	type ComponentProps,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { getBlurDataURL } from '@/lib/getBlurDataURL';
import {
	FadeInOutVariant,
	ImageFadeVariant,
	storyChromeVariants,
} from '@/shared/lib/framer-motion';
import { Flexbox, Icon, Space } from '@/shared/ui';

import {
	STORIES_SHELL_LAYOUT_ID,
	STORY_AVATAR_SRC,
	type StoryItem,
} from '../constants';
import {
	useProgressiveAvatarPhase,
	useStorySlidePhase,
} from '../lib/useStoryImagePreload';
import { useStoryViewerInteractions } from '../lib/useStoryViewerInteractions';
import { StoriesProgress } from './StoriesProgress';
import { StoriesViewersMode } from './StoriesViewersMode';
import { StorySwipeNeighbors } from './StorySwipeNeighbors';
import { StoryViewersPreview } from './StoryViewersPreview';
import {
	CloseButton,
	Overlay,
	OverlayBackdrop,
	ShimmerOverlay,
	StoryAvatarImage,
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
	onChangeActiveIndex: (index: number) => void;
	/** Сброс таймера сегмента после скрытия прогресса/шапки (см. onAnimationComplete). */
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
	const [leftTapPressed, setLeftTapPressed] = useState(false);
	const [rightTapPressed, setRightTapPressed] = useState(false);
	const [isStoryInfoVisible, setIsStoryInfoVisible] = useState(true);
	const isStoryInfoVisibleRef = useRef(isStoryInfoVisible);
	isStoryInfoVisibleRef.current = isStoryInfoVisible;

	const { phase, onLoad, onError, isContentReady, mainImgRef } =
		useStorySlidePhase(story?.src ?? '');
	const {
		onLoad: onLoadAvatar,
		onError: onErrorAvatar,
		imgRef: avatarImgRef,
	} = useProgressiveAvatarPhase(STORY_AVATAR_SRC);
	const avatarBlur = getBlurDataURL(STORY_AVATAR_SRC);
	const storyBlur = useMemo(
		() => (story?.src ? getBlurDataURL(story.src) : undefined),
		[story?.src],
	);

	const {
		dismissDragY,
		shellScale,
		dimmerOpacity,
		holdPaused,
		isVerticalDismissActive,

		isViewersMode,
		isVerticalSwipeUpActive,
		isVerticalSwipeDownCloseActive,
		storyScale,
		panelY,
		previewOpacity,
		previewRevealOpacity,
		viewersChromeOpacity,
		viewersChromeTransform,
		closeViewersMode,
		openViewersMode,
		swipeUpDragY,

		pointerProps,
		onTapPreviousGuarded,
		onTapNextGuarded,
	} = useStoryViewerInteractions({
		activeIndex,
		onClose,
		onTapPrevious,
		onTapNext,
	});

	const progressPaused =
		holdPaused ||
		isVerticalSwipeUpActive ||
		isViewersMode ||
		isVerticalSwipeDownCloseActive;

	/** Только для паузы по удержанию: не даём onResetSegmentTimer обнулить сегмент при скрытии шапки. */
	const suppressSegmentResetOnHideCompleteRef = useRef(false);

	useEffect(() => {
		if (isViewersMode) {
			/* Режим зрителей: после скрытия прогресса нужен сброс сегмента (как раньше при свайпе вверх). */
			suppressSegmentResetOnHideCompleteRef.current = false;
			setIsStoryInfoVisible(false);
			return;
		}

		/* Как при свайпе вниз (dismiss): жест не смешиваем с автоскрытием по удержанию. */
		if (!holdPaused || isVerticalDismissActive || isVerticalSwipeUpActive) {
			suppressSegmentResetOnHideCompleteRef.current = false;
			setIsStoryInfoVisible(true);
			return;
		}

		/* Удержание без вертикального жеста — сразу прячем шапку/прогресс.
		 * Раньше был setTimeout(300ms) после setVisible(true): по окончании анимации вызывался
		 * onResetSegmentTimer и сегмент обнулялся во время паузы. */
		suppressSegmentResetOnHideCompleteRef.current = true;
		setIsStoryInfoVisible(false);
	}, [
		activeIndex,
		holdPaused,
		isVerticalDismissActive,
		isVerticalSwipeUpActive,
		isViewersMode,
	]);

	/** Прогревает HTTP-кэш для всех кадров при открытии (меньше повторных запросов при листании). */
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
				style={{ y: dismissDragY, scale: shellScale }}
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
							isImageLoaded={isContentReady}
							onSegmentComplete={onProgressComplete}
						/>

						<StoryInfo>
							<Flexbox $gap={10} $align="center" $nowrap>
								<StoryInfoAvatarWrap>
									<StoryAvatarImage
										ref={avatarImgRef}
										src={STORY_AVATAR_SRC}
										alt=""
										fill
										sizes="48px"
										placeholder="blur"
										blurDataURL={avatarBlur}
										onLoad={onLoadAvatar}
										onError={onErrorAvatar}
									/>
								</StoryInfoAvatarWrap>
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

				{/* LayoutGroup: пара layoutId слайдера отдельно от оболочки превью (STORIES_SHELL_LAYOUT_ID). */}

				<StoryImageWrap $viewersMode={isViewersMode}>
					<StorySwipeNeighbors
						stories={stories}
						activeIndex={activeIndex}
						swipeUpDragY={swipeUpDragY}
						interactive={
							isVerticalSwipeUpActive ||
							isViewersMode ||
							isVerticalSwipeDownCloseActive
						}
						isViewersMode={isViewersMode}
						onChangeActiveIndex={onChangeActiveIndex}
						onCloseViewersMode={closeViewersMode}
					/>
					<StoryImageInner
						style={{
							scale: storyScale,
							opacity: previewRevealOpacity,
							transformOrigin: 'top center',
						}}
					>
						<StorySkeletonMotionWrap
							key="story-skeleton"
							variants={ImageFadeVariant}
							initial="hidden"
							animate={phase === 'loading' ? 'visible' : 'hidden'}
							exit="hidden"
						>
							<StorySkeleton aria-hidden />
							<ShimmerOverlay aria-hidden />
						</StorySkeletonMotionWrap>

						<StoryImageMain
							key={story.id}
							ref={mainImgRef}
							src={story.src}
							alt=""
							sizes="(max-width: 900px) 100vw, min(90vw, 480px)"
							placeholder={storyBlur ? 'blur' : 'empty'}
							blurDataURL={storyBlur}
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

				<StoriesViewersMode
					key="stories-viewers-layer"
					stories={stories}
					activeIndex={activeIndex}
					panelY={panelY}
					layerOpacity={viewersChromeOpacity}
					layerTransform={viewersChromeTransform}
					isViewersMode={isViewersMode}
					isVerticalSwipeUpActive={isVerticalSwipeUpActive}
					isVerticalSwipeDownCloseActive={
						isVerticalSwipeDownCloseActive
					}
					onChangeActiveIndex={onChangeActiveIndex}
					onCloseViewersMode={closeViewersMode}
				/>

				<StoryViewersPreview
					viewers={story.viewers || []}
					opacity={previewOpacity}
					onClick={openViewersMode}
				/>
			</StoryShell>
		</MotionOverlay>
	);
}
