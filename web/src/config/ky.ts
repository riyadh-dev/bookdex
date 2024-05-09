import ky from 'ky'

export const api = ky.create({
	prefixUrl: import.meta.env.VITE_APP_BOOKDEX_API_URL,
	credentials: 'include',
})

export const getFetcher = <TReturn>(url: string) => api.get(url).json<TReturn>()
