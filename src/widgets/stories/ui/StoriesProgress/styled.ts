import { motion } from 'framer-motion';
import styled from 'styled-components';

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
