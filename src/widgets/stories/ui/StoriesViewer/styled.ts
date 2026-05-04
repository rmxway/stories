import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

import {
	STORY_SHELL_HEIGHT_OVER_WIDTH,
	STORY_SHELL_MIN_WIDTH_PX,
} from '@/widgets/stories/constants';

const STORY_CARD_ASPECT_RATIO = `1/${STORY_SHELL_HEIGHT_OVER_WIDTH}`;

const storyShellFrameStyles = css`
	box-sizing: border-box;
	width: min(100%, 100dvh / ${STORY_SHELL_HEIGHT_OVER_WIDTH});
	height: auto;
	max-height: 100dvh;
	max-width: 100%;
	min-width: ${STORY_SHELL_MIN_WIDTH_PX}px;
	aspect-ratio: ${STORY_CARD_ASPECT_RATIO};
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

export const OverlayBackdropFadeLayer = styled(motion.div)`
	position: absolute;
	inset: 0;
`;

export const StoryShellScaleFrame = styled(motion.div)`
	${storyShellFrameStyles}
	position: relative;
	z-index: 1;
	display: flex;
	transform-origin: center center;
`;

export const StoryShell = styled(motion.div)<{ $viewersChrome?: boolean }>`
	position: relative;
	z-index: 1;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
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

/** Слой слайдера + панели зрителей: родитель с `pointer-events: none`, клики ловят дети с `auto`. */
export const ViewersLayer = styled(motion.div)`
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
