import { BiSolidErrorCircle } from 'solid-icons/bi'
import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

interface TextInputProps {
	name: string
	type: 'text' | 'email' | 'tel' | 'password' | 'url' | 'date'
	label?: string
	placeholder?: string
	value: string | undefined
	error: string
	required?: boolean
	disabled?: boolean

	ref: (el: HTMLInputElement) => void
	onInput: JSX.EventHandler<HTMLInputElement, InputEvent>
	onChange: JSX.EventHandler<HTMLInputElement, Event>
	onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>
}

export function TextInput(props: TextInputProps) {
	const [, inputProps] = splitProps(props, ['value', 'label', 'error'])
	return (
		<div class='space-y-2'>
			{props.label && (
				<label for={props.name}>
					{props.label} {props.required && <span>*</span>}
				</label>
			)}
			<input
				{...inputProps}
				id={props.name}
				value={props.value ?? ''}
				aria-invalid={!!props.error}
				aria-errormessage={`${props.name}-error`}
				classList={{
					'border-rose-600 bg-rose-400/5 text-red-400 placeholder:text-red-400/75 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none':
						!!props.error,
					'border-gray-400 bg-transparent': !props.error,
					'h-12 w-full rounded border border-white px-4 py-2': true,
				}}
			/>
			{props.error && (
				<div
					id={`${props.name}-error`}
					class='flex items-center gap-x-2 fill-rose-400 text-rose-500'
				>
					<BiSolidErrorCircle class='text-lg' />
					<span class='text-sm'>{props.error}</span>
				</div>
			)}
		</div>
	)
}
