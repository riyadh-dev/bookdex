import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
	plugins: [solid(), tailwindcss()],
	server: { host: '127.0.0.1', port: 3000 },
	resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
