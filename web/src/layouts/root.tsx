import type { RouteSectionProps } from '@solidjs/router'

import Sidebar from '@/components/sidebar'
import TopBar from '@/components/top-bar'

export default function RootLayout(props: RouteSectionProps) {
	return (
		<div class='flex'>
			<Sidebar />
			<div class='grow pb-8'>
				<TopBar />
				{props.children}
			</div>
		</div>
	)
}
