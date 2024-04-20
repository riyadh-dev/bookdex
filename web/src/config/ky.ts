import ky from 'ky'

export const kyBookDex = ky.create({
	prefixUrl: import.meta.env.VITE_APP_BOOKDEX_API_URL,
})

export const getFetcher = <TReturn>(url: string) =>
	kyBookDex.get(url).json<TReturn>()
