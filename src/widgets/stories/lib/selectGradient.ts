import { gradientKeys, gradients } from '@/theme/styles/gradients';

function hashToIndex(key: string, modulo: number): number {
	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		hash = (Math.imul(31, hash) + key.charCodeAt(i)) | 0;
	}
	return Math.abs(hash) % modulo;
}

/** Стабильный градиент для пользователя: один и тот же id → один цвет везде. */
export function getGradientForUserId(userId: string) {
	const index = hashToIndex(userId, gradientKeys.length);
	const key = gradientKeys[index];
	return gradients[key];
}
