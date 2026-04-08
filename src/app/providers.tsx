'use client';

import { type ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';

import { defaultTheme, GlobalStyles } from '@/theme';

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider theme={defaultTheme}>
			<GlobalStyles />
			{children}
		</ThemeProvider>
	);
}
