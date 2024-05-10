package storage

import (
	"context"

	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Books struct {
	dbColl       *mongo.Collection
	customErrors *config.CustomErrors
}

func newBooks(db *mongo.Database, customErrors *config.CustomErrors) *Books {
	return &Books{
		dbColl:       db.Collection("books"),
		customErrors: customErrors,
	}
}

func (b *Books) GetAll(query string) (*[]models.Book, error) {
	/*titleFilter := bson.M{"title": bson.M{"$regex": query, "$options": "i"}}
	authorFilter := bson.M{"author": bson.M{"$regex": query, "$options": "i"}}*/

	//TODO abstract filters
	lookupRatings := bson.M{
		"from":         "ratings",
		"localField":   "_id",
		"foreignField": "bookId",
		"as":           "ratings",
	}
	lookupComments := bson.M{
		"from":         "comments",
		"localField":   "_id",
		"foreignField": "bookId",
		"as":           "comments",
	}
	addFields := bson.M{
		"ratingCount":  bson.M{"$size": "$ratings"},
		"commentCount": bson.M{"$size": "$comments"},
	}
	project := bson.M{
		"_id":           1,
		"title":         1,
		"author":        1,
		"cover":         1,
		"synopsis":      1,
		"submitterId":   1,
		"bookmarkerIds": 1,
		"commentCount":  1,
		"avgRating": bson.M{
			"$cond": bson.M{
				"if":   bson.M{"$eq": bson.A{"$ratingCount", 0}},
				"then": 0,
				"else": bson.M{"$avg": "$ratings.value"},
			},
		},
	}
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$lookup", Value: lookupRatings}},
		bson.D{{Key: "$lookup", Value: lookupComments}},
		bson.D{{Key: "$addFields", Value: addFields}},
		bson.D{{Key: "$project", Value: project}},
	}

	cursor, err := b.dbColl.Aggregate(context.Background(), pipeline)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, b.customErrors.ErrNotFound
		}
		return nil, err
	}

	books := make([]models.Book, 0)
	err = cursor.All(context.Background(), &books)
	if err != nil {
		return nil, err
	}

	return &books, nil
}

func (b *Books) GetAllBookmarked(userId string) (*[]models.Book, error) {
	userObjId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, b.customErrors.ErrInvalidId
	}

	filter := bson.M{
		"bookmarkerIds": bson.M{"$in": []primitive.ObjectID{userObjId}},
	}
	lookupRatings := bson.M{
		"from":         "ratings",
		"localField":   "_id",
		"foreignField": "bookId",
		"as":           "ratings",
	}
	lookupComments := bson.M{
		"from":         "comments",
		"localField":   "_id",
		"foreignField": "bookId",
		"as":           "comments",
	}
	addFields := bson.M{
		"ratingCount":  bson.M{"$size": "$ratings"},
		"commentCount": bson.M{"$size": "$comments"},
	}
	project := bson.M{
		"_id":           1,
		"title":         1,
		"author":        1,
		"cover":         1,
		"synopsis":      1,
		"submitterId":   1,
		"bookmarkerIds": 1,
		"commentCount":  1,
		"avgRating": bson.M{
			"$cond": bson.M{
				"if":   bson.M{"$eq": bson.A{"$ratingCount", 0}},
				"then": 0,
				"else": bson.M{"$avg": "$ratings.value"},
			},
		},
	}
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: filter}},
		bson.D{{Key: "$lookup", Value: lookupRatings}},
		bson.D{{Key: "$lookup", Value: lookupComments}},
		bson.D{{Key: "$addFields", Value: addFields}},
		bson.D{{Key: "$project", Value: project}},
	}

	cursor, err := b.dbColl.Aggregate(context.Background(), pipeline)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, b.customErrors.ErrNotFound
		}
		return nil, err
	}

	books := make([]models.Book, 0)
	err = cursor.All(context.Background(), &books)
	if err != nil {
		return nil, err
	}

	return &books, nil
}

func (b *Books) GetById(bookId string) (*models.Book, error) {
	objBookId, err := primitive.ObjectIDFromHex(bookId)
	if err != nil {
		return nil, b.customErrors.ErrInvalidId
	}

	filter := bson.M{"_id": objBookId}
	lookupRatings := bson.M{
		"from":         "ratings",
		"localField":   "_id",
		"foreignField": "bookId",
		"as":           "ratings",
	}
	lookupComments := bson.M{
		"from":         "comments",
		"localField":   "_id",
		"foreignField": "bookId",
		"as":           "comments",
	}
	addFields := bson.M{
		"ratingCount":  bson.M{"$size": "$ratings"},
		"commentCount": bson.M{"$size": "$comments"},
	}
	project := bson.M{
		"_id":           1,
		"title":         1,
		"author":        1,
		"cover":         1,
		"synopsis":      1,
		"submitterId":   1,
		"bookmarkerIds": 1,
		"commentCount":  1,
		"avgRating": bson.M{
			"$cond": bson.M{
				"if":   bson.M{"$eq": bson.A{"$ratingCount", 0}},
				"then": 0,
				"else": bson.M{"$avg": "$ratings.value"},
			},
		},
	}
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: filter}},
		bson.D{{Key: "$lookup", Value: lookupRatings}},
		bson.D{{Key: "$lookup", Value: lookupComments}},
		bson.D{{Key: "$addFields", Value: addFields}},
		bson.D{{Key: "$project", Value: project}},
	}

	cursor, err := b.dbColl.Aggregate(context.Background(), pipeline)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, b.customErrors.ErrNotFound
		}
		return nil, err
	}

	books := make([]models.Book, 0)
	err = cursor.All(context.Background(), &books)
	if err != nil {
		return nil, err
	}

	book := &books[0]

	return book, nil
}

