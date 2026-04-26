'use client';

import { type MotionValue, useMotionValue, useTransform } from 'framer-motion';

import { STORY_THUMBNAIL_TRACK_GAP_PX } from '../../constants';
import {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
} from './storyViewerMotionConstants';

type UseStoryThumbnailRailItemMotionArgs = {
	index: number;
	sliderX: MotionValue<number>;
	itemStridePx: number;
	isActive: boolean;
	storyScale: MotionValue<number>;
	swipeThumbOpacityClassic: MotionValue<number>;
	swipeStoryNeighborOpacity: MotionValue<number>;
	swipeUpDragY: MotionValue<number>;
};

/**
 * `itemStridePx` из React в MotionValue — чтобы `useTransform` подписался на смену шага.
 * Не используем `activeIndex` в формуле: он обновляется сразу, а `sliderX` догоняет через
 * `animate` в `useStoriesThumbnailsSlider` — иначе один кадр «новый активный уже 0, рельс ещё старый» и скачок scale/opacity.
 */
export function useStoryThumbnailRailItemMotion({
	index,
	sliderX,
	itemStridePx,
	isActive,
	storyScale,
	swipeThumbOpacityClassic,
	swipeStoryNeighborOpacity,
	swipeUpDragY,
}: UseStoryThumbnailRailItemMotionArgs) {
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

	return {
		scale,
		opacity,
		packedOffsetX,
		swipeLayerOpacity,
		previewBackgroundOpacity,
	};
}
