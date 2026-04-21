export const STORIES = [
	{
		id: '1',
		src: '/img/stories/1.jpg',
		time: '8 апр. 2026 в 13:05',
		viewers: [
			{
				id: 'v1-1',
				name: 'Михаил',
				img: '/img/ava.jpg',
				date: 'сегодня в 15:44',
			},
			{
				id: 'v1-2',
				name: 'Сергей',
				img: '',
				date: 'сегодня в 14:02',
			},
			{
				id: 'v1-3',
				name: 'Алексей',
				img: '/img/ava3.jpg',
				date: 'вчера в 21:33',
			},
			{
				id: 'v1-4',
				name: 'Мария',
				img: '',
				date: 'вчера в 20:32',
			},
			{
				id: 'v1-5',
				name: 'Дмитрий',
				img: '',
				date: '04.04.2026 в 14:02',
			},
			{
				id: 'v1-6',
				name: 'Ольга',
				img: '',
				date: '03.04.2026 в 21:33',
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
				name: 'Константин',
				img: '/img/ava.jpg',
				date: 'вчера в 09:15',
			},
			{
				id: 'v2-3',
				name: 'Анастасия',
				img: '',
				date: '02.04.2026 в 14:02',
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
