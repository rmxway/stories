/**
 * Константы анимации и геометрии жеста «режим зрителей» (Framer Motion + swipeUpDragY).
 */

/**
 * Единый transition для `animate(swipeUpDragY)` и shared layout (layoutId):
 * открытие/закрытие режима зрителей должно идти одной и той же кривой без резкого добегания.
 */
export const VIEWERS_CHROME_OPEN_SPRING = {
	type: 'tween' as const,
	duration: 0.4,
	ease: 'easeInOut' as const,
} as const;

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

export const STORIES_SLIDER_LAYOUT_TRANSITION = {
	layout: VIEWERS_CHROME_OPEN_SPRING,
} as const;
