import { type ValueTransition } from 'motion-dom';
/** Единый transition для открытия/закрытия режима зрителей без резкого добегания. */
export const VIEWERS_CHROME_OPEN_SPRING = {
	type: 'tween',
	duration: 0.22,
	ease: 'easeInOut',
} as const satisfies ValueTransition;

/** Верхняя граница жеста (полностью поднятый список + рельс). */
export const SWIPE_UP_DRAG_MAX_PX = -500;

/**
 * Режим миниатюр: базовая точка между «сторис» и «список развёрнут».
 * Должна совпадать с половиной диапазона открытия превью (см. swipeUpOpenProgress).
 */
export const SWIPE_UP_THUMBNAILS_PX = SWIPE_UP_DRAG_MAX_PX / 2;

/**
 * Доля высоты viewport для подъёма рельса миниатюр при expanded (параллельно росту панели).
 */
export const VIEWERS_EXPAND_THUMB_RAIL_VIEWPORT_RATIO = 0.5;
