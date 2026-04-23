'use client';

import { type MotionValue } from 'framer-motion';

import { Icon } from '@/shared/ui';

import { StoryViewRecord } from '../constants';
import { formatStoryViewCount } from '../lib/formatStoryViewCount';
import {
	CloseButton,
	ViewersListItemInfo,
	ViewersListItemWrap,
	ViewersPanelContent,
	ViewersPanelEmptyState,
	ViewersPanelHeader,
	ViewersPanelList,
	ViewersPanelTitle,
} from './styled';
import { ViewerAvatar } from './ViewerAvatar';

type ViewersListPanelProps = {
	viewers: ReadonlyArray<StoryViewRecord>;
	panelY: MotionValue<number>;
	panelHeightPx: MotionValue<number>;
	/** Управление hit-area: false когда слой зрителей визуально выключен (остаётся смонтированным). */
	interactive: boolean;
	/**
	 * Отключаем нативный вертикальный тач на панели (thumbnails / expanded),
	 * чтобы жесты shell (вверх/вниз по режиму зрителей) не перехватывал скролл списка.
	 */
	lockVerticalTouch: boolean;
	onClose: () => void;
};

export function ViewersListPanel({
	viewers,
	panelY,
	panelHeightPx,
	interactive,
	lockVerticalTouch,
	onClose,
}: ViewersListPanelProps) {
	const hasViewers = Boolean(viewers?.length);
	const count = viewers.length;

	return (
		<ViewersPanelContent
			$lockVerticalTouch={lockVerticalTouch}
			data-viewers-interactive={interactive ? 'true' : undefined}
			style={{
				y: panelY,
				height: panelHeightPx,
				pointerEvents: interactive ? 'auto' : 'none',
				opacity: interactive ? 1 : 0,
			}}
			onPointerDown={(e) => {
				e.stopPropagation();
			}}
			onPointerUp={(e) => {
				e.stopPropagation();
			}}
			onPointerCancel={(e) => {
				e.stopPropagation();
			}}
		>
			<ViewersPanelHeader>
				<ViewersPanelTitle>
					{count ? (
						<span>
							{count} {formatStoryViewCount(count)}
						</span>
					) : (
						'Нет просмотров'
					)}
					<CloseButton
						type="button"
						aria-label="Закрыть просмотры"
						onClick={onClose}
					>
						<Icon icon="times-small" size={5} />
					</CloseButton>
				</ViewersPanelTitle>
			</ViewersPanelHeader>
			<ViewersPanelList $lockVerticalTouch={lockVerticalTouch}>
				{hasViewers ? (
					viewers.map((viewer) => (
						<ViewersListItemWrap key={viewer.id}>
							<ViewerAvatar
								img={viewer.img}
								name={viewer.name}
								userId={viewer.id}
								isAvatar
							/>
							<ViewersListItemInfo>
								<strong>{viewer.name}</strong>
								<span>{viewer.date}</span>
							</ViewersListItemInfo>
						</ViewersListItemWrap>
					))
				) : (
					<ViewersPanelEmptyState>
						Пока еще никто не видел эту историю
					</ViewersPanelEmptyState>
				)}
			</ViewersPanelList>
		</ViewersPanelContent>
	);
}
