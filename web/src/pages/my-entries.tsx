import InfiniteBookList from '@/components/infinite-book-list'
import { api } from '@/config/ky'
import { TPaginatedBooks } from '@/definitions'
import { persistedStore } from '@/store'
import { useNavigate } from '@solidjs/router'
import { createInfiniteQuery } from '@tanstack/solid-query'

export default function MyEntriesPage() {
	const infiniteQuery = createInfiniteQuery(() => ({
		queryKey: ['books', 'currentUser'],
		queryFn: ({ pageParam }) =>
			api
				.get(
					`books/submitter/${persistedStore.currentUser?.id}?limit=9&offset=${pageParam}`
				)
				.json<TPaginatedBooks>(),
		initialPageParam: 0,
		getNextPageParam: ({ limit, offset, total }) => {
			const nextOffset = offset + limit
			return nextOffset < total ? nextOffset : undefined
		},
		enabled: !!persistedStore.currentUser,
	}))

	const navigate = useNavigate()
	if (!persistedStore.token) {
		navigate('/', { replace: true })
	}

	return (
		<main class='pt-4'>
			<h1 class='px-8 pb-4 text-2xl font-semibold'>My Entries</h1>
			<InfiniteBookList infiniteQuery={infiniteQuery} />
		</main>
	)
}
