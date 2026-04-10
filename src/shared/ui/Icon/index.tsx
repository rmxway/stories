'use client';

import type { ElementType, FC } from 'react';

import type { Icofont } from '@/types';

import { StyledIcon } from './styled';

export interface IconProps {
	as?: ElementType;
	icon: Icofont;
	size?: number;
	rem?: boolean;
	className?: string;
}

/**
 * Иконка из шрифта icofont (fantasticon).
 */
export const Icon: FC<IconProps> = ({
	as,
	icon,
	size,
	rem,
	className,
	...props
}) => (
	<StyledIcon
		as={as}
		className={['icofont', `icofont-${icon}`, className]
			.filter(Boolean)
			.join(' ')}
		$size={size}
		$rem={rem}
		{...props}
	/>
);
