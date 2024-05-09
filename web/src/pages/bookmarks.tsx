import { BookCard } from '@/components/book-card'
import { getFetcher } from '@/config/ky'
import { IBook } from '@/definitions/interfaces'
import { createQuery } from '@tanstack/solid-query'
import { For, Match, Switch } from 'solid-js'

export default function BookmarksPage() {
	const query = createQuery(() => ({
		queryKey: ['books', 'bookmarked'],
		queryFn: () => getFetcher<IBook[]>('books/bookmarked'),
	}))

	return (
		<main class='pt-4'>
			<h1 class='px-8 pb-4 text-2xl font-semibold'>Bookmarks</h1>
			<Switch>
				<Match when={query.isPending}>
					<ul class='grid grid-cols-3 gap-4 px-8'>
						<For each={Array.from({ length: 9 })}>
							{() => (
								<li class='flex h-60 animate-pulse gap-x-4 rounded bg-neutral-700 p-4 text-white' />
							)}
						</For>
					</ul>
				</Match>

				<Match when={query.isError}>
					<p class='pt-14 text-center text-2xl font-semibold text-red-600'>
						Something went wrong
					</p>
				</Match>

				<Match when={query.isSuccess}>
					<ul class='grid grid-cols-3 gap-4 px-8'>
						<For each={query.data}>
							{(book) => (
								<li>
									<BookCard book={book} />
								</li>
							)}
						</For>
					</ul>
				</Match>
			</Switch>
		</main>
	)
}
