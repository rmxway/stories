import { DefaultTheme } from 'styled-components';

const defaultTheme: DefaultTheme = {
	name: 'default',
	colors: {
		primary: '#fdd01a',
		success: '#76bd32',
		danger: '#f4435e',
		dark: '#222',
		gray: {
			$1: '#ddd',
			$2: '#ececec',
			$3: '#cdcdcd',
			$4: '#bebebe',
			$5: '#a5a5a5',
			$6: '#747474',
			$7: '#595959',
			$8: '#434343',
			$9: '#222222',
		},
	},
	fonts: {
		base: 'Sofia Sans, sans-serif',
		bold: 'Play', // 'Russo One, sans-serif',
	},
	layout: {
		bgColor: '#222',
		containerWidth: '1024px',
		basePadding: '8px',
		paddingX1: '8px',
		paddingX2: '16px',
		paddingX3: '32px',
		baseMargin: '8px',
		marginX1: '8px',
		marginX2: '16px',
		marginX3: '32px',
		shadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
	},
	radius: {
		borderRadius: '8px',
	},
};

export { defaultTheme };
export default defaultTheme;
