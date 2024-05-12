import InfiniteBookList from '@/components/infinite-book-list'
import { getFetcher } from '@/config/ky'
import { TPaginatedBooks } from '@/definitions/interfaces'
import { createInfiniteQuery } from '@tanstack/solid-query'

export default function HomePage() {
	const infiniteQuery = createInfiniteQuery(() => ({
		queryKey: ['books', 'home'],
		queryFn: ({ pageParam }) =>
			getFetcher<TPaginatedBooks>(`books?limit=9&offset=${pageParam}`),
		initialPageParam: 0,
		getNextPageParam: ({ limit, offset, total }) => {
			const nextOffset = offset + limit
			return nextOffset < total ? nextOffset : undefined
		},
	}))

	return (
		<main class='pt-4'>
			<InfiniteBookList infiniteQuery={infiniteQuery} />
		</main>
	)
}
