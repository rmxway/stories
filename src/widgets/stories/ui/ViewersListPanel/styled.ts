import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

import { CloseButton } from '../shared/styled';

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
