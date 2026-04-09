'use client';

import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import { STORIES } from '../constants';
import { loadSeenIds, saveSeenIds } from '../lib/storiesStorage';
import { StoriesPreview } from './StoriesPreview';
import { StoriesViewer } from './StoriesViewer';

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) {
		return false;
	}
	return Boolean(
		target.closest(
			'input, textarea, select, [contenteditable="true"], [contenteditable=""]',
		),
	);
}

export function StoriesWidget() {
	const [seenIds, setSeenIds] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const [segmentReplayToken, setSegmentReplayToken] = useState(0);
	const handleCloseRef = useRef<() => void>(() => undefined);
	const previewTriggerRef = useRef<HTMLButtonElement>(null);
	const wasOpenRef = useRef(false);

	useEffect(() => {
		setSeenIds(loadSeenIds());
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	}, [isOpen]);

	useEffect(() => {
		if (wasOpenRef.current && !isOpen) {
			queueMicrotask(() => {
				previewTriggerRef.current?.focus();
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
		const firstUnseen = STORIES.findIndex((s) => !seenIds.includes(s.id));
		setActiveIndex(firstUnseen === -1 ? 0 : firstUnseen);
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

	const handleProgressComplete = useCallback(
		(completedForIndex: number) => {
			setActiveIndex((current) => {
				if (completedForIndex !== current) {
					return current;
				}
				const cur = STORIES[current];
				if (cur) {
					markSeen(cur.id);
				}
				if (current < STORIES.length - 1) {
					return current + 1;
				}
				queueMicrotask(() => setIsOpen(false));
				return current;
			});
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
					onOpen={handleOpen}
				/>
			)}
			<AnimatePresence>
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
					/>
				) : null}
			</AnimatePresence>
		</LayoutGroup>
	);
}
