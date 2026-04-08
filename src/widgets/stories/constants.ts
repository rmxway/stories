export const STORIES_STORAGE_KEY = 'stories:seenIds';

export const STORY_DURATION_SEC = 5;

export const STORIES = [
	{ id: '1', src: '/img/stories/1.jpg' },
	{ id: '2', src: '/img/stories/2.jpg' },
	{ id: '3', src: '/img/stories/3.jpg' },
] as const;

export type StoryItem = (typeof STORIES)[number];
