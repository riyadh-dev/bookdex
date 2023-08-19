package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Book struct {
	ID     primitive.ObjectID `json:"id"     bson:"_id,omitempty"`
	Title  string             `json:"title"`
	Author string             `json:"author"`
}

type InsertBookInput struct {
	Title  string `json:"title"`
	Author string `json:"author"`
}

type UpdateBookInput struct {
	Title  string `json:"title,omitempty"  bson:"title,omitempty"`
	Author string `json:"author,omitempty" bson:"author,omitempty"`
}
