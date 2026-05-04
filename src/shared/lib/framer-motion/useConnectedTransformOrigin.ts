'use client';

export type ConnectedElementRect = {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
};

export type ConnectedElementMotion = {
	readonly x: number;
	readonly y: number;
	readonly scale: number;
};

function centerAndSizeFromClientRect(
	bounds: DOMRectReadOnly,
): ConnectedElementRect {
	return {
		x: bounds.left + bounds.width / 2,
		y: bounds.top + bounds.height / 2,
		width: bounds.width,
		height: bounds.height,
	};
}

/** Центр и размеры в координатах viewport (`getBoundingClientRect`). Учитывает любой скролл документа и предков. */
export function getElementRect(
	element: HTMLElement | null,
): ConnectedElementRect | null {
	if (!element) {
		return null;
	}

	return centerAndSizeFromClientRect(element.getBoundingClientRect());
}

export function getConnectedElementMotionFromRects(
	sourceRect: ConnectedElementRect,
	targetRect: ConnectedElementRect,
): ConnectedElementMotion {
	const targetWidth = Math.max(targetRect.width, 1);
	const targetHeight = Math.max(targetRect.height, 1);
	const scale = Math.min(
		sourceRect.width / targetWidth,
		sourceRect.height / targetHeight,
		1,
	);

	return {
		x: sourceRect.x - targetRect.x,
		y: sourceRect.y - targetRect.y,
		scale,
	};
}
