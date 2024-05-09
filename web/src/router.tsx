import { Route, Router as SolidRouter } from '@solidjs/router'
import RootLayout from './layouts/root'
import BookmarksPage from './pages/bookmarks'
import HomePage from './pages/home'
import MyEntries from './pages/my-entries'
import SettingsPage from './pages/settings'
import TitlePage from './pages/title'

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
