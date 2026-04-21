import { MotionProps } from 'framer-motion';
import { forwardRef } from 'react';

import { Icon } from '../Icon';
import { ButtonProps, StyledButton } from './styled';

export const Button = forwardRef<HTMLButtonElement, MotionProps & ButtonProps>(
	({ children, $icon, disabled, ...props }, ref) => {
		return (
			<StyledButton
				type="button"
				disabled={disabled}
				whileTap={disabled ? {} : { scale: 0.97 }}
				whileHover={
					disabled ? {} : { scale: 1.02, filter: 'brightness(1.1)' }
				}
				transition={{ type: 'tween', duration: 0.2 }}
				{...props}
				ref={ref}
			>
				{$icon && <Icon icon={$icon} />}
				<span>{children}</span>
			</StyledButton>
		);
	},
);
Button.displayName = 'Button';
