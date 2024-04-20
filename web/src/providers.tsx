import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { JSXElement } from 'solid-js'

const queryClient = new QueryClient()

export default function Providers(props: { children: JSXElement }) {
	return (
		<QueryClientProvider client={queryClient}>
			{props.children}
		</QueryClientProvider>
	)
}
