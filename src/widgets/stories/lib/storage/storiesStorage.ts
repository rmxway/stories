import { STORIES_STORAGE_KEY } from '../../constants';

export function loadSeenIds(): string[] {
	if (typeof window === 'undefined') {
		return [];
	}
	try {
		const raw = localStorage.getItem(STORIES_STORAGE_KEY);
		if (!raw) {
			return [];
		}
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.filter((id): id is string => typeof id === 'string')
			: [];
	} catch {
		return [];
	}
}

export function saveSeenIds(ids: string[]): void {
	if (typeof window === 'undefined') {
		return;
	}
	localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(ids));
}
