/** Склонение «N просмотр / просмотра / просмотров» для русского языка. */
export function formatStoryViewCount(count: number): string {
	const n = Math.abs(Math.trunc(count));
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) {
		return `${n} просмотр`;
	}
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
		return `${n} просмотра`;
	}
	return `${n} просмотров`;
}
