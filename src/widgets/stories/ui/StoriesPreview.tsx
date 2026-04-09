'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

import type { StoryItem } from '../constants';
import { StoryRingSvg } from './StoryRingSvg';
import {
	PreviewButton,
	PreviewWrap,
	StoryAvatar,
	StoryRingFrame,
	StoryRingInner,
	StoryRingSvgWrap,
} from './styled';

const MotionPreviewButton = motion(PreviewButton);

type StoriesPreviewProps = {
	stories: readonly StoryItem[];
	seenIds: string[];
	onOpen: () => void;
};

export const StoriesPreview = forwardRef<
	HTMLButtonElement,
	StoriesPreviewProps
>(function StoriesPreview({ stories, seenIds, onOpen }, ref) {
	const seenByIndex = stories.map((s) => seenIds.includes(s.id));

	return (
		<PreviewWrap>
			<MotionPreviewButton
				ref={ref}
				type="button"
				layoutId="stories-shell"
				aria-label="Открыть сторисы"
				onClick={onOpen}
				whileTap={{ scale: 0.96 }}
				transition={{ type: 'tween', duration: 0.15 }}
			>
				<StoryRingFrame>
					<StoryRingSvgWrap>
						<StoryRingSvg seenByIndex={seenByIndex} />
					</StoryRingSvgWrap>
					<StoryRingInner>
						<StoryAvatar src="/img/ava.jpg" alt="" />
					</StoryRingInner>
				</StoryRingFrame>
			</MotionPreviewButton>
		</PreviewWrap>
	);
});
