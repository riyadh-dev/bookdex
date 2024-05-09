package storage

import (
	"context"

	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/sync/errgroup"
)

type Books struct {
	dbColl       *mongo.Collection
	dbUsersColl  *mongo.Collection
	customErrors *config.CustomErrors
}

func newBooks(db *mongo.Database, customErrors *config.CustomErrors) *Books {
	return &Books{
		dbColl:       db.Collection("books"),
		dbUsersColl:  db.Collection("users"),
		customErrors: customErrors,
	}
}

func (b *Books) GetAll(query string) (*[]models.Book, error) {
	titleFilter := bson.M{"title": bson.M{"$regex": query, "$options": "i"}}
	authorFilter := bson.M{"author": bson.M{"$regex": query, "$options": "i"}}
	filter := bson.M{"$or": []bson.M{titleFilter, authorFilter}}
	cursor, err := b.dbColl.Find(context.Background(), filter)
	if err != nil {
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

	books := make([]models.Book, 0)
	cursor, err := b.dbColl.Find(context.Background(), bson.M{
		"bookmarkerIds": bson.M{"$in": []primitive.ObjectID{userObjId}},
	})
	if err != nil {
		return nil, err
	}

	err = cursor.All(context.Background(), &books)
	if err != nil {
		return nil, err
	}

	return &books, nil
}

func (b *Books) GetById(id string) (*models.Book, error) {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, b.customErrors.ErrInvalidId
	}

	var book = new(models.Book)
	err = b.dbColl.FindOne(context.Background(), bson.M{"_id": objectId}).
		Decode(book)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, b.customErrors.ErrNotFound
		}
		return nil, err
	}

	return book, nil
}

func (b *Books) GetBySubmitterId(id string) (*[]models.Book, error) {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, b.customErrors.ErrInvalidId
	}

	books := make([]models.Book, 0)
	cursor, err := b.dbColl.Find(context.Background(), bson.M{
		"submitterId": objectId,
	})
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, b.customErrors.ErrNotFound
		}
		return nil, err
	}

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

	eg := errgroup.Group{}

	eg.Go(func() error {
		_, err = b.dbColl.UpdateOne(
			context.Background(),
			bson.M{"_id": objectBookId},
			bson.M{"$addToSet": bson.M{"bookmarkerIds": objectUserId}},
		)
		return err
	})

	eg.Go(func() error {
		_, err = b.dbUsersColl.UpdateOne(
			context.Background(),
			bson.M{"_id": objectUserId},
			bson.M{"$addToSet": bson.M{"bookmarkIds": objectBookId}},
		)
		return err
	})

	if err := eg.Wait(); err != nil {
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

	_, err = b.dbUsersColl.UpdateOne(
		context.Background(),
		bson.M{"_id": objectUserId},
		bson.M{"$pull": bson.M{"bookmarkIds": objectBookId}},
	)
	if err != nil {
		return err
	}

	return nil
}
