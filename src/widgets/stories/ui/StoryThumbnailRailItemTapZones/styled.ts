import styled, { css } from 'styled-components';

/** 50% desktop tap-зоны; на touch отключены, чтобы pinch работал по всей картинке. */
export const StoryTapZone = styled.button<{
	$side: 'left' | 'right';
	$pressed?: boolean;
}>`
	position: absolute;
	top: 0;
	bottom: 0;
	width: 50%;
	pointer-events: none;
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	z-index: 85;
	overflow: hidden;
	-webkit-tap-highlight-color: transparent;
	touch-action: none;
	${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}

	@media (hover: hover) and (pointer: fine) {
		pointer-events: auto;
	}

	&::after {
		content: '';
		position: absolute;
		inset: 0;
		opacity: ${({ $pressed }) => ($pressed ? 1 : 0)};
		pointer-events: none;
		transition: opacity 0.22s ease-out;
		${({ $side }) => css`
			background: linear-gradient(
				to ${$side === 'left' ? 'right' : 'left'},
				rgba(0, 0, 0, 0.2) 0%,
				rgba(0, 0, 0, 0) 30%,
				transparent 100%
			);
		`}
	}

	&:focus-visible {
		outline: 2px solid rgba(255, 255, 255, 0.35);
		outline-offset: -2px;
	}
`;
