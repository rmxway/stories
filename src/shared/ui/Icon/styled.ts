'use client';

import styled, { css } from 'styled-components';

export const StyledIcon = styled.i<{ $size?: number; $rem?: boolean }>`
	${({ $size, $rem }) =>
		$size != null &&
		css`
			font-size: ${$size}${$rem ? 'rem' : 'px'};
		`}
`;
