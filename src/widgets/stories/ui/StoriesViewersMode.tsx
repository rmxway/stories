'use client';

import {
	useStoriesViewerDomain,
	useStoriesViewerInteraction,
} from './StoriesViewerContext';
import { StoriesViewersModeRoot } from './styled';
import { ViewersListPanel } from './ViewersListPanel';

type StoriesViewersModeProps = {
	onScrollStateChange?: (isScrolling: boolean) => void;
};

export function StoriesViewersMode({
	onScrollStateChange,
}: StoriesViewersModeProps) {
	const { stories, activeIndex } = useStoriesViewerDomain();
	const {
		panelY,
		isViewersMode,
		isVerticalSwipeUpActive,
		isVerticalSwipeDownCloseActive,
		closeViewersMode,
	} = useStoriesViewerInteraction();

	const currentStory = stories[activeIndex];
	const chromeInteractive =
		isViewersMode ||
		isVerticalSwipeUpActive ||
		isVerticalSwipeDownCloseActive;

	return (
		<StoriesViewersModeRoot>
			<ViewersListPanel
				viewers={currentStory?.viewers || []}
				panelY={panelY}
				interactive={chromeInteractive}
				onClose={closeViewersMode}
				onScrollStateChange={onScrollStateChange}
			/>
		</StoriesViewersModeRoot>
	);
}
