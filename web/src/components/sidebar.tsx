import { setStore, store } from '@/store'
import { A, useLocation } from '@solidjs/router'
import { BiRegularBookmarkAlt, BiRegularHomeAlt2 } from 'solid-icons/bi'
import { BsPersonGear } from 'solid-icons/bs'
import { CgMenuLeft } from 'solid-icons/cg'
import { ImBook } from 'solid-icons/im'
import { RiDocumentFileList3Line } from 'solid-icons/ri'
import { For, Show, createEffect, createMemo, createSignal, on } from 'solid-js'
import { Portal } from 'solid-js/web'
import { Transition } from 'solid-transition-group'

const LINKS = [
	{
		name: 'Home',
		path: '/',
		Icon: () => <BiRegularHomeAlt2 class='text-3xl' />,
		needAuth: false,
	},
	{
		name: 'Bookmarks',
		path: '/bookmarks',
		Icon: () => <BiRegularBookmarkAlt class='text-3xl' />,
		needAuth: true,
	},
	{
		name: 'My Entries',
		path: '/my-entries',
		Icon: () => <RiDocumentFileList3Line class='text-3xl' />,
		needAuth: true,
	},
	{
		name: 'Settings',
		path: '/settings',
		Icon: () => <BsPersonGear class='text-3xl' />,
		needAuth: true,
	},
] as const

export default function Sidebar() {
	const location = useLocation()
	const pathname = createMemo(() => location.pathname)

	const [expanded, setExpanded] = createSignal(false)

	createEffect(on(pathname, () => setStore('sideBarOpen', false)))

	return (
		<>
			<aside class='sticky top-0 flex h-screen shrink-0 flex-col justify-between bg-neutral-800 px-4 py-4 max-md:hidden'>
				<A href='/' class='flex items-center gap-x-4 px-4'>
					<ImBook size={30} />
					<Show when={expanded()}>
						<p class='text-lg font-semibold'>BookDex</p>
					</Show>
				</A>

				<div class='space-y-4'>
					<For each={LINKS}>
						{(link) => (
							<Show
								when={!!store.currentUser || !link.needAuth}
								fallback={
									<button
										aria-label={link.name}
										onClick={() =>
											setStore('authModalOpen', true)
										}
										classList={{
											'w-full gap-x-4': expanded(),
											'justify-center': !expanded(),
											'flex items-center rounded-full fill-white p-4 hover:bg-orange-600': true,
										}}
									>
										<link.Icon />
										<Show when={expanded()}>
											<p class='text-lg font-semibold'>
												{link.name}
											</p>
										</Show>
									</button>
								}
							>
								<A
									href={link.path}
									classList={{
										'bg-orange-600':
											pathname() === link.path,
										'hover:bg-orange-600':
											pathname() !== link.path,
										'w-full gap-x-4': expanded(),
										'justify-center': !expanded(),
										'flex items-center rounded-full fill-white p-4': true,
									}}
								>
									<link.Icon />
									<Show when={expanded()}>
										<p class='text-lg font-semibold'>
											{link.name}
										</p>
									</Show>
								</A>
							</Show>
						)}
					</For>
				</div>

				<button
					onClick={() => setExpanded(!expanded())}
					class='mx-auto rounded-full p-4 hover:bg-orange-600'
				>
					<CgMenuLeft size={30} />
				</button>
			</aside>

			<Portal>
				<Transition
					enterActiveClass='duration-200'
					enterClass='opacity-0'
					enterToClass='opacity-100'
					exitActiveClass='duration-200'
					exitClass='opacity-100'
					exitToClass='opacity-0'
				>
					<Show when={store.sideBarOpen}>
						<div
							role='presentation'
							onClick={() => setStore('sideBarOpen', false)}
							class='fixed inset-0 z-20 bg-black/60 backdrop-blur-sm'
						/>
					</Show>
				</Transition>
				<Transition
					enterActiveClass='duration-300'
					enterClass='-translate-x-[11.75rem]'
					enterToClass='translate-x-0'
					exitActiveClass='duration-300'
					exitClass='translate-x-0'
					exitToClass='-translate-x-[11.75rem]'
				>
					<Show when={store.sideBarOpen}>
						<aside class='`md:hidden fixed top-0 left-0 z-30 m-auto flex h-svh w-fit flex-col gap-y-12 bg-neutral-800 px-8 py-4'>
							<A href='/' class='flex items-center gap-x-4 px-4'>
								<ImBook class='text-3xl' />
								<p class='text-lg font-semibold'>BookDex</p>
							</A>

							<div class='space-y-4'>
								<For each={LINKS}>
									{(link) => (
										<Show
											when={
												store.currentUser ??
												!link.needAuth
											}
											fallback={
												<button
													aria-label={link.name}
													onClick={() =>
														setStore(
															'authModalOpen',
															true
														)
													}
													class='flex w-full items-center gap-x-4 rounded-full fill-white p-4 hover:bg-orange-600'
												>
													<link.Icon />

													<p class='text-lg font-semibold'>
														{link.name}
													</p>
												</button>
											}
										>
											<A
												href={link.path}
												classList={{
													'bg-orange-600':
														pathname() ===
														link.path,
													'hover:bg-orange-600':
														pathname() !==
														link.path,
													'flex w-full items-center gap-x-4 rounded-full fill-white p-4': true,
												}}
											>
												<link.Icon />

												<p class='text-lg font-semibold'>
													{link.name}
												</p>
											</A>
										</Show>
									)}
								</For>
							</div>
						</aside>
					</Show>
				</Transition>
			</Portal>
		</>
	)
}
