'use client';

import styled from 'styled-components';

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
`;

export const Overlay = styled.div`
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(0, 0, 0, 0.92);
	padding: 0;
`;

export const StoryShell = styled.div`
	position: relative;
	height: 100%;
	aspect-ratio: 1/1.8;
	max-height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`;

export const CloseButton = styled.button`
	position: fixed;
	top: 12px;
	right: 12px;
	z-index: 1002;
	padding: 8px;
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
`;

export const ProgressTrack = styled.div`
	flex: 1;
	height: 3px;
	border-radius: 2px;
	background: rgba(255, 255, 255, 0.25);
	overflow: hidden;
`;

export const ProgressFill = styled.div`
	height: 100%;
	width: 100%;
	transform-origin: left center;
	background: #fff;
	border-radius: 2px;
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
`;

export const StoryImageInner = styled.div`
	position: relative;
	flex: 1;
	min-height: 0;
	width: 100%;
	border-radius: 8px;
	overflow: hidden;
`;

export const StoryTapZone = styled.button<{ $side: 'left' | 'right' }>`
	position: absolute;
	top: 0;
	bottom: 0;
	width: 50%;
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	z-index: 1;

	${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}

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
	pointer-events: none;
`;
