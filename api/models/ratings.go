package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Rating struct {
	BookID  primitive.ObjectID `json:"bookId"  bson:"bookId"`
	RaterID primitive.ObjectID `json:"raterId" bson:"raterId"`
	Value   int                `json:"value"   bson:"value"`
}

type RatingReqInput struct {
	Value int `json:"value" bson:"value"`
}
