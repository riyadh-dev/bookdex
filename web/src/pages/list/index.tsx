import { getFetcher } from '@/config/ky';
import { IBook } from '@/definitions/interfaces';
import { createQuery } from '@tanstack/solid-query';
import { For } from 'solid-js';

export default function ListPage() {
	const query = createQuery(
		() => ['books'],
		() => getFetcher<IBook[]>('books'),
	);

	return (
		<main>
			<ul class='flex flex-wrap justify-center gap-6'>
				<For each={query.data}>
					{(book) => (
						<li>
							<img src={book.cover} alt='cover' class='w-44' />
						</li>
					)}
				</For>
			</ul>
		</main>
	);
}
