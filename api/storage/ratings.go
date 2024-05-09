package storage

import (
	"context"

	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Ratings struct {
	dbColl       *mongo.Collection
	customErrors *config.CustomErrors
}

func newRatings(
	db *mongo.Database,
	customErrors *config.CustomErrors,
) *Ratings {
	return &Ratings{
		dbColl:       db.Collection("ratings"),
		customErrors: customErrors,
	}
}

func (r *Ratings) GetByBookIdAndRaterId(
	bookId string,
	raterId string,
) (*models.Rating, error) {
	objBookId, err := primitive.ObjectIDFromHex(bookId)
	if err != nil {
		return nil, r.customErrors.ErrInvalidId
	}

	objRaterId, err := primitive.ObjectIDFromHex(raterId)
	if err != nil {
		return nil, r.customErrors.ErrInvalidId
	}

	rating := new(models.Rating)

	err = r.dbColl.FindOne(context.Background(), bson.M{
		"bookId":  objBookId,
		"raterId": objRaterId,
	}).Decode(rating)

	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, r.customErrors.ErrNotFound
		}
		return nil, err
	}

	return rating, nil
}

func (r *Ratings) Create(bookId string, raterId string, value int) error {
	objBookId, err := primitive.ObjectIDFromHex(bookId)
	if err != nil {
		return r.customErrors.ErrInvalidId
	}

	objRaterId, err := primitive.ObjectIDFromHex(raterId)
	if err != nil {
		return r.customErrors.ErrInvalidId
	}

	_, err = r.dbColl.InsertOne(context.Background(), &models.Rating{
		BookID:  objBookId,
		RaterID: objRaterId,
		Value:   value,
	})

	return err
}

func (r *Ratings) Update(bookId string, raterId string, value int) error {
	objBookId, err := primitive.ObjectIDFromHex(bookId)
	if err != nil {
		return r.customErrors.ErrInvalidId
	}

	objRaterId, err := primitive.ObjectIDFromHex(raterId)
	if err != nil {
		return r.customErrors.ErrInvalidId
	}

	_, err = r.dbColl.UpdateOne(context.Background(), bson.M{
		"bookId":  objBookId,
		"raterId": objRaterId,
	}, bson.M{"$set": bson.M{"value": value}})

	return err
}

func (r *Ratings) Delete(bookId string, raterId string) error {
	objBookId, err := primitive.ObjectIDFromHex(bookId)
	if err != nil {
		return r.customErrors.ErrInvalidId
	}

	objRaterId, err := primitive.ObjectIDFromHex(raterId)
	if err != nil {
		return r.customErrors.ErrInvalidId
	}

	_, err = r.dbColl.DeleteOne(context.Background(), bson.M{
		"bookId":  objBookId,
		"raterId": objRaterId,
	})

	return err
}
