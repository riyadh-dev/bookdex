/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */

export default {
	plugins: [
		'@trivago/prettier-plugin-sort-imports',
		'prettier-plugin-tailwindcss',
	],

	trailingComma: 'es5',
	tabWidth: 4,
	semi: false,
	useTabs: true,
	singleQuote: true,
	jsxSingleQuote: true,
	endOfLine: 'lf',
	printWidth: 80,

	importOrder: [
		'^@/pages/(.*)?$',
		'^@/layouts/(.*)?$',
		'^@/components/(.*)?$',
		'^@/libs/(.*)?$',
		'^@/types',
		'^@/(.*)?$',
		'^[./]',
	],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,

	tailwindFunctions: ['clsx', 'cn'],
	tailwindAttributes: [
		'class',
		'className',
		'ngClass',
		'class:list',
		'classList',
	],
}
