import type { SubmitHandler } from '@modular-forms/solid'
import { createForm, valiForm } from '@modular-forms/solid'
import { useNavigate, useParams } from '@solidjs/router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/solid-query'
import dayjs from 'dayjs'
import { AiOutlineStar } from 'solid-icons/ai'
import { BiRegularComment } from 'solid-icons/bi'
import { FaRegularBookmark } from 'solid-icons/fa'
import { FiBookmark, FiEdit2, FiShoppingCart } from 'solid-icons/fi'
import { ImSpinner8 } from 'solid-icons/im'
import { RiSystemDeleteBin2Line } from 'solid-icons/ri'
import { For, Match, Show, Switch, createEffect, createSignal } from 'solid-js'
import * as v from 'valibot'

import EditBookForm from '@/components/edit-book'
import Modal from '@/components/modal'
import { TextArea } from '@/components/text-area'

import api from '@/libs/api'
import clickOutside from '@/libs/click-outside'

import type { IBook, IComment, IRating } from '@/types'

import { setStore, store } from '@/store'

export default function TitlePage() {
	const bookId = useParams().id

	const bookQuery = useQuery(() => ({
		queryKey: ['books', { id: bookId }],
		queryFn: () => api.get(`books/${bookId}`).json<IBook>(),
	}))

	const queryClient = useQueryClient()

	async function onSuccess() {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: ['books', { id: bookId }],
			}),
			queryClient.invalidateQueries({
				queryKey: ['books', 'bookmarked'],
			}),
		])
	}

	const bookmarkMutation = useMutation(() => ({
		mutationFn: () => api.patch(`books/${bookId}/bookmark`),
		onSuccess,
	}))

	const unbookmarkMutation = useMutation(() => ({
		mutationFn: () => api.patch(`books/${bookId}/unbookmark`),
		onSuccess,
	}))

	const [isBookmarked, setIsBookmarked] = createSignal(false)

	createEffect(() => {
		const bookmarkerIds = bookQuery.data?.bookmarkerIds
		const userId = store.currentUser?.id

		if (bookmarkerIds && userId)
			setIsBookmarked(bookmarkerIds.includes(userId))
	})

	const [editDialogOpen, setEditDialogOpen] = createSignal(false)

	const ratingQuery = useQuery(() => ({
		queryKey: ['ratings', { bookId }],
		queryFn: () => api.get(`books/${bookId}/ratings`).json<IRating>(),
		enabled: !!store.currentUser,
	}))

	const navigate = useNavigate()
	const deleteMutation = useMutation(() => ({
		mutationFn: () => api.delete(`books/${bookId}`),
		async onSuccess() {
			await queryClient.invalidateQueries({ queryKey: ['books'] })
			navigate('/', { replace: true })
		},
	}))

	return (
		<Switch
			fallback={
				<h1 class='pt-14 text-center text-3xl font-semibold text-red-500'>
					Something went wrong
				</h1>
			}
		>
			<Match when={bookQuery.isLoading}>
				<h1 class='pt-14 text-center text-3xl font-semibold text-teal-600'>
					Loading..
				</h1>
			</Match>

			<Match when={bookQuery.isSuccess}>
				<main class='relative'>
					<img
						src={bookQuery.data!.cover}
						alt='cover'
						class='absolute -z-10 h-80 w-full rounded object-cover opacity-50 blur'
					/>
					<div class='flex gap-6 px-12 pt-24 max-md:flex-wrap'>
						<div>
							<img
								src={bookQuery.data!.cover}
								alt='cover'
								class='w-48 rounded'
							/>
							<p
								class='pt-4 text-lg max-md:hidden md:invisible'
								aria-hidden
							>
								hidden
							</p>
						</div>
						<div class='flex grow flex-col max-md:gap-y-4'>
							<h1 class='text-6xl font-bold'>
								{bookQuery.data!.title}
							</h1>

							<h2 class='text-lg md:pt-32'>
								{bookQuery.data!.author}
							</h2>

							<div class='mt-auto flex flex-wrap gap-2 font-semibold max-md:pt-4'>
								<button
									onClick={() =>
										!store.currentUser
											? setStore('authModalOpen', true)
											: isBookmarked()
												? unbookmarkMutation.mutate()
												: bookmarkMutation.mutate()
									}
									disabled={
										bookmarkMutation.isPending ||
										unbookmarkMutation.isPending ||
										bookQuery.isPending
									}
									class='flex items-center gap-x-2 rounded bg-orange-600 px-6 py-3 disabled:grayscale'
								>
									<span>
										<FaRegularBookmark />
									</span>
									{isBookmarked() ? 'Unbookmark' : 'Bookmark'}
								</button>

								<Show when={store.currentUser}>
									<Switch>
										<Match
											when={
												ratingQuery.isPending ||
												ratingQuery.isRefetching
											}
										>
											<button
												disabled
												class='flex items-center gap-x-2 rounded bg-neutral-500 px-3 py-3'
											>
												<ImSpinner8
													size={24}
													class='animate-spin'
												/>
											</button>
										</Match>
										<Match when={ratingQuery.isSuccess}>
											<RatingButton
												bookId={bookId}
												rating={ratingQuery.data?.value}
											/>
										</Match>
									</Switch>
								</Show>

								<Show
									when={
										bookQuery.data?.submitterId ===
										store.currentUser?.id
									}
								>
									<button
										onClick={() => setEditDialogOpen(true)}
										class='flex items-center gap-x-2 rounded bg-orange-600 px-6 py-3'
									>
										<span>
											<FiEdit2 />
										</span>
										Edit
									</button>
								</Show>

								<button
									disabled
									class='flex items-center gap-x-2 rounded bg-orange-600 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-75 disabled:grayscale'
								>
									<span>
										<FiShoppingCart />
									</span>
									Buy
								</button>

								<Show
									when={
										bookQuery.data?.submitterId ===
										store.currentUser?.id
									}
								>
									<button
										type='button'
										disabled={deleteMutation.isPending}
										onClick={() => deleteMutation.mutate()}
										class='flex items-center gap-x-2 rounded bg-red-600 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-75 disabled:grayscale md:ml-auto'
									>
										<span>
											<RiSystemDeleteBin2Line />
										</span>
										Delete
									</button>
								</Show>
							</div>

							<div class='flex flex-wrap items-center gap-x-4 pt-4 text-center text-lg'>
								<div class='flex items-center gap-x-1 text-orange-600'>
									<AiOutlineStar class='fill-orange-600' />
									<span>
										{bookQuery.data!.avgRating ?? '-'}
									</span>
								</div>
								<div class='flex items-center gap-x-1'>
									<FiBookmark />
									<span>
										{bookQuery.data!.bookmarkerIds
											?.length ?? 0}
									</span>
								</div>
								<div class='flex items-center gap-x-1'>
									<BiRegularComment />
									<span>
										{bookQuery.data!.commentCount ?? 0}
									</span>
								</div>
							</div>
						</div>
					</div>

					<p class='px-8 pt-4 text-lg'>{bookQuery.data!.synopsis}</p>

					<div class='p-8'>
						<div class='w-full border-t border-neutral-600' />
					</div>

					<div class='space-y-4 px-8'>
						<h2 class='text-lg font-bold'>Comments</h2>
						<CommentForm bookId={bookId} />
						<Comments bookId={bookId} />
					</div>

					<Show when={bookQuery.data}>
						<Modal
							isOpen={editDialogOpen()}
							close={() => setEditDialogOpen(false)}
							Modal={() => (
								<EditBookForm
									book={bookQuery.data!}
									close={() => setEditDialogOpen(false)}
								/>
							)}
						/>
					</Show>
				</main>
			</Match>
		</Switch>
	)
}

