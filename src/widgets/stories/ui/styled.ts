'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styled, { css, keyframes } from 'styled-components';

import { StyledIcon } from '@/shared/ui/Icon/styled';

const storyShimmerSlide = keyframes`
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(250%);
	}
`;

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

/** Аватар: LQIP через `placeholder="blur"` + `blurDataURL` из `blur-map`. */
export const StoryAvatarImage = styled(Image)`
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
	user-select: none;
	pointer-events: none;
`;

export const StoryInfoAvatarWrap = styled.div`
	position: relative;
	width: 5cqi;
	height: 5cqi;
	min-width: 20px;
	min-height: 20px;
	max-width: 48px;
	max-height: 48px;
	border-radius: 50%;
	overflow: hidden;
	flex-shrink: 0;
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

export const StoryShell = styled(motion.div)`
	position: relative;
	z-index: 1;
	height: 100%;
	max-width: 100%;
	min-width: 160px;
	aspect-ratio: 1/1.8;
	max-height: 100dvh;
	display: flex;
	flex-direction: column;
	// overflow: hidden;
	padding: 10px 0 50px;
	container-type: inline-size;

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

export const CloseButton = styled.button<{ $disabled?: boolean }>`
	width: clamp(20px, 6.5cqi, 40px);
	height: clamp(20px, 6.5cqi, 40px);
	position: relative;
	z-index: 1;
	border: none;
	background: transparent;
	color: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	display: flex;
	appearance: none;
	align-items: center;
	justify-content: center;
	pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

	${StyledIcon} {
		font-size: clamp(35px, 10cqi, 70px);
	}

	&:hover {
		color: #fff;
	}
`;

export const ProgressRow = styled(motion.div)`
	position: absolute;
	top: 3px;
	left: 5px;
	right: 5px;
	display: flex;
	gap: 4px;
	padding: 12px 0 8px;
	flex-shrink: 0;
	z-index: 20;
	pointer-events: none;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
`;

