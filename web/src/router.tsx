import { Route, Router as SolidRouter } from '@solidjs/router'
import BookmarksPage from './pages/bookmarks'
import HomePage from './pages/home'
import ListPage from './pages/my-entries'
import SettingsPage from './pages/settings'
import TitlePage from './pages/title'
import RootLayout from './shared/layout'

export default function Router() {
	return (
		<SolidRouter>
			<Route path='/' component={RootLayout}>
				<Route path='' component={HomePage} />
				<Route path='my-entries' component={ListPage} />
				<Route path='title/:id' component={TitlePage} />
				{/*<Route path='history' component={HistoryPage} />*/}
				<Route path='bookmarks' component={BookmarksPage} />
				<Route path='settings' component={SettingsPage} />
				<Route path='*' component={NotFound} />
			</Route>
		</SolidRouter>
	)
}

function NotFound() {
	return <div>Not Found</div>
}
