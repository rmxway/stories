'use client';

import { LayoutGroup } from 'framer-motion';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

import { isEditableTarget } from '../lib/isEditableTarget';
import {
	getInitialOpenIndex,
	resolveStoriesProgressComplete,
} from '../lib/navigation';
import { loadSeenIds, saveSeenIds } from '../lib/storage';
import { STORIES } from '../stories.data';
import { StoriesPreview } from './StoriesPreview';
import { StoriesViewer } from './StoriesViewer';

export function StoriesWidget() {
	const [seenIds, setSeenIds] = useState<string[]>([]);
	const [seenStorageLoaded, setSeenStorageLoaded] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [segmentReplayToken, setSegmentReplayToken] = useState(0);
	const handleCloseRef = useRef<() => void>(() => undefined);
	const previewTriggerRef = useRef<HTMLButtonElement>(null);
	const wasOpenRef = useRef(false);
	const activeIndexRef = useRef(activeIndex);
	activeIndexRef.current = activeIndex;

	useLayoutEffect(() => {
		setSeenIds(loadSeenIds());
		setSeenStorageLoaded(true);
	}, []);

	useEffect(() => {
		if (wasOpenRef.current && !isOpen) {
			queueMicrotask(() => {
				previewTriggerRef.current?.focus({ preventScroll: true });
			});
		}
		wasOpenRef.current = isOpen;
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
		setActiveIndex(getInitialOpenIndex(STORIES, seenIds));
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
		<LayoutGroup>
			{!isOpen && (
				<StoriesPreview
					ref={previewTriggerRef}
					stories={STORIES}
					seenIds={seenIds}
					seenStorageLoaded={seenStorageLoaded}
					onOpen={handleOpen}
				/>
			)}

			{isOpen ? (
				<StoriesViewer
					key="stories-viewer"
					stories={STORIES}
					activeIndex={activeIndex}
					segmentReplayToken={segmentReplayToken}
					onClose={handleClose}
					onProgressComplete={handleProgressComplete}
					onTapPrevious={goToPreviousStory}
					onTapNext={goToNextStory}
					onChangeActiveIndex={goToIndex}
					onResetSegmentTimer={replayCurrentSegment}
				/>
			) : null}
		</LayoutGroup>
	);
}
