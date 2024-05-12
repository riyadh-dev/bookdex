import InfiniteBookList from '@/components/infinite-book-list'
import { getFetcher } from '@/config/ky'
import { TPaginatedBooks } from '@/definitions/interfaces'
import { persistedStore } from '@/store'
import { createInfiniteQuery } from '@tanstack/solid-query'

export default function MyEntriesPage() {
	const infiniteQuery = createInfiniteQuery(() => ({
		queryKey: ['books', 'currentUser'],
		queryFn: ({ pageParam }) =>
			getFetcher<TPaginatedBooks>(
				`books/submitter/${persistedStore.currentUser?.id}?limit=9&offset=${pageParam}`
			),
		initialPageParam: 0,
		getNextPageParam: ({ limit, offset, total }) => {
			const nextOffset = offset + limit
			return nextOffset < total ? nextOffset : undefined
		},
		enabled: !!persistedStore.currentUser,
	}))

	return (
		<main class='pt-4'>
			<h1 class='px-8 pb-4 text-2xl font-semibold'>My Entries</h1>
			<InfiniteBookList infiniteQuery={infiniteQuery} />
		</main>
	)
}
