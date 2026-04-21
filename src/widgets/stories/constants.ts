export const STORIES_STORAGE_KEY = 'stories:seenIds';

/** Событие после изменения списка просмотренных в storage (та же вкладка). */
export const STORIES_SEEN_IDS_CHANGED_EVENT = 'stories:seenIdsChanged' as const;

/** Shared layout id (Framer Motion) между превью и оболочкой просмотра сторис. */
export const STORIES_SHELL_LAYOUT_ID = 'stories-shell' as const;

export type ViewersStage = 'story' | 'thumbnails' | 'expanded';

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
