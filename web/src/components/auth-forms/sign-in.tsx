import { createForm, valiForm } from '@modular-forms/solid'
import { useMutation } from '@tanstack/solid-query'
import { createEffect } from 'solid-js'
import * as v from 'valibot'

import { TextInput } from '@/components/text-input'

import api from '@/libs/api'

import type { ICurrentUser } from '@/types'

import { setStore } from '@/store'

const SignInFormSchema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.minLength(8)),
})

type TSignInForm = v.InferInput<typeof SignInFormSchema>
type TSignIn = Omit<TSignInForm, 'confirmPassword' | 'confirmEmail'>

export default function SignInForm() {
	const [, { Form, Field }] = createForm<TSignInForm>({
		validate: valiForm(SignInFormSchema),
	})

	const mutation = useMutation(() => ({
		mutationFn: (data: TSignIn) =>
			api.post('auth/sign-in', { json: data }).json<ICurrentUser>(),
		onSuccess(currentUser) {
			setStore('currentUser', currentUser)
			setStore('authModalOpen', false)
		},
	}))

	const handleSubmit = (data: TSignIn) => {
		mutation.mutate(data)
	}

	createEffect(() => {
		setStore('disableAuthActions', mutation.isPending)
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
