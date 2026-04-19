'use client';

import {
	createContext,
	type PropsWithChildren,
	useContext,
	useLayoutEffect,
	useState,
} from 'react';

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

type StoriesActiveSlideMediaValue = {
	activeSlideContentReady: boolean;
	setActiveSlideContentReady: (value: boolean) => void;
};

const StoriesActiveSlideMediaContext =
	createContext<StoriesActiveSlideMediaValue | null>(null);

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

export function useStoriesActiveSlideMedia(): StoriesActiveSlideMediaValue {
	const value = useContext(StoriesActiveSlideMediaContext);
	if (!value) {
		throw new Error(
			'useStoriesActiveSlideMedia must be used within StoriesViewerProvider',
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

	const [activeSlideContentReady, setActiveSlideContentReady] =
		useState(false);

	/* Сброс до paint: иначе один кадр с устаревшим activeSlideContentReady ломает анимацию прогресса. */
	useLayoutEffect(() => {
		setActiveSlideContentReady(false);
	}, [domain.activeIndex]);

	const activeSlideMedia: StoriesActiveSlideMediaValue = {
		activeSlideContentReady,
		setActiveSlideContentReady,
	};

	return (
		<StoriesViewerDomainContext.Provider value={domain}>
			<StoriesViewerInteractionContext.Provider value={interaction}>
				<StoriesActiveSlideMediaContext.Provider
					value={activeSlideMedia}
				>
					{children}
				</StoriesActiveSlideMediaContext.Provider>
			</StoriesViewerInteractionContext.Provider>
		</StoriesViewerDomainContext.Provider>
	);
}
