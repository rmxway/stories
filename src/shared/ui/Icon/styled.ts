'use client';

import styled, { css } from 'styled-components';

export const StyledIcon = styled.i<{ $size?: number }>`
	${({ $size }) =>
		$size != null &&
		css`
			font-size: ${$size}px;
		`}
`;