const ITEMS = [
	{ value: 10, label: '(10) Masterpiece' },
	{ value: 9, label: '(9) Great' },
	{ value: 8, label: '(8) Very Good' },
	{ value: 7, label: '(7) Good' },
	{ value: 6, label: '(6) Fine' },
	{ value: 5, label: '(5) Average' },
	{ value: 4, label: '(4) Bad' },
	{ value: 3, label: '(3) Very Bad' },
	{ value: 2, label: '(2) Horrible' },
	{ value: 1, label: '(1) Appalling' },
] as const

function RatingButton(props: { bookId: string; rating?: number }) {
	const [isPopoverOpen, setIsPopoverOpen] = createSignal(false)

	const queryClient = useQueryClient()
	async function onSuccess() {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: ['books', { id: props.bookId }],
			}),
			queryClient.invalidateQueries({
				queryKey: ['ratings', { bookId: props.bookId }],
			}),
		])
	}

	const postMutation = useMutation(() => ({
		mutationFn: (rating: number) =>
			api.post(`books/${props.bookId}/ratings`, {
				json: { value: rating },
			}),
		onSuccess,
	}))

	const patchMutation = useMutation(() => ({
		mutationFn: (rating: number) =>
			api.patch(`books/${props.bookId}/ratings`, {
				json: { value: rating },
			}),
		onSuccess,
	}))

	const deleteMutation = useMutation(() => ({
		mutationFn: () => api.delete(`books/${props.bookId}/ratings`),
		onSuccess,
	}))

	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	clickOutside //preserve import

	const isPending =
		postMutation.isPending ||
		patchMutation.isPending ||
		deleteMutation.isPending

	return (
		<div class='relative'>
			<button
				disabled={isPending}
				onClick={() => setIsPopoverOpen(true)}
				classList={{
					'bg-orange-600': !!props.rating,
					'bg-neutral-600': !props.rating,
					'flex items-center gap-x-2 rounded px-3 py-3 disabled:opacity-75 disabled:grayscale': true,
				}}
			>
				<AiOutlineStar size={24} />
				{props.rating && (
					<span class='leading-none font-semibold'>
						{props.rating}
					</span>
				)}
			</button>

			<Show when={isPopoverOpen()}>
				<div
					use:clickOutside={() => setIsPopoverOpen(false)}
					class='absolute right-1/2 z-10 mt-2 w-max translate-x-1/2 rounded bg-neutral-600 font-semibold'
				>
					<For each={ITEMS}>
						{(item) => (
							<button
								disabled={isPending}
								onClick={() => {
									;(props.rating
										? patchMutation
										: postMutation
									).mutate(item.value)
									setIsPopoverOpen(false)
								}}
								class='block w-full px-4 py-2 text-left transition-colors hover:bg-orange-600'
							>
								{item.label}
							</button>
						)}
					</For>
					{props.rating && (
						<button
							disabled={isPending}
							onClick={() => deleteMutation.mutate(undefined)}
							class='block w-full px-4 py-2 text-left transition-colors hover:bg-orange-600'
						>
							Remove Rating
						</button>
					)}
				</div>
			</Show>
		</div>
	)
}

