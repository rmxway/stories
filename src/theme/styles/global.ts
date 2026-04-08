import '@public/assets/fonts/icofont/icofont.scss';

import { createGlobalStyle } from 'styled-components';

import { base, reset } from './';

const GlobalStyles = createGlobalStyle`
    ${reset};
    ${base};
`;

export { GlobalStyles };
export default GlobalStyles;
