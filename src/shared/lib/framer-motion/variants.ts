import { Variants } from 'framer-motion';

export const FadeInOutVariant: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const ImageFadeVariant: Variants = {
	hidden: { opacity: 0, transition: { duration: 0.2 } },
	visible: { opacity: 1, transition: { duration: 0.35 } },
};
