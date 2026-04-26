import Image from 'next/image';
import styled from 'styled-components';

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