export const ProgressTrack = styled.div`
	flex: 1;
	height: 1px;
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

export const StoryInfo = styled.div`
	position: absolute;
	top: 10px;
	left: 0;
	right: 0;
	height: 20%;
	font-size: clamp(10px, 2.55cqi, 16px);
	padding: clamp(10px, 2cqi, 12px) clamp(4px, 2cqi, 10px);
	z-index: 10;
	pointer-events: none;

	& > div {
		gap: clamp(6px, 2.2cqi, 12px);
	}

	&:after {
		content: '';
		z-index: -1;
		position: absolute;
		top: 0;
		bottom: 0;
		inset: 0;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.65) 2%,
			rgba(0, 0, 0, 0.5) 5%,
			transparent 90%
		);
	}

	strong {
		font-size: clamp(10px, 2.55cqi, 16px);
		font-weight: 600;
	}

	span {
		font-size: clamp(8px, 2.2cqi, 14px);
		line-height: 1;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	time {
		font-size: clamp(8px, 2.2cqi, 14px);
		font-weight: 500;
		line-height: 1.2;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
`;

export const StoryImageWrap = styled(motion.div)<{ $viewersMode?: boolean }>`
	position: relative;
	z-index: 5;
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
	width: 100%;
	padding: 0;
	touch-action: none;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	pointer-events: ${({ $viewersMode }) => ($viewersMode ? 'none' : 'auto')};
	transition: opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1);
`;

export const StoryImageInner = styled(motion.div)`
	position: relative;
	z-index: 2;
	flex: 1;
	min-height: 0;
	width: 100%;
	border-radius: 8px;
	overflow: hidden;
`;

/** Соседние кадры при свайпе вверх: слева/справа от уменьшающегося основного. */
export const StoryNeighborCard = styled(motion.button)<{
	$side: 'left' | 'right';
}>`
	${({ $side }) => css`
		position: absolute;
		top: 50%;
		width: clamp(64px, 19cqi, 88px);
		aspect-ratio: 1 / 1.8;
		border: none;
		border-radius: 10px;
		padding: 0;
		overflow: hidden;
		cursor: pointer;
		z-index: 1;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.38);
		background: #141414;
		-webkit-tap-highlight-color: transparent;

		${$side === 'left'
			? css`
					left: clamp(6px, 1.5cqi, 14px);
				`
			: css`
					right: clamp(6px, 1.5cqi, 14px);
				`}
	`}
`;

export const StoryNeighborImageInner = styled.div`
	position: absolute;
	inset: 0;
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
	z-index: 4;
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

export const StorySkeletonMotionWrap = styled(motion.div)`
	position: absolute;
	inset: 0;
	z-index: 10;
	pointer-events: none;
`;

export const StorySkeleton = styled.div`
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.42);
	pointer-events: none;
`;

export const ShimmerOverlay = styled.div`
	position: absolute;
	inset: 0;
	z-index: 1;
	overflow: hidden;
	pointer-events: none;

	&::after {
		content: '';
		position: absolute;
		inset: 0;
		width: 55%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.08) 40%,
			rgba(255, 255, 255, 0.16) 50%,
			rgba(255, 255, 255, 0.08) 60%,
			transparent 100%
		);
		animation: ${storyShimmerSlide} 1.35s ease-in-out infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		&::after {
			animation: none;
			opacity: 0.4;
			transform: none;
		}
	}
`;

/** Blur-fallback при ошибке загрузки кадра сторис. */
export const StoryBlurFallback = styled.img`
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	z-index: 2;
	pointer-events: none;
	user-select: none;
	filter: blur(22px) brightness(0.78);
	transform: scale(1.08);
`;

type StoryImagePhase = 'loading' | 'loaded' | 'error';

export const StoryImageMain = styled(Image).attrs<{
	$phase: StoryImagePhase;
}>(() => ({
	fill: true,
}))<{ $phase: StoryImagePhase }>`
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
	z-index: 2;
	opacity: ${({ $phase }) => ($phase === 'error' ? 0 : 1)};
	transition: opacity 0.2s ease;
	user-select: none;
	pointer-events: none;

	@media (prefers-reduced-motion: reduce) {
		transition: none;
	}
`;

export const ViewersPreviewWrap = styled(motion.div)`
	position: absolute;
	bottom: 20px;
	left: 20px;
	display: flex;
	align-items: center;
	gap: 12px;
	z-index: 10;
	pointer-events: none;
	user-select: none;
`;

export const ViewersPreviewAvatars = styled.div`
	display: flex;
	align-items: center;
	padding-left: 10px; /* To account for first child margin if needed, but not strictly necessary */
`;

export const ViewersPreviewAvatarWrap = styled.div`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	overflow: hidden;
	border: 2px solid #000;
	margin-left: -10px;
	position: relative;
	background: #333;
`;

export const ViewersPreviewCount = styled.div`
	color: #fff;
	font-size: 14px;
	font-weight: 500;
	text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	gap: 6px;
`;

export const ViewersPanelWrap = styled.div`
	position: absolute;
	inset: 0;
	z-index: 30;
	background: transparent;
	display: flex;
	flex-direction: column;
	pointer-events: none;
`;

/** Слой слайдера + панели зрителей: родитель с `pointer-events: none`, клики ловят дети с `auto`. */
export const StoriesViewersModeRoot = styled(motion.div)`
	${() => css`
		position: absolute;
		inset: 0;
		z-index: 25;
		pointer-events: none;
		transform-origin: 50% 42%;
	`}
`;

export const ViewersPanelContent = styled(motion.div)`
	position: absolute;
	width: 100%;
	left: 0;
	right: 0;
	bottom: 0;
	max-width: 400px;
	margin-left: auto;
	margin-right: auto;
	margin-top: auto;
	height: 35%;
	background: #1c1c1e;
	border-top-left-radius: 16px;
	border-top-right-radius: 16px;
	display: flex;
	flex-direction: column;
	pointer-events: auto;
	padding-top: 16px;
`;

export const ViewersPanelHeader = styled.div`
	padding: 0 16px 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const ViewersPanelTitle = styled.h3`
	color: #fff;
	font-size: 16px;
	font-weight: 600;
	margin: 0;
`;

export const ViewersPanelList = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: 16px 0;
	-webkit-overflow-scrolling: touch;
`;

export const ViewersPanelEmptyState = styled.div`
	padding: 16px;
	color: rgba(255, 255, 255, 0.7);
	font-size: 14px;
	line-height: 1.4;
`;

export const ViewersListItemWrap = styled.div`
	${() => css`
		display: flex;
		align-items: center;
		padding: 8px 16px;
		gap: 12px;
		background: transparent;
		transition: background 0.2s;

		&:active {
			background: rgba(255, 255, 255, 0.05);
		}
	`}
`;

export const ViewersListItemAvatar = styled.div`
	width: 44px;
	height: 44px;
	border-radius: 50%;
	overflow: hidden;
	position: relative;
	background: #333;
	flex-shrink: 0;
`;

export const ViewersListItemInfo = styled.div`
	${() => css`
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		flex: 1;
		min-width: 0;

		strong {
			font-size: 15px;
			color: #fff;
			font-weight: 500;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		span {
			font-size: 13px;
			color: rgba(255, 255, 255, 0.6);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	`}
`;

export const StoriesSliderWrap = styled(motion.div)`
	${() => css`
		position: absolute;
		top: 8%;
		left: 0;
		right: 0;
		height: 52%;
		z-index: 20;
		display: flex;
		align-items: center;
		touch-action: none;
		pointer-events: auto;
	`}
`;

/** Горизонтальный трек: центрирование по ширине оболочки (100% = ширина слайдера). */
export const StoriesSliderTrack = styled.div`
	${() => css`
		display: flex;
		flex-direction: row;
		flex-shrink: 0;
		align-items: center;
		gap: 16px;
		width: max-content;
		padding: 0 max(0px, calc((100% - 140px) / 2));
	`}
`;

export const StoryThumbnailItemWrap = styled(motion.div)`
	${() => css`
		position: relative;
		flex: 0 0 140px;
		width: 140px;
		aspect-ratio: 1 / 1.8;
		border-radius: 8px;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;

		img {
			user-select: none;
			-webkit-user-select: none;
			-webkit-touch-callout: none;
			pointer-events: none;
		}
	`}
`;
