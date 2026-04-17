'use client';

import { StoriesWidget } from '@/widgets/stories';

import { Lead, Root } from './styled';

export function MainPage() {
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
			<StoriesWidget />
		</Root>
	);
}
