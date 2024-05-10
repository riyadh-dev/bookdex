import { IBook } from '@/definitions/interfaces'
import { A } from '@solidjs/router'
import { AiOutlineStar } from 'solid-icons/ai'
import { BiRegularComment } from 'solid-icons/bi'
import { FiBookmark } from 'solid-icons/fi'

export function BookCard(props: { book: IBook }) {
	return (
		<A
			href={`/title/${props.book.id}`}
			aria-label={`Book ${props.book.title}`}
			class='flex h-60 gap-x-4 rounded bg-neutral-700 p-4 text-white'
		>
			<img src={props.book.cover} alt='cover' class='h-full rounded' />
			<div class='overflow-hidden'>
				<h2 class='text-lg font-bold'>{props.book.title}</h2>
				<p class='pb-2'>Author: {props.book.author}</p>
				<div class='flex flex-wrap items-center gap-x-12 text-base leading-tight'>
					<div class='flex items-end gap-x-2 pb-1'>
						<AiOutlineStar class='fill-white' />
						<span>{props.book.avgRating ?? '-'}</span>
					</div>
					<div class='flex items-end gap-x-2'>
						<FiBookmark />
						<span>{props.book.bookmarkerIds?.length ?? 0}</span>
					</div>
					<div class='flex items-end gap-x-2'>
						<BiRegularComment class='fill-white' />
						<span>{props.book.commentCount ?? 0}</span>
					</div>
				</div>

				<p class='line-clamp-5'>{props.book.synopsis}</p>
			</div>
		</A>
	)
}
