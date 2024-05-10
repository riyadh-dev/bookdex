package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Book struct {
	ID            primitive.ObjectID   `bson:"_id"           json:"id"`
	Title         string               `                     json:"title"`
	Author        string               `                     json:"author"`
	Cover         string               `                     json:"cover"`
	Synopsis      string               `                     json:"synopsis"`
	SubmitterID   primitive.ObjectID   `bson:"submitterId"   json:"submitterId"`
	BookmarkerIDs []primitive.ObjectID `bson:"bookmarkerIds" json:"bookmarkerIds,omitempty"`
	CommentCount  int                  `bson:"commentCount"  json:"commentCount,omitempty"`
	AvgRating     float64              `bson:"avgRating"     json:"avgRating,omitempty"`
}

type InsertBookReqInput struct {
	Title    string `validate:"required,min=5,max=20"`
	Author   string `validate:"required,min=5,max=20"`
	Cover    string `validate:"url_encoded"`
	Synopsis string `validate:"required,min=5,max=750"`
}

type InsertBookStorageInput struct {
	Title    string `validate:"required,min=5,max=20"`
	Author   string `validate:"required,min=5,max=20"`
	Cover    string `validate:"url_encoded"`
	Synopsis string `validate:"required,min=5,max=750"`

	SubmitterID primitive.ObjectID `validate:"required" json:"submitterId" bson:"submitterId"`
}

type UpdateBookInput struct {
	Title    string `bson:"title,omitempty"    validate:"required,max=20"`
	Author   string `bson:"author,omitempty"   validate:"required,max=20"`
	Cover    string `bson:"cover,omitempty"    validate:"url_encoded"`
	Synopsis string `bson:"synopsis,omitempty" validate:"required,max=60"`
}
