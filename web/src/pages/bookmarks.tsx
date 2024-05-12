import InfiniteBookList from '@/components/infinite-book-list'
import { getFetcher } from '@/config/ky'
import { TPaginatedBooks } from '@/definitions/interfaces'
import { createInfiniteQuery } from '@tanstack/solid-query'

export default function BookmarksPage() {
	const infiniteQuery = createInfiniteQuery(() => ({
		queryKey: ['books', 'bookmarked'],
		queryFn: ({ pageParam }) =>
			getFetcher<TPaginatedBooks>(
				`books/bookmarked?limit=9&offset=${pageParam}`
			),
		initialPageParam: 0,
		getNextPageParam: ({ limit, offset, total }) => {
			const nextOffset = offset + limit
			return nextOffset < total ? nextOffset : undefined
		},
	}))

	return (
		<main class='pt-4'>
			<h1 class='px-8 pb-4 text-2xl font-semibold'>Bookmarks</h1>
			<InfiniteBookList infiniteQuery={infiniteQuery} />
		</main>
	)
}
