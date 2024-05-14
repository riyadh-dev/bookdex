import { makePersisted } from '@solid-primitives/storage'
import { createStore } from 'solid-js/store'
import { ICurrentUser } from './definitions'

interface IStore {
	authModalOpen: boolean
	addBookModalOpen: boolean
	editBookModalOpen: boolean
	disableAuthActions: boolean
	sideBarOpen: boolean
}

interface IPersistedStore {
	currentUser?: ICurrentUser
	token?: string
}

const [store, setStore] = createStore<IStore>({
	authModalOpen: false,
	addBookModalOpen: false,
	editBookModalOpen: false,
	disableAuthActions: false,
	sideBarOpen: false,
})

const [persistedStore, setPersistedStore] = makePersisted(
	// eslint-disable-next-line solid/reactivity
	createStore<IPersistedStore>({}),
	{ name: 'store' }
)

export { persistedStore, setPersistedStore, setStore, store }
