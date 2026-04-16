export const STORIES_STORAGE_KEY = 'stories:seenIds';

/** Shared layout id (Framer Motion) между превью и оболочкой просмотра сторис. */
export const STORIES_SHELL_LAYOUT_ID = 'stories-shell' as const;

/**
 * Единый transition для `animate(swipeUpDragY)` и shared layout (layoutId):
 * открытие/закрытие режима зрителей должно идти одной и той же кривой без резкого добегания.
 */
export const VIEWERS_CHROME_OPEN_SPRING = {
	type: 'tween' as const,
	duration: 0.4,
	ease: 'easeInOut' as const,
} as const;

export const STORIES_SLIDER_LAYOUT_TRANSITION = {
	layout: VIEWERS_CHROME_OPEN_SPRING,
} as const;

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

export const STORIES = [
	{
		id: '1',
		src: '/img/stories/1.jpg',
		time: '8 апр. 2026 в 13:05',
		viewers: [
			{
				id: 'v1-1',
				name: 'Анна',
				img: '/img/ava.jpg',
				date: 'сегодня в 15:44',
			},
			{
				id: 'v1-2',
				name: 'Михаил',
				img: '/img/ava2.jpg',
				date: 'сегодня в 14:02',
			},
			{
				id: 'v1-3',
				name: 'Ольга',
				img: '/img/ava.jpg',
				date: 'вчера в 21:33',
			},
		],
	},
	{
		id: '2',
		src: '/img/stories/2.jpg',
		time: '8 апр. 2026 в 13:07',
		viewers: [
			{
				id: 'v2-1',
				name: 'Дмитрий',
				img: '/img/ava2.jpg',
				date: 'сегодня в 16:10',
			},
			{
				id: 'v2-2',
				name: 'Елена',
				img: '/img/ava.jpg',
				date: 'вчера в 09:15',
			},
		],
	},
	{
		id: '3',
		src: '/img/stories/3.jpg',
		time: '8 апр. 2026 в 13:12',
		viewers: [],
	},
] as const;

export type StoryItem = (typeof STORIES)[number];
