import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
	plugins: [solid()],
	server: {
		host: '127.0.0.1',
		port: 3001,
	},
	resolve: {
		alias: [
			{
				find: '@',
				replacement: fileURLToPath(new URL('./src', import.meta.url)),
			},
		],
	},
})
