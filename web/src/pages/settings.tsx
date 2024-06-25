import { TextInput } from '@/components/text-input'
import { apiWithAuth } from '@/config/ky'
import { persistedStore, setPersistedStore, setStore } from '@/store'
import { SubmitHandler, createForm, valiForm } from '@modular-forms/solid'
import { useNavigate } from '@solidjs/router'
import { createMutation } from '@tanstack/solid-query'
import { HTTPError } from 'ky'
import { createEffect, createSignal } from 'solid-js'
import * as v from 'valibot'

export default function SettingsPage() {
	const navigate = useNavigate()
	if (!persistedStore.token) {
		navigate('/', { replace: true })
	}

	return (
		<main class='px-8 pt-4'>
			<h1 class='pb-4 text-2xl font-semibold'>Settings</h1>
			<div class='flex flex-wrap justify-center gap-8'>
				<EditCurrentUserForm />
				<ChangePasswordForm />
			</div>
		</main>
	)
}

const EditCurrentUserFormSchema = v.pipe(
	v.object({
		username: v.pipe(v.string(), v.minLength(3)),
		email: v.pipe(v.string(), v.email()),
		confirmEmail: v.pipe(v.string(), v.email()),
	}),
	v.forward(
		v.partialCheck(
			[['email'], ['confirmEmail']],
			(input) => input.email === input.confirmEmail,
			"Emails don't match"
		),
		['email']
	)
)

const ChangePasswordFormSchema = v.pipe(
	v.object({
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
	)
)

type TEditCurrentUserForm = v.InferInput<typeof EditCurrentUserFormSchema>
type TChangePasswordForm = v.InferInput<typeof ChangePasswordFormSchema>

type TEditCurrentUserBody = Omit<TEditCurrentUserForm, 'confirmEmail'>
type TChangePasswordBody = Omit<TChangePasswordForm, 'confirmPassword'>

function EditCurrentUserForm() {
	const currentUser = persistedStore.currentUser!

	const [, { Form, Field }] = createForm<TEditCurrentUserForm>({
		validate: valiForm(EditCurrentUserFormSchema),
		initialValues: {
			username: currentUser.username,
			email: currentUser.email,
			confirmEmail: currentUser.email,
		},
	})

	const [isEmailDuplicated, setIsEmailDuplicated] = createSignal(false)
	const mutation = createMutation(() => ({
		mutationFn: (body: TEditCurrentUserBody) =>
			apiWithAuth.patch(`users/${currentUser.id}`, { json: body }).text(),
		onError(error) {
			if ((error as HTTPError).response.status === 409) {
				setIsEmailDuplicated(true)
			}
		},
		onSuccess: (_, vars) =>
			setPersistedStore('currentUser', {
				...currentUser,
				username: vars.username,
				email: vars.email,
			}),
	}))

	const handleSubmit: SubmitHandler<TEditCurrentUserForm> = ({
		confirmEmail: _,
		...body
	}) => {
		mutation.mutate(body)
	}

	createEffect(() => {
		setStore('disableAuthActions', mutation.isPending)
	})

	return (
		<Form
			onSubmit={handleSubmit}
			class='min-w-96 max-w-xl flex-1 space-y-6 rounded bg-neutral-700 px-8 py-4'
		>
			<h2 class='text-xl font-semibold'>Edit your Info</h2>
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
			<button
				type='submit'
				disabled={mutation.isPending}
				class='w-full rounded bg-orange-600 px-4 py-2 text-center text-xl font-semibold'
			>
				{mutation.isPending
					? 'Loading...'
					: mutation.isError
						? 'Error'
						: 'Save Changes'}
			</button>
		</Form>
	)
}

function ChangePasswordForm() {
	const currentUser = persistedStore.currentUser!

	const [, { Form, Field }] = createForm<TChangePasswordForm>({
		validate: valiForm(ChangePasswordFormSchema),
	})

	const mutation = createMutation(() => ({
		mutationFn: (body: TChangePasswordBody) =>
			apiWithAuth.patch(`users/${currentUser.id}`, { json: body }).text(),
	}))

	const handleSubmit: SubmitHandler<TChangePasswordForm> = ({ password }) => {
		mutation.mutate({ password })
	}

	createEffect(() => {
		setStore('disableAuthActions', mutation.isPending)
	})

	return (
		<Form
			onSubmit={handleSubmit}
			class='flex min-w-96 max-w-xl flex-1 flex-col gap-y-6 rounded bg-neutral-700 px-8 py-4'
		>
			<h2 class='text-xl font-semibold'>Change Password</h2>
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
			<button
				type='submit'
				disabled={mutation.isPending}
				class='mt-auto w-full rounded bg-orange-600 px-4 py-2 text-center text-xl font-semibold'
			>
				{mutation.isPending
					? 'Loading...'
					: mutation.isError
						? 'Error'
						: 'Save New Password'}
			</button>
		</Form>
	)
}
