import { Component, Show, createEffect } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Transition } from 'solid-transition-group'

interface IProps {
	Modal: Component
	isOpen: boolean
	close: () => void
}

export default function Modal(props: IProps) {
	createEffect(() => {
		const html = document.querySelector('html')
		if (html) {
			props.isOpen
				? html.classList.add('overflow-hidden')
				: html.classList.remove('overflow-hidden')
		}
	})

	return (
		<Portal>
			<Transition
				enterActiveClass='duration-200'
				enterClass='opacity-0'
				enterToClass='opacity-100'
				exitActiveClass='duration-200'
				exitClass='opacity-100'
				exitToClass='opacity-0'
			>
				<Show when={props.isOpen}>
					<div
						onClick={() => props.close()}
						class='fixed inset-0 z-20 bg-black/60 backdrop-blur-sm'
					/>
				</Show>
			</Transition>
			<Transition
				enterActiveClass='duration-300'
				enterClass='translate-y-[calc(50vh+50%)]'
				enterToClass='translate-y-0'
				exitActiveClass='duration-300'
				exitClass='translate-y-0'
				exitToClass='translate-y-[calc(50vh+50%)]'
			>
				<Show when={props.isOpen}>
					<div class='fixed inset-0 z-30 m-auto h-fit max-w-xl'>
						<props.Modal />
					</div>
				</Show>
			</Transition>
		</Portal>
	)
}
