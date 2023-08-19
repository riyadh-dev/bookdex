package storage

import (
	"context"
	"errors"

	"github.com/riyadh-dev/go-rest-api-demo/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Books struct {
	dbColl *mongo.Collection
}

func newBooks(db *mongo.Database) *Books {
	return &Books{dbColl: db.Collection("books")}
}

func (b *Books) GetAll() (*[]models.Book, error) {
	cursor, err := b.dbColl.Find(context.Background(), bson.D{})
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

func (b *Books) GetById(id string) (*models.Book, error) {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid id")
	}

	var book = new(models.Book)
	err = b.dbColl.FindOne(context.Background(), bson.M{"_id": objectId}).
		Decode(book)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			return nil, errors.New("not found")
		}
		return nil, err
	}

	return book, nil
}

func (b *Books) Create(input *models.InsertBookInput) (string, error) {
	result, err := b.dbColl.InsertOne(context.Background(), input)
	if err != nil {
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func (b *Books) Update(id string, input *models.UpdateBookInput) error {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid id")
	}

	result, err := b.dbColl.UpdateOne(
		context.Background(),
		bson.M{"_id": objectId},
		bson.M{"$set": input},
	)
	if result.ModifiedCount == 0 {
		return errors.New("not found")
	}

	return err
}

func (b *Books) Delete(id string) error {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid id")
	}

	result, err := b.dbColl.DeleteOne(
		context.Background(),
		bson.M{"_id": objectId},
	)
	if result.DeletedCount == 0 {
		return errors.New("not found")
	}

	return err
}
