'use client';

import { motion, useTransform } from 'framer-motion';
import Image from 'next/image';

import { getBlurDataURL } from '@/lib/getBlurDataURL';
import { Icon } from '@/shared/ui';

import { STORY_AVATAR_SRC, StoryItem } from '../constants';
import { formatStoryViewCount } from '../lib/formatStoryViewCount';
import {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
} from '../lib/gestures/useStoryViewerInteractions';
import {
	useStoriesViewerDomain,
	useStoriesViewerInteraction,
} from './StoriesViewerContext';
import {
	ViewersPreviewAvatars,
	ViewersPreviewAvatarWrap,
	ViewersPreviewCount,
	ViewersPreviewWrap,
} from './styled';

type StoryViewersPreviewProps = {
	disabled?: boolean;
	viewers: StoryItem['viewers'];
	storyIndex: number;
};

export function StoryViewersPreview({
	disabled = false,
	viewers = [],
	storyIndex,
}: StoryViewersPreviewProps) {
	const { activeIndex } = useStoriesViewerDomain();
	const { openViewersMode, swipeUpDragY } = useStoriesViewerInteraction();

	const hasViewers = viewers.length > 0;
	const topViewers = viewers.slice(0, 3);
	const count = viewers.length;

	/** Соседи не повторяют первый участок жеста (до thumbnails): эффективный ввод 0, пока `y` ближе к 0, чем порог. */
	const previewSwipeInput = useTransform(swipeUpDragY, (val) => {
		return storyIndex !== activeIndex ? SWIPE_UP_THUMBNAILS_PX : val;
	});

	const {
		fadeIn,
		fadeOut,
		scale,
		scaleEye,
		scaleCount,
		x,
		left,
		y,
		gap,
		widthEye,
	} = useTransform(
		previewSwipeInput,
		[0, SWIPE_UP_THUMBNAILS_PX, SWIPE_UP_DRAG_MAX_PX],
		{
			fadeIn: [1, 0, 0],
			fadeOut: [0, 1, 1],
			scale: [1, 0, 0],
			x: ['0%', '-50%', '-50%'],
			left: ['0%', '50%', '50%'],
			y: [0, -20, -20],
			gap: ['1cqi', '0px', '0px'],
			xEye: [0, 40, 40],
			scaleEye: [0, 1, 1],
			scaleCount: [1, 1.2, 1.2],
			widthEye: [0, 22, 22],
		},
	);

	const IconMotion = motion.create(Icon);

	return (
		<ViewersPreviewWrap
			$interactive={!disabled}
			style={{ x, y, left, gap }}
			data-viewers-preview="true"
			data-viewers-interactive="true"
			role={disabled ? undefined : 'button'}
			tabIndex={disabled ? -1 : 0}
			onClick={disabled ? undefined : openViewersMode}
			onKeyDown={(e) => {
				if (disabled) {
					return;
				}
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					openViewersMode();
				}
			}}
		>
			<ViewersPreviewAvatars style={{ scale }}>
				{topViewers.map((viewer, index) => {
					const src = viewer.img || STORY_AVATAR_SRC;
					const blur = getBlurDataURL(src);

					return (
						<ViewersPreviewAvatarWrap
							key={viewer.id}
							style={{
								zIndex: topViewers.length - index,
								opacity: fadeIn,
							}}
						>
							<Image
								src={src}
								alt={viewer.name}
								fill
								sizes="32px"
								placeholder="blur"
								blurDataURL={blur}
							/>
						</ViewersPreviewAvatarWrap>
					);
				})}
			</ViewersPreviewAvatars>

			<ViewersPreviewCount>
				{hasViewers ? (
					<>
						<IconMotion
							icon="eye"
							size={20}
							style={{
								opacity: fadeOut,
								scale: scaleEye,
								width: widthEye,
							}}
						/>
						<motion.div
							style={{
								scale: scaleCount,
								transformOrigin: 'top',
							}}
						>
							{count}
						</motion.div>
						<motion.span style={{ opacity: fadeIn }}>
							{formatStoryViewCount(count)}
						</motion.span>
					</>
				) : (
					'Нет просмотров'
				)}
			</ViewersPreviewCount>
		</ViewersPreviewWrap>
	);
}
