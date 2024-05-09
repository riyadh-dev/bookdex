package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Comment struct {
	ID        primitive.ObjectID `bson:"_id"       json:"id"`
	AuthorID  primitive.ObjectID `bson:"authorId"  json:"authorId"`
	BookID    primitive.ObjectID `bson:"bookId"    json:"bookId"`
	Text      string             `bson:"text"      json:"text"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type InsertCommentReqInput struct {
	Text string `json:"text"`
}

type InsertCommentStorageInput struct {
	AuthorID  primitive.ObjectID `bson:"authorId"  json:"authorId"`
	BookID    primitive.ObjectID `bson:"bookId"    json:"bookId"`
	Text      string             `                 json:"text"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type UpdateCommentInput struct {
	Text string `json:"text"`
}

type CommentAuthor struct {
	ID       primitive.ObjectID `bson:"_id"      json:"id"`
	Username string             `bson:"username" json:"username"`
	Avatar   string             `bson:"avatar"   json:"avatar"`
}

type CommentWithAuthor struct {
	ID        primitive.ObjectID `bson:"_id"       json:"id"`
	Text      string             `bson:"text"      json:"text"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	Author    CommentAuthor      `bson:"author"    json:"author"`
}
