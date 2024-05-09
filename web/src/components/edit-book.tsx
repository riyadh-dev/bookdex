import { api } from '@/config/ky'
import { IBook } from '@/definitions/interfaces'
import { TextArea } from '@/components/text-area'
import { TextInput } from '@/components/text-input'
import { createForm, valiForm } from '@modular-forms/solid'
import { createMutation, useQueryClient } from '@tanstack/solid-query'
import { FaSolidXmark } from 'solid-icons/fa'
import { Output, maxLength, minLength, object, string, url } from 'valibot'

const CreateBookSchema = object({
	title: string([minLength(5), maxLength(20)]),
	author: string([minLength(5), maxLength(20)]),
	cover: string([url()]),
	synopsis: string([minLength(5), maxLength(750)]),
})

type TCreateBook = Output<typeof CreateBookSchema>

export default function EditBookForm(props: {
	book: IBook
	close: () => void
}) {
	const [, { Form, Field }] = createForm<TCreateBook>({
		validate: valiForm(CreateBookSchema),
		initialValues: {
			/* eslint-disable solid/reactivity */
			title: props.book.title,
			author: props.book.author,
			cover: props.book.cover,
			synopsis: props.book.synopsis,
			/* eslint-enable solid/reactivity */
		},
	})

	const queryClient = useQueryClient()

	const mutation = createMutation(() => ({
		mutationFn: (data: TCreateBook) =>
			api.patch(`books/${props.book.id}`, { json: data }).text(),
		onSuccess() {
			props.close()
			queryClient.invalidateQueries({ queryKey: ['book', props.book.id] })
		},
	}))

	const handleSubmit = (data: TCreateBook) => {
		mutation.mutate(data)
	}

	Form

	return (
		<div class='mx-auto max-w-xl rounded bg-neutral-800 p-6'>
			<div class='relative py-6'>
				<button
					aria-label='close'
					onClick={() => props.close()}
					disabled={mutation.isPending}
					class='absolute flex h-8 w-8 items-center justify-center rounded-full hover:bg-orange-600 hover:fill-white'
				>
					<FaSolidXmark fill='white' />
				</button>

				<h1 class='text-center text-lg font-bold'>Edit the book</h1>
			</div>

			<div class='border-t' />

			<div class='space-y-5 p-6'>
				<h1 class='text-2xl font-bold'>Enter the book info</h1>
				<Form onSubmit={handleSubmit} class='space-y-4'>
					<Field name='title'>
						{(field, props) => (
							<TextInput
								{...props}
								type='text'
								placeholder='title'
								error={field.error}
								value={field.value}
								required
							/>
						)}
					</Field>
					<Field name='author'>
						{(field, props) => (
							<TextInput
								{...props}
								type='text'
								placeholder='Author'
								error={field.error}
								value={field.value}
								required
							/>
						)}
					</Field>
					<Field name='cover'>
						{(field, props) => (
							<TextInput
								{...props}
								type='text'
								placeholder='Cover'
								error={field.error}
								value={field.value}
								required
							/>
						)}
					</Field>
					<Field name='synopsis'>
						{(field, props) => (
							<TextArea
								{...props}
								placeholder='Synopsis'
								error={field.error}
								value={field.value}
								required
							/>
						)}
					</Field>
					<button
						type='submit'
						disabled={mutation.isPending}
						class='h-12 w-full rounded bg-orange-600 px-4 text-center text-lg font-semibold text-white'
					>
						{mutation.isPending
							? 'Loading...'
							: mutation.isError
								? 'Error'
								: 'Save'}
					</button>
				</Form>
			</div>
		</div>
	)
}
