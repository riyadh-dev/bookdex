package storage

import (
	"context"

	"github.com/riyadh-dev/go-rest-api-demo/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Users struct {
	dbColl *mongo.Collection
}

func newUsers(db *mongo.Database) *Users {
	return &Users{dbColl: db.Collection("users")}
}

func (u *Users) Create(input *models.InsertUserInput) (string, error) {
	result, err := u.dbColl.InsertOne(context.Background(), *input)
	if err != nil {
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func (u *Users) GetByUsername(username string) (*models.User, error) {
	var user = new(models.User)
	err := u.dbColl.FindOne(context.Background(), bson.M{"username": username}).Decode(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}
