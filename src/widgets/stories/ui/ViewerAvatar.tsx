import Image from 'next/image';

import { getBlurDataURL } from '@/lib/getBlurDataURL';

import { getGradientForUserId } from '../lib/selectGradient';
import { ViewerAvatarEmpty, ViewersPreviewAvatarWrap } from './styled';

function initialsFromName(name?: string) {
	return name
		?.split(' ')
		.map((word) => word[0])
		.join('');
}

export type ViewerAvatarProps = {
	userId: string;
	name: string;
	img?: string | null;
	sizes?: string;
};

export function ViewerAvatar({
	userId,
	name,
	img,
	sizes = '30px',
}: ViewerAvatarProps) {
	const src = img?.trim();
	const hasImage = Boolean(src);

	if (hasImage) {
		const blur = getBlurDataURL(src!);
		return (
			<ViewersPreviewAvatarWrap>
				<Image
					src={src!}
					alt={name}
					fill
					sizes={sizes}
					placeholder="blur"
					blurDataURL={blur}
				/>
			</ViewersPreviewAvatarWrap>
		);
	}

	return (
		<ViewersPreviewAvatarWrap>
			<ViewerAvatarEmpty $gradient={getGradientForUserId(userId)}>
				{initialsFromName(name)}
			</ViewerAvatarEmpty>
		</ViewersPreviewAvatarWrap>
	);
}
