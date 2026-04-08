'use client';

import { useId } from 'react';

const CX = 50;
const CY = 50;
const R = 46;
const STROKE = 3.2;

const STROKE_SEEN = '#5c6e6d';
const STROKE_NEW_SOLID = '#4ade94';
const GRAD_TOP = '#4ade80';
const GRAD_BOTTOM = '#3b82f6';

/** Промежуток между сегментами (°). У `round` торцы перекрывают щель; у `butt` зазор виден. */
const GAP_DEG = 8;

const R_OUT = R + STROKE / 2;
const R_IN = R - STROKE / 2;

type StoryRingSvgProps = {
	seenByIndex: boolean[];
};

export function StoryRingSvg({ seenByIndex }: StoryRingSvgProps) {
	const n = seenByIndex.length;
	const uid = useId().replace(/:/g, '');
	const gradId = `${uid}-grad`;
	const ringMaskId = `${uid}-ring-mask`;

	if (n === 0) {
		return null;
	}

	const C = 2 * Math.PI * R;
	const gapLen = n <= 1 ? 0 : (GAP_DEG / 360) * C;
	const arcLen = n <= 1 ? C : (C - n * gapLen) / n;
	const unitLen = arcLen + gapLen;

	const singleSeen = n === 1 && seenByIndex[0];
	const singleNew = n === 1 && !seenByIndex[0];

	return (
		<svg
			width="100%"
			height="100%"
			viewBox="0 0 100 100"
			aria-hidden
			focusable="false"
		>
			{n === 1 ? (
				<>
					<defs>
						<mask id={ringMaskId}>
							<circle cx={CX} cy={CY} r={R_OUT} fill="white" />
							<circle cx={CX} cy={CY} r={R_IN} fill="black" />
						</mask>
						{singleNew ? (
							<linearGradient
								id={gradId}
								x1={CX}
								y1={CY - R_OUT}
								x2={CX}
								y2={CY + R_OUT}
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor={GRAD_TOP} />
								<stop offset="100%" stopColor={GRAD_BOTTOM} />
							</linearGradient>
						) : null}
					</defs>
					<rect
						x={0}
						y={0}
						width={100}
						height={100}
						fill={singleSeen ? STROKE_SEEN : `url(#${gradId})`}
						mask={`url(#${ringMaskId})`}
					/>
				</>
			) : (
				seenByIndex.map((seen, i) => (
					<circle
						key={i}
						cx={CX}
						cy={CY}
						r={R}
						fill="none"
						stroke={seen ? STROKE_SEEN : STROKE_NEW_SOLID}
						strokeWidth={STROKE}
						strokeLinecap="round"
						transform={`rotate(-90 ${CX} ${CY})`}
						strokeDasharray={`${arcLen} ${C - arcLen}`}
						strokeDashoffset={-i * unitLen}
					/>
				))
			)}
		</svg>
	);
}
