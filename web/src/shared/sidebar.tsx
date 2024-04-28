import { persistedStore, setStore } from '@/store'
import { A, useLocation } from '@solidjs/router'
import { clsx } from 'clsx'
import { BiRegularHomeAlt2 } from 'solid-icons/bi'
import { CgMenuLeft } from 'solid-icons/cg'
import { FaRegularBookmark } from 'solid-icons/fa'
import { ImBook } from 'solid-icons/im'
import { OcGear2 } from 'solid-icons/oc'
import { For, createMemo, createSignal } from 'solid-js'

const LINKS = [
	{
		name: 'Home',
		path: '/',
		Icon: () => <BiRegularHomeAlt2 size={30} />,
		needAuth: false,
	},
	{
		name: 'Follows',
		path: '/follows',
		Icon: () => <FaRegularBookmark size={25} />,
		needAuth: true,
	},
	{
		name: 'Settings',
		path: '/settings',
		Icon: () => <OcGear2 size={30} />,
		needAuth: true,
	},
] as const

export default function Sidebar() {
	const location = useLocation()
	const pathname = createMemo(() => location.pathname)

	const [expanded, setExpanded] = createSignal(false)

	return (
		<aside class='sticky top-8 flex h-[calc(100vh-4rem)] flex-col items-center justify-between border-r-2 border-white px-4'>
			<ImBook size={30} class='stroke-orange-600' />

			<div class='space-y-4'>
				<For each={LINKS}>
					{(link) =>
						link.needAuth && !persistedStore.currentUser ? (
							<button
								aria-label={link.name}
								onClick={() => setStore('authModalOpen', true)}
								class='group grid h-14 w-14 place-items-center rounded-full fill-white hover:bg-orange-600'
							>
								<link.Icon />
							</button>
						) : (
							<A
								href={link.path}
								class={clsx(
									pathname() === link.path && 'bg-orange-600',
									!(pathname() === link.path) &&
										'hover:bg-orange-600',
									'group grid h-14 w-14 place-items-center rounded-full fill-white'
								)}
							>
								<link.Icon />
							</A>
						)
					}
				</For>
			</div>

			<div
				onClick={() => setExpanded(!expanded())}
				class='grid h-14 w-14 place-items-center rounded-full hover:bg-orange-600'
			>
				<CgMenuLeft class='text-3xl' />
			</div>
		</aside>
	)
}
