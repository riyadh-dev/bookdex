package storage

import (
	"context"
	"time"

	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Comments struct {
	dbColl       *mongo.Collection
	customErrors *config.CustomErrors
}

func newComments(
	db *mongo.Database,
	customErrors *config.CustomErrors,
) *Comments {
	return &Comments{
		dbColl:       db.Collection("comments"),
		customErrors: customErrors,
	}

}

func (r *Comments) GetById(id string) (*models.Comment, error) {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, r.customErrors.ErrInvalidId
	}

	var comment = new(models.Comment)
	err = r.dbColl.FindOne(context.Background(), bson.M{"_id": objectId}).
		Decode(comment)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, r.customErrors.ErrNotFound
		}
		return nil, err
	}

	return comment, nil
}

func (r *Comments) GetAllByBookId(
	id string,
) (*[]models.CommentWithAuthor, error) {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, r.customErrors.ErrInvalidId
	}

	filter := bson.M{"bookId": objectId}
	sort := bson.M{"createdAt": -1}
	lookup := bson.M{
		"from":         "users",
		"localField":   "authorId",
		"foreignField": "_id",
		"as":           "author",
	}
	project := bson.M{
		"_id":       1,
		"text":      1,
		"author":    bson.M{"_id": 1, "username": 1, "avatar": 1},
		"createdAt": 1,
	}

	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: filter}},
		bson.D{{Key: "$sort", Value: sort}},
		bson.D{{Key: "$lookup", Value: lookup}},
		bson.D{{Key: "$project", Value: project}},
		bson.D{{Key: "$unwind", Value: "$author"}},
	}

	cursor, err := r.dbColl.Aggregate(
		context.Background(),
		pipeline,
	)
	if err != nil {
		return nil, err
	}

	comments := make([]models.CommentWithAuthor, 0)
	err = cursor.All(context.Background(), &comments)
	if err != nil {
		return nil, err
	}

	return &comments, nil
}

func (r *Comments) Create(
	authorId string,
	bookId string,
	input *models.InsertCommentReqInput,
) (string, error) {
	authorObjId, err := primitive.ObjectIDFromHex(authorId)
	if err != nil {
		return "", r.customErrors.ErrInvalidId
	}

	bookObjId, err := primitive.ObjectIDFromHex(bookId)
	if err != nil {
		return "", r.customErrors.ErrInvalidId
	}

	storageInput := &models.InsertCommentStorageInput{
		AuthorID: authorObjId,
		BookID:   bookObjId,

		Text:      input.Text,
		CreatedAt: time.Now().UTC(),
	}

	result, err := r.dbColl.InsertOne(context.Background(), storageInput)
	if err != nil {
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func (r *Comments) Update(id string, input *models.UpdateCommentInput) error {
	commentID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return r.customErrors.ErrInvalidId
	}

	filter := bson.M{"_id": commentID}
	update := bson.M{"$set": input}

	res, err := r.dbColl.UpdateOne(context.Background(), filter, update)
	if res.MatchedCount == 0 {
		return r.customErrors.ErrNotFound
	}

	return err
}

func (r *Comments) Delete(id string) error {

	commentID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return r.customErrors.ErrInvalidId
	}

	_, err = r.dbColl.DeleteOne(context.Background(), bson.M{"_id": commentID})

	return err
}
