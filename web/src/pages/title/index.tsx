import { getFetcher } from '@/config/ky';
import { IBook } from '@/definitions/interfaces';
import { useParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { Match, Switch } from 'solid-js';

export default function TitlePage() {
	const params = useParams();
	const query = createQuery(
		() => ['book', params.id],
		() => getFetcher<IBook>(`books/${params.id}`),
	);

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
				<main>
					<h1>{query.data?.title}</h1>
					<img src={query.data?.cover} alt='cover' class='w-44' />
					<p>{query.data?.synopsis}</p>
				</main>
			</Match>
		</Switch>
	);
}
