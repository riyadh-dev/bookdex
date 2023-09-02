import { Route, Routes } from '@solidjs/router';
import BookmarksPage from './pages/bookmarks';
import HistoryPage from './pages/history';
import HomePage from './pages/home';
import ListPage from './pages/list';
import SettingsPage from './pages/settings';
import RootLayout from './shared/layout';

export default function Router() {
	return (
		<Routes>
			<Route path='/' component={RootLayout}>
				<Route path='' component={HomePage} />
				<Route path='list' component={ListPage} />
				<Route path='history' component={HistoryPage} />
				<Route path='bookmarks' component={BookmarksPage} />
				<Route path='settings' component={SettingsPage} />
				<Route path='*' component={NotFound} />
			</Route>
		</Routes>
	);
}

function NotFound() {
	return <div>Not Found</div>;
}
