import {
	disableAuthActionsAccessor,
	isAuthModalOpenSetter,
} from '@/state/signals';
import { FaSolidXmark } from 'solid-icons/fa';
import { Match, Show, Switch, createSignal } from 'solid-js';
import SignInForm from './sign-in';
import SignUpForm from './sign-up';

export default function AuthForms() {
	const [formType, setFormType] = createSignal<
		'sign-up' | 'sign-in' | 'mock-list'
	>('sign-in');

	const setOpen = isAuthModalOpenSetter;
	const disabled = disableAuthActionsAccessor;

	return (
		<div class='mx-auto max-w-xl rounded-xl border bg-neutral-800 p-6'>
			<div class='relative py-6'>
				<button
					aria-label='close'
					onClick={() => setOpen(false)}
					disabled={disabled()}
					class='absolute flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-gray-700'
				>
					<FaSolidXmark fill='white' />
				</button>

				<h1 class='text-center text-lg font-bold'>Log in or sign up</h1>
			</div>

			<div class='border-t' />

			<div class='space-y-5 p-6'>
				<h1 class='text-2xl font-bold'>Welcome to BookDex</h1>
				<Switch>
					<Match when={formType() === 'sign-up'}>
						<SignUpForm />
					</Match>
					<Match when={formType() === 'sign-in'}>
						<SignInForm />
					</Match>
					<Match when={formType() === 'mock-list'}>
						<h1>Not Implemented Yet</h1>
					</Match>
				</Switch>

				<div class='flex items-center gap-x-5'>
					<span class='grow border-t' />
					<span>or</span>
					<span class='grow border-t' />
				</div>

				<Show when={formType() !== 'mock-list'}>
					<button
						disabled={disabled()}
						onClick={() => setFormType('mock-list')}
						class='relative h-12 w-full animate-pulse rounded-lg border bg-white text-black'
					>
						<i class='ri-user-smile-line absolute bottom-1/2 left-6 translate-y-1/2 text-2xl' />
						<span class='font-bold'>Continue with Mock account</span>
					</button>
				</Show>

				<Switch>
					<Match when={formType() !== 'sign-up'}>
						<button
							disabled={disabled()}
							onClick={() => setFormType('sign-up')}
							class='relative h-12 w-full rounded-lg border border-white'
						>
							<i class='ri-mail-line absolute bottom-1/2 left-6 translate-y-1/2 text-2xl' />
							<span class='font-bold'>Sign up with Email and password</span>
						</button>
					</Match>
					<Match when={formType() !== 'sign-in'}>
						<button
							disabled={disabled()}
							onClick={() => setFormType('sign-in')}
							class='relative h-12 w-full rounded-lg border border-black dark:border-white'
						>
							<i class='ri-mail-line absolute bottom-1/2 left-6 translate-y-1/2 text-2xl' />
							<span class='font-bold'>Login with Email and password</span>
						</button>
					</Match>
				</Switch>
			</div>
		</div>
	);
}
