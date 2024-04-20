import { getFetcher } from '@/config/ky'
import { IBook } from '@/definitions/interfaces'
import { useParams } from '@solidjs/router'
import { createQuery } from '@tanstack/solid-query'
import { FaRegularBookmark } from 'solid-icons/fa'
import { FiShoppingCart } from 'solid-icons/fi'
import { Match, Switch } from 'solid-js'

export default function TitlePage() {
	const params = useParams()
	const query = createQuery(() => ({
		queryKey: ['book', params.id],
		queryFn: () => getFetcher<IBook>(`books/${params.id}`),
	}))

	return (
		<Switch
			fallback={
				<h1 class='pb-14 text-center text-3xl font-semibold text-red-500'>
					Something went wrong
				</h1>
			}
		>
			<Match when={query.isLoading}>
				<h1 class='pb-14 text-center text-3xl font-semibold text-teal-600'>
					Loading..
				</h1>
			</Match>

			<Match when={query.data}>
				<main class='relative'>
					<img
						src={query.data?.cover}
						alt='cover'
						class='absolute -z-10 h-80 w-full object-cover opacity-50 blur'
					/>
					<div class='flex gap-x-6 px-12 pt-24'>
						<img
							src={query.data?.cover}
							alt='cover'
							class='w-48 rounded'
						/>
						<div class='flex flex-col'>
							<h1 class='text-6xl font-bold'>
								{query.data?.title}
							</h1>

							<h2 class='pt-32 text-lg'>{query.data?.author}</h2>

							<div class='mt-auto flex gap-x-2'>
								<button class='flex items-center gap-x-2 rounded bg-orange-600 px-6 py-3'>
									<span>
										<FaRegularBookmark />
									</span>
									Bookmark
								</button>
								<button class='flex items-center gap-x-2 rounded bg-orange-600 px-6 py-3'>
									<span>
										<FiShoppingCart />
									</span>
									Buy
								</button>
							</div>
						</div>
					</div>

					<p class='px-8 pt-6 text-lg'>{query.data?.synopsis}</p>

					<div class='p-8'>
						<div class='w-full border-t border-neutral-600' />
					</div>

					<div class='px-8'>
						<h2 class='text-lg font-bold'>Reviews</h2>
					</div>
				</main>
			</Match>
		</Switch>
	)
}
