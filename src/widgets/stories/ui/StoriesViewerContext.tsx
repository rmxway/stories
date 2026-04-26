'use client';

import {
	createContext,
	type PropsWithChildren,
	useContext,
	useLayoutEffect,
	useMemo,
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

/** Локальные флаги вьювера: готовность контента слайда и pinch по рельсу превью. */
export type StoriesViewerSessionValue = {
	activeSlideContentReady: boolean;
	setActiveSlideContentReady: (value: boolean) => void;
	railPinchActive: boolean;
	setRailPinchActive: (active: boolean) => void;
};

const StoriesViewerSessionContext =
	createContext<StoriesViewerSessionValue | null>(null);

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

export function useStoriesViewerSession(): StoriesViewerSessionValue {
	const value = useContext(StoriesViewerSessionContext);
	if (!value) {
		throw new Error(
			'useStoriesViewerSession must be used within StoriesViewerProvider',
		);
	}
	return value;
}

type StoriesViewerProviderProps = PropsWithChildren<StoriesViewerDomainValue>;

export function StoriesViewerProvider({
	children,
	...domain
}: StoriesViewerProviderProps) {
	const [railPinchActive, setRailPinchActive] = useState(false);

	const interaction = useStoryViewerInteractions({
		activeIndex: domain.activeIndex,
		onClose: domain.onClose,
		onTapPrevious: domain.onTapPrevious,
		onTapNext: domain.onTapNext,
		railPinchActive,
	});

	const [activeSlideContentReady, setActiveSlideContentReady] =
		useState(false);

	/* Сброс до paint: иначе один кадр с устаревшим activeSlideContentReady ломает анимацию прогресса. */
	useLayoutEffect(() => {
		setActiveSlideContentReady(false);
	}, [domain.activeIndex]);

	const session: StoriesViewerSessionValue = useMemo(
		() => ({
			activeSlideContentReady,
			setActiveSlideContentReady,
			railPinchActive,
			setRailPinchActive,
		}),
		[activeSlideContentReady, railPinchActive],
	);

	return (
		<StoriesViewerDomainContext.Provider value={domain}>
			<StoriesViewerInteractionContext.Provider value={interaction}>
				<StoriesViewerSessionContext.Provider value={session}>
					{children}
				</StoriesViewerSessionContext.Provider>
			</StoriesViewerInteractionContext.Provider>
		</StoriesViewerDomainContext.Provider>
	);
}
