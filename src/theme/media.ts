import { generateMedia } from 'styled-media-query';

interface BreakpointsType {
	xl: string;
	lg: string;
	md: string;
	sm: string;
	xs: string;
}

const breakpoints: BreakpointsType = {
	xl: '1400px',
	lg: '1280px',
	md: '1024px',
	sm: '768px',
	xs: '600px',
};

const media = generateMedia(breakpoints);

export { breakpoints, media };
export default media;
