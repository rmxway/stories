export const VIEWERS_INTERACTIVE_ATTR = 'data-viewers-interactive';

export function isInsideViewersInteractiveTarget(
	target: EventTarget | null,
): boolean {
	return target instanceof Element
		? Boolean(target.closest(`[${VIEWERS_INTERACTIVE_ATTR}="true"]`))
		: false;
}
