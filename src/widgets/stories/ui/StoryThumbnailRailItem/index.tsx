'use client';

import { type MotionValue } from 'framer-motion';

import { ImageFadeVariant } from '@/shared/lib/framer-motion';
import { type StoryItem } from '@/widgets/stories/constants';
import { useStoryThumbnailRailItemState } from '@/widgets/stories/lib/storyThumbnailRail';

import { StoryThumbnailRailItemTapZones } from '../StoryThumbnailRailItemTapZones';
import { StoryViewersPreview } from '../StoryViewersPreview';
import {
	ShimmerOverlay,
	StoryImageMain,
	StoryPinchZoomSlot,
	StoryPinchZoomTransformShell,
	StorySkeleton,
	StorySkeletonMotionWrap,
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
	const s = useStoryThumbnailRailItemState({
		story,
		index,
		isActive,
		sliderX,
		itemStridePx,
		swipeThumbOpacityClassic,
		swipeStoryNeighborOpacity,
		onClick,
	});

	return (
		<StoryThumbnailPackedOffsetLayer
			style={{ opacity: s.swipeLayerOpacity, x: s.packedOffsetX }}
		>
			<StoryThumbnailScaleLayer
				$allowPointerEvents={s.allowPointerEvents}
				style={{ scale: s.storyScale }}
			>
				<StoryThumbnailItemWrap
					$pinchExpanded={s.pinchExpanded}
					style={{ scale: s.scale, opacity: s.opacity }}
					onClick={s.onThumbWrapClick}
				>
					<StorySkeletonMotionWrap
						key="story-skeleton"
						variants={ImageFadeVariant}
						initial="hidden"
						animate={s.phase === 'loading' ? 'visible' : 'hidden'}
						exit="hidden"
					>
						<StorySkeleton aria-hidden />
						<ShimmerOverlay aria-hidden />
					</StorySkeletonMotionWrap>
					<StoryPinchZoomSlot $railPinchExpanded={s.pinchExpanded}>
						<StoryPinchZoomTransformShell
							ref={s.pinchTransformShellRef}
							data-pinch-shell
							$touchPan={s.viewersStage !== 'story'}
							onClick={s.onPinchShellClick}
						>
							<StoryImageMain
								key={story.id}
								ref={s.mainImgRef}
								src={story.src}
								alt=""
								sizes={s.storyRailImageSizes}
								placeholder={s.storyBlur ? 'blur' : 'empty'}
								blurDataURL={s.storyBlur}
								$phase={s.phase}
								onLoad={s.onLoad}
								onError={s.onError}
							/>
						</StoryPinchZoomTransformShell>
					</StoryPinchZoomSlot>
					{s.viewersStage === 'story' && (
						<StoryThumbnailRailItemTapZones
							onTapPrevious={s.onTapPreviousGuarded}
							onTapNext={s.onTapNextGuarded}
						/>
					)}
					<StoryThumbnailPreviewBackground
						style={{ opacity: s.previewBackgroundOpacity }}
					/>
				</StoryThumbnailItemWrap>
			</StoryThumbnailScaleLayer>
			<StoryThumbnailPreviewLayer
				style={{
					height: s.storyHeight,
					scale: s.scale,
					opacity: s.opacity,
				}}
			>
				<StoryViewersPreview
					disabled={!s.allowPointerEvents}
					viewers={story.viewers}
					storyIndex={index}
				/>
			</StoryThumbnailPreviewLayer>
		</StoryThumbnailPackedOffsetLayer>
	);
}
