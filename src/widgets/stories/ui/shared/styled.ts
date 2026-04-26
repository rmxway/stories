import styled from 'styled-components';

import { StyledIcon } from '@/shared/ui/Icon/styled';

export const CloseButton = styled.button<{ $disabled?: boolean }>`
	position: relative;
	width: clamp(20px, 6.5cqi, 40px);
	height: clamp(20px, 6.5cqi, 40px);
	z-index: 1;
	border: none;
	background: transparent;
	color: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	display: flex;
	appearance: none;
	align-items: center;
	justify-content: center;
	pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

	${StyledIcon} {
		font-size: clamp(35px, 8cqi, 70px);
	}

	&:hover {
		color: #fff;
	}
`;
