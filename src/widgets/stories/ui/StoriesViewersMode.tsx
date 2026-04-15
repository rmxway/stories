'use client';

import { type MotionValue } from 'framer-motion';

import { StoryItem } from '../constants';
import { StoriesThumbnailsSlider } from './StoriesThumbnailsSlider';
import { StoriesViewersModeRoot } from './styled';
import { ViewersListPanel } from './ViewersListPanel';

type StoriesViewersModeProps = {
	stories: readonly StoryItem[];
	activeIndex: number;
	panelY: MotionValue<number>;
	/** Непрозрачность слоя (слайдер + панель), синхронна с `previewOpacity` основного сториса. */
	layerOpacity: MotionValue<number>;
	/** `transform: scale(...)` — тот же жест, что и `layerOpacity` (0.5 → 1). */
	layerTransform: MotionValue<string>;
	isViewersMode: boolean;
	isVerticalSwipeUpActive: boolean;
	/** Свайп вниз, чтобы закрыть режим зрителей — панель следует за panelY, как при открытии. */
	isVerticalSwipeDownCloseActive: boolean;
	onChangeActiveIndex: (index: number) => void;
	onCloseViewersMode: () => void;
	onScrollStateChange?: (isScrolling: boolean) => void;
};

export function StoriesViewersMode({
	stories,
	activeIndex,
	panelY,
	layerOpacity,
	layerTransform,
	isViewersMode,
	isVerticalSwipeUpActive,
	isVerticalSwipeDownCloseActive,
	onChangeActiveIndex,
	onCloseViewersMode,
	onScrollStateChange,
}: StoriesViewersModeProps) {
	const currentStory = stories[activeIndex];
	const chromeInteractive =
		isViewersMode ||
		isVerticalSwipeUpActive ||
		isVerticalSwipeDownCloseActive;

	return (
		<StoriesViewersModeRoot
			initial={false}
			style={{ opacity: layerOpacity, transform: layerTransform }}
		>
			<StoriesThumbnailsSlider
				stories={stories}
				activeIndex={activeIndex}
				interactive={chromeInteractive}
				onChangeActiveIndex={onChangeActiveIndex}
				onCloseViewersMode={onCloseViewersMode}
			/>
			<ViewersListPanel
				viewers={currentStory?.viewers || []}
				panelY={panelY}
				interactive={chromeInteractive}
				onScrollStateChange={onScrollStateChange}
			/>
		</StoriesViewersModeRoot>
	);
}
