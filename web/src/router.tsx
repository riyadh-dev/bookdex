import { Route, Router as SolidRouter } from '@solidjs/router'
import { lazy } from 'solid-js'

const RootLayout = lazy(() => import('./layouts/root'))
const BookmarksPage = lazy(() => import('./pages/bookmarks'))
const HomePage = lazy(() => import('./pages/home'))
const MyEntries = lazy(() => import('./pages/my-entries'))
const SettingsPage = lazy(() => import('./pages/settings'))
const TitlePage = lazy(() => import('./pages/title'))

export default function Router() {
	return (
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
	)
}

function NotFound() {
	return <p class='pt-14 text-center text-2xl font-semibold'>Not Found</p>
}
