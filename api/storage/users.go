package storage

import (
	"context"

	"github.com/riyadh-dev/bookdex/api/config"
	"github.com/riyadh-dev/bookdex/api/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Users struct {
	dbColl       *mongo.Collection
	customErrors *config.CustomErrors
}

func newUsers(db *mongo.Database, customErrors *config.CustomErrors) *Users {
	return &Users{dbColl: db.Collection("users"), customErrors: customErrors}
}

func (u *Users) GetAllMocked() (*[]models.User, error) {
	cursor, err := u.dbColl.Find(
		context.Background(),
		bson.M{"is_mocked": true},
	)
	if err != nil {
		return nil, err
	}

	users := new([]models.User)
	if err = cursor.All(context.Background(), users); err != nil {
		return nil, err
	}

	return users, nil
}

func (u *Users) Create(input *models.InsertUserInput) (string, error) {
	result, err := u.dbColl.InsertOne(context.Background(), *input)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return "", u.customErrors.ErrDuplicateKey
		}
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func (u *Users) GetByUsername(username string) (*models.User, error) {
	user := new(models.User)
	err := u.dbColl.FindOne(context.Background(), bson.M{"username": username}).
		Decode(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (u *Users) GetByEmail(email string) (*models.User, error) {
	user := new(models.User)
	err := u.dbColl.FindOne(context.Background(), bson.M{"email": email}).
		Decode(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (u *Users) Update(id string, input *models.UpdateUserInput) error {
	objectId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = u.dbColl.UpdateOne(
		context.Background(),
		bson.M{"_id": objectId},
		bson.M{"$set": *input},
	)
	if err != nil {
		return err
	}

	return nil
}

func (u *Users) GetById(id string) (*models.User, error) {
	user := new(models.User)
	err := u.dbColl.FindOne(context.Background(), bson.M{"_id": id}).
		Decode(user)
	if err != nil {
		return nil, err
	}

	return user, nil
}
