export const STORIES_STORAGE_KEY = 'stories:seenIds';

/** Shared layout id (Framer Motion) между превью и оболочкой просмотра сторис. */
export const STORIES_SHELL_LAYOUT_ID = 'stories-shell' as const;

export const STORY_DURATION_SEC = 5;
export const STORY_INFO_HIDE_DELAY_MS = 300;

/** Аватар в превью и шапке просмотра сторис. */
export const STORY_AVATAR_SRC = '/img/ava.jpg' as const;

export const STORIES = [
	{ id: '1', src: '/img/stories/1.jpg', time: '8 апр. 2026 в 13:05' },
	{ id: '2', src: '/img/stories/2.jpg', time: '8 апр. 2026 в 13:07' },
	{ id: '3', src: '/img/stories/3.jpg', time: '8 апр. 2026 в 13:12' },
] as const;

export type StoryItem = (typeof STORIES)[number];
