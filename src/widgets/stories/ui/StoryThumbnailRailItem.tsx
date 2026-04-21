'use client';

import { type MotionValue, useMotionValue, useTransform } from 'framer-motion';
import {
	ComponentProps,
	type MouseEvent,
	useEffect,
	useMemo,
	useState,
} from 'react';

import { getBlurDataURL } from '@/lib/getBlurDataURL';
import { ImageFadeVariant } from '@/shared/lib/framer-motion';

import { type StoryItem } from '../constants';
import { useStorySlidePhase } from '../lib/media';
import { SWIPE_UP_DRAG_MAX_PX, SWIPE_UP_THUMBNAILS_PX } from '../lib/motion';
import {
	useStoriesActiveSlideMedia,
	useStoriesViewerInteraction,
} from './StoriesViewerContext';
import { StoryViewersPreview } from './StoryViewersPreview';
import {
	ShimmerOverlay,
	StoryImageMain,
	StorySkeleton,
	StorySkeletonMotionWrap,
	StoryTapZone,
	StoryThumbnailItemWrap,
	StoryThumbnailPackedOffsetLayer,
	StoryThumbnailPreviewBackground,
	StoryThumbnailPreviewLayer,
	StoryThumbnailScaleLayer,
} from './styled';

type StoryThumbnailRailItemProps = {
	story: StoryItem;
	index: number;
	isActive: boolean;
	sliderX: MotionValue<number>;
	swipeThumbOpacityClassic: MotionValue<number>;
	swipeStoryNeighborOpacity: MotionValue<number>;
	/** Измеренная ширина карточки + gap (совпадает с CSS трека). */
	itemStridePx: number;
	onClick: () => void;
};

const STORY_THUMBNAIL_TRACK_GAP_PX = 20;

export function StoryThumbnailRailItem({
	story,
	index,
	isActive,
	sliderX,
	itemStridePx,
	swipeThumbOpacityClassic,
	swipeStoryNeighborOpacity,
	onClick,
}: StoryThumbnailRailItemProps) {
	const [leftTapPressed, setLeftTapPressed] = useState(false);
	const [rightTapPressed, setRightTapPressed] = useState(false);
	const storyBlur = useMemo(
		() => (story?.src ? getBlurDataURL(story.src) : undefined),
		[story?.src],
	);
	const { phase, onLoad, onError, mainImgRef, isContentReady } =
		useStorySlidePhase(story?.src ?? '');
	const { setActiveSlideContentReady } = useStoriesActiveSlideMedia();

	useEffect(() => {
		if (!isActive) {
			return;
		}
		setActiveSlideContentReady(isContentReady);
	}, [isActive, isContentReady, setActiveSlideContentReady]);

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

	const {
		onTapPreviousGuarded,
		onTapNextGuarded,
		viewersStage,
		storyHeight,
		storyScale,
		swipeUpDragY,
	} = useStoriesViewerInteraction();

	/**
	 * `itemStridePx` из React в MotionValue — чтобы `useTransform` подписался на смену шага.
	 * Не используем `activeIndex` в формуле: он обновляется сразу, а `sliderX` догоняет через
	 * `animate` в `useStoriesThumbnailsSlider` — иначе один кадр «новый активный уже 0, рельс ещё старый» и скачок scale/opacity.
	 */
	const itemStrideMv = useMotionValue(itemStridePx);
	itemStrideMv.set(itemStridePx);

	const progressT = useTransform([sliderX, itemStrideMv], ([x, stride]) => {
		const s = Number(stride);
		if (s <= 0) {
			return 0;
		}
		const d = Math.abs(Number(x) + index * s);
		return Math.min(1, d / s);
	});

	const scale = useTransform(progressT, (t) => 1 + (0.92 - 1) * t);
	const opacity = useTransform(progressT, (t) => 1 + (0.55 - 1) * t);
	const packedOffsetX = useTransform(
		[storyScale, sliderX, itemStrideMv],
		([storyScaleValue, x, stride]) => {
			const stridePx = Number(stride);
			if (stridePx <= 0) {
				return 0;
			}

			const cardWidthPx = Math.max(
				0,
				stridePx - STORY_THUMBNAIL_TRACK_GAP_PX,
			);
			const railProgress = -Number(x) / stridePx;
			const shrinkOffsetPx = (1 - Number(storyScaleValue)) * cardWidthPx;

			return (railProgress - index) * shrinkOffsetPx;
		},
	);

	const isActiveMv = useMotionValue(isActive ? 1 : 0);
	isActiveMv.set(isActive ? 1 : 0);

	/**
	 * Неактивные: min(classic, storyN) — градиент на (−250, 0] без плато classic.
	 * Активный: только classic — гашение в expanded (y → −500), в story у низа classic = 1.
	 */
	const swipeLayerOpacity = useTransform(
		[swipeThumbOpacityClassic, swipeStoryNeighborOpacity, isActiveMv],
		([classic, storyN, active]) => {
			const c = Number(classic);
			if (Number(active) >= 0.5) {
				return c;
			}
			return Math.min(c, Number(storyN));
		},
	);

	const previewBackgroundOpacity = useTransform(
		swipeUpDragY,
		[0, SWIPE_UP_THUMBNAILS_PX, SWIPE_UP_DRAG_MAX_PX],
		[0, 1, 1],
	);

	function onThumbWrapClick(e: MouseEvent<HTMLDivElement>): void {
		const t = e.target;
		if (!(t instanceof Element)) {
			return;
		}
		if (t.closest('button') || t.closest('[data-viewers-preview="true"]')) {
			return;
		}
		onClick();
	}

	const allowPointerEvents = viewersStage !== 'story' || isActive;

	return (
		<StoryThumbnailPackedOffsetLayer
			style={{ opacity: swipeLayerOpacity, x: packedOffsetX }}
		>
			<StoryThumbnailScaleLayer
				$allowPointerEvents={allowPointerEvents}
				style={{ scale: storyScale }}
			>
				<StoryThumbnailItemWrap
					style={{ scale, opacity }}
					onClick={onThumbWrapClick}
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
						sizes="100%"
						placeholder={storyBlur ? 'blur' : 'empty'}
						blurDataURL={storyBlur}
						$phase={phase}
						onLoad={onLoad}
						onError={onError}
					/>
					{viewersStage === 'story' && (
						<>
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
						</>
					)}
					<StoryThumbnailPreviewBackground
						style={{ opacity: previewBackgroundOpacity }}
					/>
				</StoryThumbnailItemWrap>
			</StoryThumbnailScaleLayer>
			<StoryThumbnailPreviewLayer
				style={{ height: storyHeight, scale, opacity }}
			>
				<StoryViewersPreview
					disabled={!allowPointerEvents}
					viewers={story.viewers}
					storyIndex={index}
				/>
			</StoryThumbnailPreviewLayer>
		</StoryThumbnailPackedOffsetLayer>
	);
}
