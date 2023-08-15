package database

import (
	"context"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const DBName = "go-rest-api"

var MongoClient *mongo.Client

func ConnectDB() error {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("You must set your 'MONGODB_URI' environment variable.")
	}
	var err error
	MongoClient, err = mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal(err)
	}
	return err
}

func DisconnectDB() error {
	err := MongoClient.Disconnect(context.TODO())
	if err != nil {
		log.Fatal(err)
	}
	return err
}

func GetCollection(name string) *mongo.Collection {
	return MongoClient.Database(DBName).Collection(name)
}
