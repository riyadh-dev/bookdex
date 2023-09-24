import { getFetcher } from '@/config/ky';
import { IBook } from '@/definitions/interfaces';
import { A } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { AiOutlineStar } from 'solid-icons/ai';
import { BiRegularComment } from 'solid-icons/bi';
import { FiBookmark } from 'solid-icons/fi';
import { For } from 'solid-js';

export default function ListPage() {
	const query = createQuery(
		() => ['books'],
		() => getFetcher<IBook[]>('books'),
	);

	return (
		<main>
			<ul class='grid grid-cols-3 gap-4'>
				<For each={query.data}>
					{(book) => (
						<li>
							<BookCard book={book} />
						</li>
					)}
				</For>
			</ul>
		</main>
	);
}

function BookCard(props: { book: IBook }) {
	return (
		<A
			href={`/title/${props.book.id}`}
			aria-label={`Book ${props.book.title}`}
			class='flex h-60 gap-x-4 rounded-md bg-neutral-700 p-4 text-white'
		>
			<img src={props.book.cover} alt='cover' class='h-full rounded-md' />
			<div class='overflow-hidden'>
				<h2 class='text-lg font-bold'>{props.book.title}</h2>
				<p class='pb-2'>Author: {props.book.author}</p>
				<div class='flex items-center gap-x-12 text-base leading-tight'>
					<div class='flex items-end gap-x-2 pb-1'>
						<AiOutlineStar class='fill-white' />
						<span>7.8</span>
					</div>
					<div class='flex items-end gap-x-2'>
						<FiBookmark />
						<span>500</span>
					</div>
					<div class='flex items-end gap-x-2'>
						<BiRegularComment class='fill-white' />
						<span>21</span>
					</div>
				</div>

				<p class='line-clamp-5'>{props.book.synopsis}</p>
			</div>
		</A>
	);
}
