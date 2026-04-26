import styled, { css } from 'styled-components';

export const ViewersPreviewAvatarWrap = styled.div<{
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
