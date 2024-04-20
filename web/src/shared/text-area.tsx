import clsx from 'clsx'
import { BiSolidErrorCircle } from 'solid-icons/bi'
import { JSX, splitProps } from 'solid-js'

type TextInputProps = {
	name: string
	label?: string
	placeholder?: string
	rows?: number
	value: string | undefined
	error: string
	required?: boolean
	// eslint-disable-next-line no-unused-vars
	ref: (el: HTMLTextAreaElement) => void
	onInput: JSX.EventHandler<HTMLTextAreaElement, InputEvent>
	onChange: JSX.EventHandler<HTMLTextAreaElement, Event>
	onBlur: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>
}

export function TextArea(props: TextInputProps) {
	const [, inputProps] = splitProps(props, ['value', 'label', 'error'])
	return (
		<div class='space-y-2'>
			{props.label && (
				<label for={props.name}>
					{props.label} {props.required && <span>*</span>}
				</label>
			)}
			<textarea
				{...inputProps}
				id={props.name}
				rows={props.rows || 3}
				value={props.value || ''}
				aria-invalid={!!props.error}
				aria-errormessage={`${props.name}-error`}
				class={clsx(
					props.error
						? 'border-rose-600 bg-rose-400/5 text-red-400 placeholder:text-red-400/75 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500'
						: 'border-gray-400 bg-transparent',
					'w-full shrink-0 rounded border p-4'
				)}
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
