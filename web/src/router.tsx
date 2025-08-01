import { Route, Router as SolidRouter } from '@solidjs/router'
import { useQuery } from '@tanstack/solid-query'
import { Show, lazy } from 'solid-js'

import api from '@/libs/api'

import type { ICurrentUser } from '@/types'

import { setStore } from '@/store'
import { CgSpinnerTwo } from 'solid-icons/cg'

const RootLayout = lazy(() => import('./layouts/root'))
const BookmarksPage = lazy(() => import('./pages/bookmarks'))
const HomePage = lazy(() => import('./pages/home'))
const MyEntries = lazy(() => import('./pages/my-entries'))
const SettingsPage = lazy(() => import('./pages/settings'))
const TitlePage = lazy(() => import('./pages/title'))

const queryFn = async () => {
	const user = await api.get('auth/me', { retry: 0 }).json<ICurrentUser>()
	setStore('currentUser', user)
	return user
}

export default function Router() {
	const currentUserQuery = useQuery(() => ({
		queryKey: ['me'],
		queryFn,
		retry: false,
		refetchInterval: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
	}))

	return (
		<Show
			when={!currentUserQuery.isPending}
			fallback={
				<div class='flex h-screen items-center justify-center'>
					<CgSpinnerTwo class='animate-spin content-center text-7xl text-teal-600' />
				</div>
			}
		>
			<SolidRouter>
				<Route path='/' component={RootLayout}>
					<Route path='' component={HomePage} />
					<Route path='title/:id' component={TitlePage} />
					<Route path='my-entries' component={MyEntries} />
					<Route path='bookmarks' component={BookmarksPage} />
					<Route path='settings' component={SettingsPage} />
					<Route path='*' component={NotFound} />
				</Route>
			</SolidRouter>
		</Show>
	)
}

function NotFound() {
	return <p class='pt-14 text-center text-2xl font-semibold'>Not Found</p>
}
