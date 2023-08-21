package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Book struct {
	ID     primitive.ObjectID `bson:"_id"`
	Title  string
	Author string

	SubmitterID primitive.ObjectID `json:"submitterId" bson:"submitterId"`
}

type InsertBookReqInput struct {
	Title  string `validate:"required,min=5,max=20"`
	Author string `validate:"required,min=5,max=20"`
}

type InsertBookStorageInput struct {
	Title  string `validate:"required,min=5,max=20"`
	Author string `validate:"required,min=5,max=20"`

	SubmitterID primitive.ObjectID `validate:"required" json:"submitterId" bson:"submitterId"`
}

type UpdateBookInput struct {
	Title  string `bson:"title,omitempty"`
	Author string `bson:"author,omitempty"`
}
