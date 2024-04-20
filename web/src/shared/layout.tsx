import { RouteSectionProps } from '@solidjs/router'
import Sidebar from './sidebar'
import TopBar from './top-bar'

export default function RootLayout(props: RouteSectionProps) {
	return (
		<div class='flex py-8'>
			<Sidebar />
			<div class='grow'>
				<TopBar />
				{props.children}
			</div>
		</div>
	)
}
