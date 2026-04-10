import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	compiler: {
		styledComponents: true,
	},
	reactStrictMode: true,
	// Allow dev assets from this LAN host (see Next.js cross-origin dev warning).
	allowedDevOrigins: ['192.168.1.66'],
};

export default nextConfig;
