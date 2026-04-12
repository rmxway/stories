import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	compiler: {
		styledComponents: true,
	},
	images: {
		unoptimized: true,
	},
	reactStrictMode: true,
	// Allow dev assets from this LAN host (see Next.js cross-origin dev warning).
	allowedDevOrigins: ['192.168.1.66'],
	/** Статика из `public/img` — чтобы браузер не тянул JPEG заново при каждом свайпе. */
	async headers() {
		return [
			{
				source: '/img/:path*',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=31536000, stale-while-revalidate=86400',
					},
				],
			},
		];
	},
};

export default nextConfig;
