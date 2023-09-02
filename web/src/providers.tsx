import { Router } from '@solidjs/router';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { JSXElement } from 'solid-js';

const queryClient = new QueryClient();

interface IProps {
	children: JSXElement;
}

export default function Providers(props: IProps) {
	return (
		<Router>
			<QueryClientProvider client={queryClient}>
				{props.children}
			</QueryClientProvider>
		</Router>
	);
}
