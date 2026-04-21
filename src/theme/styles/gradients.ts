import { lighten } from 'polished';

export const gradients = {
	pink: `linear-gradient(to top, #FF8597 0%, ${lighten(0.1, '#FF8597')} 100%)`,
	blue: `linear-gradient(to top, #6CC2FF 0%, ${lighten(0.1, '#6CC2FF')} 100%)`,
	purple: `linear-gradient(to top, #948FFF 0%, ${lighten(0.1, '#948FFF')} 100%)`,
	gold: `linear-gradient(to top, #FFC28D 0%, ${lighten(0.1, '#FFC28D')} 100%)`,
	aqua: `linear-gradient(to top, #6AF1E2 0%, ${lighten(0.1, '#6AF1E2')} 100%)`,
} as const;

/** Порядок перебора градиентов для пустых аватаров и т.п. */
export const gradientKeys = Object.keys(
	gradients,
) as (keyof typeof gradients)[];
