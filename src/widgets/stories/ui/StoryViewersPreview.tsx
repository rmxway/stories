'use client';

import { MotionValue } from 'framer-motion';
import Image from 'next/image';

import { getBlurDataURL } from '@/lib/getBlurDataURL';

import { STORY_AVATAR_SRC } from '../constants';
import { formatStoryViewCount } from '../lib/formatStoryViewCount';
import {
	ViewersPreviewAvatars,
	ViewersPreviewAvatarWrap,
	ViewersPreviewCount,
	ViewersPreviewWrap,
} from './styled';

type Props = {
	viewers: ReadonlyArray<{ id: string; name: string; img: string }>;
	opacity: MotionValue<number>;
};

export function StoryViewersPreview({ viewers, opacity }: Props) {
	if (!viewers || viewers.length === 0) {
		return null;
	}

	const topViewers = viewers.slice(0, 3);
	const count = viewers.length;

	return (
		<ViewersPreviewWrap style={{ opacity }}>
			<ViewersPreviewAvatars>
				{topViewers.map((viewer, index) => {
					// We can use the img from viewer, but let's fallback to STORY_AVATAR_SRC if needed.
					// Actually, the viewer has img, we use it directly.
					const src = viewer.img || STORY_AVATAR_SRC;
					const blur = getBlurDataURL(src);

					return (
						<ViewersPreviewAvatarWrap
							key={viewer.id}
							style={{ zIndex: topViewers.length - index }}
						>
							<Image
								src={src}
								alt={viewer.name}
								fill
								sizes="32px"
								placeholder="blur"
								blurDataURL={blur}
								style={{ objectFit: 'cover' }}
							/>
						</ViewersPreviewAvatarWrap>
					);
				})}
			</ViewersPreviewAvatars>
			<ViewersPreviewCount>
				{formatStoryViewCount(count)}
			</ViewersPreviewCount>
		</ViewersPreviewWrap>
	);
}
