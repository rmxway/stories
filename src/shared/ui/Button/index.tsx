import { forwardRef } from 'react';

import { Icon } from '../Icon';
import { ButtonProps, StyledButton } from './styled';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, $icon, ...props }, ref) => {
		return (
			<StyledButton type="button" {...props} ref={ref}>
				{$icon && <Icon icon={$icon} />}
				<span>{children}</span>
			</StyledButton>
		);
	},
);
Button.displayName = 'Button';
