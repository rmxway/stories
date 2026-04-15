'use client';

import { type MotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';

import { getBlurDataURL } from '@/lib/getBlurDataURL';

import { StoryItem } from '../constants';
import {
	STORIES_THUMB_ITEM_STRIDE_PX,
	useStoriesThumbnailsSlider,
} from '../lib/useStoriesThumbnailsSlider';
import {
	StoriesSliderTrack,
	StoriesSliderWrap,
	StoryThumbnailItemWrap,
} from './styled';

type StoriesThumbnailsSliderProps = {
	stories: readonly StoryItem[];
	activeIndex: number;
	/** false — слой смонтирован, но основной сторис на весь экран; жесты не перехватываем. */
	interactive?: boolean;
	onChangeActiveIndex: (index: number) => void;
	onCloseViewersMode: () => void;
};

export function StoriesThumbnailsSlider({
	stories,
	activeIndex,
	interactive = true,
	onChangeActiveIndex,
	onCloseViewersMode,
}: StoriesThumbnailsSliderProps) {
	const { sliderX, maxDragLeft, onDragStart, onDragEnd, onPointerCancel } =
		useStoriesThumbnailsSlider({
			activeIndex,
			storiesLength: stories.length,
			onChangeActiveIndex,
		});

	return (
		<StoriesSliderWrap
			data-viewers-interactive={interactive ? 'true' : undefined}
			drag={interactive ? 'x' : false}
			dragConstraints={{ left: maxDragLeft, right: 0 }}
			dragElastic={0.12}
			dragMomentum={false}
			style={{
				x: sliderX,
				pointerEvents: interactive ? 'auto' : 'none',
			}}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onPointerCancel={onPointerCancel}
		>
			<StoriesSliderTrack>
				{stories.map((story, i) => {
					const isCenter = i === activeIndex;
					return (
						<StoryThumbnailItem
							key={story.id}
							story={story}
							index={i}
							sliderX={sliderX}
							onClick={() => {
								if (isCenter) {
									onCloseViewersMode();
								} else {
									onChangeActiveIndex(i);
								}
							}}
						/>
					);
				})}
			</StoriesSliderTrack>
		</StoriesSliderWrap>
	);
}

type StoryThumbnailItemProps = {
	story: StoryItem;
	index: number;
	sliderX: MotionValue<number>;
	onClick: () => void;
};

function StoryThumbnailItem({
	story,
	index,
	sliderX,
	onClick,
}: StoryThumbnailItemProps) {
	const blur = story.src ? getBlurDataURL(story.src) : undefined;

	const itemLeft = index * STORIES_THUMB_ITEM_STRIDE_PX;
	const distance = useTransform(sliderX, (x) => Math.abs(x + itemLeft));

	const scale = useTransform(
		distance,
		[0, STORIES_THUMB_ITEM_STRIDE_PX],
		[1, 0.82],
	);
	const opacity = useTransform(
		distance,
		[0, STORIES_THUMB_ITEM_STRIDE_PX],
		[1, 0.55],
	);

	return (
		<StoryThumbnailItemWrap style={{ scale, opacity }} onClick={onClick}>
			<Image
				src={story.src}
				alt=""
				fill
				sizes="(max-width: 900px) 140px, 240px"
				placeholder={blur ? 'blur' : 'empty'}
				blurDataURL={blur}
				style={{ objectFit: 'cover' }}
			/>
		</StoryThumbnailItemWrap>
	);
}
