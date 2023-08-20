package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Book struct {
	ID     primitive.ObjectID `bson:"_id,omitempty"`
	Title  string
	Author string
}

type InsertBookInput struct {
	Title  string `validate:"required,min=5,max=20"`
	Author string `validate:"required,min=5,max=20"`
}

type UpdateBookInput struct {
	Title  string `bson:"title,omitempty"`
	Author string `bson:"author,omitempty"`
}
