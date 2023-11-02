import { kyBookDex } from '@/config/ky';
import { TextArea } from '@/shared/text-area';
import { TextInput } from '@/shared/text-input';
import { isAddBookModalOpenSetter } from '@/state/signals';
import { createForm, valiForm } from '@modular-forms/solid';
import { createMutation } from '@tanstack/solid-query';
import { FaSolidXmark } from 'solid-icons/fa';
import { Output, maxLength, minLength, object, string, url } from 'valibot';

const CreateBookSchema = object({
	title: string([minLength(5), maxLength(20)]),
	author: string([minLength(5), maxLength(20)]),
	cover: string([url()]),
	synopsis: string([minLength(5), maxLength(750)]),
});

type TCreateBook = Output<typeof CreateBookSchema>;

export default function AddBookForm() {
	const [, { Form, Field }] = createForm<TCreateBook>({
		validate: valiForm(CreateBookSchema),
	});

	const setModalOpen = isAddBookModalOpenSetter;
	const mutation = createMutation(() => ({
		mutationFn: (data: TCreateBook) =>
			kyBookDex.post('books', { json: data, credentials: 'include' }).json(),
		onSuccess: () => setModalOpen(false),
	}));

	const handleSubmit = (data: TCreateBook) => {
		mutation.mutate(data);
	};

	return (
		<div class='mx-auto max-w-xl rounded-xl border bg-neutral-800 p-6'>
			<div class='relative py-6'>
				<button
					aria-label='close'
					onClick={() => setModalOpen(false)}
					disabled={mutation.isPending}
					class='absolute flex h-8 w-8 items-center justify-center rounded-full hover:bg-orange-600 hover:fill-white'
				>
					<FaSolidXmark fill='white' />
				</button>

				<h1 class='text-center text-lg font-bold'>Add a new book</h1>
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
						class='h-12 w-full rounded-lg bg-orange-600 px-4 text-center text-xl font-semibold text-white'
					>
						{mutation.isPending
							? 'Loading...'
							: mutation.isError
							? 'Error'
							: 'Add Book'}
					</button>
				</Form>
			</div>
		</div>
	);
}
