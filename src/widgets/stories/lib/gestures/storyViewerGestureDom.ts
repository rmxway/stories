export const VIEWERS_INTERACTIVE_ATTR = 'data-viewers-interactive';
export const STORIES_THUMB_STRIP_ATTR = 'data-stories-thumbnail-strip';

export function isInsideViewersInteractiveTarget(
	target: EventTarget | null,
): boolean {
	return target instanceof Element
		? Boolean(target.closest(`[${VIEWERS_INTERACTIVE_ATTR}="true"]`))
		: false;
}

export function isInsideStoriesThumbnailStrip(
	target: EventTarget | null,
): boolean {
	return target instanceof Element
		? Boolean(target.closest(`[${STORIES_THUMB_STRIP_ATTR}="true"]`))
		: false;
}
