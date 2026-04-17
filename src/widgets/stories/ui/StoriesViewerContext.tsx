'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

import { type StoryItem } from '../constants';
import { useStoryViewerInteractions } from '../lib/gestures';

/** Навигация, данные сторис и коллбеки из `StoriesWidget` — не зависят от жестов/анимаций. */
export type StoriesViewerDomainValue = {
	stories: readonly StoryItem[];
	activeIndex: number;
	segmentReplayToken: number;
	onClose: () => void;
	onProgressComplete: (segmentIndex: number) => void;
	onTapPrevious: () => void;
	onTapNext: () => void;
	onChangeActiveIndex: (index: number) => void;
	onResetSegmentTimer: () => void;
};

export type StoriesViewerInteractionValue = ReturnType<
	typeof useStoryViewerInteractions
>;

const StoriesViewerDomainContext =
	createContext<StoriesViewerDomainValue | null>(null);
const StoriesViewerInteractionContext =
	createContext<StoriesViewerInteractionValue | null>(null);

export function useStoriesViewerDomain(): StoriesViewerDomainValue {
	const value = useContext(StoriesViewerDomainContext);
	if (!value) {
		throw new Error(
			'useStoriesViewerDomain must be used within StoriesViewerProvider',
		);
	}
	return value;
}

export function useStoriesViewerInteraction(): StoriesViewerInteractionValue {
	const value = useContext(StoriesViewerInteractionContext);
	if (!value) {
		throw new Error(
			'useStoriesViewerInteraction must be used within StoriesViewerProvider',
		);
	}
	return value;
}

type StoriesViewerProviderProps = PropsWithChildren<StoriesViewerDomainValue>;

export function StoriesViewerProvider({
	children,
	...domain
}: StoriesViewerProviderProps) {
	const interaction = useStoryViewerInteractions({
		activeIndex: domain.activeIndex,
		onClose: domain.onClose,
		onTapPrevious: domain.onTapPrevious,
		onTapNext: domain.onTapNext,
	});

	return (
		<StoriesViewerDomainContext.Provider value={domain}>
			<StoriesViewerInteractionContext.Provider value={interaction}>
				{children}
			</StoriesViewerInteractionContext.Provider>
		</StoriesViewerDomainContext.Provider>
	);
}
