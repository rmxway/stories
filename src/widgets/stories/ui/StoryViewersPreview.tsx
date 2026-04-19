'use client';

import Image from 'next/image';

import { getBlurDataURL } from '@/lib/getBlurDataURL';

import { STORY_AVATAR_SRC } from '../constants';
import { formatStoryViewCount } from '../lib/formatStoryViewCount';
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

export function StoryViewersPreview() {
	const { stories, activeIndex } = useStoriesViewerDomain();
	const { previewOpacity, openViewersMode } = useStoriesViewerInteraction();

	const story = stories[activeIndex];
	const viewers = story?.viewers ?? [];
	const hasViewers = viewers.length > 0;
	const topViewers = viewers.slice(0, 3);
	const count = viewers.length;

	return (
		<ViewersPreviewWrap
			data-viewers-preview="true"
			data-viewers-interactive="true"
			role="button"
			tabIndex={0}
			onClick={openViewersMode}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					openViewersMode();
				}
			}}
		>
			<ViewersPreviewAvatars>
				{topViewers.map((viewer, index) => {
					const src = viewer.img || STORY_AVATAR_SRC;
					const blur = getBlurDataURL(src);

					return (
						<ViewersPreviewAvatarWrap
							key={viewer.id}
							style={{
								zIndex: topViewers.length - index,
								opacity: previewOpacity,
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
				{hasViewers ? formatStoryViewCount(count) : 'Нет просмотров'}
			</ViewersPreviewCount>
		</ViewersPreviewWrap>
	);
}
