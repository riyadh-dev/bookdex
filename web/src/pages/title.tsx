import EditBookForm from '@/components/edit-book'
import Modal from '@/components/modal'
import { TextArea } from '@/components/text-area'
import { api, getFetcher } from '@/config/ky'
import { IBook, IComment } from '@/definitions/interfaces'
import { persistedStore } from '@/store'
import { SubmitHandler, createForm, valiForm } from '@modular-forms/solid'
import { useParams } from '@solidjs/router'
import {
	createMutation,
	createQuery,
	useQueryClient,
} from '@tanstack/solid-query'
import dayjs from 'dayjs'
import { FaRegularBookmark } from 'solid-icons/fa'
import { FiEdit3, FiShoppingCart } from 'solid-icons/fi'
import { For, Match, Show, Switch, createEffect, createSignal } from 'solid-js'
import * as v from 'valibot'

export default function TitlePage() {
	const params = useParams()

	const query = createQuery(() => ({
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
		const bookmarkerIds = query.data?.bookmarkerIds
		const userId = persistedStore.currentUser?.id

		if (bookmarkerIds && userId)
			setIsBookmarked(bookmarkerIds.includes(userId))
	})

	const [editDialogOpen, setEditDialogOpen] = createSignal(false)

	return (
		<Switch
			fallback={
				<h1 class='pt-14 text-center text-3xl font-semibold text-red-500'>
					Something went wrong
				</h1>
			}
		>
			<Match when={query.isLoading}>
				<h1 class='pt-14 text-center text-3xl font-semibold text-teal-600'>
					Loading..
				</h1>
			</Match>

			<Match when={query.isSuccess}>
				<main class='relative'>
					<img
						src={query.data?.cover}
						alt='cover'
						class='absolute -z-10 h-80 w-full rounded object-cover opacity-50 blur'
					/>
					<div class='flex gap-x-6 px-12 pt-24'>
						<img
							src={query.data?.cover}
							alt='cover'
							class='w-48 rounded'
						/>
						<div class='flex flex-col'>
							<h1 class='text-6xl font-bold'>
								{query.data?.title}
							</h1>

							<h2 class='pt-32 text-lg'>{query.data?.author}</h2>

							<div class='mt-auto flex gap-x-2'>
								<button
									onClick={() =>
										isBookmarked()
											? unbookmarkMutation.mutate()
											: bookmarkMutation.mutate()
									}
									disabled={
										bookmarkMutation.isPending ||
										unbookmarkMutation.isPending ||
										query.isPending
									}
									class='flex items-center gap-x-2 rounded bg-orange-600 px-6 py-3 disabled:grayscale'
								>
									<span>
										<FaRegularBookmark />
									</span>
									{isBookmarked() ? 'Unbookmark' : 'Bookmark'}
								</button>

								{/*<select
									//{...props}
									//disabled={mutation.isPending}
									class='appearance-none rounded bg-neutral-600 px-4 py-3 font-semibold'
								>
									<option value='' class='hidden' aria-hidden>
										Rate the book
									</option>
									<For each={ITEMS}>
										{(item) => (
											<option
												value={item.value}
												//selected={
												//field.value === item.value
												//}
												class='bg-neutral-600'
											>
												{item.label}
											</option>
										)}
									</For>
									</select>*/}

								<button class='flex items-center gap-x-2 rounded bg-orange-600 px-6 py-3'>
									<span>
										<FiShoppingCart />
									</span>
									Buy
								</button>

								<Show
									when={
										query.data?.submitterId ===
										persistedStore.currentUser?.id
									}
								>
									<button
										onClick={() => setEditDialogOpen(true)}
										class='flex items-center gap-x-2 rounded bg-orange-600 px-6 py-3'
									>
										<span>
											<FiEdit3 />
										</span>
										Edit
									</button>
								</Show>
							</div>
						</div>
					</div>

					<p class='px-8 pt-6 text-lg'>{query.data?.synopsis}</p>

					<div class='p-8'>
						<div class='w-full border-t border-neutral-600' />
					</div>

					<div class='space-y-4 px-8'>
						<h2 class='text-lg font-bold'>Comments</h2>
						<CommentForm bookId={params.id} />
						<Comments bookId={params.id} />
					</div>

					<Show when={query.data}>
						<Modal
							isOpen={editDialogOpen()}
							close={() => setEditDialogOpen(false)}
							Modal={() => (
								<EditBookForm
									book={query.data!}
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
				<ul class='grid grid-cols-2 gap-4'>
					<For each={query.data!}>
						{(comment) => (
							<li class='rounded bg-neutral-700 p-4 text-white'>
								<div class='flex gap-x-3'>
									<Switch>
										<Match when={comment.author.avatar}>
											<img
												src={comment.author.avatar}
												alt='avatar'
												class='h-9 w-9 rounded-full'
											/>
										</Match>
										<Match when={!comment.author.avatar}>
											<div class='h-9 w-9 rounded-full bg-gradient-to-br from-orange-600 to-purple-600' />
										</Match>
									</Switch>

									<div class='leading-tight'>
										<div class='font-bold'>
											{comment.author.username}
										</div>
										<div class='text-sm'>
											{dayjs(comment.createdAt).format(
												'MMMM DD, YYYY'
											)}
										</div>
									</div>
								</div>
								<p class='pt-2'>{comment.text}</p>
							</li>
						)}
					</For>
				</ul>
			</Match>
		</Switch>
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
					<img
						src='https://xsgames.co/randomusers/assets/avatars/female/1.jpg'
						alt='avatar'
						class='h-9 w-9 rounded-full'
					/>
					<div class='leading-tight'>
						<p class='font-bold'>
							{persistedStore.currentUser?.username}
						</p>
						<p class='text-sm'>PlaceHolder Date</p>
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

/*const ITEMS = [
	{ value: '10', label: '(10) Masterpiece' },
	{ value: '9', label: '(9) Great' },
	{ value: '8', label: '(8) Very Goo' },
	{ value: '7', label: '(7) Good' },
	{ value: '6', label: '(6) Fine' },
	{ value: '5', label: '(5) Average' },
	{ value: '4', label: '(4) Bad' },
	{ value: '3', label: '(3) Very Bad' },
	{ value: '2', label: '(2) Horrible' },
	{ value: '1', label: '(1) Appalling' },
] as const*/
