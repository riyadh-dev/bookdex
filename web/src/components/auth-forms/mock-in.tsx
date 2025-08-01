import { useMutation, useQuery } from '@tanstack/solid-query'
import { For, Match, Show, Switch } from 'solid-js'

import api from '@/libs/api'

import type { ICurrentUser } from '@/types'

import { setStore } from '@/store'

interface TSignIn {
	email: string
	password: string
}

export default function MockIn() {
	const query = useQuery(() => ({
		queryKey: ['users', 'mocked'],
		queryFn: () => api.get('users/mocked').json<ICurrentUser[]>(),
	}))

	const mutation = useMutation(() => ({
		mutationFn: (data: TSignIn) =>
			api.post('auth/sign-in', { json: data }).json<ICurrentUser>(),
		onSuccess(currentUser) {
			setStore('currentUser', currentUser)
			setStore('authModalOpen', false)
		},
	}))

	const handleMockIn = (email: string) => {
		mutation.mutate({ email, password: 'password' })
	}

	return (
		<Switch>
			<Match when={query.isPending}>
				<ul class='-mr-5 grid max-h-56 grid-cols-2 gap-2 overflow-y-scroll pr-5'>
					<Skeleton />
				</ul>
			</Match>
			<Match when={mutation.isPending}>
				<p class='py-14 text-center text-2xl font-semibold text-teal-600'>
					Signing in...
				</p>
			</Match>
			<Match when={query.isSuccess}>
				<ul class='-mr-5 grid max-h-56 grid-cols-2 gap-2 overflow-y-scroll pr-5'>
					<For each={query.data}>
						{(user) => (
							<li>
								<button
									onClick={() => handleMockIn(user.email)}
									class='flex w-full cursor-pointer items-center gap-x-4 rounded bg-orange-600 px-4 py-2 text-sm font-semibold'
								>
									{user.avatar ? (
										<img
											src={user.avatar}
											alt=''
											class='size-9 rounded-full'
										/>
									) : (
										<div class='h-9 w-9 rounded-full bg-gradient-to-br from-orange-600 to-purple-600' />
									)}
									<span class='truncate'>
										{user.username}
									</span>
								</button>
							</li>
						)}
					</For>
				</ul>

				<Show when={mutation.isError}>
					<p class='text-center text-lg font-semibold text-red-600'>
						Failed to sign in
					</p>
				</Show>
			</Match>
		</Switch>
	)
}

function Skeleton() {
	return (
		<For each={Array.from({ length: 8 })}>
			{() => (
				<li class='flex items-center gap-x-4 rounded bg-orange-600 px-4 py-2'>
					<span class='size-9 shrink-0 animate-pulse rounded-full bg-orange-400' />

					<span class='h-4 grow animate-pulse rounded-lg bg-orange-400' />
				</li>
			)}
		</For>
	)
}
