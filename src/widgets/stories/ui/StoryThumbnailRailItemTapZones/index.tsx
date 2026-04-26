'use client';

import { ComponentProps, useState } from 'react';

import { StoryTapZone } from './styled';

type StoryTapZonePointerPressProps = Pick<
	ComponentProps<typeof StoryTapZone>,
	'onPointerDown' | 'onPointerUp' | 'onPointerCancel' | 'onPointerLeave'
>;

function tapZonePressPointerProps(
	setPressed: (value: boolean) => void,
): StoryTapZonePointerPressProps {
	return {
		onPointerDown: () => setPressed(true),
		onPointerUp: () => setPressed(false),
		onPointerCancel: () => setPressed(false),
		onPointerLeave: () => setPressed(false),
	};
}

type StoryTapOnClick = ComponentProps<typeof StoryTapZone>['onClick'];

type StoryThumbnailRailItemTapZonesProps = {
	onTapPrevious: StoryTapOnClick;
	onTapNext: StoryTapOnClick;
};

/**
 * Desktop-кнопки поверх кадра. На touch-устройствах CSS отключает pointer-events,
 * чтобы pinch попадал в `StoryPinchZoomTransformShell` по всей картинке.
 */
export function StoryThumbnailRailItemTapZones({
	onTapPrevious,
	onTapNext,
}: StoryThumbnailRailItemTapZonesProps) {
	const [leftTapPressed, setLeftTapPressed] = useState(false);
	const [rightTapPressed, setRightTapPressed] = useState(false);

	return (
		<>
			<StoryTapZone
				type="button"
				aria-label="Предыдущий сторис"
				$side="left"
				$pressed={leftTapPressed}
				{...tapZonePressPointerProps(setLeftTapPressed)}
				onClick={onTapPrevious}
			/>
			<StoryTapZone
				type="button"
				aria-label="Следующий сторис"
				$side="right"
				$pressed={rightTapPressed}
				{...tapZonePressPointerProps(setRightTapPressed)}
				onClick={onTapNext}
			/>
		</>
	);
}
