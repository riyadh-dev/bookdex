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
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
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
			'@typescript-eslint/no-deprecated': 'error',
		},
	},
	prettier,
	{ ignores: ['dist', 'eslint.config.mjs', 'prettier.config.mjs'] },
]
