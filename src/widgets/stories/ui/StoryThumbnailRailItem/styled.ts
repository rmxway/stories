import { motion } from 'framer-motion';
import Image from 'next/image';
import styled, { keyframes } from 'styled-components';

const STORY_CARD_MIN_WIDTH = '120px';

const storyShimmerSlide = keyframes`
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(250%);
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
