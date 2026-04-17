export function getInitialOpenIndex<T extends { id: string }>(
	stories: readonly T[],
	seenIds: readonly string[],
): number {
	const seen = new Set(seenIds);
	const idx = stories.findIndex((s) => !seen.has(s.id));
	return idx === -1 ? 0 : idx;
}

export type StoriesProgressResolution =
	| { type: 'unchanged' }
	| {
			type: 'next';
			nextIndex: number;
			storyIdToMark: string | undefined;
	  }
	| { type: 'complete'; storyIdToMark: string | undefined };

export function resolveStoriesProgressComplete<T extends { id: string }>(
	completedForIndex: number,
	currentIndex: number,
	stories: readonly T[],
): StoriesProgressResolution {
	if (completedForIndex !== currentIndex) {
		return { type: 'unchanged' };
	}
	const cur = stories[currentIndex];
	const storyIdToMark = cur?.id;
	if (currentIndex < stories.length - 1) {
		return { type: 'next', nextIndex: currentIndex + 1, storyIdToMark };
	}
	return { type: 'complete', storyIdToMark };
}
