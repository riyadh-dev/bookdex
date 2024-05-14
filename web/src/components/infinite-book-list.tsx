import { TPaginatedBooks } from '@/definitions'
import { createIntersectionObserver } from '@solid-primitives/intersection-observer'
import { CreateInfiniteQueryResult, InfiniteData } from '@tanstack/solid-query'
import { For, Match, Switch, createSignal } from 'solid-js'
import { BookCard } from './book-card'
import BookCardSkeleton from './book-card-skeleton'

interface IProps {
	infiniteQuery: CreateInfiniteQueryResult<InfiniteData<TPaginatedBooks>>
}

export default function InfiniteBookList(props: IProps) {
	const [intersectionEls, setIntersectionEls] = createSignal<Element[]>([])

	createIntersectionObserver(intersectionEls, (entries) => {
		if (entries[0].isIntersecting && props.infiniteQuery.hasNextPage)
			props.infiniteQuery.fetchNextPage()
	})

	return (
		<Switch>
			<Match when={props.infiniteQuery.isPending}>
				<ul class='grid grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-3'>
					<For each={Array.from({ length: 9 })}>
						{() => <BookCardSkeleton />}
					</For>
				</ul>
			</Match>

			<Match when={props.infiniteQuery.isError}>
				<p class='pt-14 text-center text-2xl font-semibold text-red-600'>
					Something went wrong
				</p>
			</Match>

			<Match when={props.infiniteQuery.isSuccess}>
				<ul class='grid grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-8 lg:grid-cols-3'>
					<For each={props.infiniteQuery.data?.pages}>
						{(pages) => (
							<For each={pages.data}>
								{(book) => (
									<li>
										<BookCard book={book} />
									</li>
								)}
							</For>
						)}
					</For>
				</ul>

				<Switch>
					<Match when={props.infiniteQuery.isFetchingNextPage}>
						<ul class='grid grid-cols-1 gap-4 px-4 pt-4 md:grid-cols-2 md:px-8 lg:grid-cols-3'>
							<For each={Array.from({ length: 3 })}>
								{() => <BookCardSkeleton />}
							</For>
						</ul>
					</Match>
					<Match
						when={
							props.infiniteQuery.hasNextPage &&
							!props.infiniteQuery.isFetchingNextPage
						}
					>
						<div
							ref={(el) => setIntersectionEls([el])}
							class='h-0'
							aria-hidden
						/>
					</Match>
				</Switch>
			</Match>
		</Switch>
	)
}
