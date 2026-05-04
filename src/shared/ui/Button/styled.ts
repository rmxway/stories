import { motion } from 'framer-motion';
import { desaturate } from 'polished';
import styled, { css } from 'styled-components';

import type { Icofont } from '@/types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	$variant?: 'primary' | 'success' | 'danger';
	$size?: 'small' | 'medium' | 'large';
	$loading?: boolean;
	$icon?: Icofont;
	$iconPosition?: 'left' | 'right';
}

export const StyledButton = styled(motion.button)<ButtonProps>`
	${({ $variant, $size, $loading, $iconPosition, theme }) => css`
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: #111;
		text-transform: uppercase;
		font-weight: 600;
		font-size: clamp(10px, 1cqi, 14px);
		line-height: 1;
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: ${theme.radius.borderRadius};
		gap: 8px;
		z-index: 1;

		&:hover {
			opacity: 0.8;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		}

		${$variant &&
		css`
			background-color: ${theme.colors[$variant]};

			&:disabled {
				opacity: 0.5;
				background-color: ${desaturate(0.3, theme.colors[$variant])};
				cursor: not-allowed;
			}
		`}

		${$size === 'small' &&
		css`
			padding: clamp(6px, 1cqi, 8px);
			
		`}

        ${$size === 'medium' &&
		css`
			padding: clamp(10px, 1cqi, 16px);
		`}

        ${$size === 'large' &&
		css`
			padding: clamp(10px, 1cqi, 24px);
		`}

		${$loading &&
		css`
			opacity: 0.5;
		`}

		${$iconPosition === 'left' &&
		css`
			margin-right: 8px;
			flex-direction: row;
		`}

        ${$iconPosition === 'right' &&
		css`
			margin-left: 8px;
			flex-direction: row-reverse;
		`}
	`}
`;
