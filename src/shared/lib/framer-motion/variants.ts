import { Variants } from 'framer-motion';

import { STORY_INFO_HIDE_DELAY_MS } from '@/widgets/stories/constants';

export const FadeInOutVariant: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const ImageFadeVariant: Variants = {
	hidden: { opacity: 0, transition: { duration: 0.2 } },
	visible: { opacity: 1, transition: { duration: 0.35 } },
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
