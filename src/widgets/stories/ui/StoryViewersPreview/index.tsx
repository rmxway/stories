'use client';

import { motion, useTransform } from 'framer-motion';

import { Icon } from '@/shared/ui';
import { StoryItem } from '@/widgets/stories/constants';
import { formatStoryViewCount } from '@/widgets/stories/lib/formatStoryViewCount';
import {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
} from '@/widgets/stories/lib/gestures/useStoryViewerInteractions';

import {
	useStoriesViewerDomain,
	useStoriesViewerInteraction,
} from '../StoriesViewerContext';
import { ViewerAvatar } from '../ViewerAvatar';
import {
	ViewersPreviewAvatars,
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
			y: [
				0,
				-(window.innerHeight / 100) * 2,
				-(window.innerHeight / 100) * 2,
			],
			gap: ['1cqi', '0px', '0px'],
			xEye: [0, 40, 40],
			scaleEye: [0, 1, 1],
			scaleCount: [1, 1.2, 1.2],
			widthEye: [0, 22, 22],
		},
	);

	const mainAnimation = {
		x,
		y: hasViewers ? y : 0,
		left,
		gap,
		opacity: hasViewers ? 1 : fadeIn,
	};

	const IconMotion = motion.create(Icon);

	return (
		<ViewersPreviewWrap
			$interactive={!disabled}
			style={mainAnimation}
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
				{topViewers.map((viewer, index) => (
					<motion.div
						key={viewer.id}
						style={{
							zIndex: topViewers.length - index,
							opacity: fadeIn,
						}}
					>
						<ViewerAvatar
							img={viewer.img}
							name={viewer.name}
							userId={viewer.id}
						/>
					</motion.div>
				))}
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
