'use client';

import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import { STORIES } from '../constants';
import { loadSeenIds, saveSeenIds } from '../lib/storiesStorage';
import { StoriesPreview } from './StoriesPreview';
import { StoriesViewer } from './StoriesViewer';

export function StoriesWidget() {
	const [seenIds, setSeenIds] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const handleCloseRef = useRef<() => void>(() => undefined);

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
		if (!isOpen) {
			return;
		}
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				handleCloseRef.current();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
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

	const handleTapPrevious = useCallback(() => {
		if (activeIndex <= 0) {
			handleClose();
			return;
		}
		const cur = STORIES[activeIndex];
		if (cur) {
			markSeen(cur.id);
		}
		setActiveIndex((i) => i - 1);
	}, [activeIndex, handleClose, markSeen]);

	const handleTapNext = useCallback(() => {
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

	return (
		<LayoutGroup>
			{!isOpen && (
				<StoriesPreview
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
						onClose={handleClose}
						onProgressComplete={handleProgressComplete}
						onTapPrevious={handleTapPrevious}
						onTapNext={handleTapNext}
					/>
				) : null}
			</AnimatePresence>
		</LayoutGroup>
	);
}
