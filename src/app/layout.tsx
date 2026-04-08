import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppProviders } from './providers';
import { StyledComponentsRegistry } from './styled-registry';

export const metadata: Metadata = {
	title: 'Stories',
	description: 'Stories',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ru">
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@100;400;700&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Play&family=Russo+One&display=swap"
					rel="stylesheet"
				/>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"
				/>
			</head>
			<body>
				<StyledComponentsRegistry>
					<AppProviders>{children}</AppProviders>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}
