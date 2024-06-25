import { TextInput } from '@/components/text-input'
import { api } from '@/config/ky'
import { setStore } from '@/store'
import { SubmitHandler, createForm, valiForm } from '@modular-forms/solid'
import { createMutation } from '@tanstack/solid-query'
import { HTTPError } from 'ky'
import { createEffect, createSignal } from 'solid-js'
import * as v from 'valibot'

const SignUpFormSchema = v.pipe(
	v.object({
		username: v.pipe(v.string(), v.minLength(3)),
		email: v.pipe(v.string(), v.email()),
		confirmEmail: v.pipe(v.string(), v.email()),
		password: v.pipe(v.string(), v.minLength(8)),
		confirmPassword: v.pipe(v.string(), v.minLength(8)),
	}),
	v.forward(
		v.partialCheck(
			[['password'], ['confirmPassword']],
			(input) => input.password === input.confirmPassword,
			"Passwords don't match"
		),
		['password']
	),
	v.forward(
		v.partialCheck(
			[['email'], ['confirmEmail']],
			(input) => input.email === input.confirmEmail,
			"Emails don't match"
		),
		['email']
	)
)

type TSignUpForm = v.InferInput<typeof SignUpFormSchema>
type TSignUp = Omit<TSignUpForm, 'confirmPassword' | 'confirmEmail'>

export default function SignUpForm() {
	const [, { Form, Field }] = createForm<TSignUpForm>({
		validate: valiForm(SignUpFormSchema),
	})

	const [isEmailDuplicated, setIsEmailDuplicated] = createSignal(false)
	const mutation = createMutation(() => ({
		mutationFn: (data: TSignUp) =>
			api.post('auth/sign-up', { json: data }).json(),
		onError(error) {
			if ((error as HTTPError).response.status === 409) {
				setIsEmailDuplicated(true)
			}
		},
	}))

	const handleSubmit: SubmitHandler<TSignUpForm> = ({
		confirmPassword: _,
		confirmEmail: __,
		...body
	}) => {
		mutation.mutate(body)
	}

	createEffect(() => {
		setStore('disableAuthActions', mutation.isPending)
	})

	return (
		<Form onSubmit={handleSubmit} class='mx-auto space-y-4'>
			<Field name='username'>
				{(field, props) => (
					<TextInput
						{...props}
						type='text'
						placeholder='Username'
						error={field.error}
						value={field.value}
						required
					/>
				)}
			</Field>
			<div class='grid grid-cols-2 gap-4'>
				<Field name='email'>
					{(field, props) => (
						<TextInput
							{...props}
							type='email'
							placeholder='Email'
							error={
								isEmailDuplicated()
									? ' Email already exists'
									: field.error
							}
							value={field.value}
							required
						/>
					)}
				</Field>
				<Field name='confirmEmail'>
					{(field, props) => (
						<TextInput
							{...props}
							type='email'
							placeholder='confirm Email'
							error={
								isEmailDuplicated()
									? ' Email already exists'
									: field.error
							}
							value={field.value}
							required
						/>
					)}
				</Field>
				<Field name='password'>
					{(field, props) => (
						<TextInput
							{...props}
							type='password'
							placeholder='Password'
							error={field.error}
							value={field.value}
							required
						/>
					)}
				</Field>
				<Field name='confirmPassword'>
					{(field, props) => (
						<TextInput
							{...props}
							type='password'
							placeholder='Confirm Password'
							error={field.error}
							value={field.value}
							required
						/>
					)}
				</Field>
			</div>
			<button
				type='submit'
				disabled={mutation.isPending}
				class='h-12 w-full rounded bg-orange-600 px-4 text-center text-xl font-semibold text-white'
			>
				{mutation.isPending
					? 'Loading...'
					: mutation.isError
						? 'Error'
						: 'Sign Up'}
			</button>
		</Form>
	)
}
