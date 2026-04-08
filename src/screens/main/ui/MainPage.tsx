'use client';

import { Lead, Root } from './styled';

export function MainPage() {
	return (
		<Root>
			<h1>Stories</h1>
			<Lead>
				Приложение которое реализует идею сторисов в телеграмме,
				основанное по принципу Feature-Sliced Design:
				<br />
				<code>app</code>, <code>screens</code>, далее —{' '}
				<code>widgets</code>, <code>features</code>,{' '}
				<code>entities</code>, <code>shared</code>.
			</Lead>
		</Root>
	);
}
