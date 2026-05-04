'use client';

import {
	type ConnectedElementMotion,
	type ConnectedElementRect,
	getConnectedElementMotionFromRects,
} from '@/shared/lib/framer-motion';
import {
	STORY_SHELL_HEIGHT_OVER_WIDTH,
	STORY_SHELL_MIN_WIDTH_PX,
} from '@/widgets/stories/constants';

function getProjectedStoryShellRect(): ConnectedElementRect {
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;
	const width = Math.max(
		Math.min(viewportWidth, viewportHeight / STORY_SHELL_HEIGHT_OVER_WIDTH),
		STORY_SHELL_MIN_WIDTH_PX,
	);
	const height = width * STORY_SHELL_HEIGHT_OVER_WIDTH;

	return {
		x: viewportWidth / 2,
		y: viewportHeight / 2,
		width,
		height,
	};
}

export function getStoryShellConnectedMotion(
	sourceRect: ConnectedElementRect | null,
): ConnectedElementMotion | null {
	if (!sourceRect) {
		return null;
	}

	return getConnectedElementMotionFromRects(
		sourceRect,
		getProjectedStoryShellRect(),
	);
}
