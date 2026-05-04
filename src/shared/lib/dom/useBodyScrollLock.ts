'use client';

import { useLayoutEffect } from 'react';

type BodyScrollLockSnapshot = {
	readonly scrollY: number;
	readonly overflow: string;
	readonly position: string;
	readonly top: string;
	readonly width: string;
	readonly paddingRight: string;
};

let activeBodyScrollLocks = 0;
let bodyScrollLockSnapshot: BodyScrollLockSnapshot | null = null;

function lockBodyScroll() {
	if (activeBodyScrollLocks === 0) {
		const { body } = document;
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth;
		const computedBodyStyle = window.getComputedStyle(body);
		const paddingRight = parseFloat(computedBodyStyle.paddingRight) || 0;

		bodyScrollLockSnapshot = {
			scrollY: window.scrollY,
			overflow: body.style.overflow,
			position: body.style.position,
			top: body.style.top,
			width: body.style.width,
			paddingRight: body.style.paddingRight,
		};

		body.style.overflow = 'hidden';
		body.style.position = 'fixed';
		body.style.top = `-${bodyScrollLockSnapshot.scrollY}px`;
		body.style.width = '100%';

		if (scrollbarWidth > 0) {
			body.style.paddingRight = `${paddingRight + scrollbarWidth}px`;
		}
	}

	activeBodyScrollLocks += 1;
}

function unlockBodyScroll() {
	activeBodyScrollLocks = Math.max(activeBodyScrollLocks - 1, 0);

	if (activeBodyScrollLocks > 0 || !bodyScrollLockSnapshot) {
		return;
	}

	const { body } = document;
	const { scrollY, overflow, position, top, width, paddingRight } =
		bodyScrollLockSnapshot;

	body.style.overflow = overflow;
	body.style.position = position;
	body.style.top = top;
	body.style.width = width;
	body.style.paddingRight = paddingRight;
	bodyScrollLockSnapshot = null;
	window.scrollTo(0, scrollY);
}

export function useBodyScrollLock(locked: boolean) {
	useLayoutEffect(() => {
		if (!locked) {
			return;
		}

		lockBodyScroll();

		return () => {
			unlockBodyScroll();
		};
	}, [locked]);
}
