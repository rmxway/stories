'use client';

import { useSyncExternalStore } from 'react';

import { Button } from '@/shared/ui';
import { StoriesWidget } from '@/widgets/stories';
import { STORIES_SEEN_IDS_CHANGED_EVENT } from '@/widgets/stories/constants';
import { clearSeenIds, loadSeenIds } from '@/widgets/stories/lib/storage';

import { Lead, Root } from './styled';

function subscribeSeenStorage(onStoreChange: () => void) {
	if (typeof window === 'undefined') {
		return () => undefined;
	}
	window.addEventListener(STORIES_SEEN_IDS_CHANGED_EVENT, onStoreChange);
	return () => {
		window.removeEventListener(
			STORIES_SEEN_IDS_CHANGED_EVENT,
			onStoreChange,
		);
	};
}

function getSeenStorageHasEntries(): boolean {
	return loadSeenIds().length > 0;
}

export function MainPage() {
	const hasSeenEntries = useSyncExternalStore(
		subscribeSeenStorage,
		getSeenStorageHasEntries,
		() => false,
	);

	return (
		<Root>
			<h1>Stories</h1>
			<Lead>
				Демо в духе Telegram Stories: превью-кольца, полноэкранный
				просмотр, жесты и анимации на Framer Motion, прогресс по
				сегментам и сохранение «просмотренных» в{' '}
				<code>localStorage</code>. Структура кода близка к
				Feature-Sliced Design: <code>app</code>, <code>screens</code>,{' '}
				<code>widgets/stories</code>, <code>shared</code>,{' '}
				<code>theme</code>.
			</Lead>
			<Button
				$icon="trash"
				$iconPosition="right"
				$size="medium"
				$variant="primary"
				onClick={() => clearSeenIds()}
				disabled={!hasSeenEntries}
			>
				Очистить просмотры
			</Button>
			<br />
			<br />
			<StoriesWidget />
		</Root>
	);
}
