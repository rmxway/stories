'use client';

import { motion } from 'framer-motion';
import {
	type MouseEvent,
	type PointerEvent,
	type RefObject,
	useCallback,
	useRef,
	useState,
} from 'react';

import { Icon } from '@/shared/ui';

import type { StoryItem } from '../constants';
import { StoriesProgress } from './StoriesProgress';
import {
	CloseButton,
	Overlay,
	StoryImage,
	StoryImageInner,
	StoryImageWrap,
	StoryShell,
	StoryTapZone,
} from './styled';

const MotionOverlay = motion(Overlay);
const MotionStoryShell = motion(StoryShell);

/** После такого удержания отпускание не должно вызывать переход по клику на зонах влево/вправо */
const HOLD_SUPPRESS_CLICK_MS = 200;

const getNow = (): number =>
	typeof performance !== 'undefined' ? performance.now() : Date.now();

function runStoryTapZoneIfNotSuppressed(
	e: MouseEvent<HTMLButtonElement>,
	suppressRef: RefObject<boolean | null>,
	action: () => void,
): void {
	if (suppressRef.current) {
		suppressRef.current = false;
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	action();
}

type StoriesViewerProps = {
	stories: readonly StoryItem[];
	activeIndex: number;
	onClose: () => void;
	onProgressComplete: (segmentIndex: number) => void;
	onTapPrevious: () => void;
	onTapNext: () => void;
};

export function StoriesViewer({
	stories,
	activeIndex,
	onClose,
	onProgressComplete,
	onTapPrevious,
	onTapNext,
}: StoriesViewerProps) {
	const story = stories[activeIndex];
	const [holdPaused, setHoldPaused] = useState(false);
	const holdStartedAtRef = useRef(0);
	const suppressTapClickRef = useRef(false);

	const handlePointerDownShell = useCallback(
		(e: PointerEvent<HTMLDivElement>) => {
			suppressTapClickRef.current = false;
			holdStartedAtRef.current = getNow();
			setHoldPaused(true);
			/* Не захватываем указатель, если нажали на кнопку зоны тапа — иначе pointerup
			 * уйдёт на shell и click на кнопке не сработает. */
			const t = e.target;
			if (t instanceof Element && t.closest('button')) {
				return;
			}
			e.currentTarget.setPointerCapture(e.pointerId);
		},
		[],
	);

	const handlePointerEndShell = useCallback(() => {
		const elapsed = getNow() - holdStartedAtRef.current;
		if (elapsed >= HOLD_SUPPRESS_CLICK_MS) {
			suppressTapClickRef.current = true;
		}
		setHoldPaused(false);
	}, []);

	const handleTapPreviousGuarded = useCallback(
		(e: MouseEvent<HTMLButtonElement>) =>
			runStoryTapZoneIfNotSuppressed(
				e,
				suppressTapClickRef,
				onTapPrevious,
			),
		[onTapPrevious],
	);

	const handleTapNextGuarded = useCallback(
		(e: MouseEvent<HTMLButtonElement>) =>
			runStoryTapZoneIfNotSuppressed(e, suppressTapClickRef, onTapNext),
		[onTapNext],
	);

	const handleOverlayClick = useCallback(
		(e: MouseEvent<HTMLDivElement>) => {
			if (e.target === e.currentTarget) {
				onClose();
			}
		},
		[onClose],
	);

	if (!story) {
		return null;
	}

	return (
		<MotionOverlay
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			onClick={handleOverlayClick}
		>
			<CloseButton type="button" aria-label="Закрыть" onClick={onClose}>
				<Icon icon="times-small" size={22} />
			</CloseButton>
			<MotionStoryShell
				layoutId="stories-shell"
				transition={{ type: 'spring', damping: 26, stiffness: 320 }}
				onPointerDown={handlePointerDownShell}
				onPointerUp={handlePointerEndShell}
				onPointerCancel={handlePointerEndShell}
			>
				<StoriesProgress
					count={stories.length}
					activeIndex={activeIndex}
					holdPaused={holdPaused}
					onSegmentComplete={onProgressComplete}
				/>
				<StoryImageWrap>
					<StoryImageInner>
						<StoryImage src={story.src} alt="" />
						<StoryTapZone
							type="button"
							aria-label="Предыдущий сторис"
							$side="left"
							onClick={handleTapPreviousGuarded}
						/>
						<StoryTapZone
							type="button"
							aria-label="Следующий сторис"
							$side="right"
							onClick={handleTapNextGuarded}
						/>
					</StoryImageInner>
				</StoryImageWrap>
			</MotionStoryShell>
		</MotionOverlay>
	);
}
