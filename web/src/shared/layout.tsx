import { Outlet } from '@solidjs/router';
import Sidebar from './sidebar';
import TopBar from './top-bar';

export default function RootLayout() {
	return (
		<div class='flex py-8'>
			<Sidebar />
			<div class='grow px-12'>
				<TopBar />
				<Outlet />
			</div>
		</div>
	);
}
