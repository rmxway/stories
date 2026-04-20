import {
	SWIPE_UP_DRAG_MAX_PX,
	SWIPE_UP_THUMBNAILS_PX,
} from '../motion/storyViewerMotionConstants';

/** Вертикальное смещение при свайпе вниз для закрытия (≥ 0). */
export const DISMISS_DRAG_MAX_PX = 320;
export const DISMISS_CLOSE_DISTANCE_PX = 110;
export const DISMISS_CLOSE_VELOCITY_PX_S = 420;
export const VIEWERS_CHROME_SCALE_MIN = 0.8;
export const VIEWERS_CHROME_SCALE_MAX = 1;
export const SWIPE_UP_OPEN_DISTANCE_PX = -150;
export const SWIPE_UP_OPEN_VELOCITY_PX_S = -320;

/** Порог начала жеста; вертикаль вверх/вниз используют одинаковое доминирование над горизонталью. */
export const GESTURE_AXIS_LOCK_PX = 10;
export const VERTICAL_DOMINANCE_OVER_HORIZONTAL = 0.92;
/** Свайп вниз с трека миниатюр даёт больше dx — не отменяем жест, если уже явно тянем вниз. */
export const HORIZONTAL_CANCEL_MIN_PX = 18;
export const SHELL_MIN_SCALE = 0.92;
export const OVERLAY_BASE_OPACITY = 1;
export const OVERLAY_DIMMEST_OPACITY = 0.34;

export const HOLD_SUPPRESS_CLICK_MS = 200;

/** Рельс миниатюр: как в shell при фиксации вертикали. */
export const STRIP_VERTICAL_OVER_HORIZONTAL = 0.92;
export const STRIP_HORIZONTAL_DOMINANCE = 1.08;
export const STRIP_AXIS_LOCK_MIN_PX = 12;
/** Свайп вниз по полосе миниатюр для выхода из режима зрителей (px). */
export const STRIP_SWIPE_DOWN_CLOSE_MIN_PX = 48;

/** Между story и thumbnails (середина 0 … SWIPE_UP_THUMBNAILS_PX). */
export const MID_SNAP_STORY_THUMB_PX = SWIPE_UP_THUMBNAILS_PX / 2;
/** Между thumbnails и expanded. */
export const MID_SNAP_THUMB_EXPAND_PX =
	(SWIPE_UP_THUMBNAILS_PX + SWIPE_UP_DRAG_MAX_PX) / 2;
/** Порог раннего автодотягивания в expanded при свайпе вверх из thumbnails. */
export const EXPAND_COMMIT_SWIPE_UP_PX =
	SWIPE_UP_THUMBNAILS_PX +
	(SWIPE_UP_DRAG_MAX_PX - SWIPE_UP_THUMBNAILS_PX) * 0.1;
