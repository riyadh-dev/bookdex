package database

import (
	"context"
	"errors"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var db *mongo.Database

func ConnectDB() error {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		return errors.New("You must set your 'MONGODB_URI' environment variable.")
	}

	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
	if err != nil {
		return err
	}

	db = client.Database("go-rest-api")

	return nil
}

func DisconnectDB() error {
	err := db.Client().Disconnect(context.Background())
	return err
}

func GetCollection(name string) *mongo.Collection {
	return db.Collection(name)
}
