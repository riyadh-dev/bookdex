import ky from 'ky'

const api = ky.create({
	prefixUrl: import.meta.env.VITE_APP_BOOKDEX_API_URL,
	credentials: 'include',
})

export default api
