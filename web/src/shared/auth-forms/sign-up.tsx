import { kyBookDex } from '@/config/ky';
import { TextInput } from '@/shared/text-input';
import { disableAuthActionsSetter } from '@/state/signals';
import { createForm, valiForm } from '@modular-forms/solid';
import { createMutation } from '@tanstack/solid-query';
import { HTTPError } from 'ky';
import { createEffect, createSignal } from 'solid-js';
import { Output, email, minLength, object, string } from 'valibot';

const SignUpFormSchema = object({
	username: string([minLength(3)]),
	email: string([email()]),
	confirmEmail: string([email()]),
	password: string([minLength(8)]),
	confirmPassword: string([minLength(8)]),
});

type TSignUpForm = Output<typeof SignUpFormSchema>;
type TSignUp = Omit<TSignUpForm, 'confirmPassword' | 'confirmEmail'>;

export default function SignUpForm() {
	const [, { Form, Field }] = createForm<TSignUpForm>({
		validate: valiForm(SignUpFormSchema),
	});

	const [isEmailDuplicated, setIsEmailDuplicated] = createSignal(false);
	const mutation = createMutation(() => ({
		mutationFn: (data: TSignUp) =>
			kyBookDex.post('auth/sign-up', { json: data }).json(),
		onError(error) {
			if ((error as HTTPError).response.status === 409) {
				setIsEmailDuplicated(true);
			}
		},
	}));

	const handleSubmit = (data: TSignUp) => {
		mutation.mutate(data);
	};

	const setDisable = disableAuthActionsSetter;
	createEffect(() => {
		mutation.isPending ? setDisable(true) : setDisable(false);
	});

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
								isEmailDuplicated() ? ' Email already exists' : field.error
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
								isEmailDuplicated() ? ' Email already exists' : field.error
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
				class='h-12 w-full rounded-lg bg-orange-600 px-4 text-center text-xl font-semibold text-white'
			>
				{mutation.isPending
					? 'Loading...'
					: mutation.isError
					? 'Error'
					: 'Sign Up'}
			</button>
		</Form>
	);
}
