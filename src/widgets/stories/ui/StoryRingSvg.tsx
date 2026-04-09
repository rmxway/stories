'use client';

const CX = 50;
const CY = 50;
const R = 46;
const STROKE = 3.2;

const STROKE_SEEN = '#5c6e6d';
const GRAD_TOP = '#4ade80';
const GRAD_BOTTOM = '#3b9cf6';

/** Промежуток между сегментами (°). У `round` торцы перекрывают щель; у `butt` зазор виден. */
const GAP_DEG = 8;

const R_OUT = R + STROKE / 2;

/** Стабильный id: один экземпляр кольца на странице, без смены `useId` при перемонтировании превью. */
const GRADIENT_ID = 'stories-preview-ring-gradient';

type StoryRingSvgProps = {
	seenByIndex: boolean[];
	seenStorageLoaded: boolean;
};

export function StoryRingSvg({
	seenByIndex,
	seenStorageLoaded,
}: StoryRingSvgProps) {
	const n = seenByIndex.length;

	if (n === 0) {
		return null;
	}

	const C = 2 * Math.PI * R;
	const gapLen = n <= 1 ? 0 : (GAP_DEG / 360) * C;
	const arcLen = n <= 1 ? C : (C - n * gapLen) / n;
	const unitLen = arcLen + gapLen;
	const needsGradient =
		seenStorageLoaded && seenByIndex.some((seen) => !seen);

	return (
		<svg
			width="100%"
			height="100%"
			viewBox="0 0 100 100"
			aria-hidden
			focusable="false"
		>
			{needsGradient ? (
				<defs>
					<linearGradient
						id={GRADIENT_ID}
						x1={CX}
						y1={CY - R_OUT}
						x2={CX}
						y2={CY + R_OUT}
						gradientUnits="userSpaceOnUse"
						gradientTransform="rotate(90 50 50)"
					>
						<stop offset="0%" stopColor={GRAD_TOP} />
						<stop offset="100%" stopColor={GRAD_BOTTOM} />
					</linearGradient>
				</defs>
			) : null}

			{seenByIndex.map((seen, i) => (
				<circle
					key={i}
					cx={CX}
					cy={CY}
					r={R}
					fill="none"
					stroke={
						!seenStorageLoaded || seen
							? STROKE_SEEN
							: `url(#${GRADIENT_ID})`
					}
					strokeWidth={STROKE}
					strokeLinecap="round"
					transform={`rotate(-90 ${CX} ${CY})`}
					strokeDasharray={`${arcLen} ${C - arcLen}`}
					strokeDashoffset={-i * unitLen}
				/>
			))}
		</svg>
	);
}
