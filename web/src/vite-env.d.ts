/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_BOOKDEX_API_URL: string
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
	readonly env: ImportMetaEnv
}
