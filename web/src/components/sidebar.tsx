import { persistedStore, setStore } from '@/store'
import { A, useLocation } from '@solidjs/router'
import { clsx } from 'clsx'
import { BiRegularBookmarkAlt, BiRegularHomeAlt2 } from 'solid-icons/bi'
import { BsPersonGear } from 'solid-icons/bs'
import { CgMenuLeft } from 'solid-icons/cg'
import { ImBook } from 'solid-icons/im'
import { RiDocumentFileList3Line } from 'solid-icons/ri'
import { For, Show, createMemo, createSignal } from 'solid-js'

const LINKS = [
	{
		name: 'Home',
		path: '/',
		Icon: () => <BiRegularHomeAlt2 size={30} />,
		needAuth: false,
	},
	{
		name: 'Bookmarks',
		path: '/bookmarks',
		Icon: () => <BiRegularBookmarkAlt size={30} />,
		needAuth: true,
	},
	{
		name: 'My Entries',
		path: '/my-entries',
		Icon: () => <RiDocumentFileList3Line size={30} />,
		needAuth: true,
	},
	{
		name: 'Settings',
		path: '/settings',
		Icon: () => <BsPersonGear size={30} />,
		needAuth: true,
	},
] as const

export default function Sidebar() {
	const location = useLocation()
	const pathname = createMemo(() => location.pathname)

	const [expanded, setExpanded] = createSignal(false)

	return (
		<aside class='sticky top-0 flex h-screen shrink-0 flex-col justify-between bg-neutral-800 px-4 py-4'>
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
							when={persistedStore.currentUser || !link.needAuth}
							fallback={
								<button
									aria-label={link.name}
									onClick={() =>
										setStore('authModalOpen', true)
									}
									class={clsx(
										expanded()
											? 'w-full gap-x-4'
											: 'justify-center',
										'flex items-center rounded-full fill-white p-4 hover:bg-orange-600'
									)}
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
								class={clsx(
									pathname() === link.path && 'bg-orange-600',
									!(pathname() === link.path) &&
										'hover:bg-orange-600',
									expanded()
										? 'w-full gap-x-4'
										: 'justify-center',
									'flex items-center rounded-full fill-white p-4'
								)}
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
	)
}