func (b *Books) GetBySubmitterId(submitterId string) (*[]models.Book, error) {
	objSubmitterId, err := primitive.ObjectIDFromHex(submitterId)
	if err != nil {
		return nil, b.customErrors.ErrInvalidId
	}

	filter := bson.M{"submitterId": objSubmitterId}
	lookupRatings := bson.M{
		"from":         "ratings",
		"localField":   "_id",
		"foreignField": "bookId",
		"as":           "ratings",
	}
	lookupComments := bson.M{
		"from":         "comments",
		"localField":   "_id",
		"foreignField": "bookId",
		"as":           "comments",
	}
	addFields := bson.M{
		"ratingCount":  bson.M{"$size": "$ratings"},
		"commentCount": bson.M{"$size": "$comments"},
	}
	project := bson.M{
		"_id":           1,
		"title":         1,
		"author":        1,
		"cover":         1,
		"synopsis":      1,
		"submitterId":   1,
		"bookmarkerIds": 1,
		"commentCount":  1,
		"avgRating": bson.M{
			"$cond": bson.M{
				"if":   bson.M{"$eq": bson.A{"$ratingCount", 0}},
				"then": 0,
				"else": bson.M{"$avg": "$ratings.value"},
			},
		},
	}
	pipeline := mongo.Pipeline{
		bson.D{{Key: "$match", Value: filter}},
		bson.D{{Key: "$lookup", Value: lookupRatings}},
		bson.D{{Key: "$lookup", Value: lookupComments}},
		bson.D{{Key: "$addFields", Value: addFields}},
		bson.D{{Key: "$project", Value: project}},
	}

	cursor, err := b.dbColl.Aggregate(context.Background(), pipeline)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, b.customErrors.ErrNotFound
		}
		return nil, err
	}

	books := make([]models.Book, 0)
	err = cursor.All(context.Background(), &books)
	if err != nil {
		return nil, err
	}

	return &books, nil
}

func (b *Books) Create(
	submitterId string,
	input *models.InsertBookReqInput,
) (string, error) {
	submitterObjId, err := primitive.ObjectIDFromHex(submitterId)
	if err != nil {
		return "", b.customErrors.ErrInvalidId
	}

	storageInput := &models.InsertBookStorageInput{
		Title:    input.Title,
		Author:   input.Author,
		Cover:    input.Cover,
		Synopsis: input.Synopsis,

		SubmitterID: submitterObjId,
	}

	result, err := b.dbColl.InsertOne(context.Background(), storageInput)
	if err != nil {
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func (b *Books) Update(id string, input *models.UpdateBookInput) error {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return b.customErrors.ErrInvalidId
	}

	result, err := b.dbColl.UpdateOne(
		context.Background(),
		bson.M{"_id": objectId},
		bson.M{"$set": input},
	)
	if result.MatchedCount == 0 {
		return b.customErrors.ErrNotFound
	}

	return err
}

func (b *Books) Delete(id string) error {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return b.customErrors.ErrInvalidId
	}

	result, err := b.dbColl.DeleteOne(
		context.Background(),
		bson.M{"_id": objectId},
	)
	if result.DeletedCount == 0 {
		return b.customErrors.ErrNotFound
	}

	return err
}

func (b *Books) Bookmark(bookId string, userId string) error {
	objectBookId, err := primitive.ObjectIDFromHex(bookId)
	if err != nil {
		return b.customErrors.ErrInvalidId
	}

	objectUserId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return b.customErrors.ErrInvalidId
	}

	_, err = b.dbColl.UpdateOne(
		context.Background(),
		bson.M{"_id": objectBookId},
		bson.M{"$addToSet": bson.M{"bookmarkerIds": objectUserId}},
	)
	if err != nil {
		return err
	}

	return nil
}

func (b *Books) Unbookmark(bookId string, userId string) error {
	objectBookId, err := primitive.ObjectIDFromHex(bookId)
	if err != nil {
		return b.customErrors.ErrInvalidId
	}

	objectUserId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return b.customErrors.ErrInvalidId
	}

	_, err = b.dbColl.UpdateOne(
		context.Background(),
		bson.M{"_id": objectBookId},
		bson.M{"$pull": bson.M{"bookmarkerIds": objectUserId}},
	)
	if err != nil {
		return err
	}

	return nil
}
