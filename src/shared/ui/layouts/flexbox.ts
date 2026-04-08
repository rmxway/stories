'use client';

import type { CSSProperties, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

interface FlexboxTypes {
	$nowrap?: boolean;
	/**
	 * @default 'flex-start'
	 */
	$justify?: CSSProperties['justifyContent'];
	/**
	 * @default 'flex-start'
	 */
	$align?: CSSProperties['alignItems'];
	/**
	 * @default 'row'
	 */
	$direction?: CSSProperties['flexDirection'];
	/**
	 * @default 0 — отступ между элементами в px
	 */
	$gap?: number;
}

export const Flexbox = styled.div<PropsWithChildren<FlexboxTypes>>`
	${({ $nowrap, $justify, $align, $direction, $gap }) => css`
		display: flex;
		flex-grow: 1;
		flex-wrap: ${$nowrap ? 'nowrap' : 'wrap'};
		justify-content: ${$justify || 'flex-start'};
		align-items: ${$align || 'flex-start'};
		flex-direction: ${$direction || 'row'};
		gap: ${$gap || 0}px;
	`}
`;
