import { motion } from 'framer-motion';
import styled from 'styled-components';

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