const CreateCommentFormSchema = v.object({
	text: v.pipe(v.string(), v.minLength(10)),
})

type TCreateCommentForm = v.InferInput<typeof CreateCommentFormSchema>

function CommentForm(props: { bookId: string }) {
	const [, { Form, Field }] = createForm<TCreateCommentForm>({
		validate: valiForm(CreateCommentFormSchema),
	})

	const queryClient = useQueryClient()
	const mutation = useMutation(() => ({
		mutationFn: (body: TCreateCommentForm) =>
			api.post(`books/${props.bookId}/comments`, { json: body }).json(),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ['comments', { booksId: props.bookId }],
			}),
	}))

	const handleSubmit: SubmitHandler<TCreateCommentForm> = (body) =>
		mutation.mutate(body)

	return (
		<Show when={store.currentUser}>
			<Form
				onSubmit={handleSubmit}
				class='space-y-4 rounded bg-neutral-700 p-4 text-white'
			>
				<div class='flex items-center gap-x-3'>
					<Switch>
						<Match when={store.currentUser!.avatar}>
							<img
								src={store.currentUser!.avatar}
								alt='avatar'
								class='h-9 w-9 rounded-full'
							/>
						</Match>
						<Match when={!store.currentUser!.avatar}>
							<div class='h-9 w-9 rounded-full bg-gradient-to-br from-orange-600 to-purple-600' />
						</Match>
					</Switch>
					<div class='leading-tight'>
						<p class='font-bold capitalize'>
							{store.currentUser?.username}
						</p>
						<p class='text-sm'>{dayjs().format('MMMM DD, YYYY')}</p>
					</div>

					<button
						type='submit'
						disabled={mutation.isPending}
						class='ml-auto rounded bg-white px-4 py-2 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-75'
					>
						Submit
					</button>
				</div>

				<Field name='text'>
					{(field, props) => (
						<TextArea
							{...props}
							disabled={mutation.isPending}
							placeholder='Comment'
							error={field.error}
							value={field.value}
							required
						/>
					)}
				</Field>
			</Form>
		</Show>
	)
}

