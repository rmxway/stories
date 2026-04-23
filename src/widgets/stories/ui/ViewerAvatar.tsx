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
	isAvatar?: boolean;
};

export function ViewerAvatar({
	userId,
	name,
	img,
	sizes = '30px',
	isAvatar = false,
}: ViewerAvatarProps) {
	const src = img?.trim();
	const hasImage = Boolean(src);

	if (hasImage) {
		const blur = getBlurDataURL(src!);
		return (
			<ViewersPreviewAvatarWrap $isAvatar={isAvatar}>
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
		<ViewersPreviewAvatarWrap $isAvatar={isAvatar}>
			<ViewerAvatarEmpty $gradient={getGradientForUserId(userId)}>
				{initialsFromName(name)}
			</ViewerAvatarEmpty>
		</ViewersPreviewAvatarWrap>
	);
}
