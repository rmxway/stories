'use client';

import { type MotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';

import { getBlurDataURL } from '@/lib/getBlurDataURL';

import { type StoryItem } from '../constants';
import { SWIPE_UP_DRAG_MAX_PX } from '../lib/useStoryViewerInteractions';
import { StoryNeighborCard, StoryNeighborImageInner } from './styled';

type StorySwipeNeighborsProps = {
	stories: readonly StoryItem[];
	activeIndex: number;
	swipeUpDragY: MotionValue<number>;
	neighborInteractionsEnabled: boolean;
	/** В полностью открытом режиме миниатюр соседние превью не показываем. */
	isViewersMode: boolean;
	onGoPrevious: () => void;
	onGoNext: () => void;
};

export function StorySwipeNeighbors({
	stories,
	activeIndex,
	swipeUpDragY,
	neighborInteractionsEnabled,
	isViewersMode,
	onGoPrevious,
	onGoNext,
}: StorySwipeNeighborsProps) {
	const prev = activeIndex > 0 ? stories[activeIndex - 1] : null;
	const next =
		activeIndex < stories.length - 1 ? stories[activeIndex + 1] : null;

	const opacity = useTransform(
		swipeUpDragY,
		[0, -32, SWIPE_UP_DRAG_MAX_PX],
		[0, 0.46, 0.55],
	);
	const scale = useTransform(
		swipeUpDragY,
		[0, SWIPE_UP_DRAG_MAX_PX],
		[0.80, 0.95],
	);

	if (isViewersMode) {
		return null;
	}

	if (!prev && !next) {
		return null;
	}

	const pointerEvents = neighborInteractionsEnabled ? 'auto' : 'none';

	return (
		<>
			{prev ? (
				<StoryNeighborCard
					type="button"
					$side="left"
					aria-label="Предыдущий сторис"
					tabIndex={neighborInteractionsEnabled ? 0 : -1}
					style={{
						y: '-50%',
						opacity,
						scale,
						pointerEvents,
					}}
					onClick={(e) => {
						e.stopPropagation();
						onGoPrevious();
					}}
				>
					<NeighborThumb src={prev.src} />
				</StoryNeighborCard>
			) : null}
			{next ? (
				<StoryNeighborCard
					type="button"
					$side="right"
					aria-label="Следующий сторис"
					tabIndex={neighborInteractionsEnabled ? 0 : -1}
					style={{
						y: '-50%',
						opacity,
						scale,
						pointerEvents,
					}}
					onClick={(e) => {
						e.stopPropagation();
						onGoNext();
					}}
				>
					<NeighborThumb src={next.src} />
				</StoryNeighborCard>
			) : null}
		</>
	);
}

function NeighborThumb({ src }: { src: string }) {
	const blur = getBlurDataURL(src);

	return (
		<StoryNeighborImageInner>
			<Image
				src={src}
				alt=""
				fill
				sizes="88px"
				placeholder={blur ? 'blur' : 'empty'}
				blurDataURL={blur}
				style={{ objectFit: 'cover' }}
			/>
		</StoryNeighborImageInner>
	);
}
