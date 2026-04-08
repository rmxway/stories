import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	{
		ignores: [
			'.next/**',
			'node_modules/**',
			'dist/**',
			'out/**',
			'build/**',
			'.yarn/**',
			'.pnp.cjs',
			'.pnp.loader.mjs',
		],
	},
	...compat.config({
		extends: [
			'next/core-web-vitals',
			'plugin:import/recommended',
			'plugin:import/typescript',
			'prettier',
		],
		plugins: ['import', 'simple-import-sort', 'unused-imports', 'prettier'],
		settings: {
			'import/resolver': {
				typescript: {},
				node: {
					extensions: ['.ts', '.tsx', '.js', '.jsx'],
				},
			},
		},
		rules: {
			'@next/next/no-img-element': 'off',
			'@next/next/no-export-all-in-page': 'off',
			'@next/next/no-page-custom-font': 'off',
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'import/no-duplicates': 'error',
			'import/no-extraneous-dependencies': [
				'error',
				{
					devDependencies: true,
					packageDir: __dirname,
				},
			],
			'import/no-named-as-default': 'error',
			'import/prefer-default-export': 'off',
			'import/extensions': [
				'error',
				'ignorePackages',
				{
					ts: 'never',
					tsx: 'never',
				},
			],
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
		},
	}),
];

export default eslintConfig;
