import { persistedStore } from '@/store'
import ky from 'ky'

export const api = ky.create({
	prefixUrl: import.meta.env.VITE_APP_BOOKDEX_API_URL,
})

export const apiWithAuth = api.extend({
	hooks: {
		beforeRequest: [
			(request) => {
				request.headers.set(
					'Authorization',
					`Bearer ${persistedStore.token}`
				)
			},
		],
	},
})
