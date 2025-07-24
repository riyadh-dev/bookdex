import { createStore } from 'solid-js/store'
import type { ICurrentUser } from './types'

interface IStore {
	authModalOpen: boolean
	addBookModalOpen: boolean
	editBookModalOpen: boolean
	disableAuthActions: boolean
	sideBarOpen: boolean
	currentUser?: ICurrentUser
}

const [store, setStore] = createStore<IStore>({
	authModalOpen: false,
	addBookModalOpen: false,
	editBookModalOpen: false,
	disableAuthActions: false,
	sideBarOpen: false,
	currentUser: undefined,
})

export { setStore, store }
