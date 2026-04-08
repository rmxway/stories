'use client';

import { useServerInsertedHTML } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export function StyledComponentsRegistry({
	children,
}: {
	children: ReactNode;
}) {
	const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

	useServerInsertedHTML(() => {
		const styles = styledComponentsStyleSheet.getStyleElement();
		const sheet = styledComponentsStyleSheet.instance as unknown as {
			clearTag: () => void;
		};
		sheet.clearTag();
		return <>{styles}</>;
	});

	if (typeof window !== 'undefined') {
		return <>{children}</>;
	}

	return (
		<StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
			{children}
		</StyleSheetManager>
	);
}
