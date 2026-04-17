'use client';

import {
	useStoriesViewerDomain,
	useStoriesViewerInteraction,
} from './StoriesViewerContext';
import { StoriesViewersModeRoot } from './styled';
import { ViewersListPanel } from './ViewersListPanel';

export function StoriesViewersMode() {
	const { stories, activeIndex } = useStoriesViewerDomain();
	const {
		panelY,
		panelHeightPx,
		isViewersMode,
		isVerticalSwipeUpActive,
		isVerticalSwipeDownCloseActive,
		viewersStage,
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
				panelHeightPx={panelHeightPx}
				interactive={chromeInteractive}
				lockVerticalTouch={
					viewersStage === 'thumbnails' || viewersStage === 'expanded'
				}
				onClose={closeViewersMode}
			/>
		</StoriesViewersModeRoot>
	);
}
