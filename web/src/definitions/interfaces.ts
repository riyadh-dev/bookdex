export interface IBook {
	id: string
	title: string
	author: string
	cover: string
	synopsis: string

	submitterId: string
}

export interface ICurrentUser {
	id: string
	username: string
	exp: number
}
