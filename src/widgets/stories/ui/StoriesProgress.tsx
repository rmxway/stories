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

const MotionFill = motion.create(ProgressFill);

type ActiveStoryProgressFillProps = {
	segmentIndex: number;
	segmentReplayToken: number;
	holdPaused: boolean;
	isImageLoaded: boolean;
	onSegmentComplete: (segmentIndex: number) => void;
};

function ActiveStoryProgressFill({
	segmentIndex,
	segmentReplayToken,
	holdPaused,
	isImageLoaded,
	onSegmentComplete,
}: ActiveStoryProgressFillProps) {
	const scaleX = useMotionValue(0);
	const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

	useEffect(() => {
		scaleX.set(0.001);
		controlsRef.current?.stop();
		controlsRef.current = null;

		if (!isImageLoaded) {
			return;
		}

		controlsRef.current = animate(scaleX, 1, {
			duration: STORY_DURATION_SEC,
			ease: 'linear',
			onComplete: () => {
				onSegmentComplete(segmentIndex);
			},
		});
		return () => {
			controlsRef.current?.stop();
			controlsRef.current = null;
		};
	}, [
		segmentIndex,
		segmentReplayToken,
		isImageLoaded,
		scaleX,
		onSegmentComplete,
	]);

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
	}, [holdPaused, isImageLoaded]);

	return <MotionFill style={{ scaleX }} />;
}

type StoriesProgressOwnProps = {
	count: number;
	activeIndex: number;
	segmentReplayToken: number;
	holdPaused: boolean;
	isImageLoaded: boolean;
	onSegmentComplete: (segmentIndex: number) => void;
};

export type StoriesProgressProps = StoriesProgressOwnProps;

export const StoriesProgress = function StoriesProgress({
	count,
	activeIndex,
	segmentReplayToken,
	holdPaused,
	isImageLoaded,
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
							segmentReplayToken={segmentReplayToken}
							holdPaused={holdPaused}
							isImageLoaded={isImageLoaded}
							onSegmentComplete={onSegmentComplete}
						/>
					) : null}
				</ProgressTrack>
			))}
		</ProgressRow>
	);
};
