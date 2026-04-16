'use client';

import { type MotionValue, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';

import { getBlurDataURL } from '@/lib/getBlurDataURL';

import { type StoryItem } from '../constants';
import { StoryThumbnailItemWrap } from './styled';

type StoryThumbnailRailItemProps = {
	story: StoryItem;
	index: number;
	activeIndex: number;
	sliderX: MotionValue<number>;
	/** Измеренная ширина карточки + gap (совпадает с CSS трека). */
	itemStridePx: number;
	onClick: () => void;
};

export function StoryThumbnailRailItem({
	story,
	index,
	activeIndex,
	sliderX,
	itemStridePx,
	onClick,
}: StoryThumbnailRailItemProps) {
	const blur = story.src ? getBlurDataURL(story.src) : undefined;

	/**
	 * Числа из пропсов синхронизируем в MotionValue, чтобы `useTransform` реагировал
	 * и на сдвиг `sliderX`, и на смену activeIndex / stride (иначе скачок при отпускании).
	 */
	const activeIndexMv = useMotionValue(activeIndex);
	const itemStrideMv = useMotionValue(itemStridePx);
	activeIndexMv.set(activeIndex);
	itemStrideMv.set(itemStridePx);

	const progressT = useTransform(
		[sliderX, activeIndexMv, itemStrideMv],
		([x, ai, stride]) => {
			const s = Number(stride);
			if (s <= 0) {
				return 0;
			}
			const i = Number(ai);
			const d = Math.abs(Number(x) + index * s);
			return index === i ? 0 : Math.min(1, d / s);
		},
	);

	const scale = useTransform(progressT, (t) => 1 + (0.82 - 1) * t);
	const opacity = useTransform(progressT, (t) => 1 + (0.55 - 1) * t);

	/** Без layoutId: shared layout + spring по layout конфликтует со `scale`/`opacity` из MotionValue. */
	return (
		<StoryThumbnailItemWrap
			layout={false}
			style={{ scale, opacity }}
			onClick={onClick}
		>
			<Image
				src={story.src}
				alt=""
				fill
				// sizes="(max-width: 900px) 40vw, 180px"
				sizes="100%"
				placeholder={blur ? 'blur' : 'empty'}
				blurDataURL={blur}
			/>
		</StoryThumbnailItemWrap>
	);
}
