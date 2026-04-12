import blurMap from '@/generated/blur-map.json';

export function getBlurDataURL(src: string): string | undefined {
	const url = blurMap[src as keyof typeof blurMap];
	return typeof url === 'string' ? url : undefined;
}
