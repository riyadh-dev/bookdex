import InfiniteBookList from '@/components/infinite-book-list'
import api from '@/libs/api'
import { store } from '@/store'
import type { TPaginatedBooks } from '@/types'
import { useNavigate } from '@solidjs/router'
import { useInfiniteQuery } from '@tanstack/solid-query'

export default function MyEntriesPage() {
	const infiniteQuery = useInfiniteQuery(() => ({
		queryKey: ['books', 'currentUser'],
		queryFn: ({ pageParam }) =>
			api
				.get(
					`books/submitter/${store.currentUser?.id}?limit=9&offset=${pageParam}`
				)
				.json<TPaginatedBooks>(),
		initialPageParam: 0,
		getNextPageParam: ({ limit, offset, total }) => {
			const nextOffset = offset + limit
			return nextOffset < total ? nextOffset : undefined
		},
	}))

	const navigate = useNavigate()
	if (!store.currentUser) navigate('/', { replace: true })

	return (
		<main class='pt-4'>
			<h1 class='px-8 pb-4 text-2xl font-semibold'>My Entries</h1>
			<InfiniteBookList infiniteQuery={infiniteQuery} />
		</main>
	)
}
