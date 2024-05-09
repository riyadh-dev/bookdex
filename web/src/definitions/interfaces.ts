export interface IBook {
	id: string
	title: string
	author: string
	cover: string
	synopsis: string

	submitterId: string
	bookmarkerIds: string[]
}

export interface ICurrentUser {
	id: string
	email: string
	username: string
	avatar?: string
	exp: number
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
