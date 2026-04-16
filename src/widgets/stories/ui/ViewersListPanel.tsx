'use client';

import { type MotionValue } from 'framer-motion';
import Image from 'next/image';

import { getBlurDataURL } from '@/lib/getBlurDataURL';
import { Icon } from '@/shared/ui';

import { STORY_AVATAR_SRC, StoryViewRecord } from '../constants';
import { formatStoryViewCount } from '../lib/formatStoryViewCount';
import {
	CloseButton,
	ViewersListItemAvatar,
	ViewersListItemInfo,
	ViewersListItemWrap,
	ViewersPanelContent,
	ViewersPanelEmptyState,
	ViewersPanelHeader,
	ViewersPanelList,
	ViewersPanelTitle,
} from './styled';

type ViewersListPanelProps = {
	viewers: ReadonlyArray<StoryViewRecord>;
	panelY: MotionValue<number>;
	/** Управление hit-area: false когда слой зрителей визуально выключен (остаётся смонтированным). */
	interactive: boolean;
	onClose: () => void;
	onScrollStateChange?: (isScrolling: boolean) => void;
};

export function ViewersListPanel({
	viewers,
	panelY,
	interactive,
	onClose,
	onScrollStateChange,
}: ViewersListPanelProps) {
	const hasViewers = Boolean(viewers?.length);
	const count = viewers.length;

	return (
		<ViewersPanelContent
			data-viewers-interactive={interactive ? 'true' : undefined}
			style={{
				y: panelY,
				pointerEvents: interactive ? 'auto' : 'none',
				opacity: interactive ? 1 : 0,
			}}
			// When user starts touching the list, we might want to stop the drag to close viewers
			onPointerDown={(e) => {
				e.stopPropagation();
				if (onScrollStateChange) onScrollStateChange(true);
			}}
			onPointerUp={(e) => {
				e.stopPropagation();
				if (onScrollStateChange) onScrollStateChange(false);
			}}
			onPointerCancel={(e) => {
				e.stopPropagation();
				if (onScrollStateChange) onScrollStateChange(false);
			}}
		>
			<ViewersPanelHeader>
				<ViewersPanelTitle>
					{formatStoryViewCount(count)}
				</ViewersPanelTitle>
				<CloseButton
					type="button"
					aria-label="Закрыть просмотры"
					onClick={onClose}
				>
					<Icon icon="times-small" size={5} />
				</CloseButton>
			</ViewersPanelHeader>
			<ViewersPanelList>
				{hasViewers ? (
					viewers.map((viewer) => {
						const src = viewer.img || STORY_AVATAR_SRC;
						const blur = getBlurDataURL(src);

						return (
							<ViewersListItemWrap key={viewer.id}>
								<ViewersListItemAvatar>
									<Image
										src={src}
										alt={viewer.name}
										fill
										sizes="30px"
										placeholder="blur"
										blurDataURL={blur}
										style={{ objectFit: 'cover' }}
									/>
								</ViewersListItemAvatar>
								<ViewersListItemInfo>
									<strong>{viewer.name}</strong>
									<span>{viewer.date}</span>
								</ViewersListItemInfo>
							</ViewersListItemWrap>
						);
					})
				) : (
					<ViewersPanelEmptyState>
						Пока еще никто не видел эту историю
					</ViewersPanelEmptyState>
				)}
			</ViewersPanelList>
		</ViewersPanelContent>
	);
}
