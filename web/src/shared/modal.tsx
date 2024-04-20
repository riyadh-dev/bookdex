import { Accessor, Component, Setter, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Transition } from 'solid-transition-group'

interface IProps {
	Modal: Component
	isOpen: Accessor<boolean>
	setIsOpen: Setter<boolean>
}

export default function Modal(props: IProps) {
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
				<Show when={props.isOpen()}>
					<div
						onClick={() => props.setIsOpen(false)}
						class='fixed inset-0 bg-black/50'
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
				<Show when={props.isOpen()}>
					<div class='fixed inset-0 m-auto h-fit max-w-xl'>
						<props.Modal />
					</div>
				</Show>
			</Transition>
		</Portal>
	)
}
