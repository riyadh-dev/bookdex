package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID       primitive.ObjectID `json:"id"       bson:"_id,omitempty"`
	Email    string             `json:"email"                         validate:"required,email"`
	Username string             `json:"username"`
	Password string             `json:"password"`
}

type InsertUserInput struct {
	Email    string `validate:"email"`
	Username string `validate:"required,min=5,max=20"`
	Password string `validate:"required,min=5,max=20"`
}

type UpdateUserInput struct {
	Email    string `validate:"email"`
	Username string `                 bson:"username,omitempty"`
	Password string `                 bson:"password,omitempty"`
}
