'use client';

import { AnimatePresence } from 'framer-motion';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import styled from 'styled-components';

import { useBodyScrollLock } from '@/shared/lib/dom';
import {
	type ConnectedElementMotion,
	getElementRect,
} from '@/shared/lib/framer-motion';

import { STORIES_SEEN_IDS_CHANGED_EVENT } from '../constants';
import { isEditableTarget } from '../lib/isEditableTarget';
import { getStoryShellConnectedMotion } from '../lib/motion';
import {
	getInitialOpenIndex,
	resolveStoriesProgressComplete,
} from '../lib/navigation';
import { loadSeenIds, saveSeenIds } from '../lib/storage';
import { STORIES } from '../stories.data';
import { StoriesPreview } from './StoriesPreview';
import { StoriesViewer } from './StoriesViewer';

export const StoriesWidgetContainer = styled.div`
	margin: 100px 0;
`;

export function StoriesWidget() {
	const [seenIds, setSeenIds] = useState<string[]>([]);
	const [seenStorageLoaded, setSeenStorageLoaded] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	/** Смена key при каждом открытии — чистый mount сторис (pinch/layout без «наследия» с прошлой сессии). */
	const [viewerSessionKey, setViewerSessionKey] = useState(0);
	const [activeIndex, setActiveIndex] = useState(0);
	const [segmentReplayToken, setSegmentReplayToken] = useState(0);
	const handleCloseRef = useRef<() => void>(() => undefined);
	const previewTriggerRef = useRef<HTMLButtonElement>(null);
	const previewOriginRef = useRef<HTMLDivElement>(null);
	const wasOpenRef = useRef(false);
	const activeIndexRef = useRef(activeIndex);
	const [openingMotion, setOpeningMotion] =
		useState<ConnectedElementMotion | null>(null);
	activeIndexRef.current = activeIndex;
	useBodyScrollLock(isOpen);

	useLayoutEffect(() => {
		setSeenIds(loadSeenIds());
		setSeenStorageLoaded(true);
	}, []);

	useEffect(() => {
		const onSeenStorageChanged = () => {
			setSeenIds(loadSeenIds());
		};
		window.addEventListener(
			STORIES_SEEN_IDS_CHANGED_EVENT,
			onSeenStorageChanged,
		);
		return () => {
			window.removeEventListener(
				STORIES_SEEN_IDS_CHANGED_EVENT,
				onSeenStorageChanged,
			);
		};
	}, []);

	useEffect(() => {
		if (wasOpenRef.current && !isOpen) {
			queueMicrotask(() => {
				previewTriggerRef.current?.focus({ preventScroll: true });
			});
		}
		wasOpenRef.current = isOpen;
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			setOpeningMotion(null);
		}
	}, [isOpen]);

	const markSeen = useCallback((id: string) => {
		setSeenIds((prev) => {
			if (prev.includes(id)) {
				return prev;
			}
			const next = [...prev, id];
			saveSeenIds(next);
			return next;
		});
	}, []);

	const handleOpen = useCallback(() => {
		const sourceRect = getElementRect(previewOriginRef.current);

		setOpeningMotion(getStoryShellConnectedMotion(sourceRect));
		setActiveIndex(getInitialOpenIndex(STORIES, seenIds));
		setViewerSessionKey((k) => k + 1);
		setIsOpen(true);
	}, [seenIds]);

	const handleClose = useCallback(() => {
		const current = STORIES[activeIndex];
		if (current) {
			markSeen(current.id);
		}
		setIsOpen(false);
	}, [activeIndex, markSeen]);

	handleCloseRef.current = handleClose;

	const replayCurrentSegment = useCallback(() => {
		setSegmentReplayToken((t) => t + 1);
	}, []);

	const goToPreviousStory = useCallback(() => {
		if (activeIndex <= 0) {
			replayCurrentSegment();
			return;
		}
		const cur = STORIES[activeIndex];
		if (cur) {
			markSeen(cur.id);
		}
		setActiveIndex((i) => i - 1);
	}, [activeIndex, markSeen, replayCurrentSegment]);

	const goToNextStory = useCallback(() => {
		const cur = STORIES[activeIndex];
		if (cur) {
			markSeen(cur.id);
		}
		if (activeIndex >= STORIES.length - 1) {
			setIsOpen(false);
			return;
		}
		setActiveIndex((i) => i + 1);
	}, [activeIndex, markSeen]);

	const goToIndex = useCallback(
		(index: number) => {
			const cur = STORIES[activeIndex];
			if (cur) {
				markSeen(cur.id);
			}
			if (index >= 0 && index < STORIES.length) {
				setActiveIndex(index);
			}
		},
		[activeIndex, markSeen],
	);

	const handleProgressComplete = useCallback(
		(completedForIndex: number) => {
			const current = activeIndexRef.current;
			const r = resolveStoriesProgressComplete(
				completedForIndex,
				current,
				STORIES,
			);
			if (r.type === 'unchanged') {
				return;
			}
			if (r.storyIdToMark !== undefined) {
				markSeen(r.storyIdToMark);
			}
			if (r.type === 'next') {
				setActiveIndex(r.nextIndex);
				return;
			}
			setIsOpen(false);
		},
		[markSeen],
	);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		const onKey = (e: KeyboardEvent) => {
			if (isEditableTarget(e.target)) {
				return;
			}
			if (e.key === 'Escape') {
				handleCloseRef.current();
				return;
			}
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				goToPreviousStory();
				return;
			}
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				goToNextStory();
				return;
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, goToPreviousStory, goToNextStory]);

	return (
		<StoriesWidgetContainer>
			<StoriesPreview
				ref={previewTriggerRef}
				originRef={previewOriginRef}
				stories={STORIES}
				seenIds={seenIds}
				seenStorageLoaded={seenStorageLoaded}
				onOpen={handleOpen}
			/>

			<AnimatePresence>
				{isOpen ? (
					<StoriesViewer
						key={viewerSessionKey}
						stories={STORIES}
						activeIndex={activeIndex}
						segmentReplayToken={segmentReplayToken}
						openingMotion={openingMotion}
						onClose={handleClose}
						onProgressComplete={handleProgressComplete}
						onTapPrevious={goToPreviousStory}
						onTapNext={goToNextStory}
						onChangeActiveIndex={goToIndex}
						onResetSegmentTimer={replayCurrentSegment}
					/>
				) : null}
			</AnimatePresence>
		</StoriesWidgetContainer>
	);
}
