import { motion } from 'framer-motion';
import styled from 'styled-components';

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
