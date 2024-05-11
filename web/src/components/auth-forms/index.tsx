import { setStore, store } from '@/store'
import { FaSolidXmark } from 'solid-icons/fa'
import { Match, Show, Switch, createSignal } from 'solid-js'
import MockIn from './mock-in'
import SignInForm from './sign-in'
import SignUpForm from './sign-up'

export default function AuthForms() {
	const [formType, setFormType] = createSignal<
		'sign-up' | 'sign-in' | 'mock-list'
	>('sign-in')

	return (
		<div class='mx-auto max-w-xl rounded bg-neutral-800 p-6'>
			<div class='relative py-6'>
				<button
					aria-label='close'
					onClick={() => setStore('authModalOpen', false)}
					disabled={store.disableAuthActions}
					class='absolute flex h-8 w-8 items-center justify-center rounded-full hover:bg-orange-600'
				>
					<FaSolidXmark fill='white' />
				</button>

				<h1 class='text-center text-lg font-bold'>Log in or sign up</h1>
			</div>

			<div class='border-t' />

			<div class='space-y-4 p-6'>
				<h1 class='text-2xl font-bold'>Welcome to BookDex</h1>
				<Switch>
					<Match when={formType() === 'sign-up'}>
						<SignUpForm />
					</Match>
					<Match when={formType() === 'sign-in'}>
						<SignInForm />
					</Match>
					<Match when={formType() === 'mock-list'}>
						<MockIn />
					</Match>
				</Switch>

				<div class='flex items-center gap-x-5'>
					<span class='grow border-t' />
					<span>or</span>
					<span class='grow border-t' />
				</div>

				<Show when={formType() !== 'mock-list'}>
					<button
						disabled={store.disableAuthActions}
						onClick={() => setFormType('mock-list')}
						class='relative h-12 w-full animate-pulse rounded border bg-white text-black'
					>
						<i class='ri-user-smile-line absolute bottom-1/2 left-6 translate-y-1/2 text-2xl' />
						<span class='font-bold'>
							Continue with Mock account
						</span>
					</button>
				</Show>

				<Switch>
					<Match when={formType() !== 'sign-up'}>
						<button
							disabled={store.disableAuthActions}
							onClick={() => setFormType('sign-up')}
							class='relative h-12 w-full rounded border border-white'
						>
							<i class='ri-mail-line absolute bottom-1/2 left-6 translate-y-1/2 text-2xl' />
							<span class='font-bold'>
								Sign up with Email and password
							</span>
						</button>
					</Match>
					<Match when={formType() !== 'sign-in'}>
						<button
							disabled={store.disableAuthActions}
							onClick={() => setFormType('sign-in')}
							class='relative h-12 w-full rounded border'
						>
							<i class='ri-mail-line absolute bottom-1/2 left-6 translate-y-1/2 text-2xl' />
							<span class='font-bold'>
								Login with Email and password
							</span>
						</button>
					</Match>
				</Switch>
			</div>
		</div>
	)
}
