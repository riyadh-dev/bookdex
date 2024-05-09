import { makePersisted } from '@solid-primitives/storage'
import { createStore } from 'solid-js/store'
import { ICurrentUser } from './definitions/interfaces'

interface IStore {
	authModalOpen: boolean
	addBookModalOpen: boolean
	editBookModalOpen: boolean
	disableAuthActions: boolean
}

interface IPersistedStore {
	currentUser?: ICurrentUser
}

const [store, setStore] = createStore<IStore>({
	authModalOpen: false,
	addBookModalOpen: false,
	editBookModalOpen: false,
	disableAuthActions: false,
})

const [persistedStore, setPersistedStore] = makePersisted(
	// eslint-disable-next-line solid/reactivity
	createStore<IPersistedStore>({}),
	{ name: 'persist-store' }
)

export { persistedStore, setPersistedStore, setStore, store }
