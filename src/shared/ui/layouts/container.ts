'use client';

import type { PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';

import { media } from '@/theme';

type ContainerProps = PropsWithChildren<{ $mt?: boolean }>;

export const Container = styled.div<ContainerProps>`
	${({ theme, $mt }) => css`
		position: relative;
		padding: 0 ${theme.layout.paddingX2};
		width: 100%;
		max-width: 100%;
		margin: 0 auto;

		${$mt &&
		css`
			margin-top: ${theme.layout.marginX2};
		`}
	`}

	${media.greaterThan('sm')`
		max-width: 768px;
	`}

	${media.greaterThan('md')`
		max-width: 1024px;
		padding: ${({ theme }) => `0 ${theme.layout.paddingX3}`};
	`}

	${media.greaterThan('lg')`
		max-width: 1280px;
	`}
`;
