import { A, useLocation } from '@solidjs/router';
import { clsx } from 'clsx';
import { AiOutlineBook } from 'solid-icons/ai';
import { BiRegularHomeAlt2 } from 'solid-icons/bi';
import { CgMenuLeft } from 'solid-icons/cg';
import { FaRegularBookmark } from 'solid-icons/fa';
import { OcGear2 } from 'solid-icons/oc';
import { For, createMemo, createSignal } from 'solid-js';

const LINKS = [
	{
		name: 'Home',
		path: '/',
		Icon: () => <BiRegularHomeAlt2 size={30} />,
	},
	{
		name: 'List',
		path: '/list',
		Icon: () => <AiOutlineBook size={30} />,
	},
	/*{
		name: 'History',
		path: '/history',
		Icon: () => <FaRegularClock size={30} />,
	},*/
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
];

export default function Sidebar() {
	const location = useLocation();
	const pathname = createMemo(() => location.pathname);

	const [expanded, setExpanded] = createSignal(false);

	return (
		<aside class='flex h-[calc(100vh-4rem)] flex-col items-center justify-between border-r-2 border-[#DBD8CF] px-4'>
			<img src='logo.png' class='h-10 w-10' />

			<div class='space-y-4'>
				<For each={LINKS}>
					{(link) => (
						<A
							href={link.path}
							class={clsx(
								pathname() === link.path && 'bg-[#E36165] fill-white',
								!(pathname() === link.path) &&
									'hover:bg-[#E36165] hover:fill-white',
								'group grid h-14 w-14 place-items-center rounded-full',
							)}
						>
							<link.Icon />
						</A>
					)}
				</For>
			</div>

			<div
				onClick={() => setExpanded(!expanded())}
				class='grid h-14 w-14 place-items-center rounded-full hover:bg-[#EBE9DD]'
			>
				<CgMenuLeft class='fill-white text-3xl' />
			</div>
		</aside>
	);
}