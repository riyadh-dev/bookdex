import { kyBookDex } from '@/config/ky'
import AddBookForm from '@/shared/add-book'
import { persistedStore, setStore, store } from '@/store'
import { A } from '@solidjs/router'
import { AiOutlineLogin } from 'solid-icons/ai'
import { HiOutlineMagnifyingGlass } from 'solid-icons/hi'
import { Match, Show, Switch, createSignal } from 'solid-js'
import AuthForms from './auth-forms'
import Modal from './modal'

export default function TopBar() {
	const [isPopoverOpen, setIsPopoverOpen] = createSignal(false)

	const [loading, setLoading] = createSignal(false)
	const logout = async () => {
		setLoading(true)
		await kyBookDex
			.delete('auth/sign-out', { credentials: 'include' })
			.finally(() => {
				setLoading(false)
				localStorage.clear()
				window.location.href = '/'
			})
	}

	return (
		<nav class='flex w-full items-start justify-between px-8 pb-4'>
			<div class='flex items-center gap-x-4'>
				<HiOutlineMagnifyingGlass class='text-xl' />
				<input
					type='text'
					class='w-64 bg-transparent outline-none'
					placeholder='Search book name or author name'
				/>
			</div>

			<Switch>
				<Match when={!persistedStore.currentUser}>
					<div class='flex items-center gap-x-4'>
						<button
							onClick={() => setStore('authModalOpen', true)}
							aria-label='login/sign-up'
							class='group grid place-items-center rounded-full fill-white p-2 hover:bg-orange-600'
						>
							<AiOutlineLogin size={24} />
						</button>
						<Modal
							Modal={AuthForms}
							isOpen={store.authModalOpen}
							close={() => setStore('authModalOpen', false)}
						/>
					</div>
				</Match>
				<Match when={persistedStore.currentUser}>
					<div class='relative'>
						<button
							onClick={() => setIsPopoverOpen(true)}
							class='flex items-center gap-x-3'
						>
							<div class='h-8 w-8 rounded-full bg-orange-600' />
							<h1 class='text-lg font-semibold capitalize'>
								{
									//@ts-expect-error - checked on match
									persistedStore.currentUser.username
								}
							</h1>
						</button>

						<Modal
							Modal={AddBookForm}
							isOpen={store.addBookModalOpen}
							close={() => setStore('addBookModalOpen', false)}
						/>

						<Show when={isPopoverOpen()}>
							<div
								onClick={() => setIsPopoverOpen(false)}
								class='absolute -right-6 z-10 mt-2 w-max rounded bg-neutral-800 py-4 font-semibold'
							>
								<button
									onClick={() =>
										setStore('addBookModalOpen', true)
									}
									class='block px-6 py-2 text-left hover:bg-orange-600'
								>
									Add New Book
								</button>
								<A
									href='my-entries'
									class='block px-6 py-2 text-left hover:bg-orange-600'
								>
									My Entries
								</A>
								<button class='block w-full px-6 py-2 text-left hover:bg-orange-600'>
									Edit Profile
								</button>
								<button
									onClick={logout}
									disabled={loading()}
									class='block w-full px-6 py-2 text-left hover:bg-orange-600'
								>
									{loading() ? 'Logging out...' : 'Logout'}
								</button>
							</div>
						</Show>
					</div>
				</Match>
			</Switch>
		</nav>
	)
}

/*function LoginSection() {
	return (
		<nav class='flex h-16 w-full items-start justify-between'>
			<div class='flex items-center gap-x-4'>
				<HiOutlineMagnifyingGlass class='text-xl' />
				<input
					type='text'
					class='w-64 bg-transparent outline-none'
					placeholder='Search book name or author name'
				/>
			</div>

			<div class='flex items-center gap-x-4'>
				<div class='h-10 w-10 rounded-full bg-orange-600' />
				<span class='font-semibold'>Riyadh Baatchia</span>
			</div>
		</nav>
	);
}*/
