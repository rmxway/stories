import { forwardRef } from 'react';

import { ButtonProps, StyledButton } from './styled';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, ...props }, ref) => {
		return (
			<StyledButton type="button" {...props} ref={ref}>
				{children}
			</StyledButton>
		);
	},
);
Button.displayName = 'Button';
