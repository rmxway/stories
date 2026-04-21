import styled, { css } from 'styled-components';

import type { Icofont } from '@/types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	$variant?: 'primary' | 'success' | 'danger';
	$size?: 'small' | 'medium' | 'large';
	$loading?: boolean;
	$icon?: Icofont;
	$iconPosition?: 'left' | 'right';
}

export const StyledButton = styled.button<ButtonProps>`
	${({ $variant, $size, $loading, $icon, $iconPosition, theme }) => css`
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: ${theme.layout.basePadding};
		border: none;
		background: transparent;
		cursor: pointer;
		border-radius: ${theme.radius.borderRadius};
		gap: 8px;

		transition: all 0.2s ease-in-out;

		${$variant &&
		css`
			background: ${theme.colors[$variant]};
		`}

		${$size === 'small' &&
		css`
			padding: 8px;
		`}

        ${$size === 'medium' &&
		css`
			padding: 16px;
		`}

        ${$size === 'large' &&
		css`
			padding: 24px;
		`}

        &[disabled] {
			opacity: 0.5;
			cursor: not-allowed;
		}

		${$loading &&
		css`
			opacity: 0.5;
		`}

		${$icon &&
		css`
			background: ${theme.colors.primary};
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
