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
	},
	{
		name: 'Bookmarks',
		path: '/bookmarks',
		Icon: () => <FaRegularBookmark size={25} />,
	},
	{
		name: 'Settings',
		path: '/settings',
		Icon: () => <OcGear2 size={30} />,
	},
]

export default function Sidebar() {
	const location = useLocation()
	const pathname = createMemo(() => location.pathname)

	const [expanded, setExpanded] = createSignal(false)

	return (
		<aside class='flex h-[calc(100vh-4rem)] flex-col items-center justify-between border-r-2 border-white px-4'>
			<ImBook size={30} />

			<div class='space-y-4'>
				<For each={LINKS}>
					{(link) => (
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
					)}
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
