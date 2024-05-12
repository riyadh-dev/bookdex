import AddBookForm from '@/components/add-book'
import { api } from '@/config/ky'
import clickOutside from '@/libs/click-outside'
import { persistedStore, setStore, store } from '@/store'
import { A } from '@solidjs/router'
import { AiOutlineLogin } from 'solid-icons/ai'
import { CgMenuLeft } from 'solid-icons/cg'
import { HiOutlineMagnifyingGlass } from 'solid-icons/hi'
import { Match, Show, Switch, createSignal } from 'solid-js'
import AuthForms from './auth-forms'
import Modal from './modal'

export default function TopBar() {
	const [isPopoverOpen, setIsPopoverOpen] = createSignal(false)

	const [loading, setLoading] = createSignal(false)
	const logout = async () => {
		setLoading(true)
		await api
			.delete('auth/sign-out', { credentials: 'include' })
			.finally(() => {
				setLoading(false)
				localStorage.clear()
				window.location.href = '/'
			})
	}

	clickOutside //preserve import

	return (
		<nav class='sticky top-0 z-10 flex w-full items-start justify-between bg-neutral-800 px-8 py-4'>
			<div class='flex items-center gap-x-4 max-md:hidden'>
				<HiOutlineMagnifyingGlass class='text-xl' />
				<input
					disabled
					type='text'
					class='w-64 bg-transparent outline-none disabled:cursor-not-allowed'
					placeholder='by book name or author name'
				/>
			</div>

			<button
				aria-label='open side bar'
				onClick={() => setStore('sideBarOpen', true)}
				class='md:hidden'
			>
				<CgMenuLeft class='text-3xl' />
			</button>

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
							<Switch>
								<Match
									when={persistedStore.currentUser?.avatar}
								>
									<img
										src={persistedStore.currentUser!.avatar}
										alt='avatar'
										class='h-9 w-9 rounded-full'
									/>
								</Match>
								<Match
									when={!persistedStore.currentUser?.avatar}
								>
									<div class='h-9 w-9 rounded-full bg-gradient-to-br from-orange-600 to-purple-600' />
								</Match>
							</Switch>
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
								use:clickOutside={() => setIsPopoverOpen(false)}
								class='absolute -right-6 top-14 z-10 w-max rounded bg-neutral-800 py-4 font-semibold'
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
									href='/settings'
									class='block w-full px-6 py-2 text-left hover:bg-orange-600'
								>
									Edit Profile
								</A>
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
