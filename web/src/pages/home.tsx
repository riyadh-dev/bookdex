import { useInfiniteQuery } from '@tanstack/solid-query'

import InfiniteBookList from '@/components/infinite-book-list'

import api from '@/libs/api'

import type { TPaginatedBooks } from '@/types'

export default function HomePage() {
	const infiniteQuery = useInfiniteQuery(() => ({
		queryKey: ['books', 'home'],
		queryFn: ({ pageParam }) =>
			api
				.get(`books?limit=9&offset=${pageParam}`)
				.json<TPaginatedBooks>(),
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
