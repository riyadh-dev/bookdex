import { kyBookDex } from '@/config/ky'
import { ICurrentUser } from '@/definitions/interfaces'
import { TextInput } from '@/shared/text-input'
import {
	currentUserSignalSetter,
	disableAuthActionsSetter,
	isAuthModalOpenSetter,
} from '@/state/signals'
import { createForm, valiForm } from '@modular-forms/solid'
import { createMutation } from '@tanstack/solid-query'
import { createEffect } from 'solid-js'
import { Output, email, minLength, object, string } from 'valibot'

const SignInFormSchema = object({
	email: string([email()]),
	password: string([minLength(8)]),
})

type TSignInForm = Output<typeof SignInFormSchema>
type TSignIn = Omit<TSignInForm, 'confirmPassword' | 'confirmEmail'>

export default function SignInForm() {
	const [, { Form, Field }] = createForm<TSignInForm>({
		validate: valiForm(SignInFormSchema),
	})

	const setCurrentUser = currentUserSignalSetter
	const setModalOpen = isAuthModalOpenSetter
	const mutation = createMutation(() => ({
		mutationFn: (data: TSignIn) =>
			kyBookDex
				.post('auth/sign-in', { json: data, credentials: 'include' })
				.json<ICurrentUser>(),
		onSuccess(currentUser) {
			setCurrentUser(currentUser)
			setModalOpen(false)
		},
	}))

	const handleSubmit = (data: TSignIn) => {
		mutation.mutate(data)
	}

	const setDisable = disableAuthActionsSetter
	createEffect(() => {
		mutation.isPending ? setDisable(true) : setDisable(false)
	})

	return (
		<Form onSubmit={handleSubmit} class='mx-auto space-y-4'>
			<Field name='email'>
				{(field, props) => (
					<TextInput
						{...props}
						type='email'
						placeholder='Email'
						error={field.error}
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
			<button
				type='submit'
				disabled={mutation.isPending}
				class='h-12 w-full rounded bg-orange-600 px-4 text-center text-xl font-semibold text-white'
			>
				{mutation.isPending
					? 'Loading...'
					: mutation.isError
						? 'Error'
						: 'Sign In'}
			</button>
		</Form>
	)
}
