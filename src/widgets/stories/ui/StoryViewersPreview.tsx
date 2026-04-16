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
	onClick: () => void;
};

export function StoryViewersPreview({ viewers, opacity, onClick }: Props) {
	const hasViewers = Boolean(!viewers || viewers.length === 0);
	const topViewers = viewers.slice(0, 3);
	const count = viewers.length;

	return (
		<ViewersPreviewWrap
			data-viewers-interactive="true"
			role="button"
			tabIndex={0}
			style={{ opacity }}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onClick();
				}
			}}
		>
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
				{hasViewers ? (
					<>Нет просмотров</>
				) : (
					formatStoryViewCount(count)
				)}
			</ViewersPreviewCount>
		</ViewersPreviewWrap>
	);
}
