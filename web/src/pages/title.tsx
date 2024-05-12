import EditBookForm from '@/components/edit-book'
import Modal from '@/components/modal'
import { TextArea } from '@/components/text-area'
import { api, getFetcher } from '@/config/ky'
import { IBook, IComment, IRating } from '@/definitions/interfaces'
import clickOutside from '@/libs/click-outside'
import { persistedStore, setStore } from '@/store'
import { SubmitHandler, createForm, valiForm } from '@modular-forms/solid'
import { useParams } from '@solidjs/router'
import {
	createMutation,
	createQuery,
	useQueryClient,
} from '@tanstack/solid-query'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { AiOutlineStar } from 'solid-icons/ai'
import { BiRegularComment } from 'solid-icons/bi'
import { FaRegularBookmark } from 'solid-icons/fa'
import { FiBookmark, FiEdit2, FiShoppingCart } from 'solid-icons/fi'
import { ImSpinner8 } from 'solid-icons/im'
import { For, Match, Show, Switch, createEffect, createSignal } from 'solid-js'
import * as v from 'valibot'

export default function TitlePage() {
	const params = useParams()

	const bookQuery = createQuery(() => ({
		queryKey: ['book', params.id],
		queryFn: () => getFetcher<IBook>(`books/${params.id}`),
	}))

	const queryClient = useQueryClient()

	function onSuccess() {
		queryClient.invalidateQueries({ queryKey: ['book', params.id] })
		queryClient.invalidateQueries({ queryKey: ['books', 'bookmarked'] })
	}

	const bookmarkMutation = createMutation(() => ({
		mutationFn: () => api.patch(`books/${params.id}/bookmark`),
		onSuccess,
	}))

	const unbookmarkMutation = createMutation(() => ({
		mutationFn: () => api.patch(`books/${params.id}/unbookmark`),
		onSuccess,
	}))

	const [isBookmarked, setIsBookmarked] = createSignal(false)

	createEffect(() => {
		const bookmarkerIds = bookQuery.data?.bookmarkerIds
		const userId = persistedStore.currentUser?.id

		if (bookmarkerIds && userId)
			setIsBookmarked(bookmarkerIds.includes(userId))
	})

	const [editDialogOpen, setEditDialogOpen] = createSignal(false)

	const ratingQuery = createQuery(() => ({
		queryKey: ['ratings', params.id],
		queryFn: () => getFetcher<IRating>(`books/${params.id}/ratings`),
		enabled: !!persistedStore.currentUser,
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
						<div class='flex flex-col max-md:gap-y-4'>
							<h1 class='text-6xl font-bold'>
								{bookQuery.data!.title}
							</h1>

							<h2 class='text-lg md:pt-32'>
								{bookQuery.data!.author}
							</h2>

							<div class='mt-auto flex gap-x-2 font-semibold max-md:pt-4'>
								<button
									onClick={() =>
										!persistedStore.currentUser
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

								<Show when={persistedStore.currentUser}>
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
												bookId={params.id}
												rating={ratingQuery.data?.value}
											/>
										</Match>
									</Switch>
								</Show>

								<Show
									when={
										bookQuery.data?.submitterId ===
										persistedStore.currentUser?.id
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
									class='flex items-center gap-x-2 rounded bg-orange-600 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale'
								>
									<span>
										<FiShoppingCart />
									</span>
									Buy
								</button>
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
						<CommentForm bookId={params.id} />
						<Comments bookId={params.id} />
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
	function onSuccess() {
		queryClient.invalidateQueries({ queryKey: ['ratings', props.bookId] })
	}

	const postMutation = createMutation(() => ({
		mutationFn: (rating: number) =>
			api
				.post(`books/${props.bookId}/ratings`, {
					json: { value: rating },
				})
				.text(),
		onSuccess,
	}))

	const patchMutation = createMutation(() => ({
		mutationFn: (rating: number) =>
			api
				.patch(`books/${props.bookId}/ratings`, {
					json: { value: rating },
				})
				.text(),
		onSuccess,
	}))

	const deleteMutation = createMutation(() => ({
		mutationFn: () => api.delete(`books/${props.bookId}/ratings`).text(),
		onSuccess,
	}))

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
				class={clsx(
					props.rating ? 'bg-orange-600' : 'bg-neutral-600',
					'flex items-center gap-x-2 rounded px-3 py-3 disabled:opacity-50 disabled:grayscale'
				)}
			>
				<AiOutlineStar size={24} />
				{props.rating && (
					<span class='font-semibold leading-none'>
						{props.rating}
					</span>
				)}
			</button>

			<Show when={isPopoverOpen()}>
				<div
					onClick={() => setIsPopoverOpen(false)}
					use:clickOutside={() => setIsPopoverOpen(false)}
					class='absolute right-1/2 z-10 mt-2 w-max translate-x-1/2 rounded bg-neutral-600 font-semibold'
				>
					<For each={ITEMS}>
						{(item) => (
							<button
								disabled={isPending}
								onClick={() =>
									props.rating
										? patchMutation.mutate(item.value)
										: postMutation.mutate(item.value)
								}
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
	text: v.string([v.minLength(10)]),
})

type TCreateCommentForm = v.Output<typeof CreateCommentFormSchema>

function CommentForm(props: { bookId: string }) {
	const [, { Form, Field }] = createForm<TCreateCommentForm>({
		validate: valiForm(CreateCommentFormSchema),
	})

	const queryClient = useQueryClient()
	const mutation = createMutation(() => ({
		mutationFn: (body: TCreateCommentForm) =>
			api.post(`books/${props.bookId}/comments`, { json: body }).json(),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ['comments', props.bookId],
			}),
	}))

	const handleSubmit: SubmitHandler<TCreateCommentForm> = (body) =>
		mutation.mutate(body)

	return (
		<Show when={persistedStore.currentUser}>
			<Form
				onSubmit={handleSubmit}
				class='space-y-4 rounded bg-neutral-700 p-4 text-white'
			>
				<div class='flex items-center gap-x-3'>
					<Switch>
						<Match when={persistedStore.currentUser!.avatar}>
							<img
								src={persistedStore.currentUser!.avatar}
								alt='avatar'
								class='h-9 w-9 rounded-full'
							/>
						</Match>
						<Match when={!persistedStore.currentUser!.avatar}>
							<div class='h-9 w-9 rounded-full bg-gradient-to-br from-orange-600 to-purple-600' />
						</Match>
					</Switch>
					<div class='leading-tight'>
						<p class='font-bold capitalize'>
							{persistedStore.currentUser?.username}
						</p>
						<p class='text-sm'>{dayjs().format('MMMM DD, YYYY')}</p>
					</div>

					<button
						type='submit'
						disabled={mutation.isPending}
						class='ml-auto rounded bg-white px-4 py-2 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50'
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
	const query = createQuery(() => ({
		queryKey: ['comments', props.bookId],
		queryFn: () => getFetcher<IComment[]>(`books/${props.bookId}/comments`),
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
					<For each={query.data!}>
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
	function onSuccess() {
		setEditable(false)
		queryClient.invalidateQueries({
			queryKey: ['comments', props.bookId],
		})
	}
	const updateMutation = createMutation(() => ({
		mutationFn: (body: TCreateCommentForm) =>
			api.patch(`comments/${props.comment.id}`, { json: body }).text(),
		onSuccess,
	}))

	const deleteMutation = createMutation(() => ({
		mutationFn: () => api.delete(`comments/${props.comment.id}`).text(),
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

				<Show
					when={
						persistedStore.currentUser?.id ===
						props.comment.author.id
					}
				>
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
