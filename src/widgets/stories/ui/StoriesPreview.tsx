'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

import {
	STORIES_SHELL_LAYOUT_ID,
	STORY_AVATAR_SRC,
	type StoryItem,
} from '../constants';
import { useProgressiveAvatarPhase } from '../lib/useStoryImagePreload';
import { StoryRingSvg } from './StoryRingSvg';
import {
	PreviewButton,
	PreviewWrap,
	ProgressiveAvatarImg,
	StoryRingFrame,
	StoryRingInner,
	StoryRingSvgWrap,
} from './styled';

const MotionPreviewButton = motion.create(PreviewButton);

type StoriesPreviewProps = {
	stories: readonly StoryItem[];
	seenIds: string[];
	/** После чтения localStorage: непросмотренные — градиент; до — все сегменты серые. */
	seenStorageLoaded: boolean;
	onOpen: () => void;
};

export const StoriesPreview = forwardRef<
	HTMLButtonElement,
	StoriesPreviewProps
>(function StoriesPreview(
	{ stories, seenIds, seenStorageLoaded, onOpen },
	ref,
) {
	const seenByIndex = stories.map((s) => seenIds.includes(s.id));
	const { sharp, onLoad, onError, imgRef } =
		useProgressiveAvatarPhase(STORY_AVATAR_SRC);

	return (
		<PreviewWrap>
			<MotionPreviewButton
				ref={ref}
				type="button"
				layoutId={STORIES_SHELL_LAYOUT_ID}
				aria-label="Открыть сторисы"
				onClick={onOpen}
				whileTap={{ scale: 0.96 }}
				transition={{ type: 'tween', duration: 0.15 }}
			>
				<StoryRingFrame>
					<StoryRingSvgWrap>
						<StoryRingSvg
							seenByIndex={seenByIndex}
							seenStorageLoaded={seenStorageLoaded}
						/>
					</StoryRingSvgWrap>
					<StoryRingInner>
						<ProgressiveAvatarImg
							ref={imgRef}
							src={STORY_AVATAR_SRC}
							alt=""
							$sharp={sharp}
							onLoad={onLoad}
							onError={onError}
						/>
					</StoryRingInner>
				</StoryRingFrame>
			</MotionPreviewButton>
		</PreviewWrap>
	);
});
