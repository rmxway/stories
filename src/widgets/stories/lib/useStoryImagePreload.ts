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

/**
 * Состояние загрузки кадра сторис.
 * Не используем `decodedImageCache` для фазы: по сессии URL мог «быть в кэше», но
 * реально кадр ещё тянется / LQIP — таймер должен ждать `onLoad` или `img.complete`.
 */
export function useStorySlidePhase(src: string): {
	phase: StorySlidePhase;
	onLoad: () => void;
	onError: () => void;
	isContentReady: boolean;
	mainImgRef: RefObject<HTMLImageElement | null>;
} {
	const [phase, setPhase] = useState<StorySlidePhase>('loading');
	const [wiredSrc, setWiredSrc] = useState(src);
	const mainImgRef = useRef<HTMLImageElement | null>(null);

	if (wiredSrc !== src) {
		setWiredSrc(src);
		setPhase('loading');
	}

	useLayoutEffect(() => {
		if (!src) {
			setPhase('loading');
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

/**
 * Аватар: кэш decode + ref для `next/image`. LQIP — через `placeholder="blur"`.
 */
export function useProgressiveAvatarPhase(src: string): {
	onLoad: () => void;
	onError: () => void;
	imgRef: RefObject<HTMLImageElement | null>;
} {
	const [wiredSrc, setWiredSrc] = useState(src);
	const imgRef = useRef<HTMLImageElement | null>(null);

	if (wiredSrc !== src) {
		setWiredSrc(src);
	}

	useLayoutEffect(() => {
		if (!src) {
			return;
		}
		if (decodedImageCache.has(src)) {
			return;
		}
		const el = imgRef.current;
		if (el && imgReadyForSrc(el, src)) {
			rememberDecoded(src);
		}
	}, [src]);

	const onLoad = useCallback(() => {
		rememberDecoded(src);
	}, [src]);

	const onError = useCallback(() => {}, []);

	return { onLoad, onError, imgRef };
}
