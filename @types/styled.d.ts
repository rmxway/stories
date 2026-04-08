import 'styled-components';

interface Colors {
	primary: string;
	success: string;
	danger: string;
	dark: string;
	gray: {
		$1: string;
		$2: string;
		$3: string;
		$4: string;
		$5: string;
		$6: string;
		$7: string;
		$8: string;
		$9: string;
	};
}

interface Fonts {
	base: string;
	bold: string;
}

interface Layout {
	bgColor: string;
	containerWidth: string;
	basePadding: string;
	paddingX1: string;
	paddingX2: string;
	paddingX3: string;
	baseMargin: string;
	marginX1: string;
	marginX2: string;
	marginX3: string;
	shadow: string;
}

interface Radius {
	borderRadius: string;
}

declare module 'styled-components' {
	export interface DefaultTheme {
		name: string;
		colors: Colors;
		fonts: Fonts;
		layout: Layout;
		radius: Radius;
	}
}
