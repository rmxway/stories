'use client';

import { forwardRef, type Ref } from 'react';

import { getBlurDataURL } from '@/lib/getBlurDataURL';
import { STORY_AVATAR_SRC, type StoryItem } from '@/widgets/stories/constants';
import { useProgressiveAvatarPhase } from '@/widgets/stories/lib/media';

import { StoryRingSvg } from '../StoryRingSvg';
import {
	PreviewButton,
	PreviewWrap,
	StoryAvatarImage,
	StoryMyStoryText,
	StoryRingFrame,
	StoryRingInner,
	StoryRingSvgWrap,
} from './styled';

type StoriesPreviewProps = {
	stories: readonly StoryItem[];
	seenIds: string[];
	/** После чтения localStorage: непросмотренные — градиент; до — все сегменты серые. */
	seenStorageLoaded: boolean;
	originRef?: Ref<HTMLDivElement>;
	onOpen: () => void;
};

export const StoriesPreview = forwardRef<
	HTMLButtonElement,
	StoriesPreviewProps
>(function StoriesPreview(
	{ stories, seenIds, seenStorageLoaded, originRef, onOpen },
	ref,
) {
	const seenByIndex = stories.map((s) => seenIds.includes(s.id));
	const { onLoad, onError, imgRef } =
		useProgressiveAvatarPhase(STORY_AVATAR_SRC);
	const avatarBlur = getBlurDataURL(STORY_AVATAR_SRC);

	return (
		<PreviewWrap>
			<PreviewButton
				ref={ref}
				type="button"
				aria-label="Открыть сторисы"
				onClick={onOpen}
				whileTap={{ scale: 0.96 }}
				transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
			>
				<StoryRingFrame ref={originRef}>
					<StoryRingSvgWrap>
						<StoryRingSvg
							seenByIndex={seenByIndex}
							seenStorageLoaded={seenStorageLoaded}
						/>
					</StoryRingSvgWrap>
					<StoryRingInner>
						<StoryAvatarImage
							ref={imgRef}
							src={STORY_AVATAR_SRC}
							alt=""
							fill
							loading="lazy"
							placeholder="blur"
							blurDataURL={avatarBlur}
							onLoad={onLoad}
							onError={onError}
						/>
					</StoryRingInner>
				</StoryRingFrame>
				<StoryMyStoryText>Моя история</StoryMyStoryText>
			</PreviewButton>
		</PreviewWrap>
	);
});