function Comments(props: { bookId: string }) {
	const query = useQuery(() => ({
		queryKey: ['comments', { bookId: props.bookId }],
		queryFn: () =>
			api.get(`books/${props.bookId}/comments`).json<IComment[]>(),
	}))

	return (
		<Switch>
			<Match when={query.isLoading}>
				<h1 class='pt-14 text-center text-3xl font-semibold text-teal-600'>
					Loading..
				</h1>
			</Match>

			<Match when={query.isError}>
				<h1 class='pt-14 text-center text-3xl font-semibold text-red-500'>
					Something went wrong
				</h1>
			</Match>

			<Match when={query.isSuccess}>
				<ul class='grid grid-cols-1 gap-4 md:grid-cols-2'>
					<For each={query.data}>
						{(comment) => (
							<Comment comment={comment} bookId={props.bookId} />
						)}
					</For>
				</ul>
			</Match>
		</Switch>
	)
}

function Comment(props: { comment: IComment; bookId: string }) {
	const [editable, setEditable] = createSignal(false)

	const [, { Form, Field }] = createForm<TCreateCommentForm>({
		validate: valiForm(CreateCommentFormSchema),
		// eslint-disable-next-line solid/reactivity
		initialValues: { text: props.comment.text },
	})

	const queryClient = useQueryClient()
	async function onSuccess() {
		setEditable(false)
		await queryClient.invalidateQueries({
			queryKey: ['comments', { bookId: props.bookId }],
		})
	}
	const updateMutation = useMutation(() => ({
		mutationFn: (body: TCreateCommentForm) =>
			api.patch(`comments/${props.comment.id}`, { json: body }),
		onSuccess,
	}))

	const deleteMutation = useMutation(() => ({
		mutationFn: () => api.delete(`comments/${props.comment.id}`),
		onSuccess,
	}))

	const handleSubmit: SubmitHandler<TCreateCommentForm> = (body) =>
		updateMutation.mutate(body)

	return (
		<li class='rounded bg-neutral-700 p-4 text-white'>
			<div class='flex gap-x-3'>
				<Switch>
					<Match when={props.comment.author.avatar}>
						<img
							src={props.comment.author.avatar}
							alt='avatar'
							class='h-9 w-9 rounded-full'
						/>
					</Match>
					<Match when={!props.comment.author.avatar}>
						<div class='h-9 w-9 rounded-full bg-gradient-to-br from-orange-600 to-purple-600' />
					</Match>
				</Switch>

				<div class='leading-tight'>
					<div class='font-bold capitalize'>
						{props.comment.author.username}
					</div>
					<div class='text-sm'>
						{dayjs(props.comment.createdAt).format('MMMM DD, YYYY')}
					</div>
				</div>

				<Show when={store.currentUser?.id === props.comment.author.id}>
					<div class='ml-auto flex gap-x-4 self-start'>
						<button
							type='button'
							disabled={
								updateMutation.isPending ||
								deleteMutation.isPending
							}
							onClick={() => setEditable(!editable())}
							class='text-sm font-semibold underline'
						>
							{editable() ? 'Cancel' : 'Edit'}
						</button>

						<button
							type='button'
							disabled={
								updateMutation.isPending ||
								deleteMutation.isPending
							}
							onClick={() => deleteMutation.mutate()}
							class='text-sm font-semibold text-red-600 underline'
						>
							Delete
						</button>
					</div>
				</Show>
			</div>
			<Switch>
				<Match when={editable()}>
					<Form
						onSubmit={handleSubmit}
						class='flex flex-col gap-y-2 pt-4'
					>
						<Field name='text'>
							{(field, props) => (
								<TextArea
									{...props}
									disabled={
										updateMutation.isPending ||
										deleteMutation.isPending
									}
									placeholder='Comment'
									error={field.error}
									value={field.value}
									rows={2}
									required
								/>
							)}
						</Field>
						<button
							type='submit'
							class='self-end rounded bg-white p-1 px-2 text-sm font-semibold text-black'
						>
							Submit
						</button>
					</Form>
				</Match>
				<Match when={!editable()}>
					<p class='pt-2'>{props.comment.text}</p>
				</Match>
			</Switch>
		</li>
	)
}
