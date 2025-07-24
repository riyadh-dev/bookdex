import js from '@eslint/js'
import prettier from 'eslint-config-prettier/flat'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import solid from 'eslint-plugin-solid/configs/typescript'
import ts from 'typescript-eslint'

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export default [
	js.configs.recommended,
	jsxA11y.flatConfigs.recommended,
	...ts.configs.recommendedTypeChecked,
	...ts.configs.stylisticTypeChecked,
	{
		...solid,
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.json', './tsconfig.node.json'],
			},
		},
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/consistent-type-imports': 'error',
		},
	},
	prettier,
	{ ignores: ['dist'] },
]
