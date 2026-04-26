export const STORIES_STORAGE_KEY = 'stories:seenIds';

/** Событие после изменения списка просмотренных в storage (та же вкладка). */
export const STORIES_SEEN_IDS_CHANGED_EVENT = 'stories:seenIdsChanged' as const;

/** Shared layout id (Framer Motion) между превью и оболочкой просмотра сторис. */
export const STORIES_SHELL_LAYOUT_ID = 'stories-shell' as const;

export type ViewersStage = 'story' | 'thumbnails' | 'expanded';

/** Высота карточки сторис к её ширине (портретный кадр, как 9:16 ≈ 1:1.8). */
export const STORY_SHELL_HEIGHT_OVER_WIDTH = 1.8;

/**
 * `sizes` для кадра в рельсе: `100%` у next/image недопустим и даёт узкий srcset → «крошечная» картинка.
 */
export const STORY_RAIL_IMAGE_SIZES = '100vw' as const;

/** Gap между карточками в горизонтальном треке (совпадает с CSS `gap` рельса). */
export const STORY_THUMBNAIL_TRACK_GAP_PX = 20;

/** Верхняя граница pinch по кадру cover. */
export const STORY_COVER_PINCH_MAX = 3;

export const STORY_DURATION_SEC = 5;
export const STORY_INFO_HIDE_DELAY_MS = 300;

/** Аватар в превью и шапке просмотра сторис. */
export const STORY_AVATAR_SRC = '/img/ava.jpg' as const;

export type StoryViewRecord = {
	readonly id: string;
	readonly name: string;
	readonly img: string;
	readonly date: string;
};

export type { StoryItem } from './stories.data';
