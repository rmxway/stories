import type { MouseEvent, RefObject } from 'react';

export function runTapIfNotSuppressed(
	e: MouseEvent<HTMLButtonElement>,
	suppressRef: RefObject<boolean>,
	action: () => void,
): void {
	if (suppressRef.current) {
		suppressRef.current = false;
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	action();
}
