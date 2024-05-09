import { onCleanup, type Accessor } from 'solid-js'

export default function clickOutside(
	el: HTMLElement,
	accessor: Accessor<() => void>
) {
	const onClick = (e: MouseEvent) =>
		!el.contains(e.target as Node) && accessor()?.()

	document.body.addEventListener('click', onClick)

	onCleanup(() => document.body.removeEventListener('click', onClick))
}

/* eslint-disable no-unused-vars */
declare module 'solid-js' {
	namespace JSX {
		interface Directives {
			clickOutside: () => void
		}
	}
}
