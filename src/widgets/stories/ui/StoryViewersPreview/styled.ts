import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

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

export const ViewersPreviewCount = styled.div`
	color: #fff;
	font-size: clamp(14px, 3cqi, 18px);
	font-weight: 500;
	text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	gap: 6px;
`;
