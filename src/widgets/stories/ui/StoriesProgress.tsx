'use client';

import { animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { STORY_DURATION_SEC } from '../constants';
import {
	ProgressFill,
	ProgressFillComplete,
	ProgressRow,
	ProgressTrack,
} from './styled';

const MotionFill = motion(ProgressFill);

type ActiveStoryProgressFillProps = {
	segmentIndex: number;
	holdPaused: boolean;
	onSegmentComplete: (segmentIndex: number) => void;
};

function ActiveStoryProgressFill({
	segmentIndex,
	holdPaused,
	onSegmentComplete,
}: ActiveStoryProgressFillProps) {
	const scaleX = useMotionValue(0);
	const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

	useEffect(() => {
		scaleX.set(0.001);
		controlsRef.current?.stop();
		controlsRef.current = animate(scaleX, 1, {
			duration: STORY_DURATION_SEC,
			ease: 'linear',
			onComplete: () => {
				onSegmentComplete(segmentIndex);
			},
		});
		return () => {
			controlsRef.current?.stop();
		};
	}, [segmentIndex, scaleX, onSegmentComplete]);

	useEffect(() => {
		const c = controlsRef.current;
		if (!c) {
			return;
		}
		if (holdPaused) {
			c.pause();
		} else {
			c.play();
		}
	}, [holdPaused]);

	return <MotionFill style={{ scaleX }} />;
}

type StoriesProgressProps = {
	count: number;
	activeIndex: number;
	holdPaused: boolean;
	onSegmentComplete: (segmentIndex: number) => void;
};

export function StoriesProgress({
	count,
	activeIndex,
	holdPaused,
	onSegmentComplete,
}: StoriesProgressProps) {
	return (
		<ProgressRow>
			{Array.from({ length: count }, (_, index) => (
				<ProgressTrack key={index}>
					{index < activeIndex ? <ProgressFillComplete /> : null}
					{index === activeIndex ? (
						<ActiveStoryProgressFill
							segmentIndex={index}
							holdPaused={holdPaused}
							onSegmentComplete={onSegmentComplete}
						/>
					) : null}
				</ProgressTrack>
			))}
		</ProgressRow>
	);
}
