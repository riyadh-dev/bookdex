import { getFetcher } from '@/config/ky'
import { IBook } from '@/definitions/interfaces'
import { BookCard } from '@/shared/book-card'
import { createQuery } from '@tanstack/solid-query'
import { For } from 'solid-js'

export default function FollowsPage() {
	const query = createQuery(() => ({
		queryKey: ['books'],
		queryFn: () => getFetcher<IBook[]>('books'),
	}))

	return (
		<main>
			<ul class='grid grid-cols-3 gap-4 px-8'>
				<For each={query.data}>
					{(book) => (
						<li>
							<BookCard book={book} />
						</li>
					)}
				</For>
			</ul>
		</main>
	)
}
