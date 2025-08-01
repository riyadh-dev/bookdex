/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_BOOKDEX_API_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
