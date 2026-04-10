'use client';

import {
	type RefObject,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

/** Успешно загруженные/декодированные URL (сторис, аватар). */
const decodedImageCache = new Set<string>();

function rememberDecoded(src: string | undefined): void {
	if (src) {
		decodedImageCache.add(src);
	}
}

/** Абсолютный href как у `HTMLImageElement.currentSrc` для данного `src`. */
function resolvedImageHref(src: string): string {
	try {
		return new URL(src, window.location.href).href;
	} catch {
		return src;
	}
}

function imgReadyForSrc(el: HTMLImageElement, src: string): boolean {
	if (!src || !el.complete || el.naturalWidth <= 0) {
		return false;
	}
	return el.currentSrc === resolvedImageHref(src);
}

export type StorySlidePhase = 'loading' | 'loaded' | 'error';

function initialStoryPhase(src: string): StorySlidePhase {
	if (!src) {
		return 'loading';
	}
	return decodedImageCache.has(src) ? 'loaded' : 'loading';
}

/**
 * Состояние загрузки кадра сторис по URL. Повторный src — сразу loaded (кэш).
 */
export function useStorySlidePhase(src: string): {
	phase: StorySlidePhase;
	onLoad: () => void;
	onError: () => void;
	isContentReady: boolean;
	mainImgRef: RefObject<HTMLImageElement | null>;
} {
	const [phase, setPhase] = useState<StorySlidePhase>(() =>
		initialStoryPhase(src),
	);
	const [wiredSrc, setWiredSrc] = useState(src);
	const mainImgRef = useRef<HTMLImageElement | null>(null);

	if (wiredSrc !== src) {
		setWiredSrc(src);
		setPhase(initialStoryPhase(src));
	}

	useLayoutEffect(() => {
		if (!src) {
			setPhase('loading');
			return;
		}
		if (decodedImageCache.has(src)) {
			setPhase('loaded');
			return;
		}
		const el = mainImgRef.current;
		if (el && imgReadyForSrc(el, src)) {
			rememberDecoded(src);
			setPhase('loaded');
			return;
		}
		setPhase('loading');
	}, [src]);

	const onLoad = useCallback(() => {
		rememberDecoded(src);
		setPhase('loaded');
	}, [src]);

	const onError = useCallback(() => {
		setPhase('error');
	}, []);

	return {
		phase,
		onLoad,
		onError,
		isContentReady: phase !== 'loading',
		mainImgRef,
	};
}

function initialAvatarSharp(src: string): boolean {
	return Boolean(src && decodedImageCache.has(src));
}

/**
 * Аватар: blur до decode, затем чёткое изображение. Учитывает кэш и img.complete.
 */
export function useProgressiveAvatarPhase(src: string): {
	sharp: boolean;
	onLoad: () => void;
	onError: () => void;
	imgRef: RefObject<HTMLImageElement | null>;
} {
	const [sharp, setSharp] = useState(() => initialAvatarSharp(src));
	const [wiredSrc, setWiredSrc] = useState(src);
	const imgRef = useRef<HTMLImageElement | null>(null);

	if (wiredSrc !== src) {
		setWiredSrc(src);
		setSharp(initialAvatarSharp(src));
	}

	useLayoutEffect(() => {
		if (!src) {
			setSharp(false);
			return;
		}
		if (decodedImageCache.has(src)) {
			setSharp(true);
			return;
		}
		const el = imgRef.current;
		if (el && imgReadyForSrc(el, src)) {
			rememberDecoded(src);
			setSharp(true);
			return;
		}
		setSharp(false);
	}, [src]);

	const onLoad = useCallback(() => {
		rememberDecoded(src);
		setSharp(true);
	}, [src]);

	const onError = useCallback(() => {
		setSharp(false);
	}, []);

	return { sharp, onLoad, onError, imgRef };
}
