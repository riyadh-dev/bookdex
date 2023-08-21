package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID       primitive.ObjectID `json:"id"       bson:"_id"`
	Email    string             `json:"email"`
	Username string             `json:"username"`
	Password string             `json:"password"`

	SubmittedBooks []primitive.ObjectID `json:"submittedBooks" bson:"submittedBooks,omitempty"`
}

type InsertUserInput struct {
	Email    string `validate:"required,email"`
	Username string `validate:"required,min=3,max=20"`
	Password string `validate:"required,min=8,max=32"`
}

type UpdateUserInput struct {
	Email    string `validate:"email"`
	Username string `validate:"min=3,max=20" bson:"username,omitempty"`
	Password string `validate:"min=8,max=32" bson:"password,omitempty"`
}

type SignInInput struct {
	Username string `validate:"required,min=3,max=20"`
	Password string `validate:"required,min=8,max=32"`
}
