package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID       primitive.ObjectID `json:"id"               bson:"_id"`
	Email    string             `json:"email"`
	Username string             `json:"username"`
	Avatar   string             `json:"avatar,omitempty"`
	Password string             `json:"password"`
}

type InsertUserInput struct {
	Email    string `validate:"required,email"`
	Username string `validate:"required,min=3,max=20"`
	Password string `validate:"required,min=8,max=32"`
	Avatar   string `validate:"url_encoded"`
}

type UpdateUserInput struct {
	Email    string `validate:"email"        bson:"email,omitempty"`
	Username string `validate:"min=3,max=20" bson:"username,omitempty"`
	Password string `validate:"min=8,max=32" bson:"password,omitempty"`
}

type SignInInput struct {
	Email    string `validate:"required,email"`
	Password string `validate:"required,min=8,max=32"`
}
