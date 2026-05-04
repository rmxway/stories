import { type Target, type Transition, type Variants } from 'framer-motion';

import { STORY_INFO_HIDE_DELAY_MS } from '@/widgets/stories/constants';

import { type ConnectedElementMotion } from './useConnectedTransformOrigin';

export const FadeInOutVariant: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const ImageFadeVariant: Variants = {
	hidden: { opacity: 0, transition: { duration: 0.2 } },
	visible: { opacity: 1, transition: { duration: 0.35 } },
};

export function getConnectedScaleInitial(
	motion: ConnectedElementMotion | null,
): Target {
	return {
		opacity: 0,
		scale: motion?.scale ?? 0.2,
		x: motion?.x ?? 0,
		y: motion?.y ?? 0,
	};
}

export const connectedScaleVariants: Variants = {
	visible: { opacity: 1, scale: 1, x: 0, y: 0 },
	hidden: getConnectedScaleInitial(null),
};

export const connectedScaleTransition: Transition = {
	type: 'tween',
	duration: 0.24,
	ease: 'easeInOut',
};

/** Прогресс и шапка: пауза перед началом скрытия при удержании (см. STORY_INFO_HIDE_DELAY_MS). */
export const storyChromeVariants: Variants = {
	visible: {
		opacity: 1,
		transition: { duration: 0.2 },
	},
	hidden: {
		opacity: 0,
		transition: {
			duration: 0.2,
			delay: STORY_INFO_HIDE_DELAY_MS / 1000,
		},
	},
};
