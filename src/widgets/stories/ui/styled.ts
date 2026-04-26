'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styled, { css, keyframes } from 'styled-components';

import { StyledIcon } from '@/shared/ui/Icon/styled';

import { STORY_SHELL_HEIGHT_OVER_WIDTH } from '../constants';

const storyShimmerSlide = keyframes`
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(250%);
	}
`;

const STORY_CARD_ASPECT_RATIO = `1/${STORY_SHELL_HEIGHT_OVER_WIDTH}`;
const STORY_CARD_MIN_WIDTH = '120px';

export const PreviewWrap = styled.div`
	margin-top: 1.5rem;
	display: flex;
	justify-content: center;
	z-index: 1000;
	height: 72px;
	width: 72px;
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
	width: 100%;
	min-height: 100svh;
	min-height: 100dvh;
	overflow: clip;
	overscroll-behavior: none;
	isolation: isolate;
`;

export const OverlayBackdrop = styled.div`
	position: absolute;
	inset: 0;
	background: #000;
	pointer-events: auto;
`;

export const StoryShell = styled(motion.div)<{ $viewersChrome?: boolean }>`
	position: relative;
	z-index: 1;
	box-sizing: border-box;
	width: min(100%, 100dvh / ${STORY_SHELL_HEIGHT_OVER_WIDTH});
	height: auto;
	max-height: 100dvh;
	max-width: 100%;
	min-width: ${STORY_CARD_MIN_WIDTH};
	aspect-ratio: ${STORY_CARD_ASPECT_RATIO};
	display: flex;
	flex-direction: column;
	padding: 10px 0 clamp(50px, 4cqi, 10vh);
	container-type: inline-size;

	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;

	${({ $viewersChrome }) =>
		$viewersChrome &&
		css`
			overscroll-behavior-y: contain;
		`}
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
	position: relative;
	width: clamp(20px, 6.5cqi, 40px);
	height: clamp(20px, 6.5cqi, 40px);
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
		font-size: clamp(35px, 8cqi, 70px);
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

export const StoryInfo = styled.div`
	position: absolute;
	top: 10px;
	left: 0;
	right: 0;
	height: 20%;
	font-size: clamp(10px, 3cqi, 18px);
	padding: clamp(12px, 2cqi, 14px) clamp(4px, 2cqi, 10px);
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
		font-size: clamp(14px, 3cqi, 20px);
		font-weight: 600;
	}

	span {
		font-size: clamp(14px, 2.5cqi, 20px);
		line-height: 1;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
`;

export const StoryImageWrap = styled(motion.div)<{
	$viewersMode?: boolean;
	/** Активный pinch по кадру: область картинки выше хрома (прогресс, шапка). */
	$railPinchActive?: boolean;
}>`
	position: relative;
	z-index: ${({ $railPinchActive }) => ($railPinchActive ? 120 : 5)};
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
`;

export const StoryImageInner = styled(motion.div)`
	position: relative;
	z-index: 2;
	flex: 1;
	min-height: 0;
	width: 100%;
	border-radius: 8px;
	overflow: hidden;
	transform-origin: top center;
`;

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

export const StoryScaledBlock = styled(motion.div)`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: auto;
	min-height: 100px;
	z-index: 10;
	pointer-events: none;
	transform-origin: top center;
`;

export const ViewersPreviewWrap = styled(motion.div)<{
	$interactive?: boolean;
}>`
	${({ $interactive = true }) => css`
		position: relative;
		display: flex;
		bottom: 6px;
		align-items: center;
		justify-content: flex-start;
		height: clamp(40px, 8cqi, 60px);
		transform-origin: top center;
		z-index: 200;
		pointer-events: ${$interactive ? 'auto' : 'none'};
		cursor: ${$interactive ? 'pointer' : 'default'};
		user-select: none;
		padding: clamp(4px, 3cqi, 12px);
	`}
`;

export const ViewersPreviewAvatars = styled(motion.div)`
	display: flex;
	align-items: center;
`;

export const ViewersPreviewAvatarWrap = styled(motion.div)<{
	$isAvatar?: boolean;
}>`
	position: relative;
	width: clamp(14px, 10cqi, 34px);
	height: clamp(14px, 10cqi, 34px);
	border-radius: 50%;
	overflow: hidden;

	${({ $isAvatar }) =>
		!$isAvatar &&
		css`
			border: 2px solid #222;
			margin-left: -10px;
		`}

	background: #333;

	img {
		object-fit: cover;
	}
`;

export const ViewerAvatarEmpty = styled.div<{
	$gradient: string;
}>`
	${({ $gradient }) => css`
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-weight: 600;
		background: ${$gradient};
		color: #fff;
		font-size: clamp(14px, 3cqi, 20px);
		text-shadow: 0 1px 10px rgba(0, 0, 0, 0.6);
	`}
`;

export const ViewersPreviewCount = styled.div`
	color: #fff;
	font-size: clamp(14px, 3cqi, 18px);
	font-weight: 500;
	text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	gap: 6px;
`;

/** Слой слайдера + панели зрителей: родитель с `pointer-events: none`, клики ловят дети с `auto`. */
export const StoriesViewersModeRoot = styled(motion.div)`
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	width: 100%;
	bottom: 0;
	z-index: 25;
	pointer-events: none;
	transform-origin: bottom center;
	overscroll-behavior-y: contain;
`;

export const ViewersPanelContent = styled(motion.div)<{
	$lockVerticalTouch?: boolean;
}>`
	position: absolute;
	bottom: 0;
	width: 100%;
	min-height: 0;
	box-sizing: border-box;
	background: #1c1c1e;
	border-top-left-radius: 16px;
	border-top-right-radius: 16px;
	display: flex;
	flex-direction: column;
	pointer-events: auto;
	padding-top: 16px;
	overscroll-behavior-y: contain;

	${({ $lockVerticalTouch }) =>
		$lockVerticalTouch &&
		css`
			touch-action: none;
		`}
`;

export const ViewersPanelHeader = styled.div`
	padding: 0 16px 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const ViewersPanelTitle = styled.h3`
	position: relative;
	color: #fff;
	font-size: clamp(16px, 4cqi, 20px);
	font-weight: 600;
	margin: 0;
	text-align: center;
	width: 100%;

	${CloseButton} {
		position: absolute;
		right: 0;
		top: -5px;
	}
`;

export const ViewersPanelList = styled.div<{
	$lockVerticalTouch?: boolean;
}>`
	overflow-y: auto;
	padding: 8px 0;
	-webkit-overflow-scrolling: touch;
	overscroll-behavior-y: contain;

	${({ $lockVerticalTouch }) =>
		$lockVerticalTouch &&
		css`
			touch-action: none;
		`}
`;

export const ViewersPanelEmptyState = styled.div`
	padding: 16px;
	color: rgba(255, 255, 255, 0.7);
	font-size: clamp(16px, 4cqi, 20px);
	line-height: 1.4;
`;

export const ViewersListItemWrap = styled.div`
	display: flex;
	align-items: center;
	padding: 6px 12px;
	gap: 12px;
	background: transparent;
	transition: background 0.2s;

	&:active {
		background: rgba(255, 255, 255, 0.05);
	}
`;

export const ViewersListItemInfo = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	flex: 1;
	min-width: 0;

	strong {
		font-size: clamp(14px, 3cqi, 16px);
		color: #fff;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	span {
		font-size: clamp(14px, 3cqi, 16px);
		color: rgba(255, 255, 255, 0.6);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

export const StorySwipeSliderContent = styled(motion.div)`
	position: absolute;
	top: 0;
	left: 0;
	z-index: 1;
	box-sizing: border-box;
	min-width: 0;
	min-height: 0;
	height: 100%;
	width: 100%;
	pointer-events: auto;
	transform-origin: top center;
`;

export const StorySwipeSliderWrap = styled(motion.div)`
	position: relative;
	box-sizing: border-box;
	width: max-content;
	height: 100%;
	display: flex;
	gap: 20px;
`;

/** Горизонтальный трек: ширина слайда совпадает с вьюпортом (100cqi). */

export const StoryThumbnailItemWrap = styled(motion.div)<{
	$pinchExpanded?: boolean;
}>`
	position: relative;
	box-sizing: border-box;
	flex-shrink: 0;
	min-width: ${STORY_CARD_MIN_WIDTH};
	width: 100cqi;
	height: 100%;
	border-radius: 4px;
	overflow: ${({ $pinchExpanded }) =>
		$pinchExpanded ? 'visible' : 'hidden'};
	z-index: ${({ $pinchExpanded }) => ($pinchExpanded ? 50 : 'auto')};
	pointer-events: auto;
	transform-origin: center;
	cursor: pointer;
	-webkit-tap-highlight-color: transparent;

	img {
		object-fit: cover;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
		pointer-events: none;
	}
`;

/** Оболочка: pinch через transform; `transform-origin` на время жеста выставляет useStoryCoverPinch. */
export const StoryPinchZoomTransformShell = styled.div<{ $touchPan?: boolean }>`
	position: relative;
	width: 100%;
	height: 100%;
	min-height: 100%;
	box-sizing: border-box;
	/* В режиме story — только pinch; в ленте миниатюр — pan-x, чтобы Framer тянул рельс. */
	touch-action: ${({ $touchPan }) => ($touchPan ? 'pan-x' : 'none')};
`;

/**
 * Слой жестов pinch на весь кадр; визуальные половины (StoryTapZone) ниже, не перехватывают ввод.
 */
export const StoryPinchZoomSlot = styled.div<{ $railPinchExpanded?: boolean }>`
	position: absolute;
	inset: 0;
	z-index: ${({ $railPinchExpanded }) => ($railPinchExpanded ? 90 : 5)};
	box-sizing: border-box;
	overflow: visible;
`;

export const StoryThumbnailPreviewBackground = styled(motion.div)`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 170px;
	z-index: 20;
	background: linear-gradient(
		to top,
		rgba(0, 0, 0, 0.8) 5%,
		rgba(0, 0, 0, 0.7) 20%,
		transparent 100%
	);
	pointer-events: none;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
`;

export const StoryThumbnailPreviewLayer = styled(motion.div)`
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	display: flex;
	align-items: flex-end;
	justify-content: flex-start;
	pointer-events: none;
	z-index: 20;
`;

export const StoryThumbnailPackedOffsetLayer = styled(motion.div)`
	position: relative;
	pointer-events: none;
`;

export const StoryThumbnailScaleLayer = styled(motion.div)<{
	$allowPointerEvents?: boolean;
}>`
	width: 100%;
	height: 100%;
	transform-origin: top center;
	pointer-events: ${({ $allowPointerEvents = true }) =>
		$allowPointerEvents ? 'auto' : 'none'};
`;
