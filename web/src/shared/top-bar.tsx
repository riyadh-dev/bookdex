import AddBookForm from '@/shared/add-book';
import {
	currentUserSignalAccessor,
	isAddBookModalOpenSignal,
	isAuthModalOpenSignal,
} from '@/state/signals';
import { AiOutlineLogin } from 'solid-icons/ai';
import { FaSolidPlus } from 'solid-icons/fa';
import { HiOutlineMagnifyingGlass } from 'solid-icons/hi';
import { Match, Switch } from 'solid-js';
import AuthForms from './auth-forms';
import Modal from './modal';

export default function TopBar() {
	const [isAuthModalOpen, setIsAuthModalOpen] = isAuthModalOpenSignal;
	const [isAddBookModalOpen, setIsAddBookOpen] = isAddBookModalOpenSignal;

	const currentUser = currentUserSignalAccessor;
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

			<Switch>
				<Match when={!currentUser()}>
					<div class='flex items-center gap-x-4'>
						<button
							onClick={() => setIsAuthModalOpen(true)}
							aria-label='login/sign-up'
							class='group grid place-items-center rounded-full p-2 hover:bg-[#E36165] hover:fill-white'
						>
							<AiOutlineLogin size={24} />
						</button>
						<Modal
							Modal={AuthForms}
							isOpen={isAuthModalOpen}
							setIsOpen={setIsAuthModalOpen}
						/>
					</div>
				</Match>
				<Match when={currentUser()}>
					<div class='flex items-center gap-x-4'>
						<button
							onClick={() => setIsAddBookOpen(true)}
							aria-label='add a book'
							class='group grid place-items-center rounded-full p-2 hover:bg-[#E36165] hover:fill-white'
						>
							<FaSolidPlus size={24} />
						</button>
						<Modal
							Modal={AddBookForm}
							isOpen={isAddBookModalOpen}
							setIsOpen={setIsAddBookOpen}
						/>
						<div class='flex items-center gap-x-3'>
							<div class='h-10 w-10 rounded-full bg-rose-400' />
							<h1 class='text-xl font-semibold'>
								{
									//@ts-expect-error - checked on match
									currentUser().username
								}
							</h1>
						</div>
					</div>
				</Match>
			</Switch>
		</nav>
	);
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
				<div class='h-10 w-10 rounded-full bg-[#E36165]' />
				<span class='font-semibold'>Riyadh Baatchia</span>
			</div>
		</nav>
	);
}*/
