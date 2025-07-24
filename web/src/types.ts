export interface ICurrentUser {
	id: string
	email: string
	username: string
	avatar?: string
	exp: number
}

export interface ILoginRes extends ICurrentUser {
	token: string
}

export interface IBook {
	id: string
	title: string
	author: string
	cover: string
	synopsis: string

	submitterId: string
	bookmarkerIds?: string[]
	avgRating?: number
	commentCount?: number
}

export interface IComment {
	id: string
	text: string
	createdAt: Date
	author: {
		id: string
		username: string
		avatar: string
	}
}

export interface IRating {
	bookId: string
	raterId: string
	value: number
}

export interface Paginated<TDataItem> {
	data: TDataItem[]
	total: number
	offset: number
	limit: number
}

export type TPaginatedBooks = Paginated<IBook>
