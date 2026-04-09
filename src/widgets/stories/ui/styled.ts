'use client';

import styled, { css } from 'styled-components';

export const PreviewWrap = styled.div`
	margin-top: 1.5rem;
	display: flex;
	justify-content: center;
`;

export const PreviewButton = styled.button`
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	border-radius: 50%;
	display: block;
`;

export const StoryRingFrame = styled.div`
	position: relative;
	width: 72px;
	height: 72px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const StoryRingSvgWrap = styled.div`
	position: absolute;
	inset: 0;
	pointer-events: none;
`;

export const StoryRingInner = styled.div`
	position: relative;
	z-index: 1;
	width: 60px;
	height: 60px;
	border-radius: 50%;
	overflow: hidden;
	background: #fff;
`;

export const StoryAvatar = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
	user-select: none;
	pointer-events: none;
`;

export const Overlay = styled.div`
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	background: transparent;
`;

export const OverlayBackdrop = styled.div`
	position: absolute;
	inset: 0;
	background: #000;
	pointer-events: auto;
`;

export const StoryShell = styled.div`
	position: relative;
	z-index: 1;
	height: 100%;
	aspect-ratio: 1/1.8;
	max-height: 100dvh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
`;

export const VisuallyHidden = styled.span`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border-width: 0;
`;

export const CloseButton = styled.button`
	position: absolute;
	top: 10px;
	right: 0;
	z-index: 3;
	padding: 10px;
	border: none;
	background: transparent;
	color: rgba(255, 255, 255, 0.9);
	cursor: pointer;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		color: #fff;
	}
`;

export const ProgressRow = styled.div`
	display: flex;
	gap: 4px;
	padding: 12px 12px 8px;
	flex-shrink: 0;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
`;

export const ProgressTrack = styled.div`
	flex: 1;
	height: 2px;
	border-radius: 2px;
	background: rgba(255, 255, 255, 0.25);
	overflow: hidden;
`;

export const ProgressFill = styled.div`
	height: 100%;
	width: 100%;
	transform-origin: left;
	background: #fff;
	border-radius: 2px;
	margin-left: 1px;
`;

export const ProgressFillComplete = styled(ProgressFill)`
	transform: scaleX(1);
`;

export const StoryImageWrap = styled.div`
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
	width: 100%;
	padding: 0 12px 12px;
	touch-action: none;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
`;

export const StoryImageInner = styled.div`
	position: relative;
	flex: 1;
	min-height: 0;
	width: 100%;
	border-radius: 8px;
	overflow: hidden;
`;

export const StoryTapZone = styled.button<{
	$side: 'left' | 'right';
	$pressed?: boolean;
}>`
	position: absolute;
	top: 0;
	bottom: 0;
	width: 50%;
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	z-index: 1;
	overflow: hidden;
	-webkit-tap-highlight-color: transparent;
	touch-action: none;

	${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}

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

export const StoryImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
	user-select: none;
	pointer-events: none;
`;
