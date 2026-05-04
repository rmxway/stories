import { css } from 'styled-components';

import { media } from '@/theme/media';

const base = css`
	*,
	*::after,
	*::before {
		box-sizing: border-box;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	* {
		&::-webkit-scrollbar {
			width: 8px;
			height: 8px;
			scroll-behavior: smooth;
		}

		&::-webkit-scrollbar-track {
			background-color: #111;
			border-radius: 100px;
		}

		&::-webkit-scrollbar-thumb {
			${({ theme }) => css`
				background-color: ${theme.colors.gray.$8};
				border-radius: 100px;

				&:hover {
					background-color: ${theme.colors.gray.$7};
				}
			`}
		}
	}

	html {
		font-size: 16px;

		${media.lessThan('md')`
			font-size: 14px;
		`}
	}

	body {
		${({ theme }) => css`
			overflow-y: scroll;
			font-family: ${theme.fonts.base};
			display: block;
			line-height: 1.25;
			min-width: 320px;
			color: #fff;
			background-color: ${theme.colors.gray.$9};
			min-height: 2000px;
		`}
	}
	code {
		font-family:
			'source-code-pro', 'Menlo', 'Monaco', 'Consolas', 'Courier New',
			monospace;
	}

	p {
		margin-bottom: 1rem;
		text-indent: 2rem;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		font-family: 'Play';
	}

	h1 {
		font-size: 3rem;
		margin: 24px 0;
	}

	h2 {
		font-size: 1.5rem;
		margin: 20px 0;
	}

	h3 {
		font-size: 1rem;
		margin: 16px 0;
	}

	h4 {
		font-size: 0.75rem;
		margin: 12px 0;
	}

	h5 {
		font-size: 0.5rem;
		margin: 8px 0;
	}

	ul {
		list-style: disc;
		padding: 5px 0 5px 25px;
	}
`;

export { base };
export default base;
